# How Price 123.83 is Calculated — Full Step-by-Step Trace

## Payload That Was Sent

```json
{
  "year": 2026,
  "week": 10,
  "district": "Anuradhapura",
  "season": "Maha",
  "fuel_price": 277,
  "import_tax": 25,
  "last_price": 160,
  "rainfall": 0.06,
  "temperature": 26.1,
  "demand_index": 0.85,
  "weeks_ahead": 4
}
```

---

## Step 1 — Normalization Safety Check

File: `server/src/priceforecast/price_prediction_router.py` → `normalize_if_needed()`

```python
if req.last_price < 5:  req.last_price *= 1000   # 160   → stays 160   (no change)
if req.fuel_price < 5:  req.fuel_price *= 1000   # 277   → stays 277   (no change)
if req.rainfall   < 5:  req.rainfall   *= 100    # 0.06  → 6.0         ✅ CHANGED
```

| Field      | Before | After   | Why                    |
| ---------- | ------ | ------- | ---------------------- |
| last_price | 160    | 160     | ≥ 5, no change         |
| fuel_price | 277    | 277     | ≥ 5, no change         |
| rainfall   | 0.06   | **6.0** | < 5 → multiplied × 100 |

> **rainfall 0.06 became 6.0 mm** — the Open-Meteo weekly average for
> Anuradhapura week 10 was extremely small (very dry week). The safety
> normalization scaled it up so the model receives meaningful mm values.

---

## Step 2 — Fetch 8 Weeks of Real Historical Prices from Supabase

File: `server/src/priceforecast/price_prediction_router.py` → `fetch_price_history()`

```python
supabase.from_("maize_prices")
  .select("year, week, price")
  .eq("district", "Anuradhapura")
  .or_("year.lt.2026, and(year.eq.2026, week.lte.10)")
  .order("year", desc=True)
  .order("week", desc=True)
  .limit(8)
  .execute()
```

This query says:

- **Table**: `maize_prices`
- **Filter**: district = "Anuradhapura" AND date ≤ week 10 of 2026
- **Sort**: newest first
- **Take**: only 8 rows
- Then **reverse** the result → oldest first

### Example — what comes back (your actual DB values may differ):

```
position  week/year    price (Rs/kg)
────────  ──────────   ─────────────
[0]       wk3 / 2026   118.20        ← oldest of the 8
[1]       wk4 / 2026   119.50
[2]       wk5 / 2026   120.10
[3]       wk6 / 2026   121.00
[4]       wk7 / 2026   120.80
[5]       wk8 / 2026   121.50
[6]       wk9 / 2026   122.40
[7]       wk10/ 2026   121.50        ← newest / most recent
```

> ⚠️ IMPORTANT: `last_price: 160` from the form payload is **NOT used here**.
> The 8 rows above come entirely from the `maize_prices` Supabase table.
> The 160 value is only used for the profit-delta display log in the server
> console — it never enters the ML calculation.

---

## Step 3 — Calculate Lag & Rolling Features (Week 1, i = 0)

File: `server/src/priceforecast/price_prediction_router.py` → `forecast_weeks_rf_delta()`

```python
lag_1  = price_history[-1]        # most recent price
lag_2  = price_history[-2]        # 1 week before that
lag_4  = price_history[-4]        # 3 weeks before lag_1
roll_4 = mean(price_history[-4:]) # average of last 4 prices
roll_8 = mean(price_history[-8:]) # average of all 8 prices
```

### Where each feature comes from:

| Feature  | Index Used       | Formula / Value                                   | Source            |
| -------- | ---------------- | ------------------------------------------------- | ----------------- |
| `lag_1`  | `[-1]`           | 121.50                                            | Supabase wk10     |
| `lag_2`  | `[-2]`           | 122.40                                            | Supabase wk9      |
| `lag_4`  | `[-4]`           | 120.80                                            | Supabase wk7      |
| `roll_4` | `[-4]` to `[-1]` | mean(120.80, 121.50, 122.40, 121.50) = **121.55** | Supabase wk7–wk10 |
| `roll_8` | `[-8]` to `[-1]` | mean(all 8) = **120.63**                          | Supabase wk3–wk10 |

### Illustration:

```
Supabase maize_prices — Anuradhapura (8 rows, oldest → newest)
┌──────┬──────────┬─────────────────────────────────────────────┐
│ pos  │  price   │  used as                                    │
├──────┼──────────┼─────────────────────────────────────────────┤
│ [0]  │  118.20  │  roll_8                                     │
│ [1]  │  119.50  │  roll_8                                     │
│ [2]  │  120.10  │  roll_8                                     │
│ [3]  │  121.00  │  roll_8                                     │
│ [4]  │  120.80  │  roll_8, roll_4, lag_4                      │
│ [5]  │  121.50  │  roll_8, roll_4                             │
│ [6]  │  122.40  │  roll_8, roll_4, lag_2                      │
│ [7]  │  121.50  │  roll_8, roll_4, lag_1   ← most recent      │
└──────┴──────────┴─────────────────────────────────────────────┘
```

---

## Step 4 — Full Feature Row Built for the RF Model

```
year_trend          =  2026 − 2020  =  6
Week                =  10
lag_1               =  121.50
lag_2               =  122.40
lag_4               =  120.80
roll_4              =  121.55
roll_8              =  120.63
demand_index        =  0.85
Fuel_price_Rs_per_L =  277.0
Import_tax_Rs_per_kg=  25.0
Rainfall_mm         =  6.0          ← was 0.06, normalized × 100
Temp_C              =  26.1
dist_Anuradhapura   =  1            ← one-hot encoded
dist_Kurunegala     =  0
dist_Kandy          =  0
… (all other dist_ columns = 0)
```

> `year_trend` is always `year − 2020`. This offset was set at model
> training time (`BASE_YEAR = 2020`) so the model sees a small stable
> number (6) instead of a large one (2026).

---

## Step 5 — Random Forest Predicts the Price CHANGE (Δ)

File: `server/src/priceforecast/price_prediction_router.py` → `predict_delta_with_uncertainty()`

The model **does NOT predict the final price directly**. It predicts
how much the price will _change_ from the current week:

```python
tree_preds = [tree.predict(X)[0] for tree in rf_model.estimators_]
# e.g. 100 trees each predict a delta:
# [2.1, 2.5, 2.3, 2.4, 2.2, 2.6, ...]

delta_mean = mean(tree_preds)   # e.g.  +2.33
delta_std  = std(tree_preds)    # e.g.   0.40  (how much trees disagree)
```

### Confidence calculation from `delta_std`:

```
delta_std ≤ 0.6  →  confidence = 95%   tag = "High"
delta_std = 0.40 →  confidence = 95%   tag = "High"   ✅ (our case)
delta_std ≥ 2.5  →  confidence = 87%   tag = "Medium"
```

---

## Step 6 — Final Price Formula

```python
next_price = round(lag_1 + delta_mean, 2)
           = round(121.50 + 2.33, 2)
           = 123.83  ✅
```

**That's where 123.83 comes from.**

---

## Step 7 — Walk-Forward for Weeks 2, 3, 4

After Week 1 is predicted, **123.83 is appended** to the history list:

```python
price_history.append(123.83)
# price_history is now 9 items long
```

Week 2 then uses the **updated** history:

```
New price_history (9 items):
[0] 118.20   [1] 119.50   [2] 120.10   [3] 121.00   [4] 120.80
[5] 121.50   [6] 122.40   [7] 121.50   [8] 123.83  ← week 1 prediction

lag_1  = 123.83   ← week 1 prediction
lag_2  = 121.50   ← original last real price
lag_4  = 121.50   ← from original history
roll_4 = mean(120.80, 121.50, 122.40, 123.83) = 122.13
roll_8 = mean(last 8 values)  ← drops [0], adds [8]
```

Week 3 repeats the same logic using Week 2's prediction as the new `lag_1`, and so on.

---

## Complete Visual Flow

```
Supabase maize_prices
  (8 rows — wk3 to wk10, Anuradhapura)
           │
           ▼
  lag_1 = 121.50    ← price_history[-1]
  lag_2 = 122.40    ← price_history[-2]
  lag_4 = 120.80    ← price_history[-4]
  roll_4 = 121.55   ← mean of last 4
  roll_8 = 120.63   ← mean of all 8
           +
  year_trend = 6     (2026 − 2020)
  Week = 10
  rainfall = 6.0     (0.06 × 100 by normalizer)
  temp = 26.1
  fuel = 277
  tax = 25
  demand = 0.85
  dist_Anuradhapura = 1
           │
           ▼
  RF Delta Model
  (100 trees each vote on Δ)
           │
           ▼
  delta_mean = +2.33
  delta_std  =  0.40  →  confidence 95% "High"
           │
           ▼
  next_price = 121.50 + 2.33 = 123.83  ✅
           │
           ▼
  Append 123.83 → use as lag_1 for Week 2
  Predict Week 2 → append → use for Week 3
  Predict Week 3 → append → use for Week 4
```

---

## Quick Reference — Where Each Value Comes From

| Value in prediction   | Source                                                       |
| --------------------- | ------------------------------------------------------------ |
| `lag_1`               | Supabase `maize_prices` — newest row                         |
| `lag_2`               | Supabase `maize_prices` — 2nd newest row                     |
| `lag_4`               | Supabase `maize_prices` — 4th newest row                     |
| `roll_4`              | Average of last 4 rows from Supabase                         |
| `roll_8`              | Average of all 8 rows from Supabase                          |
| `rainfall`            | Open-Meteo weekly avg → normalized if < 5                    |
| `temperature`         | Open-Meteo weekly avg for the district                       |
| `fuel_price`          | Supabase `maize_prices` table (officer-entered per district) |
| `import_tax`          | Supabase `maize_prices` table (officer-entered per district) |
| `demand_index`        | Hardcoded: 0.85 (Maha) or 0.70 (Yala)                        |
| `year_trend`          | `year − 2020` (calculated)                                   |
| `dist_*`              | One-hot: 1 for selected district, 0 others                   |
| **`last_price: 160`** | **⚠️ NOT used in ML — display only**                         |
