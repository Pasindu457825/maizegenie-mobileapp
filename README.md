<h1 align="center">🌽 MaizeGenie</h1>

MaizeGenie is an AI-powered, bilingual (Sinhala/English) farmer advisory platform designed to support Sri Lankan maize farmers.  
It integrates **pest identification, disease identification, yield prediction & fertilizer advisory, price forecasting & cultivation timing** into one farmer-friendly mobile/web application.

---

## 🚀 Features

- 🐛 **Pest Identification**  
  Offline AI-based detection of maize pests (e.g., Fall Armyworm) using YOLO models with AR life cycle visualization.  

- 🍂 **Disease Detection**  
  Lightweight CNN models (EfficientNet/ResNet/MobileNet) deployed via TensorFlow Lite for offline disease recognition with safe control steps.  

- 🌱 **Yield Prediction & Fertilizer Advisory**  
  Role-based outputs (Farmer & Agri Officer) with localized soil baselines and CIC fertilizer protocols.  
  Safe Urea/MOP dose recommendations with Sinhala/English TTS and calendar reminders.

- 📈 **Corn Price Forecasting & Cultivation Timing**  
  Short-term price predictions (1–4 weeks) using ARIMA, Prophet, LSTM, and GRU, with traffic-light signals (Sell Now / Stable / Wait).  

- 📱 **Farmer-Friendly Interface**  
  Bilingual UI, simple icons, voice guidance, traffic-light signals, and offline dashboards for rural usability.  

---

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
