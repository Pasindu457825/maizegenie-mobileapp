import React, { useState } from "react";
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
  Leaf,
  Droplets,
  CloudSun,
  Activity,
  Package,
} from "lucide-react-native";

type Language = "si" | "en";
type NavProp = StackNavigationProp<
  YieldPredictionStackParamList,
  "YieldPredictionOfficerFormScreen"
>;

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
const RAINFALL_CONDITIONS = ["Adequate", "Deficit", "Excess"];

const YieldPredictionOfficerFormScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute();
  const { language: initialLanguage } = route.params as { language: Language };

  const [language, setLanguage] = useState<Language>(initialLanguage);

  // Soil Profile
  const [district, setDistrict] = useState("");
  const [soilPh, setSoilPh] = useState("");
  const [soilNitrogen, setSoilNitrogen] = useState("");
  const [soilPhosphorus, setSoilPhosphorus] = useState("");
  const [soilPotassium, setSoilPotassium] = useState("");
  const [organicMatter, setOrganicMatter] = useState("");

  // Climate Data
  const [seasonalRainfall, setSeasonalRainfall] = useState("");
  const [avgTemperature, setAvgTemperature] = useState("");

  // Crop Information
  const [variety, setVariety] = useState("");
  const [plantingDate, setPlantingDate] = useState("");

  // Dropdowns
  const [showDistrictPopup, setShowDistrictPopup] = useState(false);
  const [showVarietyPopup, setShowVarietyPopup] = useState(false);
  const [showRainfallPopup, setShowRainfallPopup] = useState(false);

  const content = {
    si: {
      title: "අස්වැන්න පුරෝකථනය",
      subtitle: "කෘෂිකර්ම නිලධාරී",
      soilProfile: "පස් පැතිකඩ",
      climateData: "කාලගුණ දත්ත",
      cropInfo: "බෝග තොරතුරු",
      district: "දිස්ත්‍රික්කය",
      soilPh: "පස් pH",
      nitrogen: "නයිට්‍රජන් (ppm)",
      phosphorus: "පොස්පරස් (ppm)",
      potassium: "පොටෑසියම් (ppm)",
      organicMatter: "කාබනික ද්‍රව්‍ය (%)",
      seasonalRainfall: "වාර වර්ෂාපතනය",
      avgTemperature: "සාමාන්‍ය උෂ්ණත්වය (°C)",
      variety: "බීජ වර්ගය",
      plantingDate: "වගා කළ දිනය",
      submit: "පුරෝකථනය ලබා ගන්න",
      back: "ආපසු",
      select: "තෝරන්න",
      cancel: "අවලංගු",
      adequate: "ප්‍රමාණවත්",
      deficit: "හිඟය",
      excess: "අතිරික්තය",
    },
    en: {
      title: "Yield Prediction",
      subtitle: "Agricultural Officer",
      soilProfile: "Soil Profile",
      climateData: "Climate Data",
      cropInfo: "Crop Information",
      district: "District",
      soilPh: "Soil pH",
      nitrogen: "Nitrogen (ppm)",
      phosphorus: "Phosphorus (ppm)",
      potassium: "Potassium (ppm)",
      organicMatter: "Organic Matter (%)",
      seasonalRainfall: "Seasonal Rainfall",
      avgTemperature: "Average Temperature (°C)",
      variety: "Seed Variety",
      plantingDate: "Planting Date",
      submit: "Get Prediction",
      back: "Back",
      select: "Select",
      cancel: "Cancel",
      adequate: "Adequate",
      deficit: "Deficit",
      excess: "Excess",
    },
  };

  const handleSubmit = async () => {
    // Validation
    if (
      !district ||
      !soilPh ||
      !soilNitrogen ||
      !soilPhosphorus ||
      !soilPotassium ||
      !organicMatter ||
      !seasonalRainfall ||
      !avgTemperature ||
      !variety ||
      !plantingDate
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
      const payload = {
        officer_id: "officer_123", // TODO: Get from auth context
        soil_profile: {
          district,
          soil_ph: parseFloat(soilPh),
          soil_nitrogen: parseFloat(soilNitrogen),
          soil_phosphorus: parseFloat(soilPhosphorus),
          soil_potassium: parseFloat(soilPotassium),
          organic_matter: parseFloat(organicMatter),
        },
        climate_data: {
          seasonal_rainfall: seasonalRainfall,
          avg_temperature: parseFloat(avgTemperature),
        },
        variety,
        planting_date: plantingDate,
      };

      const response = await fetch(`${API_URL}/api/v1/yield-prediction/officer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        navigation.navigate("YieldPredictionOfficerResultsScreen", {
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
      Adequate: "ප්‍රමාණවත්",
      Deficit: "හිඟය",
      Excess: "අතිරික්තය",
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
        {/* Soil Profile Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Droplets color="#10B981" size={20} />
            </View>
            <Text style={styles.sectionTitle}>
              {content[language].soilProfile}
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

          {/* Soil pH */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{content[language].soilPh} *</Text>
            <TextInput
              style={styles.input}
              placeholder="6.5"
              value={soilPh}
              onChangeText={setSoilPh}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Nitrogen */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{content[language].nitrogen} *</Text>
            <TextInput
              style={styles.input}
              placeholder="60"
              value={soilNitrogen}
              onChangeText={setSoilNitrogen}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Phosphorus */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{content[language].phosphorus} *</Text>
            <TextInput
              style={styles.input}
              placeholder="30"
              value={soilPhosphorus}
              onChangeText={setSoilPhosphorus}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Potassium */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{content[language].potassium} *</Text>
            <TextInput
              style={styles.input}
              placeholder="180"
              value={soilPotassium}
              onChangeText={setSoilPotassium}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Organic Matter */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{content[language].organicMatter} *</Text>
            <TextInput
              style={styles.input}
              placeholder="3.5"
              value={organicMatter}
              onChangeText={setOrganicMatter}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Climate Data Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <CloudSun color="#10B981" size={20} />
            </View>
            <Text style={styles.sectionTitle}>
              {content[language].climateData}
            </Text>
          </View>

          {/* Seasonal Rainfall */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{content[language].seasonalRainfall} *</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowRainfallPopup(true)}
            >
              <Text
                style={{
                  color: seasonalRainfall ? "#1F2937" : "#9CA3AF",
                  fontSize: 15,
                }}
              >
                {seasonalRainfall ? translateValue(seasonalRainfall) : content[language].select}
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
                        setSeasonalRainfall(r);
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

          {/* Average Temperature */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{content[language].avgTemperature} *</Text>
            <TextInput
              style={styles.input}
              placeholder="28"
              value={avgTemperature}
              onChangeText={setAvgTemperature}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Crop Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Leaf color="#10B981" size={20} />
            </View>
            <Text style={styles.sectionTitle}>
              {content[language].cropInfo}
            </Text>
          </View>

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

export default YieldPredictionOfficerFormScreen;
