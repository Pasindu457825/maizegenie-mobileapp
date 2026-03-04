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
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { PriceForecastStackParamList } from "../../navigation/PriceForecastStack";
import { ArrowLeft, Save, AlertCircle } from "lucide-react-native";
import { useLanguage } from "../../context/LanguageContext";
import { updatePost } from "../../services/postService";

type NavProp = StackNavigationProp<
  PriceForecastStackParamList,
  "EditPostScreen"
>;

interface RouteParams {
  postId: string;
  currentData: {
    seed_variety: string;
    price_per_kg: number;
    quantity_kg: number;
    district: string;
    week: number;
    season: string;
  };
}

const SEASONS = ["Maha", "Yala"] as const;

const EditPostScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute();
  const { language: globalLang } = useLanguage();
  const language =
    globalLang === "sinhala" ? "si" : globalLang === "tamil" ? "ta" : "en";

  const { postId, currentData } = route.params as RouteParams;

  // ── Editable fields ────────────────────────────────────────────────
  const [seedVariety, setSeedVariety] = useState(currentData.seed_variety);
  const [pricePerKg, setPricePerKg] = useState(
    currentData.price_per_kg.toFixed(2),
  );
  const [quantityKg, setQuantityKg] = useState(
    currentData.quantity_kg.toFixed(0),
  );
  const [season, setSeason] = useState(currentData.season);

  // Read-only: district & week are locked to the original forecast context
  const district = currentData.district;
  const week = currentData.week;

  const [isSaving, setIsSaving] = useState(false);

  // ── i18n ───────────────────────────────────────────────────────────
  const T = {
    si: {
      title: "තනතුර සංස්කරණය",
      subtitle: "ඔබේ ක්‍රියාකාරී අළෙවිය යාවත්කාලීන කරන්න",
      seedVariety: "බීජ ප්‍රභේදය",
      pricePerKg: "මිල (කි.ග්‍රෑ. 1 ට)",
      quantityKg: "ප්‍රමාණය (කි.ග්‍රෑ.)",
      season: "කන්න",
      district: "දිස්ත්‍රිකිය",
      week: "සතිය",
      readOnlyNote: "දිස්ත්‍රිකිය හා සතිය වෙනස් කළ නොහැක",
      save: "යාවත්කාල සහිත",
      cancel: "අවලංගු කරන්න",
      enterVariety: "බීජ ප්‍රභේදය ඇතුලු කරන්න",
      enterPrice: "මිල ඇතුලු කරන්න",
      enterQuantity: "ප්‍රමාණය ඇතුලු කරන්න",
      validationError: "සියලු ක්ෂේත්‍ර නිවැරදිව පුරවන්න",
      success: "තනතුර යාවත්කාලීන කරන ලදී",
      soldNotice:
        "ⓘ  Sold posts cannot be edited. Only active posts may be changed.",
      errorTitle: "දෝෂයක්",
      validationErrorTitle: "දෝෂයක්",
      successTitle: "සාර්ථකයි",
    },
    en: {
      title: "Edit Post",
      subtitle: "Update your active harvest listing",
      seedVariety: "Seed Variety",
      pricePerKg: "Price (per kg)",
      quantityKg: "Quantity (kg)",
      season: "Season",
      district: "District",
      week: "Week",
      readOnlyNote: "District & week are locked to your original forecast",
      save: "Save Changes",
      cancel: "Cancel",
      enterVariety: "Enter seed variety",
      enterPrice: "Enter price per kg",
      enterQuantity: "Enter quantity in kg",
      validationError: "Please fill all fields with valid values",
      success: "Post updated successfully",
      soldNotice:
        "ⓘ  Sold posts cannot be edited. Only active posts may be changed.",
      errorTitle: "Error",
      validationErrorTitle: "Validation Error",
      successTitle: "Success",
    },
    ta: {
      title: "பதிவு திருத்து",
      subtitle: "உங்கள் செயலில் உள்ள அறுவடை பட்டியலை புதுப்பிக்கவும்",
      seedVariety: "விதை வகை",
      pricePerKg: "விலை (ஒரு கிலோவிட்டுக்கு)",
      quantityKg: "அளவு (கிலோ)",
      season: "பருவம்",
      district: "மாவட்டம்",
      week: "வாரம்",
      readOnlyNote:
        "மாவட்டம் & வாரம் உங்கள் அசல் முன்னறிவிப்போடு பூட்டப்பட்டுள்ளது",
      save: "மாற்றங்களை சேமிக்க",
      cancel: "ரத்து செய்க",
      enterVariety: "விதை வகையை உள்ளிடுக",
      enterPrice: "ஒரு கிலோவுக்கான விலையை உள்ளிடுக",
      enterQuantity: "கிலோவில் அளவை உள்ளிடுக",
      validationError: "அனைத்து புலங்களையும் சரியான மதிப்புகளுடன் நிரப்பவும்",
      success: "பதிவு வெற்றிகரமாக புதுப்பிக்கப்பட்டது",
      soldNotice:
        "ⓘ  விற்கப்பட்ட பதிவுகளை திருத்த முடியாது. செயலில் உள்ள பதிவுகள் மட்டுமே மாற்றலாம்.",
      errorTitle: "பிழை",
      validationErrorTitle: "சரிபார்ப்பு பிழை",
      successTitle: "வெற்றி",
    },
  };
  const t = T[language];

  // ── Validation ─────────────────────────────────────────────────────
  const validate = (): boolean => {
    if (!seedVariety.trim()) return false;
    const price = parseFloat(pricePerKg);
    if (!Number.isFinite(price) || price <= 0) return false;
    const qty = parseFloat(quantityKg);
    if (!Number.isFinite(qty) || qty <= 0) return false;
    return true;
  };

  // ── Save handler ───────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) {
      Alert.alert(t.validationErrorTitle, t.validationError);
      return;
    }

    try {
      setIsSaving(true);

      await updatePost(postId, {
        seed_variety: seedVariety.trim(),
        price_per_kg: parseFloat(pricePerKg),
        quantity_kg: parseFloat(quantityKg),
        season,
      });

      // Navigate back to PostDetailScreen first, then show the alert
      // so useFocusEffect on PostDetailScreen can reload the fresh data.
      navigation.navigate("PostDetailScreen", { postId });
      Alert.alert(t.successTitle, t.success);
    } catch (error) {
      console.error("[EditPostScreen] updatePost:", error);
      Alert.alert(t.errorTitle, String(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft color="#047857" size={24} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t.title}</Text>
          <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Warning banner ─────────────────────────────── */}
        <View style={styles.warnBanner}>
          <AlertCircle size={16} color="#92400E" />
          <Text style={styles.warnText}>{t.soldNotice}</Text>
        </View>

        <View style={styles.formCard}>
          {/* Seed Variety */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t.seedVariety}</Text>
            <TextInput
              style={styles.input}
              placeholder={t.enterVariety}
              placeholderTextColor="#9CA3AF"
              value={seedVariety}
              onChangeText={setSeedVariety}
              editable={!isSaving}
            />
          </View>

          {/* Price per kg */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t.pricePerKg}</Text>
            <TextInput
              style={styles.input}
              placeholder={t.enterPrice}
              placeholderTextColor="#9CA3AF"
              value={pricePerKg}
              onChangeText={setPricePerKg}
              keyboardType="decimal-pad"
              editable={!isSaving}
            />
          </View>

          {/* Quantity */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t.quantityKg}</Text>
            <TextInput
              style={styles.input}
              placeholder={t.enterQuantity}
              placeholderTextColor="#9CA3AF"
              value={quantityKg}
              onChangeText={setQuantityKg}
              keyboardType="decimal-pad"
              editable={!isSaving}
            />
          </View>

          {/* Season toggle */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t.season}</Text>
            <View style={styles.seasonRow}>
              {SEASONS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.seasonOption,
                    season === s && styles.seasonOptionActive,
                  ]}
                  onPress={() => !isSaving && setSeason(s)}
                >
                  <Text
                    style={[
                      styles.seasonOptionText,
                      season === s && styles.seasonOptionTextActive,
                    ]}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Separator */}
          <View style={styles.divider} />

          {/* Read-only: District */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t.district}</Text>
            <View style={styles.readOnlyBox}>
              <Text style={styles.readOnlyText}>{district}</Text>
            </View>
          </View>

          {/* Read-only: Week */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t.week}</Text>
            <View style={styles.readOnlyBox}>
              <Text style={styles.readOnlyText}>W{week}</Text>
            </View>
          </View>

          <Text style={styles.readOnlyNote}>{t.readOnlyNote}</Text>
        </View>
      </ScrollView>

      {/* ── Footer actions ──────────────────────────────── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={isSaving}
        >
          <Text style={styles.cancelButtonText}>{t.cancel}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Save size={18} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>{t.save}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  warnBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#FEF3C7",
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#F59E0B",
  },
  warnText: {
    flex: 1,
    fontSize: 12,
    color: "#92400E",
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  formGroup: {
    gap: 8,
  },
  label: {
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
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#1F2937",
  },
  seasonRow: {
    flexDirection: "row",
    gap: 12,
  },
  seasonOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#D1FAE5",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  seasonOptionActive: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  seasonOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#047857",
  },
  seasonOptionTextActive: {
    color: "#FFFFFF",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 4,
  },
  readOnlyBox: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#D1FAE5",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  readOnlyText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  readOnlyNote: {
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
    marginTop: -4,
  },
  footer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 30,
    flexDirection: "row",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#D1FAE5",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#047857",
    fontSize: 15,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#10B981",
    paddingVertical: 13,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
});

export default EditPostScreen;
