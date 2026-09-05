from fastapi import APIRouter, Depends, HTTPException, status

from config import supabase
from deps import get_current_user
from schemas import LoginRequest, SignupRequest

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup")
async def signup(body: SignupRequest):
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
    try:
        result = supabase.auth.sign_in_with_password({"email": body.email, "password": body.password})
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    if not result.session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    return {
        "access_token": result.session.access_token,
        "refresh_token": result.session.refresh_token,
        "user_id": result.user.id,
    }


@router.get("/me")
async def me(profile: dict = Depends(get_current_user)):
    return profile
