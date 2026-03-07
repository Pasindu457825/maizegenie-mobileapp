from .model import PriceWindowModel
from datetime import datetime

# ==================================================
# LANGUAGE SUPPORT — SINGLE SOURCE OF TRUTH
# ==================================================

LANGUAGE_MESSAGES = {
    "si": {
        "STRONG": (
            "පසුගිය අවුරුදු ගණනාවක දත්ත අනුව, "
            "මේ කාලයේ අස්වැන්න ගත්විට බඩ ඉරිඟු මිල "
            "සාමාන්‍යයෙන් වැඩි වෙලා තියෙනවා."
        ),
        "MODERATE": (
            "පසුගිය දත්ත අනුව, "
            "මේ කාලයේ මිල සාමාන්‍ය මට්ටමේ පවතිනවා."
        ),
        "WEAK": (
            "පසුගිය දත්ත බලද්දි, "
            "මේ කාලයේ අස්වැන්න ගත්විට "
            "බඩ ඉරිඟු මිල අඩු වෙලා තියෙන අවස්ථා වැඩියි."
        ),
        "HARVEST_NOW": (
            "පසුගිය දත්ත අනුව මේ කාලයේ අස්වැන්න ගත්විට "
            "බඩ ඉරිඟු මිල සාමාන්‍යයෙන් වැඩි වෙලා තියෙනවා."
        ),
        "DELAY_HARVEST": (
            "පසුගිය දත්ත අනුව සති {weeks}ක් "
            "පමා කර අස්වැන්න ගතහොත් මිල වැඩි වෙලා තියෙනවා."
        ),
        "HARVEST_AND_STORE": (
            "මේ කාලයේ අස්වැන්න ගත්විට ඓතිහාසිකව මිල අඩුයි. "
            "ගබඩා කරලා පස්සේ හොඳ මිල කාලයක විකිණීම සුදුසුයි."
        ),
        "STORAGE_REQUIRED": (
            "සති {weeks}ක් පමා කර විකුනන නිසා "
            "වියලි සහ හොඳ වායු සරණි සහිත ගබඩාවක් භාවිතා කරන්න."
        ),
        "NO_STORAGE": (
            "වහාම අස්වැන්න ගෙන විකුනන නිසා ගබඩා අවශ්‍ය නැත."
        ),
    },
    "en": {
        "STRONG": (
            "Based on historical data over several years, "
            "harvesting at this time typically results in higher maize prices."
        ),
        "MODERATE": (
            "Based on historical data, "
            "prices at this time are usually at moderate levels."
        ),
        "WEAK": (
            "Historical data shows that harvesting at this time "
            "has a higher likelihood of lower maize prices."
        ),
        "HARVEST_NOW": (
            "According to historical data, harvesting at this time "
            "typically results in higher maize prices."
        ),
        "DELAY_HARVEST": (
            "According to historical data, delaying harvest by {weeks} weeks "
            "and selling later will result in better prices."
        ),
        "HARVEST_AND_STORE": (
            "Historically, prices are lower if you harvest at this time. "
            "It is advisable to store and sell when prices are higher."
        ),
        "STORAGE_REQUIRED": (
            "Since you will delay harvest by {weeks} weeks, "
            "use a dry storage facility with good ventilation."
        ),
        "NO_STORAGE": (
            "Since you harvest and sell immediately, storage is not required."
        ),
    }
}

# --------------------------------------------------
# Seed maturity (weeks) — SINGLE SOURCE OF TRUTH
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


# ==================================================
# HELPER: Get localized message
# ==================================================

def get_message(lang: str, key: str, **kwargs) -> str:
    """
    Retrieve localized message by key and language.
    Supports string formatting with kwargs.
    
    Example:
        get_message("si", "DELAY_HARVEST", weeks=2)
    """
    lang = lang or "en"
    if lang not in LANGUAGE_MESSAGES:
        lang = "en"
    
    msg = LANGUAGE_MESSAGES[lang].get(key, "")
    
    # Support string formatting
    if kwargs:
        try:
            return msg.format(**kwargs)
        except KeyError:
            return msg
    
    return msg


# ==================================================
# 1) Single planting recommendation (WITH LANGUAGE)
# ==================================================

def build_recommendation(
    model,
    location: str,
    planting_week: int,
    seed_variety: str | None,
    language: str = "en"
):
    """
    Build historical price-window recommendation with multi-language support.
    """

    duration_weeks = resolve_duration_weeks(seed_variety)
    harvest_week = calculate_harvest_week(planting_week, duration_weeks)

    row = model.get_week_row(location, harvest_week)
    if row is None:
        return None

    label = row["Label"]
    confidence = row["Confidence"]

    # Get localized message
    msg = get_message(language, label)

    return {
        "location": location,
        "seed_variety": seed_variety,
        "duration_weeks": duration_weeks,
        "planting_week": planting_week,
        "harvest_week": harvest_week,
        "label": label,
        "confidence": confidence,
        "high_price_score": float(row["HighPriceScore"]),
        "message": msg,
        "message_si": get_message("si", label),  # Keep for backward compatibility
        "language": language
    }


# ==================================================
# 2) Best planting window finder (WITH LANGUAGE)
# ==================================================

def best_planting_window(
    model,
    location: str,
    start_week: int,
    seed_variety: str | None,
    lookahead_weeks: int = 6,
    language: str = "en"
):
    """
    Evaluate next N planting weeks with multi-language support.
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
    
    best = options[0]
    # Add localized message to best option
    best["message"] = get_message(language, best["label"])
    best["message_si"] = get_message("si", best["label"])
    
    return best, options


# ==================================================
# 3) Date-based harvest time advisory (WITH LANGUAGE)
# ==================================================

def harvest_time_advisory(
    model,
    location: str,
    planting_date: str,
    seed_variety: str | None,
    language: str = "en"
):
    """
    Historical harvest-time advisory with multi-language support.
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

    # Decision logic with language support
    if best["delay_weeks"] == 0 and best["label"] == "STRONG":
        action_key = "HARVEST_NOW"
    elif best["delay_weeks"] > 0:
        action_key = "DELAY_HARVEST"
    else:
        action_key = "HARVEST_AND_STORE"

    action = get_message(language, action_key, weeks=best["delay_weeks"])
    
    # Storage advice with language
    if best["delay_weeks"] > 0:
        storage_msg = get_message(language, "STORAGE_REQUIRED", weeks=best["delay_weeks"])
    else:
        storage_msg = get_message(language, "NO_STORAGE")

    storage_advice = {
        "required": best["delay_weeks"] > 0,
        "duration_weeks": best["delay_weeks"],
        "reason": "DELAYED_HARVEST" if best["delay_weeks"] > 0 else "IMMEDIATE_SALE",
        "message": storage_msg,
        "message_si": get_message("si", "STORAGE_REQUIRED" if best["delay_weeks"] > 0 else "NO_STORAGE", weeks=best["delay_weeks"])
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
        "message": action,
        "message_si": get_message("si", action_key, weeks=best["delay_weeks"]),
        "storage_advice": storage_advice,
        "options_checked": options,
        "language": language
    }


# ==================================================
# 4) ADVISOR GUIDE (WITH LANGUAGE)
# ==================================================

def generate_advisor_guide(form: dict, price: dict, language: str = "en"):
    """
    Generate farmer-friendly advisor guidance with multi-language support.
    """
    return {
        "seed": _advisor_seed(form, language),
        "water": _advisor_water(form, language),
        "fertilizer": _advisor_fertilizer(form, language),
        "storage": _advisor_storage(form, price, language),
        "finance": _advisor_finance(form, language),
        "language": language
    }


def _advisor_seed(f, language):
    """Seed guidance with language support."""
    translations = {
        "si": {
            "ready": (
                "බීජ සූදානම දැනටමත් සම්පූර්ණයි. "
                "වපුරන දිනයට බීජ හොඳ තත්ත්වයෙන් තබාගෙන යා හැක. "
                "අමතර සූදානම් අවශ්‍ය නොවේ."
            ),
            "first_time": (
                "{variety} බීජ වපුරනට පෙර හොඳින් වියළි කර තෝරාගන්න. "
                "බිඳුණු, රෝග ලක්ෂණ ඇති බීජ ඉවත් කරන්න. "
                "හොඳ ගොත් ශ්‍රේණියක් ලබාගැනීමට මෙය වැදගත්ය."
            ),
            "general": (
                "හොඳ ගොත් ශ්‍රේණියක් ඇති, රෝග රහිත බීජ භාවිතා කරන්න. "
                "පසුගිය වගා කාලයන්හි හොඳ ප්‍රතිඵල දුන් බීජ වර්ග තෝරන්න. "
                "මෙය අස්වැන්න සහ ඒකාකාර වර්ධනයට උපකාරී වේ."
            )
        },
        "ta": {
            "ready": (
                "விதைகள் ஏற்கனவே தயாராக உள்ளன. "
                "விதைக்கும் நாள் வரை விதைகளை நல்ல நிலையில் வைக்கலாம். "
                "கூடுதல் தயாரிப்பு எதுவுமில்லை."
            ),
            "first_time": (
                "{variety} விதைகளை விதைப்பதற்கு முன் நன்காக உலர்த்தி தேர்ந்தெடுக்கவும். "
                "உடைந்த அல்லது நோய் உள்ள விதைகளை நீக்கவும். "
                "நல்ல முளைப்பு விகிதம் பெறுவதற்கு இது முக்கியம்."
            ),
            "general": (
                "நல்ல முளைப்பு விகிதம் கொண்ட நோயற்ற விதைகளை பயன்படுத்தவும். "
                "முந்தைய பருவங்களில் நல்ல முடிவுகளை தந்த விதை வகைகளை தேர்ந்தெடுக்கவும். "
                "இது அதிக விளைச்சலுக்கும் ஒரே சீரான வளர்ச்சிக்கும் உதவும்."
            )
        },
        "en": {
            "ready": (
                "Seeds are already prepared. "
                "You can keep seeds in good condition until the planting date. "
                "No additional preparation is required."
            ),
            "first_time": (
                "Before sowing {variety} seeds, dry and sort them carefully. "
                "Remove broken or diseased seeds. "
                "This is important for achieving a good germination rate."
            ),
            "general": (
                "Use seeds with good germination rate and free from diseases. "
                "Select seed varieties that gave good results in previous seasons. "
                "This helps ensure higher yields and uniform plant growth."
            )
        }
    }
    
    lang = language or "en"
    if lang not in translations:
        lang = "en"
    
    if f.get("preparedness", {}).get("seedReady"):
        return translations[lang]["ready"]
    
    if f.get("experience") == "new":
        variety = f.get("seedVariety", "hybrid")
        return translations[lang]["first_time"].format(variety=variety)
    
    return translations[lang]["general"]


def _advisor_water(f, language):
    """Water guidance with language support."""
    translations = {
        "si": {
            "ready_irrigated": (
                "ජල වාරිමාර්ග සහ ජල සැපයුම දැනටමත් සූදානම්. "
                "වගාව ආරම්භ කිරීමේදී ජල ගැටළු ඇති නොවේ. "
                "නිසි වාරිකව ජලය ලබාදීම පවත්වාගෙන යන්න."
            ),
            "prep_needed_irrigated": (
                "ජල වාරිමාර්ග ඇතත් ජල සැපයුම තවම සූදානම් නැත. "
                "වගාව ආරම්භයට පෙර ජල සැපයුම සූදානම් කරගන්න. "
                "ආරම්භක අවධියේ ජල හිඟය වගාවට හානිකර වේ."
            ),
            "no_irrigation": (
                "ජල වාරිමාර්ග නොමැති බැවින් වැසි මත පමණක් වගා කරයි. "
                "වියළි කාලයන්දී වගාවට අවදානම වැඩි විය හැක. "
                "වැසි රටාව සැලකිල්ලට ගනිමින් වගා කාලය සැලසුම් කරන්න."
            )
        },
        "ta": {
            "ready_irrigated": (
                "நீர்பாசன அமைப்புகளும் நீர் வினியோகமும் ஏற்கனவே தயாராக உள்ளன. "
                "பயிரிடல் தொடங்கும்போது நீர் பிரச்சினைகள் ஏதுமிராது. "
                "சரியான இடைவெளியில் நீர் வழங்குவதை தொடருங்கள்."
            ),
            "prep_needed_irrigated": (
                "நீர்பாசன அமைப்புகள் இருந்தாலும் நீர் வினியோகம் இன்னும் தயாரில்லை. "
                "பயிரிடல் தொடங்கும் முன் நீர் வினியோகத்தை தயார் செய்யுங்கள். "
                "ஆரம்ப வளர்ச்சி நிலையில் நீர் பற்றாக்குறை பயிருக்கு தீங்கானது."
            ),
            "no_irrigation": (
                "நீர்பாசனம் இல்லாததால் மழையை மட்டுமே நம்பி பயிரிட வேண்டும். "
                "வறட்சி காலங்களில் ஆபத்து அதிகரிக்கலாம். "
                "மழை நடை வழக்கங்களை கருத்தில் கொண்டு பயிரிடு அட்டவணையை திட்டமிடுங்கள்."
            )
        },
        "en": {
            "ready_irrigated": (
                "Water irrigation systems and water supply are already prepared. "
                "There will be no water issues when starting cultivation. "
                "Continue providing water at regular intervals."
            ),
            "prep_needed_irrigated": (
                "Although irrigation systems exist, water supply is not yet prepared. "
                "Prepare your water supply before starting cultivation. "
                "Water scarcity in the early growth stage is harmful to the crop."
            ),
            "no_irrigation": (
                "Since there is no irrigation, cultivation depends solely on rainfall. "
                "Risk increases during dry periods. "
                "Plan your planting schedule while considering rainfall patterns."
            )
        }
    }
    
    lang = language or "en"
    if lang not in translations:
        lang = "en"
    
    irrigation = f.get("irrigationAvailable", False)
    water_ready = f.get("preparedness", {}).get("waterReady", False)
    
    if irrigation and water_ready:
        return translations[lang]["ready_irrigated"]
    elif irrigation and not water_ready:
        return translations[lang]["prep_needed_irrigated"]
    else:
        return translations[lang]["no_irrigation"]


def _advisor_fertilizer(f, language):
    """Fertilizer guidance with language support."""
    translations = {
        "si": {
            "ready": (
                "පොහොර සැලසුම දැනටමත් සූදානම්. "
                "මුල් පොහොර සහ ශීර්ෂ පොහොර සඳහා අවශ්‍ය ද්‍රව්‍ය ඇත. "
                "නිසි වේලාවට පොහොර දමන්න."
            ),
            "not_ready": (
                "භූමි ප්‍රමාණය {land} අනුව පොහොර සැලසුම සකස් කරන්න. "
                "මුල් පොහොර සහ ශීර්ෂ පොහොර සඳහා ප්‍රමාණය ගණනය කරන්න. "
                "නිසි පොහොර සැලසුම අස්වැන්න වැඩි කිරීමට උපකාරී වේ."
            )
        },
        "ta": {
            "ready": (
                "உர திட்டம் ஏற்கனவே தயாராக உள்ளது. "
                "அடி உரம் மற்றும் மேல் உரத்திற்கு தேவையான பொருட்கள் உள்ளன. "
                "சரியான நேரத்தில் உரமிடவும்."
            ),
            "not_ready": (
                "உங்கள் {land} எக்கர் நிலத்தின் அளவை மனதில் கொண்டு உர திட்டத்தை தயாரிக்கவும். "
                "அடி உரம் மற்றும் மேல் உரத்திற்கு தேவையான அளவை கணக்கிடுங்கள். "
                "சரியான உர திட்டம் விளைச்சலை அதிகரிக்க உதவும்."
            )
        },
        "en": {
            "ready": (
                "Fertilizer plan is already prepared. "
                "You have the required materials for basal and top dressing. "
                "Apply fertilizers at the correct time."
            ),
            "not_ready": (
                "Based on your land size of {land}, prepare a fertilizer plan. "
                "Calculate the quantity needed for basal and top dressing. "
                "Proper fertilizer planning helps increase yield."
            )
        }
    }
    
    lang = language or "en"
    if lang not in translations:
        lang = "en"
    
    if f.get("preparedness", {}).get("fertilizerReady"):
        return translations[lang]["ready"]
    
    land = f.get("landSize", "your land")
    return translations[lang]["not_ready"].format(land=land)


def _advisor_storage(f, price, language):
    """Storage guidance with language support."""
    delay = price.get("storage_advice", {}).get("duration_weeks", 0)
    
    translations = {
        "si": {
            "no_storage_needed": (
                "වහාම harvest කර විකුනන නිසා ගබඩා අවශ්‍ය නැත. "
                "අස්වැන්න නෙලීමෙන් පසු සෘජුවම වෙළඳපොළට ගෙන යා හැක. "
                "අමතර ගබඩා වියදම් නොපැමිණේ."
            ),
            "storage_ready": (
                "සති {delay}ක් සඳහා ගබඩා දැනටමත් සූදානම්. "
                "වියළි සහ හොඳ වායු සරණි සහිත පරිසරයක් ඇත. "
                "අස්වැන්න ආරක්ෂිතව තබාගත හැක."
            ),
            "storage_needed": (
                "සති {delay}ක් harvest පමා වන නිසා ගබඩා අවශ්‍ය වේ. "
                "වියළි සහ හොඳ වායු සරණි සහිත ගබඩාවක් සූදානම් කරන්න. "
                "අස්වැන්න නාස්ති වීම වැළැක්වීමට මෙය වැදගත්ය."
            )
        },
        "ta": {
            "no_storage_needed": (
                "உடனே அறுவடை செய்து விற்பதால் சேமிப்பு தேவையில்லை. "
                "அறுவடை செய்த விளைச்சலை நேரடியாக சந்தைக்கு எடுத்துச் செல்லலாம். "
                "கூடுதல் சேமிப்பு செலவுகள் வராது."
            ),
            "storage_ready": (
                "{delay} வாரங்களுக்கான சேமிப்பு ஏற்கனவே தயாராக உள்ளது. "
                "உலர்ந்த மற்றும் நல்ல காற்றோட்டம் கொண்ட சூழல் உள்ளது. "
                "அறுவடையை பாதுகாப்பாக சேமிக்கலாம்."
            ),
            "storage_needed": (
                "{delay} வாரங்கள் அறுவடையை தாமதிக்கும்படி உள்ளதால் சேமிப்பு தேவை. "
                "உலர்ந்த மற்றும் நல்ல காற்றோட்டம் கொண்ட சேமிப்பகத்தை தயார் செய்யுங்கள். "
                "அறுவடை கெட்டுப் போவதை தடுக்க இது முக்கியம்."
            )
        },
        "en": {
            "no_storage_needed": (
                "Since you harvest and sell immediately, storage is not required. "
                "You can take the harvested yield directly to the market. "
                "No additional storage costs will be incurred."
            ),
            "storage_ready": (
                "Storage is already prepared for {delay} weeks. "
                "You have a dry environment with good ventilation. "
                "The harvest can be safely stored."
            ),
            "storage_needed": (
                "Since you will delay harvest by {delay} weeks, storage is required. "
                "Prepare a dry storage facility with good ventilation. "
                "This is important to prevent spoilage of the harvest."
            )
        }
    }
    
    lang = language or "en"
    if lang not in translations:
        lang = "en"
    
    if delay == 0:
        return translations[lang]["no_storage_needed"]
    
    if f.get("preparedness", {}).get("storageReady"):
        return translations[lang]["storage_ready"].format(delay=delay)
    
    return translations[lang]["storage_needed"].format(delay=delay)


def _advisor_finance(f, language):
    """Finance guidance with language support."""
    translations = {
        "si": {
            "ready": (
                "මුදල් සැලසුම් දැනටමත් සූදානම්. "
                "වගා කාලය තුළ අමතර වියදම් සඳහා ප්‍රශ්න නොමැත. "
                "වැඩ කටයුතු සාමාන්‍ය ලෙස කරගෙන යා හැක."
            ),
            "planning_needed": (
                "පොහොර, ගබඩා සහ ප්‍රවාහන වියදම් කල්තියා ගණනය කරන්න. "
                "අස්වැන්න නෙලීමේදී මුදල් හිඟයක් නොවීමට සැලසුම් කරන්න. "
                "හොඳ මුදල් සැලසුම වගාවේ සාර්ථකත්වයට උපකාරී වේ."
            )
        },
        "ta": {
            "ready": (
                "நிதி திட்டமிடல் ஏற்கனவே தயாராக உள்ளது. "
                "விவசாய காலத்தில் மூலதன பற்றாக்குறை ஏதுமில்லை வராது. "
                "பண்ணை செயல்பாடுகள் சீராக தொடரலாம்."
            ),
            "planning_needed": (
                "உரம், சேமிப்பு மற்றும் போக்குவரத்து செலவுகளை முன்கூட்டியே கணக்கிடுங்கள். "
                "அறுவடை காலத்தில் மூலதன பற்றாக்குறை வராமல் திட்டமிடுங்கள். "
                "நல்ல நிதி திட்டமிடல் விவசாய வெற்றிக்கு உதவுகிறது."
            )
        },
        "en": {
            "ready": (
                "Financial planning is already prepared. "
                "You won't face any capital shortage during the cultivation period. "
                "Farm operations can proceed smoothly."
            ),
            "planning_needed": (
                "Calculate fertilizer, storage, and transportation costs in advance. "
                "Plan your finances to avoid capital shortage during harvesting. "
                "Good financial planning contributes to cultivation success."
            )
        }
    }
    
    lang = language or "en"
    if lang not in translations:
        lang = "en"
    
    if f.get("preparedness", {}).get("financeReady"):
        return translations[lang]["ready"]
    
    return translations[lang]["planning_needed"]
