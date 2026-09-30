from fastapi import APIRouter, Depends, HTTPException

from config import supabase
from deps import require_role
from schemas import VerificationDecision

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/verification-queue")
async def verification_queue(_: dict = Depends(require_role("admin"))):
    resp = supabase.table("profiles").select("*").eq("role", "ngo").eq("verified", False).execute()
    return resp.data


@router.post("/verification-queue/{profile_id}")
async def decide_verification(profile_id: str, body: VerificationDecision, admin: dict = Depends(require_role("admin"))):
    found = supabase.table("profiles").select("id").eq("id", profile_id).eq("role", "ngo").execute()
    if not found.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    if body.approve:
        resp = supabase.table("profiles").update({"verified": True}).eq("id", profile_id).execute()
        return resp.data[0]
    # Deleting only the profile would leave an auth user that can neither log in nor re-register.
    # Deleting the auth user cascades to the profile and frees the email for a fresh application.
    supabase.auth.admin.delete_user(profile_id)
    return {"deleted": profile_id}


@router.get("/restaurants")
async def restaurants(_: dict = Depends(require_role("admin"))):
    resp = (
        supabase.table("profiles")
        .select("id, org_name, city, created_at")
        .eq("role", "restaurant")
        .order("created_at")
        .execute()
    )
    return resp.data


@router.get("/subscribers")
async def subscribers(_: dict = Depends(require_role("admin"))):
    resp = supabase.table("subscriptions").select("*, profiles!subscriptions_restaurant_id_fkey(org_name, city)").execute()
    return resp.data


@router.get("/rescues")
async def rescues(_: dict = Depends(require_role("admin"))):
    resp = supabase.table("claims").select("*, marketplace_listings(*)").eq("status", "picked_up").execute()
    return resp.data
