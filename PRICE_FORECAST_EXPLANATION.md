# Price Forecast — How It Works (Full Explanation)

## Overview

The system uses a **Random Forest "delta" model** (`rf_price_delta_model.pkl`) that predicts the **weekly price change (delta)** rather than the absolute price. It adds that delta to the most recent known price to produce the forecast.

> **v2 change**: Weather inputs (rainfall, temperature) are now derived from the **selected district's ISO-week average**, not from the device's GPS location.

---

## Architecture at a Glance

```
GPS/Clock → year, week                        (system clock – unchanged)
District selected → Open-Meteo API            (Mon–Sun average for the current ISO week)
  ├── avg_temperature  (°C)
  └── avg_rainfall     (mm)
Officers set → fuel_price, import_tax, maize_price per district (Supabase → maize_prices)
User picks → district (+ farm details for advisory only)
     ↓
Supabase fetches last 8 weeks of real maize prices for the selected district
     ↓
RF Delta Model predicts week-by-week price changes (walk-forward loop)
     ↓
App displays 4-week price forecast + confidence + profit advice
```

---

## Step 1 — Where Inputs Come From

The form (`client/src/screens/PriceForecast/PriceForecastFormScreen.tsx`) collects inputs from **three sources**:

### A. Auto-Captured (no user typing required)

| Field           | Source                                                                           |
| --------------- | -------------------------------------------------------------------------------- |
| `year`          | Current date — system clock                                                      |
| `week`          | Current ISO week number — system clock                                           |
| `temperature`   | **Open-Meteo API — district weekly average** (Mon–Sun of ISO week)               |
| `rainfall`      | **Open-Meteo API — district weekly average** (Mon–Sun of ISO week)               |
| `fuelPrice`     | **Supabase `maize_prices` table** — district-specific, set by officers           |
| `importTax`     | **Same `maize_prices` table** — district-specific                                |
| `farmGatePrice` | **Same `maize_prices` table** — district-specific, used as `last_price` in model |

> **Pricing Update**: All prices are now **district-specific**. Officers enter prices per district via the Admin Panel, stored directly in the `maize_prices` table with `fuel_price` and `import_tax` fields.
> Each record includes: `district`, `year`, `week`, `maize_price`, `fuel_price`, `import_tax`, `updated_at`

> **Admin API**: Removed global price endpoints. Officers/admins update prices **directly through Supabase** in the Admin Panel.
> **Auto-fetch**: Deleted — the app no longer fetches global prices on form load. All price data is district-specific.

### B. User Enters Manually

| Field            | Used for                                                     |
| ---------------- | ------------------------------------------------------------ |
| `district`       | Price history fetch + one-hot encode feature + weather fetch |
| `season`         | Passed as context (Yala / Maha)                              |
| `seedVariety`    | Advisory / profit analysis only — NOT in ML model            |
| `expectedYield`  | Advisory only                                                |
| `farmArea`       | Advisory only                                                |
| `seedCost`       | Advisory only                                                |
| `fertilizerCost` | Advisory only                                                |
| `labourCost`     | Advisory only                                                |
| `otherCosts`     | Advisory only                                                |
| `hasStorage`     | Advisory only                                                |

---

## Step 1b — District Weather Fetch (New)

File: `server/src/priceforecast/district_weather_service.py`  
Endpoint: `GET /api/price-forecast/district-weather?district=Kurunegala&year=2026&week=9`

### How it works

1. **ISO week date range** — Calculates Monday and Sunday dates for the given ISO week.
2. **Open-Meteo API selection**:
   - Week ended **> 2 days ago** → **Archive API** (`archive-api.open-meteo.com`) — returns final observed values.
   - Week is current or recent → **Forecast API** (`api.open-meteo.com`) — covers past days + current/future.
3. **Daily variables fetched**: `temperature_2m_mean`, `precipitation_sum`
4. **Aggregation**: Computes arithmetic mean across all 7 days (nulls excluded).
5. **Validation**: Rejects temperatures outside 15–40 °C range (Sri Lanka bounds) and replaces with seasonal defaults.
6. **Fallback**: On any API error → returns seasonal averages (Maha: 26.5°C / 28 mm; Yala: 28.5°C / 12 mm).

### District coordinate table

47 Sri Lanka districts mapped to WGS-84 centroids in `DISTRICT_COORDS` dict.  
Fuzzy case-insensitive matching handles minor name variations.

### Example response

```json
{
  "success": true,
  "avg_temperature": 28.3,
  "avg_rainfall": 12.5,
  "week_start": "2026-02-23",
  "week_end": "2026-03-01",
  "district": "Kurunegala",
  "source": "forecast"
}
```

`source` values: `"archive"` | `"forecast"` | `"fallback_api_error"` | `"fallback_unknown_district"` | `"fallback_client"`

---

## Step 2 — The API Request

File: `client/src/services/priceForecastService.ts`  
Endpoint: `POST /api/price-forecast/next-weeks`

### Payload sent to backend:

```json
{
  "year": 2026,
  "week": 9,
  "district": "Kurunegala",
  "season": "Yala",
  "fuel_price": 380.0,
  "rainfall": 12.5,
  "temperature": 28.3,
  "demand_index": 1.0,
  "import_tax": 25.0,
  "last_price": 115.0,
  "weeks_ahead": 4
}
```

`rainfall` and `temperature` are now the **ISO-week averages for the selected district**, not the device's current GPS weather.

### Normalization Safety (backend auto-fixes small values):

| Condition        | Action           |
| ---------------- | ---------------- |
| `last_price < 5` | Multiply by 1000 |
| `fuel_price < 5` | Multiply by 1000 |
| `rainfall < 5`   | Multiply by 100  |

---

## Step 3 — Backend Prediction Logic

File: `server/src/priceforecast/price_prediction_router.py`

### Step 3a — Fetch 8 Weeks of Real Historical Prices

The backend queries the Supabase `maize_prices` table:

```
Table: maize_prices
Columns: year (int), week (int), district (text), price (float)
```

It fetches the **last 8 weekly prices** for the selected district, ordered oldest → newest. These become the lag/rolling features for the model.

> **Critical**: If fewer than 8 rows exist for a district, the API returns HTTP 422 error:  
> `"Insufficient price history: need 8 weeks, found X"`

### Step 3b — Walk-Forward Forecast Loop

Runs `weeks_ahead` times (default = 4). For each future week, it builds a feature row:

| Feature                | What it is                                           |
| ---------------------- | ---------------------------------------------------- |
| `year_trend`           | `year - 2020` (captures long-term price trend)       |
| `Week`                 | ISO week number (1–52, seasonality)                  |
| `lag_1`                | Maize price 1 week ago                               |
| `lag_2`                | Maize price 2 weeks ago                              |
| `lag_4`                | Maize price 4 weeks ago                              |
| `roll_4`               | Rolling 4-week average                               |
| `roll_8`               | Rolling 8-week average                               |
| `demand_index`         | Market demand index (passed from request)            |
| `Fuel_price_Rs_per_L`  | Fuel price (Rs per litre)                            |
| `Import_tax_Rs_per_kg` | Import tax (Rs per kg)                               |
| `Rainfall_mm`          | **Weekly average rainfall (mm) — district-based**    |
| `Temp_C`               | **Weekly average temperature (°C) — district-based** |
| `dist_Kurunegala` etc. | One-hot encoded district columns (e.g. `dist_Kandy`) |

### Prediction Formula:

```
next_price = lag_1 + RF_predicted_delta
```

The predicted price is then **appended to the history window** so the next iteration uses it as the new `lag_1`. This is the **"walk-forward rollout"** approach — each week feeds into the next.

### Step 3c — Confidence Calculation

Uses the **spread (std deviation) across all individual trees** in the Random Forest:

| Delta Std Dev | Confidence % | Tag    |
| ------------- | ------------ | ------ |
| ≤ 0.6         | ~95%         | High   |
| 0.6 – 2.5     | 95% → 87%    | High   |
| ≥ 2.5         | ~87%         | Medium |

> The confidence reflects how much individual trees **disagree** on the price change. Lower disagreement = higher confidence.

---

## Step 4 — API Response

```json
{
  "success": true,
  "weeks": [
    {
      "week": 1,
      "rf_price": 117.5,
      "confidence_pct": 92.0,
      "confidence_tag": "High"
    },
    {
      "week": 2,
      "rf_price": 119.2,
      "confidence_pct": 89.5,
      "confidence_tag": "High"
    },
    {
      "week": 3,
      "rf_price": 118.8,
      "confidence_pct": 88.0,
      "confidence_tag": "High"
    },
    {
      "week": 4,
      "rf_price": 120.1,
      "confidence_pct": 87.5,
      "confidence_tag": "Medium"
    }
  ]
}
```

The frontend adapter (`priceForecastService.ts`) maps `rf_price` → `sarimax` and `ensemble` (legacy field names kept for UI compatibility).

---

## Step 5 — What the User Sees

File: `client/src/screens/PriceForecast/PriceForecastScreen.tsx`

- **Line chart** of predicted maize prices for weeks 1–4
- **Confidence %** and tag (High / Medium) per week
- **Profit advisory**: uses farm costs + yield entered by the user to calculate expected profit/loss per kg and per farm

The form screen (`PriceForecastFormScreen.tsx`) shows **"Avg. Rainfall"** and **"Avg. Temp"** cards in the Auto-Captured Data section once a district is selected, so users can verify the weekly weather that will be fed to the model.

---

## Key Files Reference

| File                                                              | Role                                                                          |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `server/src/priceforecast/price_prediction_router.py`             | Main prediction API endpoint + walk-forward logic + district-weather endpoint |
| `server/src/priceforecast/district_weather_service.py`            | **NEW** — Open-Meteo fetch, ISO-week date range, district coords              |
| `server/src/priceforecast/admin_router.py`                        | Admin endpoints to update fuel/tax/price config in Supabase                   |
| `server/src/priceforecast/rf_price_delta_model.pkl`               | Trained Random Forest model (binary)                                          |
| `client/src/screens/PriceForecast/PriceForecastFormScreen.tsx`    | Input form — fetches district weather on district selection                   |
| `client/src/screens/PriceForecast/PriceForecastScreen.tsx`        | Results display — uses district weather for forecast payload                  |
| `client/src/screens/PriceForecast/OfficerPriceForecastScreen.tsx` | Officer results — uses district weather for forecast payload                  |
| `client/src/services/priceForecastService.ts`                     | API calls — `getPriceForecast` + `getDistrictWeather`                         |

---

## Supabase Tables Used

| Table          | Purpose                                                                             |
| -------------- | ----------------------------------------------------------------------------------- |
| `maize_prices` | **ALL price data**: Weekly maize prices, fuel prices, and import taxes per district |

> **Note**: The `price_config` table has been deprecated. All pricing is now **district-specific** and stored in `maize_prices` with fields: `year`, `week`, `district`, `price` (maize), `fuel_price`, `import_tax`, `updated_at`.

---

## Important Notes

1. **Minimum data requirement**: At least **8 weeks** of historical price data must exist in `maize_prices` for the selected district.
2. **District-specific prices**: Officers enter prices separately for each district via the Admin Panel. If no price exists for the district, the system should handle safely (error or fallback).
3. **`demand_index`**: Currently hardcoded to `1.0` — not user-editable in the current UI.
4. **Farm cost inputs** (seed, fertilizer, labour) are **not used** by the ML model — they are only used for profit/loss advisory calculations.
5. **District drives everything**: The district selection determines the one-hot feature column, the historical price lookup, AND the Open-Meteo weather fetch.
6. **No GPS required**: The price forecasting module no longer reads device GPS. GPS is used in the form header for cosmetic location display only.
7. **Open-Meteo is free**: No API key required. Rate limits are generous for production use.

---

## Step 1 — Where Inputs Come From

The form (`client/src/screens/PriceForecast/PriceForecastFormScreen.tsx`) collects inputs from **two sources**:

### A. Auto-Captured (no user typing required)

| Field           | Source                                                                  |
| --------------- | ----------------------------------------------------------------------- |
| `year`          | Current date — system clock                                             |
| `week`          | Current ISO week number — system clock                                  |
| `temperature`   | Live weather via `useUniversalLocation` hook → OpenWeather API          |
| `rainfall`      | Same live weather hook                                                  |
| `fuelPrice`     | **Supabase `maize_prices` table** — district-specific                   |
| `importTax`     | **Same `maize_prices` table** — district-specific                       |
| `farmGatePrice` | **Same `maize_prices` table** — district-specific, used as `last_price` |

> **NOTE**: Prices are now **fetched per-district** from the `maize_prices` table based on the selected district.
> Officers manage prices via the Admin Panel (direct Supabase writes) — no global price endpoints.

### B. User Enters Manually

| Field            | Used for                                                     |
| ---------------- | ------------------------------------------------------------ |
| `district`       | Price history fetch from Supabase + one-hot encode + weather |
| `season`         | Passed as context (Yala / Maha)                              |
| `seedVariety`    | Advisory / profit analysis only — NOT in ML model            |
| `expectedYield`  | Advisory only                                                |
| `farmArea`       | Advisory only                                                |
| `seedCost`       | Advisory only                                                |
| `fertilizerCost` | Advisory only                                                |
| `labourCost`     | Advisory only                                                |
| `otherCosts`     | Advisory only                                                |
| `hasStorage`     | Advisory only                                                |

---

## Step 2 — The API Request

File: `client/src/services/priceForecastService.ts`  
Endpoint: `POST /api/price-forecast/next-weeks`

### Payload sent to backend:

```json
{
  "year": 2026,
  "week": 9,
  "district": "Kurunegala",
  "season": "Yala",
  "fuel_price": 380.0,
  "rainfall": 12.5,
  "temperature": 28.3,
  "demand_index": 1.0,
  "import_tax": 25.0,
  "last_price": 115.0,
  "weeks_ahead": 4
}
```

### Normalization Safety (backend auto-fixes small values):

| Condition        | Action           |
| ---------------- | ---------------- |
| `last_price < 5` | Multiply by 1000 |
| `fuel_price < 5` | Multiply by 1000 |
| `rainfall < 5`   | Multiply by 100  |

---

## Step 3 — Backend Prediction Logic

File: `server/src/priceforecast/price_prediction_router.py`

### Step 3a — Fetch 8 Weeks of Real Historical Prices

The backend queries the Supabase `maize_prices` table:

```
Table: maize_prices
Columns: year (int), week (int), district (text), price (float)
```

It fetches the **last 8 weekly prices** for the selected district, ordered oldest → newest. These become the lag/rolling features for the model.

> **Critical**: If fewer than 8 rows exist for a district, the API returns HTTP 422 error:  
> `"Insufficient price history: need 8 weeks, found X"`

### Step 3b — Walk-Forward Forecast Loop

Runs `weeks_ahead` times (default = 4). For each future week, it builds a feature row:

| Feature                | What it is                                           |
| ---------------------- | ---------------------------------------------------- |
| `year_trend`           | `year - 2020` (captures long-term price trend)       |
| `Week`                 | ISO week number (1–52, seasonality)                  |
| `lag_1`                | Maize price 1 week ago                               |
| `lag_2`                | Maize price 2 weeks ago                              |
| `lag_4`                | Maize price 4 weeks ago                              |
| `roll_4`               | Rolling 4-week average                               |
| `roll_8`               | Rolling 8-week average                               |
| `demand_index`         | Market demand index (passed from request)            |
| `Fuel_price_Rs_per_L`  | Fuel price (Rs per litre)                            |
| `Import_tax_Rs_per_kg` | Import tax (Rs per kg)                               |
| `Rainfall_mm`          | Weekly rainfall in mm                                |
| `Temp_C`               | Temperature in Celsius                               |
| `dist_Kurunegala` etc. | One-hot encoded district columns (e.g. `dist_Kandy`) |

### Prediction Formula:

```
next_price = lag_1 + RF_predicted_delta
```

The predicted price is then **appended to the history window** so the next iteration uses it as the new `lag_1`. This is the **"walk-forward rollout"** approach — each week feeds into the next.

### Step 3c — Confidence Calculation

Uses the **spread (std deviation) across all individual trees** in the Random Forest:

| Delta Std Dev | Confidence % | Tag    |
| ------------- | ------------ | ------ |
| ≤ 0.6         | ~95%         | High   |
| 0.6 – 2.5     | 95% → 87%    | High   |
| ≥ 2.5         | ~87%         | Medium |

> The confidence reflects how much individual trees **disagree** on the price change. Lower disagreement = higher confidence.

---

## Step 4 — API Response

```json
{
  "success": true,
  "weeks": [
    {
      "week": 1,
      "rf_price": 117.5,
      "confidence_pct": 92.0,
      "confidence_tag": "High"
    },
    {
      "week": 2,
      "rf_price": 119.2,
      "confidence_pct": 89.5,
      "confidence_tag": "High"
    },
    {
      "week": 3,
      "rf_price": 118.8,
      "confidence_pct": 88.0,
      "confidence_tag": "High"
    },
    {
      "week": 4,
      "rf_price": 120.1,
      "confidence_pct": 87.5,
      "confidence_tag": "Medium"
    }
  ]
}
```

The frontend adapter (`priceForecastService.ts`) maps `rf_price` → `sarimax` and `ensemble` (legacy field names kept for UI compatibility).

---

## Step 5 — What the User Sees

File: `client/src/screens/PriceForecast/PriceForecastScreen.tsx`

- **Line chart** of predicted maize prices for weeks 1–4
- **Confidence %** and tag (High / Medium) per week
- **Profit advisory**: uses farm costs + yield entered by the user to calculate expected profit/loss per kg and per farm

---

## Key Files Reference

| File                                                               | Role                                              |
| ------------------------------------------------------------------ | ------------------------------------------------- |
| `server/src/priceforecast/price_prediction_router.py`              | Main prediction API endpoint + walk-forward logic |
| `server/src/priceforecast/admin_router.py`                         | Admin endpoints (global price endpoints removed)  |
| `server/src/priceforecast/rf_price_delta_model.pkl`                | Trained Random Forest model (binary)              |
| `server/src/priceforecast/weather_service.py`                      | Weather data utilities                            |
| `client/src/screens/AdminPanel/PriceForecast/AdminPanelScreen.tsx` | Admin form — enter district prices with fuel/tax  |
| `client/src/screens/PriceForecast/PriceForecastFormScreen.tsx`     | Input form — collects auto + manual data          |
| `client/src/screens/PriceForecast/PriceForecastScreen.tsx`         | Results display — chart, confidence, advisory     |
| `client/src/services/priceForecastService.ts`                      | API call + response adapter                       |

---

## Supabase Tables Used

| Table          | Purpose                                                                               |
| -------------- | ------------------------------------------------------------------------------------- |
| `maize_prices` | **ALL price data**: Daily/weekly maize prices, fuel prices, import taxes per district |

---

## Important Notes

1. **Minimum data requirement**: At least **8 weeks** of historical price data must exist in `maize_prices` for the selected district.
2. **District-specific prices**: Officers must enter prices for the target district to ensure accuracy. Missing district prices should be handled with error messages.
3. **`demand_index`**: Currently hardcoded to `1.0` — not user-editable in the current UI.
4. **Farm cost inputs** (seed, fertilizer, labour) are **not used** by the ML model — they are only used for profit/loss advisory calculations.
5. **District drives everything**: The district selection determines the one-hot feature column AND the historical price lookup from Supabase.
