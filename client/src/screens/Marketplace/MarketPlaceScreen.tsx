import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { PriceForecastStackParamList } from "../../navigation/PriceForecastStack";
import {
  ArrowLeft,
  Search,
  DollarSign,
  Package,
  MapPin,
  Calendar,
  TrendingUp,
} from "lucide-react-native";
import { useLanguage } from "../../context/LanguageContext";
import { listPosts, type Post } from "../../services/postService";

type NavProp = StackNavigationProp<
  PriceForecastStackParamList,
  "MarketPlaceScreen"
>;

const MarketPlaceScreen = () => {
  const navigation = useNavigation<NavProp>();
  const { language: globalLang } = useLanguage();
  const language = globalLang === "sinhala" ? "si" : "en";

  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const content = {
    si: {
      title: "අස්වනු වෙළඳපල",
      subtitle: "ලබා ගත හැකි අස්වනු",
      search: "සොයන්න...",
      noResults: "ප්‍රතිඵල නොමැත",
      perKg: "කි.ග්‍රෑම් එකකට",
      loading: "පූරණය වෙමින්...",
    },
    en: {
      title: "Harvest Marketplace",
      subtitle: "Available harvests to buy",
      search: "Search...",
      noResults: "No results found",
      perKg: "per kg",
      loading: "Loading...",
    },
  };

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const data = await listPosts();
      setPosts(data);
      setFilteredPosts(data);
    } catch (error) {
      console.error("Load posts error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadPosts();
    }, [])
  );

  useEffect(() => {
    const filtered = posts.filter(
      (post) =>
        post.seed_variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.district.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPosts(filtered);
  }, [searchQuery, posts]);

  const renderPostCard = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() =>
        navigation.navigate("PostDetailScreen", { postId: item.id })
      }
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.seedVariety}>{item.seed_variety}</Text>
          <Text style={styles.farmer}>{item.farmer_name}</Text>
        </View>
        <View style={styles.priceBadge}>
          <Text style={styles.priceValue}>
            Rs {item.price_per_kg.toFixed(2)}
          </Text>
          <Text style={styles.priceUnit}>{content[language].perKg}</Text>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detail}>
          <Package size={16} color="#3B82F6" />
          <Text style={styles.detailText}>
            {item.quantity_kg.toFixed(0)} kg
          </Text>
        </View>
        <View style={styles.detail}>
          <MapPin size={16} color="#F59E0B" />
          <Text style={styles.detailText}>{item.district}</Text>
        </View>
        <View style={styles.detail}>
          <Calendar size={16} color="#10B981" />
          <Text style={styles.detailText}>W{item.week}</Text>
        </View>
      </View>

      <View style={styles.totalValue}>
        <TrendingUp size={16} color="#10B981" />
        <Text style={styles.totalValueText}>
          රු. {(item.quantity_kg * item.price_per_kg).toFixed(0)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft color="#047857" size={24} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{content[language].title}</Text>
          <Text style={styles.headerSubtitle}>
            {content[language].subtitle}
          </Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Search size={18} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          placeholder={content[language].search}
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loaderText}>{content[language].loading}</Text>
        </View>
      ) : filteredPosts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{content[language].noResults}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          renderItem={renderPostCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  searchContainer: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 14,
    color: "#1F2937",
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  postCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#D1FAE5",
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  seedVariety: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#065F46",
  },
  farmer: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  priceBadge: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "flex-end",
  },
  priceValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#10B981",
  },
  priceUnit: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 2,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  totalValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  totalValueText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#10B981",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
});

export default MarketPlaceScreen;
