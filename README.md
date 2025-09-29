# 🌽 MaizeGenie

MaizeGenie is an AI-powered, bilingual (Sinhala/English) farmer advisory platform designed to support Sri Lankan maize farmers.  
It integrates **price forecasting, cultivation timing, yield prediction, fertilizer advisory, and pest/disease identification** into one farmer-friendly mobile/web application.  
The system is offline-capable and uses **explainable AI (SHAP/LIME)** to ensure transparency and trust.

---

## 🚀 Features

- 📈 **Corn Price Forecasting & Cultivation Timing**  
  Short-term price predictions (1–4 weeks) using ARIMA, Prophet, LSTM, and GRU, with traffic-light signals (Sell Now / Stable / Wait).  

- 🌱 **Yield Prediction & Fertilizer Advisory**  
  Role-based outputs (Farmer & Agri Officer) with localized soil baselines and CIC fertilizer protocols.  
  Safe Urea/MOP dose recommendations with Sinhala/English TTS and calendar reminders.  

- 🐛 **Pest Identification**  
  Offline AI-based detection of maize pests (e.g., Fall Armyworm) using YOLO models with AR life cycle visualization.  

- 🍂 **Disease Detection**  
  Lightweight CNN models (EfficientNet/ResNet/MobileNet) deployed via TensorFlow Lite for offline disease recognition with safe control steps.  

- 🔍 **Explainable AI**  
  SHAP and LIME visualizations for factor influence, with simplified reason codes for farmers.  

- 📱 **Farmer-Friendly Interface**  
  Bilingual UI, simple icons, voice guidance, traffic-light signals, and offline dashboards for rural usability.  

---

## 🛠️ Tech Stack

- **Frontend**: React Native / Flutter (mobile), PWA (web)  
- **Backend**: Flask / FastAPI (Python), Node.js (optional APIs)  
- **Machine Learning**: TensorFlow, scikit-learn, Prophet, XGBoost, YOLO  
- **Database**: Firebase / MongoDB  
- **Explainability**: SHAP, LIME  
- **Other Services**: Google Calendar API, gTTS/Coqui TTS (Sinhala/English voice)  

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

## 📅 Roadmap

- **Phase 1 (MVP)**: Price forecasting + cultivation timing with offline reminder support.  
- **Phase 2**: Full integration of pest/disease detection and yield/fertilizer advisory.  
- **Phase 3**: Commercialization (freemium → institutional licensing → scaling).  

---

## 📖 References

The project builds on Sri Lankan agricultural research (HARTI, DOA, CIC Agri Businesses) and global studies in ML for agriculture.  
A full IEEE reference list is included in the proposal report.

---

## 📜 License

This project is developed as part of the **SLIIT B.Sc. (Hons) IT Final Year Research Project**.  
License details will be finalized upon project completion.
