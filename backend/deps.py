import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from config import supabase, SUPABASE_URL, SUPABASE_ANON_KEY

bearer_scheme = HTTPBearer()


async def get_current_user(creds: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> dict:
    token = creds.credentials
    # A plain REST call, deliberately not `supabase.auth.get_user()` on the shared service-role
    # client — that method call mutates the shared client's session in supabase-py, which then
    # makes every subsequent `.table()` call across ALL requests run as that user instead of the
    # service role (silently breaking RLS-bypass for the whole process). Keep auth verification
    # completely separate from the shared DB client.
    try:
        resp = httpx.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={"apikey": SUPABASE_ANON_KEY, "Authorization": f"Bearer {token}"},
            timeout=10,
        )
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    if resp.status_code != 200:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    user = resp.json()
    if not user or not user.get("id"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    profile_resp = supabase.table("profiles").select("*").eq("id", user["id"]).single().execute()
    profile = profile_resp.data
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found for user")

    return profile


def require_role(*roles: str):
    async def _check(profile: dict = Depends(get_current_user)) -> dict:
        if profile["role"] not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not permitted for this role")
        return profile

    return _check
