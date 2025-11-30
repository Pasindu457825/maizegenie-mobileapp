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

export default function useUniversalLocation(language: "si" | "en"): Result {
  const [locationName, setLocationName] = useState("Loading...");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [temperature, setTemperature] = useState<number | null>(null);
  const [weatherCondition, setWeatherCondition] = useState<string | null>(null);
  const [weatherIcon, setWeatherIcon] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const WEATHER_API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;

    const fetchWeather = async (lat: number, lon: number) => {
      if (!WEATHER_API_KEY) return;

      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`
        );

        const json = await res.json();

        if (json?.main?.temp != null) {
          setTemperature(json.main.temp);
        }

        if (json?.weather?.length > 0) {
          setWeatherCondition(json.weather[0].description);
          setWeatherIcon(json.weather[0].icon);
        }
      } catch (e) {
        console.log("Weather fetch error", e);
      }
    };

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // --------------------
        // WEB PLATFORM
        // --------------------
        if (Platform.OS === "web") {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              const { latitude, longitude } = pos.coords;
              setLatitude(latitude);
              setLongitude(longitude);

              try {
                const res = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                );
                const json = await res.json();

                const district =
                  json.address?.county ||
                  json.address?.city ||
                  json.address?.town ||
                  json.address?.suburb ||
                  "Unknown";

                setLocationName(district);
              } catch {
                setLocationName("Unknown");
              }

              await fetchWeather(latitude, longitude);
              setIsLoading(false);
            },
            () => {
              setLocationName("Permission Denied");
              setError("Permission denied");
              setIsLoading(false);
            }
          );

          return;
        }

        // --------------------
        // MOBILE PLATFORM
        // --------------------
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setLocationName("Permission Denied");
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

        const district =
          g?.district || g?.subregion || g?.city || g?.region || "Unknown";

        setLocationName(district);

        await fetchWeather(latitude, longitude);

        setIsLoading(false);
      } catch (e) {
        console.log("Location error", e);
        setError("Location error");
        setLocationName("Unknown");
        setIsLoading(false);
      }
    };

    load();
  }, [language]);

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
