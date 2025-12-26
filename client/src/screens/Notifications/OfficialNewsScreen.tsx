import { useEffect, useState } from "react";
import {
  FlatList,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import axios from "axios";
import { API_BASE } from "../../services/api";
import { Ionicons } from "@expo/vector-icons";
import type { RootStackParamList } from "../../navigation";

// =======================
// Types
// =======================
interface OfficialNews {
  id: string;
  title: string;
  summary: string;
  category: "price" | "weather" | "policy" | "alert";
  source: string;
  district?: string;
  language: string;
  url?: string;
  created_at: string;
  is_active: boolean;
}

// =======================
// Navigation Type
// =======================
type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "OfficialNews"
>;

export default function OfficialNewsScreen() {
  const [news, setNews] = useState<OfficialNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ FIXED navigation typing
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    fetchNews();
  }, []);

  // =======================
  // Fetch News
  // =======================
  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_BASE}/official-news`);
      setNews(res.data);
    } catch (err) {
      console.error(err);
      setError("පුවත් ලබා ගැනීමට නොහැකි විය");
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
        return "#2563eb";
      case "weather":
        return "#0891b2";
      case "policy":
        return "#7c3aed";
      case "alert":
        return "#dc2626";
      default:
        return "#6b7280";
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
      default:
        return category;
    }
  };

  // =======================
  // 🔑 FIXED navigation
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

  // =======================
  // UI
  // =======================
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>නිල පුවත්</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={news}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={fetchNews}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="newspaper-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>නිල පුවත් නොමැත</Text>
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

            {/* SUMMARY */}
            {item.summary && (
              <Text style={styles.newsSummary} numberOfLines={2}>
                {item.summary}
              </Text>
            )}

            {/* FOOTER */}
            <View style={styles.newsFooter}>
              <View style={styles.sourceContainer}>
                <Ionicons
                  name="newspaper-outline"
                  size={14}
                  color="#6b7280"
                />
                <Text style={styles.sourceText}>{item.source}</Text>
              </View>

              {item.district && (
                <View style={styles.districtContainer}>
                  <Ionicons
                    name="location-outline"
                    size={14}
                    color="#6b7280"
                  />
                  <Text style={styles.districtText}>{item.district}</Text>
                </View>
              )}
            </View>

            <View style={styles.readMoreContainer}>
              <Text style={styles.readMoreText}>තව කියවන්න</Text>
              <Ionicons name="chevron-forward" size={16} color="#22c55e" />
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

  readMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  readMoreText: {
    fontSize: 14,
    color: "#22c55e",
    fontWeight: "600",
    marginRight: 4,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyText: { marginTop: 16, fontSize: 16, color: "#9ca3af" },
});
