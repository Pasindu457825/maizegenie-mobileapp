import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    TextInput,
    Alert,
    Image,
    Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { YieldPredictionStackParamList } from "../../navigation/YieldPredictionStack";
import { ArrowLeft, MapPin, CloudSun, Plus, Minus, Sparkles, Upload, FileText, Loader } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import CustomDropdown from "../../components/CustomDropdown";
import CustomDatePicker from "../../components/CustomDatePicker";
import HybridDateInput from "../../components/HybridDateInput";
import { predictYieldFarmer, FarmerPredictionRequest } from "../../services/yieldPredictionApi";
import { useApp } from "../../context/AppContext";
import { useLanguage } from "../../context/LanguageContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Archive } from "lucide-react-native";
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { SEASONAL_CLIMATE, getSeasonalClimate } from "../../constants/seasonalClimate";
import { DISTRICTS as DISTRICT_LIST, LOCATIONS_BY_DISTRICT, LOCATION_COORDINATES as LOCATION_DATA, SOIL_TYPE_MAPPING, DISTRICTS_SINHALA, LOCATIONS_SINHALA } from "../../constants/locations";
import { autoFillWeatherData } from "../../utils/seasonalClimateHelper";

const getApiUrl = () => {
    if (Platform.OS === "android") {
        return process.env.EXPO_PUBLIC_API_BASE;
    }
    return "http://localhost:8000";
};
import useUniversalLocation from "../../utils/useUniversalLocation";
import {
    Sun,
    Cloud,
    CloudRain,
    CloudDrizzle,
    CloudSnow,
    CloudLightning,
    CloudFog,
} from "lucide-react-native";

type Language = "si" | "en";
type NavProp = StackNavigationProp<
    YieldPredictionStackParamList,
    "YieldPredictionFormScreen"
>;

// Districts will be generated dynamically based on language

const SEED_VARIETIES = [
    { name: "Commando", image: require("../../../assets/varieties/commando.png") },
    { name: "GT200", image: require("../../../assets/varieties/gt200.png") },
    { name: "GT 709", image: require("../../../assets/varieties/gt709.png") },
    { name: "Jet 999", image: require("../../../assets/varieties/jet999.png") },
    { name: "Pacific 808", image: require("../../../assets/varieties/pacific808.png") },
    { name: "Local Variety", image: require("../../../assets/varieties/Unknown.png") }
];


// Use location data from constants (convert format for compatibility)
const LOCATION_COORDINATES: {
    [key: string]: {
        [key: string]: {
            lat: number;
            lng: number;
            soilTypes: string[];
        }
    }
} = Object.keys(LOCATION_DATA).reduce((acc, district) => {
    acc[district] = {};
    Object.keys(LOCATION_DATA[district]).forEach(location => {
        const data = LOCATION_DATA[district][location];
        acc[district][location] = {
            lat: data.latitude,
            lng: data.longitude,
            soilTypes: data.soilTypes
        };
    });
    return acc;
}, {} as any);

const SOIL_CONDITIONS_SI = [
    { label: "හොඳ", value: "Good" },
    { label: "මධ්‍යම", value: "Medium" },
    { label: "දුර්වල", value: "Poor" },
];

const SOIL_CONDITIONS_EN = [
    { label: "Good", value: "Good" },
    { label: "Medium", value: "Medium" },
    { label: "Poor", value: "Poor" },
];

const IRRIGATION_TYPES_SI = [
    { label: "වාරිමාර්ග", value: "Irrigated" },
    { label: "වැසි ජලය", value: "Rainfed" },
    { label: "මිශ්‍ර", value: "Mixed" },
];

const IRRIGATION_TYPES_EN = [
    { label: "Irrigated", value: "Irrigated" },
    { label: "Rainfed", value: "Rainfed" },
    { label: "Mixed", value: "Mixed" },
];

const RAINFALL_CONDITIONS_SI = [
    { label: "ඉහළ", value: "High" },
    { label: "සාමාන්‍ය", value: "Normal" },
    { label: "අඩු", value: "Low" },
];

const RAINFALL_CONDITIONS_EN = [
    { label: "High", value: "High" },
    { label: "Normal", value: "Normal" },
    { label: "Low", value: "Low" },
];

const YieldPredictionFormScreen = () => {
    const navigation = useNavigation<NavProp>();
    const route = useRoute();
    const { role } = route.params as {
        role: "farmer" | "officer";
    };

    const { language: lang } = useLanguage();
    const language: Language = lang === "sinhala" ? "si" : "en";

    // Use universal location hook for GPS and weather
    const {
        locationName: autoLocationName,
        temperature: autoTemp,
        humidity: autoHumidity,
        weatherCondition: autoWeatherCondition,
        weatherIcon: autoWeatherIcon,
        isLoading: locationLoading,
    } = useUniversalLocation(language);
    const [district, setDistrict] = useState("");
    const [location, setLocation] = useState("");
    const [plantingDate, setPlantingDate] = useState<Date | null>(null);
    const [season, setSeason] = useState("");
    const [landSize, setLandSize] = useState("");
    const [soilType, setSoilType] = useState("");
    const [soilCondition, setSoilCondition] = useState("");
    const [irrigationType, setIrrigationType] = useState("");
    const [variety, setVariety] = useState("");
    const [rainfallCondition, setRainfallCondition] = useState("");
    const [weatherData, setWeatherData] = useState<{ temp: string; condition: string }>({ temp: "N/A", condition: "Weather unavailable" });
    const [locationName, setLocationName] = useState("Location");

    // Weather data fields
    const [rainfall30d, setRainfall30d] = useState("");

    // Seasonal average fields from Database
    const [seasonalTemperature, setSeasonalTemperature] = useState("");
    const [seasonalHumidity, setSeasonalHumidity] = useState("");
    const [rainfallSeasonal, setRainfallSeasonal] = useState("");

    // Soil test data fields (mandatory)
    const [soilPh, setSoilPh] = useState("");
    const [soilNitrogen, setSoilNitrogen] = useState("");
    const [soilPhosphorus, setSoilPhosphorus] = useState("");
    const [soilPotassium, setSoilPotassium] = useState("");
    const [soilFertilityIndex, setSoilFertilityIndex] = useState("");

    // NPK Status Classifications (mandatory - same as officer)
    const [nStatusClass, setNStatusClass] = useState("");
    const [pStatusClass, setPStatusClass] = useState("");
    const [kStatusClass, setKStatusClass] = useState("");

    // Additional Weather Data (mandatory - same as officer)
    const [maxTemperature, setMaxTemperature] = useState("");
    const [sunshineHours, setSunshineHours] = useState("");

    // Fertilizer Dates (mandatory - same as officer)
    const [firstFertDate, setFirstFertDate] = useState<Date | null>(null);
    const [secondFertDate, setSecondFertDate] = useState<Date | null>(null);

    const [isLiveData, setIsLiveData] = useState(false);
    const [gpsCoords, setGpsCoords] = useState<{ latitude: number, longitude: number } | null>(null);
    const [weatherDataSource, setWeatherDataSource] = useState<"auto" | "manual">("auto");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [landSizeUnit, setLandSizeUnit] = useState<"Acres" | "Hectares">("Acres");

    // PDF Upload states
    const [isAnalyzingPDF, setIsAnalyzingPDF] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    const [soilDataExtracted, setSoilDataExtracted] = useState(false);

    // Get user from auth context
    const { user } = useApp();

    // Save form data to AsyncStorage
    const saveFormData = async () => {
        try {
            const formData = {
                timestamp: new Date().toISOString(),
                district,
                location,
                plantingDate: plantingDate?.toISOString() || null,
                season,
                landSize,
                landSizeUnit,
                soilType,
                soilCondition,
                irrigationType,
                variety,
                rainfallCondition,
                rainfall30d,
                seasonalTemperature,
                seasonalHumidity,
                rainfallSeasonal,
                soilPh,
                soilNitrogen,
                soilPhosphorus,
                soilPotassium,
                soilFertilityIndex,
                nStatusClass,
                pStatusClass,
                kStatusClass,
                maxTemperature,
                sunshineHours,
                firstFertDate: firstFertDate?.toISOString() || null,
                secondFertDate: secondFertDate?.toISOString() || null,
            };

            console.log("💾 Saving form data to AsyncStorage...");

            const existing = await AsyncStorage.getItem("savedFarmerForms");
            const forms = existing ? JSON.parse(existing) : [];

            forms.unshift(formData); // Latest first

            // Keep only last 10 saved forms
            if (forms.length > 10) {
                forms.splice(10);
            }

            await AsyncStorage.setItem("savedFarmerForms", JSON.stringify(forms));

            console.log("✅ Form data saved successfully. Total saved forms:", forms.length);

            Alert.alert(
                language === "si" ? "සුරකින ලදී" : "Saved",
                language === "si"
                    ? "✅ ආකෘති දත්ත සාර්ථකව සුරකින ලදී!"
                    : "✅ Form data saved successfully!"
            );
        } catch (error) {
            console.error("❌ Error saving form data:", error);
            Alert.alert(
                language === "si" ? "දෝෂයකි" : "Error",
                language === "si"
                    ? "❌ දත්ත සුරකින්න නොහැකි විය."
                    : `❌ Failed to save form data: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    };

    // Load latest saved form data
    const loadSavedFormData = async () => {
        try {
            console.log("📂 Loading saved form data from AsyncStorage...");

            const existing = await AsyncStorage.getItem("savedFarmerForms");

            if (!existing) {
                console.log("ℹ️ No saved forms found in AsyncStorage");
                Alert.alert(
                    language === "si" ? "දත්ත නැත" : "No Data",
                    language === "si"
                        ? "සුරකින ලද ආකෘති දත්ත නොමැත."
                        : "No saved form data found."
                );
                return;
            }

            const forms = JSON.parse(existing);
            console.log("📋 Found saved forms:", forms.length);

            if (!forms.length) {
                Alert.alert(
                    language === "si" ? "දත්ත නැත" : "No Data",
                    language === "si"
                        ? "සුරකින ලද ආකෘති දත්ත නොමැත."
                        : "No saved form data found."
                );
                return;
            }

            const latestForm = forms[0]; // Latest saved
            console.log("🔄 Restoring latest form from:", latestForm.timestamp);

            // Restore all form fields
            setDistrict(latestForm.district || "");
            setLocation(latestForm.location || "");
            setPlantingDate(latestForm.plantingDate ? new Date(latestForm.plantingDate) : null);
            setSeason(latestForm.season || "");
            setLandSize(latestForm.landSize || "");
            setLandSizeUnit(latestForm.landSizeUnit || "Acres");
            setSoilType(latestForm.soilType || "");
            setSoilCondition(latestForm.soilCondition || "");
            setIrrigationType(latestForm.irrigationType || "");
            setVariety(latestForm.variety || "");
            setRainfallCondition(latestForm.rainfallCondition || "");
            setRainfall30d(latestForm.rainfall30d || "");
            setSeasonalTemperature(latestForm.seasonalTemperature || "");
            setSeasonalHumidity(latestForm.seasonalHumidity || "");
            setRainfallSeasonal(latestForm.rainfallSeasonal || "");
            setSoilPh(latestForm.soilPh || "");
            setSoilNitrogen(latestForm.soilNitrogen || "");
            setSoilPhosphorus(latestForm.soilPhosphorus || "");
            setSoilPotassium(latestForm.soilPotassium || "");
            setSoilFertilityIndex(latestForm.soilFertilityIndex || "");
            setNStatusClass(latestForm.nStatusClass || "");
            setPStatusClass(latestForm.pStatusClass || "");
            setKStatusClass(latestForm.kStatusClass || "");
            setMaxTemperature(latestForm.maxTemperature || "");
            setSunshineHours(latestForm.sunshineHours || "");
            setFirstFertDate(latestForm.firstFertDate ? new Date(latestForm.firstFertDate) : null);
            setSecondFertDate(latestForm.secondFertDate ? new Date(latestForm.secondFertDate) : null);

            console.log("✅ Form data restored successfully");

            Alert.alert(
                language === "si" ? "පුරවන ලදී" : "Loaded",
                language === "si"
                    ? "✅ සුරකින ලද දත්ත නැවත පුරවන ලදී!"
                    : "✅ Saved data has been restored!"
            );
        } catch (error) {
            console.error("❌ Error loading form data:", error);
            Alert.alert(
                language === "si" ? "දෝෂයකි" : "Error",
                language === "si"
                    ? "❌ දත්ත නැවත ලබාගත නොහැකි විය."
                    : `❌ Failed to restore saved data: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    };

    // Auto-fill NPK status based on ppm values (from dataset analysis)
    const autoFillNPKStatus = (n: number, p: number, k: number) => {
        // Nitrogen: Low < 55, Medium 55-90, High > 90
        if (n < 55) setNStatusClass("Low");
        else if (n <= 90) setNStatusClass("Medium");
        else setNStatusClass("High");

        // Phosphorus: Low < 11, Medium 11-19, High > 19
        if (p < 11) setPStatusClass("Low");
        else if (p <= 19) setPStatusClass("Medium");
        else setPStatusClass("High");

        // Potassium: Low < 120, Medium 120-200, High > 200
        if (k < 120) setKStatusClass("Low");
        else if (k <= 200) setKStatusClass("Medium");
        else setKStatusClass("High");
    };

    // Auto-fill fertilizer dates based on planting date
    const autoFillFertilizerDates = (plantingDate: Date) => {
        // First fertilizer: 24 days after planting (median from dataset)
        const firstDate = new Date(plantingDate);
        firstDate.setDate(firstDate.getDate() + 24);
        setFirstFertDate(firstDate);

        // Second fertilizer: 50 days after planting (median from dataset)
        const secondDate = new Date(plantingDate);
        secondDate.setDate(secondDate.getDate() + 50);
        setSecondFertDate(secondDate);
    };

    // Helper function to handle weather field changes and mark as manual
    const handleWeatherFieldChange = (setter: (value: string) => void, value: string) => {
        setter(value);
        setWeatherDataSource("manual");
    };

    // Auto-fill weather data when district and season change
    useEffect(() => {
        if (district && season) {
            // Reset to auto when auto-filling
            setWeatherDataSource("auto");

            // Max Temperature: average ~31.7°C for both seasons
            if (!maxTemperature) {
                const avgMaxTemp = season === "Maha" ? "31.6" : "31.9";
                setMaxTemperature(avgMaxTemp);
            }

            // Sunshine Hours: average ~7.5 hours
            if (!sunshineHours) {
                const avgSunshine = season === "Maha" ? "7.5" : "7.5";
                setSunshineHours(avgSunshine);
            }
        }
    }, [district, season]);

    // Auto-fill fertilizer dates when planting date changes
    useEffect(() => {
        if (plantingDate && !firstFertDate && !secondFertDate) {
            autoFillFertilizerDates(plantingDate);
        }
    }, [plantingDate]);

    // Auto-fill NPK status when NPK values change
    useEffect(() => {
        const n = parseFloat(soilNitrogen);
        const p = parseFloat(soilPhosphorus);
        const k = parseFloat(soilPotassium);

        if (!isNaN(n) && !isNaN(p) && !isNaN(k) && n > 0 && p > 0 && k > 0) {
            autoFillNPKStatus(n, p, k);
        }
    }, [soilNitrogen, soilPhosphorus, soilPotassium]);

    // Weather icon helper function (same as price forecast)
    const getWeatherIcon = (condition: string | null) => {
        if (!condition) return <CloudSun color="#10B981" size={18} />;

        const c = condition.toLowerCase();

        if (c.includes("clear") || c.includes("sunny")) {
            return <Sun color="#10B981" size={18} />;
        } else if (c.includes("rain") || c.includes("drizzle")) {
            return <CloudRain color="#10B981" size={18} />;
        } else if (c.includes("cloud")) {
            return <Cloud color="#10B981" size={18} />;
        } else if (c.includes("snow")) {
            return <CloudSnow color="#10B981" size={18} />;
        } else if (c.includes("thunder") || c.includes("storm")) {
            return <CloudLightning color="#10B981" size={18} />;
        } else if (c.includes("fog") || c.includes("mist") || c.includes("haze")) {
            return <CloudFog color="#10B981" size={18} />;
        }

        return <CloudSun color="#10B981" size={18} />;
    };

    // Handle PDF/Image upload for soil test data extraction
    const handleUploadSoilReport = async () => {
        try {
            // Show options: PDF or Photo
            Alert.alert(
                language === "si" ? "පස් පරීක්ෂණ වාර්තාව උඩුගත කරන්න" : "Upload Soil Test Report",
                language === "si" ? "ඔබට අවශ්‍ය ආකාරය තෝරන්න:" : "Choose upload method:",
                [
                    {
                        text: language === "si" ? "PDF ලේඛනය" : "PDF Document",
                        onPress: () => pickDocument(),
                    },
                    {
                        text: language === "si" ? "ඡායාරූපය" : "Take Photo",
                        onPress: () => pickImage(),
                    },
                    {
                        text: language === "si" ? "අවලංගු කරන්න" : "Cancel",
                        style: "cancel",
                    },
                ]
            );
        } catch (error) {
            console.error("Upload error:", error);
        }
    };

    // Pick PDF document
    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "application/pdf",
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            const file = result.assets[0];
            setUploadedFileName(file.name);
            await extractSoilDataFromFile(file.uri, file.mimeType || "application/pdf");
        } catch (error) {
            console.error("Document picker error:", error);
            Alert.alert(
                language === "si" ? "දෝෂයකි" : "Error",
                language === "si" ? "ලේඛනය තෝරාගැනීමට අසමත් විය" : "Failed to pick document"
            );
        }
    };

    // Pick image from camera or gallery
    const pickImage = async () => {
        try {
            // Request camera permissions
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== "granted") {
                Alert.alert(
                    language === "si" ? "අවසර අවශ්‍යයි" : "Permission Required",
                    language === "si" ? "කැමරාව භාවිතා කිරීමට අවසර අවශ්‍යයි" : "Camera permission is required"
                );
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 1,
            });

            if (result.canceled) return;

            const file = result.assets[0];
            setUploadedFileName("Soil_Report_Photo.jpg");
            await extractSoilDataFromFile(file.uri, "image/jpeg");
        } catch (error) {
            console.error("Image picker error:", error);
            Alert.alert(
                language === "si" ? "දෝෂයකි" : "Error",
                language === "si" ? "ඡායාරූපය ගැනීමට අසමත් විය" : "Failed to capture image"
            );
        }
    };

    // Extract soil data from uploaded file
    const extractSoilDataFromFile = async (fileUri: string, mimeType: string) => {
        setIsAnalyzingPDF(true);
        setSoilDataExtracted(false);

        try {
            // Create FormData for file upload
            const formData = new FormData();
            formData.append("file", {
                uri: fileUri,
                type: mimeType,
                name: uploadedFileName || "soil_report",
            } as any);

            // Call backend API to extract soil data
            const response = await fetch(`${getApiUrl()}/api/v1/soil-data/extract`, {
                method: "POST",
                body: formData,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => null);
                const detail = errorBody?.detail || "Extraction failed";
                console.error("Server extraction error:", detail);
                throw new Error(detail);
            }

            const extractedData = await response.json();

            // Auto-fill soil data fields with extracted values
            if (extractedData.ph) setSoilPh(extractedData.ph.toString());
            if (extractedData.nitrogen) setSoilNitrogen(extractedData.nitrogen.toString());
            if (extractedData.phosphorus) setSoilPhosphorus(extractedData.phosphorus.toString());
            if (extractedData.potassium) setSoilPotassium(extractedData.potassium.toString());
            if (extractedData.fertility_index) setSoilFertilityIndex(extractedData.fertility_index.toString());

            // Auto-fill NPK status if values are available
            if (extractedData.nitrogen && extractedData.phosphorus && extractedData.potassium) {
                autoFillNPKStatus(
                    parseFloat(extractedData.nitrogen),
                    parseFloat(extractedData.phosphorus),
                    parseFloat(extractedData.potassium)
                );
            }

            setSoilDataExtracted(true);

            Alert.alert(
                language === "si" ? "සාර්ථකයි!" : "Success!",
                language === "si"
                    ? "පස් දත්ත ස්වයංක්‍රීයව පුරවා ඇත. කරුණාකර සත්‍යාපනය කරන්න."
                    : "Soil data has been auto-filled. Please verify the values."
            );
        } catch (error) {
            console.error("Extraction error:", error);
            Alert.alert(
                language === "si" ? "දෝෂයකි" : "Error",
                language === "si"
                    ? "පස් දත්ත උකහා ගැනීමට අසමත් විය. කරුණාකර අතින් ඇතුළත් කරන්න."
                    : "Failed to extract soil data. Please enter manually."
            );
        } finally {
            setIsAnalyzingPDF(false);
        }
    };

    // Format weather display text
    const getWeatherDisplayText = () => {
        if (locationLoading) {
            return language === "si" ? "කාලගුණය පූරණය වෙමින්..." : "Loading weather...";
        }

        if (autoTemp !== null && autoWeatherCondition) {
            return `${Math.round(autoTemp)}°C • ${autoWeatherCondition}`;
        }

        return language === "si" ? "කාලගුණ දත්ත නොමැත" : "Weather unavailable";
    };

    // Get district options with Sinhala translations
    const getDistrictOptions = () => {
        return DISTRICT_LIST.map(d => ({
            label: language === "si" ? (DISTRICTS_SINHALA[d] || d) : d,
            value: d,
        }));
    };

    // Get location options based on selected district
    const getLocationOptions = () => {
        if (!district || !LOCATION_COORDINATES[district]) return [];
        return Object.keys(LOCATION_COORDINATES[district]).map(loc => ({
            label: language === "si" ? (LOCATIONS_SINHALA[district]?.[loc] || loc) : loc,
            value: loc,
        }));
    };

    // Get soil type options based on selected location
    const getSoilTypeOptions = () => {
        if (!district || !location || !LOCATION_COORDINATES[district] || !LOCATION_COORDINATES[district][location]) {
            return [];
        }
        const soilTypes = LOCATION_COORDINATES[district][location].soilTypes;
        return soilTypes.map(soil => ({
            label: soil,
            value: soil,
        }));
    };

    // Auto-fill soil type when location changes
    useEffect(() => {
        if (location && district && LOCATION_COORDINATES[district] && LOCATION_COORDINATES[district][location]) {
            const soilTypes = LOCATION_COORDINATES[district][location].soilTypes;
            if (soilTypes.length > 0) {
                setSoilType(soilTypes[0]); // Auto-select first soil type
            }
        } else {
            setSoilType("");
        }
    }, [location, district]);

    // Auto-fill season when planting date changes
    useEffect(() => {
        if (plantingDate) {
            const month = plantingDate.getMonth() + 1;
            const detectedSeason = (month >= 10 || month <= 3)
                ? (language === "si" ? "මහ වාරය" : "Maha Season")
                : (language === "si" ? "යල වාරය" : "Yala Season");
            setSeason(detectedSeason);
            console.log(`📅 Auto-detected season from planting date: ${detectedSeason}`);
        }
    }, [plantingDate, language]);

    const content = {
        si: {
            title: "අස්වැන්න පුරෝකථනය",
            subtitle: "තොරතුරු ඇතුළත් කරන්න",
            yourInputs: "ඔබේ දත්ත",
            district: "දිස්ත්‍රික්කය",
            location: "ස්ථානය",
            plantingDate: "වගා කළ දිනය",
            season: "වාරය",
            landSize: "ඉඩම් ප්‍රමාණය",
            landSizeUnit: "ඒකකය",
            autoFill: "ස්වයංක්‍රීය පිරවීම",
            autoDetected: "ස්වයංක්‍රීය හඳුනාගත්",
            rainfall30d: "වර්ෂාපතනය 30d (mm)",
            seasonalTemperature: "වාර උෂ්ණත්වය (°C)",
            seasonalHumidity: "වාර ආර්ද්‍රතාවය (%)",
            rainfallSeasonal: "වාර වර්ෂාපතනය (mm)",
            soilType: "පස් වර්ගය",
            soilCondition: "පස් තත්ත්වය",
            irrigationType: "වාරිමාර්ග වර්ගය",
            seedVariety: "බීජ වර්ගය",
            rainfallCondition: "වර්ෂාපතන තත්ත්වය",
            submit: "පුරෝකථනය ලබා ගන්න",
            locationPlaceholder: "උදා., මැදවච්චිය",
            selectVariety: "බීජ වර්ගයක් තෝරන්න",
        },
        en: {
            title: "Yield Prediction",
            subtitle: "Enter Information",
            yourInputs: "Your Inputs",
            district: "District",
            location: "Location",
            plantingDate: "Planting Date",
            season: "Season",
            landSize: "Land Size",
            landSizeUnit: "Unit",
            autoFill: "Auto Fill",
            autoDetected: "Auto-Detected",
            rainfall30d: "Rainfall 30d (mm)",
            seasonalTemperature: "Seasonal Temperature (°C)",
            seasonalHumidity: "Seasonal Humidity (%)",
            rainfallSeasonal: "Seasonal Rainfall (mm)",
            soilType: "Soil Type",
            soilCondition: "Soil Condition",
            irrigationType: "Irrigation Type",
            seedVariety: "Seed Variety",
            rainfallCondition: "Rainfall Condition",
            submit: "Get Prediction",
            locationPlaceholder: "e.g., Medawachchiya",
            selectVariety: "Select a seed variety",
        },
    };

    // Cross-platform alert function
    const showAlert = (title: string, message: string) => {
        if (Platform.OS === 'web') {
            window.alert(`${title}\n\n${message}`);
        } else {
            Alert.alert(title, message);
        }
    };

    // Handle Auto Fill button
    const handleAutoFill = () => {
        console.log(`🔍 Auto Fill clicked - District: "${district}", Season: "${season}"`);

        // Check if district and season are selected
        if (!district) {
            showAlert(
                language === "si" ? "දෝෂයකි" : "Error",
                language === "si" ? "කරුණාකර දිස්ත්‍රික්කය තෝරන්න" : "Please select a district"
            );
            return;
        }

        if (!season) {
            showAlert(
                language === "si" ? "දෝෂයකි" : "Error",
                language === "si" ? "කරුණාකර වගා කළ දිනය තෝරන්න (වාරය ස්වයංක්‍රීයව හඳුනාගනු ඇත)" : "Please select planting date (season will be auto-detected)"
            );
            return;
        }

        // Extract season type from the season string
        const seasonType = season.toLowerCase().includes("maha") || season.toLowerCase().includes("මහ")
            ? "Maha"
            : "Yala";

        console.log(`🔄 Auto-filling seasonal data for "${district}" - "${seasonType}" season`);

        // Auto-fill seasonal data
        const success = autoFillWeatherData(district, seasonType, {
            setRainfall30d,
            setSeasonalTemperature,
            setSeasonalHumidity,
            setRainfallSeasonal
        });

        console.log(`✅ Auto-fill result: ${success ? 'SUCCESS' : 'FAILED'}`);

        if (success) {
            setIsLiveData(true);
            showAlert(
                language === "si" ? "සාර්ථකයි" : "Success",
                language === "si" ? "කාලගුණ දත්ත ස්වයංක්‍රීයව පුරවා ඇත" : "Weather data auto-filled successfully"
            );
        } else {
            showAlert(
                language === "si" ? "දෝෂයකි" : "Error",
                language === "si" ? "මෙම දිස්ත්‍රික්කය සඳහා කාලගුණ දත්ත නොමැත" : "No weather data available for this district"
            );
        }
    };

    // Increase land size
    const increaseLandSize = () => {
        const current = parseFloat(landSize) || 0;
        setLandSize((current + 0.1).toFixed(1));
    };

    // Decrease land size
    const decreaseLandSize = () => {
        const current = parseFloat(landSize) || 0;
        if (current > 0.1) {
            setLandSize((current - 0.1).toFixed(1));
        }
    };

    // Input sanitization helpers
    const sanitizeNumericInput = (value: string, allowDecimal: boolean = true): string => {
        if (!value) return "";
        // Remove any non-numeric characters except decimal point
        let sanitized = allowDecimal
            ? value.replace(/[^0-9.]/g, '')
            : value.replace(/[^0-9]/g, '');
        // Ensure only one decimal point
        const parts = sanitized.split('.');
        if (parts.length > 2) {
            sanitized = parts[0] + '.' + parts.slice(1).join('');
        }
        return sanitized;
    };

    const handleNumericChange = (setter: (value: string) => void, value: string, allowDecimal: boolean = true) => {
        const sanitized = sanitizeNumericInput(value, allowDecimal);
        setter(sanitized);
    };

    const handleSubmit = async () => {
        // Required field validation (including all new fields to match officer)
        if (!district || !plantingDate || !landSize || !soilCondition || !irrigationType || !variety || !rainfallCondition ||
            !soilPh || !soilNitrogen || !soilPhosphorus || !soilPotassium || !soilFertilityIndex ||
            !nStatusClass || !pStatusClass || !kStatusClass ||
            !maxTemperature || !sunshineHours || !firstFertDate) {
            showAlert(
                language === "si" ? "අවශ්‍ය දත්ත" : "Required Fields",
                language === "si"
                    ? "කරුණාකර සියලු අවශ්‍ය ක්ෂේත්‍ර පුරවන්න (NPK තත්ත්වය, උෂ්ණත්වය, පොහොර දිනයන් ඇතුළුව)"
                    : "Please fill all required fields (including NPK status, temperature, and fertilizer dates)"
            );
            return;
        }

        // Numeric field validations
        const landSizeNum = parseFloat(landSize);
        if (isNaN(landSizeNum) || landSizeNum <= 0 || landSizeNum > 1000) {
            showAlert(
                language === "si" ? "වලංගු නොවේ" : "Invalid Input",
                language === "si" ? "ඉඩම් ප්‍රමාණය 0.1 සහ 1000 අතර විය යුතුය" : "Land size must be between 0.1 and 1000 acres"
            );
            return;
        }


        // Rainfall validations (optional fields)
        if (rainfall30d && rainfall30d.trim() !== "") {
            const rainfall30dNum = parseFloat(rainfall30d);
            if (isNaN(rainfall30dNum) || rainfall30dNum < 0 || rainfall30dNum > 5000) {
                showAlert(
                    language === "si" ? "වලංගු නොවේ" : "Invalid Input",
                    language === "si" ? "වර්ෂාපතනය 30d 0mm සහ 5000mm අතර විය යුතුය" : "Rainfall 30d must be between 0mm and 5000mm"
                );
                return;
            }
        }

        if (rainfallSeasonal && rainfallSeasonal.trim() !== "") {
            const rainfallSeasonalNum = parseFloat(rainfallSeasonal);
            if (isNaN(rainfallSeasonalNum) || rainfallSeasonalNum < 0 || rainfallSeasonalNum > 10000) {
                showAlert(
                    language === "si" ? "වලංගු නොවේ" : "Invalid Input",
                    language === "si" ? "වාර වර්ෂාපතනය 0mm සහ 10000mm අතර විය යුතුය" : "Seasonal rainfall must be between 0mm and 10000mm"
                );
                return;
            }
        }

        // Seasonal temperature validation (optional field)
        if (seasonalTemperature && seasonalTemperature.trim() !== "") {
            const seasonalTempNum = parseFloat(seasonalTemperature);
            if (isNaN(seasonalTempNum) || seasonalTempNum < 0 || seasonalTempNum > 60) {
                showAlert(
                    language === "si" ? "වලංගු නොවේ" : "Invalid Input",
                    language === "si" ? "වාර උෂ්ණත්වය 0°C සහ 60°C අතර විය යුතුය" : "Seasonal temperature must be between 0°C and 60°C"
                );
                return;
            }
        }

        // Seasonal humidity validation (optional field)
        if (seasonalHumidity && seasonalHumidity.trim() !== "") {
            const seasonalHumidityNum = parseFloat(seasonalHumidity);
            if (isNaN(seasonalHumidityNum) || seasonalHumidityNum < 0 || seasonalHumidityNum > 100) {
                showAlert(
                    language === "si" ? "වලංගු නොවේ" : "Invalid Input",
                    language === "si" ? "වාර ආර්ද්‍රතාවය 0% සහ 100% අතර විය යුතුය" : "Seasonal humidity must be between 0% and 100%"
                );
                return;
            }
        }

        // Soil test data validation (mandatory fields)
        const phNum = parseFloat(soilPh);
        if (isNaN(phNum) || phNum < 0 || phNum > 14) {
            showAlert(
                language === "si" ? "වලංගු නොවේ" : "Invalid Input",
                language === "si" ? "පස් pH 0 සහ 14 අතර විය යුතුය" : "Soil pH must be between 0 and 14"
            );
            return;
        }

        const nNum = parseFloat(soilNitrogen);
        if (isNaN(nNum) || nNum < 0 || nNum > 500) {
            showAlert(
                language === "si" ? "වලංගු නොවේ" : "Invalid Input",
                language === "si" ? "නයිට්‍රජන් 0 සහ 500 ppm අතර විය යුතුය" : "Nitrogen must be between 0 and 500 ppm"
            );
            return;
        }

        const pNum = parseFloat(soilPhosphorus);
        if (isNaN(pNum) || pNum < 0 || pNum > 100) {
            showAlert(
                language === "si" ? "වලංගු නොවේ" : "Invalid Input",
                language === "si" ? "පොස්පරස් 0 සහ 100 ppm අතර විය යුතුය" : "Phosphorus must be between 0 and 100 ppm"
            );
            return;
        }

        const kNum = parseFloat(soilPotassium);
        if (isNaN(kNum) || kNum < 0 || kNum > 500) {
            showAlert(
                language === "si" ? "වලංගු නොවේ" : "Invalid Input",
                language === "si" ? "පොටෑසියම් 0 සහ 500 ppm අතර විය යුතුය" : "Potassium must be between 0 and 500 ppm"
            );
            return;
        }

        const fertIndexNum = parseFloat(soilFertilityIndex);
        if (isNaN(fertIndexNum) || fertIndexNum < 0 || fertIndexNum > 1) {
            showAlert(
                language === "si" ? "වලංගු නොවේ" : "Invalid Input",
                language === "si" ? "පස් සාරවත් දර්ශකය 0 සහ 1 අතර විය යුතුය" : "Soil fertility index must be between 0 and 1"
            );
            return;
        }

        // Max Temperature validation
        const maxTempNum = parseFloat(maxTemperature);
        if (isNaN(maxTempNum) || maxTempNum < 0 || maxTempNum > 50) {
            showAlert(
                language === "si" ? "වලංගු නොවේ" : "Invalid Input",
                language === "si" ? "උපරිම උෂ්ණත්වය 0 සහ 50°C අතර විය යුතුය" : "Maximum temperature must be between 0 and 50°C"
            );
            return;
        }

        // Sunshine Hours validation
        const sunshineNum = parseFloat(sunshineHours);
        if (isNaN(sunshineNum) || sunshineNum < 0 || sunshineNum > 24) {
            showAlert(
                language === "si" ? "වලංගු නොවේ" : "Invalid Input",
                language === "si" ? "හිරු එළිය 0 සහ 24 පැය අතර විය යුතුය" : "Sunshine hours must be between 0 and 24"
            );
            return;
        }

        // Call backend API for real prediction
        setIsSubmitting(true);

        try {
            // Prepare API request with ALL fields matching officer structure
            const requestData: FarmerPredictionRequest = {
                farmer_id: user?.id || "guest_user",
                district: district,
                location: location || undefined,
                planting_date: plantingDate?.toISOString().split('T')[0] || "",
                season: season,
                land_size_value: parseFloat(landSize),
                land_size_unit: landSizeUnit,

                // Crop details (matching officer)
                variety: variety,
                planting_month: plantingDate ? plantingDate.getMonth() + 1 : 1,
                field_size_ha: landSizeUnit === "Hectares" ? parseFloat(landSize) : parseFloat(landSize) / 2.47105,

                // Fertilizer dates (matching officer)
                first_fert_date: firstFertDate?.toISOString().split('T')[0] || "",
                second_fert_date: secondFertDate?.toISOString().split('T')[0],

                // Soil information (convert full name to database abbreviation)
                soil_type: soilType ? (SOIL_TYPE_MAPPING[soilType] || soilType) : undefined,
                soil_condition: soilCondition,
                soil_ph: parseFloat(soilPh),
                soil_nitrogen_n: parseFloat(soilNitrogen),
                soil_phosphorus_p: parseFloat(soilPhosphorus),
                soil_potassium_k: parseFloat(soilPotassium),
                soil_fertility_index: parseFloat(soilFertilityIndex),

                // NPK Status (matching officer)
                n_status_class: nStatusClass,
                p_status_class: pStatusClass,
                k_status_class: kStatusClass,

                // Field conditions
                irrigation_type: irrigationType,
                rainfall_condition: rainfallCondition,

                // Weather data (complete - matching officer)
                rainfall_30d: rainfall30d ? parseFloat(rainfall30d) : 0,
                seasonal_rainfall: rainfallSeasonal ? parseFloat(rainfallSeasonal) : 0,
                avg_temperature: seasonalTemperature ? parseFloat(seasonalTemperature) : 0,
                max_temperature: parseFloat(maxTemperature),
                avg_humidity: seasonalHumidity ? parseFloat(seasonalHumidity) : 0,
                sunshine_hours: parseFloat(sunshineHours),

                // Weather data source tracking
                weather_data_source: weatherDataSource,
            };

            console.log("📤 Sending prediction request:", requestData);

            // Call API
            const response = await predictYieldFarmer(requestData);

            console.log("📥 Received prediction response:", response);

            // Navigate to results with real data and farmer input
            navigation.navigate("YieldPredictionResultsScreen", {
                data: response,
                language,
                farmerInput: {
                    district: district,
                    location: location || '',
                    variety: variety,
                    field_size_ha: landSizeUnit === "Hectares" ? parseFloat(landSize) : parseFloat(landSize) / 2.47105,
                    irrigation_type: irrigationType,
                    rainfall_condition: rainfallCondition,
                    planting_date: plantingDate?.toISOString().split('T')[0] || '',
                },
            });

        } catch (error: any) {
            console.error("❌ Prediction failed:", error);

            showAlert(
                language === "si" ? "දෝෂයකි" : "Error",
                language === "si"
                    ? "පුරෝකථනය අසාර්ථකයි. කරුණාකර නැවත උත්සාහ කරන්න"
                    : error.message || "Prediction failed. Please try again"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={["#10b981", "#059669"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color="#FFFFFF" size={24} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>{content[language].title}</Text>
                    <Text style={styles.headerSubtitle}>{content[language].subtitle}</Text>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={loadSavedFormData} style={styles.headerIconButton}>
                        <Archive color="#FFFFFF" size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={saveFormData} style={styles.headerIconButton}>
                        <Archive color="#FFFFFF" size={20} fill="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Location & Weather Detection Bar*/}
            <View style={styles.subHeader}>
                <View style={styles.infoCard}>
                    <MapPin color="#10B981" size={18} />
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoLabel}>
                            {language === "si" ? "ස්ථානය" : "Location"}
                        </Text>
                        <Text style={styles.infoValue}>
                            {locationLoading
                                ? (language === "si" ? "හඳුනාගනිමින්..." : "Detecting...")
                                : autoLocationName}
                        </Text>
                    </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoCard}>
                    {getWeatherIcon(autoWeatherCondition)}
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoLabel}>
                            {language === "si" ? "කාලගුණය" : "Weather"}
                        </Text>
                        <Text style={styles.infoValue}>{getWeatherDisplayText()}</Text>
                    </View>
                </View>
            </View>

            {/* Auto Fill Button */}
            <TouchableOpacity style={styles.autoFillButton} onPress={handleAutoFill}>
                <Sparkles color="#10B981" size={18} />
                <Text style={styles.autoFillText}>{content[language].autoFill}</Text>
            </TouchableOpacity>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Your Inputs Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{content[language].yourInputs}</Text>

                    {/* District Dropdown */}
                    <CustomDropdown
                        label={content[language].district}
                        value={district}
                        options={getDistrictOptions()}
                        onSelect={setDistrict}
                        placeholder="Select"
                        required
                    />

                    {/* Location Dropdown (filtered by District) */}
                    <CustomDropdown
                        label={content[language].location}
                        value={location}
                        options={getLocationOptions()}
                        onSelect={setLocation}
                        placeholder={district ? "Select" : "Select district first"}
                        required={false}
                    />

                    {/* Planting Date Picker */}
                    <CustomDatePicker
                        label={content[language].plantingDate}
                        value={plantingDate}
                        onSelect={setPlantingDate}
                        placeholder="YYYY-MM-DD"
                        required
                    />

                    {/* Season (Auto-filled) */}
                    {season && (
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{content[language].season}</Text>
                            <View style={styles.seasonDisplay}>
                                <Text style={styles.seasonText}>{season}</Text>
                            </View>
                        </View>
                    )}

                    {/* Land Size Input with +/- Buttons and Unit Selector */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>
                            {content[language].landSize} <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.landSizeContainer}>
                            <TextInput
                                style={styles.landSizeInput}
                                value={landSize}
                                onChangeText={(value) => handleNumericChange(setLandSize, value, true)}
                                placeholder="0.66"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="decimal-pad"
                                maxLength={6}
                            />
                            <View style={styles.landSizeButtons}>
                                <TouchableOpacity style={styles.landSizeButton} onPress={increaseLandSize}>
                                    <Plus color="#10B981" size={18} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.landSizeButton} onPress={decreaseLandSize}>
                                    <Minus color="#10B981" size={18} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        {/* Unit Selector */}
                        <View style={styles.unitSelector}>
                            <TouchableOpacity
                                style={[styles.unitButton, landSizeUnit === "Acres" && styles.unitButtonActive]}
                                onPress={() => setLandSizeUnit("Acres")}
                            >
                                <Text style={[styles.unitButtonText, landSizeUnit === "Acres" && styles.unitButtonTextActive]}>
                                    Acres
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.unitButton, landSizeUnit === "Hectares" && styles.unitButtonActive]}
                                onPress={() => setLandSizeUnit("Hectares")}
                            >
                                <Text style={[styles.unitButtonText, landSizeUnit === "Hectares" && styles.unitButtonTextActive]}>
                                    Hectares
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Soil Type Dropdown (based on Location) */}
                    <CustomDropdown
                        label={content[language].soilType}
                        value={soilType}
                        options={getSoilTypeOptions()}
                        onSelect={setSoilType}
                        placeholder={location ? "Select" : "Select location first"}
                        required
                    />

                    {/* Soil Condition Dropdown */}
                    <CustomDropdown
                        label={content[language].soilCondition}
                        value={soilCondition}
                        options={language === "si" ? SOIL_CONDITIONS_SI : SOIL_CONDITIONS_EN}
                        onSelect={setSoilCondition}
                        placeholder="Select"
                        required
                    />

                    {/* Soil Test Data Section (Mandatory) */}
                    <View style={styles.soilTestSection}>
                        <Text style={styles.sectionTitle}>
                            {language === "si" ? "පස් පරීක්ෂණ දත්ත (අනිවාර්ය)" : "Soil Test Data (Mandatory)"}
                        </Text>
                        <Text style={styles.helperText}>
                            {language === "si"
                                ? "නිවැරදි අස්වැන්න පුරෝකථනයක් සඳහා පස් පරීක්ෂණ දත්ත අවශ්‍ය වේ"
                                : "Soil test data is required for accurate yield predictions"}
                        </Text>

                        {/* Upload Soil Report Button */}
                        <TouchableOpacity
                            style={styles.uploadButton}
                            onPress={handleUploadSoilReport}
                            disabled={isAnalyzingPDF}
                        >
                            <View style={styles.uploadButtonContent}>
                                {isAnalyzingPDF ? (
                                    <>
                                        <Loader color="#FFFFFF" size={20} style={{ marginRight: 8 }} />
                                        <Text style={styles.uploadButtonText}>
                                            {language === "si" ? "විශ්ලේෂණය කරමින්..." : "Analyzing..."}
                                        </Text>
                                    </>
                                ) : soilDataExtracted ? (
                                    <>
                                        <FileText color="#FFFFFF" size={20} style={{ marginRight: 8 }} />
                                        <Text style={styles.uploadButtonText}>
                                            {language === "si" ? "✓ දත්ත උකහා ගන්නා ලදී" : "✓ Data Extracted"}
                                        </Text>
                                    </>
                                ) : (
                                    <>
                                        <Upload color="#FFFFFF" size={20} style={{ marginRight: 8 }} />
                                        <Text style={styles.uploadButtonText}>
                                            {language === "si" ? "පස් වාර්තාව උඩුගත කරන්න (PDF/ඡායාරූපය)" : "Upload Soil Report (PDF/Photo)"}
                                        </Text>
                                    </>
                                )}
                            </View>
                        </TouchableOpacity>

                        {uploadedFileName && (
                            <View style={styles.uploadedFileInfo}>
                                <FileText color="#10B981" size={16} />
                                <Text style={styles.uploadedFileName}>{uploadedFileName}</Text>
                            </View>
                        )}

                        {/* Soil pH */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>
                                {language === "si" ? "පස් pH" : "Soil pH"} <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={soilPh}
                                onChangeText={(value) => handleNumericChange(setSoilPh, value, true)}
                                placeholder={language === "si" ? "උදා: 6.439" : "e.g., 6.439"}
                                placeholderTextColor="#9CA3AF"
                                keyboardType="decimal-pad"
                                maxLength={5}
                            />
                        </View>

                        {/* Soil Nitrogen */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>
                                {language === "si" ? "නයිට්‍රජන් (N) - ppm" : "Nitrogen (N) - ppm"} <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={soilNitrogen}
                                onChangeText={(value) => handleNumericChange(setSoilNitrogen, value, true)}
                                placeholder={language === "si" ? "උදා: 89.898" : "e.g., 89.898"}
                                placeholderTextColor="#9CA3AF"
                                keyboardType="decimal-pad"
                                maxLength={7}
                            />
                        </View>

                        {/* Soil Phosphorus */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>
                                {language === "si" ? "පොස්පරස් (P) - ppm" : "Phosphorus (P) - ppm"} <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={soilPhosphorus}
                                onChangeText={(value) => handleNumericChange(setSoilPhosphorus, value, true)}
                                placeholder={language === "si" ? "උදා: 21.509" : "e.g., 21.509"}
                                placeholderTextColor="#9CA3AF"
                                keyboardType="decimal-pad"
                                maxLength={7}
                            />
                        </View>

                        {/* Soil Potassium */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>
                                {language === "si" ? "පොටෑසියම් (K) - ppm" : "Potassium (K) - ppm"} <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={soilPotassium}
                                onChangeText={(value) => handleNumericChange(setSoilPotassium, value, true)}
                                placeholder={language === "si" ? "උදා: 84.409" : "e.g., 84.409"}
                                placeholderTextColor="#9CA3AF"
                                keyboardType="decimal-pad"
                                maxLength={7}
                            />
                        </View>

                        {/* Soil Fertility Index */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>
                                {language === "si" ? "පස් සාරවත් දර්ශකය (0-1)" : "Soil Fertility Index (0-1)"} <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={soilFertilityIndex}
                                onChangeText={(value) => handleNumericChange(setSoilFertilityIndex, value, true)}
                                placeholder={language === "si" ? "උදා: 0.538" : "e.g., 0.538"}
                                placeholderTextColor="#9CA3AF"
                                keyboardType="decimal-pad"
                                maxLength={5}
                            />
                        </View>

                        {/* NPK Status Classifications - Auto-filled */}
                        <View style={[styles.inputContainer, { backgroundColor: '#F0FDF4', padding: 12, borderRadius: 8, marginTop: 8 }]}>
                            <Text style={{ fontSize: 13, color: '#15803D', fontWeight: '600', marginBottom: 4 }}>
                                {language === "si" ? "✨ NPK තත්ත්වය ස්වයංක්‍රීයව තීරණය වේ" : "✨ NPK Status Auto-Detected"}
                            </Text>
                            <Text style={{ fontSize: 11, color: '#166534', lineHeight: 16 }}>
                                {language === "si"
                                    ? "ඔබ N, P, K අගයන් ඇතුළත් කළ විට, තත්ත්වය ස්වයංක්‍රීයව තෝරා ගනු ලැබේ:\n• N: අඩු <55, මධ්‍යම 55-90, ඉහළ >90 ppm\n• P: අඩු <11, මධ්‍යම 11-19, ඉහළ >19 ppm\n• K: අඩු <120, මධ්‍යම 120-200, ඉහළ >200 ppm"
                                    : "When you enter N, P, K values, status is auto-selected:\n• N: Low <55, Medium 55-90, High >90 ppm\n• P: Low <11, Medium 11-19, High >19 ppm\n• K: Low <120, Medium 120-200, High >200 ppm"}
                            </Text>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>
                                {language === "si" ? "නයිට්‍රජන් (N) තත්ත්වය" : "Nitrogen (N) Status"} <Text style={styles.required}>*</Text>
                            </Text>
                            <CustomDropdown
                                label=""
                                value={nStatusClass}
                                options={[
                                    { label: "High", value: "High" },
                                    { label: "Medium", value: "Medium" },
                                    { label: "Low", value: "Low" }
                                ]}
                                onSelect={setNStatusClass}
                                placeholder={language === "si" ? "ස්වයංක්‍රීයව තෝරා ගනු ලැබේ" : "Auto-selected"}
                                required
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>
                                {language === "si" ? "පොස්පරස් (P) තත්ත්වය" : "Phosphorus (P) Status"} <Text style={styles.required}>*</Text>
                            </Text>
                            <CustomDropdown
                                label=""
                                value={pStatusClass}
                                options={[
                                    { label: "High", value: "High" },
                                    { label: "Medium", value: "Medium" },
                                    { label: "Low", value: "Low" }
                                ]}
                                onSelect={setPStatusClass}
                                placeholder={language === "si" ? "ස්වයංක්‍රීයව තෝරා ගනු ලැබේ" : "Auto-selected"}
                                required
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>
                                {language === "si" ? "පොටෑසියම් (K) තත්ත්වය" : "Potassium (K) Status"} <Text style={styles.required}>*</Text>
                            </Text>
                            <CustomDropdown
                                label=""
                                value={kStatusClass}
                                options={[
                                    { label: "High", value: "High" },
                                    { label: "Medium", value: "Medium" },
                                    { label: "Low", value: "Low" }
                                ]}
                                onSelect={setKStatusClass}
                                placeholder={language === "si" ? "ස්වයංක්‍රීයව තෝරා ගනු ලැබේ" : "Auto-selected"}
                                required
                            />
                        </View>
                    </View>

                    {/* Seed Variety Selector */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>
                            {content[language].seedVariety} <Text style={styles.required}>*</Text>
                        </Text>
                        <Text style={styles.helperText}>{content[language].selectVariety}</Text>
                        <View style={styles.varietyGrid}>
                            {SEED_VARIETIES.map((item) => (
                                <TouchableOpacity
                                    key={item.name}
                                    style={[
                                        styles.varietyCard,
                                        variety === item.name && styles.varietyCardSelected,
                                    ]}
                                    onPress={() => setVariety(item.name)}
                                >
                                    <Image source={item.image} style={styles.varietyImage} />
                                    <Text style={styles.varietyName}>{item.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Irrigation Type Dropdown */}
                    <CustomDropdown
                        label={content[language].irrigationType}
                        value={irrigationType}
                        options={language === "si" ? IRRIGATION_TYPES_SI : IRRIGATION_TYPES_EN}
                        onSelect={setIrrigationType}
                        placeholder="Select"
                        required
                    />

                    {/* Rainfall Condition Dropdown */}
                    <CustomDropdown
                        label={content[language].rainfallCondition}
                        value={rainfallCondition}
                        options={language === "si" ? RAINFALL_CONDITIONS_SI : RAINFALL_CONDITIONS_EN}
                        onSelect={setRainfallCondition}
                        placeholder="Select"
                        required
                    />

                    {/* Auto-Detected Fields Section */}
                    <View style={styles.autoDetectedSection}>
                        <Text style={styles.autoDetectedTitle}>
                            {content[language].autoDetected}
                        </Text>

                        {/* Rainfall 30d */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{content[language].rainfall30d}</Text>
                            <TextInput
                                style={[styles.input, styles.autoDetectedInput]}
                                value={rainfall30d}
                                onChangeText={(value) => {
                                    handleNumericChange(setRainfall30d, value, true);
                                    setWeatherDataSource("manual");
                                }}
                                placeholder="Auto-filled"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="decimal-pad"
                                maxLength={6}
                            />
                        </View>

                        {/* Seasonal Temperature */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{content[language].seasonalTemperature}</Text>
                            <TextInput
                                style={[styles.input, styles.autoDetectedInput]}
                                value={seasonalTemperature}
                                onChangeText={(value) => {
                                    handleNumericChange(setSeasonalTemperature, value, true);
                                    setWeatherDataSource("manual");
                                }}
                                placeholder="Auto-filled"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="decimal-pad"
                                maxLength={5}
                            />
                        </View>

                        {/* Seasonal Humidity */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{content[language].seasonalHumidity}</Text>
                            <TextInput
                                style={[styles.input, styles.autoDetectedInput]}
                                value={seasonalHumidity}
                                onChangeText={(value) => {
                                    handleNumericChange(setSeasonalHumidity, value, true);
                                    setWeatherDataSource("manual");
                                }}
                                placeholder="Auto-filled"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="decimal-pad"
                                maxLength={5}
                            />
                        </View>

                        {/* Seasonal Rainfall */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{content[language].rainfallSeasonal}</Text>
                            <TextInput
                                style={[styles.input, styles.autoDetectedInput]}
                                value={rainfallSeasonal}
                                onChangeText={(value) => {
                                    handleNumericChange(setRainfallSeasonal, value, true);
                                    setWeatherDataSource("manual");
                                }}
                                placeholder="Auto-filled"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="decimal-pad"
                                maxLength={6}
                            />
                        </View>

                        {/* Max Temperature - Auto-filled */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>
                                {language === "si" ? "උපරිම උෂ්ණත්වය (°C)" : "Maximum Temperature (°C)"} <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={[styles.input, styles.autoDetectedInput]}
                                value={maxTemperature}
                                onChangeText={(value) => {
                                    handleNumericChange(setMaxTemperature, value, true);
                                    setWeatherDataSource("manual");
                                }}
                                placeholder="Auto-filled"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="decimal-pad"
                                maxLength={5}
                            />
                        </View>

                        {/* Sunshine Hours - Auto-filled */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>
                                {language === "si" ? "හිරු එළිය (පැය)" : "Sunshine Hours"} <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={[styles.input, styles.autoDetectedInput]}
                                value={sunshineHours}
                                onChangeText={(value) => {
                                    handleNumericChange(setSunshineHours, value, true);
                                    setWeatherDataSource("manual");
                                }}
                                placeholder="Auto-filled"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="decimal-pad"
                                maxLength={4}
                            />
                        </View>
                    </View>

                    {/* Fertilizer Dates Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            {language === "si" ? "පොහොර දිනයන්" : "Fertilizer Dates"}
                        </Text>

                        {/* Optimal Timing Info */}
                        {plantingDate && (
                            <View style={[styles.inputContainer, { backgroundColor: '#F0FDF4', padding: 12, borderRadius: 8, marginBottom: 12 }]}>
                                <Text style={{ fontSize: 13, color: '#15803D', fontWeight: '600', marginBottom: 4 }}>
                                    {language === "si" ? "📅 ප්‍රශස්ත පොහොර කාලසටහන" : "📅 Optimal Fertilizer Schedule"}
                                </Text>
                                <Text style={{ fontSize: 12, color: '#166534', lineHeight: 18 }}>
                                    {language === "si"
                                        ? `• පළමු පොහොර: වගා කිරීමෙන් දින 24 කට පසුව\n• දෙවන පොහොර: වගා කිරීමෙන් දින 50 කට පසුව\n• මෙම දිනයන් ස්වයංක්‍රීයව පුරවා ඇත`
                                        : `• First fertilizer: 24 days after planting\n• Second fertilizer: 50 days after planting\n• These dates are auto-filled based on your planting date`}
                                </Text>
                            </View>
                        )}

                        {/* First Fertilizer Date - Auto-filled */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>
                                {language === "si" ? "පළමු පොහොර දිනය" : "First Fertilizer Date"} <Text style={styles.required}>*</Text>
                            </Text>
                            {plantingDate && firstFertDate && (
                                <Text style={{ fontSize: 11, color: '#16A34A', marginBottom: 4 }}>
                                    {language === "si"
                                        ? `වගා කිරීමෙන් දින ${Math.round((firstFertDate.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24))} කට පසුව`
                                        : `${Math.round((firstFertDate.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24))} days after planting`}
                                </Text>
                            )}
                            <HybridDateInput
                                label=""
                                value={firstFertDate ? firstFertDate.toISOString().split('T')[0] : ""}
                                onChangeText={(dateStr) => {
                                    if (dateStr) {
                                        // Parse date components to avoid timezone issues
                                        const parts = dateStr.split('-');
                                        const year = parseInt(parts[0], 10);
                                        const month = parseInt(parts[1], 10) - 1;
                                        const day = parseInt(parts[2], 10);
                                        setFirstFertDate(new Date(year, month, day));
                                    } else {
                                        setFirstFertDate(null);
                                    }
                                }}
                                placeholder={language === "si" ? "ස්වයංක්‍රීයව පුරවා ඇත" : "Auto-filled"}
                                required
                            />
                        </View>

                        {/* Second Fertilizer Date - Auto-filled */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>
                                {language === "si" ? "දෙවන පොහොර දිනය (විකල්ප)" : "Second Fertilizer Date (Optional)"}
                            </Text>
                            {plantingDate && secondFertDate && (
                                <Text style={{ fontSize: 11, color: '#16A34A', marginBottom: 4 }}>
                                    {language === "si"
                                        ? `වගා කිරීමෙන් දින ${Math.round((secondFertDate.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24))} කට පසුව`
                                        : `${Math.round((secondFertDate.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24))} days after planting`}
                                </Text>
                            )}
                            <HybridDateInput
                                label=""
                                value={secondFertDate ? secondFertDate.toISOString().split('T')[0] : ""}
                                onChangeText={(dateStr) => {
                                    if (dateStr) {
                                        // Parse date components to avoid timezone issues
                                        const parts = dateStr.split('-');
                                        const year = parseInt(parts[0], 10);
                                        const month = parseInt(parts[1], 10) - 1;
                                        const day = parseInt(parts[2], 10);
                                        setSecondFertDate(new Date(year, month, day));
                                    } else {
                                        setSecondFertDate(null);
                                    }
                                }}
                                placeholder={language === "si" ? "ස්වයංක්‍රීයව පුරවා ඇත" : "Auto-filled"}
                            />
                        </View>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.submitText}>
                            {isSubmitting
                                ? (language === "si" ? "කරුණාකර රැඳී සිටින්න..." : "Please wait...")
                                : content[language].submit
                            }
                        </Text>
                    </TouchableOpacity>
                </View>
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
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
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
    headerActions: {
        flexDirection: "row",
        gap: 8,
    },
    headerIconButton: {
        padding: 8,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: 8,
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
        backgroundColor: "#F9FAFB",
        paddingVertical: 16,
        paddingHorizontal: 20,
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
    infoBar: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    infoItem: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 20,
        gap: 6,
    },
    infoText: {
        fontSize: 13,
        color: "#000000",
        fontWeight: "500",
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#10B981",
        marginRight: 4,
    },
    liveText: {
        fontSize: 11,
        color: "#10B981",
        fontWeight: "600",
        marginRight: 6,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 40,
    },
    section: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#000000",
        marginBottom: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#000000",
        marginBottom: 8,
    },
    required: {
        color: "#EF4444",
    },
    input: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: "#000000",
    },
    helperText: {
        fontSize: 12,
        color: "#000000",
        marginBottom: 12,
    },
    varietyGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    varietyCard: {
        width: "30%",
        backgroundColor: "#F9FAFB",
        borderRadius: 12,
        padding: 12,
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#E5E7EB",
    },
    varietyCardSelected: {
        borderColor: "#10B981",
        backgroundColor: "#D1FAE5",
    },
    varietyImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginBottom: 8,
    },
    varietyName: {
        fontSize: 12,
        color: "#000000",
        marginTop: 4,
        textAlign: "center",
    },
    submitButton: {
        backgroundColor: "#10B981",
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        marginTop: 20,
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonDisabled: {
        backgroundColor: "#9CA3AF",
        shadowColor: "#9CA3AF",
        shadowOpacity: 0.1,
    },
    submitText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#000000",
    },
    autoFillButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#D1FAE5",
        marginHorizontal: 16,
        marginTop: 12,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        gap: 8,
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    autoFillText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#047857",
    },
    seasonDisplay: {
        backgroundColor: "#D1FAE5",
        borderWidth: 1,
        borderColor: "#10B981",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    seasonText: {
        fontSize: 16,
        color: "#000000",
        fontWeight: "600",
    },
    landSizeContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    landSizeInput: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: "#065F46",
    },
    landSizeButtons: {
        gap: 8,
    },
    landSizeButton: {
        backgroundColor: "#D1FAE5",
        borderRadius: 8,
        padding: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    unitSelector: {
        flexDirection: "row",
        gap: 8,
        marginTop: 8,
    },
    unitButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        backgroundColor: "#FFFFFF",
        alignItems: "center",
    },
    unitButtonActive: {
        backgroundColor: "#D1FAE5",
        borderColor: "#10B981",
    },
    unitButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6B7280",
    },
    unitButtonTextActive: {
        color: "#10B981",
    },
    autoDetectedSection: {
        marginTop: 24,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
    },
    autoDetectedTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#000000",
        marginBottom: 16,
    },
    autoDetectedInput: {
        backgroundColor: "#F0FDF4",
        borderColor: "#86EFAC",
    },
    soilTestSection: {
        backgroundColor: "#FEF3C7",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#FCD34D",
    },
    uploadButton: {
        backgroundColor: "#10B981",
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    uploadButtonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    uploadButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "600",
    },
    uploadedFileInfo: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#D1FAE5",
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        gap: 8,
    },
    uploadedFileName: {
        fontSize: 13,
        color: "#065F46",
        fontWeight: "500",
        flex: 1,
    },
});

export default YieldPredictionFormScreen;
