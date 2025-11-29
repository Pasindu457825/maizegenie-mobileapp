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
    ADMINPANEL: "AdminPanel",
  },
} as const;

export const API_BASE = "http://localhost:8000"; // Python FastAPI backend server
