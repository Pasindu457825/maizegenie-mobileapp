import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Leaf,
  Calendar,
  TrendingUp,
  Package,
  Sprout,
  CloudRain,
  Info,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { growthStages, cicFertilizers, recommendFertilizers, matchSymptoms } from "../../../data/fertilizerKnowledgeBase";

type Language = "si" | "en";

const content = {
  si: {
    title: "පොහොර උපදේශ",
    subtitle: "විශ්ලේෂණ ප්‍රතිඵල (DOA/CIC)",
    observation: "නිරීක්ෂණය",
    cause: "හේතුව",
    reasoning: "විශ්ලේෂණය",
    advice: "උපදේශ (DOA/CIC අනුව)",
    recommendations: "CIC නිර්දේශිත පොහොර",
    warnings: "අවවාද",
    applyToday: "අද යෙදීම",
    canApply: "අද පොහොර යෙදීම සුදුසුයි",
    cannotApply: "අද පොහොර යෙදීම නිර්දේශ නොකරයි",
    detectedIssues: "හඳුනාගත් පෝෂක ඌනතා",
    fertilizer: "පොහොර",
    amount: "ප්‍රමාණය",
    timing: "කාලය",
    priority: "ප්‍රමුඛතාවය",
    high: "ඉහළ",
    medium: "මධ්‍යම",
    low: "අඩු",
    newAnalysis: "නව විශ්ලේෂණයක්",
    yourInput: "ඔබේ ආදානය",
    growthStage: "වර්ධන අවධිය",
    weatherCondition: "කාලගුණ තත්ත්වය",
    benefits: "ප්‍රතිලාභ",
    applicationMethod: "යෙදීමේ ක්‍රමය",
    packSize: "ඇසුරුම් ප්‍රමාණය",
    officialSource: "නිල මූලාශ්‍රය: DOA & CIC Sri Lanka",
    npkRatio: "NPK අනුපාතය",
  },
  en: {
    title: "Fertilizer Advisory",
    subtitle: "Analysis Results (DOA/CIC)",
    observation: "Observation",
    cause: "Cause",
    reasoning: "Analysis",
    advice: "Advice (DOA/CIC)",
    recommendations: "CIC Recommended Fertilizers",
    warnings: "Warnings",
    applyToday: "Apply Today",
    canApply: "Safe to apply fertilizer today",
    cannotApply: "Not recommended to apply fertilizer today",
    detectedIssues: "Detected Nutrient Deficiencies",
    fertilizer: "Fertilizer",
    amount: "Amount",
    timing: "Timing",
    priority: "Priority",
    high: "High",
    medium: "Medium",
    low: "Low",
    newAnalysis: "New Analysis",
    yourInput: "Your Input",
    growthStage: "Growth Stage",
    weatherCondition: "Weather Condition",
    benefits: "Benefits",
    applicationMethod: "Application Method",
    packSize: "Pack Size",
    officialSource: "Official Source: DOA & CIC Sri Lanka",
    npkRatio: "NPK Ratio",
  },
};

export default function RuleBasedAdvisoryResultsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { data, language: lang } = route.params as {
    data: any;
    language: Language;
  };

  const [language, setLanguage] = React.useState<Language>(lang || "en");
  const t = content[language];

  // Get growth stage info
  const growthStageInfo = growthStages.find(s => s.id === data.growth_stage);

  // Get detected symptoms and recommended fertilizers from knowledge base
  const detectedSymptoms = data.farmer_input ? matchSymptoms(data.farmer_input) : [];
  const recommendedFertilizers = data.growth_stage 
    ? recommendFertilizers(data.growth_stage, detectedSymptoms)
    : [];

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "#EF4444";
      case "medium":
        return "#F59E0B";
      case "low":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return "#EF4444";
      case "medium":
        return "#F59E0B";
      case "low":
        return "#3B82F6";
      default:
        return "#6B7280";
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#10b981", "#059669"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft color="#ffffff" size={24} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t.title}</Text>
            <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
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
      </LinearGradient>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Growth Stage Info */}
        {growthStageInfo && (
          <View style={styles.stageCard}>
            <View style={styles.stageHeader}>
              <Sprout color="#10b981" size={20} />
              <Text style={styles.stageTitle}>{t.growthStage}</Text>
            </View>
            <Text style={styles.stageName}>
              {language === "si" ? growthStageInfo.nameSi : growthStageInfo.nameEn}
            </Text>
            <Text style={styles.stageDays}>{growthStageInfo.daysAfterPlanting}</Text>
          </View>
        )}

        {/* Farmer Input */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>{t.yourInput}</Text>
          <Text style={styles.inputText}>{data.farmer_input || data.input_text}</Text>
          {data.weather_input && (
            <>
              <Text style={[styles.inputLabel, { marginTop: 12 }]}>{t.weatherCondition}</Text>
              <Text style={styles.inputText}>{data.weather_input}</Text>
            </>
          )}
        </View>

        <View
          style={[
            styles.applyCard,
            data.apply_today ? styles.applyCardGreen : styles.applyCardRed,
          ]}
        >
          {data.apply_today ? (
            <CheckCircle color="#10B981" size={24} />
          ) : (
            <XCircle color="#EF4444" size={24} />
          )}
          <View style={styles.applyTextContainer}>
            <Text style={styles.applyTitle}>{t.applyToday}</Text>
            <Text
              style={[
                styles.applyText,
                data.apply_today ? styles.applyTextGreen : styles.applyTextRed,
              ]}
            >
              {data.apply_today ? t.canApply : t.cannotApply}
            </Text>
          </View>
        </View>

        {/* REASONING SECTION - WHY not just WHAT */}
        {data.observation && (
          <View style={styles.reasoningCard}>
            <View style={styles.reasoningHeader}>
              <AlertCircle color="#3b82f6" size={20} />
              <Text style={styles.reasoningTitle}>{t.observation}</Text>
            </View>
            <Text style={styles.reasoningText}>{data.observation}</Text>
          </View>
        )}

        {data.cause && (
          <View style={styles.reasoningCard}>
            <View style={styles.reasoningHeader}>
              <Info color="#f59e0b" size={20} />
              <Text style={styles.reasoningTitle}>{t.cause}</Text>
            </View>
            <Text style={styles.reasoningText}>{data.cause}</Text>
          </View>
        )}

        {data.reasoning && (
          <View style={styles.reasoningCard}>
            <View style={styles.reasoningHeader}>
              <TrendingUp color="#8b5cf6" size={20} />
              <Text style={styles.reasoningTitle}>{t.reasoning}</Text>
            </View>
            <Text style={styles.reasoningText}>{data.reasoning}</Text>
          </View>
        )}

        {/* ADVICE SECTION */}
        <View style={styles.adviceCard}>
          <View style={styles.sectionHeader}>
            <Leaf color="#10B981" size={20} />
            <Text style={styles.sectionTitle}>{t.advice}</Text>
          </View>
          <Text style={styles.adviceText}>{data.advice}</Text>
        </View>

        {/* CIC Recommended Fertilizers */}
        {recommendedFertilizers.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Package color="#10B981" size={20} />
              <Text style={styles.sectionTitle}>{t.recommendations}</Text>
            </View>

            {recommendedFertilizers.map((fert, index) => (
              <View key={fert.id} style={styles.fertilizerCard}>
                <View style={styles.fertilizerHeader}>
                  <Text style={styles.fertilizerName}>
                    {language === "si" ? fert.productNameSi : fert.productName}
                  </Text>
                  <View style={styles.cicBadge}>
                    <Text style={styles.cicBadgeText}>CIC</Text>
                  </View>
                </View>

                {fert.npkRatio && (
                  <View style={styles.npkRow}>
                    <Text style={styles.npkLabel}>{t.npkRatio}:</Text>
                    <Text style={styles.npkValue}>{fert.npkRatio}</Text>
                  </View>
                )}

                <View style={styles.benefitsSection}>
                  <Text style={styles.benefitsTitle}>{t.benefits}:</Text>
                  {(language === "si" ? fert.benefitsSi : fert.benefits).map((benefit, idx) => (
                    <Text key={idx} style={styles.benefitText}>• {benefit}</Text>
                  ))}
                </View>

                <View style={styles.applicationRow}>
                  <Text style={styles.applicationLabel}>{t.applicationMethod}:</Text>
                  <Text style={styles.applicationValue}>
                    {language === "si" ? fert.applicationMethodSi : fert.applicationMethod}
                  </Text>
                </View>

                <View style={styles.packSizeRow}>
                  <Text style={styles.packSizeLabel}>{t.packSize}:</Text>
                  <Text style={styles.packSizeValue}>{fert.packSizes.join(", ")}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {data.warnings && data.warnings.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AlertTriangle color="#F59E0B" size={20} />
              <Text style={styles.sectionTitle}>{t.warnings}</Text>
            </View>

            {data.warnings.map((warning: any, index: number) => (
              <View
                key={index}
                style={[
                  styles.warningCard,
                  { borderLeftColor: getSeverityColor(warning.severity) },
                ]}
              >
                <Text style={styles.warningText}>
                  {language === "si" ? warning.message_si : warning.message_en}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Detected Nutrient Deficiencies */}
        {detectedSymptoms.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.issuesTitle}>{t.detectedIssues}</Text>
            <View style={styles.issuesContainer}>
              {detectedSymptoms.map((symptom, index) => (
                <View key={index} style={styles.issueChip}>
                  <AlertTriangle color="#DC2626" size={14} />
                  <Text style={styles.issueText}>{symptom.meaning}</Text>
                  <Text style={styles.issueNutrient}>({symptom.nutrient})</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Official Source Badge */}
        <View style={styles.sourceCard}>
          <Info color="#3b82f6" size={16} />
          <Text style={styles.sourceText}>{t.officialSource}</Text>
        </View>

        <TouchableOpacity
          style={styles.newAnalysisButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.newAnalysisButtonText}>{t.newAnalysis}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 12,
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#D1FAE5",
  },
  langButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  langText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  inputCard: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
  },
  inputText: {
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 20,
  },
  applyCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
  },
  applyCardGreen: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  applyCardRed: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  applyTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  applyTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 2,
  },
  applyText: {
    fontSize: 15,
    fontWeight: "700",
  },
  applyTextGreen: {
    color: "#059669",
  },
  applyTextRed: {
    color: "#DC2626",
  },
  adviceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginLeft: 8,
  },
  adviceText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 22,
  },
  section: {
    marginBottom: 16,
  },
  recommendationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  recommendationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  recommendationDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailLabel: {
    fontSize: 13,
    color: "#6B7280",
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
  },
  warningCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  warningText: {
    fontSize: 14,
    color: "#92400E",
    lineHeight: 20,
  },
  issuesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 12,
  },
  issuesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  issueChip: {
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  issueText: {
    fontSize: 13,
    color: "#991B1B",
    fontWeight: "600",
  },
  issueNutrient: {
    fontSize: 11,
    color: "#DC2626",
  },
  stageCard: {
    backgroundColor: "#ECFDF5",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  stageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  stageTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#065F46",
    marginLeft: 8,
  },
  stageName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#047857",
    marginBottom: 4,
  },
  stageDays: {
    fontSize: 13,
    color: "#059669",
  },
  fertilizerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#10b981",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fertilizerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  fertilizerName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
  },
  cicBadge: {
    backgroundColor: "#10b981",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cicBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  npkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#F3F4F6",
    padding: 10,
    borderRadius: 8,
  },
  npkLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginRight: 8,
  },
  npkValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#059669",
  },
  benefitsSection: {
    marginBottom: 12,
  },
  benefitsTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  benefitText: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 2,
  },
  applicationRow: {
    marginBottom: 8,
  },
  applicationLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
  },
  applicationValue: {
    fontSize: 13,
    color: "#1F2937",
  },
  packSizeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  packSizeLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginRight: 8,
  },
  packSizeValue: {
    fontSize: 13,
    color: "#1F2937",
    fontWeight: "500",
  },
  sourceCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  sourceText: {
    fontSize: 12,
    color: "#1E40AF",
    fontWeight: "600",
    marginLeft: 8,
  },
  reasoningCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderLeftWidth: 4,
  },
  reasoningHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  reasoningTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginLeft: 8,
  },
  reasoningText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 22,
  },
  newAnalysisButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#10B981",
  },
  newAnalysisButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10B981",
  },
});
