import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { RouteProp, useNavigation } from "@react-navigation/native";
import {
  ArrowLeft,
  Shield,
  AlertCircle,
  Leaf,
  ChevronRight,
  Info,
  Thermometer,
  AlertTriangle,
  CheckCircle,
  Droplets,
  Sprout,
  Scissors,
  Pill,
  Clock,
  Calendar,
  ShieldCheck,
  TrendingUp,
  Sun,
  Wind,
  Bug,
  Zap,
} from "lucide-react-native";
import { DiseaseIdentifyStackParamList } from "../../navigation/DiseaseIdentifyStack";
import SeverityGauge from "../../components/SeverityGauge";
import { StackNavigationProp } from "@react-navigation/stack";

// 🌐 LANGUAGE CONTEXT
import { useLanguage } from "../../context/LanguageContext";

// NAV TYPES
type NavProp = StackNavigationProp<
  DiseaseIdentifyStackParamList,
  "SeverityDetails"
>;

type SeverityDetailsRouteProp = RouteProp<
  DiseaseIdentifyStackParamList,
  "SeverityDetails"
>;

interface Props {
  route: SeverityDetailsRouteProp;
}

interface Prediction {
  class_id: number;
  class_name: string;
  confidence: number;
}

// Treatment interface for Sri Lankan farmers
interface SriLankanTreatment {
  id: string;
  name: {
    en: string;
    si: string;
  };
  // Available in Sri Lanka
  availableProducts: {
    en: string[];
    si: string[];
  };
  // How to use (application methods)
  applicationMethod: {
    en: string;
    si: string;
  };
  // Dosage and mixing
  dosage: {
    en: string;
    si: string;
  };
  // Application schedule
  schedule: {
    frequency: string;
    duration: string;
    bestTime: string;
  };
  // Safety precautions
  safety: {
    en: string[];
    si: string[];
  };
  // Where to buy in Sri Lanka
  availability: {
    en: string[];
    si: string[];
  };
  // Cost estimate (LKR)
  costEstimate: string;
  // Type: organic or chemical
  type: "organic" | "chemical";
}

export default function SeverityDetailsScreen({ route }: Props) {
  const { image, severity_score, severity_label, predictions } = route.params;
  const navigation = useNavigation<NavProp>();

  // 🌐 GLOBAL LANGUAGE (sinhala/english)
  const { language: lang, setLanguage } = useLanguage();
  const language = lang === "sinhala" ? "si" : "en";

  // 🌐 TRANSLATION CONTENT
  const content = {
    si: {
      back: "ආපසු",
      header: "පැලැස්ම සෞඛ්‍ය තත්ත්වය",
      currentSeverity: "වත්මන් තත්ත්වය",
      infectionDetected: "ආසාදනය හමුවිය",
      mild: "ඔබේ බිම හොඳ තත්ත්වයකි. සුළු රෝග ලක්ෂණ තිබේ.",
      moderate: "සැලකිල්ලක් යොමු කරන්න. රෝගය මධ්‍යම ලෙස පැතිරෙමින් ඇත.",
      severe:
        "අවදානම් තත්ත්වයකි! දැඩි ආසාදනයක් හමුවිය. වහාම ක්‍රියාමාර්ග ගන්න.",
      viewDetails: "සම්පූර්ණ විස්තර බලන්න",
      plantHealth: "පැලැස්ම සෞඛ්‍ය තත්ත්වය",
      severityAnalysis: "දැඩි තත්ත්වය විශ්ලේෂණය",
      infectionLevel: "ආසාදන මට්ටම",
      nextSteps: "ඊළඟ පියවර",
      viewDiseaseInfo: "රෝග විස්තර",
      status: "තත්ත්වය",
      recommendations: "නිර්දේශ",
      takeAction: "ක්‍රියාමාර්ග ගන්න",
      monitoring: "සමීක්ෂණය",
      aiPowered: "AI බලගැන්වූ විශ්ලේෂණය",
      severityLevel: "දැඩි මට්ටම",
      healthy: "සෞඛ්‍ය සම්පන්න",
      lowRisk: "අවදානම අඩු",
      mediumRisk: "මධ්‍යම අවදානම",
      highRisk: "අවදානම ඉහළ",
      critical: "අවදානම්කාරී",

      // Treatment section translations
      treatmentGuide: "ශ්‍රී ලංකාවේ භාවිත කළ හැකි සුව කිරීමේ ක්‍රම",
      availableInSL: "ශ්‍රී ලංකාවේ ලබාගත හැකි ඖෂධ",
      howToUse: "කෙසේ භාවිතා කරන්නද",
      dosage: "ප්‍රමාණය හා මිශ්‍ර කිරීම",
      applicationSchedule: "යෙදීමේ කාලසටහන",
      frequency: "ප්‍රතිපත්තිය",
      duration: "කාලසීමාව",
      bestTime: "හොඳම වේලාව",
      safetyPrecautions: "ආරක්ෂිත ප්‍රවේශයන්",
      whereToBuy: "කොහෙන් ගන්නද",
      costEstimate: "ගණන් දර්ශනය (රුපියල්)",
      spraySchedule: "සිදුරු කාලසටහන",
      immediateAction: "ක්ෂණික ක්‍රියාමාර්ග",
      followUpTreatment: "අනුගමන සුව කිරීම",
      preventionTips: "නැවත ආසාදන වළක්වා ගැනීම",
      organicOptions: "කාබනික විකල්ප",
      chemicalOptions: "රසායනික විකල්ප",
      recommendedForSeverity: "දැඩි තත්ත්වය සඳහා නිර්දේශිත",
      stepByStepGuide: "පියවරෙන් පියවර මාර්ගෝපදේශය",
      day: "දින",
      days: "දින",
      weeks: "සති",
      repeat: "නැවත කරන්න",
      morning: "උදේ",
      evening: "හවස",
      avoidRain: "වැස්සෙන් වැළකෙන්න",
      protectiveGear: "රැකවරණ ඇඳුම් භාවිත කරන්න",
      storeProperly: "සුරක්ෂිතව ගබඩා කරන්න",
      forDisease: "සඳහා",
      effectiveAgainst: "එදිරිව ක්‍රියාකාරී",
      fungalDiseases: "දිලීර රෝග",
      bacterialDiseases: "බැක්ටීරියා රෝග",
      viralDiseases: "වයිරස් රෝග",
    },
    en: {
      back: "Back",
      header: "Plant Health Status",
      currentSeverity: "Current Severity Level",
      infectionDetected: "Infection Detected",
      mild: "Your plant is in good condition. Mild signs of disease detected.",
      moderate: "Your plant needs attention. Disease is spreading moderately.",
      severe:
        "Warning! Severe infection levels detected. Immediate action required.",
      viewDetails: "View Full Disease Details",
      plantHealth: "Plant Health Status",
      severityAnalysis: "Severity Analysis",
      infectionLevel: "Infection Level",
      nextSteps: "Next Steps",
      viewDiseaseInfo: "View Disease Information",
      status: "Status",
      recommendations: "Recommendations",
      takeAction: "Take Action",
      monitoring: "Monitoring",
      aiPowered: "AI Powered Analysis",
      severityLevel: "Severity Level",
      healthy: "Healthy",
      lowRisk: "Low Risk",
      mediumRisk: "Medium Risk",
      highRisk: "High Risk",
      critical: "Critical",

      // Treatment section translations
      treatmentGuide: "Treatments Available in Sri Lanka",
      availableInSL: "Available Products in Sri Lanka",
      howToUse: "How to Use",
      dosage: "Dosage & Mixing",
      applicationSchedule: "Application Schedule",
      frequency: "Frequency",
      duration: "Duration",
      bestTime: "Best Time",
      safetyPrecautions: "Safety Precautions",
      whereToBuy: "Where to Buy",
      costEstimate: "Cost Estimate (LKR)",
      spraySchedule: "Spray Schedule",
      immediateAction: "Immediate Action",
      followUpTreatment: "Follow-up Treatment",
      preventionTips: "Prevent Reinfection",
      organicOptions: "Organic Options",
      chemicalOptions: "Chemical Options",
      recommendedForSeverity: "Recommended for Severity Level",
      stepByStepGuide: "Step-by-Step Guide",
      day: "Day",
      days: "days",
      weeks: "weeks",
      repeat: "Repeat",
      morning: "Morning",
      evening: "Evening",
      avoidRain: "Avoid rain",
      protectiveGear: "Use protective gear",
      storeProperly: "Store properly",
      forDisease: "for",
      effectiveAgainst: "Effective against",
      fungalDiseases: "Fungal diseases",
      bacterialDiseases: "Bacterial diseases",
      viralDiseases: "Viral diseases",
    },
  };

  // Status text logic
  const statusText =
    severity_score < 0.33
      ? content[language].mild
      : severity_score < 0.66
      ? content[language].moderate
      : content[language].severe;

  // Get severity color
  const getSeverityColor = (score: number) => {
    if (score < 0.33) return "#10B981"; // Green
    if (score < 0.66) return "#F59E0B"; // Yellow
    return "#EF4444"; // Red
  };

  // Get severity label
  const getSeverityLabel = (score: number) => {
    if (score < 0.33) return content[language].healthy;
    if (score < 0.5) return content[language].lowRisk;
    if (score < 0.66) return content[language].mediumRisk;
    if (score < 0.8) return content[language].highRisk;
    return content[language].critical;
  };

  // Get severity icon
  const getSeverityIcon = (score: number) => {
    if (score < 0.33) return "🟢";
    if (score < 0.66) return "🟡";
    return "🔴";
  };

  // Format disease name
  const formatDiseaseName = (name: string) => {
    return name
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Get primary disease prediction
  const primaryPrediction = predictions?.[0] || null;
  const diseaseName = primaryPrediction
    ? formatDiseaseName(primaryPrediction.class_name)
    : "";

  // All treatments available in Sri Lanka - BOTH organic and chemical
  const sriLankanTreatments: Record<string, SriLankanTreatment[]> = {
    // Gray Leaf Spot treatments
    "gray leaf spot": [
      // Chemical treatments for Gray Leaf Spot
      {
        id: "mancozeb_gray_spot",
        name: {
          en: "Mancozeb 80% WP (Dithane M-45)",
          si: "Mancozeb 80% WP (Dithane M-45)",
        },
        availableProducts: {
          en: ["Dithane M-45", "Indofil M-45", "Roko M-45"],
          si: ["Dithane M-45", "Indofil M-45", "Roko M-45"],
        },
        applicationMethod: {
          en: "Foliar spray covering both sides of leaves",
          si: "කොළ දෙපසම ආවරණය වන පරිදි පත්‍ර සිදුරු කරන්න",
        },
        dosage: {
          en: "2-2.5 kg per hectare (20-25g per 10L water)",
          si: "හෙක්ටයාරයකට 2-2.5 kg (ලීටර් 10ක ජලයකට 20-25g)",
        },
        schedule: {
          frequency: "Every 10-14 days",
          duration: "3-4 applications",
          bestTime: "Early morning or late afternoon",
        },
        safety: {
          en: [
            "Wear gloves and mask during mixing",
            "Wait 7 days before harvest",
            "Avoid spraying in windy conditions",
          ],
          si: [
            "මිශ්‍ර කිරීමේදී අත්වැසුම් හා මුඛ ආවරණය භාවිත කරන්න",
            "අස්වැන්නට 7 දිනකට පෙර නවත්වන්න",
            "සුලං සහිත තත්ත්වයන්හිදී සිදුරු කිරීමෙන් වළකින්න",
          ],
        },
        availability: {
          en: [
            "CIC Agri Centers",
            "Lanka Harvest Stores",
            "Local agrochemical shops",
          ],
          si: [
            "සීඅයිසී කෘෂිකර්ම මධ්‍යස්ථාන",
            "ලංකා හාර්වෙස්ට් ගබඩා",
            "දේශීය කෘෂි රසායනික ගබඩා",
          ],
        },
        costEstimate: "රු. 4,500 - 5,500 per hectare",
        type: "chemical",
      },
      {
        id: "chlorothalonil_gray_spot",
        name: {
          en: "Chlorothalonil 75% WP (Bravo 720)",
          si: "Chlorothalonil 75% WP (Bravo 720)",
        },
        availableProducts: {
          en: ["Bravo 720", "Kavach", "Tafgor"],
          si: ["Bravo 720", "කවච්", "ටැෆ්ගොර්"],
        },
        applicationMethod: {
          en: "Spray evenly on all plant surfaces",
          si: "සියලුම ශාක මතුපිටට ඒකාකාරව සිදුරු කරන්න",
        },
        dosage: {
          en: "1.5-2 L per hectare (15-20ml per 10L water)",
          si: "හෙක්ටයාරයකට 1.5-2 L (ලීටර් 10ක ජලයකට 15-20ml)",
        },
        schedule: {
          frequency: "Every 7-10 days",
          duration: "2-3 applications",
          bestTime: "Cool part of the day",
        },
        safety: {
          en: [
            "Use full protective clothing",
            "14-day pre-harvest interval",
            "Don't mix with alkaline products",
          ],
          si: [
            "සම්පූර්ණ ආරක්ෂිත ඇඳුම් භාවිත කරන්න",
            "අස්වැන්නට 14 දිනකට පෙර නවත්වන්න",
            "ක්ෂාරීය නිෂ්පාදන සමඟ මිශ්‍ර නොකරන්න",
          ],
        },
        availability: {
          en: [
            "Hayleys Agriculture",
            "Cargills Agrisolutions",
            "Local dealers",
          ],
          si: ["හේලිස් කෘෂිකර්ම", "කාගිල්ස් එග්රිසොලූෂන්ස්", "දේශීය වෙළෙන්දන්"],
        },
        costEstimate: "රු. 6,000 - 7,500 per hectare",
        type: "chemical",
      },
      // Organic treatments for Gray Leaf Spot
      {
        id: "copper_fungicide_gray",
        name: {
          en: "Copper-based Fungicide (Bordeaux Mixture)",
          si: "තඹ පදනම් දිලීර නාශක (බෝර්ඩෝ මිශ්‍රණය)",
        },
        availableProducts: {
          en: ["Copper oxychloride", "Copper hydroxide", "Bordeaux mixture"],
          si: ["තඹ ඔක්සික්ලෝරයිඩ්", "තඹ හයිඩ්‍රොක්සයිඩ්", "බෝර්ඩෝ මිශ්‍රණය"],
        },
        applicationMethod: {
          en: "Spray on leaves and stems, especially new growth",
          si: "කොළ හා අංකුරවලට සිදුරු කරන්න, විශේෂයෙන් නව වැඩීම්",
        },
        dosage: {
          en: "3g copper oxychloride per liter of water",
          si: "ලීටර් ජලයකට තඹ ඔක්සික්ලෝරයිඩ් 3g",
        },
        schedule: {
          frequency: "Every 7-10 days",
          duration: "Until symptoms stop spreading",
          bestTime: "Early morning",
        },
        safety: {
          en: [
            "Can be phytotoxic in high doses",
            "Avoid mixing with other pesticides",
            "Wash hands after application",
          ],
          si: [
            "ඉහළ ප්‍රමාණවල ශාක විෂ සහිත විය හැක",
            "වෙනත් පලිබෝධ නාශක සමඟ මිශ්‍ර නොකරන්න",
            "යෙදීමෙන් පසු අත් සෝදාගන්න",
          ],
        },
        availability: {
          en: ["Organic farming stores", "CIC centers", "Specialized shops"],
          si: ["කාබනික වගා ගබඩා", "සීඅයිසී මධ්‍යස්ථාන", "විශේෂිත ගබඩා"],
        },
        costEstimate: "රු. 2,000 - 3,500 per kg",
        type: "organic",
      },
      {
        id: "garlic_extract_gray",
        name: {
          en: "Garlic Extract Spray",
          si: "සුදුළූනු උද්දීපන සිදුරු",
        },
        availableProducts: {
          en: ["Homemade garlic extract", "Commercial garlic fungicides"],
          si: ["ගෙදර සකසන සුදුළූනු උද්දීපන", "වාණිජ සුදුළූනු දිලීර නාශක"],
        },
        applicationMethod: {
          en: "Crush garlic, soak in water overnight, strain and spray",
          si: "සුදුළූනු කුඩු කර ජලයේ පානයක් තබා, ඉන් පසු සිදුරු කරන්න",
        },
        dosage: {
          en: "100g garlic per liter of water",
          si: "ලීටර් ජලයකට සුදුළූනු 100g",
        },
        schedule: {
          frequency: "Every 3-5 days",
          duration: "During wet weather periods",
          bestTime: "Late afternoon",
        },
        safety: {
          en: [
            "Completely non-toxic",
            "Can use until harvest day",
            "No residue concerns",
          ],
          si: [
            "සම්පූර්ණයෙන්ම විෂ රහිත",
            "අස්වැන්න දිනය දක්වා භාවිත කළ හැක",
            "අවශේෂ කොන්දේසි නැත",
          ],
        },
        availability: {
          en: ["Make at home", "Organic product stores"],
          si: ["ගෙදර සකසන්න", "කාබනික නිෂ්පාදන ගබඩා"],
        },
        costEstimate: "රු. 200 - 500 (homemade)",
        type: "organic",
      },
    ],

    // Common Rust treatments
    "common rust": [
      // Chemical treatments for Common Rust
      {
        id: "tebuconazole_rust",
        name: {
          en: "Tebuconazole 250 EC (Folicur)",
          si: "Tebuconazole 250 EC (Folicur)",
        },
        availableProducts: {
          en: ["Folicur 250 EW", "Tebucon 250 EC", "Rust Guard"],
          si: ["Folicur 250 EW", "ටෙබුකොන් 250 EC", "රස්ට් ගාර්ඩ්"],
        },
        applicationMethod: {
          en: "Spray when first pustules appear, cover thoroughly",
          si: "පළමු පුටු පෙනෙන විට සිදුරු කරන්න, සම්පූර්ණයෙන් ආවරණය කරන්න",
        },
        dosage: {
          en: "500 ml per hectare (5ml per 10L water)",
          si: "හෙක්ටයාරයකට 500 ml (ලීටර් 10ක ජලයකට 5ml)",
        },
        schedule: {
          frequency: "Every 14 days",
          duration: "2 applications",
          bestTime: "Morning after dew dries",
        },
        safety: {
          en: [
            "3-day re-entry interval",
            "Don't apply during flowering",
            "Store in original container",
          ],
          si: [
            "නැවත ඇතුල් වීමට 3 දිනක ප්‍රමාදය",
            "මල් හටගැනීමේදී යොදන්න එපා",
            "මුල් බඳුනේම ගබඩා කරන්න",
          ],
        },
        availability: {
          en: [
            "Bayer Crop Science dealers",
            "Agro input shops",
            "Cooperative societies",
          ],
          si: [
            "බේයර් ක්‍රොප් සයන්ස් වෙළෙන්දන්",
            "කෘෂි ආදාන ගබඩා",
            "සහකාරී සමිති",
          ],
        },
        costEstimate: "රු. 8,000 - 10,000 per hectare",
        type: "chemical",
      },
      // Organic treatments for Common Rust
      {
        id: "sulfur_dust_rust",
        name: {
          en: "Sulfur Dust/Powder",
          si: "සල්ෆර් දූවිලි/පුඩි",
        },
        availableProducts: {
          en: ["Wettable sulfur", "Sulfur dust 80%", "Micronized sulfur"],
          si: [
            "දිය කළ හැකි සල්ෆර්",
            "සල්ෆර් දූවිලි 80%",
            "සුක්ෂ්මිකරණය කළ සල්ෆර්",
          ],
        },
        applicationMethod: {
          en: "Dust powder on leaves or mix with water and spray",
          si: "කොළවලට දූවිලි පුඩි දමන්න හෝ ජලය සමඟ මිශ්‍ර කර සිදුරු කරන්න",
        },
        dosage: {
          en: "2-3 kg per hectare for dusting, 500g per 100L for spraying",
          si: "දූවිලි කිරීමට හෙක්ටයාරයකට 2-3 kg, සිදුරු කිරීමට ලීටර් 100කට 500g",
        },
        schedule: {
          frequency: "Every 7 days",
          duration: "Until rust pustules stop appearing",
          bestTime: "Early morning when leaves are damp",
        },
        safety: {
          en: [
            "Can cause leaf burn in hot weather (>32°C)",
            "Wear mask during application",
            "Avoid applying to stressed plants",
          ],
          si: [
            "උණුසුම් කාලගුණයේදී (>32°C) කොළ දහඩිය ඇති කළ හැක",
            "යෙදීමේදී මුඛ ආවරණය භාවිත කරන්න",
            "තනතුරු ශාකවලට යොදන්න එපා",
          ],
        },
        availability: {
          en: [
            "Agricultural chemical shops",
            "CIC centers",
            "Specialty stores",
          ],
          si: ["කෘෂි රසායනික ගබඩා", "සීඅයිසී මධ්‍යස්ථාන", "විශේෂිත ගබඩා"],
        },
        costEstimate: "රු. 1,500 - 2,500 per kg",
        type: "organic",
      },
      {
        id: "milk_spray_rust",
        name: {
          en: "Milk Spray Solution",
          si: "කිරි සිදුරු ද්‍රාවණය",
        },
        availableProducts: {
          en: ["Fresh milk", "Skim milk powder"],
          si: ["නැවුම් කිරි", "කිරි පුඩි"],
        },
        applicationMethod: {
          en: "Mix milk with water and spray on affected leaves",
          si: "කිරි ජලය සමඟ මිශ්‍ර කර ආසාදිත කොළවලට සිදුරු කරන්න",
        },
        dosage: {
          en: "1 part milk to 9 parts water",
          si: "කිරි 1 කොටස, ජලය 9 කොටස්",
        },
        schedule: {
          frequency: "Every 5 days",
          duration: "3-4 applications",
          bestTime: "Morning",
        },
        safety: {
          en: [
            "Completely safe for all plants",
            "No toxicity concerns",
            "Improves plant health",
          ],
          si: [
            "සියලුම ශාක සඳහා සම්පූර්ණයෙන් ආරක්ෂිත",
            "විෂ සහගත ගැටළු නැත",
            "ශාක සෞඛ්‍යය වැඩිදියුණු කරයි",
          ],
        },
        availability: {
          en: ["Supermarkets", "Grocery stores"],
          si: ["සුපිරි වෙළඳසැල්", "ග්‍රෝසරි ගබඩා"],
        },
        costEstimate: "රු. 300 - 600 per liter",
        type: "organic",
      },
    ],

    // Northern Leaf Blight treatments
    "northern leaf blight": [
      // Chemical treatments
      {
        id: "azoxystrobin_blight",
        name: {
          en: "Azoxystrobin 250 SC (Amistar)",
          si: "Azoxystrobin 250 SC (Amistar)",
        },
        availableProducts: {
          en: ["Amistar 250 SC", "Azoxi 250 SC", "Quadris"],
          si: ["ඇමිස්ටාර් 250 SC", "ඇසොක්සි 250 SC", "ක්වොඩ්රිස්"],
        },
        applicationMethod: {
          en: "Spray at first disease signs, good coverage essential",
          si: "පළමු රෝග ලක්ෂණ දක්නා විට සිදුරු කරන්න, හොඳ ආවරණය අත්‍යවශ්‍යය",
        },
        dosage: {
          en: "1 L per hectare (10ml per 10L water)",
          si: "හෙක්ටයාරයකට 1 L (ලීටර් 10ක ජලයකට 10ml)",
        },
        schedule: {
          frequency: "Every 10-12 days",
          duration: "3 applications",
          bestTime: "Late afternoon",
        },
        safety: {
          en: [
            "7-day re-entry period",
            "Don't exceed recommended dose",
            "Keep away from water sources",
          ],
          si: [
            "නැවත ඇතුල් වීමට 7 දිනක ප්‍රමාදය",
            "නිර්දේශිත ප්‍රමාණය ඉක්මවන්න එපා",
            "ජල මූලාශ්‍රවලින් දුරින් තබාගන්න",
          ],
        },
        availability: {
          en: [
            "Syngenta authorized dealers",
            "Major agro centers",
            "District cooperatives",
          ],
          si: [
            "සින්ජෙන්ටා අනුමත වෙළෙන්දන්",
            "ප්‍රධාන කෘෂි මධ්‍යස්ථාන",
            "දිස්ත්‍රික් සහකාරී",
          ],
        },
        costEstimate: "රු. 12,000 - 15,000 per hectare",
        type: "chemical",
      },
      // Organic treatments for Blight
      {
        id: "bicarbonate_blight",
        name: {
          en: "Baking Soda & Oil Spray",
          si: "බේකිං සෝඩා හා තෙල් සිදුරු",
        },
        availableProducts: {
          en: ["Baking soda", "Horticultural oil", "Soap"],
          si: ["බේකිං සෝඩා", "උද්‍යානික තෙල්", "සබන්"],
        },
        applicationMethod: {
          en: "Mix baking soda with oil and soap, then dilute with water",
          si: "බේකිං සෝඩා තෙල් හා සබන් සමඟ මිශ්‍ර කර ජලයෙන් තනුක කරන්න",
        },
        dosage: {
          en: "1 tbsp baking soda + 1 tsp oil + few drops soap per liter water",
          si: "ලීටර් ජලයකට බේකිං සෝඩා 1 හැදි + තෙල් 1 තේ හැදි + සබන් බිංදු කිහිපයක්",
        },
        schedule: {
          frequency: "Every 7 days",
          duration: "Until disease controlled",
          bestTime: "Cool, cloudy day",
        },
        safety: {
          en: [
            "Test on small area first",
            "Avoid spraying in hot sun",
            "Can cause leaf burn if too concentrated",
          ],
          si: [
            "පළමුව කුඩා ප්‍රදේශයක පරීක්ෂා කරන්න",
            "උණුසුම් අව්වේදී සිදුරු කිරීමෙන් වළකින්න",
            "අධික සාන්ද්‍රණයක් නම් කොළ දහඩිය ඇති කළ හැක",
          ],
        },
        availability: {
          en: ["Supermarkets", "Garden centers", "Home stores"],
          si: ["සුපිරි වෙළඳසැල්", "උද්‍යාන මධ්‍යස්ථාන", "ගෙවත්ත ගබඩා"],
        },
        costEstimate: "රු. 500 - 1,000",
        type: "organic",
      },
      {
        id: "compost_tea_blight",
        name: {
          en: "Compost Tea Foliar Spray",
          si: "කොම්පෝස්ට් තේ පත්ර සිදුරු",
        },
        availableProducts: {
          en: ["Well-aged compost", "Molasses", "Aquarium pump"],
          si: ["හොඳින් පැකිළුණු කොම්පෝස්ට්", "මොලසස්", "මත්ස්‍යාල පම්පුව"],
        },
        applicationMethod: {
          en: "Brew compost with molasses for 24-48 hours, strain and spray",
          si: "කොම්පෝස්ට් මොලසස් සමඟ පැය 24-48 ක් තබා, පෙරා සිදුරු කරන්න",
        },
        dosage: {
          en: "1 part compost tea to 10 parts water",
          si: "කොම්පෝස්ට් තේ 1 කොටස, ජලය 10 කොටස්",
        },
        schedule: {
          frequency: "Every 10-14 days",
          duration: "Throughout growing season",
          bestTime: "Early morning",
        },
        safety: {
          en: [
            "100% safe and beneficial",
            "Improves plant immunity",
            "Enhances soil health",
          ],
          si: [
            "100% ආරක්ෂිත හා ප්‍රයෝජනවත්",
            "ශාක ප්‍රතිශක්තිකරණය වැඩි කරයි",
            "මඩ සෞඛ්‍යය වැඩිදියුණු කරයි",
          ],
        },
        availability: {
          en: ["Make at home", "Organic farm suppliers"],
          si: ["ගෙදර සකසන්න", "කාබනික කෙත් සැපයුම්කරුවන්"],
        },
        costEstimate: "රු. 500 - 2,000 (for setup)",
        type: "organic",
      },
    ],

    // Add more diseases with their specific organic treatments
    "leaf blight": [
      // Similar to northern leaf blight treatments
      {
        id: "copper_blight",
        name: {
          en: "Copper Fungicide Spray",
          si: "තඹ දිලීර නාශක සිදුරු",
        },
        availableProducts: {
          en: ["Copper oxychloride 50%", "Copper hydroxide"],
          si: ["තඹ ඔක්සික්ලෝරයිඩ් 50%", "තඹ හයිඩ්‍රොක්සයිඩ්"],
        },
        applicationMethod: {
          en: "Spray thoroughly on all plant parts, focus on new growth",
          si: "සියලුම ශාක කොටස් මත හොඳින් සිදුරු කරන්න, නව වැඩීම් කෙරෙහි අවධානය යොමු කරන්න",
        },
        dosage: {
          en: "3g per liter of water",
          si: "ලීටර් ජලයකට 3g",
        },
        schedule: {
          frequency: "Every 7-10 days",
          duration: "3-4 applications",
          bestTime: "Morning",
        },
        safety: {
          en: [
            "Can accumulate in soil over time",
            "Use protective gear",
            "Follow recommended intervals",
          ],
          si: [
            "කාලයත් සමඟ මඩෙහි එකතු විය හැක",
            "රැකවරණ උපකරණ භාවිත කරන්න",
            "නිර්දේශිත කාල අන්තරයන් පිළිපදින්න",
          ],
        },
        availability: {
          en: ["Agricultural stores", "Organic suppliers"],
          si: ["කෘෂිකර්ම ගබඩා", "කාබනික සැපයුම්කරුවන්"],
        },
        costEstimate: "රු. 2,500 - 4,000 per kg",
        type: "organic",
      },
    ],
  };

  // Get treatments based on disease
  const getTreatmentsForDisease = () => {
    if (!primaryPrediction) return { chemical: [], organic: [] };

    const formattedName = formatDiseaseName(
      primaryPrediction.class_name
    ).toLowerCase();

    for (const [diseaseKey, treatments] of Object.entries(
      sriLankanTreatments
    )) {
      if (
        formattedName.includes(diseaseKey) ||
        diseaseKey.includes(formattedName)
      ) {
        const chemicalTreatments = treatments.filter(
          (t) => t.type === "chemical"
        );
        const organicTreatments = treatments.filter(
          (t) => t.type === "organic"
        );
        return { chemical: chemicalTreatments, organic: organicTreatments };
      }
    }

    // Return general treatments if specific not found
    return {
      chemical: [
        {
          id: "general_fungicide",
          name: {
            en: "General Purpose Fungicide",
            si: "පොදු කාර්යය දිලීර නාශක",
          },
          availableProducts: {
            en: ["Mancozeb 80% WP", "Copper oxychloride"],
            si: ["Mancozeb 80% WP", "තඹ ඔක්සික්ලෝරයිඩ්"],
          },
          applicationMethod: {
            en: "Spray thoroughly on all plant parts",
            si: "සියලුම ශාක කොටස් මත හොඳින් සිදුරු කරන්න",
          },
          dosage: {
            en: "As per product label instructions",
            si: "නිෂ්පාදන ලේබලයේ උපදෙස් පරිදි",
          },
          schedule: {
            frequency: "Every 7-10 days",
            duration: "2-3 applications",
            bestTime: "Morning",
          },
          safety: {
            en: [
              "Follow label instructions",
              "Wear protective gear",
              "Store safely",
            ],
            si: [
              "ලේබල් උපදෙස් පිළිපදින්න",
              "රැකවරණ ඇඳුම් භාවිත කරන්න",
              "සුරක්ෂිතව ගබඩා කරන්න",
            ],
          },
          availability: {
            en: [
              "Local agrochemical shops",
              "CIC centers",
              "Cooperative stores",
            ],
            si: [
              "දේශීය කෘෂි රසායනික ගබඩා",
              "සීඅයිසී මධ්‍යස්ථාන",
              "සහකාරී ගබඩා",
            ],
          },
          costEstimate: "රු. 3,000 - 6,000",
          type: "chemical",
        },
      ],
      organic: [
        {
          id: "neem_oil_general",
          name: {
            en: "Neem Oil Extract",
            si: "නීම් තෙල් උද්දීපන",
          },
          availableProducts: {
            en: ["Neemazal", "Neem Oil 3000ppm", "Bio-neem"],
            si: ["නීමසල්", "නීම් තෙල් 3000ppm", "බයෝ-නීම්"],
          },
          applicationMethod: {
            en: "Mix with water and spray on both leaf surfaces",
            si: "ජලය සමඟ මිශ්‍ර කර කොළ දෙපසම සිදුරු කරන්න",
          },
          dosage: {
            en: "3-5 ml per liter of water",
            si: "ලීටර් ජලයකට 3-5 ml",
          },
          schedule: {
            frequency: "Every 7 days",
            duration: "Continuous during disease period",
            bestTime: "Early morning or evening",
          },
          safety: {
            en: [
              "Safe for beneficial insects",
              "No waiting period for harvest",
              "Can be mixed with other organic inputs",
            ],
            si: [
              "හිතකර කෘමීන්ට ආරක්ෂිතය",
              "අස්වැන්න සඳහා ප්‍රමාද කාලයක් නැත",
              "වෙනත් කාබනික ආදාන සමඟ මිශ්‍ර කළ හැක",
            ],
          },
          availability: {
            en: [
              "Bio control product shops",
              "Organic farming centers",
              "Home garden stores",
            ],
            si: [
              "ජීව පාලන නිෂ්පාදන ගබඩා",
              "කාබනික කෘෂිකර්ම මධ්‍යස්ථාන",
              "ගෙවත්ත උද්‍යාන ගබඩා",
            ],
          },
          costEstimate: "රු. 1,500 - 2,500 per liter",
          type: "organic",
        },
        {
          id: "baking_soda_general",
          name: {
            en: "Baking Soda Solution",
            si: "බේකිං සෝඩා ද්‍රාවණය",
          },
          availableProducts: {
            en: ["Pure baking soda", "Sodium bicarbonate"],
            si: ["පිරිසිදු බේකිං සෝඩා", "සෝඩියම් බයිකාබනේට්"],
          },
          applicationMethod: {
            en: "Dissolve in water and spray on affected areas",
            si: "ජලයේ දිය කර ආසාදිත ප්‍රදේශවලට සිදුරු කරන්න",
          },
          dosage: {
            en: "1 tablespoon per liter of water + few drops of soap",
            si: "ලීටර් ජලයකට 1 හැදි + සබන් බිංදු කිහිපයක්",
          },
          schedule: {
            frequency: "Every 5-7 days",
            duration: "Until symptoms disappear",
            bestTime: "Cool part of the day",
          },
          safety: {
            en: [
              "Completely safe for humans",
              "No residue concerns",
              "Can use until harvest day",
            ],
            si: [
              "මිනිසුන්ට සම්පූර්ණයෙන් ආරක්ෂිත",
              "අවශේෂ කොන්දේසි නැත",
              "අස්වැන්න දිනය දක්වා භාවිත කළ හැක",
            ],
          },
          availability: {
            en: ["Supermarkets", "Grocery stores", "Baking supply shops"],
            si: ["සුපිරි වෙළඳසැල්", "ග්‍රෝසරි ගබඩා", "බේකිං සැපයුම් ගබඩා"],
          },
          costEstimate: "රු. 200 - 400 per 500g",
          type: "organic",
        },
      ],
    };
  };

  const { chemical: chemicalTreatments, organic: organicTreatments } =
    getTreatmentsForDisease();

  // Get disease type for organic treatment effectiveness
  const getDiseaseType = () => {
    const diseaseNameLower = diseaseName.toLowerCase();
    if (
      diseaseNameLower.includes("spot") ||
      diseaseNameLower.includes("blight") ||
      diseaseNameLower.includes("rust")
    ) {
      return language === "si" ? "දිලීර රෝග" : "Fungal diseases";
    }
    return language === "si" ? "ශාක රෝග" : "Plant diseases";
  };

  const diseaseType = getDiseaseType();

  // Get spray schedule based on severity
  const getSpraySchedule = () => {
    if (severity_score < 0.33) {
      return {
        title: language === "si" ? "සුළු ආසාදන සඳහා" : "For Mild Infection",
        schedule: [
          {
            day: language === "si" ? "දින 1" : "Day 1",
            action: language === "si" ? "පළමු සිදුරු කිරීම" : "First spray",
          },
          {
            day: language === "si" ? "දින 10" : "Day 10",
            action:
              language === "si"
                ? "දෙවන සිදුරු කිරීම (අවශ්‍ය නම්)"
                : "Second spray (if needed)",
          },
          {
            day: language === "si" ? "දින 20" : "Day 20",
            action: language === "si" ? "සමීක්ෂණය" : "Monitoring",
          },
        ],
      };
    } else if (severity_score < 0.66) {
      return {
        title:
          language === "si" ? "මධ්‍යම ආසාදන සඳහා" : "For Moderate Infection",
        schedule: [
          {
            day: language === "si" ? "දින 1" : "Day 1",
            action: language === "si" ? "පළමු සිදුරු කිරීම" : "First spray",
          },
          {
            day: language === "si" ? "දින 7" : "Day 7",
            action: language === "si" ? "දෙවන සිදුරු කිරීම" : "Second spray",
          },
          {
            day: language === "si" ? "දින 14" : "Day 14",
            action: language === "si" ? "තෙවන සිදුරු කිරීම" : "Third spray",
          },
          {
            day: language === "si" ? "දින 21" : "Day 21",
            action: language === "si" ? "සමීක්ෂණය" : "Monitoring",
          },
        ],
      };
    } else {
      return {
        title: language === "si" ? "දැඩි ආසාදන සඳහා" : "For Severe Infection",
        schedule: [
          {
            day: language === "si" ? "දින 1" : "Day 1",
            action:
              language === "si" ? "පළමු සිදුරු කිරීම" : "First spray (urgent)",
          },
          {
            day: language === "si" ? "දින 5" : "Day 5",
            action: language === "si" ? "දෙවන සිදුරු කිරීම" : "Second spray",
          },
          {
            day: language === "si" ? "දින 10" : "Day 10",
            action: language === "si" ? "තෙවන සිදුරු කිරීම" : "Third spray",
          },
          {
            day: language === "si" ? "දින 15" : "Day 15",
            action: language === "si" ? "සිව්වන සිදුරු කිරීම" : "Fourth spray",
          },
          {
            day: language === "si" ? "දින 25" : "Day 25",
            action: language === "si" ? "සමීක්ෂණය" : "Monitoring",
          },
        ],
      };
    }
  };

  const spraySchedule = getSpraySchedule();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#059669" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {content[language].plantHealth}
          </Text>
          <Text style={styles.headerSubtitle}>
            {content[language].aiPowered}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Section */}
        {image && (
          <View style={styles.imageSection}>
            <View style={styles.imageCard}>
              <Image
                source={{ uri: image }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
              <View style={styles.imageOverlay}>
                <View style={styles.imageLabel}>
                  <Leaf size={16} color="#FFFFFF" />
                  <Text style={styles.imageLabelText}>
                    {content[language].plantHealth}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Disease Severity Card */}
        <View style={styles.diseaseCard}>
          <View style={styles.diseaseHeader}>
            <Bug size={24} color="#059669" />
            <View style={styles.diseaseHeaderContent}>
              <Text style={styles.diseaseTitle}>
                {diseaseName} {content[language].forDisease}
              </Text>
              <Text style={styles.diseaseSubtitle}>
                {content[language].effectiveAgainst}: {diseaseType}
              </Text>
            </View>
          </View>
        </View>

        {/* Severity Analysis Card */}
        <View style={styles.severityCard}>
          <View style={styles.severityHeader}>
            <Shield size={24} color="#059669" />
            <Text style={styles.severityTitle}>
              {content[language].severityAnalysis}
            </Text>
          </View>

          <View style={styles.severityLevelContainer}>
            <View style={styles.severityLevelInfo}>
              <View style={styles.severityLevelBadge}>
                <Text style={styles.severityLevelIcon}>
                  {getSeverityIcon(severity_score)}
                </Text>
                <Text
                  style={[
                    styles.severityLevelText,
                    { color: getSeverityColor(severity_score) },
                  ]}
                >
                  {severity_label}
                </Text>
              </View>
              <Text style={styles.severityScore}>
                {Math.round(severity_score * 100)}%
              </Text>
            </View>

            <Text style={styles.severitySubtitle}>
              {content[language].infectionLevel}
            </Text>
          </View>

          {/* Gauge */}
          <View style={styles.gaugeContainer}>
            <SeverityGauge severity={severity_score} />
          </View>

          {/* Status Description */}
          <View style={styles.statusContainer}>
            <View style={styles.statusIcon}>
              {severity_score < 0.33 ? (
                <CheckCircle size={24} color="#10B981" />
              ) : severity_score < 0.66 ? (
                <AlertTriangle size={24} color="#F59E0B" />
              ) : (
                <AlertCircle size={24} color="#EF4444" />
              )}
            </View>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        </View>

        {/* Spray Schedule Card */}
        <View style={styles.scheduleCard}>
          <View style={styles.scheduleHeader}>
            <Calendar size={24} color="#059669" />
            <Text style={styles.scheduleTitle}>
              {content[language].spraySchedule}
            </Text>
            <Text style={styles.scheduleSubtitle}>{spraySchedule.title}</Text>
          </View>

          <View style={styles.scheduleTimeline}>
            {spraySchedule.schedule.map((item, index) => (
              <View key={index} style={styles.scheduleItem}>
                <View style={styles.scheduleDayContainer}>
                  <Text style={styles.scheduleDay}>{item.day}</Text>
                </View>
                <View style={styles.scheduleConnector}>
                  <View style={styles.scheduleDot} />
                  {index < spraySchedule.schedule.length - 1 && (
                    <View style={styles.scheduleLine} />
                  )}
                </View>
                <View style={styles.scheduleActionContainer}>
                  <Text style={styles.scheduleAction}>{item.action}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.scheduleTips}>
            <View style={styles.tipItem}>
              <Clock size={16} color="#059669" />
              <Text style={styles.tipText}>
                {content[language].bestTime}:{" "}
                {language === "si" ? "උදේ 6-9 හෝ හවස 4-6" : "6-9 AM or 4-6 PM"}
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Wind size={16} color="#059669" />
              <Text style={styles.tipText}>
                {content[language].avoidRain}:{" "}
                {language === "si" ? "වැස්සට පෙර 2 පැය" : "2 hours before rain"}
              </Text>
            </View>
            <View style={styles.tipItem}>
              <ShieldCheck size={16} color="#059669" />
              <Text style={styles.tipText}>
                {content[language].protectiveGear}
              </Text>
            </View>
          </View>
        </View>

        {/* Chemical Treatments Card */}
        {chemicalTreatments.length > 0 && (
          <View style={styles.treatmentCard}>
            <View style={styles.treatmentHeader}>
              <Pill size={24} color="#DC2626" />
              <View style={styles.treatmentHeaderContent}>
                <Text style={styles.treatmentTitle}>
                  {content[language].chemicalOptions}
                </Text>
                <Text style={styles.treatmentSubtitle}>
                  {content[language].recommendedForSeverity}: {severity_label}
                </Text>
              </View>
            </View>

            {chemicalTreatments.map((treatment, index) => (
              <View key={treatment.id} style={styles.treatmentItem}>
                <View style={styles.treatmentNumber}>
                  <Text style={styles.treatmentNumberText}>{index + 1}</Text>
                </View>

                <View style={styles.treatmentContent}>
                  <Text style={styles.treatmentName}>
                    {treatment.name[language]}
                  </Text>

                  {/* Available Products */}
                  <View style={styles.infoSection}>
                    <Text style={styles.sectionLabel}>
                      {content[language].availableInSL}:
                    </Text>
                    <View style={styles.productsContainer}>
                      {treatment.availableProducts[language].map(
                        (product, i) => (
                          <View key={i} style={styles.productChip}>
                            <Text style={styles.productText}>{product}</Text>
                          </View>
                        )
                      )}
                    </View>
                  </View>

                  {/* How to Use & Dosage */}
                  <View style={styles.infoRow}>
                    <View style={styles.infoColumn}>
                      <Text style={styles.sectionLabel}>
                        {content[language].howToUse}:
                      </Text>
                      <Text style={styles.infoText}>
                        {treatment.applicationMethod[language]}
                      </Text>
                    </View>
                    <View style={styles.infoColumn}>
                      <Text style={styles.sectionLabel}>
                        {content[language].dosage}:
                      </Text>
                      <Text style={styles.infoText}>
                        {treatment.dosage[language]}
                      </Text>
                    </View>
                  </View>

                  {/* Schedule */}
                  <View style={styles.scheduleInfo}>
                    <View style={styles.scheduleItemSmall}>
                      <Clock size={14} color="#DC2626" />
                      <Text style={[styles.scheduleText, styles.chemicalText]}>
                        {content[language].frequency}:{" "}
                        {treatment.schedule.frequency}
                      </Text>
                    </View>
                    <View style={styles.scheduleItemSmall}>
                      <Calendar size={14} color="#DC2626" />
                      <Text style={[styles.scheduleText, styles.chemicalText]}>
                        {content[language].duration}:{" "}
                        {treatment.schedule.duration}
                      </Text>
                    </View>
                    <View style={styles.scheduleItemSmall}>
                      <Sun size={14} color="#DC2626" />
                      <Text style={[styles.scheduleText, styles.chemicalText]}>
                        {content[language].bestTime}:{" "}
                        {treatment.schedule.bestTime}
                      </Text>
                    </View>
                  </View>

                  {/* Safety */}
                  <View style={styles.infoSection}>
                    <Text style={styles.sectionLabel}>
                      {content[language].safetyPrecautions}:
                    </Text>
                    {treatment.safety[language].map((safety, i) => (
                      <View key={i} style={styles.safetyItem}>
                        <View
                          style={[styles.safetyBullet, styles.chemicalBullet]}
                        />
                        <Text style={[styles.safetyText, styles.chemicalText]}>
                          {safety}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Availability & Cost */}
                  <View style={styles.availabilityRow}>
                    <View style={styles.availabilityColumn}>
                      <Text style={styles.sectionLabel}>
                        {content[language].whereToBuy}:
                      </Text>
                      {treatment.availability[language].map((place, i) => (
                        <Text
                          key={i}
                          style={[styles.availabilityText, styles.chemicalText]}
                        >
                          • {place}
                        </Text>
                      ))}
                    </View>
                    <View style={styles.costContainer}>
                      <Text
                        style={[styles.costLabel, styles.chemicalCostLabel]}
                      >
                        {content[language].costEstimate}:
                      </Text>
                      <Text style={[styles.costValue, styles.chemicalCost]}>
                        {treatment.costEstimate}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Organic Treatments Card */}
        {organicTreatments.length > 0 && (
          <View style={[styles.treatmentCard, styles.organicCard]}>
            <View style={styles.treatmentHeader}>
              <Leaf size={24} color="#059669" />
              <View style={styles.treatmentHeaderContent}>
                <Text style={styles.treatmentTitle}>
                  {content[language].organicOptions}
                </Text>
                <Text style={styles.treatmentSubtitle}>
                  {language === "si"
                    ? "ආරක්ෂිත හා පරිසර හිතකර"
                    : "Safe & Environment Friendly"}
                </Text>
              </View>
            </View>

            {organicTreatments.map((treatment, index) => (
              <View key={treatment.id} style={styles.treatmentItem}>
                <View style={[styles.treatmentNumber, styles.organicNumber]}>
                  <Text style={styles.treatmentNumberText}>{index + 1}</Text>
                </View>

                <View style={styles.treatmentContent}>
                  <Text style={[styles.treatmentName, styles.organicName]}>
                    {treatment.name[language]}
                  </Text>

                  {/* Available Products */}
                  <View style={styles.infoSection}>
                    <Text style={styles.sectionLabel}>
                      {content[language].availableInSL}:
                    </Text>
                    <View style={styles.productsContainer}>
                      {treatment.availableProducts[language].map(
                        (product, i) => (
                          <View
                            key={i}
                            style={[styles.productChip, styles.organicChip]}
                          >
                            <Text
                              style={[
                                styles.productText,
                                styles.organicProductText,
                              ]}
                            >
                              {product}
                            </Text>
                          </View>
                        )
                      )}
                    </View>
                  </View>

                  {/* How to Use & Dosage */}
                  <View style={styles.infoRow}>
                    <View style={styles.infoColumn}>
                      <Text style={styles.sectionLabel}>
                        {content[language].howToUse}:
                      </Text>
                      <Text style={styles.infoText}>
                        {treatment.applicationMethod[language]}
                      </Text>
                    </View>
                    <View style={styles.infoColumn}>
                      <Text style={styles.sectionLabel}>
                        {content[language].dosage}:
                      </Text>
                      <Text style={styles.infoText}>
                        {treatment.dosage[language]}
                      </Text>
                    </View>
                  </View>

                  {/* Schedule */}
                  <View style={styles.scheduleInfo}>
                    <View style={styles.scheduleItemSmall}>
                      <Clock size={14} color="#059669" />
                      <Text style={[styles.scheduleText, styles.organicText]}>
                        {content[language].frequency}:{" "}
                        {treatment.schedule.frequency}
                      </Text>
                    </View>
                    <View style={styles.scheduleItemSmall}>
                      <Calendar size={14} color="#059669" />
                      <Text style={[styles.scheduleText, styles.organicText]}>
                        {content[language].duration}:{" "}
                        {treatment.schedule.duration}
                      </Text>
                    </View>
                    <View style={styles.scheduleItemSmall}>
                      <Sun size={14} color="#059669" />
                      <Text style={[styles.scheduleText, styles.organicText]}>
                        {content[language].bestTime}:{" "}
                        {treatment.schedule.bestTime}
                      </Text>
                    </View>
                  </View>

                  {/* Safety */}
                  <View style={styles.infoSection}>
                    <Text style={styles.sectionLabel}>
                      {content[language].safetyPrecautions}:
                    </Text>
                    {treatment.safety[language].map((safety, i) => (
                      <View key={i} style={styles.safetyItem}>
                        <View
                          style={[styles.safetyBullet, styles.organicBullet]}
                        />
                        <Text style={[styles.safetyText, styles.organicText]}>
                          {safety}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Availability & Cost */}
                  <View style={styles.availabilityRow}>
                    <View style={styles.availabilityColumn}>
                      <Text style={styles.sectionLabel}>
                        {content[language].whereToBuy}:
                      </Text>
                      {treatment.availability[language].map((place, i) => (
                        <Text
                          key={i}
                          style={[styles.availabilityText, styles.organicText]}
                        >
                          • {place}
                        </Text>
                      ))}
                    </View>
                    <View style={styles.costContainer}>
                      <Text style={[styles.costLabel, styles.organicCostLabel]}>
                        {content[language].costEstimate}:
                      </Text>
                      <Text style={[styles.costValue, styles.organicCost]}>
                        {treatment.costEstimate}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Next Steps Card */}
        <View style={styles.nextStepsCard}>
          <View style={styles.nextStepsHeader}>
            <Info size={24} color="#059669" />
            <Text style={styles.nextStepsTitle}>
              {content[language].nextSteps}
            </Text>
          </View>

          <View style={styles.recommendations}>
            <View style={styles.recommendationItem}>
              <View style={styles.recommendationIcon}>
                <Clock size={16} color="#059669" />
              </View>
              <Text style={styles.recommendationText}>
                {language === "si"
                  ? "ඉහත කාලසටහනට අනුව සිදුරු කිරීම ආරම්භ කරන්න"
                  : "Start spraying according to the above schedule"}
              </Text>
            </View>
            <View style={styles.recommendationItem}>
              <View style={styles.recommendationIcon}>
                <ShieldCheck size={16} color="#059669" />
              </View>
              <Text style={styles.recommendationText}>
                {language === "si"
                  ? "සුරක්ෂිත ඇඳුම් හා උපකරණ භාවිත කරන්න"
                  : "Use safety clothing and equipment"}
              </Text>
            </View>
            <View style={styles.recommendationItem}>
              <View style={styles.recommendationIcon}>
                <TrendingUp size={16} color="#059669" />
              </View>
              <Text style={styles.recommendationText}>
                {language === "si"
                  ? "සතියකට වරක් පැලේ ප්‍රගතිය නිරීක්ෂණය කරන්න"
                  : "Monitor plant progress weekly"}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() =>
              navigation.navigate("DiseaseInfo", {
                predictions,
              })
            }
          >
            <Leaf size={20} color="#FFFFFF" />
            <Text style={styles.detailsButtonText}>
              {content[language].viewDiseaseInfo}
            </Text>
            <ChevronRight size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacer} />
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
    backgroundColor: "#059669",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#D1FAE5",
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  imageSection: {
    marginBottom: 20,
  },
  imageCard: {
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  imagePreview: {
    width: "100%",
    height: 220,
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    padding: 16,
  },
  imageLabel: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
    gap: 6,
  },
  imageLabelText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  // Disease Card
  diseaseCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  diseaseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  diseaseHeaderContent: {
    flex: 1,
  },
  diseaseTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },
  diseaseSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },

  // Severity Card Styles
  severityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  severityHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  severityTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
  },
  severityLevelContainer: {
    marginBottom: 20,
  },
  severityLevelInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  severityLevelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  severityLevelIcon: {
    fontSize: 20,
  },
  severityLevelText: {
    fontSize: 18,
    fontWeight: "700",
  },
  severityScore: {
    fontSize: 28,
    fontWeight: "800",
    color: "#059669",
  },
  severitySubtitle: {
    fontSize: 14,
    color: "#64748B",
  },
  gaugeContainer: {
    marginBottom: 20,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statusIcon: {
    marginTop: 2,
  },
  statusText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    flex: 1,
  },

  // Spray Schedule Card
  scheduleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  scheduleHeader: {
    marginBottom: 20,
  },
  scheduleTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 8,
  },
  scheduleSubtitle: {
    fontSize: 14,
    color: "#059669",
    fontWeight: "600",
    marginTop: 4,
  },
  scheduleTimeline: {
    marginBottom: 20,
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  scheduleDayContainer: {
    width: 70,
  },
  scheduleDay: {
    fontSize: 15,
    fontWeight: "700",
    color: "#059669",
  },
  scheduleConnector: {
    width: 40,
    alignItems: "center",
  },
  scheduleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#059669",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  scheduleLine: {
    width: 2,
    height: 40,
    backgroundColor: "#D1FAE5",
    marginTop: 2,
  },
  scheduleActionContainer: {
    flex: 1,
    backgroundColor: "#F0FDF4",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  scheduleAction: {
    fontSize: 14,
    color: "#047857",
    fontWeight: "500",
  },
  scheduleTips: {
    backgroundColor: "#F0FDF4",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: "#047857",
    flex: 1,
  },

  // Treatment Card Styles
  treatmentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  organicCard: {
    borderColor: "#A7F3D0",
    backgroundColor: "#F9FEFB",
  },
  treatmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  treatmentHeaderContent: {
    flex: 1,
  },
  treatmentTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
  },
  treatmentSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
  treatmentItem: {
    flexDirection: "row",
    marginBottom: 24,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  treatmentNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  organicNumber: {
    backgroundColor: "#059669",
  },
  treatmentNumberText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  treatmentContent: {
    flex: 1,
  },
  treatmentName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
  },
  organicName: {
    color: "#059669",
  },
  infoSection: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  productsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  productChip: {
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  organicChip: {
    backgroundColor: "#F0FDF4",
    borderColor: "#A7F3D0",
  },
  productText: {
    fontSize: 12,
    color: "#991B1B",
    fontWeight: "500",
  },
  organicProductText: {
    color: "#047857",
  },
  infoRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  infoColumn: {
    flex: 1,
  },
  infoText: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 18,
  },
  scheduleInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  scheduleItemSmall: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  scheduleText: {
    fontSize: 12,
    color: "#4B5563",
  },
  chemicalText: {
    color: "#991B1B",
  },
  organicText: {
    color: "#047857",
  },
  safetyItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 4,
  },
  safetyBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#DC2626",
    marginTop: 6,
  },
  chemicalBullet: {
    backgroundColor: "#DC2626",
  },
  organicBullet: {
    backgroundColor: "#059669",
  },
  safetyText: {
    fontSize: 12,
    color: "#4B5563",
    flex: 1,
    lineHeight: 16,
  },
  availabilityRow: {
    flexDirection: "row",
    gap: 12,
  },
  availabilityColumn: {
    flex: 2,
  },
  availabilityText: {
    fontSize: 12,
    color: "#4B5563",
    marginBottom: 2,
  },
  costContainer: {
    flex: 1,
    backgroundColor: "#FEF2F2",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  costLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#991B1B",
    marginBottom: 4,
  },
  chemicalCostLabel: {
    color: "#991B1B",
  },
  organicCostLabel: {
    color: "#047857",
  },
  costValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#DC2626",
  },
  chemicalCost: {
    color: "#DC2626",
  },
  organicCost: {
    color: "#059669",
  },

  // Next Steps Card
  nextStepsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  nextStepsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  nextStepsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
  },
  recommendations: {
    gap: 12,
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  recommendationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  recommendationText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    flex: 1,
  },
  actionButtons: {
    gap: 12,
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#059669",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  detailsButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomSpacer: {
    height: 40,
  },
});
