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
    if body.approve:
        resp = supabase.table("profiles").update({"verified": True}).eq("id", profile_id).execute()
    else:
        resp = supabase.table("profiles").delete().eq("id", profile_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return resp.data[0] if body.approve else {"deleted": profile_id}


@router.get("/subscribers")
async def subscribers(_: dict = Depends(require_role("admin"))):
    resp = supabase.table("subscriptions").select("*, profiles(org_name, city)").execute()
    return resp.data


@router.get("/rescues")
async def rescues(_: dict = Depends(require_role("admin"))):
    resp = supabase.table("claims").select("*, marketplace_listings(*)").eq("status", "picked_up").execute()
    return resp.data
