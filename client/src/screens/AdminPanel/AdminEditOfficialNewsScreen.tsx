import React, { useEffect, useMemo, useState } from "react";
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
  KeyboardAvoidingView,
} from "react-native";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { API_BASE } from "../../services/api";
import { supabase } from "../../lib/supabase";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

export default function AdminEditOfficialNewsScreen({
  route,
  navigation,
}: any) {
  const { newsId } = route.params;

  const CATEGORY_OPTIONS = [
    { value: "price", label: "මිල / Price" },
    { value: "weather", label: "කාලගුණය / Weather" },
    { value: "policy", label: "ප්‍රතිපත්ති / Policy" },
    { value: "alert", label: "අනතුරු ඇඟවීම / Alert" },
    { value: "pest", label: "පළිබෝධ / Pest" },
    { value: "disease", label: "රෝග / Disease" },
    { value: "fertilizer", label: "පොහොර / Fertilizer" },
    { value: "cultivation", label: "වගා උපදෙස් / Cultivation" },
    { value: "program", label: "වැඩසටහන් / Program" },
  ];

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("price");
  const [source, setSource] = useState("");
  const [url, setUrl] = useState("");
  const [district, setDistrict] = useState(""); // ✅ NEW
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageAsset, setImageAsset] = useState<any>(null);
  const [visibleToFarmers, setVisibleToFarmers] = useState(true);
  const [loading, setLoading] = useState(false);

  // ===============================
  // LOAD NEWS (same logic)
  // ===============================
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/official-news/${newsId}`);
        if (!mounted) return;

        const n = res.data;
        setTitle(n.title);
        setSummary(n.summary || "");
        setCategory(n.category);
        setSource(n.source);
        setUrl(n.url || "");
        setDistrict(n.district || ""); // ✅ NEW
        setImageUrl(n.image_url);
        setVisibleToFarmers(n.is_visible_to_farmers);
      } catch (e: any) {
        Alert.alert("Error", e?.message || "Failed to load news");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [newsId]);

  // ===============================
  // IMAGE PICK (same logic)
  // ===============================
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

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });

      if (!res.canceled) {
        setImageAsset(res.assets[0]);
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Image picker failed");
    }
  };

  // ===============================
  // UPLOAD IMAGE (same logic)
  // ===============================
  const uploadImage = async (asset: any) => {
    const ext = asset.uri.split(".").pop() || "jpg";
    const name = `official_news_${Date.now()}.${ext}`;
    const path = `news/${name}`;

    const response = await fetch(asset.uri);
    const buffer = await response.arrayBuffer();

    const { error } = await supabase.storage
      .from("official-news-images")
      .upload(path, buffer, { contentType: "image/jpeg" });

    if (error) throw error;

    const { data } = supabase.storage
      .from("official-news-images")
      .getPublicUrl(path);
    return data.publicUrl;
  };

  const canSubmit = useMemo(() => {
    const t = title.trim();
    const s = source.trim();
    const c = category.trim();
    return t.length >= 3 && s.length >= 2 && c.length >= 2;
  }, [title, source, category]);

  // ===============================
  // UPDATE (same logic)
  // ===============================
  const updateNews = async () => {
    try {
      if (!canSubmit) {
        Alert.alert(
          "Missing details",
          "Please fill Title, Category, and Source."
        );
        return;
      }

      setLoading(true);

      let finalImageUrl = imageUrl;
      if (imageAsset) {
        finalImageUrl = await uploadImage(imageAsset);
      }

      await axios.patch(`${API_BASE}/official-news/admin/${newsId}`, {
        title: title.trim(),
        summary: summary?.trim() || "",
        category: category.trim(),
        source: source.trim(),
        url: url?.trim() ? url.trim() : null,
        district: district?.trim() ? district.trim() : null, // ✅ NEW
        image_url: finalImageUrl,
        is_visible_to_farmers: visibleToFarmers,
      });

      Alert.alert("Success", "News updated");
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // DELETE (same logic)
  // ===============================
  const deleteNews = async () => {
    Alert.alert("Confirm", "Delete this news?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            await axios.delete(`${API_BASE}/official-news/admin/${newsId}`);
            Alert.alert("Deleted", "News removed");
            navigation.goBack();
          } catch (e: any) {
            Alert.alert("Error", e?.message || "Delete failed");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const previewUri = imageAsset?.uri || imageUrl || null;


  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.85}
        >
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.topTitle}>Edit Official News</Text>

        <View style={{ width: 64 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Image Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cover Image</Text>

          {previewUri ? (
            <View style={styles.imageWrap}>
              <Image source={{ uri: previewUri }} style={styles.image} />
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>No image selected</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={pickImage}
            style={styles.secondaryBtn}
            activeOpacity={0.9}
          >
            <Text style={styles.secondaryBtnText}>Change Image</Text>
          </TouchableOpacity>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Details</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter title"
              placeholderTextColor="#94A3B8"
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Summary</Text>
            <TextInput
              value={summary}
              onChangeText={setSummary}
              placeholder="Short summary (optional)"
              placeholderTextColor="#94A3B8"
              style={[styles.input, styles.textarea]}
              multiline
            />
          </View>

          <View style={styles.row}>
            {/* Category */}
            <View style={[styles.field, { flex: 1.2 }]}>
              <Text style={styles.label}>Category</Text>

              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={category}
                  onValueChange={(value) => setCategory(value)}
                >
                  {CATEGORY_OPTIONS.map((item) => (
                    <Picker.Item
                      key={item.value}
                      label={item.label}
                      value={item.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={{ width: 12 }} />

            {/* District */}
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>District (optional)</Text>
              <TextInput
                value={district}
                onChangeText={setDistrict}
                placeholder="Kurunegala"
                placeholderTextColor="#94A3B8"
                style={styles.input}
                autoCapitalize="words"
              />
            </View>

            <View style={{ width: 12 }} />

            {/* Source */}
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Source</Text>
              <TextInput
                value={source}
                onChangeText={setSource}
                placeholder="HARTI"
                placeholderTextColor="#94A3B8"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>URL (optional)</Text>
            <TextInput
              value={url}
              onChangeText={setUrl}
              placeholder="https://..."
              placeholderTextColor="#94A3B8"
              style={styles.input}
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Visibility Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Visibility</Text>

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Visible to Farmers</Text>
              <Text style={styles.switchHint}>
                Turn off to hide this news from farmer feed (officers can still
                manage it).
              </Text>
            </View>

            <Switch
              value={visibleToFarmers}
              onValueChange={setVisibleToFarmers}
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={updateNews}
            disabled={loading || !canSubmit}
            style={[
              styles.primaryBtn,
              (loading || !canSubmit) && styles.btnDisabled,
            ]}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryBtnText}>
              {loading ? "Updating..." : "Update News"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={deleteNews}
            disabled={loading}
            style={[styles.dangerBtn, loading && styles.btnDisabled]}
            activeOpacity={0.9}
          >
            <Text style={styles.dangerBtnText}>Delete News</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay} pointerEvents="auto">
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Please wait...</Text>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8FAFC" },

  topBar: {
    paddingTop: Platform.OS === "ios" ? 52 : 18,
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: "#0F172A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  backBtn: {
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 64,
    alignItems: "center",
  },
  backBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },

  scroll: { flex: 1 },
  container: { padding: 16, paddingTop: 14 },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 10,
  },

  imageWrap: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F1F5F9",
  },
  image: { width: "100%", height: 190, resizeMode: "cover" },

  imagePlaceholder: {
    height: 190,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderText: { color: "#64748B", fontWeight: "600" },

  field: { marginBottom: 12 },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 6,
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
  textarea: { minHeight: 92, textAlignVertical: "top" },

  row: { flexDirection: "row", alignItems: "flex-start" },

  secondaryBtn: {
    marginTop: 12,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  secondaryBtnText: { color: "#1D4ED8", fontWeight: "800", fontSize: 12 },

  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  switchLabel: { fontSize: 13, fontWeight: "800", color: "#0F172A" },
  switchHint: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748B",
    lineHeight: 16,
  },

  actions: { marginTop: 6, gap: 10 },

  primaryBtn: {
    backgroundColor: "#16A34A",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryBtnText: { color: "#FFFFFF", fontWeight: "900", fontSize: 14 },

  dangerBtn: {
    backgroundColor: "#DC2626",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  dangerBtnText: { color: "#FFFFFF", fontWeight: "900", fontSize: 14 },

  btnDisabled: { opacity: 0.55 },

  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  loadingBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 18,
    minWidth: 220,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "700",
  },
  pickerWrapper: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    overflow: "hidden",
  },
});
