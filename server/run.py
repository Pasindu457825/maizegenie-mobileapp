from pathlib import Path
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# ==========================================
# Setup Python path to include /src
# ==========================================
ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"

if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

# ==========================================
# Now safe to import from src/*
# ==========================================
from core.config import settings
from diseaseidentify.router import router as disease_router

# ==========================================
# FastAPI App
# ==========================================
app = FastAPI(title=settings.APP_NAME)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static uploads folder
uploads_dir = ROOT / settings.UPLOAD_DIR
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

# ==========================================
# API Router
# ==========================================
app.include_router(disease_router, prefix="/api/disease", tags=["Disease Detection"])

# ==========================================
# Root endpoint
# ==========================================
@app.get("/")
def root():
    return {"ok": True, "message": "MaizeGenie API running"}
