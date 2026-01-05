🌽 MaizeGenie

MaizeGenie is an AI-powered, bilingual (Sinhala/English) farmer advisory platform designed to support Sri Lankan maize farmers.  
It integrates **price forecasting, cultivation timing, yield prediction, fertilizer advisory, and pest/disease identification** into one farmer-friendly mobile/web application.  
The system is offline-capable and uses **explainable AI (SHAP/LIME)** to ensure transparency and trust.

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
  - Natural Language Support rule-based fertilizer intelligence engine to to generate advices to farmers.(Safe Urea/MOP dose recommendations with Sinhala/English TTS.)

- 🐛 **Pest Identification & Control System**

   - This component is designed to help maize farmers identify pests early and take the correct control actions at the right time.

   - 📷 **Image-based pest identification**  
     Farmers can capture or upload images of maize pests using a mobile phone to identify common pests such as Fall Armyworm.
   - 🤖 **AI-powered pest detection**  
     The system uses AI models to accurately detect maize pests, even when different pests look similar.
   - 🌱 **Pest lifecycle visualization**  
     Displays clear lifecycle stages (egg, larva, pupa, adult) for each pest to help farmers understand pest behavior.
   - ⏱️ **Stage-based control guidance**  
     Provides control and treatment recommendations based on the current lifecycle stage instead of general advice.
   - 🔊 **Sinhala and English language support**  
     Supports both text and voice explanations in Sinhala and English for better accessibility.
   - 👨‍🌾👨‍💼 **Pest Forum with expert support**  
     Farmers can ask pest-related questions through the Pest Forum. Agriculture Officers can review, approve, and reply with trusted expert advice.
   - ✅ **Reduces wrong pesticide usage**  
     Helps farmers avoid unnecessary or incorrect pesticide application, improving crop safety and yield.

---

- 🔍 **Explainable AI**  
  SHAP and LIME visualizations for factor influence, with simplified reason codes for farmers.  

- 📱 **Farmer-Friendly Interface**  
  Bilingual UI, simple icons, voice guidance, traffic-light signals, and offline dashboards for rural usability.  

---

## 🛠️ Tech Stack

- **Frontend**: React Native  
- **Backend**: FastAPI (Python)
- **Machine Learning**: TensorFlow, scikit-learn, Prophet, XGBoost, YOLOV8, OpenCV  
- **Database**: Supabase
- **Explainability**: SHAP, LIME  
- **Other Services**: Google Calendar API, gTTS/Coqui TTS (Sinhala/English voice) 

---

## 📊 System Modules

1. Pest Identification & AR Life Cycle  
2. Disease Detection & Solution Advisory 
3. Yield Prediction & Fertilizer Advisory  
4. Corn Price Forecasting & Cultivation Timing  

---

## 🧑‍🤝‍🧑 Target Users

- **Farmers** – receive simple, bilingual, actionable advice (voice/text + calendar reminders).  
- **Agri Officers/Experts** – advanced dashboards, factor analysis, and baseline adjustment tools.  

---

<img width="3780" height="1890" alt="SYSTEM DIAGRAM (1)" src="https://github.com/user-attachments/assets/ebd0d5e7-f3a7-4e03-a16c-14ed22c9b828" />

## 📍 Pilot Districts

- Monaragala  
- Anuradhapura  
- Ampara
- Dabulla

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
