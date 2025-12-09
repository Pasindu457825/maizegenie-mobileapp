import Constants from "expo-constants";

export const API_BASE =
  Constants.expoConfig?.extra?.API_BASE ||
  process.env.EXPO_PUBLIC_API_BASE ||
  "http://localhost:8000";

console.log("🌐 API_BASE =>", API_BASE);

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