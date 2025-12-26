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
    },
  };

  const t = content[uiLang];

  // 📝 Form state
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("price");
  const [source, setSource] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // 🚀 Submit
  const submitNews = async () => {
    if (!title || !category || !source) {
      Alert.alert("Error", t.error);
      return;
    }

    try {
      setLoading(true);

      await axios.post(`${API_BASE}/official-news/admin`, {
        title,
        summary,
        category,
        source,
        url,
      });

      Alert.alert("Success", t.success);

      // reset
      setTitle("");
      setSummary("");
      setCategory("price");
      setSource("");
      setUrl("");

      navigation.goBack();
    } catch (err) {
      Alert.alert("Error", "Failed to publish news");
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

        <Text style={styles.label}>{t.category}</Text>
        <TextInput
          style={styles.input}
          value={category}
          onChangeText={setCategory}
          placeholder="price / weather / policy / alert"
          autoCapitalize="none"
        />

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
});
