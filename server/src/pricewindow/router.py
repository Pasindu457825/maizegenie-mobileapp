from fastapi import APIRouter, Query
from datetime import datetime

from .model import PriceWindowModel
from .service import (
    build_recommendation,
    best_planting_window,
    calculate_harvest_week
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
    duration_weeks: int = Query(14, ge=8, le=20),
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
        duration_weeks=duration_weeks,
        lookahead_weeks=lookahead_weeks
    )

    if best_option is None:
        return {"error": "No suitable planting window found"}

    return {
        "location": location,
        "start_week": start_week,
        "duration_weeks": duration_weeks,
        "lookahead_weeks": lookahead_weeks,
        "best_option": best_option,
        "alternatives": alternatives
    }


# --------------------------------------------------
# 3) NEW — Date-based historical harvest advisory
# --------------------------------------------------
@router.get("/by-date")
def price_window_by_date(
    location: str = Query(..., description="District / location name"),
    planting_date: str = Query(..., description="YYYY-MM-DD"),
    duration_weeks: int = Query(14, ge=8, le=20)
):
    """
    Date-based advisory:
    - Converts planting date → week
    - Calculates harvest week
    - Compares harvest week vs +2 / +4 weeks (historical patterns)
    - NO price forecasting
    """

    # 1) Date → planting week
    planting_week = date_to_week(planting_date)

    # 2) Base harvest week
    base_harvest_week = calculate_harvest_week(
        planting_week, duration_weeks
    )

    options = []

    # Compare current, +2 weeks, +4 weeks
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

    # Best historical option
    best = max(options, key=lambda x: x["score"])

    # Recommendation logic
    if best["delay_weeks"] == 0 and best["label"] == "STRONG":
        action = "Harvest now"
        message_si = (
            "පසුගිය අවුරුදු ගණනාවක data අනුව, "
            "මේ කාලේ harvest වුණාම බඩ ඉරිඟු මිල "
            "සාමාන්‍යයෙන් වැඩි වෙලා තියෙනවා."
        )
    elif best["delay_weeks"] > 0:
        action = f"Delay harvest by {best['delay_weeks']} weeks"
        message_si = (
            f"පසුගිය data අනුව, සති {best['delay_weeks']}ක් පස්සේ "
            "harvest වුණාම මිල වැඩි වෙලා තියෙන අවස්ථා වැඩියි."
        )
    else:
        action = "Harvest and store"
        message_si = (
            "මේ කාලේ harvest වුණාම historically මිල අඩුයි. "
            "ඒ නිසා වහාම විකුනන්න එපා. store කරලා පස්සේ විකුනන්න."
        )

    return {
        "location": location,
        "planting_date": planting_date,
        "planting_week": planting_week,
        "base_harvest_week": base_harvest_week,
        "recommended_action": action,
        "best_harvest_week": best["harvest_week"],
        "signal": best["label"],
        "message_si": message_si,
        "options_checked": options
    }
