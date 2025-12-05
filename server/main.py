from pathlib import Path
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# ----------------------------
# Correct import path setup
# ----------------------------
ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"

if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

# ----------------------------
# IMPORT SETTINGS + ROUTERS
# ----------------------------
from core.config import settings
from auth.router import router as auth_router
from diseaseidentify.router import router as disease_router
from pestidentify.router import router as pest_router
from chat.router import router as chat_router

# ----------------------------
# CREATE APP
# ----------------------------
app = FastAPI(title=settings.APP_NAME, version="1.0")

# ----------------------------
# CORS
# ----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------
# STATIC FILES
# ----------------------------
uploads_dir = ROOT / settings.UPLOAD_DIR
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

# ----------------------------
# HEALTH CHECK
# ----------------------------
@app.get("/health")
async def health():
    return {"status": "ok"}

# ----------------------------
# ROUTERS
# ----------------------------
app.include_router(auth_router)
app.include_router(disease_router)
app.include_router(pest_router)
app.include_router(chat_router)
