// client/src/screens/PriceForecast/WeatherForecastScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Animated,
  RefreshControl,
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
  Eye,
  AlertCircle,
  CheckCircle,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import useUniversalLocation from "../../utils/useUniversalLocation";
//import { LinearGradient } from "expo-linear-gradient"; // Optional: install if needed

const { width } = Dimensions.get("window");

type Language = "si" | "en";

interface WeatherDay {
  day: number;
  date: string;
  temperature: number;
  temperature_min: number;
  temperature_max: number;
}

interface WeatherPrediction {
  success: boolean;
  city: string;
  predictions: WeatherDay[];
  last_actual_temp: number;
  last_date: string;
  advice: Array<{ si: string; en: string }>;
  model_accuracy?: string;
}

const WeatherForecastScreen = () => {
  const navigation = useNavigation();
  const [language, setLanguage] = useState<Language>("si");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherPrediction | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const { locationName, temperature } = useUniversalLocation(language);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  const content = {
    si: {
      title: "කාලගුණ පුරෝකථනය",
      subtitle: "ඉදිරි 7 දින",
      today: "අද",
      loading: "කාලගුණ දත්ත ලබා ගනිමින්...",
      error: "දත්ත ලබා ගැනීමට නොහැකි විය",
      retry: "නැවත උත්සාහ කරන්න",
      minTemp: "අවම",
      maxTemp: "උච්ච",
      avgTemp: "සාමාන්‍ය",
      advice: "ගොවිතැන් උපදෙස්",
      lastUpdate: "අවසන් යාවත්කාලීනය",
      modelAccuracy: "Model නිරවද්‍යතාව",
      tempRange: "උෂ්ණත්ව පරාසය",
      forecast: "පුරෝකථනය",
      current: "වර්තමාන",
      pullToRefresh: "යාවත්කාල කිරීමට අදින්න",
    },
    en: {
      title: "Weather Forecast",
      subtitle: "Next 7 Days",
      today: "Today",
      loading: "Loading weather data...",
      error: "Failed to load data",
      retry: "Retry",
      minTemp: "Min",
      maxTemp: "Max",
      avgTemp: "Avg",
      advice: "Farming Advice",
      lastUpdate: "Last Updated",
      modelAccuracy: "Model Accuracy",
      tempRange: "Temperature Range",
      forecast: "Forecast",
      current: "Current",
      pullToRefresh: "Pull to refresh",
    },
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);

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
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, weatherData]);

  const fetchWeatherData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch(
        "http://192.168.8.181:8000/api/admin/weather/predict",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            city: locationName || "Colombo",
          }),
        }
      );

      const data = await response.json();
      console.log("🔥 WEATHER RESPONSE:", data);

      if (data.success) {
        setWeatherData(data);
        setError(null);
      } else {
        setError(data.error || "Unknown error");
      }
    } catch (err) {
      console.error("Weather fetch error:", err);
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    const days =
      language === "si"
        ? ["ඉරිදා", "සඳුදා", "අඟහරුවාදා", "බදාදා", "බ්‍රහස්", "සිකු", "සෙනසු"]
        : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[date.getDay()];
  };

  const getWeatherIcon = (temp: number, size = 32) => {
    if (temp > 32) return <Sun size={size} color="#f59e0b" />;
    if (temp > 28) return <Cloud size={size} color="#10B981" />;
    return <CloudRain size={size} color="#0ea5e9" />;
  };

  const getTempColor = (temp: number) => {
    if (temp > 32) return "#ef4444";
    if (temp > 28) return "#f59e0b";
    if (temp > 24) return "#10B981";
    return "#0ea5e9";
  };

  const getWeatherCondition = (temp: number) => {
    if (temp > 32) return language === "si" ? "ඉතා උණුසුම්" : "Very Hot";
    if (temp > 28) return language === "si" ? "උණුසුම්" : "Hot";
    if (temp > 24) return language === "si" ? "සුවපහසු" : "Pleasant";
    return language === "si" ? "සිසිල්" : "Cool";
  };

  // Calculate statistics
  const calculateStats = () => {
    if (!weatherData?.predictions || weatherData.predictions.length === 0) {
      return { avgTemp: 0, minTemp: 0, maxTemp: 0, tempRange: 0 };
    }

    const temps = weatherData.predictions.map((d) => d.temperature);
    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    const tempRange = maxTemp - minTemp;

    return { avgTemp, minTemp, maxTemp, tempRange };
  };

  const stats = calculateStats();

  // Fallback data
  const fallbackDays = Array.from({ length: 7 }, (_, i) => {
    const base = weatherData?.last_actual_temp ?? temperature ?? 25;
    return {
      day: i + 1,
      date: new Date(Date.now() + (i + 1) * 86400000).toISOString(),
      temperature: base + (Math.random() * 2 - 1),
      temperature_min: base - 2,
      temperature_max: base + 2,
    };
  });

  const daysToShow =
    weatherData?.predictions && weatherData.predictions.length > 0
      ? weatherData.predictions
      : fallbackDays;

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#047857" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{content[language].title}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>{content[language].loading}</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error && !weatherData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#047857" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{content[language].title}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.errorContainer}>
          <AlertCircle size={64} color="#ef4444" />
          <Text style={styles.errorText}>{content[language].error}</Text>
          <Text style={styles.errorDetail}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchWeatherData()}
          >
            <RefreshCw size={20} color="#FFFFFF" />
            <Text style={styles.retryText}>{content[language].retry}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#047857" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{content[language].title}</Text>
          <Text style={styles.headerSubtitle}>
            {content[language].subtitle}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.langButton}
          onPress={() => setLanguage((prev) => (prev === "si" ? "en" : "si"))}
        >
          <Text style={styles.langText}>
            {language === "si" ? "EN" : "සිං"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchWeatherData(true)}
            colors={["#10B981"]}
            tintColor="#10B981"
          />
        }
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Current Weather Card */}
          <View style={styles.currentCard}>
            <View style={styles.locationHeader}>
              <MapPin size={20} color="#047857" />
              <Text style={styles.locationName}>
                {locationName && locationName !== "city"
                  ? locationName
                  : weatherData?.city || "Colombo"}
              </Text>
            </View>

            <View style={styles.currentWeatherMain}>
              {getWeatherIcon(
                weatherData?.last_actual_temp || temperature || 25,
                64
              )}
              <Text style={styles.currentTemp}>
                {Math.round(weatherData?.last_actual_temp || temperature || 25)}
                °C
              </Text>
            </View>

            <Text style={styles.weatherCondition}>
              {getWeatherCondition(
                weatherData?.last_actual_temp || temperature || 25
              )}
            </Text>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <TrendingDown size={16} color="#0ea5e9" />
                <Text style={styles.statValue}>
                  {Math.round(stats.minTemp)}°
                </Text>
                <Text style={styles.statLabel}>
                  {content[language].minTemp}
                </Text>
              </View>
              <View style={[styles.statItem, styles.statItemMiddle]}>
                <Sun size={16} color="#f59e0b" />
                <Text style={styles.statValue}>
                  {Math.round(stats.avgTemp)}°
                </Text>
                <Text style={styles.statLabel}>
                  {content[language].avgTemp}
                </Text>
              </View>
              <View style={styles.statItem}>
                <TrendingUp size={16} color="#ef4444" />
                <Text style={styles.statValue}>
                  {Math.round(stats.maxTemp)}°
                </Text>
                <Text style={styles.statLabel}>
                  {content[language].maxTemp}
                </Text>
              </View>
            </View>

            {/* Model Accuracy Badge */}
            {weatherData?.model_accuracy && (
              <View style={styles.accuracyBadge}>
                <CheckCircle size={14} color="#10B981" />
                <Text style={styles.accuracyText}>
                  {content[language].modelAccuracy}:{" "}
                  {weatherData.model_accuracy}
                </Text>
              </View>
            )}
          </View>

          {/* 7 Day Forecast */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {content[language].forecast}
              </Text>
              <Calendar size={18} color="#047857" />
            </View>

            {daysToShow.map((day, index) => (
              <View key={index} style={styles.dayCard}>
                <View style={styles.dayHeader}>
                  <View style={styles.dayInfo}>
                    <Text style={styles.dayName}>{getDayName(day.date)}</Text>
                    <Text style={styles.dayDate}>
                      {new Date(day.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  </View>

                  <View style={styles.dayWeatherIcon}>
                    {getWeatherIcon(day.temperature, 36)}
                  </View>
                </View>

                {/* Temperature Bar */}
                <View style={styles.tempBar}>
                  <Text style={styles.tempBarMin}>
                    {Math.round(day.temperature_min)}°
                  </Text>
                  <View style={styles.tempBarTrack}>
                    <View
                      style={[
                        styles.tempBarFill,
                        {
                          backgroundColor: getTempColor(day.temperature),
                          width: "70%",
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.tempBarMax}>
                    {Math.round(day.temperature_max)}°
                  </Text>
                  <Text style={styles.tempBarAvg}>
                    {Math.round(day.temperature)}°
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Farming Advice */}
          {(weatherData?.advice?.length ?? 0) > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {content[language].advice}
                </Text>
                <Eye size={18} color="#047857" />
              </View>

              {weatherData!.advice.map((item, index) => (
                <View key={index} style={styles.adviceCard}>
                  <View style={styles.adviceHeader}>
                    <AlertCircle size={20} color="#10B981" />
                    <Text style={styles.adviceTitle}>
                      {language === "si" ? "උපදෙස්" : "Advice"} {index + 1}
                    </Text>
                  </View>
                  <Text style={styles.adviceText}>{item[language]}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Last Update */}
          <View style={styles.updateInfo}>
            <Calendar size={14} color="#6B7280" />
            <Text style={styles.updateText}>
              {content[language].lastUpdate}:{" "}
              {new Date().toLocaleString(
                language === "si" ? "si-LK" : "en-US",
                {
                  dateStyle: "short",
                  timeStyle: "short",
                }
              )}
            </Text>
          </View>

          <View style={{ height: 40 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FDF4" },
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#047857" },
  headerSubtitle: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  langButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#10B981",
  },
  langText: { color: "#10B981", fontSize: 13, fontWeight: "bold" },
  scrollView: { flex: 1 },

  // Loading & Error
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: { fontSize: 16, color: "#6B7280", marginTop: 12 },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 16,
  },
  errorText: { fontSize: 20, fontWeight: "700", color: "#1F2937" },
  errorDetail: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#10B981",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 28,
    marginTop: 16,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  retryText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },

  // Current Weather Card
  currentCard: {
    backgroundColor: "#FFFFFF",
    margin: 20,
    padding: 24,
    borderRadius: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  locationName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#047857",
  },
  currentWeatherMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 12,
  },
  currentTemp: {
    fontSize: 64,
    fontWeight: "bold",
    color: "#10B981",
  },
  weatherCondition: {
    fontSize: 18,
    color: "#6B7280",
    marginBottom: 20,
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  statItemMiddle: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#E5E7EB",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  accuracyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  accuracyText: {
    fontSize: 12,
    color: "#047857",
    fontWeight: "600",
  },

  // Sections
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#047857",
  },

  // Day Cards
  dayCard: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  dayInfo: { flex: 1 },
  dayName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
  },
  dayDate: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
    fontWeight: "500",
  },
  dayWeatherIcon: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },

  // Temperature Bar
  tempBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  tempBarMin: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0ea5e9",
    width: 35,
  },
  tempBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },
  tempBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  tempBarMax: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ef4444",
    width: 35,
    textAlign: "right",
  },
  tempBarAvg: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginLeft: 8,
    width: 40,
    textAlign: "center",
  },

  // Advice Cards
  adviceCard: {
    backgroundColor: "#ECFDF5",
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  adviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  adviceTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#047857",
  },
  adviceText: {
    fontSize: 14,
    color: "#047857",
    lineHeight: 22,
    fontWeight: "500",
  },

  // Update Info
  updateInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  updateText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
});

export default WeatherForecastScreen;
