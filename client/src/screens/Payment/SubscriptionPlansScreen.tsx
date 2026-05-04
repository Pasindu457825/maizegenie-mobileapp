import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Check, Crown } from "lucide-react-native";
import { useLanguage } from "../../context/LanguageContext";
import {
  BillingCycle,
  getSubscriptionPlans,
  SubscriptionPlan,
} from "../../services/subscriptionApi";

const translations = {
  sinhala: {
    title: "MaizeGenie Pro Subscription",
    subtitle: "Unlock premium tools for smarter maize farming",
    monthly: "මාසික",
    annual: "වාර්ෂික",
    save: "ඉතිරි කරන්න",
    continue: "ඉදිරියට",
    loading: "සැලසුම් පූරණය වෙමින්...",
    error: "සැලසුම් ලබා ගැනීමට නොහැකි විය",
    feature1: "Advanced cloud model",
    feature2: "High accuracy disease detection",
    feature3: "Subscription auto unlock",
    feature4: "Soil Testing Request",
  },
  english: {
    title: "MaizeGenie Pro Subscription",
    subtitle: "Unlock premium tools for smarter maize farming",
    monthly: "Monthly",
    annual: "Annual",
    save: "Save",
    continue: "Continue to Payment",
    loading: "Loading plans...",
    error: "Failed to load plans",
    feature1: "Advanced cloud model",
    feature2: "High accuracy disease detection",
    feature3: "Subscription auto unlock",
    feature4: "Soil Testing Request",
  },
  tamil: {
    title: "MaizeGenie Pro Subscription",
    subtitle: "Unlock premium tools for smarter maize farming",
    monthly: "மாதாந்திர",
    annual: "வருடாந்திர",
    save: "சேமிக்கவும்",
    continue: "கொடுப்பனவிற்கு தொடர்க",
    loading: "திட்டங்கள் ஏற்றப்படுகின்றன...",
    error: "திட்டங்களை பெற முடியவில்லை",
    feature1: "Advanced cloud model",
    feature2: "High accuracy disease detection",
    feature3: "Subscription auto unlock",
    feature4: "Soil Testing Request",
  },
} as Record<string, any>;

const fallbackPlans: SubscriptionPlan[] = [
  {
    code: "pro_monthly",
    title: "MaizeGenie Pro Monthly",
    billing_cycle: "monthly",
    amount_lkr: 300,
    duration_days: 30,
  },
  {
    code: "pro_annual",
    title: "MaizeGenie Pro Annual",
    billing_cycle: "annual",
    amount_lkr: 2500,
    duration_days: 365,
  },
];

export default function SubscriptionPlansScreen({ navigation }: any) {
  const { language } = useLanguage();
  const t = translations[language];

  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<SubscriptionPlan[]>(fallbackPlans);
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>("monthly");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getSubscriptionPlans();
        if (Array.isArray(data) && data.length > 0) {
          setPlans(data);
        }
      } catch {
        Alert.alert("Error", t.error);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [t.error]);

  const monthly = useMemo(
    () => plans.find((p) => p.billing_cycle === "monthly") || fallbackPlans[0],
    [plans]
  );

  const annual = useMemo(
    () => plans.find((p) => p.billing_cycle === "annual") || fallbackPlans[1],
    [plans]
  );

  const selectedPlan = selectedCycle === "monthly" ? monthly : annual;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#f0fdf4", "#dcfce7", "#bbf7d0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={22} color="#065f46" />
        </TouchableOpacity>
        <Text style={styles.title}>{t.title}</Text>
        <Text style={styles.subtitle}>{t.subtitle}</Text>
      </View>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loaderText}>{t.loading}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.featureBox}>
            <Feature text={t.feature1} />
            <Feature text={t.feature2} />
            <Feature text={t.feature3} />
            <Feature text={t.feature4} />
          </View>

          <PlanCard
            label={t.monthly}
            amount={monthly.amount_lkr}
            selected={selectedCycle === "monthly"}
            onPress={() => setSelectedCycle("monthly")}
          />

          <PlanCard
            label={t.annual}
            amount={annual.amount_lkr}
            selected={selectedCycle === "annual"}
            badge={`${t.save} 50%`}
            onPress={() => setSelectedCycle("annual")}
          />
        </ScrollView>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate("Payment", {
              plan: selectedPlan.code,
              amount: selectedPlan.amount_lkr,
              billingCycle: selectedPlan.billing_cycle,
            })
          }
        >
          <LinearGradient
            colors={["#10b981", "#059669"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaGradient}
          >
            <Crown size={18} color="#fff" />
            <Text style={styles.ctaText}>
              {t.continue} - Rs. {selectedPlan.amount_lkr.toLocaleString()}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <View style={styles.featureRow}>
      <Check size={16} color="#10b981" />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

function PlanCard({
  label,
  amount,
  selected,
  onPress,
  badge,
}: {
  label: string;
  amount: number;
  selected: boolean;
  onPress: () => void;
  badge?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.planCard, selected && styles.planCardSelected]}
    >
      <View style={styles.planHeader}>
        <Text style={styles.planLabel}>{label}</Text>
        {badge ? <Text style={styles.badge}>{badge}</Text> : null}
      </View>
      <Text style={styles.planAmount}>Rs. {amount.toLocaleString()}</Text>
      <Text style={styles.planMeta}>{selected ? "Selected" : "Tap to select"}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 10 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: { fontSize: 24, fontWeight: "800", color: "#064e3b" },
  subtitle: { marginTop: 4, color: "#065f46", fontSize: 13 },
  loaderWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  loaderText: { marginTop: 12, color: "#065f46" },
  content: { padding: 20, paddingBottom: 140 },
  featureBox: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#d1fae5",
  },
  featureRow: { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 8 },
  featureText: { color: "#065f46", fontWeight: "600" },
  planCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    padding: 16,
    marginBottom: 12,
  },
  planCardSelected: { borderColor: "#10b981", backgroundColor: "#f0fdf4" },
  planHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  planLabel: { fontSize: 18, fontWeight: "700", color: "#111827" },
  badge: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: "700",
  },
  planAmount: { fontSize: 28, fontWeight: "800", color: "#065f46", marginTop: 10 },
  planMeta: { marginTop: 6, color: "#6b7280" },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
  },
  ctaButton: { borderRadius: 12, overflow: "hidden" },
  ctaGradient: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  ctaText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});

