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
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react-native";
import useUniversalLocation from "../../utils/useUniversalLocation";
import type { PriceForecastStackParamList } from "../../navigation/PriceForecastStack";
import { useLanguage } from "../../context/LanguageContext";
import { useNotifications } from "../../context/NotificationContext";

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
  plantingDate: string;
  seedVariety: string;
  area: string;
  totalCost: string;
  expectedYield: string;
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

const SEED_VARIETIES = ["Jet 999", "GT 709", "808", "Pacific 999", "Unknown"];

const PriceAdvisorScreen: React.FC = () => {
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
  const [showCalendar, setShowCalendar] = useState(false);
  const [showVarietyPicker, setShowVarietyPicker] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());

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
    plantingDate: "",
    seedVariety: "",
    area: "",
    totalCost: params.formData?.cost ? String(params.formData.cost) : "",
    expectedYield: params.formData?.yieldKg
      ? String(params.formData.yieldKg)
      : "",
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

  // Calendar Helper Functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const formatDateForDisplay = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const monthNames =
    language === "si"
      ? [
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
        ]
      : [
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

  const dayNames =
    language === "si"
      ? ["ඉරි", "සඳු", "අඟ", "බදා", "බ්‍රහ", "සිකු", "සෙන"]
      : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleDateSelect = (day: number) => {
    const selected = new Date(
      calendarDate.getFullYear(),
      calendarDate.getMonth(),
      day
    );
    setForm((f) => ({ ...f, plantingDate: formatDateForDisplay(selected) }));
    setShowCalendar(false);
  };

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

  const classifyProfitWindow = () => {
    const area = parseFloat(form.area || "0");
    const cost = parseFloat(form.totalCost || "0");
    const yieldPer = parseFloat(form.expectedYield || "0");

    if (!area || !cost || !yieldPer) {
      return "medium" as const;
    }

    const assumedPricePerKg = 150;
    const totalYield = area * yieldPer;
    const revenue = totalYield * assumedPricePerKg;
    const profit = revenue - cost;

    if (profit <= 0) return "bad" as const;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    if (margin >= 40) return "good" as const;
    if (margin >= 15) return "medium" as const;
    return "bad" as const;
  };

const handleQuestionPress = (key: QuestionKey) => {
  setSelectedQuestion(key);
  const plantingClass = classifyPlantingWindow();
  let answer = "";

  if (key === "start_now") {
    answer =
      plantingClass === "risky"
        ? "දැනට වගාව ආරම්භ කිරීම අවදානම් ලෙස පෙනේ. වැසි සහ කාලගුණය ස්ථාවර වනතුරු ටික දවසක් රැඳී සිටීම වඩාත් ආරක්ෂිතය."
        : plantingClass === "moderate"
        ? "වගාව ආරම්භ කළ හැකි නමුත් මධ්‍යම මට්ටමේ අවදානමක් පවතී. ජල කළමනාකරණය සහ පස තත්ත්වය පිළිබඳ විශේෂ අවධානයක් යොමු කරන්න."
        : "දැනට වගාව ආරම්භ කිරීමට හොඳ කාලයක් ලෙස පෙනේ. සාමාන්‍ය සැලසුම් සහිතව වගාව ආරම්භ කළ හැක.";
  }

  if (key === "before_start") {
    answer =
      "වගාව ආරම්භ කිරීමට පෙර සුදුසු බීජ වර්ගය තෝරාගැනීම, පස සකස් කිරීම, ජල සැලසුම, පොහොර අවශ්‍යතාවය සහ මුල් වියදම් සැලසුම් කරගැනීම අත්‍යවශ්‍යය.";
  }

  if (key === "district_time") {
    answer = form.district
      ? `${form.district} දිස්ත්‍රික්කය සඳහා මේ කාලය ${
          plantingClass === "risky"
            ? "වගාව ආරම්භ කිරීමට අවදානම් ලෙස"
            : "සාමාන්‍යයෙන් වගාවට සුදුසු ලෙස"
        } පෙනේ. කාලගුණ වෙනස්වීම් පිළිබඳ නිරන්තරයෙන් අවධානයෙන් සිටින්න.`
      : "කරුණාකර මුලින්ම ඔබගේ දිස්ත්‍රික්කය ඇතුළත් කරන්න.";
  }

  if (key === "biggest_risk") {
    answer =
      "වගාව ආරම්භ කිරීමේදී ඇති ප්‍රධාන අවදානම් වන්නේ අස්ථිර කාලගුණය, ජල සැලසුම නිසි ලෙස නොමැති වීම සහ වගාවට නොගැළපෙන බීජ වර්ග තෝරාගැනීමයි.";
  }

  if (key === "need_professional") {
    answer =
      plantingClass === "risky"
        ? "ඔව්. මෙම තත්ත්වයේදී කෘෂිකර්ම නිලධාරියෙකු හෝ වෘත්තීය උපදේශකයෙකුගෙන් උපදෙස් ලබාගැනීම දැඩිව නිර්දේශ කරයි."
        : "අත්‍යවශ්‍ය නොවුණත්, නවක ගොවියෙක් නම් හෝ සැලසුම් පිළිබඳ සැකයක් තිබේ නම් වෘත්තීය උපදෙස් ලබාගැනීම ප්‍රයෝජනවත් වේ.";
  }

  setQuickAnswer(answer);
};


  const runFullAdvisor = () => {
    const area = parseFloat(form.area || "0");
    const cost = parseFloat(form.totalCost || "0");
    const yieldPer = parseFloat(form.expectedYield || "0");

    const variety = form.seedVariety.trim() || "Unknown";
    const durationWeeks =
      VARIETY_DURATION_WEEKS[variety] || VARIETY_DURATION_WEEKS["Unknown"];

    const plantingClass = classifyPlantingWindow();
    const profitClass = classifyProfitWindow();

    let tag: "good" | "warn" | "info" = "info";
    let summaryLines: string[] = [];

    if (profitClass === "good") {
      tag = "good";
      summaryLines.push(t.profitGood);
    } else if (profitClass === "medium") {
      tag = "info";
      summaryLines.push(t.profitMedium);
    } else {
      tag = "warn";
      summaryLines.push(t.profitBad);
    }

    if (plantingClass === "excellent") {
      summaryLines.push(t.plantExcellent);
    } else if (plantingClass === "moderate") {
      summaryLines.push(t.plantModerate);
    } else {
      summaryLines.push(t.plantRisky);
    }

    if (area && yieldPer) {
      const assumedPricePerKg = 150;
      const totalYield = area * yieldPer;
      const revenue = totalYield * assumedPricePerKg;
      const profit = revenue - (cost || 0);
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

      const numericLine =
        language === "si"
          ? `මුළු අස්වැන්න ආසන්න වශයෙන් ${totalYield.toFixed(0)} ${
              t.kg
            }, ආදායම ${t.rs} ${revenue.toFixed(0)}, ලාභය ${
              t.rs
            } ${profit.toFixed(0)} (${margin.toFixed(1)}% ).`
          : `Approx. total yield ${totalYield.toFixed(0)} ${t.kg}, revenue ${
              t.rs
            } ${revenue.toFixed(0)}, profit ${t.rs} ${profit.toFixed(
              0
            )} (${margin.toFixed(1)}%).`;

      summaryLines.push(numericLine);
    }

    summaryLines.push(
      language === "si"
        ? `මෙම වර්ගය සඳහා සාමාන්‍ය වගා කාලය සති ${durationWeeks} ක් පමණ වේ.`
        : `Typical crop duration for this variety is about ${durationWeeks} weeks.`
    );

    setFullAdvisorTag(tag);
    setFullAdvisorText(summaryLines.join(" "));

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

  // Render Calendar
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(calendarDate);
    const firstDay = getFirstDayOfMonth(calendarDate);
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return (
      <Modal
        visible={showCalendar}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModal}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                onPress={() => {
                  const newDate = new Date(calendarDate);
                  newDate.setMonth(newDate.getMonth() - 1);
                  setCalendarDate(newDate);
                }}
              >
                <ChevronLeft color="#047857" size={24} />
              </TouchableOpacity>

              <Text style={styles.calendarTitle}>
                {monthNames[calendarDate.getMonth()]}{" "}
                {calendarDate.getFullYear()}
              </Text>

              <TouchableOpacity
                onPress={() => {
                  const newDate = new Date(calendarDate);
                  newDate.setMonth(newDate.getMonth() + 1);
                  setCalendarDate(newDate);
                }}
              >
                <ChevronRight color="#047857" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.calendarDayNames}>
              {dayNames.map((day, idx) => (
                <Text key={idx} style={styles.dayName}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {days.map((day, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.calendarDay,
                    day === null && styles.calendarDayEmpty,
                  ]}
                  onPress={() => day && handleDateSelect(day)}
                  disabled={day === null}
                >
                  {day && <Text style={styles.calendarDayText}>{day}</Text>}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCalendar(false)}
            >
              <Text style={styles.modalCloseText}>{t.cancel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

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
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.resultTitle}</Text>

            {quickAnswer ? (
              <View style={[styles.resultCard, { borderLeftColor: "#10B981" }]}>
                <View style={styles.resultHeader}>
                  <CheckCircle color="#10B981" size={24} />
                  <Text style={styles.resultHeaderText}>
                    {t.advisorTagGood}
                  </Text>
                </View>
                <Text style={styles.resultText}>{quickAnswer}</Text>
              </View>
            ) : (
              <View style={[styles.resultCard, { borderLeftColor: "#E5E7EB" }]}>
                <Text style={styles.resultText}>{t.noQuestionSelected}</Text>
              </View>
            )}

            {fullAdvisorText && (
              <View
                style={[
                  styles.resultCard,
                  {
                    borderLeftColor:
                      fullAdvisorTag === "good"
                        ? "#10B981"
                        : fullAdvisorTag === "warn"
                        ? "#EF4444"
                        : "#F59E0B",
                  },
                ]}
              >
                <View style={styles.resultHeader}>
                  {fullAdvisorTag === "good" && (
                    <CheckCircle color="#10B981" size={24} />
                  )}
                  {fullAdvisorTag === "warn" && (
                    <AlertTriangle color="#EF4444" size={24} />
                  )}
                  {fullAdvisorTag === "info" && (
                    <TrendingUp color="#F59E0B" size={24} />
                  )}
                  <Text style={styles.resultHeaderText}>
                    {fullAdvisorTag === "good"
                      ? t.advisorTagGood
                      : fullAdvisorTag === "warn"
                      ? t.advisorTagWarn
                      : t.advisorTagInfo}
                  </Text>
                </View>
                <Text style={styles.resultText}>{t.fullResultSummary}</Text>
                <Text style={[styles.resultText, { marginTop: 6 }]}>
                  {fullAdvisorText}
                </Text>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleEditInputs}
                >
                  <Text style={styles.secondaryButtonText}>{t.editInputs}</Text>
                </TouchableOpacity>
              </View>
            )}
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
                  <Text style={styles.inputLabel}>{t.formDistrict}</Text>
                  <TextInput
                    style={styles.input}
                    value={form.district}
                    onChangeText={(text) =>
                      setForm((f) => ({ ...f, district: text }))
                    }
                    placeholder={
                      language === "si" ? "උදා: අනුරාධපුර" : "e.g. Anuradhapura"
                    }
                    placeholderTextColor="#9CA3AF"
                  />

                  <Text style={styles.inputLabel}>{t.formPlantingDate}</Text>
                  <TouchableOpacity
                    style={styles.pickerInput}
                    onPress={() => setShowCalendar(true)}
                  >
                    <Calendar color="#10B981" size={20} />
                    <Text
                      style={[
                        styles.pickerText,
                        !form.plantingDate && styles.pickerPlaceholder,
                      ]}
                    >
                      {form.plantingDate || t.selectDate}
                    </Text>
                  </TouchableOpacity>

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

                  <Text style={styles.inputLabel}>{t.formCost}</Text>
                  <TextInput
                    style={styles.input}
                    value={form.totalCost}
                    onChangeText={(text) =>
                      setForm((f) => ({ ...f, totalCost: text }))
                    }
                    keyboardType="numeric"
                    placeholder="45000"
                    placeholderTextColor="#9CA3AF"
                  />

                  <Text style={styles.inputLabel}>{t.formYield}</Text>
                  <TextInput
                    style={styles.input}
                    value={form.expectedYield}
                    onChangeText={(text) =>
                      setForm((f) => ({ ...f, expectedYield: text }))
                    }
                    keyboardType="numeric"
                    placeholder="1750"
                    placeholderTextColor="#9CA3AF"
                  />

                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={runFullAdvisor}
                  >
                    <Text style={styles.primaryButtonText}>
                      {t.btnRunFullAdvisor}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}
          </View>

          <TouchableOpacity
            style={styles.chatButton}
            onPress={() =>
              navigation.navigate("Chat", { roomId: null, userId: "" })
            }
          >
            <Text style={styles.chatText}>වෘත්තීය උපදෙස් ලබාගන්න</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </Animated.View>
      </ScrollView>

      {renderCalendar()}
      {renderVarietyPicker()}
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
});
