import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
} from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../../services/api";
import { Ionicons } from "@expo/vector-icons";
import type { RootStackParamList } from "../../navigation";

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
      } catch (err) {
        setError("පුවත ලබා ගැනීමට නොහැකි විය");
      } finally {
        setLoading(false);
      }
    };

    fetchNewsDetail();
  }, [newsId]);

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

    default:
      return category;
  }
};

  /* ================= STATES ================= */
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#16a34a" />
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

  /* ================= UI ================= */
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#14532d" />
        </Pressable>
        <Text style={styles.headerTitle}>නිල පුවත්</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* IMAGE */}
        {news.image_url && (
          <Image source={{ uri: news.image_url }} style={styles.image} />
        )}

        {/* CARD */}
        <View style={styles.card}>
          {/* CATEGORY PILL */}
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>
              {getCategoryLabel(news.category)}
            </Text>
          </View>

          {/* TITLE */}
          <Text style={styles.title}>{news.title}</Text>

          {/* META */}
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={14} color="#6b7280" />
            <Text style={styles.metaText}>
              {new Date(news.created_at).toLocaleDateString("si-LK")}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="newspaper-outline" size={14} color="#6b7280" />
            <Text style={styles.metaText}>{news.source}</Text>
          </View>

          {news.district && (
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={14} color="#2563eb" />
              <Text style={styles.districtText}>{news.district}</Text>
            </View>
          )}

          {/* SUMMARY */}
          {news.summary && <Text style={styles.summary}>{news.summary}</Text>}

          {/* LINK */}
          {news.url && (
            <Pressable>
              <Text style={styles.link}>🔗 සම්පූර්ණ පුවත කියවන්න</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0fdf4",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#dcfce7",
    borderBottomWidth: 1,
    borderBottomColor: "#bbf7d0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#14532d",
  },

  scroll: {
    padding: 16,
    paddingBottom: 40,
  },

  image: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: "#e5e7eb",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },

  categoryPill: {
    alignSelf: "flex-start",
    backgroundColor: "#bbf7d0",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#166534",
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
    lineHeight: 30,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  metaText: {
    marginLeft: 6,
    fontSize: 13,
    color: "#6b7280",
  },
  districtText: {
    marginLeft: 6,
    fontSize: 13,
    color: "#2563eb",
    fontWeight: "600",
  },

  summary: {
    marginTop: 14,
    fontSize: 16,
    lineHeight: 26,
    color: "#374151",
  },

  link: {
    marginTop: 18,
    fontSize: 15,
    fontWeight: "600",
    color: "#16a34a",
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
