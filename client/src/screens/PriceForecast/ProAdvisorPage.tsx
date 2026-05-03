import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  ArrowLeft,
  Bell,
  Zap,
  TrendingUp,
  Calendar,
  MapPin,
  Droplets,
  AlertTriangle,
  CheckCircle,
  X,
  Archive,
  Leaf,
  ChevronDown,
  Sprout,
  DollarSign,
  CloudRain,
  Package,
  Clock,
  Target,
  Lightbulb,
  BookOpen,
  ShieldAlert,
} from "lucide-react-native";
import { useLanguage } from "../../context/LanguageContext";
import { useNotifications } from "../../context/NotificationContext";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { PriceForecastStackParamList } from "../../navigation/PriceForecastStack";

type Language = "si" | "en" | "ta";

type ProAdvisorPageNavProp = StackNavigationProp<
  PriceForecastStackParamList,
  "ProAdvisorPage"
>;

type ProAdvisorPageRouteProp = RouteProp<
  PriceForecastStackParamList,
  "ProAdvisorPage"
>;

interface FormData {
  district: string;
  plantingDateExact: string;
  seedVariety: string;
  area: string;
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

interface ProAdvice {
  harvestTiming: string;
  delayWeeks: number;
  storageRequired: boolean;
  storageDuration: number;
  storageAdvice: string;
  seedGuidance: string;
  waterGuidance: string;
  fertilizerGuidance: string;
  financeGuidance: string;
  riskFactors: string[];
  opportunities: string[];
  actionItems: string[];
}

const DISTRICT_TO_API_LOCATION: Record<string, string> = {
  අනුරාධපුර: "Anuradapura",
  මොණරාගල: "Monaragala",
  තිස්සමහාරාමය: "Tissamaharama",
  Anuradhapura: "Anuradhapura",
  Monaragala: "Monaragala",
  Tissamaharama: "Tissamaharama",
};

const toApiLocation = (district: string) => {
  const d = (district || "").trim();
  return DISTRICT_TO_API_LOCATION[d] || d;
};

const VARIETY_DURATION_WEEKS: Record<string, number> = {
  "GT 709": 16,
  "GT 200": 15,
  "Pacific 808": 17,
  "Jet 999": 16,
  Commando: 15,
  "Local Variety": 14,
  Unknown: 14,
};

const FIRST_TIME_GUIDE: Record<
  Language,
  { seed: string; water: string; fertilizer: string; finance: string }
> = {
  ta: {
    seed: [
      "• தரமான கலப்பின விதைகள் அல்லது உள்ளூர் பரிந்துரைக்கப்பட்ட வகைகளை (எ.கா: A6604, PAC 7803, Lankamil 1) தேர்வு செய்யவும்",
      "• நடவு செய்வதற்கு முன் மண் பரிசோதனை நடத்தி pH 6.0–6.8 அளவில் பராமரிக்கவும்",
      "• நோய் மற்றும் பூச்சிகளிலிருந்து பாதுகாக்க பூஞ்சாணக்கொல்லி மற்றும் பூச்சிக்கொல்லிகளால் விதைகளை நேர்த்தி செய்யவும்",
      "• விதைகளை 3–5 செ.மீ ஆழத்தில் 20–25 செ.மீ இடைவெளியில் வரிசைகளில் நடவும்; வரிசைகளுக்கு இடையே 60–75 செ.மீ இடம் விடவும்",
      "• விதைகளுக்கு மண்ணை அழுத்தி உடனே நீர் பாய்ச்சவும்",
    ].join("\n"),
    water: [
      "• மண்ணை ஈரமாக வைத்திருங்கள், ஆனால் நீர் தேங்காமல் பார்க்கவும்; மக்காச்சோளத்திற்கு நிலையான ஈரப்பதம் தேவை",
      "• வாரத்திற்கு 1–1.5 அங்குல தண்ணீர் வழங்கவும்; வறண்ட காலங்களில் 2 அங்குலம் வரை அதிகரிக்கவும்",
      "• கொத்துக்கட்டை நிலை (tasselling) இரண்டு வாரங்களுக்கு முன் அதிக நீர்ப்பாசனம் தவிர்க்கவும்",
      "• நீரை சிக்கனமாக பயன்படுத்த சொட்டு அல்லது வாய்க்கால் நீர்ப்பாசன முறைகளை பயன்படுத்தவும்",
      "• மழையை கண்காணிக்க மழைமானி பயன்படுத்தி நீர்ப்பாசனத்தை அதற்கேற்ப சரிசெய்யவும்",
    ].join("\n"),
    fertilizer: [
      "• மண் பரிசோதனை அடிப்படையில் உர திட்டம் தயாரிக்கவும்; மக்காச்சோளத்திற்கு நைட்ரஜன், பாஸ்பரஸ் மற்றும் பொட்டாசியம் தேவை",
      "• நிலம் தயாரிக்கும் போது கரிம பொருட்களை சேர்த்து மண் வளத்தை மேம்படுத்தவும்",
      "• செடிகள் 30 செ.மீ உயரம் வரும்போது நைட்ரஜன் உரம் இடவும்; கொத்துக்கட்டை நிலையிலும் மீண்டும் இடவும்",
      "• சிறந்த ஊட்டச்சத்து உட்கொள்ளலுக்கு மண் pH 6.0–6.8 அளவில் பராமரிக்கவும்",
      "• இலைகள் மஞ்சளாகினால் மீன் கரைசல் போன்ற விரைவாக செயல்படும் நைட்ரஜன் மூலங்களை பயன்படுத்தவும்",
    ].join("\n"),
    finance: [
      "• விதைகள், உரங்கள், பயிர் பாதுகாப்பு உப்புகள், நீர்ப்பாசனம், உழைப்பு, இயந்திர எரிபொருள், பழுதுபார்ப்பு உள்ளிட்ட செலவுகளை மதிப்பிடவும்",
      "• உபகரண தேய்மானம், பண்ணை மேலணி மற்றும் நில வாடகை போன்ற உரிமை செலவுகளை பட்ஜெட்டில் சேர்க்கவும்",
      "• சேமிப்பு, சந்தைப்படுத்தல், காப்பீடு மற்றும் ஆலோசனை கட்டணங்களுக்கு நிதி ஒதுக்கவும்",
      "• அறுவடை நடவடிக்கைகளான உலர்த்துதல் மற்றும் போக்குவரத்துக்காக நிதி ஒதுக்கவும்",
      "• எதிர்பாராத செலவுகளுக்கு அவசர நிதி வைத்திருங்கள்",
      "• நிதி குறைவாக இருந்தால் அரசு மானியங்கள், கூட்டுறவு கொள்முதல் அல்லது நுண்கடன் திட்டங்களை ஆராயவும்",
    ].join("\n"),
  },
  en: {
    seed: [
      "• Choose high‑quality hybrid seeds or locally recommended varieties (e.g., A6604, PAC 7803, Lankamil 1)",
      "• Conduct a soil test and maintain soil pH between 6.0–6.8 before planting",
      "• Treat seeds with fungicides and insecticides to protect against diseases and pests",
      "• Plant seeds 1.5–2.5 inches (3–5 cm) deep, spaced 20–25 cm apart in rows, with rows 60–75 cm apart",
      "• Firm soil over the seeds and water immediately to ensure good seed‑to‑soil contact",
    ].join("\n"),
    water: [
      "• Keep the soil moist but not waterlogged; corn needs steady moisture",
      "• Provide about 1–1.5 inches of water per week and increase to 2 inches during dry periods",
      "• Delay heavy irrigation until two weeks before the tasselling stage to optimise yield",
      "• Use drip or furrow irrigation to conserve water and ensure even distribution",
      "• Use a rain gauge to monitor rainfall and adjust irrigation accordingly",
    ].join("\n"),
    fertilizer: [
      "• Base your fertiliser plan on a soil test; corn requires nitrogen, phosphorus and potassium",
      "• Incorporate organic matter during land preparation to improve soil fertility",
      "• Apply a side‑dress of nitrogen fertiliser when plants are about 12 inches tall and repeat at tasselling",
      "• Maintain soil pH between 6.0–6.8 for optimal nutrient uptake",
      "• If leaves turn yellow, use quick‑acting sources such as fish emulsion to correct nutrient deficiencies",
    ].join("\n"),
    finance: [
      "• Estimate your input costs: seeds, fertilisers and soil amendments, crop protection chemicals, irrigation, labour, machinery fuel, repairs and maintenance",
      "• Include ownership costs such as equipment depreciation, farm overhead and land rental",
      "• Budget for supplies, storage, marketing, insurance and consulting fees",
      "• Set aside funds for harvest operations such as drying and transportation",
      "• Maintain a contingency fund for unexpected expenses and cash‑flow gaps",
      "• If funds are limited, explore government subsidies, cooperative purchasing or micro‑finance programs",
    ].join("\n"),
  },
  si: {
    seed: [
      "• උසස් ගුණාත්මක හයිබ්‍රිඩ් බීජ හෝ ප්‍රදේශයට ගැලපෙන බීජ වර්ග (උදා: A6604, PAC 7803, Lankamil 1) තෝරන්න",
      "• වගා කිරීමට පෙර පොළව පරීක්ෂා කර pH 6.0–6.8 අතර පවත්වාගන්න",
      "• බීජ ජීව ක්‍ෂය නාශක හා කෘමි නාශකවලින් සකස් කර රෝග හා කෘමීන් වලින් ආරක්ෂා කරන්න",
      "• බීජ 3–5 සෙ.මී. ගැඹුරින් සිට 20–25 සෙ.මී. දුරින් පේළිවල අරඹන්න; පේළි අතර 60–75 සෙ.මී. ඉඩ දෙන්න",
      "• බීජ මතින් මඩ පීරිසි කර වගාවට පසු වහාම ජලය සපයන්න",
    ].join("\n"),
    water: [
      "• පස තෙතමින් පැවැත්වන්න, නමුත් ජලය යථා සුදුසු ලෙස පවත්වාගන්න; බඩ ඉරිඟු බෝගයට ස්ථිර ජලය අවශ්‍යයි",
      "• සතියකට ජලය අඟල් 1–1.5 පමණ ලබාදෙන්න; වියළි කාලවලදී එය අඟල් 2 දක්වා වැඩි කරන්න",
      "• උත්පාද්‍ය කාළයේ (tasselling) දෙස බලා යළි උත්සහ කල හැකි දැඩි වාරිමාර්ගය ඇරඹීම සති දෙකක් පැරණි ලෙස පමණක් සිදුකරන්න",
      "• ජලය ඉතිරි කිරීමට drip හෝ furrow වාරිමාර්ග පද්ධති භාවිතා කරන්න",
      "• වැස්ස පරීක්ෂා කිරීමට වර්ෂාමාන මානකය භාවිතා කර වාරිමාර්ගය අනුව වෙනස් කරන්න",
    ].join("\n"),
    fertilizer: [
      "• පස විශ්ලේෂණයකට අනුව පොහොර සැලැස්මක් සකස් කරන්න; බඩ ඉරිඟු බෝගයට නයිට්‍රජන්, පොස්‌පරස් හා පොටෑසියම් අවශ්‍යවේ",
      "• ඉඩම් සකස් කිරීමේදී සෞඛ්‍යවත් පසකට සංග්‍රහ ද්‍රව්‍ය (ජීව සංස්කරණ) එක් කරන්න",
      "• පැල 12 අඟල් උසට ළඟාවන විට නයිට්‍රජන් පොහොර පිටින් යොදන්න සහ tasselling අවස්ථාවේ නැවත යොදන්න",
      "• පස pH 6.0–6.8 අතර පවත්වාගෙන පෝෂක උරුමය වැඩි කරන්න",
      "• කොළ වර්ණ තැඹිලි පැහැති වන විට fish emulsion වැනි වේගයෙන් ක්‍රියාකරන නයිට්‍රජන් මූලාශ්‍ර භාවිතා කරන්න",
    ].join("\n"),
    finance: [
      "• බීජ, පොහොර හා පස සංශෝධක, කෘමි පාලන රසායන, වාරිමාර්ග, ශ්‍රම, යන්ත්‍ර ඉන්ධන, අලුත්වැඩියා වැනි ආදාන පිරිවැය ඇස්තමේන්තු කරන්න",
      "• උපකරණ අයකිරීම්, ගොවිපොළ නඩත්තු හා ඉඩම් කුලිය වැනි හිමිකම් පිරිවැය සලකා බැලීමට අයවැයට ඇතුළත් කරන්න",
      "• ගබඩා, අලෙවිකරණ, රක්ෂණ හා උපදේශන ගාස්තු සඳහා මුදල් වෙන් කරන්න",
      "• අස්වැන්න සකස් කිරීමේ ක්‍රියාවන් සඳහා (සීනි වියලීම, ප්‍රවාහනය) මුදල් අත්වැලක් තබාගන්න",
      "• නොසිතූ වියදම් හා රුපියල් දෝෂ සඳහා contingency funds සකස් කරගන්න",
      "• ඔබේ අයවැය සීමිත නම් රජයේ සහන, සහකාර මිලදීගැනීම් හෝ මයික්‍රෝ ණය වැඩසටහන් සොයා බලන්න",
    ].join("\n"),
  },
};

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

const ProAdvisorPage: React.FC = () => {
  const navigation = useNavigation<ProAdvisorPageNavProp>();
  const route = useRoute<ProAdvisorPageRouteProp>();
  const { formData } = route.params;
  const { language: globalLang } = useLanguage();
  const language: Language =
    globalLang === "sinhala" ? "si" : globalLang === "tamil" ? "ta" : "en";
  const { unreadCount } = useNotifications();

  const [fadeAnim] = useState(new Animated.Value(0));
  const [proAdvice, setProAdvice] = useState<ProAdvice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [expandedGuides, setExpandedGuides] = useState<{
    [key: string]: boolean;
  }>({
    seed: false,
    water: false,
    fertilizer: false,
    finance: false,
  });

  const T = {
    ta: {
      title: "Pro Advisor",
      subtitle: "உங்கள் விவசாய திட்டம்",
      loading: "ஏற்றுகிறது...",
      noData: "தரவை பெற முடியவில்லை",
      tryAgain: "மீண்டும் முயற்சிக்கவும்",
      harvest: "🌽 அறுவடை & சேமிப்பு",
      storage: "சேமிப்பு பரிசீலனை",
      seed: "🌱 விதை வழிகாட்டுதல்",
      water: "💧 நீர் மேலாண்மை",
      fertilizer: "🧪 உர திட்டம்",
      finance: "💰 நிதி திட்டம்",
      risks: "⚠️ அபாய காரணிகள்",
      opportunities: "⭐ சாத்தியங்கள்",
      actions: "✅ செய்ய வேண்டியவை",
      backToAdvice: "Advisor க்கு திரும்பு",
      week: "வாரங்கள்",
      readyToStart: "தயாராக உள்ளது",
      needPrep: "தயாரிப்பு தேவை",
      firstTimeNote: "முதல்முறை விவசாயிகளுக்கான படிப்படியான வழிகாட்டுதல்",
      completeGuide: "📚 முழுமையான விவசாய வழிகாட்டி",
      timelineTitle: "⏱️ விவசாய காலவரிசை",
      readinessCheck: "✓ தயார்நிலை சரிபார்ப்பு",
      marketStrategy: "📊 சந்தை உத்தி",
      expertTips: "💡 நிபுணர் குறிப்புகள்",
      weatherConsiderations: "🌤️ வானிலை பரிசீலனைகள்",
      pestManagement: "🐛 பூச்சி மேலாண்மை",
      yieldOptimization: "📈 விளைச்சல் மேம்பாடு",
    },
    si: {
      title: "Pro Advisor",
      subtitle: "ඔබගේ සූදානම් වගා සැලසුම",
      loading: "ලබාගැනෙමින්...",
      noData: "තොරතුරු ලබාගත නොහැක",
      tryAgain: "නැවත උත්සාහ කරන්න",
      harvest: "🌽 අස්වැන්න හා ගබඩා කිරීම",
      storage: "ගබඩා සලකා බැලීම",
      seed: "🌱 බීජ සඳහා උපදෙස්",
      water: "💧 ජල කළමනාකරණය",
      fertilizer: "🧪 පොහොර සැලසුම",
      finance: "💰 මුදල් සැලසුම",
      risks: "⚠️ අවදානම් සාධක",
      opportunities: "⭐ සුයෝගයන්",
      actions: "✅ කිරීමට ඇති කටයුතු",
      backToAdvice: "Advisor එකට ආපසු",
      week: "සති",
      readyToStart: "ඉතා සූදානම්",
      needPrep: "සූදානම් වීම අවශ්‍ය",
      firstTimeNote: "පළමු වතාවට වගා කරන ඔබ සඳහා ස්ටෙප්-බයි-ස්ටෙප් මාර්ගෝපදේශය",
      completeGuide: "📚 සම්පූර්ණ වගා මාර්ගෝපදේශය",
      timelineTitle: "⏱️ වගා කාලසටහන",
      readinessCheck: "✓ සූදානම් පරීක්ෂාව",
      marketStrategy: "📊 වෙළඳපොළ උපාය මාර්ගය",
      expertTips: "💡 විශේෂඥ උපදෙස්",
      weatherConsiderations: "🌤️ කාලගුණික සලකා බැලීම්",
      pestManagement: "🐛 පළිබෝධ කළමනාකරණය",
      yieldOptimization: "📈 අස්වැන්න උපරිම කිරීම",
    },
    en: {
      title: "Pro Advisor",
      subtitle: "Your detailed cultivation plan",
      loading: "Loading...",
      noData: "Unable to fetch data",
      tryAgain: "Try Again",
      harvest: "🌽 Harvest & Storage",
      storage: "Storage Consideration",
      seed: "🌱 Seed Guidance",
      water: "💧 Water Management",
      fertilizer: "🧪 Fertilizer Plan",
      finance: "💰 Finance Plan",
      risks: "⚠️ Risk Factors",
      opportunities: "⭐ Opportunities",
      actions: "✅ Action Items",
      backToAdvice: "Back to Advisor",
      week: "weeks",
      readyToStart: "Ready to start",
      needPrep: "Preparation needed",
      firstTimeNote: "Step-by-step guidance for first-time farmers",
      completeGuide: "📚 Complete Cultivation Guide",
      timelineTitle: "⏱️ Cultivation Timeline",
      readinessCheck: "✓ Readiness Check",
      marketStrategy: "📊 Market Strategy",
      expertTips: "💡 Expert Tips",
      weatherConsiderations: "🌤️ Weather Considerations",
      pestManagement: "🐛 Pest Management",
      yieldOptimization: "📈 Yield Optimization",
    },
  };

  const t = T[language];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    generateProAdvice();
  }, [formData, language]);

  const generateProAdvice = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiLocation = toApiLocation(formData.district);
      const seed = (formData.seedVariety || "Unknown").trim() || "Unknown";
      const durationWeeks =
        VARIETY_DURATION_WEEKS[seed] ?? VARIETY_DURATION_WEEKS["Unknown"];

      const url = `${API_URL}/price-window/advisor-guide`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: apiLocation,
          plantingDate: formData.plantingDateExact,
          seedVariety: seed,
          experience: formData.experienceLevel,
          landSize: formData.area || "0",
          irrigationAvailable: formData.hasIrrigation,
          language,
          preparedness: {
            seedReady: formData.readiness.seeds,
            waterReady: formData.readiness.water,
            fertilizerReady: formData.readiness.fertilizer,
            storageReady: formData.readiness.land,
            financeReady: formData.readiness.capital,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch pro advice");
      }

      const data = await response.json();

      const guide = data.advisor_guide || {};
      const storageAdvice = data.storage_advice || {};

      const advice: ProAdvice = {
        harvestTiming:
          language === "si"
            ? data.recommended_action_si ||
              data.recommended_action ||
              "අස්වැන්න නිසි කාලයට ගබඩා කර විකිණින්න"
            : language === "ta"
              ? data.recommended_action_ta ||
                data.recommended_action ||
                "சரியான நேரத்தில் அறுவடையை சேமித்து விற்கவும்"
              : data.recommended_action_en ||
                data.recommended_action ||
                "Store and sell harvest at proper time",
        delayWeeks: data.storage_advice?.duration_weeks || 0,
        storageRequired: (data.storage_advice?.required ?? false) || false,
        storageDuration: data.storage_advice?.duration_weeks || 0,
        storageAdvice:
          language === "si"
            ? data.storage_advice?.message_si || "වියලි ස්ථානයක් තෝරන්න"
            : language === "ta"
              ? data.storage_advice?.message_ta ||
                "வறண்ட இடத்தை தேர்வு செய்யவும்"
              : data.storage_advice?.message_en || "Choose a dry place",
        seedGuidance:
          language === "si"
            ? guide.seed_si || guide.seed || ""
            : language === "ta"
              ? guide.seed_ta || guide.seed || ""
              : guide.seed_en || guide.seed || "",
        waterGuidance:
          language === "si"
            ? guide.water_si || guide.water || ""
            : language === "ta"
              ? guide.water_ta || guide.water || ""
              : guide.water_en || guide.water || "",
        fertilizerGuidance:
          language === "si"
            ? guide.fertilizer_si || guide.fertilizer || ""
            : language === "ta"
              ? guide.fertilizer_ta || guide.fertilizer || ""
              : guide.fertilizer_en || guide.fertilizer || "",
        financeGuidance:
          language === "si"
            ? guide.finance_si || guide.finance || ""
            : language === "ta"
              ? guide.finance_ta || guide.finance || ""
              : guide.finance_en || guide.finance || "",
        riskFactors: buildRiskFactors(formData, language),
        opportunities: buildOpportunities(formData, language),
        actionItems: buildActionItems(formData, language),
      };

      if (formData.experienceLevel === "new") {
        const extra = FIRST_TIME_GUIDE[language];
        if (extra) {
          advice.seedGuidance = [advice.seedGuidance, extra.seed]
            .filter(Boolean)
            .join("\n\n");
          advice.waterGuidance = [advice.waterGuidance, extra.water]
            .filter(Boolean)
            .join("\n\n");
          advice.fertilizerGuidance = [
            advice.fertilizerGuidance,
            extra.fertilizer,
          ]
            .filter(Boolean)
            .join("\n\n");
          advice.financeGuidance = [advice.financeGuidance, extra.finance]
            .filter(Boolean)
            .join("\n\n");
        }
      }

      setProAdvice(advice);
    } catch (e) {
      setError((e as Error).message || t.noData);
      setProAdvice(null);
    } finally {
      setLoading(false);
    }
  };

  const buildRiskFactors = (form: FormData, lang: Language): string[] => {
    const risks: string[] = [];

    if (form.experienceLevel === "new") {
      risks.push(
        lang === "si"
          ? "අත්දැකීම අඩු නම් වගාවේ අවදානම වැඩිය"
          : lang === "ta"
            ? "குறைந்த அனுபவம் பயிரிடல் அபாயத்தை அதிகரிக்கும்"
            : "Limited experience increases cultivation risk",
      );
    }

    if (form.budgetLevel === "low") {
      risks.push(
        lang === "si"
          ? "අඩු වියදම් නිසා ඇතැම් කටයුතු කිරීමට අපහසු විය හැක"
          : lang === "ta"
            ? "குறைந்த பட்ஜெட் சில விவசாய நடவடிக்கைகளை கட்டுப்படுத்தலாம்"
            : "Low budget may limit some farming activities",
      );
    }

    if (!form.hasIrrigation) {
      risks.push(
        lang === "si"
          ? "වාරිමාර්ග නොමැතිවීම නිසා වැසි මත පමණක් විශ්වාස"
          : lang === "ta"
            ? "நீர்ப்பாசனம் இல்லாமல் முழுவதும் மழையை நம்பியுள்ளது"
            : "Without irrigation, depends entirely on rainfall",
      );
    }

    if (!form.readiness.seeds) {
      risks.push(
        lang === "si"
          ? "බීජ තිබුණත් තත්ත්වය හොඳ ද යන්න පරීක්ෂා කරන්න"
          : lang === "ta"
            ? "நடவு செய்வதற்கு முன் விதை தரத்தை சரிபார்க்கவும்"
            : "Verify seed quality before planting",
      );
    }

    if (!form.readiness.fertilizer) {
      risks.push(
        lang === "si"
          ? "පොහොර සැලසුම නොමැතිවීම සිට අස්වැන්න අඩුවිය හැක"
          : lang === "ta"
            ? "உர திட்டமிடல் இல்லாமை விளைச்சலை குறைக்கலாம்"
            : "Lack of fertilizer planning may reduce yield",
      );
    }

    if (form.experienceLevel === "new") {
      risks.push(
        lang === "si"
          ? "පළමු සති 4–6 තුළ උරුම නොකළ වැල් සංග්‍රහය බඩ ඉරිඟු වගාවේ සංවර්ධනය අඩාල කරයි"
          : lang === "ta"
            ? "முதல் 4–6 வாரங்களில் களை போட்டி மக்காச்சோள வளர்ச்சியை தடுக்கலாம்"
            : "Weed competition during the first 4–6 weeks can suppress corn growth",
      );
      risks.push(
        lang === "si"
          ? "කෘමී හා රෝග පාලනය නොකිරීම අස්වැන්න විශාල ලෙස අඩු කරයි"
          : lang === "ta"
            ? "கட்டுப்படுத்தப்படாத பூச்சிகள் மற்றும் நோய்கள் விளைச்சலை கணிசமாக குறைக்கலாம்"
            : "Uncontrolled pests and diseases may significantly reduce yield",
      );
    }

    return risks.length > 0
      ? risks
      : [
          lang === "si"
            ? "ප්‍රධාන අවදානම් නොමතුණු බව පෙනේ"
            : lang === "ta"
              ? "முக்கிய அபாயங்கள் எதுவும் கண்டறியப்படவில்லை"
              : "No major risks identified",
        ];
  };

  const buildOpportunities = (form: FormData, lang: Language): string[] => {
    const opps: string[] = [];

    if (form.experienceLevel === "experienced") {
      opps.push(
        lang === "si"
          ? "ඔබගේ අත්දැකීම ගැන ගිණුම් ගෙන උච්ච අස්වැන්ණක් අපේක්ෂා කිරීම"
          : lang === "ta"
            ? "உங்கள் அனுபவம் அதிக விளைச்சலை அடைய உதவும்"
            : "Your experience can help achieve higher yields",
      );
    }

    if (form.budgetLevel === "high") {
      opps.push(
        lang === "si"
          ? "ප්‍රචුර වියදම ශ්‍රේෂ්ඨ බීජ සහ පෝහොර ලබාගැනීමට ඉඩ දෙයි"
          : lang === "ta"
            ? "அதிக பட்ஜெட் தரமான விதைகள் மற்றும் உயர்தர உள்ளீடுகளை அனுமதிக்கிறது"
            : "Higher budget allows quality seeds and premium inputs",
      );
    }

    if (form.hasIrrigation) {
      opps.push(
        lang === "si"
          ? "වාරිමාර්ග නිසා වගාව අධිකරණ යුතුකර ගත හැක"
          : lang === "ta"
            ? "நீர்ப்பாசனம் சிறந்த பயிர் மேலாண்மையை செயல்படுத்துகிறது"
            : "Irrigation enables better crop management",
      );
    }

    if (form.readiness.capital) {
      opps.push(
        lang === "si"
          ? "මුදල් සැලසුමක් තිබිම නිසා නිසි වෙලාවට සියල්ල කිරීමට හැකිවේ"
          : lang === "ta"
            ? "நிதி திட்டமிடல் சரியான நேரத்தில் செயல்படுத்துவதை உறுதி செய்கிறது"
            : "Financial planning ensures timely implementation",
      );
    }

    return opps.length > 0
      ? opps
      : [
          lang === "si"
            ? "සුයෝගයන් සඳහා දැන් සූදානම් වන්න"
            : lang === "ta"
              ? "வாய்ப்புகளை பயன்படுத்திக்கொள்ள தயாராகுங்கள்"
              : "Prepare to seize opportunities",
        ];
  };

  const buildActionItems = (form: FormData, lang: Language): string[] => {
    const actions: string[] = [];

    if (!form.readiness.seeds) {
      actions.push(
        lang === "si"
          ? "හොඳ බීජ ලබාගෙන තෝරාගන්න"
          : lang === "ta"
            ? "தரமான விதைகளை கொள்முதல் செய்து தேர்வு செய்யவும்"
            : "Procure and select quality seeds",
      );
    }

    if (!form.readiness.water) {
      actions.push(
        lang === "si"
          ? "ජල සැලසුම සකස් කරන්න"
          : lang === "ta"
            ? "நீர் மேலாண்மை திட்டத்தை தயாரிக்கவும்"
            : "Prepare water management plan",
      );
    }

    if (!form.readiness.land) {
      actions.push(
        lang === "si"
          ? "භූමිය සකස් කර අසල තිබි දූෂිතයන් ඉවත් කරන්න"
          : lang === "ta"
            ? "நிலத்தை தயாரித்து களைகளை அகற்றவும்"
            : "Prepare land and remove weeds",
      );
    }

    if (!form.readiness.fertilizer) {
      actions.push(
        lang === "si"
          ? "පොහොර සැලසුම සකස් කරන්න"
          : lang === "ta"
            ? "உரங்களை திட்டமிட்டு கொள்முதல் செய்யவும்"
            : "Plan and procure fertilizers",
      );
    }

    if (!form.readiness.capital) {
      actions.push(
        lang === "si"
          ? "අවශ්‍ය මුදල් සම්පූර්ණයෙන් සැලසුම් කරගන්න"
          : lang === "ta"
            ? "மூலதன தேவைகளை இறுதி செய்யவும்"
            : "Finalize capital requirements",
      );
    }

    if (form.experienceLevel === "new") {
      actions.push(
        lang === "si"
          ? "පස පරීක්ෂා කර pH 6.0–6.8 අතර පවත්වා ගැනීමට සැලසුම් කරන්න"
          : lang === "ta"
            ? "மண் பரிசோதனை நடத்தி pH 6.0–6.8 அளவில் பராமரிக்கவும்"
            : "Conduct a soil test and maintain pH around 6.0–6.8",
      );
      actions.push(
        lang === "si"
          ? "ඉඩම 20–25 සෙ.මී. පහලින් යම්කර පස ටිල් කර හොඳ බීජ නිදහසක් සාදාගන්න"
          : lang === "ta"
            ? "20–25 செ.மீ ஆழத்தில் உழுது நுண்ணிய விதை படுக்கை தயாரிக்கவும்"
            : "Prepare the land by ploughing 20–25 cm deep and tilling to create a fine seedbed",
      );
      actions.push(
        lang === "si"
          ? "බීජ ආරක්ෂා කිරීම සඳහා දිලේව් හා කෘමි නාශක වලින් සකස් කරන්න"
          : lang === "ta"
            ? "விதைப்பதற்கு முன் பூஞ்சாணக்கொல்லி மற்றும் பூச்சிக்கொல்லியால் விதைகளை நேர்த்தி செய்யவும்"
            : "Treat seeds with fungicide and insecticide before sowing",
      );
      actions.push(
        lang === "si"
          ? "බීජ 3–5 සෙ.මී. ගැඹුරෙන් 20–25 සෙ.මී. දුරින් හා පේළි අතර 60–75 සෙ.මී. තබා වගා කරන්න"
          : lang === "ta"
            ? "விதைகளை 3–5 செ.மீ ஆழத்தில் 20–25 செ.மீ இடைவெளியில் 60–75 செ.மீ வரிசை இடைவெளியில் நடவும்"
            : "Plant seeds 3–5 cm deep, spaced 20–25 cm apart, with 60–75 cm between rows",
      );
      actions.push(
        lang === "si"
          ? "පළමු සති 4–6 තුළ වැල් හා උරුම ද්‍රව්‍ය ඉවත් කර වගාව පිරිසිදුව තබන්න"
          : lang === "ta"
            ? "முதல் 4–6 வாரங்களில் களைகளை தொடர்ந்து அகற்றவும்"
            : "Weed regularly during the first 4–6 weeks to reduce competition",
      );
      actions.push(
        lang === "si"
          ? "පැල 12 අඟල් උසට ළඟාවන විට හා tasselling අවස්ථාවේ නයිට්‍රජන් පොහොර යොදන්න"
          : lang === "ta"
            ? "செடிகள் 30 செ.மீ உயரம் வரும்போதும் கொத்துக்கட்டை நிலையிலும் நைட்ரஜன் உரம் இடவும்"
            : "Apply nitrogen fertiliser when plants reach 12 inches and again at the tasselling stage",
      );
      actions.push(
        lang === "si"
          ? "වාරිමාර්ගය නිවැරදිව කර සතියකට අඟල් 1–1.5 ජලය ලබා දී වියළි කාලවලදී අඟල් 2 දක්වා ඉහළ දැමීමට සැලසුම් කරන්න"
          : lang === "ta"
            ? "வாரத்திற்கு 1–1.5 அங்குல தண்ணீர் வழங்கவும்; வறண்ட காலத்தில் 2 அங்குலம் வரை அதிகரிக்கவும்"
            : "Irrigate consistently (1–1.5 inches of water per week, increasing to 2 inches in dry periods) and monitor rainfall",
      );
      actions.push(
        lang === "si"
          ? "කෘමී හා රෝග සීරුමාරු සඳහා ක්ෂේත්‍රය නිතර පරීක්ෂා කර අවශ්‍ය විට ප්‍රතිකාර කරන්න"
          : lang === "ta"
            ? "பூச்சிகள் மற்றும் நோய்களுக்கு தொடர்ந்து கண்காணித்து தேவைப்படும்போது கட்டுப்பாட்டு நடவடிக்கை எடுக்கவும்"
            : "Scout for pests and diseases frequently and apply control measures when needed",
      );
    }

    actions.push(
      lang === "si"
        ? "අපේක්ෂිත අස්වැන්න සඳහා දිනපතා පර්යේෂණ සටහන තබන්න"
        : lang === "ta"
          ? "தினசரி வயல் குறிப்புகள் மற்றும் கவனிப்புகளை பதிவு செய்யவும்"
          : "Keep daily field notes and observations",
    );

    return actions;
  };

  const SectionCard = ({
    title,
    icon,
    content,
    sectionId,
    accentColor = "#10B981",
  }: {
    title: string;
    icon: React.ReactNode;
    content: string | string[];
    sectionId: string;
    accentColor?: string;
  }) => {
    const isExpanded = expandedSection === sectionId;

    return (
      <TouchableOpacity
        onPress={() => setExpandedSection(isExpanded ? null : sectionId)}
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          marginBottom: 16,
          borderWidth: 2,
          borderColor: isExpanded ? accentColor : "#E5E7EB",
          overflow: "hidden",
          elevation: isExpanded ? 4 : 2,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: 64,
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: isExpanded ? `${accentColor}15` : "#FFFFFF",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              flex: 1,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: `${accentColor}20`,
                justifyContent: "center",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              {icon}
            </View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#1F2937",
                flex: 1,
              }}
            >
              {title}
            </Text>
          </View>

          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              width: 32,
              height: 32,
              flexShrink: 0,
            }}
          >
            <ChevronDown
              size={24}
              color={accentColor}
              style={{
                transform: [{ rotate: isExpanded ? "180deg" : "0deg" }],
              }}
            />
          </View>
        </View>

        {isExpanded && (
          <View
            style={{
              paddingVertical: 16,
              paddingHorizontal: 16,
              borderTopWidth: 1,
              borderTopColor: "#E5E7EB",
              backgroundColor: "#F9FAFB",
            }}
          >
            {Array.isArray(content) ? (
              <View>
                {content.map((item: string, idx: number) => (
                  <View
                    key={idx}
                    style={{
                      flexDirection: "row",
                      marginBottom: idx < content.length - 1 ? 12 : 0,
                      alignItems: "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: accentColor,
                        marginRight: 8,
                      }}
                    >
                      •
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#374151",
                        lineHeight: 22,
                        flex: 1,
                      }}
                    >
                      {item}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text
                style={{
                  fontSize: 14,
                  color: "#374151",
                  lineHeight: 22,
                }}
              >
                {content}
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };


  const GuideDetailCard = ({
    category,
    title,
    guidance,
    icon,
  }: {
    category: string;
    title: string;
    guidance: string;
    icon: React.ReactNode;
  }) => {
    const isExpanded = expandedGuides[category];

    return (
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          marginBottom: 16,
          borderWidth: 2,
          borderColor: isExpanded ? "#10B981" : "#E5E7EB",
          overflow: "hidden",
          elevation: isExpanded ? 4 : 2,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
      >
        <TouchableOpacity
          onPress={() =>
            setExpandedGuides((prev) => ({
              ...prev,
              [category]: !prev[category],
            }))
          }
          style={{
            minHeight: 64,
            paddingVertical: 12,
            paddingHorizontal: 16,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: isExpanded ? "#ECFDF5" : "#FFFFFF",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              flex: 1,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#10B98120",
                justifyContent: "center",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              {icon}
            </View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#065F46",
                flex: 1,
              }}
            >
              {title}
            </Text>
          </View>

          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              width: 32,
              height: 32,
              flexShrink: 0,
            }}
          >
            <ChevronDown
              size={24}
              color="#10B981"
              style={{
                transform: [{ rotate: isExpanded ? "180deg" : "0deg" }],
              }}
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View
            style={{
              paddingVertical: 16,
              paddingHorizontal: 16,
              borderTopWidth: 1,
              borderTopColor: "#D1FAE5",
              backgroundColor: "#F0FDF4",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: "#374151",
                lineHeight: 22,
              }}
            >
              {guidance}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Readiness Status Component
  const ReadinessStatus = () => {
    const readyItems = Object.values(formData.readiness).filter(Boolean).length;
    const totalItems = Object.keys(formData.readiness).length;
    const percentage = (readyItems / totalItems) * 100;

    return (
      <View style={styles.readinessCard}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginBottom: 12,
          }}
        >
          <Target size={24} color="#10B981" />
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#065F46" }}>
            {t.readinessCheck}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <View
            style={{
              flex: 1,
              height: 8,
              backgroundColor: "#E5E7EB",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: `${percentage}%`,
                height: "100%",
                backgroundColor:
                  percentage >= 80
                    ? "#10B981"
                    : percentage >= 50
                      ? "#F59E0B"
                      : "#EF4444",
              }}
            />
          </View>
          <Text
            style={{
              marginLeft: 10,
              fontSize: 14,
              fontWeight: "700",
              color: "#374151",
            }}
          >
            {readyItems}/{totalItems}
          </Text>
        </View>

        <View style={{ gap: 8 }}>
          {Object.entries({
            seeds:
              language === "si"
                ? "බීජ"
                : language === "ta"
                  ? "விதைகள்"
                  : "Seeds",
            water:
              language === "si"
                ? "ජලය"
                : language === "ta"
                  ? "தண்ணீர்"
                  : "Water",
            land:
              language === "si" ? "ඉඩම" : language === "ta" ? "நிலம்" : "Land",
            fertilizer:
              language === "si"
                ? "පොහොර"
                : language === "ta"
                  ? "உரம்"
                  : "Fertilizer",
            capital:
              language === "si"
                ? "මුදල්"
                : language === "ta"
                  ? "மூலதனம்"
                  : "Capital",
          }).map(([key, label]) => (
            <View
              key={key}
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              {formData.readiness[key as keyof typeof formData.readiness] ? (
                <CheckCircle size={18} color="#10B981" />
              ) : (
                <X size={18} color="#EF4444" />
              )}
              <Text style={{ fontSize: 13, color: "#374151" }}>{label}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Timeline Component
  const CultivationTimeline = () => {
    const seed = (formData.seedVariety || "Unknown").trim() || "Unknown";
    const durationWeeks =
      VARIETY_DURATION_WEEKS[seed] ?? VARIETY_DURATION_WEEKS["Unknown"];

    const plantingDate = new Date(formData.plantingDateExact);
    const harvestDate = new Date(plantingDate);
    harvestDate.setDate(harvestDate.getDate() + durationWeeks * 7);

    return (
      <View style={styles.timelineCard}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <Clock size={24} color="#10B981" />
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#065F46" }}>
            {t.timelineTitle}
          </Text>
        </View>

        <View style={{ gap: 12 }}>
          <View style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.timelineLabel}>
                {language === "si"
                  ? "වගා කිරීමේ දිනය"
                  : language === "ta"
                    ? "நடவு தேதி"
                    : "Planting Date"}
              </Text>
              <Text style={styles.timelineDate}>
                {plantingDate.toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View
              style={[styles.timelineDot, { backgroundColor: "#F59E0B" }]}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.timelineLabel}>
                {language === "si"
                  ? "වගා කාලය"
                  : language === "ta"
                    ? "வளரும் காலம்"
                    : "Growing Period"}
              </Text>
              <Text style={styles.timelineDate}>
                {durationWeeks} {t.week}
              </Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View
              style={[styles.timelineDot, { backgroundColor: "#059669" }]}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.timelineLabel}>
                {language === "si"
                  ? "අස්වැන්න නෙළීමේ දිනය"
                  : language === "ta"
                    ? "எதிர்பார்க்கப்படும் அறுவடை"
                    : "Expected Harvest"}
              </Text>
              <Text style={styles.timelineDate}>
                {harvestDate.toLocaleDateString()}
              </Text>
            </View>
          </View>

          {proAdvice && proAdvice.delayWeeks > 0 && (
            <View style={styles.timelineItem}>
              <View
                style={[styles.timelineDot, { backgroundColor: "#8B5CF6" }]}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.timelineLabel}>
                  {language === "si"
                    ? "අලෙවිකරණය සඳහා හොඳම කාලය"
                    : language === "ta"
                      ? "சிறந்த விற்பனை நேரம்"
                      : "Best Selling Time"}
                </Text>
                <Text style={styles.timelineDate}>
                  +{proAdvice.delayWeeks} {t.week}{" "}
                  {language === "si"
                    ? "පසුව"
                    : language === "ta"
                      ? "பிறகு"
                      : "later"}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft color="#047857" size={24} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t.title}</Text>
          <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
        </View>

        <TouchableOpacity style={styles.notifButton}>
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

      {/* Content */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={{ marginTop: 12, color: "#6B7280", fontSize: 14 }}>
            {t.loading}
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <AlertTriangle color="#EF4444" size={48} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={generateProAdvice}
          >
            <Text style={styles.retryButtonText}>{t.tryAgain}</Text>
          </TouchableOpacity>
        </View>
      ) : proAdvice ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Enhanced Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <View style={styles.summaryIconWrap}>
                  <Zap size={28} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.summaryTitle}>
                    {language === "si"
                      ? "ඔබගේ Pro වගා සැලසුම"
                      : language === "ta"
                        ? "உங்கள் Pro விவசாய திட்டம்"
                        : "Your Pro Cultivation Plan"}
                  </Text>
                  <Text style={styles.summarySubtitle}>
                    {formData.district} • {formData.seedVariety}
                  </Text>
                  {formData.experienceLevel === "new" && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        marginTop: 6,
                      }}
                    >
                      <BookOpen size={16} color="#047857" />
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#047857",
                          fontWeight: "600",
                        }}
                      >
                        {t.firstTimeNote}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.summaryDetails}>
                <View style={styles.detailRow}>
                  <MapPin size={20} color="#10B981" />
                  <Text style={styles.detailText}>
                    {formData.area || "0"}{" "}
                    {language === "si"
                      ? "හෙක්ටයාර්"
                      : language === "ta"
                        ? "ஹெக்டேர்"
                        : "hectares"}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Calendar size={20} color="#10B981" />
                  <Text style={styles.detailText}>
                    {formData.plantingDateExact}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <TrendingUp size={20} color="#10B981" />
                  <Text style={styles.detailText}>
                    {language === "si"
                      ? formData.experienceLevel === "new"
                        ? "🆕 අත්දැකීම අඩු"
                        : formData.experienceLevel === "some"
                          ? "📖 සරිසරි අත්දැකීම"
                          : "👨‍🌾 ඉතා අත්දැකීමක්"
                      : language === "ta"
                        ? formData.experienceLevel === "new"
                          ? "🆕 புதிய விவசாயி"
                          : formData.experienceLevel === "some"
                            ? "📖 சிறிது அனுபவம்"
                            : "👨‍🌾 அனுபவமுள்ளவர்"
                        : formData.experienceLevel === "new"
                          ? "🆕 New farmer"
                          : formData.experienceLevel === "some"
                            ? "📖 Some experience"
                            : "👨‍🌾 Experienced"}
                  </Text>
                </View>

                {formData.hasIrrigation && (
                  <View style={styles.detailRow}>
                    <Droplets size={20} color="#10B981" />
                    <Text style={styles.detailText}>
                      {language === "si"
                        ? "වාරිමාර්ග පහසුකම් ඇත"
                        : language === "ta"
                          ? "நீர்ப்பாசன வசதி உள்ளது"
                          : "Irrigation Available"}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Readiness Status */}
            <ReadinessStatus />

            {/* Cultivation Timeline */}
            <CultivationTimeline />

            {/* Harvest & Storage Strategy */}
            <SectionCard
              sectionId="harvest"
              title={t.harvest}
              icon={<Package size={22} color="#10B981" />}
              content={`${proAdvice.harvestTiming}\n\n${
                proAdvice.storageAdvice
              }\n\n${
                proAdvice.delayWeeks > 0
                  ? language === "si"
                    ? `💰 වෙළඳපොළ උපාය: සති ${proAdvice.delayWeeks}ක් ගබඩා කර ඉහළ මිල ගණන් ලබාගන්න`
                    : language === "ta"
                      ? `💰 சந்தை உத்தி: ${proAdvice.delayWeeks} வாரங்கள் சேமித்து அதிக விலை பெறுங்கள்`
                      : `💰 Market Strategy: Store for ${proAdvice.delayWeeks} weeks to get better prices`
                  : language === "si"
                    ? "✅ දැන් විකිණීමට හොඳ කාලයක්"
                    : language === "ta"
                      ? "✅ இப்போதே விற்க நல்ல நேரம்"
                      : "✅ Good time to sell immediately"
              }`}
              accentColor="#10B981"
            />

            {/* Complete Cultivation Guides */}
            <View style={{ marginTop: 8, marginBottom: 16 }}>
              <Text style={styles.sectionTitle}>{t.completeGuide}</Text>
            </View>

            <GuideDetailCard
              category="seed"
              title={t.seed}
              guidance={proAdvice.seedGuidance}
              icon={<Sprout size={22} color="#10B981" />}
            />

            <GuideDetailCard
              category="water"
              title={t.water}
              guidance={proAdvice.waterGuidance}
              icon={<Droplets size={22} color="#10B981" />}
            />

            <GuideDetailCard
              category="fertilizer"
              title={t.fertilizer}
              guidance={proAdvice.fertilizerGuidance}
              icon={<Leaf size={22} color="#10B981" />}
            />

            <GuideDetailCard
              category="finance"
              title={t.finance}
              guidance={proAdvice.financeGuidance}
              icon={<DollarSign size={22} color="#10B981" />}
            />

            {/* Risk Factors */}
            <SectionCard
              sectionId="risks"
              title={t.risks}
              icon={<ShieldAlert size={22} color="#EF4444" />}
              content={proAdvice.riskFactors}
              accentColor="#EF4444"
            />

            {/* Opportunities */}
            <SectionCard
              sectionId="opportunities"
              title={t.opportunities}
              icon={<Lightbulb size={22} color="#F59E0B" />}
              content={proAdvice.opportunities}
              accentColor="#F59E0B"
            />

            {/* Action Items */}
            <SectionCard
              sectionId="actions"
              title={t.actions}
              icon={<CheckCircle size={22} color="#8B5CF6" />}
              content={proAdvice.actionItems}
              accentColor="#8B5CF6"
            />

            {/* CTA Button - Follow Recommendations */}
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() =>
                navigation.navigate("ProAdvisorFollowScreen", {
                  formData,
                })
              }
              activeOpacity={0.8}
            >
              <View style={styles.ctaButtonContent}>
                <Zap size={22} color="#FFF" style={{ marginRight: 10 }} />
                <Text style={styles.ctaButtonText}>
                  {language === "si"
                    ? "විශේෂඥ උපදෙස් සදහා අනුගමනය කරන්න"
                    : language === "ta"
                      ? "இந்த பரிந்துரைகளை பின்பற்றவும்"
                      : "Follow These Recommendations"}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton2}
              onPress={() => navigation.goBack()}
            >
              <ArrowLeft size={20} color="#374151" style={{ marginRight: 8 }} />
              <Text style={styles.backButtonText}>{t.backToAdvice}</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </Animated.View>
        </ScrollView>
      ) : null}
    </View>
  );
};

export default ProAdvisorPage;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FDF4" },
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#D1FAE5",
  },
  headerCenter: { flex: 1 },
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
  notifButton: {
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
    top: 2,
    right: 2,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "bold" },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    marginTop: 12,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#10B981",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 2,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#10B981",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  summaryIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#065F46",
  },
  summarySubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
    fontWeight: "500",
  },
  summaryDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#065F46",
    marginBottom: 4,
  },
  readinessCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    elevation: 2,
  },
  timelineCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    elevation: 2,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#10B981",
  },
  timelineLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  timelineDate: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "700",
    marginTop: 2,
  },
  backButton2: {
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    elevation: 2,
  },
  backButtonText: {
    color: "#374151",
    fontSize: 15,
    fontWeight: "700",
  },
  ctaButton: {
    marginTop: 24,
    marginBottom: 16,
    backgroundColor: "#0EA5E9",
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  ctaButtonContent: {
    flexDirection: "row" as const,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
});
