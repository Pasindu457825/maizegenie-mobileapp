import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { ArrowLeft, ChevronRight, Save, Shield } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useApp } from "../../context/AppContext";
import { useLanguage } from "../../context/LanguageContext";
import {
  fetchAllTreatmentPriceOverrides,
  upsertTreatmentPriceOverride,
  TreatmentPriceOverride,
} from "../../services/diseaseTreatmentPriceApi";
import {
  generalTreatments,
  sriLankanTreatments,
} from "../../data/diseases/treatments";
import { DiseaseIdentifyStackParamList } from "../../navigation/DiseaseIdentifyStack";

type NavProp = StackNavigationProp<
  DiseaseIdentifyStackParamList,
  "TreatmentPricesAdmin"
>;

const translations = {
  en: {
    title: "Treatment Prices",
    subtitle: "Officer price management",
    accessDenied: "Access denied",
    officerOnly: "Only officers can manage treatment prices.",
    treatmentId: "Treatment ID",
    priceEn: "Price (English)",
    priceSi: "Price (Sinhala)",
    priceTa: "Price (Tamil)",
    active: "Active",
    inactive: "Inactive",
    save: "Save / Update",
    clear: "Clear",
    chooseKnownId: "Known treatment IDs",
    existingPrices: "Existing price overrides",
    noRows: "No overrides yet",
    refresh: "Pull to refresh",
    deleteTitle: "Delete price override",
    deleteMessage: "Do you want to delete this override?",
    cancel: "Cancel",
    delete: "Delete",
    required: "Please enter treatment id and price.",
    saved: "Saved",
    savedMsg: "Treatment price saved successfully.",
    deleted: "Deleted",
    deletedMsg: "Treatment price override deleted.",
    saveFailed: "Failed to save price",
    loadFailed: "Failed to load prices",
    deleteFailed: "Failed to delete price",
    edit: "Edit",
  },
  si: {
    title: "ප්‍රතිකාර මිල",
    subtitle: "නිලධාරී මිල කළමනාකරණය",
    accessDenied: "ප්‍රවේශය ප්‍රතික්ෂේපිතයි",
    officerOnly: "ප්‍රතිකාර මිල කළමනාකරණයට නිලධාරීන්ට පමණක් අවසර ඇත.",
    treatmentId: "ප්‍රතිකාර ID",
    priceEn: "මිල (English)",
    priceSi: "මිල (සිංහල)",
    priceTa: "මිල (தமிழ்)",
    active: "සක්‍රිය",
    inactive: "අක්‍රිය",
    save: "සුරකින්න / යාවත්කාලීන කරන්න",
    clear: "පිරිසිදු කරන්න",
    chooseKnownId: "දන්නා ප්‍රතිකාර ID",
    existingPrices: "පවතින මිල Overrides",
    noRows: "තවම override නොමැත",
    refresh: "Refresh කිරීමට ඇදගෙන යන්න",
    deleteTitle: "මිල override මකන්න",
    deleteMessage: "මෙම override එක මකා දැමීමට අවශ්‍යද?",
    cancel: "අවලංගු කරන්න",
    delete: "මකන්න",
    required: "Treatment id සහ මිල ඇතුලත් කරන්න.",
    saved: "සුරකින ලදී",
    savedMsg: "ප්‍රතිකාර මිල සාර්ථකව සුරකින ලදී.",
    deleted: "මකා දමන ලදී",
    deletedMsg: "ප්‍රතිකාර මිල override මකා දමන ලදී.",
    saveFailed: "මිල සුරකීමට අසමත් විය",
    loadFailed: "මිල ලබා ගැනීමට අසමත් විය",
    deleteFailed: "මිල මකා දැමීමට අසමත් විය",
    edit: "සංස්කරණය",
  },
  ta: {
    title: "சிகிச்சை விலைகள்",
    subtitle: "அதிகாரி விலை மேலாண்மை",
    accessDenied: "அணுகல் மறுக்கப்பட்டது",
    officerOnly: "சிகிச்சை விலைகளை அதிகாரிகள் மட்டுமே நிர்வகிக்கலாம்.",
    treatmentId: "சிகிச்சை ID",
    priceEn: "விலை (English)",
    priceSi: "விலை (Sinhala)",
    priceTa: "விலை (Tamil)",
    active: "செயலில்",
    inactive: "செயலில்லை",
    save: "சேமி / புதுப்பி",
    clear: "அழி",
    chooseKnownId: "அறியப்பட்ட சிகிச்சை IDகள்",
    existingPrices: "இருக்கும் விலை Overrides",
    noRows: "Override இல்லை",
    refresh: "புதுப்பிக்க கீழே இழுக்கவும்",
    deleteTitle: "விலை override நீக்கு",
    deleteMessage: "இந்த override-ஐ நீக்கவா?",
    cancel: "ரத்து",
    delete: "நீக்கு",
    required: "Treatment id மற்றும் விலையை உள்ளிடவும்.",
    saved: "சேமிக்கப்பட்டது",
    savedMsg: "சிகிச்சை விலை வெற்றிகரமாக சேமிக்கப்பட்டது.",
    deleted: "நீக்கப்பட்டது",
    deletedMsg: "சிகிச்சை விலை override நீக்கப்பட்டது.",
    saveFailed: "விலை சேமிக்க முடியவில்லை",
    loadFailed: "விலைகளை பெற முடியவில்லை",
    deleteFailed: "விலை நீக்க முடியவில்லை",
    edit: "திருத்து",
  },
};

export default function TreatmentPricesAdminScreen() {
  const navigation = useNavigation<NavProp>();
  const { user } = useApp();
  const { language } = useLanguage();
  const t =
    translations[language === "sinhala" ? "si" : language === "tamil" ? "ta" : "en"];

  const [rows, setRows] = useState<TreatmentPriceOverride[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);
  const [selectedTreatmentLabel, setSelectedTreatmentLabel] = useState("");

  const [treatmentId, setTreatmentId] = useState("");
  const [price, setPrice] = useState("");
  const [isActive, setIsActive] = useState(true);
  const normalizeTreatmentId = (id: string) =>
    id.trim().toLowerCase().replace(/_(low|medium|high)$/i, "");

  const toTitle = (value: string) =>
    value
      .replace(/_/g, " ")
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const knownTreatmentIds = useMemo(() => {
    const grouped = new Map<string, Map<string, string>>();

    Object.entries(sriLankanTreatments).forEach(([diseaseKey, treatments]) => {
      const diseaseName = toTitle(diseaseKey);
      if (!grouped.has(diseaseName)) {
        grouped.set(diseaseName, new Map());
      }
      const diseaseGroup = grouped.get(diseaseName)!;

      treatments.forEach((treatment) => {
        const id = normalizeTreatmentId(treatment.id);
        if (!diseaseGroup.has(id)) {
          diseaseGroup.set(id, treatment.name.en);
        }
      });
    });

    if (!grouped.has("General")) {
      grouped.set("General", new Map());
    }
    const generalGroup = grouped.get("General")!;
    generalTreatments.forEach((treatment) => {
      const id = normalizeTreatmentId(treatment.id);
      if (!generalGroup.has(id)) {
        generalGroup.set(id, treatment.name.en);
      }
    });

    return Array.from(grouped.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([disease, items]) => ({
        disease,
        items: Array.from(items.entries())
          .sort((a, b) => a[1].localeCompare(b[1]))
          .map(([id, treatmentName]) => ({
            id,
            label: treatmentName,
          })),
      }));
  }, []);

  const knownTreatmentPriceMap = useMemo(() => {
    const map = new Map<string, string>();
    rows.forEach((row) => {
      const id = normalizeTreatmentId(row.treatment_id);
      const value = row.price;
      if (value !== undefined && value !== null && `${value}`.trim() !== "") {
        map.set(id, `${value}`);
      }
    });
    return map;
  }, [rows]);

  const knownTreatmentStatusMap = useMemo(() => {
    const map = new Map<string, string>();
    rows.forEach((row) => {
      const id = normalizeTreatmentId(row.treatment_id);
      if (typeof row.is_active === "boolean") {
        map.set(id, row.is_active ? t.active : t.inactive);
      }
    });
    return map;
  }, [rows, t.active, t.inactive]);

  const resetForm = () => {
    setTreatmentId("");
    setPrice("");
    setIsActive(true);
  };

  const openEditorForTreatment = (id: string, label?: string) => {
    const normalizedId = normalizeTreatmentId(id);
    const row = rows.find(
      (item) => normalizeTreatmentId(item.treatment_id) === normalizedId
    );

    setTreatmentId(normalizedId);
    setSelectedTreatmentLabel(label ?? toTitle(normalizedId));
    setPrice(row?.price ?? "");
    setIsActive(row?.is_active ?? true);
    setEditorVisible(true);
  };

  const loadRows = async () => {
    try {
      const data = await fetchAllTreatmentPriceOverrides();
      setRows(data);
    } catch (error: any) {
      Alert.alert(t.loadFailed, error?.message ?? "Unknown error");
    }
  };

  useEffect(() => {
    if (user?.role !== "officer") {
      Alert.alert(t.accessDenied, t.officerOnly, [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
      return;
    }
    loadRows();
  }, [navigation, t.accessDenied, t.officerOnly, user?.role]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRows();
    setRefreshing(false);
  };

  const onSave = async () => {
    if (!treatmentId.trim() || !price.trim()) {
      Alert.alert(t.required);
      return;
    }

    try {
      setSaving(true);
      await upsertTreatmentPriceOverride({
        treatmentId: normalizeTreatmentId(treatmentId),
        price: price.trim(),
        isActive,
      });
      Alert.alert(t.saved, t.savedMsg);
      await loadRows();
      setEditorVisible(false);
      resetForm();
    } catch (error: any) {
      Alert.alert(t.saveFailed, error?.message ?? "Unknown error");
    } finally {
      setSaving(false);
    }
  };


  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#10ad79ff", "#0f9d6b"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.8}
        >
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t.title}</Text>
          <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
        </View>
        <View style={styles.headerIcon}>
          <Shield size={18} color="#FFFFFF" />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t.chooseKnownId}</Text>
          {knownTreatmentIds.map((group) => (
            <View key={group.disease} style={styles.groupBlock}>
              <Text style={styles.groupTitle}>{group.disease}</Text>
              <View style={styles.treatmentList}>
                {group.items.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.treatmentRow}
                    onPress={() => openEditorForTreatment(item.id, item.label)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.treatmentContent}>
                      <Text style={styles.treatmentName}>{item.label}</Text>
                      <View style={styles.metaRow}>
                        <View style={styles.metaBadge}>
                          <Text style={styles.metaLabel}>Price</Text>
                          <Text style={styles.metaValue}>
                            {knownTreatmentPriceMap.get(item.id) ?? "-"}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.metaBadge,
                            knownTreatmentStatusMap.get(item.id) === t.active
                              ? styles.metaBadgeActive
                              : null,
                          ]}
                        >
                          <Text style={styles.metaLabel}>Status :</Text>
                          <Text style={styles.metaValue}>
                            {knownTreatmentStatusMap.get(item.id) ?? "-"}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <ChevronRight size={16} color="#047857" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

      </ScrollView>

      <Modal
        visible={editorVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setEditorVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.sectionTitle}>{selectedTreatmentLabel}</Text>
            <Text style={styles.modalIdText}>{t.treatmentId}: {treatmentId}</Text>

            <Text style={styles.label}>Price</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="3,000 - 5,000"
              placeholderTextColor="#94A3B8"
            />

            <View style={styles.toggleRow}>
              <Text style={styles.label}>{isActive ? t.active : t.inactive}</Text>
              <TouchableOpacity
                style={[styles.toggleButton, isActive && styles.toggleButtonActive]}
                onPress={() => setIsActive((prev) => !prev)}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    isActive && styles.toggleButtonTextActive,
                  ]}
                >
                  {isActive ? t.active : t.inactive}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formActionRow}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={onSave}
                disabled={saving}
              >
                <Save size={16} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>{t.save}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setEditorVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.clearButtonText}>{t.cancel}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FDF4" },
  header: {
    paddingTop: 50,
    paddingBottom: 18,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: { flex: 1, marginHorizontal: 10 },
  headerTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "800" },
  headerSubtitle: { color: "#D1FAE5", fontSize: 12, marginTop: 2 },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 28 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    padding: 14,
  },
  modalIdText: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 6,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D1FAE5",
    padding: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#065F46",
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0F172A",
    backgroundColor: "#F8FFFB",
  },
  toggleRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleButton: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F8FAFC",
  },
  toggleButtonActive: {
    borderColor: "#059669",
    backgroundColor: "#ECFDF5",
  },
  toggleButtonText: {
    color: "#475569",
    fontWeight: "600",
    fontSize: 12,
  },
  toggleButtonTextActive: {
    color: "#065F46",
  },
  formActionRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
  },
  saveButton: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: "#059669",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  clearButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  clearButtonText: {
    color: "#334155",
    fontWeight: "700",
    fontSize: 13,
  },
  sectionTitle: { color: "#0F172A", fontSize: 15, fontWeight: "800" },
  groupBlock: {
    marginTop: 10,
  },
  groupTitle: {
    color: "#065F46",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 6,
  },
  treatmentList: {
    gap: 8,
  },
  treatmentRow: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  treatmentContent: {
    flex: 1,
    marginRight: 10,
  },
  treatmentName: {
    color: "#065F46",
    fontSize: 13,
    fontWeight: "700",
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  metaBadge: {
    borderRadius: 999,
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaBadgeActive: {
    backgroundColor: "#BBF7D0",
  },
  metaLabel: {
    color: "#065F46",
    fontSize: 10,
    fontWeight: "700",
  },
  metaValue: {
    color: "#064E3B",
    fontSize: 10,
    fontWeight: "700",
  },
});
