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

const { width } = Dimensions.get("window");

export default function AdminDashboard() {
  const navigation = useNavigation();

  const menu = [
    {
      label: "Price Update",
      description: "Adjust current market prices",
      icon: <DollarSign size={28} color="#059669" />,
      screen: "AdminPriceUpdate",
      gradient: ["#D1FAE5", "#A7F3D0"],
      accentColor: "#059669",
    },
    {
      label: "Seed Price Update",
      description: "Manage seed varieties pricing",
      icon: <Leaf size={28} color="#8B5CF6" />,
      screen: "SeedPriceUpdate",
      gradient: ["#EDE9FE", "#DDD6FE"],
      accentColor: "#8B5CF6",
    },
    {
      label: "Fertilizer & Cost Settings",
      description: "Configure input costs",
      icon: <Settings size={28} color="#2563EB" />,
      screen: "FertilizerSettings",
      gradient: ["#DBEAFE", "#BFDBFE"],
      accentColor: "#2563EB",
    },
    {
      label: "Upload Dataset",
      description: "Import new training data",
      icon: <Database size={28} color="#DC2626" />,
      screen: "DatasetUploader",
      gradient: ["#FEE2E2", "#FECACA"],
      accentColor: "#DC2626",
    },
    {
      label: "Model Performance",
      description: "View analytics & metrics",
      icon: <BarChart3 size={28} color="#EA580C" />,
      screen: "ModelStats",
      gradient: ["#FFEDD5", "#FED7AA"],
      accentColor: "#EA580C",
    },
  ];

  return (
    <View style={styles.wrapper}>
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.iconBadge}>
              <TrendingUp size={24} color="#059669" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.appName}>🌾 MaizeGenie</Text>
              <Text style={styles.title}>Admin Dashboard</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            Manage forecasting, datasets, pricing and system settings
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Active Modules</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>100%</Text>
            <Text style={styles.statLabel}>System Health</Text>
          </View>
        </View>

        {/* Menu Cards */}
        <View style={styles.menuContainer}>
          {menu.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => navigation.navigate(item.screen as never)}
              activeOpacity={0.7}
            >
              <View style={styles.cardContent}>
                <View style={[styles.iconContainer, { backgroundColor: item.gradient[0] }]}>
                  {item.icon}
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.cardLabel}>{item.label}</Text>
                  <Text style={styles.cardDescription}>{item.description}</Text>
                </View>
              </View>
              <View style={[styles.arrowContainer, { backgroundColor: item.gradient[0] }]}>
                <ChevronRight size={20} color={item.accentColor} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer Spacing */}
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
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
    marginBottom: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748B",
    lineHeight: 22,
    marginTop: 4,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#059669",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F5F9",
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
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  arrowContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  footer: {
    height: 20,
  },
});