"""
server/src/priceforecast/district_weather_service.py

Fetches **weekly-average** temperature (°C) and rainfall (mm) for a
Sri Lanka district using the free Open-Meteo API (no API key required).

Coverage: full ISO week  Mon – Sun
  • Week already completed (> 2 days ago) → Open-Meteo Archive API
  • Current / partial / future week        → Open-Meteo Forecast API
    (forecast endpoint includes the last few past days automatically)

Usage::

    from district_weather_service import fetch_district_weekly_weather

    result = fetch_district_weekly_weather("Kurunegala", 2026, 9)
    # → {"avg_temperature": 28.3, "avg_rainfall": 12.5,
    #    "week_start": "2026-02-23", "week_end": "2026-03-01",
    #    "district": "Kurunegala", "source": "forecast"}
"""

import json
import urllib.request
from datetime import date, timedelta
from typing import Dict, Optional, Tuple

# ──────────────────────────────────────────────────────────────
#  District → (latitude, longitude)  [WGS-84 centroid, approx.]
# ──────────────────────────────────────────────────────────────
DISTRICT_COORDS: Dict[str, Tuple[float, float]] = {
    # North-Central (primary maize belt)
    "Anuradhapura": (8.3335,  80.4108),
    "Polonnaruwa":  (7.9403,  81.0188),
    # North-Western
    "Kurunegala":   (7.4867,  80.3647),
    "Puttalam":     (8.0362,  79.8283),
    # Central
    "Kandy":        (7.2906,  80.6337),
    "Matale":       (7.4675,  80.6234),
    "Nuwara Eliya": (6.9497,  80.7891),
    # Uva
    "Badulla":      (6.9895,  81.0557),
    "Monaragala":   (6.8728,  81.3507),
    # Southern
    "Hambantota":   (6.1241,  81.1185),
    "Matara":       (5.9485,  80.5353),
    "Galle":        (6.0535,  80.2210),
    # Northern
    "Jaffna":       (9.6615,  80.0255),
    "Vavuniya":     (8.7514,  80.4971),
    "Kilinochchi":  (9.3803,  80.3770),
    "Mannar":       (8.9764,  79.9047),
    "Mullaitivu":   (9.2671,  80.8128),
    # Eastern
    "Trincomalee":  (8.5874,  81.2152),
    "Batticaloa":   (7.7170,  81.7000),
    "Ampara":       (7.2978,  81.6724),
    # Western
    "Colombo":      (6.9271,  79.8612),
    "Gampaha":      (7.0917,  80.0000),
    "Kalutara":     (6.5854,  79.9616),
    # Sabaragamuwa
    "Ratnapura":    (6.6828,  80.3992),
    "Kegalle":      (7.2513,  80.3464),
}

# Fallback averages when API is unavailable (Maha = Oct-Mar, Yala = Apr-Sep)
_SEASON_DEFAULTS: Dict[str, Dict[str, float]] = {
    "Maha": {"avg_temperature": 26.5, "avg_rainfall": 28.0},
    "Yala": {"avg_temperature": 28.5, "avg_rainfall": 12.0},
}


# ──────────────────────────────────────────────────────────────
#  ISO week helpers
# ──────────────────────────────────────────────────────────────
def iso_week_date_range(year: int, week: int) -> Tuple[date, date]:
    """
    Return ``(monday, sunday)`` for the given ISO 8601 week.
    Week 1 is the week containing January 4.
    """
    jan4 = date(year, 1, 4)
    week1_monday = jan4 - timedelta(days=jan4.weekday())   # Monday of wk-1
    monday = week1_monday + timedelta(weeks=week - 1)
    sunday = monday + timedelta(days=6)
    return monday, sunday


# ──────────────────────────────────────────────────────────────
#  Open-Meteo API call
# ──────────────────────────────────────────────────────────────
_VARIABLES = "temperature_2m_mean,precipitation_sum"
_TZ        = "Asia%2FColombo"           # URL-encoded timezone string


def _fetch_open_meteo(
    lat: float,
    lon: float,
    start: date,
    end: date,
) -> dict:
    """
    Call the best Open-Meteo endpoint for the given date range and return
    the raw JSON dict.

    Decision rule:
      - ``end`` is more than 2 calendar days in the past  →  Archive API
        (final observed values; more accurate for completed weeks)
      - Otherwise  →  Forecast API
        (covers current week incl. the last few past days + future dates)
    """
    today    = date.today()
    lag_days = (today - end).days    # positive = end is in the past

    start_s = start.isoformat()
    end_s   = end.isoformat()

    if lag_days > 2:
        url = (
            f"https://archive-api.open-meteo.com/v1/archive"
            f"?latitude={lat}&longitude={lon}"
            f"&start_date={start_s}&end_date={end_s}"
            f"&daily={_VARIABLES}&timezone={_TZ}"
        )
    else:
        url = (
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}&longitude={lon}"
            f"&start_date={start_s}&end_date={end_s}"
            f"&daily={_VARIABLES}&timezone={_TZ}"
        )

    print(f"  🌤  Open-Meteo → {url[:80]}…")
    with urllib.request.urlopen(url, timeout=10) as resp:
        return json.loads(resp.read())


def _season_from_month(month: int) -> str:
    """Return 'Maha' (Oct-Mar) or 'Yala' (Apr-Sep)."""
    return "Maha" if month >= 10 or month <= 3 else "Yala"


# ──────────────────────────────────────────────────────────────
#  Public interface
# ──────────────────────────────────────────────────────────────
def fetch_district_weekly_weather(
    district: str,
    year: int,
    week: int,
) -> dict:
    """
    Return weekly average temperature (°C) and rainfall (mm) for the
    selected district covering the full ISO week (Mon–Sun).

    Return schema::

        {
            "avg_temperature": float,   # °C  (weekly mean)
            "avg_rainfall":    float,   # mm  (weekly mean of daily totals)
            "week_start":      str,     # ISO date of Monday
            "week_end":        str,     # ISO date of Sunday
            "district":        str,
            "source":          str,     # "archive" | "forecast" | "fallback_…"
        }

    Raises nothing – always returns a valid dict (uses fallback on error).
    """
    monday, sunday = iso_week_date_range(year, week)

    # ── Resolve coordinates ──────────────────────────────────
    coords: Optional[Tuple[float, float]] = DISTRICT_COORDS.get(district)
    if coords is None:
        # Case-insensitive fuzzy match
        dl = district.lower()
        for k, v in DISTRICT_COORDS.items():
            if k.lower() == dl:
                coords = v
                break

    if coords is None:
        print(f"⚠️  Unknown district '{district}' – using seasonal fallback")
        season    = _season_from_month(monday.month)
        fallbacks = _SEASON_DEFAULTS[season]
        return {
            **fallbacks,
            "week_start": monday.isoformat(),
            "week_end":   sunday.isoformat(),
            "district":   district,
            "source":     "fallback_unknown_district",
        }

    lat, lon = coords

    # ── Fetch from Open-Meteo ────────────────────────────────
    try:
        data  = _fetch_open_meteo(lat, lon, monday, sunday)
        daily = data.get("daily", {})

        temps = [t for t in (daily.get("temperature_2m_mean") or []) if t is not None]
        rains = [r for r in (daily.get("precipitation_sum")  or []) if r is not None]

        avg_temp  = round(sum(temps) / len(temps), 2) if temps else None
        avg_rain  = round(sum(rains) / len(rains), 2) if rains else None

        # Validate sensible Sri Lanka range: 15 – 40 °C  |  rain ≥ 0
        if avg_temp is None or not (15.0 <= avg_temp <= 40.0):
            season    = _season_from_month(monday.month)
            avg_temp  = _SEASON_DEFAULTS[season]["avg_temperature"]
        if avg_rain is None or avg_rain < 0:
            season    = _season_from_month(monday.month)
            avg_rain  = _SEASON_DEFAULTS[season]["avg_rainfall"]

        today     = date.today()
        source    = "archive" if (today - sunday).days > 2 else "forecast"

        print(
            f"  ✅ {district} wk{week}/{year}: "
            f"temp={avg_temp}°C  rain={avg_rain}mm  [{source}]"
        )
        return {
            "avg_temperature": avg_temp,
            "avg_rainfall":    avg_rain,
            "week_start":      monday.isoformat(),
            "week_end":        sunday.isoformat(),
            "district":        district,
            "source":          source,
        }

    except Exception as exc:
        print(f"⚠️  Open-Meteo fetch failed for '{district}' wk{week}/{year}: {exc}")
        season    = _season_from_month(monday.month)
        fallbacks = _SEASON_DEFAULTS[season]
        return {
            **fallbacks,
            "week_start": monday.isoformat(),
            "week_end":   sunday.isoformat(),
            "district":   district,
            "source":     "fallback_api_error",
        }
