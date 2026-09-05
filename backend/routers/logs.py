import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from config import supabase, SUPABASE_STORAGE_BUCKET
from deps import require_role
from schemas import SurplusLogCreate

router = APIRouter(prefix="/logs", tags=["logs"])


@router.post("")
async def create_log(body: SurplusLogCreate, profile: dict = Depends(require_role("restaurant"))):
    payload = body.model_dump(mode="json")
    payload["restaurant_id"] = profile["id"]
    resp = supabase.table("surplus_logs").insert(payload).execute()
    return resp.data[0]


@router.get("")
async def list_my_logs(profile: dict = Depends(require_role("restaurant"))):
    resp = (
        supabase.table("surplus_logs")
        .select("*")
        .eq("restaurant_id", profile["id"])
        .order("created_at", desc=True)
        .execute()
    )
    return resp.data


@router.post("/{log_id}/photo")
async def upload_photo(
    log_id: str, file: UploadFile = File(...), profile: dict = Depends(require_role("restaurant"))
):
    existing = supabase.table("surplus_logs").select("id").eq("id", log_id).eq("restaurant_id", profile["id"]).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Log not found")

    ext = (file.filename or "photo").split(".")[-1]
    path = f"{profile['id']}/{log_id}/{uuid.uuid4()}.{ext}"
    content = await file.read()

    supabase.storage.from_(SUPABASE_STORAGE_BUCKET).upload(path, content, {"content-type": file.content_type})
    public_url = supabase.storage.from_(SUPABASE_STORAGE_BUCKET).get_public_url(path)

    supabase.table("surplus_logs").update({"photo_url": public_url}).eq("id", log_id).execute()
    return {"photo_url": public_url}
