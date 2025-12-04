from supabase import create_client
from core.config import settings

# Create Supabase client using service key (backend only)
supabase = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_SERVICE_KEY
)
