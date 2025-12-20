from datetime import datetime


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
# 1) Single planting recommendation (UNCHANGED)
# --------------------------------------------------
def build_recommendation(
    model,
    location: str,
    planting_week: int,
    duration_weeks: int
):
    """
    Build historical price-window recommendation for a given
    planting week (NO price forecasting).
    """
    harvest_week = calculate_harvest_week(planting_week, duration_weeks)
    row = model.get_week_row(location, harvest_week)

    if row is None:
        return None

    label = row["Label"]
    confidence = row["Confidence"]

    # Sinhala messages (historical pattern based)
    msg_si = {
        "STRONG": (
            "පසුගිය අවුරුදු ගණනාවක data අනුව, "
            "මේ කාලයේ harvest වුණාම බඩ ඉරිඟු මිල "
            "සාමාන්‍යයෙන් වැඩි වෙලා තියෙනවා."
        ),
        "MODERATE": (
            "පසුගිය data අනුව, මේ කාලයේ "
            "මිල සාමාන්‍ය මට්ටමේ පවතිනවා."
        ),
        "WEAK": (
            "පසුගිය data බලද්දි, මේ කාලයේ "
            "harvest වුණාම බඩ ඉරිඟු මිල "
            "අඩු වෙලා තියෙන අවස්ථා වැඩියි."
        )
    }[label]

    return {
        "location": location,
        "planting_week": planting_week,
        "harvest_week": harvest_week,
        "label": label,
        "confidence": confidence,
        "high_price_score": float(row["HighPriceScore"]),
        "message_si": msg_si
    }


# --------------------------------------------------
# 2) Best planting week finder (UNCHANGED)
# --------------------------------------------------
def best_planting_window(
    model,
    location: str,
    start_week: int,
    duration_weeks: int,
    lookahead_weeks: int = 6
):
    """
    Evaluate the next N planting weeks and return:
    - best planting option (highest HighPriceScore)
    - all evaluated alternatives
    """

    options = []

    for i in range(lookahead_weeks):
        planting_week = ((start_week + i - 1) % 52) + 1
        harvest_week = calculate_harvest_week(
            planting_week,
            duration_weeks
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

    options.sort(
        key=lambda x: x["high_price_score"],
        reverse=True
    )

    best_option = options[0]
    return best_option, options


# --------------------------------------------------
# 3) NEW — Date-based harvest time advisory
# --------------------------------------------------
def harvest_time_advisory(
    model,
    location: str,
    planting_date: str,
    duration_weeks: int
):
    """
    Historical harvest-time advisory:
    - planting_date → planting_week
    - calculate harvest week
    - compare harvest week vs +2 / +4 weeks
    - NO price prediction (historical pattern only)
    """

    planting_week = date_to_week(planting_date)
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

    # Decision + Sinhala advisory
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
            "harvest වුණාම බඩ ඉරිඟු මිල "
            "වැඩි වෙලා තියෙන අවස්ථා වැඩියි."
        )

    else:
        action = "Harvest and store"
        message_si = (
            "මේ කාලේ harvest වුණාම historically මිල අඩුයි. "
            "ඒ නිසා වහාම විකුනන්න එපා. "
            "store කරලා පස්සේ හොඳ මිල කාලයක් එනකන් ඉඳලා විකුනන්න."
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
