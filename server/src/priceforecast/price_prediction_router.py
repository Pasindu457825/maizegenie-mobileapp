from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import pickle
import numpy as np
import pandas as pd
from statsmodels.tsa.statespace.sarimax import SARIMAX

router = APIRouter(prefix="/api/price-forecast", tags=["Price Forecast"])

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# =====================================================
# LOAD COMPRESSED MODEL (Option 2)
# =====================================================
MODEL_FILE = os.path.join(BASE_DIR, "sarimax_model.pkl")

with open(MODEL_FILE, "rb") as f:
    model_data = pickle.load(f)

order = tuple(model_data["order"])
seasonal_order = tuple(model_data["seasonal_order"])
params = model_data["params"]
last_price = model_data["last_price"]

print("✅ Compressed SARIMAX model loaded")


# =====================================================
# LOAD ORIGINAL DATASET FOR REBUILDING SARIMAX
# =====================================================
DATA_FILE = os.path.join(BASE_DIR, "maize_weekly_dataset_2015_2024 new.xlsx")

df = pd.read_excel(DATA_FILE)

df["Year"] = df["Year"].astype(int)
df["Week"] = df["Week"].astype(int)
df["Week_str"] = df["Week"].astype(str).str.zfill(2)

df["date"] = pd.to_datetime(
    df["Year"].astype(str) + "-W" + df["Week_str"] + "-1",
    format="%G-W%V-%u"
)

df = df.sort_values("date")

weekly_price = (
    df.groupby("date")["Farm_Gate_Price_Rs_per_kg"]
      .mean()
      .sort_index()
)

# Create the final weekly price series
y = weekly_price.asfreq("W-MON").fillna(method="ffill")


# =====================================================
# RECONSTRUCT THE SARIMAX MODEL USING PARAMS
# =====================================================
base_model = SARIMAX(
    y,
    order=order,
    seasonal_order=seasonal_order,
    enforce_stationarity=False,
    enforce_invertibility=False
)

sarimax_model = base_model.filter(params)

print("✅ SARIMAX model reconstructed successfully!")


# =====================================================
# FORECAST FUNCTION (Next 4 Weeks)
# =====================================================
def forecast_weeks(steps: int = 4):
    try:
        forecast = sarimax_model.get_forecast(steps=steps)
        future = forecast.predicted_mean.to_numpy()

        # Flatten to simple list of floats
        future = np.array(future).flatten()

        weeks = []
        for i in range(steps):
            val = float(future[i])
            weeks.append({
                "week": i + 1,
                "sarimax": round(val, 2),
                "ensemble": round(val, 2)  # same output for now
            })

        return weeks

    except Exception as e:
        print("Forecast error:", e)
        raise RuntimeError("SARIMAX failed")


# =====================================================
# REQUEST / RESPONSE MODELS
# =====================================================
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


# =====================================================
# API ROUTE
# =====================================================
@router.post("/next-weeks", response_model=PriceForecastResponse)
def get_price_forecast(req: PriceForecastRequest):
    print("🔥 BACKEND RECEIVED PAYLOAD:", req.dict())

    try:
        result = forecast_weeks(req.weeks_ahead)
        return PriceForecastResponse(success=True, weeks=result)
    except Exception as e:
        print("Forecast API Error:", e)
        raise HTTPException(status_code=500, detail="Forecast failed")
