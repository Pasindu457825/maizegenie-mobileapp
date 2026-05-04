import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StackNavigationProp } from "@react-navigation/stack";
import { PestIdentifyStackParamList } from "../../navigation/PestIdentifyStack";
import { useLanguage } from "../../context/LanguageContext";
import { 
  Search, 
  Activity, 
  MessageCircle, 
  Sparkles,
  ArrowRight,
  Shield,
  TrendingUp,
  Users
} from "lucide-react-native";

const { width, height } = Dimensions.get("window");

type MaizeGenieHomeProps = {
  navigation: StackNavigationProp<PestIdentifyStackParamList>;
};

type LangKey = "si" | "en" | "ta";

export default function MaizeGenieHome({
  navigation,
}: MaizeGenieHomeProps) {
  const { language: appLang } = useLanguage();
  const language: LangKey =
    appLang === "sinhala" ? "si" : appLang === "tamil" ? "ta" : "en";

  const handlePestIdentification = () => {
    navigation.navigate("PestIdentifyLoading");
  };

  const handleCropDetails = () => {
    navigation.navigate("PestRiskMeter");
  };

  const handlePestFeedback = () => {
    navigation.navigate("PestFeedback");
  };

  const content = {
    si: {
      tagline: "ස්මාර්ට් ගොවිතැනේ සහායක",
      subtitle: "ශ්‍රී ලාංකීය බඩඉරිගු බෝග ගොවියන් සඳහා",
      description:
        "කෘමි හඳුනාගැනීම සහ වගා කළමනාකරණය සඳහා ඔබේ ස්මාර්ට් සහායක",
      pestBtnTitle: "කෘමියා හඳුනාගන්න",
      pestBtnSub: "AI මගින් ක්ෂණිකව හඳුනාගන්න",
      riskBtnTitle: "කෘමි අවධානම බලන්න",
      riskBtnSub: "වගාවට පෙර අවදානම හදුනාගන්න",
      feedbackBtnTitle: "කෘමි ගැටලු හා උපදෙස්",
      feedbackBtnSub: "ප්‍රජා අත්දැකීම් සහ විසඳුම්",
      features: "විශේෂාංග",
      smartAI: "AI බුද්ධිය",
      realTime: "තත්‍ය කාලීන",
      community: "ප්‍රජා සහාය",
    },
    en: {
      tagline: "Smart Farming Companion",
      subtitle: "for Sri Lankan Corn Farmers",
      description:
        "Your intelligent assistant for pest detection and crop management",
      pestBtnTitle: "Identify Pest",
      pestBtnSub: "Instant AI-powered identification",
      riskBtnTitle: "View Pest Risk",
      riskBtnSub: "Check risk level before cultivation",
      feedbackBtnTitle: "Pest Issues & Advice",
      feedbackBtnSub: "Community experiences and solutions",
      features: "Features",
      smartAI: "Smart AI",
      realTime: "Real-time",
      community: "Community",
    },
    ta: {
      tagline: "ஸ்மார்ட் விவசாய துணை",
      subtitle: "இலங்கை சோள விவசாயிகளுக்காக",
      description: "பூச்சி கண்டறிதலும் பயிர் மேலாண்மைக்கும் உங்கள் புத்திசாலி உதவியாளர்",
      pestBtnTitle: "பூச்சியை கண்டறி",
      pestBtnSub: "AI மூலம் உடனடி அடையாளம்",
      riskBtnTitle: "பூச்சி ஆபத்தை காண்",
      riskBtnSub: "சாகுபடிக்கு முன் ஆபத்து நிலையை பார்க்கவும்",
      feedbackBtnTitle: "பூச்சி பிரச்சினை மற்றும் ஆலோசனை",
      feedbackBtnSub: "சமூக அனுபவங்கள் மற்றும் தீர்வுகள்",
      features: "அம்சங்கள்",
      smartAI: "ஸ்மார்ட் AI",
      realTime: "நேரடி",
      community: "சமூகம்",
    },
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#10ad79" />

      {/* Gradient Header */}
      <LinearGradient
        colors={["#10ad79", "#0f9d6b"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        {/* Decorative circles in header */}
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />

        {/* Modern Header Content */}
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <View style={styles.logoInner}>
                <Text style={styles.logoIcon}>🌾</Text>
              </View>
            </View>
          </View>

          <Text style={styles.tagline}>
            {content[language].tagline}
          </Text>
          <Text style={styles.subtitle}>
            {content[language].subtitle}
          </Text>

          <View style={styles.modernDivider}>
            <View style={styles.dividerLine} />
            <Sparkles size={16} color="#ffffff" style={styles.dividerIcon} />
            <View style={styles.dividerLine} />
          </View>
        </View>
      </LinearGradient>

      {/* White Background Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>
            {content[language].description}
          </Text>
        </View>

        {/* Feature Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Shield size={20} color="#10ad79" />
            </View>
            <Text style={styles.statText}>{content[language].smartAI}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <TrendingUp size={20} color="#10ad79" />
            </View>
            <Text style={styles.statText}>{content[language].realTime}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Users size={20} color="#10ad79" />
            </View>
            <Text style={styles.statText}>{content[language].community}</Text>
          </View>
        </View>

        {/* Main Action Buttons */}
        <View style={styles.buttonContainer}>
          {/* Primary Button - Identify Pest */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handlePestIdentification}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={["#10ad79", "#0f9d6b"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButtonGradient}
            >
              <View style={styles.buttonContent}>
                <View style={styles.primaryIconContainer}>
                  <Search size={28} color="#ffffff" strokeWidth={2.5} />
                </View>
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.primaryButtonText}>
                    {content[language].pestBtnTitle}
                  </Text>
                  <Text style={styles.primaryButtonSubtext}>
                    {content[language].pestBtnSub}
                  </Text>
                </View>
                <View style={styles.arrowContainer}>
                  <ArrowRight size={20} color="#ffffff" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Secondary Button - Pest Risk */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleCropDetails}
            activeOpacity={0.9}
          >
            <View style={styles.secondaryButtonContent}>
              <View style={styles.secondaryIconContainer}>
                <Activity size={24} color="#10ad79" strokeWidth={2.5} />
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.secondaryButtonText}>
                  {content[language].riskBtnTitle}
                </Text>
                <Text style={styles.secondaryButtonSubtext}>
                  {content[language].riskBtnSub}
                </Text>
              </View>
              <View style={styles.secondaryArrowContainer}>
                <ArrowRight size={18} color="#10ad79" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Secondary Button - Pest Feedback */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handlePestFeedback}
            activeOpacity={0.9}
          >
            <View style={styles.secondaryButtonContent}>
              <View style={styles.secondaryIconContainer}>
                <MessageCircle size={24} color="#10ad79" strokeWidth={2.5} />
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.secondaryButtonText}>
                  {content[language].feedbackBtnTitle}
                </Text>
                <Text style={styles.secondaryButtonSubtext}>
                  {content[language].feedbackBtnSub}
                </Text>
              </View>
              <View style={styles.secondaryArrowContainer}>
                <ArrowRight size={18} color="#10ad79" />
              </View>
            </View>
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
    backgroundColor: "#ffffff",
  },

  // Gradient Header
  gradientHeader: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },

  circle: {
    position: "absolute",
    borderRadius: 1000,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  circle1: { 
    width: 250, 
    height: 250, 
    top: -100, 
    right: -80 
  },
  circle2: { 
    width: 150, 
    height: 150, 
    bottom: -50, 
    left: -40 
  },

  headerContent: {
    alignItems: "center",
  },

  logoContainer: { 
    marginBottom: 20,
  },

  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },

  logoInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  logoIcon: { 
    fontSize: 45,
  },

  tagline: {
    fontSize: 22,
    color: "#ffffff",
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 6,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 20,
  },

  modernDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  dividerLine: {
    width: 40,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 1,
  },

  dividerIcon: {
    opacity: 0.9,
  },

  // White Background Content
  scrollView: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  scrollContent: {
    paddingBottom: 40,
  },

  // Description
  descriptionContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },

  descriptionText: {
    fontSize: 16,
    color: "#4b5563",
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "500",
  },

  // Stats Container
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 24,
    marginBottom: 32,
  },

  statCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: "#e8f8f2",
    minWidth: 95,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e8f8f2",
    justifyContent: "center",
    alignItems: "center",
  },

  statText: {
    fontSize: 11,
    color: "#1f2937",
    fontWeight: "700",
    textAlign: "center",
  },

  // Button Container
  buttonContainer: { 
    paddingHorizontal: 24,
    gap: 16,
  },

  // Primary Button (Gradient)
  primaryButton: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#10ad79",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },

  primaryButtonGradient: {
    borderRadius: 20,
  },

  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },

  primaryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonTextContainer: {
    flex: 1,
  },

  primaryButtonText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 4,
  },

  primaryButtonSubtext: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
  },

  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Secondary Buttons (White with border)
  secondaryButton: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#e8f8f2",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  secondaryButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    gap: 14,
  },

  secondaryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#e8f8f2",
    justifyContent: "center",
    alignItems: "center",
  },

  secondaryButtonText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 4,
  },

  secondaryButtonSubtext: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },

  secondaryArrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e8f8f2",
    justifyContent: "center",
    alignItems: "center",
  },

  bottomSpacer: {
    height: 20,
  },
});
