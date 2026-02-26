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
  Droplets,
  Wind,
  Thermometer,
  Lightbulb,
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
import { useLanguage } from "../../context/LanguageContext";
import { Platform } from "react-native";
import { useNotifications } from "../../context/NotificationContext";
import { useApp } from "../../context/AppContext";

// 🔥 Dynamic API URL using .env + Platform detection
const getApiUrl = () => {
  if (Platform.OS === "android") {
    return process.env.EXPO_PUBLIC_API_BASE;
  } else if (Platform.OS === "ios") {
    return "http://localhost:8000";
  } else {
    return "http://localhost:8000";
  }
};

const API_URL = getApiUrl();

const { width } = Dimensions.get("window");
const LOCATION_TRANSLATIONS = {
  Colombo: "කොළඹ",
  Gampaha: "ගම්පහ",
  Kandy: "මහනුවර",
  Matara: "මාතර",
  Hambantota: "හම්බන්තොට",
  Monaragala: "මොණරාගල",
  Anuradhapura: "අනුරාධපුර",
  Polonnaruwa: "පොලොන්නරුව",
  Jaffna: "යාපනය",
  Kurunegala: "කුරුණෑගල",
  Puttalam: "පුත්තලම",
  Badulla: "බදුල්ල",
  "Nuwara Eliya": "නුවර එලිය",
};
type LocationKey = keyof typeof LOCATION_TRANSLATIONS;

type RootStackParamList = {
  PriceForecastFormScreen: undefined;
  WeatherForecastScreen: undefined;
  PriceAdvisorScreen: { formData: any } | undefined;
  Notifications: undefined;
  AdminPanelScreen: undefined;
  ProAdvisorFollowScreen: { formData: any };
};

type Language = "si" | "en";
type Content = {
  [key in Language]: {
    title: string;
    subtitle: string;
    mainText: string;
    description: string;
    loading: string;
    priceButton: string;
    weatherButton: string;
    priceTitle: string;
    weatherTitle: string;
    priceDesc: string;
    weatherDesc: string;
  };
};

type NavProp = StackNavigationProp<
  RootStackParamList,
  "PriceForecastFormScreen"
>;

const PriceForecastLoadingScreen = () => {
  const { unreadCount } = useNotifications();
  type RootNavProp = StackNavigationProp<RootStackParamList>;
  const rootNavigation = useNavigation<RootNavProp>();
  const [notifMessages, setNotifMessages] = useState<string[]>([]);
  const { language: globalLang } = useLanguage();
  const language: Language = globalLang === "sinhala" ? "si" : "en";
  const navigation = useNavigation<NavProp>();
  const [progress, setProgress] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [leafAnim] = useState(new Animated.Value(0));
  const [buttonFadeAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

  // New animations for header
  const [headerGradientAnim] = useState(new Animated.Value(0));
  const [bellShakeAnim] = useState(new Animated.Value(0));
  const [locationPulseAnim] = useState(new Animated.Value(1));

  const {
    locationName,
    temperature,
    weatherCondition,
    weatherIcon,
    isLoading,
  } = useUniversalLocation(language);
  const { user } = useApp();

  const isFarmer = user?.role === "farmer";
  const isOfficer = user?.role === "officer";

  const content: Content = {
    si: {
      title: "🌱 බිම ගොවිතැන",
      subtitle: "ස්මාර්ට් කෘෂි තාක්ෂණය",
      mainText: "ඔබේ ගොවිතැනට",
      description: "නවීන තාක්ෂණික සහාය",
      loading: "පද්ධතිය සූදානම් වෙමින්",
      priceButton: "මිල පුරෝකථනය",
      weatherButton: "කාලගුණය",
      priceTitle: "🌽 ඉරිඟු මිල",
      weatherTitle: "🌦️ කාලගුණය",
      priceDesc: "හොඳම මිල දැන ගන්න",
      weatherDesc: "අද සහ ඉදිරි දින 7 සඳහා පුරෝකථනය",
    },
    en: {
      title: "🌱 Smart Farming",
      subtitle: "Agricultural Technology",
      mainText: "For Your Farm",
      description: "Modern Tech Support",
      loading: "System Preparing",
      priceButton: "Price Forecast",
      weatherButton: "Weather",
      priceTitle: "🌽 Corn Prices",
      weatherTitle: "🌦️ Weather",
      priceDesc: "Get Best Prices",
      weatherDesc: "Today and the Next 7-Day Forecast",
    },
  };

  const headerContent = {
    si: {
      title: "බිම ගොවිතැන",
      subtitle: "ස්මාර්ට් කෘෂි උපදේශක",
    },
    en: {
      title: "Smart Farming",
      subtitle: "Agricultural Advisor",
    },
  };

  const getTranslatedLocation = (rawName: string | null, lang: Language) => {
    if (!rawName) return lang === "si" ? "ස්ථානය" : "Location";
    if (lang === "en") return rawName;

    let enName = rawName.trim();

    enName = enName
      .replace(/District/i, "")
      .replace(/Province/i, "")
      .trim();

    const provinceMap: Record<string, string> = {
      Western: "බස්නාහිර",
      Southern: "දකුණු",
      Central: "මධ්‍යම",
      Northern: "උතුරු",
      Eastern: "නැගෙනහිර",
      NorthWestern: "වයඹ",
      NorthCentral: "උතුරු මැද",
      Uva: "ඌව",
      Sabaragamuwa: "සබරගමුව",
    };

    if (provinceMap[enName]) return provinceMap[enName] + " පළාත";

    const districtMap: Record<string, string> = {
      Colombo: "කොළඹ",
      Gampaha: "ගම්පහ",
      Kalutara: "කළුතර",
      Kandy: "මහනුවර",
      Matale: "මාතලේ",
      NuwaraEliya: "නුවර එලිය",
      Galle: "ගාල්ල",
      Matara: "මාතර",
      Hambantota: "හම්බන්තොට",
      Jaffna: "යාපනය",
      Kilinochchi: "කිලිනොච්චි",
      Mannar: "මන්නාරම",
      Vavuniya: "වවුනියාව",
      Mullaitivu: "මුලතිව්",
      Batticaloa: "බතිකලාව",
      Ampara: "අම්පාර",
      Trincomalee: "ත්‍රිකුණාමලය",
      Kurunegala: "කුරුණෑගල",
      Puttalam: "පුත්තලම",
      Anuradhapura: "අනුරාධපුර",
      Polonnaruwa: "පොලොන්නරුව",
      Badulla: "බදුල්ල",
      Monaragala: "මොණරාගල",
      Ratnapura: "රත්නපුර",
      Kegalle: "කෑගල්ල",
    };

    if (districtMap[enName]) return districtMap[enName];

    return rawName;
  };

  useEffect(() => {
    // Bell shake animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bellShakeAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(bellShakeAnim, {
          toValue: -1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(bellShakeAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(bellShakeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
      ])
    ).start();

    // Location pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(locationPulseAnim, {
          toValue: 1.08,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(locationPulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();

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

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
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
  }, []);

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

  const bellRotate = bellShakeAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-15deg", "15deg"],
  });

  const headerGradientColor = headerGradientAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["#059669", "#10B981", "#059669"],
  });

  const handleGetStarted = () => {
    navigation.navigate("PriceForecastFormScreen");
  };

  const handleWeatherForecast = () => {
    navigation.navigate("WeatherForecastScreen");
  };

  const handleAdvisor = () => {
    navigation.navigate("PriceAdvisorScreen", {
      formData: {
        cropDuration: 14,
        cost: 45000,
        yieldKg: 1750,
      },
    });
  };

  const handleAddPriceDetails = () => {
    navigation.navigate("AdminPanelScreen");
  };

  const getWeatherIcon = (condition: string | null, size: number = 20) => {
    if (!condition) return <Cloud size={size} color="#FFFFFF" />;

    const c = condition.toLowerCase();

    if (c.includes("clear")) return <Sun size={size} color="#FCD34D" />;
    if (c.includes("shower") || c.includes("light rain"))
      return <CloudDrizzle size={size} color="#E0F2FE" />;
    if (c.includes("rain")) return <CloudRain size={size} color="#BAE6FD" />;
    if (c.includes("thunder"))
      return <CloudLightning size={size} color="#FEF3C7" />;
    if (c.includes("mist") || c.includes("fog") || c.includes("haze"))
      return <CloudFog size={size} color="#F3F4F6" />;
    if (c.includes("cloud")) return <Cloud size={size} color="#FFFFFF" />;

    return <Cloud size={size} color="#FFFFFF" />;
  };

  const getWeatherTranslation = (
    condition: string | null,
    lang: Language
  ): string => {
    if (!condition) return lang === "si" ? "කාලගුණය" : "Weather";

    const c = condition.toLowerCase();

    if (c.includes("shower rain") || c.includes("light intensity shower"))
      return lang === "si" ? "සෙමෙන් වැසි" : "Light Shower Rain";
    if (c.includes("light rain"))
      return lang === "si" ? "සැහැල්ලු වැසි" : "Light Rain";
    if (c.includes("moderate rain"))
      return lang === "si" ? "මධ්‍යම වැසි" : "Moderate Rain";
    if (c.includes("heavy") && c.includes("rain"))
      return lang === "si" ? "බර වැසි" : "Heavy Rain";
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
    if (c.includes("thunder"))
      return lang === "si" ? "අකුණු සහිත වැසි" : "Thunderstorm";
    if (c.includes("mist") || c.includes("fog") || c.includes("haze"))
      return lang === "si" ? "මීදුම" : "Mist";

    return lang === "si" ? "කාලගුණය" : condition;
  };

  return (
    <View style={styles.container}>
      {/* Enhanced Green Gradient Header */}
      <Animated.View
        style={[styles.header, { backgroundColor: headerGradientColor }]}
      >
        {/* Decorative circles */}
        <View style={styles.headerDecorCircle1} />
        <View style={styles.headerDecorCircle2} />
        <View style={styles.headerDecorCircle3} />

        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>
              {headerContent[language].title}
            </Text>
            <Text style={styles.headerSubtitle}>
              {headerContent[language].subtitle}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Animated.View style={{ transform: [{ rotate: bellRotate }] }}>
              <TouchableOpacity
                style={styles.headerIconButton}
                onPress={() => rootNavigation.navigate("Notifications")}
              >
                <Bell color="#FFFFFF" size={22} />
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </Animated.View>

      {/* Enhanced Sub-header with Location & Weather */}
      <View style={styles.subHeader}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>🌿</Text>
          </View>
          <View style={styles.locationInfo}>
            <View style={styles.locationRow}>
              <MapPin color="#FFFFFF" size={16} />
              <Text style={styles.locationText}>
                {getTranslatedLocation(locationName, language)}
              </Text>
            </View>
            <View style={styles.weatherRow}>
              {getWeatherIcon(weatherCondition, 18)}
              <Text style={styles.tempText}>
                {temperature !== null ? `${Math.round(temperature)}°C` : "..."}
              </Text>
              <Text
                style={styles.conditionText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {weatherCondition
                  ? getWeatherTranslation(weatherCondition, language)
                  : ""}
              </Text>
            </View>
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
          {/* Icon Circle with Pulse */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <View style={styles.iconCircle}>
              <View style={styles.iconInner}>
                <Text style={styles.cornEmoji}>🌱</Text>
              </View>
              <View style={styles.pulseRing} />
            </View>
          </Animated.View>

          {/* Title Section */}
          <Text style={styles.subtitle}>{content[language].subtitle}</Text>
          <Text style={styles.mainText}>{content[language].mainText}</Text>
          <Text style={styles.title}>{content[language].title}</Text>
          <Text style={styles.description}>
            {content[language].description}
          </Text>

          {/* Enhanced Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress}%`,
                  },
                ]}
              />
              <View style={styles.progressShine} />
            </View>
            <View style={styles.progressTextContainer}>
              <Text style={styles.progressText}>{progress}%</Text>
              <Text style={styles.progressLabel}>
                {content[language].loading}
              </Text>
            </View>
          </View>

          {/* Feature Cards */}
          {progress === 100 && (
            <Animated.View
              style={[styles.cardsContainer, { opacity: buttonFadeAnim }]}
            >
              <TouchableOpacity
                style={[styles.featureCard, styles.priceCard]}
                onPress={handleGetStarted}
                activeOpacity={0.9}
              >
                <View style={styles.cardIconContainer}>
                  <View style={styles.cardIconCircle}>
                    <TrendingUp color="#10B981" size={28} />
                  </View>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>
                    {content[language].priceTitle}
                  </Text>
                  <Text style={styles.cardDescription}>
                    {content[language].priceDesc}
                  </Text>
                </View>
                <View style={styles.cardArrow}>
                  <Text style={styles.arrowText}>→</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.featureCard, styles.weatherCard]}
                onPress={handleWeatherForecast}
                activeOpacity={0.9}
              >
                <View style={styles.cardIconContainer}>
                  <View
                    style={[styles.cardIconCircle, styles.weatherIconCircle]}
                  >
                    <CloudSun color="#0EA5E9" size={28} />
                  </View>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>
                    {content[language].weatherTitle}
                  </Text>
                  <Text style={styles.cardDescription}>
                    {content[language].weatherDesc}
                  </Text>
                </View>
                <View style={styles.cardArrow}>
                  <Text style={styles.arrowText}>→</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.featureCard, styles.priceCard]}
                onPress={handleAdvisor}
                activeOpacity={0.9}
              >
                <View style={styles.cardIconContainer}>
                  <View style={styles.cardIconCircle}>
                    <Leaf color="#059669" size={28} />
                  </View>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>
                    {language === "si"
                      ? "🌱 වගා උපදෙස්"
                      : "🌱 Cultivation Advisor"}
                  </Text>
                  <Text style={styles.cardDescription}>
                    {language === "si"
                      ? "වගාව ආරම්භ කිරීමට අවශ්‍ය මූලික උපදෙස්"
                      : "Essential guidance to start cultivation"}
                  </Text>
                </View>
                <View style={styles.cardArrow}>
                  <Text style={styles.arrowText}>→</Text>
                </View>
              </TouchableOpacity>

              {isOfficer && (
                <TouchableOpacity
                  style={[styles.featureCard, styles.priceCard]}
                  onPress={handleAddPriceDetails}
                  activeOpacity={0.9}
                >
                  <View style={styles.cardIconContainer}>
                    <View style={styles.cardIconCircle}>
                      <TrendingUp color="#DC2626" size={28} />
                    </View>
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>
                      {language === "si"
                        ? "මිල තොරතුරු එකතු කරන්න"
                        : "Add Price Details"}
                    </Text>
                    <Text style={styles.cardDescription}>
                      {language === "si"
                        ? "නිලධාරීන් සඳහා මිල දත්ත ඇතුළත් කිරීම"
                        : "Officer-only price data entry"}
                    </Text>
                  </View>
                  <View style={styles.cardArrow}>
                    <Text style={styles.arrowText}>→</Text>
                  </View>
                </TouchableOpacity>
              )}
              {isOfficer && (
                <TouchableOpacity
                  style={[styles.featureCard, styles.proAdvisorCard]}
                  onPress={() =>
                    rootNavigation.navigate("ProAdvisorFollowScreen", {
                      formData: {
                        source: "officer",
                      },
                    })
                  }
                  activeOpacity={0.9}
                >
                  <View style={styles.cardIconContainer}>
                    <View style={styles.cardIconCircle}>
                      <Lightbulb color="#047857" size={28} />
                    </View>
                  </View>

                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>
                      {language === "si"
                        ? "Pro Advisor උපදෙස් එකතු කරන්න"
                        : "Add Pro Advisor Guidance"}
                    </Text>
                    <Text style={styles.cardDescription}>
                      {language === "si"
                        ? "Pro Advisor උපදෙස් කළමනාකරණය කිරීම"
                        : "Manage Pro Advisor guidance"}
                    </Text>
                  </View>

                  <View style={styles.cardArrow}>
                    <Text style={styles.arrowText}>→</Text>
                  </View>
                </TouchableOpacity>
              )}
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    position: "relative",
    overflow: "hidden",
    zIndex: 100,
  },
  headerDecorCircle1: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  headerDecorCircle2: {
    position: "absolute",
    top: 20,
    right: 60,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  headerDecorCircle3: {
    position: "absolute",
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.07)",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 1,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    lineHeight: 26,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 2,
    fontWeight: "500",
  },
  headerRight: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    position: "relative",
  },
  subHeader: {
    backgroundColor: "#047857",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    zIndex: 99,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  logoText: {
    fontSize: 26,
  },
  locationInfo: {
    flex: 1,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  weatherRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "nowrap", // 🔥 IMPORTANT
  },
  tempText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#FFFFFF",
    minWidth: 48,
  },
  conditionText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.95)",
    fontWeight: "500",
  },
  gradientTop: {
    position: "absolute",
    top: 180,
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
    top: 220,
    left: 30,
    zIndex: 1,
  },
  floatingLeaf2: {
    position: "absolute",
    top: 270,
    right: 40,
    zIndex: 1,
  },
  content: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
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
    marginBottom: 24,
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
    fontSize: 14,
    color: "#059669",
    fontWeight: "600",
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  mainText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#065F46",
    marginBottom: 6,
    textAlign: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#10B981",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    color: "#047857",
    marginBottom: 32,
    textAlign: "center",
    fontWeight: "500",
  },
  progressContainer: {
    width: "90%",
    alignItems: "center",
    marginBottom: 24,
  },
  progressBar: {
    width: "100%",
    height: 14,
    backgroundColor: "#D1FAE5",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 8,
    position: "relative",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 20,
  },
  progressShine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  progressTextContainer: {
    alignItems: "center",
  },
  progressText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#059669",
  },
  progressLabel: {
    fontSize: 13,
    color: "#047857",
    fontWeight: "500",
    marginTop: 2,
  },
  cardsContainer: {
    width: "100%",
    gap: 16,
    marginTop: 8,
  },
  featureCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 2,
  },
  priceCard: {
    borderColor: "#D1FAE5",
  },
  weatherCard: {
    borderColor: "#E0F2FE",
  },
  cardIconContainer: {
    marginRight: 16,
  },
  cardIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#D1FAE5",
  },
  weatherIconCircle: {
    backgroundColor: "#F0F9FF",
    borderColor: "#E0F2FE",
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  cardArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  arrowText: {
    fontSize: 20,
    color: "#10B981",
    fontWeight: "bold",
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#FCD34D",
    borderRadius: 10,
    paddingHorizontal: 6,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  badgeText: {
    color: "#047857",
    fontSize: 10,
    fontWeight: "bold",
  },
  proAdvisorCard: {
    borderColor: "#A7F3D0",
  },
});
export default PriceForecastLoadingScreen;
