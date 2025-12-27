import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { API_BASE } from "../../services/api";
import { Ionicons } from "@expo/vector-icons";
import type { RootStackParamList } from "../../navigation";

const { width } = Dimensions.get('window');
const HEADER_MAX_HEIGHT = 300;
const HEADER_MIN_HEIGHT = 80;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

type RouteProps = RouteProp<RootStackParamList, "NewsDetail">;

interface NewsDetail {
  id: string;
  title: string;
  summary: string | null;
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
  source: string;
  district?: string | null;
  created_at: string;
  url?: string | null;
  image_url?: string | null;
}

export default function NewsDetailScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation();
  const newsId = route.params?.id;

  const [news, setNews] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!newsId) {
      setError("Invalid news id");
      setLoading(false);
      return;
    }

    const fetchNewsDetail = async () => {
      try {
        const res = await axios.get(`${API_BASE}/official-news/${newsId}`);
        setNews(res.data);
        // Fade in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      } catch (err) {
        setError("පුවත ලබා ගැනීමට නොහැකි විය");
      } finally {
        setLoading(false);
      }
    };

    fetchNewsDetail();
  }, [newsId]);

  const getCategoryConfig = (category: string) => {
    const configs = {
      price: { label: "මිල", color: "#059669", icon: "💰", bg: "#d1fae5" },
      weather: { label: "කාලගුණය", color: "#0d9488", icon: "🌤️", bg: "#ccfbf1" },
      policy: { label: "ප්‍රතිපත්ති", color: "#16a34a", icon: "📋", bg: "#dcfce7" },
      alert: { label: "අනතුරු ඇඟවීම", color: "#ea580c", icon: "⚠️", bg: "#ffedd5" },
      pest: { label: "පළිබෝධ", color: "#b45309", icon: "🐛", bg: "#fed7aa" },
      disease: { label: "රෝග", color: "#991b1b", icon: "🦠", bg: "#fecaca" },
      fertilizer: { label: "පොහොර", color: "#15803d", icon: "🌱", bg: "#dcfce7" },
      cultivation: { label: "වගා උපදෙස්", color: "#0f766e", icon: "🌾", bg: "#ccfbf1" },
      program: { label: "වැඩසටහන්", color: "#1d4ed8", icon: "📅", bg: "#dbeafe" },
    };
    return  { label: category, color: "#10b981", icon: "📢", bg: "#d1fae5" };
  };

  // Parallax header animations
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const imageTranslate = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  const titleTranslate = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -20],
    extrapolate: 'clamp',
  });

  const headerBackgroundOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  /* ================= STATES ================= */
  if (loading) {
    return (
      <View style={styles.center}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCircle}>
            <ActivityIndicator size="large" color="#16a34a" />
          </View>
          <Text style={styles.loadingText}>පුවත පූරණය වෙමින්...</Text>
          <View style={styles.loadingDots}>
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotDelay1]} />
            <View style={[styles.dot, styles.dotDelay2]} />
          </View>
        </View>
      </View>
    );
  }

  if (error || !news) {
    return (
      <View style={styles.center}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="alert-circle-outline" size={64} color="#dc2626" />
          </View>
          <Text style={styles.errorTitle}>අපොයි!</Text>
          <Text style={styles.errorText}>{error || "පුවත හමු නොවීය"}</Text>
          <Pressable 
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="#ffffff" />
            <Text style={styles.retryText}>ආපසු යන්න</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const categoryConfig = getCategoryConfig(news.category);

  /* ================= UI ================= */
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Animated Header with Parallax Image */}
      <Animated.View 
        style={[
          styles.header,
          { height: headerHeight }
        ]}
      >
        {/* Header Image Background */}
        {news.image_url && (
          <Animated.View
            style={[
              styles.headerImageContainer,
              {
                opacity: imageOpacity,
                transform: [{ translateY: imageTranslate }],
              },
            ]}
          >
            <Image 
              source={{ uri: news.image_url }} 
              style={styles.headerImage}
              resizeMode="cover"
            />
            <View style={styles.headerGradient} />
          </Animated.View>
        )}

        {/* Solid Background for collapsed state */}
        <Animated.View 
          style={[
            styles.headerSolidBackground,
            { opacity: headerBackgroundOpacity }
          ]}
        />

        {/* Header Content */}
        <View style={styles.headerContent}>
          {/* Back Button */}
          <Pressable 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </Pressable>

          {/* Title in header (visible when collapsed) */}
          <Animated.View
            style={[
              styles.headerTitleContainer,
              { opacity: headerBackgroundOpacity }
            ]}
          >
            <Text style={styles.headerTitle} numberOfLines={1}>
              {news.title}
            </Text>
          </Animated.View>
        </View>
      </Animated.View>

      {/* Main Content */}
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* Spacer for header */}
        <View style={{ height: news.image_url ? HEADER_MAX_HEIGHT - 100 : 20 }} />

        {/* Content Card with Fade In */}
        <Animated.View 
          style={[
            styles.contentCard,
            { opacity: fadeAnim }
          ]}
        >
          {/* Floating Category Badge */}
          <View style={[styles.categoryBadge, { backgroundColor: categoryConfig.bg }]}>
            <Text style={styles.categoryIcon}>{categoryConfig.icon}</Text>
            <Text style={[styles.categoryText, { color: categoryConfig.color }]}>
              {categoryConfig.label}
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{news.title}</Text>

          {/* Meta Information Grid */}
          <View style={styles.metaGrid}>
            <View style={styles.metaCard}>
              <View style={[styles.metaIconContainer, { backgroundColor: '#dbeafe' }]}>
                <Ionicons name="calendar-outline" size={18} color="#2563eb" />
              </View>
              <View style={styles.metaContent}>
                <Text style={styles.metaLabel}>දිනය</Text>
                <Text style={styles.metaValue}>
                  {new Date(news.created_at).toLocaleDateString("si-LK", {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.metaCard}>
              <View style={[styles.metaIconContainer, { backgroundColor: '#fef3c7' }]}>
                <Ionicons name="newspaper-outline" size={18} color="#f59e0b" />
              </View>
              <View style={styles.metaContent}>
                <Text style={styles.metaLabel}>මූලාශ්‍රය</Text>
                <Text style={styles.metaValue} numberOfLines={1}>{news.source}</Text>
              </View>
            </View>

            {news.district && (
              <View style={[styles.metaCard, styles.metaCardFull]}>
                <View style={[styles.metaIconContainer, { backgroundColor: '#dcfce7' }]}>
                  <Ionicons name="location" size={18} color="#16a34a" />
                </View>
                <View style={styles.metaContent}>
                  <Text style={styles.metaLabel}>දිස්ත්‍රික්කය</Text>
                  <Text style={[styles.metaValue, { color: '#16a34a', fontWeight: '700' }]}>
                    {news.district}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerDot} />
            <View style={styles.dividerLine} />
          </View>

          {/* Summary/Content */}
          {news.summary && (
            <View style={styles.summaryContainer}>
              <View style={styles.summaryHeader}>
                <View style={styles.summaryIconContainer}>
                  <Ionicons name="document-text" size={20} color="#16a34a" />
                </View>
                <Text style={styles.summaryTitle}>සවිස්තර විස්තරය</Text>
              </View>
              <Text style={styles.summary}>{news.summary}</Text>
            </View>
          )}

          {/* External Link Button */}
          {news.url && (
            <Pressable 
              style={styles.linkButton}
              onPress={() => {/* Handle link opening */}}
            >
              <View style={styles.linkIconContainer}>
                <Ionicons name="link" size={20} color="#ffffff" />
              </View>
              <Text style={styles.linkText}>සම්පූර්ණ පුවත කියවන්න</Text>
              <Ionicons name="arrow-forward" size={20} color="#ffffff" />
            </Pressable>
          )}

          {/* Bottom Decoration */}
          <View style={styles.bottomDecoration}>
            <Text style={styles.decorationEmoji}>🌾</Text>
            <View style={styles.decorationLine} />
            <Text style={styles.decorationEmoji}>🌾</Text>
          </View>
        </Animated.View>

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </Animated.ScrollView>
    </View>
  );
}

/* ================= MODERN STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  /* ================= HEADER STYLES ================= */
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
  },
  headerImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  headerSolidBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#16a34a',
  },
  headerContent: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },

  /* ================= SCROLL CONTENT ================= */
  scrollContent: {
    paddingHorizontal: 20,
  },

  /* ================= CONTENT CARD ================= */
  contentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 32,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },

  /* ================= CATEGORY BADGE ================= */
  categoryBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  /* ================= TITLE ================= */
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1f2937',
    lineHeight: 38,
    marginBottom: 24,
    letterSpacing: 0.2,
  },

  /* ================= META GRID ================= */
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metaCard: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f9fafb',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  metaCardFull: {
    flex: 1,
    minWidth: '100%',
  },
  metaIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaContent: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },

  /* ================= DIVIDER ================= */
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16a34a',
  },

  /* ================= SUMMARY ================= */
  summaryContainer: {
    marginBottom: 24,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  summaryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#16a34a',
  },
  summary: {
    fontSize: 16,
    lineHeight: 28,
    color: '#4b5563',
    letterSpacing: 0.2,
  },

  /* ================= LINK BUTTON ================= */
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
    elevation: 6,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 24,
  },
  linkIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },

  /* ================= BOTTOM DECORATION ================= */
  bottomDecoration: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingTop: 12,
  },
  decorationEmoji: {
    fontSize: 20,
    opacity: 0.4,
  },
  decorationLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#f3f4f6',
    borderRadius: 1,
  },

  /* ================= LOADING STATE ================= */
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 24,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 16,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16a34a',
  },
  dotDelay1: {
    opacity: 0.6,
  },
  dotDelay2: {
    opacity: 0.3,
  },

  /* ================= ERROR STATE ================= */
  errorContainer: {
    alignItems: 'center',
    maxWidth: 320,
  },
  errorIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#dc2626',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  retryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
});