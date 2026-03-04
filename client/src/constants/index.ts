import Constants from "expo-constants";

export const ROUTES = {
  AUTH: {
    LOGIN: "Login",
    SIGNUP: "Signup",
  },

  ROOT: { 
    MAIN: "Main", 
    MODAL: "Modal" 
  },

  TABS: { 
    HOME: "Home", 
    PRICEFORECAST: "PriceForecast",
    PESTIDENTIFIER: "PestIdentifier",
    DISEASEIDENTIFIER: "DiseaseIdentifier",
    PREDICTYIELD: "PredictYield",
    USERPROFILE: "UserProfile",
    ADMINPANEL: "AdminPanel",
  },
} as const;


// IMPORTANT: Change based on your testing device
// ─────────────────────────────────────────────────────────────
// Web Browser:          http://localhost:8000
// Android Emulator:     http://10.0.2.2:8000
// iOS Simulator:        http://localhost:8000
// Physical Device:      http://YOUR_COMPUTER_IP:8000 (e.g., 192.168.1.5:8000)
// Expo Go App:          http://YOUR_COMPUTER_IP:8000
// ─────────────────────────────────────────────────────────────

// Prefer env-configured API base for all environments.
export const API_BASE =
  Constants.expoConfig?.extra?.API_BASE ||
  process.env.EXPO_PUBLIC_API_BASE ||
  "http://localhost:8000";
