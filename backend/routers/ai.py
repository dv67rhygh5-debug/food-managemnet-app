import httpx
from fastapi import APIRouter, Depends, HTTPException

from config import supabase, GROQ_API_KEY, GROQ_MODEL
from deps import require_role
from routers.billing import active_plan
from schemas import AssistantRequest

router = APIRouter(prefix="/ai", tags=["ai"])

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
PLACEHOLDER_KEY_PREFIX = "gsk_your"
MAX_TURNS = 12
MAX_LOGS_IN_CONTEXT = 60


def _kitchen_context(profile):
    logs = (
        supabase.table("surplus_logs")
        .select("food_type, quantity_kg, notes, created_at")
        .eq("restaurant_id", profile["id"])
        .order("created_at", desc=True)
        .limit(MAX_LOGS_IN_CONTEXT)
        .execute()
        .data
    )
    if not logs:
        return "The restaurant has not logged any surplus yet."
    lines = [f"- {l['created_at'][:10]}: {l['food_type']}, {l['quantity_kg']} kg ({l.get('notes') or 'no notes'})" for l in logs]
    return "Most recent surplus logs (date: item, quantity (category · reason · food type · ...)):\n" + "\n".join(lines)


@router.post("/assistant")
async def assistant(body: AssistantRequest, profile: dict = Depends(require_role("restaurant"))):
    if active_plan(profile["id"]) != "pro":
        raise HTTPException(status_code=403, detail="The AI assistant is part of the Pro plan (₹200/month)")
    if not GROQ_API_KEY or GROQ_API_KEY.startswith(PLACEHOLDER_KEY_PREFIX):
        raise HTTPException(status_code=503, detail="The AI assistant isn't configured yet — GROQ_API_KEY is missing on the server")
    if not body.messages or body.messages[-1].role != "user":
        raise HTTPException(status_code=400, detail="Send a question to the assistant")

    system = (
        f"You are Fedd's kitchen assistant for {profile['org_name']}"
        f"{' in ' + profile['city'] if profile.get('city') else ''}, an Indian restaurant using Fedd to cut food waste "
        "and donate surplus to NGOs. Give short, practical answers grounded in the data below: prep-quantity changes, "
        "storage and menu ideas, and when to list surplus for NGOs. Use kg and ₹. If the data doesn't support an answer, say so.\n\n"
        + _kitchen_context(profile)
    )
    messages = [{"role": "system", "content": system}] + [m.model_dump() for m in body.messages[-MAX_TURNS:]]

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                GROQ_URL,
                headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
                json={"model": GROQ_MODEL, "messages": messages, "temperature": 0.4, "max_tokens": 700},
            )
    except httpx.HTTPError:
        raise HTTPException(status_code=502, detail="Couldn't reach the AI service — try again in a moment")
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="The AI service returned an error — check GROQ_API_KEY / GROQ_MODEL")
    return {"reply": resp.json()["choices"][0]["message"]["content"]}
