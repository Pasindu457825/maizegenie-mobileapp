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
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import useUniversalLocation from "../../utils/useUniversalLocation";
import { LineChart, BarChart } from "react-native-chart-kit";
import { useFocusEffect } from "@react-navigation/native";

const getTranslatedLocation = (rawName: string | null, lang: "si" | "en") => {
  if (!rawName) return lang === "si" ? "ස්ථානය" : "Location";

  if (lang === "en") return rawName;

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

type Language = "si" | "en";

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

  const [language, setLanguage] = useState<Language>("si");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherPrediction | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // 🔥 FIX: Screen re-focus refresh
  useFocusEffect(
    useCallback(() => {
      console.log("Screen focused...");

      if (latitude == null || longitude == null) {
        console.log("GPS not ready → skipping fetch");
        return;
      }

      setLoading(true);
      setWeatherData(null);

      fetchWeatherData(latitude, longitude);
    }, [latitude, longitude])
  );

  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

  const content = {
    si: {
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

      // NEW: Daily summary & farm action
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
    },
    en: {
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

      // NEW: Daily summary & farm action
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
    },
  };

  // ✨ FIX: Type-safe content helper (moved inside component)
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
    const months = language === "si" ? monthsSi : monthsEn;
    return `${months[(m || 1) - 1]} ${d || 1}`;
  };

  const getShortDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    return `${d}/${m}`;
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
    return language === "si" ? si[date.getDay()] : en[date.getDay()];
  };

  // 🌾 FARMING ADVICE LOGIC FOR CORN
  const getFarmingAdvice = (predictions: WeatherDay[]): FarmingAdvice[] => {
    const advice: FarmingAdvice[] = [];

    predictions.forEach((day, idx) => {
      const rain = day.rain_mm || 0;
      const temp = day.temperature;
      const humidity = day.humidity_mean || 0;

      // Heavy rain warning (>25mm)
      if (rain > 25) {
        advice.push({
          type: "alert",
          title: `${getDayName(day.date, true)} - ${
            content[language].heavyRainWarning
          }`,
          description: `${rain.toFixed(1)}mm ${
            language === "si" ? "වර්ෂාව අපේක්ෂිතයි" : "rainfall expected"
          }`,
          icon: <CloudRain size={20} color="#ef4444" />,
        });
      }
      // Moderate rain (5-25mm) - Good for corn
      else if (rain >= 5 && rain <= 25 && temp >= 25 && temp <= 33) {
        advice.push({
          type: "good",
          title: `${getDayName(day.date, true)} - ${
            content[language].idealConditions
          }`,
          description: `${rain.toFixed(1)}mm ${
            language === "si" ? "වර්ෂාව, උෂ්ණත්වය" : "rain, temp"
          } ${Math.round(temp)}°C`,
          icon: <CheckCircle size={20} color="#10B981" />,
        });
      }
      // Dry conditions (no rain + low humidity)
      else if (rain < 2 && humidity < 50) {
        advice.push({
          type: "warning",
          title: `${getDayName(day.date, true)} - ${
            content[language].dryCondition
          }`,
          description: `${
            language === "si" ? "ආර්ද්‍රතාව" : "Humidity"
          } ${Math.round(humidity)}%`,
          icon: <AlertTriangle size={20} color="#f59e0b" />,
        });
      }
      // High temperature warning (>33°C)
      else if (temp > 33) {
        advice.push({
          type: "warning",
          title: `${getDayName(day.date, true)} - ${
            content[language].highTemp
          }`,
          description: `${Math.round(temp)}°C - ${
            language === "si"
              ? "අමතර වාරිමාර්ග අවශ්‍යයි"
              : "Extra irrigation needed"
          }`,
          icon: <Sun size={20} color="#f59e0b" />,
        });
      }
    });

    return advice;
  };

  // 🌈 Traffic Light Color Logic
  const getTrafficColor = (day: WeatherDay): "red" | "yellow" | "green" => {
    const rain = day.rain_mm || 0;
    const temp = day.temperature;
    const humidity = day.humidity_mean || 0;

    // 🔴 High risk
    if (rain > 25 || temp > 33) return "red";

    // 🟡 Medium risk
    if ((rain < 2 && humidity < 50) || (rain >= 2 && rain < 5)) return "yellow";

    // 🟢 Best farming conditions
    if (rain >= 5 && rain <= 25 && temp >= 25 && temp <= 33) return "green";

    return "yellow";
  };

  // 📊 Get daily summary text for each day
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

  // 🔘 Circle indicator
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

  // ✨ NEW: Beautiful gradient color based on traffic light
  const getTrafficGradient = (color: "red" | "yellow" | "green") => {
    switch (color) {
      case "red":
        return { start: "#fecaca", end: "#ef4444" };
      case "yellow":
        return { start: "#fef08a", end: "#facc15" };
      case "green":
        return { start: "#bbf7d0", end: "#22c55e" };
    }
  };

  // ✨ NEW: Get weather icon based on conditions
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

  // ✨ NEW: Get animated glow effect color
  const getGlowColor = (color: "red" | "yellow" | "green") => {
    const glowMap = {
      red: "rgba(239, 68, 68, 0.3)",
      yellow: "rgba(250, 204, 21, 0.3)",
      green: "rgba(34, 197, 94, 0.3)",
    };
    return glowMap[color];
  };

  // ✨ NEW: Enhanced Traffic Dot with glow effect
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

  // ✨ NEW: Beautiful day card header with gradient background
  const BeautifulDayCardHeader = ({
    day,
    trafficColor,
  }: {
    day: WeatherDay;
    trafficColor: "red" | "yellow" | "green";
  }) => {
    const headerBgColor =
      trafficColor === "red"
        ? "#FEF2F2"
        : trafficColor === "yellow"
        ? "#FFFBEB"
        : "#F0FDF4";

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

  // ✨ NEW: Beautiful metrics display with icons
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

  // ✨ NEW: Animated weekly forecast dots with tooltips
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

  // ✨ NEW: Beautiful summary card with emoji (FIXED)
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
        language === "si"
          ? `${goodDaysCount} හොඳ දින - සිටින්න!"}`
          : `${goodDaysCount} good days - Perfect time to farm!`;
      bgColor = "#F0FDF4";
      borderColor = "#10B981";
      textColor = "#047857";
    } else if (riskyDaysCount >= 4) {
      title = currentContent.riskyWeek;
      emoji = "⛔";
      desc =
        language === "si"
          ? `${riskyDaysCount} අවදානම් දින - අවධානයෙන්!`
          : `${riskyDaysCount} risky days - Be careful!`;
      bgColor = "#FEF2F2";
      borderColor = "#ef4444";
      textColor = "#dc2626";
    } else {
      title = currentContent.mixedWeek;
      emoji = "⚠️";
      desc =
        language === "si"
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

  // ✨ NEW: Beautiful header with gradient effect (FIXED)
  const EnhancedHeader = () => {
    const currentContent = getContent();

    return (
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ArrowLeft size={22} color="#047857" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerTitleRow}>
            <Sprout size={22} color="#047857" />
            <Text style={styles.headerTitle}>{currentContent.title}</Text>
          </View>
          <Text style={styles.headerSubtitle}>{currentContent.subtitle}</Text>
        </View>

        <TouchableOpacity
          onPress={() => setLanguage(language === "si" ? "en" : "si")}
          style={[styles.langBtn, { shadowColor: "#10B981", elevation: 3 }]}
        >
          <Text style={styles.langText}>
            {language === "si" ? "EN" : "සිං"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ✨ NEW: Enhanced current weather with gradient card (FIXED)
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
              {language === "si"
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
          onPress={() => fetchWeatherData(latToUse, lonToUse)}
        >
          <RefreshCw size={20} color="#fff" />
          <Text style={styles.retryTxt}>{content[language].retry}</Text>
        </TouchableOpacity>
      </View>
    );

  const predictions = weatherData.predictions;
  const farmingAdvice = getFarmingAdvice(predictions);

  // Chart data
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
      {/* ENHANCED HEADER */}
      <EnhancedHeader />

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchWeatherData(latToUse, lonToUse, true)}
          />
        }
      >
        {/* ENHANCED CURRENT WEATHER CARD */}
        <EnhancedCurrentWeatherCard />

        {/* DAILY WEATHER SUMMARY BANNER */}
        {predictions.length > 0 && (
          <Animated.View
            style={[styles.dailySummaryBanner, { opacity: fadeAnim }]}
          >
            <View style={styles.dailySummaryContent}>
              <Text style={styles.dailySummaryLabel}>
                {language === "si" ? "📍 අද කාලගුණය" : "📍 Today's Weather"}
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
            {language === "si"
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
              {language === "si" ? "හොඳ" : "Good"}
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <EnhancedTrafficDot color="yellow" />
            <Text style={{ color: "#CA8A04", fontSize: 12, fontWeight: "600" }}>
              {language === "si" ? "අවධානයෙන්" : "Moderate"}
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <EnhancedTrafficDot color="red" />
            <Text style={{ color: "#DC2626", fontSize: 12, fontWeight: "600" }}>
              {language === "si" ? "අවදානම්" : "Risky"}
            </Text>
          </View>
        </View>

        {/* BEAUTIFUL DAILY CARDS */}
        {predictions.map((d, idx) => {
          const isGoodDay =
            (d.rain_mm ?? 0) >= 5 &&
            (d.rain_mm ?? 0) <= 25 &&
            d.temperature >= 25 &&
            d.temperature <= 33;

          const needsAttention =
            (d.rain_mm ?? 0) > 25 ||
            d.temperature > 33 ||
            ((d.rain_mm ?? 0) < 2 && (d.humidity_mean ?? 0) < 50);

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

              {/* FARMER-FRIENDLY REASON TEXT */}
              <Text style={styles.dailyReasonText}>
                {getDailySummaryText(d)}
              </Text>

              {/* BEAUTIFUL METRICS */}
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
  langBtn: {
    borderWidth: 2,
    borderColor: "#10B981",
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 22,
  },
  langText: { color: "#10B981", fontWeight: "bold" },

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
  currentTempRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 8,
  },
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
  noTempText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontStyle: "italic",
  },

  // NEW: Daily Summary Banner
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

  // NEW: Farm Action Card
  farmActionCard: {
    marginBottom: 15,
    backgroundColor: "#F0FDF4",
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: "#10B981",
    elevation: 3,
  },
  farmActionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  farmActionDesc: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
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
  dayCardGood: {
    backgroundColor: "#F0FDF4",
    borderWidth: 2,
    borderColor: "#10B981",
  },
  dayCardWarning: {
    backgroundColor: "#FFFBEB",
    borderWidth: 2,
    borderColor: "#f59e0b",
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  dayName: { fontSize: 16, fontWeight: "700", color: "#1F2937" },
  dateTxt: { fontSize: 12, color: "#6B7280", marginTop: 2 },

  // NEW: Daily reason text
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
});
