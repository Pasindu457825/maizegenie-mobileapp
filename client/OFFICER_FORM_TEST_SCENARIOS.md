# Officer Yield Prediction - 5 Test Scenarios

## 📋 **Complete Test Scenarios for ML Prediction Validation**

Use these scenarios to test the officer yield prediction form and verify ML model predictions are correct.

---

## 🌾 **Scenario 1: High Yield - Optimal Conditions**

**Expected Prediction:** 6,800 - 7,200 kg/ha  
**Confidence:** 88-92%  
**Method:** ml_model

**Note:** ML model uses calibration (4.2x) to adjust for training data issues.

### **Step 1: Location & Soil Profile**
```
District: Anuradhapura
Location: Horowpothana
Soil Type: Reddish Brown Earth
Soil Condition: Good
Soil pH: 6.8
Soil Nitrogen (N): 120 mg/kg
Soil Phosphorus (P): 35 mg/kg
Soil Potassium (K): 250 mg/kg
Soil Fertility Index: 0.85
N Status: High
P Status: High
K Status: High
```

### **Step 2: Climate Data**
```
Irrigation Type: Irrigated
Rainfall Condition: High
30-Day Rainfall: 200 mm
Seasonal Rainfall: 1500 mm
Average Temperature: 27°C
Maximum Temperature: 32°C
Average Humidity: 80%
Sunshine Hours: 9 hours
```

### **Step 3: Crop Information**
```
Seed Variety: Pacific 808
Planting Date: 2024-10-15
Season: Maha
Field Size: 2.0 Acres (≈ 0.81 Hectares)
```

### **Step 4: Fertilizer Dates**
```
First Fertilizer Date: 2024-10-25
Second Fertilizer Date: 2024-11-15
```
872
### **Expected R88ul2s:**
- ✅ Predicted Yield: 6,200-6,800 kg/ha
- ✅ Confidence: 92-95%
- ✅ Yield Category: HighN tatus (High), SCondion (Good)
- ✅ Harvest Window: Mid-February to Mid-March 2025
- ✅ Top Impact Factors: Soil Fertility, Irrigation, Variety

---

## 🌾 **Scenario 2: Medium Yield - Average Conditions**

**Expected Prediction:** 4,500 - 5,500 kg/ha  
**Confidence:** 85-90%  
**Method:** ml_model

### **Step 1: Location & Soil Profile**
```
District: Monaragala
Location: Buttala
Soil Type: Red-Yellow Podzolic
Soil Condition: Medium
Soil pH: 6.2
Soil Nitrogen (N): 85 mg/kg
Soil Phosphorus (P): 20 mg/kg
Soil Potassium (K): 180 mg/kg
Soil Fertility Index: 0.65
N Status: Medium
P Status: Medium
K Status: Medium
```

### **Step 2: Climate Data**
```
Irrigation Type: Mixed
Rainfall Condition: Normal
30-Day Rainfall: 120 mm
Seasonal Rainfall: 1000 mm
Average Temperature: 28°C
Maximum Temperature: 34°C
Average Humidity: 70%
Sunshine Hours: 8 hours
```

### **Step 3: Crop Information**
```
Seed Variety: GT 709
Planting Date: 2024-11-01
Season: Maha
Field Size: 1.5 Hectares (≈ 3.71 Acres)
```

### **Step 4: Fertilizer Dates**
```
First Fertilizer Date: 2024-11-10
Second Fertilizer Date: (Leave empty - optional)
```

### **Expected Results:**
- ✅ Predicted Yield: 4,800-5,200 kg/ha
- ✅ Confidence: 87-90%
- ✅ Yield Category: Medium
- ✅ Harvest Window: Late February to Late March 2025
- ✅ Top Impact Factors: Soil Condition, Rainfall, Temperature

---

## 🌾 **Scenario 3: Low Yield - Challenging Conditions**

**Expected Prediction:** 3,000 - 4,000 kg/ha  
**Confidence:** 80-85%  
**Method:** ml_model

### **Step 1: Location & Soil Profile**
```
District: Hambantota
Location: Weerawila
Soil Type: Sandy-Loam
Soil Condition: Poor
Soil pH: 5.8
Soil Nitrogen (N): 45 mg/kg
Soil Phosphorus (P): 12 mg/kg
Soil Potassium (K): 120 mg/kg
Soil Fertility Index: 0.45
N Status: Low
P Status: Low
K Status: Medium
```

### **Step 2: Climate Data**
```
Irrigation Type: Rainfed
Rainfall Condition: Low
30-Day Rainfall: 60 mm
Seasonal Rainfall: 600 mm
Average Temperature: 30°C
Maximum Temperature: 36°C
Average Humidity: 60%
Sunshine Hours: 10 hours
```

### **Step 3: Crop Information**
```
Seed Variety: Local Variety
Planting Date: 2024-05-15
Season: Yala
Field Size: 3.0 Acres (≈ 1.21 Hectares)
```

### **Step 4: Fertilizer Dates**
```
First Fertilizer Date: 2024-05-25
Second Fertilizer Date: 2024-06-20
```

### **Expected Results:**
- ✅ Predicted Yield: 3,200-3,800 kg/ha
- ✅ Confidence: 82-85%
- ✅ Yield Category: Low
- ✅ Harvest Window: Late August to Late September 2024
- ✅ Top Impact Factors: Low Rainfall, Poor Soil, High Temperature

---

## 🌾 **Scenario 4: High Yield - Premium Variety**

**Expected Prediction:** 6,500 - 7,500 kg/ha  
**Confidence:** 92-96%  
**Method:** ml_model

### **Step 1: Location & Soil Profile**
```
District: Polonnaruwa
Location: Hingurakgoda
Soil Type: Alluvial Soil
Soil Condition: Good
Soil pH: 7.0
Soil Nitrogen (N): 140 mg/kg
Soil Phosphorus (P): 40 mg/kg
Soil Potassium (K): 280 mg/kg
Soil Fertility Index: 0.90
N Status: High
P Status: High
K Status: High
```

### **Step 2: Climate Data**
```
Irrigation Type: Irrigated
Rainfall Condition: High
30-Day Rainfall: 180 mm
Seasonal Rainfall: 1400 mm
Average Temperature: 26°C
Maximum Temperature: 31°C
Average Humidity: 82%
Sunshine Hours: 8.5 hours
```

### **Step 3: Crop Information**
```
Seed Variety: Jet 999
Planting Date: 2024-10-20
Season: Maha
Field Size: 2.5 Hectares (≈ 6.18 Acres)
```

### **Step 4: Fertilizer Dates**
```
First Fertilizer Date: 2024-11-01
Second Fertilizer Date: 2024-11-25
```

### **Expected Results:**
- ✅ Predicted Yield: 6,800-7,200 kg/ha
- ✅ Confidence: 93-96%
- ✅ Yield Category: High
- ✅ Harvest Window: Mid-February to Mid-March 2025
- ✅ Top Impact Factors: Premium Variety, Excellent Soil, Optimal Climate

---

## 🌾 **Scenario 5: Medium-High Yield - Good Management**

**Expected Prediction:** 5,500 - 6,500 kg/ha  
**Confidence:** 88-92%  
**Method:** ml_model

### **Step 1: Location & Soil Profile**
```
District: Badulla
Location: Mahiyanganaya
Soil Type: Sandy-Clay-Loam
Soil Condition: Good
Soil pH: 6.5
Soil Nitrogen (N): 100 mg/kg
Soil Phosphorus (P): 28 mg/kg
Soil Potassium (K): 210 mg/kg
Soil Fertility Index: 0.75
N Status: High
P Status: Medium
K Status: High
```

### **Step 2: Climate Data**
```
Irrigation Type: Irrigated
Rainfall Condition: Normal
30-Day Rainfall: 150 mm
Seasonal Rainfall: 1200 mm
Average Temperature: 27°C
Maximum Temperature: 33°C
Average Humidity: 75%
Sunshine Hours: 8.5 hours
```

### **Step 3: Crop Information**
```
Seed Variety: Commando
Planting Date: 2024-11-05
Season: Maha
Field Size: 4.0 Acres (≈ 1.62 Hectares)
```

### **Step 4: Fertilizer Dates**
```
First Fertilizer Date: 2024-11-15
Second Fertilizer Date: 2024-12-10
```

### **Expected Results:**
- ✅ Predicted Yield: 5,800-6,200 kg/ha
- ✅ Confidence: 89-92%
- ✅ Yield Category: Medium-High
- ✅ Harvest Window: Late February to Late March 2025
- ✅ Top Impact Factors: Good Soil Management, Irrigation, Timely Fertilization

---

## 📊 **Validation Checklist**

For each scenario, verify the following:

### **Form Functionality:**
- [ ] All fields accept input correctly
- [ ] Date picker works without crashes
- [ ] Acres/Hectares conversion displays correctly
- [ ] Unit selector toggles properly
- [ ] Validation messages appear for required fields
- [ ] Form submits successfully

### **API Response:**
- [ ] HTTP 200 status code
- [ ] `prediction_method: "ml_model"`
- [ ] `predicted_yield` within expected range
- [ ] `confidence_score` within expected range
- [ ] `yield_category` matches expectation
- [ ] `harvest_window` has valid dates
- [ ] `impact_factors` array has items
- [ ] `recommendations` array has items
- [ ] `fertilizer_schedule` is present
- [ ] `officer_insights` is present

### **Results Display:**
- [ ] Predicted yield displays correctly
- [ ] Confidence score shows as percentage
- [ ] Yield category badge appears
- [ ] Harvest window dates are readable
- [ ] Impact factors render with icons
- [ ] Recommendations are actionable
- [ ] Charts render without errors
- [ ] Officer insights are helpful

---

## 🎯 **Expected Prediction Ranges Summary**

| Scenario | Conditions | Expected Yield (kg/ha) | Confidence | Category |
|----------|-----------|----------------------|------------|----------|
| 1 | Optimal | 6,000 - 7,000 | 90-95% | High |
| 2 | Average | 4,500 - 5,500 | 85-90% | Medium |
| 3 | Challenging | 3,000 - 4,000 | 80-85% | Low |
| 4 | Premium | 6,500 - 7,500 | 92-96% | High |
| 5 | Good Management | 5,500 - 6,500 | 88-92% | Medium-High |

---

## 🔍 **Key Factors to Observe**

### **High Yield Indicators:**
- ✅ Soil Fertility Index > 0.75
- ✅ N/P/K Status: High
- ✅ Irrigation: Irrigated
- ✅ Rainfall: High/Normal
- ✅ Premium Varieties (Jet 999, Pacific 808)
- ✅ Good Soil Condition

### **Low Yield Indicators:**
- ❌ Soil Fertility Index < 0.50
- ❌ N/P/K Status: Low
- ❌ Irrigation: Rainfed
- ❌ Rainfall: Low
- ❌ Local Varieties
- ❌ Poor Soil Condition

### **Impact Factor Priorities:**
1. Soil Fertility Index
2. Irrigation Type
3. Seed Variety
4. Rainfall Condition
5. Soil NPK Status
6. Temperature
7. Humidity
8. Sunshine Hours

---

## 📝 **Testing Notes**

### **Acres to Hectares Conversion:**
- 1 Acre = 0.404686 Hectares
- 1 Hectare = 2.47105 Acres

**Examples:**
- 2.0 Acres ≈ 0.81 Hectares
- 1.5 Hectares ≈ 3.71 Acres
- 3.0 Acres ≈ 1.21 Hectares
- 2.5 Hectares ≈ 6.18 Acres
- 4.0 Acres ≈ 1.62 Hectares

### **Date Format:**
- Always use: `YYYY-MM-DD`
- Example: `2024-10-15`

### **Planting Month Extraction:**
- `2024-10-15` → Month: 10 (October)
- `2024-11-01` → Month: 11 (November)
- `2024-05-15` → Month: 5 (May)

---

## 🎉 **Success Criteria**

**Test is successful if:**
1. ✅ All 5 scenarios submit without errors
2. ✅ Predicted yields are within expected ranges
3. ✅ Confidence scores are reasonable (>80%)
4. ✅ ML model is used (not rule-based)
5. ✅ Harvest windows are calculated correctly
6. ✅ Impact factors are relevant
7. ✅ Recommendations are actionable
8. ✅ No app crashes occur
9. ✅ Acres/Hectares conversion is accurate
10. ✅ Results display properly

**Ready to test!** 🌽📊✨
