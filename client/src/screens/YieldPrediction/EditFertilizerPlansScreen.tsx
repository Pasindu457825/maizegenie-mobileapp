/**
 * Edit Fertilizer Plans Screen (Officer View)
 * Lists all maize variety fertilizer plans with ability to edit dosages.
 * Plans are stored in Supabase; defaults are seeded from DOA guidelines.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { YieldPredictionStackParamList } from "../../navigation/YieldPredictionStack";
import {
  ArrowLeft,
  Leaf,
  ChevronRight,
  RefreshCw,
  Database,
  Plus,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLanguage } from "../../context/LanguageContext";
import { useApp } from "../../context/AppContext";
import {
  fetchAllFertilizerPlans,
  fetchPlansWithFallback,
  seedDefaultPlans,
  resetAndReseedPlans,
  migrateStaleDataIfNeeded,
  buildDefaultPlans,
  FertilizerPlanRecord,
} from "../../services/fertilizerPlanService";

type NavProp = StackNavigationProp<YieldPredictionStackParamList>;
type Language = "si" | "en" | "ta";

const content = {
  si: {
    title: "පොහොර සැලසුම් සංස්කරණය",
    subtitle: "DOA මාර්ගෝපදේශ අනුව",
    loading: "පොහොර සැලසුම් පූරණය වෙමින්...",
    seeding: "පෙරනිමි සැලසුම් පූරණය වෙමින්...",
    noPlans: "සැලසුම් නොමැත",
    noPlansDesc: "පොහොර සැලසුම් තවම නිර්මාණය කර නැත",
    seedDefaults: "DOA පෙරනිමි පූරණය කරන්න",
    hybrid: "හයිබ්‍රිඩ්",
    openPollinated: "විවෘත පරාගනය",
    local: "දේශීය ප්‍රභේදය",
    basalLabel: "මූලික",
    topDress1Label: "1 වන ඉහළ පොහොර",
    topDress2Label: "2 වන ඉහළ පොහොර",
    yieldPotential: "අස්වැන්න",
    kgPerHa: "කි.ග්‍රෑ/හෙ",
    tonsPerHa: "ටොන්/හෙ",
    tapToEdit: "සංස්කරණය කිරීමට ස්පර්ශ කරන්න",
    fromDatabase: "දත්ත සමුදායෙන්",
    localBackup: "දේශීය උපස්ථ දත්ත",
    defaultPlan: "DOA පෙරනිමි",
    seedSuccess: "පෙරනිමි සැලසුම් සාර්ථකව පූරණය කරන ලදී",
    seedError: "පෙරනිමි සැලසුම් පූරණය කිරීමට අසමත් විය",
    resetConfirmTitle: "යළි පිහිටුවන්නද?",
    resetConfirmMessage: "දැනට ඇති සියලු සැලසුම් මකා DOA පෙරනිමි යළි පූරණය කරන්නද?",
    cancel: "අවලංගු",
    confirm: "තහවුරු",
    resetSuccess: "සැලසුම් සාර්ථකව යළි පිහිටුවන ලදී",
    resetError: "යළි පිහිටුවීමට අසමත් විය",
    createNew: "නව පොහොර සැලසුමක් සාදන්න",
  },
  en: {
    title: "Edit Fertilizer Plans",
    subtitle: "Based on DOA Guidelines",
    loading: "Loading fertilizer plans...",
    seeding: "Seeding default plans...",
    noPlans: "No Plans Found",
    noPlansDesc: "No fertilizer plans have been created yet",
    seedDefaults: "Load DOA Defaults",
    hybrid: "Hybrid",
    openPollinated: "Open Pollinated",
    local: "Local Variety",
    basalLabel: "Basal",
    topDress1Label: "1st Top Dress",
    topDress2Label: "2nd Top Dress",
    yieldPotential: "Yield",
    kgPerHa: "kg/ha",
    tonsPerHa: "t/ha",
    tapToEdit: "Tap to edit",
    fromDatabase: "From Database",
    localBackup: "Local Backup (DB slow)",
    defaultPlan: "DOA Default",
    seedSuccess: "Default plans seeded successfully",
    seedError: "Failed to seed default plans",
    resetConfirmTitle: "Reset All Plans?",
    resetConfirmMessage: "This will delete all existing plans and reload DOA defaults. Continue?",
    cancel: "Cancel",
    confirm: "Confirm",
    resetSuccess: "Plans reset successfully",
    resetError: "Failed to reset plans",
    createNew: "Create New Fertilizer Plan",
  },
  ta: {
    title: "உர திட்டங்களை திருத்துக",
    subtitle: "DOA வழிகாட்டுதல்களின் அடிப்படையில்",
    loading: "உர திட்டங்கள் ஏற்றப்படுகின்றன...",
    seeding: "இயல்புநிலை திட்டங்கள் ஏற்றப்படுகின்றன...",
    noPlans: "திட்டங்கள் இல்லை",
    noPlansDesc: "உர திட்டங்கள் இன்னும் உருவாக்கப்படவில்லை",
    seedDefaults: "DOA இயல்புநிலைகளை ஏற்றுக",
    hybrid: "கலப்பினம்",
    openPollinated: "திறந்த மகரந்தச்சேர்க்கை",
    local: "உள்ளூர் வகை",
    basalLabel: "அடிப்படை",
    topDress1Label: "1வது மேல் உரம்",
    topDress2Label: "2வது மேல் உரம்",
    yieldPotential: "விளைச்சல்",
    kgPerHa: "kg/ha",
    tonsPerHa: "t/ha",
    tapToEdit: "திருத்த தட்டவும்",
    fromDatabase: "தரவுத்தளத்திலிருந்து",
    localBackup: "உள்ளூர் காப்பு தரவு",
    defaultPlan: "DOA இயல்புநிலை",
    seedSuccess: "இயல்புநிலை திட்டங்கள் வெற்றிகரமாக ஏற்றப்பட்டன",
    seedError: "இயல்புநிலை திட்டங்களை ஏற்ற முடியவில்லை",
    resetConfirmTitle: "மீட்டமைக்கவா?",
    resetConfirmMessage: "அனைத்து திட்டங்களையும் நீக்கி DOA இயல்புநிலைகளை மீண்டும் ஏற்றவா?",
    cancel: "ரத்து",
    confirm: "உறுதிப்படுத்தவும்",
    resetSuccess: "திட்டங்கள் வெற்றிகரமாக மீட்டமைக்கப்பட்டன",
    resetError: "மீட்டமைக்க முடியவில்லை",
    createNew: "புதிய உர திட்டத்தை உருவாக்குக",
  },
};

const EditFertilizerPlansScreen = () => {
  const navigation = useNavigation<NavProp>();
  const { language: lang } = useLanguage();
  const language: Language = lang === "sinhala" ? "si" : lang === "tamil" ? "ta" : "en";
  const { user } = useApp();

  const [plans, setPlans] = useState<FertilizerPlanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isFromSupabase, setIsFromSupabase] = useState(false);

  const t = content[language];

  const [dataSource, setDataSource] = useState<'database' | 'local' | 'default'>('default');

  const loadPlans = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      // Fetch with 5-second timeout – falls back to local data instantly
      const { plans: fetchedPlans, source } = await fetchPlansWithFallback();
      setPlans(fetchedPlans);
      setDataSource(source);
      setIsFromSupabase(source === 'database');

      // Run stale-data migration in background (non-blocking)
      if (source === 'database') {
        migrateStaleDataIfNeeded(user?.id).then(async (didMigrate) => {
          if (didMigrate) {
            console.log('🔄 Stale data was auto-migrated, reloading...');
            const fresh = await fetchPlansWithFallback();
            setPlans(fresh.plans);
            setDataSource(fresh.source);
            setIsFromSupabase(fresh.source === 'database');
          }
        }).catch(() => {});
      }
    } catch (err) {
      console.error("Failed to load plans:", err);
      setPlans(buildDefaultPlans());
      setDataSource('local');
      setIsFromSupabase(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  // Re-load when returning from detail screen
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadPlans();
    });
    return unsubscribe;
  }, [navigation, loadPlans]);

  const handleSeedDefaults = async () => {
    try {
      setSeeding(true);
      const count = await seedDefaultPlans(user?.id);
      Alert.alert("✅", `${t.seedSuccess} (${count} plans)`);
      await loadPlans();
    } catch (err: any) {
      Alert.alert("❌", t.seedError + "\n" + (err.message || ""));
    } finally {
      setSeeding(false);
    }
  };

  const handleResetAndReseed = () => {
    Alert.alert(
      t.resetConfirmTitle,
      t.resetConfirmMessage,
      [
        { text: t.cancel, style: "cancel" },
        {
          text: t.confirm,
          style: "destructive",
          onPress: async () => {
            try {
              setSeeding(true);
              const count = await resetAndReseedPlans(user?.id);
              Alert.alert("✅", `${t.resetSuccess} (${count} plans)`);
              await loadPlans();
            } catch (err: any) {
              Alert.alert("❌", t.resetError + "\n" + (err.message || ""));
            } finally {
              setSeeding(false);
            }
          },
        },
      ]
    );
  };

  const handleCreateNew = () => {
    // Navigate to detail screen with an empty plan template
    const emptyPlan: FertilizerPlanRecord = {
      variety: "",
      variety_type: "hybrid",
      basal_tsp_kg_per_ha: 100,
      basal_mop_kg_per_ha: 75,
      basal_urea_kg_per_ha: 35,
      basal_timing: "At planting",
      basal_instructions: [
        "Mix fertilizers into soil during final land preparation",
        "Ensure good soil moisture before application",
      ],
      top_dress_1_urea_kg_per_ha: 65,
      top_dress_1_days_after_planting: 25,
      top_dress_1_timing: "3-4 weeks after planting (knee-height)",
      top_dress_1_instructions: ["Apply when crop reaches knee-height"],
      top_dress_2_urea_kg_per_ha: 65,
      top_dress_2_days_after_planting: 52,
      top_dress_2_timing: "7-8 weeks after planting (tasseling stage)",
      top_dress_2_instructions: ["Apply at tasseling/silking stage"],
      organic_compost_tons_per_ha: 7.5,
      organic_cattle_manure_tons_per_ha: 12.5,
      organic_poultry_manure_tons_per_ha: 2.5,
      fertilizer_multiplier: 1.0,
      yield_potential_min: 0,
      yield_potential_max: 0,
      yield_potential_avg: 0,
      growth_duration_days: 110,
      is_active: true,
      notes: "",
    };
    navigation.navigate("EditFertilizerPlanDetail" as any, {
      plan: emptyPlan,
      isFromSupabase: false,
      isCreateMode: true,
    });
  };

  const handleEditPlan = (plan: FertilizerPlanRecord) => {
    navigation.navigate("EditFertilizerPlanDetail" as any, {
      plan,
      isFromSupabase,
    });
  };

  const getVarietyColor = (type: string) => {
    if (type === "hybrid") return { bg: "#ECFDF5", border: "#A7F3D0", text: "#059669" };
    if (type === "local") return { bg: "#EDE9FE", border: "#C4B5FD", text: "#7C3AED" };
    return { bg: "#FEF3C7", border: "#FDE68A", text: "#D97706" };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>{t.loading}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#10b981", "#059669"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft color="#ffffff" size={24} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t.title}</Text>
            <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
          </View>
          <TouchableOpacity onPress={handleResetAndReseed} style={styles.refreshButton}>
            <RefreshCw color="#ffffff" size={20} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Data Source Indicator */}
      <View style={styles.sourceIndicator}>
        <Database
          color={dataSource === 'database' ? "#10B981" : dataSource === 'local' ? "#F59E0B" : "#9CA3AF"}
          size={14}
        />
        <Text style={[
          styles.sourceText,
          { color: dataSource === 'database' ? "#10B981" : dataSource === 'local' ? "#F59E0B" : "#9CA3AF" }
        ]}>
          {dataSource === 'database' ? t.fromDatabase : dataSource === 'local' ? t.localBackup : t.defaultPlan}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadPlans(true)} colors={["#10B981"]} />
        }
      >
        {/* Seed Defaults Button (if not from Supabase) */}
        {!isFromSupabase && (
          <TouchableOpacity
            style={styles.seedButton}
            onPress={handleSeedDefaults}
            disabled={seeding}
          >
            <LinearGradient
              colors={["#10b981", "#059669"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.seedGradient}
            >
              {seeding ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Database color="#FFFFFF" size={18} />
              )}
              <Text style={styles.seedButtonText}>
                {seeding ? t.seeding : t.seedDefaults}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Plans List */}
        {plans.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Leaf color="#D1D5DB" size={64} />
            <Text style={styles.emptyTitle}>{t.noPlans}</Text>
            <Text style={styles.emptyDesc}>{t.noPlansDesc}</Text>
          </View>
        ) : (
          plans.map((plan, index) => {
            const colors = getVarietyColor(plan.variety_type);
            return (
              <TouchableOpacity
                key={plan.id || plan.variety}
                style={styles.planCard}
                onPress={() => handleEditPlan(plan)}
                activeOpacity={0.7}
              >
                <View style={styles.planCardHeader}>
                  <View style={styles.planCardLeft}>
                    <View style={[styles.varietyBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                      <Leaf color={colors.text} size={16} />
                    </View>
                    <View>
                      <Text style={styles.varietyName}>{plan.variety}</Text>
                      <Text style={[styles.varietyType, { color: colors.text }]}>
                        {plan.variety_type === "hybrid" ? t.hybrid : plan.variety_type === "local" ? t.local : t.openPollinated}
                      </Text>
                    </View>
                  </View>
                  <ChevronRight color="#9CA3AF" size={20} />
                </View>

                {/* Dosage Summary */}
                <View style={styles.dosageRow}>
                  <View style={styles.dosageItem}>
                    <Text style={styles.dosageLabel}>{t.basalLabel}</Text>
                    <Text style={styles.dosageValue}>
                      TSP: {plan.basal_tsp_kg_per_ha} | MOP: {plan.basal_mop_kg_per_ha} | Urea: {plan.basal_urea_kg_per_ha}
                    </Text>
                  </View>
                </View>
                <View style={styles.dosageRow}>
                  <View style={styles.dosageItem}>
                    <Text style={styles.dosageLabel}>{t.topDress1Label}</Text>
                    <Text style={styles.dosageValue}>Urea: {plan.top_dress_1_urea_kg_per_ha} {t.kgPerHa}</Text>
                  </View>
                  <View style={styles.dosageItem}>
                    <Text style={styles.dosageLabel}>{t.topDress2Label}</Text>
                    <Text style={styles.dosageValue}>Urea: {plan.top_dress_2_urea_kg_per_ha} {t.kgPerHa}</Text>
                  </View>
                </View>

                {/* Yield & Tap to edit */}
                <View style={styles.planCardFooter}>
                  <Text style={styles.yieldText}>
                    {t.yieldPotential}: {plan.yield_potential_min}-{plan.yield_potential_max} {t.tonsPerHa}
                  </Text>
                  <Text style={styles.tapToEdit}>{t.tapToEdit} →</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {/* Create New Plan Button */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateNew}
          activeOpacity={0.7}
        >
          <View style={styles.createButtonContent}>
            <View style={styles.createIconCircle}>
              <Plus color="#10B981" size={20} />
            </View>
            <Text style={styles.createButtonText}>{t.createNew}</Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
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
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  sourceIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 6,
  },
  sourceText: {
    fontSize: 12,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  seedButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  seedGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  seedButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
  },
  emptyDesc: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  planCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  planCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  planCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  varietyBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  varietyName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  varietyType: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 1,
  },
  dosageRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },
  dosageItem: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 8,
  },
  dosageLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 2,
  },
  dosageValue: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
  },
  planCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  yieldText: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "500",
  },
  tapToEdit: {
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  createButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#D1FAE5",
    borderStyle: "dashed",
  },
  createButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  createIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#059669",
  },
});

export default EditFertilizerPlansScreen;
