// src/config/api.ts
import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * ✅ Automatically detects your local PC IP for Expo Go.
 * If it fails, fallback to manual IP.
 */
const { manifest2, manifest } = Constants;
let devHost = "192.168.8.181"; // 👈 your PC IP running FastAPI

if (manifest2?.extra?.expoGo?.developer?.host) {
  devHost = manifest2.extra.expoGo.developer.host.split(":")[0];
} else if (manifest?.debuggerHost) {
  devHost = manifest.debuggerHost.split(":")[0];
}

// Android emulator uses 10.0.2.2 to access localhost
const localhost = Platform.select({
  ios: "localhost",
  android: "10.0.2.2",
  default: devHost,
});

export const API_BASE =
  Platform.OS === "android"
    ? `http://${devHost}:8000`
    : `http://${localhost}:8000`;

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
