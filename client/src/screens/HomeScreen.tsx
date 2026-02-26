import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useApp } from "../context/AppContext";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import {
  TrendingUp,
  Bug,
  AlertCircle,
  Leaf,
  BarChart3,
  MessageSquare,
  Bell,
} from "lucide-react-native";
import { useLanguage } from "../context/LanguageContext";
import { useNotifications } from "../context/NotificationContext";
import TopOfficialNews from "../components/OfficialNews/TopOfficialNews";

const { width } = Dimensions.get("window");

// ✨ Type definition for language
type LanguageType = "si" | "en" | "ta";

// ✨ Translations
const translations: Record<
  LanguageType,
  {
    welcome: string;
    welcomeSubtext: string;
    chatWithOfficer: string;
    viewFarmerChats: string;
    cropsTracked: string;
    priceForecast: string;
    features: string;
    priceForecasting: string;
    priceDescription: string;
    pestIdentifier: string;
    pestDescription: string;
    diseaseIdentifier: string;
    diseaseDescription: string;
    fertilizerAdvisor: string;
    fertilizerDescription: string;
    yieldPrediction: string;
    yieldDescription: string;
    todaysTip: string;
    monitorCrops: string;
    monitorDescription: string;
    farmingCompanion: string;
    development: string;
    production: string;
  }
> = {
  si: {
    welcome: "ආයුබෝවන්! 👋",
    welcomeSubtext: "ඔබේ ගොවිතැනට ආපසු පැමිණිණු ඔබට සාදරයෙන් ස්වාගතයි",
    chatWithOfficer: "කෘෂි නිලධාරියා සමඟ කතා කරන්න",
    viewFarmerChats: "ගොවිවරු සමඟ සංවාදයන් බලන්න",
    cropsTracked: "නිරීක්ෂණය කරන ලද බෝග",
    priceForecast: "මිල පුරෝකථනයන්",
    features: "විශේෂතා",
    priceForecasting: "💰 මිල පුරෝකථනය",
    priceDescription: "නිවැරදි මිල පුරෝකථන ලබා ගන්න",
    pestIdentifier: "🐛 පළිබෝධ හඳුනාගැනීම",
    pestDescription: "ක්ෂණිකව පළිබෝධ හඳුනා ගන්න",
    diseaseIdentifier: "🦠 රෝග හඳුනාගැනීම",
    diseaseDescription: "බෝගයේ රෝග හඳුනා ගන්න",
    fertilizerAdvisor: "🌱 පෝෂක උපදේශක",
    fertilizerDescription: "පෝෂක නිර්දේශ ලබා ගන්න",
    yieldPrediction: "📊 අස්වැන්න පුරෝකථනය",
    yieldDescription: "ඔබේ බෝග අස්වැන්න පුරෝකල්පනය කරන්න",
    todaysTip: "අද දිනට ඉඟිය 💡",
    monitorCrops: "ඔබේ බෝග නිරීක්ෂණය කරන්න",
    monitorDescription:
      "පළිබෝධ සහ රෝගවල මුල් හඳුනාගැනීම ඔබේ බෝගය ගලවාගත හැක. ඔබේ පස් දෙයට නිරීක්ෂණය කරන්න.",
    farmingCompanion: "ඔබේ ගොවි සහකරු",
    development: "සංවර්ධනය",
    production: "නිෂ්පාදනය",
  },
  en: {
    welcome: "Welcome Back! 👋",
    welcomeSubtext: "Your farming companion is ready to help",
    chatWithOfficer: "Chat With Agriculture Officer",
    viewFarmerChats: "View Farmer Chats",
    cropsTracked: "Crops Tracked",
    priceForecast: "Price Forecasts",
    features: "Features",
    priceForecasting: "💰 Price Forecasting",
    priceDescription: "Get accurate price predictions",
    pestIdentifier: "🐛 Pest Identifier",
    pestDescription: "Identify pests instantly",
    diseaseIdentifier: "🦠 Disease Identifier",
    diseaseDescription: "Diagnose crop diseases",
    fertilizerAdvisor: "🌱 Fertilizer Advisor",
    fertilizerDescription: "Get fertilizer recommendations",
    yieldPrediction: "📊 Yield Prediction",
    yieldDescription: "Predict your crop yield",
    todaysTip: "Today's Tip 💡",
    monitorCrops: "Monitor your crops regularly",
    monitorDescription:
      "Early detection of pests and diseases can save your harvest. Check your plants daily for any signs of trouble.",
    farmingCompanion: "Your farming companion",
    development: "Development",
    production: "Production",
  },
  ta: {
    welcome: "வரவேற்கிறோம்! 👋",
    welcomeSubtext: "உங்கள் விவசாயத் தோழன் உதவ தயாராக உள்ளது",
    chatWithOfficer: "விவசாய அதிகாரியுடன் அரட்டையடிக்க",
    viewFarmerChats: "விவசாயிகள் அரட்டைகளைப் பார்க்க",
    cropsTracked: "கண்காணிக்கப்பட்ட பயிர்கள்",
    priceForecast: "விலை மதிப்பீடுகள்",
    features: "சேவைகள்",
    priceForecasting: "💰 விலை மதிப்பீடு",
    priceDescription: "நிர்ணயிக்கப்பட்ட விலை மதிப்பீடுகளைப் பெறுங்கள்",
    pestIdentifier: "🐛 பூச்சி அடையாளம்",
    pestDescription: "பூச்சிகளை உடனடியாக அடையாளம் செய்க",
    diseaseIdentifier: "🦠 நோய் அடையாளம்",
    diseaseDescription: "பயிர் நோய்களை கண்டறிக",
    fertilizerAdvisor: "🌱 உர உபதேசகர்",
    fertilizerDescription: "உர பரிந்துரைகளைப் பெறுங்கள்",
    yieldPrediction: "📊 விளைச்சல் மதிப்பீடு",
    yieldDescription: "உங்கள் பயிர் விளைச்சலை மதிப்பிடுங்கள்",
    todaysTip: "இன்றைய சிறப்பு குறிப்பு 💡",
    monitorCrops: "உங்கள் பயிர்களை தொடர்ந்து கண்காணிக்கவும்",
    monitorDescription:
      "பூச்சி மற்றும் நோய்களை முன்னதாகவே கண்டறிவது உங்கள் அறுவடையைக் காப்பாற்றும். தினமும் உங்கள் செடிகளை சரிபார்க்கவும்.",
    farmingCompanion: "உங்கள் விவசாயத் தோழன்",
    development: "அபிவிருத்தி",
    production: "உற்பத்தி",
  },
};

export default function HomeScreen() {
  const { user } = useApp();
  const navigation = useNavigation<any>();
  const { language: lang } = useLanguage();
  const { unreadCount } = useNotifications();

  // ✅ Ensure language is properly tracked
  const language: LanguageType = useMemo(() => {
    return lang === "sinhala" ? "si" : lang === "tamil" ? "ta" : "en";
  }, [lang]);

  // ✅ Get translations based on language
  const t = useMemo(() => translations[language], [language]);

  // ✨ Animations
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const scaleAnim = new Animated.Value(0.8);

  // ✅ Re-trigger animations when language changes
  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    scaleAnim.setValue(0.8);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [language]);

  // ✅ Build features array with language dependency
  const features = useMemo(
    () => [
      {
        icon: TrendingUp,
        title: t.priceForecasting,
        description: t.priceDescription,
        color: "#3b82f6",
        route: "PriceForecast",
      },
      {
        icon: Bug,
        title: t.pestIdentifier,
        description: t.pestDescription,
        color: "#ef4444",
        route: "DiseaseIdentify",
      },
      {
        icon: Leaf,
        title: t.diseaseIdentifier,
        description: t.diseaseDescription,
        color: "#22c55e",
        route: "DiseaseIdentifier",
      },
      {
        icon: BarChart3,
        title: t.yieldPrediction,
        description: t.yieldDescription,
        color: "#8b5cf6",
        route: "PredictYield",
      },
    ],
    [t]
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#10B981", "#0faa76ff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.appTitle}>🌱 MaizeGenie</Text>
            <Text style={styles.headerSubtitle}>{t.farmingCompanion}</Text>
          </View>

          {/* ✅ Notification Button */}
          <TouchableOpacity
            style={styles.notifButton}
            onPress={() => navigation.navigate("Notifications")}
          >
            <Bell size={24} color="#FFFFFF" />
            {unreadCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ✅ PADDED SECTION (All normal content) */}
        <View style={styles.pagePadding}>
          {/* Welcome Card */}
          <Animated.View
            style={[
              styles.welcomeCardContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={["#10b981", "#059669"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.welcomeCard}
            >
              <View style={styles.welcomeContent}>
                <Text style={styles.welcomeTitle}>{t.welcome}</Text>
                <Text style={styles.welcomeName}>
                  {user?.full_name || user?.email || "Guest User"}
                </Text>
                <Text style={styles.welcomeSubtext}>{t.welcomeSubtext}</Text>
              </View>

              <View style={styles.welcomeEmoji}>
                <Text style={styles.emojiText}>👨‍🌾</Text>
              </View>
            </LinearGradient>

            {/* Chat Button */}
            {user?.role === "farmer" ? (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Chat", {
                    roomId: null,
                    userId: user?.id,
                  })
                }
                style={styles.chatButtonWrapper}
              >
                <LinearGradient
                  colors={["#059669", "#047857"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.chatButton}
                >
                  <MessageSquare size={20} color="#ffffff" />
                  <Text style={styles.chatButtonText}>{t.chatWithOfficer}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : user?.role === "officer" ? (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("OfficerRooms", {
                    officerId: user?.id,
                  })
                }
                style={styles.chatButtonWrapper}
              >
                <LinearGradient
                  colors={["#3b82f6", "#1d4ed8"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.chatButton}
                >
                  <MessageSquare size={20} color="#ffffff" />
                  <Text style={styles.chatButtonText}>{t.viewFarmerChats}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => navigation.navigate("Login")}
                style={styles.chatButtonWrapper}
              />
            )}
          </Animated.View>
        </View>

        {/* ✅ FULL WIDTH COMPONENT (No padding) */}
        <TopOfficialNews />

        {/* ✅ PADDED SECTION (Rest of the page) */}
        <View style={styles.pagePadding}>
          {/* Features Section */}
          <Animated.View
            style={[styles.featuresSection, { opacity: fadeAnim }]}
          >
            <Text style={styles.sectionTitle}>{t.features}</Text>
            <View style={styles.featuresContainer}>
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => navigation.navigate(feature.route)}
                    activeOpacity={0.7}
                    style={styles.featureCardWrapper}
                  >
                    <LinearGradient
                      colors={["#ffffff", "#f9fafb"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.featureCard}
                    >
                      <View style={styles.featureCardContent}>
                        <View
                          style={[
                            styles.featureIconBox,
                            { backgroundColor: feature.color + "20" },
                          ]}
                        >
                          <IconComponent
                            size={24}
                            color={feature.color}
                            strokeWidth={2}
                          />
                        </View>
                        <View style={styles.featureCardText}>
                          <Text style={styles.featureTitle}>
                            {feature.title}
                          </Text>
                          <Text style={styles.featureDesc}>
                            {feature.description}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.featureArrow}>
                        <Text style={styles.arrowText}>→</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>

          {/* Tips Section */}
          <Animated.View style={[styles.tipsSection, { opacity: fadeAnim }]}>
            <Text style={styles.sectionTitle}>{t.todaysTip}</Text>
            <LinearGradient
              colors={["#fef3c7", "#fde68a"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tipCard}
            >
              <View style={styles.tipIconBox}>
                <Text style={styles.tipIcon}>💡</Text>
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{t.monitorCrops}</Text>
                <Text style={styles.tipDesc}>{t.monitorDescription}</Text>
              </View>
            </LinearGradient>
          </Animated.View>

          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingTop: 52,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
  },

  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 4,
  },

  headerSubtitle: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "600",
  },

  notifButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    position: "relative",
  },

  notifBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#EF4444",
    borderRadius: 999,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  notifBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(16, 185, 129, 0.1)",
  },
  locationText: {
    fontSize: 13,
    color: "#059669",
    fontWeight: "600",
  },
  statusBadge: {
    marginLeft: "auto",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    color: "#059669",
    fontWeight: "700",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  welcomeCardContainer: {
    marginBottom: 24,
  },
  welcomeCard: {
    borderRadius: 20,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    marginBottom: 16,
  },
  welcomeContent: {
    flex: 1,
    gap: 6,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
  },
  welcomeName: {
    fontSize: 16,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.95)",
  },
  welcomeSubtext: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
    marginTop: 4,
  },
  welcomeEmoji: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  emojiText: {
    fontSize: 36,
  },
  chatButtonWrapper: {
    borderRadius: 16,
    overflow: "hidden",
  },
  chatButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  chatButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.1)",
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "800",
    color: "#10b981",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
    textAlign: "center",
  },
  featuresSection: {
    marginBottom: 24,
  },
  featuresContainer: {
    gap: 12,
  },
  featureCardWrapper: {
    borderRadius: 16,
    overflow: "hidden",
  },
  featureCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  featureCardContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  featureCardText: {
    flex: 1,
    gap: 2,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1f2937",
  },
  featureDesc: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  featureArrow: {
    paddingLeft: 8,
  },
  arrowText: {
    fontSize: 20,
    color: "#d1d5db",
    fontWeight: "700",
  },
  tipsSection: {
    marginBottom: 24,
  },
  tipCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.2)",
  },
  tipIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  tipIcon: {
    fontSize: 24,
  },
  tipContent: {
    flex: 1,
    gap: 4,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#92400e",
  },
  tipDesc: {
    fontSize: 13,
    color: "#b45309",
    fontWeight: "500",
    lineHeight: 18,
  },
  bottomSpacing: {
    height: 20,
  },
  pagePadding: {
    paddingHorizontal: 16,
  },
});
