# main.py
from pathlib import Path
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Fix import paths
ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"

if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

# Load settings
from core.config import settings

# Import routers
from auth.router import router as auth_router
from diseaseidentify.router import router as disease_router
from pestidentify.router import router as pest_router
from chat.router import router as chat_router
from priceforecast.admin_router import router as admin_router
from yieldprediction.router import router as yield_router

# Create app
app = FastAPI(title=settings.APP_NAME, version="1.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins
    allow_credentials=False,  # MUST be false when using "*"
    allow_methods=["*"],
    allow_headers=["*"],
)


# Static upload directory
uploads_dir = ROOT / settings.UPLOAD_DIR
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

# Health
@app.get("/health")
async def health():
    return {"status": "ok"}

# Register routers
app.include_router(auth_router)
app.include_router(disease_router)
app.include_router(pest_router)
app.include_router(chat_router)
app.include_router(admin_router)
app.include_router(yield_router)
