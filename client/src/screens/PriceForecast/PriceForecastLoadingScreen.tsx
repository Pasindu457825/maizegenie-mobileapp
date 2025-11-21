import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
} from "react-native";
import {
  Leaf,
  TrendingUp,
  Sprout,
  Bell,
  CloudSun,
  MapPin,
} from "lucide-react-native";
import {
  Sun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudFog,
} from "lucide-react-native";

import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import useUniversalLocation from "../../utils/useUniversalLocation";

const { width } = Dimensions.get("window");

type Language = "si" | "en";
type Content = {
  [key in Language]: {
    title: string;
    subtitle: string;
    mainText: string;
    description: string;
    loading: string;
    getStarted: string;
  };
};

type RootStackParamList = {
  PriceForecastFormScreen: undefined;
};

type NavProp = StackNavigationProp<
  RootStackParamList,
  "PriceForecastFormScreen"
>;

const PriceForecastLoadingScreen = () => {
  const navigation = useNavigation<NavProp>();
  const [language, setLanguage] = useState<Language>("si");
  const [progress, setProgress] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [leafAnim] = useState(new Animated.Value(0));
  const [buttonFadeAnim] = useState(new Animated.Value(0));
  const {
    locationName,
    temperature,
    weatherCondition,
    weatherIcon,
    isLoading,
  } = useUniversalLocation(language);

  const content: Content = {
    si: {
      title: "🌽 ඉරිඟු මිල පුරෝකථනය",
      subtitle: "ස්මාර්ට් ගොවිතැන",
      mainText: "ඔබේ ගොවිතැනට",
      description: "හොඳම මිල හා වගා උපදෙස්",
      loading: "සූදානම් වෙමින්",
      getStarted: "පටන් ගන්න",
    },
    en: {
      title: "🌽 Corn Price Forecast",
      subtitle: "Smart Farming",
      mainText: "Better Prices",
      description: "For Your Harvest",
      loading: "Getting Ready",
      getStarted: "Start Now",
    },
  };

  const headerContent = {
    si: {
      title: "මිල සහ වගා උපදේශක",
      subtitle: "ඔබ ගොවි කරන විදිය සැලසුම් කරන්න",
    },
    en: {
      title: "Price & Cultivation Advisor",
      subtitle: "Plan your crop, track prices",
    },
  };

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Scale animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();

    // Floating leaf animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(leafAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(leafAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Progress animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 3;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [fadeAnim, scaleAnim, leafAnim]);

  // Animate button when progress reaches 100
  useEffect(() => {
    if (progress === 100) {
      Animated.timing(buttonFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [progress, buttonFadeAnim]);

  const leafTranslate = leafAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const handleGetStarted = () => {
    navigation.navigate("PriceForecastFormScreen");
  };

  const getWeatherIcon = (condition: string | null) => {
    if (!condition) return <Cloud size={20} color="#10B981" />;

    const c = condition.toLowerCase();

    if (c.includes("clear")) return <Sun size={20} color="#f59e0b" />;

    if (c.includes("shower") || c.includes("light rain"))
      return <CloudDrizzle size={20} color="#0ea5e9" />;

    // light rain BEFORE general rain
    if (c.includes("light rain"))
      return <CloudDrizzle size={20} color="#0ea5e9" />;

    if (c.includes("rain")) return <CloudRain size={20} color="#0284c7" />;

    if (c.includes("thunder"))
      return <CloudLightning size={20} color="#dc2626" />;

    if (c.includes("mist") || c.includes("fog") || c.includes("haze"))
      return <CloudFog size={20} color="#6b7280" />;

    if (c.includes("cloud")) return <Cloud size={20} color="#10B981" />;

    return <Cloud size={20} color="#10B981" />;
  };
  // Weather translation for Loading Screen
  const getWeatherTranslation = (
    condition: string | null,
    lang: Language
  ): string => {
    if (!condition) return lang === "si" ? "කාලගුණය" : "Weather";

    const c = condition.toLowerCase();

    // RAIN
    if (c.includes("shower rain") || c.includes("light intensity shower"))
      return lang === "si" ? "සෙමෙන් වැසි" : "Light Shower Rain";
    if (c.includes("light rain"))
      return lang === "si" ? "සැහැල්ලු වැසි" : "Light Rain";
    if (c.includes("moderate rain"))
      return lang === "si" ? "මධ්‍යම වැසි" : "Moderate Rain";
    if (c.includes("heavy") && c.includes("rain"))
      return lang === "si" ? "බර වැසි" : "Heavy Rain";

    // CLOUDS
    if (c.includes("clear"))
      return lang === "si" ? "පිරිසිදු අහස" : "Clear Sky";
    if (c.includes("few clouds"))
      return lang === "si" ? "සුළු වලාකුළු" : "Few Clouds";
    if (c.includes("scattered"))
      return lang === "si" ? "විසිරුණු වලාකුළු" : "Scattered Clouds";
    if (c.includes("broken"))
      return lang === "si" ? "කැබලි වලාකුළු" : "Broken Clouds";
    if (c.includes("overcast"))
      return lang === "si" ? "තද වලාකුළු" : "Overcast Clouds";

    // THUNDER
    if (c.includes("thunder"))
      return lang === "si" ? "අකුණු සහිත වැසි" : "Thunderstorm";

    // MIST / FOG
    if (c.includes("mist") || c.includes("fog") || c.includes("haze"))
      return lang === "si" ? "මීදුම" : "Mist";

    return lang === "si" ? "කාලගුණය" : condition;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>
            {headerContent[language].title}
          </Text>
          <Text style={styles.headerSubtitle}>
            {headerContent[language].subtitle}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIconButton}>
            <Bell color="#10B981" size={20} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconButton}>
            {getWeatherIcon(weatherCondition)}
          </TouchableOpacity>

          {/* Language Toggle in Header */}
          <TouchableOpacity
            style={styles.langButtonHeader}
            onPress={() => setLanguage((prev) => (prev === "si" ? "en" : "si"))}
            activeOpacity={0.7}
          >
            <Text style={styles.langText}>
              {language === "si" ? "EN" : "සිං"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sub-header with Location */}
      <View style={styles.subHeader}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>🌾</Text>
          </View>
          <View>
            <View style={styles.locationRow}>
              <MapPin color="#047857" size={14} />
              <Text style={styles.locationText}>{locationName}</Text>
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              {getWeatherIcon(weatherCondition)}

              <Text style={styles.logoTemp}>
                {temperature !== null
                  ? `${Math.round(temperature)}°C`
                  : language === "si"
                  ? "උෂ්ණත්වය..."
                  : "Loading..."}
              </Text>
            </View>

            <Text style={[styles.logoTemp, { fontSize: 13 }]}>
              {weatherCondition
                ? getWeatherTranslation(weatherCondition, language)
                : ""}
            </Text>
          </View>
        </View>
      </View>

      {/* Gradient Background Effect */}
      <View pointerEvents="none" style={styles.gradientTop} />
      <View pointerEvents="none" style={styles.gradientBottom} />

      {/* Floating Leaves Decoration */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.floatingLeaf1,
          { transform: [{ translateY: leafTranslate }] },
        ]}
      >
        <Leaf color="#10B981" size={40} opacity={0.3} />
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.floatingLeaf2,
          { transform: [{ translateY: leafTranslate }] },
        ]}
      >
        <Sprout color="#34D399" size={35} opacity={0.3} />
      </Animated.View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollBody}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Icon Circle */}
          <View style={styles.iconCircle}>
            <View style={styles.iconInner}>
              <Text style={styles.cornEmoji}>🌽</Text>
            </View>
            <View style={styles.pulseRing} />
          </View>

          {/* Title Section */}
          <Text style={styles.subtitle}>{content[language].subtitle}</Text>
          <Text style={styles.mainText}>{content[language].mainText}</Text>
          <Text style={styles.title}>{content[language].title}</Text>
          <Text style={styles.description}>
            {content[language].description}
          </Text>

          {/* Simple Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>

          {/* Loading Text */}
          <Text style={styles.loadingText}>{content[language].loading}...</Text>

          {/* Get Started Button */}
          {progress === 100 && (
            <Animated.View style={{ opacity: buttonFadeAnim }}>
              <TouchableOpacity
                style={styles.startButton}
                onPress={handleGetStarted}
                activeOpacity={0.85}
              >
                <Text style={styles.startButtonText}>
                  {content[language].getStarted}
                </Text>
                <TrendingUp color="#FFFFFF" size={20} />
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4",
    position: "relative",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollBody: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    lineHeight: 20,
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1FAE5",
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  langButtonHeader: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#10B981",
  },
  langText: {
    color: "#10B981",
    fontSize: 13,
    fontWeight: "bold",
  },
  subHeader: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    zIndex: 99,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#10B981",
  },
  logoText: {
    fontSize: 20,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  locationText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#047857",
  },
  logoTemp: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#10B981",
  },
  gradientTop: {
    position: "absolute",
    top: 140,
    left: 0,
    right: 0,
    height: "40%",
    backgroundColor: "#D1FAE5",
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
  },
  gradientBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "30%",
    backgroundColor: "#ECFDF5",
  },
  floatingLeaf1: {
    position: "absolute",
    top: 190,
    left: 30,
    zIndex: 1,
  },
  floatingLeaf2: {
    position: "absolute",
    top: 240,
    right: 40,
    zIndex: 1,
  },
  content: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    zIndex: 10,
    paddingVertical: 20,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    position: "relative",
  },
  iconInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
  },
  cornEmoji: {
    fontSize: 50,
  },
  pulseRing: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: "#10B981",
    opacity: 0.3,
  },
  subtitle: {
    fontSize: 16,
    color: "#059669",
    fontWeight: "600",
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  mainText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#065F46",
    marginBottom: 6,
    textAlign: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#10B981",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#047857",
    marginBottom: 30,
    textAlign: "center",
    fontWeight: "500",
  },
  progressContainer: {
    width: "85%",
    alignItems: "center",
    marginBottom: 12,
  },
  progressBar: {
    width: "100%",
    height: 12,
    backgroundColor: "#D1FAE5",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 20,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#059669",
  },
  loadingText: {
    fontSize: 15,
    color: "#047857",
    fontWeight: "600",
    marginBottom: 20,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#10B981",
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 50,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default PriceForecastLoadingScreen;
