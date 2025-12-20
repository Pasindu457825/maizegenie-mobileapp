// client/src/screens/PriceForecast/WeatherForecastScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Dimensions,
} from "react-native";
import {
  Cloud,
  CloudRain,
  Sun,
  TrendingUp,
  TrendingDown,
  Calendar,
  MapPin,
  ArrowLeft,
  RefreshCw,
  Droplets,
  Wind,
  AlertCircle,
  CloudDrizzle,
  Sprout,
  AlertTriangle,
  CheckCircle,
  Info,
  Volume2,
  VolumeX,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import * as Speech from "expo-speech";
import useUniversalLocation from "../../utils/useUniversalLocation";
import { LineChart, BarChart } from "react-native-chart-kit";
import { useFocusEffect } from "@react-navigation/native";
import { Platform } from "react-native";
import { useLanguage } from "../../context/LanguageContext";
import { useNotifications } from "../../context/NotificationContext";
import { Bell } from "lucide-react-native";

const getHourlyIcon = (mm: number) => {
  if (mm >= 3) return <AlertTriangle size={18} color="#dc2626" />; // danger
  if (mm >= 1) return <CloudRain size={18} color="#2563eb" />; // rain
  return <Sun size={18} color="#f59e0b" />; // good
};

// ✨ FIXED: Get language type from context
type Language = "sinhala" | "english";

const getApiUrl = () => {
  if (Platform.OS === "android") {
    return process.env.EXPO_PUBLIC_API_BASE;
  } else if (Platform.OS === "ios") {
    return "http://localhost:8000";
  } else {
    return "http://localhost:8000";
  }
};

const API_URL = getApiUrl();

const getTranslatedLocation = (rawName: string | null, lang: Language) => {
  if (!rawName) return lang === "sinhala" ? "ස්ථානය" : "Location";

  if (lang === "english") return rawName;

  let enName = rawName.trim();

  enName = enName
    .replace(/District/i, "")
    .replace(/Province/i, "")
    .trim();

  const districtMap: Record<string, string> = {
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

  if (districtMap[enName]) return districtMap[enName];

  return rawName;
};

interface WeatherDay {
  day: number;
  date: string;
  temperature: number;
  temperature_min: number;
  temperature_max: number;
  humidity_mean?: number;
  cloud_cover?: number;
  uv_index?: number;
  rain_probability?: number;
  rain_mm?: number;
  windspeed?: number;
  wind_dir?: number;
}

interface WeatherPrediction {
  success: boolean;
  city: string;
  predictions: WeatherDay[];
  last_actual_temp: number;
  advice: Array<{ si: string; en: string }>;
}

interface FarmingAdvice {
  type: "good" | "warning" | "alert";
  title: string;
  description: string;
  icon: React.ReactNode;
}

const DEFAULT_LAT = 6.9271;
const DEFAULT_LON = 79.8612;
const screenWidth = Dimensions.get("window").width;

const WeatherForecastScreen = () => {
  const navigation = useNavigation();
  const { language } = useLanguage();
  const { unreadCount } = useNotifications();
  const { sendNotification } = useNotifications();
  const [sentRainAlert, setSentRainAlert] = useState(false);

  const locationHook: any = useUniversalLocation("si");
  const {
    locationName,
    temperature,
    latitude,
    longitude,
  }: {
    locationName?: string;
    temperature?: number;
    latitude?: number;
    longitude?: number;
  } = locationHook || {};

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherPrediction | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  // 🕒 HOURLY RAIN DATA (NEW)
  const [hourlyData, setHourlyData] = useState<
    { time: string; precipitation: number }[]
  >([]);

  // ✨ UPDATED: Generate 7-day weather summary text - ENGLISH ONLY
  const generateWeatherSummary = (
    predictions: WeatherDay[],
    lang: Language
  ): string => {
    if (!predictions || predictions.length === 0) return "";

    const weatherSummaryContent = {
      intro: "Here is the weather forecast for the next 7 days.",
      today: "Today",
      tomorrow: "Tomorrow",
      nextDays: "For the next 5 days",
      temp: "temperature",
      rain: "rainfall",
      mm: "millimeters",
      celsius: "celsius",
      good: "good farming conditions",
      caution: "caution advised",
      risky: "risky conditions",
      average: "Average",
      total: "total",
      farmingDays: "farming days",
    };

    const content = weatherSummaryContent;
    let summary = content.intro + " ";

    // Today's forecast
    const today = predictions[0];
    if (today) {
      summary += `${content.today}: ${Math.round(
        today.temperature_min
      )}-${Math.round(today.temperature_max)} ${content.celsius}, ${
        content.rain
      } ${(today.rain_mm || 0).toFixed(1)} ${content.mm}. `;

      if ((today.rain_mm ?? 0) > 25) {
        summary += content.risky + ". ";
      } else if ((today.rain_mm ?? 0) >= 5 && today.temperature >= 25) {
        summary += content.good + ". ";
      } else {
        summary += content.caution + ". ";
      }
    }

    // Tomorrow's forecast
    const tomorrow = predictions[1];
    if (tomorrow) {
      summary += `${content.tomorrow}: ${Math.round(
        tomorrow.temperature_min
      )}-${Math.round(tomorrow.temperature_max)} ${content.celsius}, ${
        content.rain
      } ${(tomorrow.rain_mm || 0).toFixed(1)} ${content.mm}. `;
    }

    // Next 5 days summary
    summary += content.nextDays + ": ";
    const next5Days = predictions.slice(2, 7);
    if (next5Days.length > 0) {
      const avgTemp =
        next5Days.reduce((sum, d) => sum + d.temperature, 0) / next5Days.length;
      const totalRain = next5Days.reduce((sum, d) => sum + (d.rain_mm || 0), 0);
      const goodDays = next5Days.filter(
        (d) =>
          (d.rain_mm ?? 0) >= 5 &&
          (d.rain_mm ?? 0) <= 25 &&
          d.temperature >= 25 &&
          d.temperature <= 33
      ).length;

      summary += `${content.average} ${content.temp} ${Math.round(avgTemp)} ${
        content.celsius
      }, ${content.total} ${content.rain} ${totalRain.toFixed(1)} ${
        content.mm
      }. ${goodDays} ${content.farmingDays}.`;
    }

    return summary;
  };

  // ✨ FIXED: Speak weather forecast - ENGLISH ONLY
  const speakWeatherForecast = async (predictions: WeatherDay[]) => {
    try {
      // Stop any ongoing speech first
      await Speech.stop();
      setIsSpeaking(true);

      const summary = generateWeatherSummary(predictions, language);

      if (!summary) {
        console.log("No summary to speak");
        setIsSpeaking(false);
        return;
      }

      const speechOptions: any = {
        pitch: 1,
        rate: 0.85,
        language: "en",
        onDone: () => {
          console.log("Speech finished");
          setIsSpeaking(false);
        },
        onError: (error: any) => {
          console.log("Speech error:", error);
          setIsSpeaking(false);
        },
      };

      console.log("Speaking with language: English");
      console.log("Summary:", summary.substring(0, 50) + "...");

      await Speech.speak(summary, speechOptions);
    } catch (err) {
      console.log("Speech error:", err);
      setIsSpeaking(false);
    }
  };

  // ✨ FIXED: Stop speech properly
  const stopSpeech = async () => {
    try {
      await Speech.stop();
      setIsSpeaking(false);
    } catch (err) {
      console.log("Stop speech error:", err);
      setIsSpeaking(false);
    }
  };

  // ✨ NEW: Stop speech when leaving the page
  useFocusEffect(
    useCallback(() => {
      console.log("Weather screen focused...");

      if (latitude == null || longitude == null) {
        console.log("GPS not ready → skipping fetch");
        return;
      }

      setLoading(true);
      setWeatherData(null);

      fetchWeatherData(latitude, longitude);

      // ✨ NEW: Return cleanup function to stop speech on blur
      return () => {
        console.log("Weather screen blurred - stopping speech");
        Speech.stop().catch((err) => console.log("Stop speech error:", err));
        setIsSpeaking(false);
      };
    }, [latitude, longitude])
  );

  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

  const content = {
    sinhala: {
      title: "කාලගුණ පුරෝකථනය",
      subtitle: "බඩ ඉරිඟු වගාව සඳහා",
      loading: "දත්ත ගෙනෙමින්...",
      error: "දත්ත ලබා ගැනීමට නොහැකි විය",
      retry: "නැවත උත්සාහ කරන්න",

      farmingAdvice: "වගා උපදෙස්",
      goodDays: "හොඳ දින",
      concernDays: "අවධානය යොමු කළ යුතු",

      tempTrend: "උෂ්ණත්ව ප්‍රවණතාව",
      rainTrend: "වර්ෂාපතන ප්‍රවණතාව",
      weeklyOverview: "සතිපතා දළ විශ්ලේෂණය",

      humidity: "ආර්ද්‍රතාව",
      rainfall: "වර්ෂාව",
      wind: "සුළං",
      uvIndex: "UV මට්ටම",

      goodForPlanting: "රෝපණයට සුදුසුයි",
      goodForHarvesting: "අස්වනු නෙළීමට සුදුසුයි",
      heavyRainWarning: "අධික වර්ෂාව - අවධානය",
      dryCondition: "වියළි තත්ත්වය - වාරිමාර්ග කරන්න",
      idealConditions: "වගාවට සුදුසු තත්ත්වයක්",
      highTemp: "අධික උෂ්ණත්වය",
      moderateConditions: "සාමාන්‍ය තත්ත්වය",

      dayLabel: "දින",
      today: "අද",

      goodDay: "වගාවට හොඳයි",
      riskyDay: "අවදානම් දිනක්",
      dryDay: "වියළි - වාරිමාර්ග කරන්න",
      goodWeek: "🌱 මෙම සතිය වගා කිරීමට හොඳයි",
      riskyWeek: "⛔ මෙම සතිය අවදානම් – වැඩි වර්ෂාව/උෂ්ණත්වය",
      mixedWeek: "⚠️ සමහර දින හොඳයි – සමහර දින අවධානයෙන්",

      heavyRain: "🌧️ අධික වර්ෂාව",
      excellentTemp: "🌤️ ඉතා හොඳ උෂ්ණත්වය",
      lowHumidity: "💧 ආර්ද්‍රතාව අඩුයි",
      dontPlantToday: "– අද වගා කරන්න එපා",
      goodForFarming: "– වගාවට සුදුසුයි",
      irrigateNeeded: "– වාරිමාර්ග කරන්න",

      speakForecast: "🔊 කාලගුණය කියවන්න",
      stopSpeaking: "⏹️ නවතන්න",
    },
    english: {
      title: "Weather Forecast",
      subtitle: "For Corn Farming",
      loading: "Loading weather...",
      error: "Failed to load weather",
      retry: "Retry",

      farmingAdvice: "Farming Advice",
      goodDays: "Favorable Days",
      concernDays: "Days Requiring Attention",

      tempTrend: "Temperature Trend",
      rainTrend: "Rainfall Pattern",
      weeklyOverview: "Weekly Overview",

      humidity: "Humidity",
      rainfall: "Rainfall",
      wind: "Wind",
      uvIndex: "UV Index",

      goodForPlanting: "Good for Planting",
      goodForHarvesting: "Good for Harvesting",
      heavyRainWarning: "Heavy Rain - Caution",
      dryCondition: "Dry Conditions - Irrigate",
      idealConditions: "Ideal Farming Conditions",
      highTemp: "High Temperature",
      moderateConditions: "Moderate Conditions",

      dayLabel: "Day",
      today: "Today",

      goodDay: "Good for farming",
      riskyDay: "Risky day",
      dryDay: "Dry - irrigate",
      goodWeek: "🌱 Great week for farming",
      riskyWeek: "⛔ Risky week – high rainfall/temperature",
      mixedWeek: "⚠️ Mixed week – some good days, some caution needed",

      heavyRain: "🌧️ Heavy rainfall",
      excellentTemp: "🌤️ Excellent temperature",
      lowHumidity: "💧 Low humidity",
      dontPlantToday: "– Don't plant today",
      goodForFarming: "– Good for farming",
      irrigateNeeded: "– Irrigation needed",

      speakForecast: "🔊 Speak Forecast",
      stopSpeaking: "⏹️ Stop",
    },
  };

  const getContent = () => {
    return content[language];
  };

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const monthsEn = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthsSi = [
      "ජන",
      "පෙබ",
      "මාර්",
      "අප්‍රි",
      "මැයි",
      "ජූනි",
      "ජූලි",
      "අගෝ",
      "සැප්",
      "ඔක්",
      "නොවැ",
      "දැසැ",
    ];
    const months = language === "sinhala" ? monthsSi : monthsEn;
    return `${months[(m || 1) - 1]} ${d || 1}`;
  };

  const getDayName = (dateStr: string, short = false) => {
    const date = new Date(dateStr + "T00:00:00");
    const si = short
      ? ["ඉරි", "සඳු", "අඟ", "බදා", "බ්‍රහ", "සිකු", "සෙන"]
      : [
          "ඉරිදා",
          "සඳුදා",
          "අඟහරුවා",
          "බදාදා",
          "බ්‍රහස්පතින්දා",
          "සිකුරාදා",
          "සෙනසුරාදා",
        ];
    const en = short
      ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      : [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
    return language === "sinhala" ? si[date.getDay()] : en[date.getDay()];
  };

  const getFirstRainHour = () => {
    if (!hourlyData || hourlyData.length === 0) return null;

    const index = hourlyData.findIndex((h) => h.precipitation >= 1);
    if (index === -1) return null;

    return {
      index,
      time: new Date(hourlyData[index].time),
    };
  };

  // 🚜 HOURLY ACTION BANNER (ADD THIS)
  const HourlyActionBanner = () => {
    if (!hourlyData || hourlyData.length === 0) return null;

    const rainInfo = getFirstRainHour();

    // No rain at all
    if (!rainInfo) {
      return (
        <View
          style={{
            marginHorizontal: 20,
            marginBottom: 12,
            backgroundColor: "#F0FDF4",
            borderRadius: 16,
            padding: 14,
            borderLeftWidth: 6,
            borderLeftColor: "#10B981",
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "800", color: "#065F46" }}>
            {language === "sinhala"
              ? "🟢 ඉදිරි පැය කිහිපය වැසි නොමැත – වගා වැඩ සඳහා සුදුසුයි"
              : "🟢 No rain expected in the next few hours – suitable for farming"}
          </Text>
        </View>
      );
    }

    const { index, time } = rainInfo;

    const hourLabel = time.toLocaleString("en-US", {
      hour: "numeric",
      hour12: true,
      timeZone: "Asia/Colombo",
    });

    // ⏱️ Decision levels
    let bg = "#FFFBEB";
    let border = "#f59e0b";
    let text =
      language === "sinhala"
        ? `⚠️ ${hourLabel} පමණ වැසි ඇතිවිය හැක – එයට පෙර වැඩ සූදානම් කරන්න`
        : `⚠️ Rain expected around ${hourLabel} – prepare work before that`;

    if (index <= 2) {
      // Rain very soon (1–2 hours)
      bg = "#FEF2F2";
      border = "#ef4444";
      text =
        language === "sinhala"
          ? `⛔ ${hourLabel}ට පෙර වැසි පටන්ගන්න පුළුවන් – දැන්ම අස්වැන්න ආවරණය කරන්න`
          : `⛔ Rain may start before ${hourLabel} – protect harvest immediately`;
    }

    return (
      <View
        style={{
          marginHorizontal: 20,
          marginBottom: 12,
          backgroundColor: bg,
          borderRadius: 16,
          padding: 14,
          borderLeftWidth: 6,
          borderLeftColor: border,
          elevation: 2,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: "800",
            color: "#1F2937",
          }}
        >
          {text}
        </Text>
      </View>
    );
  };

  // 🌾 FARMING ADVICE LOGIC FOR CORN
  const getFarmingAdvice = (predictions: WeatherDay[]): FarmingAdvice[] => {
    const advice: FarmingAdvice[] = [];
    predictions.forEach((day, idx) => {
      const rain = day.rain_mm || 0;
      const temp = day.temperature;
      const humidity = day.humidity_mean || 0;

      if (rain > 25) {
        advice.push({
          type: "alert",
          title: `${getDayName(day.date, true)} - ${
            content[language].heavyRainWarning
          }`,
          description: `${rain.toFixed(1)}mm ${
            language === "sinhala" ? "වර්ෂාව අපේක්ෂිතයි" : "rainfall expected"
          }`,
          icon: <CloudRain size={20} color="#ef4444" />,
        });
      } else if (rain >= 5 && rain <= 25 && temp >= 25 && temp <= 33) {
        advice.push({
          type: "good",
          title: `${getDayName(day.date, true)} - ${
            content[language].idealConditions
          }`,
          description: `${rain.toFixed(1)}mm ${
            language === "sinhala" ? "වර්ෂාව, උෂ්ණත්වය" : "rain, temp"
          } ${Math.round(temp)}°C`,
          icon: <CheckCircle size={20} color="#10B981" />,
        });
      } else if (rain < 2 && humidity < 50) {
        advice.push({
          type: "warning",
          title: `${getDayName(day.date, true)} - ${
            content[language].dryCondition
          }`,
          description: `${
            language === "sinhala" ? "ආර්ද්‍රතාව" : "Humidity"
          } ${Math.round(humidity)}%`,
          icon: <AlertTriangle size={20} color="#f59e0b" />,
        });
      } else if (temp > 33) {
        advice.push({
          type: "warning",
          title: `${getDayName(day.date, true)} - ${
            content[language].highTemp
          }`,
          description: `${Math.round(temp)}°C - ${
            language === "sinhala"
              ? "අමතර වාරිමාර්ග අවශ්‍යයි"
              : "Extra irrigation needed"
          }`,
          icon: <Sun size={20} color="#f59e0b" />,
        });
      }
    });
    return advice;
  };

  // 🕒 HOURLY RISK HELPER
  const getHourlyRisk = (mm: number): "red" | "yellow" | "green" => {
    if (mm >= 3) return "red";
    if (mm >= 1) return "yellow";
    return "green";
  };

  const getHourlyLabel = (mm: number) => {
    if (mm >= 3) return language === "sinhala" ? "අවදානම්" : "Risky";
    if (mm >= 1) return language === "sinhala" ? "වැසි" : "Rain";
    return language === "sinhala" ? "හොඳයි" : "Good";
  };

  // 🕒 HOURLY RAIN STRIP (DOT GRAPH)
  const HourlyRainStrip = () => {
    if (!hourlyData || hourlyData.length === 0) return null;

    return (
      <View
        style={{
          marginHorizontal: 20,
          marginTop: 10,
          marginBottom: 10,
          backgroundColor: "#fff",
          borderRadius: 16,
          padding: 14,
          elevation: 3,
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: "800", color: "#047857" }}>
          {language === "sinhala"
            ? "⏱️ ඉදිරි පැය – වගාවට කොහොමද?"
            : "⏱️ Next few hours – farming suitability"}
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 14,
          }}
        >
          {hourlyData.slice(0, 12).map((h, idx) => {
            const risk = getHourlyRisk(h.precipitation);

            const bgColor =
              risk === "red"
                ? "#FEE2E2"
                : risk === "yellow"
                ? "#FEF9C3"
                : "#DCFCE7";

            // ⏰ ACTUAL TIME (Asia/Colombo)
            const hourLabel = new Date(h.time).toLocaleString("en-US", {
              hour: "numeric",
              hour12: true,
              timeZone: "Asia/Colombo",
            });

            return (
              <View key={idx} style={{ alignItems: "center", width: 44 }}>
                {/* ICON CIRCLE */}
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: bgColor,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  {getHourlyIcon(h.precipitation)}
                </View>

                {/* TIME */}
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  {hourLabel}
                </Text>

                {/* STATUS */}
                <Text
                  style={{
                    fontSize: 9,
                    color: "#6B7280",
                    marginTop: 2,
                  }}
                >
                  {getHourlyLabel(h.precipitation)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const getTrafficColor = (day: WeatherDay): "red" | "yellow" | "green" => {
    const rain = day.rain_mm || 0;
    const temp = day.temperature;
    const humidity = day.humidity_mean || 0;

    if (rain > 25 || temp > 33) return "red";
    if ((rain < 2 && humidity < 50) || (rain >= 2 && rain < 5)) return "yellow";
    if (rain >= 5 && rain <= 25 && temp >= 25 && temp <= 33) return "green";
    return "yellow";
  };

  const getDailySummaryText = (day: WeatherDay): string => {
    const rain = day.rain_mm || 0;
    const temp = day.temperature;
    const humidity = day.humidity_mean || 0;

    if (rain > 25) {
      return `${content[language].heavyRain} ${content[language].dontPlantToday}`;
    } else if (rain >= 5 && rain <= 25 && temp >= 25 && temp <= 33) {
      return `${content[language].excellentTemp} ${content[language].goodForFarming}`;
    } else if (rain < 2 && humidity < 50) {
      return `${content[language].lowHumidity} ${content[language].irrigateNeeded}`;
    } else if (temp > 33) {
      return `${content[language].highTemp} ${content[language].irrigateNeeded}`;
    }
    return content[language].moderateConditions;
  };

  const TrafficDot = ({ color }: { color: "red" | "yellow" | "green" }) => {
    const bg =
      color === "red" ? "#ef4444" : color === "yellow" ? "#facc15" : "#22c55e";
    return (
      <View
        style={{
          width: 16,
          height: 16,
          borderRadius: 16,
          backgroundColor: bg,
        }}
      />
    );
  };

  const getWeatherIcon = (day: WeatherDay) => {
    const rain = day.rain_mm || 0;
    const temp = day.temperature;
    const cloud = day.cloud_cover || 0;

    if (rain > 25) return <CloudRain size={32} color="#ef4444" />;
    if (rain >= 5 && rain <= 25)
      return <CloudDrizzle size={32} color="#0ea5e9" />;
    if (cloud > 70) return <Cloud size={32} color="#9CA3AF" />;
    if (temp > 30) return <Sun size={32} color="#f59e0b" />;
    return <Sun size={32} color="#fbbf24" />;
  };

  const getGlowColor = (color: "red" | "yellow" | "green") => {
    const glowMap = {
      red: "rgba(239, 68, 68, 0.3)",
      yellow: "rgba(250, 204, 21, 0.3)",
      green: "rgba(34, 197, 94, 0.3)",
    };
    return glowMap[color];
  };

  const EnhancedTrafficDot = ({
    color,
  }: {
    color: "red" | "yellow" | "green";
  }) => {
    const bg =
      color === "red" ? "#ef4444" : color === "yellow" ? "#facc15" : "#22c55e";
    const glowBg = getGlowColor(color);

    return (
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 24,
          backgroundColor: glowBg,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: 16,
            height: 16,
            borderRadius: 16,
            backgroundColor: bg,
            shadowColor: bg,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 4,
            elevation: 8,
          }}
        />
      </View>
    );
  };

  const BeautifulDayCardHeader = ({
    day,
    trafficColor,
  }: {
    day: WeatherDay;
    trafficColor: "red" | "yellow" | "green";
  }) => {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor:
            trafficColor === "red"
              ? "#FECACA"
              : trafficColor === "yellow"
              ? "#FEF08A"
              : "#BBFDE0",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.dayName}>{getDayName(day.date)}</Text>
          <Text style={styles.dateTxt}>{formatDate(day.date)}</Text>
        </View>

        {getWeatherIcon(day)}

        <View style={{ marginLeft: 12, alignItems: "center", gap: 4 }}>
          <EnhancedTrafficDot color={trafficColor} />
        </View>
      </View>
    );
  };

  const BeautifulMetricsGrid = ({ day }: { day: WeatherDay }) => {
    const metrics = [
      {
        icon: <Sun size={16} color="#f59e0b" />,
        label: `${Math.round(day.temperature_min)}°-${Math.round(
          day.temperature_max
        )}°C`,
        value: `Temp`,
      },
      {
        icon: <CloudRain size={16} color="#0ea5e9" />,
        label: `${day.rain_mm?.toFixed(1) || 0} mm`,
        value: `Rain`,
      },
      {
        icon: <Droplets size={16} color="#06b6d4" />,
        label: `${Math.round(day.humidity_mean || 0)}%`,
        value: `Humidity`,
      },
      {
        icon: <Wind size={16} color="#047857" />,
        label: `${Math.round(day.windspeed || 0)} km/h`,
        value: `Wind`,
      },
    ];

    return (
      <View style={styles.metricsGrid}>
        {metrics.map((metric, idx) => (
          <View key={idx} style={styles.metricBox}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: "#F3F4F6",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {metric.icon}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: "#9CA3AF" }}>
                {metric.value}
              </Text>
              <Text style={styles.metricLabel}>{metric.label}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const AnimatedWeeklyStrip = ({
    predictions,
  }: {
    predictions: WeatherDay[];
  }) => {
    return (
      <View
        style={{
          marginHorizontal: 20,
          marginTop: 12,
          marginBottom: 16,
          backgroundColor: "#fff",
          borderRadius: 14,
          padding: 16,
          elevation: 3,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: "700",
            color: "#047857",
            marginBottom: 12,
          }}
        >
          📅 Weekly Forecast
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-around",
            gap: 6,
          }}
        >
          {predictions.slice(0, 7).map((day, idx) => (
            <View key={idx} style={{ alignItems: "center" }}>
              <EnhancedTrafficDot color={getTrafficColor(day)} />
              <Text
                style={{
                  fontSize: 10,
                  color: "#6B7280",
                  marginTop: 6,
                  fontWeight: "600",
                }}
              >
                {getDayName(day.date, true).substring(0, 2)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const EnhancedFarmActionCard = ({
    predictions,
  }: {
    predictions: WeatherDay[];
  }) => {
    const goodDaysCount = predictions.filter(
      (d) =>
        (d.rain_mm ?? 0) >= 5 &&
        (d.rain_mm ?? 0) <= 25 &&
        d.temperature >= 25 &&
        d.temperature <= 33
    ).length;
    const riskyDaysCount = predictions.filter(
      (d) => (d.rain_mm ?? 0) > 25 || d.temperature > 33
    ).length;

    const currentContent = getContent();

    let title = "";
    let emoji = "🌱";
    let desc = "";
    let bgColor = "#F0FDF4";
    let borderColor = "#10B981";
    let textColor = "#047857";

    if (goodDaysCount >= 4) {
      title = currentContent.goodWeek;
      emoji = "🌱";
      desc =
        language === "sinhala"
          ? `${goodDaysCount} හොඳ දින - සිටින්න!`
          : `${goodDaysCount} good days - Perfect time to farm!`;
      bgColor = "#F0FDF4";
      borderColor = "#10B981";
      textColor = "#047857";
    } else if (riskyDaysCount >= 4) {
      title = currentContent.riskyWeek;
      emoji = "⛔";
      desc =
        language === "sinhala"
          ? `${riskyDaysCount} අවදානම් දින - අවධානයෙන්!`
          : `${riskyDaysCount} risky days - Be careful!`;
      bgColor = "#FEF2F2";
      borderColor = "#ef4444";
      textColor = "#dc2626";
    } else {
      title = currentContent.mixedWeek;
      emoji = "⚠️";
      desc =
        language === "sinhala"
          ? "දිනපතා පුරෝකථනය පරීක්ෂා කරන්න"
          : "Check daily forecasts";
      bgColor = "#FFFBEB";
      borderColor = "#f59e0b";
      textColor = "#d97706";
    }

    return (
      <View
        style={{
          marginHorizontal: 20,
          marginBottom: 16,
          backgroundColor: bgColor,
          borderRadius: 16,
          padding: 16,
          borderWidth: 2.5,
          borderColor,
          elevation: 4,
        }}
      >
        <Text style={{ fontSize: 24, marginBottom: 8 }}>{emoji}</Text>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "800",
            color: textColor,
            marginBottom: 6,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: textColor,
            opacity: 0.7,
            lineHeight: 19,
          }}
        >
          {desc}
        </Text>
      </View>
    );
  };

  // ✨ FIXED: Speech control button - uses language from context
  const SpeechControlButton = () => {
    const currentContent = getContent();

    return (
      <TouchableOpacity
        style={[styles.speechBtn, isSpeaking && styles.speechBtnActive]}
        onPress={() => {
          if (isSpeaking) {
            stopSpeech();
          } else if (weatherData && weatherData.predictions) {
            speakWeatherForecast(weatherData.predictions);
          }
        }}
      >
        {isSpeaking ? (
          <Text style={[styles.speechBtnText, { color: "#ef4444" }]}>
            {currentContent.stopSpeaking}
          </Text>
        ) : (
          <Text style={[styles.speechBtnText, { color: "#10B981" }]}>
            {currentContent.speakForecast}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  // ✨ FIXED: Enhanced header uses language from context
  const EnhancedHeader = () => {
    const currentContent = getContent();
    const { unreadCount } = useNotifications();

    return (
      <View style={styles.header}>
        {/* Back button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ArrowLeft size={22} color="#047857" />
        </TouchableOpacity>

        {/* Title */}
        <View style={styles.headerCenter}>
          <View style={styles.headerTitleRow}>
            <Sprout size={22} color="#047857" />
            <Text style={styles.headerTitle}>{currentContent.title}</Text>
          </View>
          <Text style={styles.headerSubtitle}>{currentContent.subtitle}</Text>
        </View>

        {/* 🔔 Notification Icon */}
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => navigation.navigate("Notifications" as never)}
        >
          <Bell size={20} color="#10B981" />

          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const EnhancedCurrentWeatherCard = () => {
    const currentContent = getContent();
    return (
      <Animated.View style={[styles.currentWeatherCard, { opacity: fadeAnim }]}>
        <View style={styles.locationRow}>
          <MapPin size={18} color="#047857" />
          <Text style={styles.locationText}>
            {getTranslatedLocation(locationName ?? null, language)}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
            paddingVertical: 8,
            marginTop: 12,
          }}
        >
          <View
            style={{
              width: 70,
              height: 70,
              borderRadius: 20,
              backgroundColor: "#FEF3C7",
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#f59e0b",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <Sun size={48} color="#f59e0b" />
          </View>
          <View>
            <Text style={styles.currentTemp}>
              {Math.round(temperature ?? 26)}°C
            </Text>
            <Text style={styles.currentLabel}>
              {language === "sinhala"
                ? "දැන් තියෙන උෂ්ණත්වය"
                : "Current Temperature"}
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  const fetchWeatherData = async (
    lat: number,
    lon: number,
    isRefresh = false
  ) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_min,temperature_2m_max,relative_humidity_2m_mean,cloudcover_mean,uv_index_max,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant&forecast_days=8&timezone=Asia/Colombo`;

      const res = await fetch(url);
      const data = await res.json();
      const d = data.daily;

      if (!d || !Array.isArray(d.time) || d.time.length === 0) {
        throw new Error("Invalid weather data");
      }

      const predictions: WeatherDay[] = d.time
        .slice(1)
        .map((date: string, idx: number) => {
          const realIndex = idx + 1;
          const tMin = d.temperature_2m_min[realIndex];
          const tMax = d.temperature_2m_max[realIndex];
          const tAvg = (tMin + tMax) / 2;

          return {
            day: realIndex,
            date,
            temperature_min: tMin,
            temperature_max: tMax,
            temperature: tAvg,
            humidity_mean: d.relative_humidity_2m_mean[realIndex],
            cloud_cover: d.cloudcover_mean[realIndex],
            uv_index: d.uv_index_max[realIndex],
            rain_probability: d.precipitation_probability_max[realIndex],
            rain_mm: d.precipitation_sum[realIndex],
            windspeed: d.wind_speed_10m_max[realIndex],
            wind_dir: d.wind_direction_10m_dominant[realIndex],
          };
        });

      setWeatherData({
        success: true,
        city: locationName || "Sri Lanka",
        predictions,
        last_actual_temp: temperature ?? predictions[0]?.temperature ?? 26,
        advice: [],
      });
    } catch (e) {
      console.log("Weather error:", e);
      setError("Invalid weather data");
      setWeatherData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const latToUse = latitude ?? DEFAULT_LAT;
  const lonToUse = longitude ?? DEFAULT_LON;

  // 🔥 REFRESH WEATHER WHEN GPS LOADED
  useEffect(() => {
    if (latitude != null && longitude != null) {
      console.log("Fetching with GPS:", latitude, longitude);
      fetchWeatherData(latitude, longitude);
    }
  }, [latitude, longitude]);

  // 🕒 FETCH HOURLY RAIN (NEXT 12 HOURS)
  useEffect(() => {
    if (latitude == null || longitude == null) return;

    const fetchHourlyRain = async () => {
      try {
        const hourlyUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=precipitation&forecast_hours=12&timezone=Asia/Colombo`;

        const res = await fetch(hourlyUrl);
        const json = await res.json();

        if (json?.hourly?.time && json?.hourly?.precipitation) {
          const hourly = json.hourly.time.map((t: string, i: number) => ({
            time: t,
            precipitation: json.hourly.precipitation[i] || 0,
          }));
          setHourlyData(hourly);
        }
      } catch (e) {
        console.log("Hourly rain fetch error", e);
      }
    };

    fetchHourlyRain();
  }, [latitude, longitude]);

  useEffect(() => {
    if (!loading && weatherData) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, weatherData]);

  if (!latitude || !longitude || locationName === "Loading...") {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingTxt}>GPS සකස් වෙමින්...</Text>
      </View>
    );
  }

  if (error || !weatherData)
    return (
      <View style={styles.centered}>
        <AlertCircle size={64} color="#ef4444" />
        <Text style={styles.errorText}>{content[language].error}</Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() =>
            fetchWeatherData(latitude ?? DEFAULT_LAT, longitude ?? DEFAULT_LON)
          }
        >
          <RefreshCw size={20} color="#fff" />
          <Text style={styles.retryTxt}>{content[language].retry}</Text>
        </TouchableOpacity>
      </View>
    );

  const predictions = weatherData.predictions;
  const farmingAdvice = getFarmingAdvice(predictions);

  const rainChartData = {
    labels: predictions.map((d) => getDayName(d.date, true)),
    datasets: [
      {
        data: predictions.map((d) => d.rain_mm || 0),
      },
    ],
  };

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#f8fafc",
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(14, 165, 233, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(75, 85, 99, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    barPercentage: 0.7,
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: "#e5e7eb",
      strokeWidth: 1,
    },
  };

  return (
    <View style={styles.container}>
      <EnhancedHeader />

      <SpeechControlButton />

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              fetchWeatherData(
                latitude ?? DEFAULT_LAT,
                longitude ?? DEFAULT_LON,
                true
              )
            }
          />
        }
      >
        <EnhancedCurrentWeatherCard />

        {/* 🕒 HOURLY RAIN STRIP */}
        <HourlyRainStrip />

        {/* 🚜 HOURLY ACTION BANNER */}
        <HourlyActionBanner />

        {/* DAILY WEATHER SUMMARY BANNER */}
        {predictions.length > 0 && (
          <Animated.View
            style={[styles.dailySummaryBanner, { opacity: fadeAnim }]}
          >
            <View style={styles.dailySummaryContent}>
              <Text style={styles.dailySummaryLabel}>
                {language === "sinhala"
                  ? "📍 අද කාලගුණය"
                  : "📍 Today's Weather"}
              </Text>
              <Text style={styles.dailySummaryValue}>
                {getDailySummaryText(predictions[0])}
              </Text>
            </View>
            <EnhancedTrafficDot color={getTrafficColor(predictions[0])} />
          </Animated.View>
        )}

        {/* ANIMATED WEEKLY STRIP */}
        {predictions.length > 0 && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <AnimatedWeeklyStrip predictions={predictions} />
          </Animated.View>
        )}

        {/* ENHANCED FARM ACTION CARD */}
        {predictions.length > 0 && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <EnhancedFarmActionCard predictions={predictions} />
          </Animated.View>
        )}

        {/* FARMING ADVICE SECTION */}
        {farmingAdvice.length > 0 && (
          <Animated.View style={[styles.adviceSection, { opacity: fadeAnim }]}>
            <View style={styles.adviceHeader}>
              <Info size={20} color="#047857" />
              <Text style={styles.adviceTitle}>
                {content[language].farmingAdvice}
              </Text>
            </View>

            {farmingAdvice.map((item, idx) => (
              <View
                key={idx}
                style={[
                  styles.adviceCard,
                  item.type === "good" && styles.adviceGood,
                  item.type === "warning" && styles.adviceWarning,
                  item.type === "alert" && styles.adviceAlert,
                ]}
              >
                {item.icon}
                <View style={styles.adviceContent}>
                  <Text style={styles.adviceCardTitle}>{item.title}</Text>
                  <Text style={styles.adviceCardDesc}>{item.description}</Text>
                </View>
              </View>
            ))}
          </Animated.View>
        )}

        {/* RAINFALL CHART */}
        <Animated.View style={[styles.chartCard, { opacity: fadeAnim }]}>
          <View style={styles.chartHeader}>
            <CloudRain size={20} color="#0ea5e9" />
            <Text style={styles.chartTitle}>{content[language].rainTrend}</Text>
          </View>
          <BarChart
            data={rainChartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars={true}
            fromZero={true}
            yAxisSuffix=" mm"
            yAxisLabel=""
          />
          <Text style={styles.chartNote}>
            {language === "sinhala"
              ? "* 5-25mm වර්ෂාව බඩ ඉරිඟු වගාවට හිතකරයි"
              : "* 5-25mm rainfall is ideal for corn farming"}
          </Text>
        </Animated.View>

        {/* WEEKLY OVERVIEW SECTION */}
        <View style={styles.sectionHeader}>
          <Calendar size={18} color="#047857" />
          <Text style={styles.sectionTitle}>
            {content[language].weeklyOverview}
          </Text>
        </View>

        {/* TRAFFIC LIGHT LEGEND */}
        <View
          style={{
            marginHorizontal: 20,
            marginTop: 10,
            marginBottom: 10,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-around",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <EnhancedTrafficDot color="green" />
            <Text style={{ color: "#047857", fontSize: 12, fontWeight: "600" }}>
              {language === "sinhala" ? "හොඳ" : "Good"}
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <EnhancedTrafficDot color="yellow" />
            <Text style={{ color: "#CA8A04", fontSize: 12, fontWeight: "600" }}>
              {language === "sinhala" ? "අවධානයෙන්" : "Moderate"}
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <EnhancedTrafficDot color="red" />
            <Text style={{ color: "#DC2626", fontSize: 12, fontWeight: "600" }}>
              {language === "sinhala" ? "අවදානම්" : "Risky"}
            </Text>
          </View>
        </View>

        {/* BEAUTIFUL DAILY CARDS */}
        {predictions.map((d, idx) => {
          const trafficColor = getTrafficColor(d);
          const cardBg =
            trafficColor === "red"
              ? "#FEF2F2"
              : trafficColor === "yellow"
              ? "#FFFBEB"
              : "#F0FDF4";
          const cardBorder =
            trafficColor === "red"
              ? "#FECACA"
              : trafficColor === "yellow"
              ? "#FEF08A"
              : "#BBFDE0";

          return (
            <Animated.View
              key={d.day}
              style={[
                styles.dayCard,
                {
                  backgroundColor: cardBg,
                  borderWidth: 2,
                  borderColor: cardBorder,
                },
                { transform: [{ translateY: slideAnim }] },
              ]}
            >
              <BeautifulDayCardHeader day={d} trafficColor={trafficColor} />
              <Text style={styles.dailyReasonText}>
                {getDailySummaryText(d)}
              </Text>
              <BeautifulMetricsGrid day={d} />
            </Animated.View>
          );
        })}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

export default WeatherForecastScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FDF4" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
  },
  loadingTxt: { fontSize: 16, color: "#6B7280", marginTop: 10 },
  errorText: { color: "#ef4444", fontSize: 17, marginTop: 10 },
  retryBtn: {
    backgroundColor: "#10B981",
    padding: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  retryTxt: { color: "#fff", fontWeight: "600" },
  speechBtn: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: "#F0FDF4",
    borderWidth: 2,
    borderColor: "#10B981",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  speechBtnActive: {
    borderColor: "#ef4444",
    backgroundColor: "#FEF2F2",
  },
  speechBtnText: {
    fontSize: 15,
    fontWeight: "700",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3,
  },
  backBtn: { padding: 10, backgroundColor: "#E7F9ED", borderRadius: 20 },
  headerCenter: { flex: 1, marginLeft: 12 },
  headerTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#047857" },
  headerSubtitle: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  currentWeatherCard: {
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  locationText: { fontSize: 15, fontWeight: "600", color: "#047857" },
  currentTemp: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#047857",
  },
  currentLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  dailySummaryBanner: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: "#10B981",
  },
  dailySummaryContent: {
    flex: 1,
  },
  dailySummaryLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
  },
  dailySummaryValue: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "700",
    marginTop: 4,
  },
  adviceSection: {
    marginHorizontal: 20,
    marginBottom: 15,
  },
  adviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  adviceTitle: { fontSize: 18, fontWeight: "700", color: "#047857" },
  adviceCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    elevation: 2,
    borderLeftWidth: 4,
  },
  adviceGood: { borderLeftColor: "#10B981", backgroundColor: "#F0FDF4" },
  adviceWarning: { borderLeftColor: "#f59e0b", backgroundColor: "#FFFBEB" },
  adviceAlert: { borderLeftColor: "#ef4444", backgroundColor: "#FEF2F2" },
  adviceContent: { flex: 1 },
  adviceCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
  },
  adviceCardDesc: { fontSize: 12, color: "#6B7280" },
  chartCard: {
    marginHorizontal: 20,
    marginVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  chartTitle: { fontSize: 16, fontWeight: "700", color: "#047857" },
  chart: { borderRadius: 12, marginVertical: 8 },
  chartNote: {
    fontSize: 11,
    color: "#6B7280",
    fontStyle: "italic",
    marginTop: 8,
  },
  sectionHeader: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#047857" },
  dayCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginVertical: 6,
    padding: 14,
    borderRadius: 14,
    elevation: 2,
  },
  dayName: { fontSize: 16, fontWeight: "700", color: "#1F2937" },
  dateTxt: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  dailyReasonText: {
    fontSize: 13,
    color: "#047857",
    fontWeight: "600",
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#D1FAE5",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricBox: {
    flex: 1,
    minWidth: "48%",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  metricLabel: { fontSize: 13, fontWeight: "700", color: "#1F2937" },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1FAE5",
    position: "relative",
  },

  notificationDot: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
});
