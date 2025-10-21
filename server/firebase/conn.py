from __future__ import annotations
from pathlib import Path
from functools import lru_cache
import firebase_admin
from firebase_admin import credentials, firestore, storage, auth
from config import settings

@lru_cache(maxsize=1)
def init_app() -> firebase_admin.App:
    cred_path = settings.FIREBASE_CREDENTIALS_JSON
    if not cred_path:
        raise FileNotFoundError("FIREBASE_CREDENTIALS_JSON is not set in .env")
    p = Path(cred_path).resolve()
    if not p.exists():
        raise FileNotFoundError(f"Firebase credentials not found: {p}")

    opts: dict = {}
    if settings.FIREBASE_STORAGE_BUCKET:
        opts["storageBucket"] = settings.FIREBASE_STORAGE_BUCKET
    if settings.FIREBASE_DATABASE_URL:
        opts["databaseURL"] = settings.FIREBASE_DATABASE_URL

    return firebase_admin.initialize_app(credentials.Certificate(str(p)), opts)

def get_firestore():
    init_app()
    return firestore.client()

def get_bucket():
    init_app()
    bucket = settings.FIREBASE_STORAGE_BUCKET
    if not bucket:
        raise RuntimeError("FIREBASE_STORAGE_BUCKET is not set")
    return storage.bucket(bucket)

def verify_id_token(id_token: str) -> dict:
    init_app()
    return auth.verify_id_token(id_token)
