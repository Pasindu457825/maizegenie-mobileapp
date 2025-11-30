from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.diseaseidentify.router import router as disease_router
from src.pestidentify.router import router as pest_router
from src.priceforecast.admin_router import router as admin_router
from src.priceforecast.weather_router import router as weather_router



app = FastAPI(title="MaizeGenie Backend", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok"}

app.include_router(disease_router)
app.include_router(pest_router)
app.include_router(admin_router)

app.include_router(weather_router)
