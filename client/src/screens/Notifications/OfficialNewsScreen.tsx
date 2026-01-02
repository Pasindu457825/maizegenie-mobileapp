import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import axios from "axios";
import { API_BASE } from "../../services/api";
import { Ionicons } from "@expo/vector-icons";
import type { RootStackParamList } from "../../navigation";
import { Image } from "react-native";
import { useApp } from "../../context/AppContext";
import { supabase } from "../../lib/supabase";
import { SafeAreaView, Platform, StatusBar } from "react-native";


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

// =======================
// Types
// =======================
interface OfficialNews {
  id: string;
  title: string;
  summary: string;
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
  district?: string;
  language: string;
  url?: string;
  image_url?: string;
  created_at: string;
  is_active: boolean;
  is_visible_to_farmers: boolean;
}

// =======================
// Navigation Type
// =======================
type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "OfficialNews"
>;

type CategoryKey = OfficialNews["category"] | "all";

export default function OfficialNewsScreen() {
  const [news, setNews] = useState<OfficialNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔎 Search + Filter
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("all");

  const { user } = useApp();

  // Role-based authentication using Supabase user data
  const isFarmer = user?.role === "farmer";
  const isOfficer = user?.role === "officer";

  // ✅ FIXED navigation typing
  const navigation = useNavigation<NavigationProp>();

  // 🔹 Normal fetch
  useEffect(() => {
    fetchNews();
  }, []);

  // 🔹 Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("official-news-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "official_news",
        },
        () => {
          fetchNews();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // =======================
  // Fetch News
  // =======================
  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);

      const endpoint = isOfficer
        ? `${API_BASE}/official-news/admin/all`
        : `${API_BASE}/official-news`;

      const res = await axios.get(endpoint);

      const data = res.data.filter((n: OfficialNews) => {
        // ❌ Deleted news → never show to anyone (farmer & officer)
        if (!n.is_active) return false;

        // 👨‍🌾 Farmer: only visible news
        if (isFarmer) {
          return n.is_visible_to_farmers === true;
        }

        // 👮 Officer: see all active (even hidden)
        return true;
      });

      setNews(data || []);
    } catch (err) {
      console.log("❌ FETCH NEWS ERROR:", err);
      setError("පුවත් ලබාගැනීමට නොහැකි විය");
    } finally {
      setLoading(false);
    }
  };

  // =======================
  // Helpers
  // =======================
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "price":
        return "#2563eb"; // Blue
      case "weather":
        return "#0891b2"; // Cyan
      case "policy":
        return "#7c3aed"; // Purple
      case "alert":
        return "#dc2626"; // Red
      case "pest":
        return "#b45309"; // Brown
      case "disease":
        return "#991b1b"; // Dark red
      case "fertilizer":
        return "#15803d"; // Deep green
      case "cultivation":
        return "#0f766e"; // Teal
      case "program":
        return "#1d4ed8"; // Indigo
      default:
        return "#6b7280"; // Gray
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "price":
        return "මිල";
      case "weather":
        return "කාලගුණය";
      case "policy":
        return "ප්‍රතිපත්ති";
      case "alert":
        return "අනතුරු ඇඟවීම";
      case "pest":
        return "පළිබෝධ";
      case "disease":
        return "රෝග";
      case "fertilizer":
        return "පොහොර";
      case "cultivation":
        return "වගා උපදෙස්";
      case "program":
        return "වැඩසටහන්";
      case "all":
        return "සියල්ල";
      default:
        return category;
    }
  };

  // =======================
  // 🔎 Filtered list (UI only)
  // =======================
  const filteredNews = useMemo(() => {
    const q = searchText.trim().toLowerCase();

    return news.filter((n) => {
      const matchCategory =
        selectedCategory === "all" ? true : n.category === selectedCategory;

      if (!matchCategory) return false;

      if (!q) return true;

      const haystack = `${n.title || ""} ${n.summary || ""} ${n.source || ""} ${
        n.district || ""
      }`.toLowerCase();

      return haystack.includes(q);
    });
  }, [news, searchText, selectedCategory]);

  // =======================
  // Navigation
  // =======================
  const handleNewsPress = (item: OfficialNews) => {
    navigation.navigate("NewsDetail", {
      id: item.id,
    });
  };

  // =======================
  // Loading State
  // =======================
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={styles.loadingText}>පුවත් පූරණය වෙමින්...</Text>
      </View>
    );
  }

  // =======================
  // Error State
  // =======================
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#dc2626" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchNews}>
          <Text style={styles.retryButtonText}>නැවත උත්සාහ කරන්න</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const categories: CategoryKey[] = [
    "all",
    "price",
    "weather",
    "policy",
    "alert",
    "pest",
    "disease",
    "fertilizer",
    "cultivation",
    "program",
  ];

  // =======================
  // UI
  // =======================
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          {/* LEFT */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>

          {/* CENTER */}
          <Text style={styles.headerTitle}>නිල පුවත්</Text>

          {/* RIGHT */}
          {isOfficer ? (
            <TouchableOpacity
              onPress={() => navigation.navigate("AdminAddOfficialNews")}
              style={styles.addNewsButton}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text style={styles.addNewsText}>Add News</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>
      </SafeAreaView>

      {/* 🔎 SEARCH + FILTER BAR */}
      <View style={styles.toolsWrap}>
        <Text style={styles.toolsTitle}>සෙවීම & පෙරහන්</Text>

        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#6b7280" />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Title / Summary / District / Source සෙවන්න..."
            placeholderTextColor="#9ca3af"
            style={styles.searchInput}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="while-editing"
          />

          {!!searchText && (
            <TouchableOpacity
              onPress={() => setSearchText("")}
              style={styles.clearBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {categories.map((c) => {
            const active = selectedCategory === c;
            const color = c === "all" ? "#16A34A" : getCategoryColor(c);

            return (
              <TouchableOpacity
                key={c}
                onPress={() => setSelectedCategory(c)}
                activeOpacity={0.85}
                style={[
                  styles.chip,
                  active
                    ? { backgroundColor: color, borderColor: color }
                    : { backgroundColor: "#ffffff", borderColor: "#e5e7eb" },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    active ? { color: "#ffffff" } : { color: "#374151" },
                  ]}
                >
                  {getCategoryLabel(c)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Small info row */}
        <View style={styles.resultRow}>
          <Text style={styles.resultText}>
            ප්‍රතිඵල:{" "}
            <Text style={{ fontWeight: "800" }}>{filteredNews.length}</Text>
          </Text>

          <TouchableOpacity
            onPress={() => {
              setSearchText("");
              setSelectedCategory("all");
            }}
            style={styles.resetBtn}
            activeOpacity={0.85}
          >
            <Ionicons name="refresh-outline" size={16} color="#16A34A" />
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredNews}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={fetchNews}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="newspaper-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>
              {searchText || selectedCategory !== "all"
                ? "ඔබගේ සෙවීම/පෙරහන් අනුව පුවත් නොමැත"
                : "නිල පුවත් නොමැත"}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.newsCard}
            activeOpacity={0.7}
            onPress={() => handleNewsPress(item)}
          >
            {/* HEADER */}
            <View style={styles.newsHeader}>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: getCategoryColor(item.category) },
                ]}
              >
                <Text style={styles.categoryText}>
                  {getCategoryLabel(item.category)}
                </Text>
              </View>

              <Text style={styles.dateText}>
                {new Date(item.created_at).toLocaleDateString("si-LK")}
              </Text>
            </View>

            {/* TITLE */}
            <Text style={styles.newsTitle}>{item.title}</Text>

            {/* 🖼️ NEWS IMAGE */}
            {item.image_url && (
              <View style={{ position: "relative" }}>
                <Image
                  source={{ uri: item.image_url }}
                  style={{
                    width: "100%",
                    height: 180,
                    borderRadius: 10,
                    marginBottom: 12,
                    opacity: !item.is_visible_to_farmers && isOfficer ? 0.4 : 1,
                  }}
                  resizeMode="cover"
                />

                {/* 👮 Officer-only hidden badge */}
                {!item.is_visible_to_farmers && isOfficer && (
                  <View
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      backgroundColor: "#000000aa",
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 12 }}>
                      Farmersට Hidden
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* SUMMARY */}
            {item.summary && (
              <Text style={styles.newsSummary} numberOfLines={2}>
                {item.summary}
              </Text>
            )}

            {/* FOOTER */}
            <View style={styles.newsFooter}>
              <View style={styles.sourceContainer}>
                <Ionicons name="newspaper-outline" size={14} color="#6b7280" />
                <Text style={styles.sourceText}>{item.source}</Text>
              </View>

              {item.district && (
                <View style={styles.districtContainer}>
                  <Ionicons name="location-outline" size={14} color="#6b7280" />
                  <Text style={styles.districtText}>{item.district}</Text>
                </View>
              )}
            </View>

            <View style={styles.actionRow}>
              {/* READ MORE – BIG TAP AREA */}
              <TouchableOpacity
                style={styles.readMoreButton}
                onPress={() => handleNewsPress(item)}
                activeOpacity={0.8}
              >
                <Text style={styles.readMoreText}>තව කියවන්න</Text>
                <Ionicons name="chevron-forward" size={16} color="#16A34A" />
              </TouchableOpacity>

              {/* EDIT – OFFICER ONLY */}
              {isOfficer && (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() =>
                    navigation.navigate("AdminEditOfficialNews", {
                      newsId: item.id,
                    })
                  }
                  activeOpacity={0.8}
                >
                  <Ionicons name="create-outline" size={18} color="#16A34A" />
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// =======================
// Styles
// =======================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: { padding: 8 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },

  // 🔎 tools
  toolsWrap: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  toolsTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#374151",
    marginBottom: 8,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    paddingVertical: 0,
  },
  clearBtn: {
    paddingLeft: 4,
    paddingVertical: 2,
  },
  chipRow: {
    paddingTop: 10,
    paddingBottom: 2,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "800",
  },
  resultRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resultText: { fontSize: 12, color: "#6b7280" },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  resetText: { fontSize: 12, fontWeight: "800", color: "#16A34A" },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: { marginTop: 12, fontSize: 16, color: "#6b7280" },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#dc2626",
    textAlign: "center",
  },

  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#22c55e",
    borderRadius: 8,
  },
  retryButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "600" },

  listContent: { padding: 16 },

  newsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },

  newsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: { color: "#ffffff", fontSize: 12, fontWeight: "600" },

  dateText: { fontSize: 12, color: "#9ca3af" },

  newsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  newsSummary: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
    marginBottom: 12,
  },

  newsFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sourceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  sourceText: { fontSize: 12, color: "#6b7280", marginLeft: 4 },

  districtContainer: { flexDirection: "row", alignItems: "center" },
  districtText: { fontSize: 12, color: "#6b7280", marginLeft: 4 },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#9ca3af",
    textAlign: "center",
  },

  addNewsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16A34A",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },

  addNewsText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },

  readMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    gap: 4,
  },

  readMoreText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#16A34A",
  },

  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#86EFAC",
    backgroundColor: "#F0FDF4",
    gap: 6,
  },

  editText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#16A34A",
  },
  safeArea: {
    backgroundColor: "#ffffff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
});
