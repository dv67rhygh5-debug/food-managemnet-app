import os
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client, Client

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY", "")
SUPABASE_STORAGE_BUCKET = os.environ.get("SUPABASE_STORAGE_BUCKET", "surplus-photos")

CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*").split(",")

QR_CODE_IMAGE_URL = os.environ.get("QR_CODE_IMAGE_URL", "")
PAYMENT_UPI_ID = os.environ.get("PAYMENT_UPI_ID", "")

# Required to self-signup as admin — keeps the admin role from being open to anyone who hits the API.
ADMIN_INVITE_CODE = os.environ.get("ADMIN_INVITE_CODE", "")

# Service-role client: server-side only, bypasses RLS. Used for all DB writes/reads here.
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
