import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Sprout, Zap } from "lucide-react-native";

const { width, height } = Dimensions.get("window");

export default function SplashScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log("Splash Screen Loaded");

    // ✨ Complex animation sequence
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // ✨ Continuous rotation animation for icon
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // ✨ NEW: Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // ✨ NEW: Float animation
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

    setTimeout(() => {
      navigation.replace("LanguageSelect");
    }, 5000);
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <LinearGradient
      colors={["#047857", "#059669", "#10b981"]}
      style={styles.container}
    >
      {/* ✨ UPDATED: Animated background circles with enhanced effects */}
      <Animated.View
        style={[
          styles.bgCircle,
          styles.bgCircle1,
          {
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.08],
            }),
            transform: [{ scale: scaleAnim }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.bgCircle,
          styles.bgCircle2,
          {
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.12],
            }),
            transform: [{ scale: scaleAnim }],
          },
        ]}
      />

      {/* ✨ NEW: Floating particles effect */}
      <View style={styles.particlesContainer}>
        <Animated.View
          style={[
            styles.particle,
            styles.particle1,
            { transform: [{ translateY: floatAnim }] },
          ]}
        />
        <Animated.View
          style={[
            styles.particle,
            styles.particle2,
            { transform: [{ translateY: floatAnim }] },
          ]}
        />
        <Animated.View
          style={[
            styles.particle,
            styles.particle3,
            { transform: [{ translateY: floatAnim }] },
          ]}
        />
      </View>

      {/* Main content */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
          alignItems: "center",
        }}
      >
        {/* ✨ UPDATED: Enhanced icon container with gradient and glow */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ rotate: spin }, { scale: pulseAnim }],
            },
          ]}
        >
          {/* ✨ NEW: Glow effect background */}
          <View style={styles.glowEffect} />

          {/* Icon using Sprout from lucide */}
          <Sprout size={70} color="#ffffff" strokeWidth={1.5} />
        </Animated.View>

        {/* ✨ UPDATED: App Name with enhanced styling */}
        <Animated.Text
          style={[
            styles.appName,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          🌽 MaizeGenie
        </Animated.Text>

        {/* ✨ UPDATED: Enhanced tagline section */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            alignItems: "center",
          }}
        >
          <Text style={styles.tagline}>Smart Farming Companion</Text>
          <Text style={styles.subtagline}>for Sri Lankan Corn Farmers</Text>

          {/* ✨ UPDATED: Decorative underline with gradient effect */}
          <View style={styles.taglineUnderline} />
        </Animated.View>

        {/* ✨ UPDATED: Animated loading dots */}
        <View style={styles.dotsContainer}>
          <Animated.View
            style={[
              styles.dot,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: scaleAnim },
                  {
                    translateY: floatAnim.interpolate({
                      inputRange: [-20, 0],
                      outputRange: [-10, 0],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              styles.dotCenter,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: scaleAnim },
                  {
                    translateY: floatAnim.interpolate({
                      inputRange: [-20, 0],
                      outputRange: [-5, 0],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: scaleAnim },
                  {
                    translateY: floatAnim.interpolate({
                      inputRange: [-20, 0],
                      outputRange: [-10, 0],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
      </Animated.View>

      {/* ✨ UPDATED: Enhanced bottom text */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: 50,
          alignItems: "center",
          opacity: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.8],
          }),
        }}
      >
        <Text style={styles.bottomText}>Powered by 25-26J-272 Team</Text>
        <Text style={styles.bottomSubtext}>🚀 Empowering Agriculture</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  bgCircle: {
    position: "absolute",
    backgroundColor: "#ffffff",
    borderRadius: 9999,
  },
  bgCircle1: {
    width: 400,
    height: 400,
    top: -100,
    left: -100,
  },
  bgCircle2: {
    width: 300,
    height: 300,
    bottom: -50,
    right: -50,
  },

  // ✨ NEW: Particles effect
  particlesContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  particle: {
    position: "absolute",
    width: 8,
    height: 8,
    backgroundColor: "rgba(251, 191, 36, 0.3)",
    borderRadius: 4,
  },
  particle1: {
    left: "20%",
    top: "30%",
  },
  particle2: {
    right: "20%",
    top: "50%",
  },
  particle3: {
    left: "15%",
    bottom: "30%",
  },

  // ✨ UPDATED: Enhanced icon container
  iconContainer: {
    width: 160,
    height: 160,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },

  // ✨ NEW: Glow effect
  glowEffect: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 80,
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    shadowColor: "#fbbf24",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },

  // ✨ UPDATED: App name
  appName: {
    fontSize: 52,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
    letterSpacing: 1.5,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
    marginBottom: 12,
  },

  // ✨ UPDATED: Tagline
  tagline: {
    fontSize: 18,
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "600",
    letterSpacing: 0.8,
    marginBottom: 4,
  },

  // ✨ NEW: Subtagline
  subtagline: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    fontWeight: "400",
    letterSpacing: 0.5,
    marginBottom: 12,
  },

  // ✨ UPDATED: Underline
  taglineUnderline: {
    width: 120,
    height: 4,
    backgroundColor: "#fbbf24",
    borderRadius: 2,
    shadowColor: "#fbbf24",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },

  // ✨ UPDATED: Dots container
  dotsContainer: {
    flexDirection: "row",
    marginTop: 48,
    gap: 16,
    justifyContent: "center",
  },
  dot: {
    width: 12,
    height: 12,
    backgroundColor: "#ffffff",
    borderRadius: 6,
    opacity: 0.5,
    shadowColor: "#ffffff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  dotCenter: {
    opacity: 1,
    width: 14,
    height: 14,
    borderRadius: 7,
  },

  // ✨ NEW: Features section
  featuresSection: {
    flexDirection: "row",
    marginTop: 56,
    gap: 20,
    paddingHorizontal: 20,
  },
  featureItem: {
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  featureBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(251, 191, 36, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.4)",
  },
  featureText: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    fontWeight: "500",
    letterSpacing: 0.3,
  },

  // ✨ UPDATED: Bottom text
  bottomText: {
    fontSize: 14,
    color: "#ffffff",
    letterSpacing: 0.8,
    fontWeight: "600",
  },

  // ✨ NEW: Bottom subtext
  bottomSubtext: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    letterSpacing: 0.5,
    marginTop: 4,
  },
});
