import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Switch,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { PriceForecastStackParamList } from "../../navigation/PriceForecastStack";
import {
  ArrowRight,
  ArrowLeft,
  Calendar,
  MapPin,
  Leaf,
  DollarSign,
  Package,
  Bell,
  CloudSun,
} from "lucide-react-native";

type Language = "si" | "en";
type NavProp = StackNavigationProp<
  PriceForecastStackParamList,
  "PriceForecastFormScreen"
>;

const PriceForecastFormScreen = () => {
  const navigation = useNavigation<NavProp>();
  const [language, setLanguage] = useState<Language>("si");

  // Auto-captured data (System)
  const [year, setYear] = useState("");
  const [week, setWeek] = useState("");
  const [district, setDistrict] = useState("");
  const [season, setSeason] = useState("");
  const [weather, setWeather] = useState("");
  const [fuelPrice, setFuelPrice] = useState("");
  const [cornImportTax, setCornImportTax] = useState("");
  const [farmGatePrice, setFarmGatePrice] = useState("");

  // User inputs (Required)
  const [seedVariety, setSeedVariety] = useState("");
  const [expectedYield, setExpectedYield] = useState("");
  const [farmArea, setFarmArea] = useState("");
  const [seedCost, setSeedCost] = useState("");
  const [fertilizerCost, setFertilizerCost] = useState("");
  const [labourCost, setLabourCost] = useState("");
  const [otherCosts, setOtherCosts] = useState("");
  const [hasStorage, setHasStorage] = useState(false);

  // Content translations
  const content = {
    si: {
      title: "ඉරිඟු මිල පුරෝකථනය",
      subtitle: "තොරතුරු පුරවන්න",
      autoData: "ස්වයංක්‍රීය දත්ත",
      userInputs: "ඔබේ තොරතුරු",
      year: "වර්ෂය",
      week: "සතිය",
      district: "දිස්ත්‍රික්කය",
      season: "වගා කන්නය",
      weather: "කාලගුණය",
      fuelPrice: "ඉන්ධන මිල",
      importTax: "ආනයන බද්ද",
      currentPrice: "වත්මන් මිල",
      seedVariety: "බීජ වර්ගය",
      expectedYield: "අපේක්ෂිත අස්වැන්න (kg/අක්කරය)",
      farmArea: "ගොවිපල ප්‍රමාණය (අක්කර)",
      seedCost: "බීජ පිරිවැය (රු)",
      fertilizerCost: "පොහොර පිරිවැය (රු)",
      labourCost: "ශ්‍රමික පිරිවැය (රු)",
      otherCosts: "අනෙකුත් පිරිවැය (රු)",
      hasStorage: "ගබඩා පහසුකම් තිබේද?",
      yes: "ඔව්",
      no: "නැත",
      submit: "පුරෝකථනය ලබා ගන්න",
      back: "ආපසු",
      detecting: "හඳුනාගනිමින්...",
      loading: "පූරණය වෙමින්...",
    },
    en: {
      title: "Corn Price Forecast",
      subtitle: "Enter Information",
      autoData: "Auto-Captured Data",
      userInputs: "Your Inputs",
      year: "Year",
      week: "Week",
      district: "District",
      season: "Season",
      weather: "Weather",
      fuelPrice: "Fuel Price",
      importTax: "Import Tax",
      currentPrice: "Current Price",
      seedVariety: "Seed Variety",
      expectedYield: "Expected Yield (kg/acre)",
      farmArea: "Farm Area (acres)",
      seedCost: "Seed Cost (Rs)",
      fertilizerCost: "Fertilizer Cost (Rs)",
      labourCost: "Labour Cost (Rs)",
      otherCosts: "Other Costs (Rs)",
      hasStorage: "Do you have storage?",
      yes: "Yes",
      no: "No",
      submit: "Get Forecast",
      back: "Back",
      detecting: "Detecting...",
      loading: "Loading...",
    },
  };

  // Auto-capture data on mount
  useEffect(() => {
    captureSystemData();
  }, []);

  const captureSystemData = async () => {
    try {
      // Get current date (Asia/Colombo timezone)
      const now = new Date();
      const currentYear = now.getFullYear().toString();
      setYear(currentYear);

      // Calculate ISO week number
      const weekNumber = getISOWeek(now).toString();
      setWeek(weekNumber);

      // Auto-detect district (GPS/Profile fallback)
      await detectDistrict();

      // Determine season based on date
      const currentSeason = determineSeason(now);
      setSeason(currentSeason);

      // Fetch weather data
      await fetchWeather();

      // Fetch fuel price
      await fetchFuelPrice();

      // Fetch import tax
      await fetchImportTax();

      // Fetch current farm-gate price
      await fetchFarmGatePrice();
    } catch (error) {
      console.error("Error capturing system data:", error);
      Alert.alert(
        language === "si" ? "දෝෂයකි" : "Error",
        language === "si"
          ? "දත්ත ලබා ගැනීමේදී දෝෂයක් සිදුවිය"
          : "Error capturing data"
      );
    }
  };

  // Calculate ISO week number
  const getISOWeek = (date: Date): number => {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const jan4 = new Date(target.getFullYear(), 0, 4);
    const dayDiff = (target.getTime() - jan4.getTime()) / 86400000;
    return 1 + Math.ceil(dayDiff / 7);
  };

  // Determine season based on date
  const determineSeason = (date: Date): string => {
    const month = date.getMonth() + 1; // 1-12
    // Maha: Oct-Mar (10,11,12,1,2,3)
    // Yala: Apr-Sep (4,5,6,7,8,9)
    if (month >= 10 || month <= 3) {
      return language === "si" ? "මහ" : "Maha";
    } else {
      return language === "si" ? "යල" : "Yala";
    }
  };

  // Detect district (GPS or profile)
  const detectDistrict = async () => {
    // TODO: Implement GPS detection or profile fallback
    // Placeholder
    setDistrict(language === "si" ? "මොණරාගල" : "Monaragala");
  };

  // Fetch weather data
  const fetchWeather = async () => {
    // TODO: Implement weather API call
    // Placeholder
    setWeather(language === "si" ? "අව අව වැසි" : "Partly Cloudy");
  };

  // Fetch fuel price
  const fetchFuelPrice = async () => {
    // TODO: Implement fuel price API/cache
    // Placeholder
    setFuelPrice("රු. 380.00");
  };

  // Fetch import tax
  const fetchImportTax = async () => {
    // TODO: Implement policy table lookup
    // Placeholder
    setCornImportTax("25%");
  };

  // Fetch farm-gate price
  const fetchFarmGatePrice = async () => {
    // TODO: Implement HARTI/market data API
    // Placeholder
    setFarmGatePrice("රු. 115.00/kg");
  };

  const handleSubmit = () => {
    // Validation
    if (
      !seedVariety ||
      !expectedYield ||
      !farmArea ||
      !seedCost ||
      !fertilizerCost ||
      !labourCost
    ) {
      Alert.alert(
        language === "si" ? "දෝෂයකි" : "Error",
        language === "si"
          ? "කරුණාකර සියලු අනිවාර්ය තොරතුරු පුරවන්න"
          : "Please fill all required fields"
      );
      return;
    }

    // Calculate production cost per kg
    const totalCost =
      parseFloat(seedCost) +
      parseFloat(fertilizerCost) +
      parseFloat(labourCost) +
      (otherCosts ? parseFloat(otherCosts) : 0);
    const totalYield = parseFloat(expectedYield) * parseFloat(farmArea);
    const productionCostPerKg = totalCost / totalYield;

    // Prepare forecast data
    const forecastData = {
      // Auto-captured
      year,
      week,
      district,
      season,
      weather,
      fuelPrice,
      cornImportTax,
      farmGatePrice,
      // User inputs
      seedVariety,
      expectedYield: parseFloat(expectedYield),
      farmArea: parseFloat(farmArea),
      totalCost,
      productionCostPerKg,
      hasStorage,
      language,
    };

    // Navigate to forecast screen with data
    navigation.navigate("PriceForecastScreen", { data: forecastData } as any);
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft color="#047857" size={24} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{content[language].title}</Text>
          <Text style={styles.headerSubtitle}>
            {content[language].subtitle}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Bell color="#10B981" size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.langButton}
            onPress={() => setLanguage((prev) => (prev === "si" ? "en" : "si"))}
          >
            <Text style={styles.langText}>
              {language === "si" ? "EN" : "සිං"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sub-header */}
      <View style={styles.subHeader}>
        <View style={styles.locationRow}>
          <MapPin color="#047857" size={16} />
          <Text style={styles.locationText}>{district}</Text>
        </View>
        <View style={styles.weatherRow}>
          <CloudSun color="#10B981" size={16} />
          <Text style={styles.weatherText}>{weather}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Auto-Captured Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            📊 {content[language].autoData}
          </Text>

          <View style={styles.autoDataGrid}>
            <View style={styles.autoDataCard}>
              <Calendar color="#10B981" size={20} />
              <Text style={styles.autoDataLabel}>
                {content[language].year}
              </Text>
              <Text style={styles.autoDataValue}>{year}</Text>
            </View>

            <View style={styles.autoDataCard}>
              <Calendar color="#10B981" size={20} />
              <Text style={styles.autoDataLabel}>
                {content[language].week}
              </Text>
              <Text style={styles.autoDataValue}>{week}</Text>
            </View>

            <View style={styles.autoDataCard}>
              <Leaf color="#10B981" size={20} />
              <Text style={styles.autoDataLabel}>
                {content[language].season}
              </Text>
              <Text style={styles.autoDataValue}>{season}</Text>
            </View>

            <View style={styles.autoDataCard}>
              <DollarSign color="#10B981" size={20} />
              <Text style={styles.autoDataLabel}>
                {content[language].fuelPrice}
              </Text>
              <Text style={styles.autoDataValue}>{fuelPrice}</Text>
            </View>

            <View style={styles.autoDataCard}>
              <Package color="#10B981" size={20} />
              <Text style={styles.autoDataLabel}>
                {content[language].importTax}
              </Text>
              <Text style={styles.autoDataValue}>{cornImportTax}</Text>
            </View>

            <View style={styles.autoDataCard}>
              <DollarSign color="#10B981" size={20} />
              <Text style={styles.autoDataLabel}>
                {content[language].currentPrice}
              </Text>
              <Text style={styles.autoDataValue}>{farmGatePrice}</Text>
            </View>
          </View>
        </View>

        {/* User Inputs Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            ✍️ {content[language].userInputs}
          </Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{content[language].seedVariety} *</Text>
            <TextInput
              style={styles.input}
              placeholder={
                language === "si" ? "උදා: පැසිෆික් 999" : "e.g., Pacific 999"
              }
              value={seedVariety}
              onChangeText={setSeedVariety}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, styles.formGroupHalf]}>
              <Text style={styles.label}>
                {content[language].expectedYield} *
              </Text>
              <TextInput
                style={styles.input}
                placeholder="1000"
                value={expectedYield}
                onChangeText={setExpectedYield}
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={[styles.formGroup, styles.formGroupHalf]}>
              <Text style={styles.label}>{content[language].farmArea} *</Text>
              <TextInput
                style={styles.input}
                placeholder="2.5"
                value={farmArea}
                onChangeText={setFarmArea}
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{content[language].seedCost} *</Text>
            <TextInput
              style={styles.input}
              placeholder="25000"
              value={seedCost}
              onChangeText={setSeedCost}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              {content[language].fertilizerCost} *
            </Text>
            <TextInput
              style={styles.input}
              placeholder="35000"
              value={fertilizerCost}
              onChangeText={setFertilizerCost}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{content[language].labourCost} *</Text>
            <TextInput
              style={styles.input}
              placeholder="40000"
              value={labourCost}
              onChangeText={setLabourCost}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{content[language].otherCosts}</Text>
            <TextInput
              style={styles.input}
              placeholder="5000"
              value={otherCosts}
              onChangeText={setOtherCosts}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.switchGroup}>
            <View style={styles.switchLabelContainer}>
              <Package color="#047857" size={20} />
              <Text style={styles.switchLabel}>
                {content[language].hasStorage}
              </Text>
            </View>
            <Switch
              value={hasStorage}
              onValueChange={setHasStorage}
              trackColor={{ false: "#D1D5DB", true: "#10B981" }}
              thumbColor={hasStorage ? "#FFFFFF" : "#F3F4F6"}
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>
            {content[language].submit}
          </Text>
          <ArrowRight color="#FFFFFF" size={20} />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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
    paddingBottom: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  langButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#10B981",
  },
  langText: {
    color: "#10B981",
    fontSize: 12,
    fontWeight: "bold",
  },
  subHeader: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#047857",
  },
  weatherRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  weatherText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#10B981",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#065F46",
    marginBottom: 16,
  },
  autoDataGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  autoDataCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    width: "48%",
    borderWidth: 1,
    borderColor: "#D1FAE5",
    alignItems: "center",
  },
  autoDataLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
  autoDataValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#047857",
    marginTop: 4,
    textAlign: "center",
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
  },
  formGroupHalf: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#047857",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#D1FAE5",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#1F2937",
  },
  switchGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#D1FAE5",
    marginTop: 8,
  },
  switchLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#047857",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#10B981",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default PriceForecastFormScreen;