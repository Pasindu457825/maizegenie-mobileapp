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
    },
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
      else if (rain >= 5 && rain <= 25 && temp >= 20 && temp <= 30) {
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
  const getTrafficColor = (day: WeatherDay) => {
    const rain = day.rain_mm || 0;
    const temp = day.temperature;
    const humidity = day.humidity_mean || 0;

    // 🔴 High risk
    if (rain > 25 || temp > 33) return "red";

    // 🟡 Medium risk
    if ((rain < 2 && humidity < 50) || (rain >= 2 && rain < 5)) return "yellow";

    // 🟢 Best farming conditions
    if (rain >= 5 && rain <= 25 && temp >= 20 && temp <= 30) return "green";

    return "yellow";
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
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ArrowLeft size={22} color="#047857" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerTitleRow}>
            <Sprout size={20} color="#047857" />
            <Text style={styles.headerTitle}>{content[language].title}</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            {content[language].subtitle}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setLanguage(language === "si" ? "en" : "si")}
          style={styles.langBtn}
        >
          <Text style={styles.langText}>
            {language === "si" ? "EN" : "සිං"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchWeatherData(latToUse, lonToUse, true)}
          />
        }
      >
        {/* LOCATION & CURRENT WEATHER CARD */}
        <Animated.View
          style={[styles.currentWeatherCard, { opacity: fadeAnim }]}
        >
          <View style={styles.locationRow}>
            <MapPin size={18} color="#047857" />
            <Text style={styles.locationText}>
              {getTranslatedLocation(locationName ?? null, language)}
            </Text>
          </View>

          <View style={styles.currentTempRow}>
            {temperature ? (
              <>
                <Sun size={48} color="#f59e0b" />
                <View>
                  <Text style={styles.currentTemp}>
                    {Math.round(temperature)}°C
                  </Text>
                  <Text style={styles.currentLabel}>
                    {language === "si"
                      ? "දැන් තියෙන උෂ්ණත්වය"
                      : "Current Temperature"}
                  </Text>
                </View>
              </>
            ) : (
              <Text style={styles.noTempText}>
                {language === "si" ? "තාප මාන දත්ත නැත" : "No temperature data"}
              </Text>
            )}
          </View>
        </Animated.View>

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

        {/* WEEKLY OVERVIEW */}
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
            <TrafficDot color="green" />
            <Text style={{ color: "#047857", fontSize: 12, fontWeight: "600" }}>
              {language === "si" ? "හොඳ" : "Good"}
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <TrafficDot color="yellow" />
            <Text style={{ color: "#CA8A04", fontSize: 12, fontWeight: "600" }}>
              {language === "si" ? "අවධානයෙන්" : "Moderate"}
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <TrafficDot color="red" />
            <Text style={{ color: "#DC2626", fontSize: 12, fontWeight: "600" }}>
              {language === "si" ? "අවදානම්" : "Risky"}
            </Text>
          </View>
        </View>

        {/* DAILY CARDS - COMPACT FOR FARMERS */}
        {predictions.map((d, idx) => {
          const isGoodDay =
            (d.rain_mm ?? 0) >= 5 &&
            (d.rain_mm ?? 0) <= 25 &&
            d.temperature >= 20 &&
            d.temperature <= 30;
          const needsAttention =
            (d.rain_mm ?? 0) > 25 ||
            d.temperature > 33 ||
            ((d.rain_mm ?? 0) < 2 && (d.humidity_mean ?? 0) < 50);

          return (
            <Animated.View
              key={d.day}
              style={[
                styles.dayCard,
                isGoodDay && styles.dayCardGood,
                needsAttention && styles.dayCardWarning,
                { transform: [{ translateY: slideAnim }] },
              ]}
            >
              <View style={styles.dayHeader}>
                <View>
                  <Text style={styles.dayName}>{getDayName(d.date)}</Text>
                  <Text style={styles.dateTxt}>{formatDate(d.date)}</Text>
                </View>

                {/* Traffic Light */}
                <TrafficDot color={getTrafficColor(d)} />

                {/* Existing Icons */}
                {isGoodDay && <CheckCircle size={24} color="#10B981" />}
                {needsAttention && <AlertTriangle size={24} color="#f59e0b" />}
              </View>

              {/* KEY METRICS FOR FARMERS */}
              <View style={styles.metricsGrid}>
                <View style={styles.metricBox}>
                  <Sun size={18} color="#f59e0b" />
                  <Text style={styles.metricLabel}>
                    {Math.round(d.temperature_min)}-
                    {Math.round(d.temperature_max)}°C
                  </Text>
                </View>

                <View style={styles.metricBox}>
                  <CloudRain size={18} color="#0ea5e9" />
                  <Text style={styles.metricLabel}>
                    {d.rain_mm?.toFixed(1) || 0} mm
                  </Text>
                </View>

                <View style={styles.metricBox}>
                  <Droplets size={18} color="#06b6d4" />
                  <Text style={styles.metricLabel}>
                    {Math.round(d.humidity_mean || 0)}%
                  </Text>
                </View>

                <View style={styles.metricBox}>
                  <Wind size={18} color="#047857" />
                  <Text style={styles.metricLabel}>
                    {Math.round(d.windspeed || 0)} km/h
                  </Text>
                </View>
              </View>
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

  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metricBox: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metricLabel: { fontSize: 13, fontWeight: "600", color: "#374151" },
});
