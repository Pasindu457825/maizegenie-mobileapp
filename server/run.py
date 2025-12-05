from pathlib import Path
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"

if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from core.config import settings
from diseaseidentify.router import router as disease_router
from auth.router import router as auth_router   # <-- ADD THIS

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

uploads_dir = ROOT / settings.UPLOAD_DIR
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

# -------------------------------
# REGISTER ROUTERS
# -------------------------------
app.include_router(auth_router)  # <-- VERY IMPORTANT
app.include_router(disease_router)


@app.get("/")
def root():
    return {"ok": True, "message": "MaizeGenie API running"}
