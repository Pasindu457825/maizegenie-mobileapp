import React, { useEffect, useState } from "react";
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
import { API_BASE } from "../../../services/api";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../../lib/supabase";
import { useLanguage } from "../../../context/LanguageContext";
import { ArrowLeft, Save, Upload, Plus, Trash2 } from "lucide-react-native";

/* ---------------- TYPES ---------------- */
type Block = {
  subtitle: string;
  content: string;
  image_url?: string;
};

export default function ProAdvisorAdminEditScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { advisorId } = route.params;

  const { language } = useLanguage();
  const uiLang: "si" | "en" = language === "sinhala" ? "si" : "en";

  const t = {
    si: {
      title: "Pro Advisor සංස්කරණය",
      subtitle: "දැනට ඇති උපදෙස් යාවත්කාලීන කරන්න",
      mainTitle: "ප්‍රධාන ශීර්ෂය",
      sectionTitle: "අනු ශීර්ෂය",
      content: "විස්තරය",
      addSection: "අලුත් කොටසක් එකතු කරන්න",
      save: "යාවත්කාලීන කරන්න",
      saving: "සුරක්ෂිත වෙමින්...",
      success: "Pro Advisor සාර්ථකව යාවත්කාලීන විය",
    },
    en: {
      title: "Edit Pro Advisor",
      subtitle: "Update existing advisory content",
      mainTitle: "Main Title",
      sectionTitle: "Sub Title",
      content: "Content",
      addSection: "Add New Section",
      save: "Update",
      saving: "Updating...",
      success: "Pro Advisor updated successfully",
    },
  }[uiLang];

  /* ---------------- STATE ---------------- */
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  /* ---------------- LOAD EXISTING ---------------- */
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/pro-advisor/${advisorId}`);
      setTitle(res.data.title);
      setBlocks(res.data.blocks || []);
    } catch (e) {
      Alert.alert("Error", "Failed to load data");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- IMAGE UPLOAD (NEWS STYLE) ---------------- */
  const uploadImage = async (asset: ImagePicker.ImagePickerAsset) => {
    const ext = asset.uri.split(".").pop() || "jpg";
    const fileName = `block_${Date.now()}.${ext}`;
    const filePath = `blocks/${fileName}`;

    const response = await fetch(asset.uri);
    const buffer = await response.arrayBuffer();

    const { error } = await supabase.storage
      .from("pro-advisor-images")
      .upload(filePath, buffer, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from("pro-advisor-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const pickImage = async (index: number) => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      try {
        const url = await uploadImage(result.assets[0]);
        updateBlock(index, "image_url", url);
      } catch {
        Alert.alert("Error", "Image upload failed");
      }
    }
  };

  /* ---------------- BLOCK HANDLERS ---------------- */
  const updateBlock = (
    index: number,
    field: keyof Block,
    value: string
  ) => {
    const arr = [...blocks];
    arr[index][field] = value;
    setBlocks(arr);
  };

  const addBlock = () =>
    setBlocks([...blocks, { subtitle: "", content: "" }]);

  const removeBlock = (index: number) => {
    const arr = [...blocks];
    arr.splice(index, 1);
    setBlocks(arr);
  };

  /* ---------------- SUBMIT ---------------- */
  const submit = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Title required");
      return;
    }

    if (blocks.some(b => !b.subtitle.trim() || !b.content.trim())) {
      Alert.alert("Error", "All sections must be filled");
      return;
    }

    try {
      setSaving(true);

      await axios.patch(`${API_BASE}/pro-advisor/${advisorId}`, {
        title,
        blocks,
      });

      setShowSuccess(true);
    } catch (e) {
      Alert.alert("Error", "Update failed");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- UI ---------------- */
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#047857" />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.headerTitle}>{t.title}</Text>
          <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* TITLE */}
        <View style={styles.card}>
          <Text style={styles.label}>{t.mainTitle}</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* BLOCKS */}
        {blocks.map((b, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.section}>Section {i + 1}</Text>

            <TextInput
              style={styles.input}
              placeholder={t.sectionTitle}
              value={b.subtitle}
              onChangeText={(v) => updateBlock(i, "subtitle", v)}
            />

            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder={t.content}
              multiline
              value={b.content}
              onChangeText={(v) => updateBlock(i, "content", v)}
            />

            {b.image_url && (
              <Image source={{ uri: b.image_url }} style={styles.preview} />
            )}

            <View style={styles.row}>
              <TouchableOpacity
                style={styles.imageBtn}
                onPress={() => pickImage(i)}
              >
                <Upload size={16} color="#2E7D32" />
                <Text style={styles.imageBtnText}>Image</Text>
              </TouchableOpacity>

              {blocks.length > 1 && (
                <TouchableOpacity onPress={() => removeBlock(i)}>
                  <Trash2 size={18} color="#C62828" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addBtn} onPress={addBlock}>
          <Plus size={18} color="#1B5E20" />
          <Text style={styles.addText}>{t.addSection}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={submit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Save size={18} color="#fff" />
          )}
          <Text style={styles.submitText}>
            {saving ? t.saving : t.save}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* SUCCESS MODAL */}
      <Modal visible={showSuccess} transparent>
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <Text style={styles.successText}>{t.success}</Text>
            <TouchableOpacity
              onPress={() => {
                setShowSuccess(false);
                navigation.goBack();
              }}
            >
              <Text style={{ fontWeight: "800" }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ================= STYLES (SAME AS ADD) ================= */
const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#F0FDF4" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    paddingTop: Platform.OS === "ios" ? 52 : 18,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#065F46",
    flexDirection: "row",
    alignItems: "center",
  },

  headerTitle: { fontSize: 18, fontWeight: "800", color: "#fff" },
  headerSubtitle: { fontSize: 12, color: "#D1FAE5", marginTop: 2 },

  container: { padding: 16, paddingBottom: 40 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },

  label: { fontSize: 14, fontWeight: "800", color: "#065F46", marginBottom: 6 },
  section: { fontSize: 15, fontWeight: "900", color: "#047857", marginBottom: 10 },

  input: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    fontSize: 14,
    fontWeight: "600",
  },

  textarea: { minHeight: 110, textAlignVertical: "top" },

  preview: {
    width: "100%",
    height: 180,
    borderRadius: 14,
    marginBottom: 10,
  },

  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },

  imageBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },

  imageBtnText: { fontSize: 13, fontWeight: "800", color: "#047857" },

  addBtn: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#ECFDF5",
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: "#6EE7B7",
  },

  addText: { fontSize: 14, fontWeight: "900", color: "#065F46" },

  submitBtn: {
    backgroundColor: "#10B981",
    borderRadius: 18,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },

  submitText: { color: "#fff", fontSize: 15, fontWeight: "900" },

  successOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  successCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "85%",
    alignItems: "center",
  },

  successText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#065F46",
    marginBottom: 18,
  },
});
