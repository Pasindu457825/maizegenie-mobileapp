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
  Modal,
  FlatList,
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
  Database,
  MapPin,
  ChevronDown,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { Platform } from "react-native";
import { useLanguage } from "../../../context/LanguageContext";
import { supabase } from "../../../lib/supabase";

const DISTRICTS = [
  "Anuradhapura",
  "Polonnaruwa",
  "Kurunegala",
  "Puttalam",
  "Kandy",
  "Matale",
  "Badulla",
  "Monaragala",
  "Hambantota",
  "Matara",
  "Colombo",
  "Gampaha",
  "Jaffna",
  "Nuwara Eliya",
];

type Language = "sinhala" | "english" | "tamil";

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

  // ── Historical price fields ──────────────────────────────────────────────
  const [histDistrict, setHistDistrict] = useState("Anuradhapura");
  const [histYear, setHistYear] = useState("");
  const [histWeek, setHistWeek] = useState("");
  const [histPrice, setHistPrice] = useState("");
  const [histSaving, setHistSaving] = useState(false);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);

  // Auto-fill previous ISO week on mount
  useEffect(() => {
    const now = new Date();
    const lastWeekDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    // ISO week: Thursday of the target week determines the ISO year
    const dayOfWeek = lastWeekDate.getDay() === 0 ? 7 : lastWeekDate.getDay();
    const thursday = new Date(lastWeekDate);
    thursday.setDate(lastWeekDate.getDate() + (4 - dayOfWeek));
    const isoYear = thursday.getFullYear();
    const jan4 = new Date(isoYear, 0, 4);
    const jan4Day = jan4.getDay() === 0 ? 7 : jan4.getDay();
    const week1Monday = new Date(jan4);
    week1Monday.setDate(jan4.getDate() - (jan4Day - 1));
    const isoWeek =
      Math.floor(
        (lastWeekDate.getTime() - week1Monday.getTime()) /
          (7 * 24 * 60 * 60 * 1000),
      ) + 1;
    setHistYear(String(isoYear));
    setHistWeek(String(isoWeek));
  }, []);

  const handleAddHistoricalPrice = async () => {
    const yearNum = parseInt(histYear, 10);
    const weekNum = parseInt(histWeek, 10);
    const priceNum = parseFloat(histPrice);

    if (
      !histDistrict ||
      !Number.isFinite(yearNum) ||
      !Number.isFinite(weekNum) ||
      weekNum < 1 ||
      weekNum > 52 ||
      !Number.isFinite(priceNum) ||
      priceNum <= 0
    ) {
      Alert.alert(
        language === "sinhala"
          ? "අවශ්‍යයි"
          : language === "tamil"
            ? "தேவை"
            : "Required",
        content[language].histFillAll,
      );
      return;
    }

    setHistSaving(true);
    try {
      const { error } = await supabase.from("maize_prices").upsert(
        {
          year: yearNum,
          week: weekNum,
          district: histDistrict,
          price: priceNum,
          source: "officer_input",
        },
        { onConflict: "year,week,district" },
      );

      if (error) throw error;

      Alert.alert(
        language === "sinhala"
          ? "සාර්තකයි ✓"
          : language === "tamil"
            ? "வெற்றி ✓"
            : "Success ✓",
        content[language].histSuccess,
      );
      setHistPrice("");
    } catch (err: any) {
      console.error("[maize_prices] upsert error:", err);
      Alert.alert(
        language === "sinhala"
          ? "දොෂයකිස්"
          : language === "tamil"
            ? "பிழை"
            : "Error",
        content[language].histError,
      );
    } finally {
      setHistSaving(false);
    }
  };

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
      subtitle: "🌽 MaizeGenie",
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
      // Historical price section
      histTitle: "පෙර සතියේ මිල",
      histDesc: "ML ආකෘතිය සඳහා සත්‍ය ඓතිහාසික මිල සොරා ගන්න",
      histDistrict: "දිස්ත්‍රික්කය",
      histYear: "වර්ෂය",
      histWeek: "සතිය (ISO)",
      histPrice: "මිල (රු/කිලෝ)",
      histSave: "ඓතිහාසික මිල සුරකින්න",
      histSaving: "සුරකිමින්...",
      histSuccess: "ඓතිහාසික මිල සාර්ථකව සුරකින ලදී!",
      histError: "ඓතිහාසික මිල සුරැකීමේදී දෝෂයක් ඇතිවිය",
      histFillAll: "කරුණාකර සියලු ඓතිහාසික මිල තොරතුරු නිවැරදිව පුරවන්න",
      histDuplicate: "මෙම සතිය සඳහා මිල දැනටමත් ඇත. නිවැරදි කරන ලදී.",
      selectDistrict: "දිස්ත්‍රික්කය තෝරන්න",
    },
    english: {
      title: "Price Update",
      subtitle: "🌽 MaizeGenie",
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
      // Historical price section
      histTitle: "Previous Week Price",
      histDesc:
        "Record verified farm-gate prices for the ML model's lag features",
      histDistrict: "District",
      histYear: "Year",
      histWeek: "Week (ISO)",
      histPrice: "Price (Rs/kg)",
      histSave: "Save Historical Price",
      histSaving: "Saving...",
      histSuccess: "Historical price saved successfully!",
      histError: "Error saving historical price",
      histFillAll: "Please fill all historical price fields correctly",
      histDuplicate: "Price for this week already existed. Updated.",
      selectDistrict: "Select District",
      fillAll: "Please fill all fields correctly",
      loading: "Loading...",
      saving: "Saving...",
      noData: "No data available yet",
    },
    tamil: {
      title: "விலை பதிவேற்றம்",
      subtitle: "🌽 MaizeGenie",
      welcome: "வரவேற்கிறோம்",
      description: "தற்போதைய சந்தை விலைகள் மற்றும் வரிகளை பதிவிடுங்கள்",
      fuelPrice: "எரிபொருள் விலை",
      fuelPriceUnit: "ரூபாய் (லிட்டருக்கு)",
      importTax: "இறக்குமதி வரி",
      importTaxUnit: "சதவிகிதம் (%)",
      farmGatePrice: "விவசாய வாயில் விலை",
      farmGatePriceUnit: "ரூபாய் (கிலோக்கு)",
      lastUpdated: "கடைசியாக பதிவிட்டது",
      save: "மாற்றங்களை சேமி",
      refresh: "தரவு புதுப்பி",
      back: "பின்னோக்கிச் செல்",
      saveSuccess: "தரவு வெற்றிகரமாகப் பதிவிட்டது!",
      saveError: "தரவை சேமிக்கும்போது பிழை ஏற்பட்டது",
      loadError: "தரவை ஏற்றும்போது பிழை ஏற்பட்டது",
      fillAll: "அனைத்து தகவல்களையும் சரியாக நிரப்பவும்",
      loading: "ஏற்றுகிறது...",
      saving: "சேமிக்கிறது...",
      noData: "இதுவரை தரவு ஏதுமில்லை",
      // Historical price section
      histTitle: "முந்தைய வார விலை",
      histDesc:
        "ML மாதிரியின் lag அம்சங்களுக்கான சரிபார்க்கப்பட்ட விலைகளை பதிவிடுங்கள்",
      histDistrict: "மாவட்டம்",
      histYear: "ஆண்டு",
      histWeek: "வாரம் (ISO)",
      histPrice: "விலை (ரூ/கிலோ)",
      histSave: "வரலாற்று விலையை சேமி",
      histSaving: "சேமிக்கிறது...",
      histSuccess: "வரலாற்று விலை வெற்றிகரமாக சேமிக்கப்பட்டது!",
      histError: "வரலாற்று விலையை சேமிக்கும்போது பிழை",
      histFillAll: "அனைத்து வரலாற்று விலை தகவல்களையும் சரியாக நிரப்பவும்",
      histDuplicate:
        "இந்த வாரத்திற்கு விலை ஏற்கெனவே உள்ளது. புதுப்பிக்கப்பட்டது.",
      selectDistrict: "மாவட்டத்தை தேர்ந்தெடுக்கவும்",
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
        language === "sinhala"
          ? "දොෂයකිස්"
          : language === "tamil"
            ? "பிழை"
            : "Error",
        content[language].loadError,
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
        content[language].fillAll,
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
          language === "sinhala"
            ? "සාර්තකයි ✓"
            : language === "tamil"
              ? "வெற்றி ✓"
              : "Success ✓",
          content[language].saveSuccess,
        );
        fetchCurrentData(); // Refresh data
      } else {
        throw new Error(data.message || "Save failed");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      Alert.alert(
        language === "sinhala"
          ? "දොෂයකිස්"
          : language === "tamil"
            ? "பிழை"
            : "Error",
        content[language].saveError,
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
                      language === "sinhala"
                        ? "si-LK"
                        : language === "tamil"
                          ? "ta-LK"
                          : "en-US",
                      {
                        dateStyle: "medium",
                        timeStyle: "short",
                      },
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

            {/* ── Historical Price Card ──────────────────────────────── */}
            <View style={[styles.inputCard, styles.histCard]}>
              <View style={styles.cardHeader}>
                <View style={styles.cardLabelRow}>
                  <View style={[styles.iconWrapper, styles.iconWrapperBlue]}>
                    <Database color="#3B82F6" size={24} />
                  </View>
                  <View style={styles.labelContainer}>
                    <Text style={styles.cardLabel}>
                      {content[language].histTitle}
                    </Text>
                    <Text style={styles.cardSubLabel}>
                      {content[language].histDesc}
                    </Text>
                  </View>
                </View>
              </View>

              {/* District selector */}
              <Text style={styles.histFieldLabel}>
                {content[language].histDistrict}
              </Text>
              <TouchableOpacity
                style={styles.districtSelector}
                onPress={() => setShowDistrictPicker(true)}
              >
                <MapPin color="#3B82F6" size={16} />
                <Text style={styles.districtSelectorText}>{histDistrict}</Text>
                <ChevronDown color="#64748B" size={16} />
              </TouchableOpacity>

              {/* Year + Week row */}
              <View style={styles.histRow}>
                <View style={styles.histHalf}>
                  <Text style={styles.histFieldLabel}>
                    {content[language].histYear}
                  </Text>
                  <View style={styles.histInputWrapper}>
                    <TextInput
                      style={styles.histInput}
                      value={histYear}
                      onChangeText={setHistYear}
                      keyboardType="number-pad"
                      maxLength={4}
                      placeholder="2026"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>
                <View style={styles.histHalf}>
                  <Text style={styles.histFieldLabel}>
                    {content[language].histWeek}
                  </Text>
                  <View style={styles.histInputWrapper}>
                    <TextInput
                      style={styles.histInput}
                      value={histWeek}
                      onChangeText={setHistWeek}
                      keyboardType="number-pad"
                      maxLength={2}
                      placeholder="1–52"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>
              </View>

              {/* Price input */}
              <Text style={styles.histFieldLabel}>
                {content[language].histPrice}
              </Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencySymbol}>රු</Text>
                <TextInput
                  style={styles.input}
                  placeholder="115.00"
                  value={histPrice}
                  onChangeText={setHistPrice}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Save historical price button */}
              <TouchableOpacity
                style={[
                  styles.histSaveButton,
                  histSaving && styles.buttonDisabled,
                ]}
                onPress={handleAddHistoricalPrice}
                disabled={histSaving}
              >
                {histSaving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Database color="#FFFFFF" size={18} />
                )}
                <Text style={styles.saveButtonText}>
                  {histSaving
                    ? content[language].histSaving
                    : content[language].histSave}
                </Text>
              </TouchableOpacity>
            </View>

            {/* District Picker Modal */}
            <Modal
              visible={showDistrictPicker}
              transparent
              animationType="slide"
              onRequestClose={() => setShowDistrictPicker(false)}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowDistrictPicker(false)}
              >
                <View style={styles.modalSheet}>
                  <Text style={styles.modalTitle}>
                    {content[language].selectDistrict}
                  </Text>
                  <FlatList
                    data={DISTRICTS}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.districtOption,
                          item === histDistrict &&
                            styles.districtOptionSelected,
                        ]}
                        onPress={() => {
                          setHistDistrict(item);
                          setShowDistrictPicker(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.districtOptionText,
                            item === histDistrict &&
                              styles.districtOptionTextSelected,
                          ]}
                        >
                          {item}
                        </Text>
                        {item === histDistrict && (
                          <CheckCircle color="#059669" size={18} />
                        )}
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </TouchableOpacity>
            </Modal>

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
  // ── Historical price card ──────────────────────────────────────────────────
  histCard: {
    borderColor: "#DBEAFE",
    borderWidth: 1.5,
  },
  iconWrapperBlue: {
    backgroundColor: "#DBEAFE",
  },
  histFieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
    marginTop: 14,
  },
  districtSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  districtSelectorText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  histRow: {
    flexDirection: "row",
    gap: 12,
  },
  histHalf: {
    flex: 1,
  },
  histInputWrapper: {
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  histInput: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    paddingVertical: 14,
  },
  histSaveButton: {
    marginTop: 20,
    backgroundColor: "#3B82F6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  // ── District picker modal ──────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 16,
    textAlign: "center",
  },
  districtOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  districtOptionSelected: {
    backgroundColor: "#D1FAE5",
  },
  districtOptionText: {
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "500",
  },
  districtOptionTextSelected: {
    color: "#065F46",
    fontWeight: "700",
  },
});

export default AdminPanelScreen;
