import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from config import supabase, SUPABASE_STORAGE_BUCKET, QR_CODE_IMAGE_URL, PAYMENT_UPI_ID
from deps import require_role
from schemas import PaymentDecision, PaymentSubmission

router = APIRouter(prefix="/billing", tags=["billing"])

PLANS = [
    {"id": "basic", "name": "Basic", "price_inr": 100},
    {"id": "pro", "name": "Pro", "price_inr": 200},
]


@router.get("/plans")
async def get_plans():
    return {"plans": PLANS, "qr_code_image_url": QR_CODE_IMAGE_URL, "upi_id": PAYMENT_UPI_ID}


@router.get("/me")
async def my_subscription(profile: dict = Depends(require_role("restaurant"))):
    resp = supabase.table("subscriptions").select("*").eq("restaurant_id", profile["id"]).execute()
    return resp.data[0] if resp.data else {"status": "inactive", "plan": None}


@router.post("/submit")
async def submit_payment(body: PaymentSubmission, profile: dict = Depends(require_role("restaurant"))):
    payload = {
        "restaurant_id": profile["id"],
        "plan": body.plan,
        "status": "pending_verification",
        "payment_note": body.reference_note,
    }
    resp = supabase.table("subscriptions").upsert(payload, on_conflict="restaurant_id").execute()
    return resp.data[0]


@router.post("/proof")
async def upload_payment_proof(
    file: UploadFile = File(...), profile: dict = Depends(require_role("restaurant"))
):
    existing = supabase.table("subscriptions").select("id").eq("restaurant_id", profile["id"]).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Submit a payment reference first")
    sub_id = existing.data[0]["id"]

    ext = (file.filename or "proof").split(".")[-1]
    path = f"{profile['id']}/{sub_id}/{uuid.uuid4()}.{ext}"
    content = await file.read()

    supabase.storage.from_(SUPABASE_STORAGE_BUCKET).upload(path, content, {"content-type": file.content_type})
    public_url = supabase.storage.from_(SUPABASE_STORAGE_BUCKET).get_public_url(path)

    resp = supabase.table("subscriptions").update({"payment_proof_url": public_url}).eq("id", sub_id).execute()
    return resp.data[0]


@router.get("/pending", tags=["admin"])
async def pending_payments(_: dict = Depends(require_role("admin"))):
    resp = (
        supabase.table("subscriptions")
        .select("*, profiles!subscriptions_restaurant_id_fkey(org_name, city)")
        .eq("status", "pending_verification")
        .execute()
    )
    return resp.data


@router.post("/{subscription_id}/decision", tags=["admin"])
async def decide_payment(subscription_id: str, body: PaymentDecision, admin: dict = Depends(require_role("admin"))):
    new_status = "active" if body.approve else "inactive"
    resp = (
        supabase.table("subscriptions")
        .update({"status": new_status, "verified_by": admin["id"]})
        .eq("id", subscription_id)
        .execute()
    )
    if not resp.data:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return resp.data[0]
