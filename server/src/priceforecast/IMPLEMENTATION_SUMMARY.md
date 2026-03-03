# Real Metrics Implementation - Summary of Changes

## What Was Changed

The confidence percentage in price forecasts now uses **real model validation metrics** instead of hardcoded thresholds.

### Before (Hardcoded)

```python
def delta_confidence(delta_std: float):
    # If std <= 0.6 → 95%
    # If std >= 2.5 → 87%
    # Linear interpolation between these arbitrary thresholds
    if delta_std <= 0.6:
        pct = 95.0
    elif delta_std >= 2.5:
        pct = 87.0
    else:
        t = (delta_std - 0.6) / (2.5 - 0.6)
        pct = 95.0 - (40.0 * t)
    return pct, tag
```

### After (Real Metrics)

```python
def delta_confidence(delta_std: float):
    # Uses actual model R² score from validation data
    # Adjusts for tree disagreement
    return get_confidence_with_metrics(delta_std)
    # → formula: conf = R² × 100 × (0.7 + 0.3 × uncertainty_factor)
```

## Files Added

### 1. `model_metrics.py`

**Purpose**: Calculate and manage model validation metrics

**Key Classes**:

- `ModelMetricsCalculator` - Loads/computes/caches R², MAE, RMSE
  - Automatically loads cached metrics on startup
  - Can compute metrics from historical Supabase data
  - Provides `get_confidence()` method using real metrics

**Key Functions**:

- `get_confidence_with_metrics(delta_std)` - Public API for confidence calculation

**External Dependencies**:

- `sklearn.metrics` (for r2_score, mean_absolute_error, mean_squared_error)
- `supabase` (for fetching historical price data)

### 2. `model_metrics_cache.json` (auto-created)

**Purpose**: Cache computed metrics to avoid recalculation

**Format**:

```json
{
  "r2_score": 0.75,
  "mae": 1.5,
  "rmse": 2.2,
  "last_updated": "2026-03-03T10:30:45.123456"
}
```

### 3. `CONFIDENCE_METRICS_GUIDE.md`

**Purpose**: Complete documentation on the new system

**Contents**:

- How confidence is calculated
- How to compute real metrics
- Usage examples and troubleshooting
- API reference

### 4. `test_real_metrics.py`

**Purpose**: Test script to verify the system works

**Tests**:

1. Metrics initialization
2. Confidence calculation
3. Cache persistence
4. Formula verification

## Files Modified

### `price_prediction_router.py`

**Changes**:

1. **Import statements** (line 14-15): Added metrics_calc import

   ```python
   from src.priceforecast.model_metrics import get_confidence_with_metrics, metrics_calc
   ```

2. **Model startup logging** (lines 45-57): Display loaded metrics

   ```python
   print("\n" + "="*60)
   print("MODEL VALIDATION METRICS")
   print("="*60)
   if metrics_calc.metrics_cached:
       print(f"✅ R² Score:  {metrics_calc.r2_score_val:.4f}")
       ...
   ```

3. **Confidence function** (lines 160-172): Now uses real metrics

   ```python
   def delta_confidence(delta_std: float):
       return get_confidence_with_metrics(delta_std)  # Uses real R², RMSE
   ```

4. **New admin endpoint** (lines 253-290): `/api/price-forecast/compute-metrics`
   - Allows admins to trigger metric computation
   - Calculates R², MAE, RMSE from historical Supabase data
   - Caches results for reuse

## How Confidence Now Works

### Formula

```
Base Confidence = R² × 100
                 (e.g., R²=0.75 → base=75%)

Uncertainty Factor = 1 - (tree_std_dev / RMSE)
                    (e.g., std=0.5, RMSE=2.2 → factor≈0.77)

Final Confidence = Base × (0.7 + 0.3 × Uncertainty)
                 (e.g., 75 × (0.7 + 0.3×0.77) ≈ 71%)
```

### Example Scenarios

**High Tree Agreement + Good R²**

```
R² = 0.80, tree_std = 0.3
→ confidence = 80 × (0.7 + 0.3×0.86) = 80% (High)
```

**Low Tree Agreement + Moderate R²**

```
R² = 0.70, tree_std = 2.0
→ confidence = 70 × (0.7 + 0.3×0.09) = 50% (Low)
```

## Setup Instructions

### 1. Initial Dashboard View

When the server starts, you'll see:

```
============================================================
MODEL VALIDATION METRICS
============================================================
⚠️  Using DEFAULT metrics (no cache found)
   R² Score:  0.7000 (assumed)
   MAE:       1.50 Rs/kg (default)
   RMSE:      2.20 Rs/kg (default)

💡 To compute real metrics, call POST /api/price-forecast/compute-metrics
============================================================
```

### 2. Compute Real Metrics (Admin)

```bash
curl -X POST http://localhost:8000/api/price-forecast/compute-metrics
```

This will:

1. Fetch all historical data from Supabase
2. Generate predictions for past prices
3. Calculate R², MAE, RMSE
4. Save to `model_metrics_cache.json`

Console output:

```
📊 Computing model validation metrics from Supabase...
   Retrieved 250 historical price records

✅ Metrics computed from 145 predictions:
   R² Score:  0.7542
   MAE:       1.50 Rs/kg
   RMSE:      2.20 Rs/kg

✅ Model metrics saved to cache
   ...
```

### 3. Restart Server

On next startup, metrics will be loaded from cache:

```
============================================================
MODEL VALIDATION METRICS
============================================================
✅ R² Score:  0.7542
   MAE:      1.50 Rs/kg
   RMSE:     2.20 Rs/kg
   Updated:  2026-03-03T10:42:15.789012
============================================================
```

## Testing

Run the test suite to verify everything works:

```bash
python src/priceforecast/test_real_metrics.py
```

Expected output:

```
TEST 1: Metrics Initialization          ✅ PASS
TEST 2: Confidence Calculation          ✅ PASS
TEST 3: Cache Persistence               ✅ PASS
TEST 4: Confidence Formula              ✅ PASS

Total: 4/4 tests passed
```

## Backward Compatibility

✅ **Fully backward compatible**

- Old hardcoded thresholds are replaced but API responses unchanged
- Consumers receive same response format: `confidence_pct` + `confidence_tag`
- If cache doesn't exist, system uses sensible defaults

## Benefits Over Hardcoded Thresholds

| Aspect             | Hardcoded         | Real Metrics                             |
| ------------------ | ----------------- | ---------------------------------------- |
| **Accuracy**       | ❌ Arbitrary      | ✅ Based on actual model performance     |
| **Adaptability**   | ❌ Static         | ✅ Updates with new training data        |
| **Tree Agreement** | ⚠️ Partial        | ✅ Proper scaling by RMSE                |
| **Model Quality**  | ❌ Ignored        | ✅ R² reflects actual variance explained |
| **Transparency**   | ❌ Magic numbers  | ✅ Clear formula, logged metrics         |
| **Tuning**         | ❌ Hard to adjust | ✅ Recompute metrics from data           |

## Next Steps

1. ✅ Verify tests pass
2. ✅ Start server and check metrics log
3. ⏳ Compute real metrics when Supabase has sufficient data (>50 price records)
4. ⏳ Monitor forecast confidence levels in production

---

**Questions?** See `CONFIDENCE_METRICS_GUIDE.md` for complete documentation.
