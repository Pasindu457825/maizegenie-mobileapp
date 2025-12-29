// ProUpgradePopup.tsx - Compact Pro plan popup for home screen
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  StyleSheet,
  Dimensions,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  X,
  Crown,
  Sparkles,
  TestTube,
  BarChart3,
  MessageCircle,
  ArrowRight,
} from "lucide-react-native";
import { useLanguage } from "../context/LanguageContext";

const { width, height } = Dimensions.get("window");

interface ProUpgradePopupProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

// Translations
const translations = {
  sinhala: {
    title: "MaizeGenie Pro වෙත උත්ශ්‍රේණි කරන්න",
    subtitle: "වැඩි විශේෂාංග සහ වාසි ලබා ගන්න",
    limitedOffer: "සීමිත දීමනාව",
    saveAmount: "50% ඉතිරි කරන්න",
    originalPrice: "රු. 4,999",
    proPrice: "රු. 2,499",
    lifetime: "ජීවිත කාලය සඳහා",
    upgradeToPro: "Pro වෙත උත්ශ්‍රේණි කරන්න",
    maybeLater: "පසුව",
    
    // Pro Features
    feature1: "පස් පරීක්ෂණ ඉල්ලීම",
    feature2: "AI අස්වැන්න පුරෝකථනය",
    feature3: "විශේෂඥ උපදෙස්",
    feature4: "සවිස්තර වාර්තා",
    feature5: "දැන්වීම් රහිත",
  },
  english: {
    title: "Upgrade to MaizeGenie Pro",
    subtitle: "Get access to premium features and benefits",
    limitedOffer: "Limited Offer",
    saveAmount: "Save 50%",
    originalPrice: "Rs. 4,999",
    proPrice: "Rs. 2,499",
    lifetime: "Lifetime",
    upgradeToPro: "Upgrade to Pro",
    maybeLater: "Maybe Later",
    
    // Pro Features
    feature1: "Soil Test Request",
    feature2: "AI Yield Prediction",
    feature3: "Expert Consultation",
    feature4: "Detailed Reports",
    feature5: "Ad-Free Experience",
  },
};

export default function ProUpgradePopup({
  visible,
  onClose,
  onUpgrade,
}: ProUpgradePopupProps) {
  const { language } = useLanguage();
  const t = translations[language];

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 40,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.03,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(300);
      scaleAnim.setValue(0.9);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <X size={20} color="#065f46" strokeWidth={2.5} />
          </TouchableOpacity>

          {/* Limited Offer Badge */}
          <View style={styles.offerBadge}>
            <LinearGradient
              colors={["#fbbf24", "#f59e0b"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.offerBadgeGradient}
            >
              <Sparkles size={12} color="#ffffff" />
              <Text style={styles.offerText}>{t.limitedOffer}</Text>
            </LinearGradient>
          </View>

          <LinearGradient
            colors={["#065f46", "#047857"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.proCard}
          >
            {/* Header */}
            <View style={styles.header}>
              <Animated.View
                style={[
                  styles.iconContainer,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <Crown size={32} color="#fbbf24" strokeWidth={2} />
              </Animated.View>
              <Text style={styles.title}>{t.title}</Text>
              <Text style={styles.subtitle}>{t.subtitle}</Text>
            </View>

            {/* Pricing */}
            <View style={styles.pricingContainer}>
              <Text style={styles.originalPrice}>{t.originalPrice}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.proPrice}>{t.proPrice}</Text>
                <Text style={styles.lifetime}>{t.lifetime}</Text>
              </View>
              <Text style={styles.saveText}>{t.saveAmount}</Text>
            </View>

            {/* Features */}
            <View style={styles.featuresContainer}>
              <FeatureItem icon={TestTube} text={t.feature1} />
              <FeatureItem icon={BarChart3} text={t.feature2} />
              <FeatureItem icon={MessageCircle} text={t.feature3} />
              <FeatureItem icon={Sparkles} text={t.feature4} />
              <FeatureItem icon={Crown} text={t.feature5} />
            </View>

            {/* Upgrade Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onUpgrade}
            >
              <LinearGradient
                colors={["#10b981", "#059669"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.upgradeButton}
              >
                <Crown size={18} color="#ffffff" />
                <Text style={styles.upgradeButtonText}>{t.upgradeToPro}</Text>
                <ArrowRight size={18} color="#ffffff" strokeWidth={2.5} />
              </LinearGradient>
            </TouchableOpacity>

            {/* Maybe Later Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleClose}
              style={styles.laterButton}
            >
              <Text style={styles.laterButtonText}>{t.maybeLater}</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

// Feature Item Component
const FeatureItem = ({ icon: Icon, text }: { icon: any; text: string }) => (
  <View style={styles.featureItem}>
    <View style={styles.featureIconContainer}>
      <Icon size={14} color="#10b981" strokeWidth={2.5} />
    </View>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: width * 0.92,
    marginBottom: 20,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },

  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  offerBadge: {
    position: "absolute",
    top: -1,
    left: "50%",
    transform: [{ translateX: -60 }],
    zIndex: 10,
  },
  offerBadgeGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  offerText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.5,
  },

  proCard: {
    padding: 24,
    paddingTop: 32,
  },

  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(251, 191, 36, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 18,
    fontWeight: "500",
  },

  pricingContainer: {
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  originalPrice: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    textDecorationLine: "line-through",
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 4,
  },
  proPrice: {
    fontSize: 36,
    fontWeight: "900",
    color: "#ffffff",
  },
  lifetime: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
  },
  saveText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6ee7b7",
  },

  featuresContainer: {
    gap: 12,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  featureText: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "600",
    flex: 1,
  },

  upgradeButton: {
    height: 52,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 12,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.3,
  },

  laterButton: {
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  laterButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.7)",
  },
});
