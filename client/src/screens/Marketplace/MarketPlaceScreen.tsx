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
  ScrollView,
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
  Bell,
  Clock,
  Users,
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

type RootNavProp = StackNavigationProp<Record<string, object | undefined>>;

// Dynamic API URL using .env + Platform detection
const getApiUrl = () => {
  if (Platform.OS === "android") {
    // Real Android Device → Uses .env
    return process.env.EXPO_PUBLIC_API_BASE;
  } else if (Platform.OS === "ios") {
    // iOS simulator
    return "http://localhost:8000";
  } else {
    // Expo Web fallback
    return "http://localhost:8000";
  }
};

const API_URL = getApiUrl();

const MarketPlaceScreen = () => {
  const navigation = useNavigation<NavProp>();
  const rootNavigation = useNavigation<RootNavProp>();
  const { language: globalLang } = useLanguage();
  const language =
    globalLang === "sinhala" ? "si" : globalLang === "tamil" ? "ta" : "en";
  const { sendNotification, unreadCount } = useNotifications();

  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [userOffers, setUserOffers] = useState<Map<string, boolean>>(new Map());
  const [activeCount, setActiveCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<
    "not_sold" | "sold" | "archived"
  >("not_sold");

  // Quick offer modal state
  const [showQuickOfferModal, setShowQuickOfferModal] = useState(false);
  const [selectedPostForOffer, setSelectedPostForOffer] = useState<Post | null>(
    null,
  );
  const [quickOfferPrice, setQuickOfferPrice] = useState<string>("");
  const [isSubmittingQuickOffer, setIsSubmittingQuickOffer] = useState(false);
  const [isPublishingNow, setIsPublishingNow] = useState<string | null>(null); // postId being published
  const [postScope, setPostScope] = useState<"all" | "mine">("all");
  const [showMyOffersOnly, setShowMyOffersOnly] = useState(false);

  const content = {
    si: {
      title: "අස්වනු වෙළඳපල",
      subtitle: "ලබා ගත හැකි අස්වනු",
      search: "සොයන්න...",
      noResults: "ප්‍රතිඵල නොමැත",
      perKg: "කි.ග්‍රෑම් එකකට",
      loading: "පූරණය වෙමින්...",
      active: "ක්‍රියාකාරී",
      sold: "විකිණු",
      scheduled: "සකස් කළ",
      postNow: "දැන් ප්‍රකාශනය",
      yourOffer: "ඔබේ ඉදිරිපත්කරණ",
      noOffers: "ඉදිරිපත්කරණ නැත",
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
      posted: "පළ කළ",
      updated: "යාවත්කාලීන",
      myPosts: "මගේ ඉදිරිපත්කිරීම්",
      allPosts: "සියලු ගනුදෙනු",
      myOffers: "මගේ ඉදිරිපත්කරණ",
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
      posted: "Posted",
      updated: "Updated",
      myPosts: "My Posts",
      allPosts: "All Posts",
      myOffers: "My Offers",
      offerCount: (n: number) =>
        n === 0
          ? "No offers yet · Be the first!"
          : n === 1
            ? "1 offer placed"
            : `${n} offers placed`,
      highDemand: "High demand",
      activeInterest: "Active interest",
    },
    ta: {
      title: "அறுவடை சந்தை",
      subtitle: "வாங்கக் கிடைக்கும் அறுவடைகள்",
      search: "தேடுக...",
      noResults: "எதுவும் கிடைக்கவில்லை",
      perKg: "ஒரு கிலோவிட்டுக்கு",
      loading: "ஏற்றுகிறது...",
      active: "சுறுசீரானது",
      sold: "விற்பனையானது",
      scheduled: "திட்டமிட்டது",
      postNow: "இப்போது பிரசுரிக்கவும்",
      yourOffer: "உங்கள் சலிவு விலை",
      noOffers: "சலிவு விலை இல்லை",
      quickOffer: "விரைவான விலை இடுக",
      enterOfferPrice: "சலிவு விலையை உள்ளிடுக",
      currentPrice: "தற்போதைய விலை",
      submitOffer: "சலிவு சமர்ப்பிக்கவும்",
      cancel: "ரத்து செய்க",
      offerHint: "உங்கள் சலிவு விலையை உள்ளிடுக",
      offerSuccess: "சலிவு விலை சமர்ப்பிக்கப்பட்டது!",
      offerError: "பிழை ஏற்பட்டது",
      invalidPrice: "சரியான விலையை உள்ளிடுக",
      alreadyOffered: "ஏற்கனவே சலிவு விலை சமர்ப்பித்துள்ளீர்கள்",
      posted: "பதிவிடப்பட்டது",
      updated: "புதுப்பிக்கப்பட்டது",
      myPosts: "என் பதிவுகள்",
      allPosts: "அனைத்து பதிவுகள்",
      myOffers: "என் சலிவுகள்",
      offerCount: (n: number) =>
        n === 0
          ? "இன்னும் சலிவு இல்லை · முதலில் இடுக!"
          : n === 1
            ? "1 சலிவு விலை"
            : `${n} சலிவு விலைகள்`,
      highDemand: "அதிக தேவை",
      activeInterest: "செயலில் ஆர்வம்",
    },
  };

  // Helper: derive label/colors for the offer count strip
  const getOfferMeta = (count: number, lang: "si" | "en" | "ta") => {
    const offerContent = {
      si: {
        none: "ඉදිරිපත්කරණ නොමැත · පළමු වන්න!",
        one: "ඉදිරිපත්කරණය 1",
        many: (n: number) => `ඉදිරිපත්කරණ ${n}`,
        highDemand: "ඉහළ ඉල්ලුමක්",
        activeInterest: "ක්‍රියාශීලී උනන්දුව",
      },
      en: {
        none: "No offers yet · Be the first!",
        one: "1 offer placed",
        many: (n: number) => `${n} offers placed`,
        highDemand: "High demand",
        activeInterest: "Active interest",
      },
      ta: {
        none: "இன்னும் சலிவு இல்லை · முதலில் இடுக!",
        one: "1 சலிவு விலை",
        many: (n: number) => `${n} சலிவு விலைகள்`,
        highDemand: "அதிக தேவை",
        activeInterest: "செயலில் ஆர்வம்",
      },
    }[lang];

    if (count === 0) {
      return {
        label: offerContent.none,
        sideLabel: "",
        bg: "#F3F4F6",
        iconColor: "#9CA3AF",
        textColor: "#6B7280",
        borderColor: "#E5E7EB",
        showSide: false,
      };
    }
    if (count >= 6) {
      return {
        label: count === 1 ? offerContent.one : offerContent.many(count),
        sideLabel: `🔥 ${offerContent.highDemand}`,
        bg: "#FFF7ED",
        iconColor: "#F97316",
        textColor: "#C2410C",
        borderColor: "#FDBA74",
        showSide: true,
      };
    }
    if (count >= 3) {
      return {
        label: count === 1 ? offerContent.one : offerContent.many(count),
        sideLabel: offerContent.activeInterest,
        bg: "#ECFDF5",
        iconColor: "#10B981",
        textColor: "#065F46",
        borderColor: "#6EE7B7",
        showSide: true,
      };
    }
    return {
      label: count === 1 ? offerContent.one : offerContent.many(count),
      sideLabel: "",
      bg: "#EFF6FF",
      iconColor: "#3B82F6",
      textColor: "#1D4ED8",
      borderColor: "#BFDBFE",
      showSide: false,
    };
  };

  // Format a UTC ISO timestamp to a short local date string e.g. "Feb 27, 2026"
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Returns true when updated_at is meaningfully later than created_at (>60s)
  const wasUpdated = (created: string, updated?: string) => {
    if (!updated) return false;
    return new Date(updated).getTime() - new Date(created).getTime() > 60_000;
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
          try {
            const userOffer = await checkUserOffer(post.id);
            offerMap.set(post.id, !!userOffer);
          } catch (offerError) {
            console.warn(
              `[loadPosts] Error checking offer for post ${post.id}:`,
              offerError,
            );
            // Continue loading other posts even if one fails
            offerMap.set(post.id, false);
          }
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
            post.district.toLowerCase().includes(searchQuery.toLowerCase())) &&
          // Status filter: keep active, sold, and scheduled/archived separate
          (statusFilter === "sold"
            ? post.status === "sold"
            : statusFilter === "archived"
              ? post.status === "scheduled"
              : post.status === "active") &&
          // Post scope filter
          (postScope === "mine" ? post.farmer_id === currentUserId : true) &&
          // My offers filter: if enabled, show only posts where user has placed an offer
          (showMyOffersOnly ? userOffers.get(post.id) === true : true),
      )
      .sort((a, b) => statusOrder(a.status) - statusOrder(b.status));
    setFilteredPosts(filtered);
  }, [
    searchQuery,
    posts,
    currentUserId,
    statusFilter,
    postScope,
    showMyOffersOnly,
    userOffers,
  ]);

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

  //  NEW: Handle quick offer submission
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

        {/*  Offer Count Strip — visible for non-scheduled active/sold posts */}
        {!isScheduled &&
          (() => {
            const offerMeta = getOfferMeta(item.offer_count ?? 0, language);
            return (
              <View
                style={[
                  styles.offerCountStrip,
                  {
                    backgroundColor: offerMeta.bg,
                    borderColor: offerMeta.borderColor,
                  },
                ]}
              >
                <View style={styles.offerCountLeft}>
                  <View
                    style={[
                      styles.offerIconCircle,
                      { backgroundColor: offerMeta.borderColor },
                    ]}
                  >
                    <Users size={12} color={offerMeta.iconColor} />
                  </View>
                  <Text
                    style={[
                      styles.offerCountLabel,
                      { color: offerMeta.textColor },
                    ]}
                  >
                    {offerMeta.label}
                  </Text>
                </View>
                {offerMeta.showSide && (
                  <Text
                    style={[
                      styles.offerSideLabel,
                      { color: offerMeta.textColor },
                    ]}
                  >
                    {offerMeta.sideLabel}
                  </Text>
                )}
                {(item.offer_count ?? 0) > 0 && (
                  <View
                    style={[
                      styles.offerCountPill,
                      { backgroundColor: offerMeta.iconColor },
                    ]}
                  >
                    <Text style={styles.offerCountPillText}>
                      {item.offer_count}
                    </Text>
                  </View>
                )}
              </View>
            );
          })()}

        {/* Date Row */}
        <View style={styles.dateRow}>
          <Clock size={12} color="#9CA3AF" />
          <Text style={styles.dateText}>
            {content[language].posted}: {formatDate(item.created_at)}
          </Text>
          {wasUpdated(item.created_at, item.updated_at) && (
            <Text style={styles.dateTextUpdated}>
              · {content[language].updated}: {formatDate(item.updated_at!)}
            </Text>
          )}
        </View>

        {/* Accepted Offer Banner — only for the buyer whose offer was accepted */}
        {item.status === "sold" && hasUserOffer && (
          <View style={styles.acceptedOfferBanner}>
            <CheckCircle size={16} color="#065F46" />
            <Text style={styles.acceptedOfferBannerText}>
              {language === "si"
                ? "ඔබගේ ඉදිරිපත්කරණය පිළිගෙන ඇත"
                : language === "ta"
                  ? "உங்கள் சலிவு விலை ஏற்கப்பட்டது"
                  : "Your offer was accepted"}
            </Text>
          </View>
        )}

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

          {/* Offer CTA Button — hidden for scheduled posts and post's own farmer */}
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
                  {hasUserOffer
                    ? language === "si"
                      ? "ඉදිරිපත්කරණ බලන්න"
                      : language === "ta"
                        ? "சலிவு விலை காண்க"
                        : "View Offer"
                    : language === "si"
                      ? "ඉදිරිපත්කරණ ඉදිරිපත් කරන්න"
                      : language === "ta"
                        ? "சலிவு விலை இடுக"
                        : "Make Offer"}
                </Text>
              </TouchableOpacity>
            )}

          {/* Sold Status */}
          {item.status === "sold" && (
            <View style={styles.soldBadge}>
              <Text style={styles.soldBadgeText}>
                {language === "si"
                  ? "විකිණු"
                  : language === "ta"
                    ? "விற்பனை"
                    : "Sold"}
              </Text>
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
          onPress={() => navigation.navigate("PriceForecastLoadingScreen")}
          style={styles.backButton}
        >
          <ArrowLeft color="#047857" size={24} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{content[language].title}</Text>
          <Text style={styles.headerSubtitle}>
            {activeCount}{" "}
            {language === "si"
              ? "ක්‍රියාකාරී"
              : language === "ta"
                ? "சுறுசீரானது"
                : "active"}
            {posts.length - activeCount > 0
              ? ` · ${posts.length - activeCount} ${language === "si" ? "විකිණී" : language === "ta" ? "விற்பனை" : "sold"}`
              : ""}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.notifButton}
          onPress={() => rootNavigation.navigate("Notifications")}
        >
          <Bell color="#047857" size={22} />
          {unreadCount > 0 && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Filter Pills */}
      <View style={styles.filterContainer}>
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterPill,
              postScope === "all" && styles.filterPillActive,
            ]}
            onPress={() => setPostScope("all")}
          >
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[
                styles.filterPillText,
                postScope === "all" && styles.filterPillTextActive,
              ]}
            >
              {content[language].allPosts}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterPill,
              postScope === "mine" && styles.filterPillActive,
            ]}
            onPress={() => setPostScope("mine")}
          >
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[
                styles.filterPillText,
                postScope === "mine" && styles.filterPillTextActive,
              ]}
            >
              {content[language].myPosts}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterPill,
              statusFilter === "not_sold" && styles.filterPillActive,
            ]}
            onPress={() => setStatusFilter("not_sold")}
          >
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[
                styles.filterPillText,
                statusFilter === "not_sold" && styles.filterPillTextActive,
              ]}
            >
              {language === "si"
                ? "නොවිකිණු"
                : language === "ta"
                  ? "விற்பனை ஆகாதது"
                  : "Not Sold"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterPill,
              statusFilter === "sold" && styles.filterPillActive,
            ]}
            onPress={() => setStatusFilter("sold")}
          >
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[
                styles.filterPillText,
                statusFilter === "sold" && styles.filterPillTextActive,
              ]}
            >
              {language === "si"
                ? "විකිණු"
                : language === "ta"
                  ? "விற்பனையானது"
                  : "Sold"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterPill,
              statusFilter === "archived" && styles.filterPillActive,
            ]}
            onPress={() => setStatusFilter("archived")}
          >
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[
                styles.filterPillText,
                statusFilter === "archived" && styles.filterPillTextActive,
              ]}
            >
              {language === "en" ? "Archived" : content[language].scheduled}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterPill,
              showMyOffersOnly && styles.filterPillActive,
            ]}
            onPress={() => setShowMyOffersOnly(!showMyOffersOnly)}
          >
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[
                styles.filterPillText,
                showMyOffersOnly && styles.filterPillTextActive,
              ]}
            >
              {content[language].myOffers}
            </Text>
          </TouchableOpacity>
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

      {/* NEW: Quick Offer Modal */}
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
                          : language === "ta"
                            ? "கேட்ட விலையை விட அதிகம்"
                            : "Higher than asking"
                        : language === "si"
                          ? "වත්මන් මිලට වඩා අඩු"
                          : language === "ta"
                            ? "கேட்ட விலையை விட குறைவு"
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
  notifButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginLeft: 8,
  },
  notifBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#EF4444",
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#ECFDF5",
  },
  notifBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
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
  dateRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 5,
    paddingTop: 2,
  },
  dateText: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  dateTextUpdated: {
    fontSize: 10,
    color: "#6B7280",
    fontStyle: "italic" as const,
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
  acceptedOfferBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  acceptedOfferBannerText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#065F46",
    flexShrink: 1,
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
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap",
  },
  filterContainer: {
    backgroundColor: "#F0FDF4",
    paddingBottom: 4,
  },
  filterPill: {
    height: 40,
    minWidth: 98,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
  },
  filterPillActive: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#6B7280",
  },
  filterPillTextActive: {
    color: "#FFFFFF",
  },
  offerCountStrip: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 8,
  },
  offerCountLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 7,
    flex: 1,
  },
  offerIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  offerCountLabel: {
    fontSize: 11,
    fontWeight: "600" as const,
    flexShrink: 1,
  },
  offerSideLabel: {
    fontSize: 10,
    fontWeight: "600" as const,
  },
  offerCountPill: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: 6,
  },
  offerCountPillText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800" as const,
  },
});

export default MarketPlaceScreen;
