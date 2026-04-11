import os

from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

_supabase_url = os.getenv("SUPABASE_URL", "")
_supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

if not _supabase_url or not _supabase_key:
    raise RuntimeError(
        "Missing Supabase credentials. "
        "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment."
    )

supabase: Client = create_client(_supabase_url, _supabase_key)

ARTIFACTS_BUCKET = os.getenv("SUPABASE_ARTIFACTS_BUCKET", "artifacts")
