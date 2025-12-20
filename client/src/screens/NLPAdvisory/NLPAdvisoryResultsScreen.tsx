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
  Leaf,
  Calendar,
  TrendingUp,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

type Language = "si" | "en";

const content = {
  si: {
    title: "පොහොර උපදේශ",
    subtitle: "විශ්ලේෂණ ප්‍රතිඵල",
    advice: "උපදේශ",
    recommendations: "නිර්දේශ",
    warnings: "අවවාද",
    applyToday: "අද යෙදීම",
    canApply: "අද පොහොර යෙදීම සුදුසුයි",
    cannotApply: "අද පොහොර යෙදීම නිර්දේශ නොකරයි",
    detectedIssues: "හඳුනාගත් ගැටළු",
    fertilizer: "පොහොර",
    amount: "ප්‍රමාණය",
    timing: "කාලය",
    priority: "ප්‍රමුඛතාවය",
    high: "ඉහළ",
    medium: "මධ්‍යම",
    low: "අඩු",
    newAnalysis: "නව විශ්ලේෂණයක්",
    yourInput: "ඔබේ ආදානය",
  },
  en: {
    title: "Fertilizer Advisory",
    subtitle: "Analysis Results",
    advice: "Advice",
    recommendations: "Recommendations",
    warnings: "Warnings",
    applyToday: "Apply Today",
    canApply: "Safe to apply fertilizer today",
    cannotApply: "Not recommended to apply fertilizer today",
    detectedIssues: "Detected Issues",
    fertilizer: "Fertilizer",
    amount: "Amount",
    timing: "Timing",
    priority: "Priority",
    high: "High",
    medium: "Medium",
    low: "Low",
    newAnalysis: "New Analysis",
    yourInput: "Your Input",
  },
};

export default function NLPAdvisoryResultsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { data, language: lang } = route.params as {
    data: any;
    language: Language;
  };

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
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>{t.yourInput}</Text>
          <Text style={styles.inputText}>{data.input_text}</Text>
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

        <View style={styles.adviceCard}>
          <View style={styles.sectionHeader}>
            <Leaf color="#10B981" size={20} />
            <Text style={styles.sectionTitle}>{t.advice}</Text>
          </View>
          <Text style={styles.adviceText}>{data.advice}</Text>
        </View>

        {data.recommendations && data.recommendations.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <TrendingUp color="#10B981" size={20} />
              <Text style={styles.sectionTitle}>{t.recommendations}</Text>
            </View>

            {data.recommendations.map((rec: any, index: number) => (
              <View key={index} style={styles.recommendationCard}>
                <View style={styles.recommendationHeader}>
                  <Text style={styles.fertilizerName}>{rec.fertilizer}</Text>
                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: getPriorityColor(rec.priority) },
                    ]}
                  >
                    <Text style={styles.priorityText}>
                      {rec.priority.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={styles.recommendationDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{t.amount}:</Text>
                    <Text style={styles.detailValue}>{rec.amount}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{t.timing}:</Text>
                    <Text style={styles.detailValue}>{rec.timing}</Text>
                  </View>
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

        {data.detected_issues && data.detected_issues.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.issuesTitle}>{t.detectedIssues}</Text>
            <View style={styles.issuesContainer}>
              {data.detected_issues.map((issue: string, index: number) => (
                <View key={index} style={styles.issueChip}>
                  <Text style={styles.issueText}>
                    {issue.replace(/_/g, " ")}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

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
  fertilizerName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
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
    backgroundColor: "#EEF2FF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  issueText: {
    fontSize: 12,
    color: "#4338CA",
    textTransform: "capitalize",
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
