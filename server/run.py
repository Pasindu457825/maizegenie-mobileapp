# server/run.py
from pathlib import Path
import sys

# make "src" importable (so we can `from leafdisease import ...`)
ROOT = Path(__file__).parent
SRC = ROOT / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from config import settings
from diseaseidentify.router import router as leaf_router  # <-- from src/

app = FastAPI(title=settings.APP_NAME if hasattr(settings, "APP_NAME") else "API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=getattr(settings, "ALLOWED_ORIGINS", ["*"]),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# static / uploads
uploads_dir = ROOT / getattr(settings, "UPLOAD_DIR", "uploads")
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")
static_dir = ROOT / "static"
static_dir.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

# init firebase lazily (safe if not configured)
try:
    init_app()
except Exception:
    pass

# mount feature routers under /api
api = FastAPI()
api.include_router(leaf_router, prefix="/leafdisease", tags=["leafdisease"])
app.mount("/api", api)

@app.get("/")
def root():
    return {"ok": True, "message": "API running"}
import uvicorn
from src.core.config import settings

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
