import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
} from "react-native";
import axios from "axios";
import { API_BASE } from "../../services/api";
import { useNavigation } from "@react-navigation/native";
import { useLanguage } from "../../context/LanguageContext";
import { useApp } from "../../context/AppContext";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

// =======================
// Types
// =======================
interface NewsItem {
  id: string;
  title: string;
  category: "price" | "weather" | "policy" | "alert";
  image_url?: string;
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
    },
  },
};

export default function TopOfficialNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [pulseAnim] = useState(new Animated.Value(1));
  const navigation = useNavigation<any>();

  // 🌐 Language from context
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
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // =======================
  // Category color
  // =======================
  const categoryColor = (cat: string) => {
    switch (cat) {
      case "price":
        return "#059669"; // Emerald green
      case "weather":
        return "#0d9488"; // Teal
      case "policy":
        return "#16a34a"; // Green
      case "alert":
        return "#ea580c"; // Orange (for alerts)
      default:
        return "#10b981"; // Default green
    }
  };

  // =======================
  // Category icon
  // =======================
  const categoryIcon = (cat: string) => {
    switch (cat) {
      case "price":
        return "💰";
      case "weather":
        return "🌤️";
      case "policy":
        return "📋";
      case "alert":
        return "⚠️";
      default:
        return "📢";
    }
  };

  // =======================
  // UI
  // =======================
  if (news.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      {/* Header with corn decorations */}
      <View style={styles.headerContainer}>
        {/* Decorative corn pattern background */}
        <View style={styles.cornPattern}>
          <Text style={styles.cornEmoji}>🌽</Text>
          <Text style={styles.cornEmoji}>🌽</Text>
          <Text style={styles.cornEmoji}>🌽</Text>
        </View>

        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.cornIcon}>🌾</Text>
            <Text style={styles.title}>{t.title}</Text>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("OfficialNews")}
            style={styles.moreButton}
          >
            <Text style={styles.more}>{t.more}</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {news.map((item, index) => (
          <View key={item.id} style={{ position: "relative" }}>
            {/* ================= CARD ================= */}
            <TouchableOpacity
              style={[styles.card, index === 0 && styles.firstCard]}
              activeOpacity={0.85}
              onPress={() => navigation.navigate("NewsDetail", { id: item.id })}
            >
              {/* NEW badge */}
              {index === 0 && (
                <Animated.View
                  style={[
                    styles.newBadge,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                >
                  <Text style={styles.newBadgeText}>✨ {t.new}</Text>
                </Animated.View>
              )}

              {/* Image */}
              {item.image_url && (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: item.image_url }}
                    style={styles.image}
                  />
                </View>
              )}

              {/* Content */}
              <View style={styles.cardContent}>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: categoryColor(item.category) },
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {t.category[item.category]}
                  </Text>
                </View>

                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.title}
                </Text>
              </View>
            </TouchableOpacity>

            {/* ================= ADMIN ACTIONS (OFFICER ONLY) ================= */}
            {isOfficer && (
              <View style={styles.adminActions}>
                {/* ✏️ EDIT */}
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("AdminEditOfficialNews", {
                      newsId: item.id,
                    })
                  }
                >
                  <Text style={styles.editBtn}>✏️</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        {/* End spacing */}
        <View style={styles.endSpacer} />
      </ScrollView>

      {/* Bottom decorative line */}
      <View style={styles.bottomDecoration}>
        <View style={styles.bottomLine} />
        <View style={styles.bottomLine} />
      </View>
    </View>
  );
}

// =======================
// Styles
// =======================
const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 28,
  },
  headerContainer: {
    position: "relative",
    marginBottom: 16,
    overflow: "hidden",
  },
  cornPattern: {
    position: "absolute",
    top: 0,
    right: 0,
    flexDirection: "row",
    opacity: 0.1,
    gap: 8,
  },
  cornEmoji: {
    fontSize: 40,
    transform: [{ rotate: "15deg" }],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderLeftWidth: 5,
    borderLeftColor: "#16a34a",
    elevation: 2,
    shadowColor: "#166534",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cornIcon: {
    fontSize: 24,
  },
  title: {
    fontSize: 19,
    fontWeight: "800",
    color: "#14532d",
    letterSpacing: 0.3,
  },
  moreButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16a34a",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  more: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  arrow: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "700",
  },
  scrollContent: {
    paddingVertical: 4,
  },
  card: {
    width: 280,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    marginRight: 16,
    elevation: 6,
    shadowColor: "#166534",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    borderWidth: 2,
    borderColor: "#dcfce7",
    overflow: "hidden",
    position: "relative",
  },
  firstCard: {
    marginLeft: 2,
    borderColor: "#fbbf24",
    borderWidth: 2,
  },
  newBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#fbbf24",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
    elevation: 5,
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  newBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 150,
    backgroundColor: "#e5e7eb",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    paddingRight: 12,
    paddingBottom: 8,
  },

  imageCorngEmoji: {
    fontSize: 28,
    opacity: 0.7,
  },
  cardContent: {
    padding: 14,
  },
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginBottom: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  badgeIcon: {
    fontSize: 13,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#14532d",
    lineHeight: 22,
    marginBottom: 10,
  },
  readMore: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#16a34a",
  },
  readMoreArrow: {
    fontSize: 18,
    fontWeight: "700",
    color: "#16a34a",
  },
  cardAccent: {
    height: 5,
    backgroundColor: "#bbf7d0",
    position: "relative",
  },
  accentPattern: {
    height: "100%",
    width: "50%",
    backgroundColor: "#86efac",
  },
  endSpacer: {
    width: 4,
  },
  bottomDecoration: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  bottomLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#dcfce7",
    borderRadius: 1,
  },
  bottomCorn: {
    fontSize: 20,
  },
  adminActions: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    gap: 8,
    zIndex: 20,
  },
  editBtn: {
    fontSize: 16,
    backgroundColor: "#e0f2fe",
    padding: 6,
    borderRadius: 8,
  },
  hideBtn: {
    fontSize: 16,
    backgroundColor: "#fef3c7",
    padding: 6,
    borderRadius: 8,
  },
  deleteBtn: {
    fontSize: 16,
    backgroundColor: "#fee2e2",
    padding: 6,
    borderRadius: 8,
  },
});
