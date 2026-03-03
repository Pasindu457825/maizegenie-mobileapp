// client/src/services/priceForecastService.ts
import { API_BASE } from "./api";

// =====================================================
// TYPES (Frontend-facing)
// =====================================================
export type Language = "si" | "en";

export interface PriceForecastPayload {
  year: number;
  week: number;
  district: string;
  season: string;

  fuel_price: number;
  rainfall: number;
  temperature: number;
  demand_index: number;
  import_tax: number;
  last_price: number;

  weeks_ahead?: number;
}

/**
 * 🔁 IMPORTANT:
 * - Existing fields: sarimax, ensemble (DO NOT REMOVE)
 * - New fields: confidence_pct, confidence_tag (OPTIONAL)
 */
export interface WeekForecast {
  week: number;

  // EXISTING (UI already uses these)
  sarimax: number; // mapped from rf_price
  ensemble: number; // mapped from rf_price

  // NEW (for confidence bar & tag)
  confidence_pct?: number; // 0–100
  confidence_tag?: "High" | "Medium";
}

export interface PriceForecastResponse {
  success: boolean;
  weeks: WeekForecast[];
}

// =====================================================
// DISTRICT WEEKLY WEATHER
// =====================================================

/**
 * Weekly-average weather for a district.
 * Returned by GET /api/price-forecast/district-weather
 */
export interface DistrictWeather {
  avg_temperature: number; // °C  (ISO-week average)
  avg_rainfall: number; // mm  (ISO-week average of daily totals)
  week_start: string; // ISO date of Monday
  week_end: string; // ISO date of Sunday
  district: string;
  source: string; // "archive" | "forecast" | "fallback_…"
}

/**
 * Fetch the weekly-average temperature and rainfall for a district.
 *
 * Replaces GPS-based current weather so the ML price-forecast model
 * always receives district-level, ISO-week aggregated weather inputs.
 *
 * @param district - English district name (e.g. "Kurunegala")
 * @param year     - ISO year
 * @param week     - ISO week number (1–53)
 */
export async function getDistrictWeather(
  district: string,
  year: number,
  week: number,
): Promise<DistrictWeather | null> {
  try {
    const params = new URLSearchParams({
      district,
      year: String(year),
      week: String(week),
    });
    const res = await fetch(
      `${API_BASE}/api/price-forecast/district-weather?${params}`,
    );
    if (!res.ok) {
      console.error("getDistrictWeather API error:", res.status);
      return null;
    }
    const data = await res.json();
    if (!data.success) return null;
    return {
      avg_temperature: data.avg_temperature,
      avg_rainfall: data.avg_rainfall,
      week_start: data.week_start,
      week_end: data.week_end,
      district: data.district,
      source: data.source,
    };
  } catch (err) {
    console.error("getDistrictWeather fetch failed:", err);
    return null;
  }
}

// =====================================================
// PRICE FORECAST API CALL
// =====================================================
export async function getPriceForecast(
  payload: PriceForecastPayload,
): Promise<PriceForecastResponse> {
  const res = await fetch(`${API_BASE}/api/price-forecast/next-weeks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      weeks_ahead: payload.weeks_ahead ?? 4,
    }),
  });

  if (!res.ok) {
    console.error("Price forecast API error:", res.status);
    throw new Error("Price forecast request failed");
  }

  const data = await res.json();

  // =====================================================
  // 🔁 ADAPTER: Backend → UI FORMAT
  // (Backward compatible)
  // =====================================================
  return {
    success: data.success,
    weeks: (data.weeks || []).map((w: any) => ({
      week: w.week,

      // EXISTING UI MAPPING (KEEP AS-IS)
      sarimax: w.rf_price,
      ensemble: w.rf_price,

      // NEW (SAFE – UI can ignore if unused)
      confidence_pct: w.confidence_pct,
      confidence_tag: w.confidence_tag,
    })),
  };
}
