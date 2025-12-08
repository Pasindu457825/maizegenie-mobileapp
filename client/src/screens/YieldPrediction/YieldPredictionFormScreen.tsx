import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { YieldPredictionStackParamList } from "../../navigation/YieldPredictionStack";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  MapPin,
  Leaf,
  Droplets,
  CloudSun,
  Bell,
  Sun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudFog,
} from "lucide-react-native";
import useUniversalLocation from "../../utils/useUniversalLocation";

type Language = "si" | "en";
type NavProp = StackNavigationProp<
  YieldPredictionStackParamList,
  "YieldPredictionFormScreen"
>;

// 🔥 Dynamic API URL
const getApiUrl = () => {
  if (Platform.OS === "android") {
    return process.env.EXPO_PUBLIC_API_BASE;
  } else if (Platform.OS === "ios") {
    return "http://localhost:8000";
  } else {
    return "http://localhost:8000";
  }
};

const API_URL = getApiUrl();

const DISTRICTS = ["Anuradhapura", "Monaragala", "Badulla", "Ampara", "Dambulla"];
const VARIETIES = [
  "Ruhunu 1",
  "Ruhunu 2",
  "Sampath",
  "Jet 999",
  "GT 709",
  "GT 722",
  "Pacific 808",
  "GT200",
  "Commando",
];
const SOIL_CONDITIONS = ["Good", "Medium", "Poor"];
const IRRIGATION_TYPES = ["Irrigated", "Rainfed", "Mixed"];
const RAINFALL_CONDITIONS = ["High", "Normal", "Low"];

const YieldPredictionFormScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute();
  const { role, language: initialLanguage } = route.params as {
    role: "farmer" | "officer";
    language: Language;
  };

  const [language, setLanguage] = useState<Language>(initialLanguage);
  const {
    locationName,
    temperature,
    weatherCondition,
    isLoading: locationLoading,
  } = useUniversalLocation(language);

  // Auto-captured data
  const [year, setYear] = useState("");
  const [week, setWeek] = useState("");
  const [season, setSeason] = useState("");
  const [weather, setWeather] = useState("");
  const [autoDistrict, setAutoDistrict] = useState("");

  // User inputs
  const [district, setDistrict] = useState("");
  const [location, setLocation] = useState("");
  const [plantingDate, setPlantingDate] = useState("");
  const [landSize, setLandSize] = useState("");
  const [soilCondition, setSoilCondition] = useState("");
  const [irrigationType, setIrrigationType] = useState("");
  const [variety, setVariety] = useState("");
  const [rainfallCondition, setRainfallCondition] = useState("");

  // Dropdown states
  const [showDistrictPopup, setShowDistrictPopup] = useState(false);
  const [showVarietyPopup, setShowVarietyPopup] = useState(false);
  const [showSoilPopup, setShowSoilPopup] = useState(false);
  const [showIrrigationPopup, setShowIrrigationPopup] = useState(false);
  const [showRainfallPopup, setShowRainfallPopup] = useState(false);

  const content = {
    si: {
      title: "අස්වැන්න පුරෝකථනය",
      subtitle: "තොරතුරු පුරවන්න",
      autoData: "ස්වයංක්‍රීය දත්ත",
      userInputs: "ඔබේ තොරතුරු",
      year: "වර්ෂය",
      week: "සතිය",
      season: "වගා කන්නය",
      weather: "කාලගුණය",
      district: "දිස්ත්‍රික්කය",
      location: "ස්ථානය",
      plantingDate: "වගා කළ දිනය",
      landSize: "ඉඩම් ප්‍රමාණය (අක්කර)",
      soilCondition: "පස් තත්ත්වය",
      irrigationType: "වාරිමාර්ග වර්ගය",
      variety: "බීජ වර්ගය",
      rainfallCondition: "වර්ෂාපතන තත්ත්වය",
      submit: "පුරෝකථනය ලබා ගන්න",
      back: "ආපසු",
      select: "තෝරන්න",
      cancel: "අවලංගු",
      detecting: "හඳුනාගනිමින්...",
      good: "හොඳ",
      medium: "මධ්‍යම",
      poor: "දුර්වල",
      irrigated: "වාරිමාර්ග",
      rainfed: "වැසි ජලය",
      mixed: "මිශ්‍ර",
      high: "ඉහළ",
      normal: "සාමාන්‍ය",
      low: "අඩු",
      maha: "මහ කන්නය",
      yala: "යල කන්නය",
    },
    en: {
      title: "Yield Prediction",
      subtitle: "Enter Information",
      autoData: "Auto-Captured Data",
      userInputs: "Your Inputs",
      year: "Year",
      week: "Week",
      season: "Season",
      weather: "Weather",
      district: "District",
      location: "Location",
      plantingDate: "Planting Date",
      landSize: "Land Size (acres)",
      soilCondition: "Soil Condition",
      irrigationType: "Irrigation Type",
      variety: "Seed Variety",
      rainfallCondition: "Rainfall Condition",
      submit: "Get Prediction",
      back: "Back",
      select: "Select",
      cancel: "Cancel",
      detecting: "Detecting...",
      good: "Good",
      medium: "Medium",
      poor: "Poor",
      irrigated: "Irrigated",
      rainfed: "Rainfed",
      mixed: "Mixed",
      high: "High",
      normal: "Normal",
      low: "Low",
      maha: "Maha Season",
      yala: "Yala Season",
    },
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

  const getWeatherTranslation = (condition: string, lang: Language): string => {
    if (!condition) return lang === "si" ? "කාලගුණය" : "Weather";
    const c = condition.toLowerCase();
    if (c.includes("shower rain") || c.includes("light intensity shower"))
      return lang === "si" ? "සෙමෙන් වැසි" : "Light Shower Rain";
    if (c.includes("light rain"))
      return lang === "si" ? "සැහැල්ලු වැසි" : "Light Rain";
    if (c.includes("moderate rain"))
      return lang === "si" ? "මධ්‍යම වැසි" : "Moderate Rain";
    if (c.includes("heavy") && c.includes("rain"))
      return lang === "si" ? "බර වැසි" : "Heavy Rain";
    if (c.includes("clear"))
      return lang === "si" ? "පිරිසිදු අහස" : "Clear Sky";
    if (c.includes("few clouds"))
      return lang === "si" ? "සුළු වලාකුළු" : "Few Clouds";
    if (c.includes("scattered"))
      return lang === "si" ? "විසිරුණු වලාකුළු" : "Scattered Clouds";
    if (c.includes("broken"))
      return lang === "si" ? "කැබලි වලාකුළු" : "Broken Clouds";
    if (c.includes("overcast"))
      return lang === "si" ? "තද වලාකුළු" : "Overcast Clouds";
    if (c.includes("thunder"))
      return lang === "si" ? "අකුණු සහිත වැසි" : "Thunderstorm";
    if (c.includes("mist") || c.includes("fog") || c.includes("haze"))
      return lang === "si" ? "මීදුම" : "Mist";
    return lang === "si" ? "කාලගුණය" : condition;
  };

  useEffect(() => {
    captureSystemData();
  }, []);

  useEffect(() => {
    if (locationLoading) {
      setAutoDistrict(language === "si" ? "හඳුනාගනිමින්..." : "Detecting...");
    } else if (locationName && locationName !== "Loading...") {
      setAutoDistrict(locationName);
    } else {
      setAutoDistrict(
        language === "si" ? "ස්ථානය නොමැත" : "Location unavailable"
      );
    }

    if (locationLoading) {
      setWeather(language === "si" ? "පූරණය වෙමින්..." : "Loading...");
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
  }, [locationName, temperature, weatherCondition, locationLoading, language]);

  const captureSystemData = () => {
    const now = new Date();
    const currentYear = now.getFullYear().toString();
    setYear(currentYear);

    const weekNumber = getISOWeek(now).toString();
    setWeek(weekNumber);

    const currentSeason = determineSeason(now);
    setSeason(currentSeason);
  };

  const getISOWeek = (date: Date): number => {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const jan4 = new Date(target.getFullYear(), 0, 4);
    const dayDiff = (target.getTime() - jan4.getTime()) / 86400000;
    return 1 + Math.ceil(dayDiff / 7);
  };

  const determineSeason = (date: Date): string => {
    const month = date.getMonth() + 1;
    if (month >= 10 || month <= 3) {
      return language === "si" ? "මහ කන්නය" : "Maha Season";
    } else {
      return language === "si" ? "යල කන්නය" : "Yala Season";
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (
      !district ||
      !plantingDate ||
      !landSize ||
      !soilCondition ||
      !irrigationType ||
      !variety ||
      !rainfallCondition
    ) {
      Alert.alert(
        language === "si" ? "දෝෂයකි" : "Error",
        language === "si"
          ? "කරුණාකර සියලු අනිවාර්ය තොරතුරු පුරවන්න"
          : "Please fill all required fields"
      );
      return;
    }

    try {
      // Prepare data for API
      const payload = {
        farmer_id: "farmer_123", // TODO: Get from auth context
        district,
        location: location || district,
        gps_lat: null,
        gps_lng: null,
        season,
        planting_date: plantingDate,
        land_size_value: parseFloat(landSize),
        land_size_unit: "Acres",
        soil_condition: soilCondition,
        irrigation_type: irrigationType,
        variety,
        rainfall_condition: rainfallCondition,
      };

      // Call API
      const response = await fetch(`${API_URL}/api/v1/yield-prediction/farmer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        // Navigate to results screen
        navigation.navigate("YieldPredictionResultsScreen", {
          data: result,
          language,
        });
      } else {
        Alert.alert(
          language === "si" ? "දෝෂයකි" : "Error",
          result.detail || "Prediction failed"
        );
      }
    } catch (error) {
      console.error("Prediction error:", error);
      Alert.alert(
        language === "si" ? "දෝෂයකි" : "Error",
        language === "si"
          ? "පුරෝකථනය අසාර්ථක විය"
          : "Prediction failed. Please try again."
      );
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const translateValue = (value: string): string => {
    if (language === "en") return value;
    
    const translations: { [key: string]: string } = {
      Good: "හොඳ",
      Medium: "මධ්‍යම",
      Poor: "දුර්වල",
      Irrigated: "වාරිමාර්ග",
      Rainfed: "වැසි ජලය",
      Mixed: "මිශ්‍ර",
      High: "ඉහළ",
      Normal: "සාමාන්‍ය",
      Low: "අඩු",
    };
    
    return translations[value] || value;
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
          <Text style={styles.headerSubtitle}>{content[language].subtitle}</Text>
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
        <View style={styles.infoCard}>
          {getWeatherIcon(weatherCondition)}
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>
              {language === "si" ? "ස්ථානය" : "Location"}
            </Text>
            <Text style={styles.infoValue}>{autoDistrict}</Text>
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

          {/* District */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{content[language].district} *</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDistrictPopup(true)}
            >
              <Text
                style={{
                  color: district ? "#1F2937" : "#9CA3AF",
                  fontSize: 15,
                }}
              >
                {district || content[language].select}
              </Text>
            </TouchableOpacity>
          </View>

          {showDistrictPopup && (
            <View style={styles.popupContainer}>
              <View style={styles.popupBox}>
                <ScrollView>
                  {DISTRICTS.map((d) => (
                    <TouchableOpacity
                      key={d}
                      style={styles.popupItem}
                      onPress={() => {
                        setDistrict(d);
                        setShowDistrictPopup(false);
                      }}
                    >
                      <Text style={styles.popupText}>{d}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  style={styles.popupCancel}
                  onPress={() => setShowDistrictPopup(false)}
                >
                  <Text style={styles.popupCancelText}>
                    {content[language].cancel}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Location (Optional) */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{content[language].location}</Text>
            <TextInput
              style={styles.input}
              placeholder={language === "si" ? "උදා: මෙදවච්චිය" : "e.g., Medawachchiya"}
              value={location}
              onChangeText={setLocation}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Planting Date */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{content[language].plantingDate} *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={plantingDate}
              onChangeText={setPlantingDate}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Land Size */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{content[language].landSize} *</Text>
            <TextInput
              style={styles.input}
              placeholder="2.5"
              value={landSize}
              onChangeText={setLandSize}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Soil Condition */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{content[language].soilCondition} *</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowSoilPopup(true)}
            >
              <Text
                style={{
                  color: soilCondition ? "#1F2937" : "#9CA3AF",
                  fontSize: 15,
                }}
              >
                {soilCondition ? translateValue(soilCondition) : content[language].select}
              </Text>
            </TouchableOpacity>
          </View>

          {showSoilPopup && (
            <View style={styles.popupContainer}>
              <View style={styles.popupBox}>
                <ScrollView>
                  {SOIL_CONDITIONS.map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={styles.popupItem}
                      onPress={() => {
                        setSoilCondition(s);
                        setShowSoilPopup(false);
                      }}
                    >
                      <Text style={styles.popupText}>{translateValue(s)}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  style={styles.popupCancel}
                  onPress={() => setShowSoilPopup(false)}
                >
                  <Text style={styles.popupCancelText}>
                    {content[language].cancel}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Irrigation Type */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{content[language].irrigationType} *</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowIrrigationPopup(true)}
            >
              <Text
                style={{
                  color: irrigationType ? "#1F2937" : "#9CA3AF",
                  fontSize: 15,
                }}
              >
                {irrigationType ? translateValue(irrigationType) : content[language].select}
              </Text>
            </TouchableOpacity>
          </View>

          {showIrrigationPopup && (
            <View style={styles.popupContainer}>
              <View style={styles.popupBox}>
                <ScrollView>
                  {IRRIGATION_TYPES.map((i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.popupItem}
                      onPress={() => {
                        setIrrigationType(i);
                        setShowIrrigationPopup(false);
                      }}
                    >
                      <Text style={styles.popupText}>{translateValue(i)}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  style={styles.popupCancel}
                  onPress={() => setShowIrrigationPopup(false)}
                >
                  <Text style={styles.popupCancelText}>
                    {content[language].cancel}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Variety */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{content[language].variety} *</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowVarietyPopup(true)}
            >
              <Text
                style={{
                  color: variety ? "#1F2937" : "#9CA3AF",
                  fontSize: 15,
                }}
              >
                {variety || content[language].select}
              </Text>
            </TouchableOpacity>
          </View>

          {showVarietyPopup && (
            <View style={styles.popupContainer}>
              <View style={styles.popupBox}>
                <ScrollView>
                  {VARIETIES.map((v) => (
                    <TouchableOpacity
                      key={v}
                      style={styles.popupItem}
                      onPress={() => {
                        setVariety(v);
                        setShowVarietyPopup(false);
                      }}
                    >
                      <Text style={styles.popupText}>{v}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  style={styles.popupCancel}
                  onPress={() => setShowVarietyPopup(false)}
                >
                  <Text style={styles.popupCancelText}>
                    {content[language].cancel}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Rainfall Condition */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              {content[language].rainfallCondition} *
            </Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowRainfallPopup(true)}
            >
              <Text
                style={{
                  color: rainfallCondition ? "#1F2937" : "#9CA3AF",
                  fontSize: 15,
                }}
              >
                {rainfallCondition ? translateValue(rainfallCondition) : content[language].select}
              </Text>
            </TouchableOpacity>
          </View>

          {showRainfallPopup && (
            <View style={styles.popupContainer}>
              <View style={styles.popupBox}>
                <ScrollView>
                  {RAINFALL_CONDITIONS.map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={styles.popupItem}
                      onPress={() => {
                        setRainfallCondition(r);
                        setShowRainfallPopup(false);
                      }}
                    >
                      <Text style={styles.popupText}>{translateValue(r)}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  style={styles.popupCancel}
                  onPress={() => setShowRainfallPopup(false)}
                >
                  <Text style={styles.popupCancelText}>
                    {content[language].cancel}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
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
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 12,
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#065F46",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  langButton: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  langText: {
    color: "#047857",
    fontSize: 14,
    fontWeight: "600",
  },
  subHeader: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
    color: "#1F2937",
  },
  divider: {
    width: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 12,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#065F46",
  },
  autoDataGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  autoDataCard: {
    flex: 1,
    minWidth: "30%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  autoDataLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
    textAlign: "center",
  },
  autoDataValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#065F46",
    textAlign: "center",
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  popupContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  popupBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: "80%",
    maxHeight: "60%",
  },
  popupItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  popupText: {
    fontSize: 16,
    color: "#1F2937",
  },
  popupCancel: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    alignItems: "center",
  },
  popupCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  submitButton: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

export default YieldPredictionFormScreen;
