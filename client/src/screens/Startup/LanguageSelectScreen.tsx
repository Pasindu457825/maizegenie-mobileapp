import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Globe, CheckCircle, Zap } from "lucide-react-native";
import { useLanguage } from "../../context/LanguageContext";


const { width, height } = Dimensions.get("window");

type Language = "sinhala" | "english" | "tamil";

export default function LanguageSelectScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim1 = useRef(new Animated.Value(100)).current;
  const slideAnim2 = useRef(new Animated.Value(100)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim1 = useRef(new Animated.Value(0)).current;
  const bounceAnim2 = useRef(new Animated.Value(0)).current;
  const slideAnim3 = useRef(new Animated.Value(100)).current;
  const bounceAnim3 = useRef(new Animated.Value(0)).current;
  const [selectedLang, setSelectedLang] = useState<Language | "">("sinhala");

  useEffect(() => {
    // ✨ Main animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim1, {
        toValue: 0,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim2, {
        toValue: 0,
        duration: 600,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim3, {
        toValue: 0,
        duration: 600,
        delay: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // ✨ NEW: Rotation animation for globe
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      })
    ).start();

    // ✨ NEW: Bounce animations for cards
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim1, {
          toValue: -8,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim1, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim2, {
          toValue: -8,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim2, {
          toValue: 0,
          duration: 1400,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim3, {
          toValue: -8,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim3, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const { setLanguage } = useLanguage();

  const handleLanguageSelect = (lang: Language) => {
    setSelectedLang(lang);
    setLanguage(lang); // GLOBAL UPDATE

    setTimeout(() => {
      navigation.replace("Onboarding1"); // ❌ remove params
    }, 300);
  };


  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <LinearGradient
      colors={["#f0fdf4", "#dcfce7", "#bbf7d0"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* ...existing background decorations... */}
      <View style={styles.bgDecoration1} />
      <View style={styles.bgDecoration2} />
      <View style={styles.bgDecoration3} />

      {/* ✨ NEW: Floating particles effect */}
      <View style={styles.particlesContainer}>
        <View style={[styles.floatingParticle, styles.particle1]} />
        <View style={[styles.floatingParticle, styles.particle2]} />
        <View style={[styles.floatingParticle, styles.particle3]} />
      </View>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* ✨ UPDATED: Enhanced icon container with rotation */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ rotate: spin }],
            },
          ]}
        >
          <LinearGradient
            colors={["#10b981", "#059669"]}
            style={styles.iconGradient}
          >
            <Globe size={56} color="#ffffff" strokeWidth={1.5} />
          </LinearGradient>
        </Animated.View>

        {/* ✨ UPDATED: Title section with better styling */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            alignItems: "center",
            marginBottom: 48,
          }}
        >
          <Text style={styles.title}>Choose Your Language</Text>
          <Text style={styles.titleSubtext}>ඔබේ භාෂාව තෝරන්න</Text>
          <Text style={styles.titleSubtext}>உங்கள் மொழியை தேர்வு செய்யவும்</Text>

          {/* ✨ NEW: Decorative line under title */}
          <View style={styles.titleUnderline} />
        </Animated.View>

        {/* ✨ UPDATED: Language Cards with enhanced animations */}
        <View style={styles.languageContainer}>
          {/* Sinhala Button */}
          <Animated.View
            style={[
              {
                transform: [
                  { translateX: slideAnim1 },
                  { translateY: bounceAnim1 },
                ],
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleLanguageSelect("sinhala")}
              style={styles.touchable}
            >
              <LinearGradient
                colors={
                  selectedLang === "sinhala"
                    ? ["#059669", "#047857"]
                    : ["#10b981", "#059669"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.languageCard,
                  selectedLang === "sinhala" && styles.languageCardSelected,
                ]}
              >
                {/* ✨ NEW: Shine effect overlay */}
                <View style={styles.shineOverlay} />

                <View style={styles.cardContent}>
                  <View style={styles.flagContainer}>
                    <Text style={styles.flagEmoji}>🇱🇰</Text>
                  </View>
                  <View style={styles.languageInfo}>
                    <Text style={styles.languageText}>සිංහල</Text>
                    <Text style={styles.languageSubtext}>Sinhala Language</Text>
                  </View>
                </View>

                {/* ✨ UPDATED: Enhanced checkmark */}
                <View style={styles.checkmarkContainer}>
                  {selectedLang === "sinhala" ? (
                    <CheckCircle size={24} color="#ffffff" strokeWidth={2.5} />
                  ) : (
                    <View style={styles.uncheckedCircle} />
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* English Button */}
          <Animated.View
            style={[
              {
                transform: [
                  { translateX: slideAnim2 },
                  { translateY: bounceAnim2 },
                ],
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleLanguageSelect("english")}
              style={styles.touchable}
            >
              <LinearGradient
                colors={
                  selectedLang === "english"
                    ? ["#d97706", "#b45309"]
                    : ["#f59e0b", "#d97706"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.languageCard,
                  selectedLang === "english" && styles.languageCardSelected,
                ]}
              >
                {/* ✨ NEW: Shine effect overlay */}
                <View style={styles.shineOverlay} />

                <View style={styles.cardContent}>
                  <View style={styles.flagContainer}>
                    <Text style={styles.flagEmoji}>🇬🇧</Text>
                  </View>
                  <View style={styles.languageInfo}>
                    <Text style={styles.languageText}>English</Text>
                    <Text style={styles.languageSubtext}>English Language</Text>
                  </View>
                </View>

                {/* ✨ UPDATED: Enhanced checkmark */}
                <View style={styles.checkmarkContainer}>
                  {selectedLang === "english" ? (
                    <CheckCircle size={24} color="#ffffff" strokeWidth={2.5} />
                  ) : (
                    <View style={styles.uncheckedCircle} />
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Tamil Button */}
          <Animated.View
            style={[
              {
                transform: [
                  { translateX: slideAnim3 },
                  { translateY: bounceAnim3 },
                ],
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleLanguageSelect("tamil")}
              style={styles.touchable}
            >
              <LinearGradient
                colors={
                  selectedLang === "tamil"
                    ? ["#4f46e5", "#4338ca"]
                    : ["#6366f1", "#4f46e5"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.languageCard,
                  selectedLang === "tamil" && styles.languageCardSelected,
                ]}
              >
                {/* Shine effect overlay */}
                <View style={styles.shineOverlay} />

                <View style={styles.cardContent}>
                  <View style={styles.flagContainer}>
                    <Text style={styles.flagEmoji}>🇱🇰</Text>
                  </View>
                  <View style={styles.languageInfo}>
                    <Text style={styles.languageText}>தமிழ்</Text>
                    <Text style={styles.languageSubtext}>Tamil Language</Text>
                  </View>
                </View>

                {/* Enhanced checkmark */}
                <View style={styles.checkmarkContainer}>
                  {selectedLang === "tamil" ? (
                    <CheckCircle size={24} color="#ffffff" strokeWidth={2.5} />
                  ) : (
                    <View style={styles.uncheckedCircle} />
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* ✨ UPDATED: Info text with enhanced styling */}
        <Animated.Text
          style={[
            styles.infoText,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.7],
              }),
            },
          ]}
        >
          ✓ You can change this anytime in settings
        </Animated.Text>

        {/* ✨ NEW: Feature highlights */}
        <Animated.View
          style={[
            styles.featuresRow,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.featureItem}>
            <Zap size={16} color="#10b981" />
            <Text style={styles.featureText}>Fast Setup</Text>
          </View>
          <View style={styles.featureDivider} />
          <View style={styles.featureItem}>
            <Globe size={16} color="#10b981" />
            <Text style={styles.featureText}>Trilingual</Text>
          </View>
          <View style={styles.featureDivider} />
          <View style={styles.featureItem}>
            <CheckCircle size={16} color="#10b981" />
            <Text style={styles.featureText}>Easy Switch</Text>
          </View>
        </Animated.View>
      </Animated.View>

      {/* ...existing bottom decoration... */}
      <View style={styles.bottomDecoration}>
        <View style={styles.decorativeLine} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  bgDecoration1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    top: -50,
    right: -50,
  },
  bgDecoration2: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    bottom: 100,
    left: -30,
  },
  bgDecoration3: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    top: "40%",
    left: 20,
  },

  // ✨ NEW: Particles effect
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
    backgroundColor: "rgba(16, 185, 129, 0.3)",
  },
  particle1: {
    top: "20%",
    left: "10%",
  },
  particle2: {
    top: "60%",
    right: "15%",
  },
  particle3: {
    bottom: "25%",
    left: "20%",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },

  // ✨ UPDATED: Icon container
  iconContainer: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  iconGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },

  // ✨ UPDATED: Title section
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#065f46",
    marginBottom: 4,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  titleSubtext: {
    fontSize: 18,
    fontWeight: "600",
    color: "#059669",
    marginBottom: 12,
    textAlign: "center",
  },
  titleUnderline: {
    width: 80,
    height: 4,
    backgroundColor: "#10b981",
    borderRadius: 2,
    marginTop: 8,
  },

  languageContainer: {
    width: "100%",
    gap: 16,
  },

  touchable: {
    borderRadius: 20,
    overflow: "hidden",
  },

  // ✨ UPDATED: Language card
  languageCard: {
    width: width - 64,
    height: 100,
    borderRadius: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  languageCardSelected: {
    shadowOpacity: 0.3,
    elevation: 12,
  },

  // ✨ NEW: Shine overlay
  shineOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "30%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  flagContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  flagEmoji: {
    fontSize: 32,
  },
  languageInfo: {
    gap: 2,
  },
  languageText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.3,
  },
  languageSubtext: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "500",
  },

  // ✨ UPDATED: Checkmark container
  checkmarkContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  uncheckedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },

  infoText: {
    fontSize: 13,
    color: "#059669",
    marginTop: 28,
    textAlign: "center",
    fontWeight: "500",
    letterSpacing: 0.3,
  },

  // ✨ NEW: Features row
  featuresRow: {
    marginTop: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    paddingHorizontal: 20,
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    paddingVertical: 14,
    borderRadius: 12,
  },
  featureItem: {
    alignItems: "center",
    gap: 4,
  },
  featureText: {
    fontSize: 11,
    color: "#059669",
    fontWeight: "600",
  },
  featureDivider: {
    width: 1,
    height: 20,
    backgroundColor: "rgba(16, 185, 129, 0.2)",
  },

  bottomDecoration: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  decorativeLine: {
    width: 80,
    height: 4,
    backgroundColor: "#10b981",
    borderRadius: 2,
    opacity: 0.3,
  },
});
