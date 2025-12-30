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
  Sparkles,
} from "lucide-react-native";
import { DiseaseIdentifyStackParamList } from "../../navigation/DiseaseIdentifyStack";
import SeverityGauge from "../../components/SeverityGauge";
import { StackNavigationProp } from "@react-navigation/stack";
import { LinearGradient } from "expo-linear-gradient";
import {
  sriLankanTreatments,
  generalTreatments,
} from "../../data/diseases/treatments";
import { SriLankanTreatment } from "../../data/diseases/treatments/treatmentTypes";

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

export default function SeverityDetailsScreen({ route }: Props) {
  const {
    image,
    severity_score,
    severity_label,
    predictions,
    diseaseNameEn,
    diseaseNameSi,
  } = route.params;
  const navigation = useNavigation<NavProp>();

  // 🌐 GLOBAL LANGUAGE (sinhala/english)
  const { language: lang, setLanguage } = useLanguage();
  const language = lang === "sinhala" ? "si" : "en";

  // 🌐 TRANSLATION CONTENT
  const content = {
    si: {
      back: "ආපසු",
      header: "පැලැස්ම සෞඛ්‍ය තත්ත්වය",
      mild: "ඔබේ බිම හොඳ තත්ත්වයකි. සුළු රෝග ලක්ෂණ තිබේ.",
      moderate: "සැලකිල්ලක් යොමු කරන්න. රෝගය මධ්‍යම ලෙස පැතිරෙමින් ඇත.",
      severe:
        "අවදානම් තත්ත්වයකි! දැඩි ආසාදනයක් හමුවිය. වහාම ක්‍රියාමාර්ග ගන්න.",
      viewDetails: "සම්පූර්ණ විස්තර බලන්න",
      plantSeverity: "පත්‍රයේ රෝග ආසාදනය",
      severityAnalysis: "වත්මන් ආසාදිත තත්ත්වය",
      infectionLevel: "ආසාදන මට්ටම",
      nextSteps: "ඊළඟ පියවර",
      viewDiseaseInfo: "රෝග විස්තර",
      recommendations: "නිර්දේශ",
      takeAction: "ක්‍රියාමාර්ග ගන්න",
      monitoring: "සමීක්ෂණය",
      severityLevel: "ආසාදිත මට්ටම",
      healthy: "සෞඛ්‍ය සම්පන්න",
      lowRisk: "අවදානම අඩුයි",
      mediumRisk: "අවදානම මධ්‍යමයි ",
      highRisk: "අවදානම ඉහළයි",

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
      spraySchedule: "ස්ප්‍රේ කිරිමේ කාලසටහන",
      immediateAction: "ක්ෂණික ක්‍රියාමාර්ග",
      followUpTreatment: "අනුගමන සුව කිරීම",
      preventionTips: "නැවත ආසාදන වළක්වා ගැනීම",
      organicOptions: "කාබනික විසදුම්",
      chemicalOptions: "රසායනික විසදුම්",
      recommendedForSeverity: "ආසාදිත තත්ත්වය සඳහා විසදුම්",
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
      severityLowPrefix: "අඩු ආසාදන සඳහා",
      severityMediumPrefix: "මධ්‍යම ආසාදන සඳහා",
      severityHighPrefix: "ඉහළ ආසාදන සඳහා",
    },
    en: {
      back: "Back",
      header: "Plant Health Status",
      mild: "Your plant is in good condition. Mild signs of disease detected.",
      moderate: "Your plant needs attention. Disease is spreading moderately.",
      severe:
        "Warning! Severe infection levels detected. Immediate action required.",
      viewDetails: "View Full Disease Details",
      plantSeverity: "Leaf Disease Infection Status",
      severityAnalysis: "Current Severity Level",
      infectionLevel: "Infection Level",
      nextSteps: "Next Steps",
      viewDiseaseInfo: "View Disease Information",
      recommendations: "Recommendations",
      takeAction: "Take Action",
      monitoring: "Monitoring",
      severityLevel: "Severity Level",
      healthy: "Healthy",
      lowRisk: "Low Risk",
      mediumRisk: "Medium Risk",
      highRisk: "High Risk",

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
      organicOptions: "Organic Solutions",
      chemicalOptions: "Chemical Solutions",
      recommendedForSeverity: "Solutions for Severity Level",
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
      severityLowPrefix: "For Low Infection",
      severityMediumPrefix: "For Moderate Infection",
      severityHighPrefix: "For High Infection",
    },
  };

  const getSeverityUI = (label: string) => {
    const l = label.toLowerCase();

    if (l.includes("low") || l.includes("mild")) {
      return {
        level: "low",
        color: "#10B981", // green
      };
    }

    if (l.includes("moderate") || l.includes("medium")) {
      return {
        level: "medium",
        color: "#F59E0B", // yellow
      };
    }

    return {
      level: "high",
      color: "#EF4444", // red
    };
  };

  const severityUI = getSeverityUI(severity_label);

  const displaySeverityLabel =
    language === "si"
      ? severityUI.level === "low"
        ? content.si.lowRisk
        : severityUI.level === "medium"
        ? content.si.mediumRisk
        : content.si.highRisk
      : severity_label;

  const statusText =
    severityUI.level === "low"
      ? content[language].mild
      : severityUI.level === "medium"
      ? content[language].moderate
      : content[language].severe;

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

  const getTreatmentsForDisease = (): {
    chemical: SriLankanTreatment[];
    organic: SriLankanTreatment[];
  } => {
    const splitByType = (list: SriLankanTreatment[]) => ({
      chemical: list.filter((t) => t.type === "chemical"),
      organic: list.filter((t) => t.type === "organic"),
    });

    // 1️⃣ No prediction
    if (!primaryPrediction) {
      return splitByType(generalTreatments);
    }

    const formattedName = formatDiseaseName(
      primaryPrediction.class_name
    ).toLowerCase();

    const normalize = (s: string) =>
      s.toLowerCase().replace(/_/g, " ").replace(/\s+/g, " ").trim();

    const normalizedName = normalize(primaryPrediction.class_name);

    const matchedKey = Object.keys(sriLankanTreatments).find(
      (key) => normalize(key) === normalizedName
    );

    // 2️⃣ Disease-specific treatments
    if (matchedKey) {
      return splitByType(sriLankanTreatments[matchedKey]);
    }

    // 3️⃣ Fallback
    return splitByType(generalTreatments);
  };

  const filterBySeverity = (list: SriLankanTreatment[]) => {
    return list.filter((t) => {
      const id = t.id.toLowerCase();

      // LOW → allow low + generic
      if (severityUI.level === "low") {
        return (
          id.includes("_low") ||
          (!id.includes("_medium") && !id.includes("_high"))
        );
      }

      // MEDIUM → allow medium + generic
      if (severityUI.level === "medium") {
        return (
          id.includes("_medium") ||
          (!id.includes("_low") && !id.includes("_high"))
        );
      }

      // HIGH → allow high only
      if (severityUI.level === "high") {
        return id.includes("_high");
      }

      return true;
    });
  };

  const { chemical, organic } = getTreatmentsForDisease();

  const chemicalTreatments = filterBySeverity(chemical);
  const organicTreatments =
    severityUI.level === "high"
      ? organic.slice(0, 1) // show only 1 supportive organic
      : filterBySeverity(organic);

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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#10ad79ff" />

      {/* Enhanced Header */}
      <LinearGradient
        colors={["#10ad79ff", "#0f9d6b"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {content[language].plantSeverity}
          </Text>
        </View>

        <TouchableOpacity style={styles.headerIcon} activeOpacity={0.7}>
          <Shield size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

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
              <View style={styles.imageOverlay}></View>
            </View>
          </View>
        )}

        {/* Disease Severity Card */}
        <View style={styles.diseaseCard}>
          <View style={styles.diseaseHeader}>
            <Bug size={24} color="#059669" />
            <View style={styles.diseaseHeaderContent}>
             <Text style={styles.diseaseTitle}>
  {(language === "si" ? diseaseNameSi : diseaseNameEn) || diseaseName}{" "}
  {content[language].forDisease}
</Text>

              <Text style={styles.diseaseSubtitle}>
                {content[language].effectiveAgainst}: {diseaseType}
              </Text>
            </View>
          </View>
        </View>

        {/* Severity Analysis Card */}
        <View
          style={[
            styles.severityCard,
            {
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: "#F1F5F9",
              marginTop: 16,
              shadowColor: severityUI.color + "30",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 3,
            },
          ]}
        >
          <View style={styles.severityHeader}>
            <Shield size={24} color="#059669" />
            <Text style={styles.severityTitle}>
              {content[language].severityAnalysis}
            </Text>
          </View>

          {/* Header */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: "#334155",
                letterSpacing: 0.3,
                marginBottom: 4,
              }}
            ></Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            {/* Left Column - Severity Level */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: "#64748B",
                  marginBottom: 10,
                  letterSpacing: 0.2,
                }}
              >
                {content[language].severityLevel}
              </Text>

              <View
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: severityUI.color + "15",
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: severityUI.color + "30",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: severityUI.color,
                  }}
                />
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: severityUI.color,
                    letterSpacing: 0.3,
                  }}
                >
                  {displaySeverityLabel}
                </Text>
              </View>
            </View>

            {/* Right Column - Damage Percentage */}
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text
                style={{
                  fontSize: 14,
                  color: "#64748B",
                  marginBottom: 8,
                  letterSpacing: 0.2,
                }}
              >
                {language === "si"
                  ? "පත්‍රයෙන් හානි වී ඇති ප්‍රතිශතය"
                  : "Leaf Area Affected"}
              </Text>

              <View
                style={{
                  alignItems: "center",
                  flexDirection: "row",
                  gap: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 36,
                    fontWeight: "800",
                    color: severityUI.color,
                    letterSpacing: -0.5,
                    lineHeight: 40,
                  }}
                >
                  {Math.round(severity_score * 100)}
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: severityUI.color + "90",
                    marginBottom: 6,
                  }}
                >
                  %
                </Text>
              </View>

              {/* Progress Indicator */}
              <View
                style={{
                  width: 120,
                  height: 6,
                  backgroundColor: "#E2E8F0",
                  borderRadius: 3,
                  marginTop: 8,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    width: `${Math.round(severity_score * 100)}%`,
                    height: "100%",
                    backgroundColor: severityUI.color,
                    borderRadius: 3,
                  }}
                />
              </View>
            </View>
          </View>

          {/* Gauge - Modern Design */}
          <View style={{ marginTop: 24, marginBottom: 20 }}>
            <SeverityGauge severity={severity_score} />
          </View>

          {/* Status Description */}
          <View
            style={{
              marginTop: 20,
              paddingTop: 16,
              borderTopWidth: 1,
              borderTopColor: "#F1F5F9",
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <View
              style={{
                backgroundColor: severityUI.color + "15",
                padding: 10,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: severityUI.color + "30",
                marginTop: 2,
              }}
            >
              {severityUI.level === "low" ? (
                <CheckCircle size={20} color={severityUI.color} />
              ) : severityUI.level === "medium" ? (
                <AlertTriangle size={20} color={severityUI.color} />
              ) : (
                <AlertCircle size={20} color={severityUI.color} />
              )}
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 13,
                color: "#475569",
                lineHeight: 18,
              }}
            >
              {statusText}
            </Text>
          </View>
        </View>

        {/* Chemical Treatments Card */}
        {chemicalTreatments.length > 0 && (
          <View style={styles.treatmentCard}>
            <View style={styles.treatmentHeader}>
              <Pill size={24} color="#DC2626" />
              <View style={styles.treatmentHeaderContent}>
                <Text style={styles.treatmentTitle}>
                  {severityUI.level === "low"
                    ? content[language].severityLowPrefix
                    : severityUI.level === "medium"
                    ? content[language].severityMediumPrefix
                    : content[language].severityHighPrefix}{" "}
                  {content[language].chemicalOptions}
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

                  {/* Schedule - FIXED FOR MOBILE */}
                  <View style={styles.scheduleInfo}>
                    <View style={styles.scheduleRow}>
                      <View style={styles.scheduleColumn}>
                        <View style={styles.scheduleItemSmall}>
                          <Clock size={14} color="#DC2626" />
                          <Text
                            style={[styles.scheduleLabel, styles.chemicalText]}
                          >
                            {content[language].frequency}:
                          </Text>
                        </View>
                        <Text
                          style={[styles.scheduleValue, styles.chemicalText]}
                        >
                          {treatment.schedule.frequency}
                        </Text>
                      </View>

                      <View style={styles.scheduleColumn}>
                        <View style={styles.scheduleItemSmall}>
                          <Calendar size={14} color="#DC2626" />
                          <Text
                            style={[styles.scheduleLabel, styles.chemicalText]}
                          >
                            {content[language].duration}:
                          </Text>
                        </View>
                        <Text
                          style={[styles.scheduleValue, styles.chemicalText]}
                        >
                          {treatment.schedule.duration}
                        </Text>
                      </View>

                      <View style={styles.scheduleColumn}>
                        <View style={styles.scheduleItemSmall}>
                          <Sun size={14} color="#DC2626" />
                          <Text
                            style={[styles.scheduleLabel, styles.chemicalText]}
                          >
                            {content[language].bestTime}:
                          </Text>
                        </View>
                        <Text
                          style={[styles.scheduleValue, styles.chemicalText]}
                        >
                          {treatment.schedule.bestTime}
                        </Text>
                      </View>
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
                  <View style={styles.availabilityWrapper}>
                    {/* WHERE TO BUY */}
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

                    {/* COST */}
                    <View style={styles.costContainer}>
                      <Text
                        style={[styles.costLabel, styles.chemicalCostLabel]}
                      >
                        {content[language].costEstimate}
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
                  {severityUI.level === "low"
                    ? content[language].severityLowPrefix
                    : severityUI.level === "medium"
                    ? content[language].severityMediumPrefix
                    : content[language].severityHighPrefix}{" "}
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
                  {/* Schedule - FIXED FOR MOBILE */}
                  <View style={styles.scheduleInfo}>
                    <View style={styles.scheduleRow}>
                      <View style={styles.scheduleColumn}>
                        <View style={styles.scheduleItemSmall}>
                          <Clock size={14} color="#059669" />
                          <Text
                            style={[styles.scheduleLabel, styles.organicText]}
                          >
                            {content[language].frequency}:
                          </Text>
                        </View>
                        <Text
                          style={[styles.scheduleValue, styles.organicText]}
                        >
                          {treatment.schedule.frequency}
                        </Text>
                      </View>

                      <View style={styles.scheduleColumn}>
                        <View style={styles.scheduleItemSmall}>
                          <Calendar size={14} color="#059669" />
                          <Text
                            style={[styles.scheduleLabel, styles.organicText]}
                          >
                            {content[language].duration}:
                          </Text>
                        </View>
                        <Text
                          style={[styles.scheduleValue, styles.organicText]}
                        >
                          {treatment.schedule.duration}
                        </Text>
                      </View>

                      <View style={styles.scheduleColumn}>
                        <View style={styles.scheduleItemSmall}>
                          <Sun size={14} color="#059669" />
                          <Text
                            style={[styles.scheduleLabel, styles.organicText]}
                          >
                            {content[language].bestTime}:
                          </Text>
                        </View>
                        <Text
                          style={[styles.scheduleValue, styles.organicText]}
                        >
                          {treatment.schedule.bestTime}
                        </Text>
                      </View>
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
                  <View style={styles.availabilityWrapper}>
                    {/* WHERE TO BUY */}
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

                    {/* COST */}
                    <View style={styles.costContainer}>
                      <Text style={[styles.costLabel, styles.organicCostLabel]}>
                        {content[language].costEstimate}
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
                  ? "ඉහත කාලසටහනට අනුව ස්ප්‍රේ කිරිමේ කිරීම ආරම්භ කරන්න"
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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    alignItems: "center",
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  headerSubtitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#D1FAE5",
    fontWeight: "500",
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
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
  severityLevelIconWrap: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
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
  availabilityText: {
    fontSize: 12,
    color: "#4B5563",
    marginBottom: 2,
    lineHeight: 16,
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
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  scheduleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  scheduleColumn: {
    flex: 1,
    minWidth: 100, // Ensures good mobile layout
    marginBottom: 8,
  },
  scheduleItemSmall: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  scheduleLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4B5563",
  },
  scheduleValue: {
    fontSize: 12,
    color: "#4B5563",
    marginLeft: 20, // Align with icon
  },
  chemicalText: {
    color: "#991B1B",
  },
  organicText: {
    color: "#047857",
  },

  scheduleText: {
    fontSize: 12,
    color: "#4B5563",
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
    flexWrap: "wrap",
    gap: 16,
    marginTop: 8,
  },
  availabilityWrapper: {
    flexDirection: "column", // 🔑 STACK vertically
    gap: 12,
    marginTop: 12,
  },

  availabilityColumn: {
    width: "100%",
  },

  costContainer: {
    width: "100%",
    backgroundColor: "#F0FDF4",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    alignItems: "center",
  },

  costLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
    textAlign: "center",
  },

  costValue: {
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },

  costContent: {
    flexDirection: "column",
    alignItems: "center",
  },
  chemicalCostLabel: {
    color: "#991B1B",
  },
  organicCostLabel: {
    color: "#047857",
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
