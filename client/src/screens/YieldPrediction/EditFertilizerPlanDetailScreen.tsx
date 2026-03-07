/**
 * Edit Fertilizer Plan Detail Screen (Officer View)
 * Allows officers to edit individual fertilizer plan dosages for a specific variety.
 * Saves changes to Supabase.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  ArrowLeft,
  Save,
  Leaf,
  Droplets,
  Calendar,
  RotateCcw,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLanguage } from "../../context/LanguageContext";
import { useApp } from "../../context/AppContext";
import {
  upsertFertilizerPlan,
  buildDefaultPlans,
  FertilizerPlanRecord,
} from "../../services/fertilizerPlanService";

type Language = "si" | "en" | "ta";

const translations = {
  si: {
    title: "සැලසුම සංස්කරණය",
    basalApplication: "මූලික යෙදීම (වගා කිරීමේදී)",
    firstTopDressing: "1 වන ඉහළ පොහොර යෙදීම",
    secondTopDressing: "2 වන ඉහළ පොහොර යෙදීම",
    organicFertilizer: "කාබනික පොහොර (ටොන්/හෙක්ටයාර)",
    yieldPotential: "අස්වැන්න විභවය (ටොන්/හෙක්ටයාර)",
    otherSettings: "වෙනත් සැකසුම්",
    tspKgPerHa: "TSP (කි.ග්‍රෑ/හෙ)",
    mopKgPerHa: "MOP (කි.ග්‍රෑ/හෙ)",
    ureaKgPerHa: "Urea (කි.ග්‍රෑ/හෙ)",
    daysAfterPlanting: "වගා කිරීමෙන් පසු දින",
    timing: "කාලය",
    compost: "කොම්පෝස්ට් (ටොන්/හෙ)",
    cattleManure: "ගොම පොහොර (ටොන්/හෙ)",
    poultryManure: "කුකුළ් පොහොර (ටොන්/හෙ)",
    minYield: "අවම",
    maxYield: "උපරිම",
    avgYield: "සාමාන්‍ය",
    growthDuration: "වර්ධන කාලය (දින)",
    fertilizerMultiplier: "පොහොර ගුණකය",
    notes: "සටහන්",
    notesPlaceholder: "මෙම සැලසුම ගැන සටහන් එකතු කරන්න...",
    saveChanges: "වෙනස්කම් සුරකින්න",
    saving: "සුරකිමින්...",
    resetToDefault: "DOA පෙරනිමි වෙත යළි පිහිටුවන්න",
    resetConfirmTitle: "යළි පිහිටුවන්නද?",
    resetConfirmMessage: "මෙම ප්‍රභේදය සඳහා DOA පෙරනිමි අගයන් යළි පූරණය කරන්නද?",
    cancel: "අවලංගු",
    confirm: "තහවුරු",
    saveSuccess: "සැලසුම සාර්ථකව සුරකින ලදී!",
    saveError: "සැලසුම සුරැකීමට අසමත් විය",
    hybrid: "හයිබ්‍රිඩ්",
    openPollinated: "විවෘත පරාගනය",
    local: "දේශීය ප්‍රභේදය",
    varietyName: "ප්‍රභේදයේ නම",
    varietyNamePlaceholder: "ප්‍රභේදයේ නම ඇතුළත් කරන්න",
    varietyType: "ප්‍රභේද වර්ගය",
    varietyNameRequired: "කරුණාකර ප්‍රභේදයේ නම ඇතුළත් කරන්න",
    createSuccess: "නව සැලසුම සාර්ථකව සාදන ලදී!",
    createPlan: "සැලසුම සාදන්න",
  },
  en: {
    title: "Edit Plan",
    basalApplication: "Basal Application (At Planting)",
    firstTopDressing: "1st Top Dressing",
    secondTopDressing: "2nd Top Dressing",
    organicFertilizer: "Organic Fertilizer (tons/ha)",
    yieldPotential: "Yield Potential (tons/ha)",
    otherSettings: "Other Settings",
    tspKgPerHa: "TSP (kg/ha)",
    mopKgPerHa: "MOP (kg/ha)",
    ureaKgPerHa: "Urea (kg/ha)",
    daysAfterPlanting: "Days After Planting",
    timing: "Timing",
    compost: "Compost (t/ha)",
    cattleManure: "Cattle Manure (t/ha)",
    poultryManure: "Poultry Manure (t/ha)",
    minYield: "Min",
    maxYield: "Max",
    avgYield: "Average",
    growthDuration: "Growth Duration (days)",
    fertilizerMultiplier: "Fertilizer Multiplier",
    notes: "Notes",
    notesPlaceholder: "Add notes about this plan...",
    saveChanges: "Save Changes",
    saving: "Saving...",
    resetToDefault: "Reset to DOA Defaults",
    resetConfirmTitle: "Reset?",
    resetConfirmMessage: "Reload DOA default values for this variety?",
    cancel: "Cancel",
    confirm: "Confirm",
    saveSuccess: "Plan saved successfully!",
    saveError: "Failed to save plan",
    hybrid: "Hybrid",
    openPollinated: "Open Pollinated",
    local: "Local Variety",
    varietyName: "Variety Name",
    varietyNamePlaceholder: "Enter variety name",
    varietyType: "Variety Type",
    varietyNameRequired: "Please enter a variety name",
    createSuccess: "New plan created successfully!",
    createPlan: "Create Plan",
  },
  ta: {
    title: "திட்டத்தை திருத்து",
    basalApplication: "அடிப்படை பயன்பாடு (நடவு நேரத்தில்)",
    firstTopDressing: "1வது மேல் உரம்",
    secondTopDressing: "2வது மேல் உரம்",
    organicFertilizer: "கரிம உரம் (டன்/ஹெ)",
    yieldPotential: "விளைச்சல் திறன் (டன்/ஹெ)",
    otherSettings: "பிற அமைப்புகள்",
    tspKgPerHa: "TSP (kg/ha)",
    mopKgPerHa: "MOP (kg/ha)",
    ureaKgPerHa: "Urea (kg/ha)",
    daysAfterPlanting: "நடவுக்குப் பின் நாட்கள்",
    timing: "நேரம்",
    compost: "உரக்கலவை (t/ha)",
    cattleManure: "மாட்டு உரம் (t/ha)",
    poultryManure: "கோழி உரம் (t/ha)",
    minYield: "குறைந்தபட்சம்",
    maxYield: "அதிகபட்சம்",
    avgYield: "சராசரி",
    growthDuration: "வளர்ச்சி காலம் (நாட்கள்)",
    fertilizerMultiplier: "உர பெருக்கி",
    notes: "குறிப்புகள்",
    notesPlaceholder: "இந்த திட்டம் பற்றிய குறிப்புகளை சேர்க்கவும்...",
    saveChanges: "மாற்றங்களை சேமிக்கவும்",
    saving: "சேமிக்கிறது...",
    resetToDefault: "DOA இயல்புநிலைக்கு மீட்டமைக்கவும்",
    resetConfirmTitle: "மீட்டமைக்கவா?",
    resetConfirmMessage: "இந்த ரகத்திற்கான DOA இயல்புநிலை மதிப்புகளை மீண்டும் ஏற்றவா?",
    cancel: "ரத்து",
    confirm: "உறுதிப்படுத்தவும்",
    saveSuccess: "திட்டம் வெற்றிகரமாக சேமிக்கப்பட்டது!",
    saveError: "திட்டத்தை சேமிக்க முடியவில்லை",
    hybrid: "கலப்பினம்",
    openPollinated: "திறந்த மகரந்தச்சேர்க்கை",
    local: "உள்ளூர் வகை",
    varietyName: "ரக பெயர்",
    varietyNamePlaceholder: "ரக பெயரை உள்ளிடவும்",
    varietyType: "ரக வகை",
    varietyNameRequired: "தயவுசெய்து ரக பெயரை உள்ளிடவும்",
    createSuccess: "புதிய திட்டம் வெற்றிகரமாக உருவாக்கப்பட்டது!",
    createPlan: "திட்டத்தை உருவாக்குக",
  },
};

const VARIETY_TYPE_OPTIONS: { label: string; value: 'hybrid' | 'open_pollinated' | 'local' }[] = [
  { label: 'Hybrid', value: 'hybrid' },
  { label: 'Open Pollinated', value: 'open_pollinated' },
  { label: 'Local', value: 'local' },
];

const EditFertilizerPlanDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { plan: initialPlan, isCreateMode = false } = route.params as {
    plan: FertilizerPlanRecord;
    isFromSupabase?: boolean;
    isCreateMode?: boolean;
  };
  const { language: lang } = useLanguage();
  const language: Language = lang === "sinhala" ? "si" : lang === "tamil" ? "ta" : "en";
  const { user } = useApp();
  const t = translations[language];

  const [saving, setSaving] = useState(false);

  // Create mode state
  const [varietyName, setVarietyName] = useState(initialPlan.variety);
  const [varietyType, setVarietyType] = useState<'hybrid' | 'open_pollinated' | 'local'>(initialPlan.variety_type);

  // Editable state
  const [basalTsp, setBasalTsp] = useState(String(initialPlan.basal_tsp_kg_per_ha));
  const [basalMop, setBasalMop] = useState(String(initialPlan.basal_mop_kg_per_ha));
  const [basalUrea, setBasalUrea] = useState(String(initialPlan.basal_urea_kg_per_ha));
  const [basalTiming, setBasalTiming] = useState(initialPlan.basal_timing);

  const [td1Urea, setTd1Urea] = useState(String(initialPlan.top_dress_1_urea_kg_per_ha));
  const [td1Days, setTd1Days] = useState(String(initialPlan.top_dress_1_days_after_planting));
  const [td1Timing, setTd1Timing] = useState(initialPlan.top_dress_1_timing);

  const [td2Urea, setTd2Urea] = useState(String(initialPlan.top_dress_2_urea_kg_per_ha));
  const [td2Days, setTd2Days] = useState(String(initialPlan.top_dress_2_days_after_planting));
  const [td2Timing, setTd2Timing] = useState(initialPlan.top_dress_2_timing);

  const [compost, setCompost] = useState(String(initialPlan.organic_compost_tons_per_ha));
  const [cattleManure, setCattleManure] = useState(String(initialPlan.organic_cattle_manure_tons_per_ha));
  const [poultryManure, setPoultryManure] = useState(String(initialPlan.organic_poultry_manure_tons_per_ha));

  const [yieldMin, setYieldMin] = useState(String(initialPlan.yield_potential_min));
  const [yieldMax, setYieldMax] = useState(String(initialPlan.yield_potential_max));
  const [yieldAvg, setYieldAvg] = useState(String(initialPlan.yield_potential_avg));
  const [growthDuration, setGrowthDuration] = useState(String(initialPlan.growth_duration_days));
  const [multiplier, setMultiplier] = useState(String(initialPlan.fertilizer_multiplier));

  const [notes, setNotes] = useState(initialPlan.notes || "");

  const handleSave = async () => {
    // Validate variety name in create mode
    if (isCreateMode && !varietyName.trim()) {
      Alert.alert("❌", t.varietyNameRequired);
      return;
    }

    try {
      setSaving(true);

      const updatedPlan: FertilizerPlanRecord = {
        ...initialPlan,
        // In create mode, use the entered name and type; remove id so upsert creates a new row
        ...(isCreateMode ? { variety: varietyName.trim(), variety_type: varietyType, id: undefined } : {}),
        basal_tsp_kg_per_ha: parseFloat(basalTsp) || 0,
        basal_mop_kg_per_ha: parseFloat(basalMop) || 0,
        basal_urea_kg_per_ha: parseFloat(basalUrea) || 0,
        basal_timing: basalTiming,
        top_dress_1_urea_kg_per_ha: parseFloat(td1Urea) || 0,
        top_dress_1_days_after_planting: parseInt(td1Days) || 25,
        top_dress_1_timing: td1Timing,
        top_dress_2_urea_kg_per_ha: parseFloat(td2Urea) || 0,
        top_dress_2_days_after_planting: parseInt(td2Days) || 52,
        top_dress_2_timing: td2Timing,
        organic_compost_tons_per_ha: parseFloat(compost) || 0,
        organic_cattle_manure_tons_per_ha: parseFloat(cattleManure) || 0,
        organic_poultry_manure_tons_per_ha: parseFloat(poultryManure) || 0,
        yield_potential_min: parseFloat(yieldMin) || 0,
        yield_potential_max: parseFloat(yieldMax) || 0,
        yield_potential_avg: parseFloat(yieldAvg) || 0,
        growth_duration_days: parseInt(growthDuration) || 110,
        fertilizer_multiplier: parseFloat(multiplier) || 1.0,
        notes,
      };

      await upsertFertilizerPlan(updatedPlan, user?.id);
      Alert.alert("✅", isCreateMode ? t.createSuccess : t.saveSuccess);
      navigation.goBack();
    } catch (err: any) {
      Alert.alert("❌", t.saveError + "\n" + (err.message || ""));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    Alert.alert(t.resetConfirmTitle, t.resetConfirmMessage, [
      { text: t.cancel, style: "cancel" },
      {
        text: t.confirm,
        onPress: () => {
          const defaults = buildDefaultPlans();
          const defaultPlan = defaults.find((p) => p.variety === initialPlan.variety);
          if (!defaultPlan) return;

          setBasalTsp(String(defaultPlan.basal_tsp_kg_per_ha));
          setBasalMop(String(defaultPlan.basal_mop_kg_per_ha));
          setBasalUrea(String(defaultPlan.basal_urea_kg_per_ha));
          setBasalTiming(defaultPlan.basal_timing);
          setTd1Urea(String(defaultPlan.top_dress_1_urea_kg_per_ha));
          setTd1Days(String(defaultPlan.top_dress_1_days_after_planting));
          setTd1Timing(defaultPlan.top_dress_1_timing);
          setTd2Urea(String(defaultPlan.top_dress_2_urea_kg_per_ha));
          setTd2Days(String(defaultPlan.top_dress_2_days_after_planting));
          setTd2Timing(defaultPlan.top_dress_2_timing);
          setCompost(String(defaultPlan.organic_compost_tons_per_ha));
          setCattleManure(String(defaultPlan.organic_cattle_manure_tons_per_ha));
          setPoultryManure(String(defaultPlan.organic_poultry_manure_tons_per_ha));
          setYieldMin(String(defaultPlan.yield_potential_min));
          setYieldMax(String(defaultPlan.yield_potential_max));
          setYieldAvg(String(defaultPlan.yield_potential_avg));
          setGrowthDuration(String(defaultPlan.growth_duration_days));
          setMultiplier(String(defaultPlan.fertilizer_multiplier));
          setNotes("");
        },
      },
    ]);
  };

  const renderInput = (label: string, value: string, setter: (v: string) => void, keyboard: "numeric" | "default" = "numeric") => (
    <View style={styles.inputRow}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setter}
        keyboardType={keyboard}
        selectTextOnFocus
      />
    </View>
  );

  const getVarietyTypeLabel = (type: string) => {
    if (type === "hybrid") return t.hybrid;
    if (type === "local") return t.local;
    return t.openPollinated;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <LinearGradient
        colors={["#10b981", "#059669"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {isCreateMode ? (varietyName || t.createPlan) : initialPlan.variety}
          </Text>
          <Text style={styles.headerSubtitle}>
            {getVarietyTypeLabel(isCreateMode ? varietyType : initialPlan.variety_type)} • {isCreateMode ? t.createPlan : t.title}
          </Text>
        </View>
        {!isCreateMode ? (
          <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
            <RotateCcw size={18} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Variety Name & Type (Create Mode Only) */}
        {isCreateMode && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Leaf color="#10B981" size={18} />
              <Text style={styles.sectionTitle}>{t.varietyName}</Text>
            </View>
            <TextInput
              style={[styles.input, { textAlign: "left", minWidth: undefined, width: "100%", marginBottom: 12 }]}
              value={varietyName}
              onChangeText={setVarietyName}
              placeholder={t.varietyNamePlaceholder}
              placeholderTextColor="#9CA3AF"
            />
            <Text style={[styles.inputLabel, { marginBottom: 8 }]}>{t.varietyType}</Text>
            <View style={styles.typeSelector}>
              {VARIETY_TYPE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.typeOption,
                    varietyType === opt.value && styles.typeOptionSelected,
                  ]}
                  onPress={() => setVarietyType(opt.value)}
                >
                  <Text
                    style={[
                      styles.typeOptionText,
                      varietyType === opt.value && styles.typeOptionTextSelected,
                    ]}
                  >
                    {opt.value === "hybrid" ? t.hybrid : opt.value === "local" ? t.local : t.openPollinated}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Basal Application */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Leaf color="#059669" size={18} />
            <Text style={styles.sectionTitle}>{t.basalApplication}</Text>
          </View>
          {renderInput(t.tspKgPerHa, basalTsp, setBasalTsp)}
          {renderInput(t.mopKgPerHa, basalMop, setBasalMop)}
          {renderInput(t.ureaKgPerHa, basalUrea, setBasalUrea)}
          {renderInput(t.timing, basalTiming, setBasalTiming, "default")}
        </View>

        {/* First Top Dressing */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar color="#3B82F6" size={18} />
            <Text style={styles.sectionTitle}>{t.firstTopDressing}</Text>
          </View>
          {renderInput(t.ureaKgPerHa, td1Urea, setTd1Urea)}
          {renderInput(t.daysAfterPlanting, td1Days, setTd1Days)}
          {renderInput(t.timing, td1Timing, setTd1Timing, "default")}
        </View>

        {/* Second Top Dressing */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar color="#8B5CF6" size={18} />
            <Text style={styles.sectionTitle}>{t.secondTopDressing}</Text>
          </View>
          {renderInput(t.ureaKgPerHa, td2Urea, setTd2Urea)}
          {renderInput(t.daysAfterPlanting, td2Days, setTd2Days)}
          {renderInput(t.timing, td2Timing, setTd2Timing, "default")}
        </View>

        {/* Organic Fertilizer */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Droplets color="#F59E0B" size={18} />
            <Text style={styles.sectionTitle}>{t.organicFertilizer}</Text>
          </View>
          {renderInput(t.compost, compost, setCompost)}
          {renderInput(t.cattleManure, cattleManure, setCattleManure)}
          {renderInput(t.poultryManure, poultryManure, setPoultryManure)}
        </View>

        {/* Yield Potential */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Leaf color="#10B981" size={18} />
            <Text style={styles.sectionTitle}>{t.yieldPotential}</Text>
          </View>
          {renderInput(t.minYield, yieldMin, setYieldMin)}
          {renderInput(t.maxYield, yieldMax, setYieldMax)}
          {renderInput(t.avgYield, yieldAvg, setYieldAvg)}
        </View>

        {/* Other Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Leaf color="#6B7280" size={18} />
            <Text style={styles.sectionTitle}>{t.otherSettings}</Text>
          </View>
          {renderInput(t.growthDuration, growthDuration, setGrowthDuration)}
          {renderInput(t.fertilizerMultiplier, multiplier, setMultiplier)}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.notes}</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder={t.notesPlaceholder}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Save / Create Button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <LinearGradient
            colors={saving ? ["#9CA3AF", "#6B7280"] : ["#16A34A", "#15803D"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveGradient}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Save size={20} color="#FFFFFF" />
            )}
            <Text style={styles.saveButtonText}>
              {saving ? t.saving : isCreateMode ? t.createPlan : t.saveChanges}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Reset Button (edit mode only) */}
        {!isCreateMode && (
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <RotateCcw size={16} color="#EF4444" />
            <Text style={styles.resetButtonText}>{t.resetToDefault}</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  resetBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingVertical: 4,
  },
  inputLabel: {
    fontSize: 13,
    color: "#6B7280",
    flex: 1,
    marginRight: 12,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    minWidth: 120,
    textAlign: "right",
  },
  notesInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#1F2937",
    minHeight: 80,
    marginTop: 8,
  },
  saveButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    marginTop: 8,
    gap: 6,
  },
  resetButtonText: {
    fontSize: 14,
    color: "#EF4444",
    fontWeight: "500",
  },
  typeSelector: {
    flexDirection: "row",
    gap: 8,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    alignItems: "center",
  },
  typeOptionSelected: {
    borderColor: "#10B981",
    backgroundColor: "#ECFDF5",
  },
  typeOptionText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  typeOptionTextSelected: {
    color: "#059669",
    fontWeight: "700",
  },
});

export default EditFertilizerPlanDetailScreen;
