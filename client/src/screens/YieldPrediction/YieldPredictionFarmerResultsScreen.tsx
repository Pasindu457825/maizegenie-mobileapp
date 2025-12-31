import React, { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { YieldPredictionStackParamList } from "../../navigation/YieldPredictionStack";
import {
  ArrowLeft,
  TrendingUp,
  Leaf,
  AlertCircle,
  CheckCircle,
  Droplets,
  Sun,
  Wind,
  Home,
  MessageSquare,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

type NavProp = StackNavigationProp<
  YieldPredictionStackParamList,
  "YieldPredictionResultsScreen"
>;

const YieldPredictionResultsScreen = () => {
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
      subtitle: "ඔබේ ප්‍රතිඵල",
      predictedYield: "පුරෝකථනය කළ අස්වැන්න",
      confidence: "විශ්වාසනීයත්වය",
      impactFactors: "බලපෑම් සාධක",
      recommendations: "නිර්දේශ",
      summary: "සාරාංශය",
      newPrediction: "නව පුරෝකථනයක්",
      requestAdvice: "උපදේශ ඉල්ලන්න",
      requestAdviceDesc: "අස්වැන්න වැඩිදියුණු කිරීම සහ බීජ තෝරාගැනීම සඳහා උපදේශ ලබා ගන්න",
      back: "ආපසු",
      high: "ඉහළ",
      medium: "මධ්‍යම",
      low: "අඩු",
      kgPerHa: "කි.ග්‍රෑ/හෙක්ටයාර",
      tonsPerHa: "ටොන්/හෙක්ටයාර",
      expectedRange: "අපේක්ෂිත පරාසය",
      positive: "ධනාත්මක",
      negative: "ඍණාත්මක",
      yieldComparison: "අස්වැන්න සැසඳීම",
      yourPrediction: "ඔබේ පුරෝකථනය",
      districtOptimal: "දිස්ත්‍රික් ප්‍රශස්ත",
      difference: "වෙනස",
      predictionMethod: "පුරෝකථන ක්‍රමය",
      mlModel: "ML මාදිලිය",
      ruleBased: "නීති පදනම්",
    },
    en: {
      title: "Yield Prediction",
      subtitle: "Your Results",
      predictedYield: "Predicted Yield",
      confidence: "Confidence",
      impactFactors: "Impact Factors",
      recommendations: "Recommendations",
      summary: "Summary",
      newPrediction: "New Prediction",
      requestAdvice: "Request Advice",
      requestAdviceDesc: "Get expert advice on yield enhancement and seed variety selection",
      back: "Back",
      high: "High",
      medium: "Medium",
      low: "Low",
      kgPerHa: "kg/ha",
      tonsPerHa: "tons/ha",
      expectedRange: "Expected Range",
      positive: "Positive",
      negative: "Negative",
      yieldComparison: "Yield Comparison",
      yourPrediction: "Your Prediction",
      districtOptimal: "District Optimal",
      difference: "Difference",
      predictionMethod: "Prediction Method",
      mlModel: "ML Model",
      ruleBased: "Rule-Based",
    },
  };

  const getConfidenceColor = (level: string) => {
    const l = level?.toLowerCase() || "";
    if (l.includes("high") || l.includes("ඉහළ")) return "#10B981";
    if (l.includes("medium") || l.includes("මධ්‍යම")) return "#F59E0B";
    return "#EF4444";
  };

  const getConfidenceLabel = (level: string) => {
    const l = level?.toLowerCase() || "";
    if (l.includes("high")) return language === "si" ? "ඉහළ" : "High";
    if (l.includes("medium")) return language === "si" ? "මධ්‍යම" : "Medium";
    return language === "si" ? "අඩු" : "Low";
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleNewPrediction = () => {
    navigation.navigate("YieldPredictionLoadingScreen");
  };

  const handleRequestAdvice = () => {
    Alert.alert(
      language === "si" ? "උපදේශ ඉල්ලීම" : "Request Advice",
      language === "si" 
        ? "ඔබේ අස්වැන්න වැඩිදියුණු කිරීම සහ සුදුසු බීජ වර්ගය තෝරාගැනීම සඳහා කෘෂිකර්ම නිලධාරියෙකුගෙන් උපදේශ ඉල්ලීමට අවශ්‍යද?"
        : "Would you like to request advice from an agricultural officer on yield enhancement and suitable seed variety selection?",
      [
        {
          text: language === "si" ? "අවලංගු කරන්න" : "Cancel",
          style: "cancel"
        },
        {
          text: language === "si" ? "ඉල්ලීම යවන්න" : "Send Request",
          onPress: () => {
            // TODO: Implement API call to submit advice request
            Alert.alert(
              language === "si" ? "සාර්ථකයි!" : "Success!",
              language === "si" 
                ? "ඔබේ උපදේශ ඉල්ලීම සාර්ථකව යවන ලදී. නිලධාරියෙක් ඉක්මනින් ඔබව සම්බන්ධ කරගනු ඇත."
                : "Your advice request has been sent successfully. An officer will contact you soon."
            );
          }
        }
      ]
    );
  };

  // Extract data with fallbacks
  const prediction = data?.prediction || {};
  const yieldKgHa = prediction.predicted_yield_kg_per_ha || 0;
  const yieldTonsHa = prediction.predicted_yield_tons_per_ha || (yieldKgHa / 1000);
  const confidenceLevel = prediction.confidence_level || "Medium";
  const confidenceScore = prediction.confidence_score || 0;
  const yieldLower = prediction.yield_lower_bound || yieldKgHa * 0.85;
  const yieldUpper = prediction.yield_upper_bound || yieldKgHa * 1.15;
  const impactFactors = data?.impact_factors || [];
  const recommendations = data?.recommendations || [];
  const summaryText = language === "si" 
    ? (data?.summary_sinhala || data?.summary_english || "")
    : (data?.summary_english || data?.summary_sinhala || "");
  
  // Extract comparison data
  const yieldComparison = data?.yield_comparison || null;
  const predictionMethod = prediction.prediction_method || "rule_based";
  const isPredictionML = predictionMethod === "ml_model" || predictionMethod === "ML";

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#10b981", "#059669"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft color="#ffffff" size={24} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{content[language].title}</Text>
          <Text style={styles.headerSubtitle}>{content[language].subtitle}</Text>
        </View>
      </LinearGradient>

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
              {yieldTonsHa.toFixed(2)}
            </Text>
            <Text style={styles.yieldUnit}>{content[language].tonsPerHa}</Text>
            <Text style={styles.yieldSubValue}>
              {yieldKgHa.toFixed(0)} {content[language].kgPerHa}
            </Text>

            {/* Expected Range */}
            <View style={styles.rangeContainer}>
              <Text style={styles.rangeLabel}>
                {content[language].expectedRange}
              </Text>
              <Text style={styles.rangeValue}>
                {(yieldLower / 1000).toFixed(2)} - {(yieldUpper / 1000).toFixed(2)}{" "}
                {content[language].tonsPerHa}
              </Text>
            </View>
          </View>

          {/* Prediction Method Badge */}
          <View style={styles.methodBadge}>
            <View style={[styles.methodDot, { backgroundColor: isPredictionML ? "#10B981" : "#F59E0B" }]} />
            <Text style={styles.methodText}>
              {content[language].predictionMethod}: {isPredictionML ? content[language].mlModel : content[language].ruleBased}
            </Text>
          </View>

          {/* Confidence Card */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <CheckCircle color="#10B981" size={20} />
              </View>
              <Text style={styles.sectionTitle}>
                {content[language].confidence}
              </Text>
            </View>

            <View style={styles.confidenceCard}>
              <View style={styles.confidenceHeader}>
                <Text style={styles.confidenceLabel}>
                  {getConfidenceLabel(confidenceLevel)}
                </Text>
                <Text style={styles.confidenceScore}>
                  {confidenceScore.toFixed(0)}%
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${confidenceScore}%`,
                      backgroundColor: getConfidenceColor(confidenceLevel),
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Yield Comparison Table */}
          {yieldComparison && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <TrendingUp color="#10B981" size={20} />
                </View>
                <Text style={styles.sectionTitle}>
                  {content[language].yieldComparison}
                </Text>
              </View>

              <View style={styles.comparisonTable}>
                <View style={styles.comparisonRow}>
                  <Text style={styles.comparisonLabel}>{content[language].yourPrediction}</Text>
                  <Text style={styles.comparisonValue}>
                    {(yieldComparison.predicted_yield_kg_ha / 1000).toFixed(2)} {content[language].tonsPerHa}
                  </Text>
                </View>
                <View style={styles.comparisonRow}>
                  <Text style={styles.comparisonLabel}>{content[language].districtOptimal}</Text>
                  <Text style={styles.comparisonValue}>
                    {(yieldComparison.district_optimal_kg_ha / 1000).toFixed(2)} {content[language].tonsPerHa}
                  </Text>
                </View>
                <View style={[styles.comparisonRow, styles.comparisonRowHighlight]}>
                  <Text style={styles.comparisonLabelBold}>{content[language].difference}</Text>
                  <Text style={[
                    styles.comparisonValueBold,
                    { color: yieldComparison.percentage_difference >= 0 ? "#10B981" : "#EF4444" }
                  ]}>
                    {yieldComparison.percentage_difference >= 0 ? "+" : ""}{yieldComparison.percentage_difference.toFixed(1)}%
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Impact Factors */}
          {impactFactors.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Leaf color="#10B981" size={20} />
                </View>
                <Text style={styles.sectionTitle}>
                  {content[language].impactFactors}
                </Text>
              </View>

              {impactFactors.map((factor: any, index: number) => (
                <View key={index} style={styles.factorCard}>
                  <View style={styles.factorHeader}>
                    <View style={styles.factorIconContainer}>
                      {factor.factor?.toLowerCase().includes("soil") && (
                        <Droplets color="#10B981" size={18} />
                      )}
                      {factor.factor?.toLowerCase().includes("weather") && (
                        <Sun color="#10B981" size={18} />
                      )}
                      {factor.factor?.toLowerCase().includes("irrigation") && (
                        <Droplets color="#10B981" size={18} />
                      )}
                      {!factor.factor?.toLowerCase().includes("soil") &&
                        !factor.factor?.toLowerCase().includes("weather") &&
                        !factor.factor?.toLowerCase().includes("irrigation") && (
                          <Wind color="#10B981" size={18} />
                        )}
                    </View>
                    <Text style={styles.factorName}>
                      {language === "si" && factor.factor_sinhala
                        ? factor.factor_sinhala
                        : factor.factor}
                    </Text>
                  </View>
                  <Text style={styles.factorDescription}>
                    {language === "si" && factor.description_sinhala
                      ? factor.description_sinhala
                      : factor.description_english}
                  </Text>
                  <View style={styles.factorImpactContainer}>
                    <View
                      style={[
                        styles.factorImpactBar,
                        {
                          width: `${Math.abs((factor.weight || 0) * 100)}%`,
                          backgroundColor:
                            factor.impact === 'positive'
                              ? "#10B981"
                              : factor.impact === 'negative'
                              ? "#EF4444"
                              : "#F59E0B",
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.factorImpactText,
                        {
                          color:
                            factor.impact === 'positive'
                              ? "#10B981"
                              : factor.impact === 'negative'
                              ? "#EF4444"
                              : "#F59E0B",
                        },
                      ]}
                    >
                      {((factor.weight || 0) * 100).toFixed(0)}%
                    </Text>
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
                    <View style={styles.recommendationBullet} />
                    <Text style={styles.recommendationTitle}>
                      {language === "si" && rec.title_sinhala
                        ? rec.title_sinhala
                        : rec.title_english}
                    </Text>
                  </View>
                  <Text style={styles.recommendationText}>
                    {language === "si" && rec.description_sinhala
                      ? rec.description_sinhala
                      : rec.description_english}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Summary */}
          {summaryText && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Leaf color="#10B981" size={20} />
                </View>
                <Text style={styles.sectionTitle}>
                  {content[language].summary}
                </Text>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryText}>{summaryText}</Text>
              </View>
            </View>
          )}

          {/* Request Advice Button */}
          <TouchableOpacity
            style={styles.requestAdviceButton}
            onPress={handleRequestAdvice}
          >
            <MessageSquare color="#FFFFFF" size={20} />
            <View style={styles.requestAdviceContent}>
              <Text style={styles.requestAdviceTitle}>
                {content[language].requestAdvice}
              </Text>
              <Text style={styles.requestAdviceDesc}>
                {content[language].requestAdviceDesc}
              </Text>
            </View>
          </TouchableOpacity>

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
paddingTop: 50,
paddingBottom: 20,
paddingHorizontal: 20,
borderBottomLeftRadius: 24,
borderBottomRightRadius: 24,
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
marginBottom: 8,
},
yieldSubValue: {
fontSize: 14,
color: "#6B7280",
},
rangeContainer: {
marginTop: 16,
paddingTop: 16,
borderTopWidth: 1,
borderTopColor: "#E5E7EB",
alignItems: "center",
},
rangeLabel: {
fontSize: 12,
color: "#6B7280",
marginBottom: 4,
},
rangeValue: {
fontSize: 14,
fontWeight: "600",
color: "#065F46",
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
confidenceCard: {
backgroundColor: "#FFFFFF",
borderRadius: 12,
padding: 16,
shadowColor: "#000",
shadowOffset: { width: 0, height: 1 },
shadowOpacity: 0.05,
shadowRadius: 4,
elevation: 2,
},
confidenceHeader: {
flexDirection: "row",
justifyContent: "space-between",
alignItems: "center",
marginBottom: 12,
},
confidenceLabel: {
fontSize: 16,
fontWeight: "600",
color: "#065F46",
},
confidenceScore: {
fontSize: 24,
fontWeight: "700",
color: "#10B981",
},
progressBarContainer: {
height: 8,
backgroundColor: "#E5E7EB",
borderRadius: 4,
overflow: "hidden",
},
progressBar: {
height: "100%",
borderRadius: 4,
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
alignItems: "center",
marginBottom: 8,
},
factorIconContainer: {
width: 32,
height: 32,
borderRadius: 16,
backgroundColor: "#D1FAE5",
alignItems: "center",
justifyContent: "center",
marginRight: 12,
},
factorName: {
fontSize: 15,
fontWeight: "600",
color: "#065F46",
flex: 1,
},
factorDescription: {
fontSize: 13,
color: "#6B7280",
marginBottom: 12,
lineHeight: 18,
},
factorImpactContainer: {
flexDirection: "row",
alignItems: "center",
},
factorImpactBar: {
height: 6,
borderRadius: 3,
marginRight: 8,
},
factorImpactText: {
fontSize: 14,
fontWeight: "600",
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
    alignItems: "flex-start",
    marginBottom: 8,
  },
  recommendationBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
    marginTop: 6,
    marginRight: 12,
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
    paddingLeft: 20,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
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
  methodBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  methodDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  methodText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  comparisonTable: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  comparisonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  comparisonRowHighlight: {
    backgroundColor: "#F0FDF4",
    marginHorizontal: -16,
    paddingHorizontal: 16,
    marginBottom: -16,
    paddingBottom: 16,
    borderBottomWidth: 0,
    borderRadius: 12,
    marginTop: 8,
  },
  comparisonLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  comparisonLabelBold: {
    fontSize: 15,
    fontWeight: "600",
    color: "#065F46",
  },
  comparisonValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  comparisonValueBold: {
    fontSize: 18,
    fontWeight: "700",
  },
  requestAdviceButton: {
    backgroundColor: "#F59E0B",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
    marginBottom: 12,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  requestAdviceContent: {
    flex: 1,
  },
  requestAdviceTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  requestAdviceDesc: {
    fontSize: 12,
    color: "#FEF3C7",
  },
});

export default YieldPredictionResultsScreen;
