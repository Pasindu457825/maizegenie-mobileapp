export const ROUTES = {
  ROOT: { MAIN: "Main", MODAL: "Modal" },
  TABS: { 
    HOME: "Home", 
    PRICEFORECAST: "PriceForecast",
    PESTIDENTIFIER: "PestIdentifier",
    DISEASEIDENTIFIER: "DiseaseIdentifier",
    FERTILIZERADVISOR: "FertilizerAdvisor",
    PREDICTYIELD: "PredictYield",
    USERPROFILE: "UserProfile",
  },
} as const;

export const API_BASE = "http://192.168.1.50:8000"; // change to your Python server (FastAPI/Django/Flask)
