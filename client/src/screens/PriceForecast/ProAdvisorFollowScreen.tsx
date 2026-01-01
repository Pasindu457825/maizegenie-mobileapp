import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import axios from "axios";
import {
  ArrowLeft,
  Plus,
  ChevronDown,
  Pencil,
  Trash2,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useLanguage } from "../../context/LanguageContext";
import { API_BASE } from "../../services/api";
import { useApp } from "../../context/AppContext";

/* ---------- Android animation enable ---------- */
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/* ---------- Types ---------- */
type AdvisorBlock = {
  subtitle: string;
  content: string;
  image_url?: string;
};

type ProAdvisorItem = {
  id: string;
  title: string;
  blocks: AdvisorBlock[];
  language: "si" | "en";
};

/* ---------- Screen ---------- */
export default function ProAdvisorListScreen() {
  const navigation = useNavigation() as any;
  const { language: globalLang } = useLanguage();
  const language: "si" | "en" = globalLang === "sinhala" ? "si" : "en";

  const [data, setData] = useState<ProAdvisorItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useApp();

  const isOfficer = user?.role === "officer";

  /* ---------- Fetch ---------- */
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE}/pro-advisor?language=${language}`
      );
      setData(res.data || []);
    } catch (e) {
      console.log("❌ Fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [language]);

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  };


  /* ---------- UI ---------- */
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#065F46" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {language === "si" ? "Pro Advisor උපදෙස්" : "Pro Advisor Guidance"}
        </Text>

        {isOfficer ? (
          <TouchableOpacity
            onPress={() => navigation.navigate("ProAdvisorAdminAdd")}
            activeOpacity={0.85}
          >
            <Plus size={24} color="#065F46" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      {/* CONTENT */}
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {data.map((item) => {
            const isOpen = expandedId === item.id;

            return (
              <View key={item.id} style={styles.cardWrapper}>
                {/* TITLE CARD */}
                <TouchableOpacity
                  style={styles.card}
                  activeOpacity={0.85}
                  onPress={() => toggleExpand(item.id)}
                >
                  <Text style={styles.cardTitle}>{item.title}</Text>

                  <ChevronDown
                    size={20}
                    color="#065F46"
                    style={{
                      transform: [{ rotate: isOpen ? "180deg" : "0deg" }],
                    }}
                  />
                </TouchableOpacity>

                {/* OFFICER ACTIONS */}
                {isOfficer && isOpen && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() =>
                        navigation.navigate("ProAdvisorAdminEdit", {
                          advisorId: item.id,
                        })
                      }
                    >
                      <Pencil size={16} color="#065F46" />
                      <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* EXPANDED CONTENT */}
                {isOpen &&
                  item.blocks.map((block, idx) => (
                    <View key={idx} style={styles.blockCard}>
                      <Text style={styles.subTitle}>{block.subtitle}</Text>
                      <Text style={styles.contentText}>{block.content}</Text>

                      {block.image_url && (
                        <Image
                          source={{ uri: block.image_url }}
                          style={styles.image}
                        />
                      )}
                    </View>
                  ))}
              </View>
            );
          })}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "800",
    color: "#065F46",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    padding: 16,
  },

  cardWrapper: {
    marginBottom: 16,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#D1FAE5",
  },

  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    color: "#065F46",
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 8,
  },

  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#6EE7B7",
  },

  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },

  actionText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#065F46",
  },

  deleteText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#B91C1C",
  },

  blockCard: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  subTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#047857",
    marginBottom: 4,
  },

  contentText: {
    fontSize: 13.5,
    color: "#374151",
    lineHeight: 22,
  },

  image: {
    width: "100%",
    height: 180,
    borderRadius: 14,
    marginTop: 10,
  },
});
