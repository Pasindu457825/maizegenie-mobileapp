# 🚀 Soil Data Extraction - Installation & Testing Guide

## ✅ Completed Steps

- [x] Frontend implementation (PDF/Image upload with auto-fill)
- [x] Backend endpoint created (`/api/v1/soil-data/extract`)
- [x] Router registered in main.py
- [x] Expo packages installed (expo-document-picker, expo-image-picker)
- [x] Requirements.txt updated

---

## 📦 Step 1: Install Python Packages

Navigate to the server directory and install the required packages:

```bash
cd server
pip install -r requirements.txt
```

This will install:
- `pdfplumber==0.10.3` - For PDF text extraction
- `pytesseract==0.3.10` - For OCR (Optical Character Recognition)
- `Pillow==10.4.0` - Already installed (image processing)
- `python-multipart==0.0.9` - Already installed (file upload handling)

---

## 🔧 Step 2: Install Tesseract OCR

Tesseract is required for extracting text from scanned PDFs and images.

### **Windows Installation:**

1. Download the installer:
   - Go to: https://github.com/UB-Mannheim/tesseract/wiki
   - Download: `tesseract-ocr-w64-setup-5.3.3.20231005.exe` (or latest version)

2. Run the installer:
   - Install to: `C:\Program Files\Tesseract-OCR`
   - Check "Add to PATH" during installation

3. Verify installation:
   ```bash
   tesseract --version
   ```

4. If PATH not added automatically:
   - Open System Environment Variables
   - Add to PATH: `C:\Program Files\Tesseract-OCR`
   - Restart terminal

### **Alternative: Manual PATH Setup**

If Tesseract is not found, add to your Python code:

```python
# In router.py, add at the top:
import pytesseract
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
```

---

## 🧪 Step 3: Test the Backend Endpoint

### **Start the Backend Server:**

```bash
cd server
uvicorn main:app --reload
```

Server should start at: `http://127.0.0.1:8000`

### **Test Health Check:**

Open browser or use curl:
```bash
curl http://127.0.0.1:8000/api/v1/soil-data/health
```

Expected response:
```json
{
  "status": "healthy",
  "pdfplumber": "installed",
  "pytesseract": "installed",
  "pillow": "installed"
}
```

If you see `"status": "unhealthy"`, check the error message and install missing packages.

---

## 📄 Step 4: Create Test Soil Report

Create a simple text file and save as PDF for testing.

### **Test Report Content:**

```
SOIL TEST REPORT
================

Sample ID: ST-2024-001
Date: January 23, 2024
Location: Anuradhapura

SOIL ANALYSIS RESULTS
---------------------

pH: 6.5
Nitrogen (N): 85 ppm
Phosphorus (P): 18 ppm
Potassium (K): 150 ppm
Soil Fertility Index: 0.72

Recommendations:
- Soil is slightly acidic
- Nitrogen levels are medium
- Phosphorus is adequate
- Potassium is medium
```

Save this as: `test_soil_report.pdf`

---

## 🧪 Step 5: Test with Postman or cURL

### **Using cURL:**

```bash
curl -X POST "http://127.0.0.1:8000/api/v1/soil-data/extract" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test_soil_report.pdf"
```

### **Expected Response:**

```json
{
  "ph": 6.5,
  "nitrogen": 85.0,
  "phosphorus": 18.0,
  "potassium": 150.0,
  "fertility_index": 0.72
}
```

### **Using Postman:**

1. Method: `POST`
2. URL: `http://127.0.0.1:8000/api/v1/soil-data/extract`
3. Body → form-data
4. Key: `file` (type: File)
5. Value: Select your PDF file
6. Send

---

## 📱 Step 6: Test Frontend Integration

### **Start the Mobile App:**

```bash
cd client
npx expo start
```

### **Test Upload Flow:**

1. Navigate to Yield Prediction form
2. Scroll to "Soil Test Data" section
3. Click "Upload Soil Report (PDF/Photo)"
4. Choose "PDF Document" or "Take Photo"
5. Select your test PDF
6. Wait for "Analyzing..." animation
7. Verify soil fields are auto-filled
8. Check success message: "✓ Data Extracted"

---

## 🐛 Troubleshooting

### **Issue 1: "Cannot find module 'expo-document-picker'"**

**Solution:**
```bash
cd client
npx expo install expo-document-picker expo-image-picker
```

### **Issue 2: "Tesseract not found" or "pytesseract.TesseractNotFoundError"**

**Solution:**
- Verify Tesseract is installed: `tesseract --version`
- Check PATH includes: `C:\Program Files\Tesseract-OCR`
- Restart terminal after PATH changes
- Or set path manually in code (see Step 2)

### **Issue 3: "pdfplumber not installed"**

**Solution:**
```bash
cd server
pip install pdfplumber==0.10.3
```

### **Issue 4: "No values extracted" from PDF**

**Possible causes:**
- PDF is image-based (scanned) → OCR should handle this
- Text format doesn't match patterns → Check console logs
- Poor image quality → Try higher resolution

**Debug:**
- Check backend console for extracted text
- Verify patterns in `extract_soil_values()` function
- Add custom patterns if needed

### **Issue 5: "Network Error" or "Failed to fetch"**

**Solution:**
- Verify backend is running: `http://127.0.0.1:8000`
- Check `.env` file has correct API URL
- Ensure CORS is enabled in backend
- Check firewall settings

---

## 📊 Testing Different Report Formats

### **Format 1: Colon Separator**
```
pH: 6.5
Nitrogen: 85 ppm
```

### **Format 2: Equals Sign**
```
pH = 6.5
N = 85 ppm
```

### **Format 3: Table Format**
```
Parameter    Value    Unit
pH           6.5      -
Nitrogen     85       ppm
```

All formats should work with the current regex patterns.

---

## 🎯 Expected Behavior

### **Success Flow:**

1. **Upload** → Button shows "Analyzing..." with loader
2. **Processing** → Backend extracts text (2-5 seconds)
3. **Extraction** → Regex patterns find pH, N, P, K values
4. **Auto-fill** → Fields populate with extracted values
5. **NPK Status** → Automatically calculated (High/Medium/Low)
6. **Success** → Alert: "Soil data has been auto-filled"
7. **Verify** → Farmer reviews and confirms values

### **Error Flow:**

1. **Upload fails** → Alert: "Failed to pick document"
2. **Extraction fails** → Alert: "Failed to extract soil data. Please enter manually."
3. **No values found** → Alert: "Could not extract soil data"

---

## 🔒 Privacy & Security

✅ **Files are NOT stored:**
- PDF/images processed in RAM only
- Discarded after extraction
- No database storage
- No file system storage
- Zero storage costs

✅ **Only extracted values stored:**
- pH, N, P, K numeric values
- Fertility index
- NPK status classifications

---

## 📝 API Endpoints

### **1. Extract Soil Data**
- **URL:** `POST /api/v1/soil-data/extract`
- **Body:** `multipart/form-data` with `file` field
- **Accepts:** PDF or image files
- **Returns:** JSON with extracted soil values

### **2. Health Check**
- **URL:** `GET /api/v1/soil-data/health`
- **Returns:** Service health status and installed packages

---

## 🎨 UI States

| State | Button Text | Icon | Color |
|-------|------------|------|-------|
| Default | "Upload Soil Report (PDF/Photo)" | Upload | Green |
| Analyzing | "Analyzing..." | Loader (animated) | White on Green |
| Success | "✓ Data Extracted" | FileText | White on Green |

---

## 🚀 Next Steps

1. ✅ Install Python packages
2. ✅ Install Tesseract OCR
3. ✅ Test backend endpoint
4. ✅ Test with sample PDF
5. ✅ Test frontend integration
6. ✅ Test with real soil reports
7. ✅ Deploy to production

---

## 📞 Support

If you encounter issues:

1. Check backend console logs for errors
2. Verify all packages are installed
3. Test with simple PDF first
4. Check Tesseract installation
5. Review regex patterns for your report format

---

## 🎉 Success Criteria

- [x] Frontend packages installed
- [x] Backend endpoint created
- [x] Python packages installed
- [ ] Tesseract OCR installed
- [ ] Health check returns "healthy"
- [ ] Test PDF extraction works
- [ ] Frontend auto-fill works
- [ ] Real soil reports extract correctly

Once all criteria are met, the feature is ready for production! 🚀
