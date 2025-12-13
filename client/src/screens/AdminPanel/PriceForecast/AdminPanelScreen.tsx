import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  ArrowLeft,
  DollarSign,
  Package,
  TrendingUp,
  Save,
  RefreshCw,
  CheckCircle,
  Calendar,
  Sparkles,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { Platform } from "react-native";
import { useLanguage } from "../../../context/LanguageContext";

type Language = "sinhala" | "english";

const AdminPanelScreen = () => {
  const navigation = useNavigation();
  const { language, setLanguage } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [fuelPrice, setFuelPrice] = useState("");
  const [importTax, setImportTax] = useState("");
  const [farmGatePrice, setFarmGatePrice] = useState("");
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // 🔥 Dynamic API URL using .env + Platform detection
  const getApiUrl = () => {
    if (Platform.OS === "android") {
      // Real Android Device → Uses .env
      return process.env.EXPO_PUBLIC_API_BASE;
    } else if (Platform.OS === "ios") {
      // iOS simulator
      return "http://localhost:8000";
    } else {
      // Expo Web fallback
      return "http://localhost:8000";
    }
  };

  const API_URL = getApiUrl();

  // ✨ FIXED: Changed language type keys from "si"/"en" to "sinhala"/"english"
  const content = {
    sinhala: {
      title: "මිල යාවත්කාලීන කිරීම",
      subtitle: "🌾 MaizeGenie",
      welcome: "ස්වාගතයි",
      description: "වත්මන් වෙළඳපොළ මිල සහ බද්ද යාවත්කාලීන කරන්න",
      fuelPrice: "ඉන්ධන මිල",
      fuelPriceUnit: "රුපියල් (ලීටරයකට)",
      importTax: "ආනයන බද්ද",
      importTaxUnit: "ප්‍රතිශතය (%)",
      farmGatePrice: "ගොවි මිල",
      farmGatePriceUnit: "රුපියල් (කිලෝග්‍රෑමයකට)",
      lastUpdated: "අවසන් යාවත්කාලීනය",
      save: "සුරකින්න",
      refresh: "නැවුම් කරන්න",
      back: "ආපසු යන්න",
      saveSuccess: "දත්ත සාර්ථකව යාවත්කාලීන විය!",
      saveError: "දත්ත සුරැකීමේදී දෝෂයක් ඇතිවිය",
      loadError: "දත්ත පූරණයේදී දෝෂයක් ඇතිවිය",
      fillAll: "කරුණාකර සියලු තොරතුරු නිවැරදිව පුරවන්න",
      loading: "පූරණය වෙමින්...",
      saving: "සුරකිමින්...",
      noData: "දත්ත තවම නැත",
    },
    english: {
      title: "Price Update",
      subtitle: "🌾 MaizeGenie",
      welcome: "Welcome",
      description: "Update current market prices and taxes",
      fuelPrice: "Fuel Price",
      fuelPriceUnit: "Rupees (per liter)",
      importTax: "Import Tax",
      importTaxUnit: "Percentage (%)",
      farmGatePrice: "Farm Gate Price",
      farmGatePriceUnit: "Rupees (per kg)",
      lastUpdated: "Last Updated",
      save: "Save Changes",
      refresh: "Refresh Data",
      back: "Go Back",
      saveSuccess: "Data updated successfully!",
      saveError: "Error occurred while saving data",
      loadError: "Error occurred while loading data",
      fillAll: "Please fill all fields correctly",
      loading: "Loading...",
      saving: "Saving...",
      noData: "No data available yet",
    },
  };

  useEffect(() => {
    fetchCurrentData();
  }, []);

  const fetchCurrentData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/price-data`);
      const data = await response.json();

      if (response.ok && data.success) {
        setFuelPrice(data.data.fuelPrice?.toString() || "");
        setImportTax(data.data.importTax?.toString() || "");
        setFarmGatePrice(data.data.farmGatePrice?.toString() || "");
        setLastUpdated(data.data.lastUpdated || "");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert(
        language === "sinhala" ? "දෝෂයකි" : "Error",
        content[language].loadError
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!fuelPrice || !importTax || !farmGatePrice) {
      Alert.alert(
        language === "sinhala" ? "අවශ්‍යයි" : "Required",
        content[language].fillAll
      );
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/price-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fuelPrice: parseFloat(fuelPrice),
          importTax: parseFloat(importTax),
          farmGatePrice: parseFloat(farmGatePrice),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert(
          language === "sinhala" ? "සාර්ථකයි ✓" : "Success ✓",
          content[language].saveSuccess
        );
        fetchCurrentData(); // Refresh data
      } else {
        throw new Error(data.message || "Save failed");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      Alert.alert(
        language === "sinhala" ? "දෝෂයකි" : "Error",
        content[language].saveError
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Enhanced Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft color="#059669" size={22} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <View style={styles.iconBadge}>
              <Sparkles size={20} color="#059669" />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.headerSubtitle}>
                {content[language].subtitle}
              </Text>
              <Text style={styles.headerTitle}>{content[language].title}</Text>
            </View>
          </View>
          <Text style={styles.headerDescription}>
            {content[language].description}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#059669" />
            <Text style={styles.loadingText}>{content[language].loading}</Text>
          </View>
        ) : (
          <>
            {/* Last Updated Banner */}
            {lastUpdated ? (
              <View style={styles.updateBanner}>
                <View style={styles.updateIcon}>
                  <Calendar color="#059669" size={20} />
                </View>
                <View style={styles.updateTextContainer}>
                  <Text style={styles.updateLabel}>
                    {content[language].lastUpdated}
                  </Text>
                  <Text style={styles.updateValue}>
                    {new Date(lastUpdated).toLocaleString(
                      language === "sinhala" ? "si-LK" : "en-US",
                      {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }
                    )}
                  </Text>
                </View>
                <CheckCircle color="#059669" size={24} />
              </View>
            ) : (
              <View style={[styles.updateBanner, styles.noDataBanner]}>
                <Text style={styles.noDataText}>
                  {content[language].noData}
                </Text>
              </View>
            )}

            {/* Fuel Price Card */}
            <View style={styles.inputCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardLabelRow}>
                  <View style={[styles.iconWrapper, styles.iconWrapperGreen]}>
                    <DollarSign color="#059669" size={24} />
                  </View>
                  <View style={styles.labelContainer}>
                    <Text style={styles.cardLabel}>
                      {content[language].fuelPrice}
                    </Text>
                    <Text style={styles.cardSubLabel}>
                      {content[language].fuelPriceUnit}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencySymbol}>රු</Text>
                <TextInput
                  style={styles.input}
                  placeholder="380.00"
                  value={fuelPrice}
                  onChangeText={setFuelPrice}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Import Tax Card */}
            <View style={styles.inputCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardLabelRow}>
                  <View style={[styles.iconWrapper, styles.iconWrapperPurple]}>
                    <Package color="#8B5CF6" size={24} />
                  </View>
                  <View style={styles.labelContainer}>
                    <Text style={styles.cardLabel}>
                      {content[language].importTax}
                    </Text>
                    <Text style={styles.cardSubLabel}>
                      {content[language].importTaxUnit}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="25"
                  value={importTax}
                  onChangeText={setImportTax}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#9CA3AF"
                />
                <Text style={styles.percentSymbol}>%</Text>
              </View>
            </View>

            {/* Farm Gate Price Card */}
            <View style={styles.inputCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardLabelRow}>
                  <View style={[styles.iconWrapper, styles.iconWrapperEmerald]}>
                    <TrendingUp color="#10B981" size={24} />
                  </View>
                  <View style={styles.labelContainer}>
                    <Text style={styles.cardLabel}>
                      {content[language].farmGatePrice}
                    </Text>
                    <Text style={styles.cardSubLabel}>
                      {content[language].farmGatePriceUnit}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencySymbol}>රු</Text>
                <TextInput
                  style={styles.input}
                  placeholder="115.00"
                  value={farmGatePrice}
                  onChangeText={setFarmGatePrice}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={fetchCurrentData}
                disabled={loading}
              >
                <RefreshCw color="#6B7280" size={20} />
                <Text style={styles.refreshButtonText}>
                  {content[language].refresh}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Save color="#FFFFFF" size={20} />
                )}
                <Text style={styles.saveButtonText}>
                  {saving ? content[language].saving : content[language].save}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  langButton: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  langText: {
    color: "#059669",
    fontSize: 14,
    fontWeight: "700",
  },
  headerContent: {
    marginTop: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#059669",
    fontWeight: "600",
    marginBottom: 2,
  },
  headerDescription: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: "#64748B",
    fontWeight: "500",
  },
  updateBanner: {
    backgroundColor: "#D1FAE5",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    gap: 12,
  },
  noDataBanner: {
    backgroundColor: "#FEF3C7",
    borderColor: "#FDE68A",
    justifyContent: "center",
  },
  updateIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  updateTextContainer: {
    flex: 1,
  },
  updateLabel: {
    fontSize: 11,
    color: "#047857",
    marginBottom: 2,
    textTransform: "uppercase",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  updateValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#065F46",
  },
  noDataText: {
    fontSize: 14,
    color: "#92400E",
    fontWeight: "600",
    textAlign: "center",
  },
  inputCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapperGreen: {
    backgroundColor: "#D1FAE5",
  },
  iconWrapperPurple: {
    backgroundColor: "#EDE9FE",
  },
  iconWrapperEmerald: {
    backgroundColor: "#D1FAE5",
  },
  labelContainer: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 3,
  },
  cardSubLabel: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 16,
    overflow: "hidden",
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#64748B",
    marginRight: 8,
  },
  percentSymbol: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#64748B",
    marginLeft: 8,
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    paddingVertical: 16,
  },
  buttonContainer: {
    marginTop: 8,
    gap: 12,
  },
  refreshButton: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  refreshButtonText: {
    color: "#475569",
    fontSize: 16,
    fontWeight: "700",
  },
  saveButton: {
    backgroundColor: "#059669",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    borderRadius: 14,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  footer: {
    height: 20,
  },
});

export default AdminPanelScreen;
