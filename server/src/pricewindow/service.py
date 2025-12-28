from .model import PriceWindowModel
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

# ==================================================
# 4) ADVISOR GUIDE (ADD-ON ONLY — NO EXISTING CHANGE)
# ==================================================

def generate_advisor_guide(form: dict, price: dict):
    """
    Generate farmer-friendly advisor guidance based on:
    - full farmer form input
    - historical price-window decision
    (NO impact on price logic)
    """
    return {
        "seed": _advisor_seed(form),
        "water": _advisor_water(form),
        "fertilizer": _advisor_fertilizer(form),
        "storage": _advisor_storage(form, price),
        "finance": _advisor_finance(form)
    }


def _advisor_seed(f):
    if f.get("preparedness", {}).get("seedReady"):
        return (
            "බීජ සූදානම දැනටමත් සම්පූර්ණයි."
            "වපුරන දිනයට බීජ හොඳ තත්ත්වයෙන් තබාගෙන යා හැක."
            "අමතර සූදානම් අවශ්‍ය නොවේ."
        )

    if f.get("experience") == "new":
        return (
            f"{f.get('seedVariety')} බීජ වපුරනට පෙර හොඳින් වියළි කර තෝරාගන්න."
            "බිඳුණු, රෝග ලක්ෂණ ඇති බීජ ඉවත් කරන්න."
            "හොඳ germination rate එකක් ලබාගැනීමට මෙය වැදගත්ය."
        )

    return (
        "හොඳ germination rate ඇති, රෝග රහිත බීජ භාවිතා කරන්න.\n"
        "පසුගිය වගා කාලයන්හි හොඳ ප්‍රතිඵල දුන් බීජ වර්ග තෝරන්න.\n"
        "මෙය අස්වැන්න සහ ඒකාකාර වර්ධනයට උපකාරී වේ."
    )


def _advisor_water(f):
    irrigation = f.get("irrigationAvailable", False)
    water_ready = f.get("preparedness", {}).get("waterReady", False)

    if irrigation and water_ready:
        return (
            "ජල වාරිමාර්ග සහ ජල සැපයුම දැනටමත් සූදානම්."
            "වගාව ආරම්භ කිරීමේදී ජල ගැටළු ඇති නොවේ."
            "නිසි වාරිකව ජලය ලබාදීම පවත්වාගෙන යන්න."
        )

    if irrigation and not water_ready:
        return (
            "ජල වාරිමාර්ග ඇතත් ජල සැපයුම තවම සූදානම් නැත."
            "වගාව ආරම්භයට පෙර ජල සැපයුම සූදානම් කරගන්න."
            "ආරම්භක අවධියේ ජල හිඟය වගාවට හානිකර වේ."
        )

    return (
        "ජල වාරිමාර්ග නොමැති බැවින් වැසි මත පමණක් වගා කරයි."
        "වියළි කාලයන්දී වගාවට අවදානම වැඩි විය හැක."
        "වැසි රටාව සැලකිල්ලට ගනිමින් වගා කාලය සැලසුම් කරන්න."
    )


def _advisor_fertilizer(f):
    if f.get("preparedness", {}).get("fertilizerReady"):
        return (
            "පොහොර සැලසුම දැනටමත් සූදානම්."
            "මුල් පොහොර සහ top dressing සඳහා අවශ්‍ය ද්‍රව්‍ය ඇත."
            "නිසි වේලාවට පොහොර දමන්න."
        )

    land = f.get("landSize")
    return (
        f"භූමි ප්‍රමාණය {land} අනුව පොහොර සැලසුම සකස් කරන්න."
        "මුල් පොහොර සහ top dressing සඳහා ප්‍රමාණය ගණනය කරන්න."
        "නිසි පොහොර සැලසුම අස්වැන්න වැඩි කිරීමට උපකාරී වේ."
    )


def _advisor_storage(f, price):
    delay = price.get("storage_advice", {}).get("duration_weeks", 0)

    if delay == 0:
        return (
            "වහාම harvest කර විකුනන නිසා ගබඩා අවශ්‍ය නැත."
            "අස්වැන්න නෙලීමෙන් පසු සෘජුවම වෙළඳපොළට ගෙන යා හැක."
            "අමතර ගබඩා වියදම් නොපැමිණේ."
        )

    if f.get("preparedness", {}).get("storageReady"):
        return (
            f"සති {delay}ක් සඳහා ගබඩා දැනටමත් සූදානම්."
            "වියළි සහ හොඳ වායු සරණි සහිත පරිසරයක් ඇත."
            "අස්වැන්න ආරක්ෂිතව තබාගත හැක."
        )

    return (
        f"සති {delay}ක් harvest පමා වන නිසා ගබඩා අවශ්‍ය වේ."
        "වියළි සහ හොඳ වායු සරණි සහිත ගබඩාවක් සූදානම් කරන්න."
        "අස්වැන්න නාස්ති වීම වැළැක්වීමට මෙය වැදගත්ය."
    )


def _advisor_finance(f):
    if f.get("preparedness", {}).get("financeReady"):
        return (
            "මුදල් සැලසුම් දැනටමත් සූදානම්."
            "වගා කාලය තුළ අමතර වියදම් සඳහා ප්‍රශ්න නොමැත."
            "වැඩ කටයුතු සාමාන්‍ය ලෙස කරගෙන යා හැක."
        )

    return (
        "පොහොර, ගබඩා සහ ප්‍රවාහන වියදම් කල්තියා ගණනය කරන්න."
        "අස්වැන්න නෙලීමේදී මුදල් හිඟයක් නොවීමට සැලසුම් කරන්න."
        "හොඳ මුදල් සැලසුම වගාවේ සාර්ථකත්වයට උපකාරී වේ."
    )
