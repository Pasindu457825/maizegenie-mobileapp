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
import {
  Sun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudSnow,
  CloudLightning,
  CloudFog,
} from "lucide-react-native";

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
  Droplets,
  Wind,
} from "lucide-react-native";
import useUniversalLocation from "../../utils/useUniversalLocation";
import { Platform } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

type Language = "si" | "en";
type NavProp = StackNavigationProp<
  PriceForecastStackParamList,
  "PriceForecastFormScreen"
>;

const API_URL =
  Platform.OS === "web"
    ? "http://localhost:8000" // Expo Web
    : "http://192.168.8.181:8000"; // Real device Expo Go

const PriceForecastFormScreen = () => {
  const navigation = useNavigation<NavProp>();
  const [language, setLanguage] = useState<Language>("si");
  const {
    locationName,
    temperature,
    weatherCondition,
    weatherIcon,
    isLoading,
  } = useUniversalLocation(language);

  // Auto-captured data (System)
  const [year, setYear] = useState("");
  const [week, setWeek] = useState("");
  const [district, setDistrict] = useState("");
  const [season, setSeason] = useState("");
  const [weather, setWeather] = useState("");
  const [fuelPrice, setFuelPrice] = useState("");
  const [cornImportTax, setCornImportTax] = useState("");
  const [farmGatePrice, setFarmGatePrice] = useState("");
  const [isFestivalWeek, setIsFestivalWeek] = useState(false);

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
      locationDetecting: "ස්ථානය හඳුනාගනිමින්...",
      weatherLoading: "කාලගුණය පූරණය වෙමින්...",
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
      locationDetecting: "Detecting location...",
      weatherLoading: "Loading weather...",
    },
  };

  // Enhanced weather translation mapping
  const getWeatherTranslation = (condition: string, lang: Language): string => {
    if (!condition) return lang === "si" ? "කාලගුණය" : "Weather";

    const c = condition.toLowerCase();

    // ---- RAIN ----
    if (c.includes("shower rain") || c.includes("light intensity shower")) {
      return lang === "si" ? "සෙමෙන් වැසි" : "Light Shower Rain";
    }
    if (c.includes("light rain")) {
      return lang === "si" ? "සැහැල්ලු වැසි" : "Light Rain";
    }
    if (c.includes("moderate rain")) {
      return lang === "si" ? "මධ්‍යම වැසි" : "Moderate Rain";
    }
    if (c.includes("heavy") && c.includes("rain")) {
      return lang === "si" ? "බර වැසි" : "Heavy Rain";
    }

    // ---- CLOUDS ----
    if (c.includes("clear")) {
      return lang === "si" ? "පිරිසිදු අහස" : "Clear Sky";
    }
    if (c.includes("few clouds")) {
      return lang === "si" ? "සුළු වලාකුළු" : "Few Clouds";
    }
    if (c.includes("scattered")) {
      return lang === "si" ? "විසිරුණු වලාකුළු" : "Scattered Clouds";
    }
    if (c.includes("broken")) {
      return lang === "si" ? "කැබලි වලාකුළු" : "Broken Clouds";
    }
    if (c.includes("overcast")) {
      return lang === "si" ? "තද වලාකුළු" : "Overcast Clouds";
    }

    // ---- THUNDER ----
    if (c.includes("thunder")) {
      return lang === "si" ? "අකුණු සහිත වැසි" : "Thunderstorm";
    }

    // ---- MIST / FOG ----
    if (c.includes("mist") || c.includes("fog") || c.includes("haze")) {
      return lang === "si" ? "මීදුම" : "Mist";
    }

    // DEFAULT
    return lang === "si" ? "කාලගුණය" : condition;
  };

  const getWeatherIcon = (condition: string | null) => {
    if (!condition) return <Cloud size={18} color="#10B981" />;

    const c = condition.toLowerCase();

    if (c.includes("clear")) return <Sun size={18} color="#f59e0b" />;

    if (c.includes("rain") && c.includes("light"))
      return <CloudDrizzle size={18} color="#0ea5e9" />;

    if (c.includes("rain")) return <CloudRain size={18} color="#0284c7" />;

    if (c.includes("thunder"))
      return <CloudLightning size={18} color="#e11d48" />;

    if (c.includes("mist") || c.includes("fog") || c.includes("haze"))
      return <CloudFog size={18} color="#6b7280" />;

    if (c.includes("cloud")) return <Cloud size={18} color="#10b981" />;

    return <Cloud size={18} color="#10b981" />;
  };

  // Auto-capture data on mount
  useEffect(() => {
    captureSystemData();
  }, []);

  useEffect(() => {
    fetchFestivalWeek();
  }, []);

  // 🔥 NEW: Fetch price data from API
  const fetchPriceDataFromAPI = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/price-data`);
      const data = await response.json();

      if (response.ok && data.success) {
        setFuelPrice(
          language === "si"
            ? `රු. ${data.data.fuelPrice.toFixed(2)}`
            : `Rs. ${data.data.fuelPrice.toFixed(2)}`
        );

        setCornImportTax(`${data.data.importTax}%`);

        setFarmGatePrice(
          language === "si"
            ? `රු. ${data.data.farmGatePrice.toFixed(2)}/kg`
            : `Rs. ${data.data.farmGatePrice.toFixed(2)}/kg`
        );
      }
    } catch (error) {
      console.error("Error fetching price data:", error);
    }
  };

  const captureSystemData = async () => {
    try {
      // Get current date (Asia/Colombo timezone)
      const now = new Date();
      const currentYear = now.getFullYear().toString();
      setYear(currentYear);

      // Calculate ISO week number
      const weekNumber = getISOWeek(now).toString();
      setWeek(weekNumber);

      // Determine season based on date
      const currentSeason = determineSeason(now);
      setSeason(currentSeason);

      // 🔥 UPDATED: Fetch price data from API
      await fetchPriceDataFromAPI();
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

  // Update district and weather when location data changes
  useEffect(() => {
    // Update district
    if (isLoading) {
      setDistrict(content[language].locationDetecting);
    } else if (locationName && locationName !== "Loading...") {
      setDistrict(locationName);
    } else {
      setDistrict(language === "si" ? "ස්ථානය නොමැත" : "Location unavailable");
    }

    // Update weather
    if (isLoading) {
      setWeather(content[language].weatherLoading);
    } else if (temperature !== null && weatherCondition) {
      const translatedCondition = getWeatherTranslation(
        weatherCondition,
        language
      );
      setWeather(`${Math.round(temperature)}°C • ${translatedCondition}`);
    } else {
      setWeather(
        language === "si" ? "කාලගුණ දත්ත නොමැත" : "Weather unavailable"
      );
    }
  }, [locationName, temperature, weatherCondition, isLoading, language]);

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
      return language === "si" ? "මහ කන්නය" : "Maha Season";
    } else {
      return language === "si" ? "යල කන්නය" : "Yala Season";
    }
  };
  useFocusEffect(
    useCallback(() => {
      fetchPriceDataFromAPI();
    }, [])
  );

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
      isFestivalWeek,
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

  const fetchFestivalWeek = async () => {
    try {
      const today = new Date();
      const year = today.getFullYear();

      const holidaysRes = await fetch(
        `https://calendarific.com/api/v2/holidays?api_key=0TTNl4fXIobqjfegCz7yHxHEEo57WOi3&country=LK&year=${year}&type=public`
      );

      const json = await holidaysRes.json();

      // Calendarific correct response object:
      const holidays = json?.response?.holidays || [];

      let festivalDetected = false;

      holidays.forEach((h: any) => {
        const hd = new Date(h.date.iso);
        const diffDays =
          Math.abs(today.getTime() - hd.getTime()) / (1000 * 60 * 60 * 24);

        // +- 3 days rule for "festival week"
        if (diffDays <= 3) {
          festivalDetected = true;
        }
      });

      setIsFestivalWeek(festivalDetected);
    } catch (err) {
      console.log("Festival week detect error:", err);
    }
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

      {/* Enhanced Sub-header with better styling */}
      <View style={styles.subHeader}>
        <View style={styles.infoCard}>
          {getWeatherIcon(weatherCondition)}

          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>
              {language === "si" ? "ස්ථානය" : "Location"}
            </Text>
            <Text style={styles.infoValue}>{district}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoCard}>
          <CloudSun color="#10B981" size={18} />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>
              {language === "si" ? "කාලගුණය" : "Weather"}
            </Text>
            <Text style={styles.infoValue}>{weather}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Auto-Captured Data Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Droplets color="#10B981" size={20} />
            </View>
            <Text style={styles.sectionTitle}>
              {content[language].autoData}
            </Text>
          </View>

          <View style={styles.autoDataGrid}>
            <View style={styles.autoDataCard}>
              <View style={styles.cardIconContainer}>
                <Calendar color="#10B981" size={22} />
              </View>
              <Text style={styles.autoDataLabel}>{content[language].year}</Text>
              <Text style={styles.autoDataValue}>{year}</Text>
            </View>

            <View style={styles.autoDataCard}>
              <View style={styles.cardIconContainer}>
                <Calendar color="#10B981" size={22} />
              </View>
              <Text style={styles.autoDataLabel}>{content[language].week}</Text>
              <Text style={styles.autoDataValue}>{week}</Text>
            </View>

            <View style={styles.autoDataCard}>
              <View style={styles.cardIconContainer}>
                <Leaf color="#10B981" size={22} />
              </View>
              <Text style={styles.autoDataLabel}>
                {content[language].season}
              </Text>
              <Text style={styles.autoDataValue}>{season}</Text>
            </View>

            <View style={styles.autoDataCard}>
              <View style={styles.cardIconContainer}>
                <DollarSign color="#10B981" size={22} />
              </View>
              <Text style={styles.autoDataLabel}>
                {content[language].fuelPrice}
              </Text>
              <Text style={styles.autoDataValue}>{fuelPrice}</Text>
            </View>

            <View style={styles.autoDataCard}>
              <View style={styles.cardIconContainer}>
                <Package color="#10B981" size={22} />
              </View>
              <Text style={styles.autoDataLabel}>
                {content[language].importTax}
              </Text>
              <Text style={styles.autoDataValue}>{cornImportTax}</Text>
            </View>

            <View style={styles.autoDataCard}>
              <View style={styles.cardIconContainer}>
                <DollarSign color="#10B981" size={22} />
              </View>
              <Text style={styles.autoDataLabel}>
                {content[language].currentPrice}
              </Text>
              <Text style={styles.autoDataValue}>{farmGatePrice}</Text>
            </View>
          </View>
          <View style={styles.autoDataCard}>
            <View style={styles.cardIconContainer}>
              <Calendar color="#10B981" size={22} />
            </View>
            <Text style={styles.autoDataLabel}>
              {language === "si" ? "උත්සව සතිය" : "Festival Week"}
            </Text>
            <Text style={styles.autoDataValue}>
              {isFestivalWeek
                ? language === "si"
                  ? "ඔව්"
                  : "Yes"
                : language === "si"
                ? "නැත"
                : "No"}
            </Text>
          </View>
        </View>

        {/* User Inputs Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Leaf color="#10B981" size={20} />
            </View>
            <Text style={styles.sectionTitle}>
              {content[language].userInputs}
            </Text>
          </View>

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
              <View style={styles.switchIconContainer}>
                <Package color="#047857" size={22} />
              </View>
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
          <ArrowRight color="#FFFFFF" size={22} />
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
  headerRight: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1FAE5",
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
  subHeader: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#047857",
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 12,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    gap: 10,
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#065F46",
  },
  autoDataGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  autoDataCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    width: "48%",
    borderWidth: 1,
    borderColor: "#D1FAE5",
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  autoDataLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "center",
  },
  autoDataValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#047857",
    marginTop: 6,
    textAlign: "center",
  },
  formGroup: {
    marginBottom: 18,
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
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#D1FAE5",
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: "#1F2937",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  switchGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    borderWidth: 2,
    borderColor: "#D1FAE5",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  switchLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  switchIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#047857",
    flex: 1,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#10B981",
    paddingVertical: 18,
    borderRadius: 14,
    marginTop: 12,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  adminButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0EA5E9",
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 20,
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },

  adminButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PriceForecastFormScreen;
