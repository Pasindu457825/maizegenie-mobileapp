// PaymentSuccessScreen.tsx - Payment Success Confirmation
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  CheckCircle,
  Crown,
  Sparkles,
  ArrowRight,
} from "lucide-react-native";
import { useLanguage } from "../../context/LanguageContext";

// Translations
const translations = {
  sinhala: {
    title: "ගෙවීම සාර්ථකයි!",
    subtitle: "ඔබේ Pro සාමාජිකත්වය සක්‍රිය කර ඇත",
    message: "MaizeGenie Pro වෙත සාදරයෙන් පිළිගනිමු! දැන් ඔබට සියලුම premium විශේෂාංග භුක්ති විඳිය හැකිය.",

    features: "සක්‍රිය කළ විශේෂාංග:",
    feature1: "පස් පරීක්ෂණ ඉල්ලීම",
    feature2: "AI අස්වැන්න පුරෝකථනය",
    feature3: "විශේෂඥ උපදෙස්",
    feature4: "සවිස්තර වාර්තා",
    feature5: "දැන්වීම් රහිත අත්දැකීම",
    feature6: "Pro රෝග හඳුනාගැනීමේ ආකෘතිය අගුළුහැර ඇත",

    orderDetails: "ඇණවුම් විස්තර:",
    orderId: "ඇණවුම් අංකය",
    plan: "සැලැස්ම",
    amount: "මුදල",
    date: "දිනය",

    getStarted: "නව විශේෂාංග සමඟ ඉදිරියට යන්න",
    backToHome: "මුල් පිටුවට",
  },
  english: {
    title: "Payment Successful!",
    subtitle: "Your Pro membership has been activated",
    message: "Welcome to MaizeGenie Pro! You now have access to all premium features.",

    features: "Activated Features:",
    feature1: "Soil Test Request",
    feature2: "AI Yield Prediction",
    feature3: "Expert Consultation",
    feature4: "Detailed Reports",
    feature5: "Ad-Free Experience",
    feature6: "Pro Disease Detection Model Unlocked",

    orderDetails: "Order Details:",
    orderId: "Order ID",
    plan: "Plan",
    amount: "Amount",
    date: "Date",

    getStarted: "Continue with new features",
    backToHome: "Back to Home",
  },
  tamil: {
    title: "கொடுப்பனவு வெற்றி!",
    subtitle: "உங்கள் Pro உறுப்பினர் செயல்படுத்தப்பட்டது",
    message: "MaizeGenie Pro க்கு வரவேற்கிறோம்! இப்போது உங்களுக்கு அனைத்து premium சிறப்பம்சங்களுக்கு அணுகல் உண்டு.",

    features: "செயல்படுத்தப்பட்ட சிறப்பம்சங்கள்:",
    feature1: "மண் பரிசோதனை கோரிக்கை",
    feature2: "AI விளைச்சல் கணிப்பு",
    feature3: "நிபுணர் ஆலோசனை",
    feature4: "விரிவான அறிக்கைகள்",
    feature5: "விளம்பரம் இல்லாத அனுபவம்",
    feature6: "Pro நோய் கண்டறிதல் மாதிரி திறக்கப்பட்டது",

    orderDetails: "ஆர்டர் விரிவுகள்:",
    orderId: "ஆர்டர் எண்",
    plan: "திட்டம்",
    amount: "தொகை",
    date: "தேதி",

    getStarted: "புதிய அம்சங்களுடன் தொடரவும்",
    backToHome: "முகப்புக்கு திரும்பு",
  },
} as Record<string, any>;

export default function PaymentSuccessScreen({ navigation, route }: any) {
  const { language } = useLanguage();
  const t = translations[language];

  const { orderId = `PRO_${Date.now()}`, amount = 2499 } = route.params || {};

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleGetStarted = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "Main" }],
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#f0fdf4", "#dcfce7", "#bbf7d0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.iconBg}>
            <CheckCircle size={80} color="#10b981" strokeWidth={2} />
          </View>
          <View style={styles.crownBadge}>
            <Crown size={32} color="#fbbf24" strokeWidth={2} />
          </View>
        </Animated.View>

        {/* Content */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.title}>{t.title}</Text>
          <Text style={styles.subtitle}>{t.subtitle}</Text>
          <Text style={styles.message}>{t.message}</Text>

          {/* Order Details Card */}
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>{t.orderDetails}</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t.orderId}:</Text>
              <Text style={styles.detailValue}>{orderId}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t.plan}:</Text>
              <Text style={styles.detailValue}>MaizeGenie Pro</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t.amount}:</Text>
              <Text style={styles.detailValue}>රු. {amount.toLocaleString()}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t.date}:</Text>
              <Text style={styles.detailValue}>
                {new Date().toLocaleDateString(language === "sinhala" ? "si-LK" : language === "tamil" ? "ta-IN" : "en-US")}
              </Text>
            </View>
          </View>

          {/* Features List */}
          <View style={styles.featuresCard}>
            <View style={styles.featuresHeader}>
              <Sparkles size={20} color="#fbbf24" />
              <Text style={styles.featuresTitle}>{t.features}</Text>
            </View>

            <View style={styles.featuresList}>
              <FeatureItem text={t.feature6} />
              <FeatureItem text={t.feature1} />
              <FeatureItem text={t.feature2} />
              <FeatureItem text={t.feature3} />
              <FeatureItem text={t.feature4} />
              <FeatureItem text={t.feature5} />
            </View>
          </View>

          {/* Get Started Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleGetStarted}
          >
            <LinearGradient
              colors={["#10b981", "#059669"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.button}
            >
              <Crown size={20} color="#ffffff" />
              <Text style={styles.buttonText}>{t.getStarted}</Text>
              <ArrowRight size={20} color="#ffffff" strokeWidth={2.5} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// Feature Item Component
const FeatureItem = ({ text }: { text: string }) => (
  <View style={styles.featureItem}>
    <CheckCircle size={16} color="#10b981" />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconBg: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  crownBadge: {
    position: "absolute",
    top: -10,
    right: 10,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#fbbf24",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },

  content: {
    paddingBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#065f46",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#059669",
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: "#047857",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
    fontWeight: "500",
  },

  detailsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#065f46",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "700",
  },

  featuresCard: {
    backgroundColor: "#065f46",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  featuresHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "600",
  },

  button: {
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.3,
  },
});
