import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import {
  DollarSign,
  Database,
  BarChart3,
  Settings,
  TrendingUp,
  Bell,
  ChevronRight,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

// 🌐 Language context
import { useLanguage } from "../../context/LanguageContext";

const { width } = Dimensions.get("window");

export default function AdminDashboard() {
  const navigation = useNavigation();

  // Global language: "sinhala" | "english"
  const { language } = useLanguage();

  // UI language mapping
  const uiLang: "si" | "en" = language === "sinhala" ? "si" : "en";

  // ✅ FULL bilingual content (FIXED)
  const content = {
    si: {
      title: "පරිපාලක මැදහල්පොත",
      subtitle: "පුරෝකථන, දත්ත, මිල සහ පද්ධති කළමනාකරණය",
      activeModules: "සක්‍රීය මොඩියුල",
      systemHealth: "පද්ධතියේ සෞඛ්‍යය",

      priceUpdate: "මිල යාවත්කාලීන කිරීම",
      priceUpdateDesc: "වෙළඳපොළ මිල යාවත්කාලීන කරන්න",

      seedUpdate: "බීජ මිල යාවත්කාලීන",
      seedUpdateDesc: "බීජ වර්ගයන්ගේ මිල කළමනාකරණය",

      fertCost: "පොහොර සහ වියදම්",
      fertCostDesc: "පොහොර සහ ආදායම් වියදම් සැකසුම්",

      uploadDataset: "දත්ත උඩුගත කිරීම",
      uploadDatasetDesc: "නව පුහුණු දත්ත එක් කරන්න",

      modelStats: "මෝඩල් කාර්යක්ෂමතාව",
      modelStatsDesc: "දත්ත විශ්ලේෂණ සහ දර්ශන",

      // ✅ 🔑 FIXED: OFFICIAL NEWS
      officialNews: "නිල පුවත්",
      officialNewsDesc: "රජයේ සහ නිල ගොවි පුවත් පළ කරන්න",
    },

    en: {
      title: "Admin Dashboard",
      subtitle: "Manage forecasting, datasets, pricing and system settings",
      activeModules: "Active Modules",
      systemHealth: "System Health",

      priceUpdate: "Price Update",
      priceUpdateDesc: "Update current market prices",

      seedUpdate: "Seed Price Update",
      seedUpdateDesc: "Manage seed variety prices",

      fertCost: "Fertilizer & Cost Settings",
      fertCostDesc: "Configure fertilizer and input costs",

      uploadDataset: "Upload Dataset",
      uploadDatasetDesc: "Add new training datasets",

      modelStats: "Model Performance",
      modelStatsDesc: "View analytics and metrics",

      // ✅ 🔑 FIXED: OFFICIAL NEWS
      officialNews: "Official News",
      officialNewsDesc: "Publish government and official agriculture news",
    },
  };

  const t = content[uiLang];

  // ✅ Menu items
  const menu = [
    {
      label: t.priceUpdate,
      description: t.priceUpdateDesc,
      icon: <DollarSign size={28} color="#059669" />,
      screen: "AdminPriceUpdate",
      accentColor: "#059669",
      bg: "#D1FAE5",
    },
    {
      label: t.officialNews,
      description: t.officialNewsDesc,
      icon: <Bell size={28} color="#0EA5E9" />,
      screen: "AdminAddOfficialNews", // ✅ CORRECT ROUTE
      accentColor: "#0284C7",
      bg: "#E0F2FE",
    },
    {
      label: t.fertCost,
      description: t.fertCostDesc,
      icon: <Settings size={28} color="#2563EB" />,
      screen: "FertilizerSettings",
      accentColor: "#2563EB",
      bg: "#DBEAFE",
    },
    {
      label: t.uploadDataset,
      description: t.uploadDatasetDesc,
      icon: <Database size={28} color="#DC2626" />,
      screen: "DatasetUploader",
      accentColor: "#DC2626",
      bg: "#FEE2E2",
    },
    {
      label: t.modelStats,
      description: t.modelStatsDesc,
      icon: <BarChart3 size={28} color="#EA580C" />,
      screen: "ModelStats",
      accentColor: "#EA580C",
      bg: "#FFEDD5",
    },
  ];

  return (
    <View style={styles.wrapper}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.badge}>
              <TrendingUp size={22} color="#059669" />
            </View>
            <View>
              <Text style={styles.appName}>🌾 MaizeGenie</Text>
              <Text style={styles.title}>{t.title}</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>{t.subtitle}</Text>
        </View>

        {/* STATS */}
        <View style={styles.stats}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>{t.activeModules}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>100%</Text>
            <Text style={styles.statLabel}>{t.systemHealth}</Text>
          </View>
        </View>

        {/* MENU */}
        <View style={styles.menu}>
          {menu.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => navigation.navigate(item.screen as never)}
            >
              <View style={[styles.iconBox, { backgroundColor: item.bg }]}>
                {item.icon}
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.label}</Text>
                <Text style={styles.cardDesc}>{item.description}</Text>
              </View>

              <ChevronRight size={20} color={item.accentColor} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#F8FAFC" },

  header: {
    backgroundColor: "#FFF",
    padding: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  badge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
  },
  appName: { fontSize: 14, color: "#059669", fontWeight: "600" },
  title: { fontSize: 26, fontWeight: "800", color: "#0F172A" },
  subtitle: { marginTop: 6, color: "#64748B" },

  stats: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
  },
  statValue: { fontSize: 24, fontWeight: "800", color: "#059669" },
  statLabel: { fontSize: 13, color: "#64748B" },

  menu: { paddingHorizontal: 20 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
  },
  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  cardDesc: { fontSize: 13, color: "#64748B" },
});
