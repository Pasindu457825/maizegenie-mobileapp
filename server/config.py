# server/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import List
import os, yaml

class Settings(BaseSettings):
    APP_NAME: str = "MaizeGenie API"
    HOST: str = "0.0.0.0"
    PORT: int = 5000
    ALLOWED_ORIGINS: List[str] = Field(default_factory=lambda: ["*"])
    UPLOAD_DIR: str = "uploads"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        case_sensitive=False
    )

def load_settings() -> "Settings":
    s = Settings()
    yml_path = os.path.join(os.path.dirname(__file__), "config.yaml")
    if os.path.exists(yml_path):
        with open(yml_path, "r") as f:
            data = yaml.safe_load(f) or {}
        for k, v in data.items():
            key = k.upper()
            if hasattr(s, key):
                setattr(s, key, v)
    return s

settings = load_settings()
