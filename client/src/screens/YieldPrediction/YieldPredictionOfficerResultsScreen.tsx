import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { YieldPredictionStackParamList } from "../../navigation/YieldPredictionStack";
import {
  ArrowLeft,
  TrendingUp,
  Leaf,
  Package,
  CheckCircle,
  AlertCircle,
  Calendar,
  Home,
  Activity,
} from "lucide-react-native";

type NavProp = StackNavigationProp<
  YieldPredictionStackParamList,
  "YieldPredictionOfficerResultsScreen"
>;

const YieldPredictionOfficerResultsScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute();
  const { data, language: initialLanguage } = route.params as {
    data: any;
    language: "si" | "en";
  };

  const [language, setLanguage] = useState<"si" | "en">(initialLanguage);
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const content = {
    si: {
      title: "අස්වැන්න පුරෝකථනය",
      subtitle: "නිලධාරී ප්‍රතිඵල",
      predictedYield: "පුරෝකථනය කළ අස්වැන්න",
      fertilizerSchedule: "පොහොර කාලසටහන",
      npkRequirements: "NPK අවශ්‍යතා",
      impactFactors: "බලපෑම් සාධක",
      recommendations: "නිර්දේශ",
      officerInsights: "නිලධාරී අවබෝධය",
      newPrediction: "නව පුරෝකථනයක්",
      back: "ආපසු",
      basal: "මූලික",
      topdress1: "ඉහළ පොහොර 1",
      topdress2: "ඉහළ පොහොර 2",
      nitrogen: "නයිට්‍රජන්",
      phosphorus: "පොස්පරස්",
      potassium: "පොටෑසියම්",
      das: "DAS",
      kgPerHa: "කි.ග්‍රෑ/හෙක්ටයාර",
      status: "තත්ත්වය",
      done: "සම්පූර්ණයි",
      pending: "පොරොත්තු",
      partial: "අර්ධ වශයෙන්",
    },
    en: {
      title: "Yield Prediction",
      subtitle: "Officer Results",
      predictedYield: "Predicted Yield",
      fertilizerSchedule: "Fertilizer Schedule",
      npkRequirements: "NPK Requirements",
      impactFactors: "Impact Factors",
      recommendations: "Recommendations",
      officerInsights: "Officer Insights",
      newPrediction: "New Prediction",
      back: "Back",
      basal: "Basal",
      topdress1: "Top-dress 1",
      topdress2: "Top-dress 2",
      nitrogen: "Nitrogen",
      phosphorus: "Phosphorus",
      potassium: "Potassium",
      das: "DAS",
      kgPerHa: "kg/ha",
      status: "Status",
      done: "Done",
      pending: "Pending",
      partial: "Partial",
    },
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleNewPrediction = () => {
    navigation.navigate("YieldPredictionLoadingScreen");
  };

  // Extract data with fallbacks
  const prediction = data?.prediction || {};
  const predictedYield = prediction.predicted_yield || 0;
  const yieldUnit = prediction.yield_unit || "kg/ha";
  const confidenceScore = prediction.confidence_score || 0;
  const yieldCategory = prediction.yield_category || "Medium";
  
  const fertilizerSchedule = data?.fertilizer_schedule || {};
  const impactFactors = data?.impact_factors || [];
  const recommendations = data?.recommendations || [];
  const officerInsights = data?.officer_insights || {};

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s === "done") return "#10B981";
    if (s === "partial") return "#F59E0B";
    return "#6B7280";
  };

  const getStatusLabel = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s === "done") return language === "si" ? "සම්පූර්ණයි" : "Done";
    if (s === "partial") return language === "si" ? "අර්ධ වශයෙන්" : "Partial";
    return language === "si" ? "පොරොත්තු" : "Pending";
  };

  const getCategoryColor = (category: string) => {
    const c = category?.toLowerCase() || "";
    if (c === "high") return "#10B981";
    if (c === "medium") return "#F59E0B";
    return "#EF4444";
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft color="#047857" size={24} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{content[language].title}</Text>
          <Text style={styles.headerSubtitle}>{content[language].subtitle}</Text>
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

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Predicted Yield Card */}
          <View style={styles.yieldCard}>
            <View style={styles.yieldIconContainer}>
              <TrendingUp color="#10B981" size={32} />
            </View>
            <Text style={styles.yieldLabel}>
              {content[language].predictedYield}
            </Text>
            <Text style={styles.yieldValue}>
              {predictedYield.toFixed(0)}
            </Text>
            <Text style={styles.yieldUnit}>{yieldUnit}</Text>
            
            <View style={styles.categoryBadge}>
              <View
                style={[
                  styles.categoryDot,
                  { backgroundColor: getCategoryColor(yieldCategory) },
                ]}
              />
              <Text style={styles.categoryText}>{yieldCategory}</Text>
            </View>

            {confidenceScore > 0 && (
              <View style={styles.confidenceContainer}>
                <Text style={styles.confidenceLabel}>
                  {content[language].status}
                </Text>
                <Text style={styles.confidenceValue}>
                  {(confidenceScore * 100).toFixed(0)}%
                </Text>
              </View>
            )}
          </View>

          {/* Fertilizer Schedule */}
          {Object.keys(fertilizerSchedule).length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Package color="#10B981" size={20} />
                </View>
                <Text style={styles.sectionTitle}>
                  {content[language].fertilizerSchedule}
                </Text>
              </View>

              {fertilizerSchedule.basal && (
                <View style={styles.fertilizerCard}>
                  <View style={styles.fertilizerHeader}>
                    <View style={styles.fertilizerIconContainer}>
                      <Calendar color="#10B981" size={18} />
                    </View>
                    <Text style={styles.fertilizerTitle}>
                      {content[language].basal}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: getStatusColor(
                            fertilizerSchedule.basal.status
                          ),
                        },
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {getStatusLabel(fertilizerSchedule.basal.status)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.fertilizerDetails}>
                    <Text style={styles.fertilizerLabel}>
                      {content[language].das}:{" "}
                      <Text style={styles.fertilizerValue}>
                        {fertilizerSchedule.basal.days_after_sowing || 0}
                      </Text>
                    </Text>
                    <Text style={styles.fertilizerLabel}>
                      {content[language].nitrogen}:{" "}
                      <Text style={styles.fertilizerValue}>
                        {fertilizerSchedule.basal.nitrogen || 0}{" "}
                        {content[language].kgPerHa}
                      </Text>
                    </Text>
                    <Text style={styles.fertilizerLabel}>
                      {content[language].phosphorus}:{" "}
                      <Text style={styles.fertilizerValue}>
                        {fertilizerSchedule.basal.phosphorus || 0}{" "}
                        {content[language].kgPerHa}
                      </Text>
                    </Text>
                    <Text style={styles.fertilizerLabel}>
                      {content[language].potassium}:{" "}
                      <Text style={styles.fertilizerValue}>
                        {fertilizerSchedule.basal.potassium || 0}{" "}
                        {content[language].kgPerHa}
                      </Text>
                    </Text>
                  </View>
                  {fertilizerSchedule.basal.instructions_sinhala && (
                    <Text style={styles.fertilizerInstructions}>
                      {language === "si"
                        ? fertilizerSchedule.basal.instructions_sinhala
                        : fertilizerSchedule.basal.instructions_english}
                    </Text>
                  )}
                </View>
              )}

              {fertilizerSchedule.topdress_1 && (
                <View style={styles.fertilizerCard}>
                  <View style={styles.fertilizerHeader}>
                    <View style={styles.fertilizerIconContainer}>
                      <Calendar color="#10B981" size={18} />
                    </View>
                    <Text style={styles.fertilizerTitle}>
                      {content[language].topdress1}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: getStatusColor(
                            fertilizerSchedule.topdress_1.status
                          ),
                        },
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {getStatusLabel(fertilizerSchedule.topdress_1.status)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.fertilizerDetails}>
                    <Text style={styles.fertilizerLabel}>
                      {content[language].das}:{" "}
                      <Text style={styles.fertilizerValue}>
                        {fertilizerSchedule.topdress_1.days_after_sowing || 0}
                      </Text>
                    </Text>
                    <Text style={styles.fertilizerLabel}>
                      {content[language].nitrogen}:{" "}
                      <Text style={styles.fertilizerValue}>
                        {fertilizerSchedule.topdress_1.nitrogen || 0}{" "}
                        {content[language].kgPerHa}
                      </Text>
                    </Text>
                  </View>
                  {fertilizerSchedule.topdress_1.instructions_sinhala && (
                    <Text style={styles.fertilizerInstructions}>
                      {language === "si"
                        ? fertilizerSchedule.topdress_1.instructions_sinhala
                        : fertilizerSchedule.topdress_1.instructions_english}
                    </Text>
                  )}
                </View>
              )}

              {fertilizerSchedule.topdress_2 && (
                <View style={styles.fertilizerCard}>
                  <View style={styles.fertilizerHeader}>
                    <View style={styles.fertilizerIconContainer}>
                      <Calendar color="#10B981" size={18} />
                    </View>
                    <Text style={styles.fertilizerTitle}>
                      {content[language].topdress2}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: getStatusColor(
                            fertilizerSchedule.topdress_2.status
                          ),
                        },
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {getStatusLabel(fertilizerSchedule.topdress_2.status)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.fertilizerDetails}>
                    <Text style={styles.fertilizerLabel}>
                      {content[language].das}:{" "}
                      <Text style={styles.fertilizerValue}>
                        {fertilizerSchedule.topdress_2.days_after_sowing || 0}
                      </Text>
                    </Text>
                    <Text style={styles.fertilizerLabel}>
                      {content[language].nitrogen}:{" "}
                      <Text style={styles.fertilizerValue}>
                        {fertilizerSchedule.topdress_2.nitrogen || 0}{" "}
                        {content[language].kgPerHa}
                      </Text>
                    </Text>
                  </View>
                  {fertilizerSchedule.topdress_2.instructions_sinhala && (
                    <Text style={styles.fertilizerInstructions}>
                      {language === "si"
                        ? fertilizerSchedule.topdress_2.instructions_sinhala
                        : fertilizerSchedule.topdress_2.instructions_english}
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Impact Factors */}
          {impactFactors.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Activity color="#10B981" size={20} />
                </View>
                <Text style={styles.sectionTitle}>
                  {content[language].impactFactors}
                </Text>
              </View>

              {impactFactors.map((factor: any, index: number) => (
                <View key={index} style={styles.factorCard}>
                  <View style={styles.factorHeader}>
                    <Text style={styles.factorName}>{factor.factor}</Text>
                    <Text
                      style={[
                        styles.factorImpact,
                        {
                          color:
                            (factor.impact_percentage || 0) >= 0
                              ? "#10B981"
                              : "#EF4444",
                        },
                      ]}
                    >
                      {factor.impact_percentage > 0 ? "+" : ""}
                      {factor.impact_percentage?.toFixed(1)}%
                    </Text>
                  </View>
                  <Text style={styles.factorDescription}>
                    {factor.description}
                  </Text>
                  <View style={styles.factorBarContainer}>
                    <View
                      style={[
                        styles.factorBar,
                        {
                          width: `${Math.abs(factor.impact_percentage || 0)}%`,
                          backgroundColor:
                            (factor.impact_percentage || 0) >= 0
                              ? "#10B981"
                              : "#EF4444",
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <AlertCircle color="#10B981" size={20} />
                </View>
                <Text style={styles.sectionTitle}>
                  {content[language].recommendations}
                </Text>
              </View>

              {recommendations.map((rec: any, index: number) => (
                <View key={index} style={styles.recommendationCard}>
                  <View style={styles.recommendationHeader}>
                    <CheckCircle color="#10B981" size={18} />
                    <Text style={styles.recommendationTitle}>{rec.title}</Text>
                  </View>
                  <Text style={styles.recommendationText}>
                    {rec.description}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Officer Insights */}
          {officerInsights && Object.keys(officerInsights).length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Leaf color="#10B981" size={20} />
                </View>
                <Text style={styles.sectionTitle}>
                  {content[language].officerInsights}
                </Text>
              </View>

              <View style={styles.insightsCard}>
                {Object.entries(officerInsights).map(([key, value]: [string, any]) => (
                  <View key={key} style={styles.insightItem}>
                    <Text style={styles.insightLabel}>
                      {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}:
                    </Text>
                    <Text style={styles.insightValue}>
                      {typeof value === "object" ? JSON.stringify(value) : String(value)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* New Prediction Button */}
          <TouchableOpacity
            style={styles.newPredictionButton}
            onPress={handleNewPrediction}
          >
            <Home color="#FFFFFF" size={20} />
            <Text style={styles.newPredictionText}>
              {content[language].newPrediction}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
    color: "#065F46",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  langButton: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  langText: {
    color: "#047857",
    fontSize: 14,
    fontWeight: "600",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  yieldCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 2,
    borderColor: "#D1FAE5",
  },
  yieldIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  yieldLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  yieldValue: {
    fontSize: 48,
    fontWeight: "700",
    color: "#065F46",
    marginBottom: 4,
  },
  yieldUnit: {
    fontSize: 16,
    color: "#10B981",
    fontWeight: "600",
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  confidenceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  confidenceLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10B981",
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#065F46",
  },
  fertilizerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  fertilizerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  fertilizerIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  fertilizerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#065F46",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  fertilizerDetails: {
    marginBottom: 12,
  },
  fertilizerLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 4,
  },
  fertilizerValue: {
    fontWeight: "600",
    color: "#065F46",
  },
  fertilizerInstructions: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
    lineHeight: 16,
  },
  factorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  factorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  factorName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#065F46",
    flex: 1,
  },
  factorImpact: {
    fontSize: 16,
    fontWeight: "700",
  },
  factorDescription: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 12,
    lineHeight: 18,
  },
  factorBarContainer: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },
  factorBar: {
    height: "100%",
    borderRadius: 3,
  },
  recommendationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  recommendationTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#065F46",
    flex: 1,
  },
  recommendationText: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  insightsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  insightItem: {
    marginBottom: 12,
  },
  insightLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  insightValue: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  newPredictionButton: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  newPredictionText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

export default YieldPredictionOfficerResultsScreen;
