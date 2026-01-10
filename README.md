<h1 align="center">🌽 MaizeGenie</h1>

MaizeGenie is an AI-powered, bilingual (Sinhala/English) farmer advisory platform designed to support Sri Lankan maize farmers.  
It integrates **pest identification, disease identification, yield prediction & fertilizer advisory, price forecasting & cultivation timing** into one farmer-friendly mobile/web application.

---
## 🚀 Features

- 📈 **Corn Price Forecasting & Cultivation Timing**  
   - Generates short-term maize price predictions (1–4 weeks) using RF model.
   - Integrates district/GPS-based context with live daily and hourly weather data to ensure location-specific decision support.
   - Identifies the best selling week using forecasted prices combined with historical seasonal profit patterns from previous years.
   - Recommends delaying or starting cultivation (e.g., by 1–2 weeks) when historical data shows higher profitability in upcoming periods.
   - Performs profit analysis by combining predicted price, expected yield, and cultivation costs to support sell, store, or wait decisions.
   - Displays clear traffic-light signals (Sell Now / Store / Sell Later / Wait) for easy and quick farmer understanding.
   - Provides trend charts, confidence levels, and simple reasoning to improve trust in predictions and recommendations.
   - Integrates daily and hourly weather risk analysis to warn farmers about rain, humidity, heat stress, and harvest timing risks.
   - Enables officer-verified cultivation and selling advice, allowing agricultural officers to review, approve, or adjust system recommendations.
   - Allows farmers to receive direct guidance and feedback from agricultural officers within the application.
   - Delivers official agricultural news, policy updates, and announcements published by officers through the platform.
   - Sends timely notifications for best selling weeks, recommended planting delays, weather risks, officer replies, and new announcements.
   - Connects with Weather Forecast and Cultivation Advisor through a smart entry/loading screen that acts as a single gateway to decision support.
   - Supports Sinhala and English languages with a farmer-friendly mobile UI designed for field-level use. 

- 🍂 **Disease Identification & Solution Advisory**  
  - apture or upload maize leaf images for disease detection.  
  - ML-powered disease identification using YOLOv8-based object detection, optimized for efficient and accurate maize leaf disease recognition.
  - Displays disease name, severity level (Low / Medium / High), and confidence score.  
  - Provides disease symptoms, causes, prevention methods, and treatment recommendations based on disease severity with safe control practices. 
  - Supports Sinhala and English languages.  

- 🌱 **Yield Prediction & Fertilizer Advisory**
  - Role-based outputs (Farmer & Agri Officer) of yield prediction using localized collected dataset with including vertiety, soil parameters, climeate, and cultivation practices parameters. (Calendar reminder feature to harvest period and fetilization periods.)
  - SHAP and LIME visualizations to explain factor influence on yield predictions, with downloadable analytical reports for Agricultural Officers.
  - Rule-based fertilizer intelligence engine to to generate advices to farmers.(Safe Urea/MOP dose recommendations with Sinhala/English TTS.)
  - Role-Based fertilizer advisory request system (Approve/Pending/Completed status)

- 🐛 **Pest Identification & Control System**

   - This component is designed to help maize farmers identify pests early and take the correct control actions at the right time.

   -  **Image-based pest identification**  
     Farmers can capture or upload images of maize pests using a mobile phone to identify common pests such as Fall Armyworm.
   -  **AI-powered pest detection**  
     The system uses AI models to accurately detect maize pests, even when different pests look similar.
   -  **Pest lifecycle visualization**  
     Displays clear lifecycle stages (egg, larva, pupa, adult) for each pest to help farmers understand pest behavior.
   -  **Stage-based control guidance**  
     Provides control and treatment recommendations based on the current lifecycle stage instead of general advice.
   -  **Sinhala and English language support**  
     Supports both text and voice explanations in Sinhala and English for better accessibility.
   -  **Pest Forum with expert support**  
     Farmers can ask pest-related questions through the Pest Forum. Agriculture Officers can review, approve, and reply with trusted expert advice.
   -  **Reduces wrong pesticide usage**  
     Helps farmers avoid unnecessary or incorrect pesticide application, improving crop safety and yield.

## 🛠️ Tech Stack

- **Frontend**: React Native (Expo), React Navigation, NativeWind (Tailwind CSS)  
- **Backend**: FastAPI (Python), Uvicorn  
- **Machine Learning**: scikit-learn, XGBoost, NumPy, Pandas, Statsmodels  
- **Database**: Supabase  
- **UI Components**: React Native Paper, Lucide Icons, React Native Chart Kit  
- **Other Services**: Expo Location, Expo Calendar, Expo Speech (TTS), Roboflow Inference SDK  

---

## 📦 Dependencies & Installation

### **Client (Mobile App)**

#### Core Framework
- **Expo SDK 54** - React Native development platform
- **React 19.1.0** - UI library
- **React Native 0.81.5** - Mobile framework
- **TypeScript 5.9.2** - Type safety

#### Navigation
- `@react-navigation/native` (^7.1.18) - Navigation container
- `@react-navigation/native-stack` (^7.3.28) - Stack navigator
- `@react-navigation/bottom-tabs` (^7.4.9) - Bottom tab navigator
- `@react-navigation/stack` (^7.4.9) - Stack navigator with gestures
- `react-native-screens` (~4.16.0) - Native screen optimization
- `react-native-safe-area-context` (~5.6.0) - Safe area handling

#### UI & Styling
- `react-native-paper` (^5.14.5) - Material Design components
- `nativewind` (^4.2.1) - Tailwind CSS for React Native
- `tailwindcss` (^3.4.17) - Utility-first CSS framework
- `lucide-react-native` (^0.545.0) - Icon library
- `expo-linear-gradient` (^15.0.8) - Gradient components

#### Data Visualization
- `react-native-chart-kit` (^6.12.0) - Chart components
- `react-native-svg` (^15.15.1) - SVG rendering

#### Device Features
- `expo-location` (~19.0.7) - GPS location services
- `expo-image-picker` (~17.0.8) - Camera & gallery access
- `expo-calendar` (~15.0.7) - Calendar integration
- `expo-notifications` (~0.32.15) - Push notifications
- `expo-speech` (~14.0.8) - Text-to-speech (Sinhala/English)
- `expo-av` (^16.0.8) - Audio/video playback
- `expo-file-system` (~19.0.21) - File system access
- `expo-sharing` (~14.0.8) - Share functionality

#### State Management & Storage
- `@react-native-async-storage/async-storage` (2.2.0) - Local storage
- `react-native-async-storage` (^0.0.1) - Async storage utilities

#### Backend Integration
- `@supabase/supabase-js` (^2.86.2) - Supabase client
- `axios` (^1.12.2) - HTTP client
- `react-native-url-polyfill` (^3.0.0) - URL polyfill for React Native

#### Forms & Inputs
- `@react-native-picker/picker` (2.11.1) - Picker component
- `@react-native-community/datetimepicker` (8.4.4) - Date/time picker
- `react-native-image-picker` (^8.2.1) - Image selection

#### Animations & Gestures
- `react-native-reanimated` (~4.1.1) - Animation library
- `react-native-gesture-handler` (~2.28.0) - Gesture handling
- `react-native-worklets-core` (^1.6.2) - Worklets for animations

#### Other
- `expo-constants` (^18.0.11) - App constants
- `react-native-webview` (13.15.0) - WebView component
- `dotenv` (^17.2.3) - Environment variables

#### Installation
```bash
cd client
npm install
```

---

### **Server (Backend API)**

#### Core Framework
- **FastAPI** (0.112.2) - Modern Python web framework
- **Uvicorn[standard]** (0.30.6) - ASGI server
- **Pydantic** (2.9.2) - Data validation
- **Pydantic-settings** (2.6.1) - Settings management

#### Machine Learning & Data Science
- **scikit-learn** (1.6.1) - ML algorithms (yield prediction, classification)
- **XGBoost** (>=2.1.0) - Gradient boosting (yield prediction)
- **NumPy** (>=2.0, <2.3) - Numerical computing
- **Pandas** (>=2.3.0) - Data manipulation
- **Statsmodels** (>=0.14.6) - Statistical models (ARIMA for price forecasting)

#### Computer Vision & AI
- **Inference-SDK** (0.9.0) - Roboflow inference (pest/disease detection)
- **Pillow** (10.4.0) - Image processing

#### File Processing
- **python-multipart** (0.0.9) - Multipart form data handling
- **ReportLab** (>=4.0.0) - PDF generation (reports)

#### Installation
```bash
cd server
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

---

## 🚀 Quick Start

### Client Setup
```bash
cd client
npm install
npx expo start
```

### Server Setup
```bash
cd server
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## 📊 System Modules

1. Pest Identification & AR Life Cycle  
2. Disease Detection  
3. Yield Prediction & Fertilizer Advisory  
4. Corn Price Forecasting & Cultivation Timing  

---

## 🧑‍🤝‍🧑 Target Users

- **Farmers** – receive simple, bilingual, actionable advice (voice/text + calendar reminders).  
- **Agri Officers/Experts** – advanced dashboards, factor analysis, and baseline adjustment tools.  

---

## 📍 Pilot Districts

- Monaragala  
- Anuradhapura  
- Ampara  

---

## 📖 References

The project builds on Sri Lankan agricultural research (HARTI, DOA, CIC Agri Businesses) and global studies in ML for agriculture.  
A full IEEE reference list is included in the proposal report.

---

## 📜 License

This project is developed as part of the **SLIIT B.Sc. (Hons) IT Final Year Research Project**.  
License details will be finalized upon project completion.
