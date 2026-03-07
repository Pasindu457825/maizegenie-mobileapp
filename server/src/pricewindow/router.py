from fastapi import APIRouter, Query
from datetime import datetime
from .service import generate_advisor_guide
from .model import PriceWindowModel
from .service import (
    build_recommendation,
    best_planting_window,
    calculate_harvest_week,
    get_message
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
# ✅ NEW — Seed maturity (weeks) mapping
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
# 1) Single planting recommendation (UNCHANGED)
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
# 2) Best planting week finder (UNCHANGED)
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
    seed_variety: str = Query("Local Variety", description="Maize seed variety")
):
    """
    Date-based advisory:
    - Converts planting date → week
    - Determines harvest duration from seed variety
    - Calculates harvest week
    - Compares harvest week vs +2 / +4 weeks (historical patterns)
    - NO price forecasting
    """

    # 1) Date → planting week
    planting_week = date_to_week(planting_date)

    # 2) Seed-based harvest duration
    duration_weeks = SEED_MATURITY_WEEKS.get(seed_variety, 14)

    # 3) Base harvest week
    base_harvest_week = calculate_harvest_week(
        planting_week, duration_weeks
    )

    options = []

    # 4) Compare current, +2 weeks, +4 weeks
    for delay in [0, 2, 4]:
        harvest_week = ((base_harvest_week + delay - 1) % 52) + 1
        row = model.get_week_row(location, harvest_week)

        if row is None:
            continue

        options.append({
            "delay_weeks": delay,
            "harvest_week": harvest_week,
            "label": row["Label"],
            "score": float(row["HighPriceScore"])
        })

    if not options:
        return {"error": "No historical data available"}

    # 5) Best historical option
    best = max(options, key=lambda x: x["score"])

    # -------------------------------
    # Recommendation logic
    # -------------------------------
    if best["delay_weeks"] == 0 and best["label"] == "STRONG":
        action = get_message("si", "HARVEST_NOW")
        message_si = get_message("si", "HARVEST_NOW")

    elif best["delay_weeks"] > 0:
        action = get_message("si", "DELAY_HARVEST", weeks=best["delay_weeks"])
        message_si = get_message("si", "DELAY_HARVEST", weeks=best["delay_weeks"])

    else:
        action = get_message("si", "HARVEST_AND_STORE")
        message_si = get_message("si", "HARVEST_AND_STORE")

    # -------------------------------
    # Storage advice
    # -------------------------------
    if best["delay_weeks"] > 0:
        storage_advice = {
            "required": True,
            "duration_weeks": best["delay_weeks"],
            "reason": "DELAYED_HARVEST",
            "message_si": get_message("si", "STORAGE_REQUIRED", weeks=best["delay_weeks"])
        }
    else:
        storage_advice = {
            "required": False,
            "duration_weeks": 0,
            "reason": "IMMEDIATE_SALE",
            "message_si": get_message("si", "NO_STORAGE")
        }

    # -------------------------------
    # RETURN
    # -------------------------------
    return {
        "location": location,
        "seed_variety": seed_variety,
        "duration_weeks": duration_weeks,
        "planting_date": planting_date,
        "planting_week": planting_week,
        "base_harvest_week": base_harvest_week,
        "recommended_action": action,
        "best_harvest_week": best["harvest_week"],
        "signal": best["label"],
        "message_si": message_si,
        "storage_advice": storage_advice,
        "options_checked": options
    }

# --------------------------------------------------
# 4) ➕ NEW — Advisor Guide (EXPLANATION LAYER ONLY)
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
        seed_variety=payload.get("seedVariety", "Local Variety")
    )

    if "error" in price_result:
        return price_result

    # 2) Generate advisor guide (NEW)
    lang = payload.get("language", "en")
    advisor = generate_advisor_guide(payload, price_result, language=lang)

    # 3) Combine (NO existing keys removed)
    return {
        **price_result,
        "advisor_guide": advisor
    }
