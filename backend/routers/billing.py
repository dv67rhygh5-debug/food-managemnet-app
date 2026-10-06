import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from config import (
    supabase,
    PAYMENT_PAYEE_NAME,
    PAYMENT_UPI_ID,
    QR_CODE_IMAGE_URL,
    SUBSCRIPTION_DAYS,
    SUPABASE_PAYMENT_BUCKET,
)
from deps import require_role
from schemas import PaymentDecision, PaymentSubmission

router = APIRouter(prefix="/billing", tags=["billing"])

PLANS = [
    {"id": "basic", "name": "Basic", "price_inr": 100},
    {"id": "pro", "name": "Pro", "price_inr": 200},
]
PLAN_PRICES = {p["id"]: p["price_inr"] for p in PLANS}

MAX_PROOF_BYTES = 5 * 1024 * 1024
SIGNED_URL_SECONDS = 60 * 60


def _parse(ts):
    return datetime.fromisoformat(ts.replace("Z", "+00:00")) if ts else None


def _signed_proof_url(path):
    if not path:
        return None
    try:
        signed = supabase.storage.from_(SUPABASE_PAYMENT_BUCKET).create_signed_url(path, SIGNED_URL_SECONDS)
        return signed.get("signedURL") or signed.get("signedUrl")
    except Exception:
        return None


def effective_subscription(restaurant_id):
    """The restaurant's subscription row with an `active` status downgraded to `expired` once its period ends."""
    resp = supabase.table("subscriptions").select("*").eq("restaurant_id", restaurant_id).execute()
    if not resp.data:
        return {"status": "inactive", "plan": None}
    sub = resp.data[0]
    sub.pop("payment_proof_path", None)
    period_end = _parse(sub.get("current_period_end"))
    if sub["status"] == "active" and period_end and period_end <= datetime.now(timezone.utc):
        sub["status"] = "expired"
    return sub


def active_plan(restaurant_id):
    """'basic', 'pro', or None when there's no paid, unexpired subscription."""
    sub = effective_subscription(restaurant_id)
    return sub.get("plan") if sub["status"] == "active" else None


@router.get("/plans")
async def get_plans():
    return {
        "plans": PLANS,
        "qr_code_image_url": QR_CODE_IMAGE_URL,
        "upi_id": PAYMENT_UPI_ID,
        "payee_name": PAYMENT_PAYEE_NAME,
    }


@router.get("/me")
async def my_subscription(profile: dict = Depends(require_role("restaurant"))):
    return effective_subscription(profile["id"])


@router.post("/submit")
async def submit_payment(body: PaymentSubmission, profile: dict = Depends(require_role("restaurant"))):
    if not body.paid:
        raise HTTPException(status_code=400, detail="Pay using the QR code first, then tick “Yes, I have paid”")
    existing = supabase.table("subscriptions").select("status").eq("restaurant_id", profile["id"]).execute()
    if existing.data and existing.data[0]["status"] == "pending_verification":
        raise HTTPException(status_code=409, detail="A payment is already waiting for verification")

    payload = {
        "restaurant_id": profile["id"],
        "plan": body.plan,
        "status": "pending_verification",
        "payment_note": body.reference_note,
        "paid_confirmed": True,
        "amount_inr": PLAN_PRICES[body.plan],
        "submitted_at": datetime.now(timezone.utc).isoformat(),
        "rejection_reason": None,
        "payment_proof_path": None,
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
    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(status_code=400, detail="Payment screenshot must be an image")
    content = await file.read()
    if not content or len(content) > MAX_PROOF_BYTES:
        raise HTTPException(status_code=400, detail="Payment screenshot must be an image under 5 MB")

    ext = (file.filename or "proof").rsplit(".", 1)[-1].lower()[:5]
    path = f"{profile['id']}/{sub_id}/{uuid.uuid4()}.{ext}"
    # Private bucket: screenshots can show bank details, so only admins get (signed) access.
    supabase.storage.from_(SUPABASE_PAYMENT_BUCKET).upload(path, content, {"content-type": file.content_type})

    resp = supabase.table("subscriptions").update({"payment_proof_path": path}).eq("id", sub_id).execute()
    row = resp.data[0]
    row.pop("payment_proof_path", None)
    return row


@router.get("/pending", tags=["admin"])
async def pending_payments(_: dict = Depends(require_role("admin"))):
    resp = (
        supabase.table("subscriptions")
        .select("*, profiles!subscriptions_restaurant_id_fkey(org_name, city, phone)")
        .eq("status", "pending_verification")
        .order("submitted_at")
        .execute()
    )
    for row in resp.data:
        row["payment_proof_url"] = _signed_proof_url(row.pop("payment_proof_path", None))
    return resp.data


@router.post("/{subscription_id}/decision", tags=["admin"])
async def decide_payment(subscription_id: str, body: PaymentDecision, admin: dict = Depends(require_role("admin"))):
    found = supabase.table("subscriptions").select("*").eq("id", subscription_id).execute()
    if not found.data:
        raise HTTPException(status_code=404, detail="Subscription not found")
    sub = found.data[0]
    if sub["status"] != "pending_verification":
        raise HTTPException(status_code=400, detail="This payment has already been reviewed")

    now = datetime.now(timezone.utc)
    update = {"verified_by": admin["id"], "verified_at": now.isoformat()}
    if body.approve:
        # Renewals stack on top of any days still remaining.
        current_end = _parse(sub.get("current_period_end"))
        start = current_end if current_end and current_end > now else now
        update.update(
            {
                "status": "active",
                "current_period_end": (start + timedelta(days=SUBSCRIPTION_DAYS)).isoformat(),
                "rejection_reason": None,
            }
        )
    else:
        update.update({"status": "rejected", "rejection_reason": (body.reason or "").strip() or "Payment could not be verified"})

    resp = supabase.table("subscriptions").update(update).eq("id", subscription_id).execute()
    row = resp.data[0]
    row.pop("payment_proof_path", None)
    return row
