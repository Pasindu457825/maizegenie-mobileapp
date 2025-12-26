import { View, Text, ActivityIndicator, StyleSheet, ScrollView } from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../../services/api";
import { Ionicons } from "@expo/vector-icons";
import type { RootStackParamList } from "../../navigation";

// =======================
// Route typing
// =======================
type RouteProps = RouteProp<RootStackParamList, "NewsDetail">;

// =======================
// Data model (matches backend)
// =======================
interface NewsDetail {
  id: string;
  title: string;
  summary: string | null;
  category: "price" | "weather" | "policy" | "alert";
  source: string;
  district?: string | null;
  created_at: string;
  url?: string | null;
  language?: string;
}

export default function NewsDetailScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation();

  const newsId = route.params?.id;

  const [news, setNews] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // =======================
  // Fetch single news by ID
  // =======================
  useEffect(() => {
    if (!newsId) {
      setError("Invalid news id");
      setLoading(false);
      return;
    }

    const fetchNewsDetail = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/official-news/${newsId}`);
        setNews(res.data);
      } catch (err) {
        console.error("NEWS DETAIL ERROR:", err);
        setError("පුවත ලබා ගැනීමට නොහැකි විය");
      } finally {
        setLoading(false);
      }
    };

    fetchNewsDetail();
  }, [newsId]);

  // =======================
  // Helpers
  // =======================
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
  // STATES
  // =======================
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={styles.loadingText}>පුවත පූරණය වෙමින්...</Text>
      </View>
    );
  }

  if (error || !news) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={64} color="#dc2626" />
        <Text style={styles.errorText}>{error || "පුවත හමු නොවීය"}</Text>
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
        <Ionicons
          name="arrow-back"
          size={24}
          color="#1f2937"
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>නිල පුවත්</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{news.title}</Text>

        <View style={styles.meta}>
          <Text style={styles.metaText}>
            {new Date(news.created_at).toLocaleDateString("si-LK")}
          </Text>
          <Text style={styles.metaText}>
            • {getCategoryLabel(news.category)}
          </Text>
          <Text style={styles.metaText}>• {news.source}</Text>
        </View>

        {news.district && (
          <Text style={styles.district}>📍 {news.district}</Text>
        )}

        {news.summary && (
          <Text style={styles.summary}>{news.summary}</Text>
        )}

        {news.url && (
          <Text style={styles.link}>🔗 {news.url}</Text>
        )}
      </ScrollView>
    </View>
  );
}

// =======================
// Styles
// =======================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },

  content: { padding: 16 },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },

  meta: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  metaText: {
    fontSize: 12,
    color: "#6b7280",
    marginRight: 8,
  },

  district: {
    fontSize: 13,
    color: "#2563eb",
    marginBottom: 12,
  },

  summary: {
    fontSize: 16,
    lineHeight: 24,
    color: "#374151",
  },

  link: {
    marginTop: 16,
    fontSize: 14,
    color: "#2563eb",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#dc2626",
    textAlign: "center",
  },
});
