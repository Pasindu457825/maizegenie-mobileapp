# Officer Yield Prediction - 5 Testing Scenarios

Test these scenarios in the **Officer Frontend** (`YieldPredictionOfficerFormScreen.tsx`) to verify ML model integration.

---

## **Scenario 1: High Yield - Optimal Conditions** 🌟

**Description**: Best-case scenario with high-yield variety, good soil, and optimal conditions

### Input Data:
```json
{
  "officer_id": "officer_test_001",
  "soil_profile": {
    "district": "Anuradhapura",
    "location": "Horowpothana",
    "soil_type": "Reddish Brown Earth",
    "soil_condition": "Good",
    "soil_ph": 6.8,
    "soil_nitrogen_n": 120.0,
    "soil_phosphorus_p": 35.0,
    "soil_potassium_k": 250.0,
    "soil_fertility_index": 0.85,
    "n_status_class": "High",
    "p_status_class": "High",
    "k_status_class": "High"
  },
  "climate_data": {
    "irrigation_type": "Irrigated",
    "rainfall_condition": "High",
    "rainfall_30d_mm": 200.0,
    "seasonal_rainfall_mm": 1500.0,
    "avg_temperature_c": 27.0,
    "max_temperature_c": 32.0,
    "avg_humidity_pct": 80.0,
    "sunshine_hours": 9.0
  },
  "crop_information": {
    "seed_variety": "Pacific 808",
    "planting_date": "2024-10-15",
    "planting_month": 10,
    "season": "Maha",
    "field_size_ha": 2.0
  },
  "fertilizer_dates": {
    "first_fert_date": "2024-10-25",
    "second_fert_date": "2024-11-15"
  }
}
```

### Expected Results:
- **Predicted Yield**: ~5,500-6,500 kg/ha (High)
- **Confidence**: 90-95% (High)
- **Method**: ml_model
- **Yield Category**: High
- **Harvest Window**: ~110-115 days from planting
- **Key Factors**: High NPK, Good irrigation, Optimal rainfall

---

## **Scenario 2: Medium Yield - Average Conditions** ⚖️

**Description**: Typical farmer conditions with medium inputs and mixed irrigation

### Input Data:
```json
{
  "officer_id": "officer_test_002",
  "soil_profile": {
    "district": "Polonnaruwa",
    "location": "Hingurakgoda",
    "soil_type": "Alluvial Soil",
    "soil_condition": "Medium",
    "soil_ph": 6.2,
    "soil_nitrogen_n": 75.0,
    "soil_phosphorus_p": 18.0,
    "soil_potassium_k": 150.0,
    "soil_fertility_index": 0.60,
    "n_status_class": "Medium",
    "p_status_class": "Medium",
    "k_status_class": "Medium"
  },
  "climate_data": {
    "irrigation_type": "Mixed",
    "rainfall_condition": "Normal",
    "rainfall_30d_mm": 120.0,
    "seasonal_rainfall_mm": 1000.0,
    "avg_temperature_c": 29.0,
    "max_temperature_c": 35.0,
    "avg_humidity_pct": 70.0,
    "sunshine_hours": 8.0
  },
  "crop_information": {
    "seed_variety": "GT 709",
    "planting_date": "2024-11-01",
    "planting_month": 11,
    "season": "Maha",
    "field_size_ha": 1.5
  },
  "fertilizer_dates": {
    "first_fert_date": "2024-11-11",
    "second_fert_date": "2024-12-01"
  }
}
```

### Expected Results:
- **Predicted Yield**: ~4,000-5,000 kg/ha (Medium)
- **Confidence**: 85-90% (High)
- **Method**: ml_model
- **Yield Category**: Medium
- **Harvest Window**: ~105-110 days from planting
- **Key Factors**: Medium NPK, Mixed irrigation, Normal rainfall

---

## **Scenario 3: Low Yield - Poor Conditions** ⚠️

**Description**: Challenging conditions with low soil fertility and rainfed agriculture

### Input Data:
```json
{
  "officer_id": "officer_test_003",
  "soil_profile": {
    "district": "Monaragala",
    "location": "Buttala",
    "soil_type": "Sandy-Loam",
    "soil_condition": "Poor",
    "soil_ph": 5.8,
    "soil_nitrogen_n": 45.0,
    "soil_phosphorus_p": 10.0,
    "soil_potassium_k": 80.0,
    "soil_fertility_index": 0.35,
    "n_status_class": "Low",
    "p_status_class": "Low",
    "k_status_class": "Low"
  },
  "climate_data": {
    "irrigation_type": "Rainfed",
    "rainfall_condition": "Low",
    "rainfall_30d_mm": 60.0,
    "seasonal_rainfall_mm": 600.0,
    "avg_temperature_c": 31.0,
    "max_temperature_c": 38.0,
    "avg_humidity_pct": 60.0,
    "sunshine_hours": 10.0
  },
  "crop_information": {
    "seed_variety": "Local Variety",
    "planting_date": "2024-05-10",
    "planting_month": 5,
    "season": "Yala",
    "field_size_ha": 1.0
  },
  "fertilizer_dates": {
    "first_fert_date": "2024-05-20",
    "second_fert_date": null
  }
}
```

### Expected Results:
- **Predicted Yield**: ~2,500-3,500 kg/ha (Low)
- **Confidence**: 80-85% (Medium-High)
- **Method**: ml_model
- **Yield Category**: Low
- **Harvest Window**: ~95-100 days from planting
- **Key Factors**: Low NPK, Rainfed, Low rainfall, High temperature

---

## **Scenario 4: High Yield - Yala Season with Good Management** 🌾

**Description**: Yala season (dry) but with excellent irrigation and soil management

### Input Data:
```json
{
  "officer_id": "officer_test_004",
  "soil_profile": {
    "district": "Ampara",
    "location": "Maha Oya",
    "soil_type": "Red-Yellow Podzolic",
    "soil_condition": "Good",
    "soil_ph": 6.5,
    "soil_nitrogen_n": 100.0,
    "soil_phosphorus_p": 28.0,
    "soil_potassium_k": 200.0,
    "soil_fertility_index": 0.78,
    "n_status_class": "High",
    "p_status_class": "High",
    "k_status_class": "High"
  },
  "climate_data": {
    "irrigation_type": "Irrigated",
    "rainfall_condition": "Normal",
    "rainfall_30d_mm": 100.0,
    "seasonal_rainfall_mm": 800.0,
    "avg_temperature_c": 30.0,
    "max_temperature_c": 36.0,
    "avg_humidity_pct": 65.0,
    "sunshine_hours": 9.5
  },
  "crop_information": {
    "seed_variety": "Jet 999",
    "planting_date": "2024-04-15",
    "planting_month": 4,
    "season": "Yala",
    "field_size_ha": 2.5
  },
  "fertilizer_dates": {
    "first_fert_date": "2024-04-25",
    "second_fert_date": "2024-05-15"
  }
}
```

### Expected Results:
- **Predicted Yield**: ~5,000-6,000 kg/ha (High)
- **Confidence**: 88-92% (High)
- **Method**: ml_model
- **Yield Category**: High
- **Harvest Window**: ~110-115 days from planting
- **Key Factors**: High NPK, Good irrigation compensates for Yala season, High-yield variety

---

## **Scenario 5: Medium-High Yield - Balanced Approach** 📊

**Description**: Well-balanced inputs with hybrid variety and moderate management

### Input Data:
```json
{
  "officer_id": "officer_test_005",
  "soil_profile": {
    "district": "Kurunegala",
    "location": "Galgamuwa",
    "soil_type": "Sandy-Clay-Loam",
    "soil_condition": "Good",
    "soil_ph": 6.4,
    "soil_nitrogen_n": 90.0,
    "soil_phosphorus_p": 22.0,
    "soil_potassium_k": 180.0,
    "soil_fertility_index": 0.70,
    "n_status_class": "Medium",
    "p_status_class": "Medium",
    "k_status_class": "High"
  },
  "climate_data": {
    "irrigation_type": "Mixed",
    "rainfall_condition": "High",
    "rainfall_30d_mm": 180.0,
    "seasonal_rainfall_mm": 1300.0,
    "avg_temperature_c": 28.0,
    "max_temperature_c": 33.0,
    "avg_humidity_pct": 75.0,
    "sunshine_hours": 8.5
  },
  "crop_information": {
    "seed_variety": "Commando",
    "planting_date": "2024-10-20",
    "planting_month": 10,
    "season": "Maha",
    "field_size_ha": 1.8
  },
  "fertilizer_dates": {
    "first_fert_date": "2024-10-30",
    "second_fert_date": "2024-11-20"
  }
}
```

### Expected Results:
- **Predicted Yield**: ~4,500-5,500 kg/ha (Medium-High)
- **Confidence**: 87-91% (High)
- **Method**: ml_model
- **Yield Category**: Medium
- **Harvest Window**: ~105-110 days from planting
- **Key Factors**: Good soil condition, High rainfall, Hybrid variety, Mixed irrigation

---

## **📋 Testing Checklist**

For each scenario, verify:

- [ ] **Prediction completes successfully** (no errors)
- [ ] **Yield value is realistic** (2,500-6,500 kg/ha range)
- [ ] **Confidence score displayed** (80-98%)
- [ ] **Method shows "ml_model"** (not "rule_based")
- [ ] **Harvest window calculated** (dates shown)
- [ ] **Impact factors displayed** (with multipliers)
- [ ] **Fertilizer schedule generated** (basal + top dressing)
- [ ] **Officer insights shown** (soil health, efficiency, ROI)
- [ ] **Recommendations provided** (at least 3)
- [ ] **Charts/graphs render correctly**

---

## **🎯 Expected Patterns**

### Yield Categories:
- **High**: ≥6,000 kg/ha
- **Medium**: 4,000-5,999 kg/ha
- **Low**: <4,000 kg/ha

### Confidence Levels:
- **High (85-98%)**: Good data quality, ML model confident
- **Medium (70-84%)**: Some missing/uncertain data
- **Low (<70%)**: Poor data quality or fallback to rule-based

### Key Factors Affecting Yield:
1. **NPK Status** (20-30% impact)
2. **Soil Condition** (15-20% impact)
3. **Irrigation Type** (10-15% impact)
4. **Seed Variety** (10-15% impact)
5. **Season** (5-10% impact)
6. **Rainfall** (5-10% impact)

---

## **🔍 Troubleshooting**

### If predictions seem incorrect:
1. Check server logs for ML model loading
2. Verify `prediction_method` is "ml_model" not "rule_based"
3. Ensure all required fields are filled
4. Check soil NPK values are realistic (N: 40-150, P: 10-40, K: 80-300)

### If getting rule_based instead of ml_model:
1. Restart server: `python run.py`
2. Check ML model file exists: `src/yieldprediction/best_yield_model_xgb.pkl`
3. Verify dependencies installed: `pip install -r requirements_ml.txt`

---

## **📱 Frontend Testing Steps**

1. **Open MaizeGenie mobile app**
2. **Navigate to**: Yield Prediction → Officer Role
3. **Fill form** with scenario data
4. **Submit** and wait for results
5. **Verify** all expected fields display correctly
6. **Compare** predicted yield with expected range
7. **Check** prediction method shows "ML Model"
8. **Test** all 5 scenarios

---

**Good luck with testing! 🌽📊**
