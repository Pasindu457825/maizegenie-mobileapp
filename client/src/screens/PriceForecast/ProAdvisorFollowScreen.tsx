import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
  Image,
  TextInput,
  Animated,
  Dimensions,
} from "react-native";
import axios from "axios";
import {
  ArrowLeft,
  Plus,
  ChevronDown,
  Pencil,
  Search,
  X,
  BookOpen,
  Sparkles,
  TrendingUp,
  Bell,
} from "lucide-react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useLanguage } from "../../context/LanguageContext";
import { API_BASE } from "../../services/api";
import { useApp } from "../../context/AppContext";

// On Android emulator localhost is unreachable — remap to 10.0.2.2.
// On a physical device, set EXPO_PUBLIC_API_BASE to your LAN IP instead.
const EFFECTIVE_API_BASE =
  Platform.OS === "android"
    ? API_BASE.replace(/http:\/\/localhost/i, "http://10.0.2.2")
    : API_BASE;
import { useNotifications } from "../../context/NotificationContext";

const { width } = Dimensions.get("window");

/* ---------- Android animation enable ---------- */
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/* ---------- Types ---------- */
type AdvisorBlock = {
  subtitle: string;
  content: string;
  image_url?: string;
};

type ProAdvisorItem = {
  id: string;
  title: string;
  blocks: AdvisorBlock[];
  language: "si" | "en";
};

/* ---------- Animated Card Component ---------- */
const AnimatedCard = ({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay: index * 80,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      {children}
    </Animated.View>
  );
};

/* ---------- Screen ---------- */
export default function ProAdvisorListScreen() {
  const navigation = useNavigation() as any;
  const { language: globalLang } = useLanguage();
  const language: "si" | "en" | "ta" =
    globalLang === "sinhala" ? "si" : globalLang === "tamil" ? "ta" : "en";

  const [data, setData] = useState<ProAdvisorItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useApp();
  const { unreadCount } = useNotifications();

  const isOfficer = user?.role === "officer";

  /* ---------- UI states ---------- */
  const [query, setQuery] = useState("");
  const [activeChip, setActiveChip] = useState<"all" | "recent" | "popular">(
    "all",
  );
  const [viewMode, setViewMode] = useState<"list" | "compact">("list");

  /* ---------- Animations ---------- */
  const headerAnim = useRef(new Animated.Value(0)).current;
  const searchFocusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(headerAnim, {
      toValue: 1,
      tension: 40,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  /* ---------- Skip useFocusEffect on very first focus (useEffect handles it) ---------- */
  const isFirstFocus = useRef(true);

  /* ---------- Fetch ---------- */
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiLang = language === "ta" ? "en" : language;
      console.log(
        "📡 Fetching pro-advisor from:",
        `${EFFECTIVE_API_BASE}/pro-advisor?language=${apiLang}`,
        "| platform:",
        Platform.OS,
      );
      const res = await axios.get(
        `${EFFECTIVE_API_BASE}/pro-advisor?language=${apiLang}`,
        { timeout: 10000 },
      );
      console.log("✅ Fetched items:", res.data?.length ?? 0);
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      const msg =
        e?.code === "ECONNABORTED"
          ? "Request timed out. Check your network."
          : (e?.message ?? "Network error");
      console.log("❌ Fetch error", msg, e);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch + re-fetch when language changes
  useEffect(() => {
    fetchData();
  }, [language]);

  /* ---------- Refresh on focus – skip first focus to avoid double-fetch on mount ---------- */
  useFocusEffect(
    React.useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return; // useEffect already handles the initial load
      }
      fetchData();
    }, [language]),
  );

  /* ---------- Expand ---------- */
  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  };

  /* ---------- Derived list ---------- */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = [...data];

    if (activeChip === "recent") {
      list = [...list];
    } else if (activeChip === "popular") {
      list = [...list].sort(
        (a, b) => (b.blocks?.length || 0) - (a.blocks?.length || 0),
      );
    }

    if (!q) return list;

    return list.filter((item) => {
      const inTitle = item.title?.toLowerCase().includes(q);
      const inBlocks =
        item.blocks?.some(
          (b) =>
            b.subtitle?.toLowerCase().includes(q) ||
            b.content?.toLowerCase().includes(q),
        ) || false;
      return inTitle || inBlocks;
    });
  }, [data, query, activeChip]);

  /* ---------- Stats ---------- */
  const totalGuidance = data.length;
  const totalSections = data.reduce(
    (sum, item) => sum + (item.blocks?.length || 0),
    0,
  );

  const chips = [
    {
      key: "all" as const,
      si: "සියල්ල",
      en: "All",
      ta: "அனைத்தும்",
      icon: BookOpen,
    },
    {
      key: "recent" as const,
      si: "අලුත්",
      en: "Recent",
      ta: "புதியது",
      icon: Sparkles,
    },
    {
      key: "popular" as const,
      si: "ප්‍රසිද්ධ",
      en: "Popular",
      ta: "பிரபலமான",
      icon: TrendingUp,
    },
  ];

  const pageTitle =
    language === "si"
      ? "Pro Advisor උපදෙස්"
      : language === "ta"
        ? "Pro Advisor வழிகாட்டுதல்"
        : "Pro Advisor Guidance";
  const pageSub =
    language === "si"
      ? "විශේෂඥ උපදෙස් කියවලා ක්‍රියාවට නංවන්න"
      : language === "ta"
        ? "நிபுணர் வழிகாட்டுதல்களை படித்து நம்பிக்கையுடன் செயல்படுங்கள்"
        : "Read expert guidance and act with confidence";

  const emptyTitle =
    language === "si"
      ? "උපදෙස් හමු නොවීය"
      : language === "ta"
        ? "வழிகாட்டுதல் எதுவும் கிடைக்கவில்லை"
        : "No guidance found";
  const emptySub =
    language === "si"
      ? "වෙනස් වචනක් search කරලා බලන්න"
      : language === "ta"
        ? "வேறொரு முக்கியச் சொல்லுடன் தேடுங்கள்"
        : "Try searching with a different keyword";

  /* ---------- UI ---------- */
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <Animated.View
        style={[
          styles.headerWrap,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconBtn}
          >
            <ArrowLeft size={22} color="#064E3B" />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{pageTitle}</Text>
            <Text style={styles.headerSubtitle}>{pageSub}</Text>
          </View>

          {isOfficer ? (
            <TouchableOpacity
              onPress={() => navigation.navigate("ProAdvisorAdminAdd")}
              activeOpacity={0.85}
              style={[styles.iconBtn, styles.addBtn]}
            >
              <Plus size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 42 }} />
          )}

          {/* ✅ Notification Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Notifications")}
            style={styles.notifBtn}
            activeOpacity={0.85}
          >
            <Bell size={20} color="#10B981" />
            {unreadCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalGuidance}</Text>
            <Text style={styles.statLabel}>
              {language === "si"
                ? "උපදෙස්"
                : language === "ta"
                  ? "வழிகாட்டல்"
                  : "Guidance"}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalSections}</Text>
            <Text style={styles.statLabel}>
              {language === "si"
                ? "කොටස්"
                : language === "ta"
                  ? "பகுதிகள்"
                  : "Sections"}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{filtered.length}</Text>
            <Text style={styles.statLabel}>
              {language === "si"
                ? "ප්‍රතිඵල"
                : language === "ta"
                  ? "முடிவுகள்"
                  : "Results"}
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <Animated.View style={styles.searchBar}>
          <Search size={18} color="#065F46" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={
              language === "si"
                ? "Search උපදෙස්..."
                : language === "ta"
                  ? "வழிகாட்டல் தேடுக..."
                  : "Search guidance..."
            }
            placeholderTextColor="#6B7280"
            style={styles.searchInput}
            returnKeyType="search"
            onFocus={() => {
              Animated.spring(searchFocusAnim, {
                toValue: 1,
                useNativeDriver: true,
              }).start();
            }}
            onBlur={() => {
              Animated.spring(searchFocusAnim, {
                toValue: 0,
                useNativeDriver: true,
              }).start();
            }}
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => setQuery("")}
              style={styles.clearBtn}
            >
              <X size={18} color="#065F46" />
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {chips.map((c) => {
            const active = c.key === activeChip;
            const Icon = c.icon;
            return (
              <TouchableOpacity
                key={c.key}
                activeOpacity={0.9}
                onPress={() => {
                  LayoutAnimation.configureNext(
                    LayoutAnimation.Presets.easeInEaseOut,
                  );
                  setActiveChip(c.key);
                }}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Icon size={14} color={active ? "#FFFFFF" : "#065F46"} />
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {language === "si" ? c.si : language === "ta" ? c.ta : c.en}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>

      {/* CONTENT */}
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>
            {language === "si"
              ? "දත්ත load වෙමින්..."
              : language === "ta"
                ? "தரவு ஏற்றப்படுகிறது..."
                : "Loading guidance..."}
          </Text>
        </View>
      ) : error ? (
        <View style={styles.loader}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>
            {language === "si"
              ? "සම්බන්ධතා දෝෂයකි"
              : language === "ta"
                ? "இணைப்பு பிழை"
                : "Connection Error"}
          </Text>
          <Text style={styles.errorMsg}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={fetchData}
            activeOpacity={0.85}
          >
            <Text style={styles.retryBtnText}>
              {language === "si"
                ? "නැවත උත්සාහ කරන්න"
                : language === "ta"
                  ? "மீண்டும் முயற்சி"
                  : "Retry"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Info Banner */}
          <View style={styles.banner}>
            <View style={styles.bannerGlow} />
            <View style={styles.bannerDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>
                {language === "si"
                  ? "ඉක්මන් උපදෙස්"
                  : language === "ta"
                    ? "விரைவு குறிப்பு"
                    : "Quick Tip"}
              </Text>
              <Text style={styles.bannerText}>
                {language === "si"
                  ? "Card එක click කරලා විස්තර open කරගන්න. අවශ්‍ය නම් search භාවිතා කරන්න."
                  : language === "ta"
                    ? "விவரங்களை விரிக்க அட்டையைத் தட்டவும். தேவையானதை வேகமாகக் கண்டறிய தேடலைப் பயன்படுத்தவும்."
                    : "Tap a card to expand details. Use search to find what you need faster."}
              </Text>
            </View>
          </View>

          {/* Empty State */}
          {filtered.length === 0 ? (
            <Animated.View
              style={[
                styles.emptyWrap,
                {
                  opacity: headerAnim,
                  transform: [{ scale: headerAnim }],
                },
              ]}
            >
              <View style={styles.emptyIconCircle}>
                <Search size={22} color="#065F46" />
              </View>
              <Text style={styles.emptyTitle}>{emptyTitle}</Text>
              <Text style={styles.emptySub}>{emptySub}</Text>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  setQuery("");
                  setActiveChip("all");
                }}
                style={styles.resetBtn}
              >
                <Text style={styles.resetBtnText}>
                  {language === "si" ? "Reset කරන්න" : "Reset"}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            filtered.map((item, index) => {
              const isOpen = expandedId === item.id;

              return (
                <AnimatedCard key={item.id} index={index}>
                  <View style={styles.cardWrapper}>
                    {/* TITLE CARD */}
                    <TouchableOpacity
                      style={[styles.card, isOpen && styles.cardOpen]}
                      activeOpacity={0.88}
                      onPress={() => toggleExpand(item.id)}
                    >
                      <View style={styles.cardLeftAccent} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{item.title}</Text>

                        <View style={styles.cardMetaRow}>
                          <View style={styles.cardMetaBadge}>
                            <Text style={styles.cardMeta}>
                              {language === "si"
                                ? `${item.blocks?.length || 0} කොටස්`
                                : language === "ta"
                                  ? `${item.blocks?.length || 0} பகுதிகள்`
                                  : `${item.blocks?.length || 0} sections`}
                            </Text>
                          </View>
                          {isOpen && (
                            <View style={styles.openIndicator}>
                              <Text style={styles.openIndicatorText}>
                                {language === "si"
                                  ? "විවෘත"
                                  : language === "ta"
                                    ? "திறந்தது"
                                    : "Open"}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>

                      <View
                        style={[
                          styles.chevCircle,
                          isOpen && styles.chevCircleOpen,
                        ]}
                      >
                        <Animated.View
                          style={{
                            transform: [{ rotate: isOpen ? "180deg" : "0deg" }],
                          }}
                        >
                          <ChevronDown
                            size={18}
                            color={isOpen ? "#FFFFFF" : "#065F46"}
                          />
                        </Animated.View>
                      </View>
                    </TouchableOpacity>

                    {/* OFFICER ACTIONS */}
                    {isOfficer && isOpen && (
                      <View style={styles.actionRow}>
                        <TouchableOpacity
                          style={styles.editBtn}
                          onPress={() =>
                            navigation.navigate("ProAdvisorAdminEdit", {
                              advisorId: item.id,
                            })
                          }
                          activeOpacity={0.9}
                        >
                          <Pencil size={16} color="#065F46" />
                          <Text style={styles.actionText}>Edit</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* EXPANDED CONTENT */}
                    {isOpen &&
                      item.blocks.map((block, idx) => (
                        <View key={idx} style={styles.blockCard}>
                          <View style={styles.blockHeader}>
                            <View style={styles.blockBadge}>
                              <View style={styles.blockBadgeDot} />
                              <Text style={styles.blockBadgeText}>
                                {language === "si"
                                  ? `කොටස ${idx + 1}`
                                  : language === "ta"
                                    ? `பகுதி ${idx + 1}`
                                    : `Part ${idx + 1}`}
                              </Text>
                            </View>
                            <Text style={styles.subTitle}>
                              {block.subtitle}
                            </Text>
                          </View>

                          <Text style={styles.contentText}>
                            {block.content}
                          </Text>

                          {block.image_url && (
                            <View style={styles.imageWrap}>
                              <Image
                                source={{ uri: block.image_url }}
                                style={styles.image}
                              />
                              <View style={styles.imageOverlay} />
                            </View>
                          )}
                        </View>
                      ))}
                  </View>
                </AnimatedCard>
              );
            })
          )}

          <View style={{ height: 44 }} />
        </ScrollView>
      )}
    </View>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FDF4" },

  headerWrap: {
    paddingTop: 40,
    paddingBottom: 14,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#064E3B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 2,
    paddingTop: 6,
  },

  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  addBtn: {
    backgroundColor: "#047857",
    borderColor: "#047857",
  },

  // ✅ NEW — Notification Button
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  // ✅ NEW — Notification Badge
  notifBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#EF4444",
    borderRadius: 999,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  notifBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#064E3B",
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 12.5,
    color: "#6B7280",
    fontWeight: "600",
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    marginBottom: 2,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#D1FAE5",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
  },

  statNumber: {
    fontSize: 20,
    fontWeight: "900",
    color: "#047857",
  },

  statLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
    marginTop: 2,
  },

  searchBar: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F0FDF4",
    borderWidth: 2,
    borderColor: "#D1FAE5",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#064E3B",
    fontWeight: "700",
  },

  clearBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    alignItems: "center",
    justifyContent: "center",
  },

  chipsRow: {
    paddingTop: 12,
    gap: 10,
    paddingHorizontal: 2,
  },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D1FAE5",
    backgroundColor: "#F0FDF4",
  },

  chipActive: {
    backgroundColor: "#047857",
    borderColor: "#047857",
    shadowColor: "#047857",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  chipText: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#065F46",
  },

  chipTextActive: {
    color: "#FFFFFF",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    padding: 24,
  },
  loadingText: { fontSize: 13, fontWeight: "700", color: "#6B7280" },

  errorIcon: { fontSize: 36 },
  errorTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#064E3B",
    textAlign: "center",
  },
  errorMsg: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
  },
  retryBtn: {
    marginTop: 8,
    backgroundColor: "#047857",
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 14,
    shadowColor: "#047857",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  retryBtnText: { color: "#FFFFFF", fontWeight: "900", fontSize: 14 },

  content: { padding: 16 },

  banner: {
    position: "relative",
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    padding: 12,
    borderRadius: 16,
    marginBottom: 14,
    overflow: "hidden",
  },

  bannerGlow: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#10B981",
    opacity: 0.1,
  },

  bannerDot: {
    width: 10,
    height: 10,
    borderRadius: 99,
    backgroundColor: "#10B981",
    marginTop: 4,
  },

  bannerTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#064E3B",
  },

  bannerText: {
    marginTop: 2,
    fontSize: 12.5,
    color: "#065F46",
    lineHeight: 18,
    fontWeight: "600",
  },

  emptyWrap: {
    marginTop: 36,
    alignItems: "center",
    paddingHorizontal: 20,
  },

  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#064E3B",
    textAlign: "center",
  },

  emptySub: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
  },

  resetBtn: {
    marginTop: 14,
    backgroundColor: "#047857",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    shadowColor: "#047857",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },

  resetBtnText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 13,
  },

  cardWrapper: { marginBottom: 14 },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D1FAE5",
    gap: 12,
    shadowColor: "#064E3B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  cardOpen: {
    borderColor: "#10B981",
    backgroundColor: "#F7FFFB",
    borderWidth: 2,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },

  cardLeftAccent: {
    width: 10,
    alignSelf: "stretch", // ✅ replaces height:"100%" which breaks on Android
    borderRadius: 10,
    backgroundColor: "#10B981",
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#064E3B",
  },

  cardMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },

  cardMetaBadge: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },

  cardMeta: {
    fontSize: 11,
    color: "#065F46",
    fontWeight: "800",
  },

  openIndicator: {
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },

  openIndicatorText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  chevCircle: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    alignItems: "center",
    justifyContent: "center",
  },

  chevCircleOpen: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 10,
  },

  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#6EE7B7",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  actionText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#065F46",
  },

  blockCard: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },

  blockHeader: {
    marginBottom: 8,
  },

  blockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 8,
  },

  blockBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },

  blockBadgeText: {
    fontSize: 11.5,
    fontWeight: "900",
    color: "#065F46",
  },

  subTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#047857",
  },

  contentText: {
    fontSize: 13.5,
    color: "#374151",
    lineHeight: 22,
    fontWeight: "600",
  },

  imageWrap: {
    marginTop: 10,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    position: "relative",
  },

  image: {
    width: "100%",
    height: 190,
  },

  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#10B981",
    opacity: 0.05,
  },
});
