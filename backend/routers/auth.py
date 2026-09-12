import httpx
from fastapi import APIRouter, Depends, HTTPException, status

from config import supabase, ADMIN_INVITE_CODE, SUPABASE_URL, SUPABASE_ANON_KEY
from deps import get_current_user
from schemas import LoginRequest, SignupRequest

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup")
async def signup(body: SignupRequest):
    if body.role == "admin":
        if not ADMIN_INVITE_CODE or body.admin_invite_code != ADMIN_INVITE_CODE:
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

    data = resp.json()
    return {
        "access_token": data["access_token"],
        "refresh_token": data["refresh_token"],
        "user_id": data["user"]["id"],
    }


@router.get("/me")
async def me(profile: dict = Depends(get_current_user)):
    return profile
