import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useLanguage } from "../../context/LanguageContext";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowLeft,
  Target,
  Bell,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Calendar,
  MapPin,
  Package,
  BarChart3,
} from "lucide-react-native";
import useUniversalLocation from "../../utils/useUniversalLocation";
import { Platform } from "react-native";

// 🔥 Dynamic API URL using .env + Platform detection
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

const { width } = Dimensions.get("window");

type WeekForecast = {
  week: number;
  rf_price: number;
  confidence_pct: number;
  confidence_tag: string;
};

/* ===============================
   HELPERS (UNCHANGED LOGIC)
================================ */
const normalizeSeason = (s: string) => {
  if (!s) return "Maha";
  if (s.includes("මහ")) return "Maha";
  if (s.includes("යාල")) return "Yala";
  return s;
};

const getTrendDirection = (weeks: WeekForecast[]) => {
  if (weeks.length < 2) return "Stable";
  const diff = weeks[weeks.length - 1].rf_price - weeks[0].rf_price;
  if (diff > 1) return "Upward";
  if (diff < -1) return "Downward";
  return "Stable";
};

const formatRs = (v?: number) => {
  if (v == null || Number.isNaN(v)) return "-";
  return `Rs. ${v.toFixed(2)}`;
};

const formatPct = (v?: number) => {
  if (v == null || Number.isNaN(v)) return "-";
  return `${Math.round(v)}%`;
};

const getISOWeekRange = (year: number, week: number, lang: "si" | "en") => {
  const jan4 = new Date(year, 0, 4);
  const jan4Day = jan4.getDay() === 0 ? 7 : jan4.getDay();
  const week1Monday = new Date(jan4);
  week1Monday.setDate(jan4.getDate() - (jan4Day - 1));

  const weekStart = new Date(week1Monday);
  weekStart.setDate(week1Monday.getDate() + (week - 1) * 7);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };

  const start = weekStart.toLocaleDateString(
    lang === "si" ? "si-LK" : "en-US",
    options,
  );
  const end = weekEnd.toLocaleDateString(
    lang === "si" ? "si-LK" : "en-US",
    options,
  );

  return `${start} – ${end}`;
};

/* ===============================
   VALIDATION HELPER (NEW)
================================ */
const validateRequiredNumber = (
  value: any,
  fieldName: string,
  minValue?: number,
  maxValue?: number,
): number => {
  // Sanitize string inputs (remove currency symbols, etc.)
  let sanitized = value;
  if (typeof value === "string") {
    sanitized = value.replace(/[^0-9.-]/g, "");
  }

  const num = Number(sanitized);

  // Check for valid number
  if (!Number.isFinite(num)) {
    throw new Error(`Invalid ${fieldName}: "${value}" is not a valid number`);
  }

  // Check min/max bounds
  if (minValue !== undefined && num < minValue) {
    throw new Error(
      `${fieldName} (${num}) is below minimum allowed (${minValue})`,
    );
  }

  if (maxValue !== undefined && num > maxValue) {
    throw new Error(
      `${fieldName} (${num}) exceeds maximum allowed (${maxValue})`,
    );
  }

  return num;
};

const validateRequiredString = (value: any, fieldName: string): string => {
  const str = String(value || "").trim();
  if (!str) {
    throw new Error(`${fieldName} is required but missing or empty`);
  }
  return str;
};

/* ===============================
   MAIN SCREEN
================================ */
export default function OfficerPriceForecastScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const params = route.params ?? {};
  const formData = params.formData ?? params.data ?? null;

  const { language: globalLang } = useLanguage();
  const language = globalLang === "sinhala" ? "si" : "en";

  // GPS location used for display header only (NOT for forecast inputs)
  const { weatherCondition } = useUniversalLocation(language);

  const T = {
    si: {
      title: "නිලධාරි මිල පුරෝකථනය",
      subtitle: "වෘත්තීය වෙළඳපොළ විශ්ලේෂණය",
      generating: "පුරෝකථනය නිර්මාණය කරමින්...",
      error: "දෝෂයක්",
      missingData: "Form data නොමැත",
      keyInsights: "ප්‍රධාන තීරණ",
      bestWeek: "හොඳම සතිය",
      peakPrice: "ඉහළම මිල",
      avgConfidence: "සාමාන්‍ය විශ්වාසය",
      trend: "ප්‍රවණතාව",
      priceAnalysis: "මිල විශ්ලේෂණය",
      weeklyBreakdown: "සතිපතා විස්තර",
      marketIntel: "වෙළඳපොළ බුද්ධි",
      recommendations: "නිර්දේශ",
      exportReport: "වාර්තාව බාගන්න",
      refresh: "නැවුම් කරන්න",
      overview: "සාරාංශය",
      detailed: "විස්තර",
      priceRange: "මිල පරාසය",
      volatility: "අස්ථාවරත්වය",
      supplyOutlook: "සැපයුම් දර්ශනය",
      demandTrend: "ඉල්ලුම් ප්‍රවණතාව",
      district: "දිස්ත්‍රික්කය",
      season: "කන්න",
      period: "කාලය",
      high: "ඉහළ",
      medium: "මධ්‍යම",
      low: "අඩු",
      upward: "ඉහළ යන",
      downward: "පහළ යන",
      stable: "ස්ථාවර",
      weekTrajectory: "සති 4 ක මිල ගමන",
      bestWeekBadge: "හොඳම සතිය",
      predictedPrice: "පුරෝකථනය කළ මිල",
      confidence: "විශ්වාසය",
      change: "වෙනස",
      base: "පදනම",
      spread: "විහිදීම",
      strong: "ශක්තිමත්",
      moderate: "මධ්‍යස්ථ",
      rising: "ඉහළ යමින්",
      falling: "පහළ යමින්",
      marketSentiment: "වෙළඳපොළ හැඟීම",
      optimalSelling: "හොඳම විකුණුම් කාලය",
      optimalText: "සතිය තුළ ඉහළම මිල සමග හොඳම විකුණුම් අවස්ථාව හඳුනාගෙන ඇත",
      trendAnalysisTitle: "වෙළඳපොළ ප්‍රවණතා විශ්ලේෂණය",
      trendAnalysisText1: "මිල ප්‍රවණතාව",
      trendAnalysisText2: "සාමාන්‍ය විශ්වාසය සමග",
      trendAnalysisText3: "හොඳ මිලක් සඳහා රඳා සිටීමට සලකා බලන්න",
      trendAnalysisText4: "හොඳම කාලය සඳහා සමීපව නිරීක්ෂණය කරන්න",
      volatilityTitle: "අස්ථාවරත්ව තක්සේරුව",
      volatilityText1: "වෙළඳපොළ පෙන්වයි",
      volatilityText2: "අස්ථාවරත්වය",
      volatilityText3: "සැලසුම් සඳහා ස්ථාවර තත්වයන්",
      volatilityText4: "කාල තීරණවල ප්‍රවේශම් වන්න",
      week: "සතිය",
    },
    en: {
      title: "Officer Price Forecast",
      subtitle: "Professional Market Intelligence",
      generating: "Generating forecast...",
      error: "Error",
      missingData: "Missing form data",
      keyInsights: "Key Insights",
      bestWeek: "Best Week",
      peakPrice: "Peak Price",
      avgConfidence: "Avg Confidence",
      trend: "Trend",
      priceAnalysis: "Price Analysis",
      weeklyBreakdown: "Weekly Breakdown",
      marketIntel: "Market Intelligence",
      recommendations: "Recommendations",
      exportReport: "Export Report",
      refresh: "Refresh",
      overview: "Overview",
      detailed: "Detailed",
      priceRange: "Price Range",
      volatility: "Volatility",
      supplyOutlook: "Supply Outlook",
      demandTrend: "Demand Trend",
      district: "District",
      season: "Season",
      period: "Period",
      high: "High",
      medium: "Medium",
      low: "Low",
      upward: "Upward",
      downward: "Downward",
      stable: "Stable",
      weekTrajectory: "4-Week Price Trajectory",
      bestWeekBadge: "Best Week",
      predictedPrice: "Predicted Price",
      confidence: "Confidence",
      change: "Change",
      base: "Base",
      spread: "Spread",
      strong: "Strong",
      moderate: "Moderate",
      rising: "Rising",
      falling: "Falling",
      marketSentiment: "Market sentiment",
      optimalSelling: "Optimal Selling Window",
      optimalText: "Best selling opportunity identified in Week",
      trendAnalysisTitle: "Market Trend Analysis",
      trendAnalysisText1: "Price trend is",
      trendAnalysisText2: "with",
      trendAnalysisText3: "Consider holding for better prices.",
      trendAnalysisText4: "Monitor closely for optimal timing.",
      volatilityTitle: "Volatility Assessment",
      volatilityText1: "Market shows",
      volatilityText2: "volatility",
      volatilityText3: "Stable conditions for planning.",
      volatilityText4: "Exercise caution in timing decisions.",
      week: "Week",
    },
  } as const;

  const t = T[language];

  const [weeks, setWeeks] = useState<WeekForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"overview" | "detailed">(
    "overview",
  );
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  // 🌍 DISTRICT WEEKLY WEATHER – replaces GPS-based weather for forecast inputs
  const [districtWeather, setDistrictWeather] = useState<{
    avg_temperature: number;
    avg_rainfall: number;
    source: string;
  } | null>(null);

  /**
   * Fetch ISO-week average temperature (°C) and rainfall (mm) for the
   * selected district from the backend. Sets districtWeather state once resolved.
   */
  const fetchDistrictWeather = async (
    district: string,
    year: number,
    week: number,
  ) => {
    try {
      const url =
        `${API_URL}/api/price-forecast/district-weather` +
        `?district=${encodeURIComponent(district)}&year=${year}&week=${week}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) {
        console.log(
          `🌤 Officer district weather ${district} wk${week}/${year}: ` +
            `temp=${data.avg_temperature}°C  rain=${data.avg_rainfall}mm  [${data.source}]`,
        );
        setDistrictWeather({
          avg_temperature: data.avg_temperature,
          avg_rainfall: data.avg_rainfall,
          source: data.source,
        });
        return;
      }
      throw new Error("success=false");
    } catch (err) {
      console.warn(
        "Officer fetchDistrictWeather failed, using seasonal defaults:",
        err,
      );
      // Compute fallback from week number (Maha wk 40-52 OR wk 1-13)
      const isMaha = week >= 40 || week <= 13;
      setDistrictWeather({
        avg_temperature: isMaha ? 26.5 : 28.5,
        avg_rainfall: isMaha ? 28.0 : 12.0,
        source: "fallback_client",
      });
    }
  };

  // Kick off district weather fetch as soon as we have form data
  useEffect(() => {
    const district = formData?.district;
    const yearNum = Number(formData?.year);
    const weekNum = Number(formData?.week);
    if (
      district &&
      Number.isFinite(yearNum) &&
      yearNum >= 2020 &&
      Number.isFinite(weekNum) &&
      weekNum >= 1 &&
      weekNum <= 53
    ) {
      fetchDistrictWeather(district, yearNum, weekNum);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData?.district, formData?.year, formData?.week]);

  /* ===============================
     BACKEND CALL (REFACTORED)
  ================================ */
  useEffect(() => {
    const fetchForecast = async () => {
      try {
        if (!formData) throw new Error(t.missingData);

        // ✅ STRICT VALIDATION - Form Data Only
        const year = validateRequiredNumber(formData.year, "Year", 2020, 2100);
        const week = validateRequiredNumber(formData.week, "Week", 1, 52);
        const district = validateRequiredString(formData.district, "District");
        const season = validateRequiredString(formData.season, "Season");

        const fuelPrice = validateRequiredNumber(
          formData.fuel_price ?? 277,
          "Fuel Price",
          0,
          10000,
        );

        // 🌤 Use district weekly-average weather (NOT GPS current weather)
        const isMaha = normalizeSeason(season) === "Maha";
        const rainfall =
          districtWeather && districtWeather.avg_rainfall > 0
            ? districtWeather.avg_rainfall
            : isMaha
              ? 30
              : 10;

        let temperatureValue: number =
          districtWeather && districtWeather.avg_temperature > 0
            ? districtWeather.avg_temperature
            : isMaha
              ? 26
              : 28;
        if (temperatureValue < 10 || temperatureValue > 45) {
          temperatureValue = isMaha ? 26 : 28;
        }

        console.log(
          `🌡️ Officer forecast weather: temp=${temperatureValue}°C  ` +
            `rain=${rainfall}mm  source=${districtWeather?.source ?? "fallback"}`,
        );

        // Demand index based on season
        const demandIndex = isMaha ? 0.85 : 0.7;

        // Extract import_tax from formData.cornImportTax (string) → number
        let importTaxValue = 0;
        if (formData.cornImportTax) {
          const sanitized = String(formData.cornImportTax)
            .replace(/[^0-9.]/g, "")
            .trim();
          importTaxValue = parseFloat(sanitized);
          if (!Number.isFinite(importTaxValue)) importTaxValue = 0;
        }

        const lastPrice = validateRequiredNumber(
          formData.last_price ?? 160,
          "Last Market Price",
          0,
          10000,
        );

        const normalizedSeason = normalizeSeason(season);

        const payload = {
          year,
          week,
          district,
          season: normalizedSeason,
          fuel_price: fuelPrice,
          rainfall: rainfall, // 🌤 district weekly avg
          temperature: temperatureValue, // 🌤 district weekly avg
          demand_index: demandIndex,
          import_tax: importTaxValue,
          last_price: lastPrice,
          weeks_ahead: 4,
        };

        console.log("OFFICER RF PAYLOAD:", payload);

        const res = await fetch(`${API_URL}/api/price-forecast/next-weeks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        console.log("OFFICER RF RESPONSE:", data);

        if (!res.ok || !Array.isArray(data?.weeks)) {
          throw new Error("Forecast failed");
        }

        setWeeks(data.weeks);
      } catch (err: any) {
        console.error("OFFICER FORECAST ERROR:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // 🌤 Wait for district weather to be resolved before calling forecast
    if (districtWeather !== null) {
      fetchForecast();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [districtWeather]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  /* ===============================
     DERIVED INSIGHTS
  ================================ */
  const bestWeek = useMemo(() => {
    if (!weeks.length) return null;
    return weeks.reduce((a, b) => (b.rf_price > a.rf_price ? b : a));
  }, [weeks]);

  const avgConfidence = useMemo(() => {
    if (!weeks.length) return 0;
    return Math.round(
      weeks.reduce((s, w) => s + w.confidence_pct, 0) / weeks.length,
    );
  }, [weeks]);

  const trend = useMemo(() => getTrendDirection(weeks), [weeks]);

  const priceRange = useMemo(() => {
    if (!weeks.length) return { min: 0, max: 0 };
    return {
      min: Math.min(...weeks.map((w) => w.rf_price)),
      max: Math.max(...weeks.map((w) => w.rf_price)),
    };
  }, [weeks]);

  const volatility = useMemo(() => {
    if (weeks.length < 2) return 0;
    const prices = weeks.map((w) => w.rf_price);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance =
      prices.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / prices.length;
    return Math.sqrt(variance);
  }, [weeks]);

  const getTrendTranslation = () => {
    if (trend === "Upward") return language === "si" ? "ඉහළ යන" : "upward";
    if (trend === "Downward") return language === "si" ? "පහළ යන" : "downward";
    return language === "si" ? "ස්ථාවර" : "stable";
  };

  const getVolatilityLevel = () => {
    if (volatility < 2) return language === "si" ? "අඩු" : "low";
    if (volatility < 5) return language === "si" ? "මධ්‍යම" : "moderate";
    return language === "si" ? "ඉහළ" : "high";
  };

  /* ===============================
     STATES
  ================================ */
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#047857" />
        <Text style={styles.centerText}>{t.generating}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <AlertCircle size={48} color="#EF4444" />
        <Text style={[styles.centerText, styles.errorText]}>{error}</Text>
      </View>
    );
  }

  /* ===============================
     UI
  ================================ */
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#047857" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t.title}</Text>
          <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Bell size={20} color="#047857" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sub-header with Meta Info */}
      <View style={styles.subHeader}>
        <View style={styles.metaInfo}>
          <MapPin size={16} color="#10B981" />
          <View style={styles.metaTextContainer}>
            <Text style={styles.metaLabel}>{t.district}</Text>
            <Text style={styles.metaValue}>{formData?.district || "-"}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.metaInfo}>
          <Calendar size={16} color="#10B981" />
          <View style={styles.metaTextContainer}>
            <Text style={styles.metaLabel}>{t.season}</Text>
            <Text style={styles.metaValue}>
              {normalizeSeason(formData?.season || "")}
            </Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.metaInfo}>
          <Target size={16} color="#10B981" />
          <View style={styles.metaTextContainer}>
            <Text style={styles.metaLabel}>{t.period}</Text>
            <Text style={styles.metaValue}>
              W{formData?.week || 1}{" "}
              {formData?.year || new Date().getFullYear()}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* View Toggle */}
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                activeView === "overview" && styles.toggleButtonActive,
              ]}
              onPress={() => setActiveView("overview")}
            >
              <Text
                style={[
                  styles.toggleText,
                  activeView === "overview" && styles.toggleTextActive,
                ]}
              >
                {t.overview}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                activeView === "detailed" && styles.toggleButtonActive,
              ]}
              onPress={() => setActiveView("detailed")}
            >
              <Text
                style={[
                  styles.toggleText,
                  activeView === "detailed" && styles.toggleTextActive,
                ]}
              >
                {t.detailed}
              </Text>
            </TouchableOpacity>
          </View>

          {/* OVERVIEW MODE - Compact Summary */}
          {activeView === "overview" && (
            <>
              {/* Key Insights Grid */}
              <Text style={styles.sectionTitle}>📊 {t.keyInsights}</Text>
              <View style={styles.insightsGrid}>
                <View style={[styles.insightCard, styles.insightCardBlue]}>
                  <View style={styles.insightIconCircle}>
                    <Target size={24} color="#3B82F6" />
                  </View>
                  <Text style={styles.insightLabel}>{t.bestWeek}</Text>
                  <Text style={styles.insightValue}>
                    W{bestWeek?.week || "-"}
                  </Text>
                  <Text style={styles.insightSubtext}>
                    {bestWeek
                      ? getISOWeekRange(
                          Number(formData?.year || new Date().getFullYear()),
                          bestWeek.week,
                          language,
                        )
                      : "-"}
                  </Text>
                </View>

                <View style={[styles.insightCard, styles.insightCardGreen]}>
                  <View style={styles.insightIconCircle}>
                    <DollarSign size={24} color="#10B981" />
                  </View>
                  <Text style={styles.insightLabel}>{t.peakPrice}</Text>
                  <Text style={styles.insightValue}>
                    {formatRs(bestWeek?.rf_price)}
                  </Text>
                  <Text style={styles.insightSubtext}>
                    +
                    {(
                      (bestWeek?.rf_price || 0) - (formData?.last_price || 160)
                    ).toFixed(1)}
                  </Text>
                </View>

                <View style={[styles.insightCard, styles.insightCardAmber]}>
                  <View style={styles.insightIconCircle}>
                    <CheckCircle size={24} color="#F59E0B" />
                  </View>
                  <Text style={styles.insightLabel}>{t.avgConfidence}</Text>
                  <Text style={styles.insightValue}>
                    {formatPct(avgConfidence)}
                  </Text>
                  <Text style={styles.insightSubtext}>
                    {avgConfidence >= 80
                      ? t.high
                      : avgConfidence >= 60
                        ? t.medium
                        : t.low}
                  </Text>
                </View>

                <View style={[styles.insightCard, styles.insightCardPurple]}>
                  <View style={styles.insightIconCircle}>
                    {trend === "Upward" ? (
                      <TrendingUp size={24} color="#8B5CF6" />
                    ) : (
                      <TrendingDown size={24} color="#8B5CF6" />
                    )}
                  </View>
                  <Text style={styles.insightLabel}>{t.trend}</Text>
                  <Text style={styles.insightValue}>
                    {getTrendTranslation()}
                  </Text>
                  <Text style={styles.insightSubtext}>
                    {formatRs(weeks[0]?.rf_price)} →{" "}
                    {formatRs(weeks[weeks.length - 1]?.rf_price)}
                  </Text>
                </View>
              </View>

              {/* Price Analysis Chart */}
              <Text style={styles.sectionTitle}>📈 {t.priceAnalysis}</Text>
              <View style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <Text style={styles.chartTitle}>{t.weekTrajectory}</Text>
                  <View
                    style={[
                      styles.trendBadge,
                      {
                        backgroundColor:
                          trend === "Upward"
                            ? "#D1FAE5"
                            : trend === "Downward"
                              ? "#FEE2E2"
                              : "#FEF3C7",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.trendBadgeText,
                        {
                          color:
                            trend === "Upward"
                              ? "#047857"
                              : trend === "Downward"
                                ? "#DC2626"
                                : "#92400E",
                        },
                      ]}
                    >
                      {getTrendTranslation()}
                    </Text>
                  </View>
                </View>

                {/* Simple line chart visualization */}
                <View style={styles.chartArea}>
                  {weeks.map((w, idx) => {
                    const maxPrice = Math.max(
                      ...weeks.map((week) => week.rf_price),
                    );
                    const minPrice = Math.min(
                      ...weeks.map((week) => week.rf_price),
                    );
                    const height =
                      ((w.rf_price - minPrice) / (maxPrice - minPrice + 1)) *
                      120;
                    return (
                      <View key={idx} style={styles.chartBarContainer}>
                        <Text style={styles.chartValue}>
                          {w.rf_price.toFixed(1)}
                        </Text>
                        <View style={styles.chartBar}>
                          <View
                            style={[
                              styles.chartBarFill,
                              { height: Math.max(height, 20) },
                            ]}
                          />
                        </View>
                        <Text style={styles.chartLabel}>W{w.week}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Market Intelligence - Summary Cards */}
              <Text style={styles.sectionTitle}>🎯 {t.marketIntel}</Text>
              <View style={styles.intelGrid}>
                <View style={styles.intelCard}>
                  <Text style={styles.intelLabel}>{t.priceRange}</Text>
                  <Text style={styles.intelValue}>
                    {formatRs(priceRange.min)} - {formatRs(priceRange.max)}
                  </Text>
                  <Text style={styles.intelSubtext}>
                    {t.spread}: Rs.{" "}
                    {(priceRange.max - priceRange.min).toFixed(2)}
                  </Text>
                </View>

                <View style={styles.intelCard}>
                  <Text style={styles.intelLabel}>{t.volatility}</Text>
                  <Text style={styles.intelValue}>{getVolatilityLevel()}</Text>
                  <Text style={styles.intelSubtext}>
                    σ = {volatility.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.intelCard}>
                  <Text style={styles.intelLabel}>{t.supplyOutlook}</Text>
                  <Text style={styles.intelValue}>
                    {normalizeSeason(formData?.season || "") === "Maha"
                      ? t.strong
                      : t.moderate}
                  </Text>
                  <Text style={styles.intelSubtext}>
                    {normalizeSeason(formData?.season || "")} {t.season}
                  </Text>
                </View>

                <View style={styles.intelCard}>
                  <Text style={styles.intelLabel}>{t.demandTrend}</Text>
                  <Text style={styles.intelValue}>
                    {trend === "Upward"
                      ? t.rising
                      : trend === "Downward"
                        ? t.falling
                        : t.stable}
                  </Text>
                  <Text style={styles.intelSubtext}>{t.marketSentiment}</Text>
                </View>
              </View>

              {/* Quick Recommendations */}
              <Text style={styles.sectionTitle}>💡 {t.recommendations}</Text>
              <View style={styles.recommendationsCard}>
                <View style={styles.recommendation}>
                  <View style={styles.recommendationIcon}>
                    <CheckCircle size={20} color="#10B981" />
                  </View>
                  <View style={styles.recommendationContent}>
                    <Text style={styles.recommendationTitle}>
                      {t.optimalSelling}
                    </Text>
                    <Text style={styles.recommendationText}>
                      {t.optimalText} {bestWeek?.week}{" "}
                      {language === "si" ? "මඟින්" : "with peak price of"}{" "}
                      {formatRs(bestWeek?.rf_price)}.
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}

          {/* DETAILED MODE - Full Analysis */}
          {activeView === "detailed" && (
            <>
              {/* Weekly Breakdown - Each Week Card */}
              <Text style={styles.sectionTitle}>📋 {t.weeklyBreakdown}</Text>
              <View style={styles.weeklyContainer}>
                {weeks.map((w, idx) => {
                  const isBest = w.week === bestWeek?.week;
                  return (
                    <View
                      key={idx}
                      style={[styles.weekCard, isBest && styles.weekCardBest]}
                    >
                      {isBest && (
                        <View style={styles.bestBadge}>
                          <Text style={styles.bestBadgeText}>
                            ⭐ {t.bestWeekBadge}
                          </Text>
                        </View>
                      )}
                      <View style={styles.weekCardHeader}>
                        <Text style={styles.weekNumber}>
                          {t.week} {w.week}
                        </Text>
                        <Text style={styles.weekDate}>
                          {getISOWeekRange(
                            Number(formData?.year || new Date().getFullYear()),
                            w.week,
                            language,
                          )}
                        </Text>
                      </View>
                      <View style={styles.weekCardBody}>
                        <View style={styles.weekPriceContainer}>
                          <Text style={styles.weekPriceLabel}>
                            {t.predictedPrice}
                          </Text>
                          <Text style={styles.weekPrice}>
                            {formatRs(w.rf_price)}
                          </Text>
                        </View>
                        <View style={styles.weekStatsRow}>
                          <View style={styles.weekStat}>
                            <Text style={styles.weekStatLabel}>
                              {t.confidence}
                            </Text>
                            <View
                              style={[
                                styles.confidenceBadge,
                                {
                                  backgroundColor:
                                    w.confidence_tag === "High"
                                      ? "#D1FAE5"
                                      : "#FEF3C7",
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.confidenceBadgeText,
                                  {
                                    color:
                                      w.confidence_tag === "High"
                                        ? "#047857"
                                        : "#92400E",
                                  },
                                ]}
                              >
                                {formatPct(w.confidence_pct)}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.weekStat}>
                            <Text style={styles.weekStatLabel}>{t.change}</Text>
                            <Text
                              style={[
                                styles.weekStatValue,
                                {
                                  color:
                                    idx === 0
                                      ? "#6B7280"
                                      : w.rf_price > weeks[idx - 1].rf_price
                                        ? "#10B981"
                                        : "#EF4444",
                                },
                              ]}
                            >
                              {idx === 0
                                ? t.base
                                : `${
                                    w.rf_price > weeks[idx - 1].rf_price
                                      ? "+"
                                      : ""
                                  }${(
                                    w.rf_price - weeks[idx - 1].rf_price
                                  ).toFixed(1)}`}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Price Analysis Chart */}
              <Text style={styles.sectionTitle}>📈 {t.priceAnalysis}</Text>
              <View style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <Text style={styles.chartTitle}>{t.weekTrajectory}</Text>
                  <View
                    style={[
                      styles.trendBadge,
                      {
                        backgroundColor:
                          trend === "Upward"
                            ? "#D1FAE5"
                            : trend === "Downward"
                              ? "#FEE2E2"
                              : "#FEF3C7",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.trendBadgeText,
                        {
                          color:
                            trend === "Upward"
                              ? "#047857"
                              : trend === "Downward"
                                ? "#DC2626"
                                : "#92400E",
                        },
                      ]}
                    >
                      {getTrendTranslation()}
                    </Text>
                  </View>
                </View>

                {/* Simple line chart visualization */}
                <View style={styles.chartArea}>
                  {weeks.map((w, idx) => {
                    const maxPrice = Math.max(
                      ...weeks.map((week) => week.rf_price),
                    );
                    const minPrice = Math.min(
                      ...weeks.map((week) => week.rf_price),
                    );
                    const height =
                      ((w.rf_price - minPrice) / (maxPrice - minPrice + 1)) *
                      120;
                    return (
                      <View key={idx} style={styles.chartBarContainer}>
                        <Text style={styles.chartValue}>
                          {w.rf_price.toFixed(1)}
                        </Text>
                        <View style={styles.chartBar}>
                          <View
                            style={[
                              styles.chartBarFill,
                              { height: Math.max(height, 20) },
                            ]}
                          />
                        </View>
                        <Text style={styles.chartLabel}>W{w.week}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Market Intelligence - DETAILED */}
              <Text style={styles.sectionTitle}>🎯 {t.marketIntel}</Text>
              <View style={styles.intelGrid}>
                <View style={styles.intelCard}>
                  <Text style={styles.intelLabel}>{t.priceRange}</Text>
                  <Text style={styles.intelValue}>
                    {formatRs(priceRange.min)} - {formatRs(priceRange.max)}
                  </Text>
                  <Text style={styles.intelSubtext}>
                    {t.spread}: Rs.{" "}
                    {(priceRange.max - priceRange.min).toFixed(2)}
                  </Text>
                </View>

                <View style={styles.intelCard}>
                  <Text style={styles.intelLabel}>{t.volatility}</Text>
                  <Text style={styles.intelValue}>{getVolatilityLevel()}</Text>
                  <Text style={styles.intelSubtext}>
                    σ = {volatility.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.intelCard}>
                  <Text style={styles.intelLabel}>{t.supplyOutlook}</Text>
                  <Text style={styles.intelValue}>
                    {normalizeSeason(formData?.season || "") === "Maha"
                      ? t.strong
                      : t.moderate}
                  </Text>
                  <Text style={styles.intelSubtext}>
                    {normalizeSeason(formData?.season || "")} {t.season}
                  </Text>
                </View>

                <View style={styles.intelCard}>
                  <Text style={styles.intelLabel}>{t.demandTrend}</Text>
                  <Text style={styles.intelValue}>
                    {trend === "Upward"
                      ? t.rising
                      : trend === "Downward"
                        ? t.falling
                        : t.stable}
                  </Text>
                  <Text style={styles.intelSubtext}>{t.marketSentiment}</Text>
                </View>
              </View>

              {/* Full Recommendations - DETAILED */}
              <Text style={styles.sectionTitle}>💡 {t.recommendations}</Text>
              <View style={styles.recommendationsCard}>
                <View style={styles.recommendation}>
                  <View style={styles.recommendationIcon}>
                    <CheckCircle size={20} color="#10B981" />
                  </View>
                  <View style={styles.recommendationContent}>
                    <Text style={styles.recommendationTitle}>
                      {t.optimalSelling}
                    </Text>
                    <Text style={styles.recommendationText}>
                      {t.optimalText} {bestWeek?.week}{" "}
                      {language === "si" ? "මඟින්" : "with peak price of"}{" "}
                      {formatRs(bestWeek?.rf_price)}.
                    </Text>
                  </View>
                </View>

                <View style={styles.recommendation}>
                  <View style={styles.recommendationIcon}>
                    {trend === "Upward" ? (
                      <TrendingUp size={20} color="#10B981" />
                    ) : (
                      <AlertCircle size={20} color="#F59E0B" />
                    )}
                  </View>
                  <View style={styles.recommendationContent}>
                    <Text style={styles.recommendationTitle}>
                      {t.trendAnalysisTitle}
                    </Text>
                    <Text style={styles.recommendationText}>
                      {t.trendAnalysisText1} {getTrendTranslation()}{" "}
                      {t.trendAnalysisText2} {formatPct(avgConfidence)}{" "}
                      {language === "si"
                        ? "සාමාන්‍ය විශ්වාසය"
                        : "average confidence"}
                      .
                      {trend === "Upward"
                        ? ` ${t.trendAnalysisText3}`
                        : ` ${t.trendAnalysisText4}`}
                    </Text>
                  </View>
                </View>

                <View style={styles.recommendation}>
                  <View style={styles.recommendationIcon}>
                    <BarChart3 size={20} color="#3B82F6" />
                  </View>
                  <View style={styles.recommendationContent}>
                    <Text style={styles.recommendationTitle}>
                      {t.volatilityTitle}
                    </Text>
                    <Text style={styles.recommendationText}>
                      {t.volatilityText1} {getVolatilityLevel()}{" "}
                      {t.volatilityText2} (σ={volatility.toFixed(2)}).
                      {volatility < 2
                        ? ` ${t.volatilityText3}`
                        : ` ${t.volatilityText4}`}
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}

          <View style={{ height: 40 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  subHeader: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  metaTextContainer: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 10,
    color: "#6B7280",
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#047857",
  },
  divider: {
    width: 1,
    height: 35,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  content: {
    flex: 1,
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: "#10B981",
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  toggleTextActive: {
    color: "#FFFFFF",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#065F46",
    marginBottom: 16,
    marginTop: 8,
  },
  insightsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  insightCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  insightCardBlue: {
    borderColor: "#3B82F6",
    backgroundColor: "#EFF6FF",
  },
  insightCardGreen: {
    borderColor: "#10B981",
    backgroundColor: "#ECFDF5",
  },
  insightCardAmber: {
    borderColor: "#F59E0B",
    backgroundColor: "#FFFBEB",
  },
  insightCardPurple: {
    borderColor: "#8B5CF6",
    backgroundColor: "#F5F3FF",
  },
  insightIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
    fontWeight: "500",
  },
  insightValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  insightSubtext: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
  },
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#D1FAE5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#065F46",
  },
  trendBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  trendBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  chartArea: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 160,
    paddingTop: 20,
  },
  chartBarContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  chartValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#047857",
    marginBottom: 6,
  },
  chartBar: {
    width: "70%",
    maxWidth: 50,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  chartBarFill: {
    width: "100%",
    backgroundColor: "#10B981",
    borderRadius: 8,
  },
  chartLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 8,
    fontWeight: "600",
  },
  weeklyContainer: {
    gap: 16,
    marginBottom: 20,
  },
  weekCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  weekCardBest: {
    borderWidth: 2,
    borderColor: "#10B981",
    shadowColor: "#10B981",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  bestBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#10B981",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  bestBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  weekCardHeader: {
    marginBottom: 14,
  },
  weekNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  weekDate: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  weekCardBody: {
    gap: 14,
  },
  weekPriceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  weekPriceLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  weekPrice: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#047857",
  },
  weekStatsRow: {
    flexDirection: "row",
    gap: 12,
  },
  weekStat: {
    flex: 1,
  },
  weekStatLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 6,
    fontWeight: "500",
  },
  confidenceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  confidenceBadgeText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  weekStatValue: {
    fontSize: 15,
    fontWeight: "bold",
  },
  intelGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  intelCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  intelLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
    fontWeight: "500",
  },
  intelValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#047857",
    marginBottom: 4,
  },
  intelSubtext: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
  },
  recommendationsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    gap: 16,
    borderWidth: 1,
    borderColor: "#D1FAE5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  recommendation: {
    flexDirection: "row",
    gap: 12,
  },
  recommendationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 20,
  },
  center: {
    flex: 1,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  centerText: {
    marginTop: 16,
    fontSize: 14,
    color: "#047857",
    fontWeight: "600",
    textAlign: "center",
  },
  errorText: {
    color: "#DC2626",
  },
});
