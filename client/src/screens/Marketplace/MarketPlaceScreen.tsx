import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
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
  CheckCircle,
  MessageSquare,
  Send,
  XCircle,
} from "lucide-react-native";
import { useLanguage } from "../../context/LanguageContext";
import { useNotifications } from "../../context/NotificationContext";
import {
  listPosts,
  checkUserOffer,
  createOffer,
  publishPostNow,
  type Post,
} from "../../services/postService";
import { supabase } from "../../lib/supabase";

type NavProp = StackNavigationProp<
  PriceForecastStackParamList,
  "MarketPlaceScreen"
>;

const MarketPlaceScreen = () => {
  const navigation = useNavigation<NavProp>();
  const { language: globalLang } = useLanguage();
  const language = globalLang === "sinhala" ? "si" : "en";
  const { sendNotification } = useNotifications();

  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [userOffers, setUserOffers] = useState<Map<string, boolean>>(new Map());
  const [activeCount, setActiveCount] = useState(0);

  // 🔥 NEW: Quick offer modal state
  const [showQuickOfferModal, setShowQuickOfferModal] = useState(false);
  const [selectedPostForOffer, setSelectedPostForOffer] = useState<Post | null>(
    null,
  );
  const [quickOfferPrice, setQuickOfferPrice] = useState<string>("");
  const [isSubmittingQuickOffer, setIsSubmittingQuickOffer] = useState(false);
  const [isPublishingNow, setIsPublishingNow] = useState<string | null>(null); // postId being published

  const content = {
    si: {
      title: "අස්වනු වෙළඳපල",
      subtitle: "ලබා ගත හැකි අස්වනු",
      search: "සොයන්න...",
      noResults: "ප්‍රතිඵල නොමැත",
      perKg: "කි.ග්‍රෑම් එකකට",
      loading: "පූරණය වෙමින්...",
      active: "ක්‍රියාකාරී",
      sold: "විකිණුණු",
      scheduled: "සකස් කළ",
      postNow: "දැන් ප්‍රකාශනය",
      yourOffer: "ඔබේ ඉදිරිපත්කරණ",
      noOffers: "ඉදිරිපත්කරණ නැත",
      // 🔥 NEW: Quick offer modal text
      quickOffer: "ඉක්මන් ඉදිරිපත්කරණ",
      enterOfferPrice: "ඉදිරිපත් මිල ඇතුලු කරන්න",
      currentPrice: "වත්මන් මිල",
      submitOffer: "ඉදිරිපත් කරන්න",
      cancel: "අවලංගු කරන්න",
      offerHint: "ඔබේ ඉදිරිපත් මිල ඇතුලු කරන්න",
      offerSuccess: "ඉදිරිපත්කරණ සාර්ථකයි!",
      offerError: "දෝෂයක් සිදු විය",
      invalidPrice: "කරුණාකර වලංගු මිල ඇතුලු කරන්න",
      alreadyOffered: "ඔබ පෙර ඉදිරිපත්කරණ ඉදිරිපත් කර ඇත",
    },
    en: {
      title: "Harvest Marketplace",
      subtitle: "Available harvests to buy",
      search: "Search...",
      noResults: "No results found",
      perKg: "per kg",
      loading: "Loading...",
      active: "Active",
      sold: "Sold",
      scheduled: "Scheduled",
      postNow: "Post Now",
      yourOffer: "Your offer",
      noOffers: "No offers",
      // 🔥 NEW: Quick offer modal text
      quickOffer: "Quick Offer",
      enterOfferPrice: "Enter offer price",
      currentPrice: "Current price",
      submitOffer: "Submit Offer",
      cancel: "Cancel",
      offerHint: "Enter your offer price",
      offerSuccess: "Offer submitted!",
      offerError: "An error occurred",
      invalidPrice: "Please enter a valid price",
      alreadyOffered: "You already offered on this post",
    },
  };

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    getUser();
  }, []);

  // Load posts
  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const data = await listPosts();
      setPosts(data);
      setFilteredPosts(data);
      setActiveCount(data.filter((p) => p.status === "active").length);

      // Check user offers for each post
      if (currentUserId) {
        const offerMap = new Map<string, boolean>();
        for (const post of data) {
          const userOffer = await checkUserOffer(post.id);
          offerMap.set(post.id, !!userOffer);
        }
        setUserOffers(offerMap);
      }
    } catch (error) {
      console.error("Load posts error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadPosts();
    }, [currentUserId]),
  );

  // Filter posts — always keep active posts before scheduled before sold
  useEffect(() => {
    const statusOrder = (s: string) =>
      s === "active" ? 0 : s === "scheduled" ? 1 : 2;

    const filtered = posts
      .filter(
        (post) =>
          // Safety: never show another user's scheduled post client-side
          // (RLS handles this on the DB side; this is a defence-in-depth guard)
          !(post.status === "scheduled" && post.farmer_id !== currentUserId) &&
          (post.seed_variety
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
            post.district.toLowerCase().includes(searchQuery.toLowerCase())),
      )
      .sort((a, b) => statusOrder(a.status) - statusOrder(b.status));
    setFilteredPosts(filtered);
  }, [searchQuery, posts, currentUserId]);

  // Handle "Post Now" for scheduled posts
  const handlePublishNow = async (postId: string) => {
    try {
      setIsPublishingNow(postId);
      await publishPostNow(postId);
      await loadPosts();
    } catch (error) {
      Alert.alert(language === "si" ? "දෝෂයක්" : "Error", String(error));
    } finally {
      setIsPublishingNow(null);
    }
  };

  // 🔥 NEW: Handle quick offer submission
  const handleQuickOfferSubmit = async () => {
    if (!selectedPostForOffer) return;

    // Block farmer from offering on their own post
    if (currentUserId === selectedPostForOffer.farmer_id) {
      Alert.alert(
        language === "si" ? "දෝෂයක්" : "Error",
        language === "si"
          ? "ඔබගේම ඉදිරිපත්කිරීමකට ඉදිරිපත්කරණ ඉදිරිපත් කළ නොහැකිය"
          : "You cannot place an offer on your own post",
      );
      setShowQuickOfferModal(false);
      return;
    }

    const price = parseFloat(quickOfferPrice);

    if (!quickOfferPrice || !Number.isFinite(price) || price <= 0) {
      Alert.alert(
        language === "si" ? "දෝෂයක්" : "Error",
        content[language].invalidPrice,
      );
      return;
    }

    try {
      setIsSubmittingQuickOffer(true);

      // Create offer
      await createOffer(selectedPostForOffer.id, price);

      // Show success
      await sendNotification(
        content[language].offerSuccess,
        `Rs ${price.toFixed(2)}/kg`,
        "offer",
      );

      // Reset modal
      setShowQuickOfferModal(false);
      setQuickOfferPrice("");
      setSelectedPostForOffer(null);

      // Reload posts
      await loadPosts();
    } catch (error) {
      console.error("Quick offer error:", error);
      Alert.alert(language === "si" ? "දෝෂයක්" : "Error", String(error));
    } finally {
      setIsSubmittingQuickOffer(false);
    }
  };

  const renderPostCard = ({ item }: { item: Post }) => {
    const hasUserOffer = userOffers.get(item.id);
    const isScheduled = item.status === "scheduled";
    const isOwner = currentUserId === item.farmer_id;

    return (
      <TouchableOpacity
        style={[
          styles.postCard,
          item.status === "sold" && styles.postCardSold,
          isScheduled && styles.postCardScheduled,
        ]}
        onPress={() =>
          navigation.navigate("PostDetailScreen", { postId: item.id })
        }
        activeOpacity={isScheduled ? 0.9 : 0.7}
      >
        {/* Header with status */}
        <View style={styles.cardHeader}>
          <View style={styles.cardLeft}>
            <Text style={styles.seedVariety}>{item.seed_variety}</Text>
            <Text style={styles.farmer}>{item.farmer_name}</Text>
          </View>

          <View style={styles.cardRight}>
            {/* Scheduled badge (owner only) */}
            {isScheduled && isOwner && (
              <View style={styles.statusBadgeScheduled}>
                <Text style={styles.statusTextScheduled}>
                  🕐 {content[language].scheduled}
                </Text>
              </View>
            )}

            {/* Active / Sold status badge */}
            {!isScheduled && (
              <View
                style={[
                  styles.statusBadge,
                  item.status === "sold"
                    ? styles.statusSold
                    : styles.statusActive,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    item.status === "sold"
                      ? styles.statusTextSold
                      : styles.statusTextActive,
                  ]}
                >
                  {item.status === "sold"
                    ? content[language].sold
                    : content[language].active}
                </Text>
              </View>
            )}

            {/* Price */}
            <View style={styles.priceBadge}>
              <Text style={styles.priceValue}>
                Rs {item.price_per_kg.toFixed(2)}
              </Text>
              <Text style={styles.priceUnit}>{content[language].perKg}</Text>
            </View>
          </View>
        </View>

        {/* Details Row */}
        <View style={styles.detailsRow}>
          <View style={styles.detail}>
            <Package size={14} color="#3B82F6" />
            <Text style={styles.detailText}>
              {item.quantity_kg.toFixed(0)} kg
            </Text>
          </View>
          <View style={styles.detail}>
            <MapPin size={14} color="#F59E0B" />
            <Text style={styles.detailText}>{item.district}</Text>
          </View>
          <View style={styles.detail}>
            <Calendar size={14} color="#8B5CF6" />
            <Text style={styles.detailText}>W{item.week}</Text>
          </View>
        </View>

        {/* Bottom Section: Total Value + Offer / Post Now Button */}
        <View style={styles.bottomSection}>
          <View style={styles.totalValue}>
            <TrendingUp size={14} color="#10B981" />
            <Text style={styles.totalValueText}>
              රු. {(item.quantity_kg * item.price_per_kg).toFixed(0)}
            </Text>
          </View>

          {/* 🗓 Post Now button — owner's scheduled posts only */}
          {isScheduled && isOwner && (
            <TouchableOpacity
              style={styles.postNowButton}
              onPress={() => handlePublishNow(item.id)}
              disabled={isPublishingNow === item.id}
            >
              {isPublishingNow === item.id ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.postNowButtonText}>
                  ▶ {content[language].postNow}
                </Text>
              )}
            </TouchableOpacity>
          )}

          {/* 🔥 Offer CTA Button — hidden for scheduled posts and post's own farmer */}
          {!isScheduled &&
            currentUserId &&
            item.status === "active" &&
            currentUserId !== item.farmer_id && (
              <TouchableOpacity
                style={[
                  styles.offerCTAButton,
                  hasUserOffer && styles.offerCTAButtonDisabled,
                ]}
                onPress={() => {
                  if (hasUserOffer) {
                    navigation.navigate("PostDetailScreen", {
                      postId: item.id,
                    });
                  } else {
                    setSelectedPostForOffer(item);
                    setQuickOfferPrice(item.price_per_kg.toFixed(2));
                    setShowQuickOfferModal(true);
                  }
                }}
              >
                <MessageSquare size={14} color="#FFF" />
                <Text style={styles.offerCTAButtonText}>
                  {hasUserOffer ? "View Offer" : "Make Offer"}
                </Text>
              </TouchableOpacity>
            )}

          {/* Sold Status */}
          {item.status === "sold" && (
            <View style={styles.soldBadge}>
              <Text style={styles.soldBadgeText}>Sold</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
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
            {activeCount} {language === "si" ? "ක්‍රියාකාරී" : "active"}
            {posts.length - activeCount > 0
              ? ` · ${posts.length - activeCount} ${language === "si" ? "විකිණී" : "sold"}`
              : ""}
          </Text>
        </View>
      </View>

      {/* Search */}
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

      {/* Content */}
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

      {/* 🔥 NEW: Quick Offer Modal */}
      <Modal
        visible={showQuickOfferModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowQuickOfferModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {content[language].quickOffer}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowQuickOfferModal(false)}
                  style={styles.closeButton}
                >
                  <XCircle size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Modal Body */}
              <View style={styles.modalBody}>
                {/* Product Info */}
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>
                    {selectedPostForOffer?.seed_variety}
                  </Text>
                  <Text style={styles.productDetail}>
                    {selectedPostForOffer?.quantity_kg.toFixed(0)} kg •{" "}
                    {selectedPostForOffer?.district}
                  </Text>
                </View>

                {/* Current Price */}
                <View style={styles.currentPriceBox}>
                  <Text style={styles.currentPriceLabel}>
                    {content[language].currentPrice}
                  </Text>
                  <Text style={styles.currentPriceValue}>
                    Rs {selectedPostForOffer?.price_per_kg.toFixed(2)}
                  </Text>
                </View>

                {/* Offer Price Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {content[language].enterOfferPrice}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder={content[language].offerHint}
                    placeholderTextColor="#9CA3AF"
                    value={quickOfferPrice}
                    onChangeText={setQuickOfferPrice}
                    keyboardType="decimal-pad"
                    editable={!isSubmittingQuickOffer}
                  />
                </View>

                {/* Price Comparison */}
                {quickOfferPrice && parseFloat(quickOfferPrice) > 0 && (
                  <View
                    style={[
                      styles.priceComparison,
                      {
                        backgroundColor:
                          parseFloat(quickOfferPrice) >
                          (selectedPostForOffer?.price_per_kg || 0)
                            ? "#D1FAE5"
                            : "#FEF3C7",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.comparisonText,
                        {
                          color:
                            parseFloat(quickOfferPrice) >
                            (selectedPostForOffer?.price_per_kg || 0)
                              ? "#047857"
                              : "#92400E",
                        },
                      ]}
                    >
                      {parseFloat(quickOfferPrice) >
                      (selectedPostForOffer?.price_per_kg || 0)
                        ? language === "si"
                          ? "වත්මන් මිලට වඩා ඉහළ "
                          : "Higher than asking"
                        : language === "si"
                          ? "වත්මන් මිලට වඩා අඩු"
                          : "Lower than asking"}
                    </Text>
                    <Text
                      style={[
                        styles.comparisonValue,
                        {
                          color:
                            parseFloat(quickOfferPrice) >
                            (selectedPostForOffer?.price_per_kg || 0)
                              ? "#047857"
                              : "#92400E",
                        },
                      ]}
                    >
                      Rs{" "}
                      {Math.abs(
                        parseFloat(quickOfferPrice) -
                          (selectedPostForOffer?.price_per_kg || 0),
                      ).toFixed(2)}
                    </Text>
                  </View>
                )}
              </View>

              {/* Modal Footer */}
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowQuickOfferModal(false)}
                  disabled={isSubmittingQuickOffer}
                >
                  <Text style={styles.modalCancelButtonText}>
                    {content[language].cancel}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalSubmitButton}
                  onPress={handleQuickOfferSubmit}
                  disabled={isSubmittingQuickOffer}
                >
                  {isSubmittingQuickOffer ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Send size={16} color="#FFFFFF" />
                      <Text style={styles.modalSubmitButtonText}>
                        {content[language].submitOffer}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4",
  },
  header: {
    backgroundColor: "#FFF",
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
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  searchContainer: {
    backgroundColor: "#FFF",
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
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#D1FAE5",
    gap: 10,
  },
  postCardSold: {
    opacity: 0.6,
    borderColor: "#FEE2E2",
  },
  postCardScheduled: {
    opacity: 0.75,
    borderColor: "#F59E0B",
    borderStyle: "dashed",
    backgroundColor: "#FFFBEB",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  cardLeft: {
    flex: 1,
  },
  cardRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  seedVariety: {
    fontSize: 15,
    fontWeight: "700",
    color: "#065F46",
  },
  farmer: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: "#ECFDF5",
  },
  statusSold: {
    backgroundColor: "#FEE2E2",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  statusTextActive: {
    color: "#10B981",
  },
  statusTextSold: {
    color: "#DC2626",
  },
  statusBadgeScheduled: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#FEF3C7",
  },
  statusTextScheduled: {
    fontSize: 10,
    fontWeight: "600",
    color: "#92400E",
  },
  priceBadge: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "flex-end",
  },
  priceValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#10B981",
  },
  priceUnit: {
    fontSize: 9,
    color: "#6B7280",
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
  },
  detail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  detailText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
  bottomSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 8,
  },
  totalValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  totalValueText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#10B981",
  },
  offerCTAButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#0EA5E9",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  offerCTAButtonDisabled: {
    backgroundColor: "#10B981",
    opacity: 0.7,
  },
  offerCTAButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFF",
  },
  soldBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  soldBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#DC2626",
  },
  postNowButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F59E0B",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  postNowButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFF",
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalContent: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    maxHeight: "80%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },

  modalBody: {
    gap: 12,
  },

  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 10,
  },

  modalCancelButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
  },

  modalCancelButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },

  modalSubmitButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#10B981",
  },

  modalSubmitButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  closeButton: {
    padding: 4,
  },

  productInfo: {
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 8,
  },

  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#065F46",
  },

  productDetail: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },

  currentPriceBox: {
    backgroundColor: "#ECFDF5",
    padding: 10,
    borderRadius: 8,
  },

  currentPriceLabel: {
    fontSize: 11,
    color: "#6B7280",
  },

  currentPriceValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10B981",
    marginTop: 2,
  },

  inputGroup: {
    gap: 6,
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },

  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1FAE5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: "#1F2937",
  },

  priceComparison: {
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  comparisonText: {
    fontSize: 12,
    fontWeight: "600",
  },

  comparisonValue: {
    fontSize: 12,
    fontWeight: "700",
  },
});

export default MarketPlaceScreen;
