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

// Dynamic API URL using .env + Platform detection
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

const formatRs = (v?: any) => {
  // Handle null/undefined
  if (v == null) return "Rs. 0.00";

  // Convert to number
  const num = Number(v);

  if (!Number.isFinite(num)) return "Rs. 0.00";

  return `Rs. ${num.toFixed(2)}`;
};

const formatPct = (v?: any) => {
  // Handle null/undefined
  if (v == null) return "0%";

  // Convert to number
  const num = Number(v);

  // Validate the result
  if (!Number.isFinite(num)) return "0%";

  return `${Math.round(num)}%`;
};

const getISOWeekRange = (
  year: number,
  week: number,
  lang: "si" | "en" | "ta",
) => {
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
    lang === "si" ? "si-LK" : lang === "ta" ? "ta-IN" : "en-US",
    options,
  );
  const end = weekEnd.toLocaleDateString(
    lang === "si" ? "si-LK" : lang === "ta" ? "ta-IN" : "en-US",
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
  const language: "si" | "en" | "ta" =
    globalLang === "sinhala" ? "si" : globalLang === "tamil" ? "ta" : "en";

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
      base: "පදනම් සතිය",
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
      summaryStats: "සාරාංශ සංඛ්‍යාලේඛන",
      averagePrice: "සාමාන්‍ය මිල",
      medianPrice: "මධ්‍යස්ථ මිල",
      riskAssessment: "අවදානම් තක්සේරුව",
      downside: "පහළ පැත්ත අවදානම",
      upside: "ඉහළ පැත්ත විභවය",
      riskReward: "ප්‍රතිලාභ අවදානම",
      priceMovement: "මිල චලනය",
      forecastMeta: "පුරෝකථන විස්තර",
      generatedOn: "ජනිතයි",
      modelInputs: "ආකෘති ඉතුරුවල",
      dataFreshness: "දත්ත නතුනකම",
      confidenceAnalysis: "විශ්වාස විශ්ලේෂණය",
      forecastQuality: "පුරෝකථන ගුණ",
      justNow: "දැන්ම",
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
      summaryStats: "Summary Statistics",
      averagePrice: "Average Price",
      medianPrice: "Median Price",
      riskAssessment: "Risk Assessment",
      downside: "Downside Risk",
      upside: "Upside Potential",
      riskReward: "Risk/Reward Ratio",
      priceMovement: "Price Movement Analysis",
      forecastMeta: "Forecast Metadata",
      generatedOn: "Generated",
      modelInputs: "Model Inputs",
      dataFreshness: "Data Freshness",
      confidenceAnalysis: "Confidence Analysis",
      forecastQuality: "Forecast Quality",
      justNow: "Just now",
    },
    ta: {
      title: "அதிகாரி விலை முன்னறிவிப்பு",
      subtitle: "தொழிலமுறை சந்தை நுண்ணறிவு",
      generating: "முன்னறிவிப்பு உருவாக்கப்படுகிறது...",
      error: "பிழை",
      missingData: "படிவ தரவு காணவில்லை",
      keyInsights: "முக்கிய நுண்ணறிவுகள்",
      bestWeek: "சிறந்த வாரம்",
      peakPrice: "உச்ச விலை",
      avgConfidence: "சராசரி நம்பிக்கை",
      trend: "போக்கு",
      priceAnalysis: "விலை பகுப்பாய்வு",
      weeklyBreakdown: "வாரந்தோறும் முறிவு",
      marketIntel: "சந்தை நுண்ணறிவு",
      recommendations: "பரிந்துரைகள்",
      exportReport: "அறிக்கையை ஏற்றுமதி செய்யவும்",
      refresh: "புதுப்பிக்கவும்",
      overview: "சுருக்கமான கண்ணோட்டம்",
      detailed: "விவரமான",
      priceRange: "விலை வரம்பு",
      volatility: "ஊசலாட்டம்",
      supplyOutlook: "வழங்கல் முன்னோக்கு",
      demandTrend: "தேவை போக்கு",
      district: "மாவட்டம்",
      season: "பருவம்",
      period: "காலம்",
      high: "உচ்சம்",
      medium: "நடுத்தர",
      low: "குறைந்த",
      upward: "ஏறுமுக",
      downward: "இறங்குமுக",
      stable: "நிலையான",
      weekTrajectory: "4-வாரம் விலை தொடர்பு",
      bestWeekBadge: "சிறந்த வாரம்",
      predictedPrice: "முன்னறிவிக்கப்பட்ட விலை",
      confidence: "நம்பிக்கை",
      change: "மாற்றம்",
      base: "அடிப்படை",
      spread: "பரவல்",
      strong: "சக்திশালி",
      moderate: "மிதமான",
      rising: "ஏறுகிறது",
      falling: "இறங்குகிறது",
      marketSentiment: "சந்தை உணர்வு",
      optimalSelling: "உகந்த விற்பனை சாளரம்",
      optimalText: "சிறந்த விற்பனை வாய்ப்பு வாரத்தில் கண்டறியப்பட்டது",
      trendAnalysisTitle: "சந்தை போக்கு பகுப்பாய்வு",
      trendAnalysisText1: "விலை போக்கு",
      trendAnalysisText2: "கொண்டு",
      trendAnalysisText3: "சிறந்த விலைகளுக்குப் பிடிக்க பரிசீலிக்கவும்.",
      trendAnalysisText4: "உகந்த நேரத்தिற்கு நெருக்கமாக கண்காணிக்கவும்.",
      volatilityTitle: "ஊசலாட்டம் மதிப்பீடு",
      volatilityText1: "சந்தை காட்டுகிறது",
      volatilityText2: "ஊசலாட்டம்",
      volatilityText3: "திட்டமிடலுக்கான நிலையான நிலைமைகள்.",
      volatilityText4: "நேரத் தீர்மானங்களில் எச்சரிக்கை செலுத்துங்கள்.",
      week: "வாரம்",
      summaryStats: "சுருக்க புள்ளிவிவரங்கள்",
      averagePrice: "சராசரி விலை",
      medianPrice: "இடைநிலை விலை",
      riskAssessment: "ঝুঁकி மதிப்பீடு",
      downside: "பாதுகாப்பு ঝுஸ்கி",
      upside: "ஏறுமுக சாத்தியக்கூறு",
      riskReward: "஝ுக்கி/வெகுமதி விகிதம்",
      priceMovement: "விலை இயக்கம் பகுப்பாய்வு",
      forecastMeta: "முன்னறிவிப்பு மेটाデेटा",
      generatedOn: "உருவாக்கப்பட்டது",
      modelInputs: "மாதிரி உள்ளீடுகள்",
      dataFreshness: "தரவு புதுமை",
      confidenceAnalysis: "நம்பிக்கை பகுப்பாய்வு",
      forecastQuality: "முன்னறிவிப்பு தரம்",
      justNow: "இப்போது",
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

  // DISTRICT WEEKLY WEATHER – replaces GPS-based weather for forecast inputs
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

        // STRICT VALIDATION - Form Data Only
        const year = validateRequiredNumber(formData.year, "Year", 2020, 2100);
        const week = validateRequiredNumber(formData.week, "Week", 1, 52);
        const district = validateRequiredString(formData.district, "District");
        const season = validateRequiredString(formData.season, "Season");

        // Extract fuel_price from formData.fuelPrice (may be formatted string like "රු. 303.00") → number
        let fuelPriceValue = 300;
        if (formData.fuelPrice) {
          const sanitized = String(formData.fuelPrice)
            .replace(/[^0-9.]/g, "")
            .trim();

          const parsed = parseFloat(sanitized);
          if (Number.isFinite(parsed)) fuelPriceValue = parsed;
        }

        const fuelPrice = validateRequiredNumber(
          fuelPriceValue,
          "Fuel Price",
          0,
          10000,
        );

        // Use district weekly-average weather (NOT GPS current weather)
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
          rainfall: rainfall, // district weekly avg
          temperature: temperatureValue, // district weekly avg
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

    // Wait for district weather to be resolved before calling forecast
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

  // ADVANCED OFFICER ANALYTICS
  const summaryStats = useMemo(() => {
    if (!weeks.length) return { mean: 0, median: 0, min: 0, max: 0, range: 0 };
    const prices = weeks.map((w) => w.rf_price).sort((a, b) => a - b);
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
    const median =
      prices.length % 2 === 0
        ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
        : prices[Math.floor(prices.length / 2)];
    return {
      mean,
      median,
      min: prices[0],
      max: prices[prices.length - 1],
      range: prices[prices.length - 1] - prices[0],
    };
  }, [weeks]);

  const riskAssessment = useMemo(() => {
    if (!weeks.length || !bestWeek) return { downside: 0, upside: 0, ratio: 0 };
    const firstWeekPrice = weeks[0].rf_price;
    const bestPrice = bestWeek.rf_price;
    const worstPrice = Math.min(...weeks.map((w) => w.rf_price));

    const downsideRisk = ((firstWeekPrice - worstPrice) / firstWeekPrice) * 100;
    const upsidePotential =
      ((bestPrice - firstWeekPrice) / firstWeekPrice) * 100;
    const ratio = downsideRisk > 0 ? upsidePotential / downsideRisk : 0;

    return {
      downside: downsideRisk,
      upside: upsidePotential,
      ratio: ratio,
    };
  }, [weeks, bestWeek]);

  const priceMovementAnalysis = useMemo(() => {
    if (weeks.length < 2) return [];
    return weeks.map((w, idx) => {
      if (idx === 0) return { week: w.week, change: 0, changePercent: 0 };
      const prevPrice = weeks[idx - 1].rf_price;
      const change = w.rf_price - prevPrice;
      const changePercent = (change / prevPrice) * 100;
      return { week: w.week, change, changePercent };
    });
  }, [weeks]);

  const confidenceMetrics = useMemo(() => {
    if (!weeks.length) return { min: 0, max: 0, avg: 0, consistency: 0 };
    const confidences = weeks.map((w) => w.confidence_pct);
    const min = Math.min(...confidences);
    const max = Math.max(...confidences);
    const avg = confidences.reduce((a, b) => a + b, 0) / confidences.length;
    const variance =
      confidences.reduce((sum, c) => sum + Math.pow(c - avg, 2), 0) /
      confidences.length;
    const stdev = Math.sqrt(variance);
    return { min, max, avg: Math.round(avg), consistency: 100 - stdev }; // consistency = 100 - stdev
  }, [weeks]);

  const getTrendTranslation = () => {
    if (trend === "Upward")
      return language === "si"
        ? "ඉහළ යන"
        : language === "ta"
          ? "ஏறுமுக"
          : "upward";
    if (trend === "Downward")
      return language === "si"
        ? "පහළ යන"
        : language === "ta"
          ? "இறங்குமுக"
          : "downward";
    return language === "si"
      ? "ස්ථාවර"
      : language === "ta"
        ? "நிலையான"
        : "stable";
  };

  const getVolatilityLevel = () => {
    if (volatility < 2)
      return language === "si" ? "අඩු" : language === "ta" ? "குறைந்த" : "low";
    if (volatility < 5)
      return language === "si"
        ? "මධ්‍යම"
        : language === "ta"
          ? "நடுத்தர"
          : "moderate";
    return language === "si" ? "ඉහළ" : language === "ta" ? "உচ்சம்" : "high";
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
                          {w.rf_price.toFixed(2)}
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
                      {language === "si"
                        ? `${bestWeek?.week} වන සතියේ ${formatRs(bestWeek?.rf_price)} ක ඉහළම මිලක් අපේක්ෂා වන නිසා, එය හොඳම විකුණුම් අවස්ථාව ලෙස හඳුනාගෙන ඇත.`
                        : language === "ta"
                          ? `${bestWeek?.week} ஆம் வாரத்தில் ${formatRs(bestWeek?.rf_price)} என்ற அதிகபட்ச விலை எதிர்பார்க்கப்படுவதால், அது சிறந்த விற்பனை வாய்ப்பாக அடையாளம் காணப்பட்டுள்ளது.`
                          : `Best selling opportunity identified in Week ${bestWeek?.week} with peak price of ${formatRs(bestWeek?.rf_price)}.`}
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
                          {w.rf_price.toFixed(2)}
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
                      {language === "si"
                        ? `${bestWeek?.week} වන සතියේ ${formatRs(bestWeek?.rf_price)} ක ඉහළම මිලක් අපේක්ෂා වන නිසා, එය හොඳම විකුණුම් අවස්ථාව ලෙස හඳුනාගෙන ඇත.`
                        : language === "ta"
                          ? `${bestWeek?.week} ஆம் வாரத்தில் ${formatRs(bestWeek?.rf_price)} என்ற அதிகபட்ச விலை எதிர்பார்க்கப்படுவதால், அது சிறந்த விற்பனை வாய்ப்பாக அடையாளம் காணப்பட்டுள்ளது.`
                          : `Best selling opportunity identified in Week ${bestWeek?.week} with peak price of ${formatRs(bestWeek?.rf_price)}.`}
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
                        : language === "ta"
                          ? "சாமாந்య நம்பிக்கை"
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

              {/* ADVANCED: Summary Statistics */}
              <Text style={styles.sectionTitle}>📊 {t.summaryStats}</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>{t.averagePrice}</Text>
                  <Text style={styles.statValue}>
                    {formatRs(summaryStats.mean)}
                  </Text>
                  <Text style={styles.statMeta}>
                    Mean of {weeks.length} weeks
                  </Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>{t.medianPrice}</Text>
                  <Text style={styles.statValue}>
                    {formatRs(summaryStats.median)}
                  </Text>
                  <Text style={styles.statMeta}>Middle value</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Min Price</Text>
                  <Text style={styles.statValue}>
                    {formatRs(summaryStats.min)}
                  </Text>
                  <Text style={styles.statMeta}>Lowest forecast</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Max Price</Text>
                  <Text style={styles.statValue}>
                    {formatRs(summaryStats.max)}
                  </Text>
                  <Text style={styles.statMeta}>Highest forecast</Text>
                </View>
              </View>

              {/* ADVANCED: Risk Assessment */}
              <Text style={styles.sectionTitle}>⚠️ {t.riskAssessment}</Text>
              <View style={styles.riskCard}>
                <View style={styles.riskRow}>
                  <View style={styles.riskMetric}>
                    <Text style={styles.riskLabel}>{t.downside}</Text>
                    <View style={styles.riskValue}>
                      <Text style={[styles.riskNumber, { color: "#EF4444" }]}>
                        {riskAssessment.downside.toFixed(1)}%
                      </Text>
                    </View>
                    <Text style={styles.riskMeta}>Maximum loss risk</Text>
                  </View>
                  <View style={styles.riskMetric}>
                    <Text style={styles.riskLabel}>{t.upside}</Text>
                    <View style={styles.riskValue}>
                      <Text style={[styles.riskNumber, { color: "#10B981" }]}>
                        +{riskAssessment.upside.toFixed(1)}%
                      </Text>
                    </View>
                    <Text style={styles.riskMeta}>Maximum gain potential</Text>
                  </View>
                  <View style={styles.riskMetric}>
                    <Text style={styles.riskLabel}>{t.riskReward}</Text>
                    <View style={styles.riskValue}>
                      <Text style={[styles.riskNumber, { color: "#3B82F6" }]}>
                        {riskAssessment.ratio.toFixed(2)}x
                      </Text>
                    </View>
                    <Text style={styles.riskMeta}>Reward vs risk</Text>
                  </View>
                </View>
              </View>

              {/* ADVANCED: Price Movement Analysis */}
              <Text style={styles.sectionTitle}>📈 {t.priceMovement}</Text>
              <View style={styles.movementCard}>
                {priceMovementAnalysis.map((item, idx) => (
                  <View key={idx} style={styles.movementRow}>
                    <Text style={styles.movementWeek}>W{item.week}</Text>
                    <View style={styles.movementBar}>
                      <View
                        style={[
                          styles.movementFill,
                          {
                            width: `${Math.abs(item.changePercent) * 10}%`,
                            backgroundColor:
                              item.changePercent > 0 ? "#10B981" : "#EF4444",
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.movementValue,
                        {
                          color: item.changePercent > 0 ? "#10B981" : "#EF4444",
                        },
                      ]}
                    >
                      {item.changePercent > 0 ? "+" : ""}
                      {item.changePercent.toFixed(2)}%
                    </Text>
                  </View>
                ))}
              </View>

              {/* ADVANCED: Confidence Analysis */}
              <Text style={styles.sectionTitle}>🎯 {t.confidenceAnalysis}</Text>
              <View style={styles.confidenceCard}>
                <View style={styles.confidenceRow}>
                  <View style={styles.confidenceMeter}>
                    <Text style={styles.confidenceLabel}>
                      {language === "si"
                        ? "අවම"
                        : language === "ta"
                          ? "குறைந்த"
                          : "Minimum"}
                    </Text>
                    <Text style={styles.confidenceValue}>
                      {confidenceMetrics.min.toFixed(0)}%
                    </Text>
                  </View>
                  <View style={styles.confidenceMeter}>
                    <Text style={styles.confidenceLabel}>
                      {language === "si"
                        ? "සාමාන්‍ය"
                        : language === "ta"
                          ? "சாமாந்य"
                          : "Average"}
                    </Text>
                    <Text style={styles.confidenceValue}>
                      {confidenceMetrics.avg}%
                    </Text>
                  </View>
                  <View style={styles.confidenceMeter}>
                    <Text style={styles.confidenceLabel}>
                      {language === "si"
                        ? "උපරිම"
                        : language === "ta"
                          ? "உচ்சம்"
                          : "Maximum"}
                    </Text>
                    <Text style={styles.confidenceValue}>
                      {confidenceMetrics.max.toFixed(0)}%
                    </Text>
                  </View>
                  <View style={styles.confidenceMeter}>
                    <Text style={styles.confidenceLabel}>
                      {language === "si"
                        ? "සත්‍යතාව"
                        : language === "ta"
                          ? "சமதாவம்"
                          : "Consistency"}
                    </Text>
                    <Text style={styles.confidenceValue}>
                      {confidenceMetrics.consistency.toFixed(0)}%
                    </Text>
                  </View>
                </View>
              </View>

              {/* ADVANCED: Forecast Metadata */}
              <Text style={styles.sectionTitle}>ℹ️ {t.forecastMeta}</Text>
              <View style={styles.metadataCard}>
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataLabel}>{t.generatedOn}</Text>
                  <Text style={styles.metadataValue}>{t.justNow}</Text>
                </View>
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataLabel}>{t.district}</Text>
                  <Text style={styles.metadataValue}>
                    {formData?.district || "-"}
                  </Text>
                </View>
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataLabel}>{t.season}</Text>
                  <Text style={styles.metadataValue}>
                    {normalizeSeason(formData?.season || "")}
                  </Text>
                </View>
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataLabel}>Weeks Forecast</Text>
                  <Text style={styles.metadataValue}>{weeks.length}</Text>
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
  // NEW: Advanced Analytics Styles
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  statMeta: {
    fontSize: 10,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  riskCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#FED7AA",
    marginBottom: 20,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  riskRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  riskMetric: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  riskLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  riskValue: {
    marginBottom: 8,
  },
  riskNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },
  riskMeta: {
    fontSize: 10,
    color: "#9CA3AF",
    textAlign: "center",
  },
  movementCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 20,
  },
  movementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  movementWeek: {
    width: 35,
    fontSize: 12,
    fontWeight: "bold",
    color: "#1F2937",
  },
  movementBar: {
    flex: 1,
    height: 24,
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
    overflow: "hidden",
  },
  movementFill: {
    height: "100%",
    borderRadius: 4,
  },
  movementValue: {
    width: 60,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "right",
  },
  confidenceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  confidenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  confidenceMeter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 6,
  },
  confidenceLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  confidenceValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#047857",
  },
  metadataCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 20,
  },
  metadataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  metadataLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  metadataValue: {
    fontSize: 13,
    color: "#1F2937",
    fontWeight: "500",
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
