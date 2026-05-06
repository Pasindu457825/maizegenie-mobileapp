from fastapi import APIRouter, Query
from datetime import datetime
from .service import generate_advisor_guide
from .model import PriceWindowModel
from .service import (
    build_recommendation,
    best_planting_window,
    harvest_time_advisory,
)

router = APIRouter(
    prefix="/price-window",
    tags=["Price Window Advisory"]
)

# --------------------------------------------------
# Load model once at startup
# --------------------------------------------------
model = PriceWindowModel()

# --------------------------------------------------
# Seed maturity (weeks) mapping
# --------------------------------------------------
SEED_MATURITY_WEEKS = {
    "GT 709": 16,
    "GT 200": 15,
    "Pacific 808": 17,
    "Jet 999": 16,
    "Commando": 15,
    "Local Variety": 14
}

# --------------------------------------------------
# Utility: Date → ISO Week
# --------------------------------------------------
def date_to_week(date_str: str) -> int:
    """
    Convert YYYY-MM-DD date to ISO week number (1–52)
    """
    date = datetime.strptime(date_str, "%Y-%m-%d")
    return date.isocalendar().week


# --------------------------------------------------
# 1) Single planting recommendation
# --------------------------------------------------
@router.get("/recommend")
def recommend_price_window(
    location: str = Query(..., description="District / location name"),
    planting_week: int = Query(..., ge=1, le=52),
    duration_weeks: int = Query(14, ge=8, le=20)
):
    """
    Recommend price outlook for a given planting week.
    Uses historical high-price window analysis (NO price prediction).
    """

    result = build_recommendation(
        model=model,
        location=location,
        planting_week=planting_week,
        duration_weeks=duration_weeks
    )

    if result is None:
        return {"error": "No historical data for given inputs"}

    return result


# --------------------------------------------------
# 2) Best planting week finder
# --------------------------------------------------
@router.get("/best-planting")
def best_planting(
    location: str = Query(..., description="District / location name"),
    start_week: int = Query(..., ge=1, le=52),
    seed_variety: str = Query("Local Variety", description="Maize seed variety"),
    lookahead_weeks: int = Query(6, ge=2, le=12)
):
    """
    Find the best planting week within the next N weeks
    based on historical high-price harvest windows.
    """

    best_option, alternatives = best_planting_window(
        model=model,
        location=location,
        start_week=start_week,
        seed_variety=seed_variety,
        lookahead_weeks=lookahead_weeks
    )

    if best_option is None:
        return {"error": "No suitable planting window found"}

    duration_weeks = SEED_MATURITY_WEEKS.get(seed_variety, 14)

    return {
        "location": location,
        "start_week": start_week,
        "seed_variety": seed_variety,
        "duration_weeks": duration_weeks,
        "lookahead_weeks": lookahead_weeks,
        "best_option": best_option,
        "alternatives": alternatives
    }


# --------------------------------------------------
# 3) Date-based harvest advisory (seed-aware)
# --------------------------------------------------
@router.get("/by-date")
def price_window_by_date(
    location: str = Query(..., description="District / location name"),
    planting_date: str = Query(..., description="YYYY-MM-DD"),
    seed_variety: str = Query("Local Variety", description="Maize seed variety"),
    language: str = Query("si", description="Response language: si, ta, en"),
):
    """
    Date-based advisory:
    - Converts planting date → week
    - Determines harvest duration from seed variety
    - Calculates harvest week
    - Compares harvest week vs +2 / +4 weeks (historical patterns)
    - NO price forecasting
    """

    result = harvest_time_advisory(
        model=model,
        location=location,
        planting_date=planting_date,
        seed_variety=seed_variety,
        language=language,
    )
    if result is None:
        return {"error": "No historical data available"}

    return result

# --------------------------------------------------
# 4) Advisor Guide (EXPLANATION LAYER ONLY)
# --------------------------------------------------
@router.post("/advisor-guide")
def advisor_guide(payload: dict):
    """
    Advisor guide endpoint
    - Uses EXISTING /by-date logic
    - Does NOT change price or harvest decision
    - Adds farmer-friendly explanation only
    """

    # 1) Reuse existing date-based advisory
    price_result = price_window_by_date(
        location=payload["location"],
        planting_date=payload["plantingDate"],
        seed_variety=payload.get("seedVariety", "Local Variety"),
        language=payload.get("language", "en"),
    )

    if "error" in price_result:
        return price_result

    # 2) Generate advisor guide 
    lang = payload.get("language", "en")
    advisor = generate_advisor_guide(payload, price_result, language=lang)

    # 3) Combine 
    return {
        **price_result,
        "advisor_guide": advisor
    }
