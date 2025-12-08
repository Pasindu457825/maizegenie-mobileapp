from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import pickle
import numpy as np
import pandas as pd



router = APIRouter(prefix="/api/price-forecast", tags=["Price Forecast"])

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

SARIMAX_FILE = os.path.join(BASE_DIR, "sarimax_model.pkl")
SCALER_FILE = os.path.join(BASE_DIR, "scaler.pkl")

with open(SARIMAX_FILE, "rb") as f:
    sarimax_model = pickle.load(f)

# reassign proper index
sarimax_model.data.dates = pd.date_range(start="2015-01-01", periods=len(sarimax_model.data.endog), freq="W")


with open(SCALER_FILE, "rb") as f:
    scaler = pickle.load(f)

print("✅ SARIMAX + Scaler Loaded Successfully")

def forecast_weeks(steps: int = 4):
    try:
        future = sarimax_model.get_forecast(steps=steps).predicted_mean


        # --- CRITICAL FIX ---
        future = np.array(future).flatten()

        weeks = []
        for i in range(steps):
            val = float(future[i]) if i < len(future) else float(future[-1])
            weeks.append({
                "week": i + 1,
                "sarimax": round(val, 2),
                "ensemble": round(val, 2),
            })

        return weeks

    except Exception as e:
        print("Forecast error:", e)
        raise RuntimeError("SARIMAX failed")

class PriceForecastRequest(BaseModel):
    year: str
    week: str
    district: str
    season: str
    productionCostPerKg: float | None = None
    weeks_ahead: int = 4

class WeekForecast(BaseModel):
    week: int
    sarimax: float
    ensemble: float

class PriceForecastResponse(BaseModel):
    success: bool
    weeks: list[WeekForecast]


@router.post("/next-weeks", response_model=PriceForecastResponse)
def get_price_forecast(req: PriceForecastRequest):
    # Debug print to confirm which district/farm data received
    print("🔥 BACKEND RECEIVED PAYLOAD:", req.dict())

    try:
        result = forecast_weeks(req.weeks_ahead)
        return PriceForecastResponse(success=True, weeks=result)
    except Exception as e:
        print("Forecast API Error:", e)
        raise HTTPException(status_code=500, detail="Forecast failed")

