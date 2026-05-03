import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Edit2,
  Trash2,
  Save,
  Bell,
} from "lucide-react-native";
import { useLanguage } from "../../context/LanguageContext";
import {
  useNotifications,
  NOTIFICATION_TYPE,
} from "../../context/NotificationContext";
import {
  getPost,
  createOffer,
  acceptOffer,
  rejectOffer,
  checkUserOffer,
  getBestOffer,
  getFarmerContact,
  updateOffer,
  deleteOffer,
  updatePost,
  deletePost,
  type PostWithOffers,
  type Offer,
} from "../../services/postService";
import { supabase } from "../../lib/supabase";

type NavProp = StackNavigationProp<
  PriceForecastStackParamList,
  "PostDetailScreen"
>;

type RootNavProp = StackNavigationProp<Record<string, object | undefined>>;

interface RouteParams {
  postId: string;
}

const PostDetailScreen = () => {
  const navigation = useNavigation<NavProp>();
  const rootNavigation = useNavigation<RootNavProp>();
  const route = useRoute();
  const { language: globalLang } = useLanguage();
  const language =
    globalLang === "sinhala" ? "si" : globalLang === "tamil" ? "ta" : "en";
  const { sendNotification, unreadCount } = useNotifications();

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

  // ── Buyer: offer edit/delete state ─────────────────────────────
  const [showEditOfferModal, setShowEditOfferModal] = useState(false);
  const [editOfferPrice, setEditOfferPrice] = useState("");
  const [isEditingOffer, setIsEditingOffer] = useState(false);
  const [isDeletingOffer, setIsDeletingOffer] = useState(false);
  const [showDeleteOfferModal, setShowDeleteOfferModal] = useState(false);

  // ── Farmer: post deletion state ─────────────────────────────────
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [showDeletePostModal, setShowDeletePostModal] = useState(false);

  // Prevent useFocusEffect from reloading after a successful post deletion
  const postDeletedRef = useRef(false);

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
      season: "කන්නය",
      postedOn: "ප්‍රකාශනය කරන ලදි",
      status: "තත්ත්වය",
      active: "ක්‍රියාකාරී",
      sold: "විකිණු",
      scheduled: "සකස් කළ",
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
        "වෙනත් ඉතිරි ඉදිරිපත්කරණ ප්‍රතික්ෂේප කරනු ඇත. ඉදිරියට යන්න?",
      offerSubmitted: "ඉදිරිපත්කරණ සාර්ථකව ඉදිරිපත් කරන ලදි",
      offerAccepted: "ඉදිරිපත්කරණ පිළිගනු ලැබුවි",
      offerRejected: "ඉදිරිපත්කරණ ප්‍රතික්ෂේප කරන ලදි",
      buyerName: "ක්‍රෙතා නාමය",
      loading: "පූරණය වෙමින්...",
      error: "දෝෂයක් සිදු විය",
      invalidPrice: "කරුණාකර වලංගු මිල ඇතුලු කරන්න",
      alreadyOffered: "ඔබ ඉදිරිපත්කරණ ඉදිරිපත් කර ඇත",
      contactFarmer: "ගොවිසරුවා සම්ගන්න",
      callNow: "call කරන්න",
      dealConfirmed:
        "ඔබගේ ඉදිරිපත් කිරීම පිළිගෙන ඇත! වැඩිදුර විස්තර සඳහා ගොවි මහතා සමඟ කතා කරන්න.",
      editOffer: "ඉදිරිපත්කරණ සංස්කරණය",
      deleteOffer: "ඉදිරිපත්කරණ ඉවත් කරන්න",
      editOfferTitle: "ඔබේ ඉදිරිපත් මිල යාවත්කාලීන කරන්න",
      newOfferPrice: "නව ඉදිරිපත් මිල",
      updateOffer: "ඉදිරිපත්කරණ යාවත් කරන්න",
      deleteOfferConfirm:
        "ඔබේ ඉදිරිපත්කරණ ඉවත් කිරීමට ඔබට විශ්වාසද? මෙය නැවත ලබාගත නොහැක.",
      deletePostConfirm:
        "ඔබේ ඉදිරිපත්කිරීම ඉවත් කිරීමට ඔබට විශ්වාසද? සියලු ඉදිරිපත්කරණ ද ඉවත් වේ.",
      editPost: "ඉදිරිපත්කිරීම සංස්කරණය",
      deletePost: "ඉදිරිපත්කිරීම ඉවත් කරන්න",
      cannotEdit: "ස්ථිත ඉදිරිපත්කරණ සංස්කරණය කළ නොහැකිය",
      offerUpdated: "ඉදිරිපත්කරණ යාවත්කාලීන කරන ලදී",
      offerDeleted: "ඉදිරිපත්කරණ ඉවත් කරන ලදී",
      postDeleted: "ඉදිරිපත්කිරීම ඉවත් කරන ලදී",
      confirm: "තහවුරු",
      errorTitle: "දෝෂයක්",
      successTitle: "සාර්ථකයි",
      doneTitle: "සාර්ථකයි",
      offerSubmittedTitle: "ඉදිරිපත්කරණ සාර්ථක",
      offerAcceptedTitle: "ඉදිරිපත්කරණ පිළිගනු ලැබුවි",
      currentPriceLabel: "වත්මන් මිල",
      yourCurrentOfferLabel: "වත්මන් ඔබේ මිල",
      newPricePlaceholder: "නව මිල ඇතුලු කරන්න",
      ownPostError: "ඔබගේම ඉදිරිපත්කිරීමකට ඉදිරිපත්කරණ ඉදිරිපත් කළ නොහැකිය",
      higherThanCurrentPrice: "වත්මන් මිලට වඩා ඉහළ",
      lowerThanCurrentPrice: "වත්මන් මිලට වඩා අඩු",
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
      scheduled: "Scheduled",
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
      editOffer: "Edit Offer",
      deleteOffer: "Delete Offer",
      editOfferTitle: "Update Your Offer Price",
      newOfferPrice: "New Offer Price",
      updateOffer: "Update Offer",
      deleteOfferConfirm:
        "Are you sure you want to delete your offer? This cannot be undone.",
      deletePostConfirm:
        "Are you sure you want to delete this post? All associated offers will also be removed.",
      editPost: "Edit Post",
      deletePost: "Delete Post",
      cannotEdit: "Accepted/rejected offers cannot be edited",
      offerUpdated: "Offer updated successfully",
      offerDeleted: "Offer deleted",
      postDeleted: "Post deleted successfully",
      confirm: "Confirm",
      errorTitle: "Error",
      successTitle: "Success",
      doneTitle: "Done",
      offerSubmittedTitle: "Offer Submitted",
      offerAcceptedTitle: "Offer Accepted",
      currentPriceLabel: "Current Price",
      yourCurrentOfferLabel: "Your Current Offer",
      newPricePlaceholder: "Enter new price",
      ownPostError: "You cannot place an offer on your own post",
      higherThanCurrentPrice: "Higher than current price",
      lowerThanCurrentPrice: "Lower than current price",
    },
    ta: {
      title: "பயிர் விவரங்கள்",
      seedVariety: "விதை வகை",
      farmer: "விவசாயி",
      price: "விலை",
      perKg: "ஒரு கிலோவிட்டுக்கு",
      quantity: "அளவு",
      totalValue: "மொத்த மதிப்பு",
      district: "மாவட்டம்",
      week: "வாரம்",
      season: "பருவம்",
      postedOn: "பதிவிட்டது",
      status: "நிலை",
      active: "செயல்பாட்டில்",
      sold: "விற்கப்பட்டது",
      scheduled: "திட்டமிடப்பட்டது",
      offers: "சலிவு விலைகள்",
      noOffers: "சலிவு விலை இல்லை",
      makeOffer: "சலிவு விலை இடுக",
      offerPrice: "சலிவு விலை",
      enterPrice: "உங்கள் விலையை உள்ளிடுக",
      submit: "சமர்ப்பிக்கவும்",
      cancel: "ரத்து செய்க",
      yourOffer: "உங்கள் சலிவு விலை",
      bestOffer: "சிறந்த சலிவு",
      pending: "நிலுவையில்",
      accepted: "ஏற்கப்பட்டது",
      rejected: "நிராகரிக்கப்பட்டது",
      accept: "ஏற்கவும்",
      reject: "நிராகரிக்கவும்",
      acceptConfirm:
        "இந்த சலிவை ஏற்றுக்கொள்வது உங்கள் அறுவடையை இந்த விலையில் விற்க ஒப்புக்கொள்கிறீர்கள் என்று அர்த்தம்.",
      confirmAccept: "மற்ற நிலுவை சலிவுகள் நிராகரிக்கப்படும். தொடரவும்?",
      offerSubmitted: "சலிவு வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது",
      offerAccepted: "சலிவு வெற்றிகரமாக ஏற்கப்பட்டது",
      offerRejected: "சலிவு நிராகரிக்கப்பட்டது",
      buyerName: "வாங்குபவர் பெயர்",
      loading: "ஏற்றுகிறது...",
      error: "பிழை ஏற்பட்டது",
      invalidPrice: "சரியான விலையை உள்ளிடுக",
      alreadyOffered: "நீங்கள் ஏற்கனவே சலிவு இட்டுவிட்டீர்கள்",
      contactFarmer: "விவசாயியைத் தொடர்புகொள்க",
      callNow: "இப்போது அழைக்கவும்",
      dealConfirmed:
        "உங்கள் சலிவு ஏற்கப்பட்டது! பரிவர்த்தனையை ஒழுங்கமைக்க விவசாயியை தொடர்புகொள்க.",
      editOffer: "சலிவு திருத்து",
      deleteOffer: "சலிவு நீக்கு",
      editOfferTitle: "உங்கள் சலிவு விலையை புதுப்பிக்கவும்",
      newOfferPrice: "புதிய சலிவு விலை",
      updateOffer: "சலிவு புதுப்பிக்கவும்",
      deleteOfferConfirm:
        "உங்கள் சலிவை நீக்க விரும்புகிறீர்களா? இதை மீண்டும் செய்ய முடியாது.",
      deletePostConfirm:
        "இந்த பதிவை நீக்க விரும்புகிறீர்களா? அனைத்து தொடர்புடைய சலிவுகளும் அகற்றப்படும்.",
      editPost: "பதிவு திருத்து",
      deletePost: "பதிவு நீக்கு",
      cannotEdit: "ஏற்கப்பட்ட/நிராகரிக்கப்பட்ட சலிவுகளை திருத்த முடியாது",
      offerUpdated: "சலிவு வெற்றிகரமாக புதுப்பிக்கப்பட்டது",
      offerDeleted: "சலிவு நீக்கப்பட்டது",
      postDeleted: "பதிவு வெற்றிகரமாக நீக்கப்பட்டது",
      confirm: "உறுதிப்படுத்தவும்",
      errorTitle: "பிழை",
      successTitle: "வெற்றி",
      doneTitle: "முடிந்தது",
      offerSubmittedTitle: "சலிவு சமர்ப்பிக்கப்பட்டது",
      offerAcceptedTitle: "சலிவு ஏற்கப்பட்டது",
      currentPriceLabel: "தற்போதைய விலை",
      yourCurrentOfferLabel: "உங்கள் தற்போதைய சலிவு",
      newPricePlaceholder: "புதிய விலையை உள்ளிடுக",
      ownPostError: "உங்கள் சொந்த பதிவில் சலிவு இட முடியாது",
      higherThanCurrentPrice: "தற்போதைய விலையை விட அதிகம்",
      lowerThanCurrentPrice: "தற்போதைய விலையை விட குறைவு",
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
      Alert.alert(content[language].errorTitle, String(error));
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Skip reload if this screen is still mounted after a successful deletion
      if (postDeletedRef.current) return;
      loadPost();
    }, [postId, language]),
  );

  // Create offer
  const handleMakeOffer = async () => {
    try {
      // Belt-and-suspenders: the button is already hidden for farmers via
      // !isFarmer, but guard here too in case state is stale.
      if (isFarmer || currentUserId === post?.farmer_id) {
        Alert.alert(
          content[language].errorTitle,
          content[language].ownPostError,
        );
        return;
      }

      const price = parseFloat(offerPrice);

      if (!offerPrice || !Number.isFinite(price) || price <= 0) {
        Alert.alert(
          content[language].errorTitle,
          content[language].invalidPrice,
        );
        return;
      }

      if (userOffer && userOffer.status !== "rejected") {
        Alert.alert(
          content[language].errorTitle,
          content[language].alreadyOffered,
        );
        return;
      }

      setIsSubmittingOffer(true);

      const newOffer = await createOffer(postId, price);
      setUserOffer(newOffer);
      setShowOfferModal(false);
      setOfferPrice("");

      await sendNotification(
        content[language].offerSubmittedTitle,
        `Rs ${price.toFixed(2)}/kg`,
        NOTIFICATION_TYPE.OFFER,
      );

      await loadPost();
    } catch (error) {
      console.error("Offer error:", error);
      Alert.alert(content[language].errorTitle, String(error));
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
        content[language].offerAcceptedTitle,
        `Rs ${offer.offer_price_per_kg.toFixed(2)}/kg`,
        NOTIFICATION_TYPE.OFFER,
      );

      setShowAcceptModal(false);
      setSelectedOfferForAccept(null);
      await loadPost();
    } catch (error) {
      console.error("Accept error:", error);
      Alert.alert(content[language].errorTitle, String(error));
    } finally {
      setIsAcceptingOffer(false);
    }
  };

  // ── Update offer (buyer, pending only) ─────────────────────────
  const handleEditOffer = async () => {
    const newPrice = parseFloat(editOfferPrice);
    if (!editOfferPrice || !Number.isFinite(newPrice) || newPrice <= 0) {
      Alert.alert(content[language].errorTitle, content[language].invalidPrice);
      return;
    }
    try {
      setIsEditingOffer(true);
      const updated = await updateOffer(userOffer!.id, newPrice);
      setUserOffer(updated);
      setShowEditOfferModal(false);
      setEditOfferPrice("");
      Alert.alert(
        content[language].successTitle,
        content[language].offerUpdated,
      );
      await loadPost();
    } catch (error) {
      console.error("[handleEditOffer]", error);
      Alert.alert(content[language].errorTitle, String(error));
    } finally {
      setIsEditingOffer(false);
    }
  };

  // ── Delete offer (buyer, pending only) ───────────────────────────
  const handleDeleteOffer = () => {
    console.log(
      "[handleDeleteOffer] button pressed, userOffer:",
      userOffer?.id,
      "status:",
      userOffer?.status,
    );
    if (!userOffer) {
      console.warn("[handleDeleteOffer] userOffer is null — aborting");
      return;
    }
    setShowDeleteOfferModal(true);
  };

  const confirmDeleteOffer = async () => {
    if (!userOffer) return;
    const offerIdToDelete = userOffer.id;
    console.log("[confirmDeleteOffer] deleting offer:", offerIdToDelete);
    try {
      setIsDeletingOffer(true);
      setShowDeleteOfferModal(false);
      await deleteOffer(offerIdToDelete);
      console.log("[confirmDeleteOffer] delete succeeded, clearing state");
      setUserOffer(null);
      await loadPost();
      setTimeout(() => {
        Alert.alert(
          content[language].doneTitle,
          content[language].offerDeleted,
        );
      }, 300);
    } catch (error) {
      console.error("[confirmDeleteOffer] FAILED:", error);
      setTimeout(() => {
        Alert.alert(content[language].errorTitle, String(error));
      }, 300);
    } finally {
      setIsDeletingOffer(false);
    }
  };

  // ── Edit post — navigate to EditPostScreen (farmer, active only) ─
  const handleEditPost = () => {
    if (!post) return;
    navigation.navigate("EditPostScreen", {
      postId: post.id,
      currentData: {
        seed_variety: post.seed_variety,
        price_per_kg: post.price_per_kg,
        quantity_kg: post.quantity_kg,
        district: post.district,
        week: post.week,
        season: post.season,
      },
    });
  };

  // ── Delete post (farmer, active only) ────────────────────────────
  const handleDeletePost = () => {
    if (!post) return;
    setShowDeletePostModal(true);
  };

  const confirmDeletePost = async () => {
    if (!post) return;
    const postIdToDelete = post.id;
    try {
      setIsDeletingPost(true);
      setShowDeletePostModal(false);
      await deletePost(postIdToDelete);

      // 1. Mark as deleted to block any useFocusEffect reload
      postDeletedRef.current = true;
      // 2. Clear stale post state so nothing stale renders during the transition
      setPost(null);
      setIsDeletingPost(false);
      // 3. Navigate back — MarketPlaceScreen's useFocusEffect will
      //    automatically reload its list when it regains focus.
      navigation.goBack();
    } catch (error) {
      console.error("[confirmDeletePost] FAILED:", error);
      setIsDeletingPost(false);
      setTimeout(() => {
        Alert.alert(content[language].errorTitle, String(error));
      }, 300);
    }
  };

  // Reject offer
  const handleRejectOffer = async (offerId: string) => {
    try {
      await rejectOffer(offerId);

      Alert.alert(content[language].offerRejected);

      await loadPost();
    } catch (error) {
      console.error("Reject error:", error);
      Alert.alert(content[language].errorTitle, String(error));
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
      language === "si" ? "si-LK" : language === "ta" ? "ta-LK" : "en-US",
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

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Post Card */}
        <View style={styles.postCard}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.seedVariety}>{post.seed_variety}</Text>
              <View style={styles.farmerRow}>
                <User size={14} color="#6B7280" />
                <Text style={styles.farmer}>{post.farmer_name}</Text>
              </View>
            </View>
            <View style={styles.cardHeaderRight}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      post.status === "sold"
                        ? "#FEE2E2"
                        : post.status === "scheduled"
                          ? "#FEF3C7"
                          : "#ECFDF5",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                        post.status === "sold"
                          ? "#DC2626"
                          : post.status === "scheduled"
                            ? "#92400E"
                            : "#10B981",
                    },
                  ]}
                >
                  {post.status === "sold"
                    ? content[language].sold
                    : post.status === "scheduled"
                      ? `🕐 ${content[language].scheduled}`
                      : content[language].active}
                </Text>
              </View>
            </View>
          </View>

          {/* Farmer edit / delete — active AND scheduled posts */}
          {isFarmer &&
            (post.status === "active" || post.status === "scheduled") && (
              <View style={styles.postManageRow}>
                <TouchableOpacity
                  style={styles.postEditButton}
                  onPress={handleEditPost}
                  disabled={isDeletingPost}
                >
                  <Edit2 size={13} color="#047857" />
                  <Text style={styles.postEditButtonText}>
                    {content[language].editPost}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.postDeleteButton}
                  onPress={handleDeletePost}
                  disabled={isDeletingPost}
                >
                  {isDeletingPost ? (
                    <ActivityIndicator size="small" color="#DC2626" />
                  ) : (
                    <>
                      <Trash2 size={13} color="#DC2626" />
                      <Text style={styles.postDeleteButtonText}>
                        {content[language].deletePost}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

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
              {content[language].offers} ({post?.offers?.length || 0})
            </Text>
          </View>

          {/* User's own offer — with Edit / Delete when pending */}
          {!isFarmer && userOffer && (
            <View style={[styles.offerCard, styles.userOfferCard]}>
              <View style={styles.offerCardTopRow}>
                <Text style={styles.offerLabel}>
                  {content[language].yourOffer}
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

              <Text style={styles.offerPrice}>
                Rs {userOffer.offer_price_per_kg.toFixed(2)}
              </Text>

              {/* Edit / Delete — only available while offer is pending */}
              {userOffer.status === "pending" && (
                <View style={styles.offerManageRow}>
                  <TouchableOpacity
                    style={styles.offerEditButton}
                    onPress={() => {
                      setEditOfferPrice(
                        userOffer.offer_price_per_kg.toFixed(2),
                      );
                      setShowEditOfferModal(true);
                    }}
                    disabled={isEditingOffer || isDeletingOffer}
                  >
                    <Edit2 size={14} color="#047857" />
                    <Text style={styles.offerEditButtonText}>
                      {content[language].editOffer}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.offerDeleteButton}
                    onPress={() => {
                      console.log(
                        "[DeleteButton] tap registered, isDeletingOffer:",
                        isDeletingOffer,
                        "isEditingOffer:",
                        isEditingOffer,
                      );
                      handleDeleteOffer();
                    }}
                    disabled={isDeletingOffer || isEditingOffer}
                  >
                    {isDeletingOffer ? (
                      <ActivityIndicator size="small" color="#DC2626" />
                    ) : (
                      <>
                        <Trash2 size={14} color="#DC2626" />
                        <Text style={styles.offerDeleteButtonText}>
                          {content[language].deleteOffer}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {userOffer.status !== "pending" && (
                <Text style={styles.offerLockedNote}>
                  {content[language].cannotEdit}
                </Text>
              )}
            </View>
          )}

          {/* ——— FARMER CONTACT CARD ———
               Visible ONLY when the RPC confirms this buyer's offer
               is accepted. farmerPhone is null for everyone else. */}
          {!isFarmer && farmerPhone != null && farmerPhone !== "" && (
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
                <Text style={styles.bestOfferTitle}>
                  {content[language].bestOffer}
                </Text>
                <Text style={styles.bestOfferPrice}>
                  Rs {bestOffer.offer_price_per_kg.toFixed(2)}
                </Text>
              </View>
            </View>
          )}

          {/* All offers (visible to both farmers and buyers) */}
          {post?.offers && post.offers.length > 0 ? (
            <View style={styles.offersList}>
              {post.offers.map((offer) => (
                <View key={offer.id} style={styles.offerCard}>
                  <View style={styles.offerCardTopRow}>
                    <Text style={styles.buyerName}>{offer.buyer_name}</Text>
                    <View
                      style={[
                        styles.offerStatusBadge,
                        {
                          backgroundColor:
                            offer.status === "accepted"
                              ? "#D1FAE5"
                              : offer.status === "rejected"
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
                              offer.status === "accepted"
                                ? "#047857"
                                : offer.status === "rejected"
                                  ? "#991B1B"
                                  : "#92400E",
                          },
                        ]}
                      >
                        {offer.status.charAt(0).toUpperCase() +
                          offer.status.slice(1)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.offerPrice}>
                    Rs {offer.offer_price_per_kg.toFixed(2)}
                  </Text>

                  <View style={styles.offerActions}>
                    {isFarmer && offer.status === "pending" && (
                      <>
                        <TouchableOpacity
                          style={[
                            styles.rejectButton,
                            post.status === "sold" && { opacity: 0.4 },
                          ]}
                          onPress={() => handleRejectOffer(offer.id)}
                          disabled={post.status === "sold"}
                        >
                          <Text style={styles.rejectButtonText}>
                            {content[language].reject}
                          </Text>
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
                          <Text style={styles.acceptButtonText}>
                            {content[language].accept}
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noOffersText}>
              {content[language].noOffers}
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Make offer button */}
      {!isFarmer &&
        post?.status === "active" &&
        (!userOffer || userOffer.status === "rejected") && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.makeOfferButton}
              onPress={() => setShowOfferModal(true)}
            >
              <Send size={20} color="#FFF" />
              <Text style={styles.makeOfferButtonText}>
                {content[language].makeOffer}
              </Text>
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
                    {content[language].currentPriceLabel}
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
                        ? content[language].higherThanCurrentPrice
                        : content[language].lowerThanCurrentPrice}
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

      {/* ── Edit Offer Modal (buyer, pending only) ─────────────── */}
      <Modal
        visible={showEditOfferModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditOfferModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {content[language].editOfferTitle}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowEditOfferModal(false)}
                  style={styles.closeButton}
                >
                  <XCircle size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.currentPriceBox}>
                  <Text style={styles.currentPriceLabel}>
                    {content[language].yourCurrentOfferLabel}
                  </Text>
                  <Text style={styles.currentPriceValue}>
                    Rs {userOffer?.offer_price_per_kg.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {content[language].newOfferPrice}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder={content[language].newPricePlaceholder}
                    placeholderTextColor="#9CA3AF"
                    value={editOfferPrice}
                    onChangeText={setEditOfferPrice}
                    keyboardType="decimal-pad"
                    editable={!isEditingOffer}
                  />
                </View>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowEditOfferModal(false)}
                  disabled={isEditingOffer}
                >
                  <Text style={styles.modalCancelButtonText}>
                    {content[language].cancel}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalSubmitButton}
                  onPress={handleEditOffer}
                  disabled={isEditingOffer}
                >
                  {isEditingOffer ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Save size={16} color="#FFFFFF" />
                      <Text style={styles.modalSubmitButtonText}>
                        {content[language].updateOffer}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Delete Offer Confirmation Modal (buyer, pending only) ── */}
      <Modal
        visible={showDeleteOfferModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteOfferModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: "#DC2626" }]}>
                  {content[language].deleteOffer}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowDeleteOfferModal(false)}
                  style={styles.closeButton}
                >
                  <XCircle size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <Text
                  style={{ fontSize: 15, color: "#374151", lineHeight: 22 }}
                >
                  {content[language].deleteOfferConfirm}
                </Text>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowDeleteOfferModal(false)}
                  disabled={isDeletingOffer}
                >
                  <Text style={styles.modalCancelButtonText}>
                    {content[language].cancel}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalSubmitButton,
                    { backgroundColor: "#DC2626" },
                  ]}
                  onPress={confirmDeleteOffer}
                  disabled={isDeletingOffer}
                >
                  {isDeletingOffer ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Trash2 size={16} color="#FFFFFF" />
                      <Text style={styles.modalSubmitButtonText}>
                        {content[language].deleteOffer}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Delete Post Confirmation Modal (farmer, active only) ─── */}
      <Modal
        visible={showDeletePostModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeletePostModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: "#DC2626" }]}>
                  {content[language].deletePost}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowDeletePostModal(false)}
                  style={styles.closeButton}
                >
                  <XCircle size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <Text
                  style={{ fontSize: 15, color: "#374151", lineHeight: 22 }}
                >
                  {content[language].deletePostConfirm}
                </Text>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowDeletePostModal(false)}
                  disabled={isDeletingPost}
                >
                  <Text style={styles.modalCancelButtonText}>
                    {content[language].cancel}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalSubmitButton,
                    { backgroundColor: "#DC2626" },
                  ]}
                  onPress={confirmDeletePost}
                  disabled={isDeletingPost}
                >
                  {isDeletingPost ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Trash2 size={16} color="#FFFFFF" />
                      <Text style={styles.modalSubmitButtonText}>
                        {content[language].deletePost}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
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
  cardHeaderRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  postManageRow: {
    flexDirection: "row",
    gap: 6,
  },
  postEditButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1FAE5",
    backgroundColor: "#F0FDF4",
  },
  postEditButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#047857",
  },
  postDeleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: "#FFF1F2",
  },
  postDeleteButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#DC2626",
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
  offerCardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  offerManageRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  offerEditButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1FAE5",
    backgroundColor: "#F0FDF4",
  },
  offerEditButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#047857",
    flexShrink: 1,
  },
  offerDeleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: "#FFF1F2",
  },
  offerDeleteButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#DC2626",
    flexShrink: 1,
  },
  offerLockedNote: {
    fontSize: 11,
    color: "#9CA3AF",
    fontStyle: "italic",
    marginTop: 6,
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
