// client/src/screens/PriceForecast/PriceAdvisorScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  TextInput,
  Modal,
  Platform,
} from "react-native";
import {
  useNavigation,
  useRoute,
  NavigationProp,
} from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import {
  ArrowLeft,
  Bell,
  Leaf,
  CloudSun,
  Cloud,
  CloudDrizzle,
  CloudRain,
  CloudLightning,
  CloudFog,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  DollarSign,
  Calendar,
  X,
  Archive,
} from "lucide-react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import useUniversalLocation from "../../utils/useUniversalLocation";
import { useLanguage } from "../../context/LanguageContext";
import { useNotifications } from "../../context/NotificationContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";

type CircularProgressProps = {
  percent: number;
};

const CircularProgress: React.FC<CircularProgressProps> = ({ percent }) => {
  const size = 120;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const strokeDashoffset = circumference - (circumference * percent) / 100;

  return (
    <View style={{ alignItems: "center", marginVertical: 16 }}>
      <Svg width={size} height={size}>
        <Defs>
          {/* Gradient definition */}
          <LinearGradient
            id="progressGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <Stop offset="0%" stopColor="#22C55E" />
            <Stop offset="40%" stopColor="#F59E0B" />
            <Stop offset="70%" stopColor="#EC4899" />
            <Stop offset="100%" stopColor="#8B5CF6" />
          </LinearGradient>
        </Defs>

        {/* Background circle */}
        <Circle
          stroke="#E5E7EB"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />

        {/* Gradient progress circle */}
        <Circle
          stroke="url(#progressGradient)"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      {/* Center Text */}
      <View
        style={{
          position: "absolute",
          alignItems: "center",
          justifyContent: "center",
          height: size,
          width: size,
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "#111827" }}>
          {percent}%
        </Text>
        <Text style={{ fontSize: 13, color: "#374151", marginTop: 2 }}>
          Ready
        </Text>
      </View>
    </View>
  );
};

const { width } = Dimensions.get("window");

type Language = "si" | "en";

type RootStackParamList = {
  PriceForecastFormScreen: undefined;
  WeatherForecastScreen: undefined;
  PriceAdvisorScreen: { formData: any } | undefined;
  Notifications: undefined;
};

interface RouteParams {
  formData?: {
    cropDuration?: number;
    cost?: number;
    yieldKg?: number;
  };
}

interface AdvisorFormData {
  district: string;
  plantingDateExact: string;
  seedVariety: string;
  area: string;

  // ✅ Decision-Support extra fields
  budgetLevel: "low" | "medium" | "high";
  experienceLevel: "new" | "some" | "experienced";
  hasIrrigation: boolean;

  readiness: {
    seeds: boolean;
    water: boolean;
    land: boolean;
    fertilizer: boolean;
    capital: boolean;
  };
}

// Dynamic API URL based on platform
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

type QuestionKey =
  | "start_now"
  | "before_start"
  | "district_time"
  | "biggest_risk"
  | "need_professional";

const VARIETY_DURATION_WEEKS: Record<string, number> = {
  "GT 709": 16,
  "GT 200": 15,
  "Pacific 808": 17,
  "Jet 999": 16,
  Commando: 15,
  "Local Variety": 14,
  Unknown: 14,
};

const DISTRICT_TO_API_LOCATION: Record<string, string> = {
  අනුරාධපුර: "Anuradapura",
  මොණරාගල: "Monaragala",
  තිස්සමහාරාමය: "Tissamaharama",
  // If user already selected English, keep as-is:
  Anuradhapura: "Anuradhapura",
  Monaragala: "Monaragala",
  Tissamaharama: "Tissamaharama",
};

const toApiLocation = (district: string) => {
  const d = (district || "").trim();
  return DISTRICT_TO_API_LOCATION[d] || d; // fallback
};

const SEED_VARIETIES = [
  "GT 709",
  "GT 200",
  "Pacific 808",
  "Jet 999",
  "Commando",
  "Local Variety",
  "Unknown",
];

const PriceAdvisorScreen: React.FC = () => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute();
  const params = (route.params as RouteParams) || {};
  const { unreadCount } = useNotifications();
  type RootNavProp = StackNavigationProp<RootStackParamList>;
  const rootNavigation = useNavigation<RootNavProp>();
  const { language: globalLang, setLanguage: setAppLanguage } = useLanguage();
  const language: Language = globalLang === "sinhala" ? "si" : "en";
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [showForm, setShowForm] = useState(true);
  const [formSlideAnim] = useState(new Animated.Value(0));
  const [formOpacityAnim] = useState(new Animated.Value(1));
  // Calendar & Variety Picker Modals
  const [showVarietyPicker, setShowVarietyPicker] = useState(false);
  const [priceWindowResult, setPriceWindowResult] = useState<any | null>(null);
  const [priceWindowLoading, setPriceWindowLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [harvestAdvisoryResult, setHarvestAdvisoryResult] = useState<
    any | null
  >(null);
  const [harvestAdvisoryLoading, setHarvestAdvisoryLoading] = useState(false);

  const {
    locationName,
    temperature,
    weatherCondition,
    isLoading: isWeatherLoading,
  } = useUniversalLocation(language);

  const T = {
    si: {
      headerTitle: "වගාව ආරම්භ කිරීමට උපදෙස්",
      headerSubtitle: "අලුතින් වගාව පටන් ගන්න ඔබට මගපෙන්වීම",
      location: "ස්ථානය",
      weather: "කාලගුණය",
      quickQuestionsTitle: "ඉක්මන් ප්‍රශ්න 5",
      fullFormTitle: "සම්පූර්ණ වගා උපදෙස් (උසස් මාදිලිය)",
      resultTitle: "ඔබ සඳහා වගා උපදෙස්",
      q1: "මං දැන් වගාව ආරම්භ කළොත් හොඳද?",
      q2: "මට වගාව ආරම්භ කිරීමට පෙර දැනගත යුතු දේ මොනවාද?",
      q3: "මගේ දිස්ත්‍රික්කය සඳහා මේ කාලය සුදුසුද?",
      q4: "වගාව ආරම්භ කිරීමේදී වැඩිම අවදානම මොනවාද?",
      q5: "වෘත්තීය උපදෙස් ලබාගන්න ඕනද?",
      formDistrict: "දිස්ත්‍රික්කය",
      formVariety: "බීජ වර්ගය",
      formArea: "වැවිලි භූමි ප්‍රමාණය (ha / acre)",
      formCost: "මුළු වියදම (රු.)",
      formYield: "අපේක්ෂිත අස්වැන්න (කි.ග්‍රෑ / ප්‍රමාණ ඒකකය)",
      btnRunFullAdvisor: "සම්පූර්ණ වගා උපදෙස් ලබාගන්න",
      noQuestionSelected: "කරුණාකර ප්‍රශ්නයක් තෝරන්න හෝ පෝරමය පුරවන්න.",
      weatherLoading: "කාලගුණ දත්ත ලබාගැනෙමින්...",
      rs: "රු.",
      kg: "කි.ග්‍රෑ",
      notAvailable: "දත්ත නොමැත",
      advisorTagGood: "හොඳ කාලයක්",
      advisorTagWarn: "අවදානම්",
      advisorTagInfo: "වගා සැලසුම සකසන්න",
      editInputs: "ආදාන සංස්කරණය කරන්න",
      selectDate: "දිනය තෝරන්න",
      selectVariety: "බීජ වර්ගය තෝරන්න",
      cancel: "අවලංගු",
      select: "තෝරන්න",
    },
    en: {
      headerTitle: "Start Farming Advisor",
      headerSubtitle: "Guidance for farmers starting cultivation",
      location: "Location",
      weather: "Weather",
      quickQuestionsTitle: "Quick Questions (5)",
      fullFormTitle: "Full Cultivation Advisor (Advanced)",
      resultTitle: "Advisor Result for You",
      q1: "Is it okay to start farming now?",
      q2: "What should I know before starting cultivation?",
      q3: "Is this a suitable time for my district?",
      q4: "What are the biggest risks when starting?",
      q5: "Do I need professional advice?",
      formDistrict: "District",
      formVariety: "Seed Variety",
      formArea: "Farm Area (ha / acre)",
      formYield: "Expected Yield (kg / unit area)",
      btnRunFullAdvisor: "Run Full Advisor",
      noQuestionSelected: "Select a question or fill the form to see advice.",
      weatherLoading: "Fetching weather data...",
      rs: "Rs.",
      kg: "kg",
      notAvailable: "N/A",
      advisorTagGood: "Good window",
      advisorTagWarn: "Risky",
      advisorTagInfo: "Plan carefully",
      editInputs: "Edit Inputs",
      selectDate: "Select Date",
      selectVariety: "Select Seed Variety",
      cancel: "Cancel",
      select: "Select",
    },
  } as const;

  const t = T[language];

  const [form, setForm] = useState<AdvisorFormData>({
    district: "",
    plantingDateExact: "",
    seedVariety: "",
    area: "",

    budgetLevel: "medium",
    experienceLevel: "new",
    hasIrrigation: false,

    readiness: {
      seeds: false,
      water: false,
      land: false,
      fertilizer: false,
      capital: false,
    },
  });

  const [selectedQuestion, setSelectedQuestion] = useState<QuestionKey | null>(
    null
  );
  const [quickAnswer, setQuickAnswer] = useState<string | null>(null);

  const [fullAdvisorText, setFullAdvisorText] = useState<string | null>(null);
  const [fullAdvisorTag, setFullAdvisorTag] = useState<
    "good" | "warn" | "info" | null
  >(null);

  // ✅ Extract best option from backend response (supports multiple shapes)
  const getHarvestBest = (res: any) => {
    if (!res) return null;

    // If backend returns best_option directly
    if (res.best_option) return res.best_option;

    // If backend returns options_checked array
    if (Array.isArray(res.options_checked) && res.options_checked.length > 0) {
      return res.options_checked.reduce((best: any, cur: any) =>
        (cur.score ?? 0) > (best.score ?? 0) ? cur : best
      );
    }

    return null;
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const getMonthLabelFromISO = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";

    // month index 0-11
    const idx = d.getMonth();

    const monthsSi = [
      "ජනවාරි",
      "පෙබරවාරි",
      "මාර්තු",
      "අප්‍රේල්",
      "මැයි",
      "ජූනි",
      "ජූලි",
      "අගෝස්තු",
      "සැප්තැම්බර්",
      "ඔක්තෝබර්",
      "නොවැම්බර්",
      "දෙසැම්බර්",
    ];

    const monthsEn = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return language === "si" ? monthsSi[idx] : monthsEn[idx];
  };

  // ===============================
  // STEP 1: COMPUTED VALUES (MOVE HERE)
  // ===============================

  const harvestBest = getHarvestBest(harvestAdvisoryResult);

  const computedDelayWeeks =
    harvestBest?.delay_weeks ??
    harvestAdvisoryResult?.delay_weeks ??
    (harvestAdvisoryResult?.base_harvest_week &&
    harvestAdvisoryResult?.best_harvest_week
      ? Math.max(
          harvestAdvisoryResult?.best_harvest_week -
            harvestAdvisoryResult?.base_harvest_week,
          0
        )
      : 0);

  const computedBaseWeek =
    harvestAdvisoryResult?.base_harvest_week ?? harvestBest?.harvest_week;

  const computedBestWeek =
    harvestAdvisoryResult?.best_harvest_week ?? harvestBest?.harvest_week;

  // ✅ Week ordinal for Sinhala / English
  const weekOrdinal = (n: number, lang: "si" | "en") => {
    if (lang === "si") return `${n} වන`;
    // English ordinals
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
  };

  // ✅ Get week-of-month from a Date (1..5)
  const getWeekOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfMonth = date.getDate();
    const firstDayWeekday = firstDay.getDay(); // 0=Sun..6=Sat
    return Math.ceil((dayOfMonth + firstDayWeekday) / 7);
  };

  // ✅ Convert ISO date (YYYY-MM-DD) -> {year, monthLabel, weekOfMonth}
  const parseISOToMonthWeek = (iso: string, lang: "si" | "en") => {
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;

    const year = d.getFullYear();
    const monthLabel = getMonthLabelFromISO(iso);
    const wom = getWeekOfMonth(d);

    return { year, monthLabel, weekOfMonth: wom };
  };

  const isoWeekToMonthWeekLabel = (
    isoWeek: number,
    year: number,
    lang: "si" | "en"
  ) => {
    const simple = new Date(year, 0, 1 + (isoWeek - 1) * 7);

    // shift to Monday
    const day = simple.getDay();
    const diffToMon = (day === 0 ? -6 : 1) - day;
    simple.setDate(simple.getDate() + diffToMon);

    const monthIdx = simple.getMonth();
    const wom = getWeekOfMonth(simple);

    const iso = `${simple.getFullYear()}-${String(monthIdx + 1).padStart(
      2,
      "0"
    )}-${String(simple.getDate()).padStart(2, "0")}`;
    const monthLabel = getMonthLabelFromISO(iso);

    return {
      year: simple.getFullYear(),
      monthLabel,
      weekOfMonth: wom,
      approxDateISO: iso,
    };
  };

  // ✅ Label -> farmer-friendly word
  const signalToFarmerWord = (label: string, lang: "si" | "en") => {
    const L = (label || "").toUpperCase();
    if (lang === "si") {
      if (L === "STRONG") return "මිල ඉහළ යාමේ හැකියාව වැඩිය";
      if (L === "WEAK") return "මිල අඩුවීමේ අවදානම වැඩිය";
      return "මිල සාමාන්‍ය මට්ටමේ";
    } else {
      if (L === "STRONG") return "Higher chance of higher prices";
      if (L === "WEAK") return "Higher risk of lower prices";
      return "Prices are usually moderate";
    }
  };

  const buildFarmerFriendlyPlanText = (args: {
    lang: "si" | "en";
    plantingDateISO: string; // form.plantingDateExact
    bestPlantingWeek?: number; // priceWindowResult.best_option.planting_week
    bestHarvestWeek?: number; // priceWindowResult.best_option.harvest_week OR harvestAdvisoryResult.best_harvest_week
    harvestSignalLabel?: string; // STRONG / MODERATE / WEAK / HOLD
    confidence?: string; // "High"
    delayWeeks?: number; // ✅ NEW
    baseHarvestWeek?: number; // ✅ optional, if backend provides
    plantingWeekOfYear?: number;
  }) => {
    const {
      lang,
      plantingDateISO,
      bestPlantingWeek,
      bestHarvestWeek,
      harvestSignalLabel,
      confidence,
      plantingWeekOfYear,
    } = args;

    const p = parseISOToMonthWeek(plantingDateISO, lang);
    if (!p) return null;

    // 1️⃣ Planting advice (month + week-of-month)
    const plantingLine =
      lang === "si"
        ? `${p.year} ${p.monthLabel} මාසයේ ${weekOrdinal(
            p.weekOfMonth,
            "si"
          )} සතියේ ඔබ වගාව ආරම්භ කිරීම සුදුසුය.`
        : `It is suitable to start cultivation in the ${weekOrdinal(
            p.weekOfMonth,
            "en"
          )} week of ${p.monthLabel} ${p.year}.`;

    // 2️⃣ Harvest + selling advice (IMPORTANT FIX)
    let harvestLine = "";

    if (bestHarvestWeek && bestHarvestWeek >= 1 && bestHarvestWeek <= 52) {
      const dly = Math.max(args.delayWeeks ?? 0, 0);

      // If backend sent baseHarvestWeek, use it. Otherwise derive using delayWeeks.
      const baseHarvestWeek =
        args.baseHarvestWeek ?? Math.max(bestHarvestWeek - dly, 1);

      // planting week-of-year (fallback: derive from date if backend didn't send)
      const plantingWeek = plantingWeekOfYear ?? undefined;

      // if harvest week number is smaller than planting week number, it's likely next year
      const baseYear =
        plantingWeek != null && baseHarvestWeek < plantingWeek
          ? p.year + 1
          : p.year;

      const bestYear =
        plantingWeek != null && bestHarvestWeek < plantingWeek
          ? p.year + 1
          : p.year;

      const base = isoWeekToMonthWeekLabel(baseHarvestWeek, baseYear, lang);
      const best = isoWeekToMonthWeekLabel(bestHarvestWeek, bestYear, lang);

      harvestLine =
        lang === "si"
          ? dly === 0
            ? `මූලික අස්වැන්න ${base.year} ${
                base.monthLabel
              } මාසයේ ${weekOrdinal(
                base.weekOfMonth,
                "si"
              )} සතියේදී ලැබීමට ඉඩ ඇත. මෙම සතියේදී අස්වැන්න විකිණීම සුදුසුයි.`
            : `මූලික අස්වැන්න ${base.year} ${
                base.monthLabel
              } මාසයේ ${weekOrdinal(
                base.weekOfMonth,
                "si"
              )} සතියේදී ලැබීමට ඉඩ ඇත. නමුත් පසුගිය වසරවල දත්ත අනුව, සති ${dly}ක් පමණ ප්‍රමාද කරලා ${
                best.year
              } ${best.monthLabel} මාසයේ ${weekOrdinal(
                best.weekOfMonth,
                "si"
              )} සතියේ (සතිය ${bestHarvestWeek}) අස්වැන්න විකිණීම වඩා ලාභදායී බව පෙනේ.`
          : dly === 0
          ? `Harvest is expected around the ${weekOrdinal(
              base.weekOfMonth,
              "en"
            )} week of ${base.monthLabel} ${
              base.year
            }. Selling during this period is suitable.`
          : `Harvest is expected around the ${weekOrdinal(
              base.weekOfMonth,
              "en"
            )} week of ${base.monthLabel} ${
              base.year
            }. However, historical data suggests delaying harvest by about ${dly} weeks and selling around week ${bestHarvestWeek} for better returns.`;
    }

    // 3️⃣ Market signal explanation
    const marketLineWord = signalToFarmerWord(
      harvestSignalLabel || "MODERATE",
      lang
    );

    const marketLine =
      lang === "si"
        ? `මෙම නිර්දේශය ${marketLineWord} බව පසුගිය වෙළඳපොළ ප්‍රවණතා පෙන්වයි.`
        : `Market trends indicate that ${marketLineWord}.`;

    // 4️⃣ Confidence (optional)

    const confLine = confidence
      ? lang === "si"
        ? `විශ්වාසය: ${confidence}`
        : `Confidence: ${confidence}`
      : "";

    // 5️⃣ Final output
    const lines = [plantingLine, harvestLine, marketLine, confLine].filter(
      Boolean
    );

    return lines.join("\n");
  };

  // Farmer-friendly Price Text
  const farmerPriceText =
    priceWindowResult?.best_option && form.plantingDateExact
      ? buildFarmerFriendlyPlanText({
          lang: language,
          plantingDateISO: form.plantingDateExact,
          bestHarvestWeek: computedBestWeek,
          baseHarvestWeek: computedBaseWeek,
          delayWeeks: computedDelayWeeks,
          harvestSignalLabel: harvestAdvisoryResult?.signal,
          confidence: harvestBest?.confidence,
          plantingWeekOfYear: harvestAdvisoryResult?.planting_week,
        })
      : null;

  // Farmer-friendly Harvest Text
  const farmerHarvestText =
    harvestAdvisoryResult && form.plantingDateExact
      ? buildFarmerFriendlyPlanText({
          lang: language,
          plantingDateISO: form.plantingDateExact,
          bestHarvestWeek: computedBestWeek,
          baseHarvestWeek: computedBaseWeek,
          delayWeeks: computedDelayWeeks,
          plantingWeekOfYear: harvestAdvisoryResult?.planting_week,
          harvestSignalLabel: harvestAdvisoryResult.signal,
          confidence:
            harvestBest?.confidence ?? harvestAdvisoryResult?.confidence,
        })
      : null;

  const DISTRICTS =
    language === "si"
      ? ["අනුරාධපුර", "මොණරාගල", "තිස්සමහාරාමය"]
      : ["Anuradhapura", "Monaragala", "Tissamaharama"];

  const handleVarietySelect = (variety: string) => {
    setForm((f) => ({ ...f, seedVariety: variety }));
    setShowVarietyPicker(false);
  };

  const getWeatherIcon = () => {
    const c = (weatherCondition || "").toLowerCase();

    if (!c) return <Cloud size={18} color="#10B981" />;

    if (c.includes("clear")) return <CloudSun size={18} color="#f59e0b" />;
    if (c.includes("light") && c.includes("rain"))
      return <CloudDrizzle size={18} color="#0ea5e9" />;
    if (c.includes("rain")) return <CloudRain size={18} color="#0284c7" />;
    if (c.includes("thunder"))
      return <CloudLightning size={18} color="#e11d48" />;
    if (c.includes("mist") || c.includes("fog") || c.includes("haze"))
      return <CloudFog size={18} color="#6b7280" />;
    return <Cloud size={18} color="#10b981" />;
  };

  const classifyPlantingWindow = () => {
    const temp = temperature ?? 0;
    const c = (weatherCondition || "").toLowerCase();

    const hasThunder = c.includes("thunder");
    const heavyRain = c.includes("heavy") && c.includes("rain");

    if (hasThunder || heavyRain || temp <= 18 || temp >= 36) {
      return "risky" as const;
    }
    if (temp >= 22 && temp <= 32 && !heavyRain && !hasThunder) {
      return "excellent" as const;
    }
    return "moderate" as const;
  };

  const getReadinessScore = () => {
    const r = form.readiness;

    const done =
      (r.seeds ? 1 : 0) +
      (r.water ? 1 : 0) +
      (r.land ? 1 : 0) +
      (r.fertilizer ? 1 : 0) +
      (r.capital ? 1 : 0);

    const total = 5;
    const percent = Math.round((done / total) * 100);

    return { done, total, percent };
  };

  const toISODate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const buildExplainableDecision = () => {
    const plantingClass = classifyPlantingWindow();
    const { done, total, percent } = getReadinessScore();

    const district = (form.district || "").trim();
    const month = getMonthLabelFromISO(form.plantingDateExact);
    const seed = (form.seedVariety || "Unknown").trim() || "Unknown";
    const areaNum = parseFloat(form.area || "0") || 0;

    const durationWeeks =
      VARIETY_DURATION_WEEKS[seed] ?? VARIETY_DURATION_WEEKS["Unknown"];

    // ---------- Decision (Ready / Caution / Prepare) ----------
    // base risk from weather
    let risk = 0;
    if (plantingClass === "risky") risk += 3;
    else if (plantingClass === "moderate") risk += 1;

    // readiness
    if (done <= 2) risk += 3;
    else if (done === 3) risk += 1;

    // irrigation effect
    if (!form.hasIrrigation && !form.readiness.water) risk += 2;

    // experience + budget
    if (form.experienceLevel === "new" && form.budgetLevel === "low") risk += 2;

    // unknown seed
    if (seed === "Unknown") risk += 2;

    // large area with weak readiness
    if (areaNum >= 3 && done <= 3) risk += 1;

    let category: "ready" | "caution" | "prepare" = "caution";
    if (risk >= 7) category = "prepare";
    else if (risk <= 3 && percent >= 80 && plantingClass !== "risky")
      category = "ready";

    // ---------- Build Explanation (Why) ----------
    const why: string[] = [];

    // Weather reason
    if (plantingClass === "excellent") {
      why.push(
        language === "si"
          ? "කාලගුණ තත්ත්වය සාමාන්‍යයෙන් වගාවට හිතකරයි."
          : "Weather conditions are generally favorable for cultivation."
      );
    } else if (plantingClass === "moderate") {
      why.push(
        language === "si"
          ? "කාලගුණ තත්ත්වය මධ්‍යම අවදානම් මට්ටමක පවතී."
          : "Weather conditions indicate a moderate level of risk."
      );
    } else {
      why.push(
        language === "si"
          ? "කාලගුණ තත්ත්වය අවදානම් ලෙස පෙනේ (වැසි/අකුණු/උෂ්ණත්ව අන්තයන් වැනි හේතු තිබිය හැක)."
          : "Weather conditions appear risky (possible factors include heavy rain, lightning, or extreme temperatures)."
      );
    }

    // Context reasons
    if (!district)
      why.push(
        language === "si"
          ? "දිස්ත්‍රික්කය නොදැක්වූ නිසා district-wise උපදෙස් සම්පූර්ණ නොවේ."
          : "District-specific guidance is incomplete because no district was selected."
      );
    else
      why.push(
        language === "si"
          ? `${district} දිස්ත්‍රික්කය සඳහා කන්න/කාලගුණ පසුබිම සලකා බැලේ.`
          : `Seasonal and climatic context has been considered for the ${district} district.`
      );

    if (!month)
      why.push(
        language === "si"
          ? "මාසය නොදැක්වූ නිසා (මහ/යාල) කාලය පදනම් කරගත් තීරණය සීමිත වේ."
          : "The decision is limited because the planting month (Maha/Yala) was not specified."
      );
    else
      why.push(
        language === "si"
          ? `ඔබ තෝරාගත් මාසය: ${month}.`
          : `Selected planting month: ${month}.`
      );

    // Seed reason
    if (seed === "Unknown") {
      why.push(
        language === "si"
          ? "බීජ වර්ගය Unknown ලෙස තිබීම නිසා අවදානම වැඩි වේ."
          : "Risk is higher because the seed variety is unknown."
      );
    } else {
      why.push(
        language === "si"
          ? `${seed} වර්ගය සඳහා සාමාන්‍ය වගා කාලය සති ${durationWeeks}ක් පමණ වේ.`
          : `The typical cultivation period for the ${seed} variety is about ${durationWeeks} weeks.`
      );
    }

    // Advanced reasons
    if (form.hasIrrigation)
      why.push(
        language === "si"
          ? "වාරිමාර්ග/ජලය තිබීම නිසා වගාව ස්ථාවර කරගැනීම පහසුය."
          : "Having irrigation or water access makes cultivation more stable."
      );
    else
      why.push(
        language === "si"
          ? "වාරිමාර්ග නොමැති නම් වැසි මත පමණක් විශ්වාස වීමෙන් අවදානම වැඩිවිය හැක."
          : "Without irrigation, relying solely on rainfall can increase risk."
      );

    if (form.experienceLevel === "new")
      why.push(
        language === "si"
          ? "අත්දැකීම් අඩු නම් ආරම්භයේදී අවධානයෙන් පියවර ගන්න."
          : "If experience is limited, proceed cautiously during the initial stage."
      );

    if (form.budgetLevel === "low")
      why.push(
        language === "si"
          ? "වියදම් පරාසය අඩු නම් මුල් වියදම් (බීජ/පොහොර/වැඩකරු) හොඳින් සැලසුම් කරන්න."
          : "With a low budget, carefully plan initial costs such as seeds, fertilizer, and labor."
      );

    // ---------- Readiness breakdown ----------
    const readinessLines: string[] = [];

    readinessLines.push(
      language === "si"
        ? `ඔබගේ වගා සූදානම්කම: ${done}/${total} (${percent}%).`
        : `Your cultivation readiness: ${done}/${total} (${percent}%).`
    );

    const addCheckLine = (ok: boolean, label: string) =>
      readinessLines.push(`${ok ? "✔️" : "❌"} ${label}`);

    addCheckLine(
      form.readiness.seeds,
      language === "si" ? "බීජ සූදානම්" : "Seeds ready"
    );

    addCheckLine(
      form.readiness.water,
      language === "si" ? "ජල සැලසුම" : "Water plan"
    );

    addCheckLine(
      form.readiness.land,
      language === "si" ? "භූමිය සකස් කිරීම" : "Land preparation"
    );

    addCheckLine(
      form.readiness.fertilizer,
      language === "si" ? "පොහොර සැලසුම" : "Fertilizer plan"
    );

    addCheckLine(
      form.readiness.capital,
      language === "si"
        ? "මුල් වියදම් / මුදල් සැලසුම"
        : "Initial capital / budget plan"
    );

    const actions: string[] = [];

    if (!form.readiness.water && !form.hasIrrigation)
      actions.push(
        language === "si"
          ? "ජල සැලසුම/backup plan එකක් සකස් කරන්න."
          : "Prepare a water plan or backup irrigation solution."
      );

    if (!form.readiness.fertilizer)
      actions.push(
        language === "si"
          ? "පොහොර සැලසුම (වර්ග/කාලසටහන) සකස් කරන්න."
          : "Prepare a fertilizer plan (type and schedule)."
      );

    if (!form.readiness.capital)
      actions.push(
        language === "si"
          ? "මුල් වියදම් සම්පූර්ණයෙන් සැලසුම් කරගන්න."
          : "Fully plan your initial capital requirements."
      );

    if (seed === "Unknown")
      actions.push(
        language === "si"
          ? "බීජ වර්ගය නිශ්චිතව තෝරාගන්න හෝ වෘත්තීය උපදෙස් ලබාගන්න."
          : "Select a specific seed variety or seek professional advice."
      );

    if (plantingClass === "risky")
      actions.push(
        language === "si"
          ? "දින කිහිපයක් කාලගුණය නිරීක්ෂණය කර පසුව ආරම්භ කිරීම සලකා බලන්න."
          : "Monitor weather conditions for a few days before starting cultivation."
      );

    if (actions.length === 0) {
      actions.push(
        language === "si"
          ? "ඔබගේ සැලසුම හොඳයි. කාලගුණය සහ වෙළඳපොළ තත්ත්වය නිතර පරීක්ෂා කරමින් ආරම්භ කරන්න."
          : "Your plan looks good. Start cultivation while regularly monitoring weather and market conditions."
      );
    }

    // ---------- Final Title + Tag ----------
    let title =
      language === "si" ? "අවධානයෙන් ආරම්භ කරන්න" : "Start with caution";
    let tag: "good" | "info" | "warn" = "info";

    if (category === "ready") {
      title =
        language === "si"
          ? "වගාව ආරම්භ කිරීමට සූදානම්"
          : "Ready to start cultivation";
      tag = "good";
    } else if (category === "prepare") {
      title =
        language === "si"
          ? "තවත් සූදානම් වීම වඩා හොඳයි"
          : "Further preparation is recommended";
      tag = "warn";
    }

    // ---------- Final Text (Explainable answer) ----------
    const text =
      `${language === "si" ? "තීරණය" : "Decision"}: ${title}\n\n` +
      `${language === "si" ? "හේතු" : "Reasons"}:\n• ${why.join("\n• ")}\n\n` +
      `${readinessLines.join("\n")}\n\n` +
      `${
        language === "si" ? "ඊළඟට කළ යුතු දේ" : "Next actions"
      }:\n• ${actions.join("\n• ")}`;

    return { text, tag };
  };

  const handleQuestionPress = (key: QuestionKey) => {
    setSelectedQuestion(key);
    const plantingClass = classifyPlantingWindow();
    let answer = "";

    if (key === "start_now") {
      answer =
        plantingClass === "risky"
          ? language === "si"
            ? "දැනට වගාව ආරම්භ කිරීම අවදානම්. කාලගුණය ස්ථාවර වනතුරු රැඳී සිටින්න."
            : "Starting cultivation now is risky. Wait until weather conditions stabilize."
          : plantingClass === "moderate"
          ? language === "si"
            ? "වගාව ආරම්භ කළ හැක, නමුත් මධ්‍යම අවදානමක් ඇත."
            : "You can start cultivation, but the risk level is moderate."
          : language === "si"
          ? "දැනට වගාව ආරම්භ කිරීමට හොඳ කාලයක් ලෙස පෙනේ."
          : "This appears to be a good time to start cultivation.";
    }

    if (key === "before_start") {
      answer =
        language === "si"
          ? "වගාව ආරම්භ කිරීමට පෙර බීජ වර්ගය, ජල සැලසුම, භූමි සකස් කිරීම සහ මුල් වියදම් සැලසුම් කරගැනීම වැදගත්ය."
          : "Before starting cultivation, it is important to plan seed variety, water management, land preparation, and initial costs.";
    }

    if (key === "district_time") {
      answer = form.district
        ? language === "si"
          ? `${form.district} දිස්ත්‍රික්කය සඳහා මේ කාලය ${
              plantingClass === "risky" ? "අවදානම්" : "සාමාන්‍යයෙන් සුදුසු"
            } ලෙස පෙනේ.`
          : `For the ${form.district} district, this period appears ${
              plantingClass === "risky" ? "risky" : "generally suitable"
            }.`
        : language === "si"
        ? "මුලින්ම ඔබගේ දිස්ත්‍රික්කය ඇතුළත් කරන්න."
        : "Please select your district first.";
    }

    if (key === "biggest_risk") {
      answer =
        language === "si"
          ? "ප්‍රධාන අවදානම් වන්නේ කාලගුණය, ජල සැලසුම සහ බීජ වර්ගය නිසි ලෙස තෝරා නොගැනීමයි."
          : "The main risks include weather conditions, water planning, and improper seed selection.";
    }

    if (key === "need_professional") {
      answer =
        plantingClass === "risky"
          ? language === "si"
            ? "ඔව්. මෙම තත්ත්වය සඳහා වෘත්තීය උපදෙස් ලබාගැනීම නිර්දේශ කරයි."
            : "Yes. Professional advice is recommended for this situation."
          : language === "si"
          ? "අත්‍යවශ්‍ය නොවේ, නමුත් අවශ්‍ය නම් වෘත්තීය උපදෙස් ලබාගත හැක."
          : "It is not essential, but professional advice can be obtained if needed.";
    }

    setQuickAnswer(answer);
  };

  const getCurrentWeekNum = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diffDays = Math.floor((now.getTime() - start.getTime()) / 86400000);
    const week = Math.floor(diffDays / 7) + 1;
    return Math.min(52, Math.max(1, week));
  };

  const fetchBestPlantingWindow = async ({
    location,
    startWeek,
    seedVariety,
  }: {
    location: string;
    startWeek: number;
    seedVariety: string;
  }) => {
    const params = new URLSearchParams({
      location,
      start_week: String(startWeek),
      seed_variety: seedVariety,
      lookahead_weeks: "6",
    });

    const url = `${API_URL}/price-window/best-planting?${params.toString()}`;
    const res = await fetch(url);

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || "Failed to fetch price-window result");
    }

    return res.json();
  };

  const fetchHarvestAdvisoryByDate = async ({
    location,
    plantingDate,
    seedVariety,
  }: {
    location: string;
    plantingDate: string; // "YYYY-MM-DD"
    seedVariety: string;
  }) => {
    const params = new URLSearchParams({
      location,
      planting_date: plantingDate,
      seed_variety: seedVariety,
    });

    const url = `${API_URL}/price-window/by-date?${params.toString()}`;
    const res = await fetch(url);

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || "Failed to fetch harvest advisory");
    }

    return res.json();
  };

  type ToggleRowProps = {
    label: string;
    value: boolean;
    onChange: (v: boolean) => void;
  };

  const ToggleRow: React.FC<ToggleRowProps> = ({ label, value, onChange }) => {
    return (
      <TouchableOpacity
        onPress={() => onChange(!value)}
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: 12,
        }}
      >
        <Text style={{ fontSize: 14, color: "#065F46", fontWeight: "600" }}>
          {label}
        </Text>

        <View
          style={{
            width: 44,
            height: 24,
            borderRadius: 12,
            backgroundColor: value ? "#10B981" : "#E5E7EB",
            justifyContent: "center",
            paddingHorizontal: 3,
          }}
        >
          <View
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: "#FFFFFF",
              alignSelf: value ? "flex-end" : "flex-start",
            }}
          />
        </View>
      </TouchableOpacity>
    );
  };

  type OptionRowProps<T extends string> = {
    label: string;
    options: T[];
    value: T;
    onChange: (v: T) => void;
  };

  function OptionRow<T extends string>({
    label,
    options,
    value,
    onChange,
  }: OptionRowProps<T>) {
    return (
      <View style={{ marginTop: 12 }}>
        <Text
          style={{
            fontSize: 13,
            color: "#065F46",
            fontWeight: "600",
            marginBottom: 6,
          }}
        >
          {label}
        </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {options.map((opt) => {
            const active = opt === value;
            return (
              <TouchableOpacity
                key={opt}
                onPress={() => onChange(opt)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  borderWidth: 2,
                  borderColor: active ? "#10B981" : "#D1FAE5",
                  backgroundColor: active ? "#ECFDF5" : "#FFFFFF",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: active ? "#047857" : "#6B7280",
                  }}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  type CheckItemProps = {
    label: string;
    state: boolean;
    onChange: (v: boolean) => void;
  };

  const CheckItem: React.FC<CheckItemProps> = ({ label, state, onChange }) => {
    return (
      <TouchableOpacity
        onPress={() => onChange(!state)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingVertical: 10,
        }}
      >
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            borderWidth: 2,
            borderColor: state ? "#10B981" : "#D1D5DB",
            backgroundColor: state ? "#10B981" : "#FFFFFF",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {state && <CheckCircle color="#FFFFFF" size={14} />}
        </View>

        <Text
          style={{
            fontSize: 14,
            color: "#374151",
            fontWeight: "600",
          }}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const runFullAdvisor = async () => {
    // ✅ existing logic (keep)
    const { text, tag } = buildExplainableDecision();
    setFullAdvisorTag(tag);
    setFullAdvisorText(text);

    const apiLocation = toApiLocation(form.district);
    const seed = (form.seedVariety || "Unknown").trim() || "Unknown";
    const durationWeeks =
      VARIETY_DURATION_WEEKS[seed] ?? VARIETY_DURATION_WEEKS["Unknown"];

    // 1️⃣ Price Window (existing – KEEP)
    try {
      setPriceWindowLoading(true);

      const startWeek = getCurrentWeekNum();

      const priceRes = await fetchBestPlantingWindow({
        location: apiLocation,
        startWeek,
        seedVariety: seed,
      });

      setPriceWindowResult(priceRes);
    } catch (e) {
      console.log("Price window unavailable:", e);
      setPriceWindowResult(null);
    } finally {
      setPriceWindowLoading(false);
    }

    // 2️⃣ NEW — Date-based harvest advisory (ADD)

    try {
      setHarvestAdvisoryLoading(true);

      if (form.plantingDateExact) {
        const adv = await fetchHarvestAdvisoryByDate({
          location: apiLocation,
          plantingDate: form.plantingDateExact,
          seedVariety: seed,
        });

        setHarvestAdvisoryResult(adv);
      } else {
        // farmer date select කරලා නැත්නම්
        setHarvestAdvisoryResult(null);
      }
    } catch (e) {
      console.log("Harvest advisory unavailable:", e);
      setHarvestAdvisoryResult(null);
    } finally {
      setHarvestAdvisoryLoading(false);
    }

    // --------------------------------------------------
    // 3️⃣ existing animation logic (KEEP)
    // --------------------------------------------------
    Animated.parallel([
      Animated.timing(formSlideAnim, {
        toValue: -20,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(formOpacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowForm(false);
    });
  };

  const handleEditInputs = () => {
    setShowForm(true);
    formSlideAnim.setValue(-20);
    formOpacityAnim.setValue(0);

    Animated.parallel([
      Animated.timing(formSlideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(formOpacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleGoBack = () => navigation.goBack();

  // Render Variety Picker
  const renderVarietyPicker = () => {
    return (
      <Modal
        visible={showVarietyPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowVarietyPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.varietyModal}>
            <View style={styles.varietyHeader}>
              <Text style={styles.varietyTitle}>{t.selectVariety}</Text>
              <TouchableOpacity onPress={() => setShowVarietyPicker(false)}>
                <X color="#6B7280" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.varietyList}>
              {SEED_VARIETIES.map((variety) => (
                <TouchableOpacity
                  key={variety}
                  style={[
                    styles.varietyItem,
                    form.seedVariety === variety && styles.varietyItemSelected,
                  ]}
                  onPress={() => handleVarietySelect(variety)}
                >
                  <View style={styles.varietyItemLeft}>
                    <Leaf
                      color={
                        form.seedVariety === variety ? "#10B981" : "#6B7280"
                      }
                      size={20}
                    />
                    <Text
                      style={[
                        styles.varietyItemText,
                        form.seedVariety === variety &&
                          styles.varietyItemTextSelected,
                      ]}
                    >
                      {variety}
                    </Text>
                  </View>
                  <Text style={styles.varietyDuration}>
                    {VARIETY_DURATION_WEEKS[variety]}{" "}
                    {language === "si" ? "සති" : "weeks"}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const renderDistrictPicker = () => (
    <Modal visible={showDistrictPicker} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.varietyModal}>
          <View style={styles.varietyHeader}>
            <Text style={styles.varietyTitle}>
              {language === "si" ? "දිස්ත්‍රික්කය තෝරන්න" : "Select district"}
            </Text>
            <TouchableOpacity onPress={() => setShowDistrictPicker(false)}>
              <X color="#6B7280" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.varietyList}>
            {DISTRICTS.map((d) => (
              <TouchableOpacity
                key={d}
                style={[
                  styles.varietyItem,
                  form.district === d && styles.varietyItemSelected,
                ]}
                onPress={() => {
                  setForm((f) => ({ ...f, district: d }));
                  setShowDistrictPicker(false);
                }}
              >
                <Text style={styles.varietyItemText}>{d}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const saveMyPlan = async () => {
    try {
      const { done, total, percent } = getReadinessScore();

      const plan = {
        id: Date.now(),
        savedAt: new Date().toISOString(),

        // snapshot of inputs
        form: form,

        // readiness
        readiness: {
          done,
          total,
          percent,
        },

        // advisor output
        decision: {
          tag: fullAdvisorTag,
          text: fullAdvisorText,
        },
      };

      const existing = await AsyncStorage.getItem("savedPlans");
      const plans = existing ? JSON.parse(existing) : [];

      plans.unshift(plan); // latest first

      await AsyncStorage.setItem("savedPlans", JSON.stringify(plans));

      alert(
        language === "si"
          ? "✅ ඔබගේ වගා සැලසුම සුරකින ලදී!"
          : "✅ Your cultivation plan has been saved!"
      );
    } catch (e) {
      alert(
        language === "si"
          ? "❌ සැලසුම සුරකින්න නොහැකි විය."
          : "❌ Failed to save the plan."
      );
    }
  };

  const loadLatestSavedPlan = async () => {
    try {
      const existing = await AsyncStorage.getItem("savedPlans");
      if (!existing) {
        alert(
          language === "si"
            ? "සුරකින ලද සැලසුමක් නොමැත."
            : "No saved plan found."
        );
        return;
      }

      const plans = JSON.parse(existing);
      if (!plans.length) {
        alert(
          language === "si"
            ? "සුරකින ලද සැලසුමක් නොමැත."
            : "No saved plan found."
        );
        return;
      }

      const latestPlan = plans[0]; // latest saved

      // 🔑 Restore form
      setForm(latestPlan.form);

      // Show form again
      setShowForm(true);
      setFullAdvisorText(null);
      setFullAdvisorTag(null);

      alert(
        language === "si"
          ? "✅ සුරකින ලද සැලසුම නැවත පුරවන ලදී!"
          : "✅ Saved plan has been restored!"
      );
    } catch (e) {
      alert(
        language === "si"
          ? "❌ සැලසුම නැවත ලබාගත නොහැකි විය."
          : "❌ Failed to restore the saved plan."
      );
    }
  };

  type StorageAdvice = {
    required: boolean;
    duration_weeks: number;
    reason: string;
    message_si: string;
  };

  const StorageAdviceCard = ({
    storageAdvice,
    language,
  }: {
    storageAdvice?: StorageAdvice;
    language: "si" | "en";
  }) => {
    if (!storageAdvice || !storageAdvice.required) return null;

    const title =
      language === "si" ? "ගබඩා කිරීම සුදුසුයි" : "Storage is recommended";
    const weeksLine =
      language === "si"
        ? `සති ${storageAdvice.duration_weeks}ක් පමණ ගබඩා කර තබාගත යුතුයි`
        : `You may need to store for about ${storageAdvice.duration_weeks} weeks`;

    const note =
      language === "si"
        ? "වියලි ස්ථානයක් තෝරන්න • වායු ගමනාගමනය හොඳ විය යුතුයි"
        : "Choose a dry place • Ensure good ventilation";

    return (
      <View style={styles.storageCard}>
        <View style={styles.storageHeader}>
          <View style={styles.storageIconWrap}>
            <Archive size={18} color="#92400E" />
          </View>
          <Text style={styles.storageTitle}>{title}</Text>
        </View>

        <Text style={styles.storageWeeks}>{weeksLine}</Text>

        <Text style={styles.storageMsg}>{storageAdvice.message_si}</Text>

        <View style={styles.storageNoteBox}>
          <Text style={styles.storageNoteText}>⚠️ {note}</Text>
        </View>
      </View>
    );
  };

  const HarvestTimelineBar = ({
    language,
    delayWeeks,
    baseWeek,
    bestWeek,
  }: {
    language: "si" | "en";
    delayWeeks?: number;
    baseWeek?: number;
    bestWeek?: number;
  }) => {
    if (!baseWeek || !bestWeek) return null;

    const leftTitle = language === "si" ? "දැන් Harvest" : "Harvest now";
    const rightTitle =
      language === "si" ? "හොඳ මිල Harvest" : "Best price harvest";
    const midTitle =
      language === "si"
        ? `සති ${delayWeeks ?? Math.max(bestWeek - baseWeek, 0)}ක් පමා කරන්න`
        : `Delay ${delayWeeks ?? Math.max(bestWeek - baseWeek, 0)} weeks`;

    return (
      <View style={styles.timelineCard}>
        <View style={styles.timelineRow}>
          {/* Left */}
          <View style={styles.timelineStep}>
            <Text style={styles.timelineIcon}>🌱</Text>
            <Text style={styles.timelineTitle}>{leftTitle}</Text>
            <Text style={styles.timelineWeek}>
              {language === "si" ? `සතිය ${baseWeek}` : `Week ${baseWeek}`}
            </Text>
          </View>

          {/* Middle */}
          <View style={styles.timelineMiddle}>
            <View style={styles.timelineLine} />
            <View style={styles.timelinePill}>
              <Text style={styles.timelinePillText}>⏳ {midTitle}</Text>
            </View>
            <View style={styles.timelineArrow} />
          </View>

          {/* Right */}
          <View style={[styles.timelineStep, styles.timelineStepBest]}>
            <Text style={styles.timelineIcon}>🌽</Text>
            <Text style={styles.timelineTitle}>{rightTitle}</Text>
            <Text style={styles.timelineWeek}>
              {language === "si" ? `සතිය ${bestWeek}` : `Week ${bestWeek}`}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft color="#047857" size={24} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t.headerTitle}</Text>
          <Text style={styles.headerSubtitle}>{t.headerSubtitle}</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => rootNavigation.navigate("Notifications")}
          >
            <Bell color="#10B981" size={20} />

            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Sub-header */}
      <View style={styles.subHeader}>
        <View style={styles.infoCard}>
          <Leaf color="#10B981" size={18} />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>{t.location}</Text>
            <Text style={styles.infoValue}>
              {locationName || t.notAvailable}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoCard}>
          {getWeatherIcon()}
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>{t.weather}</Text>
            <Text style={styles.infoValue}>
              {isWeatherLoading
                ? t.weatherLoading
                : temperature != null
                ? `${Math.round(temperature)}°C${
                    weatherCondition ? ` • ${weatherCondition}` : ""
                  }`
                : t.notAvailable}
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
          {/* Quick Questions Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.quickQuestionsTitle}</Text>

            <View style={styles.quickGrid}>
              <TouchableOpacity
                style={[
                  styles.quickCard,
                  selectedQuestion === "start_now" && styles.quickCardActive,
                ]}
                onPress={() => handleQuestionPress("start_now")}
              >
                <View style={styles.quickIconContainer}>
                  <Leaf color="#10B981" size={22} />
                </View>
                <Text style={styles.quickTitle}>{t.q1}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.quickCard,
                  selectedQuestion === "before_start" && styles.quickCardActive,
                ]}
                onPress={() => handleQuestionPress("before_start")}
              >
                <View style={styles.quickIconContainer}>
                  <AlertTriangle color="#F59E0B" size={22} />
                </View>
                <Text style={styles.quickTitle}>{t.q2}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.quickCard,
                  selectedQuestion === "district_time" &&
                    styles.quickCardActive,
                ]}
                onPress={() => handleQuestionPress("district_time")}
              >
                <View style={styles.quickIconContainer}>
                  <CloudSun color="#0EA5E9" size={22} />
                </View>
                <Text style={styles.quickTitle}>{t.q3}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.quickCard,
                  selectedQuestion === "biggest_risk" && styles.quickCardActive,
                ]}
                onPress={() => handleQuestionPress("biggest_risk")}
              >
                <View style={styles.quickIconContainer}>
                  <DollarSign color="#22C55E" size={22} />
                </View>
                <Text style={styles.quickTitle}>{t.q4}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.quickCard,
                  selectedQuestion === "need_professional" &&
                    styles.quickCardActive,
                ]}
                onPress={() => handleQuestionPress("need_professional")}
              >
                <View style={styles.quickIconContainer}>
                  <TrendingUp color="#16A34A" size={22} />
                </View>
                <Text style={styles.quickTitle}>{t.q5}</Text>
              </TouchableOpacity>
            </View>
            {/* 🔽 QUICK ANSWER DISPLAY (ADD THIS) */}
            {selectedQuestion && quickAnswer && (
              <View style={styles.quickAnswerBox}>
                <Text style={styles.quickAnswerText}>{quickAnswer}</Text>
              </View>
            )}
          </View>

          {/* Advisor Result */}
          {(fullAdvisorText ||
            priceWindowResult ||
            harvestAdvisoryResult ||
            priceWindowLoading ||
            harvestAdvisoryLoading) && (
            <View style={styles.section}>
              <View style={styles.unifiedAdvisorCard}>
                {/* Header with Icon */}
                <View style={styles.advisorHeader}>
                  <View style={styles.advisorIconContainer}>
                    <Leaf color="#FFFFFF" size={28} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.advisorMainTitle}>
                      {language === "si"
                        ? "වගා උපදේශක ප්‍රතිඵලය"
                        : "Cultivation Advisory Result"}
                    </Text>
                    <Text style={styles.advisorSubtitle}>
                      {language === "si"
                        ? "සම්පූර්ණ විශ්ලේෂණය සහ නිර්දේශ"
                        : "Complete Analysis & Recommendations"}
                    </Text>
                  </View>
                </View>

                <View style={styles.combinedSummary}>
                  {/* Top badges */}
                  <View style={styles.badgeRow}>
                    {priceWindowResult?.best_option?.label && (
                      <View
                        style={[
                          styles.badge,
                          priceWindowResult.best_option.label === "STRONG"
                            ? styles.badgeStrong
                            : priceWindowResult.best_option.label === "MODERATE"
                            ? styles.badgeModerate
                            : styles.badgeWeak,
                        ]}
                      >
                        <Text style={styles.badgeText}>
                          {priceWindowResult.best_option.label}
                        </Text>
                      </View>
                    )}

                    {priceWindowResult?.best_option?.confidence && (
                      <View style={[styles.badge, styles.badgeConfidence]}>
                        <Text style={styles.badgeText}>
                          Confidence: {priceWindowResult.best_option.confidence}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Main recommendation */}
                  <Text style={styles.mainActionText}>
                    {computedDelayWeeks == null
                      ? language === "si"
                        ? "අස්වැන්න පිළිබඳ නිර්දේශ ලබාගැනෙමින්..."
                        : "Loading harvest recommendation..."
                      : computedDelayWeeks === 0
                      ? language === "si"
                        ? "දැන් Harvest කිරීම සුදුසුයි"
                        : "Harvest now"
                      : language === "si"
                      ? `අස්වැන්න සති ${computedDelayWeeks}ක් පමා කරන්න`
                      : `Delay harvest by ${computedDelayWeeks} weeks`}
                  </Text>

                  {/* ✅ Graphical timeline (NEW) */}
                  <HarvestTimelineBar
                    language={language}
                    delayWeeks={computedDelayWeeks}
                    baseWeek={computedBaseWeek}
                    bestWeek={computedBestWeek}
                  />

                  {/* Reason / explanation */}
                  {(farmerHarvestText || farmerPriceText) && (
                    <Text style={styles.reasonText}>
                      {farmerHarvestText ?? farmerPriceText}
                    </Text>
                  )}

                  {/* ✅ Storage advice card (NEW) */}
                  <StorageAdviceCard
                    storageAdvice={harvestAdvisoryResult?.storage_advice}
                    language={language}
                  />
                </View>

                {/* Readiness Progress at Top */}
                {fullAdvisorText && (
                  <>
                    {(() => {
                      const { percent } = getReadinessScore();
                      return <CircularProgress percent={percent} />;
                    })()}

                    {/* Decision Badge */}
                    <View
                      style={[
                        styles.decisionBadge,
                        {
                          backgroundColor:
                            fullAdvisorTag === "good"
                              ? "#ECFDF5"
                              : fullAdvisorTag === "warn"
                              ? "#FEF2F2"
                              : "#FEF3C7",
                        },
                      ]}
                    >
                      {fullAdvisorTag === "good" && (
                        <CheckCircle color="#10B981" size={20} />
                      )}
                      {fullAdvisorTag === "warn" && (
                        <AlertTriangle color="#EF4444" size={20} />
                      )}
                      {fullAdvisorTag === "info" && (
                        <TrendingUp color="#F59E0B" size={20} />
                      )}

                      <Text
                        style={[
                          styles.decisionText,
                          {
                            color:
                              fullAdvisorTag === "good"
                                ? "#065F46"
                                : fullAdvisorTag === "warn"
                                ? "#991B1B"
                                : "#92400E",
                          },
                        ]}
                      >
                        {fullAdvisorTag === "good"
                          ? t.advisorTagGood
                          : fullAdvisorTag === "warn"
                          ? t.advisorTagWarn
                          : t.advisorTagInfo}
                      </Text>
                    </View>

                    {/* Main Advisory Text */}
                    <View style={styles.advisorySection}>
                      <Text style={styles.advisoryText}>{fullAdvisorText}</Text>
                    </View>

                    {/* Divider */}
                    <View style={styles.sectionDivider} />
                  </>
                )}

                {/* Action Buttons */}
                {fullAdvisorText && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={handleEditInputs}
                    >
                      <Text style={styles.editButtonText}>{t.editInputs}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={saveMyPlan}
                    >
                      <Text style={styles.saveButtonText}>
                        {language === "si" ? "💾 සුරකින්න" : "💾 Save Plan"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* 👨‍🌾 Agri Officer Support — Always Visible */}
          <View style={styles.section}>
            <View style={styles.assistCard}>
              <View
                style={{ flexDirection: "row", gap: 12, alignItems: "center" }}
              >
                <View style={styles.assistIcon}>
                  <Leaf color="#047857" size={22} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.assistTitle}>
                    {language === "si"
                      ? "කෘෂි නිලධාරි සහාය"
                      : "Agricultural Officer Support"}
                  </Text>

                  <Text style={styles.assistDesc}>
                    {language === "si"
                      ? "ඔබගේ වගා සැලසුම පිළිබඳ වෘත්තීය උපදෙස් ලබාගන්න."
                      : "Get professional guidance for your cultivation plan."}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.assistButton}
                onPress={() =>
                  navigation.navigate("Chat", { roomId: null, userId: "" })
                }
              >
                <Text style={styles.assistButtonText}>
                  {language === "si"
                    ? "💬 නිලධාරියෙකු සමඟ කතා කරන්න"
                    : "💬 Chat with an Agricultural Officer"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Full Advisor Form */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.fullFormTitle}</Text>

            {showForm && (
              <Animated.View
                style={{
                  transform: [{ translateY: formSlideAnim }],
                  opacity: formOpacityAnim,
                }}
              >
                <View style={styles.formCard}>
                  {/* District */}
                  <Text style={styles.inputLabel}>{t.formDistrict}</Text>
                  <TouchableOpacity
                    style={styles.pickerInput}
                    onPress={() => setShowDistrictPicker(true)}
                  >
                    <Leaf color="#10B981" size={20} />
                    <Text
                      style={[
                        styles.pickerText,
                        !form.district && styles.pickerPlaceholder,
                      ]}
                    >
                      {form.district ||
                        (language === "si"
                          ? "දිස්ත්‍රික්කය තෝරන්න"
                          : "Select district")}
                    </Text>
                  </TouchableOpacity>

                  {/* Exact Planting Date */}
                  <Text style={styles.inputLabel}>
                    {language === "si"
                      ? "නිශ්චිතව වගා කරන දිනය"
                      : "Exact planting date"}
                  </Text>

                  {Platform.OS === "web" ? (
                    // 🌐 WEB DATE PICKER
                    <input
                      type="date"
                      value={form.plantingDateExact}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          plantingDateExact: e.target.value,
                        }))
                      }
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: 12,
                        border: "1px solid #D1FAE5",
                        fontSize: 14,
                        outline: "none",
                      }}
                    />
                  ) : (
                    // 📱 MOBILE DATE PICKER
                    <>
                      <TouchableOpacity
                        style={styles.pickerInput}
                        onPress={() => {
                          setTempDate(
                            form.plantingDateExact
                              ? new Date(form.plantingDateExact)
                              : new Date()
                          );
                          setShowDatePicker(true);
                        }}
                      >
                        <Calendar color="#10B981" size={20} />
                        <Text
                          style={[
                            styles.pickerText,
                            !form.plantingDateExact && styles.pickerPlaceholder,
                          ]}
                        >
                          {form.plantingDateExact ||
                            (language === "si" ? "දිනය තෝරන්න" : "Select date")}
                        </Text>
                      </TouchableOpacity>

                      {showDatePicker && (
                        <DateTimePicker
                          value={tempDate}
                          mode="date"
                          display="default"
                          onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) {
                              const iso = toISODate(selectedDate);
                              setForm((f) => ({
                                ...f,
                                plantingDateExact: iso,
                              }));
                            }
                          }}
                        />
                      )}
                    </>
                  )}

                  {/* Seed Variety */}
                  <Text style={styles.inputLabel}>{t.formVariety}</Text>
                  <TouchableOpacity
                    style={styles.pickerInput}
                    onPress={() => setShowVarietyPicker(true)}
                  >
                    <Leaf color="#10B981" size={20} />
                    <Text
                      style={[
                        styles.pickerText,
                        !form.seedVariety && styles.pickerPlaceholder,
                      ]}
                    >
                      {form.seedVariety || t.selectVariety}
                    </Text>
                  </TouchableOpacity>

                  {/* Land Area */}
                  <Text style={styles.inputLabel}>{t.formArea}</Text>
                  <TextInput
                    style={styles.input}
                    value={form.area}
                    onChangeText={(text) =>
                      setForm((f) => ({ ...f, area: text }))
                    }
                    keyboardType="numeric"
                    placeholder="2.0"
                    placeholderTextColor="#9CA3AF"
                  />

                  {/* Advanced Toggle */}
                  <View style={{ marginTop: 12 }}>
                    <ToggleRow
                      label={
                        language === "si"
                          ? "උසස් විකල්ප පෙන්වන්න"
                          : "Show advanced options"
                      }
                      value={showAdvanced}
                      onChange={setShowAdvanced}
                    />
                  </View>

                  {/* Advanced Options */}
                  {showAdvanced && (
                    <View style={styles.advancedContainer}>
                      <OptionRow
                        label={
                          language === "si" ? "වියදම් පරාසය" : "Budget level"
                        }
                        options={["low", "medium", "high"]}
                        value={form.budgetLevel}
                        onChange={(v) =>
                          setForm((f) => ({ ...f, budgetLevel: v }))
                        }
                      />
                      <OptionRow
                        label={
                          language === "si"
                            ? "අත්දැකීම් මට්ටම"
                            : "Experience level"
                        }
                        options={["new", "some", "experienced"]}
                        value={form.experienceLevel}
                        onChange={(v) =>
                          setForm((f) => ({ ...f, experienceLevel: v }))
                        }
                      />

                      <ToggleRow
                        label={
                          language === "si"
                            ? "ජලය / වාරිමාර්ග ඇත"
                            : "Water / irrigation available"
                        }
                        value={form.hasIrrigation}
                        onChange={(v) =>
                          setForm((f) => ({ ...f, hasIrrigation: v }))
                        }
                      />
                    </View>
                  )}

                  {/* Readiness Checklist */}
                  <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
                    {language === "si"
                      ? "වගාවට සූදානම්ද?"
                      : "Are you ready to cultivate?"}
                  </Text>

                  <View style={styles.checklistContainer}>
                    <CheckItem
                      label={
                        language === "si"
                          ? "බීජ ලබාගැනීම සූදානම්"
                          : "Seeds are ready"
                      }
                      state={form.readiness.seeds}
                      onChange={(v) =>
                        setForm((f) => ({
                          ...f,
                          readiness: { ...f.readiness, seeds: v },
                        }))
                      }
                    />
                    <CheckItem
                      label={
                        language === "si"
                          ? "ජල සැලසුම ඇත"
                          : "Water plan available"
                      }
                      state={form.readiness.water}
                      onChange={(v) =>
                        setForm((f) => ({
                          ...f,
                          readiness: { ...f.readiness, water: v },
                        }))
                      }
                    />
                    <CheckItem
                      label={
                        language === "si"
                          ? "භූමිය සකස් කර ඇත"
                          : "Land is prepared"
                      }
                      state={form.readiness.land}
                      onChange={(v) =>
                        setForm((f) => ({
                          ...f,
                          readiness: { ...f.readiness, land: v },
                        }))
                      }
                    />
                    <CheckItem
                      label={
                        language === "si"
                          ? "පොහොර සැලසුමක් ඇත"
                          : "Fertilizer plan available"
                      }
                      state={form.readiness.fertilizer}
                      onChange={(v) =>
                        setForm((f) => ({
                          ...f,
                          readiness: { ...f.readiness, fertilizer: v },
                        }))
                      }
                    />
                    <CheckItem
                      label={
                        language === "si"
                          ? "මුල් වියදම් සැලසුම් කර ඇත"
                          : "Initial costs planned"
                      }
                      state={form.readiness.capital}
                      onChange={(v) =>
                        setForm((f) => ({
                          ...f,
                          readiness: { ...f.readiness, capital: v },
                        }))
                      }
                    />
                  </View>

                  {/* Run Advisor */}
                  <TouchableOpacity
                    style={[styles.primaryButton, { marginTop: 20 }]}
                    onPress={runFullAdvisor}
                  >
                    <Text style={styles.primaryButtonText}>
                      {t.btnRunFullAdvisor}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.secondaryButton,
                      {
                        marginTop: 12,
                        width: "100%",
                        backgroundColor: "#ECFEFF", // soft cyan/green
                        borderColor: "#0EA5A4",
                      },
                    ]}
                    onPress={loadLatestSavedPlan}
                  >
                    <Text
                      style={[
                        styles.secondaryButtonText,
                        {
                          color: "#0F766E",
                          fontWeight: "600",
                        },
                      ]}
                    >
                      {language === "si"
                        ? "📂 සුරකින ලද සැලසුම නැවත පුරවන්න"
                        : "📂 Reload saved plan"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}
          </View>

          <View style={{ height: 40 }} />
        </Animated.View>
      </ScrollView>

      {renderVarietyPicker()}
      {renderDistrictPicker()}
    </View>
  );
};

export default PriceAdvisorScreen;

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#065F46",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  langButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#10B981",
  },
  langText: {
    color: "#10B981",
    fontSize: 13,
    fontWeight: "bold",
  },
  subHeader: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 16,
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
    marginBottom: 3,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#047857",
  },
  divider: {
    width: 1,
    height: 42,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#065F46",
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1.5,
    borderColor: "#D1FAE5",
    width: (width - 20 * 2 - 12) / 2,
    minHeight: 70,
  },
  quickCardActive: {
    borderColor: "#10B981",
    backgroundColor: "#ECFDF5",
    shadowColor: "#10B981",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  quickIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#D1FAE5",
  },
  quickTitle: {
    fontSize: 12,
    color: "#065F46",
    fontWeight: "600",
    flex: 1,
    flexWrap: "wrap",
    lineHeight: 16,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 2,
    borderColor: "#D1FAE5",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  inputLabel: {
    fontSize: 13,
    color: "#065F46",
    marginTop: 12,
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    borderWidth: 2,
    borderColor: "#D1FAE5",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#F9FAFB",
  },
  pickerInput: {
    borderWidth: 2,
    borderColor: "#D1FAE5",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F9FAFB",
  },
  pickerText: {
    fontSize: 14,
    color: "#111827",
    flex: 1,
  },
  pickerPlaceholder: {
    color: "#9CA3AF",
  },
  primaryButton: {
    marginTop: 20,
    backgroundColor: "#10B981",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  secondaryButton: {
    marginTop: 14,
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#10B981",
    backgroundColor: "#ECFDF5",
  },
  secondaryButtonText: {
    color: "#047857",
    fontSize: 13,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  varietyModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    width: "100%",
    maxWidth: 400,
    maxHeight: "70%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  varietyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  varietyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#065F46",
  },
  varietyList: {
    padding: 12,
  },
  varietyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  varietyItemSelected: {
    backgroundColor: "#ECFDF5",
    borderColor: "#10B981",
  },
  varietyItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  varietyItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  varietyItemTextSelected: {
    color: "#065F46",
  },
  varietyDuration: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
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
  chatButton: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#047857",
    padding: 18,
    borderRadius: 14,
    shadowColor: "#047857",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  chatText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
  advancedContainer: {
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#F0FDF4",
    borderWidth: 2,
    borderColor: "#D1FAE5",
  },
  checklistContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  assistCard: {
    marginTop: 18,
    backgroundColor: "#ECFDF5",
    borderRadius: 18,
    padding: 16,
    borderWidth: 2,
    borderColor: "#A7F3D0",
  },
  assistIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
  },
  assistTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#065F46",
  },
  assistDesc: {
    fontSize: 13,
    color: "#374151",
    marginTop: 2,
    lineHeight: 18,
  },
  assistButton: {
    marginTop: 14,
    backgroundColor: "#047857",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#047857",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  assistButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  unifiedAdvisorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    borderColor: "#10B981",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  advisorHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#E5E7EB",
  },
  advisorIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  advisorMainTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#065F46",
    letterSpacing: 0.3,
  },
  advisorSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  decisionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginVertical: 12,
    alignSelf: "center",
  },
  decisionText: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  advisorySection: {
    marginTop: 16,
  },
  advisoryText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 22,
    marginBottom: 12,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 16,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#065F46",
  },
  confidenceText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  editButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  editButtonText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "700",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#ECFDF5",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#10B981",
  },
  saveButtonText: {
    color: "#047857",
    fontSize: 14,
    fontWeight: "700",
  },
  combinedSummary: {
    marginTop: 8,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  badgeStrong: { backgroundColor: "#DCFCE7" },
  badgeModerate: { backgroundColor: "#FEF3C7" },
  badgeWeak: { backgroundColor: "#FEE2E2" },
  badgeConfidence: { backgroundColor: "#E0F2FE" },
  mainActionText: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    color: "#064E3B",
    marginBottom: 14,
  },
  reasonText: {
    fontSize: 13,
    color: "#374151",
    textAlign: "center",
    lineHeight: 18,
  },
  storageCard: {
    marginTop: 14,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFFBEB",
    borderWidth: 1.5,
    borderColor: "#FCD34D",
  },
  storageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  storageIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FCD34D",
  },
  storageTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#92400E",
    flex: 1,
  },
  storageWeeks: {
    fontSize: 13,
    fontWeight: "700",
    color: "#78350F",
    marginBottom: 6,
    textAlign: "center",
  },
  storageMsg: {
    fontSize: 13,
    color: "#451A03",
    lineHeight: 19,
    textAlign: "center",
  },
  storageNoteBox: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#FEF3C7",
  },
  storageNoteText: {
    fontSize: 12,
    color: "#92400E",
    textAlign: "center",
    fontWeight: "600",
  },
  timelineCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#ECFDF5",
    borderWidth: 1.5,
    borderColor: "#A7F3D0",
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timelineStep: {
    width: 110,
    alignItems: "center",
  },
  timelineStepBest: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  timelineIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  timelineTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#065F46",
    textAlign: "center",
  },
  timelineWeek: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  timelineMiddle: {
    flex: 1,
    alignItems: "center",
    position: "relative",
    height: 54,
    justifyContent: "center",
  },
  timelineLine: {
    position: "absolute",
    height: 4,
    left: 10,
    right: 10,
    borderRadius: 999,
    backgroundColor: "#10B981",
    opacity: 0.25,
  },
  timelinePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#10B981",
  },
  timelinePillText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#047857",
  },
  timelineArrow: {
    position: "absolute",
    right: 6,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftWidth: 10,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "#10B981",
    opacity: 0.75,
  },
  quickAnswerBox: {
    padding: 14,
    backgroundColor: "#ECFDF5",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
    marginTop: 20,
  },

  quickAnswerText: {
    fontSize: 14,
    color: "#065F46",
    lineHeight: 20,
  },
});
