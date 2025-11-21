import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { PriceForecastStackParamList } from "../../navigation/PriceForecastStack";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Leaf,
  Package,
  AlertCircle,
  CheckCircle,
  Bell,
  MapPin,
  CloudSun,
  RefreshCw,
  Sun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudSnow,
  CloudLightning,
  CloudFog,
} from "lucide-react-native";
import useUniversalLocation from "../../utils/useUniversalLocation";

const { width } = Dimensions.get("window");

type Language = "si" | "en";
type NavProp = StackNavigationProp<
  PriceForecastStackParamList,
  "PriceForecastScreen"
>;

interface ForecastData {
  year: string;
  week: string;
  district: string;
  season: string;
  weather: string;
  fuelPrice: string;
  cornImportTax: string;
  farmGatePrice: string;
  seedVariety: string;
  expectedYield: number;
  farmArea: number;
  totalCost: number;
  productionCostPerKg: number;
  hasStorage: boolean;
  language: Language;
}

const PriceForecastScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute();
  const [language, setLanguage] = useState<Language>("si");
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const {
    locationName,
    temperature,
    weatherCondition,
    weatherIcon,
    isLoading,
  } = useUniversalLocation(language);

  // State for district and weather display
  const [district, setDistrict] = useState("");
  const [weather, setWeather] = useState("");

  // Get data from route params (from form)
  const formData = (route.params as any)?.data as ForecastData | undefined;

  // Forecast results (mock data - replace with ML prediction)
  const [predictedPrice, setPredictedPrice] = useState(125.5);
  const [priceChange, setPriceChange] = useState(15.2);
  const [confidenceScore, setConfidenceScore] = useState(87);
  const [recommendation, setRecommendation] = useState("sell_now");

  const content = {
    si: {
      title: "මිල පුරෝකථනය",
      subtitle: "ඔබේ පුරෝකථන ප්‍රතිඵල",
      predictedPrice: "අපේක්ෂිත මිල",
      perKg: "කිලෝ ග්‍රෑම් එකකට",
      priceIncrease: "මිල වැඩිවීම",
      priceDecrease: "මිල අඩුවීම",
      vsCurrentPrice: "වත්මන් මිලට සාපේක්ෂව",
      confidence: "විශ්වාසනීයත්වය",
      recommendation: "නිර්දේශය",
      marketConditions: "වෙළඳපල තත්ත්වය",
      profitAnalysis: "ලාභ විශ්ලේෂණය",
      totalYield: "මුළු අස්වැන්න",
      totalRevenue: "මුළු ආදායම",
      totalCost: "මුළු වියදම",
      expectedProfit: "අපේක්ෂිත ලාභය",
      profitMargin: "ලාභ ආන්තිකය",
      sellNow: "දැන් විකිණීම හොඳයි",
      sellLater: "තව සතියක් බලාගෙන සිටින්න",
      storageAdvice: "ගබඩා කර රඳාගෙන සිටින්න",
      sellImmediately: "ඉක්මනින් විකිණන්න",
      marketFactors: "වෙළඳපල සාධක",
      seasonEffect: "කන්න බලපෑම",
      weatherEffect: "කාලගුණ බලපෑම",
      fuelEffect: "ඉන්ධන බලපෑම",
      importEffect: "ආනයන බලපෑම",
      high: "ඉහළ",
      medium: "මධ්‍යම",
      low: "අඩු",
      positive: "ධනාත්මක",
      negative: "ඍණාත්මක",
      neutral: "මධ්‍යස්ථ",
      newForecast: "අලුත් පුරෝකථනයක්",
      backToForm: "ආපසු යන්න",
      kg: "කි.ග්‍රෑ",
      detecting: "හඳුනාගනිමින්...",
      loading: "පූරණය වෙමින්...",
      locationDetecting: "ස්ථානය හඳුනාගනිමින්...",
      weatherLoading: "කාලගුණය පූරණය වෙමින්...",
    },
    en: {
      title: "Price Forecast",
      subtitle: "Your Forecast Results",
      predictedPrice: "Predicted Price",
      perKg: "per kilogram",
      priceIncrease: "Price Increase",
      priceDecrease: "Price Decrease",
      vsCurrentPrice: "vs current price",
      confidence: "Confidence",
      recommendation: "Recommendation",
      marketConditions: "Market Conditions",
      profitAnalysis: "Profit Analysis",
      totalYield: "Total Yield",
      totalRevenue: "Total Revenue",
      totalCost: "Total Cost",
      expectedProfit: "Expected Profit",
      profitMargin: "Profit Margin",
      sellNow: "Good time to sell",
      sellLater: "Wait another week",
      storageAdvice: "Store and hold",
      sellImmediately: "Sell immediately",
      marketFactors: "Market Factors",
      seasonEffect: "Season Effect",
      weatherEffect: "Weather Effect",
      fuelEffect: "Fuel Effect",
      importEffect: "Import Effect",
      high: "High",
      medium: "Medium",
      low: "Low",
      positive: "Positive",
      negative: "Negative",
      neutral: "Neutral",
      newForecast: "New Forecast",
      backToForm: "Back to Form",
      kg: "kg",
      detecting: "Detecting...",
      loading: "Loading...",
      locationDetecting: "Detecting location...",
      weatherLoading: "Loading weather...",
    },
  };

  // Enhanced weather translation mapping
  const getWeatherTranslation = (condition: string, lang: Language): string => {
    if (!condition) return lang === "si" ? "කාලගුණය" : "Weather";

    const c = condition.toLowerCase();

    // ---- RAIN ----
    if (c.includes("shower rain") || c.includes("light intensity shower")) {
      return lang === "si" ? "සෙමෙන් වැසි" : "Light Shower Rain";
    }
    if (c.includes("light rain")) {
      return lang === "si" ? "සැහැල්ලු වැසි" : "Light Rain";
    }
    if (c.includes("moderate rain")) {
      return lang === "si" ? "මධ්‍යම වැසි" : "Moderate Rain";
    }
    if (c.includes("heavy") && c.includes("rain")) {
      return lang === "si" ? "බර වැසි" : "Heavy Rain";
    }

    // ---- CLOUDS ----
    if (c.includes("clear")) {
      return lang === "si" ? "පිරිසිදු අහස" : "Clear Sky";
    }
    if (c.includes("few clouds")) {
      return lang === "si" ? "සුළු වලාකුළු" : "Few Clouds";
    }
    if (c.includes("scattered")) {
      return lang === "si" ? "විසිරුණු වලාකුළු" : "Scattered Clouds";
    }
    if (c.includes("broken")) {
      return lang === "si" ? "කැබලි වලාකුළු" : "Broken Clouds";
    }
    if (c.includes("overcast")) {
      return lang === "si" ? "තද වලාකුළු" : "Overcast Clouds";
    }

    // ---- THUNDER ----
    if (c.includes("thunder")) {
      return lang === "si" ? "අකුණු සහිත වැසි" : "Thunderstorm";
    }

    // ---- MIST / FOG ----
    if (c.includes("mist") || c.includes("fog") || c.includes("haze")) {
      return lang === "si" ? "මීදුම" : "Mist";
    }

    // DEFAULT
    return lang === "si" ? "කාලගුණය" : condition;
  };

  const getWeatherIcon = (condition: string | null) => {
    if (!condition) return <Cloud size={18} color="#10B981" />;

    const c = condition.toLowerCase();

    if (c.includes("clear")) return <Sun size={18} color="#f59e0b" />;

    if (c.includes("rain") && c.includes("light"))
      return <CloudDrizzle size={18} color="#0ea5e9" />;

    if (c.includes("rain")) return <CloudRain size={18} color="#0284c7" />;

    if (c.includes("thunder"))
      return <CloudLightning size={18} color="#e11d48" />;

    if (c.includes("mist") || c.includes("fog") || c.includes("haze"))
      return <CloudFog size={18} color="#6b7280" />;

    if (c.includes("cloud")) return <Cloud size={18} color="#10b981" />;

    return <Cloud size={18} color="#10b981" />;
  };

  useEffect(() => {
    // Set language from form data
    if (formData?.language) {
      setLanguage(formData.language);
    }

    // Animate on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Generate forecast (mock - replace with API call)
    generateForecast();
  }, []);

  // Update district and weather when location data changes
  useEffect(() => {
    // Update district
    if (isLoading) {
      setDistrict(content[language].locationDetecting);
    } else if (locationName && locationName !== "Loading...") {
      setDistrict(locationName);
    } else {
      setDistrict(language === "si" ? "ස්ථානය නොමැත" : "Location unavailable");
    }

    // Update weather
    if (isLoading) {
      setWeather(content[language].weatherLoading);
    } else if (temperature !== null && weatherCondition) {
      const translatedCondition = getWeatherTranslation(
        weatherCondition,
        language
      );
      setWeather(`${Math.round(temperature)}°C • ${translatedCondition}`);
    } else {
      setWeather(
        language === "si" ? "කාලගුණ දත්ත නොමැත" : "Weather unavailable"
      );
    }
  }, [locationName, temperature, weatherCondition, isLoading, language]);

  const generateForecast = () => {
    // TODO: Call ML API with formData
    // Mock prediction logic
    const basePrice = 115;
    const randomChange = Math.random() * 20 - 5;
    setPredictedPrice(basePrice + randomChange);
    setPriceChange(((randomChange / basePrice) * 100));
    setConfidenceScore(Math.floor(Math.random() * 15) + 75);

    // Recommendation logic
    if (randomChange > 10) {
      setRecommendation("sell_now");
    } else if (randomChange > 0) {
      setRecommendation(formData?.hasStorage ? "storage" : "sell_now");
    } else {
      setRecommendation("sell_later");
    }
  };

  const calculateProfit = () => {
    if (!formData) return { revenue: 0, profit: 0, margin: 0 };
    const totalYield = formData.expectedYield * formData.farmArea;
    const revenue = totalYield * predictedPrice;
    const profit = revenue - formData.totalCost;
    const margin = (profit / revenue) * 100;
    return { revenue, profit, margin, totalYield };
  };

  const getRecommendationText = () => {
    if (recommendation === "sell_now") {
      return content[language].sellNow;
    } else if (recommendation === "storage") {
      return content[language].storageAdvice;
    } else if (recommendation === "sell_immediately") {
      return content[language].sellImmediately;
    } else {
      return content[language].sellLater;
    }
  };

  const getRecommendationColor = () => {
    if (recommendation === "sell_now" || recommendation === "sell_immediately") {
      return "#10B981";
    } else if (recommendation === "storage") {
      return "#3B82F6";
    } else {
      return "#F59E0B";
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleStartOver = () => {
    navigation.navigate("PriceForecastLoadingScreen");
  };

  const { revenue, profit, margin, totalYield } = calculateProfit();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft color="#047857" size={24} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{content[language].title}</Text>
          <Text style={styles.headerSubtitle}>
            {content[language].subtitle}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Bell color="#10B981" size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.langButton}
            onPress={() => setLanguage((prev) => (prev === "si" ? "en" : "si"))}
          >
            <Text style={styles.langText}>
              {language === "si" ? "EN" : "සිං"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sub-header */}
      <View style={styles.subHeader}>
        <View style={styles.infoCard}>
          {getWeatherIcon(weatherCondition)}
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>
              {language === "si" ? "ස්ථානය" : "Location"}
            </Text>
            <Text style={styles.infoValue}>{district}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoCard}>
          <CloudSun color="#10B981" size={18} />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>
              {language === "si" ? "කාලගුණය" : "Weather"}
            </Text>
            <Text style={styles.infoValue}>{weather}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Main Price Card */}
          <View style={styles.priceCard}>
            <View style={styles.priceIconCircle}>
              <DollarSign color="#10B981" size={32} />
            </View>
            <Text style={styles.priceLabel}>
              {content[language].predictedPrice}
            </Text>
            <Text style={styles.priceValue}>රු. {predictedPrice.toFixed(2)}</Text>
            <Text style={styles.priceUnit}>{content[language].perKg}</Text>

            <View
              style={[
                styles.trendBadge,
                {
                  backgroundColor:
                    priceChange >= 0 ? "#D1FAE5" : "#FEE2E2",
                },
              ]}
            >
              {priceChange >= 0 ? (
                <TrendingUp color="#10B981" size={16} />
              ) : (
                <TrendingDown color="#EF4444" size={16} />
              )}
              <Text
                style={[
                  styles.trendText,
                  { color: priceChange >= 0 ? "#047857" : "#DC2626" },
                ]}
              >
                {priceChange >= 0 ? "+" : ""}
                {priceChange.toFixed(1)}%
              </Text>
              <Text style={styles.trendSubtext}>
                {content[language].vsCurrentPrice}
              </Text>
            </View>

            {/* Confidence Score */}
            <View style={styles.confidenceBar}>
              <Text style={styles.confidenceLabel}>
                {content[language].confidence}
              </Text>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${confidenceScore}%`,
                      backgroundColor:
                        confidenceScore >= 80
                          ? "#10B981"
                          : confidenceScore >= 60
                          ? "#F59E0B"
                          : "#EF4444",
                    },
                  ]}
                />
              </View>
              <Text style={styles.confidenceValue}>{confidenceScore}%</Text>
            </View>
          </View>

          {/* Recommendation Card */}
          <View
            style={[
              styles.recommendationCard,
              { borderLeftColor: getRecommendationColor() },
            ]}
          >
            <View style={styles.recommendationHeader}>
              <CheckCircle color={getRecommendationColor()} size={24} />
              <Text style={styles.recommendationTitle}>
                {content[language].recommendation}
              </Text>
            </View>
            <Text style={styles.recommendationText}>
              {getRecommendationText()}
            </Text>
            {formData?.hasStorage && recommendation === "storage" && (
              <View style={styles.storageNote}>
                <Package color="#3B82F6" size={16} />
                <Text style={styles.storageNoteText}>
                  {language === "si"
                    ? "ඔබට ගබඩා පහසුකම් ඇත - මිල වැඩිවන තුරු රඳවා තබන්න"
                    : "You have storage - hold until price increases"}
                </Text>
              </View>
            )}
          </View>

          {/* Profit Analysis */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              💰 {content[language].profitAnalysis}
            </Text>

            <View style={styles.profitGrid}>
              <View style={styles.profitCard}>
                <Leaf color="#10B981" size={20} />
                <Text style={styles.profitLabel}>
                  {content[language].totalYield}
                </Text>
                <Text style={styles.profitValue}>
                  {(totalYield ?? 0).toFixed(0)} {content[language].kg}
                </Text>
              </View>

              <View style={styles.profitCard}>
                <DollarSign color="#3B82F6" size={20} />
                <Text style={styles.profitLabel}>
                  {content[language].totalRevenue}
                </Text>
                <Text style={styles.profitValue}>
                  රු. {revenue.toFixed(0)}
                </Text>
              </View>

              <View style={styles.profitCard}>
                <DollarSign color="#EF4444" size={20} />
                <Text style={styles.profitLabel}>
                  {content[language].totalCost}
                </Text>
                <Text style={styles.profitValue}>
                  රු. {formData?.totalCost.toFixed(0) || 0}
                </Text>
              </View>

              <View style={[styles.profitCard, styles.profitCardHighlight]}>
                <TrendingUp color="#10B981" size={20} />
                <Text style={styles.profitLabel}>
                  {content[language].expectedProfit}
                </Text>
                <Text style={[styles.profitValue, styles.profitValueHighlight]}>
                  රු. {profit.toFixed(0)}
                </Text>
                <Text style={styles.profitMargin}>
                  {margin.toFixed(1)}% {content[language].profitMargin}
                </Text>
              </View>
            </View>
          </View>

          {/* Market Factors */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              📊 {content[language].marketFactors}
            </Text>

            <View style={styles.factorsList}>
              <View style={styles.factorItem}>
                <View style={styles.factorIcon}>
                  <Leaf color="#10B981" size={18} />
                </View>
                <View style={styles.factorContent}>
                  <Text style={styles.factorLabel}>
                    {content[language].seasonEffect}
                  </Text>
                  <Text style={styles.factorValue}>
                    {formData?.season} - {content[language].high}
                  </Text>
                </View>
                <View style={[styles.factorBadge, styles.factorBadgePositive]}>
                  <Text style={styles.factorBadgeText}>
                    {content[language].positive}
                  </Text>
                </View>
              </View>

              <View style={styles.factorItem}>
                <View style={styles.factorIcon}>
                  <CloudSun color="#3B82F6" size={18} />
                </View>
                <View style={styles.factorContent}>
                  <Text style={styles.factorLabel}>
                    {content[language].weatherEffect}
                  </Text>
                  <Text style={styles.factorValue}>
                    {content[language].medium}
                  </Text>
                </View>
                <View style={[styles.factorBadge, styles.factorBadgeNeutral]}>
                  <Text style={styles.factorBadgeText}>
                    {content[language].neutral}
                  </Text>
                </View>
              </View>

              <View style={styles.factorItem}>
                <View style={styles.factorIcon}>
                  <DollarSign color="#F59E0B" size={18} />
                </View>
                <View style={styles.factorContent}>
                  <Text style={styles.factorLabel}>
                    {content[language].fuelEffect}
                  </Text>
                  <Text style={styles.factorValue}>
                    {formData?.fuelPrice} - {content[language].high}
                  </Text>
                </View>
                <View style={[styles.factorBadge, styles.factorBadgeNegative]}>
                  <Text style={styles.factorBadgeText}>
                    {content[language].negative}
                  </Text>
                </View>
              </View>

              <View style={styles.factorItem}>
                <View style={styles.factorIcon}>
                  <Package color="#8B5CF6" size={18} />
                </View>
                <View style={styles.factorContent}>
                  <Text style={styles.factorLabel}>
                    {content[language].importEffect}
                  </Text>
                  <Text style={styles.factorValue}>
                    {formData?.cornImportTax}
                  </Text>
                </View>
                <View style={[styles.factorBadge, styles.factorBadgePositive]}>
                  <Text style={styles.factorBadgeText}>
                    {content[language].positive}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleStartOver}
          >
            <RefreshCw color="#FFFFFF" size={20} />
            <Text style={styles.primaryButtonText}>
              {content[language].newForecast}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleGoBack}
          >
            <Text style={styles.secondaryButtonText}>
              {content[language].backToForm}
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
    paddingBottom: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  langButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#10B981",
  },
  langText: {
    color: "#10B981",
    fontSize: 12,
    fontWeight: "bold",
  },
  subHeader: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#047857",
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 12,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  content: {
    flex: 1,
  },
  priceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#10B981",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  priceIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
    fontWeight: "500",
  },
  priceValue: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#10B981",
    marginBottom: 4,
  },
  priceUnit: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 20,
  },
  trendText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  trendSubtext: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  confidenceBar: {
    width: "100%",
    alignItems: "center",
  },
  confidenceLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 8,
    fontWeight: "500",
  },
  progressBarContainer: {
    width: "100%",
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 10,
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#047857",
  },
  recommendationCard: {
    backgroundColor: "#ECFDF5",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
  },
  recommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#047857",
  },
  recommendationText: {
    fontSize: 16,
    color: "#065F46",
    lineHeight: 24,
    fontWeight: "500",
  },
  storageNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: "#DBEAFE",
    borderRadius: 10,
  },
  storageNoteText: {
    flex: 1,
    fontSize: 13,
    color: "#1E40AF",
    fontWeight: "500",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#065F46",
    marginBottom: 16,
  },
  profitGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  profitCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    width: "48%",
    borderWidth: 1,
    borderColor: "#D1FAE5",
    alignItems: "center",
  },
  profitCardHighlight: {
    width: "100%",
    backgroundColor: "#ECFDF5",
    borderWidth: 2,
    borderColor: "#10B981",
  },
  profitLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
    fontWeight: "500",
  },
  profitValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#047857",
    marginTop: 6,
    textAlign: "center",
  },
  profitValueHighlight: {
    fontSize: 24,
    color: "#10B981",
  },
  profitMargin: {
    fontSize: 11,
    color: "#059669",
    marginTop: 4,
    fontWeight: "600",
  },
  factorsList: {
    gap: 12,
  },
  factorItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  factorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  factorContent: {
    flex: 1,
  },
  factorLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 4,
    fontWeight: "500",
  },
  factorValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  factorBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  factorBadgePositive: {
    backgroundColor: "#D1FAE5",
  },
  factorBadgeNegative: {
    backgroundColor: "#FEE2E2",
  },
  factorBadgeNeutral: {
    backgroundColor: "#FEF3C7",
  },
  factorBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#10B981",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  secondaryButton: {
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 12,
  },
  secondaryButtonText: {
    color: "#059669",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default PriceForecastScreen;