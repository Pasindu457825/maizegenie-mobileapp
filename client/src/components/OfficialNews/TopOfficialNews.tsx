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
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_SPACING = 16;

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
    category: Record<NewsItem["category"], string>;
  }
> = {
  si: {
    title: "📰 නිල පුවත්",
    more: "තව",
    new: "අලුත්",
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
    title: "📰 Official News",
    more: "More",
    new: "NEW",
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
  // Pulse animation for NEW badge
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
    return () => pulse.stop();
  }, []);

  // =======================
  // Category configurations
  // =======================
  const categoryConfig = (cat: string) => {
    const configs = {
      price: { color: "#059669", gradient: ["#059669", "#047857"], icon: "💰" },
      weather: { color: "#0d9488", gradient: ["#0d9488", "#0f766e"], icon: "🌤️" },
      policy: { color: "#16a34a", gradient: ["#16a34a", "#15803d"], icon: "📋" },
      alert: { color: "#ea580c", gradient: ["#ea580c", "#c2410c"], icon: "⚠️" },
      pest: { color: "#b45309", gradient: ["#b45309", "#92400e"], icon: "🐛" },
      disease: { color: "#991b1b", gradient: ["#991b1b", "#7f1d1d"], icon: "🦠" },
      fertilizer: { color: "#15803d", gradient: ["#15803d", "#166534"], icon: "🌱" },
      cultivation: { color: "#0f766e", gradient: ["#0f766e", "#115e59"], icon: "🌾" },
      program: { color: "#1d4ed8", gradient: ["#1d4ed8", "#1e40af"], icon: "📅" },
    };
    return  { color: "#10b981", gradient: ["#10b981", "#059669"], icon: "📢" };
  };

  // =======================
  // UI
  // =======================
  if (news.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      {/* Modern Glass Header */}
      <View style={styles.headerContainer}>
        <View style={styles.glassHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.iconCircle}>
              <Text style={styles.headerIcon}>🌾</Text>
            </View>
            <Text style={styles.title}>{t.title}</Text>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("OfficialNews")}
            style={styles.moreButton}
            activeOpacity={0.7}
          >
            <Text style={styles.more}>{t.more}</Text>
            <View style={styles.arrowCircle}>
              <Text style={styles.arrow}>→</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Card Carousel with Parallax */}
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
          { useNativeDriver: false }
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
            outputRange: [0.9, 1, 0.9],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.6, 1, 0.6],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={item.id}
              style={[
                styles.cardWrapper,
                {
                  transform: [{ scale }],
                  opacity,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.95}
                onPress={() => navigation.navigate("NewsDetail", { id: item.id })}
              >
                {/* NEW Badge with Glow */}
                {index === 0 && (
                  <Animated.View
                    style={[
                      styles.newBadge,
                      { transform: [{ scale: pulseAnim }] },
                    ]}
                  >
                    <View style={styles.newBadgeGlow} />
                    <Text style={styles.newBadgeText}>✨ {t.new}</Text>
                  </Animated.View>
                )}

                {/* Image with Gradient Overlay */}
                <View style={styles.imageContainer}>
                  {item.image_url ? (
                    <>
                      <Image
                        source={{ uri: item.image_url }}
                        style={styles.image}
                        resizeMode="cover"
                      />
                      <View style={styles.imageGradient}>
                        <View style={styles.gradientOverlay} />
                      </View>
                    </>
                  ) : (
                    <View style={[styles.placeholderImage, { backgroundColor: config.color }]}>
                      <Text style={styles.placeholderIcon}>{config.icon}</Text>
                    </View>
                  )}

                  {/* Floating Category Badge */}
                  <View style={[styles.floatingBadge, { backgroundColor: config.color }]}>
                    <Text style={styles.badgeIcon}>{config.icon}</Text>
                    <Text style={styles.badgeText}>{t.category[item.category]}</Text>
                  </View>
                </View>

                {/* Content Section */}
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.title}
                  </Text>

                  {item.district && (
                    <View style={styles.districtContainer}>
                      <View style={styles.locationDot} />
                      <Text style={styles.districtText} numberOfLines={1}>
                        {item.district}
                      </Text>
                    </View>
                  )}

                  {/* Read More Indicator */}
                  <View style={styles.readMoreContainer}>
                    <View style={styles.readMoreLine} />
                    <Text style={styles.readMoreText}>තව කියවන්න</Text>
                    <View style={styles.readMoreArrowContainer}>
                      <Text style={styles.readMoreArrow}>→</Text>
                    </View>
                  </View>
                </View>

                {/* Bottom Accent Line */}
                <View style={[styles.accentLine, { backgroundColor: config.color }]} />
              </TouchableOpacity>

              {/* Admin Actions (Officer Only) */}
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
                    <Text style={styles.adminIcon}>✏️</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          );
        })}
      </Animated.ScrollView>

      {/* Scroll Indicators */}
      <View style={styles.indicatorContainer}>
        {news.map((_, index) => {
          const inputRange = [
            (index - 1) * (CARD_WIDTH + CARD_SPACING),
            index * (CARD_WIDTH + CARD_SPACING),
            (index + 1) * (CARD_WIDTH + CARD_SPACING),
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });

          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
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
            />
          );
        })}
      </View>
    </View>
  );
}

// =======================
// Modern Styles
// =======================
const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 32,
  },
  headerContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  glassHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.1)",
    elevation: 8,
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#dcfce7",
    justifyContent: "center",
    alignItems: "center",
  },
  headerIcon: {
    fontSize: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#14532d",
    letterSpacing: 0.3,
  },
  moreButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16a34a",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
    elevation: 4,
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  more: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  arrowCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  arrow: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginRight: CARD_SPACING,
  },
  card: {
    width: "100%",
    height: 380,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    overflow: "hidden",
  },
  newBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#fbbf24",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 20,
    elevation: 8,
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  newBadgeGlow: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: "#fbbf24",
    borderRadius: 22,
    opacity: 0.3,
  },
  newBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  imageContainer: {
    width: "100%",
    height: 200,
    backgroundColor: "#f3f4f6",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.9,
  },
  placeholderIcon: {
    fontSize: 64,
    opacity: 0.7,
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  gradientOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  floatingBadge: {
    position: "absolute",
    bottom: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  badgeIcon: {
    fontSize: 14,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  cardContent: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1f2937",
    lineHeight: 26,
    marginBottom: 12,
  },
  districtContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  locationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16a34a",
  },
  districtText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  readMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  readMoreLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#16a34a",
  },
  readMoreArrowContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#dcfce7",
    justifyContent: "center",
    alignItems: "center",
  },
  readMoreArrow: {
    fontSize: 14,
    color: "#16a34a",
    fontWeight: "700",
  },
  accentLine: {
    height: 4,
    width: "100%",
  },
  adminActions: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 30,
  },
  adminButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  adminIcon: {
    fontSize: 18,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 20,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#16a34a",
  },
});