import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Platform,
  ActivityIndicator,
  Modal,
} from "react-native";
import axios from "axios";
import { API_BASE } from "../../services/api";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../lib/supabase";
import { Picker } from "@react-native-picker/picker";
import { ROUTES } from "../../constants";

// Language
import { useLanguage } from "../../context/LanguageContext";

// Icons
import {
  ArrowLeft,
  Send,
  Upload,
  FileText,
  Globe,
  Tag,
  MapPin,
} from "lucide-react-native";

export default function AdminAddOfficialNewsScreen() {
  const navigation = useNavigation();
  const { language } = useLanguage();

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

  // UI language
  const uiLang: "si" | "en" | "ta" =
    language === "sinhala" ? "si" : language === "tamil" ? "ta" : "en";

  // Bilingual text
  const content = {
    si: {
      title: "නිල ප්‍රවෘත්ති එක් කරන්න",
      subtitle: "ගොවීන්ට පෙන්වීමට නිල දැනුම්දීම් ප්‍රකාශ කරන්න",
      newsTitle: "ශීර්ෂය",
      summary: "සාරාංශය",
      category: "වර්ගය",
      source: "මූලාශ්‍රය",
      url: "නිල වෙබ් ලින්ක්",
      district: "දිස්ත්‍රික්කය",
      publish: "ප්‍රකාශ කරන්න",
      back: "ආපසු",
      error: "අනිවාර්ය ක්ෂේත්‍ර හිස්",
      success: "නිල ප්‍රවෘත්තිය සාර්ථකව ප්‍රකාශිතයි",
      imageLabel: "පින්තූරය",
      optional: "(විකල්ප)",
      required: "*",
      selectImage: "පින්තූරයක් තෝරන්න",
      publishing: "ප්‍රකාශ වෙමින්...",
    },
    en: {
      title: "Add Official News",
      subtitle: "Publish official updates for farmers",
      newsTitle: "Title",
      summary: "Summary",
      category: "Category",
      source: "Source",
      url: "Official Source URL",
      district: "District",
      publish: "Publish",
      back: "Back",
      error: "Required fields are missing",
      success: "Official news published successfully",
      imageLabel: "Image",
      optional: "(optional)",
      required: "*",
      selectImage: "Select an image",
      publishing: "Publishing...",
    },
    ta: {
      title: "அதிகாரப்பூர்வ செய்தி சேர்க்க",
      subtitle: "விவசாயிகளுக்கு அதிகாரப்பூர்வ தகவல்களை ப்ரசுரிக்கவும்",
      newsTitle: "தலைப்பு",
      summary: "சுருக்கம்",
      category: "வகை",
      source: "மூலம்",
      url: "அதிகாரப்பூர்வ மூல இணைப்ிண்பு",
      district: "மாவட்டம்",
      publish: "ப்ரசுரி",
      back: "மீள்",
      error: "தேவையான தகவல்கள் இல்லை",
      success: "அதிகாரப்பூர்வ செய்தி வெற்றிகரமாக ப்ரசுரிக்கப்பட்டது",
      imageLabel: "படம்",
      optional: "(ஐச்சரியமற்றது)",
      required: "*",
      selectImage: "படத்தைத் தேர்ந்தெடுக்கவும்",
      publishing: "ப்ரசுரிக்கப்படுகிறது...",
    },
  };

  const CATEGORY_OPTIONS = [
    { value: "price", si: "මිල", en: "Price", ta: "விலை" },
    { value: "weather", si: "කාලගුණය", en: "Weather", ta: "வானிலை" },
    { value: "policy", si: "ප්‍රතිපත්ති", en: "Policy", ta: "கொள்கை" },
    { value: "alert", si: "අනතුරු ඇගවීම", en: "Alert", ta: "எச்சரிக்கை" },
    { value: "pest", si: "පලිබෝද", en: "Pest", ta: "பூச்சி" },
    { value: "disease", si: "රෝග", en: "Disease", ta: "நோய்" },
    { value: "fertilizer", si: "පෝහොර", en: "Fertilizer", ta: "உரம்" },
    {
      value: "cultivation",
      si: "වගා උපදේස්",
      en: "Cultivation",
      ta: "சாகுபடி வழிகாட்டல்",
    },
    { value: "program", si: "වැඩසටහන්", en: "Program", ta: "திட்டம்" },
  ];

  const t = content[uiLang];

  // Form state
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("");
  const [source, setSource] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageAsset, setImageAsset] = useState<any | null>(null);
  const [district, setDistrict] = useState("");
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const titleRef = useRef<View>(null);
  const categoryRef = useRef<View>(null);
  const sourceRef = useRef<View>(null);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission required", "Allow photo access");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];

      // size validation (5MB)
      if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
        Alert.alert("Image too large", "Max size is 5MB");
        return;
      }

      setImageAsset(asset);
    }
  };

  const uploadOfficialNewsImage = async (asset: any): Promise<string> => {
    const fileExt = asset.uri.split(".").pop() || "jpg";
    const fileName = `official_news_${Date.now()}.${fileExt}`;
    const filePath = `news/${fileName}`;

    const response = await fetch(asset.uri);
    const arrayBuffer = await response.arrayBuffer();

    const { error } = await supabase.storage
      .from("official-news-images")
      .upload(filePath, arrayBuffer, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage
      .from("official-news-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  // ubmit
  const submitNews = async () => {
    let hasError = false;

    // Title validation
    if (!title.trim()) {
      setTitleError(
        uiLang === "si"
          ? "ශීර්ෂය අවශ්‍යයි"
          : uiLang === "ta"
            ? "தலைப்பு தேவை"
            : "Title is required",
      );
      hasError = true;

      // scroll to title
      titleRef.current?.measureLayout(scrollRef.current as any, (_, y) => {
        scrollRef.current?.scrollTo({ y: y - 20, animated: true });
      });
      return;
    }

    // Category validation
    if (!category) {
      setCategoryError(
        uiLang === "si"
          ? "වර්ගය තෝරන්න"
          : uiLang === "ta"
            ? "வகையைத் தேர்ந்தெடுக்கவும்"
            : "Category is required",
      );

      categoryRef.current?.measureLayout(scrollRef.current as any, (_, y) => {
        scrollRef.current?.scrollTo({ y: y - 20, animated: true });
      });
      return;
    }

    // Source validation
    if (!source.trim()) {
      setSourceError(
        uiLang === "si"
          ? "මූලාශ්‍රය අවශ්‍යයි"
          : uiLang === "ta"
            ? "மூலம் தேவை"
            : "Source is required",
      );

      sourceRef.current?.measureLayout(scrollRef.current as any, (_, y) => {
        scrollRef.current?.scrollTo({ y: y - 20, animated: true });
      });
      return;
    }

    try {
      setLoading(true);

      let imageUrl: string | null = null;

      if (imageAsset) {
        imageUrl = await uploadOfficialNewsImage(imageAsset);
      }

      await axios.post(`${API_BASE}/official-news/admin`, {
        title: title.trim(),
        summary,
        category: category.trim().toLowerCase(),
        source: source.trim(),
        url: url || null,
        image_url: imageUrl,
        district: district || null,
      });

      setShowSuccessModal(true);
    } catch (err: any) {
      console.log("❌ SUBMIT ERROR:", err);
      console.log("❌ RESPONSE:", err?.response?.data);
      Alert.alert(
        "Error",
        err?.response?.data?.detail || "Failed to publish news",
      );
    } finally {
      setLoading(false);
    }
  };

  const isValidUrl = (value: string) => {
    try {
      new URL(value.startsWith("http") ? value : `https://${value}`);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft size={22} color="#E8F5E9" />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{t.title}</Text>
            <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
          </View>
        </View>
      </View>

      {/* FORM */}
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Image Upload Section */}
        <View style={styles.card}>
          <View style={styles.labelRow}>
            <View style={styles.iconCircle}>
              <Upload size={16} color="#2E7D32" />
            </View>
            <Text style={styles.label}>
              {t.imageLabel} {t.optional}
            </Text>
          </View>

          <TouchableOpacity
            onPress={pickImage}
            style={styles.imageButton}
            activeOpacity={0.9}
          >
            {imageAsset ? (
              <Image
                source={{ uri: imageAsset.uri }}
                style={styles.previewImage}
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <View style={styles.uploadIconContainer}>
                  <Upload size={32} color="#4CAF50" />
                </View>
                <Text style={styles.placeholderText}>{t.selectImage}</Text>
                <Text style={styles.placeholderSubtext}>
                  {uiLang === "si"
                    ? "5MB දක්වා"
                    : uiLang === "ta"
                      ? "அதிகபட்சம் 5MB"
                      : "Max 5MB"}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.card} ref={titleRef}>
          <View style={styles.labelRow}>
            <View style={styles.iconCircle}>
              <FileText size={16} color="#2E7D32" />
            </View>
            <Text style={styles.label}>{t.newsTitle}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{t.required}</Text>
            </View>
          </View>
          <TextInput
            style={[styles.input, titleError && styles.inputError]}
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              setTitleError(null);
            }}
            placeholder={t.newsTitle}
            placeholderTextColor="#A5D6A7"
          />

          {titleError && <Text style={styles.errorText}>{titleError}</Text>}
        </View>

        {/* Summary */}
        <View style={styles.card}>
          <View style={styles.labelRow}>
            <View style={styles.iconCircle}>
              <FileText size={16} color="#2E7D32" />
            </View>
            <Text style={styles.label}>
              {t.summary} {t.optional}
            </Text>
          </View>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={summary}
            onChangeText={setSummary}
            multiline
            placeholder={t.summary}
            placeholderTextColor="#A5D6A7"
          />
        </View>

        {/* Category */}
        <View style={styles.card} ref={categoryRef}>
          <View style={styles.labelRow}>
            <View style={styles.iconCircle}>
              <Tag size={16} color="#2E7D32" />
            </View>
            <Text style={styles.label}>{t.category}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{t.required}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.dropdownBtn, categoryError && styles.inputError]}
            activeOpacity={0.85}
            onPress={() => setShowCategoryPicker(true)}
          >
            <Text
              style={[styles.dropdownText, !category && { color: "#81C784" }]}
            >
              {category
                ? CATEGORY_OPTIONS.find((c) => c.value === category)?.[uiLang]
                : uiLang === "si"
                  ? "-- වර්ගය තෝරන්න --"
                  : uiLang === "ta"
                    ? "-- வகையைத் தேர்ந்தெடுக்கவும் --"
                    : "-- Select Category --"}
            </Text>

            <Tag size={18} color="#2E7D32" />
          </TouchableOpacity>

          {categoryError && (
            <Text style={styles.errorText}>{categoryError}</Text>
          )}
        </View>

        {/* District */}
        <View style={styles.card}>
          <View style={styles.labelRow}>
            <View style={styles.iconCircle}>
              <MapPin size={16} color="#2E7D32" />
            </View>
            <Text style={styles.label}>
              {t.district} {t.optional}
            </Text>
          </View>
          <TextInput
            style={styles.input}
            value={district}
            onChangeText={setDistrict}
            placeholder="Anuradhapura / Polonnaruwa / Kurunegala"
            placeholderTextColor="#A5D6A7"
            autoCapitalize="words"
          />
        </View>

        {/* Source */}
        <View style={styles.card} ref={sourceRef}>
          <View style={styles.labelRow}>
            <View style={styles.iconCircle}>
              <FileText size={16} color="#2E7D32" />
            </View>
            <Text style={styles.label}>{t.source}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{t.required}</Text>
            </View>
          </View>
          <TextInput
            style={[styles.input, sourceError && styles.inputError]}
            value={source}
            onChangeText={(text) => {
              setSource(text);
              setSourceError(null);
            }}
            placeholder="HARTI / Met Dept / DMC / Gazette"
            placeholderTextColor="#A5D6A7"
          />

          {sourceError && <Text style={styles.errorText}>{sourceError}</Text>}
        </View>

        {/* URL */}
        <View style={styles.card}>
          <View style={styles.labelRow}>
            <View style={styles.iconCircle}>
              <Globe size={16} color="#2E7D32" />
            </View>
            <Text style={styles.label}>
              {t.url} {t.optional}
            </Text>
          </View>
          <TextInput
            style={styles.input}
            value={url}
            onChangeText={setUrl}
            placeholder="https://..."
            placeholderTextColor="#A5D6A7"
            autoCapitalize="none"
          />
        </View>

        {/* SUBMIT BUTTON */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.btnDisabled]}
          onPress={submitNews}
          disabled={loading}
          activeOpacity={0.9}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Send size={20} color="#FFFFFF" />
          )}
          <Text style={styles.submitBtnText}>
            {loading ? t.publishing : t.publish}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
        <Modal visible={showCategoryPicker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>
                {uiLang === "si"
                  ? "වර්ගය තෝරන්න"
                  : uiLang === "ta"
                    ? "வகையைத் தேர்ந்தெடுக்கவும்"
                    : "Select Category"}
              </Text>

              <ScrollView showsVerticalScrollIndicator={false}>
                {CATEGORY_OPTIONS.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={styles.optionRow}
                    onPress={() => {
                      setCategory(item.value);
                      setCategoryError(null);
                      setShowCategoryPicker(false);
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.optionText}>
                      {uiLang === "si"
                        ? item.si
                        : uiLang === "ta"
                          ? item.ta
                          : item.en}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                onPress={() => setShowCategoryPicker(false)}
                style={styles.cancelBtn}
                activeOpacity={0.9}
              >
                <Text style={styles.cancelText}>
                  {uiLang === "si"
                    ? "අවලංගු කරන්න"
                    : uiLang === "ta"
                      ? "ரத்து செய்"
                      : "Cancel"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal visible={showSuccessModal} transparent animationType="fade">
          <View style={styles.successOverlay}>
            <View style={styles.successCard}>
              <View style={styles.successIconCircle}>
                <Send size={34} color="#2E7D32" />
              </View>

              <Text style={styles.successTitle}>
                {uiLang === "si"
                  ? "නිල ප්‍රවෘත්තිය සාර්ථකව ප්‍රකාශිතයි"
                  : uiLang === "ta"
                    ? "அதிகாரப்பூர்வ செய்தி ப்ரசுரிக்கப்பட்டது"
                    : "Official News Published"}
              </Text>

              <Text style={styles.successSubtitle}>
                {uiLang === "si"
                  ? "ගොවීන්ට දැන් මේ දැනුම්දීම් දර්ශ්‍යමාන වේ"
                  : uiLang === "ta"
                    ? "இந்த தகவல் இப்போது விவசாயிகளுக்கு தெரியும்"
                    : "This update is now visible to farmers"}
              </Text>

              <TouchableOpacity
                style={styles.successBtn}
                activeOpacity={0.9}
                onPress={() => {
                  // reset form
                  setTitle("");
                  setSummary("");
                  setCategory("");
                  setSource("");
                  setUrl("");
                  setImageAsset(null);
                  setDistrict("");

                  setTitleError(null);
                  setSourceError(null);
                  setCategoryError(null);

                  setShowSuccessModal(false);
                  navigation.goBack();
                }}
              >
                <Text style={styles.successBtnText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#F1F8E9",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 52 : 18,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#2E7D32",
    shadowColor: "#1B5E20",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  headerTextContainer: {
    marginLeft: 14,
    flex: 1,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#C8E6C9",
    marginTop: 3,
    fontWeight: "600",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: "#C8E6C9",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1B5E20",
    flex: 1,
  },
  badge: {
    backgroundColor: "#FFEBEE",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    color: "#C62828",
    fontSize: 11,
    fontWeight: "800",
  },
  input: {
    backgroundColor: "#F1F8E9",
    borderWidth: 1.5,
    borderColor: "#C8E6C9",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#1B5E20",
    fontSize: 14,
    fontWeight: "600",
  },
  inputError: {
    borderColor: "#EF5350",
    backgroundColor: "#FFEBEE",
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  pickerBox: {
    backgroundColor: "#F1F8E9",
    borderWidth: 1.5,
    borderColor: "#C8E6C9",
    borderRadius: 14,
    overflow: "hidden",
  },
  imageButton: {
    backgroundColor: "#F1F8E9",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#C8E6C9",
    borderStyle: "dashed",
    overflow: "hidden",
    minHeight: 200,
  },
  previewImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  uploadIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "700",
  },
  placeholderSubtext: {
    marginTop: 4,
    fontSize: 12,
    color: "#66BB6A",
    fontWeight: "600",
  },
  submitBtn: {
    marginTop: 8,
    backgroundColor: "#388E3C",
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    shadowColor: "#1B5E20",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  errorText: {
    marginTop: 8,
    marginLeft: 4,
    color: "#C62828",
    fontSize: 12,
    fontWeight: "700",
  },
  dropdownBtn: {
    backgroundColor: "#F1F8E9",
    borderWidth: 1.5,
    borderColor: "#C8E6C9",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dropdownText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1B5E20",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },

  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
    maxHeight: "70%",
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1B5E20",
    marginBottom: 12,
  },

  optionRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E8F5E9",
  },

  optionText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2E7D32",
  },

  cancelBtn: {
    marginTop: 10,
    alignItems: "center",
    paddingVertical: 12,
  },

  cancelText: {
    color: "#C62828",
    fontWeight: "800",
    fontSize: 14,
  },
  successOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  successCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 24,
    width: "85%",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#C8E6C9",
  },

  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  successTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1B5E20",
    textAlign: "center",
    marginBottom: 6,
  },

  successSubtitle: {
    fontSize: 13,
    color: "#4CAF50",
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 18,
  },

  successBtn: {
    backgroundColor: "#2E7D32",
    paddingHorizontal: 34,
    paddingVertical: 12,
    borderRadius: 14,
  },

  successBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
});
