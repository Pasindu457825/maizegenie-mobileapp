import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import axios from "axios";
import { API_BASE } from "../../services/api";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";
import { supabase } from "../../lib/supabase"; // ✅ ADD THIS
import { Platform } from "react-native"; // ✅ REQUIRED
import { Picker } from "@react-native-picker/picker";

// 🌐 Language
import { useLanguage } from "../../context/LanguageContext";

// Icons
import { ArrowLeft, Send } from "lucide-react-native";

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
      category: "වර්ගය (price / weather / policy / alert)",
      source: "මූලාශ්‍රය (HARTI / Met Dept / DMC / Gazette)",
      url: "නිල වෙබ් ලින්ක් (URL)",
      publish: "ප්‍රකාශ කරන්න",
      back: "ආපසු",
      error: "අනිවාර්ය ක්ෂේත්‍ර හිස්",
      success: "නිල ප්‍රවෘත්තිය සාර්ථකව ප්‍රකාශිතයි",
      imageUrl: "පින්තූර ලින්ක් (අවශ්‍ය නම් පමණක්)",
    },
    en: {
      title: "Add Official News",
      subtitle: "Publish official updates for farmers",
      newsTitle: "Title",
      summary: "Summary",
      category: "Category (price / weather / policy / alert)",
      source: "Source (HARTI / Met Dept / DMC / Gazette)",
      url: "Official Source URL",
      publish: "Publish",
      back: "Back",
      error: "Required fields are missing",
      success: "Official news published successfully",
      imageUrl: "Image URL (optional)",
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
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageAsset, setImageAsset] = useState<any | null>(null);
  const [district, setDistrict] = useState("");

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageAsset(result.assets[0]); // 🔑 store whole asset
    }
  };

  const uploadOfficialNewsImage = async (asset: any): Promise<string> => {
    const fileExt = asset.uri.split(".").pop() || "jpg";
    const fileName = `official_news_${Date.now()}.${fileExt}`;
    const filePath = `news/${fileName}`;

    // ✅ READ IMAGE AS ARRAY BUFFER (NO BLOB)
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

    return data.publicUrl; // ✅ correct public image URL
  };

  // 🚀 Submit
  const submitNews = async () => {
    if (!title || !category || !source) {
      Alert.alert("Error", "Required fields missing");
      return;
    }

    try {
      setLoading(true);

      let imageUrl: string | null = null;

      // 🟢 IMAGE UPLOAD (NO BLOB)
      if (imageAsset) {
        imageUrl = await uploadOfficialNewsImage(imageAsset);
      }

      // 🟢 SEND ONLY PUBLIC URL TO BACKEND
      await axios.post(`${API_BASE}/official-news/admin`, {
        title,
        summary,
        category: category.trim().toLowerCase(),
        source,
        url: url || null,
        image_url: imageUrl,
        district: district || null,
      });

      Alert.alert("Success", "News published");

      // 🔄 RESET FORM
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color="#0F172A" />
        </TouchableOpacity>

        <View style={{ marginLeft: 12 }}>
          <Text style={styles.title}>{t.title}</Text>
          <Text style={styles.subtitle}>{t.subtitle}</Text>
        </View>
      </View>

      {/* FORM */}
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>{t.newsTitle}</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder={t.newsTitle}
        />

        <Text style={styles.label}>{t.summary}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={summary}
          onChangeText={setSummary}
          multiline
          placeholder={t.summary}
        />

        <Text style={styles.label}>
          {uiLang === "si" ? "දිස්ත්‍රික්කය (විකල්ප)" : "District (optional)"}
        </Text>

        <TextInput
          style={styles.input}
          value={district}
          onChangeText={setDistrict}
          placeholder="Anuradhapura / Polonnaruwa / Kurunegala"
          autoCapitalize="words"
        />

        <Text style={styles.label}>{t.category}</Text>
        <View style={styles.pickerWrapper}>
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

        <Text style={styles.label}>{t.source}</Text>
        <TextInput
          style={styles.input}
          value={source}
          onChangeText={setSource}
          placeholder="HARTI / Met Dept / DMC / Gazette"
        />

        <Text style={styles.label}>{t.url}</Text>
        <TextInput
          style={styles.input}
          value={url}
          onChangeText={setUrl}
          placeholder="https://..."
          autoCapitalize="none"
        />

        <Text style={styles.label}>
          {uiLang === "si" ? "පින්තූරය (විකල්ප)" : "Image (optional)"}
        </Text>

        <TouchableOpacity
          onPress={pickImage}
          style={{
            borderWidth: 1,
            borderColor: "#CBD5E1",
            borderRadius: 14,
            padding: 14,
            alignItems: "center",
            backgroundColor: "#F8FAFC",
          }}
        >
          <Text style={{ color: "#334155", fontWeight: "600" }}>
            {imageAsset && (
              <Image
                source={{ uri: imageAsset.uri }}
                style={{ width: "100%", height: 180, borderRadius: 12 }}
              />
            )}
          </Text>
        </TouchableOpacity>

        {/* IMAGE PREVIEW */}
        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={{
              width: "100%",
              height: 180,
              borderRadius: 12,
              marginTop: 10,
            }}
            resizeMode="cover"
          />
        )}

        {/* SUBMIT */}
        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.6 }]}
          onPress={submitNews}
          disabled={loading}
        >
          <Send size={18} color="#FFFFFF" />
          <Text style={styles.btnText}>{t.publish}</Text>
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    fontSize: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  btn: {
    marginTop: 28,
    backgroundColor: "#059669",
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  pickerWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
});
