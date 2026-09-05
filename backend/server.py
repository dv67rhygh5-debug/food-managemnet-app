import logging

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from config import CORS_ORIGINS
from routers import admin, auth, billing, logs, marketplace

app = FastAPI(title="Wastelytics API")

app.include_router(auth.router, prefix="/api")
app.include_router(logs.router, prefix="/api")
app.include_router(marketplace.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(billing.router, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


@app.get("/api")
async def root():
    return {"message": "Wastelytics API"}
