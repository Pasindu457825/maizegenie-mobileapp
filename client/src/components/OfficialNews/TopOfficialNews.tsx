import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import axios from "axios";
import { API_BASE } from "../../services/api";
import { useNavigation } from "@react-navigation/native";
import { useLanguage } from "../../context/LanguageContext";
import { useApp } from "../../context/AppContext";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.88;
const CARD_SPACING = 20;

// =======================
// Types
// =======================
interface NewsItem {
  id: string;
  title: string;
  category:
    | "price"
    | "weather"
    | "policy"
    | "alert"
    | "pest"
    | "disease"
    | "fertilizer"
    | "cultivation"
    | "program";
  image_url?: string;
  district?: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_visible_to_farmers: boolean;
}

type Lang = "si" | "en";

// =======================
// Translations
// =======================
const translations: Record<
  Lang,
  {
    title: string;
    more: string;
    new: string;
    readMore: string;
    category: Record<NewsItem["category"], string>;
  }
> = {
  si: {
    title: "නිල පුවත්",
    more: "තව",
    new: "අලුත්",
    readMore: "තව කියවන්න",
    category: {
      price: "මිල",
      weather: "කාලගුණය",
      policy: "ප්‍රතිපත්ති",
      alert: "අනතුරු ඇඟවීම",
      pest: "පළිබෝධ",
      disease: "රෝග",
      fertilizer: "පොහොර",
      cultivation: "වගා උපදෙස්",
      program: "වැඩසටහන්",
    },
  },
  en: {
    title: "Official News",
    more: "More",
    new: "NEW",
    readMore: "Read more",
    category: {
      price: "Price",
      weather: "Weather",
      policy: "Policy",
      alert: "Alert",
      pest: "Pest",
      disease: "Disease",
      fertilizer: "Fertilizer",
      cultivation: "Cultivation",
      program: "Program",
    },
  },
};

export default function TopOfficialNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [scrollX] = useState(new Animated.Value(0));
  const [shimmerAnim] = useState(new Animated.Value(0));
  const navigation = useNavigation<any>();

  const { language } = useLanguage();
  const lang: Lang = language === "sinhala" ? "si" : "en";
  const t = translations[lang];

  const { user } = useApp();
  const isOfficer = user?.role === "officer";

  // =======================
  // Fetch top 3 news
  // =======================
  const fetchTopNews = async () => {
    try {
      const res = await axios.get(`${API_BASE}/official-news`);
      setNews(res.data.slice(0, 3));
    } catch (err) {
      console.error("TOP NEWS ERROR:", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTopNews();
    }, [])
  );

  // =======================
  // Animations
  // =======================
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    const shimmer = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );
    shimmer.start();

    return () => {
      pulse.stop();
      shimmer.stop();
    };
  }, []);

  // =======================
  // Category configurations
  // =======================
  const categoryConfig = (cat: string) => {
    const configs: Record<string, any> = {
      price: {
        color: "#059669",
        gradient: ["#34d399", "#059669", "#047857"],
        icon: "💰",
        light: "#d1fae5",
      },
      weather: {
        color: "#0891b2",
        gradient: ["#67e8f9", "#0891b2", "#0e7490"],
        icon: "🌤️",
        light: "#cffafe",
      },
      policy: {
        color: "#16a34a",
        gradient: ["#4ade80", "#16a34a", "#15803d"],
        icon: "📋",
        light: "#dcfce7",
      },
      alert: {
        color: "#ea580c",
        gradient: ["#fb923c", "#ea580c", "#c2410c"],
        icon: "⚠️",
        light: "#fed7aa",
      },
      pest: {
        color: "#b45309",
        gradient: ["#fbbf24", "#b45309", "#92400e"],
        icon: "🐛",
        light: "#fef3c7",
      },
      disease: {
        color: "#dc2626",
        gradient: ["#f87171", "#dc2626", "#991b1b"],
        icon: "🦠",
        light: "#fee2e2",
      },
      fertilizer: {
        color: "#15803d",
        gradient: ["#86efac", "#15803d", "#166534"],
        icon: "🌱",
        light: "#bbf7d0",
      },
      cultivation: {
        color: "#0d9488",
        gradient: ["#5eead4", "#0d9488", "#0f766e"],
        icon: "🌾",
        light: "#ccfbf1",
      },
      program: {
        color: "#2563eb",
        gradient: ["#60a5fa", "#2563eb", "#1d4ed8"],
        icon: "📅",
        light: "#dbeafe",
      },
    };
    return (
      configs[cat] || {
        color: "#10b981",
        gradient: ["#6ee7b7", "#10b981", "#059669"],
        icon: "📢",
        light: "#d1fae5",
      }
    );
  };

  // =======================
  // UI
  // =======================
  if (news.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      {/* Ultra Modern Glass Header */}
      <View style={styles.headerContainer}>
        <View style={styles.glassHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.iconCircle}>
              <LinearGradient
                colors={["#34d399", "#10b981"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconGradient}
              >
                <Text style={styles.headerIcon}>📰</Text>
              </LinearGradient>
            </View>
            <View>
              <Text style={styles.title}>{t.title}</Text>
              <View style={styles.titleUnderline} />
            </View>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("OfficialNews")}
            style={styles.moreButton}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#34d399", "#10b981", "#059669"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.moreGradient}
            >
              <Text style={styles.more}>{t.more}</Text>
              <View style={styles.arrowCircle}>
                <Text style={styles.arrow}>→</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Premium Card Carousel */}
      <Animated.ScrollView
        horizontal
        pagingEnabled={false}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        snapToAlignment="start"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
      >
        {news.map((item, index) => {
          const config = categoryConfig(item.category);
          const inputRange = [
            (index - 1) * (CARD_WIDTH + CARD_SPACING),
            index * (CARD_WIDTH + CARD_SPACING),
            (index + 1) * (CARD_WIDTH + CARD_SPACING),
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.92, 1, 0.92],
            extrapolate: "clamp",
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.5, 1, 0.5],
            extrapolate: "clamp",
          });

          const rotateY = scrollX.interpolate({
            inputRange,
            outputRange: ["-15deg", "0deg", "15deg"],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={item.id}
              style={[
                styles.cardWrapper,
                {
                  transform: [{ scale }, { perspective: 1000 }, { rotateY }],
                  opacity,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.95}
                onPress={() =>
                  navigation.navigate("NewsDetail", { id: item.id })
                }
              >
                {/* Animated Background Glow */}
                <View
                  style={[styles.cardGlow, { backgroundColor: config.light }]}
                />

                {/* NEW Badge with Enhanced Animation */}
                {index === 0 && (
                  <Animated.View
                    style={[
                      styles.newBadge,
                      { transform: [{ scale: pulseAnim }] },
                    ]}
                  >
                    <LinearGradient
                      colors={["#fbbf24", "#f59e0b", "#d97706"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.newBadgeGradient}
                    >
                      <View style={styles.sparkleContainer}>
                        <Text style={styles.sparkle}>✨</Text>
                      </View>
                      <Text style={styles.newBadgeText}>{t.new}</Text>
                    </LinearGradient>
                  </Animated.View>
                )}

                {/* Premium Image Container */}
                <View style={styles.imageContainer}>
                  {item.image_url ? (
                    <>
                      <Image
                        source={{ uri: item.image_url }}
                        style={styles.image}
                        resizeMode="cover"
                      />
                      <LinearGradient
                        colors={["transparent", "rgba(0,0,0,0.7)"]}
                        style={styles.imageGradient}
                      />
                    </>
                  ) : (
                    <LinearGradient
                      colors={config.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.placeholderImage}
                    >
                      <Text style={styles.placeholderIcon}>{config.icon}</Text>
                      <View style={styles.placeholderPattern} />
                    </LinearGradient>
                  )}

                  {/* Floating Premium Badge */}
                  <View style={styles.floatingBadge}>
                    <LinearGradient
                      colors={config.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.badgeGradient}
                    >
                      <Text style={styles.badgeIcon}>{config.icon}</Text>
                      <Text style={styles.badgeText}>
                        {t.category[item.category]}
                      </Text>
                    </LinearGradient>
                  </View>
                </View>

                {/* Enhanced Content Section */}
                <View style={styles.cardContent}>
                  <View style={styles.contentTop}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {item.title}
                    </Text>

                    {item.district && (
                      <View style={styles.districtContainer}>
                        <View
                          style={[
                            styles.locationDot,
                            { backgroundColor: config.color },
                          ]}
                        />
                        <Text style={styles.districtText} numberOfLines={1}>
                          {item.district}
                        </Text>
                      </View>
                    )}

                    {/* Updated Date Display */}
                    <View style={styles.dateContainer}>
                      <Text style={[styles.dateText, { color: config.color }]}>
                        {lang === "si" ? "🔄 Updated: " : "🔄 Updated: "}
                        {new Date(
                          item.updated_at &&
                            item.updated_at !== "1970-01-01T00:00:00"
                            ? item.updated_at
                            : item.created_at,
                        ).toLocaleDateString(lang === "si" ? "si-LK" : "en-US")}
                      </Text>
                    </View>
                  </View>

                  {/* Modern Read More Button */}
                  <View style={styles.readMoreContainer}>
                    <View style={styles.readMoreLeft}>
                      <View
                        style={[
                          styles.readMoreDot,
                          { backgroundColor: config.color },
                        ]}
                      />
                      <Text
                        style={[styles.readMoreText, { color: config.color }]}
                      >
                        {t.readMore}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.readMoreButton,
                        { backgroundColor: config.light },
                      ]}
                    >
                      <Text
                        style={[styles.readMoreArrow, { color: config.color }]}
                      >
                        →
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Animated Bottom Accent */}
                <LinearGradient
                  colors={config.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.accentLine}
                />

                {/* Corner Decoration */}
                <View
                  style={[
                    styles.cornerDecoration,
                    { borderTopColor: config.color },
                  ]}
                />
              </TouchableOpacity>

              {/* Officer Actions */}
              {isOfficer && (
                <View style={styles.adminActions}>
                  <TouchableOpacity
                    style={styles.adminButton}
                    onPress={() =>
                      navigation.navigate("AdminEditOfficialNews", {
                        newsId: item.id,
                      })
                    }
                  >
                    <LinearGradient
                      colors={["#ffffff", "#f3f4f6"]}
                      style={styles.adminGradient}
                    >
                      <Text style={styles.adminIcon}>✏️</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          );
        })}
      </Animated.ScrollView>

      {/* Premium Scroll Indicators */}
      <View style={styles.indicatorContainer}>
        {news.map((_, index) => {
          const inputRange = [
            (index - 1) * (CARD_WIDTH + CARD_SPACING),
            index * (CARD_WIDTH + CARD_SPACING),
            (index + 1) * (CARD_WIDTH + CARD_SPACING),
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 32, 8],
            extrapolate: "clamp",
          });

          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.indicator,
                {
                  width: dotWidth,
                  opacity: dotOpacity,
                },
              ]}
            >
              <LinearGradient
                colors={["#34d399", "#10b981"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.indicatorGradient}
              />
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

// =======================
// Premium Styles
// =======================
const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 32,
  },
  headerContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  glassHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "rgba(16, 185, 129, 0.15)",
    elevation: 12,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  iconGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  headerIcon: {
    fontSize: 24,
  },
  title: {
    fontSize: 21,
    fontWeight: "900",
    color: "#064e3b",
    letterSpacing: 0.5,
  },
  titleUnderline: {
    height: 3,
    width: 40,
    backgroundColor: "#10b981",
    borderRadius: 2,
    marginTop: 4,
  },
  moreButton: {
    borderRadius: 28,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  moreGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 10,
  },
  more: {
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  arrowCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  arrow: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "900",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginRight: CARD_SPACING,
  },
  card: {
    width: "100%",
    height: 430,
    backgroundColor: "#ffffff",
    borderRadius: 28,
    elevation: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  cardGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
    zIndex: 0,
  },
  newBadge: {
    position: "absolute",
    top: 20,
    right: 20,
    borderRadius: 24,
    overflow: "hidden",
    zIndex: 20,
    elevation: 12,
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  newBadgeGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  sparkleContainer: {
    marginRight: 2,
  },
  sparkle: {
    fontSize: 14,
  },
  newBadgeText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
  },
  imageContainer: {
    width: "100%",
    height: 205,
    backgroundColor: "#f9fafb",
    position: "relative",
    zIndex: 1,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  placeholderIcon: {
    fontSize: 72,
    opacity: 0.9,
    zIndex: 2,
  },
  placeholderPattern: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0.1,
  },
  floatingBadge: {
    position: "absolute",
    bottom: 20,
    left: 20,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  badgeGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  badgeIcon: {
    fontSize: 16,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  cardContent: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
    zIndex: 2,
  },
  contentTop: {
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    lineHeight: 28,
    letterSpacing: 0.3,
  },
  districtContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  locationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  districtText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4b5563",
    letterSpacing: 0.3,
  },
  dateContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  dateText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  readMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  readMoreLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  readMoreDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  readMoreButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2E5E3E",
  },
  readMoreArrow: {
    fontSize: 18,
    fontWeight: "900",
  },
  accentLine: {
    height: 5,
    width: "100%",
    zIndex: 3,
  },
  cornerDecoration: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    borderTopWidth: 40,
    borderLeftWidth: 40,
    borderLeftColor: "transparent",
    opacity: 0.15,
    zIndex: 1,
  },
  adminActions: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 30,
  },
  adminButton: {
    borderRadius: 24,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  adminGradient: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  adminIcon: {
    fontSize: 20,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 24,
  },
  indicator: {
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
  },
  indicatorGradient: {
    flex: 1,
  },
});
