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
  Leaf,
  ChevronRight,
  TrendingUp,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

// ✅ Import global language context
import { useLanguage } from "../../context/LanguageContext";

const { width } = Dimensions.get("window");

export default function AdminDashboard() {
  const navigation = useNavigation();

  // ⭐ Global language ("sinhala" | "english")
  const { language, setLanguage } = useLanguage();

  // ⭐ UI language ("si" | "en")
  const uiLang: "si" | "en" = language === "sinhala" ? "si" : "en";

  // ⭐ Full bilingual content
  const content = {
    si: {
      title: "පරිපාලක මැදහල්පොත",
      subtitle: "පුරෝකථන, දත්තකොටස්, මිල නියම කිරීම සහ සැකසුම් කළමනාකරණය",
      activeModules: "සක්‍රීය මොඩියුල",
      systemHealth: "පද්ධතියේ සෞඛ්‍යය",
      priceUpdate: "මිල යාවත්කාලීන කිරීම",
      priceUpdateDesc: "අලුත් වෙළඳපොළ මිල වෙනස් කරන්න",
      seedUpdate: "බීජ මිල යාවත්කාලීන",
      seedUpdateDesc: "බීජ වර්ගයන්ගේ මිල කළමනාකරණය",
      fertCost: "පොහොර & වියදම් සැකසුම්",
      fertCostDesc: "ආදායම් වියදම් සකස් කිරීම",
      uploadDataset: "දත්තසංග්‍රහ උඩුගත කරන්න",
      uploadDatasetDesc: "යීල්ඩ් / මිල මෝඩල සඳහා නව දත්ත එකතු කරන්න",
      modelStats: "මෝඩල් කාර්යක්ෂමතාව",
      modelStatsDesc: "වิเคราะห์ණ හා දෘශ්‍යපටි",
    },
    en: {
      title: "Admin Dashboard",
      subtitle: "Manage forecasting, datasets, pricing and system settings",
      activeModules: "Active Modules",
      systemHealth: "System Health",
      priceUpdate: "Price Update",
      priceUpdateDesc: "Adjust current market prices",
      seedUpdate: "Seed Price Update",
      seedUpdateDesc: "Manage seed varieties pricing",
      fertCost: "Fertilizer & Cost Settings",
      fertCostDesc: "Configure input costs",
      uploadDataset: "Upload Dataset",
      uploadDatasetDesc: "Import new training data",
      modelStats: "Model Performance",
      modelStatsDesc: "View analytics & metrics",
    },
  };

  const t = content[uiLang];

  // ⭐ Menu with language-aware labels
  const menu = [
    {
      label: t.priceUpdate,
      description: t.priceUpdateDesc,
      icon: <DollarSign size={28} color="#059669" />,
      screen: "AdminPriceUpdate",
      gradient: ["#D1FAE5", "#A7F3D0"],
      accentColor: "#059669",
    },
    {
      label: t.seedUpdate,
      description: t.seedUpdateDesc,
      icon: <Leaf size={28} color="#8B5CF6" />,
      screen: "SeedPriceUpdate",
      gradient: ["#EDE9FE", "#DDD6FE"],
      accentColor: "#8B5CF6",
    },
    {
      label: t.fertCost,
      description: t.fertCostDesc,
      icon: <Settings size={28} color="#2563EB" />,
      screen: "FertilizerSettings",
      gradient: ["#DBEAFE", "#BFDBFE"],
      accentColor: "#2563EB",
    },
    {
      label: t.uploadDataset,
      description: t.uploadDatasetDesc,
      icon: <Database size={28} color="#DC2626" />,
      screen: "DatasetUploader",
      gradient: ["#FEE2E2", "#FECACA"],
      accentColor: "#DC2626",
    },
    {
      label: t.modelStats,
      description: t.modelStatsDesc,
      icon: <BarChart3 size={28} color="#EA580C" />,
      screen: "ModelStats",
      gradient: ["#FFEDD5", "#FED7AA"],
      accentColor: "#EA580C",
    },
  ];

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.iconBadge}>
              <TrendingUp size={24} color="#059669" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.appName}>🌾 MaizeGenie</Text>
              <Text style={styles.title}>{t.title}</Text>
            </View>
          </View>

          <Text style={styles.subtitle}>{t.subtitle}</Text>
        </View>

        {/* STATS */}
        <View style={styles.statsContainer}>
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
        <View style={styles.menuContainer}>
          {menu.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => navigation.navigate(item.screen as never)}
              activeOpacity={0.7}
            >
              <View style={styles.cardContent}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: item.gradient[0] },
                  ]}
                >
                  {item.icon}
                </View>

                <View style={styles.textContainer}>
                  <Text style={styles.cardLabel}>{item.label}</Text>
                  <Text style={styles.cardDescription}>
                    {item.description}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.arrowContainer,
                  { backgroundColor: item.gradient[0] },
                ]}
              >
                <ChevronRight size={20} color={item.accentColor} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 3,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  headerText: {
    flex: 1,
  },
  appName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#059669",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 15,
    color: "#64748B",
    marginTop: 4,
  },

  // LANGUAGE BUTTON
  langBtn: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#A7F3D0",
  },
  langBtnText: {
    color: "#059669",
    fontWeight: "700",
    fontSize: 14,
  },

  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    elevation: 2,
  },
  statValue: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#059669",
  },
  statLabel: {
    fontSize: 13,
    color: "#64748B",
  },

  menuContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    elevation: 3,
    borderColor: "#F1F5F9",
    borderWidth: 1,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },
  cardDescription: {
    fontSize: 13,
    color: "#64748B",
  },

  arrowContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  footer: {
    height: 40,
  },
});
