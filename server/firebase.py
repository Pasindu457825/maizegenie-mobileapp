# server/apps/firebase_conn.py
import firebase_admin
from firebase_admin import credentials, firestore, storage, auth
from config import settings
from pathlib import Path
from functools import lru_cache

@lru_cache(maxsize=1)
def _init_app() -> firebase_admin.App:
    cred_path = getattr(settings, "FIREBASE_CREDENTIALS_JSON", None)
    if not cred_path:
        raise FileNotFoundError("FIREBASE_CREDENTIALS_JSON is not set")
    p = Path(cred_path).resolve()
    if not p.exists():
        raise FileNotFoundError(f"Firebase credentials not found: {p}")
    cred = credentials.Certificate(str(p))

    opts = {}
    bucket = getattr(settings, "FIREBASE_STORAGE_BUCKET", None)
    if bucket: opts["storageBucket"] = bucket
    dburl = getattr(settings, "FIREBASE_DATABASE_URL", None)
    if dburl: opts["databaseURL"] = dburl

    return firebase_admin.initialize_app(cred, opts)

def get_firestore():
    _init_app(); return firestore.client()

def get_bucket():
    _init_app()
    bucket = getattr(settings, "FIREBASE_STORAGE_BUCKET", None)
    if not bucket:
        raise RuntimeError("FIREBASE_STORAGE_BUCKET not set")
    return storage.bucket(bucket)

def verify_id_token(id_token: str) -> dict:
    _init_app(); return auth.verify_id_token(id_token)
