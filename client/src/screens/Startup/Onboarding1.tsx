// Onboarding1.tsx
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
import { ArrowRight, Zap, Bug, Leaf, Shield } from "lucide-react-native";
import { useLanguage } from "../../context/LanguageContext";

const { width, height } = Dimensions.get("window");

// Translations
const translations = {
  sinhala: {
    title: "පළිබෝධ සහ රෝග ක්ෂණිකව හඳුනාගන්න",
    description: "AI බලයෙන් තත්‍ය කාලීන හඳුනාගැනීම ලබා ගන්න",
    next: "ඊළඟ",
    feature1: "⚡ පළිබෝධ හඳුනාගැනීම",
    feature2: "🦠 රෝග හඳුනාගැනීම",
    feature3: "📸 ඡායාරූපයෙන් විශ්ලේෂණය",
    feature4: "🎯 95% නිරවද්‍යතාවය",
  },
  english: {
    title: "Identify Pests & Diseases Instantly",
    description: "Get AI-powered real-time detection with expert guidance",
    next: "Next",
    feature1: "⚡ Pest Detection",
    feature2: "🦠 Disease Detection",
    feature3: "📸 Photo Analysis",
    feature4: "🎯 95% Accuracy",
  },
};

type LanguageKey = keyof typeof translations;

export default function Onboarding1({ navigation, route }: any) {
  const { language } = useLanguage();
  const t = translations[language];

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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

    // ✨ Bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -20,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // ✨ Rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4000,
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
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#f0fdf4", "#dcfce7", "#bbf7d0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* ✨ Background Decoration Elements */}
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
        <View style={styles.progressDotActive} />
        <View style={styles.progressDot} />
      </View>

      {/* ✨ UPDATED: Illustration */}
      <Animated.View
        style={[
          styles.illustrationContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: bounceAnim }],
          },
        ]}
      >
        <View style={styles.illustrationBg}>
          {/* ✨ Rotating Icon */}
          <Animated.View
            style={[styles.iconWrapper, { transform: [{ rotate }] }]}
          >
            <Bug size={72} color="#10b981" strokeWidth={1.5} />
          </Animated.View>

          {/* ✨ Disease Icon */}
          <Animated.View
            style={[styles.diseaseIcon, { transform: [{ scale: pulseAnim }] }]}
          >
            <Shield size={32} color="#059669" strokeWidth={2} />
          </Animated.View>

          {/* ✨ Scan Corners */}
          <View style={[styles.scanCorner, styles.scanCorner1]} />
          <View style={[styles.scanCorner, styles.scanCorner2]} />
          <View style={[styles.scanCorner, styles.scanCorner3]} />
          <View style={[styles.scanCorner, styles.scanCorner4]} />

          {/* ✨ Camera Icon */}
          <View style={styles.cameraIcon}>
            <View style={styles.cameraPulse} />
            <Text style={styles.cameraEmoji}>📸</Text>
          </View>
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
        <Text style={styles.description}>{t.description}</Text>

        {/* ✨ UPDATED: Features with Icons */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Bug size={18} color="#10b981" />
            </View>
            <Text style={styles.featureText}>{t.feature1}</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Shield size={18} color="#10b981" />
            </View>
            <Text style={styles.featureText}>{t.feature2}</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Zap size={18} color="#10b981" />
            </View>
            <Text style={styles.featureText}>{t.feature3}</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Leaf size={18} color="#10b981" />
            </View>
            <Text style={styles.featureText}>{t.feature4}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Next Button */}
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
          onPress={() => navigation.navigate("Onboarding2")}
        >
          <LinearGradient
            colors={["#10b981", "#059669"]}
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
    backgroundColor: "rgba(16, 185, 129, 0.3)",
  },
  progressDotActive: {
    width: 32,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10b981",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },

  // ✨ Background Decorations
  bgDecoration1: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    top: -60,
    right: -60,
  },
  bgDecoration2: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(5, 150, 105, 0.06)",
    bottom: 80,
    left: -40,
  },
  bgDecoration3: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(16, 185, 129, 0.05)",
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
    backgroundColor: "rgba(16, 185, 129, 0.25)",
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
    borderColor: "rgba(16, 185, 129, 0.2)",
  },

  // ✨ Icon Wrapper
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },

  // ✨ Disease Icon
  diseaseIcon: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  // ✨ Scan Corners
  scanCorner: {
    position: "absolute",
    width: 32,
    height: 32,
    borderColor: "#10b981",
    borderWidth: 3,
  },
  scanCorner1: {
    top: 10,
    left: 10,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 12,
  },
  scanCorner2: {
    top: 10,
    right: 10,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 12,
  },
  scanCorner3: {
    bottom: 10,
    left: 10,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 12,
  },
  scanCorner4: {
    bottom: 10,
    right: 10,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 12,
  },

  // ✨ Camera Icon
  cameraIcon: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 68,
    height: 68,
    backgroundColor: "#10b981",
    borderRadius: 34,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    overflow: "hidden",
  },
  cameraPulse: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 34,
    backgroundColor: "#10b981",
    opacity: 0.3,
  },
  cameraEmoji: {
    fontSize: 32,
    zIndex: 1,
  },

  content: {
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#065f46",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    color: "#059669",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    fontWeight: "500",
  },

  // ✨ UPDATED: Features
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
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  featureText: {
    fontSize: 15,
    color: "#047857",
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
    shadowColor: "#10b981",
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
