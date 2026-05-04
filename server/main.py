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
from notifications.router import router as notifications_router
try:
    from diseaseidentify.router import router as disease_router
except Exception as _e:
    import logging
    logging.warning(f"diseaseidentify router not loaded: {_e}")
    disease_router = None
try:
    from pestidentify.router import router as pest_router
except Exception as _e:
    import logging
    logging.warning(f"pestidentify router not loaded: {_e}")
    pest_router = None
from chat.room_router import router as room_router    # get/create room
from chat.officer_router import router as officer_router
from chat.router import router as chat_router         # history + websocket
from chat.upload_router import router as upload_router
from priceforecast.admin_router import router as admin_router
from yieldprediction.router import router as yield_router
from yieldprediction.farmer_router import router as farmer_yield_router
from yieldprediction.officer_router import router as officer_yield_router
from priceforecast.price_prediction_router import router as price_forecast_router
from pricewindow.router import router as price_window_router
from fertilizeradvisory.router import router as fertilizer_advisory_router
from official_news.official_news_router import router as official_news_router
from pro_advisor.router import router as pro_advisor_router
from advicerequests.router import router as advice_requests_router
from soilextraction.router import router as soil_extraction_router
from subscription.router import router as subscription_router
from notifications.router import router as notifications_router
from wetyield.router import router as wet_yield_router



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
app.include_router(notifications_router)  # Authenticated notifications
if disease_router:
    app.include_router(disease_router)
if pest_router:
    app.include_router(pest_router)

# Chat system (order does NOT matter but kept clean)
app.include_router(room_router)     # /chat/get-room
app.include_router(chat_router)     # /chat/history + websocket
app.include_router(officer_router)
app.include_router(upload_router) 

app.include_router(admin_router)
app.include_router(yield_router)
app.include_router(farmer_yield_router)  # Farmer prediction endpoint
app.include_router(officer_yield_router)
app.include_router(price_forecast_router)
app.include_router(fertilizer_advisory_router)  # Rule-Based Fertilizer Advisory
app.include_router(price_window_router)
app.include_router(official_news_router)
app.include_router(pro_advisor_router)
app.include_router(advice_requests_router)  # Farmer Advice Requests
app.include_router(soil_extraction_router)  # Soil Data Extraction from PDF/Image
app.include_router(subscription_router)  # Subscription and sandbox payment
app.include_router(notifications_router)  # Notifications API (bypasses RLS)
app.include_router(wet_yield_router)  # Wet Weight Yield Prediction (XGBoost)
