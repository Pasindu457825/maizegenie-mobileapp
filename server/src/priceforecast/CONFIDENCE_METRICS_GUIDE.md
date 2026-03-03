# Model Confidence Calculation - Real Metrics Implementation

## Overview

The confidence percentage shown in price forecasts now uses **real model validation metrics** instead of hardcoded thresholds.

## How It Works

### 1. Model Metrics (R², MAE, RMSE)

The system calculates three key metrics that measure actual model performance:

- **R² Score** (0-1): Fraction of variance explained by the model
  - Cached and loaded on server startup
  - Used as the base confidence level
  - Example: R² = 0.75 → base confidence = 75%

- **MAE** (mean absolute error in Rs/kg): Average prediction error
  - Typical range: 1-3 Rs/kg
  - Used to normalize tree disagreement

- **RMSE** (root mean squared error): Standard deviation of errors
  - Typical range: 1.5-3.5 Rs/kg
  - Used for uncertainty scaling

### 2. Confidence Formula

```
Base Confidence = R² × 100  (e.g., 75%)

Uncertainty Factor = 1 - (tree_std_dev / RMSE)
                   → scales [0, 1] based on tree agreement

Final Confidence = Base × (0.7 + 0.3 × Uncertainty)
                 → blends R² with tree disagreement
```

### 3. Confidence Tags

- **High**: confidence_pct ≥ 80%
- **Medium**: confidence_pct ≥ 65%
- **Low**: confidence_pct < 65%

## Files

### New Files

- `model_metrics.py` - Calculates and caches validation metrics
- `model_metrics_cache.json` - Cached metrics (auto-created)

### Modified Files

- `price_prediction_router.py` - Uses real metrics for confidence

## Setup & Usage

### 1. On Server Startup

Metrics are loaded automatically:

- If `model_metrics_cache.json` exists → use cached values
- Otherwise → use conservative defaults (R²=0.70, MAE=1.5, RMSE=2.2)

Console output:

```
============================================================
MODEL VALIDATION METRICS
============================================================
✅ R² Score:  0.7542
   MAE:      1.50 Rs/kg
   RMSE:     2.20 Rs/kg
   Updated:  2026-03-03T10:30:45.123456
============================================================
```

### 2. Compute Real Metrics (Admin Only)

Call this endpoint to calculate actual validation metrics from historical Supabase data:

```bash
curl -X POST http://localhost:8000/api/price-forecast/compute-metrics
```

Response:

```json
{
  "success": true,
  "message": "Model metrics computed and cached successfully",
  "metrics": {
    "r2_score": 0.7542,
    "mae_rs_per_kg": 1.5,
    "rmse_rs_per_kg": 2.2,
    "last_updated": "2026-03-03T10:30:45.123456"
  }
}
```

**Requirements for compute:**

- At least 50 price records in `maize_prices` table
- At least 12 weeks of history per district
- At least 20 valid predictions per district

### 3. Monitor Forecasts

When you call the forecast endpoint, confidence is calculated automatically:

```python
# Example response
{
  "success": true,
  "weeks": [
    {
      "week": 1,
      "rf_price": 45.32,
      "confidence_pct": 78.5,
      "confidence_tag": "High"
    },
    ...
  ]
}
```

## Interpretation

### What the Numbers Mean

**Example 1: High Confidence**

```
R² Score = 0.85  (model explains 85% of price variance)
Tree Std Dev = 0.3  (trees mostly agree)
Result: confidence_pct = 83.2%, tag = "High"
→ Trust this forecast
```

**Example 2: Medium Confidence**

```
R² Score = 0.70  (model explains 70% of variance)
Tree Std Dev = 1.5  (mild tree disagreement)
Result: confidence_pct = 71.4%, tag = "Medium"
→ Use with caution
```

**Example 3: Low Confidence**

```
R² Score = 0.60  (model explains 60% of variance)
Tree Std Dev = 2.5  (significant disagreement)
Result: confidence_pct = 61.2%, tag = "Low"
→ Consider multiple forecasts
```

## Troubleshooting

### Issue: Metrics not updating

**Solution**: Call `POST /api/price-forecast/compute-metrics` to recalculate

### Issue: Default metrics being used

**Cause**: No `model_metrics_cache.json` file found
**Solution**:

1. Ensure Supabase has sufficient historical data
2. Call the compute-metrics endpoint
3. Check server logs for error details

### Issue: Low confidence scores

**Possible causes**:

- Model needs retraining (R² is low)
- Forecast period has high variability
- Insufficient historical data for trees

**Solution**: Collect more historical price data and retrain the model

## Advanced: Manual Metric Override

If needed, you can manually edit `model_metrics_cache.json`:

```json
{
  "r2_score": 0.8,
  "mae": 1.25,
  "rmse": 1.95,
  "last_updated": "2026-03-03T10:30:45.123456"
}
```

Then restart the server to reload.

## API Reference

### POST /api/price-forecast/compute-metrics

**Description**: Calculate and cache model validation metrics

**Parameters**: None (uses all historical data in Supabase)

**Returns**:

```json
{
  "success": boolean,
  "message": string,
  "metrics": {
    "r2_score": float,
    "mae_rs_per_kg": float,
    "rmse_rs_per_kg": float,
    "last_updated": string (ISO 8601)
  }
}
```

**HTTP Codes**:

- `200` - Metrics computed successfully
- `422` - Insufficient data (need >50 records with 12+ weeks per district)
- `500` - Database error

## Implementation Details

See `src/priceforecast/model_metrics.py` for:

- `ModelMetricsCalculator` class
- `get_confidence_with_metrics()` function
- How metrics are computed from historical data
