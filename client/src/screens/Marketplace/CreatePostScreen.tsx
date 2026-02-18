import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type {
  PriceForecastStackParamList,
  PostDraft,
  ForecastData,
} from "../../navigation/PriceForecastStack";
import { ArrowLeft, Package, Info } from "lucide-react-native";
import { useLanguage } from "../../context/LanguageContext";

type NavProp = StackNavigationProp<
  PriceForecastStackParamList,
  "CreatePostScreen"
>;

interface RouteParams {
  bestPrice: number;
  formData: ForecastData;
}

const CreatePostScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute();
  const { language: globalLang } = useLanguage();
  const language = globalLang === "sinhala" ? "si" : "en";

  const { bestPrice, formData } = route.params as RouteParams;

  /* =====================================================
     STATE
  ===================================================== */
  const [quantity, setQuantity] = useState<string>(
    (formData?.expectedYield * formData?.farmArea || "").toString()
  );
  const [price, setPrice] = useState<string>(bestPrice.toFixed(2));
  const [seedVariety, setSeedVariety] = useState<string>(
    formData?.seedVariety || ""
  );

  // 🔮 Future feature: schedule post
  const [publishAt] = useState<Date | null>(null);

  /* =====================================================
     COPY
  ===================================================== */
  const content = {
    si: {
      title: "අස්වනු විකිණීම",
      subtitle: "විකුණුම් විස්තර ඇතුලත් කරන්න",
      quantity: "ප්‍රමාණය (කි.ග්‍රෑ)",
      seedVariety: "බීජ ප්‍රභේදය",
      pricePerKg: "කිලෝවකට මිල (රු.)",
      priceHint: "මෙම මිල AI පද්ධතිය මගින් යෝජනා කර ඇත",
      district: "දිස්ත්‍රික්කය",
      next: "ඊළඟ",
      cancel: "අවලංගු කරන්න",
      errors: {
        fillAll: "කරුණාකර සියලු ක්ෂේත්‍ර පුරවන්න",
        qtyInvalid: "ප්‍රමාණය 0ට වැඩි විය යුතුය",
        priceInvalid: "මිල 0ට වැඩි විය යුතුය",
      },
    },
    en: {
      title: "Post Harvest",
      subtitle: "Enter selling details",
      quantity: "Quantity (kg)",
      seedVariety: "Seed variety",
      pricePerKg: "Price per kg (LKR)",
      priceHint: "Price is auto-suggested by AI forecast",
      district: "District",
      next: "Next",
      cancel: "Cancel",
      errors: {
        fillAll: "Please fill all fields",
        qtyInvalid: "Quantity must be greater than 0",
        priceInvalid: "Price must be greater than 0",
      },
    },
  };

  /* =====================================================
     VALIDATION + NAV
  ===================================================== */
  const handleNext = () => {
    const qty = Number(quantity);
    const pr = Number(price);

    if (!quantity || !price || !seedVariety) {
      Alert.alert(content[language].errors.fillAll);
      return;
    }

    if (isNaN(qty) || qty <= 0) {
      Alert.alert(content[language].errors.qtyInvalid);
      return;
    }

    if (isNaN(pr) || pr <= 0) {
      Alert.alert(content[language].errors.priceInvalid);
      return;
    }

    const postDraft: PostDraft = {
      // Buyer-visible
      seedVariety,
      pricePerKg: pr,
      quantityKg: qty,
      district: formData?.district || "Anuradhapura",

      // 🔒 Internal metadata (not shown to buyers)
      forecastWeek: formData?.week,
      predictedPrice: bestPrice,
      season: formData?.season || "Maha",

      // 🗓 future-ready
      publishAt,
    };

    navigation.navigate("PostReviewScreen", { postDraft });
  };

  /* =====================================================
     UI
  ===================================================== */
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
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

      {/* Form */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formCard}>
          {/* Quantity */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{content[language].quantity}</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="decimal-pad"
              placeholder="0"
            />
          </View>

          {/* Seed variety */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{content[language].seedVariety}</Text>
            <TextInput
              style={styles.input}
              value={seedVariety}
              onChangeText={setSeedVariety}
              placeholder="JET-999"
            />
          </View>

          {/* Price */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{content[language].pricePerKg}</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />
            <View style={styles.hintRow}>
              <Info size={14} color="#6B7280" />
              <Text style={styles.hintText}>
                {content[language].priceHint}
              </Text>
            </View>
          </View>

          {/* District (read-only) */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{content[language].district}</Text>
            <View style={styles.readOnlyInput}>
              <Text style={styles.readOnlyText}>
                {formData?.district || "Anuradhapura"}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryButtonText}>
            {content[language].cancel}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
          <Package size={18} color="#FFF" />
          <Text style={styles.primaryButtonText}>
            {content[language].next}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

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
    alignItems: "center",
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

  formCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    gap: 18,
  },

  formGroup: { gap: 6 },
  label: { fontSize: 14, fontWeight: "600", color: "#047857" },

  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1FAE5",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
  },

  readOnlyInput: {
    backgroundColor: "#ECFDF5",
    borderRadius: 10,
    padding: 12,
  },

  readOnlyText: { color: "#065F46", fontWeight: "600" },

  hintRow: { flexDirection: "row", gap: 6, alignItems: "center" },
  hintText: { fontSize: 11, color: "#6B7280" },

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

  secondaryButtonText: {
    color: "#047857",
    fontWeight: "600",
  },

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

export default CreatePostScreen;
