import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Switch,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Modal,
  SafeAreaView,
} from "react-native";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { API_BASE } from "../../services/api";
import { supabase } from "../../lib/supabase";
import { useNavigation } from "@react-navigation/native";

// 🌐 Language
import { useLanguage } from "../../context/LanguageContext";

// Icons
import {
  ArrowLeft,
  Upload,
  FileText,
  Globe,
  Tag,
  MapPin,
  Save,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react-native";

export default function AdminEditOfficialNewsScreen({ route }: any) {
  const { newsId } = route.params;
  const navigation = useNavigation();
  const { language } = useLanguage();

  // UI language
  const uiLang: "si" | "en" | "ta" =
    language === "sinhala" ? "si" : language === "tamil" ? "ta" : "en";

  // 🌐 Bilingual text
  const content = {
    si: {
      title: "නිල ප්‍රවෘත්ති සංස්කරණය",
      subtitle: "නිල දැනුම්දීම් යාවත්කාලීන කරන්න",
      newsTitle: "ශීර්ෂය",
      summary: "සාරාංශය",
      category: "වර්ගය",
      source: "මූලාශ්‍රය",
      url: "නිල වෙබ් ලින්ක්",
      district: "දිස්ත්‍රික්කය",
      update: "යාවත්කාලීන කරන්න",
      delete: "මකන්න",
      back: "ආපසු",
      error: "අනිවාර්ය ක්ෂේත්‍ර හිස්",
      success: "නිල ප්‍රවෘත්තිය යාවත්කාලීනයි",
      deleteSuccess: "නිල ප්‍රවෘත්තිය මකා දමන ලදී",
      imageLabel: "පින්තූරය",
      optional: "(විකල්ප)",
      required: "*",
      selectImage: "පින්තූරයක් තෝරන්න",
      changeImage: "පින්තූරය වෙනස් කරන්න",
      updating: "යාවත්කාලීන වෙමින්...",
      deleting: "මකමින්...",
      visibility: "දෘශ්‍යතාව",
      visibleToFarmers: "ගොවීන්ට දෘශ්‍යමානයි",
      visibilityHint: "ගොවි පෝෂණයෙන් මෙම ප්‍රවෘත්ති සඟවන්නට අක්‍රිය කරන්න",
      confirmDelete: "ඔබට මෙම ප්‍රවෘත්ති මකා දැමීමට අවශ්‍යද?",
      cancel: "අවලංගු කරන්න",
      noImage: "පින්තූරයක් නැත",
      selectCategory: "වර්ගය තෝරන්න",
      loading: "පූරණය වෙමින්...",
    },
    en: {
      title: "Edit Official News",
      subtitle: "Update official announcements",
      newsTitle: "Title",
      summary: "Summary",
      category: "Category",
      source: "Source",
      url: "Official Source URL",
      district: "District",
      update: "Update",
      delete: "Delete",
      back: "Back",
      error: "Required fields are missing",
      success: "Official news updated successfully",
      deleteSuccess: "Official news deleted successfully",
      imageLabel: "Image",
      optional: "(optional)",
      required: "*",
      selectImage: "Select an image",
      changeImage: "Change Image",
      updating: "Updating...",
      deleting: "Deleting...",
      visibility: "Visibility",
      visibleToFarmers: "Visible to Farmers",
      visibilityHint: "Turn off to hide this news from farmer feed",
      confirmDelete: "Are you sure you want to delete this news?",
      cancel: "Cancel",
      noImage: "No image",
      selectCategory: "Select Category",
      loading: "Loading...",
    },
    ta: {
      title: "அதிகாரப்பூர்வ செய்தியை திருத்து",
      subtitle: "அதிகாரப்பூர்வ அறிவிப்புகளை புதுப்பிக்கவும்",
      newsTitle: "தலைப்பு",
      summary: "சுருக்கம்",
      category: "வகை",
      source: "மூலம்",
      url: "அதிகாரப்பூர்வ மூல URL",
      district: "மாவட்டம்",
      update: "புதுப்பிக்கவும்",
      delete: "நீக்கவும்",
      back: "பின்னால்",
      error: "தேவையான புலங்கள் காணவில்லை",
      success: "அதிகாரப்பூர்வ செய்தி வெற்றிகரமாக புதுப்பிக்கப்பட்டது",
      deleteSuccess: "அதிகாரப்பூர்வ செய்தி நீக்கப்பட்டது",
      imageLabel: "படம்",
      optional: "(விருப்பமானது)",
      required: "*",
      selectImage: "படம் தேர்வு செய்யவும்",
      changeImage: "படத்தை மாற்றவும்",
      updating: "புதுப்பிக்கிறது...",
      deleting: "நீக்குகிறது...",
      visibility: "தெரிவுநிலை",
      visibleToFarmers: "விவசாயிகளுக்கு தெரியும்",
      visibilityHint: "விவசாயி ஊட்டத்தில் இருந்து மறைக்க அணைக்கவும்",
      confirmDelete: "இந்த செய்தியை நீக்க விரும்புகிறீர்களா?",
      cancel: "ரத்து செய்",
      noImage: "படம் இல்லை",
      selectCategory: "வகையை தேர்வு செய்யவும்",
      loading: "ஏற்றுகிறது...",
    },
  };

  const CATEGORY_OPTIONS = [
    { value: "price", si: "මිල", en: "Price", ta: "விலை" },
    { value: "weather", si: "කාලගුණය", en: "Weather", ta: "வானிலை" },
    { value: "policy", si: "ප්‍රතිපත්ති", en: "Policy", ta: "கொள்கை" },
    { value: "alert", si: "අනතුරු ඇඟවීම", en: "Alert", ta: "எச்சரிக்கை" },
    { value: "pest", si: "පළිබෝධ", en: "Pest", ta: "பூச்சி" },
    { value: "disease", si: "රෝග", en: "Disease", ta: "நோய்" },
    { value: "fertilizer", si: "පොහොර", en: "Fertilizer", ta: "உரம்" },
    {
      value: "cultivation",
      si: "වගා උපදෙස්",
      en: "Cultivation",
      ta: "பயிர்ச்செய்கை",
    },
    { value: "program", si: "වැඩසටහන්", en: "Program", ta: "திட்டம்" },
  ];

  const t = content[uiLang];

  // 📝 Form state
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("");
  const [source, setSource] = useState("");
  const [url, setUrl] = useState("");
  const [district, setDistrict] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageAsset, setImageAsset] = useState<any | null>(null);
  const [visibleToFarmers, setVisibleToFarmers] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const titleRef = useRef<View>(null);
  const categoryRef = useRef<View>(null);
  const sourceRef = useRef<View>(null);

  // ===============================
  // LOAD NEWS
  // ===============================
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setInitialLoading(true);
        const res = await axios.get(`${API_BASE}/official-news/${newsId}`);
        if (!mounted) return;

        const n = res.data;
        setTitle(n.title);
        setSummary(n.summary || "");
        setCategory(n.category);
        setSource(n.source);
        setUrl(n.url || "");
        setDistrict(n.district || "");
        setImageUrl(n.image_url);
        setVisibleToFarmers(n.is_visible_to_farmers);

        setTitleError(null);
        setSourceError(null);
        setCategoryError(null);
      } catch (e: any) {
        Alert.alert("Error", e?.message || "Failed to load news");
      } finally {
        if (mounted) setInitialLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [newsId]);

  // ===============================
  // IMAGE PICK
  // ===============================
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

      if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
        Alert.alert("Image too large", "Max size is 5MB");
        return;
      }

      setImageAsset(asset);
    }
  };

  // ===============================
  // UPLOAD IMAGE
  // ===============================
  const uploadImage = async (asset: any): Promise<string> => {
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

  // ===============================
  // UPDATE NEWS
  // ===============================
  const updateNews = async () => {
    let hasError = false;

    // 🔴 Title validation
    if (!title.trim()) {
      setTitleError(
        uiLang === "si"
          ? "ශීර්ෂය අවශ්‍යයි"
          : uiLang === "ta"
            ? "தலைப்பு தேவை"
            : "Title is required",
      );
      hasError = true;

      titleRef.current?.measureLayout(scrollRef.current as any, (_, y) => {
        scrollRef.current?.scrollTo({ y: y - 20, animated: true });
      });
      return;
    }

    // 🔴 Category validation
    if (!category) {
      setCategoryError(
        uiLang === "si"
          ? "වර්ගය තෝරන්න"
          : uiLang === "ta"
            ? "வகை தேவை"
            : "Category is required",
      );

      categoryRef.current?.measureLayout(scrollRef.current as any, (_, y) => {
        scrollRef.current?.scrollTo({ y: y - 20, animated: true });
      });
      return;
    }

    // 🔴 Source validation
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

      let finalImageUrl = imageUrl;
      if (imageAsset) {
        finalImageUrl = await uploadImage(imageAsset);
      }

      await axios.patch(`${API_BASE}/official-news/admin/${newsId}`, {
        title: title.trim(),
        summary: summary?.trim() || "",
        category: category.trim().toLowerCase(),
        source: source.trim(),
        url: url?.trim() ? url.trim() : null,
        district: district?.trim() ? district.trim() : null,
        image_url: finalImageUrl,
        is_visible_to_farmers: visibleToFarmers,
      });

      setShowSuccessModal(true);
    } catch (e: any) {
      console.log("❌ UPDATE ERROR:", e);
      console.log("❌ RESPONSE:", e?.response?.data);
      Alert.alert(
        "Error",
        e?.response?.data?.detail || "Failed to update news",
      );
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // DELETE NEWS
  // ===============================
  const deleteNews = async () => {
    setShowDeleteModal(false);

    try {
      setLoading(true);
      await axios.delete(`${API_BASE}/official-news/admin/${newsId}`);
      Alert.alert(
        uiLang === "si"
          ? "මකා දමන ලදී"
          : uiLang === "ta"
            ? "நீக்கப்பட்டது"
            : "Deleted",
        t.deleteSuccess,
      );
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const previewUri = imageAsset?.uri || imageUrl || null;

  if (initialLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingScreenText}>{t.loading}</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {/* HEADER */}
      <SafeAreaView style={{ backgroundColor: "#2E7D32" }}>
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
      </SafeAreaView>

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
            {previewUri ? (
              <Image source={{ uri: previewUri }} style={styles.previewImage} />
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

          {previewUri && (
            <TouchableOpacity
              onPress={pickImage}
              style={styles.changeImageBtn}
              activeOpacity={0.9}
            >
              <Upload size={16} color="#2E7D32" />
              <Text style={styles.changeImageText}>{t.changeImage}</Text>
            </TouchableOpacity>
          )}
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
                    ? "-- வகையை தேர்ந்தெடுக்கவும் --"
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

        {/* Visibility Card */}
        <View style={styles.card}>
          <View style={styles.labelRow}>
            <View style={styles.iconCircle}>
              {visibleToFarmers ? (
                <Eye size={16} color="#2E7D32" />
              ) : (
                <EyeOff size={16} color="#2E7D32" />
              )}
            </View>
            <Text style={styles.label}>{t.visibility}</Text>
          </View>

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>{t.visibleToFarmers}</Text>
              <Text style={styles.switchHint}>{t.visibilityHint}</Text>
            </View>

            <Switch
              value={visibleToFarmers}
              onValueChange={setVisibleToFarmers}
              trackColor={{ false: "#CBD5E0", true: "#81C784" }}
              thumbColor={visibleToFarmers ? "#2E7D32" : "#94A3B8"}
            />
          </View>
        </View>

        {/* ACTION BUTTONS */}
        <TouchableOpacity
          style={[styles.updateBtn, loading && styles.btnDisabled]}
          onPress={updateNews}
          disabled={loading}
          activeOpacity={0.9}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Save size={20} color="#FFFFFF" />
          )}
          <Text style={styles.updateBtnText}>
            {loading ? t.updating : t.update}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.deleteBtn, loading && styles.btnDisabled]}
          onPress={() => setShowDeleteModal(true)}
          disabled={loading}
          activeOpacity={0.9}
        >
          <Trash2 size={20} color="#FFFFFF" />
          <Text style={styles.deleteBtnText}>{t.delete}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />

        {/* Category Picker Modal */}
        <Modal visible={showCategoryPicker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{t.selectCategory}</Text>

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
                <Text style={styles.cancelText}>{t.cancel}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Success Modal */}
        <Modal visible={showSuccessModal} transparent animationType="fade">
          <View style={styles.successOverlay}>
            <View style={styles.successCard}>
              <View style={styles.successIconCircle}>
                <Save size={34} color="#2E7D32" />
              </View>

              <Text style={styles.successTitle}>{t.success}</Text>

              <Text style={styles.successSubtitle}>
                {uiLang === "si"
                  ? "ගොවීන්ට දැන් මෙම යාවත්කාලීන දැනුම්දීම් දෘශ්‍යමාන වේ"
                  : uiLang === "ta"
                    ? "இந்த தகவல் இப்போது விவசாயிகளுக்கு தெரியும்"
                    : "This update is now visible to farmers"}
              </Text>

              <TouchableOpacity
                style={styles.successBtn}
                activeOpacity={0.9}
                onPress={() => {
                  setShowSuccessModal(false);
                  navigation.goBack();
                }}
              >
                <Text style={styles.successBtnText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal visible={showDeleteModal} transparent animationType="fade">
          <View style={styles.successOverlay}>
            <View style={styles.successCard}>
              <View
                style={[
                  styles.successIconCircle,
                  { backgroundColor: "#FFEBEE" },
                ]}
              >
                <Trash2 size={34} color="#C62828" />
              </View>

              <Text style={styles.successTitle}>{t.confirmDelete}</Text>

              <Text style={styles.successSubtitle}>
                {uiLang === "si"
                  ? "මෙම ක්‍රියාව ආපසු හැරවිය නොහැක"
                  : uiLang === "ta"
                    ? "இந்த செயல் திரும்ப முடியாது"
                    : "This action cannot be undone"}
              </Text>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  activeOpacity={0.9}
                  onPress={() => setShowDeleteModal(false)}
                >
                  <Text style={styles.modalCancelBtnText}>{t.cancel}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalDeleteBtn}
                  activeOpacity={0.9}
                  onPress={deleteNews}
                >
                  <Text style={styles.modalDeleteBtnText}>{t.delete}</Text>
                </TouchableOpacity>
              </View>
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
    paddingTop: 36,
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
  changeImageBtn: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#C8E6C9",
  },
  changeImageText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#2E7D32",
  },
  updateBtn: {
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
  updateBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  deleteBtn: {
    marginTop: 10,
    backgroundColor: "#C62828",
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    shadowColor: "#8B0000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  deleteBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  btnDisabled: {
    opacity: 0.6,
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
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1B5E20",
  },
  switchHint: {
    marginTop: 4,
    fontSize: 12,
    color: "#66BB6A",
    lineHeight: 16,
    fontWeight: "600",
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
  modalActions: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: "#E8F5E9",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#C8E6C9",
  },
  modalCancelBtnText: {
    color: "#2E7D32",
    fontSize: 14,
    fontWeight: "900",
  },
  modalDeleteBtn: {
    flex: 1,
    backgroundColor: "#C62828",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  modalDeleteBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: "#F1F8E9",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingScreenText: {
    marginTop: 12,
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "700",
  },
});
