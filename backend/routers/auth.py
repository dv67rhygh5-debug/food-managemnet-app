import httpx
from fastapi import APIRouter, Depends, HTTPException, status

from config import supabase, ADMIN_INVITE_CODE, LOGIN_OTP_ENABLED, SUPABASE_URL, SUPABASE_ANON_KEY
from deps import get_current_user
from schemas import ForgotPasswordRequest, LoginRequest, ResetPasswordRequest, SignupRequest, VerifyLoginOtpRequest

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup")
async def signup(body: SignupRequest):
    if body.role == "admin":
        if not ADMIN_INVITE_CODE:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Admin signup is not set up on the server yet (ADMIN_INVITE_CODE is missing)",
            )
        if (body.admin_invite_code or "").strip() != ADMIN_INVITE_CODE:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid admin invite code")

    # Admin-created + email_confirm=True skips the confirmation-email/OTP step entirely —
    # no email sending setup needed, the account is usable immediately.
    try:
        result = supabase.auth.admin.create_user(
            {"email": body.email, "password": body.password, "email_confirm": True}
        )
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    user = result.user
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Signup failed")

    supabase.table("profiles").insert(
        {
            "id": user.id,
            "role": body.role,
            "org_name": body.org_name,
            "city": body.city,
            "phone": body.phone,
            "verified": body.role != "ngo",  # NGOs need admin verification, restaurants don't
        }
    ).execute()

    return {"user_id": user.id, "email": body.email, "role": body.role}


@router.post("/login")
async def login(body: LoginRequest):
    # Checks the password. With LOGIN_OTP_ENABLED off this returns the session right away; with it
    # on, a valid password only earns an emailed OTP code, which step 2 (/verify-otp) checks.
    # A plain REST call, deliberately not `supabase.auth.sign_in_with_password()` on the shared
    # service-role client — that call mutates the shared client's session in supabase-py, which
    # then makes every subsequent `.table()` call across ALL requests in this process run as that
    # logged-in user instead of the service role (silently breaking RLS-bypass server-wide).
    try:
        resp = httpx.post(
            f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
            headers={"apikey": SUPABASE_ANON_KEY, "Content-Type": "application/json"},
            json={"email": body.email, "password": body.password},
            timeout=10,
        )
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    if resp.status_code != 200:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    if not LOGIN_OTP_ENABLED:
        data = resp.json()
        return {
            "otp_required": False,
            "access_token": data["access_token"],
            "refresh_token": data["refresh_token"],
            "user_id": data["user"]["id"],
        }

    try:
        otp_resp = httpx.post(
            f"{SUPABASE_URL}/auth/v1/otp",
            headers={"apikey": SUPABASE_ANON_KEY, "Content-Type": "application/json"},
            json={"email": body.email, "create_user": False},
            timeout=30,
        )
    except Exception:
        otp_resp = None

    if otp_resp is None or otp_resp.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not send the verification email — check Supabase SMTP settings, or set LOGIN_OTP_ENABLED=false",
        )

    return {"otp_required": True, "email": body.email}


@router.post("/verify-otp")
async def verify_login_otp(body: VerifyLoginOtpRequest):
    # Step 2 of 2: exchange the emailed code for a real session. Same "raw REST call, not the
    # shared SDK client" reasoning as /login above applies here too.
    try:
        resp = httpx.post(
            f"{SUPABASE_URL}/auth/v1/verify",
            headers={"apikey": SUPABASE_ANON_KEY, "Content-Type": "application/json"},
            json={"type": "email", "email": body.email, "token": body.token},
            timeout=10,
        )
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired code")

    if resp.status_code != 200:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired code")

    data = resp.json()
    return {
        "access_token": data["access_token"],
        "refresh_token": data["refresh_token"],
        "user_id": data["user"]["id"],
    }


@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest):
    # Supabase emails a recovery link that lands back on `redirect_to` with the session in the URL
    # hash. Supabase only honours `redirect_to` if it is in Auth > URL Configuration > Redirect URLs,
    # otherwise it falls back to the Site URL. Always answers the same way, so this can't be used to
    # check which emails have accounts.
    payload = {"email": body.email}
    params = {"redirect_to": body.redirect_to} if body.redirect_to else None
    try:
        resp = httpx.post(
            f"{SUPABASE_URL}/auth/v1/recover",
            headers={"apikey": SUPABASE_ANON_KEY, "Content-Type": "application/json"},
            params=params,
            json=payload,
            timeout=30,
        )
    except Exception:
        resp = None

    if resp is None or resp.status_code >= 500:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not send the reset email right now, please try again in a minute",
        )
    if resp.status_code == 429:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many reset requests, please wait a minute and try again",
        )

    return {"ok": True}


@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest):
    # The access token comes from the recovery link, so it only lets the owner of that inbox
    # change their own password.
    if len(body.password) < 6:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password must be at least 6 characters")
    try:
        resp = httpx.put(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": f"Bearer {body.access_token}",
                "Content-Type": "application/json",
            },
            json={"password": body.password},
            timeout=10,
        )
    except Exception:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Could not reach the auth server, please try again")

    if resp.status_code == 401 or resp.status_code == 403:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="This reset link has expired, please request a new one",
        )
    if resp.status_code != 200:
        data = resp.json() if resp.content else {}
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=data.get("msg") or data.get("message") or "Could not update the password",
        )

    return {"ok": True}


@router.get("/me")
async def me(profile: dict = Depends(get_current_user)):
    return profile
