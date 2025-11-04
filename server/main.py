from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.diseaseidentify.router import router as disease_router
from src.pestidentify.router import router as pest_router

app = FastAPI(title="MaizeGenie Backend", version="1.0")

# Enable CORS for mobile & web
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production: replace "*" with your frontend IP/domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/health")
async def health():
    return {"status": "ok"}

# Register routes
app.include_router(disease_router)
app.include_router(pest_router)
