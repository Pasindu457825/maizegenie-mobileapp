import React, { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { YieldPredictionStackParamList } from "../../navigation/YieldPredictionStack";
import {
  ArrowLeft,
  TrendingUp,
  BarChart3,
  Activity,
  AlertCircle,
  CheckCircle,
  Zap,
  Shield,
} from "lucide-react-native";
import { BarChart, LineChart, ProgressChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

type NavProp = StackNavigationProp<
  YieldPredictionStackParamList,
  "YieldPredictionOfficerResultsScreen"
>;

const YieldPredictionOfficerResultsScreenEnhanced = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute();
  const { data } = route.params as {
    data: any;
  };

  const { language: lang } = useLanguage();
  const language: "si" | "en" = lang === "sinhala" ? "si" : "en";
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
      subtitle: "නිලධාරී විශ්ලේෂණය",
      predictedYield: "පුරෝකථනය කළ අස්වැන්න",
      yieldComparison: "අස්වැන්න සැසඳීම",
      npkLevels: "NPK මට්ටම්",
      environmentalFactors: "පාරිසරික සාධක",
      soilHealth: "පස් සෞඛ්‍යය",
      impactFactors: "බලපෑම් සාධක",
      recommendations: "නිර්දේශ",
      predictionMethod: "පුරෝකථන ක්‍රමය",
      mlModel: "ML මාදිලිය",
      ruleBased: "නීති පදනම්",
      confidence: "විශ්වාසය",
      back: "ආපසු",
    },
    en: {
      title: "Yield Prediction",
      subtitle: "Officer Analysis",
      predictedYield: "Predicted Yield",
      yieldComparison: "Yield Comparison",
      npkLevels: "NPK Levels",
      environmentalFactors: "Environmental Factors",
      soilHealth: "Soil Health",
      impactFactors: "Impact Factors",
      recommendations: "Recommendations",
      predictionMethod: "Prediction Method",
      mlModel: "ML Model",
      ruleBased: "Rule-Based",
      confidence: "Confidence",
      back: "Back",
    },
  };

  // Extract data
  const prediction = data?.prediction || {};
  const predictedYield = prediction.predicted_yield || 0;
  const yieldCategory = prediction.yield_category || "Medium";
  const confidenceScore = prediction.confidence_score || 0;
  const predictionMethod = prediction.prediction_method || "rule_based";
  
  const analysisData = data?.analysis_data || {};
  const impactFactors = data?.impact_factors || [];
  const recommendations = data?.recommendations || [];
  const officerInsights = data?.officer_insights || {};

  // Chart configurations
  const chartConfig = {
    backgroundColor: "#FFFFFF",
    backgroundGradientFrom: "#FFFFFF",
    backgroundGradientTo: "#FFFFFF",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForLabels: {
      fontSize: 11,
    },
  };

  // Yield Comparison Chart Data
  const yieldComparison = analysisData.yield_comparison || {};
  const yieldComparisonData = {
    labels: ["Predicted", "District", "National", "Maximum"],
    datasets: [
      {
        data: [
          yieldComparison.predicted || 0,
          yieldComparison.district_average || 0,
          yieldComparison.national_average || 0,
          yieldComparison.potential_maximum || 0,
        ],
      },
    ],
  };

  // NPK Levels Chart Data
  const npkLevels = analysisData.npk_levels || {};
  const npkData = {
    labels: ["N", "P", "K"],
    datasets: [
      {
        data: [
          npkLevels.nitrogen || 0,
          npkLevels.phosphorus || 0,
          npkLevels.potassium || 0,
        ],
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
      },
      {
        data: [
          npkLevels.optimal_nitrogen || 0,
          npkLevels.optimal_phosphorus || 0,
          npkLevels.optimal_potassium || 0,
        ],
        color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
      },
    ],
    legend: ["Current", "Optimal"],
  };

  // Environmental Factors Progress Data
  const envFactors = analysisData.environmental_factors || {};
  const envProgressData = {
    labels: ["Temp", "Humidity", "Rainfall", "Sunshine"],
    data: [
      (envFactors.temperature || 0) / 40,
      (envFactors.humidity || 0) / 100,
      (envFactors.rainfall_30d || 0) / 300,
      (envFactors.sunshine || 0) / 12,
    ],
  };

  // Soil Health Data
  const soilHealth = analysisData.soil_health || {};
  const soilHealthData = {
    labels: ["pH", "Fertility", "N", "P", "K"],
    data: [
      (soilHealth.ph || 0) / 14,
      soilHealth.fertility_index || 0,
      soilHealth.n_status === "High" ? 1 : soilHealth.n_status === "Medium" ? 0.6 : 0.3,
      soilHealth.p_status === "High" ? 1 : soilHealth.p_status === "Medium" ? 0.6 : 0.3,
      soilHealth.k_status === "High" ? 1 : soilHealth.k_status === "Medium" ? 0.6 : 0.3,
    ],
  };

  const getCategoryColor = (category: string) => {
    const c = category?.toLowerCase() || "";
    if (c === "high") return "#10B981";
    if (c === "medium") return "#F59E0B";
    return "#EF4444";
  };

  const getMethodIcon = () => {
    return predictionMethod === "ml_model" ? (
      <Zap color="#10B981" size={20} />
    ) : (
      <Shield color="#3B82F6" size={20} />
    );
  };

  const getMethodColor = () => {
    return predictionMethod === "ml_model" ? "#10B981" : "#3B82F6";
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color="#047857" size={24} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{content[language].title}</Text>
          <Text style={styles.headerSubtitle}>{content[language].subtitle}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Predicted Yield Card */}
          <View style={styles.yieldCard}>
            <View style={styles.yieldHeader}>
              <View style={styles.yieldIconContainer}>
                <TrendingUp color="#10B981" size={32} />
              </View>
              <View style={styles.methodBadge}>
                {getMethodIcon()}
                <Text style={[styles.methodText, { color: getMethodColor() }]}>
                  {predictionMethod === "ml_model"
                    ? content[language].mlModel
                    : content[language].ruleBased}
                </Text>
              </View>
            </View>
            
            <Text style={styles.yieldLabel}>
              {content[language].predictedYield}
            </Text>
            <Text style={styles.yieldValue}>
              {predictedYield.toFixed(0)}
            </Text>
            <Text style={styles.yieldUnit}>kg/ha</Text>
            
            <View style={styles.categoryBadge}>
              <View
                style={[
                  styles.categoryDot,
                  { backgroundColor: getCategoryColor(yieldCategory) },
                ]}
              />
              <Text style={styles.categoryText}>{yieldCategory}</Text>
            </View>

            <View style={styles.confidenceContainer}>
              <Text style={styles.confidenceLabel}>
                {content[language].confidence}:
              </Text>
              <Text style={styles.confidenceValue}>
                {(confidenceScore * 100).toFixed(0)}%
              </Text>
            </View>
          </View>

          {/* Yield Comparison Chart */}
          {yieldComparison.predicted && (
            <View style={styles.chartSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <BarChart3 color="#10B981" size={20} />
                </View>
                <Text style={styles.sectionTitle}>
                  {content[language].yieldComparison}
                </Text>
              </View>
              <View style={styles.chartCard}>
                <BarChart
                  data={yieldComparisonData}
                  width={screenWidth - 64}
                  height={220}
                  chartConfig={chartConfig}
                  style={styles.chart}
                  showValuesOnTopOfBars
                  fromZero
                />
              </View>
            </View>
          )}

          {/* NPK Levels Chart */}
          {npkLevels.nitrogen && (
            <View style={styles.chartSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Activity color="#10B981" size={20} />
                </View>
                <Text style={styles.sectionTitle}>
                  {content[language].npkLevels}
                </Text>
              </View>
              <View style={styles.chartCard}>
                <BarChart
                  data={npkData}
                  width={screenWidth - 64}
                  height={220}
                  chartConfig={{
                    ...chartConfig,
                    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                  }}
                  style={styles.chart}
                  showValuesOnTopOfBars
                  fromZero
                />
                <View style={styles.legendContainer}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "#10B981" }]} />
                    <Text style={styles.legendText}>Current</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "#F59E0B" }]} />
                    <Text style={styles.legendText}>Optimal</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Environmental Factors */}
          {envFactors.temperature && (
            <View style={styles.chartSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Activity color="#10B981" size={20} />
                </View>
                <Text style={styles.sectionTitle}>
                  {content[language].environmentalFactors}
                </Text>
              </View>
              <View style={styles.chartCard}>
                <ProgressChart
                  data={envProgressData}
                  width={screenWidth - 64}
                  height={220}
                  chartConfig={chartConfig}
                  style={styles.chart}
                  hideLegend={false}
                />
                <View style={styles.envDetails}>
                  <View style={styles.envItem}>
                    <Text style={styles.envLabel}>Temperature:</Text>
                    <Text style={styles.envValue}>{envFactors.temperature}°C</Text>
                  </View>
                  <View style={styles.envItem}>
                    <Text style={styles.envLabel}>Humidity:</Text>
                    <Text style={styles.envValue}>{envFactors.humidity}%</Text>
                  </View>
                  <View style={styles.envItem}>
                    <Text style={styles.envLabel}>Rainfall (30d):</Text>
                    <Text style={styles.envValue}>{envFactors.rainfall_30d}mm</Text>
                  </View>
                  <View style={styles.envItem}>
                    <Text style={styles.envLabel}>Sunshine:</Text>
                    <Text style={styles.envValue}>{envFactors.sunshine}hrs</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Soil Health */}
          {soilHealth.ph && (
            <View style={styles.chartSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Activity color="#10B981" size={20} />
                </View>
                <Text style={styles.sectionTitle}>
                  {content[language].soilHealth}
                </Text>
              </View>
              <View style={styles.chartCard}>
                <ProgressChart
                  data={soilHealthData}
                  width={screenWidth - 64}
                  height={220}
                  chartConfig={chartConfig}
                  style={styles.chart}
                  hideLegend={false}
                />
                <View style={styles.soilDetails}>
                  <Text style={styles.soilText}>pH: {soilHealth.ph}</Text>
                  <Text style={styles.soilText}>
                    Fertility: {(soilHealth.fertility_index * 100).toFixed(0)}%
                  </Text>
                  <Text style={styles.soilText}>N: {soilHealth.n_status}</Text>
                  <Text style={styles.soilText}>P: {soilHealth.p_status}</Text>
                  <Text style={styles.soilText}>K: {soilHealth.k_status}</Text>
                </View>
              </View>
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

              {impactFactors.slice(0, 5).map((factor: any, index: number) => (
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
                          width: `${Math.min(Math.abs(factor.impact_percentage || 0), 100)}%`,
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
                    <Text style={styles.recommendationTitle}>
                      {language === "si" ? rec.title_si : rec.title_en}
                    </Text>
                  </View>
                  <Text style={styles.recommendationText}>
                    {language === "si" ? rec.description_si : rec.description_en}
                  </Text>
                  <View
                    style={[
                      styles.priorityBadge,
                      {
                        backgroundColor:
                          rec.priority === "high"
                            ? "#FEE2E2"
                            : rec.priority === "medium"
                            ? "#FEF3C7"
                            : "#DBEAFE",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        {
                          color:
                            rec.priority === "high"
                              ? "#EF4444"
                              : rec.priority === "medium"
                              ? "#F59E0B"
                              : "#3B82F6",
                        },
                      ]}
                    >
                      {rec.priority.toUpperCase()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

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
  yieldHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  yieldIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
  },
  methodBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  methodText: {
    fontSize: 12,
    fontWeight: "600",
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
  chartSection: {
    marginBottom: 20,
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
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#6B7280",
  },
  envDetails: {
    marginTop: 12,
    gap: 8,
  },
  envItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  envLabel: {
    fontSize: 13,
    color: "#6B7280",
  },
  envValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#065F46",
  },
  soilDetails: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  soilText: {
    fontSize: 12,
    color: "#6B7280",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
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
    marginBottom: 8,
  },
  priorityBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: "700",
  },
});

export default YieldPredictionOfficerResultsScreenEnhanced;
