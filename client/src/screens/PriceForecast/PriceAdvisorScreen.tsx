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
} from "lucide-react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import useUniversalLocation from "../../utils/useUniversalLocation";
import type { PriceForecastStackParamList } from "../../navigation/PriceForecastStack";
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

type NavProp = StackNavigationProp<
  PriceForecastStackParamList,
  "PriceAdvisorScreen"
>;

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
  "Jet 999": 13,
  "GT 709": 14,
  "808": 16,
  "Pacific 999": 15,
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

const SEED_VARIETIES = ["Jet 999", "GT 709", "808", "Pacific 999", "Unknown"];

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
      formPlantingDate: "බීජ පැල කිරීමේ දිනය",
      formVariety: "බීජ වර්ගය",
      formArea: "වැවිලි භූමි ප්‍රමාණය (ha / acre)",
      formCost: "මුළු වියදම (රු.)",
      formYield: "අපේක්ෂිත අස්වැන්න (කි.ග්‍රෑ / ප්‍රමාණ ඒකකය)",
      btnRunFullAdvisor: "සම්පූර්ණ වගා උපදෙස් ලබාගන්න",
      noQuestionSelected: "කරුණාකර ප්‍රශ්නයක් තෝරන්න හෝ පෝරමය පුරවන්න.",
      weatherLoading: "කාලගුණ දත්ත ලබාගැනෙමින්...",
      plantExcellent: "මේ සතිය වගා කිරීමට ඉතා හොඳ වේ.",
      plantModerate: "වගා කළ හැක, නමුත් අවදානම් මට්ටම මධ්‍යමයි.",
      plantRisky: "වගා කිරීම සඳහා අනෙකුත් සතියක් හොඳයි.",
      weatherGood: "කාලගුණය වගා කිරීමට සුදුසු පරාසය තුළ තිබේ.",
      weatherBad:
        "උෂ්ණත්වය හෝ වැසි තත්ත්වය හේතුවෙන් වගා කිරීම සඳහා සුදුසු නොවේ.",
      profitGood: "ආදායම වියදමට සාපේක්ෂව ඉතා හොඳි. වගා කිරීම ලාභදායීය.",
      profitMedium: "ලාභ ඇත, නමුත් අඩුයි. ගබඩා, ණය වාරික වැනි සාධක සලකා බලන්න.",
      profitBad:
        "වගා කිරීමෙන් ලාභයට වඩා වියදම් වැඩි වීමට ඉඩ ඇත. වගා කිරීමෙන් වැලකෙන්න.",
      bestHarvestHint:
        "අස්වැන්නෙන් සති 1–3 ක් ඇතුළත වෙළඳපල තත්ත්වය පරීක්ෂා කර විකිණීමට සැලසුම් කරන්න.",
      fullResultSummary: "සම්පූර්ණ විශ්ලේෂණය පදනම් වූ නිර්දේශය පහතින් දැක්වේ.",
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
      formPlantingDate: "Planting Date",
      formVariety: "Seed Variety",
      formArea: "Farm Area (ha / acre)",
      formCost: "Total Cost (Rs.)",
      formYield: "Expected Yield (kg / unit area)",
      btnRunFullAdvisor: "Run Full Advisor",
      noQuestionSelected: "Select a question or fill the form to see advice.",
      weatherLoading: "Fetching weather data...",
      plantExcellent: "This week looks excellent for planting.",
      plantModerate: "You can plant, but risk is moderate.",
      plantRisky: "Better to choose another week for planting.",
      weatherGood: "Weather is within a good range for maize planting.",
      weatherBad:
        "Temperature or rain conditions are not ideal for planting now.",
      profitGood:
        "Expected revenue is clearly higher than cost. Planting is profitable.",
      profitMedium:
        "There is some profit, but not very high. Consider storage, cash flow, etc.",
      profitBad:
        "Costs may exceed revenue. It may be better to avoid planting now.",
      bestHarvestHint:
        "Plan to sell within 1–3 weeks after harvest depending on market signals.",
      fullResultSummary:
        "Below is the recommendation based on your detailed inputs.",
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
    "ජනවාරි","පෙබරවාරි","මාර්තු","අප්‍රේල්","මැයි","ජූනි",
    "ජූලි","අගෝස්තු","සැප්තැම්බර්","ඔක්තෝබර්","නොවැම්බර්","දෙසැම්බර්",
  ];

  const monthsEn = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];

  return language === "si" ? monthsSi[idx] : monthsEn[idx];
};



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

    // ---------- Actionable next steps ----------
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
    durationWeeks,
  }: {
    location: string;
    startWeek: number;
    durationWeeks: number;
  }) => {
    const params = new URLSearchParams({
      location,
      start_week: String(startWeek),
      duration_weeks: String(durationWeeks),
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
    durationWeeks,
  }: {
    location: string;
    plantingDate: string; // "YYYY-MM-DD"
    durationWeeks: number;
  }) => {
    const params = new URLSearchParams({
      location,
      planting_date: plantingDate,
      duration_weeks: String(durationWeeks),
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

    // --------------------------------------------------
    // 1️⃣ Price Window (existing – KEEP)
    // --------------------------------------------------
    try {
      setPriceWindowLoading(true);

      const startWeek = getCurrentWeekNum();

      const priceRes = await fetchBestPlantingWindow({
        location: apiLocation,
        startWeek,
        durationWeeks,
      });

      setPriceWindowResult(priceRes);
    } catch (e) {
      console.log("Price window unavailable:", e);
      setPriceWindowResult(null);
    } finally {
      setPriceWindowLoading(false);
    }

    // --------------------------------------------------
    // 2️⃣ NEW — Date-based harvest advisory (ADD)
    // --------------------------------------------------
    try {
      setHarvestAdvisoryLoading(true);

      if (form.plantingDateExact) {
        const adv = await fetchHarvestAdvisoryByDate({
          location: apiLocation,
          plantingDate: form.plantingDateExact,
          durationWeeks,
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



  const getPriceMessage = (
    label: string,
    confidence: string,
    language: "si" | "en"
  ) => {
    if (language === "si") {
      if (label === "STRONG") {
        return "පසුගිය වසර වල දත්ත අනුව, මේ කාලයේදී බඩ ඉරිඟු මිල සාමාන්‍යයෙන් ඉහළ අගයක් ගෙන තිබේ. මේ කාලයෙහි අස්වැන්න ලැබෙන ලෙස වගා කිරීමෙන් ලාභ ලැබීමේ ඉඩ වැඩියි.";
      }
      if (label === "WEAK") {
        return "අස්වැන්න ලැබෙන කාලයේදී බඩ ඉරිඟු මිල අඩු වීමේ ප්‍රවණතාවයක් පෙනේ. එබැවින් profit අඩුවීමට හෝ පාඩු වීමට ඉඩ ඇත.";
      }
      return "පසුගිය දත්ත අනුව, මේ කාලයේදී බඩ ඉරිඟු මිල මධ්‍යම මට්ටමේ පවතී. වෙළඳපොළ තත්ත්වයන් අනුව ලාභය වෙනස් විය හැක.";
    }

    // English
    if (label === "STRONG") {
      return "Based on historical data, maize prices tend to be higher during this harvest period. Planting to harvest in this window offers a higher chance of profit.";
    }
    if (label === "WEAK") {
      return "Historically, maize prices are lower during this harvest period. There is a higher risk of reduced profit or loss.";
    }
    return "Based on historical patterns, maize prices are moderate during this period. Profitability may vary depending on market conditions.";
  };

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
          </View>

          {/* Advisor Result */}
          {/* ✅ Unified Advisor Card (NO REMOVALS) */}
{/* Advisor Result - Combined Single Card */}
          {(fullAdvisorText || priceWindowResult || harvestAdvisoryResult || priceWindowLoading || harvestAdvisoryLoading) && (
            <View style={styles.section}>
              <View style={styles.unifiedAdvisorCard}>
                {/* Header with Icon */}
                <View style={styles.advisorHeader}>
                  <View style={styles.advisorIconContainer}>
                    <Leaf color="#FFFFFF" size={28} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.advisorMainTitle}>
                      {language === "si" ? "වගා උපදේශක ප්‍රතිඵලය" : "Cultivation Advisory Result"}
                    </Text>
                    <Text style={styles.advisorSubtitle}>
                      {language === "si" ? "සම්පූර්ණ විශ්ලේෂණය සහ නිර්දේශ" : "Complete Analysis & Recommendations"}
                    </Text>
                  </View>
                </View>

                {/* Readiness Progress at Top */}
                {fullAdvisorText && (
                  <>
                    {(() => {
                      const { percent } = getReadinessScore();
                      return <CircularProgress percent={percent} />;
                    })()}

                    {/* Decision Badge */}
                    <View style={[
                      styles.decisionBadge,
                      {
                        backgroundColor: fullAdvisorTag === "good" ? "#ECFDF5" : 
                                       fullAdvisorTag === "warn" ? "#FEF2F2" : "#FEF3C7"
                      }
                    ]}>
                      {fullAdvisorTag === "good" && <CheckCircle color="#10B981" size={20} />}
                      {fullAdvisorTag === "warn" && <AlertTriangle color="#EF4444" size={20} />}
                      {fullAdvisorTag === "info" && <TrendingUp color="#F59E0B" size={20} />}
                      
                      <Text style={[
                        styles.decisionText,
                        {
                          color: fullAdvisorTag === "good" ? "#065F46" :
                                 fullAdvisorTag === "warn" ? "#991B1B" : "#92400E"
                        }
                      ]}>
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

                {/* Price Window Section */}
                <View style={styles.advisorySection}>
                  <View style={styles.sectionTitleRow}>
                    <DollarSign color="#0EA5E9" size={20} />
                    <Text style={styles.sectionTitleText}>
                      {language === "si" ? "මිල අනාවැකි" : "Price Forecast"}
                    </Text>
                  </View>

                  {priceWindowLoading ? (
                    <Text style={styles.loadingText}>
                      {language === "si" ? "ගණනය කරමින්..." : "Calculating..."}
                    </Text>
                  ) : priceWindowResult?.best_option ? (
                    <View style={styles.infoBox}>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>
                          {language === "si" ? "හොඳම වගා සතිය:" : "Best planting week:"}
                        </Text>
                        <Text style={styles.infoValue}>{priceWindowResult.best_option.planting_week}</Text>
                      </View>
                      
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>
                          {language === "si" ? "අස්වැන්න සතිය:" : "Harvest week:"}
                        </Text>
                        <Text style={styles.infoValue}>{priceWindowResult.best_option.harvest_week}</Text>
                      </View>

                      <View style={[styles.infoRow, { marginTop: 8 }]}>
                        <View style={[
                          styles.strengthBadge,
                          {
                            backgroundColor: priceWindowResult.best_option.label === "STRONG" ? "#DCFCE7" :
                                           priceWindowResult.best_option.label === "WEAK" ? "#FEE2E2" : "#FEF3C7"
                          }
                        ]}>
                          <Text style={[
                            styles.strengthText,
                            {
                              color: priceWindowResult.best_option.label === "STRONG" ? "#166534" :
                                     priceWindowResult.best_option.label === "WEAK" ? "#991B1B" : "#92400E"
                            }
                          ]}>
                            {priceWindowResult.best_option.label}
                          </Text>
                        </View>
                        <Text style={styles.confidenceText}>
                          {language === "si" ? "විශ්වාසය:" : "Confidence:"} {priceWindowResult.best_option.confidence}
                        </Text>
                      </View>

                      <Text style={styles.noteText}>
                        {language === "si"
                          ? "සටහන: පසුගිය දත්ත මත පදනම් වූ මිල ප්‍රවණතා"
                          : "Note: Based on historical price patterns"}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.noDataText}>
                      {language === "si"
                        ? "මෙම දිස්ත්‍රික්කය සඳහා දත්ත නොමැත"
                        : "No data available for this location"}
                    </Text>
                  )}
                </View>

                {/* Divider */}
                {form.plantingDateExact && <View style={styles.sectionDivider} />}

                {/* Harvest Advisory Section */}
                {form.plantingDateExact && (
                  <View style={styles.advisorySection}>
                    <View style={styles.sectionTitleRow}>
                      <Calendar color="#22C55E" size={20} />
                      <Text style={styles.sectionTitleText}>
                        {language === "si" ? "අස්වැන්න උපදෙස්" : "Harvest Advisory"}
                      </Text>
                    </View>

                    {harvestAdvisoryLoading ? (
                      <Text style={styles.loadingText}>
                        {language === "si" ? "ගණනය කරමින්..." : "Calculating..."}
                      </Text>
                    ) : harvestAdvisoryResult ? (
                      <View style={styles.infoBox}>
                        <View style={[styles.recommendationBadge, {
                          backgroundColor: harvestAdvisoryResult.signal === "HOLD" ? "#FEF3C7" : "#DCFCE7"
                        }]}>
                          <Text style={[styles.recommendationText, {
                            color: harvestAdvisoryResult.signal === "HOLD" ? "#92400E" : "#166534"
                          }]}>
                            {harvestAdvisoryResult.recommended_action}
                          </Text>
                        </View>

                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>
                            {language === "si" ? "මූලික අස්වැන්න සතිය:" : "Base harvest week:"}
                          </Text>
                          <Text style={styles.infoValue}>{harvestAdvisoryResult.base_harvest_week}</Text>
                        </View>

                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>
                            {language === "si" ? "හොඳම විකුණුම් සතිය:" : "Best selling week:"}
                          </Text>
                          <Text style={[styles.infoValue, { color: "#22C55E", fontWeight: "700" }]}>
                            {harvestAdvisoryResult.best_harvest_week}
                          </Text>
                        </View>

                        <Text style={styles.messageText}>
                          {harvestAdvisoryResult.message_si || harvestAdvisoryResult.message}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.noDataText}>
                        {language === "si" ? "තොරතුරු නොමැත" : "No data available"}
                      </Text>
                    )}
                  </View>
                )}

                {/* Action Buttons */}
                {fullAdvisorText && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.editButton} onPress={handleEditInputs}>
                      <Text style={styles.editButtonText}>{t.editInputs}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.saveButton} onPress={saveMyPlan}>
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

  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderLeftWidth: 5,
    borderColor: "#E5E7EB",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  resultHeaderText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#065F46",
    letterSpacing: 0.2,
  },
  resultText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 21,
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  calendarModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#065F46",
  },
  calendarDayNames: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  dayName: {
    width: 40,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarDay: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  calendarDayEmpty: {
    backgroundColor: "transparent",
  },
  calendarDayText: {
    fontSize: 14,
    color: "#065F46",
    fontWeight: "500",
  },
  modalCloseButton: {
    marginTop: 16,
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  modalCloseText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "600",
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
  unifiedCard: {
  backgroundColor: "#FFFFFF",
  borderRadius: 20,
  padding: 16,
  borderWidth: 2,
  borderColor: "#D1FAE5",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 4,
},

unifiedTitleRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  marginBottom: 12,
},

unifiedTitleText: {
  fontSize: 17,
  fontWeight: "800",
  color: "#065F46",
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
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
    fontStyle: "italic",
    marginTop: 8,
  },
  infoBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  strengthBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "700",
  },
  confidenceText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  noteText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 10,
    fontStyle: "italic",
    lineHeight: 16,
  },
  noDataText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontStyle: "italic",
    marginTop: 8,
  },
  recommendationBadge: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  recommendationText: {
    fontSize: 14,
    fontWeight: "700",
  },
  messageText: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 10,
    lineHeight: 19,
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

});
