import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { YieldPredictionStackParamList } from "../../navigation/YieldPredictionStack";
import { Sparkles, BookOpen, ArrowLeft } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLanguage } from "../../context/LanguageContext";
import { useApp } from "../../context/AppContext";
import ProUpgradePopup from "../../components/ProUpgradePopup";

type NavProp = StackNavigationProp<YieldPredictionStackParamList, "FertilizerGuideMain">;

const FertilizerGuideMain = () => {
  const navigation = useNavigation<NavProp>();
  const { language: lang } = useLanguage();
  const language: "si" | "en" | "ta" = lang === "sinhala" ? "si" : lang === "tamil" ? "ta" : "en";
  const [showProPopup, setShowProPopup] = useState(false);
  const { user } = useApp();

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

  const content = {
    si: {
      title: "පොහොර මාර්ගෝපදේශ",
      subtitle: "පොහොර උපදේශ සහ මාර්ගෝපදේශ ලබා ගන්න",
      fertilizerAssistant: "ඔබේ පොහොර උපදේශ සහායක",
      fertilizerAssistantDesc: "දෘශ්‍යමාන ලක්ෂණ මත පදනම්ව පොහොර උපදේශ ලබා ගන්න",
      knowledgeBank: "පෝෂක මාර්ගෝපදේශ",
      knowledgeBankDesc: "වගාව සඳහා වැදගත් වන පෝෂක තොරතුරු ලබාගන්න",
    },
    en: {
      title: "Fertilizer Guide",
      subtitle: "Access fertilizer advice and guidelines",
      fertilizerAssistant: "Your Fertilizer Advisory Assistant",
      fertilizerAssistantDesc: "Get fertilizer advices on visible signs based",
      knowledgeBank: "Fertilizer Guidelines",
      knowledgeBankDesc: "Get important nutrient information for cultivation",
    },
    ta: {
      title: "உர வழிகாட்டி",
      subtitle: "உர ஆலோசனை மற்றும் வழிகாட்டுதல்களை அணுகவும்",
      fertilizerAssistant: "உங்கள் உர ஆலோசனை உதவியாளர்",
      fertilizerAssistantDesc: "கண்ணுக்குத் தெரியும் அறிகுறிகளின் அடிப்படையில் உர ஆலோசனை பெறுங்கள்",
      knowledgeBank: "உர வழிகாட்டுதல்கள்",
      knowledgeBankDesc: "பயிர்ச்செய்கைக்கான முக்கிய ஊட்டச்சத்து தகவல்களைப் பெறுங்கள்",
    },
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
            <Text style={styles.headerSubtitle}>{content[language].subtitle}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Card 1: Your Fertilizer Advisory Assistant (Pro Feature) */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              if (hasActiveSubscription) {
                navigation.navigate("RuleBasedAdvisoryInputScreen");
              } else {
                setShowProPopup(true);
              }
            }}
            activeOpacity={0.8}
          >
            <View style={styles.cardContent}>
              <View style={[styles.iconCircle, { backgroundColor: "#DBEAFE" }]}>
                <Text style={styles.blueSparkles}>✨</Text>
              </View>
              <View style={styles.textContent}>
                <View style={styles.proFeatureBadge}>
                  <Sparkles size={10} color="#9333ea" />
                  <Text style={styles.proFeatureText}>Pro</Text>
                </View>
                <Text style={styles.cardTitle}>
                  {content[language].fertilizerAssistant}
                </Text>
                <Text style={styles.cardDesc}>
                  {content[language].fertilizerAssistantDesc}
                </Text>
              </View>
              <View style={styles.arrow}>
                <Text style={styles.arrowText}>→</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Card 2: Knowledge Bank */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("KnowledgeBankMain")}
            activeOpacity={0.8}
          >
            <View style={styles.cardContent}>
              <View style={[styles.iconCircle, { backgroundColor: "#FFEDD5" }]}>
                <BookOpen color="#ea580c" size={28} />
              </View>
              <View style={styles.textContent}>
                <Text style={styles.cardTitle}>
                  {content[language].knowledgeBank}
                </Text>
                <Text style={styles.cardDesc}>
                  {content[language].knowledgeBankDesc}
                </Text>
              </View>
              <View style={styles.arrow}>
                <Text style={styles.arrowText}>→</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Pro Upgrade Popup */}
      <ProUpgradePopup
        visible={showProPopup}
        onClose={() => setShowProPopup(false)}
        onUpgrade={() => {
          setShowProPopup(false);
          navigation.navigate("Payment" as any, { plan: "pro", amount: 2499 });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
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
    textAlign: "center",
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 16,
  },
  card: {
    borderRadius: 24,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 4,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    minHeight: 110,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  textContent: {
    flex: 1,
    paddingRight: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
    letterSpacing: 0.1,
  },
  cardDesc: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
    letterSpacing: 0,
  },
  arrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowText: {
    fontSize: 18,
    color: "#374151",
    fontWeight: "600",
  },
  proFeatureBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(147, 51, 234, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  proFeatureText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9333ea",
    letterSpacing: 0.3,
  },
  blueSparkles: {
    fontSize: 28,
    color: "#3b82f6",
  },
});

export default FertilizerGuideMain;
