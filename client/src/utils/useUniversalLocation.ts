import { useEffect, useState } from "react";
import { Platform } from "react-native";
import * as Location from "expo-location";

type Result = {
  locationName: string;
  latitude: number | null;
  longitude: number | null;

  temperature: number | null;
  weatherCondition: string | null;
  weatherIcon: string | null;

  isLoading: boolean;
  error: string | null;
};

// ------------------------------------------------------
// Sinhala Transliteration Map for Districts
// ------------------------------------------------------
const SI_DISTRICTS: Record<string, string> = {
  Colombo: "කොළඹ",
  Gampaha: "ගම්පහ",
  Kalutara: "කළුතර",
  Kandy: "මහනුවර",
  Matale: "මාතලේ",
  "Nuwara Eliya": "නුවර එලිය",
  Galle: "ගාල්ල",
  Matara: "මාතර",
  Hambantota: "හම්බන්තොට",
  Jaffna: "යාපනය",
  Kilinochchi: "කිලිනොච්චි",
  Mannar: "මන්නාරම",
  Vavuniya: "වවුනියාව",
  Mullaitivu: "මුලතිව්",
  Batticaloa: "බතිකලාව",
  Ampara: "අම්පාර",
  Trincomalee: "ත්‍රිකුණාමලය",
  Kurunegala: "කුරුණෑගල",
  Puttalam: "පුත්තලම",
  Anuradhapura: "අනුරාධපුර",
  Polonnaruwa: "පොලොන්නරුව",
  Badulla: "බදුල්ල",
  Monaragala: "මොණරාගල",
  Ratnapura: "රත්නපුර",
  Kegalle: "කෑගල්ල",
};

export default function useUniversalLocation(lang: "si" | "en"): Result {
  const [locationName, setLocationName] = useState("Loading...");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [temperature, setTemperature] = useState<number | null>(null);
  const [weatherCondition, setWeatherCondition] = useState<string | null>(null);
  const [weatherIcon, setWeatherIcon] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const WEATHER_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;

  // ---------------------------------------------
  // Convert District -> Sinhala (if needed)
  // ---------------------------------------------
  const toSinhalaDistrict = (d: string) => {
    return SI_DISTRICTS[d] || d;
  };

  // ---------------------------------------------
  // Clean district names: remove extra words
  // ---------------------------------------------
  const cleanDistrict = (d: string | null | undefined) => {
    if (!d) return "Unknown";

    return d
      .replace(/District/i, "")
      .replace(/Province/i, "")
      .trim();
  };

  // ---------------------------------------------
  // WEATHER API FETCH
  // ---------------------------------------------
  const fetchWeather = async (lat: number, lon: number) => {
    if (!WEATHER_KEY) return;

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_KEY}`
      );
      const json = await res.json();

      setTemperature(json.main?.temp ?? null);
      if (json.weather?.length > 0) {
        setWeatherCondition(json.weather[0].description);
        setWeatherIcon(json.weather[0].icon);
      }
    } catch (e) {
      console.log("Weather fetch error:", e);
    }
  };

  // ---------------------------------------------
  // Extract Sri Lankan District (Correct Logic)
  // ---------------------------------------------
  const extractDistrict_OSM = (addr: any): string => {
    return (
      addr?.district ||
      addr?.city_district ||
      addr?.county ||
      addr?.municipality ||
      addr?.town ||
      addr?.city ||
      addr?.village ||
      "Unknown"
    );
  };

  // ---------------------------------------------
  // MAIN LOCATION LOADER
  // ---------------------------------------------
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // WEB -------------------------
        if (Platform.OS === "web") {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              const { latitude, longitude } = pos.coords;
              setLatitude(latitude);
              setLongitude(longitude);

              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
              );
              const data = await res.json();

              const raw = extractDistrict_OSM(data.address);
              const clean = cleanDistrict(raw);

              setLocationName(lang === "si" ? toSinhalaDistrict(clean) : clean);

              await fetchWeather(latitude, longitude);
              setIsLoading(false);
            },
            (err) => {
              console.log(err);
              setLocationName("Permission Denied");
              setError("Permission Denied");
              setIsLoading(false);
            }
          );

          return;
        }

        // MOBILE (Expo) -------------------------
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationName("Permission Denied");
          setError("Permission Denied");
          setIsLoading(false);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = loc.coords;

        setLatitude(latitude);
        setLongitude(longitude);

        const geo = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        const g = geo[0];

        const raw =
          g?.district || g?.subregion || g?.city || g?.region || "Unknown";

        const clean = cleanDistrict(raw);
        setLocationName(lang === "si" ? toSinhalaDistrict(clean) : clean);

        await fetchWeather(latitude, longitude);
        setIsLoading(false);
      } catch (e) {
        console.log("Location error:", e);
        setError("Location Error");
        setLocationName("Unknown");
        setIsLoading(false);
      }
    };

    load();
  }, [lang]);

  return {
    locationName,
    latitude,
    longitude,
    temperature,
    weatherCondition,
    weatherIcon,
    isLoading,
    error,
  };
}
