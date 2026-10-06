from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException

from config import supabase, SUBSCRIPTION_DAYS
from deps import require_role
from schemas import AdminClaimUpdate, AdminSubscriptionUpdate, LogUpdate, ProfileUpdate, VerificationDecision

router = APIRouter(prefix="/admin", tags=["admin"])

# Impact conversions shown on the admin dashboard (estimates, not measurements):
# ~400 g of cooked food per meal, and ~2.5 kg CO2e per kg of food kept out of waste
# (FAO: 3.3 Gt CO2e footprint across 1.3 Gt of wasted food).
MEALS_PER_KG = 2.5
CO2E_PER_KG = 2.5

# A listing's status follows its claim's status.
LISTING_STATUS_FOR_CLAIM = {"pending": "claimed", "confirmed": "claimed", "picked_up": "completed", "cancelled": "available"}


def _kg(value):
    return round(float(value or 0), 2)


def _emails_by_id():
    users = supabase.auth.admin.list_users(page=1, per_page=1000)
    return {u.id: u.email for u in users}


def _profiles_by_id():
    return {p["id"]: p for p in supabase.table("profiles").select("id, org_name, city, role").execute().data}


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


@router.get("/organizations")
async def organizations(role: str, _: dict = Depends(require_role("admin"))):
    """Every restaurant or NGO with its contact email and food totals."""
    if role not in ("restaurant", "ngo"):
        raise HTTPException(status_code=400, detail="role must be restaurant or ngo")
    profiles = supabase.table("profiles").select("*").eq("role", role).order("created_at").execute().data
    emails = _emails_by_id()
    listings = {l["id"]: l for l in supabase.table("marketplace_listings").select("id, restaurant_id, quantity_kg").execute().data}
    claims = supabase.table("claims").select("listing_id, ngo_id, status").execute().data

    if role == "restaurant":
        logs = supabase.table("surplus_logs").select("restaurant_id, quantity_kg").execute().data
        subs = {s["restaurant_id"]: s for s in supabase.table("subscriptions").select("*").execute().data}
        for p in profiles:
            mine = [l for l in logs if l["restaurant_id"] == p["id"]]
            donated = [listings[c["listing_id"]] for c in claims if c["status"] == "picked_up" and listings.get(c["listing_id"], {}).get("restaurant_id") == p["id"]]
            sub = subs.get(p["id"]) or {}
            sub.pop("payment_proof_path", None)
            p.update(
                email=emails.get(p["id"]),
                logs_count=len(mine),
                logged_kg=_kg(sum(float(l["quantity_kg"]) for l in mine)),
                donated_kg=_kg(sum(float(l["quantity_kg"]) for l in donated)),
                subscription=sub or None,
            )
    else:
        for p in profiles:
            mine = [c for c in claims if c["ngo_id"] == p["id"]]
            picked = [listings[c["listing_id"]] for c in mine if c["status"] == "picked_up" and c["listing_id"] in listings]
            p.update(
                email=emails.get(p["id"]),
                claims_count=len(mine),
                rescued_kg=_kg(sum(float(l["quantity_kg"]) for l in picked)),
            )
    return profiles


@router.get("/impact")
async def impact(_: dict = Depends(require_role("admin"))):
    logs = supabase.table("surplus_logs").select("quantity_kg").execute().data
    listings = {l["id"]: l for l in supabase.table("marketplace_listings").select("id, quantity_kg").execute().data}
    picked = [c for c in supabase.table("claims").select("listing_id, status").execute().data if c["status"] == "picked_up"]
    donated_kg = sum(float(listings[c["listing_id"]]["quantity_kg"]) for c in picked if c["listing_id"] in listings)
    roles = [p["role"] for p in supabase.table("profiles").select("role").execute().data]
    return {
        "logged_kg": _kg(sum(float(l["quantity_kg"]) for l in logs)),
        "donated_kg": _kg(donated_kg),
        "meals": round(donated_kg * MEALS_PER_KG),
        "co2e_kg": round(donated_kg * CO2E_PER_KG),
        "rescues": len(picked),
        "restaurants": roles.count("restaurant"),
        "ngos": roles.count("ngo"),
    }


@router.patch("/profiles/{profile_id}")
async def update_profile(profile_id: str, body: ProfileUpdate, _: dict = Depends(require_role("admin"))):
    changes = body.model_dump(exclude_unset=True)
    if "org_name" in changes and not (changes["org_name"] or "").strip():
        raise HTTPException(status_code=400, detail="Name can't be empty")
    if not changes:
        raise HTTPException(status_code=400, detail="Nothing to update")
    resp = supabase.table("profiles").update(changes).eq("id", profile_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return resp.data[0]


@router.delete("/profiles/{profile_id}")
async def delete_profile(profile_id: str, admin: dict = Depends(require_role("admin"))):
    if profile_id == admin["id"]:
        raise HTTPException(status_code=400, detail="You can't delete your own admin account")
    # Deleting the auth user cascades to the profile and everything it owns.
    supabase.auth.admin.delete_user(profile_id)
    return {"deleted": profile_id}


@router.put("/subscriptions/{restaurant_id}")
async def set_subscription(restaurant_id: str, body: AdminSubscriptionUpdate, admin: dict = Depends(require_role("admin"))):
    found = supabase.table("profiles").select("id").eq("id", restaurant_id).eq("role", "restaurant").execute()
    if not found.data:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    period_end = body.current_period_end
    if body.status == "active" and not period_end:
        period_end = datetime.now(timezone.utc) + timedelta(days=SUBSCRIPTION_DAYS)
    payload = {
        "restaurant_id": restaurant_id,
        "plan": body.plan,
        "status": body.status,
        "current_period_end": period_end.isoformat() if period_end else None,
        "verified_by": admin["id"],
        "verified_at": datetime.now(timezone.utc).isoformat(),
    }
    row = supabase.table("subscriptions").upsert(payload, on_conflict="restaurant_id").execute().data[0]
    row.pop("payment_proof_path", None)
    return row


@router.get("/logs")
async def all_logs(_: dict = Depends(require_role("admin"))):
    profiles = _profiles_by_id()
    rows = supabase.table("surplus_logs").select("*").order("created_at", desc=True).execute().data
    for r in rows:
        r["restaurant_name"] = profiles.get(r["restaurant_id"], {}).get("org_name")
    return rows


@router.patch("/logs/{log_id}")
async def update_log(log_id: str, body: LogUpdate, _: dict = Depends(require_role("admin"))):
    changes = body.model_dump(exclude_unset=True)
    if changes.get("quantity_kg") is not None and changes["quantity_kg"] <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be more than 0")
    if not changes:
        raise HTTPException(status_code=400, detail="Nothing to update")
    resp = supabase.table("surplus_logs").update(changes).eq("id", log_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Log not found")
    # Keep the marketplace copy of the food in step with the corrected log.
    listing_changes = {k: v for k, v in changes.items() if k in ("food_type", "quantity_kg")}
    if listing_changes:
        supabase.table("marketplace_listings").update(listing_changes).eq("log_id", log_id).execute()
    return resp.data[0]


@router.delete("/logs/{log_id}")
async def delete_log(log_id: str, _: dict = Depends(require_role("admin"))):
    supabase.table("surplus_logs").delete().eq("id", log_id).execute()
    return {"deleted": log_id}


@router.get("/claims")
async def all_claims(_: dict = Depends(require_role("admin"))):
    profiles = _profiles_by_id()
    rows = supabase.table("claims").select("*, marketplace_listings(*)").order("created_at", desc=True).execute().data
    for r in rows:
        listing = r.get("marketplace_listings") or {}
        r["ngo_name"] = profiles.get(r["ngo_id"], {}).get("org_name")
        r["restaurant_name"] = profiles.get(listing.get("restaurant_id"), {}).get("org_name")
    return rows


@router.patch("/claims/{claim_id}")
async def update_claim(claim_id: str, body: AdminClaimUpdate, _: dict = Depends(require_role("admin"))):
    resp = supabase.table("claims").update({"status": body.status}).eq("id", claim_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Claim not found")
    supabase.table("marketplace_listings").update({"status": LISTING_STATUS_FOR_CLAIM[body.status]}).eq(
        "id", resp.data[0]["listing_id"]
    ).execute()
    return resp.data[0]


@router.delete("/claims/{claim_id}")
async def delete_claim(claim_id: str, _: dict = Depends(require_role("admin"))):
    found = supabase.table("claims").select("listing_id, status").eq("id", claim_id).execute()
    if not found.data:
        raise HTTPException(status_code=404, detail="Claim not found")
    supabase.table("claims").delete().eq("id", claim_id).execute()
    if found.data[0]["status"] in ("pending", "confirmed"):
        supabase.table("marketplace_listings").update({"status": "available"}).eq("id", found.data[0]["listing_id"]).execute()
    return {"deleted": claim_id}
