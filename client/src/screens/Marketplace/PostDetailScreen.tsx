import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { PriceForecastStackParamList } from "../../navigation/PriceForecastStack";
import {
  ArrowLeft,
  DollarSign,
  Package,
  MapPin,
  Calendar,
  TrendingUp,
  MessageCircle,
  CheckCircle,
  XCircle,
  User,
  Clock,
  AlertCircle,
  Send,
  Phone,
} from "lucide-react-native";
import { useLanguage } from "../../context/LanguageContext";
import { useNotifications } from "../../context/NotificationContext";
import {
  getPost,
  createOffer,
  acceptOffer,
  rejectOffer,
  checkUserOffer,
  getBestOffer,
  getFarmerContact,
  type PostWithOffers,
  type Offer,
} from "../../services/postService";
import { supabase } from "../../lib/supabase";

type NavProp = StackNavigationProp<
  PriceForecastStackParamList,
  "PostDetailScreen"
>;

interface RouteParams {
  postId: string;
}

const PostDetailScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute();
  const { language: globalLang } = useLanguage();
  const language = globalLang === "sinhala" ? "si" : "en";
  const { sendNotification } = useNotifications();

  const { postId } = route.params as RouteParams;

  const [post, setPost] = useState<PostWithOffers | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isFarmer, setIsFarmer] = useState(false);

  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState("");
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);
  const [userOffer, setUserOffer] = useState<Offer | null>(null);

  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedOfferForAccept, setSelectedOfferForAccept] =
    useState<Offer | null>(null);
  const [isAcceptingOffer, setIsAcceptingOffer] = useState(false);

  // Phone number for accepted buyer — populated via secure RPC only
  const [farmerPhone, setFarmerPhone] = useState<string | null>(null);

  const content = {
    si: {
      title: "අස්වනු විස්තර",
      seedVariety: "බීජ ප්‍රභේදය",
      farmer: "ගොවිසරු",
      price: "මිල",
      perKg: "කි.ග්‍රෑම් එකකට",
      quantity: "ප්‍රමාණය",
      totalValue: "මුළු අගය",
      district: "දිස්ත්‍රිකිය",
      week: "සතිය",
      season: "කන්න",
      postedOn: "ප්‍රකාශනය කරන ලදි",
      status: "තත්ත්වය",
      active: "ක්‍රියාකාරී",
      sold: "විකිණුණු",
      offers: "ඉදිරිපත්කරණ",
      noOffers: "ඉදිරිපත්කරණ නොමැත",
      makeOffer: "ඉදිරිපත්කරණ",
      offerPrice: "ඉදිරිපත් මිල",
      enterPrice: "මිල ඇතුලු කරන්න",
      submit: "ඉදිරිපත් කරන්න",
      cancel: "අවලංගු කරන්න",
      yourOffer: "ඔබේ ඉදිරිපත්කරණ",
      bestOffer: "හොඳම ඉදිරිපත්කරණ",
      pending: "ඉතිරිවි",
      accepted: "පිළිගනු ලැබුවි",
      rejected: "ප්‍රතික්ෂේප කරන ලදි",
      accept: "පිළිගන්න",
      reject: "ප්‍රතික්ෂේප කරන්න",
      acceptConfirm:
        "මෙම ඉදිරිපත්කරණ පිළිගන්නේ ඔබ ඔබේ අස්වනු විකිණීමට සහමතු බව අර්ථ දක්වයි.",
      confirmAccept:
        "වෙනත් ඉතිරිවි ඉදිරිපත්කරණ ප්‍රතික්ෂේප කරනු ඇත. ඉදිරියට යන්න?",
      offerSubmitted: "ඉදිරිපත්කරණ සාර්ථකව ඉදිරිපත් කරන ලදි",
      offerAccepted: "ඉදිරිපත්කරණ පිළිගනු ලැබුවි",
      offerRejected: "ඉදිරිපත්කරණ ප්‍රතික්ෂේප කරන ලදි",
      buyerName: "ක්‍රෙතා නාමය",
      loading: "පූරණය වෙමින්...",
      error: "දෝෂයක් සිදු විය",
      invalidPrice: "කරුණාකර වලංගු මිල ඇතුලු කරන්න",
      alreadyOffered: "ඔබ ඉදිරිපත්කරණ ඉදිරිපත් කර ඇත",
      contactFarmer: "ගොවිසරුවා සම්ගන්න",
      callNow: "එකා කරන්න",
      dealConfirmed:
        "ඔබේ ඉදිරිපත්කරණ පිළිගන්නු ලේබී! ගෙනුදූම ව්‍යවහාරය සමග ගොවිසරුවා කතා කරන්න.",
    },
    en: {
      title: "Post Details",
      seedVariety: "Seed Variety",
      farmer: "Farmer",
      price: "Price",
      perKg: "per kg",
      quantity: "Quantity",
      totalValue: "Total Value",
      district: "District",
      week: "Week",
      season: "Season",
      postedOn: "Posted On",
      status: "Status",
      active: "Active",
      sold: "Sold",
      offers: "Offers",
      noOffers: "No offers yet",
      makeOffer: "Make an Offer",
      offerPrice: "Offer Price",
      enterPrice: "Enter your price",
      submit: "Submit Offer",
      cancel: "Cancel",
      yourOffer: "Your Offer",
      bestOffer: "Best Offer",
      pending: "Pending",
      accepted: "Accepted",
      rejected: "Rejected",
      accept: "Accept",
      reject: "Reject",
      acceptConfirm:
        "Accepting this offer means you agree to sell your harvest at this price.",
      confirmAccept: "Other pending offers will be rejected. Continue?",
      offerSubmitted: "Offer submitted successfully",
      offerAccepted: "Offer accepted successfully",
      offerRejected: "Offer rejected",
      buyerName: "Buyer Name",
      loading: "Loading...",
      error: "An error occurred",
      invalidPrice: "Please enter a valid price",
      alreadyOffered: "You have already made an offer for this post",
      contactFarmer: "Contact Farmer",
      callNow: "Call Now",
      dealConfirmed:
        "Your offer was accepted! Contact the farmer to arrange" +
        " the transaction.",
    },
  };

  // Load post with offers
  const loadPost = async () => {
    try {
      setIsLoading(true);
      const postData = await getPost(postId);
      setPost(postData);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setCurrentUserId(user.id);
        const isPostFarmer = user.id === postData.farmer_id;
        setIsFarmer(isPostFarmer);

        // Check user's offer
        const userOfferData = postData.offers.find(
          (o) => o.buyer_id === user.id,
        );
        setUserOffer(userOfferData || null);

        // Fetch farmer phone via secure RPC — returns null unless this
        // user has an accepted offer. Farmers see their own phone in
        // their profile; no need to show it here for them.
        if (!isPostFarmer) {
          const phone = await getFarmerContact(postId);
          setFarmerPhone(phone);
        }
      }
    } catch (error) {
      console.error("Load post error:", error);
      Alert.alert(language === "si" ? "දෝෂයක්" : "Error", String(error));
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPost();
    }, [postId, language]),
  );

  // Create offer
  const handleMakeOffer = async () => {
    try {
      const price = parseFloat(offerPrice);

      if (!offerPrice || !Number.isFinite(price) || price <= 0) {
        Alert.alert(
          language === "si" ? "දෝෂයක්" : "Error",
          language === "si"
            ? "කරුණාකර වලංගු මිල ඇතුලු කරන්න"
            : "Please enter a valid price",
        );
        return;
      }

      if (userOffer) {
        Alert.alert(
          language === "si" ? "දෝෂයක්" : "Error",
          language === "si"
            ? "ඔබ පෙර ඉදිරිපත්කරණ ඉදිරිපත් කර ඇත"
            : "You have already submitted an offer",
        );
        return;
      }

      setIsSubmittingOffer(true);

      const newOffer = await createOffer(postId, price);
      setUserOffer(newOffer);
      setShowOfferModal(false);
      setOfferPrice("");

      await sendNotification(
        language === "si" ? "ඉදිරිපත්කරණ සාර්ථක" : "Offer Submitted",
        `Rs ${price.toFixed(2)}/kg`,
        "offer",
      );

      await loadPost();
    } catch (error) {
      console.error("Offer error:", error);
      Alert.alert(language === "si" ? "දෝෂයක්" : "Error", String(error));
    } finally {
      setIsSubmittingOffer(false);
    }
  };

  // Accept offer
  const handleAcceptOffer = async (offer: Offer) => {
    try {
      setIsAcceptingOffer(true);

      await acceptOffer(offer.id);

      await sendNotification(
        language === "si" ? "ඉදිරිපත්කරණ පිළිගනු ලැබුවි" : "Offer Accepted",
        `Rs ${offer.offer_price_per_kg.toFixed(2)}/kg`,
        "offer",
      );

      setShowAcceptModal(false);
      setSelectedOfferForAccept(null);
      await loadPost();
    } catch (error) {
      console.error("Accept error:", error);
      Alert.alert(language === "si" ? "දෝෂයක්" : "Error", String(error));
    } finally {
      setIsAcceptingOffer(false);
    }
  };

  // Reject offer
  const handleRejectOffer = async (offerId: string) => {
    try {
      await rejectOffer(offerId);

      Alert.alert(
        language === "si"
          ? "ඉදිරිපත්කරණ ප්‍රතික්ෂේප කරන ලදි"
          : "Offer Rejected",
      );

      await loadPost();
    } catch (error) {
      console.error("Reject error:", error);
      Alert.alert(language === "si" ? "දෝෂයක්" : "Error", String(error));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString(
      language === "si" ? "si-LK" : "en-US",
      options,
    );
  };

  const getBestOffer = (offers: Offer[]) => {
    if (!offers || offers.length === 0) return null;
    return offers.reduce((best, current) =>
      current.offer_price_per_kg > best.offer_price_per_kg ? current : best,
    );
  };

  const bestOffer = post ? getBestOffer(post.offers) : null;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft color="#047857" size={24} />
          </TouchableOpacity>
        </View>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loaderText}>{content[language].loading}</Text>
        </View>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft color="#047857" size={24} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color="#EF4444" />
          <Text style={styles.errorText}>{content[language].error}</Text>
        </View>
      </View>
    );
  }

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
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Post Card */}
        <View style={styles.postCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.seedVariety}>{post.seed_variety}</Text>
              <View style={styles.farmerRow}>
                <User size={14} color="#6B7280" />
                <Text style={styles.farmer}>{post.farmer_name}</Text>
              </View>
            </View>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    post.status === "sold" ? "#FEE2E2" : "#ECFDF5",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: post.status === "sold" ? "#DC2626" : "#10B981" },
                ]}
              >
                {post.status === "sold"
                  ? content[language].sold
                  : content[language].active}
              </Text>
            </View>
          </View>

          {/* Price Highlight */}
          <View style={styles.priceHighlight}>
            <DollarSign size={24} color="#10B981" />
            <View style={styles.priceTextContainer}>
              <Text style={styles.priceValue}>
                Rs {post.price_per_kg.toFixed(2)}
              </Text>
              <Text style={styles.priceUnit}>{content[language].perKg}</Text>
            </View>
          </View>

          {/* Details Grid */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Package size={18} color="#3B82F6" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>
                  {content[language].quantity}
                </Text>
                <Text style={styles.detailValue}>
                  {post.quantity_kg.toFixed(0)} kg
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <TrendingUp size={18} color="#10B981" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>
                  {content[language].totalValue}
                </Text>
                <Text style={styles.detailValue}>
                  Rs {(post.quantity_kg * post.price_per_kg).toFixed(0)}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <MapPin size={18} color="#F59E0B" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>
                  {content[language].district}
                </Text>
                <Text style={styles.detailValue}>{post.district}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Calendar size={18} color="#8B5CF6" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{content[language].week}</Text>
                <Text style={styles.detailValue}>W{post.week}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.seasonCircle}>
                <Text style={styles.seasonText}>
                  {post.season.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>
                  {content[language].season}
                </Text>
                <Text style={styles.detailValue}>{post.season}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Clock size={18} color="#6B7280" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>
                  {content[language].postedOn}
                </Text>
                <Text style={styles.detailValue}>
                  {formatDate(post.created_at)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Offers Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MessageCircle size={20} color="#065F46" />
            <Text style={styles.sectionTitle}>
              Offers ({post?.offers?.length || 0})
            </Text>
          </View>

          {/* User's own offer */}
          {!isFarmer && userOffer && (
            <View style={[styles.offerCard, styles.userOfferCard]}>
              <Text style={styles.offerLabel}>Your Offer</Text>
              <Text style={styles.offerPrice}>
                Rs {userOffer.offer_price_per_kg.toFixed(2)}
              </Text>
              <View
                style={[
                  styles.offerStatusBadge,
                  {
                    backgroundColor:
                      userOffer.status === "accepted"
                        ? "#D1FAE5"
                        : userOffer.status === "rejected"
                          ? "#FEE2E2"
                          : "#FEF3C7",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.offerStatusText,
                    {
                      color:
                        userOffer.status === "accepted"
                          ? "#047857"
                          : userOffer.status === "rejected"
                            ? "#991B1B"
                            : "#92400E",
                    },
                  ]}
                >
                  {userOffer.status.charAt(0).toUpperCase() +
                    userOffer.status.slice(1)}
                </Text>
              </View>
            </View>
          )}

          {/* ——— FARMER CONTACT CARD ———
               Visible ONLY when the RPC confirms this buyer's offer
               is accepted. farmerPhone is null for everyone else. */}
          {!isFarmer && farmerPhone && (
            <View style={styles.contactCard}>
              <View style={styles.contactCardHeader}>
                <CheckCircle size={18} color="#10B981" />
                <Text style={styles.contactCardTitle}>
                  {content[language].dealConfirmed}
                </Text>
              </View>
              <View style={styles.contactRow}>
                <Phone size={16} color="#047857" />
                <Text style={styles.contactPhone}>{farmerPhone}</Text>
              </View>
              <TouchableOpacity
                style={styles.callButton}
                onPress={() => Linking.openURL(`tel:${farmerPhone}`)}
              >
                <Phone size={16} color="#FFFFFF" />
                <Text style={styles.callButtonText}>
                  {content[language].callNow}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Best offer banner */}
          {bestOffer && bestOffer.status === "pending" && (
            <View style={styles.bestOfferBanner}>
              <TrendingUp size={16} color="#10B981" />
              <View>
                <Text style={styles.bestOfferTitle}>Best Offer</Text>
                <Text style={styles.bestOfferPrice}>
                  Rs {bestOffer.offer_price_per_kg.toFixed(2)}
                </Text>
              </View>
            </View>
          )}

          {/* All offers (farmer view) */}
          {isFarmer && post?.offers && post.offers.length > 0 ? (
            <View style={styles.offersList}>
              {post.offers.map((offer) => (
                <View key={offer.id} style={styles.offerCard}>
                  <Text style={styles.buyerName}>{offer.buyer_name}</Text>
                  <Text style={styles.offerPrice}>
                    Rs {offer.offer_price_per_kg.toFixed(2)}
                  </Text>

                  <View style={styles.offerActions}>
                    {offer.status === "pending" && (
                      <>
                        <TouchableOpacity
                          style={[
                            styles.rejectButton,
                            post.status === "sold" && { opacity: 0.4 },
                          ]}
                          onPress={() => handleRejectOffer(offer.id)}
                          disabled={post.status === "sold"}
                        >
                          <Text style={styles.rejectButtonText}>Reject</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.acceptButton,
                            post.status === "sold" && { opacity: 0.4 },
                          ]}
                          onPress={() => {
                            setSelectedOfferForAccept(offer);
                            setShowAcceptModal(true);
                          }}
                          disabled={post.status === "sold"}
                        >
                          <Text style={styles.acceptButtonText}>Accept</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ) : !isFarmer ? null : (
            <Text style={styles.noOffersText}>No offers yet</Text>
          )}
        </View>
      </ScrollView>

      {/* Make offer button */}
      {!isFarmer && post?.status === "active" && !userOffer && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.makeOfferButton}
            onPress={() => setShowOfferModal(true)}
          >
            <Send size={20} color="#FFF" />
            <Text style={styles.makeOfferButtonText}>Make an Offer</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Make Offer Modal */}
      <Modal
        visible={showOfferModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOfferModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {content[language].makeOffer}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowOfferModal(false)}
                  style={styles.closeButton}
                >
                  <XCircle size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.currentPriceBox}>
                  <Text style={styles.currentPriceLabel}>
                    {language === "si" ? "වත්මන් මිල" : "Current Price"}
                  </Text>
                  <Text style={styles.currentPriceValue}>
                    Rs {post.price_per_kg.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {content[language].offerPrice}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder={content[language].enterPrice}
                    placeholderTextColor="#9CA3AF"
                    value={offerPrice}
                    onChangeText={setOfferPrice}
                    keyboardType="decimal-pad"
                    editable={!isSubmittingOffer}
                  />
                </View>

                {offerPrice && parseFloat(offerPrice) > 0 && (
                  <View style={styles.priceComparison}>
                    <Text style={styles.comparisonText}>
                      {parseFloat(offerPrice) > post.price_per_kg
                        ? language === "si"
                          ? "වත්මන් මිලට වඩා ඉහළ"
                          : "Higher than current price"
                        : language === "si"
                          ? "වත්මන් මිලට වඩා අඩු"
                          : "Lower than current price"}
                    </Text>
                    <Text style={styles.comparisonValue}>
                      {Math.abs(
                        parseFloat(offerPrice) - post.price_per_kg,
                      ).toFixed(2)}{" "}
                      Rs
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowOfferModal(false)}
                  disabled={isSubmittingOffer}
                >
                  <Text style={styles.modalCancelButtonText}>
                    {content[language].cancel}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalSubmitButton}
                  onPress={handleMakeOffer}
                  disabled={isSubmittingOffer}
                >
                  {isSubmittingOffer ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Send size={16} color="#FFFFFF" />
                      <Text style={styles.modalSubmitButtonText}>
                        {content[language].submit}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Accept Offer Confirmation Modal */}
      <Modal
        visible={showAcceptModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAcceptModal(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmContent}>
            <CheckCircle size={48} color="#10B981" />

            <Text style={styles.confirmTitle}>
              {content[language].acceptConfirm}
            </Text>

            <View style={styles.confirmDetails}>
              <Text style={styles.confirmLabel}>
                {content[language].offerPrice}
              </Text>
              <Text style={styles.confirmPrice}>
                Rs {selectedOfferForAccept?.offer_price_per_kg.toFixed(2)}
              </Text>
            </View>

            <View style={styles.confirmDetails}>
              <Text style={styles.confirmLabel}>
                {content[language].buyerName}
              </Text>
              <Text style={styles.confirmValue}>
                {selectedOfferForAccept?.buyer_name}
              </Text>
            </View>

            <Text style={styles.confirmWarning}>
              {content[language].confirmAccept}
            </Text>

            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.confirmCancelButton}
                onPress={() => setShowAcceptModal(false)}
                disabled={isAcceptingOffer}
              >
                <Text style={styles.confirmCancelButtonText}>
                  {content[language].cancel}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmAcceptButton}
                onPress={() =>
                  selectedOfferForAccept &&
                  handleAcceptOffer(selectedOfferForAccept)
                }
                disabled={isAcceptingOffer}
              >
                {isAcceptingOffer ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.confirmAcceptButtonText}>
                    {content[language].accept}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  postCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#D1FAE5",
    gap: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  seedVariety: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#065F46",
  },
  farmerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  farmer: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  priceHighlight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#ECFDF5",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#10B981",
  },
  priceTextContainer: {
    flex: 1,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#10B981",
  },
  priceUnit: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  detailsGrid: {
    gap: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#D1FAE5",
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#065F46",
    marginTop: 2,
  },
  seasonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
  },
  seasonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#92400E",
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#065F46",
  },
  bestOfferBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#D1FAE5",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  bestOfferContent: {
    flex: 1,
  },
  bestOfferTitle: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  bestOfferPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#047857",
    marginTop: 2,
  },
  offersList: {
    gap: 12,
  },
  offerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 8,
  },
  userOfferCard: {
    backgroundColor: "#F0FDF4",
    borderColor: "#D1FAE5",
    marginBottom: 12,
  },
  acceptedOfferCard: {
    backgroundColor: "#ECFDF5",
    borderColor: "#10B981",
  },
  offerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  offerLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  buyerName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#065F46",
  },
  offerTime: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
  },
  offerStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  offerStatusText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  offerPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#10B981",
    marginBottom: 8,
  },
  offerActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: "#10B981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  acceptButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  rejectButton: {
    flex: 1,
    backgroundColor: "#EF4444",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  rejectButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyOffersBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  emptyOffersText: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  // Farmer contact card — only rendered for the accepted buyer
  contactCard: {
    backgroundColor: "#ECFDF5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#6EE7B7",
    padding: 16,
    marginBottom: 12,
    gap: 10,
  },
  contactCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  contactCardTitle: {
    flex: 1,
    fontSize: 13,
    color: "#065F46",
    fontWeight: "600",
    lineHeight: 18,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#D1FAE5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  contactPhone: {
    fontSize: 16,
    fontWeight: "700",
    color: "#047857",
    letterSpacing: 0.5,
  },
  callButton: {
    backgroundColor: "#10B981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  callButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  footer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  makeOfferButton: {
    backgroundColor: "#0EA5E9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  makeOfferButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#065F46",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    paddingVertical: 16,
    gap: 16,
  },
  currentPriceBox: {
    backgroundColor: "#F0FDF4",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  currentPriceLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  currentPriceValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#047857",
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#047857",
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1FAE5",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#1F2937",
  },
  priceComparison: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  comparisonText: {
    fontSize: 12,
    color: "#92400E",
    fontWeight: "500",
  },
  comparisonValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#92400E",
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1FAE5",
    alignItems: "center",
  },
  modalCancelButtonText: {
    color: "#047857",
    fontSize: 14,
    fontWeight: "bold",
  },
  modalSubmitButton: {
    flex: 1,
    backgroundColor: "#10B981",
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  modalSubmitButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  // Confirmation Modal Styles
  confirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  confirmContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 16,
  },
  confirmTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#065F46",
    textAlign: "center",
    lineHeight: 24,
  },
  confirmDetails: {
    width: "100%",
    backgroundColor: "#F0FDF4",
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  confirmLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  confirmValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#065F46",
  },
  confirmPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#10B981",
  },
  confirmWarning: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    fontStyle: "italic",
  },
  confirmActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  confirmCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1FAE5",
    alignItems: "center",
  },
  confirmCancelButtonText: {
    color: "#047857",
    fontSize: 14,
    fontWeight: "bold",
  },
  confirmAcceptButton: {
    flex: 1,
    backgroundColor: "#10B981",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmAcceptButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    fontWeight: "600",
  },
  noOffersText: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "500",
    textAlign: "center",
    marginTop: 8,
  },
});

export default PostDetailScreen;
