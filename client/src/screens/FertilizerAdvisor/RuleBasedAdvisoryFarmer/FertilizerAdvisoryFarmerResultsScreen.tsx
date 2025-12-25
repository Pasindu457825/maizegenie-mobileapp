import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useLanguage } from "../../../context/LanguageContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Leaf,
  TrendingUp,
  Info,
  Package,
  MessageCircle,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

type Language = "si" | "en";

const content = {
  si: {
    title: "පොහොර උපදේශ",
    subtitle: "විශ්ලේෂණ ප්‍රතිඵල",
    observation: "නිරීක්ෂණය",
    cause: "හේතුව",
    reasoning: "විශ්ලේෂණය",
    advice: "උපදේශ",
    recommendations: "නිර්දේශිත පොහොර",
    warnings: "අවවාද",
    applyToday: "අද යෙදීම",
    canApply: "අද පොහොර යෙදීම සුදුසුයි",
    cannotApply: "අද පොහොර යෙදීම නිර්දේශ නොකරයි",
    detectedIssues: "හඳුනාගත් කරුණු",
    fertilizer: "පොහොර",
    amount: "ප්‍රමාණය",
    timing: "කාලය",
    priority: "ප්‍රමුඛතාවය",
    high: "ඉහළ",
    medium: "මධ්‍යම",
    low: "අඩු",
    newAnalysis: "නව විශ්ලේෂණයක්",
    yourInput: "ඔබේ ආදානය",
    officialSource: "මූලාශ්‍ර ආධාරකය: DOA/CIC (Rule-Based)",
    contactOfficer: "කෘෂිකර්ම නිලධාරියෙකුගෙන් උපදෙස් ලබා ගන්න",
    contactOfficerDesc: "ඔබේ ප්‍රතිඵල සහ තොරතුරු නිලධාරියෙකු සමඟ බෙදා ගන්න",
  },
  en: {
    title: "Fertilizer Advisory",
    subtitle: "Analysis Results",
    observation: "Observation",
    cause: "Cause",
    reasoning: "Analysis",
    advice: "Advice",
    recommendations: "Recommended Fertilizers",
    warnings: "Warnings",
    applyToday: "Apply Today",
    canApply: "Safe to apply fertilizer today",
    cannotApply: "Not recommended to apply fertilizer today",
    detectedIssues: "Detected Items",
    fertilizer: "Fertilizer",
    amount: "Amount",
    timing: "Timing",
    priority: "Priority",
    high: "High",
    medium: "Medium",
    low: "Low",
    newAnalysis: "New Analysis",
    yourInput: "Your Input",
    officialSource: "Reference: DOA/CIC (Rule-Based)",
    contactOfficer: "Get Advice from Agricultural Officer",
    contactOfficerDesc: "Share your results and get personalized guidance",
  },
};

export default function RuleBasedAdvisoryResultsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();

  const { data, language: lang } = route.params as {
    data: any;
    language: Language;
  };

  const { language: contextLang } = useLanguage();
  const language: Language = contextLang === "sinhala" ? "si" : "en";
  const t = content[language];

  const canApplyToday = data.apply_today === true;

  const handleContactOfficer = () => {
    // Prepare context message to share with officer
    const contextMessage = language === "si"
      ? `🌾 පොහොර උපදේශ ප්‍රතිඵල\n\n📝 මගේ ආදානය:\n${data.farmer_input || data.input_text}\n\n💡 ලැබුණු නිර්දේශ:\n${data.advice}\n\n⚠️ අවවාද: ${data.warnings?.length || 0}\n✅ අද යෙදීම: ${canApplyToday ? "සුදුසුයි" : "නිර්දේශ නොකරයි"}\n\nකරුණාකර මට වැඩිදුර උපදෙස් දෙන්න.`
      : `🌾 Fertilizer Advisory Results\n\n📝 My Input:\n${data.farmer_input || data.input_text}\n\n💡 Recommendations Received:\n${data.advice}\n\n⚠️ Warnings: ${data.warnings?.length || 0}\n✅ Apply Today: ${canApplyToday ? "Yes" : "No"}\n\nPlease provide me with further guidance.`;

    // Navigate to Agricultural Advisory Chat screen with pre-filled message
    navigation.navigate("AgriculturalAdvisoryChat", {
      prefilledMessage: contextMessage,
      context: "fertilizer_advisory",
      advisoryType: "fertilizer",
      advisoryData: {
        input: data.farmer_input || data.input_text,
        recommendations: data.recommendations,
        warnings: data.warnings,
        apply_today: canApplyToday,
        language: language,
      },
    });
  };

  const getPriorityColor = (priority: string) => {
    const p = (priority || "").toLowerCase();
    if (p === "high") return "#EF4444";
    if (p === "medium") return "#F59E0B";
    if (p === "low") return "#10B981";
    return "#6B7280";
  };

  const getSeverityColor = (severity: string) => {
    const s = (severity || "").toLowerCase();
    if (s === "high") return "#EF4444";
    if (s === "medium") return "#F59E0B";
    if (s === "low") return "#3B82F6";
    return "#6B7280";
  };

  const priorityLabel = (p: string) => {
    const v = (p || "").toLowerCase();
    if (v === "high") return t.high;
    if (v === "medium") return t.medium;
    if (v === "low") return t.low;
    return p;
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
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Farmer Input */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>{t.yourInput}</Text>
          <Text style={styles.inputText}>{data.farmer_input || data.input_text}</Text>
        </View>

        {/* Apply Today */}
        <View style={[styles.applyCard, canApplyToday ? styles.applyCardGreen : styles.applyCardRed]}>
          {canApplyToday ? <CheckCircle color="#10B981" size={24} /> : <XCircle color="#EF4444" size={24} />}
          <View style={styles.applyTextContainer}>
            <Text style={styles.applyTitle}>{t.applyToday}</Text>
            <Text style={[styles.applyText, canApplyToday ? styles.applyTextGreen : styles.applyTextRed]}>
              {canApplyToday ? t.canApply : t.cannotApply}
            </Text>
          </View>
        </View>

        {/* WHY sections */}
        {data.observation ? (
          <View style={[styles.reasoningCard, { borderLeftColor: "#3b82f6" }]}>
            <View style={styles.reasoningHeader}>
              <AlertCircle color="#3b82f6" size={20} />
              <Text style={styles.reasoningTitle}>{t.observation}</Text>
            </View>
            <Text style={styles.reasoningText}>{data.observation}</Text>
          </View>
        ) : null}

        {data.cause ? (
          <View style={[styles.reasoningCard, { borderLeftColor: "#f59e0b" }]}>
            <View style={styles.reasoningHeader}>
              <Info color="#f59e0b" size={20} />
              <Text style={styles.reasoningTitle}>{t.cause}</Text>
            </View>
            <Text style={styles.reasoningText}>{data.cause}</Text>
          </View>
        ) : null}

        {data.reasoning ? (
          <View style={[styles.reasoningCard, { borderLeftColor: "#8b5cf6" }]}>
            <View style={styles.reasoningHeader}>
              <TrendingUp color="#8b5cf6" size={20} />
              <Text style={styles.reasoningTitle}>{t.reasoning}</Text>
            </View>
            <Text style={styles.reasoningText}>{data.reasoning}</Text>
          </View>
        ) : null}

        {/* Advice */}
        <View style={styles.adviceCard}>
          <View style={styles.sectionHeader}>
            <Leaf color="#10B981" size={20} />
            <Text style={styles.sectionTitle}>{t.advice}</Text>
          </View>
          <Text style={styles.adviceText}>{data.advice}</Text>
        </View>

        {/* Backend Recommendations */}
        {canApplyToday &&
          Array.isArray(data.recommendations) &&
          data.recommendations.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Package color="#10B981" size={20} />
              <Text style={styles.sectionTitle}>{t.recommendations}</Text>
            </View>

            {data.recommendations.map((rec: any, index: number) => (
            <View key={index} style={styles.recommendationCard}>
              <View style={styles.recommendationHeader}>
                <Text style={styles.recName}>{rec.fertilizer}</Text>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(rec.priority) }]}>
                  <Text style={styles.priorityText}>{priorityLabel(rec.priority)}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t.amount}</Text>
                <Text style={styles.detailValue}>{rec.amount}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t.timing}</Text>
                <Text style={styles.detailValue}>{rec.timing}</Text>
              </View>

              {rec.reason ? <Text style={styles.reasonLine}>{rec.reason}</Text> : null}
            </View>
            ))}
          </View>
        ) : null}

        {/* Warnings */}
        {Array.isArray(data.warnings) && data.warnings.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AlertTriangle color="#F59E0B" size={20} />
              <Text style={styles.sectionTitle}>{t.warnings}</Text>
            </View>

            {data.warnings.map((warning: any, index: number) => (
              <View key={index} style={[styles.warningCard, { borderLeftColor: getSeverityColor(warning.severity) }]}>
                <Text style={styles.warningText}>
                  {language === "si" ? warning.message_si : warning.message_en}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Detected issues (from backend, not from knowledge base) */}
        {/* {Array.isArray(data.detected_issues) && data.detected_issues.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.issuesTitle}>{t.detectedIssues}</Text>
            <View style={styles.issuesContainer}>
              {data.detected_issues.map((it: string, idx: number) => (
                <View key={idx} style={styles.issueChip}>
                  <AlertTriangle color="#DC2626" size={14} />
                  <Text style={styles.issueText}>{it}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null} */}

        {/* Source badge */}
        <View style={styles.sourceCard}>
          <Info color="#3b82f6" size={16} />
          <Text style={styles.sourceText}>{t.officialSource}</Text>
        </View>

        <TouchableOpacity style={styles.contactOfficerButton} onPress={handleContactOfficer}>
          <LinearGradient
            colors={["#3b82f6", "#2563eb"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.contactOfficerGradient}
          >
            <MessageCircle color="#ffffff" size={20} />
            <View style={styles.contactOfficerTextContainer}>
              <Text style={styles.contactOfficerButtonText}>{t.contactOfficer}</Text>
              <Text style={styles.contactOfficerButtonDesc}>{t.contactOfficerDesc}</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.newAnalysisButton} onPress={() => navigation.goBack()}>
          <Text style={styles.newAnalysisButtonText}>{t.newAnalysis}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: { flexDirection: "row", alignItems: "center" },
  backButton: { marginRight: 12 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#ffffff", marginBottom: 2 },
  headerSubtitle: { fontSize: 13, color: "#D1FAE5" },
  langButton: { backgroundColor: "rgba(255, 255, 255, 0.2)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  langText: { color: "#ffffff", fontSize: 14, fontWeight: "600" },

  scrollContainer: { flex: 1 },
  scrollContent: { padding: 16 },

  inputCard: { backgroundColor: "#F3F4F6", borderRadius: 12, padding: 16, marginBottom: 16 },
  inputLabel: { fontSize: 12, fontWeight: "600", color: "#6B7280", marginBottom: 8 },
  inputText: { fontSize: 14, color: "#1F2937", lineHeight: 20 },

  applyCard: { borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", marginBottom: 16, borderWidth: 2 },
  applyCardGreen: { backgroundColor: "#ECFDF5", borderColor: "#A7F3D0" },
  applyCardRed: { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
  applyTextContainer: { flex: 1, marginLeft: 12 },
  applyTitle: { fontSize: 12, fontWeight: "600", color: "#6B7280", marginBottom: 2 },
  applyText: { fontSize: 15, fontWeight: "700" },
  applyTextGreen: { color: "#059669" },
  applyTextRed: { color: "#DC2626" },

  adviceCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#E5E7EB" },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1F2937", marginLeft: 8 },
  adviceText: { fontSize: 14, color: "#374151", lineHeight: 22 },

  section: { marginBottom: 16 },

  recommendationCard: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  recommendationHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  recName: { fontSize: 15, fontWeight: "800", color: "#111827", flex: 1, paddingRight: 10 },
  priorityBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  priorityText: { fontSize: 11, fontWeight: "800", color: "#FFFFFF" },
  detailRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  detailLabel: { fontSize: 13, color: "#6B7280" },
  detailValue: { fontSize: 13, fontWeight: "700", color: "#111827" },
  reasonLine: { marginTop: 6, fontSize: 13, color: "#374151", lineHeight: 18 },

  warningCard: { backgroundColor: "#FFFBEB", borderRadius: 12, padding: 16, marginBottom: 12, borderLeftWidth: 4 },
  warningText: { fontSize: 14, color: "#92400E", lineHeight: 20 },

  issuesTitle: { fontSize: 14, fontWeight: "600", color: "#6B7280", marginBottom: 12 },
  issuesContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
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
  issueText: { fontSize: 13, color: "#991B1B", fontWeight: "700" },

  reasoningCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderLeftWidth: 4,
  },
  reasoningHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  reasoningTitle: { fontSize: 15, fontWeight: "700", color: "#1F2937", marginLeft: 8 },
  reasoningText: { fontSize: 14, color: "#374151", lineHeight: 22 },

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
  sourceText: { fontSize: 12, color: "#1E40AF", fontWeight: "700", marginLeft: 8 },

  contactOfficerButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  contactOfficerGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  contactOfficerTextContainer: { flex: 1 },
  contactOfficerButtonText: { fontSize: 16, fontWeight: "700", color: "#ffffff", marginBottom: 2 },
  contactOfficerButtonDesc: { fontSize: 12, color: "#DBEAFE" },

  newAnalysisButton: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 16, alignItems: "center", borderWidth: 2, borderColor: "#10B981" },
  newAnalysisButtonText: { fontSize: 16, fontWeight: "700", color: "#10B981" },
});
