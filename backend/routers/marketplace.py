from fastapi import APIRouter, Depends, HTTPException

from config import supabase
from deps import get_current_user, require_role
from schemas import ClaimCreate, ClaimStatusUpdate, ListToMarketplace

router = APIRouter(tags=["marketplace"])


@router.post("/marketplace/listings")
async def create_listing(body: ListToMarketplace, profile: dict = Depends(require_role("restaurant"))):
    log = supabase.table("surplus_logs").select("*").eq("id", body.log_id).eq("restaurant_id", profile["id"]).execute()
    if not log.data:
        raise HTTPException(status_code=404, detail="Log not found")
    log_row = log.data[0]

    payload = {
        "restaurant_id": profile["id"],
        "log_id": body.log_id,
        "food_type": log_row["food_type"],
        "quantity_kg": log_row["quantity_kg"],
        "pickup_window": body.pickup_window,
        "status": "available",
    }
    resp = supabase.table("marketplace_listings").insert(payload).execute()
    return resp.data[0]


@router.get("/marketplace/listings")
async def list_listings(profile: dict = Depends(get_current_user)):
    query = supabase.table("marketplace_listings").select("*").order("created_at", desc=True)
    if profile["role"] == "ngo":
        query = query.eq("status", "available")
    elif profile["role"] == "restaurant":
        query = query.eq("restaurant_id", profile["id"])
    resp = query.execute()
    return resp.data


@router.post("/claims")
async def create_claim(body: ClaimCreate, profile: dict = Depends(require_role("ngo"))):
    listing = supabase.table("marketplace_listings").select("*").eq("id", body.listing_id).execute()
    if not listing.data:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.data[0]["status"] != "available":
        raise HTTPException(status_code=400, detail="Listing is no longer available")

    claim = supabase.table("claims").insert(
        {"listing_id": body.listing_id, "ngo_id": profile["id"], "status": "pending"}
    ).execute()
    supabase.table("marketplace_listings").update({"status": "claimed"}).eq("id", body.listing_id).execute()
    return claim.data[0]


@router.get("/claims")
async def list_my_claims(profile: dict = Depends(require_role("ngo"))):
    resp = (
        supabase.table("claims")
        .select("*, marketplace_listings(*)")
        .eq("ngo_id", profile["id"])
        .order("created_at", desc=True)
        .execute()
    )
    return resp.data


@router.patch("/claims/{claim_id}")
async def update_claim(claim_id: str, body: ClaimStatusUpdate, profile: dict = Depends(require_role("ngo"))):
    existing = supabase.table("claims").select("*").eq("id", claim_id).eq("ngo_id", profile["id"]).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Claim not found")

    resp = supabase.table("claims").update({"status": body.status}).eq("id", claim_id).execute()

    if body.status in ("picked_up", "cancelled"):
        new_listing_status = "completed" if body.status == "picked_up" else "available"
        supabase.table("marketplace_listings").update({"status": new_listing_status}).eq(
            "id", existing.data[0]["listing_id"]
        ).execute()

    return resp.data[0]
