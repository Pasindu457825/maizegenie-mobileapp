import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type {
  PriceForecastStackParamList,
  PostDraft,
} from "../../navigation/PriceForecastStack";
import {
  ArrowLeft,
  Package,
  DollarSign,
  MapPin,
  AlertTriangle,
  Calendar,
  CheckCircle,
} from "lucide-react-native";
import { useLanguage } from "../../context/LanguageContext";
import { createPost } from "../../services/postService";
import CustomDatePicker from "../../components/CustomDatePicker";
import {
  useNotifications,
  NOTIFICATION_TYPE,
} from "../../context/NotificationContext";

type NavProp = StackNavigationProp<
  PriceForecastStackParamList,
  "PostReviewScreen"
>;

interface RouteParams {
  postDraft: PostDraft;
}

const PostReviewScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute();
  const { language: globalLang } = useLanguage();
  const language = globalLang === "sinhala" ? "si" : "en";
  const { sendNotification } = useNotifications();

  const [isLoading, setIsLoading] = useState(false);

  // 🗓 Scheduling
  const [publishMode, setPublishMode] = useState<"now" | "later">("now");
  const [publishAt, setPublishAt] = useState<Date | null>(null);

  const { postDraft } = route.params as RouteParams;

  const currency = language === "si" ? "රු." : "LKR";

  const content = {
    si: {
      title: "අවසන් සමාලෝචනය",
      subtitle: "ප්‍රකාශනයට පෙර අවසන් වරට පරීක්ෂා කරන්න",
      seedVariety: "බීජ ප්‍රභේදය",
      quantity: "ප්‍රමාණය",
      price: "කිලෝවකට මිල",
      totalValue: "මුළු අගය",
      district: "දිස්ත්‍රික්කය",
      warningTitle: "අවවාදයයි",
      warningText: "මෙය ප්‍රකාශනය කිරීමෙන් පසු පහසුවෙන් සංස්කරණය කළ නොහැක.",
      publishNow: "දැන් ප්‍රකාශනය කරන්න",
      schedule: "පසුවට සකසන්න",
      pickDate: "දිනය තෝරන්න",
      back: "ආපසු",
      publishing: "සම්පූර්ණ කරමින්...",
      successTitle: "සාර්ථකයි!",
      successMsg: "ඔබේ අස්වනු ප්‍රකාශනය සාර්ථකව සම්පූර්ණ විය",
      scheduledMsg: "ඔබේ අස්වනු ප්‍රකාශනය සාර්ථකව සකසන ලදි",
      error: "දෝෂයක් සිදු විය. නැවත උත්සාහ කරන්න.",
    },
    en: {
      title: "Final Review",
      subtitle: "Confirm details before publishing",
      seedVariety: "Seed variety",
      quantity: "Quantity",
      price: "Price per kg",
      totalValue: "Total value",
      district: "District",
      warningTitle: "Important",
      warningText: "Once published, this post cannot be easily edited.",
      publishNow: "Publish now",
      schedule: "Schedule later",
      pickDate: "Pick publish date",
      back: "Back",
      publishing: "Processing...",
      successTitle: "Success!",
      successMsg: "Your harvest has been published successfully",
      scheduledMsg: "Your harvest has been scheduled successfully",
      error: "Something went wrong. Please try again.",
    },
  };

  const totalValue = postDraft.quantityKg * postDraft.pricePerKg;

  /* =====================================================
     PUBLISH
  ===================================================== */
  const handlePublish = async () => {
    if (isLoading) return;

    if (publishMode === "later" && !publishAt) {
      Alert.alert(
        language === "si" ? "දිනයක් තෝරන්න" : "Please select a publish date",
      );
      return;
    }

    try {
      setIsLoading(true);

      await createPost({
        ...postDraft,
        publishAt: publishMode === "later" ? publishAt : null,
      });

      await sendNotification(
        content[language].successTitle,
        publishMode === "later"
          ? content[language].scheduledMsg
          : content[language].successMsg,
        NOTIFICATION_TYPE.MARKETPLACE,
      );

      navigation.reset({
        index: 0,
        routes: [{ name: "MarketPlaceScreen" }],
      });
    } catch (error) {
      console.error("Publish error:", error);
      Alert.alert(content[language].error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          disabled={isLoading}
        >
          <ArrowLeft color="#047857" size={22} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{content[language].title}</Text>
          <Text style={styles.headerSubtitle}>
            {content[language].subtitle}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.reviewCard}>
          {/* Summary */}
          <View style={styles.summaryBox}>
            <Text style={styles.seedText}>{postDraft.seedVariety}</Text>
            <Text style={styles.quantityText}>
              {postDraft.quantityKg.toFixed(0)} kg
            </Text>
          </View>

          {/* Details */}
          <View style={styles.detailsGrid}>
            <Detail
              icon={<DollarSign size={20} color="#10B981" />}
              label={content[language].price}
              value={`${currency} ${postDraft.pricePerKg.toFixed(2)}`}
            />
            <Detail
              icon={<Package size={20} color="#3B82F6" />}
              label={content[language].quantity}
              value={`${postDraft.quantityKg.toFixed(0)} kg`}
            />
            <Detail
              icon={<MapPin size={20} color="#F59E0B" />}
              label={content[language].district}
              value={postDraft.district}
            />
            <Detail
              icon={<CheckCircle size={20} color="#10B981" />}
              label={content[language].totalValue}
              value={`${currency} ${totalValue.toFixed(0)}`}
              highlight
            />
          </View>

          {/* Publish Mode */}
          <View style={styles.modeBox}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                publishMode === "now" && styles.modeActive,
              ]}
              onPress={() => setPublishMode("now")}
            >
              <Text style={styles.modeText}>
                {content[language].publishNow}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                publishMode === "later" && styles.modeActive,
              ]}
              onPress={() => {
                setPublishMode("later");
                if (!publishAt) {
                  setPublishAt(new Date(Date.now() + 86400000)); // +1 day default
                }
              }}
            >
              <Calendar size={16} color="#047857" />
              <Text style={styles.modeText}>{content[language].schedule}</Text>
            </TouchableOpacity>
          </View>

          {/* Schedule Date Picker */}
          {publishMode === "later" && (
            <CustomDatePicker
              label={content[language].pickDate}
              value={publishAt}
              onSelect={(date) => setPublishAt(date)}
              minimumDate={new Date(Date.now() + 86400000)}
              required
            />
          )}

          {/* Warning */}
          <View style={styles.warningBox}>
            <AlertTriangle size={20} color="#F59E0B" />
            <Text style={styles.warningText}>
              {content[language].warningText}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        >
          <Text style={styles.secondaryButtonText}>
            {content[language].back}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handlePublish}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Package size={18} color="#FFF" />
              <Text style={styles.primaryButtonText}>
                {publishMode === "later"
                  ? content[language].schedule
                  : content[language].publishNow}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

/* =====================================================
   SMALL COMPONENT
===================================================== */
const Detail = ({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <View style={[styles.detailItem, highlight && styles.detailItemHighlight]}>
    {icon}
    <Text style={styles.detailLabel}>{label}</Text>
    <Text
      style={[styles.detailValue, highlight && styles.detailValueHighlight]}
    >
      {value}
    </Text>
  </View>
);

/* =====================================================
   STYLES
===================================================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FDF4" },
  header: {
    backgroundColor: "#FFF",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: { marginLeft: 12 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1F2937" },
  headerSubtitle: { fontSize: 12, color: "#6B7280" },
  scrollContent: { padding: 20 },
  reviewCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    gap: 20,
  },
  summaryBox: {
    backgroundColor: "#ECFDF5",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#10B981",
  },
  seedText: { fontSize: 18, fontWeight: "700", color: "#047857" },
  quantityText: { fontSize: 26, fontWeight: "800", color: "#10B981" },
  detailsGrid: { gap: 12 },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 14,
  },
  detailItemHighlight: {
    backgroundColor: "#ECFDF5",
  },
  detailLabel: { flex: 1, fontSize: 12, color: "#6B7280" },
  detailValue: { fontSize: 16, fontWeight: "700", color: "#047857" },
  detailValueHighlight: {
    fontSize: 18,
    fontWeight: "800",
    color: "#10B981",
  },
  modeBox: { flexDirection: "row", gap: 10 },
  modeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1FAE5",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  modeActive: {
    backgroundColor: "#ECFDF5",
    borderColor: "#10B981",
  },
  modeText: { fontSize: 14, fontWeight: "600", color: "#047857" },
  scheduleBox: {
    backgroundColor: "#F0FDF4",
    padding: 12,
    borderRadius: 10,
  },
  scheduleText: { color: "#047857", fontWeight: "600" },
  warningBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#FFFBEB",
    padding: 14,
    borderRadius: 10,
  },
  warningText: { fontSize: 12, color: "#92400E", flex: 1 },
  footer: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1FAE5",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  secondaryButtonText: { color: "#047857", fontWeight: "600" },
  primaryButton: {
    flex: 1,
    backgroundColor: "#10B981",
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: { color: "#FFF", fontWeight: "700" },
});

export default PostReviewScreen;
