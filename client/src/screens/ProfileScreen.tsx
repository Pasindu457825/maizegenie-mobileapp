import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
  StatusBar,
  Clipboard,
  Modal,
} from "react-native";
import { useApp } from "../context/AppContext";
import { getFarmerPredictionHistory } from "../services/yieldPredictionApi";
import { CommonActions, useNavigation } from "@react-navigation/native";
import {
  User,
  Calendar,
  MapPin,
  Leaf,
  LogOut,
  Copy,
  Share2,
  Shield,
  TrendingUp,
  Crop,
  ChevronRight,
  Bell,
  HelpCircle,
  Globe,
  Settings,
  Sparkles,
  Smartphone,
  Cloud,
  Bug,
  Crown,
  TestTube,
  Lock,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLanguage } from "../context/LanguageContext";
import { ROUTES } from "../constants";
import ProUpgradePopup from "../components/ProUpgradePopup";

// ✅ REMOVED: import { PestIdentifyStackParamList } from "../navigation/PestIdentifyStack";
//    (was causing module-not-found error and was not needed here)

const { width } = Dimensions.get("window");

const PEST_OFFICER_EMAIL = "pestofficer@gmail.com";

const ProfileScreen = () => {
  const { user, signOut, diseaseModel, setDiseaseModel, refreshProfile } =
    useApp();
  const { language, setLanguage } = useLanguage();
  const navigation = useNavigation<any>();
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showProPopup, setShowProPopup] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Check if current user is the pest officer admin
  const isPestOfficer =
    user?.email?.toLowerCase() === PEST_OFFICER_EMAIL.toLowerCase();

  const content = {
    sinhala: {
      headerTitle: "විස්තර",
      headerSubtitle: "ඔබේ වගා පුවරුව",
      profile: "විස්තර",
      farmer: "ගොවියා",
      officer: "නිලධාරියා",
      location: "ස්ථානය",
      scans: "ස්කෑන්",
      diseaseDetection: "රෝග හඳුනාගැනීම",
      chooseAIModel: "AI ආකෘතිය තෝරන්න",
      standard: "ප්‍රමිතිය",
      standardDesc: "වේගවත් උපාංග-පාදක හඳුනාගැනීම",
      advanced: "උසස්",
      advancedDesc: "මෙව්ව-පාදක උසස් නිරවද්‍යතාව",
      selected: "තෝරාගත්",
      available: "ලබාගත හැකි",
      fast: "වේගවත්",
      offline: "අන්තර්ජාලය නොමැති",
      highAccuracy: "ඉහළ නිරවද්‍යතාව",
      locked: "අගුලු දමා ඇත",
      paidUser: "Paid User",
      freeUser: "Free User",
      subscriptionEnds: "Subscription Ends",
      adminPestForum: "පළිබෝධ සංසදය",
      adminPestForumDesc: "පළිබෝධ දත්ත කළමනාකරණය",
      settings: "සැකසුම්",
      managePreferences: "ඔබේ අභිමතයන් කළමනාකරණය කරන්න",
      language: "භාෂාව",
      chooseLanguage: "භාෂාව තෝරන්න",
      subscriptions: "දායකත්වය",
      subscriptionDetails: "දායකත්ව තොරතුරු",
      subscriptionStatus: "තත්ත්වය",
      currentPlan: "වත්මන් සැලසුම",
      paidDate: "ගෙවූ දිනය",
      lastPaidAmount: "අවසන් ගෙවූ මුදල",
      activeStatus: "සක්‍රීය",
      inactiveStatus: "අක්‍රීය",
      advancedAccess: "Advanced මාදිලි ප්‍රවේශය",
      unlocked: "අගුළුහැර ඇත",
      notifications: "දැනුම්දීම්",
      enabled: "සක්‍රියයි",
      helpCenter: "උපකාර කේන්ද්‍රය",
      faqSupport: "නිති අසන පැණ සහ උදව්",
      recentPredictions: "මෑත පුරෝකථන",
      farmingInsights: "ඔබේ වගා අවබෝධතා",
      loadingPredictions: "පුරෝකථන පූරණය වෙමින්...",
      noPredictions: "පුරෝකථන නැත",
      startByCreating: "පළමු අස්වැන්න පුරෝකථනය සාදා ආරම්භ කරන්න",
      maizeCrop: "බඩ ඉරිඟු බෝගය",
      active: "සක්‍රිය",
      shareWithOfficer: "නිලධාරියා සමඟ බෙදාගන්න",
      requestSoilTest: "පස් පරීක්ෂණ ඉල්ලීම 🔬",
      soilTestLocked: "Pro විශේෂාංගය — Upgrade කරන්න",
      copied: "පිටපත් කරන ලදී!",
      copyFailed: "පුරෝකථන විස්තර පිටපත් කිරීමට අසමත් විය",
      logout: "ඉවත්වීම",
      logoutConfirm: "ඔබට ඉවත්වීමට අවශ්‍ය බවට විශ්වාසද?",
      cancel: "අවලංගු කරන්න",
      close: "වසන්න",
      logoutText: "ඉවත්වීම",
      cropVariety: "බෝග වර්ගය",
      plantingDate: "වැවීම් දිනය",
      landSize: "ඉඩම් ප්‍රමාණය",
      season: "ඍතුව",
      status: "තත්ත්වය",
    },
    english: {
      headerTitle: "Profile",
      headerSubtitle: "Your Farming Dashboard",
      profile: "Profile",
      farmer: "Farmer",
      officer: "Officer",
      location: "Location",
      scans: "Scans",
      diseaseDetection: "Disease Detection",
      chooseAIModel: "Choose your AI model",
      standard: "Standard",
      standardDesc: "Fast on-device detection",
      advanced: "Advanced",
      advancedDesc: "Cloud-based high accuracy",
      selected: "Selected",
      available: "Available",
      fast: "Fast",
      offline: "Offline",
      highAccuracy: "High Accuracy",
      locked: "Locked",
      paidUser: "Paid User",
      freeUser: "Free User",
      subscriptionEnds: "Subscription Ends",
      adminPestForum: "Admin Pest Forum",
      adminPestForumDesc: "Manage pest data & reports",
      settings: "Settings",
      managePreferences: "Manage your preferences",
      language: "Language",
      chooseLanguage: "Choose Language",
      subscriptions: "Subscriptions",
      subscriptionDetails: "Subscription Details",
      subscriptionStatus: "Status",
      currentPlan: "Current Plan",
      paidDate: "Paid Date",
      lastPaidAmount: "Last Paid Amount",
      activeStatus: "Active",
      inactiveStatus: "Inactive",
      advancedAccess: "Advanced Model Access",
      unlocked: "Unlocked",
      notifications: "Notifications",
      enabled: "Enabled",
      helpCenter: "Help Center",
      faqSupport: "FAQ & Support",
      recentPredictions: "Recent Predictions",
      farmingInsights: "Your farming insights",
      loadingPredictions: "Loading predictions...",
      noPredictions: "No predictions yet",
      startByCreating: "Start by creating your first yield prediction",
      maizeCrop: "Maize Crop",
      active: "Active",
      shareWithOfficer: "Share with Officer",
      requestSoilTest: "Request Soil Test 🔬",
      soilTestLocked: "Pro Feature — Upgrade to Request",
      copied: "Copied!",
      copyFailed: "Failed to copy prediction details",
      logout: "Logout",
      logoutConfirm: "Are you sure you want to logout?",
      cancel: "Cancel",
      close: "Close",
      logoutText: "Logout",
      cropVariety: "Crop Variety",
      plantingDate: "Planting Date",
      landSize: "Land Size",
      season: "Season",
      status: "Status",
    },
    tamil: {
      // Header
      headerTitle: "பக்கத்திறன்",
      headerSubtitle: "உங்கள் விவசாயத் தகவல்பலகை",

      // Profile Hero
      profile: "பக்கத்திறன்",
      farmer: "விவசாயி",
      officer: "அதிகாரி",
      location: "இடம்",
      scans: "ச்கேன்கள்",

      // Disease Detection Section
      diseaseDetection: "நோய் கண்டறிதல்",
      chooseAIModel: "AI மாதிரியை தேர்வு செய்க",
      standard: "தரநிலை",
      standardDesc: "வேகமான சாதன கண்டறிதல்",
      advanced: "மேம்பட்டது",
      advancedDesc: "கிளவுட் அதிக துல்லியம்",
      selected: "தேர்ந்தெடுக்கப்பட்டது",
      available: "கிடைக்கிறது",
      fast: "வேகமானது",
      offline: "ஆஃப்லைன்",
      highAccuracy: "அதிக துல்லியம்",
      locked: "பூட்டப்பட்டுள்ளது",
      paidUser: "Paid User",
      freeUser: "Free User",
      subscriptionEnds: "Subscription Ends",
      adminPestForum: "நிர்வாக பூச்சி மன்றம்",
      adminPestForumDesc: "பூச்சி தரவு மற்றும் அறிக்கைகளை நிர்வகிக்கவும்",

      // Settings Section
      settings: "அமைப்புகள்",
      managePreferences: "உங்கள் விருப்பங்களை நிர்வகிக்கவும்",
      language: "மொழி",
      chooseLanguage: "மொழியைத் தேர்ந்தெடுக்கவும்",
      subscriptions: "சந்தா",
      subscriptionDetails: "சந்தா விவரங்கள்",
      subscriptionStatus: "நிலை",
      currentPlan: "தற்போதைய திட்டம்",
      paidDate: "செலுத்திய தேதி",
      lastPaidAmount: "கடைசி செலுத்திய தொகை",
      activeStatus: "செயலில்",
      inactiveStatus: "செயலற்றது",
      advancedAccess: "Advanced மாடல் அணுகல்",
      unlocked: "திறக்கப்பட்டுள்ளது",
      notifications: "அறிவிப்புகள்",
      enabled: "செயல்படுத்தப்பட்டது",
      helpCenter: "உதவி மையம்",
      faqSupport: "அடிக்கடி கேள்விகள் மற்றும் ஆதரவு",

      // Recent Predictions
      recentPredictions: "இத்திய மதிப்பீடுகள்",
      farmingInsights: "உங்கள் விவசாய நுண்ணறிவுகள்",
      loadingPredictions: "மதிப்பீடுகள் ஏற்றப்படுகின்றன...",
      noPredictions: "மதிப்பீடுகள் இல்லை",
      startByCreating:
        "உங்கள் முதல் விளைச்சல் மதிப்பீட்டை உருவாக்கி தொடங்குங்கள்",
      maizeCrop: "சோளப் பயிர்",
      active: "செயல்பாடு",
      shareWithOfficer: "அதிகாரியுடன் பகிர்ந்துகொள்க",
      requestSoilTest: "மண் பரிசோதனை கோரிக்கை 🔬",
      soilTestLocked: "Pro அம்சம் — மேம்படுத்தவும்",

      // Alerts
      copied: "நகலெடுக்கப்பட்டது!",
      copyFailed: "மதிப்பீடு விவரங்களை நகலெடுக்க முடியவில்லை",
      logout: "வெளியேறுக",
      logoutConfirm: "வெளியேற விரும்புகிறீர்களா?",
      cancel: "ரத்துசெய்க",
      close: "மூடு",
      logoutText: "வெளியேறுக",

      // Prediction Details
      cropVariety: "பயிர் வகை",
      plantingDate: "நடு தேதி",
      landSize: "நில அளவு",
      season: "பருவகாலம்",
      status: "நிலை",
    },
  };

  const t = content[language];
  const hasActiveSubscription =
    Boolean(user?.is_paid_user) &&
    Boolean(user?.subscription_end_date) &&
    new Date(user?.subscription_end_date as string).getTime() > Date.now();

  useEffect(() => {
    loadPredictionHistory();
    void refreshProfile();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const loadPredictionHistory = async () => {
    try {
      setLoading(true);
      const response = await getFarmerPredictionHistory(1);
      setPredictions(response.predictions || []);
    } catch (error: any) {
      console.error("Failed to load prediction history:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to load prediction history",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPredictionHistory();
  };

  const handleCopyPrediction = async (prediction: any) => {
    try {
      const copyText = `🌽 Maize Yield Prediction

📝 Farmer: ${user?.full_name || "Farmer"}
📍 District: ${prediction.district}
📅 Date: ${formatDate(prediction.created_at)}

🌱 Crop Details:
• Variety: ${prediction.variety || "N/A"}
• Season: ${prediction.season}
• Land Size: ${prediction.land_size || "N/A"}
• Planting Date: ${formatDate(prediction.planting_date)}

📊 Prediction:
• Yield: ${prediction.predicted_yield || "N/A"} kg/ha
• Confidence: ${prediction.confidence_level || "N/A"}

Status: ${prediction.status || "Active"}`;

      Clipboard.setString(copyText);
      Alert.alert(
        language === "sinhala"
          ? "පිටපත් කරන ලදී!"
          : language === "tamil"
            ? "நகலெடுக்கப்பட்டது!"
            : "Copied!",
        language === "sinhala"
          ? "පුරෝකථන විස්තර පිටපත් කරන ලදී"
          : language === "tamil"
            ? "மதிப்பீடு விவரங்கள் நகலெடுக்கப்பட்டது"
            : "Prediction details copied to clipboard",
      );
    } catch (error) {
      console.error("Copy failed:", error);
      Alert.alert(
        language === "sinhala"
          ? "දෝෂයකි"
          : language === "tamil"
            ? "பிழை"
            : "Error",
        language === "sinhala"
          ? "පුරෝකථන විස්තර පිටපත් කිරීමට අසමත් විය"
          : language === "tamil"
            ? "மதிப்பீடு விவரங்களை நகலெடுக்க முடியவில்லை"
            : "Failed to copy prediction details",
      );
    }
  };

  const handleRequestSoilTest = (prediction: any) => {
    if (!hasActiveSubscription) {
      setShowProPopup(true);
      return;
    }

    const soilTestMessage =
      language === "sinhala"
        ? `🔬 පස් පරීක්ෂණ ඉල්ලීම\n\n👨‍🌾 ගොවිතැන් විස්තර:\nනම: ${user?.full_name || "ගොවියා"}\nදිස්ත්‍රික්කය: ${prediction.district}\n\n🌽 බෝග තොරතුරු:\nප්‍රභේදය: ${prediction.variety || "N/A"}\nමහෝත්සවය: ${prediction.season}\nඉඩම් ප්‍රමාණය: ${prediction.land_size || "N/A"}\nවගා කළ දිනය: ${formatDate(prediction.planting_date)}\n\n📊 පුරෝකථනය:\nඅස්වැන්න: ${prediction.predicted_yield || "N/A"} kg/ha\nවිශ්වාසය: ${prediction.confidence_level || "N/A"}\n\n📋 ඉල්ලීම:\nමගේ ගොවිතැනේ නිල පස් පරීක්ෂණයක් ඉල්ලා සිටිමි. ඉහත පුරෝකථන දත්ත මත පදනම්ව නිවැරදි පස් පරීක්ෂණ නිර්දේශ ලබා ගැනීමට කැමැත්තෙමි. 🙏`
        : language === "tamil"
          ? `🔬 மண் பரிசோதனை கோரிக்கை\n\n👨‍🌾 விவசாயி விவரங்கள்:\nபெயர்: ${user?.full_name || "விவசாயி"}\nமாவட்டம்: ${prediction.district}\n\n🌽 பயிர் தகவல்:\nவகை: ${prediction.variety || "N/A"}\nபருவம்: ${prediction.season}\nநில அளவு: ${prediction.land_size || "N/A"}\nநடும் தேதி: ${formatDate(prediction.planting_date)}\n\n📊 மதிப்பீடு:\nவிளைச்சல்: ${prediction.predicted_yield || "N/A"} kg/ha\nநம்பகத்தன்மை: ${prediction.confidence_level || "N/A"}\n\n📋 கோரிக்கை:\nஎன் வயலுக்கு அதிகாரப்பூர்வ மண் பரிசோதனை கோருகிறேன். மேலே உள்ள மதிப்பீட்டு தரவின் அடிப்படையில் சரியான மண் பரிசோதனை பரிந்துரைகளை பெற விரும்புகிறேன். 🙏`
          : `🔬 Soil Test Request\n\n👨‍🌾 Farmer Details:\nName: ${user?.full_name || "Farmer"}\nDistrict: ${prediction.district}\n\n🌽 Crop Information:\nVariety: ${prediction.variety || "N/A"}\nSeason: ${prediction.season}\nLand Size: ${prediction.land_size || "N/A"}\nPlanting Date: ${formatDate(prediction.planting_date)}\n\n📊 Prediction:\nYield: ${prediction.predicted_yield || "N/A"} kg/ha\nConfidence: ${prediction.confidence_level || "N/A"}\n\n📋 Request:\nI would like to request an official soil test for my field. Based on the above prediction data, I am seeking proper soil testing recommendations to improve my yield. 🙏`;

    navigation.navigate("Chat", {
      prefilledMessage: soilTestMessage,
      context: "soil_test_request",
      predictionData: prediction,
    });
  };

  const handleShareWithOfficer = (prediction: any) => {
    const contextMessage =
      language === "sinhala"
        ? `🌾 බඩ ඉරිඟු අස්වැන්න පුරෝකථන ඉල්ලීම\n\n📝 ගොවි විස්තර:\nනම: ${user?.full_name || "ගොවියා"}\nදිස්ත්‍රික්කය: ${prediction.district}\n\n🌱 බෝග තොරතුරු:\nප්‍රභේදය: ${prediction.variety || "N/A"}\nමහෝත්සවය: ${prediction.season}\nඉඩම් ප්‍රමාණය: ${prediction.land_size || "N/A"}\nවගා කළ දිනය: ${formatDate(prediction.planting_date)}\n\n📊 පුරෝකථනය:\nඅස්වැන්න: ${prediction.predicted_yield || "N/A"} kg/ha\nවිශ්වාසය: ${prediction.confidence_level || "N/A"}\n\nමගේ අස්වැන්න පුරෝකථනය සහ බෝග කළමනාකරණය සම්බන්ධයෙන් කෘෂිකර්ම නිලධාරියෙකුගෙන් උපදෙස් ලබා ගැනීමට කැමැත්තෙමි.`
        : language === "tamil"
          ? `🌾 சோள விளைச்சல் மதிப்பீடு கோரிக்கை\n\n📝 விவசாயி விவரங்கள்:\nபெயர்: ${user?.full_name || "விவசாயி"}\nமாவட்டம்: ${prediction.district}\n\n🌱 பயிர் தகவல்:\nவகை: ${prediction.variety || "N/A"}\nபருவம்: ${prediction.season}\nநில அளவு: ${prediction.land_size || "N/A"}\nநடும் தேதி: ${formatDate(prediction.planting_date)}\n\n📊 மதிப்பீடு:\nவிளைச்சல்: ${prediction.predicted_yield || "N/A"} kg/ha\nநம்பகத்தன்மை: ${prediction.confidence_level || "N/A"}\n\nஎன் விளைச்சல் மதிப்பீடு மற்றும் பயிர் மேலாண்மை குறித்து விவசாய அதிகாரியிடம் ஆலோசனை பெற விரும்புகிறேன்.`
          : `🌾 Maize Yield Prediction Request\n\n📝 Farmer Details:\nName: ${user?.full_name || "Farmer"}\nDistrict: ${prediction.district}\n\n🌱 Crop Information:\nVariety: ${prediction.variety || "N/A"}\nSeason: ${prediction.season}\nLand Size: ${prediction.land_size || "N/A"}\nPlanting Date: ${formatDate(prediction.planting_date)}\n\n📊 Prediction:\nYield: ${prediction.predicted_yield || "N/A"} kg/ha\nConfidence: ${prediction.confidence_level || "N/A"}\n\nI would like to get advice from an Agricultural Officer regarding my yield prediction and crop management.`;

    navigation.navigate("Chat", {
      prefilledMessage: contextMessage,
      context: "yield_prediction",
      predictionData: prediction,
    });
  };

  const handleAdminPestForum = () => {
    // Level 0 = tab navigator (BottomNavigator) — navigate directly
    navigation.navigate("PestIdentifier", {
      screen: "AdminPestForum",
    });
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.warn("Logout failed, forcing navigation to login:", error);
    } finally {
      const rootNavigation =
        navigation.getParent()?.getParent() ??
        navigation.getParent() ??
        navigation;

      rootNavigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: ROUTES.AUTH.LOGIN }],
        })
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const languageOptions: Array<{
    key: "sinhala" | "english" | "tamil";
    label: string;
  }> = [
      { key: "sinhala", label: "සිංහල" },
      { key: "english", label: "English" },
      { key: "tamil", label: "தமிழ்" },
    ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatPlanName = (plan?: string | null) => {
    if (!plan) return "Free";
    return plan
      .split("_")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#10ad79ff" />

      {/* Enhanced Header */}
      <LinearGradient
        colors={["#10ad79ff", "#0f9d6b"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t.headerTitle}</Text>
            <View style={styles.headerSubtitleContainer}>
              <Sparkles size={12} color="#D1FAE5" />
              <Text style={styles.headerSubtitle}>{t.headerSubtitle}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Profile Hero Section */}
          <View style={styles.profileHeroContainer}>
            <LinearGradient
              colors={["#10b981", "#059669"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.profileHero}
            >
              <Animated.View
                style={[
                  styles.heroAvatarContainer,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <View style={styles.heroAvatar}>
                  <Text style={styles.heroAvatarText}>
                    {getInitials(user?.full_name || "U")}
                  </Text>
                </View>
                <View style={styles.heroAvatarRing} />
                <View style={styles.heroAvatarGlow} />
              </Animated.View>

              <View style={styles.heroInfo}>
                <Text style={styles.heroName}>
                  {user?.full_name || t.farmer}
                </Text>
                <Text style={styles.subscriptionBadge}>
                  {hasActiveSubscription ? `${t.paidUser} ✓` : t.freeUser}
                </Text>
                {hasActiveSubscription && user?.subscription_end_date ? (
                  <Text style={styles.subscriptionDate}>
                    {t.subscriptionEnds}: {formatDate(user.subscription_end_date)}
                  </Text>
                ) : null}

                <View style={styles.heroStats}>
                  <View style={styles.heroStatItem}>
                    <View style={styles.heroStatItem}>
                      <MapPin size={18} color="#FFFFFF" />
                      <Text style={styles.heroStatLabel}>
                        {user?.district || t.location}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.heroStatDivider} />
                  <View style={styles.heroStatItem}>
                    <Text style={styles.heroStatNumber}>
                      {user?.role === "farmer" ? "👨‍🌾🌾" : "👨‍💼"}
                    </Text>
                    <Text style={styles.heroStatLabel}>
                      {user?.role === "farmer" ? t.farmer : t.officer}
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.heroLogoutButton}
                onPress={() => {
                  void handleLogout();
                }}
                activeOpacity={0.7}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <LinearGradient
                  colors={["#ef4444", "#dc2626"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.heroLogoutContent}
                >
                  <LogOut size={18} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* ===== ADMIN PEST FORUM BUTTON (only for pestofficer@gmail.com) ===== */}
          {isPestOfficer && (
            <View style={styles.adminSection}>
              <TouchableOpacity
                style={styles.adminPestForumButton}
                onPress={handleAdminPestForum}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={["#7c3aed", "#5b21b6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.adminPestForumGradient}
                >
                  <View style={styles.adminBadge}>
                    <Text style={styles.adminBadgeText}>ADMIN</Text>
                  </View>
                  <View style={styles.adminPestForumIconContainer}>
                    <Bug size={28} color="#FFFFFF" />
                  </View>
                  <View style={styles.adminPestForumTextContainer}>
                    <Text style={styles.adminPestForumTitle}>
                      {t.adminPestForum}
                    </Text>
                    <Text style={styles.adminPestForumDesc}>
                      {t.adminPestForumDesc}
                    </Text>
                  </View>
                  <ChevronRight size={22} color="rgba(255,255,255,0.8)" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
          {/* ===== END ADMIN PEST FORUM BUTTON ===== */}

          {/* AI Model Selection */}
          {user?.role === "farmer" && (
            <View style={styles.modelSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Shield size={20} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>{t.diseaseDetection}</Text>
                  <Text style={styles.sectionSubtitle}>{t.chooseAIModel}</Text>
                </View>
              </View>

              <View style={styles.modelSelection}>
                <TouchableOpacity
                  style={[
                    styles.modelCard,
                    diseaseModel === "local" && styles.modelCardActive,
                  ]}
                  onPress={() => {
                    void setDiseaseModel("local");
                  }}
                  activeOpacity={0.9}
                >
                  <View style={styles.modelCardHeader}>
                    <View
                      style={[
                        styles.modelIconContainer,
                        {
                          backgroundColor:
                            diseaseModel === "local" ? "#10b98120" : "#f1f5f9",
                        },
                      ]}
                    >
                      <Smartphone
                        size={24}
                        color={diseaseModel === "local" ? "#10b981" : "#64748b"}
                      />
                    </View>
                    <View style={styles.modelStatus}>
                      <View
                        style={[
                          styles.statusIndicator,
                          diseaseModel === "local"
                            ? styles.statusActive
                            : styles.statusInactive,
                        ]}
                      />
                      <Text style={styles.statusText}>
                        {diseaseModel === "local" ? t.selected : t.available}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.modelName}>{t.standard}</Text>
                  <Text style={styles.modelDescription}>{t.standardDesc}</Text>
                  <View style={styles.modelFeatures}>
                    <Text style={styles.modelFeature}>⚡ {t.fast}</Text>
                    <Text style={styles.modelFeature}>📱 {t.offline}</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modelCard,
                    diseaseModel === "roboflow" && styles.modelCardActive,
                  ]}
                  onPress={() => {
                    if (hasActiveSubscription) {
                      void setDiseaseModel("roboflow");
                      return;
                    }
                    navigation.navigate("SubscriptionPlans");
                  }}
                  activeOpacity={0.9}
                >
                  <View style={styles.modelCardHeader}>
                    <View
                      style={[
                        styles.modelIconContainer,
                        {
                          backgroundColor:
                            diseaseModel === "roboflow"
                              ? "#3b82f620"
                              : "#f1f5f9",
                        },
                      ]}
                    >
                      <Cloud
                        size={24}
                        color={
                          diseaseModel === "roboflow" ? "#3b82f6" : "#64748b"
                        }
                      />
                    </View>
                    <View style={styles.modelStatus}>
                      <View
                        style={[
                          styles.statusIndicator,
                          diseaseModel === "roboflow"
                            ? styles.statusActive
                            : styles.statusInactive,
                        ]}
                      />
                      <Text style={styles.statusText}>
                        {diseaseModel === "roboflow"
                          ? t.selected
                          : hasActiveSubscription
                            ? t.available
                            : t.locked}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.modelName}>{t.advanced}</Text>
                  <Text style={styles.modelDescription}>{t.advancedDesc}</Text>
                  <View style={styles.modelFeatures}>
                    <Text style={styles.modelFeature}>🎯 {t.highAccuracy}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.settingsPanel}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Settings size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.sectionTitle}>{t.settings}</Text>
                <Text style={styles.sectionSubtitle}>
                  {t.managePreferences}
                </Text>
              </View>
            </View>

            <View style={styles.settingsGrid}>
              <TouchableOpacity
                style={styles.settingCard}
                onPress={() => setShowLanguageModal(true)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#f0fdf4", "#dcfce7"]}
                  style={styles.settingGradient}
                >
                  <View style={styles.settingIcon}>
                    <Globe size={24} color="#10b981" />
                  </View>
                  <Text style={styles.settingTitle}>{t.language}</Text>
                  <Text style={styles.settingValue}>
                    {language === "sinhala"
                      ? "සිංහල"
                      : language === "tamil"
                        ? "தமிழ்"
                        : "English"}
                  </Text>
                  <View style={styles.settingArrow}>
                    <ChevronRight size={16} color="#10b981" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.settingCard}
                activeOpacity={0.8}
                onPress={() => {
                  void refreshProfile();
                  setShowSubscriptionModal(true);
                }}
              >
                <LinearGradient
                  colors={["#fff7ed", "#ffedd5"]}
                  style={styles.settingGradient}
                >
                  <View style={styles.settingIcon}>
                    <Crown size={24} color="#f59e0b" />
                  </View>
                  <Text style={styles.settingTitle}>{t.subscriptions}</Text>
                  <Text style={styles.settingValue}>
                    {hasActiveSubscription ? t.activeStatus : t.inactiveStatus}
                  </Text>
                  <View style={styles.settingArrow}>
                    <ChevronRight size={16} color="#f59e0b" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingCard} activeOpacity={0.8}>
                <LinearGradient
                  colors={["#fef2f2", "#fee2e2"]}
                  style={styles.settingGradient}
                >
                  <View style={styles.settingIcon}>
                    <Bell size={24} color="#ef4444" />
                  </View>
                  <Text style={styles.settingTitle}>{t.notifications}</Text>
                  <Text style={styles.settingValue}>{t.enabled}</Text>
                  <View style={styles.settingArrow}>
                    <ChevronRight size={16} color="#ef4444" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingCard} activeOpacity={0.8}>
                <LinearGradient
                  colors={["#eff6ff", "#dbeafe"]}
                  style={styles.settingGradient}
                >
                  <View style={styles.settingIcon}>
                    <HelpCircle size={24} color="#3b82f6" />
                  </View>
                  <Text style={styles.settingTitle}>{t.helpCenter}</Text>
                  <Text style={styles.settingValue}>{t.faqSupport}</Text>
                  <View style={styles.settingArrow}>
                    <ChevronRight size={16} color="#3b82f6" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Predictions */}
          {user?.role === "farmer" && (
            <View style={styles.predictionsPanel}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Crop size={20} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>{t.recentPredictions}</Text>
                  <Text style={styles.sectionSubtitle}>
                    {t.farmingInsights}
                  </Text>
                </View>
              </View>

              {loading ? (
                <View style={styles.loadingState}>
                  <ActivityIndicator size="large" color="#10B981" />
                  <Text style={styles.loadingText}>{t.loadingPredictions}</Text>
                </View>
              ) : predictions.length === 0 ? (
                <View style={styles.emptyState}>
                  <Crop size={48} color="#d1d5db" />
                  <Text style={styles.emptyText}>{t.noPredictions}</Text>
                  <Text style={styles.emptySubtext}>{t.startByCreating}</Text>
                </View>
              ) : (
                predictions.slice(0, 2).map((prediction, index) => (
                  <TouchableOpacity
                    key={prediction.id || index}
                    style={styles.predictionItem}
                    onPress={() => handleShareWithOfficer(prediction)}
                    activeOpacity={0.9}
                  >
                    <View style={styles.predictionHeader}>
                      <View style={styles.predictionIcon}>
                        <Crop size={20} color="#10b981" />
                      </View>
                      <View style={styles.predictionInfo}>
                        <Text style={styles.predictionCrop}>
                          {prediction.variety || t.maizeCrop}
                        </Text>
                        <View style={styles.predictionMeta}>
                          <Calendar size={12} color="#6b7280" />
                          <Text style={styles.predictionDate}>
                            {formatDate(prediction.created_at)}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.predictionAction}
                        onPress={() => handleCopyPrediction(prediction)}
                      >
                        <Copy size={18} color="#10b981" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.predictionDetails}>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>{t.location}</Text>
                        <Text style={styles.detailValue}>
                          {prediction.district}
                        </Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>{t.season}</Text>
                        <Text style={styles.detailValue}>
                          {prediction.season}
                        </Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>{t.status}</Text>
                        <View style={styles.predictionStatus}>
                          <Text style={styles.statusText}>{t.active}</Text>
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.shareAction}
                      onPress={() => handleShareWithOfficer(prediction)}
                    >
                      <Share2 size={16} color="#ffffff" />
                      <Text style={styles.shareActionText}>
                        {t.shareWithOfficer}
                      </Text>
                    </TouchableOpacity>

                    {/* Soil Test Request Button (Pro Only) */}
                    <TouchableOpacity
                      style={[
                        styles.soilTestAction,
                        !hasActiveSubscription && styles.soilTestActionLocked,
                      ]}
                      onPress={() => handleRequestSoilTest(prediction)}
                    >
                      {hasActiveSubscription ? (
                        <LinearGradient
                          colors={["#6366f1", "#4f46e5"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.soilTestGradient}
                        >
                          <TestTube size={15} color="#ffffff" />
                          <Text style={styles.soilTestActionText}>
                            {t.requestSoilTest}
                          </Text>
                        </LinearGradient>
                      ) : (
                        <>
                          <Lock size={14} color="#9ca3af" />
                          <Text style={styles.soilTestLockedText}>
                            {t.soilTestLocked}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </Animated.View>
      </ScrollView>

      <Modal
        visible={showSubscriptionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSubscriptionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.languageModal}>
            <Text style={styles.languageModalTitle}>{t.subscriptionDetails}</Text>

            <View style={styles.subscriptionRow}>
              <Text style={styles.subscriptionLabel}>{t.subscriptionStatus}</Text>
              <Text style={styles.subscriptionValue}>
                {hasActiveSubscription ? t.activeStatus : t.inactiveStatus}
              </Text>
            </View>

            <View style={styles.subscriptionRow}>
              <Text style={styles.subscriptionLabel}>{t.currentPlan}</Text>
              <Text style={styles.subscriptionValue}>
                {formatPlanName(user?.subscription_plan)}
              </Text>
            </View>

            <View style={styles.subscriptionRow}>
              <Text style={styles.subscriptionLabel}>{t.subscriptionEnds}</Text>
              <Text style={styles.subscriptionValue}>
                {user?.subscription_end_date
                  ? formatDate(user.subscription_end_date)
                  : "-"}
              </Text>
            </View>

            <View style={styles.subscriptionRow}>
              <Text style={styles.subscriptionLabel}>{t.paidDate}</Text>
              <Text style={styles.subscriptionValue}>
                {user?.subscription_start_date
                  ? formatDate(user.subscription_start_date)
                  : "-"}
              </Text>
            </View>

            <View style={styles.subscriptionRow}>
              <Text style={styles.subscriptionLabel}>{t.lastPaidAmount}</Text>
              <Text style={styles.subscriptionValue}>
                {typeof user?.last_payment_amount_lkr === "number"
                  ? `Rs. ${user.last_payment_amount_lkr.toLocaleString()}`
                  : "-"}
              </Text>
            </View>

            <View style={styles.subscriptionRow}>
              <Text style={styles.subscriptionLabel}>{t.advancedAccess}</Text>
              <Text style={styles.subscriptionValue}>
                {hasActiveSubscription ? t.unlocked : t.locked}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.languageCloseButton}
              onPress={() => setShowSubscriptionModal(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.languageCloseButtonText}>{t.close}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.languageModal}>
            <Text style={styles.languageModalTitle}>{t.chooseLanguage}</Text>

            {languageOptions.map((option) => {
              const isActive = language === option.key;
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.languageOption,
                    isActive && styles.languageOptionActive,
                  ]}
                  onPress={() => {
                    setLanguage(option.key);
                    setShowLanguageModal(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.languageOptionText,
                      isActive && styles.languageOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {isActive && <Text style={styles.languageCheck}>✓</Text>}
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={styles.languageCloseButton}
              onPress={() => setShowLanguageModal(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.languageCloseButtonText}>{t.close}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Pro Upgrade Popup (shown when free user taps locked soil test button) */}
      <ProUpgradePopup
        visible={showProPopup}
        onClose={() => setShowProPopup(false)}
        onUpgrade={() => {
          setShowProPopup(false);
          navigation.navigate("SubscriptionPlans");
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    alignItems: "center",
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  headerSubtitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#D1FAE5",
    fontWeight: "500",
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 30,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
  },
  profileHeroContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  profileHero: {
    borderRadius: 24,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  heroAvatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  heroAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  heroAvatarRing: {
    position: "absolute",
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
    top: -4,
    left: -4,
  },
  heroAvatarGlow: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    top: -8,
    left: -8,
  },
  heroAvatarText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#10b981",
  },
  heroInfo: {
    flex: 1,
  },
  heroName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  subscriptionBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.2)",
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 11,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 6,
  },
  subscriptionDate: {
    color: "#d1fae5",
    fontSize: 12,
    marginBottom: 8,
    fontWeight: "600",
  },
  heroEmail: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 12,
  },
  heroStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  heroStatItem: {
    alignItems: "center",
  },
  heroStatNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  heroStatLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
  },
  heroStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  heroLogoutButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
  },
  heroLogoutContent: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginTop: 12,
    marginLeft: 8,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10b981",
  },
  // ===== Admin Pest Forum Styles =====
  adminSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  adminPestForumButton: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  adminPestForumGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 14,
  },
  adminBadge: {
    position: "absolute",
    top: 10,
    right: 44,
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  adminBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  adminPestForumIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  adminPestForumTextContainer: {
    flex: 1,
  },
  adminPestForumTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 3,
  },
  adminPestForumDesc: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  // ===== End Admin Pest Forum Styles =====
  quickStatsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  quickStatsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  quickStatsTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1f2937",
  },
  quickStatsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  quickStatCard: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  quickStatGradient: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
  },
  quickStatNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
  },
  modelSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1f2937",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  modelSelection: {
    flexDirection: "row",
    gap: 12,
  },
  modelCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  modelCardActive: {
    borderColor: "#10b981",
    backgroundColor: "#f0fdf4",
  },
  modelCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modelIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  modelStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusActive: {
    backgroundColor: "#10b981",
  },
  statusInactive: {
    backgroundColor: "#d1d5db",
  },
  statusText: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "600",
  },
  modelName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  modelDescription: {
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 16,
    marginBottom: 12,
  },
  modelFeatures: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  modelFeature: {
    fontSize: 11,
    color: "#64748b",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  settingsPanel: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  settingsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  settingCard: {
    flex: 1,
    minWidth: width * 0.42,
    borderRadius: 16,
    overflow: "hidden",
  },
  settingGradient: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    position: "relative",
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  settingValue: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  settingArrow: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  languageModal: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  languageModalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 14,
  },
  languageOption: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  languageOptionActive: {
    borderColor: "#10B981",
    backgroundColor: "#ECFDF5",
  },
  languageOptionText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#334155",
  },
  languageOptionTextActive: {
    color: "#047857",
  },
  languageCheck: {
    fontSize: 16,
    fontWeight: "800",
    color: "#10B981",
  },
  languageCloseButton: {
    marginTop: 4,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  languageCloseButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },
  subscriptionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  subscriptionLabel: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "700",
  },
  subscriptionValue: {
    fontSize: 13,
    color: "#0f766e",
    fontWeight: "800",
  },
  predictionsPanel: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  loadingState: {
    padding: 48,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  loadingText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 12,
  },
  emptyState: {
    padding: 48,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 8,
    textAlign: "center",
  },
  predictionItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  predictionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  predictionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  predictionInfo: {
    flex: 1,
  },
  predictionCrop: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  predictionMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  predictionDate: {
    fontSize: 12,
    color: "#6b7280",
  },
  predictionAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1fae5",
  },
  predictionDetails: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 16,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1f2937",
  },
  predictionStatus: {
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  predictionStatusText: {
    fontSize: 11,
    color: "#059669",
    fontWeight: "600",
  },
  shareAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#10b981",
    paddingVertical: 12,
    borderRadius: 12,
  },
  shareActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  soilTestAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  soilTestActionLocked: {
    backgroundColor: "#f3f4f6",
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
  },
  soilTestGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    width: "100%",
  },
  soilTestActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  soilTestLockedText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#9ca3af",
  },
  bottomSpacer: {
    height: 100,
  },
});

export default ProfileScreen;
