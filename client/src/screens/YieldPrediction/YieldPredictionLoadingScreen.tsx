import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { YieldPredictionStackParamList } from "../../navigation/YieldPredictionStack";
import { Leaf, Users, Package, ArrowLeft, Sparkles, TestTube, BookOpen, MessageCircle, Edit3 } from "lucide-react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useApp } from "../../context/AppContext";
import { useLanguage } from "../../context/LanguageContext";
import DataConfirmationModal from "../../components/DataConfirmationModal";
import ProUpgradePopup from "../../components/ProUpgradePopup";
import FarmerSoilTestModal from "../../components/FarmerSoilTestModal";
import SoilTestImportanceModal from "../../components/SoilTestImportanceModal";

const { width } = Dimensions.get("window");

type NavProp = StackNavigationProp<
  YieldPredictionStackParamList,
  "YieldPredictionLoadingScreen"
>;

const YieldPredictionLoadingScreen = () => {
  const navigation = useNavigation<NavProp>();
  const { language: lang } = useLanguage();
  const language: "si" | "en" | "ta" = lang === "sinhala" ? "si" : lang === "tamil" ? "ta" : "en";
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [showProPopup, setShowProPopup] = useState(false);
  const [showSoilTestModal, setShowSoilTestModal] = useState(false);
  const [showImportanceModal, setShowImportanceModal] = useState(false);
  const { user } = useApp();

  // Role-based authentication using Supabase user data
  const isFarmer = user?.role === "farmer";
  const isOfficer = user?.role === "officer";

  // Compute active subscription status from user profile
  const hasActiveSubscription = (() => {
    if (!user?.is_paid_user) return false;
    const endRaw = user?.subscription_end_date;
    if (!endRaw) return false;
    try {
      const endDate = new Date(String(endRaw).replace("Z", "+00:00"));
      return endDate > new Date();
    } catch {
      return false;
    }
  })();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const content = {
    si: {
      title: "අස්වැන්න පුරෝකථනය සහ පොහොර උපදේශන",
      subtitle: "",
      servicesTitle: "අපගේ සේවාවන්",
      startTitle: "පුරෝකථනය ආරම්භ කරන්න",
      wetWeightPrediction: "තෙත් බර අස්වැන්න පුරෝකථනය",
      wetWeightPredictionDesc: "AI මාදිලිය භාවිතයෙන් පාලිත තෙත් බර අස්වැන්න පුරෝකථනය කරන්න",
      startDesc: "ඔබේ අස්වැන්න පහසුවෙන් පුරෝකථනය කරන්න",
      farmerForecastTitle: "දළ පුරෝකථනය",
      farmerForecastDesc: "ඉක්මන් සහ සරල අස්වැන්න පුරෝකථනය",
      officerForecastTitle: "වෘත්තීය/උසස් විශ්ලේෂණය",
      officerForecastDesc: "සවිස්තරාත්මක සහ ගැඹුරු අස්වැන්න විශ්ලේෂණය",
      fertilizerTitle: "පොහොර උපදේශ",
      fertilizerDesc: "පුද්ගලාරෝපිත පොහොර නිර්දේශ ලබා ගන්න",
      fertilizerRecommendation: "පොහොර නිර්දේශ",
      fertilizerRecommendationDesc: "ගොවීන්ට පොහොර උපදේශ ලබා දෙන්න",
      farmerRequests: "ගොවි ඉල්ලීම්",
      farmerRequestsDesc: "ගොවීන්ගේ උපදේශ ඉල්ලීම් බලන්න",
      chatWithFarmers: "ගොවීන් සමඟ කතා කරන්න",
      chatWithFarmersDesc: "ගොවීන්ට සජීවී උපදේශ සපයන්න",
      editFertilizerPlans: "පොහොර සැලසුම් සංස්කරණය",
      editFertilizerPlansDesc: "පොහොර සැලසුම් සංස්කරණය කරන්න",
      myAdviceRequests: "මගේ උපදේශ ඉල්ලීම්",
      myAdviceRequestsDesc: "නිලධාරීන්ගෙන් ලැබුණු උපදේශ බලන්න",
      comingSoon: "ඉදිරි දිනවල",
      soilTestTitle: "පස් පරීක්ෂණ ඉල්ලීම",
      soilTestDesc: "ඔබේ ඉඩමට පස් පරීක්ෂණයක් ඉල්ලන්න",
      fertilizerAssistant: "ඔබේ පොහොර උපදේශ සහායක",
      fertilizerAssistantDesc: "දෘශ්‍යමාන ලක්ෂණ මත පදනම්ව පොහොර උපදේශ ලබා ගන්න",
      knowledgeBank: "පෝෂක මාර්ගෝපදේශ",
      knowledgeBankDesc: "වගාව සඳහා වැදගත් වන පෝෂක තොරතුරු ලබාගන්න",
    },
    en: {
      title: "Yield Prediction and Fertilizer Advisory",
      subtitle: "",
      servicesTitle: "Our Services",
      startTitle: "Start Prediction",
      startDesc: "Get your yield prediction quickly",
      wetWeightPrediction: "Wet Weight Yield Prediction",
      wetWeightPredictionDesc: "Predict controlled wet weight yield using AI model",
      farmerForecastTitle: "Gross Forecast",
      farmerForecastDesc: "Quick and simple yield prediction",
      officerForecastTitle: "Professional/Advanced Analysis",
      officerForecastDesc: "Detailed and deep yield analysis",
      fertilizerTitle: "Fertilizer Advices",
      fertilizerDesc: "Get personalized fertilizer recommendations",
      fertilizerRecommendation: "Fertilizer Recommendation",
      fertilizerRecommendationDesc: "Provide fertilizer advice to farmers",
      farmerRequests: "Farmer Requests",
      farmerRequestsDesc: "View farmer advice requests with yield predictions",
      chatWithFarmers: "Chat With Farmers",
      chatWithFarmersDesc: "Provide live advice to farmers",
      editFertilizerPlans: "Edit Fertilizer Plans",
      editFertilizerPlansDesc: "Manage and update fertilizer plans",
      myAdviceRequests: "My Advice Requests",
      myAdviceRequestsDesc: "View advice received from officers",
      comingSoon: "Coming soon",
      soilTestTitle: "Request Soil Testing",
      soilTestDesc: "Request a soil test for your land",
      fertilizerAssistant: "Your Fertilizer Advisory Assistant",
      fertilizerAssistantDesc: "Get fertilizer advices on visible signs based",
      knowledgeBank: "Fertilizer Guidelines",
      knowledgeBankDesc: "Get important nutrient information for cultivation",
    },
    ta: {
      title: "விளைச்சல் கணிப்பு மற்றும் உர ஆலோசனை",
      subtitle: "",
      servicesTitle: "எங்கள் சேவைகள்",
      startTitle: "கணிப்பை தொடங்குங்கள்",
      startDesc: "உங்கள் விளைச்சலை விரைவாக கணிக்கவும்",
      wetWeightPrediction: "ஈரமான எடை விளைச்சல் கணிப்பு",
      wetWeightPredictionDesc: "AI மாதிரியைப் பயன்படுத்தி கட்டுப்படுத்தப்பட்ட ஈரமான எடை விளைச்சலை கணிக்கவும்",
      farmerForecastTitle: "பொது கணிப்பு",
      farmerForecastDesc: "விரைவான மற்றும் எளிய விளைச்சல் கணிப்பு",
      officerForecastTitle: "தொழில்முனை/மேம்பட்ட பகுப்பாய்வு",
      officerForecastDesc: "விரிவான மற்றும் ஆழமான விளைச்சல் பகுப்பாய்வு",
      fertilizerTitle: "உர ஆலோசனைகள்",
      fertilizerDesc: "தனிப்பயனாட்ட உர பரிந்துரைகளை பெறுங்கள்",
      fertilizerRecommendation: "உர பரிந்துரை",
      fertilizerRecommendationDesc: "விவசாயிகளுக்கு உர ஆலோசனை வழங்குங்கள்",
      farmerRequests: "விவசாயி கோரிக்கைகள்",
      farmerRequestsDesc: "விவசாயிகளின் ஆலோசனை கோரிக்கைகளை பார்க்கவும்",
      chatWithFarmers: "விவசாயிகளுடன் பேசுங்கள்",
      chatWithFarmersDesc: "விவசாயிகளுக்கு நேரடி ஆலோசனை வழங்குங்கள்",
      editFertilizerPlans: "உர திட்டங்களை திருத்துக",
      editFertilizerPlansDesc: "உர திட்டங்களை நிர்வகிக்கவும் புதுப்பிக்கவும்",
      myAdviceRequests: "என் ஆலோசனை கோரிக்கைகள்",
      myAdviceRequestsDesc: "அதிகாரிகளிடமிருந்து பெற்ற ஆலோசனைகளை பார்க்கவும்",
      comingSoon: "விரைவில்",
      soilTestTitle: "மண் பரிசோதனை கோரிக்கை",
      soilTestDesc: "உங்கள் நிலத்திற்கு மண் பரிசோதனையை கோருங்கள்",
      fertilizerAssistant: "உங்கள் உர ஆலோசனை உதவியாளர்",
      fertilizerAssistantDesc: "கண்ணுக்குத் தெரியும் அறிகுறிகளின் அடிப்படையில் உர ஆலோசனை பெறுங்கள்",
      knowledgeBank: "உர வழிகாட்டுதல்கள்",
      knowledgeBankDesc: "பயிர்ச்செய்கைக்கான முக்கிய ஊட்டச்சத்து தகவல்களைப் பெறுங்கள்",
    },
  };

  const showOfficerDataConfirmation = () => {
    setShowConfirmationModal(true);
  };

  const handleConfirmProceed = () => {
    setShowConfirmationModal(false);
    navigation.navigate("YieldPredictionOfficerFormScreen", { language: language === "ta" ? "en" : language });
  };

  const handleRoleSelect = (role: "farmer" | "officer") => {
    // Verify user role matches the selected action
    if (!user) {
      Alert.alert(
        language === "si" ? "දෝෂයකි" : "Error",
        language === "si"
          ? "කරුණාකර පළමුව පුරනය වන්න"
          : "Please log in first"
      );
      return;
    }

    if (role === "farmer" && user.role !== "farmer") {
      Alert.alert(
        language === "si" ? "ප්‍රවේශය වසා ඇත" : "Access Denied",
        language === "si"
          ? "මෙම විශේෂාංගය ගොවීන් සඳහා පමණි"
          : "This feature is only available for farmers"
      );
      return;
    }

    if (role === "officer" && user.role !== "officer") {
      Alert.alert(
        language === "si" ? "ප්‍රවේශය වසා ඇත" : "Access Denied",
        language === "si"
          ? "මෙම විශේෂාංගය නිලධාරීන් සඳහා පමණි"
          : "This feature is only available for officers"
      );
      return;
    }

    if (role === "farmer") {
      // Show two-step confirmation popup for farmers
      showFarmerSoilTestConfirmation();
    } else {
      // Show data confirmation checklist for officers
      showOfficerDataConfirmation();
    }
  };

  const showFarmerSoilTestConfirmation = () => {
    setShowSoilTestModal(true);
  };

  const showSoilTestImportanceMessage = () => {
    setShowSoilTestModal(false);
    setShowImportanceModal(true);
  };

  const handleSoilTestConfirm = () => {
    setShowSoilTestModal(false);
    navigation.navigate("YieldPredictionFormScreen", { role: "farmer", language: language === "ta" ? "en" : language });
  };

  const handleComingSoon = (feature: string) => {
    Alert.alert(
      language === "si" ? "ඉදිරි දිනවල" : "Coming soon",
      language === "si"
        ? `${feature} මොඩියුලය ඉක්මනින් ලබා දෙනු ඇත.`
        : `${feature} will be available soon.`
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
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
            <Text style={styles.headerTitle}>{content[language].title}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Action Cards */}
          <View style={styles.roleContainer}>
            {isFarmer ? (
              <>
                {/* Card 1: Start Prediction */}
                <TouchableOpacity
                  style={styles.roleCard}
                  onPress={() => handleRoleSelect("farmer")}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={["#ECFDF5", "#D1FAE5"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.roleCardGradient}
                  >
                    <View style={styles.roleIconCircle}>
                      <Leaf color="#10b981" size={32} />
                    </View>
                    <View style={styles.roleContent}>
                      <Text style={styles.roleTitle}>
                        {content[language].farmerForecastTitle}
                      </Text>
                      <Text style={styles.roleDesc}>
                        {content[language].farmerForecastDesc}
                      </Text>
                    </View>
                    <View style={styles.roleArrow}>
                      <Text style={styles.roleArrowText}>→</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Card 2: Your Fertilizer Advisory Assistant */}
                <TouchableOpacity
                  style={styles.roleCard}
                  onPress={() => navigation.navigate("RuleBasedAdvisoryInputScreen")}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={["#ECFDF5", "#D1FAE5"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.roleCardGradient}
                  >
                    <View style={styles.roleIconCircle}>
                      <Sparkles color="#10b981" size={32} />
                    </View>
                    <View style={styles.roleContent}>
                      <Text style={styles.roleTitle}>
                        {content[language].fertilizerAssistant}
                      </Text>
                      <Text style={styles.roleDesc}>
                        {content[language].fertilizerAssistantDesc}
                      </Text>
                    </View>
                    <View style={styles.roleArrow}>
                      <Text style={styles.roleArrowText}>→</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Card 3: My Advice Requests */}
                <TouchableOpacity
                  style={styles.roleCard}
                  onPress={() => navigation.navigate("MyAdviceRequestsScreen")}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={["#FEF3C7", "#FDE68A"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.roleCardGradient}
                  >
                    <View style={[styles.roleIconCircle, { backgroundColor: "#FDE68A" }]}>
                      <Users color="#f59e0b" size={32} />
                    </View>
                    <View style={styles.roleContent}>
                      <Text style={styles.roleTitle}>
                        {content[language].myAdviceRequests}
                      </Text>
                      <Text style={styles.roleDesc}>
                        {content[language].myAdviceRequestsDesc}
                      </Text>
                    </View>
                    <View style={styles.roleArrow}>
                      <Text style={styles.roleArrowText}>→</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Card 4: Soil Test Request (Pro Feature) */}
                <TouchableOpacity
                  style={styles.roleCard}
                  onPress={() => {
                    if (hasActiveSubscription) {
                      navigation.navigate("SoilTestRequest");
                    } else {
                      setShowProPopup(true);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={["#F3E8FF", "#E9D5FF"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.roleCardGradient}
                  >
                    <View style={[styles.roleIconCircle, { backgroundColor: "#E9D5FF" }]}>
                      <TestTube color="#9333ea" size={32} />
                    </View>
                    <View style={styles.roleContent}>
                      <View style={styles.proFeatureBadge}>
                        <Sparkles size={12} color="#9333ea" />
                        <Text style={styles.proFeatureText}>Pro</Text>
                      </View>
                      <Text style={styles.roleTitle}>
                        {content[language].soilTestTitle}
                      </Text>
                      <Text style={styles.roleDesc}>
                        {content[language].soilTestDesc}
                      </Text>
                    </View>
                    <View style={styles.roleArrow}>
                      <Text style={styles.roleArrowText}>→</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Card 5: Knowledge Bank */}
                <TouchableOpacity
                  style={styles.roleCard}
                  onPress={() => navigation.navigate("KnowledgeBankMain")}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={["#FFF7ED", "#FFEDD5"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.roleCardGradient}
                  >
                    <View style={[styles.roleIconCircle, { backgroundColor: "#FFEDD5" }]}>
                      <BookOpen color="#ea580c" size={32} />
                    </View>
                    <View style={styles.roleContent}>
                      <Text style={styles.roleTitle}>
                        {content[language].knowledgeBank}
                      </Text>
                      <Text style={styles.roleDesc}>
                        {content[language].knowledgeBankDesc}
                      </Text>
                    </View>
                    <View style={styles.roleArrow}>
                      <Text style={styles.roleArrowText}>→</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Card 1: Officer Forecast */}
                <TouchableOpacity
                  style={styles.roleCard}
                  onPress={() => handleRoleSelect("officer")}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={["#ECFDF5", "#D1FAE5"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.roleCardGradient}
                  >
                    <View style={styles.roleIconCircle}>
                      <Leaf color="#10b981" size={32} />
                    </View>
                    <View style={styles.roleContent}>
                      <Text style={styles.roleTitle}>
                        {content[language].officerForecastTitle}
                      </Text>
                      <Text style={styles.roleDesc}>
                        {content[language].officerForecastDesc}
                      </Text>
                    </View>
                    <View style={styles.roleArrow}>
                      <Text style={styles.roleArrowText}>→</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Card 2: Wet Weight Prediction (Officer Only) */}
                <TouchableOpacity
                  style={styles.roleCard}
                  onPress={() => navigation.navigate("WetWeightPredictionForm")}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={["#EFF6FF", "#DBEAFE"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.roleCardGradient}
                  >
                    <View style={[styles.roleIconCircle, { backgroundColor: "#DBEAFE" }]}>
                      <Ionicons name="stats-chart-outline" size={30} color="#3b82f6" />
                    </View>
                    <View style={styles.roleContent}>
                      <Text style={styles.roleTitle}>
                        {content[language].wetWeightPrediction}
                      </Text>
                      <Text style={styles.roleDesc}>
                        {content[language].wetWeightPredictionDesc}
                      </Text>
                    </View>
                    <View style={styles.roleArrow}>
                      <Text style={styles.roleArrowText}>→</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Card 3: Farmer Requests */}
                <TouchableOpacity
                  style={styles.roleCard}
                  onPress={() => navigation.navigate("FarmerAdviceRequestsScreen")}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={["#FEF3C7", "#FDE68A"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.roleCardGradient}
                  >
                    <View style={[styles.roleIconCircle, { backgroundColor: "#FDE68A" }]}>
                      <Users color="#D97706" size={32} />
                    </View>
                    <View style={styles.roleContent}>
                      <Text style={styles.roleTitle}>
                        {content[language].farmerRequests}
                      </Text>
                      <Text style={styles.roleDesc}>
                        {content[language].farmerRequestsDesc}
                      </Text>
                    </View>
                    <View style={styles.roleArrow}>
                      <Text style={styles.roleArrowText}>→</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Card 4: Edit Fertilizer Plans */}
                <TouchableOpacity
                  style={styles.roleCard}
                  onPress={() => navigation.navigate("EditFertilizerPlans")}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={["#F3E8FF", "#E9D5FF"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.roleCardGradient}
                  >
                    <View style={[styles.roleIconCircle, { backgroundColor: "#E9D5FF" }]}>
                      <Edit3 color="#9333ea" size={32} />
                    </View>
                    <View style={styles.roleContent}>
                      <Text style={styles.roleTitle}>
                        {content[language].editFertilizerPlans}
                      </Text>
                      <Text style={styles.roleDesc}>
                        {content[language].editFertilizerPlansDesc}
                      </Text>
                    </View>
                    <View style={styles.roleArrow}>
                      <Text style={styles.roleArrowText}>→</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Card 5: Chat With Farmers (last) */}
                <TouchableOpacity
                  style={styles.roleCard}
                  onPress={() => navigation.navigate("OfficerRooms" as any)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={["#FFF7ED", "#FFEDD5"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.roleCardGradient}
                  >
                    <View style={[styles.roleIconCircle, { backgroundColor: "#FFEDD5" }]}>
                      <MessageCircle color="#ea580c" size={32} />
                    </View>
                    <View style={styles.roleContent}>
                      <Text style={styles.roleTitle}>
                        {content[language].chatWithFarmers}
                      </Text>
                      <Text style={styles.roleDesc}>
                        {content[language].chatWithFarmersDesc}
                      </Text>
                    </View>
                    <View style={styles.roleArrow}>
                      <Text style={styles.roleArrowText}>→</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Data Confirmation Modal */}
      <DataConfirmationModal
        visible={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleConfirmProceed}
        language={language === "ta" ? "en" : language}
      />

      {/* Pro Upgrade Popup */}
      <ProUpgradePopup
        visible={showProPopup}
        onClose={() => setShowProPopup(false)}
        onUpgrade={() => {
          setShowProPopup(false);
          navigation.navigate("Payment" as any, { plan: "pro", amount: 2499 });
        }}
      />

      {/* Farmer Soil Test Modal */}
      <FarmerSoilTestModal
        visible={showSoilTestModal}
        onClose={() => setShowSoilTestModal(false)}
        onConfirm={handleSoilTestConfirm}
        onNoData={showSoilTestImportanceMessage}
        language={language === "ta" ? "en" : language}
      />

      {/* Soil Test Importance Modal */}
      <SoilTestImportanceModal
        visible={showImportanceModal}
        onClose={() => setShowImportanceModal(false)}
        onRequestSoilTest={() => {
          setShowImportanceModal(false);
          if (hasActiveSubscription) {
            navigation.navigate("SoilTestRequest");
          } else {
            setShowProPopup(true);
          }
        }}
        language={language === "ta" ? "en" : language}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
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
    lineHeight: 26,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#D1FAE5",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    flex: 1,
    justifyContent: "center",
  },
  iconSection: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: -10,
  },
  servicesTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 20,
    letterSpacing: 0.3,
  },
  iconWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 3,
  },
  cornIcon: {
    fontSize: 56,
  },
  iconRing: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 2.5,
    borderColor: "#10b981",
  },
  iconRing1: {
    width: 130,
    height: 130,
    opacity: 0.25,
    borderColor: "#34d399",
  },
  iconRing2: {
    width: 155,
    height: 155,
    opacity: 0.15,
    borderColor: "#6ee7b7",
  },
  iconRing3: {
    width: 180,
    height: 180,
    opacity: 0.08,
    borderColor: "#a7f3d0",
  },
  roleContainer: {
    gap: 20,
    maxWidth: 500,
    width: "100%",
    alignSelf: "center",
  },
  roleCard: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 4,
  },
  roleCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 26,
    minHeight: 130,
  },
  roleIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 18,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  roleContent: {
    flex: 1,
    paddingRight: 8,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  roleDesc: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  roleArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  roleArrowText: {
    fontSize: 20,
    color: "#1F2937",
    fontWeight: "700",
  },
  proFeatureBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  proFeatureText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#f59e0b",
    letterSpacing: 0.5,
  },
});

export default YieldPredictionLoadingScreen;
