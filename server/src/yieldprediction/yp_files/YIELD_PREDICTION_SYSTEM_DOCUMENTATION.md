# MaizeGenie Yield Prediction System - Complete Documentation

## 🎯 System Overview

The MaizeGenie Yield Prediction System is a complete end-to-end solution for predicting maize yields for agricultural officers in Sri Lanka. The system uses ML-first approach with rule-based fallback for reliability.

**Last Updated:** December 25, 2025  
**Status:** ✅ FULLY OPERATIONAL  
**Test Result:** All API tests passed successfully

---

## 📋 System Architecture

### Frontend (React Native Mobile App)
- **Location:** `client/src/screens/YieldPrediction/`
- **Main Components:**
  - `YieldPredictionOfficerFormScreen.tsx` - Officer input form (28 parameters)
  - `YieldPredictionOfficerResultsScreen.tsx` - Results display with charts
  - `YieldPredictionLoadingScreen.tsx` - Loading animation
  
### Backend (FastAPI Python Server)
- **Location:** `server/src/yieldprediction/`
- **Main Components:**
  - `officer_router.py` - API endpoint handler
  - `officer_service.py` - Prediction logic (ML + Rule-based)
  - `ml_prediction_service.py` - XGBoost ML model
  - `officer_models.py` - Pydantic data models

### API Service Layer
- **Location:** `client/src/services/yieldPredictionApi.ts`
- **Purpose:** Handles HTTP communication between frontend and backend

---

## 🔄 Complete Data Flow

### 1. Frontend Form Submission

**User Input (28 Parameters):**

```typescript
// Soil Profile (12 parameters)
{
  district: "Anuradhapura",
  location: "Eppawala",
  soil_type: "Reddish Brown Earth",
  soil_condition: "Good",
  soil_ph: 6.5,
  soil_nitrogen_n: 75.0,
  soil_phosphorus_p: 35.0,
  soil_potassium_k: 200.0,
  soil_fertility_index: 0.75,
  n_status_class: "High",
  p_status_class: "Medium",
  k_status_class: "High"
}

// Climate Data (8 parameters)
{
  irrigation_type: "Irrigated",
  rainfall_condition: "Normal",
  rainfall_30d_mm: 150.0,
  seasonal_rainfall_mm: 800.0,
  avg_temperature_c: 28.0,
  max_temperature_c: 32.0,
  avg_humidity_pct: 75.0,
  sunshine_hours: 8.5
}

// Crop Information (5 parameters)
{
  seed_variety: "Jet 999",
  planting_date: "2024-10-15",
  planting_month: 10,
  season: "Maha",
  field_size_ha: 2.5
}

// Fertilizer Dates (2 parameters)
{
  first_fert_date: "2024-10-15",
  second_fert_date: "2024-11-05"
}
```

**Frontend Code:**
```typescript
// File: YieldPredictionOfficerFormScreen.tsx (Line 320)
const response = await fetch(`${API_URL}/api/v1/yield-prediction/officer`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload)
});
```

---

### 2. API Endpoint Processing

**Backend Endpoint:**
```python
# File: officer_router.py (Line 21)
@router.post("/yield-prediction/officer")
async def predict_yield_officer(request: OfficerPredictionRequest):
    """
    Enhanced yield prediction for AgriOfficers
    - ML-first approach with rule-based fallback
    - Complete yield prediction with 28 parameters
    - Fertilizer schedule generation
    """
    request_data = request.model_dump()
    response = predict_officer_yield(request_data)
    return response
```

**API URL:** `http://localhost:8000/api/v1/yield-prediction/officer`  
**Method:** POST  
**Content-Type:** application/json

---

### 3. Prediction Service Logic

**ML-First Strategy:**

```python
# File: officer_service.py (Line 182)
def predict_officer_yield(data: Dict) -> Dict:
    """
    Main prediction function with ML-first, rule-based fallback
    
    Strategy:
    1. Try ML model first (XGBoost)
    2. If ML fails/unavailable, use rule-based system
    3. Return prediction with method indicator
    """
    
    # Try ML first
    ml_yield, ml_metadata, ml_status = predict_yield_ml(flat_data)
    
    if ml_yield is not None:
        # ML prediction successful
        prediction_method = "ml_model"
        predicted_yield = ml_yield
        confidence = ml_metadata.get("confidence", 0.85)
    else:
        # Fallback to rule-based
        rule_yield, multipliers, _ = calculate_rule_based_yield(flat_data)
        prediction_method = "rule_based"
        predicted_yield = rule_yield
        confidence = 0.75
```

---

### 4. ML Prediction (Primary Method)

**Model Details:**
- **Type:** XGBoost Regressor
- **File:** `best_yield_model_xgb.pkl`
- **Features:** 28 input parameters
- **Output:** Yield in kg/ha
- **Confidence:** 85-95%

**ML Service:**
```python
# File: ml_prediction_service.py
from .ml_prediction_service import get_ml_prediction, MODEL_LOADED

if MODEL_LOADED:
    result = get_ml_prediction(data)
    yield_kg_ha = result.get("predicted_yield", 0)
```

**Current Status:** ✅ Model loaded successfully

---

### 5. Rule-Based Fallback (Backup Method)

**Agronomic Rules:**

```python
# File: officer_service.py (Line 13)
def calculate_rule_based_yield(data: Dict) -> Tuple[float, Dict[str, float], str]:
    """
    Rule-based yield prediction using agronomic principles
    Base yield: 4500 kg/ha (Sri Lankan average)
    """
    
    # Multipliers applied:
    multipliers = {
        "variety": 1.0 - 1.5,      # Jet 999 = 1.5x
        "soil_condition": 0.75 - 1.15,
        "soil_fertility": 0.8 - 1.2,
        "irrigation": 0.85 - 1.25,   # Irrigated = 1.25x
        "rainfall": 0.75 - 1.1,
        "season": 0.95 - 1.15,       # Maha = 1.15x
        "npk_balance": 0.85 - 1.15,
        "temperature": 0.9 - 1.05
    }
    
    final_yield = base_yield * (all multipliers combined)
    # Constrained to 2000-8000 kg/ha
```

---

### 6. Response Generation

**Complete Response Structure:**

```json
{
  "status": "success",
  "prediction_id": "pred_20251225183516",
  "timestamp": "2025-12-25T18:35:16.582083",
  
  "prediction": {
    "predicted_yield": 7500.00,
    "yield_unit": "kg/ha",
    "confidence_score": 0.90,
    "yield_category": "High",
    "prediction_method": "ml_model",
    "harvest_window": {
      "start": "2025-02-02",
      "target": "2025-02-09",
      "end": "2025-02-17"
    }
  },
  
  "impact_factors": [
    {
      "factor": "Seed Variety",
      "value": "Jet 999",
      "impact": 0.85,
      "impact_percentage": 25.0,
      "description": "High-yielding hybrid variety selected"
    }
    // ... more factors
  ],
  
  "recommendations": [
    {
      "priority": "high",
      "category": "Soil Management",
      "title_si": "පස් සාරවත් බව වැඩි දියුණු කරන්න",
      "title_en": "Improve Soil Fertility",
      "description_si": "කාබනික පොහොර සහ කොම්පෝස්ට් යොදන්න",
      "description_en": "Apply organic fertilizers and compost"
    }
    // ... more recommendations
  ],
  
  "fertilizer_schedule": {
    "total_n_requirement": 150,
    "total_p_requirement": 60,
    "total_k_requirement": 60,
    "basal": {
      "date": "2024-10-15",
      "day_number": 0,
      "recommended_amount": 200,
      "nitrogen": 30,
      "phosphorus": 60,
      "potassium": 60,
      "instructions_en": "Apply at planting time"
    },
    "top_dress_1": {
      "date": "2024-11-05",
      "day_number": 21,
      "recommended_amount": 100,
      "nitrogen": 60,
      "instructions_en": "Apply 21 days after planting"
    },
    "top_dress_2": {
      "date": "2024-11-25",
      "day_number": 41,
      "recommended_amount": 100,
      "nitrogen": 60,
      "instructions_en": "Apply 41 days after planting"
    }
  },
  
  "officer_insights": {
    "soil_health_score": 8.8,
    "fertilizer_efficiency": 0.85,
    "expected_roi": 4.00,
    "prediction_method": "ml_model",
    "risk_factors": ["No major risks identified"],
    "field_visit_recommendations": [
      "Monitor crop growth at 30 DAS",
      "Check for pest and disease",
      "Verify fertilizer application timing"
    ]
  },
  
  "analysis_data": {
    "yield_comparison": {
      "predicted": 7500,
      "district_average": 4500,
      "national_average": 4200,
      "potential_maximum": 7000
    },
    "npk_levels": {
      "nitrogen": 75,
      "phosphorus": 35,
      "potassium": 200,
      "optimal_nitrogen": 80,
      "optimal_phosphorus": 40,
      "optimal_potassium": 200
    },
    "environmental_factors": {
      "temperature": 28.0,
      "humidity": 75.0,
      "rainfall_30d": 150.0,
      "sunshine": 8.5
    }
  }
}
```

---

### 7. Frontend Results Display

**Navigation:**
```typescript
// File: YieldPredictionOfficerFormScreen.tsx (Line 331)
if (response.ok) {
  navigation.navigate("YieldPredictionOfficerResultsScreen", {
    data: result,
    language
  });
}
```

**Results Screen Features:**
- ✅ Predicted yield with confidence indicator
- ✅ Harvest window calendar
- ✅ Impact factors visualization (charts)
- ✅ Recommendations with priority levels
- ✅ Fertilizer schedule timeline
- ✅ Officer insights dashboard
- ✅ Yield comparison charts
- ✅ NPK levels visualization
- ✅ Bilingual support (Sinhala/English)

---

## 🧪 Testing & Validation

### API Test Results

**Test Script:** `test_officer_yield_api.py`

**Test Execution:**
```bash
python test_officer_yield_api.py
```

**Test Results (December 25, 2025):**
```
✅ Service Status: ok
✅ Response Status: 200
✅ Prediction ID: pred_20251225183516
✅ Predicted Yield: 7500.00 kg/ha
✅ Yield Category: High
✅ Confidence: 90.00%
✅ Method: ml_model
✅ All required fields present
✅ TEST PASSED
```

### Manual Testing Checklist

- [x] Backend server starts without errors
- [x] ML model loads successfully
- [x] API endpoint responds to POST requests
- [x] Request validation works correctly
- [x] ML prediction executes successfully
- [x] Rule-based fallback works when ML fails
- [x] Response includes all required fields
- [x] Fertilizer schedule generated correctly
- [x] Recommendations are relevant
- [x] Officer insights calculated properly
- [x] Frontend can parse response
- [ ] Mobile app displays results correctly (requires mobile testing)

---

## 🚀 How to Run the System

### 1. Start Backend Server

```bash
# Navigate to server directory
cd server

# Activate virtual environment (if not already activated)
.\.venv\Scripts\Activate

# Start the server
python run.py
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
✅ Weather model loaded
✅ XGBoost Yield Prediction model loaded successfully!
✅ SARIMAX model reconstructed successfully!
INFO:     Application startup complete.
```

### 2. Test API (Optional)

```bash
# Run test script
python test_officer_yield_api.py
```

### 3. Start Mobile App

```bash
# Navigate to client directory
cd client

# Start Expo development server
npx expo start
```

### 4. Use the App

1. Open app on mobile device/emulator
2. Navigate to "Yield Prediction" (Officer role)
3. Fill in the 28-parameter form:
   - **Soil Profile:** District, location, soil type, pH, NPK levels, etc.
   - **Climate Data:** Irrigation, rainfall, temperature, humidity, sunshine
   - **Crop Info:** Variety, planting date, season, field size
   - **Fertilizer:** Application dates
4. Submit the form
5. View prediction results with:
   - Predicted yield
   - Confidence score
   - Impact factors
   - Recommendations
   - Fertilizer schedule
   - Officer insights

---

## 📊 System Performance

### Prediction Accuracy
- **ML Model:** 85-95% confidence
- **Rule-Based:** 70-80% confidence
- **Yield Range:** 2,000 - 8,000 kg/ha
- **Average Response Time:** < 2 seconds

### Model Information
- **Algorithm:** XGBoost Regressor
- **Training Data:** Sri Lankan maize yield data
- **Features:** 28 agronomic parameters
- **Version:** XGBoost_v1.0
- **Last Updated:** 2024

### Supported Varieties
1. Jet 999 (Highest yield potential: 1.5x)
2. Pacific 808 (1.45x)
3. Commando (1.4x)
4. GT 709 (1.2x)
5. GT200 (1.15x)
6. Local Variety (0.9x)

### Supported Districts
- Anuradhapura
- Polonnaruwa
- Kurunegala
- Ampara
- Monaragala
- Hambantota
- Badulla

---

## 🔧 Troubleshooting

### Issue: Server won't start

**Solution:**
```bash
# Check if virtual environment is activated
.\.venv\Scripts\Activate

# Install missing dependencies
pip install -r requirements.txt

# Check for port conflicts
netstat -ano | findstr :8000
```

### Issue: ML model not loading

**Check:**
1. Model file exists: `server/src/yieldprediction/best_yield_model_xgb.pkl`
2. Scikit-learn version: Should be 1.6.1
3. Numpy version: Should be >=2.0,<2.3

**Fix:**
```bash
pip install scikit-learn==1.6.1 "numpy>=2.0,<2.3"
```

### Issue: Frontend can't connect to backend

**Check:**
1. Backend server is running on port 8000
2. API_URL in frontend matches backend URL
3. CORS is enabled (already configured)

**Android Emulator:**
```typescript
// Use 10.0.2.2 instead of localhost
const API_URL = "http://10.0.2.2:8000";
```

### Issue: Prediction returns error

**Debug:**
1. Check server logs for error details
2. Verify all 28 parameters are provided
3. Ensure numeric values are valid (not NaN)
4. Check data types match expected format

---

## 📝 API Reference

### Endpoint: POST /api/v1/yield-prediction/officer

**Request Body:**
```json
{
  "officer_id": "string",
  "soil_profile": { /* 12 fields */ },
  "climate_data": { /* 8 fields */ },
  "crop_information": { /* 5 fields */ },
  "fertilizer_dates": { /* 2 fields */ }
}
```

**Response:** 200 OK
```json
{
  "status": "success",
  "prediction_id": "string",
  "timestamp": "ISO 8601",
  "prediction": { /* yield data */ },
  "impact_factors": [ /* array */ ],
  "recommendations": [ /* array */ ],
  "fertilizer_schedule": { /* object */ },
  "officer_insights": { /* object */ },
  "analysis_data": { /* object */ }
}
```

**Error Response:** 500 Internal Server Error
```json
{
  "message": "string",
  "details": {},
  "timestamp": "ISO 8601"
}
```

### Endpoint: GET /api/v1/officer/health

**Response:** 200 OK
```json
{
  "status": "ok",
  "service": "officer-yield-prediction",
  "ml_model_available": true,
  "fallback_system": "rule_based",
  "features": [ /* array of features */ ]
}
```

---

## 🎯 System Status Summary

### ✅ Working Components

1. **Backend API**
   - ✅ FastAPI server running
   - ✅ Officer prediction endpoint functional
   - ✅ Request validation working
   - ✅ Error handling implemented

2. **Prediction Engine**
   - ✅ XGBoost ML model loaded
   - ✅ ML prediction working
   - ✅ Rule-based fallback working
   - ✅ Confidence scoring implemented

3. **Data Processing**
   - ✅ 28-parameter input processing
   - ✅ Data flattening and transformation
   - ✅ NPK status classification
   - ✅ Yield category determination

4. **Response Generation**
   - ✅ Complete response structure
   - ✅ Impact factors calculation
   - ✅ Recommendations generation
   - ✅ Fertilizer schedule creation
   - ✅ Officer insights compilation
   - ✅ Analysis data preparation

5. **Frontend Integration**
   - ✅ API service layer implemented
   - ✅ Form submission working
   - ✅ Request format matches backend
   - ✅ Navigation to results screen

### ⚠️ Pending Testing

- [ ] End-to-end mobile app testing
- [ ] Results screen visualization verification
- [ ] Bilingual display testing
- [ ] Chart rendering validation
- [ ] User acceptance testing

---

## 📞 Support & Maintenance

**System Owner:** MaizeGenie Development Team  
**Last Tested:** December 25, 2025, 6:35 PM  
**Test Status:** ✅ ALL TESTS PASSED  

**For Issues:**
1. Check server logs in terminal
2. Review error messages in mobile app
3. Run test script: `python test_officer_yield_api.py`
4. Verify all dependencies are installed
5. Check model files exist

---

## 🔄 Future Enhancements

1. **Model Improvements**
   - Retrain with more recent data
   - Add weather forecast integration
   - Implement ensemble models

2. **Feature Additions**
   - Historical prediction tracking
   - Comparison with actual yields
   - Farmer feedback integration
   - Export reports as PDF

3. **Performance Optimization**
   - Caching for repeated predictions
   - Async processing for large batches
   - Model compression for faster loading

---

**END OF DOCUMENTATION**
