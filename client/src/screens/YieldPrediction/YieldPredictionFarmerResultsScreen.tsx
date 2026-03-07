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
  ActivityIndicator,
  Modal,
  Platform,
  TextInput,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { createAdviceRequest } from "../../services/adviceRequestApi";
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
  ChevronDown,
  ChevronUp,
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
  const { data, farmerInput } = route.params as {
    data: any;
    farmerInput?: {
      district?: string;
      location?: string;
      variety?: string;
      field_size_ha?: number;
      irrigation_type?: string;
      rainfall_condition?: string;
      planting_date?: string;
    };
  };

  const { language: lang } = useLanguage();
  const language: "si" | "en" | "ta" = lang === "sinhala" ? "si" : lang === "tamil" ? "ta" : "en";
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isSubmittingAdvice, setIsSubmittingAdvice] = useState(false);
  const [showAdviceModal, setShowAdviceModal] = useState(false);
  const [isRecommendationsExpanded, setIsRecommendationsExpanded] = useState(true);
  const [expectedYieldInput, setExpectedYieldInput] = useState("");
  const [yieldUnit, setYieldUnit] = useState<"kg" | "tons" | "bushels">("kg");

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
      varietyComparison: "බීජ වර්ග සැසඳීම",
      currentVariety: "වත්මන් බීජ වර්ගය",
      suggestedVariety: "යෝජිත බීජ වර්ගය",
      potentialYield: "විභව අස්වැන්න",
      yieldIncrease: "අස්වැන්න වැඩිවීම",
      irrigationComparison: "වාරිමාර්ග සැසඳීම",
      currentIrrigation: "වත්මන් වාරිමාර්ග",
      suggestedIrrigation: "යෝජිත වාරිමාර්ග",
      harvestCalculator: "අස්වනු ගණකය",
      landSize: "ඉඩම් ප්‍රමාණය",
      totalHarvest: "මුළු අස්වැන්න",
      hectares: "හෙක්ටයාර්",
      kilograms: "කිලෝග්‍රෑම්",
      tons: "ටොන්",
      yieldConverter: "අස්වැන්න පරිවර්තකය",
      enterExpectedYield: "අපේක්ෂිත අස්වැන්න ඇතුළත් කරන්න",
      convertTo: "පරිවර්තනය කරන්න",
      bushels: "බුෂල්",
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
      varietyComparison: "Seed Variety Comparison",
      currentVariety: "Current Variety",
      suggestedVariety: "Suggested Variety",
      potentialYield: "Potential Yield",
      yieldIncrease: "Yield Increase",
      irrigationComparison: "Irrigation Comparison",
      currentIrrigation: "Current Irrigation",
      suggestedIrrigation: "Suggested Irrigation",
      harvestCalculator: "Harvest Calculator",
      landSize: "Land Size",
      totalHarvest: "Total Harvest",
      hectares: "hectares",
      kilograms: "kilograms",
      tons: "tons",
      yieldConverter: "Yield Converter",
      enterExpectedYield: "Enter Expected Yield",
      convertTo: "Convert To",
      bushels: "Bushels",
    },
    ta: {
      title: "விளைச்சல் கணிப்பு",
      subtitle: "உங்கள் முடிவுகள்",
      predictedYield: "கணிக்கப்பட்ட விளைச்சல்",
      confidence: "நம்பகத்தன்மை",
      impactFactors: "பாதிப்பு காரணிகள்",
      recommendations: "பரிந்துரைகள்",
      summary: "சுருக்கம்",
      newPrediction: "புதிய கணிப்பு",
      requestAdvice: "ஆலோசனை கோருங்கள்",
      requestAdviceDesc: "விளைச்சல் மேம்பாடு மற்றும் விதை தேர்வு குறித்த ஆலோசனை பெறுங்கள்",
      back: "பின்",
      high: "உயர்ந்தது",
      medium: "நடுத்தரம்",
      low: "குறைவு",
      kgPerHa: "kg/ha",
      tonsPerHa: "tons/ha",
      expectedRange: "எதிர்பார்க்கப்பட்ட வரம்பு",
      positive: "நேர்மறையானது",
      negative: "எதிர்மறையானது",
      yieldComparison: "விளைச்சல் ஒப்பீடு",
      yourPrediction: "உங்கள் கணிப்பு",
      districtOptimal: "மாவட்ட உகந்தம்",
      difference: "வேறுபாடு",
      predictionMethod: "கணிப்பு முறை",
      mlModel: "ML மாதிரி",
      ruleBased: "விதி அடிப்படை",
      varietyComparison: "விதை வகை ஒப்பீடு",
      currentVariety: "நடப்பிலுள்ள வகை",
      suggestedVariety: "பரிந்துரைக்கப்பட்ட வகை",
      potentialYield: "சாத்தியமான விளைச்சல்",
      yieldIncrease: "விளைச்சல் அதிகரிப்பு",
      irrigationComparison: "நீர்பாசனம் ஒப்பீடு",
      currentIrrigation: "நடப்பிலுள்ள நீர்பாசனம்",
      suggestedIrrigation: "பரிந்துரைக்கப்பட்ட நீர்பாசனம்",
      harvestCalculator: "அறுவடை கணக்கி",
      landSize: "நில அளவு",
      totalHarvest: "மொத்த அறுவடை",
      hectares: "ஹெக்டேர்கள்",
      kilograms: "கிலோகிராம்கள்",
      tons: "டன்கள்",
      yieldConverter: "விளைச்சல் மாற்றி",
      enterExpectedYield: "எதிர்பார்க்கப்பட்ட விளைச்சலை உள்ளிடவும்",
      convertTo: "மாற்றுக",
      bushels: "புஷல்கள்",
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
    if (l.includes("high")) return language === "si" ? "ඉහළ" : language === "ta" ? "உயர்ந்தது" : "High";
    if (l.includes("medium")) return language === "si" ? "මධ්‍යම" : language === "ta" ? "நடுத்தரம்" : "Medium";
    return language === "si" ? "අඩු" : language === "ta" ? "குறைவு" : "Low";
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleNewPrediction = () => {
    navigation.navigate("YieldPredictionLoadingScreen");
  };

  const handleRequestAdvice = () => {
    setShowAdviceModal(true);
  };

  const handleAdviceTypeSelect = (requestType: 'yield_enhancement' | 'seed_variety' | 'both') => {
    setShowAdviceModal(false);
    submitAdviceRequest(requestType);
  };

  // Cross-platform alert function
  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const submitAdviceRequest = async (requestType: 'yield_enhancement' | 'seed_variety' | 'both') => {
    setIsSubmittingAdvice(true);
    try {
      // Extract all prediction data
      const predictionId = data?.prediction_id || data?.farmer_input_id || '';
      const yieldKgHa = data?.prediction?.predicted_yield_kg_per_ha || 0;

      // Get farmer input data from route params
      const district = farmerInput?.district || '';
      const location = farmerInput?.location || '';
      const variety = farmerInput?.variety || '';
      const landSizeHa = farmerInput?.field_size_ha || 0;
      const irrigationType = farmerInput?.irrigation_type || '';
      const rainfallCondition = farmerInput?.rainfall_condition || '';
      const plantingDate = farmerInput?.planting_date || '';

      // Generate message based on request type
      let farmerMessage = '';
      if (requestType === 'yield_enhancement') {
        farmerMessage = language === "si"
          ? "අස්වැන්න වැඩිදියුණු කිරීම සඳහා උපදේශ අවශ්‍යයි"
          : language === "ta" ? "விளைச்சல் மேம்பாடு குறித்த ஆலோசனை தேவை"
            : "Need advice on yield enhancement";
      } else if (requestType === 'seed_variety') {
        farmerMessage = language === "si"
          ? "බීජ වර්ගය තෝරාගැනීම සඳහා උපදේශ අවශ්‍යයි"
          : language === "ta" ? "விதை தேர்வு குறித்த ஆலோசனை தேவை"
            : "Need advice on seed variety selection";
      } else {
        farmerMessage = language === "si"
          ? "අස්වැන්න වැඩිදියුණු කිරීම සහ බීජ තෝරාගැනීම සඳහා උපදේශ අවශ්‍යයි"
          : language === "ta" ? "விளைச்சல் மேம்பாடு மற்றும் விதை தேர்வு குறித்த ஆலோசனை தேவை"
            : "Need advice on yield enhancement and seed variety selection";
      }

      await createAdviceRequest({
        yield_prediction_id: predictionId,
        request_type: requestType,
        farmer_message: farmerMessage,
        predicted_yield_kg_ha: yieldKgHa,
        district: district,
        location: location,
        variety: variety,
        land_size_ha: landSizeHa,
        irrigation_type: irrigationType,
        rainfall_condition: rainfallCondition,
        planting_date: plantingDate,
      });

      showAlert(
        language === "si" ? "සාර්ථකයි!" : language === "ta" ? "வெற்றி!" : "Success!",
        language === "si"
          ? "ඔබේ උපදේශ ඉල්ලීම සාර්ථකව යවන ලදී. නිලධාරියෙක් ඉක්මනින් ඔබව සම්බන්ධ කරගනු ඇත."
          : language === "ta" ? "உங்கள் ஆலோசனை கோரிக்கை வெற்றிகரமாக அனுப்பப்பட்டது. அதிகாரி விரைவில் உங்களை தொடர்புகொள்வார்."
            : "Your advice request has been sent successfully. An officer will contact you soon."
      );
    } catch (error: any) {
      console.error('Failed to submit advice request:', error);
      showAlert(
        language === "si" ? "දෝෂයකි" : language === "ta" ? "பிழை" : "Error",
        error.message || (language === "si"
          ? "උපදේශ ඉල්ලීම යැවීමට අසමත් විය. කරුණාකර නැවත උත්සාහ කරන්න."
          : language === "ta" ? "ஆலோசனை கோரிக்கையை அனுப்ப முடியவில்லை. மீண்டும் முயற்சிக்கவும்."
            : "Failed to send advice request. Please try again.")
      );
    } finally {
      setIsSubmittingAdvice(false);
    }
  };

  // Extract data with fallbacks - matching officer's structure
  const prediction = data?.prediction || {};

  // Primary yield data
  const predictedYield = prediction.predicted_yield || prediction.predicted_yield_kg_per_ha || 0;
  const yieldKgHa = predictedYield;
  const yieldTonsHa = (predictedYield / 1000);

  // Confidence data - Fix: handle both decimal (0.6) and percentage (60) formats
  const rawConfidenceScore = prediction.confidence_score || 0;
  const confidenceScore = rawConfidenceScore > 1 ? rawConfidenceScore / 100 : rawConfidenceScore;
  const confidenceLevel = prediction.confidence_level ||
    (confidenceScore >= 0.8 ? "High" : confidenceScore >= 0.6 ? "Medium" : "Low");

  // Yield bounds
  const yieldLower = prediction.yield_lower_bound || predictedYield * 0.85;
  const yieldUpper = prediction.yield_upper_bound || predictedYield * 1.15;

  // Prediction method
  const predictionMethod = prediction.prediction_method || "rule_based";
  const isPredictionML = predictionMethod === "ml_model" || predictionMethod === "ML";

  // Analysis data
  const analysisData = data?.analysis_data || {};
  const yieldComparison = data?.yield_comparison || analysisData.yield_comparison || null;

  // Impact factors - extract from analysis_data
  const impactFactors = data?.impact_factors || [];

  // Recommendations
  const recommendations = data?.recommendations || [];

  // Summary text
  const summaryText = language === "si"
    ? (data?.summary_sinhala || data?.summary_english || "")
    : language === "ta" ? (data?.summary_tamil || data?.summary_english || "")
      : (data?.summary_english || data?.summary_sinhala || "");

  // Variety comparison data
  const varietyComparison = data?.variety_comparison || null;
  const currentVariety = farmerInput?.variety || "Unknown";
  const suggestedVariety = varietyComparison?.suggested_variety || null;
  const varietyPotentialYield = varietyComparison?.potential_yield || null;
  const varietyYieldIncrease = varietyComparison?.yield_increase_percentage || null;

  // Irrigation comparison data
  const irrigationComparison = data?.irrigation_comparison || null;
  const currentIrrigation = farmerInput?.irrigation_type || "Unknown";
  const suggestedIrrigation = irrigationComparison?.suggested_irrigation || null;
  const irrigationPotentialYield = irrigationComparison?.potential_yield || null;
  const irrigationYieldIncrease = irrigationComparison?.yield_increase_percentage || null;

  // Harvest calculator
  const landSizeHa = farmerInput?.field_size_ha || 0;
  const totalHarvestKg = landSizeHa * yieldKgHa;
  const totalHarvestTons = totalHarvestKg / 1000;

  // Yield converter - real-time conversion
  // 1 bushel of maize = 25.4 kg (56 lbs)
  const convertYield = (value: number, fromUnit: "kg" | "tons" | "bushels") => {
    let kg = 0;
    if (fromUnit === "kg") kg = value;
    else if (fromUnit === "tons") kg = value * 1000;
    else if (fromUnit === "bushels") kg = value * 25.4;

    return {
      kg: kg,
      tons: kg / 1000,
      bushels: kg / 25.4,
    };
  };

  const expectedYieldValue = parseFloat(expectedYieldInput) || 0;
  const convertedYields = convertYield(expectedYieldValue, yieldUnit);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#10b981" />
      {/* Header */}
      <LinearGradient
        colors={["#10b981", "#059669"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <ArrowLeft color="#ffffff" size={24} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {language === "si" ? "අස්වැන්න පුරෝකථන ප්‍රතිඵල" : language === "ta" ? "விளைச்சல் கணிப்பு முடிவுகள்" : "Yield Prediction Results"}
            </Text>
            {farmerInput && (farmerInput.district || farmerInput.variety) && (
              <Text style={styles.headerSubtitle}>
                {farmerInput.district || ""} {farmerInput.district && farmerInput.variety && "•"} {farmerInput.variety || ""}
              </Text>
            )}
          </View>
          <View style={{ width: 24 }} />
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
                    {((yieldComparison.predicted_yield_kg_ha || yieldComparison.predicted || predictedYield) / 1000).toFixed(2)} {content[language].tonsPerHa}
                  </Text>
                </View>
                <View style={styles.comparisonRow}>
                  <Text style={styles.comparisonLabel}>{content[language].districtOptimal}</Text>
                  <Text style={styles.comparisonValue}>
                    {((yieldComparison.district_optimal_kg_ha || yieldComparison.district_optimal || yieldComparison.district_average || 0) / 1000).toFixed(2)} {content[language].tonsPerHa}
                  </Text>
                </View>
                <View style={[styles.comparisonRow, styles.comparisonRowHighlight]}>
                  <Text style={styles.comparisonLabelBold}>{content[language].difference}</Text>
                  <Text style={[
                    styles.comparisonValueBold,
                    { color: (yieldComparison.percentage_difference || 0) >= 0 ? "#10B981" : "#EF4444" }
                  ]}>
                    {(yieldComparison.percentage_difference || 0) >= 0 ? "+" : ""}{(yieldComparison.percentage_difference || 0).toFixed(1)}%
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => setIsRecommendationsExpanded(!isRecommendationsExpanded)}
                activeOpacity={0.7}
              >
                <View style={styles.sectionIconContainer}>
                  <AlertCircle color="#10B981" size={20} />
                </View>
                <Text style={styles.sectionTitle}>
                  {content[language].recommendations}
                </Text>
                {isRecommendationsExpanded ? (
                  <ChevronDown color="#10B981" size={20} />
                ) : (
                  <ChevronUp color="#10B981" size={20} />
                )}
              </TouchableOpacity>

              {isRecommendationsExpanded && recommendations.map((rec: any, index: number) => (
                <View key={index} style={styles.recommendationCard}>
                  <View style={styles.recommendationHeader}>
                    <View style={styles.recommendationBullet} />
                    <Text style={styles.recommendationTitle}>
                      {language === "si"
                        ? (rec.title_sinhala || rec.title_si || rec.title_english || rec.title_en || rec.title)
                        : language === "ta" ? (rec.title_tamil || rec.title_ta || rec.title_english || rec.title_en || rec.title)
                          : (rec.title_english || rec.title_en || rec.title_sinhala || rec.title_si || rec.title)}
                    </Text>
                  </View>
                  <Text style={styles.recommendationText}>
                    {language === "si"
                      ? (rec.description_sinhala || rec.description_si || rec.description_english || rec.description_en || rec.description)
                      : language === "ta" ? (rec.description_tamil || rec.description_ta || rec.description_english || rec.description_en || rec.description)
                        : (rec.description_english || rec.description_en || rec.description_sinhala || rec.description_si || rec.description)}
                  </Text>
                  {rec.priority && (
                    <View style={[
                      styles.priorityBadge,
                      {
                        backgroundColor:
                          rec.priority === "high" || rec.priority === "High"
                            ? "#FEE2E2"
                            : rec.priority === "medium" || rec.priority === "Medium"
                              ? "#FEF3C7"
                              : "#DBEAFE",
                      },
                    ]}>
                      <Text style={[
                        styles.priorityText,
                        {
                          color:
                            rec.priority === "high" || rec.priority === "High"
                              ? "#EF4444"
                              : rec.priority === "medium" || rec.priority === "Medium"
                                ? "#F59E0B"
                                : "#3B82F6",
                        },
                      ]}>
                        {rec.priority.toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Seed Variety Comparison */}
          {suggestedVariety && varietyPotentialYield && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Leaf color="#10B981" size={20} />
                </View>
                <Text style={styles.sectionTitle}>
                  {content[language].varietyComparison}
                </Text>
              </View>

              <View style={styles.comparisonTable}>
                <View style={styles.comparisonRow}>
                  <Text style={styles.comparisonLabel}>{content[language].currentVariety}</Text>
                  <Text style={styles.comparisonValue}>{currentVariety}</Text>
                </View>
                <View style={styles.comparisonRow}>
                  <Text style={styles.comparisonLabel}>{content[language].suggestedVariety}</Text>
                  <Text style={[styles.comparisonValue, { color: "#10B981", fontWeight: "700" }]}>{suggestedVariety}</Text>
                </View>
                <View style={styles.comparisonRow}>
                  <Text style={styles.comparisonLabel}>{content[language].potentialYield}</Text>
                  <Text style={styles.comparisonValue}>
                    {(varietyPotentialYield / 1000).toFixed(2)} {content[language].tonsPerHa}
                  </Text>
                </View>
                <View style={[styles.comparisonRow, styles.comparisonRowHighlight]}>
                  <Text style={styles.comparisonLabelBold}>{content[language].yieldIncrease}</Text>
                  <Text style={[styles.comparisonValueBold, { color: "#10B981" }]}>
                    +{varietyYieldIncrease?.toFixed(1)}%
                  </Text>
                </View>
              </View>
              <View style={styles.infoBox}>
                <AlertCircle color="#10B981" size={16} />
                <Text style={styles.infoBoxText}>
                  {language === "si"
                    ? `${suggestedVariety} භාවිතා කිරීමෙන් ඔබට අස්වැන්න ${varietyYieldIncrease?.toFixed(1)}% කින් වැඩි කර ගත හැකිය`
                    : language === "ta" ? `${suggestedVariety} பயன்படுத்துவதன் மூலம் விளைச்சலை ${varietyYieldIncrease?.toFixed(1)}% அதிகரிக்கலாம்`
                      : `By using ${suggestedVariety}, you can increase yield by ${varietyYieldIncrease?.toFixed(1)}%`}
                </Text>
              </View>
            </View>
          )}

          {/* Irrigation System Comparison */}
          {suggestedIrrigation && irrigationPotentialYield && currentIrrigation !== suggestedIrrigation && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Droplets color="#10B981" size={20} />
                </View>
                <Text style={styles.sectionTitle}>
                  {content[language].irrigationComparison}
                </Text>
              </View>

              <View style={styles.comparisonTable}>
                <View style={styles.comparisonRow}>
                  <Text style={styles.comparisonLabel}>{content[language].currentIrrigation}</Text>
                  <Text style={styles.comparisonValue}>{currentIrrigation}</Text>
                </View>
                <View style={styles.comparisonRow}>
                  <Text style={styles.comparisonLabel}>{content[language].suggestedIrrigation}</Text>
                  <Text style={[styles.comparisonValue, { color: "#10B981", fontWeight: "700" }]}>{suggestedIrrigation}</Text>
                </View>
                <View style={styles.comparisonRow}>
                  <Text style={styles.comparisonLabel}>{content[language].potentialYield}</Text>
                  <Text style={styles.comparisonValue}>
                    {(irrigationPotentialYield / 1000).toFixed(2)} {content[language].tonsPerHa}
                  </Text>
                </View>
                <View style={[styles.comparisonRow, styles.comparisonRowHighlight]}>
                  <Text style={styles.comparisonLabelBold}>{content[language].yieldIncrease}</Text>
                  <Text style={[styles.comparisonValueBold, { color: "#10B981" }]}>
                    +{irrigationYieldIncrease?.toFixed(1)}%
                  </Text>
                </View>
              </View>
              <View style={styles.infoBox}>
                <AlertCircle color="#10B981" size={16} />
                <Text style={styles.infoBoxText}>
                  {language === "si"
                    ? `${suggestedIrrigation} වාරිමාර්ග භාවිතා කිරීමෙන් අස්වැන්න ${irrigationYieldIncrease?.toFixed(1)}% කින් වැඩි කර ගත හැකිය`
                    : language === "ta" ? `${suggestedIrrigation} நீர்பாசனம் பயன்படுத்துவதன் மூலம் விளைச்சலை ${irrigationYieldIncrease?.toFixed(1)}% அதிகரிக்கலாம்`
                      : `By using ${suggestedIrrigation} irrigation, you can increase yield by ${irrigationYieldIncrease?.toFixed(1)}%`}
                </Text>
              </View>
            </View>
          )}

          {/* Harvest Calculator */}
          {landSizeHa > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <TrendingUp color="#10B981" size={20} />
                </View>
                <Text style={styles.sectionTitle}>
                  {content[language].harvestCalculator}
                </Text>
              </View>

              <View style={styles.harvestCard}>
                <View style={styles.harvestRow}>
                  <Text style={styles.harvestLabel}>{content[language].landSize}:</Text>
                  <Text style={styles.harvestValue}>
                    {landSizeHa.toFixed(2)} {content[language].hectares}
                  </Text>
                </View>
                <View style={styles.harvestRow}>
                  <Text style={styles.harvestLabel}>{content[language].predictedYield}:</Text>
                  <Text style={styles.harvestValue}>
                    {yieldTonsHa.toFixed(2)} {content[language].tonsPerHa}
                  </Text>
                </View>
                <View style={[styles.harvestRow, styles.harvestRowTotal]}>
                  <Text style={styles.harvestLabelBold}>{content[language].totalHarvest}:</Text>
                  <View>
                    <Text style={styles.harvestValueBold}>
                      {totalHarvestTons.toFixed(2)} {content[language].tons}
                    </Text>
                    <Text style={styles.harvestValueSub}>
                      {totalHarvestKg.toFixed(0)} {content[language].kilograms}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Yield Converter - Real-time Calculator */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <TrendingUp color="#10B981" size={20} />
              </View>
              <Text style={styles.sectionTitle}>
                {content[language].yieldConverter}
              </Text>
            </View>

            <View style={styles.converterCard}>
              {/* Input Section */}
              <View style={styles.converterInputSection}>
                <Text style={styles.converterLabel}>
                  {content[language].enterExpectedYield}:
                </Text>
                <View style={styles.converterInputRow}>
                  <TextInput
                    style={styles.converterInput}
                    value={expectedYieldInput}
                    onChangeText={setExpectedYieldInput}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                  />

                  {/* Unit Selector */}
                  <View style={styles.unitSelector}>
                    <TouchableOpacity
                      style={[styles.unitButton, yieldUnit === "kg" && styles.unitButtonActive]}
                      onPress={() => setYieldUnit("kg")}
                    >
                      <Text style={[styles.unitButtonText, yieldUnit === "kg" && styles.unitButtonTextActive]}>
                        {content[language].kilograms}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.unitButton, yieldUnit === "tons" && styles.unitButtonActive]}
                      onPress={() => setYieldUnit("tons")}
                    >
                      <Text style={[styles.unitButtonText, yieldUnit === "tons" && styles.unitButtonTextActive]}>
                        {content[language].tons}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.unitButton, yieldUnit === "bushels" && styles.unitButtonActive]}
                      onPress={() => setYieldUnit("bushels")}
                    >
                      <Text style={[styles.unitButtonText, yieldUnit === "bushels" && styles.unitButtonTextActive]}>
                        {content[language].bushels}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Conversion Results */}
              {expectedYieldValue > 0 && (
                <View style={styles.converterResults}>
                  <Text style={styles.converterResultsTitle}>
                    {content[language].convertTo}:
                  </Text>

                  <View style={styles.converterResultRow}>
                    <View style={styles.converterResultItem}>
                      <Text style={styles.converterResultLabel}>{content[language].kilograms}</Text>
                      <Text style={styles.converterResultValue}>
                        {convertedYields.kg.toFixed(2)}
                      </Text>
                    </View>

                    <View style={styles.converterResultItem}>
                      <Text style={styles.converterResultLabel}>{content[language].tons}</Text>
                      <Text style={styles.converterResultValue}>
                        {convertedYields.tons.toFixed(3)}
                      </Text>
                    </View>

                    <View style={styles.converterResultItem}>
                      <Text style={styles.converterResultLabel}>{content[language].bushels}</Text>
                      <Text style={styles.converterResultValue}>
                        {convertedYields.bushels.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>

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
            style={[styles.requestAdviceButton, isSubmittingAdvice && styles.requestAdviceButtonDisabled]}
            onPress={handleRequestAdvice}
            disabled={isSubmittingAdvice}
          >
            {isSubmittingAdvice ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <MessageSquare color="#FFFFFF" size={20} />
            )}
            <View style={styles.requestAdviceContent}>
              <Text style={styles.requestAdviceTitle}>
                {isSubmittingAdvice
                  ? (language === "si" ? "යවමින්..." : language === "ta" ? "அனுப்புகிறது..." : "Sending...")
                  : content[language].requestAdvice}
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

      {/* Advice Request Modal */}
      <Modal
        visible={showAdviceModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAdviceModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAdviceModal(false)}
        >
          <View style={styles.modalContainer} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {language === "si" ? "උපදේශ ඉල්ලීම" : "Request Advice"}
              </Text>
              <Text style={styles.modalSubtitle}>
                {language === "si"
                  ? "ඔබට අවශ්‍ය උපදේශ වර්ගය තෝරන්න:"
                  : "Select the type of advice you need:"}
              </Text>
            </View>

            <View style={styles.modalOptions}>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => handleAdviceTypeSelect('yield_enhancement')}
              >
                <TrendingUp color="#10B981" size={24} />
                <View style={styles.modalOptionText}>
                  <Text style={styles.modalOptionTitle}>
                    {language === "si" ? "අස්වැන්න වැඩිදියුණු කිරීම" : "Yield Enhancement"}
                  </Text>
                  <Text style={styles.modalOptionDesc}>
                    {language === "si"
                      ? "වැඩි අස්වැන්නක් ලබාගැනීම සඳහා උපදේශ"
                      : "Get advice on improving your yield"}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => handleAdviceTypeSelect('seed_variety')}
              >
                <Leaf color="#10B981" size={24} />
                <View style={styles.modalOptionText}>
                  <Text style={styles.modalOptionTitle}>
                    {language === "si" ? "බීජ වර්ගය තෝරාගැනීම" : "Seed Variety Selection"}
                  </Text>
                  <Text style={styles.modalOptionDesc}>
                    {language === "si"
                      ? "හොඳම බීජ වර්ගය තෝරාගැනීමට උපදේශ"
                      : "Get help choosing the best seed variety"}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => handleAdviceTypeSelect('both')}
              >
                <MessageSquare color="#10B981" size={24} />
                <View style={styles.modalOptionText}>
                  <Text style={styles.modalOptionTitle}>
                    {language === "si" ? "දෙකම" : "Both"}
                  </Text>
                  <Text style={styles.modalOptionDesc}>
                    {language === "si"
                      ? "අස්වැන්න සහ බීජ තෝරාගැනීම දෙකටම උපදේශ"
                      : "Get advice on both yield and seed selection"}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowAdviceModal(false)}
            >
              <Text style={styles.modalCancelText}>
                {language === "si" ? "අවලංගු කරන්න" : "Cancel"}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4",
  },
  header: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    minHeight: 100,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    marginRight: 12,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#D1FAE5",
    textAlign: "center",
    marginTop: 4,
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
    flex: 1,
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
    flex: 1,
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
  priorityBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
    marginLeft: 20,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: "700",
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
  requestAdviceButtonDisabled: {
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  modalOptions: {
    gap: 12,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    gap: 12,
  },
  modalOptionText: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  modalOptionDesc: {
    fontSize: 12,
    color: "#6B7280",
  },
  modalCancelButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    gap: 8,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    color: "#065F46",
    lineHeight: 18,
  },
  harvestCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  harvestRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  harvestRowTotal: {
    backgroundColor: "#F0FDF4",
    marginHorizontal: -16,
    paddingHorizontal: 16,
    marginBottom: -16,
    paddingBottom: 16,
    paddingTop: 16,
    borderBottomWidth: 0,
    borderRadius: 12,
    marginTop: 8,
  },
  harvestLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  harvestValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  harvestLabelBold: {
    fontSize: 15,
    fontWeight: "700",
    color: "#065F46",
  },
  harvestValueBold: {
    fontSize: 20,
    fontWeight: "700",
    color: "#10B981",
    textAlign: "right",
  },
  harvestValueSub: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "right",
    marginTop: 2,
  },
  converterCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  converterInputSection: {
    marginBottom: 16,
  },
  converterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  converterInputRow: {
    gap: 12,
  },
  converterInput: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  unitSelector: {
    flexDirection: "row",
    gap: 8,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  unitButtonActive: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  unitButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  unitButtonTextActive: {
    color: "#FFFFFF",
  },
  converterResults: {
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  converterResultsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#065F46",
    marginBottom: 12,
  },
  converterResultRow: {
    flexDirection: "row",
    gap: 12,
  },
  converterResultItem: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  converterResultLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 4,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  converterResultValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#10B981",
  },
});

export default YieldPredictionResultsScreen;
