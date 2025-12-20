from datetime import datetime

# --------------------------------------------------
# ✅ Seed maturity (weeks) — SINGLE SOURCE OF TRUTH
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
# Utility: Date → ISO week
# --------------------------------------------------
def date_to_week(date_str: str) -> int:
    """
    Convert YYYY-MM-DD date string to ISO week number (1–52)
    """
    date = datetime.strptime(date_str, "%Y-%m-%d")
    return date.isocalendar().week


# --------------------------------------------------
# Utility: harvest week calculation
# --------------------------------------------------
def calculate_harvest_week(planting_week: int, duration_weeks: int) -> int:
    """
    Calculate harvest week number (1–52) based on planting week
    and crop duration.
    """
    return ((planting_week + duration_weeks - 1) % 52) + 1


# --------------------------------------------------
# Utility: resolve duration from seed
# --------------------------------------------------
def resolve_duration_weeks(seed_variety: str | None) -> int:
    """
    Resolve biologically-correct harvest duration from seed variety.
    """
    return SEED_MATURITY_WEEKS.get(seed_variety, 14)


# --------------------------------------------------
# 1) Single planting recommendation
# --------------------------------------------------
def build_recommendation(
    model,
    location: str,
    planting_week: int,
    seed_variety: str | None
):
    """
    Build historical price-window recommendation for a given
    planting week (NO price forecasting).
    """

    duration_weeks = resolve_duration_weeks(seed_variety)
    harvest_week = calculate_harvest_week(planting_week, duration_weeks)

    row = model.get_week_row(location, harvest_week)
    if row is None:
        return None

    label = row["Label"]
    confidence = row["Confidence"]

    msg_si = {
        "STRONG": (
            "පසුගිය අවුරුදු ගණනාවක දත්ත අනුව, "
            "මේ කාලයේ harvest වුණාම බඩ ඉරිඟු මිල "
            "සාමාන්‍යයෙන් වැඩි වෙලා තියෙනවා."
        ),
        "MODERATE": (
            "පසුගිය දත්ත අනුව, "
            "මේ කාලයේ මිල සාමාන්‍ය මට්ටමේ පවතිනවා."
        ),
        "WEAK": (
            "පසුගිය දත්ත බලද්දි, "
            "මේ කාලයේ harvest වුණාම "
            "බඩ ඉරිඟු මිල අඩු වෙලා තියෙන අවස්ථා වැඩියි."
        )
    }[label]

    return {
        "location": location,
        "seed_variety": seed_variety,
        "duration_weeks": duration_weeks,
        "planting_week": planting_week,
        "harvest_week": harvest_week,
        "label": label,
        "confidence": confidence,
        "high_price_score": float(row["HighPriceScore"]),
        "message_si": msg_si
    }


# --------------------------------------------------
# 2) Best planting week finder
# --------------------------------------------------
def best_planting_window(
    model,
    location: str,
    start_week: int,
    seed_variety: str | None,
    lookahead_weeks: int = 6
):
    """
    Evaluate the next N planting weeks and return:
    - best planting option
    - all evaluated alternatives
    """

    duration_weeks = resolve_duration_weeks(seed_variety)
    options = []

    for i in range(lookahead_weeks):
        planting_week = ((start_week + i - 1) % 52) + 1
        harvest_week = calculate_harvest_week(
            planting_week, duration_weeks
        )

        row = model.get_week_row(location, harvest_week)
        if row is None:
            continue

        options.append({
            "planting_week": planting_week,
            "harvest_week": harvest_week,
            "label": row["Label"],
            "confidence": row["Confidence"],
            "high_price_score": float(row["HighPriceScore"])
        })

    if not options:
        return None, []

    options.sort(key=lambda x: x["high_price_score"], reverse=True)
    return options[0], options


# --------------------------------------------------
# 3) Date-based harvest time advisory
# --------------------------------------------------
def harvest_time_advisory(
    model,
    location: str,
    planting_date: str,
    seed_variety: str | None
):
    """
    Historical harvest-time advisory:
    - planting_date → planting_week
    - seed_variety → duration_weeks
    - compare harvest week vs +2 / +4 weeks
    """

    planting_week = date_to_week(planting_date)
    duration_weeks = resolve_duration_weeks(seed_variety)

    base_harvest_week = calculate_harvest_week(
        planting_week, duration_weeks
    )

    options = []

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
        return None

    best = max(options, key=lambda x: x["score"])

    # Decision logic
    if best["delay_weeks"] == 0 and best["label"] == "STRONG":
        action = "Harvest now"
        message_si = (
            "පසුගිය දත්ත අනුව මේ කාලයේ harvest වුණාම "
            "බඩ ඉරිඟු මිල සාමාන්‍යයෙන් වැඩි වෙලා තියෙනවා."
        )
    elif best["delay_weeks"] > 0:
        action = f"Delay harvest by {best['delay_weeks']} weeks"
        message_si = (
            f"පසුගිය දත්ත අනුව සති {best['delay_weeks']}ක් "
            "පමා කර harvest වුණාම මිල වැඩි වෙලා තියෙනවා."
        )
    else:
        action = "Harvest and store"
        message_si = (
            "මේ කාලයේ harvest වුණාම historically මිල අඩුයි. "
            "store කරලා පස්සේ හොඳ මිල කාලයක විකිණීම සුදුසුයි."
        )

    storage_advice = {
        "required": best["delay_weeks"] > 0,
        "duration_weeks": best["delay_weeks"],
        "reason": "DELAYED_HARVEST" if best["delay_weeks"] > 0 else "IMMEDIATE_SALE",
        "message_si": (
            f"සති {best['delay_weeks']}ක් පමා කර විකුනන නිසා "
            "වියලි සහ හොඳ වායු සරණි සහිත ගබඩාවක් භාවිතා කරන්න."
            if best["delay_weeks"] > 0
            else "වහාම harvest කර විකුනන්න පුළුවන්."
        )
    }

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
