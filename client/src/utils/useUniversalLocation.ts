import { useEffect, useState } from "react";
import { Platform } from "react-native";
// @ts-ignore
import * as ExpoLocation from "expo-location";

type Result = {
  locationName: string;
  temperature: number | null;
  weatherCondition: string | null;
  weatherIcon: string | null;
  isLoading: boolean;
  error: string | null;
};

export default function useUniversalLocation(language: "si" | "en"): Result {
  const [locationName, setLocationName] = useState("Loading...");
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
          setWeatherCondition(json.weather[0].description); // e.g "light rain"
          setWeatherIcon(json.weather[0].icon); // e.g "09n"
        }
      } catch (e) {
        console.log("Weather fetch error", e);
      }
    };

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (Platform.OS === "web") {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              const { latitude, longitude } = pos.coords;

              // Reverse geocode
              try {
                const res = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                );
                const json = await res.json();

                const district =
                  json.address?.county ||
                  json.address?.city ||
                  json.address?.state ||
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

        // MOBILE
        const { status } =
          await ExpoLocation.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setLocationName("Permission Denied");
          setIsLoading(false);
          return;
        }

        const loc = await ExpoLocation.getCurrentPositionAsync({});
        const { latitude, longitude } = loc.coords;

        const geo = await ExpoLocation.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        const district =
          geo[0]?.district || geo[0]?.city || geo[0]?.region || "Unknown";

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
    temperature,
    weatherCondition,
    weatherIcon,
    isLoading,
    error,
  };
}
