import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { PriceForecastStackParamList } from "../../navigation/PriceForecastStack";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Leaf,
  Package,
  AlertCircle,
  CheckCircle,
  Bell,
  MapPin,
  CloudSun,
  RefreshCw,
  Sun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudSnow,
  CloudLightning,
  CloudFog,
} from "lucide-react-native";
import {
  getFormData,
  getAutoData,
  getPriceData,
  getLocationData,
  getWeatherData,
} from "../../utils/storage";
import useUniversalLocation from "../../utils/useUniversalLocation";
import { getPriceForecast } from "../../services/priceForecastService";
import type { WeekForecast } from "../../services/priceForecastService";
import { LineChart } from "react-native-chart-kit";
import { Platform } from "react-native";
import { useLanguage } from "../../context/LanguageContext";
import { useNotifications } from "../../context/NotificationContext";
import type { RootStackParamList } from "../../navigation/index";
import { supabase } from "../../lib/supabase";
import {
  generateVoiceSummary,
  type VoiceSummaryParams,
} from "../../utils/voiceSummaryGenerator";
import * as Speech from "expo-speech";

type RootNavProp = StackNavigationProp<RootStackParamList>;
type LocalNavProp = StackNavigationProp<
  PriceForecastStackParamList,
  "PriceForecastScreen"
>;

// Dynamic API URL using .env + Platform detection
const getApiUrl = () => {
  if (Platform.OS === "android") {
    // Real Android device → read from .env
    return process.env.EXPO_PUBLIC_API_BASE;
  } else if (Platform.OS === "ios") {
    // iOS simulator
    return "http://localhost:8000";
  } else {
    // Web fallback
    return "http://localhost:8000";
  }
};

const API_URL = getApiUrl();

const { width } = Dimensions.get("window");

type Language = "si" | "en" | "ta";
type NavProp = StackNavigationProp<
  PriceForecastStackParamList,
  "PriceForecastScreen"
>;

interface ForecastData {
  year: string;
  week: string;
  district: string;
  season: string;
  weather: string;
  fuelPrice: string;
  prevWeekFuelPrice?: string; // Previous week's actual fuel price for trend comparison
  cornImportTax: string;
  farmGatePrice: string;
  seedVariety: string;
  expectedYield: number;
  farmArea: number;
  totalCost: number;
  productionCostPerKg: number;
  hasStorage: boolean;
  language: Language;
}

const PriceForecastScreen = () => {
  const hasRunForecastRef = useRef(false);
  const [weeklyForecast, setWeeklyForecast] = useState<WeekForecast[]>([]);
  const notificationSentRef = useRef(false);
  const rootNavigation = useNavigation<RootNavProp>();
  const localNavigation = useNavigation<LocalNavProp>();
  const [isLoadingForecast, setIsLoadingForecast] = useState(false);
  const loadingOpacity = useRef(new Animated.Value(0)).current;
  const loadingScale = useRef(new Animated.Value(0.8)).current;
  const { unreadCount, sendNotification } = useNotifications();
  const route = useRoute();
  // Global language from context
  const { language: globalLang, setLanguage: setAppLanguage } = useLanguage();

  // Convert global language ("sinhala" | "english" | "tamil") to screen language ("si" | "en" | "ta")
  const language: Language =
    globalLang === "sinhala" ? "si" : globalLang === "tamil" ? "ta" : "en";

  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const {
    locationName,
    temperature,
    weatherCondition,
    weatherIcon,
    isLoading,
  } = useUniversalLocation(language);
  // rainfallMm and temperature from GPS are used for header display only.
  // The ML forecast now uses district-level weekly weather (districtWeather state).

  const loadSavedDataFromStorage = async () => {
    try {
      const form = await getFormData();
      const auto = await getAutoData();
      const price = await getPriceData();
      const loc = await getLocationData();
      const wea = await getWeatherData();

      setSavedForm(form);
      setSavedAuto(auto);
      setSavedPrice(price);
      setSavedLocation(loc);
      setSavedWeather(wea);
    } catch (error) {
      console.log("Storage load error:", error);
    }
  };

  // State for district and weather display
  const [district, setDistrict] = useState("");
  const [weather, setWeather] = useState("");

  // Get data from route params (from form)
  const { data: formData } = route.params as { data: ForecastData };

  // Forecast results
  const [predictedPrice, setPredictedPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [confidenceScore, setConfidenceScore] = useState<number>(0);
  const [recommendation, setRecommendation] = useState<
    "sell_now" | "sell_immediately" | "storage" | "sell_later"
  >("sell_later");
  const [noStorageSuggestion, setNoStorageSuggestion] = useState<string | null>(
    null,
  );

  const [savedForm, setSavedForm] = useState<any>(null);
  const [savedAuto, setSavedAuto] = useState<any>(null);
  const [savedPrice, setSavedPrice] = useState<any>(null);
  const [savedLocation, setSavedLocation] = useState<any>(null);
  const [savedWeather, setSavedWeather] = useState<any>(null);

  const [voiceSummaryText, setVoiceSummaryText] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  // 🔥 SELL POPUP STATE
  const [showSellPopup, setShowSellPopup] = useState(false);
  const popupAnim = useRef(new Animated.Value(0)).current;
  const popupShownRef = useRef(false);

  // DISTRICT WEEKLY WEATHER (replaces GPS-based weather for forecast)
  const [districtWeather, setDistrictWeather] = useState<{
    avg_temperature: number;
    avg_rainfall: number;
    source: string;
  } | null>(null);

  /**
   * Fetch weekly average temperature + rainfall for the selected district
   * from the backend. Uses ISO year/week to compute Mon–Sun window.
   * Falls back silently to seasonal defaults on any network error.
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
          `🌤 District weather for ${district} wk${week}/${year}:`,
          `temp=${data.avg_temperature}°C  rain=${data.avg_rainfall}mm  [${data.source}]`,
        );
        return {
          avg_temperature: data.avg_temperature as number,
          avg_rainfall: data.avg_rainfall as number,
          source: data.source as string,
        };
      }
      throw new Error("success=false");
    } catch (err) {
      console.warn(
        "fetchDistrictWeather failed, using seasonal defaults:",
        err,
      );
      return null;
    }
  };

  // Fetch district weather whenever we have a district + valid week
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
      fetchDistrictWeather(district, yearNum, weekNum).then((w) => {
        // Always set (even if null) so the trigger useEffect can react
        setDistrictWeather(
          w ?? {
            // Season-based fallback so forecast still runs
            avg_temperature: weekNum >= 40 || weekNum <= 13 ? 26.5 : 28.5,
            avg_rainfall: weekNum >= 40 || weekNum <= 13 ? 28.0 : 12.0,
            source: "fallback_client",
          },
        );
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData?.district, formData?.year, formData?.week]);

  const content = {
    si: {
      title: "මිල පුරෝකථනය",
      subtitle: "ඔබේ පුරෝකථන ප්‍රතිඵල",
      predictedPrice: "අපේක්ෂිත මිල",
      perKg: "කිලෝ ග්‍රෑම් එකකට",
      priceIncrease: "මිල වැඩිවීම",
      priceDecrease: "මිල අඩුවීම",
      vsCurrentPrice: "වත්මන් මිලට සාපේක්ෂව",
      confidence: "විශ්වාසනීයත්වය",
      recommendation: "නිර්දේශය",
      marketConditions: "වෙළඳපල තත්ත්වය",
      profitAnalysis: "ලාභ විශ්ලේෂණය",
      totalYield: "මුළු අස්වැන්න",
      totalRevenue: "මුළු ආදායම",
      totalCost: "මුළු වියදම",
      expectedProfit: "අපේක්ෂිත ලාභය",
      profitMargin: "ලාභ ආන්තිකය",
      sellNow: "දැන් විකිණීම හොඳයි",
      sellLater: "තව සතියක් බලාගෙන සිටින්න",
      storageAdvice: "ගබඩා කර රඳාගෙන සිටින්න",
      sellImmediately: "ඉක්මනින් විකිණන්න",
      marketFactors: "වෙළඳපල සාධක",
      seasonEffect: "කන්න බලපෑම",
      weatherEffect: "කාලගුණ බලපෑම",
      fuelEffect: "ඉන්ධන බලපෑම",
      importEffect: "ආනයන බලපෑම",
      high: "ඉහළ",
      medium: "මධ්‍යම",
      low: "අඩු",
      positive: "ධනාත්මක",
      negative: "ඍණාත්මක",
      neutral: "මධ්‍යස්ථ",
      newForecast: "අලුත් පුරෝකථනයක්",
      backToForm: "ආපසු යන්න",
      kg: "කි.ග්‍රෑ",
      detecting: "හඳුනාගනිමින්...",
      loading: "පූරණය වෙමින්...",
      locationDetecting: "ස්ථානය හඳුනාගනිමින්...",
      weatherLoading: "කාලගුණය පූරණය වෙමින්...",
      priceTrend: "සති 4 ක මිල ප්‍රවණතාව",
      priceIncreasing: "📈 මිල ඉහළ යයි පෙනේ",
      priceDecreasing: "📉 මිල පහළ යයි",
      priceStable: "↔️ මිල ස්ථාවරයි",
    },
    en: {
      title: "Price Forecast",
      subtitle: "Your Forecast Results",
      predictedPrice: "Predicted Price",
      perKg: "per kilogram",
      priceIncrease: "Price Increase",
      priceDecrease: "Price Decrease",
      vsCurrentPrice: "vs current price",
      confidence: "Confidence",
      recommendation: "Recommendation",
      marketConditions: "Market Conditions",
      profitAnalysis: "Profit Analysis",
      totalYield: "Total Yield",
      totalRevenue: "Total Revenue",
      totalCost: "Total Cost",
      expectedProfit: "Expected Profit",
      profitMargin: "Profit Margin",
      sellNow: "Good time to sell",
      sellLater: "Wait another week",
      storageAdvice: "Store and hold",
      sellImmediately: "Sell immediately",
      marketFactors: "Market Factors",
      seasonEffect: "Season Effect",
      weatherEffect: "Weather Effect",
      fuelEffect: "Fuel Effect",
      importEffect: "Import Effect",
      high: "High",
      medium: "Medium",
      low: "Low",
      positive: "Positive",
      negative: "Negative",
      neutral: "Neutral",
      newForecast: "New Forecast",
      backToForm: "Back to Form",
      kg: "kg",
      detecting: "Detecting...",
      loading: "Loading...",
      locationDetecting: "Detecting location...",
      weatherLoading: "Loading weather...",
      priceTrend: "4-Week Price Trend",
      priceIncreasing: "📈 Price is increasing",
      priceDecreasing: "📉 Price is decreasing",
      priceStable: "↔️ Price is stable",
    },
    ta: {
      title: "விலை மதிப்பீடு",
      subtitle: "உங்கள் மதிப்பீட்டு முடிவுகள்",
      predictedPrice: "மதிப்பிடப்பட்ட விலை",
      perKg: "ஒரு கிலோவுக்கு",
      priceIncrease: "விலை அதிகரிப்பு",
      priceDecrease: "விலை குறைப்பு",
      vsCurrentPrice: "தற்போதைய விலையுடன் ஒப்பிட",
      confidence: "நம்பகத்தன்மை",
      recommendation: "பரிந்துரை",
      marketConditions: "சந்தை நிலைமைகள்",
      profitAnalysis: "லாப பகுப்பாய்வு",
      totalYield: "மொத்த விளைச்சல்",
      totalRevenue: "மொத்த வருவாய்",
      totalCost: "மொத்த செலவு",
      expectedProfit: "எதிர்பார்க்கப்படும் லாபம்",
      profitMargin: "லாப வரம்பு",
      sellNow: "இப்போது விற்பது நல்லது",
      sellLater: "இன்னும் ஒரு வாரம் காத்திருங்கள்",
      storageAdvice: "சேமித்து வைக்கவும்",
      sellImmediately: "உடனே விற்கவும்",
      marketFactors: "சந்தை காரணிகள்",
      seasonEffect: "பருவகால தாக்கம்",
      weatherEffect: "வானிலை தாக்கம்",
      fuelEffect: "எரிபொருள் தாக்கம்",
      importEffect: "இறக்குமதி தாக்கம்",
      high: "அதிகம்",
      medium: "நடுத்தரம்",
      low: "குறைவு",
      positive: "நேர்மறை",
      negative: "எதிர்மறை",
      neutral: "நடுநிலை",
      newForecast: "புதிய மதிப்பீடு",
      backToForm: "படிவத்திற்கு திரும்பு",
      kg: "கி.கி",
      detecting: "கண்டறிகிறது...",
      loading: "ஏற்றுகிறது...",
      locationDetecting: "இடத்தை கண்டறிகிறது...",
      weatherLoading: "வானிலை ஏற்றுகிறது...",
      priceTrend: "4-வார விலை போக்கு",
      priceIncreasing: "📈 விலை உயர்கிறது",
      priceDecreasing: "📉 விலை குறைகிறது",
      priceStable: "↔️ விலை நிலையானது",
    },
  };

  // Convert ISO year + week number to date range
  const getISOWeekRangeWithOffset = (
    year: number,
    baseWeek: number,
    offset: number,
    lang: Language,
  ) => {
    // Jan 4 is always in ISO Week 1
    const jan4 = new Date(year, 0, 4);
    const jan4Day = jan4.getDay() === 0 ? 7 : jan4.getDay();

    // Monday of ISO Week 1
    const week1Monday = new Date(jan4);
    week1Monday.setDate(jan4.getDate() - (jan4Day - 1));

    // Target week Monday (base + offset)
    const weekStart = new Date(week1Monday);
    weekStart.setDate(week1Monday.getDate() + (baseWeek - 1 + offset) * 7);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };

    const start = weekStart.toLocaleDateString(
      lang === "si" ? "si-LK" : lang === "ta" ? "ta-LK" : "en-US",
      options,
    );
    const end = weekEnd.toLocaleDateString(
      lang === "si" ? "si-LK" : lang === "ta" ? "ta-LK" : "en-US",
      options,
    );

    return `${start} – ${end}`;
  };

  // ⭐ BEST WEEK INDEX (highest ensemble price)
  const bestWeekIndex = React.useMemo(() => {
    if (!weeklyForecast || weeklyForecast.length === 0) return -1;

    return weeklyForecast.reduce((bestIdx, w, idx, arr) => {
      return w.ensemble > arr[bestIdx].ensemble ? idx : bestIdx;
    }, 0);
  }, [weeklyForecast]);

  const getBestWeekMessage = () => {
    if (bestWeekIndex === -1) return null;

    if (bestWeekIndex === 0) {
      return language === "si"
        ? "⭐ වත්මන් සතියේ මිල හොඳමය – දැන් විකිණීම වාසිදායකයි"
        : language === "ta"
          ? "⭐ இந்த வாரம் அதிக விலை உள்ளது – இப்போது விற்பதே சிறந்தது"
          : "⭐ Current week has the highest price – best time to sell now";
    }

    return language === "si"
      ? `⭐ හොඳම මිල ලැබෙන්නේ ඉදිරි සතිය ${bestWeekIndex + 1} තුළය`
      : language === "ta"
        ? `⭐ சிறந்த விலை ${bestWeekIndex + 1} வாரத்தில் எதிர்பார்க்கப்படுகிறது`
        : `⭐ Best price is expected in week ${bestWeekIndex + 1}`;
  };

  // Enhanced weather translation mapping
  const getWeatherTranslation = (condition: string, lang: Language): string => {
    if (!condition)
      return lang === "si" ? "කාලගුණය" : lang === "ta" ? "வானிலை" : "Weather";

    const c = condition.toLowerCase();

    // ---- RAIN ----
    if (c.includes("shower rain") || c.includes("light intensity shower")) {
      return lang === "si"
        ? "මද වැසි"
        : lang === "ta"
          ? "இலேசான தூறல் மழை"
          : "Light Shower Rain";
    }
    if (c.includes("light rain")) {
      return lang === "si"
        ? "සැහැල්ලු වැසි"
        : lang === "ta"
          ? "இலேசான மழை"
          : "Light Rain";
    }
    if (c.includes("moderate rain")) {
      return lang === "si"
        ? "සිහින් වැසි"
        : lang === "ta"
          ? "மிதமான மழை"
          : "Moderate Rain";
    }
    if (c.includes("heavy") && c.includes("rain")) {
      return lang === "si" ? "බර වැසි" : lang === "ta" ? "கனமழை" : "Heavy Rain";
    }

    // ---- CLOUDS ----
    if (c.includes("clear")) {
      return lang === "si"
        ? "පිරිසිදු අහස"
        : lang === "ta"
          ? "தெளிவான வானம்"
          : "Clear Sky";
    }
    if (c.includes("few clouds")) {
      return lang === "si"
        ? "සුළු වලාකුළු"
        : lang === "ta"
          ? "சில மேகங்கள்"
          : "Few Clouds";
    }
    if (c.includes("scattered")) {
      return lang === "si"
        ? "විසිරුණු වලාකුළු"
        : lang === "ta"
          ? "சிதறிய மேகங்கள்"
          : "Scattered Clouds";
    }
    if (c.includes("broken")) {
      return lang === "si"
        ? "කැබලි වලාකුළු"
        : lang === "ta"
          ? "உடைந்த மேகங்கள்"
          : "Broken Clouds";
    }
    if (c.includes("overcast")) {
      return lang === "si"
        ? "තද වලාකුළු"
        : lang === "ta"
          ? "மேகமூட்டமான வானம்"
          : "Overcast Clouds";
    }

    // ---- THUNDER ----
    if (c.includes("thunder")) {
      return lang === "si"
        ? "ගිගුරුම් සහිත වැසි"
        : lang === "ta"
          ? "இடியுடன் கூடிய மழை"
          : "Thunderstorm";
    }

    // ---- MIST / FOG ----
    if (c.includes("mist") || c.includes("fog") || c.includes("haze")) {
      return lang === "si" ? "මීදුම" : lang === "ta" ? "மூடுபனி" : "Mist";
    }

    // DEFAULT
    return lang === "si" ? "කාලගුණය" : lang === "ta" ? "வானிலை" : condition;
  };

  const getWeatherIcon = (condition: string | null) => {
    if (!condition) return <Cloud size={18} color="#10B981" />;

    const c = condition.toLowerCase();

    if (c.includes("clear")) return <Sun size={18} color="#f59e0b" />;

    if (c.includes("rain") && c.includes("light"))
      return <CloudDrizzle size={18} color="#0ea5e9" />;

    if (c.includes("rain")) return <CloudRain size={18} color="#0284c7" />;

    if (c.includes("thunder"))
      return <CloudLightning size={18} color="#e11d48" />;

    if (c.includes("mist") || c.includes("fog") || c.includes("haze"))
      return <CloudFog size={18} color="#6b7280" />;

    if (c.includes("cloud")) return <Cloud size={18} color="#10b981" />;

    return <Cloud size={18} color="#10b981" />;
  };

  useEffect(() => {
    // Set language from form data
    if (formData?.language) {
      setAppLanguage(
        formData.language === "si"
          ? "sinhala"
          : formData.language === "ta"
            ? "tamil"
            : "english",
      );
    }

    // Animate on mount
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

  // Update district and weather when location data changes
  useEffect(() => {
    // Update district
    if (isLoading) {
      setDistrict(content[language].locationDetecting);
    } else if (locationName && locationName !== "Loading...") {
      setDistrict(locationName);
    } else {
      setDistrict(
        language === "si"
          ? "ස්ථානය නොමැත"
          : language === "ta"
            ? "இடம் கிடைக்கவில்லை"
            : "Location unavailable",
      );
    }

    // Update weather
    if (isLoading) {
      setWeather(content[language].weatherLoading);
    } else if (temperature !== null && weatherCondition) {
      const translatedCondition = getWeatherTranslation(
        weatherCondition,
        language,
      );
      setWeather(`${Math.round(temperature)}°C • ${translatedCondition}`);
    } else {
      setWeather(
        language === "si"
          ? "කාලගුණ දත්ත නොමැත"
          : language === "ta"
            ? "வானிலை தகவல் கிடைக்கவில்லை"
            : "Weather unavailable",
      );
    }
  }, [locationName, temperature, weatherCondition, isLoading, language]);

  const getSeasonFromWeek = (week: number): "Maha" | "Yala" => {
    // Maha: Oct–Mar → ISO weeks 40–52, 1–13
    if (week >= 40 || week <= 13) return "Maha";
    return "Yala";
  };

  // ─────────────────────────────────────────────────────────────────────────
  // SAVE FORECAST → SUPABASE
  //   1. Upsert current week's actual price into maize_prices
  //      (so future forecasts have a real lag-1 value for this week)
  //   2. Insert every predicted week into price_forecast_results
  // ─────────────────────────────────────────────────────────────────────────
  const saveForecastToSupabase = async (
    weeks: WeekForecast[],
    refYear: number,
    refWeek: number,
    district: string,
    season: string,
    farmGatePrice: number,
  ) => {
    try {
      // NOTE: maize_prices is intentionally NOT written here.
      // That table is the trusted historical source for the ML model and must
      // only be populated by admins / verified DOA data (via Supabase dashboard
      // or service-role scripts). Allowing unverified farmer input to feed
      // directly into lag_1 / roll_4 / roll_8 would corrupt future forecasts.

      // Insert each predicted week into price_forecast_results
      const rows = weeks.map((w) => ({
        ref_year: refYear,
        ref_week: refWeek,
        district,
        season,
        forecast_offset: w.week, // 1 = next week, 2 = week after, …
        predicted_price: w.ensemble,
        confidence_pct: w.confidence_pct ?? null,
        confidence_tag: w.confidence_tag ?? null,
        farm_gate_price: farmGatePrice,
      }));

      const { error: fcErr } = await supabase
        .from("price_forecast_results")
        .insert(rows);

      if (fcErr) {
        console.warn(
          "[Supabase] price_forecast_results insert warning:",
          fcErr.message,
        );
      } else {
        console.log("✅ Forecast saved to Supabase", rows.length, "rows");
      }
    } catch (err) {
      // Never let a save error crash the UI – forecast is already shown
      console.warn("[Supabase] saveForecastToSupabase failed:", err);
    }
  };

  const generateForecast = async () => {
    try {
      // RESET NOTIFICATION FLAG for new forecast
      notificationSentRef.current = false;

      setIsLoadingForecast(true);

      // START LOADING ANIMATION
      Animated.parallel([
        Animated.timing(loadingOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(loadingScale, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();

      // current farm gate price (string -> number)
      const currentPriceNumeric = parseFloat(
        (formData.farmGatePrice || "0").toString().replace(/[^0-9.]/g, ""),
      );

      const weekNum = Number(formData.week);

      // hard guard (prevents 422)
      if (!Number.isFinite(weekNum)) {
        throw new Error("Invalid week number");
      }

      const seasonCode = getSeasonFromWeek(weekNum);

      // numeric sanitizers
      const safeNumber = (v: any, fallback: number) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : fallback;
      };

      const fuelPriceValue = safeNumber(
        String(formData.fuelPrice).replace(/[^0-9.]/g, ""),
        303,
      );

      const lastPriceValue = safeNumber(
        String(formData.farmGatePrice).replace(/[^0-9.]/g, ""),
        160,
      );

      const importTaxValue = safeNumber(
        String(formData.cornImportTax).replace(/[^0-9.]/g, ""),
        0,
      );

      // Use district weekly-average weather (NOT GPS current weather)
      const rainfallValue =
        districtWeather && districtWeather.avg_rainfall > 0
          ? districtWeather.avg_rainfall
          : seasonCode === "Maha"
            ? 30 // realistic Maha fallback
            : 10;

      let temperatureValue =
        districtWeather && districtWeather.avg_temperature > 0
          ? districtWeather.avg_temperature
          : seasonCode === "Maha"
            ? 26
            : 28;

      // Sri Lanka validity guard
      if (temperatureValue < 10 || temperatureValue > 45) {
        temperatureValue = seasonCode === "Maha" ? 26 : 28;
      }

      console.log(
        `🌡️ Forecast inputs: temp=${temperatureValue}°C  ` +
          `rain=${rainfallValue}mm  source=${districtWeather?.source ?? "fallback"}`,
      );

      const demandIndexValue = seasonCode === "Maha" ? 0.85 : 0.7;

      const payload = {
        year: safeNumber(formData.year, new Date().getFullYear()),
        week: weekNum,
        district: formData.district || "Anuradhapura",
        season: seasonCode,

        fuel_price: fuelPriceValue,
        rainfall: rainfallValue,
        temperature: temperatureValue,
        demand_index: demandIndexValue,
        import_tax: importTaxValue,
        last_price: lastPriceValue,

        weeks_ahead: 4,
      };

      console.log("📤 RF PAYLOAD (final):", payload);

      const res = await getPriceForecast(payload);

      if (!res.success || !res.weeks || res.weeks.length === 0) {
        throw new Error("Empty forecast");
      }

      setWeeklyForecast(res.weeks);

      // Persist to Supabase (fire-and-forget — errors are swallowed inside)
      saveForecastToSupabase(
        res.weeks,
        payload.year,
        payload.week,
        payload.district,
        payload.season,
        lastPriceValue,
      );

      const first = res.weeks[0];
      const firstWeek = res.weeks[0];

      // USE ACTUAL CONFIDENCE FROM API (not hardcoded)
      const actualConfidence = firstWeek?.confidence_pct ?? 70;
      setConfidenceScore(actualConfidence);

      setPredictedPrice(first.ensemble);

      // AFTER setWeeklyForecast(res.weeks)
      // BEST WEEK INDEX (highest ensemble price)
      const bestIdx = res.weeks.reduce(
        (best, w, i, arr) => (w.ensemble > arr[best].ensemble ? i : best),
        0,
      );

      // SEND NOTIFICATION ONLY ONCE (prevent duplicates)
      if (!notificationSentRef.current) {
        if (bestIdx === 0) {
          await sendNotification(
            language === "si"
              ? "⭐ මේ සතියේම විකිණීම වාසිදායකයි"
              : language === "ta"
                ? "⭐ இந்த வாரமே விற்பது லாபகரமானது"
                : "⭐ Best time to sell is this week",
            language === "si"
              ? "වත්මන් සතියේ ඉහළම මිලක් පුරෝකථනය කර ඇත"
              : language === "ta"
                ? "இந்த வாரம் அதிக விலை எதிர்பார்க்கப்படுகிறது"
                : "The current week has the highest predicted price",
            "price",
          );
        } else {
          const daysToSell = bestIdx * 7;

          await sendNotification(
            language === "si"
              ? `🗓 දින ${daysToSell} කින් විකිණන්න`
              : language === "ta"
                ? `🗓 ${daysToSell} நாட்களில் விற்கவும்`
                : `🗓 Sell in ${daysToSell} days`,
            language === "si"
              ? "හොඳම සතියේ ඉහළම මිල ලැබේ"
              : language === "ta"
                ? "தேர்ந்தெடுக்கப்பட்ட வாரத்தில் சிறந்த விலை எதிர்பார்க்கப்படுகிறது"
                : "Best price expected in the selected week",
            "price",
          );
        }

        notificationSentRef.current = true;
      }

      if (Number.isFinite(lastPriceValue) && lastPriceValue >= 50) {
        const change =
          ((first.ensemble - lastPriceValue) / lastPriceValue) * 100;

        // small-change visibility fix
        const visibleChange = Math.abs(change) < 0.05 ? 0 : change;

        setPriceChange(Math.max(Math.min(visibleChange, 100), -100));
      } else {
        setPriceChange(0);
      }

      // Confidence is now set from API above
      // Recommendation logic — driven by bestIdx and hasStorage
      if (bestIdx === 0) {
        // Best price is this week → sell now
        setRecommendation("sell_now");
        setNoStorageSuggestion(null);
      } else if (formData?.hasStorage) {
        // Better price ahead AND farmer has storage → hold
        setRecommendation("storage");
        setNoStorageSuggestion(null);
      } else {
        // Better price ahead BUT no storage → recommend sell now with a tip
        setRecommendation("sell_now");
        setNoStorageSuggestion(
          language === "si"
            ? `හොඳම මිල ලැබෙන්නේ ${bestIdx + 1} වන සතිය තුළය. ඔබට ගබඩා පහසුකම් නොමැත. කෙසේ වෙතත්, තාවකාලික ගබඩාවක් සොයාගැනීමට හෝ විකිණීම ප්‍රමාද කළ හොත් ඒ සතිය තුළ වැඩි ලාභයක් ලැබිය හැකිය.`
            : language === "ta"
              ? `சிறந்த விலை ${bestIdx + 1} வாரத்தில் எதிர்பார்க்கப்படினும், உங்களிடம் சேமிப்பு வசதி இல்லை. தற்காலிக சேமிப்பை ஏற்பாடு செய்தால் அல்லது விற்பதை தாமதித்தால் அதிக லாபம் கிடைக்கலாம்.`
              : `Although the best price is expected in week ${bestIdx + 1}, you do not have storage. If you can arrange temporary storage or delay selling, you may gain higher profit in that week.`,
        );
      }
    } catch (err) {
      console.log("Forecast error:", err);
      // fallback – (optional) you can keep your old random logic here
    } finally {
      setIsLoadingForecast(false);

      // FADE OUT LOADING ANIMATION
      Animated.timing(loadingOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  // 🌤 Trigger forecast once district weather has been resolved
  useEffect(() => {
    if (hasRunForecastRef.current) return;
    if (districtWeather !== null) {
      hasRunForecastRef.current = true;
      generateForecast();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [districtWeather]);

  const calculateProfit = () => {
    if (!formData) return { revenue: 0, profit: 0, margin: 0 };
    const totalYield = formData.expectedYield * formData.farmArea;
    const price = predictedPrice ?? 0;
    const revenue = totalYield * price;
    const profit = revenue - formData.totalCost;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    return { revenue, profit, margin, totalYield };
  };

  const getBestWeekProfitDifference = () => {
    if (
      !weeklyForecast ||
      weeklyForecast.length === 0 ||
      predictedPrice === null
    )
      return null;

    const totalYield = formData.expectedYield * formData.farmArea;

    // current week profit
    const currentRevenue = totalYield * predictedPrice;
    const currentProfit = currentRevenue - formData.totalCost;

    // best week price
    const bestWeekPrice =
      weeklyForecast[bestWeekIndex]?.ensemble ?? predictedPrice;
    const bestRevenue = totalYield * bestWeekPrice;
    const bestProfit = bestRevenue - formData.totalCost;

    return {
      currentProfit,
      bestProfit,
      difference: bestProfit - currentProfit,
    };
  };

  const getRecommendationText = () => {
    if (recommendation === "sell_now") {
      return content[language].sellNow;
    } else if (recommendation === "storage") {
      return content[language].storageAdvice;
    } else if (recommendation === "sell_immediately") {
      return content[language].sellImmediately;
    } else {
      return content[language].sellLater;
    }
  };

  const getRecommendationColor = () => {
    if (
      recommendation === "sell_now" ||
      recommendation === "sell_immediately"
    ) {
      return "#10B981";
    } else if (recommendation === "storage") {
      return "#3B82F6";
    } else {
      return "#F59E0B";
    }
  };

  // NEW: Calculate trend analysis from weeklyForecast
  const getTrendAnalysis = () => {
    if (weeklyForecast.length < 2) {
      return {
        direction: "stable",
        color: "#F59E0B",
        text: content[language].priceStable,
      };
    }

    const firstPrice = weeklyForecast[0].ensemble;
    const lastPrice = weeklyForecast[weeklyForecast.length - 1].ensemble;
    const priceDiff = lastPrice - firstPrice;
    const percentChange = (priceDiff / firstPrice) * 100;

    if (percentChange > 3) {
      return {
        direction: "up",
        color: "#10B981",
        text: content[language].priceIncreasing,
      };
    } else if (percentChange < -3) {
      return {
        direction: "down",
        color: "#EF4444",
        text: content[language].priceDecreasing,
      };
    } else {
      return {
        direction: "stable",
        color: "#F59E0B",
        text: content[language].priceStable,
      };
    }
  };

  const handleGoBack = () => {
    localNavigation.goBack();
  };

  const handleStartOver = () => {
    notificationSentRef.current = false; // RESET HERE
    localNavigation.navigate("PriceForecastLoadingScreen");
  };

  const { revenue, profit, margin, totalYield } = calculateProfit();
  const trendAnalysis = getTrendAnalysis();
  const bestWeekProfit = getBestWeekProfitDifference();

  // SHOW SELL POPUP after 7 seconds when forecast is ready
  useEffect(() => {
    if (
      weeklyForecast.length > 0 &&
      bestWeekIndex !== -1 &&
      !popupShownRef.current
    ) {
      const timer = setTimeout(() => {
        popupShownRef.current = true;
        setShowSellPopup(true);
        Animated.timing(popupAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }).start();
      }, 7000);

      return () => clearTimeout(timer);
    }
  }, [weeklyForecast, bestWeekIndex]);

  const closePopup = () => {
    Animated.timing(popupAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setShowSellPopup(false));
  };

  // GENERATE VOICE SUMMARY when forecast is ready
  useEffect(() => {
    if (weeklyForecast.length > 0 && predictedPrice !== null) {
      const summaryParams: VoiceSummaryParams = {
        district: formData?.district || "Anuradhapura", // USE FORM DISTRICT
        language,
        currentPrice: predictedPrice,
        weeklyForecast,
        hasStorage: formData?.hasStorage ?? false,
        recommendation,
      };

      const summary = generateVoiceSummary(summaryParams);
      setVoiceSummaryText(summary);
    }
  }, [
    weeklyForecast,
    predictedPrice,
    language,
    recommendation,
    formData?.district,
  ]);

  // HANDLE VOICE PLAYBACK with proper stop
  const handlePlayVoice = async () => {
    if (isSpeaking) {
      // STOP SPEECH
      try {
        await Speech.stop();
        setIsSpeaking(false);
      } catch (error) {
        console.error("Stop speech error:", error);
        setIsSpeaking(false);
      }
    } else {
      // START SPEECH
      if (!voiceSummaryText) return;

      try {
        setIsSpeaking(true);
        await Speech.speak(voiceSummaryText, {
          language:
            language === "si" ? "si-LK" : language === "ta" ? "ta-LK" : "en-US",
          pitch: 1,
          rate: 0.85,
          onDone: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        });
      } catch (error) {
        console.error("Speech error:", error);
        setIsSpeaking(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft color="#047857" size={24} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{content[language].title}</Text>
          <Text style={styles.headerSubtitle}>
            {content[language].subtitle}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => rootNavigation.navigate("Notifications")}
          >
            <Bell size={20} color="#047857" />

            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Sub-header */}
      <View style={styles.subHeader}>
        <View style={styles.infoCard}>
          {getWeatherIcon(weatherCondition)}
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>
              {language === "si"
                ? "ස්ථානය"
                : language === "ta"
                  ? "இடம்"
                  : "Location"}
            </Text>
            <Text style={styles.infoValue}>{district}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoCard}>
          <CloudSun color="#10B981" size={18} />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>
              {language === "si"
                ? "කාලගුණය"
                : language === "ta"
                  ? "வானிலை"
                  : "Weather"}
            </Text>
            <Text style={styles.infoValue}>{weather}</Text>
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
          {/* VOICE SUMMARY CARD - Only show when voice text is ready */}
          {voiceSummaryText && (
            <View style={styles.voiceSummaryCard}>
              <View style={styles.voiceSummaryHeader}>
                <Text style={styles.voiceSummaryTitle}>
                  {language === "si"
                    ? "🎧 ඔබට කිවීම"
                    : language === "ta"
                      ? "🎧 கேளுங்கள்"
                      : "🎧 Listen"}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.voicePlayButton,
                    isSpeaking && styles.voicePlayButtonActive,
                  ]}
                  onPress={handlePlayVoice}
                >
                  <Text style={styles.voicePlayButtonIcon}>
                    {isSpeaking ? "⏹" : "▶"}
                  </Text>
                </TouchableOpacity>
              </View>
              {/* Voice text display */}
              <Text style={styles.voiceSummaryHint}>
                {isSpeaking
                  ? language === "si"
                    ? "(⏹ නැවතීමට ඔබ)"
                    : language === "ta"
                      ? "(⏹ நிறுத்த தட்டவும்)"
                      : "(⏹ Tap to stop)"
                  : language === "si"
                    ? "(ඇසීමට ▶ තට්ටු කරන්න)"
                    : language === "ta"
                      ? "(▶ கேட்க தட்டவும்)"
                      : "(Tap ▶ to listen)"}
              </Text>
            </View>
          )}

          {/* Main Price Card */}
          <View style={styles.priceCard}>
            <View style={styles.priceIconCircle}>
              <DollarSign color="#10B981" size={32} />
            </View>
            <Text style={styles.priceLabel}>
              {content[language].predictedPrice} (
              {getISOWeekRangeWithOffset(
                Number(formData.year),
                Number(formData.week),
                0,
                language,
              )}
              )
            </Text>

            <Text style={styles.priceValue}>
              {predictedPrice === null
                ? "—"
                : `රු. ${predictedPrice.toFixed(2)}`}
            </Text>

            <Text style={styles.priceUnit}>{content[language].perKg}</Text>

            <View
              style={[
                styles.trendBadge,
                {
                  backgroundColor: priceChange >= 0 ? "#D1FAE5" : "#FEE2E2",
                },
              ]}
            >
              {priceChange >= 0 ? (
                <TrendingUp color="#10B981" size={16} />
              ) : (
                <TrendingDown color="#EF4444" size={16} />
              )}
              <Text
                style={[
                  styles.trendText,
                  { color: priceChange >= 0 ? "#047857" : "#DC2626" },
                ]}
              >
                {priceChange >= 0 ? "+" : ""}
                {priceChange.toFixed(1)}%
              </Text>
              <Text style={styles.trendSubtext}>
                {content[language].vsCurrentPrice}
              </Text>
            </View>

            {/* Confidence Score */}
            <View style={styles.confidenceBar}>
              <Text style={styles.confidenceLabel}>
                {content[language].confidence} •{" "}
                {confidenceScore >= 75
                  ? language === "si"
                    ? "ඉහළ"
                    : "High"
                  : language === "si"
                    ? "මධ්‍යම"
                    : "Medium"}
              </Text>

              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${confidenceScore}%`,
                      backgroundColor:
                        confidenceScore >= 80
                          ? "#10B981"
                          : confidenceScore >= 60
                            ? "#F59E0B"
                            : "#EF4444",
                    },
                  ]}
                />
              </View>
              <Text style={styles.confidenceValue}>{confidenceScore}%</Text>
            </View>
          </View>

          {/* ========== NEW: PRICE TREND CHART ========== */}
          {weeklyForecast.length > 0 && (
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>
                📊 {content[language].priceTrend}
              </Text>

              <LineChart
                data={{
                  labels: weeklyForecast.map((w) => `W${w.week}`),
                  datasets: [
                    {
                      data: weeklyForecast.map((w) => w.ensemble),
                      color: () => trendAnalysis.color,
                      strokeWidth: 3,
                    },
                  ],
                }}
                width={width - 60}
                height={220}
                chartConfig={{
                  backgroundColor: "#FFFFFF",
                  backgroundGradientFrom: "#F0FDF4",
                  backgroundGradientTo: "#FFFFFF",
                  decimalPlaces: 2,
                  color: (opacity = 1) => trendAnalysis.color,
                  labelColor: (opacity = 1) => `rgba(6, 95, 70, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: trendAnalysis.color,
                    fill: "#FFFFFF",
                  },
                  propsForBackgroundLines: {
                    strokeDasharray: "",
                    stroke: "#D1FAE5",
                    strokeWidth: 1,
                  },
                }}
                bezier
                style={styles.chart}
              />

              <View
                style={[
                  styles.trendSummary,
                  { borderLeftColor: trendAnalysis.color },
                ]}
              >
                <Text
                  style={[
                    styles.trendSummaryText,
                    { color: trendAnalysis.color },
                  ]}
                >
                  {trendAnalysis.text}
                </Text>
              </View>
            </View>
          )}
          {/* ========== END: PRICE TREND CHART ========== */}

          {bestWeekProfit && (
            <View style={styles.bestProfitCard}>
              <Text style={styles.bestProfitTitle}>
                📊{" "}
                {language === "si"
                  ? bestWeekIndex === 0
                    ? "වත්මන් සතිය හොඳමය"
                    : "හොඳම සතියේ අමතර ලාභය"
                  : language === "ta"
                    ? bestWeekIndex === 0
                      ? "இந்த வாரம் சிறந்தது"
                      : "சிறந்த வாரத்தில் கூடுதல் லாபம்"
                    : bestWeekIndex === 0
                      ? "Current Week is the Best"
                      : "Extra Profit in Best Week"}
              </Text>

              {bestWeekProfit.difference > 0 ? (
                <>
                  <Text style={styles.bestProfitValue}>
                    රු. {bestWeekProfit.difference.toFixed(0)}
                  </Text>
                  <Text style={styles.bestProfitSub}>
                    {language === "si"
                      ? "වත්මන් සතියට වඩා හොඳම සතියේ විකිණුවොත් ලැබෙන අමතර ලාභය"
                      : language === "ta"
                        ? "சிறந்த வாரத்தில் விற்பதால் கிடைக்கும் கூடுதல் லாபம்"
                        : "Additional profit if you sell in the best week instead of this week"}
                  </Text>
                </>
              ) : (
                <Text style={styles.bestProfitSub}>
                  {language === "si"
                    ? "වත්මන් සතියේ විකිණීමෙන් උපරිම ලාභය ලබාගත හැක"
                    : language === "ta"
                      ? "இந்த வாரம் விற்பது அதிக லாபம் தரும்"
                      : "Selling in the current week gives the maximum profit"}
                </Text>
              )}
            </View>
          )}

          {/* SELL AT BEST PRICE BUTTON — after Best Profit card */}
          {weeklyForecast.length > 0 && (
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: "#0EA5E9", marginBottom: 20 },
              ]}
              onPress={() => {
                localNavigation.navigate("CreatePostScreen", {
                  bestPrice:
                    weeklyForecast[bestWeekIndex]?.ensemble ??
                    predictedPrice ??
                    0,
                  formData,
                });
              }}
            >
              <Package color="#FFFFFF" size={20} />
              <Text style={styles.primaryButtonText}>
                {language === "si"
                  ? "හොඳම මිලට දැන් විකිණීමට දාන්න"
                  : language === "ta"
                    ? "சிறந்த விலையில் இப்போது விற்கவும்"
                    : "Sell at Best Price"}
              </Text>
            </TouchableOpacity>
          )}

          {/* Recommendation Card */}
          <View
            style={[
              styles.recommendationCard,
              { borderLeftColor: getRecommendationColor() },
            ]}
          >
            <View style={styles.recommendationHeader}>
              <CheckCircle color={getRecommendationColor()} size={24} />
              <Text style={styles.recommendationTitle}>
                {content[language].recommendation}
              </Text>
            </View>
            <Text style={styles.recommendationText}>
              {getRecommendationText()}
            </Text>
            {formData?.hasStorage && recommendation === "storage" && (
              <View style={styles.storageNote}>
                <Package color="#3B82F6" size={16} />
                <Text style={styles.storageNoteText}>
                  {language === "si"
                    ? "ඔබට ගබඩා පහසුකම් ඇත - මිල වැඩිවන තුරු රඳවා තබන්න"
                    : language === "ta"
                      ? "உங்களிடம் சேமிப்பு உள்ளது - விலை உயரும் வரை வைத்திருங்கள்"
                      : "You have storage - hold until price increases"}
                </Text>
              </View>
            )}
            {noStorageSuggestion && (
              <View
                style={[
                  styles.storageNote,
                  {
                    backgroundColor: "#FEF3C7",
                    borderColor: "#F59E0B",
                    borderWidth: 1,
                    borderRadius: 8,
                    marginTop: 8,
                  },
                ]}
              >
                <Package color="#D97706" size={16} />
                <Text style={[styles.storageNoteText, { color: "#92400E" }]}>
                  {noStorageSuggestion}
                </Text>
              </View>
            )}
          </View>

          {/* Next 4 weeks forecast list */}
          {weeklyForecast.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {language === "si"
                  ? "අලුත් සති 4 කට මිල පුරෝකථනය"
                  : language === "ta"
                    ? "அடுத்த 4 வார விலை மதிப்பீடு"
                    : "Next 4 Weeks Price Forecast"}
              </Text>

              {/* Dynamic Best Week Message */}
              {getBestWeekMessage() && (
                <Text style={styles.bestWeekInfoText}>
                  {getBestWeekMessage()}
                </Text>
              )}

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 20 }}
                style={{ marginTop: 8 }}
              >
                {weeklyForecast.map((w, index) => {
                  const isBest = index === bestWeekIndex;
                  // DEFINE VARIABLES HERE (JS scope)
                  const confPct = w.confidence_pct ?? 70;
                  const confTag = w.confidence_tag ?? "Medium";

                  return (
                    <View
                      key={w.week}
                      style={[styles.weekCard, isBest && styles.bestWeekCard]}
                    >
                      {/* BEST WEEK BADGE */}
                      {isBest && (
                        <View style={styles.bestBadge}>
                          <Text style={styles.bestBadgeText}>
                            ⭐ {language === "si" ? "හොඳම සතිය" : "Best Week"}
                          </Text>
                        </View>
                      )}
                      {/* WEEK DATE RANGE */}
                      <Text style={styles.weekLabel}>
                        {getISOWeekRangeWithOffset(
                          Number(formData.year),
                          Number(formData.week),
                          index,
                          language,
                        )}
                      </Text>
                      {/* PRICE */}
                      <Text style={styles.weekPrice}>
                        Rs {w.ensemble.toFixed(2)}
                      </Text>
                      <View
                        style={[
                          styles.confBadge,
                          {
                            backgroundColor:
                              confTag === "High" ? "#D1FAE5" : "#FEF3C7",
                            borderColor:
                              confTag === "High" ? "#10B981" : "#F59E0B",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.confBadgeText,
                            {
                              color: confTag === "High" ? "#047857" : "#92400E",
                            },
                          ]}
                        >
                          {confTag === "High"
                            ? language === "si"
                              ? `ඉහළ • ${confPct.toFixed(0)}%`
                              : language === "ta"
                                ? `அதிகம் • ${confPct.toFixed(0)}%`
                                : `High • ${confPct.toFixed(0)}%`
                            : language === "si"
                              ? `මධ්‍යම • ${confPct.toFixed(0)}%`
                              : language === "ta"
                                ? `நடுத்தரம் • ${confPct.toFixed(0)}%`
                                : `Medium • ${confPct.toFixed(0)}%`}
                        </Text>
                      </View>

                      {/* MODEL DETAILS 
                      <Text style={styles.weekSub}>
                        SARIMAX: {w.sarimax.toFixed(1)} | Ensemble:{" "}
                        {w.ensemble.toFixed(1)}
                      </Text> */}
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Profit Analysis */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              💰 {content[language].profitAnalysis}
            </Text>

            <View style={styles.profitGrid}>
              <View style={styles.profitCard}>
                <Leaf color="#10B981" size={20} />
                <Text style={styles.profitLabel}>
                  {content[language].totalYield}
                </Text>
                <Text style={styles.profitValue}>
                  {(totalYield ?? 0).toFixed(0)} {content[language].kg}
                </Text>
              </View>

              <View style={styles.profitCard}>
                <DollarSign color="#3B82F6" size={20} />
                <Text style={styles.profitLabel}>
                  {content[language].totalRevenue}
                </Text>
                <Text style={styles.profitValue}>රු. {revenue.toFixed(0)}</Text>
              </View>

              <View style={styles.profitCard}>
                <DollarSign color="#EF4444" size={20} />
                <Text style={styles.profitLabel}>
                  {content[language].totalCost}
                </Text>
                <Text style={styles.profitValue}>
                  රු. {formData?.totalCost.toFixed(0) || 0}
                </Text>
              </View>

              <View style={[styles.profitCard, styles.profitCardHighlight]}>
                <TrendingUp color="#10B981" size={20} />
                <Text style={styles.profitLabel}>
                  {content[language].expectedProfit}
                </Text>
                <Text style={[styles.profitValue, styles.profitValueHighlight]}>
                  රු. {profit.toFixed(0)}
                </Text>
                <Text style={styles.profitMargin}>
                  {margin.toFixed(1)}% {content[language].profitMargin}
                </Text>
              </View>
            </View>
          </View>

          {/* Market Factors */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              📊 {content[language].marketFactors}
            </Text>

            <View style={styles.factorsList}>
              <View style={styles.factorItem}>
                <View style={styles.factorIcon}>
                  <Leaf color="#10B981" size={18} />
                </View>
                <View style={styles.factorContent}>
                  <Text style={styles.factorLabel}>
                    {content[language].seasonEffect}
                  </Text>
                  <Text style={styles.factorValue}>
                    {formData?.season} - {content[language].high}
                  </Text>
                </View>
                <View style={[styles.factorBadge, styles.factorBadgePositive]}>
                  <Text style={styles.factorBadgeText}>
                    {content[language].positive}
                  </Text>
                </View>
              </View>

              <View style={styles.factorItem}>
                <View style={styles.factorIcon}>
                  <CloudSun color="#3B82F6" size={18} />
                </View>
                <View style={styles.factorContent}>
                  <Text style={styles.factorLabel}>
                    {content[language].weatherEffect}
                  </Text>
                  <Text style={styles.factorValue}>
                    {content[language].medium}
                  </Text>
                </View>
                <View style={[styles.factorBadge, styles.factorBadgeNeutral]}>
                  <Text style={styles.factorBadgeText}>
                    {content[language].neutral}
                  </Text>
                </View>
              </View>

              <View style={styles.factorItem}>
                <View style={styles.factorIcon}>
                  <DollarSign color="#F59E0B" size={18} />
                </View>
                <View style={styles.factorContent}>
                  <Text style={styles.factorLabel}>
                    {content[language].fuelEffect}
                  </Text>
                  <Text style={styles.factorValue}>
                    {formData?.fuelPrice} -{" "}
                    {(() => {
                      const currentFuelStr =
                        String(formData?.fuelPrice).replace(/[^0-9.]/g, "") ||
                        "0";
                      const prevFuelStr =
                        String(formData?.prevWeekFuelPrice).replace(
                          /[^0-9.]/g,
                          "",
                        ) || currentFuelStr;
                      const currentFuel = parseFloat(currentFuelStr) || 0;
                      const prevFuel = parseFloat(prevFuelStr) || currentFuel;

                      if (currentFuel > prevFuel) {
                        return content[language].high;
                      } else if (currentFuel < prevFuel) {
                        return content[language].low;
                      }
                      return content[language].positive;
                    })()}
                  </Text>
                </View>
                <View
                  style={[
                    styles.factorBadge,
                    (() => {
                      const currentFuelStr =
                        String(formData?.fuelPrice).replace(/[^0-9.]/g, "") ||
                        "0";
                      const prevFuelStr =
                        String(formData?.prevWeekFuelPrice).replace(
                          /[^0-9.]/g,
                          "",
                        ) || currentFuelStr;
                      const currentFuel = parseFloat(currentFuelStr) || 0;
                      const prevFuel = parseFloat(prevFuelStr) || currentFuel;

                      return currentFuel > prevFuel
                        ? styles.factorBadgeNegative
                        : currentFuel < prevFuel
                          ? styles.factorBadgePositive
                          : styles.factorBadgeNeutral;
                    })(),
                  ]}
                >
                  <Text style={styles.factorBadgeText}>
                    {(() => {
                      const currentFuelStr =
                        String(formData?.fuelPrice).replace(/[^0-9.]/g, "") ||
                        "0";
                      const prevFuelStr =
                        String(formData?.prevWeekFuelPrice).replace(
                          /[^0-9.]/g,
                          "",
                        ) || currentFuelStr;
                      const currentFuel = parseFloat(currentFuelStr) || 0;
                      const prevFuel = parseFloat(prevFuelStr) || currentFuel;

                      if (currentFuel > prevFuel) {
                        return content[language].negative;
                      } else if (currentFuel < prevFuel) {
                        return content[language].positive;
                      }
                      return content[language].positive;
                    })()}
                  </Text>
                </View>
              </View>

              <View style={styles.factorItem}>
                <View style={styles.factorIcon}>
                  <Package color="#8B5CF6" size={18} />
                </View>
                <View style={styles.factorContent}>
                  <Text style={styles.factorLabel}>
                    {content[language].importEffect}
                  </Text>
                  <Text style={styles.factorValue}>
                    {formData?.cornImportTax}
                  </Text>
                </View>
                <View style={[styles.factorBadge, styles.factorBadgePositive]}>
                  <Text style={styles.factorBadgeText}>
                    {content[language].positive}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleStartOver}
          >
            <RefreshCw color="#FFFFFF" size={20} />
            <Text style={styles.primaryButtonText}>
              {content[language].newForecast}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleGoBack}
          >
            <Text style={styles.secondaryButtonText}>
              {content[language].backToForm}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </Animated.View>
      </ScrollView>

      {/* SELL POPUP MODAL */}
      <Modal
        transparent
        visible={showSellPopup}
        animationType="none"
        onRequestClose={closePopup}
      >
        <View style={styles.popupOverlay}>
          <Animated.View
            style={[
              styles.popupBox,
              {
                opacity: popupAnim,
                transform: [
                  {
                    scale: popupAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.88, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.popupTitle}>
              {language === "si"
                ? "⭐ හොඳම විකිණීමේ අවස්ථාව!"
                : language === "ta"
                  ? "⭐ சிறந்த விற்பனை வாய்ப்பு!"
                  : "⭐ Best Selling Opportunity!"}
            </Text>
            <Text style={styles.popupMessage}>
              {language === "si"
                ? "හොඳම මිල ලැබෙන දිනයේ විකිණීමට දාන්න පුළුවන්."
                : language === "ta"
                  ? "சிறந்த விலை கிடைக்கும் நாளில் விற்கலாம்."
                  : "You can sell on the best predicted price date."}
            </Text>
            <TouchableOpacity
              style={styles.popupPrimaryBtn}
              onPress={() => {
                closePopup();
                localNavigation.navigate("CreatePostScreen", {
                  bestPrice:
                    weeklyForecast[bestWeekIndex]?.ensemble ??
                    predictedPrice ??
                    0,
                  formData,
                });
              }}
            >
              <Package color="#FFFFFF" size={18} />
              <Text style={styles.popupPrimaryBtnText}>
                {language === "si"
                  ? "හොඳම මිලට දැන් විකිණීමට දාන්න"
                  : language === "ta"
                    ? "சிறந்த விலையில் இப்போது விற்கவும்"
                    : "Sell at Best Price"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.popupSecondaryBtn}
              onPress={closePopup}
            >
              <Text style={styles.popupSecondaryBtnText}>
                {language === "si"
                  ? "පසුව"
                  : language === "ta"
                    ? "பின்னர்"
                    : "Later"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* LOADING OVERLAY */}
      {isLoadingForecast && (
        <Animated.View
          style={[
            styles.loadingOverlay,
            {
              opacity: loadingOpacity,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.loadingContent,
              {
                transform: [{ scale: loadingScale }],
              },
            ]}
          >
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>
              {language === "si"
                ? "විශ්ලේෂණය කරමින්..."
                : language === "ta"
                  ? "பகுப்பாய்வு செய்கிறது..."
                  : "Analyzing..."}
            </Text>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
};

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
  langButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#10B981",
  },
  langText: {
    color: "#10B981",
    fontSize: 12,
    fontWeight: "bold",
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
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#047857",
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 12,
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
  priceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#10B981",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  priceIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
    fontWeight: "500",
  },
  priceValue: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#10B981",
    marginBottom: 4,
  },
  priceUnit: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 20,
  },
  trendText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  trendSubtext: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  confidenceBar: {
    width: "100%",
    alignItems: "center",
  },
  confidenceLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 8,
    fontWeight: "500",
  },
  progressBarContainer: {
    width: "100%",
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 10,
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#047857",
  },
  // NEW CHART STYLES
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
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#065F46",
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  trendSummary: {
    marginTop: 16,
    padding: 14,
    backgroundColor: "#F0FDF4",
    borderRadius: 10,
    borderLeftWidth: 4,
  },
  trendSummaryText: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  recommendationCard: {
    backgroundColor: "#ECFDF5",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
  },
  recommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#047857",
  },
  recommendationText: {
    fontSize: 16,
    color: "#065F46",
    lineHeight: 24,
    fontWeight: "500",
  },
  storageNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: "#DBEAFE",
    borderRadius: 10,
  },
  storageNoteText: {
    flex: 1,
    fontSize: 13,
    color: "#1E40AF",
    fontWeight: "500",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#065F46",
    marginBottom: 16,
  },
  profitGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  profitCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    width: "48%",
    borderWidth: 1,
    borderColor: "#D1FAE5",
    alignItems: "center",
  },
  profitCardHighlight: {
    width: "100%",
    backgroundColor: "#ECFDF5",
    borderWidth: 2,
    borderColor: "#10B981",
  },
  profitLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
    fontWeight: "500",
  },
  profitValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#047857",
    marginTop: 6,
    textAlign: "center",
  },
  profitValueHighlight: {
    fontSize: 24,
    color: "#10B981",
  },
  profitMargin: {
    fontSize: 11,
    color: "#059669",
    marginTop: 4,
    fontWeight: "600",
  },
  factorsList: {
    gap: 12,
  },
  factorItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  factorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  factorContent: {
    flex: 1,
  },
  factorLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 4,
    fontWeight: "500",
  },
  factorValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  factorBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  factorBadgePositive: {
    backgroundColor: "#D1FAE5",
  },
  factorBadgeNegative: {
    backgroundColor: "#FEE2E2",
  },
  factorBadgeNeutral: {
    backgroundColor: "#FEF3C7",
  },
  factorBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#10B981",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  secondaryButton: {
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 12,
  },
  secondaryButtonText: {
    color: "#059669",
    fontSize: 16,
    fontWeight: "600",
  },
  detailItem: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 6,
    fontWeight: "500",
  },
  savedItem: {
    fontSize: 12,
    color: "#374151",
    marginBottom: 4,
  },
  savedTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#065F46",
    marginBottom: 10,
  },
  weekCard: {
    width: width * 0.78,
    maxWidth: 320,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#D1FAE5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  weekLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 4,
    fontWeight: "500",
  },
  weekPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#047857",
    marginBottom: 4,
  },
  weekSub: {
    fontSize: 11,
    color: "#6B7280",
  },
  bestWeekCard: {
    borderColor: "#10B981",
    borderWidth: 2,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },

  bestBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#10B981",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  bestBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  bestWeekInfoText: {
    fontSize: 13,
    color: "#047857",
    fontWeight: "600",
    marginBottom: 12,
    backgroundColor: "#ECFDF5",
    padding: 10,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  bestProfitCard: {
    backgroundColor: "#ECFDF5",
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#10B981",
    alignItems: "center",
  },

  bestProfitTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#065F46",
    marginBottom: 8,
    textAlign: "center",
  },

  bestProfitValue: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#10B981",
    marginBottom: 6,
  },

  bestProfitSub: {
    fontSize: 13,
    color: "#047857",
    textAlign: "center",
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    paddingHorizontal: 5,
    minWidth: 16,
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  confBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 8,
  },
  confBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  // VOICE SUMMARY STYLES
  voiceSummaryCard: {
    backgroundColor: "#E0F2FE",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#0284C7",
    shadowColor: "#0284C7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  voiceSummaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  voiceSummaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0C4A6E",
  },
  voicePlayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0284C7",
    justifyContent: "center",
    alignItems: "center",
  },
  voicePlayButtonActive: {
    backgroundColor: "#F59E0B",
  },
  voicePlayButtonIcon: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  voiceSummaryText: {
    fontSize: 15,
    color: "#0C4A6E",
    lineHeight: 24,
    fontWeight: "500",
    marginBottom: 10,
  },
  voiceSummaryHint: {
    fontSize: 12,
    color: "#0284C7",
    fontStyle: "italic",
    textAlign: "right",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  loadingContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
  },
  // POPUP STYLES
  popupOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  popupBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 28,
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  popupTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#065F46",
    textAlign: "center",
    marginBottom: 12,
  },
  popupMessage: {
    fontSize: 15,
    color: "#374151",
    textAlign: "center",
    lineHeight: 23,
    marginBottom: 24,
  },
  popupPrimaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#0EA5E9",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: "100%",
    marginBottom: 10,
  },
  popupPrimaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  popupSecondaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  popupSecondaryBtnText: {
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "600",
  },
});

export default PriceForecastScreen;
