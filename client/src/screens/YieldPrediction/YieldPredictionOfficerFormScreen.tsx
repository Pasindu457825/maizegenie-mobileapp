import React, { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
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
  Calendar,
  MapPin,
} from "lucide-react-native";

type Language = "si" | "en";
type NavProp = StackNavigationProp<
  YieldPredictionStackParamList,
  "YieldPredictionOfficerFormScreen"
>;

const getApiUrl = () => {
  if (Platform.OS === "android") {
    return process.env.EXPO_PUBLIC_API_BASE;
  }
  return "http://localhost:8000";
};

const API_URL = getApiUrl();

const DISTRICTS = [
  "Anuradhapura",
  "Polonnaruwa",
  "Kurunegala",
  "Ampara",
  "Monaragala",
  "Hambantota",
  "Badulla",
];

const LOCATIONS: { [key: string]: string[] } = {
  Anuradhapura: ["Eppawala", "Tambuttegama", "Nochchiyagama", "Kahatagasdigiliya"],
  Polonnaruwa: ["Hingurakgoda", "Medirigiriya", "Dimbulagala"],
  Kurunegala: ["Nikaweratiya", "Galgamuwa", "Maho"],
  Ampara: ["Maha Oya", "Padiyathalawa", "Dehiattakandiya"],
  Monaragala: ["Siyambalanduwa", "Wellawaya", "Buttala"],
  Hambantota: ["Weerawila", "Tissamaharama", "Ambalantota"],
  Badulla: ["Mahiyanganaya", "Rideemaliyadda", "Passara"],
};

const VARIETIES = [
  "Jet 999",
  "Pacific 808",
  "GT 709",
  "GT200",
  "Commando",
  "Local Variety",
];

const SEASONS = ["Maha", "Yala"];

const SOIL_TYPES = [
  "Reddish Brown Earth",
  "Red-Yellow Podzolic",
  "Alluvial Soil",
  "Sandy-Loam",
  "Sandy-Clay-Loam",
  "Loamy-Clay",
];

const SOIL_CONDITIONS = ["Good", "Medium", "Poor"];
const IRRIGATION_TYPES = ["Irrigated", "Mixed", "Rainfed"];
const RAINFALL_CONDITIONS = ["High", "Normal", "Low"];
const NPK_STATUS = ["High", "Medium", "Low"];

const YieldPredictionOfficerFormScreenNew = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute();
  const { role } = route.params as {
    role: "farmer" | "officer";
  };

  const { language: lang } = useLanguage();
  const language: Language = lang === "sinhala" ? "si" : "en";

  // Location & Basic Info
  const [district, setDistrict] = useState("");
  const [location, setLocation] = useState("");
  const [season, setSeason] = useState("");
  const [fieldSizeHa, setFieldSizeHa] = useState("");

  // Crop Information
  const [seedVariety, setSeedVariety] = useState("");
  const [plantingDate, setPlantingDate] = useState("");
  const [plantingMonth, setPlantingMonth] = useState("");
  const [firstFertDate, setFirstFertDate] = useState("");
  const [secondFertDate, setSecondFertDate] = useState("");

  // Soil Profile
  const [soilType, setSoilType] = useState("");
  const [soilCondition, setSoilCondition] = useState("");
  const [soilPh, setSoilPh] = useState("");
  const [soilNitrogen, setSoilNitrogen] = useState("");
  const [soilPhosphorus, setSoilPhosphorus] = useState("");
  const [soilPotassium, setSoilPotassium] = useState("");
  const [soilFertilityIndex, setSoilFertilityIndex] = useState("");
  const [nStatusClass, setNStatusClass] = useState("");
  const [pStatusClass, setPStatusClass] = useState("");
  const [kStatusClass, setKStatusClass] = useState("");

  // Climate & Weather Data
  const [irrigationType, setIrrigationType] = useState("");
  const [rainfallCondition, setRainfallCondition] = useState("");
  const [rainfall30d, setRainfall30d] = useState("");
  const [seasonalRainfall, setSeasonalRainfall] = useState("");
  const [avgTemperature, setAvgTemperature] = useState("");
  const [maxTemperature, setMaxTemperature] = useState("");
  const [avgHumidity, setAvgHumidity] = useState("");
  const [sunshineHours, setSunshineHours] = useState("");

  // Dropdowns
  const [showDistrictPopup, setShowDistrictPopup] = useState(false);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [showSeasonPopup, setShowSeasonPopup] = useState(false);
  const [showVarietyPopup, setShowVarietyPopup] = useState(false);
  const [showSoilTypePopup, setShowSoilTypePopup] = useState(false);
  const [showSoilConditionPopup, setShowSoilConditionPopup] = useState(false);
  const [showIrrigationPopup, setShowIrrigationPopup] = useState(false);
  const [showRainfallPopup, setShowRainfallPopup] = useState(false);
  const [showNStatusPopup, setShowNStatusPopup] = useState(false);
  const [showPStatusPopup, setShowPStatusPopup] = useState(false);
  const [showKStatusPopup, setShowKStatusPopup] = useState(false);

  const content = {
    si: {
      title: "අස්වැන්න පුරෝකථනය",
      subtitle: "කෘෂිකර්ම නිලධාරී - ML මාදිලිය",
      locationInfo: "ස්ථාන තොරතුරු",
      soilProfile: "පස් පැතිකඩ",
      climateData: "කාලගුණ දත්ත",
      cropInfo: "බෝග තොරතුරු",
      fertilizerDates: "පොහොර දිනයන්",
      district: "දිස්ත්‍රික්කය",
      location: "ස්ථානය",
      season: "වාරය",
      fieldSize: "ඉඩම් ප්‍රමාණය (හෙක්ටයාර්)",
      seedVariety: "බීජ වර්ගය",
      plantingDate: "වගා කළ දිනය",
      plantingMonth: "වගා මාසය",
      firstFertDate: "පළමු පොහොර දිනය",
      secondFertDate: "දෙවන පොහොර දිනය",
      soilType: "පස් වර්ගය",
      soilCondition: "පස් තත්ත්වය",
      soilPh: "පස් pH",
      nitrogen: "නයිට්‍රජන් (ppm)",
      phosphorus: "පොස්පරස් (ppm)",
      potassium: "පොටෑසියම් (ppm)",
      fertilityIndex: "සාරවත් දර්ශකය (0-1)",
      nStatus: "N තත්ත්වය",
      pStatus: "P තත්ත්වය",
      kStatus: "K තත්ත්වය",
      irrigationType: "ජල සම්පාදන වර්ගය",
      rainfallCondition: "වර්ෂාපතන තත්ත්වය",
      rainfall30d: "වර්ෂාපතනය 30d (mm)",
      seasonalRainfall: "වාර වර්ෂාපතනය (mm)",
      avgTemp: "සාමාන්‍ය උෂ්ණත්වය (°C)",
      maxTemp: "උපරිම උෂ්ණත්වය (°C)",
      humidity: "ආර්ද්‍රතාවය (%)",
      sunshine: "හිරු එළිය (පැය)",
      submit: "පුරෝකථනය ලබා ගන්න",
      back: "ආපසු",
      select: "තෝරන්න",
      cancel: "අවලංගු",
    },
    en: {
      title: "Yield Prediction",
      subtitle: "Agricultural Officer - ML Model",
      locationInfo: "Location Information",
      soilProfile: "Soil Profile",
      climateData: "Climate Data",
      cropInfo: "Crop Information",
      fertilizerDates: "Fertilizer Dates",
      district: "District",
      location: "Location",
      season: "Season",
      fieldSize: "Field Size (hectares)",
      seedVariety: "Seed Variety",
      plantingDate: "Planting Date",
      plantingMonth: "Planting Month",
      firstFertDate: "First Fertilizer Date",
      secondFertDate: "Second Fertilizer Date",
      soilType: "Soil Type",
      soilCondition: "Soil Condition",
      soilPh: "Soil pH",
      nitrogen: "Nitrogen (ppm)",
      phosphorus: "Phosphorus (ppm)",
      potassium: "Potassium (ppm)",
      fertilityIndex: "Fertility Index (0-1)",
      nStatus: "N Status",
      pStatus: "P Status",
      kStatus: "K Status",
      irrigationType: "Irrigation Type",
      rainfallCondition: "Rainfall Condition",
      rainfall30d: "Rainfall 30d (mm)",
      seasonalRainfall: "Seasonal Rainfall (mm)",
      avgTemp: "Average Temperature (°C)",
      maxTemp: "Maximum Temperature (°C)",
      humidity: "Humidity (%)",
      sunshine: "Sunshine Hours",
      submit: "Get Prediction",
      back: "Back",
      select: "Select",
      cancel: "Cancel",
    },
  };

  // Auto-calculate planting month from date
  React.useEffect(() => {
    if (plantingDate && plantingDate.length === 10) {
      const month = parseInt(plantingDate.split("-")[1]);
      if (month >= 1 && month <= 12) {
        setPlantingMonth(month.toString());
      }
    }
  }, [plantingDate]);

  const getLocationOptions = () => {
    if (!district || !LOCATIONS[district]) return [];
    return LOCATIONS[district];
  };

  const handleSubmit = async () => {
    // Validation
    if (
      !district ||
      !location ||
      !season ||
      !fieldSizeHa ||
      !seedVariety ||
      !plantingDate ||
      !firstFertDate ||
      !soilType ||
      !soilCondition ||
      !soilPh ||
      !soilNitrogen ||
      !soilPhosphorus ||
      !soilPotassium ||
      !soilFertilityIndex ||
      !nStatusClass ||
      !pStatusClass ||
      !kStatusClass ||
      !irrigationType ||
      !rainfallCondition ||
      !rainfall30d ||
      !seasonalRainfall ||
      !avgTemperature ||
      !maxTemperature ||
      !avgHumidity ||
      !sunshineHours
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
        officer_id: "officer_123",
        soil_profile: {
          district,
          location,
          soil_type: soilType,
          soil_condition: soilCondition,
          soil_ph: parseFloat(soilPh),
          soil_nitrogen_n: parseFloat(soilNitrogen),
          soil_phosphorus_p: parseFloat(soilPhosphorus),
          soil_potassium_k: parseFloat(soilPotassium),
          soil_fertility_index: parseFloat(soilFertilityIndex),
          n_status_class: nStatusClass,
          p_status_class: pStatusClass,
          k_status_class: kStatusClass,
        },
        climate_data: {
          irrigation_type: irrigationType,
          rainfall_condition: rainfallCondition,
          rainfall_30d_mm: parseFloat(rainfall30d),
          seasonal_rainfall_mm: parseFloat(seasonalRainfall),
          avg_temperature_c: parseFloat(avgTemperature),
          max_temperature_c: parseFloat(maxTemperature),
          avg_humidity_pct: parseFloat(avgHumidity),
          sunshine_hours: parseFloat(sunshineHours),
        },
        crop_information: {
          seed_variety: seedVariety,
          planting_date: plantingDate,
          planting_month: parseInt(plantingMonth),
          season,
          field_size_ha: parseFloat(fieldSizeHa),
        },
        fertilizer_dates: {
          first_fert_date: firstFertDate,
          second_fert_date: secondFertDate || null,
        },
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

  const renderDropdown = (
    label: string,
    value: string,
    options: string[],
    onSelect: (val: string) => void,
    showPopup: boolean,
    setShowPopup: (show: boolean) => void
  ) => (
    <>
      <View style={styles.formGroup}>
        <Text style={styles.label}>{label} *</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowPopup(true)}
        >
          <Text
            style={{
              color: value ? "#1F2937" : "#9CA3AF",
              fontSize: 15,
            }}
          >
            {value || content[language].select}
          </Text>
        </TouchableOpacity>
      </View>

      {showPopup && (
        <View style={styles.popupContainer}>
          <View style={styles.popupBox}>
            <ScrollView>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.popupItem}
                  onPress={() => {
                    onSelect(opt);
                    setShowPopup(false);
                  }}
                >
                  <Text style={styles.popupText}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.popupCancel}
              onPress={() => setShowPopup(false)}
            >
              <Text style={styles.popupCancelText}>
                {content[language].cancel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color="#047857" size={24} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{content[language].title}</Text>
          <Text style={styles.headerSubtitle}>{content[language].subtitle}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Location Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <MapPin color="#10B981" size={20} />
            </View>
            <Text style={styles.sectionTitle}>
              {content[language].locationInfo}
            </Text>
          </View>

          {renderDropdown(
            content[language].district,
            district,
            DISTRICTS,
            setDistrict,
            showDistrictPopup,
            setShowDistrictPopup
          )}

          {renderDropdown(
            content[language].location,
            location,
            getLocationOptions(),
            setLocation,
            showLocationPopup,
            setShowLocationPopup
          )}

          {renderDropdown(
            content[language].season,
            season,
            SEASONS,
            setSeason,
            showSeasonPopup,
            setShowSeasonPopup
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>{content[language].fieldSize} *</Text>
            <TextInput
              style={styles.input}
              placeholder="2.5"
              value={fieldSizeHa}
              onChangeText={setFieldSizeHa}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Crop Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Leaf color="#10B981" size={20} />
            </View>
            <Text style={styles.sectionTitle}>
              {content[language].cropInfo}
            </Text>
          </View>

          {renderDropdown(
            content[language].seedVariety,
            seedVariety,
            VARIETIES,
            setSeedVariety,
            showVarietyPopup,
            setShowVarietyPopup
          )}

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

          <View style={styles.formGroup}>
            <Text style={styles.label}>{content[language].plantingMonth}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: "#F3F4F6" }]}
              value={plantingMonth}
              editable={false}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Fertilizer Dates */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Calendar color="#10B981" size={20} />
            </View>
            <Text style={styles.sectionTitle}>
              {content[language].fertilizerDates}
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{content[language].firstFertDate} *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={firstFertDate}
              onChangeText={setFirstFertDate}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{content[language].secondFertDate}</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD (Optional)"
              value={secondFertDate}
              onChangeText={setSecondFertDate}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Soil Profile */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Droplets color="#10B981" size={20} />
            </View>
            <Text style={styles.sectionTitle}>
              {content[language].soilProfile}
            </Text>
          </View>

          {renderDropdown(
            content[language].soilType,
            soilType,
            SOIL_TYPES,
            setSoilType,
            showSoilTypePopup,
            setShowSoilTypePopup
          )}

          {renderDropdown(
            content[language].soilCondition,
            soilCondition,
            SOIL_CONDITIONS,
            setSoilCondition,
            showSoilConditionPopup,
            setShowSoilConditionPopup
          )}

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

          <View style={styles.formGroup}>
            <Text style={styles.label}>{content[language].fertilityIndex} *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.75"
              value={soilFertilityIndex}
              onChangeText={setSoilFertilityIndex}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {renderDropdown(
            content[language].nStatus,
            nStatusClass,
            NPK_STATUS,
            setNStatusClass,
            showNStatusPopup,
            setShowNStatusPopup
          )}

          {renderDropdown(
            content[language].pStatus,
            pStatusClass,
            NPK_STATUS,
            setPStatusClass,
            showPStatusPopup,
            setShowPStatusPopup
          )}

          {renderDropdown(
            content[language].kStatus,
            kStatusClass,
            NPK_STATUS,
            setKStatusClass,
            showKStatusPopup,
            setShowKStatusPopup
          )}
        </View>

        {/* Climate Data */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <CloudSun color="#10B981" size={20} />
            </View>
            <Text style={styles.sectionTitle}>
              {content[language].climateData}
            </Text>
          </View>

          {renderDropdown(
            content[language].irrigationType,
            irrigationType,
            IRRIGATION_TYPES,
            setIrrigationType,
            showIrrigationPopup,
            setShowIrrigationPopup
          )}

          {renderDropdown(
            content[language].rainfallCondition,
            rainfallCondition,
            RAINFALL_CONDITIONS,
            setRainfallCondition,
            showRainfallPopup,
            setShowRainfallPopup
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>{content[language].rainfall30d} *</Text>
            <TextInput
              style={styles.input}
              placeholder="150"
              value={rainfall30d}
              onChangeText={setRainfall30d}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{content[language].seasonalRainfall} *</Text>
            <TextInput
              style={styles.input}
              placeholder="1200"
              value={seasonalRainfall}
              onChangeText={setSeasonalRainfall}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{content[language].avgTemp} *</Text>
            <TextInput
              style={styles.input}
              placeholder="28"
              value={avgTemperature}
              onChangeText={setAvgTemperature}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{content[language].maxTemp} *</Text>
            <TextInput
              style={styles.input}
              placeholder="34"
              value={maxTemperature}
              onChangeText={setMaxTemperature}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{content[language].humidity} *</Text>
            <TextInput
              style={styles.input}
              placeholder="75"
              value={avgHumidity}
              onChangeText={setAvgHumidity}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{content[language].sunshine} *</Text>
            <TextInput
              style={styles.input}
              placeholder="8.5"
              value={sunshineHours}
              onChangeText={setSunshineHours}
              keyboardType="numeric"
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
    backgroundColor: "#E8F5E9",
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
    color: "#1F2937",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#374151",
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
    color: "#1F2937",
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#000000",
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

export default YieldPredictionOfficerFormScreenNew;
