import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  ArrowLeft,
  Sprout,
  Droplets,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Cloud,
  CheckCircle,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useApp } from "../../../context/AppContext";
import { useLanguage } from "../../../context/LanguageContext";

const API_URL = process.env.EXPO_PUBLIC_API_BASE;

type Language = "si" | "en" | "ta";

const content = {
  si: {
    title: "නිලධාරී උපදේශක",
    subtitle: "ව්‍යුහගත විශ්ලේෂණය",
    growthStage: "වර්ධන අවධිය",
    soilType: "පස වර්ගය",
    fieldSize: "ඉඩමේ ප්‍රමාණය (අක්කර)",
    symptoms: "රෝග ලක්ෂණ (විකල්ප)",
    weatherCondition: "කාලගුණ තත්ත්වය",
    location: "ස්ථානය (විකල්ප)",
    analyze: "විශ්ලේෂණය කරන්න",
    analyzing: "විශ්ලේෂණය වෙමින්...",
    selectGrowthStage: "වර්ධන අවධිය තෝරන්න",
    selectSoilType: "පස වර්ගය තෝරන්න",
    selectWeather: "කාලගුණය තෝරන්න",
    enterFieldSize: "අක්කර ගණන ඇතුළත් කරන්න",
    enterLocation: "ස්ථානය ඇතුළත් කරන්න",
    selectSymptoms: "රෝග ලක්ෂණ තෝරන්න",
    formDescription: "ව්‍යුහගත දත්ත භාවිතයෙන් විස්තරාත්මක පොහොර නිර්දේශ ලබා ගන්න",
    errorTitle: "දෝෂයක්",
    errorMessage: "කරුණාකර සියලුම අවශ්‍ය ක්ෂේත්‍ර පුරවන්න",
  },
  en: {
    title: "Officer Advisory",
    subtitle: "Structured Analysis",
    growthStage: "Growth Stage",
    soilType: "Soil Type",
    fieldSize: "Field Size (Acres)",
    symptoms: "Symptoms (Optional)",
    weatherCondition: "Weather Condition",
    location: "Location (Optional)",
    analyze: "Analyze",
    analyzing: "Analyzing...",
    selectGrowthStage: "Select growth stage",
    selectSoilType: "Select soil type",
    selectWeather: "Select weather condition",
    enterFieldSize: "Enter field size in acres",
    enterLocation: "Enter location",
    selectSymptoms: "Select observed symptoms",
    formDescription: "Get detailed fertilizer recommendations using structured data",
    errorTitle: "Error",
    errorMessage: "Please fill all required fields",
  },
  ta: {
    title: "அதிகாரி ஆலோசனை",
    subtitle: "கட்டமைக்கப்பட்ட பகுப்பாய்வு",
    growthStage: "வளர்ச்சி நிலை",
    soilType: "மண் வகை",
    fieldSize: "வயல் அளவு (எக்கர்)",
    symptoms: "அறிகுறிகள் (விருப்பம்)",
    weatherCondition: "காலநிலை",
    location: "இடம் (விருப்பம்)",
    analyze: "பகுப்பாய்வு செய்க",
    analyzing: "பகுப்பாய்வு செய்யப்படுகிறது...",
    selectGrowthStage: "வளர்ச்சி நிலையைத் தேர்ந்தெடுக்கவும்",
    selectSoilType: "மண் வகையைத் தேர்ந்தெடுக்கவும்",
    selectWeather: "காலநிலையைத் தேர்ந்தெடுக்கவும்",
    enterFieldSize: "வயல் அளவை எக்கரில் உள்ளிடவும்",
    enterLocation: "இடத்தை உள்ளிடவும்",
    selectSymptoms: "கண்டறியப்பட்ட அறிகுறிகளைத் தேர்ந்தெடுக்கவும்",
    formDescription: "கட்டமைக்கப்பட்ட தரவுகளைப் பயன்படுத்தி விரிவான உர பரிந்துரைகளைப் பெறுங்கள்",
    errorTitle: "பிழை",
    errorMessage: "தயவு செய்து அனைத்து தேவையான புலங்களை நிரப்பவும்",
  },
};

const growthStages = [
  { id: "land_prep", labelEn: "Land Preparation", labelSi: "ඉඩම් සකස් කිරීම", labelTa: "நிலம் தயாரிப்பு" },
  { id: "planting", labelEn: "Planting", labelSi: "බීජ රෝපණය", labelTa: "நடுகை" },
  { id: "early_growth", labelEn: "Early Growth (0-20 days)", labelSi: "මුල් වර්ධනය (දින 0-20)", labelTa: "ஆரம்ப வளர்ச்சி (0-20 நாட்கள்)" },
  { id: "vegetative", labelEn: "Vegetative (20-60 days)", labelSi: "ශාක වර්ධනය (දින 20-60)", labelTa: "தாவர வளர்ச்சி (20-60 நாட்கள்)" },
  { id: "reproductive", labelEn: "Reproductive (60-90 days)", labelSi: "මල් හා කොබ් (දින 60-90)", labelTa: "இனப்பெருக்கம் (60-90 நாட்கள்)" },
  { id: "maturity", labelEn: "Maturity/Harvest", labelSi: "අස්වනු අවධිය", labelTa: "முதிர்ச்சி/அறுவடை" },
];

const soilTypes = [
  { id: "sandy", labelEn: "Sandy Soil", labelSi: "වැලි පස", labelTa: "மணல் மண்" },
  { id: "clay", labelEn: "Clay Soil", labelSi: "මැටි පස", labelTa: "களிமண் மண்" },
  { id: "loamy", labelEn: "Loamy Soil (Optimal)", labelSi: "ලෝම් පස (හොඳම)", labelTa: "களிமண் கலவை மண் (சிறந்தது)" },
  { id: "acidic", labelEn: "Acidic Soil", labelSi: "ආම්ලික පස", labelTa: "அமில மண்" },
];

const weatherConditions: { id: string; labelEn: string; labelSi: string; labelTa: string }[] = [
  { id: "normal", labelEn: "Normal", labelSi: "සාමාන්‍ය", labelTa: "சாதாரணமான" },
  { id: "heavy_rain", labelEn: "Heavy Rain", labelSi: "අධික වර්ෂාව", labelTa: "அதிக மழை" },
  { id: "drought", labelEn: "Drought", labelSi: "නියඟය", labelTa: "வறட்சி" },
  { id: "flooding", labelEn: "Flooding", labelSi: "ගංවතුර", labelTa: "வெள்ளப்பெருக்கி" },
];

const symptomOptions = [
  { id: "yellow_leaves", labelEn: "Yellow Leaves", labelSi: "කහ කොළ", labelTa: "மஞ்சள் இலைகள்" },
  { id: "weak_plants", labelEn: "Weak Plants", labelSi: "දුර්වල පැල", labelTa: "பலவீனமான செடிகள்" },
  { id: "stunted_growth", labelEn: "Stunted Growth", labelSi: "වර්ධනය අඩු වීම", labelTa: "வளர்ச்சி குறைவு" },
  { id: "nitrogen_deficiency", labelEn: "Nitrogen Deficiency", labelSi: "නයිට්‍රජන් ඌනතාවය", labelTa: "நைட்ரஜன் குறைபாடு" },
  { id: "phosphorus_deficiency", labelEn: "Phosphorus Deficiency", labelSi: "පොස්පරස් ඌනතාවය", labelTa: "பாஸ்பரம் குறைபாடு" },
  { id: "potassium_deficiency", labelEn: "Potassium Deficiency", labelSi: "පොටෑසියම් ඌනතාවය", labelTa: "பொட்டாசியம் குறைபாடு" },
];

export default function OfficerAdvisoryInputScreen() {
  const navigation = useNavigation<any>();
  const { user } = useApp();
  const { language: lang } = useLanguage();
  const language: Language = lang === "sinhala" ? "si" : lang === "tamil" ? "ta" : "en";
  const [loading, setLoading] = useState(false);

  const [growthStage, setGrowthStage] = useState("");
  const [soilType, setSoilType] = useState("");
  const [fieldSize, setFieldSize] = useState("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [weatherCondition, setWeatherCondition] = useState("normal");
  const [location, setLocation] = useState("");

  const t = content[language];

  // Check if user is an officer
  React.useEffect(() => {
    if (!user || user.role !== "officer") {
      Alert.alert(
        language === "si" ? "ප්‍රවේශය වසා ඇත" : "Access Denied",
        language === "si"
          ? "මෙම විශේෂාංගය නිලධාරීන් සඳහා පමණි."
          : "This feature is only available for officers.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    }
  }, [user, language, navigation]);

  if (!user || user.role !== "officer") {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={["#10b981", "#059669"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <ArrowLeft color="#ffffff" size={24} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>
                {language === "si" ? "ප්‍රවේශය වසා ඇත" : "Access Denied"}
              </Text>
            </View>
          </View>
        </LinearGradient>
        <View style={styles.accessDeniedContainer}>
          <AlertTriangle color="#ef4444" size={64} />
          <Text style={styles.accessDeniedTitle}>
            {language === "si" ? "ප්‍රවේශය වසා ඇත" : "Access Denied"}
          </Text>
          <Text style={styles.accessDeniedText}>
            {language === "si"
              ? "මෙම විශේෂාංගය නිලධාරීන් සඳහා පමණි."
              : "This feature is only available for officers."}
          </Text>
        </View>
      </View>
    );
  }

  const toggleSymptom = (symptomId: string) => {
    if (symptoms.includes(symptomId)) {
      setSymptoms(symptoms.filter((s) => s !== symptomId));
    } else {
      setSymptoms([...symptoms, symptomId]);
    }
  };

  const handleAnalyze = async () => {
    if (!growthStage || !soilType || !fieldSize) {
      Alert.alert(t.errorTitle, t.errorMessage);
      return;
    }

    const fieldSizeNum = parseFloat(fieldSize);
    if (isNaN(fieldSizeNum) || fieldSizeNum <= 0) {
      Alert.alert(t.errorTitle, "Please enter a valid field size");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/v1/rule-based-advisory/officer/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          growth_stage: growthStage,
          soil_type: soilType,
          field_size: fieldSizeNum,
          symptoms,
          weather_condition: weatherCondition,
          location: location || null,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        navigation.navigate("OfficerAdvisoryResultsScreen", { data, language });
      } else {
        Alert.alert(t.errorTitle, data.detail || "Analysis failed");
      }
    } catch (error) {
      Alert.alert(t.errorTitle, "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#10b981", "#059669"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft color="#ffffff" size={24} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t.title}</Text>
            <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <View style={styles.descriptionCard}>
          <TrendingUp color="#10b981" size={20} />
          <Text style={styles.descriptionText}>{t.formDescription}</Text>
        </View>

        {/* Growth Stage */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            <Sprout color="#059669" size={16} /> {t.growthStage} *
          </Text>
          <View style={styles.optionsGrid}>
            {growthStages.map((stage) => (
              <TouchableOpacity
                key={stage.id}
                style={[styles.optionButton, growthStage === stage.id && styles.optionButtonActive]}
                onPress={() => setGrowthStage(stage.id)}
              >
                <Text
                  style={[styles.optionText, growthStage === stage.id && styles.optionTextActive]}
                >
                  {language === "si" ? stage.labelSi : language === "ta" ? stage.labelTa : stage.labelEn}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Soil Type */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            <Droplets color="#059669" size={16} /> {t.soilType} *
          </Text>
          <View style={styles.optionsGrid}>
            {soilTypes.map((soil) => (
              <TouchableOpacity
                key={soil.id}
                style={[styles.optionButton, soilType === soil.id && styles.optionButtonActive]}
                onPress={() => setSoilType(soil.id)}
              >
                <Text style={[styles.optionText, soilType === soil.id && styles.optionTextActive]}>
                  {language === "si" ? soil.labelSi : language === "ta" ? soil.labelTa : soil.labelEn}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Field Size */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            <MapPin color="#059669" size={16} /> {t.fieldSize} *
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder={t.enterFieldSize}
            placeholderTextColor="#9CA3AF"
            value={fieldSize}
            onChangeText={setFieldSize}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Weather Condition */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            <Cloud color="#059669" size={16} /> {t.weatherCondition} *
          </Text>
          <View style={styles.optionsGrid}>
            {weatherConditions.map((weather) => (
              <TouchableOpacity
                key={weather.id}
                style={[
                  styles.optionButton,
                  weatherCondition === weather.id && styles.optionButtonActive,
                ]}
                onPress={() => setWeatherCondition(weather.id)}
              >
                <Text
                  style={[
                    styles.optionText,
                    weatherCondition === weather.id && styles.optionTextActive,
                  ]}
                >
                  {language === "si" ? weather.labelSi : language === "ta" ? weather.labelTa : weather.labelEn}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Symptoms */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            <AlertTriangle color="#059669" size={16} /> {t.symptoms}
          </Text>
          <View style={styles.symptomsGrid}>
            {symptomOptions.map((symptom) => (
              <TouchableOpacity
                key={symptom.id}
                style={[
                  styles.symptomChip,
                  symptoms.includes(symptom.id) && styles.symptomChipActive,
                ]}
                onPress={() => toggleSymptom(symptom.id)}
              >
                {symptoms.includes(symptom.id) && <CheckCircle color="#10b981" size={14} />}
                <Text
                  style={[
                    styles.symptomText,
                    symptoms.includes(symptom.id) && styles.symptomTextActive,
                  ]}
                >
                  {language === "si" ? symptom.labelSi : language === "ta" ? symptom.labelTa : symptom.labelEn}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Location */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            <MapPin color="#059669" size={16} /> {t.location}
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder={t.enterLocation}
            placeholderTextColor="#9CA3AF"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        <TouchableOpacity
          style={[styles.analyzeButton, loading && styles.analyzeButtonDisabled]}
          onPress={handleAnalyze}
          disabled={loading}
        >
          <Text style={styles.analyzeButtonText}>{loading ? t.analyzing : t.analyze}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
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
    color: "#ffffff",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#D1FAE5",
  },
  langButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  langText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  descriptionCard: {
    backgroundColor: "#ECFDF5",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  descriptionText: {
    fontSize: 14,
    color: "#065F46",
    marginLeft: 12,
    flex: 1,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    minWidth: "48%",
    flexGrow: 1,
  },
  optionButtonActive: {
    backgroundColor: "#ECFDF5",
    borderColor: "#10b981",
  },
  optionText: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
  },
  optionTextActive: {
    color: "#059669",
    fontWeight: "600",
  },
  textInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: "#1F2937",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  symptomsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  symptomChip: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  symptomChipActive: {
    backgroundColor: "#ECFDF5",
    borderColor: "#10b981",
  },
  symptomText: {
    fontSize: 13,
    color: "#6B7280",
  },
  symptomTextActive: {
    color: "#059669",
    fontWeight: "600",
  },
  analyzeButton: {
    backgroundColor: "#10b981",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginTop: 10,
  },
  analyzeButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  analyzeButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  accessDeniedTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 20,
    marginBottom: 12,
  },
  accessDeniedText: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },
});
