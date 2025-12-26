import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { API_BASE } from "../../services/api";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

interface NewsItem {
  id: string;
  title: string;
  category: string;
  image_url?: string;
}

export default function TopOfficialNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const navigation = useNavigation<any>();

  useEffect(() => {
    axios.get(`${API_BASE}/official-news`).then(res => {
      setNews(res.data.slice(0, 3));
    });
  }, []);

  const categoryColor = (cat: string) => {
    switch (cat) {
      case "price": return "#2563eb";
      case "weather": return "#0891b2";
      case "policy": return "#7c3aed";
      case "alert": return "#dc2626";
      default: return "#6b7280";
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📰 නිල පුවත්</Text>
        <TouchableOpacity onPress={() => navigation.navigate("OfficialNews")}>
          <Text style={styles.more}>තව</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Scroll */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {news.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() =>
              navigation.navigate("NewsDetail", { id: item.id })
            }
          >
            {item.image_url && (
              <Image
                source={{ uri: item.image_url }}
                style={styles.image}
              />
            )}

            <View
              style={[
                styles.badge,
                { backgroundColor: categoryColor(item.category) },
              ]}
            >
              <Text style={styles.badgeText}>{item.category}</Text>
            </View>

            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1f2937",
  },
  more: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563eb",
  },
  card: {
    width: 260,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 130,
    borderRadius: 12,
    marginBottom: 8,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 6,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2937",
  },
});
