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
  Modal,
} from "react-native";
import axios from "axios";
import { API_BASE } from "../../../services/api";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../../lib/supabase";
import { useLanguage } from "../../../context/LanguageContext";
import { ArrowLeft, Send, Upload, Plus, Trash2 } from "lucide-react-native";

/* ---------------- TYPES ---------------- */
type Block = {
  subtitle: string;
  content: string;
  image_url?: string;
};

export default function ProAdvisorAdminAddScreen() {
  const navigation = useNavigation<any>();
  const { language } = useLanguage();
  const uiLang: "si" | "en" = language === "sinhala" ? "si" : "en";

  const t = {
    si: {
      title: "Pro Advisor එකතු කරන්න",
      subtitle: "ගොවීන් සඳහා වෘත්තීය උපදෙස් සකසන්න",
      mainTitle: "ප්‍රධාන ශීර්ෂය",
      sectionTitle: "අනු ශීර්ෂය",
      content: "විස්තරය",
      addSection: "අලුත් කොටසක් එකතු කරන්න",
      publish: "ප්‍රකාශ කරන්න",
      publishing: "ප්‍රකාශ වෙමින්...",
      success: "Pro Advisor සාර්ථකව සුරක්ෂිතයි",
    },
    en: {
      title: "Add Pro Advisor",
      subtitle: "Create professional advisory content",
      mainTitle: "Main Title",
      sectionTitle: "Sub Title",
      content: "Content",
      addSection: "Add New Section",
      publish: "Publish",
      publishing: "Publishing...",
      success: "Pro Advisor saved successfully",
    },
  }[uiLang];

  /* ---------------- STATE ---------------- */
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([
    { subtitle: "", content: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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

    if (error) {
      console.log("Upload error:", error);
      throw error;
    }

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
      const asset = result.assets[0];

      try {
        const url = await uploadImage(asset);
        updateBlock(index, "image_url", url);
      } catch {
        Alert.alert("Error", "Image upload failed");
      }
    }
  };

  /* ---------------- BLOCK HANDLERS ---------------- */
  const updateBlock = (index: number, field: keyof Block, value: string) => {
    const arr = [...blocks];
    arr[index][field] = value;
    setBlocks(arr);
  };

  const addBlock = () => setBlocks([...blocks, { subtitle: "", content: "" }]);

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

    if (blocks.some((b) => !b.subtitle.trim() || !b.content.trim())) {
      Alert.alert("Error", "All sections must be filled");
      return;
    }

    try {
      setLoading(true);

      await axios.post(`${API_BASE}/pro-advisor`, {
        title,
        blocks, // 👈 image_url already inside
        language: uiLang,
      });

      setShowSuccess(true);
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
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
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Send size={18} color="#fff" />
          )}
          <Text style={styles.submitText}>
            {loading ? t.publishing : t.publish}
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

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#F0FDF4",
  },

  /* ================= HEADER ================= */
  header: {
    marginTop: 12,
    paddingTop: Platform.OS === "ios" ? 52 : 18,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#065F46",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  headerSubtitle: {
    fontSize: 12,
    color: "#D1FAE5",
    marginTop: 2,
    fontWeight: "600",
  },

  /* ================= CONTENT ================= */
  container: {
    padding: 16,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },

  label: {
    fontSize: 14,
    fontWeight: "800",
    color: "#065F46",
    marginBottom: 6,
  },

  section: {
    fontSize: 15,
    fontWeight: "900",
    color: "#047857",
    marginBottom: 10,
  },

  /* ================= INPUTS ================= */
  input: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#064E3B",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },

  textarea: {
    minHeight: 110,
    textAlignVertical: "top",
  },

  /* ================= IMAGE ================= */
  preview: {
    width: "100%",
    height: 180,
    borderRadius: 14,
    marginTop: 8,
    marginBottom: 10,
    backgroundColor: "#ECFDF5",
  },

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

  imageBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#047857",
  },

  /* ================= ROW ================= */
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },

  /* ================= ADD SECTION ================= */
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#ECFDF5",
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: "#6EE7B7",
  },

  addText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#065F46",
    letterSpacing: 0.3,
  },

  /* ================= SUBMIT ================= */
  submitBtn: {
    backgroundColor: "#10B981",
    borderRadius: 18,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },

  submitText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.4,
  },

  /* ================= SUCCESS MODAL ================= */
  successOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  successCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: "85%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },

  successText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#065F46",
    textAlign: "center",
    marginBottom: 18,
  },
});
