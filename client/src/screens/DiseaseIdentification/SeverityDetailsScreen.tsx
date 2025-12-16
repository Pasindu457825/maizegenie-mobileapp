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
      location: "ස්ථානය",
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
      location: "Location",
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

        {/* Next Steps Card */}
        <View style={styles.nextStepsCard}>
          <View style={styles.nextStepsHeader}>
            <Info size={24} color="#059669" />
            <Text style={styles.nextStepsTitle}>
              {content[language].nextSteps}
            </Text>
          </View>

          <View style={styles.recommendations}>
            {severity_score < 0.33 ? (
              <>
                <View style={styles.recommendationItem}>
                  <View style={styles.recommendationIcon}>
                    <CheckCircle size={16} color="#10B981" />
                  </View>
                  <Text style={styles.recommendationText}>
                    {language === "si"
                      ? "සාමාන්‍ය නිරීක්ෂණ අනුගමනය කරන්න"
                      : "Continue regular monitoring"}
                  </Text>
                </View>
                <View style={styles.recommendationItem}>
                  <View style={styles.recommendationIcon}>
                    <Leaf size={16} color="#10B981" />
                  </View>
                  <Text style={styles.recommendationText}>
                    {language === "si"
                      ? "ජල සැපයුම සහ පොහොර භාවිතය පවත්වාගෙන යන්න"
                      : "Maintain regular watering and fertilization"}
                  </Text>
                </View>
              </>
            ) : severity_score < 0.66 ? (
              <>
                <View style={styles.recommendationItem}>
                  <View style={styles.recommendationIcon}>
                    <AlertTriangle size={16} color="#F59E0B" />
                  </View>
                  <Text style={styles.recommendationText}>
                    {language === "si"
                      ? "පැලය වැඩිපුර නිරීක්ෂණය කරන්න"
                      : "Increase monitoring frequency"}
                  </Text>
                </View>
                <View style={styles.recommendationItem}>
                  <View style={styles.recommendationIcon}>
                    <Shield size={16} color="#F59E0B" />
                  </View>
                  <Text style={styles.recommendationText}>
                    {language === "si"
                      ? "සුව කිරීමේ ක්‍රියාමාර්ග සැලසුම් කරන්න"
                      : "Plan treatment measures"}
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.recommendationItem}>
                  <View style={styles.recommendationIcon}>
                    <AlertCircle size={16} color="#EF4444" />
                  </View>
                  <Text style={styles.recommendationText}>
                    {language === "si"
                      ? "වහාම පිළියම් ක්‍රියාමාර්ග ගන්න"
                      : "Take immediate treatment action"}
                  </Text>
                </View>
                <View style={styles.recommendationItem}>
                  <View style={styles.recommendationIcon}>
                    <Thermometer size={16} color="#EF4444" />
                  </View>
                  <Text style={styles.recommendationText}>
                    {language === "si"
                      ? "වෘත්තීය උපදෙස් ලබාගන්න"
                      : "Seek professional advice"}
                  </Text>
                </View>
              </>
            )}
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
  langButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  langText: {
    color: "#059669",
    fontSize: 12,
    fontWeight: "bold",
  },
  statsBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 1,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#059669",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 16,
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
  backButtonSecondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#059669",
  },
  backButtonText: {
    color: "#059669",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomSpacer: {
    height: 40,
  },
});
