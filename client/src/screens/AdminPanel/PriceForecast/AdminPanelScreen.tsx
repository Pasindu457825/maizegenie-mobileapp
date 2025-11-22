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
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { Platform } from "react-native";

type Language = "si" | "en";

const AdminPanelScreen = () => {
  const navigation = useNavigation();
  const [language, setLanguage] = useState<Language>("si");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [fuelPrice, setFuelPrice] = useState("");
  const [importTax, setImportTax] = useState("");
  const [farmGatePrice, setFarmGatePrice] = useState("");
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const API_URL =
    Platform.OS === "web"
      ? "http://localhost:8000"
      : "http://192.168.8.181:8000";

  const content = {
    si: {
      title: "පරිපාලක පුවරුව",
      subtitle: "මිල දත්ත කළමනාකරණය",
      fuelPrice: "ඉන්ධන මිල (රු)",
      importTax: "ආනයන බද්ද (%)",
      farmGatePrice: "ගොවි මිල (රු/kg)",
      lastUpdated: "අවසන් යාවත්කාලීනය",
      save: "සුරකින්න",
      refresh: "නැවුම් කරන්න",
      back: "ආපසු",
      saveSuccess: "දත්ත සාර්ථකව සුරකින ලදී",
      saveError: "දත්ත සුරැකීමේදී දෝෂයක්",
      loadError: "දත්ත පූරණයේදී දෝෂයක්",
      fillAll: "කරුණාකර සියලු තොරතුරු පුරවන්න",
      loading: "පූරණය වෙමින්...",
      saving: "සුරකිමින්...",
    },
    en: {
      title: "Admin Panel",
      subtitle: "Price Data Management",
      fuelPrice: "Fuel Price (Rs)",
      importTax: "Import Tax (%)",
      farmGatePrice: "Farm Gate Price (Rs/kg)",
      lastUpdated: "Last Updated",
      save: "Save Changes",
      refresh: "Refresh Data",
      back: "Back",
      saveSuccess: "Data saved successfully",
      saveError: "Error saving data",
      loadError: "Error loading data",
      fillAll: "Please fill all fields",
      loading: "Loading...",
      saving: "Saving...",
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
        language === "si" ? "දෝෂයකි" : "Error",
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
        language === "si" ? "දෝෂයකි" : "Error",
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
          language === "si" ? "සාර්ථකයි" : "Success",
          content[language].saveSuccess
        );
        fetchCurrentData(); // Refresh data
      } else {
        throw new Error(data.message || "Save failed");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      Alert.alert(
        language === "si" ? "දෝෂයකි" : "Error",
        content[language].saveError
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft color="#047857" size={24} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{content[language].title}</Text>
          <Text style={styles.headerSubtitle}>
            {content[language].subtitle}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.langButton}
          onPress={() => setLanguage((prev) => (prev === "si" ? "en" : "si"))}
        >
          <Text style={styles.langText}>
            {language === "si" ? "EN" : "සිං"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>{content[language].loading}</Text>
          </View>
        ) : (
          <>
            {/* Last Updated Info */}
            {lastUpdated && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>
                  {content[language].lastUpdated}
                </Text>
                <Text style={styles.infoValue}>
                  {new Date(lastUpdated).toLocaleString(
                    language === "si" ? "si-LK" : "en-US"
                  )}
                </Text>
              </View>
            )}

            {/* Fuel Price */}
            <View style={styles.formCard}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <DollarSign color="#10B981" size={24} />
                </View>
                <Text style={styles.cardTitle}>
                  {content[language].fuelPrice}
                </Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="380.00"
                value={fuelPrice}
                onChangeText={setFuelPrice}
                keyboardType="decimal-pad"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Import Tax */}
            <View style={styles.formCard}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <Package color="#10B981" size={24} />
                </View>
                <Text style={styles.cardTitle}>
                  {content[language].importTax}
                </Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="25"
                value={importTax}
                onChangeText={setImportTax}
                keyboardType="decimal-pad"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Farm Gate Price */}
            <View style={styles.formCard}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <TrendingUp color="#10B981" size={24} />
                </View>
                <Text style={styles.cardTitle}>
                  {content[language].farmGatePrice}
                </Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="115.00"
                value={farmGatePrice}
                onChangeText={setFarmGatePrice}
                keyboardType="decimal-pad"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.refreshButton]}
                onPress={fetchCurrentData}
                disabled={loading}
              >
                <RefreshCw color="#047857" size={22} />
                <Text style={styles.refreshButtonText}>
                  {content[language].refresh}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Save color="#FFFFFF" size={22} />
                    <Text style={styles.saveButtonText}>
                      {saving
                        ? content[language].saving
                        : content[language].save}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#1F2937",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  langButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#10B981",
  },
  langText: {
    color: "#10B981",
    fontSize: 13,
    fontWeight: "bold",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  infoCard: {
    backgroundColor: "#DBEAFE",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#93C5FD",
  },
  infoLabel: {
    fontSize: 12,
    color: "#1E40AF",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E3A8A",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#D1FAE5",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#047857",
    flex: 1,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#D1FAE5",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "600",
  },
  buttonContainer: {
    marginTop: 20,
    gap: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    borderRadius: 14,
  },
  refreshButton: {
    backgroundColor: "#F0FDF4",
    borderWidth: 2,
    borderColor: "#10B981",
  },
  refreshButtonText: {
    color: "#047857",
    fontSize: 16,
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#10B981",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AdminPanelScreen;
