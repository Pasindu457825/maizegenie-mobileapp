import React, { useState } from "react";
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
} from "react-native";
import axios from "axios";
import { API_BASE } from "../../services/api";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../lib/supabase";
import { Picker } from "@react-native-picker/picker";

// 🌐 Language
import { useLanguage } from "../../context/LanguageContext";

// Icons
import { ArrowLeft, Send, Upload, FileText, Globe, Tag, MapPin } from "lucide-react-native";

export default function AdminAddOfficialNewsScreen() {
  const navigation = useNavigation();
  const { language } = useLanguage();

  // UI language
  const uiLang: "si" | "en" = language === "sinhala" ? "si" : "en";

  // 🌐 Bilingual text
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
  };

  const CATEGORY_OPTIONS = [
    { value: "price", si: "මිල", en: "Price" },
    { value: "weather", si: "කාලගුණය", en: "Weather" },
    { value: "policy", si: "ප්‍රතිපත්ති", en: "Policy" },
    { value: "alert", si: "අනතුරු ඇඟවීම", en: "Alert" },
    { value: "pest", si: "පළිබෝධ", en: "Pest" },
    { value: "disease", si: "රෝග", en: "Disease" },
    { value: "fertilizer", si: "පොහොර", en: "Fertilizer" },
    { value: "cultivation", si: "වගා උපදෙස්", en: "Cultivation" },
    { value: "program", si: "වැඩසටහන්", en: "Program" },
  ];

  const t = content[uiLang];

  // 📝 Form state
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("price");
  const [source, setSource] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageAsset, setImageAsset] = useState<any | null>(null);
  const [district, setDistrict] = useState("");

  const pickImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          "Permission required",
          "Please allow photo access to pick an image."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImageAsset(result.assets[0]);
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Image picker failed");
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

  // 🚀 Submit
  const submitNews = async () => {
    if (!title || !category || !source) {
      Alert.alert(t.error, "Please fill Title, Category, and Source");
      return;
    }

    try {
      setLoading(true);

      let imageUrl: string | null = null;

      if (imageAsset) {
        imageUrl = await uploadOfficialNewsImage(imageAsset);
      }

      await axios.post(`${API_BASE}/official-news/admin`, {
        title,
        summary,
        category: category.trim().toLowerCase(),
        source,
        url: url || null,
        image_url: imageUrl,
        district: district || null,
      });

      Alert.alert(t.success, "");

      setTitle("");
      setSummary("");
      setCategory("price");
      setSource("");
      setUrl("");
      setImageAsset(null);
      setDistrict("");
    } catch (err: any) {
      console.log("❌ SUBMIT ERROR:", err);
      console.log("❌ RESPONSE:", err?.response?.data);
      Alert.alert(
        "Error",
        err?.response?.data?.detail || "Failed to publish news"
      );
    } finally {
      setLoading(false);
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
            <ArrowLeft size={22} color="#64748B" />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{t.title}</Text>
            <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
          </View>
        </View>
      </View>

      {/* FORM */}
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Image Upload Section */}
        <View style={styles.card}>
          <View style={styles.labelRow}>
            <Upload size={16} color="#0F172A" />
            <Text style={styles.label}>{t.imageLabel} {t.optional}</Text>
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
                <Upload size={28} color="#94A3B8" />
                <Text style={styles.placeholderText}>{t.selectImage}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.card}>
          <View style={styles.labelRow}>
            <FileText size={16} color="#0F172A" />
            <Text style={styles.label}>{t.newsTitle}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{t.required}</Text>
            </View>
          </View>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder={t.newsTitle}
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* Summary */}
        <View style={styles.card}>
          <View style={styles.labelRow}>
            <FileText size={16} color="#0F172A" />
            <Text style={styles.label}>{t.summary} {t.optional}</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={summary}
            onChangeText={setSummary}
            multiline
            placeholder={t.summary}
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* Category */}
        <View style={styles.card}>
          <View style={styles.labelRow}>
            <Tag size={16} color="#0F172A" />
            <Text style={styles.label}>{t.category}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{t.required}</Text>
            </View>
          </View>
          <View style={styles.pickerBox}>
            <Picker
              selectedValue={category}
              onValueChange={(value) => setCategory(value)}
            >
              {CATEGORY_OPTIONS.map((item) => (
                <Picker.Item
                  key={item.value}
                  label={uiLang === "si" ? item.si : item.en}
                  value={item.value}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* District */}
        <View style={styles.card}>
          <View style={styles.labelRow}>
            <MapPin size={16} color="#0F172A" />
            <Text style={styles.label}>{t.district} {t.optional}</Text>
          </View>
          <TextInput
            style={styles.input}
            value={district}
            onChangeText={setDistrict}
            placeholder="Anuradhapura / Polonnaruwa / Kurunegala"
            placeholderTextColor="#94A3B8"
            autoCapitalize="words"
          />
        </View>

        {/* Source */}
        <View style={styles.card}>
          <View style={styles.labelRow}>
            <FileText size={16} color="#0F172A" />
            <Text style={styles.label}>{t.source}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{t.required}</Text>
            </View>
          </View>
          <TextInput
            style={styles.input}
            value={source}
            onChangeText={setSource}
            placeholder="HARTI / Met Dept / DMC / Gazette"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* URL */}
        <View style={styles.card}>
          <View style={styles.labelRow}>
            <Globe size={16} color="#0F172A" />
            <Text style={styles.label}>{t.url} {t.optional}</Text>
          </View>
          <TextInput
            style={styles.input}
            value={url}
            onChangeText={setUrl}
            placeholder="https://..."
            placeholderTextColor="#94A3B8"
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 52 : 18,
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: "#0F172A",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
    fontWeight: "600",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 14,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },
  badge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    color: "#DC2626",
    fontSize: 11,
    fontWeight: "800",
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#0F172A",
    fontSize: 14,
  },
  textarea: {
    minHeight: 92,
    textAlignVertical: "top",
  },
  pickerBox: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    overflow: "hidden",
  },
  imageButton: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    minHeight: 190,
  },
  previewImage: {
    width: "100%",
    height: 190,
    resizeMode: "cover",
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  placeholderText: {
    marginTop: 10,
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },
  submitBtn: {
    marginTop: 6,
    backgroundColor: "#16A34A",
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  btnDisabled: {
    opacity: 0.55,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
});