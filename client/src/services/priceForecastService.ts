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
  sarimax: number;   // mapped from rf_price
  ensemble: number;  // mapped from rf_price

  // NEW (for confidence bar & tag)
  confidence_pct?: number;           // 0–100
  confidence_tag?: "High" | "Medium";
}

export interface PriceForecastResponse {
  success: boolean;
  weeks: WeekForecast[];
}

// =====================================================
// API CALL
// =====================================================
export async function getPriceForecast(
  payload: PriceForecastPayload
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
