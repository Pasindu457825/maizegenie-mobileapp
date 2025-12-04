from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path
from typing import List

# BASE_DIR → server/ (where .env is located)
BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    # Application configs
    APP_NAME: str = "MaizeGenie API"
    HOST: str = "0.0.0.0"
    PORT: int = 5000
    UPLOAD_DIR: str = "uploads"

    # Supabase credentials (required)
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_KEY: str

    # CORS allowed origins
    ALLOWED_ORIGINS: List[str] = ["*"]

    # Tells Pydantic where to load .env
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        case_sensitive=False,
        extra="ignore"
    )


# Export settings instance
settings = Settings()
