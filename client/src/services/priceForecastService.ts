// client/src/services/priceForecastService.ts
import { API_BASE } from "../services/api";

export type Language = "si" | "en";

export interface PriceForecastPayload {
  year: string;
  week: string;
  district: string;
  season: string;
  productionCostPerKg: number;
  weeks_ahead?: number;
}

export interface WeekForecast {
  week: number;
  sarimax: number;
  ensemble: number;
  xgb?: number; // optional now
  lstm?: number; // optional now
}

export interface PriceForecastResponse {
  success: boolean;
  weeks: WeekForecast[];
}

export async function getPriceForecast(
  payload: PriceForecastPayload
): Promise<PriceForecastResponse> {
  const res = await fetch(`${API_BASE}/api/price-forecast/next-weeks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    console.log("Price forecast error:", res.status);
    throw new Error("Price forecast request failed");
  }

  return res.json();
}
