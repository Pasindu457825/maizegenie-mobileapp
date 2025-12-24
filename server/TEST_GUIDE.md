# Testing Yield Prediction ML Model

## Quick Start

### Option 1: Run Test Script (Recommended)
```bash
# Make sure server is running in another terminal
python run.py

# In a new terminal, run the test script
python test_yield_prediction.py
```

### Option 2: Test with curl

```bash
curl -X POST http://localhost:8000/api/yield/predict \
  -H "Content-Type: application/json" \
  -d '{
    "district": "Anuradhapura",
    "location": "Horowpothana",
    "gps_lat": 8.3456,
    "gps_lng": 80.1234,
    "season": "Maha",
    "planting_date": "2024-11-23",
    "land_size_value": 2.5,
    "land_size_unit": "Acres",
    "variety": "Jet 999",
    "soil_type": "RBE",
    "soil_condition": "Good",
    "irrigation_type": "Mixed",
    "rainfall_condition": "Normal",
    "soil_ph": 6.5,
    "soil_nitrogen_n": 85.0,
    "soil_phosphorus_p": 20.0,
    "soil_potassium_k": 190.0,
    "avg_temperature_c": 28.5,
    "max_temperature_c": 33.0,
    "avg_humidity_pct": 75.0,
    "rainfall_30d_mm": 320.0,
    "seasonal_rainfall_mm": 880.0,
    "sunshine_hours": 7.8
  }'
```

### Option 3: Test with PowerShell

```powershell
$body = @{
    district = "Anuradhapura"
    location = "Horowpothana"
    gps_lat = 8.3456
    gps_lng = 80.1234
    season = "Maha"
    planting_date = "2024-11-23"
    land_size_value = 2.5
    land_size_unit = "Acres"
    variety = "Jet 999"
    soil_type = "RBE"
    soil_condition = "Good"
    irrigation_type = "Mixed"
    rainfall_condition = "Normal"
    soil_ph = 6.5
    soil_nitrogen_n = 85.0
    soil_phosphorus_p = 20.0
    soil_potassium_k = 190.0
    avg_temperature_c = 28.5
    max_temperature_c = 33.0
    avg_humidity_pct = 75.0
    rainfall_30d_mm = 320.0
    seasonal_rainfall_mm = 880.0
    sunshine_hours = 7.8
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/yield/predict" -Method Post -Body $body -ContentType "application/json"
```

### Option 4: Test with Postman

1. **Create New Request**
   - Method: `POST`
   - URL: `http://localhost:8000/api/yield/predict`

2. **Headers**
   - `Content-Type`: `application/json`

3. **Body** (raw JSON)
```json
{
  "district": "Anuradhapura",
  "location": "Horowpothana",
  "gps_lat": 8.3456,
  "gps_lng": 80.1234,
  "season": "Maha",
  "planting_date": "2024-11-23",
  "land_size_value": 2.5,
  "land_size_unit": "Acres",
  "variety": "Jet 999",
  "soil_type": "RBE",
  "soil_condition": "Good",
  "irrigation_type": "Mixed",
  "rainfall_condition": "Normal",
  "soil_ph": 6.5,
  "soil_nitrogen_n": 85.0,
  "soil_phosphorus_p": 20.0,
  "soil_potassium_k": 190.0,
  "avg_temperature_c": 28.5,
  "max_temperature_c": 33.0,
  "avg_humidity_pct": 75.0,
  "rainfall_30d_mm": 320.0,
  "seasonal_rainfall_mm": 880.0,
  "sunshine_hours": 7.8
}
```

## Expected Response

```json
{
  "predicted_yield": 5234.56,
  "predicted_yield_t_ha": 5.23,
  "confidence": "High",
  "confidence_score": 0.89,
  "harvest_window": {
    "start": "2024-05-04",
    "end": "2024-05-14",
    "target": "2024-05-09"
  },
  "calendar_event": {
    "title": "Maize Harvest Reminder",
    "date": "2024-05-09"
  },
  "factors": [
    {
      "name": "Nitrogen Status",
      "impact": "positive",
      "value": 85.0,
      "importance": 0.203
    },
    {
      "name": "Soil Condition",
      "impact": "positive",
      "value": 1.0,
      "importance": 0.082
    },
    {
      "name": "Soil Fertility Index",
      "impact": "positive",
      "value": 0.75,
      "importance": 0.035
    }
  ],
  "model_version": "XGBoost_v1.0",
  "prediction_method": "ML"
}
```

## Test Scenarios

### Scenario 1: High Yield Conditions
```json
{
  "variety": "Jet 999",
  "soil_condition": "Good",
  "irrigation_type": "Irrigated",
  "soil_nitrogen_n": 100.0,
  "soil_phosphorus_p": 25.0,
  "soil_potassium_k": 250.0
}
```
**Expected**: 5-6 t/ha, High confidence

### Scenario 2: Medium Yield Conditions
```json
{
  "variety": "GT 709",
  "soil_condition": "Medium",
  "irrigation_type": "Mixed",
  "soil_nitrogen_n": 70.0,
  "soil_phosphorus_p": 15.0,
  "soil_potassium_k": 160.0
}
```
**Expected**: 3.5-4.5 t/ha, Medium confidence

### Scenario 3: Low Yield Conditions
```json
{
  "variety": "Local Variety",
  "soil_condition": "Poor",
  "irrigation_type": "Rainfed",
  "rainfall_condition": "Low",
  "soil_nitrogen_n": 40.0,
  "soil_phosphorus_p": 8.0,
  "soil_potassium_k": 80.0
}
```
**Expected**: 2-3 t/ha, Low confidence

## Health Check Endpoint

Test if the ML model is loaded:

```bash
curl http://localhost:8000/api/yield/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "service": "yield-prediction",
  "ml_model_loaded": true
}
```

## Troubleshooting

### Model Not Loading
If `ml_model_loaded: false`:
1. Check model file exists: `server/src/yieldprediction/best_yield_model_xgb.pkl`
2. Check server logs for error messages
3. Verify ML dependencies installed: `pip install -r requirements_ml.txt`

### Prediction Errors
If predictions fail:
1. Check all required fields are present
2. Verify data types (numbers as floats, dates as strings)
3. Check date format: `YYYY-MM-DD`
4. Ensure planting_date is in the past

### Low Confidence Predictions
If confidence is "Low":
- Add GPS coordinates (gps_lat, gps_lng)
- Provide complete soil data (pH, N, P, K)
- Include weather parameters
- Use known high-yield varieties

## Field Validation

### Required Fields
- district, location, season, planting_date
- land_size_value, land_size_unit
- variety, soil_condition
- irrigation_type, rainfall_condition

### Optional Fields (Recommended)
- gps_lat, gps_lng
- soil_type, soil_ph
- soil_nitrogen_n, soil_phosphorus_p, soil_potassium_k
- avg_temperature_c, max_temperature_c
- avg_humidity_pct, rainfall_30d_mm
- seasonal_rainfall_mm, sunshine_hours

### Valid Values

**Districts**: Anuradhapura, Monaragala, Badulla, Ampara, Matale

**Seasons**: Maha, Yala

**Varieties**: Jet 999, Pacific 808, Commando, GT 709, GT 200, Local Variety

**Soil Condition**: Good, Medium, Poor

**Irrigation Type**: Irrigated, Mixed, Rainfed

**Rainfall Condition**: High, Normal, Low

**Soil Type**: RBE, RYP, LHG, Alluvial, IBL

## Performance Benchmarks

- **Response Time**: < 500ms
- **Accuracy**: MAE 0.51 t/ha, RMSE 0.64 t/ha
- **Confidence**: High (>85%), Medium (70-85%), Low (<70%)
- **Yield Range**: 0-7 t/ha (realistic Sri Lankan conditions)

## Next Steps

After successful testing:
1. ✅ Integrate with mobile app
2. ✅ Add user authentication
3. ✅ Save predictions to database
4. ✅ Generate PDF reports
5. ✅ Send push notifications for harvest reminders
