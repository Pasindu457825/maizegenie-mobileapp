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
  Package,
  AlertTriangle,
  Calendar,
  DollarSign,
  Info,
  TrendingUp,
  Droplets,
  CheckCircle,
  XCircle,
  Leaf,
  AlertCircle,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

type Language = "si" | "en";

const content = {
  si: {
    title: "නිලධාරී විශ්ලේෂණ ප්‍රතිඵල",
    subtitle: "විස්තරාත්මක නිර්දේශ",
    fieldDetails: "ක්ෂේත්‍ර විස්තර",
    growthStage: "වර්ධන අවධිය",
    soilType: "පස වර්ගය",
    fieldSize: "ඉඩමේ ප්‍රමාණය",
    applyToday: "අද යෙදීම",
    canApply: "සුදුසුයි",
    cannotApply: "නිර්දේශ නොකරයි",
    observation: "නිරීක්ෂණය",
    cause: "හේතුව",
    reasoning: "තර්කනය",
    recommendations: "පොහොර නිර්දේශ",
    warnings: "අවවාද",
    soilAdjustment: "පස අනුකූලතා",
    adjustment: "අනුකූලතාව",
    risk: "අවදානම",
    applicationSchedule: "යෙදීමේ කාලසටහන",
    day: "දිනය",
    activity: "ක්‍රියාකාරකම",
    fertilizer: "පොහොර",
    amount: "ප්‍රමාණය",
    costAnalysis: "පිරිවැය විශ්ලේෂණය",
    totalCost: "මුළු පිරිවැය",
    breakdown: "බිඳවැටීම",
    advice: "උපදේශ",
    newAnalysis: "නව විශ්ලේෂණයක්",
    priority: "ප්‍රමුඛතාවය",
    timing: "කාලය",
    npkRatio: "NPK අනුපාතය",
    costEstimate: "පිරිවැය ඇස්තමේන්තුව",
  },
  en: {
    title: "Officer Analysis Results",
    subtitle: "Detailed Recommendations",
    fieldDetails: "Field Details",
    growthStage: "Growth Stage",
    soilType: "Soil Type",
    fieldSize: "Field Size",
    applyToday: "Apply Today",
    canApply: "Safe to Apply",
    cannotApply: "Not Recommended",
    observation: "Observation",
    cause: "Cause",
    reasoning: "Reasoning",
    recommendations: "Fertilizer Recommendations",
    warnings: "Warnings",
    soilAdjustment: "Soil Adjustment",
    adjustment: "Adjustment",
    risk: "Risk",
    applicationSchedule: "Application Schedule",
    day: "Day",
    activity: "Activity",
    fertilizer: "Fertilizer",
    amount: "Amount",
    costAnalysis: "Cost Analysis",
    totalCost: "Total Cost",
    breakdown: "Breakdown",
    advice: "Advice",
    newAnalysis: "New Analysis",
    priority: "Priority",
    timing: "Timing",
    npkRatio: "NPK Ratio",
    costEstimate: "Cost Estimate",
  },
};

export default function OfficerAdvisoryResultsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { data, language: lang } = route.params;

  const [language, setLanguage] = React.useState<Language>(lang || "en");
  const t = content[language];

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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
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
            <Text style={styles.langText}>{language === "si" ? "EN" : "සිං"}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Field Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <Leaf color="#10b981" size={20} />
            <Text style={styles.detailsTitle}>{t.fieldDetails}</Text>
          </View>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>{t.growthStage}:</Text>
              <Text style={styles.detailValue}>{data.growth_stage}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>{t.soilType}:</Text>
              <Text style={styles.detailValue}>{data.soil_type}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>{t.fieldSize}:</Text>
              <Text style={styles.detailValue}>{data.field_size} acres</Text>
            </View>
          </View>
        </View>

        {/* Apply Today Status */}
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

        {/* Reasoning Sections */}
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

        {/* Recommendations */}
        {data.recommendations && data.recommendations.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Package color="#10B981" size={20} />
              <Text style={styles.sectionTitle}>{t.recommendations}</Text>
            </View>

            {data.recommendations.map((rec: any, index: number) => (
              <View key={index} style={styles.recommendationCard}>
                <View style={styles.recHeader}>
                  <Text style={styles.recFertilizer}>{rec.fertilizer}</Text>
                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: getPriorityColor(rec.priority) },
                    ]}
                  >
                    <Text style={styles.priorityText}>{rec.priority.toUpperCase()}</Text>
                  </View>
                </View>

                <View style={styles.recDetails}>
                  <View style={styles.recRow}>
                    <Text style={styles.recLabel}>{t.npkRatio}:</Text>
                    <Text style={styles.recValue}>{rec.npk}</Text>
                  </View>
                  <View style={styles.recRow}>
                    <Text style={styles.recLabel}>{t.amount}:</Text>
                    <Text style={styles.recValue}>{rec.amount}</Text>
                  </View>
                  {rec.amount_per_acre && (
                    <View style={styles.recRow}>
                      <Text style={styles.recLabel}>Per Acre:</Text>
                      <Text style={styles.recValue}>{rec.amount_per_acre}</Text>
                    </View>
                  )}
                  <View style={styles.recRow}>
                    <Text style={styles.recLabel}>{t.timing}:</Text>
                    <Text style={styles.recValue}>{rec.timing}</Text>
                  </View>
                  {rec.cost_estimate && (
                    <View style={styles.recRow}>
                      <Text style={styles.recLabel}>{t.costEstimate}:</Text>
                      <Text style={styles.recValueHighlight}>{rec.cost_estimate}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Soil Adjustment */}
        {data.soil_adjustment && (
          <View style={styles.soilCard}>
            <View style={styles.soilHeader}>
              <Droplets color="#3b82f6" size={20} />
              <Text style={styles.soilTitle}>{t.soilAdjustment}</Text>
            </View>
            <View style={styles.soilContent}>
              <Text style={styles.soilLabel}>{t.adjustment}:</Text>
              <Text style={styles.soilText}>{data.soil_adjustment.adjustment}</Text>
              <Text style={[styles.soilLabel, { marginTop: 8 }]}>{t.risk}:</Text>
              <Text style={styles.soilRisk}>{data.soil_adjustment.risk}</Text>
            </View>
          </View>
        )}

        {/* Warnings */}
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

        {/* Application Schedule */}
        {data.application_schedule && data.application_schedule.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Calendar color="#8b5cf6" size={20} />
              <Text style={styles.sectionTitle}>{t.applicationSchedule}</Text>
            </View>

            {data.application_schedule.map((item: any, index: number) => (
              <View key={index} style={styles.scheduleCard}>
                <View style={styles.scheduleDay}>
                  <Text style={styles.scheduleDayText}>{item.day}</Text>
                </View>
                <View style={styles.scheduleContent}>
                  <Text style={styles.scheduleActivity}>{item.activity}</Text>
                  <Text style={styles.scheduleFertilizer}>
                    {item.fertilizer} - {item.amount}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Cost Analysis */}
        {data.cost_analysis && (
          <View style={styles.costCard}>
            <View style={styles.costHeader}>
              <DollarSign color="#10b981" size={20} />
              <Text style={styles.costTitle}>{t.costAnalysis}</Text>
            </View>
            <View style={styles.costTotal}>
              <Text style={styles.costTotalLabel}>{t.totalCost}:</Text>
              <Text style={styles.costTotalValue}>{data.cost_analysis.total_estimated_cost}</Text>
            </View>
            {data.cost_analysis.breakdown && data.cost_analysis.breakdown.length > 0 && (
              <View style={styles.costBreakdown}>
                <Text style={styles.costBreakdownTitle}>{t.breakdown}:</Text>
                {data.cost_analysis.breakdown.map((item: any, index: number) => (
                  <View key={index} style={styles.costBreakdownItem}>
                    <Text style={styles.costBreakdownLabel}>{item.item}</Text>
                    <Text style={styles.costBreakdownValue}>{item.cost}</Text>
                  </View>
                ))}
              </View>
            )}
            {data.cost_analysis.note && (
              <Text style={styles.costNote}>{data.cost_analysis.note}</Text>
            )}
          </View>
        )}

        {/* Advice */}
        {data.advice && (
          <View style={styles.adviceCard}>
            <View style={styles.adviceHeader}>
              <Info color="#3b82f6" size={20} />
              <Text style={styles.adviceTitle}>{t.advice}</Text>
            </View>
            <Text style={styles.adviceText}>{data.advice}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.newAnalysisButton} onPress={() => navigation.goBack()}>
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
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  langText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  detailsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginLeft: 8,
  },
  detailsGrid: {
    gap: 8,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  applyCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
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
    marginLeft: 12,
    flex: 1,
  },
  applyTitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 2,
  },
  applyText: {
    fontSize: 16,
    fontWeight: "700",
  },
  applyTextGreen: {
    color: "#059669",
  },
  applyTextRed: {
    color: "#DC2626",
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
  section: {
    marginBottom: 20,
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
  recommendationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#10b981",
  },
  recHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  recFertilizer: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  recDetails: {
    gap: 8,
  },
  recRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recLabel: {
    fontSize: 13,
    color: "#6B7280",
  },
  recValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  recValueHighlight: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10b981",
  },
  soilCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  soilHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  soilTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E40AF",
    marginLeft: 8,
  },
  soilContent: {
    gap: 4,
  },
  soilLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E40AF",
  },
  soilText: {
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 20,
  },
  soilRisk: {
    fontSize: 14,
    color: "#DC2626",
    fontWeight: "600",
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
  scheduleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  scheduleDay: {
    backgroundColor: "#8b5cf6",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  scheduleDayText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleActivity: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  scheduleFertilizer: {
    fontSize: 13,
    color: "#6B7280",
  },
  costCard: {
    backgroundColor: "#ECFDF5",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  costHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  costTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#065F46",
    marginLeft: 8,
  },
  costTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#A7F3D0",
    marginBottom: 12,
  },
  costTotalLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#065F46",
  },
  costTotalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#059669",
  },
  costBreakdown: {
    marginBottom: 12,
  },
  costBreakdownTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#065F46",
    marginBottom: 8,
  },
  costBreakdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  costBreakdownLabel: {
    fontSize: 13,
    color: "#047857",
  },
  costBreakdownValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#065F46",
  },
  costNote: {
    fontSize: 11,
    color: "#6B7280",
    fontStyle: "italic",
  },
  adviceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  adviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  adviceTitle: {
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
