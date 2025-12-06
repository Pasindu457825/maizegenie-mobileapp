# -----------------------
# Load .env BEFORE anything else
# -----------------------
from dotenv import load_dotenv
load_dotenv()  # MUST be FIRST

from pathlib import Path
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# -----------------------
# Fix import paths
# -----------------------
ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"

if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

# -----------------------
# Load settings
# -----------------------
from core.config import settings

# -----------------------
# Import routers
# -----------------------
from auth.router import router as auth_router
from diseaseidentify.router import router as disease_router
from pestidentify.router import router as pest_router
from chat.room_router import router as room_router    # get/create room
from chat.router import router as chat_router         # history + websocket
from priceforecast.admin_router import router as admin_router
from yieldprediction.router import router as yield_router

# -----------------------
# Create FastAPI app
# -----------------------
app = FastAPI(title=settings.APP_NAME, version="1.0")

# -----------------------
# CORS Middleware
# -----------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------
# Static Uploads Directory
# -----------------------
uploads_dir = ROOT / settings.UPLOAD_DIR
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

# -----------------------
# Health Check
# -----------------------
@app.get("/health")
async def health():
    return {"status": "ok"}

# -----------------------
# Register Routers
# -----------------------
app.include_router(auth_router)
app.include_router(disease_router)
app.include_router(pest_router)

# Chat system (order does NOT matter but kept clean)
app.include_router(room_router)     # /chat/get-room
app.include_router(chat_router)     # /chat/history + websocket

app.include_router(admin_router)
app.include_router(yield_router)
