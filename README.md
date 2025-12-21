# 🌽 MaizeGenie

MaizeGenie is an AI-powered, bilingual (Sinhala/English) farmer advisory platform designed to support Sri Lankan maize farmers.  
It integrates **price forecasting, cultivation timing, yield prediction, fertilizer advisory, and pest/disease identification** into one farmer-friendly mobile/web application.  
The system is offline-capable and uses **explainable AI (SHAP/LIME)** to ensure transparency and trust.

---

## 🚀 Features

- 📈 **Corn Price Forecasting & Cultivation Timing**  
  Short-term price predictions (1–4 weeks) using SARIMAX/ARIMA + Prophet + ML ensemble (with planned LSTM/GRU extension), combined with district/GPS + live weather context, best-week detection, profit analysis  and notifications. Outputs include traffic-light signals and recommendations (Sell Now / Store / Sell Later / Wait), with bilingual (සිංහල/English) UI, trend charts, and a smart entry/loading gateway linked to Weather Forecast + Cultivation Advisor. 

- 🌱 **Yield Prediction & Fertilizer Advisory**
  - Role-based outputs (Farmer & Agri Officer) of yield prediction using localized collected dataset with including vertiety, soil parameters, climeate, and cultivation practices parameters. (Calendar reminder feature to harvest period and fetilization periods.)
  - SHAP and LIME visualizations to explain factor influence on yield predictions, with downloadable analytical reports for Agricultural Officers.
  - Natural Language Support rule-based fertilizer intelligence engine to to generate advices to farmers.(Safe Urea/MOP dose recommendations with Sinhala/English TTS.)

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

- **Frontend**: React Native  
- **Backend**: Flask / FastAPI (Python)
- **Machine Learning**: TensorFlow, scikit-learn, Prophet, XGBoost, YOLO  
- **Database**: Superbase
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
- Thissamaharama 

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
