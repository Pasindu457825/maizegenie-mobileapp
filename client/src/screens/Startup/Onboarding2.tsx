// Onboarding2.tsx
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowRight,
  Cloud,
  DollarSign,
  Droplets,
  TrendingUp,
  Zap,
} from "lucide-react-native";
import { useLanguage } from "../../context/LanguageContext";

const { width, height } = Dimensions.get("window");

// ✨ FIXED: Type definition for language
type LanguageType = "sinhala" | "english";

const translations = {
  sinhala: {
    title: "🌾 ස්මාර්ට් ගොවි මිතුරු",
    description: "කාලගුණ, මිල සහ පෝෂක උපදෙස්",
    next: "ආරම්භ කරමු",
    feature1: "☀️ 7-දින කාලගුණ පුරෝකථනය",
    feature2: "💰 සජීවී වෙළඳ මිල",
    feature3: "🌱 පෝෂක නිර්දේශ",
  },
  english: {
    title: "🌾 Smart Farming Assistant",
    description: "Weather, prices, and fertilizer guidance",
    next: "Get Started",
    feature1: "☀️ 7-Day Weather Forecast",
    feature2: "💰 Live Market Prices",
    feature3: "🌱 Fertilizer Recommendations",
  },
};

export default function Onboarding2({ navigation, route }: any) {
  const { language } = useLanguage();
  const t = translations[language];

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // ✨ Float animation for weather icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -20,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // ✨ Rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // ✨ Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
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

    // ✨ Bounce animation for price icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -12,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#fef3c7", "#fde68a", "#fcd34d"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* ✨ Background Decoration Elements - Agriculture colors */}
      <View style={styles.bgDecoration1} />
      <View style={styles.bgDecoration2} />
      <View style={styles.bgDecoration3} />

      {/* ✨ Floating Particles */}
      <View style={styles.particlesContainer}>
        <View style={[styles.floatingParticle, styles.particle1]} />
        <View style={[styles.floatingParticle, styles.particle2]} />
        <View style={[styles.floatingParticle, styles.particle3]} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressDot} />
        <View style={styles.progressDotActive} />
      </View>

      {/* ✨ Enhanced Illustration */}
      <Animated.View
        style={[
          styles.illustrationContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: floatAnim }],
          },
        ]}
      >
        <View style={styles.illustrationBg}>
          {/* ✨ Rotating Weather Icon */}
          <Animated.View
            style={[styles.weatherIconWrapper, { transform: [{ rotate }] }]}
          >
            <Cloud size={76} color="#8B6914" strokeWidth={1.5} />
          </Animated.View>

          {/* ✨ Floating Icons Around */}
          <Animated.View
            style={[
              styles.floatingIcon1,
              { transform: [{ translateY: bounceAnim }] },
            ]}
          >
            <View style={styles.iconBadge1}>
              <DollarSign size={28} color="#92400e" strokeWidth={2} />
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.floatingIcon2,
              { transform: [{ translateY: bounceAnim }] },
            ]}
          >
            <View style={styles.iconBadge2}>
              <Droplets size={28} color="#b45309" strokeWidth={2} />
            </View>
          </Animated.View>

          {/* ✨ Stats Badge */}
          <Animated.View
            style={[styles.statsBadge, { transform: [{ scale: pulseAnim }] }]}
          >
            <Text style={styles.statsIcon}>📊</Text>
            <Text style={styles.statsText}>Real-time</Text>
          </Animated.View>
        </View>
      </Animated.View>

      {/* ✨ Content */}
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
        <Text style={styles.description}>{t.description}</Text>

        {/* ✨ Features with Icons */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Cloud size={18} color="#92400e" />
            </View>
            <Text style={styles.featureText}>{t.feature1}</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <DollarSign size={18} color="#92400e" />
            </View>
            <Text style={styles.featureText}>{t.feature2}</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Droplets size={18} color="#92400e" />
            </View>
            <Text style={styles.featureText}>{t.feature3}</Text>
          </View>
        </View>
      </Animated.View>

      {/* ✨ FIXED: Next Button - Pass language correctly */}
      <Animated.View
        style={[
          styles.buttonContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate("Login")}
        >
          <LinearGradient
            colors={["#b45309", "#92400e"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.nextButton}
          >
            <Text style={styles.buttonText}>{t.next}</Text>
            <ArrowRight size={20} color="#ffffff" strokeWidth={2.5} />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 60,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(180, 83, 9, 0.3)",
  },
  progressDotActive: {
    width: 32,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#b45309",
    shadowColor: "#b45309",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },

  // ✨ Background Decorations - Agriculture/Farm colors
  bgDecoration1: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(180, 83, 9, 0.08)",
    top: -60,
    right: -60,
  },
  bgDecoration2: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(146, 64, 14, 0.06)",
    bottom: 80,
    left: -40,
  },
  bgDecoration3: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(180, 83, 9, 0.05)",
    top: "45%",
    left: 10,
  },

  // ✨ Particles
  particlesContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  floatingParticle: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(180, 83, 9, 0.25)",
  },
  particle1: {
    top: "25%",
    left: "15%",
  },
  particle2: {
    top: "55%",
    right: "18%",
  },
  particle3: {
    bottom: "30%",
    left: "12%",
  },

  illustrationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -40,
  },
  illustrationBg: {
    width: 300,
    height: 300,
    backgroundColor: "#ffffff",
    borderRadius: 150,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 28,
    elevation: 12,
    position: "relative",
    borderWidth: 3,
    borderColor: "rgba(180, 83, 9, 0.2)",
  },

  // ✨ Weather Icon Wrapper
  weatherIconWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },

  // ✨ Floating Icons
  floatingIcon1: {
    position: "absolute",
    top: 30,
    right: 30,
  },
  floatingIcon2: {
    position: "absolute",
    bottom: 30,
    left: 30,
  },
  iconBadge1: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "rgba(146, 64, 14, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconBadge2: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "rgba(180, 83, 9, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  // ✨ Stats Badge
  statsBadge: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "#b45309",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    shadowColor: "#b45309",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  statsIcon: {
    fontSize: 18,
  },
  statsText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },

  content: {
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#92400e",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    color: "#b45309",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    fontWeight: "500",
  },

  // ✨ Features
  featuresContainer: {
    gap: 14,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(180, 83, 9, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  featureText: {
    fontSize: 15,
    color: "#92400e",
    fontWeight: "700",
    flex: 1,
  },

  buttonContainer: {
    paddingHorizontal: 32,
    paddingBottom: 50,
  },
  nextButton: {
    height: 60,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    shadowColor: "#b45309",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
});
