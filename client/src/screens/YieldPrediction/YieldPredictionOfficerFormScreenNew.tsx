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
    MapPin,
    Droplets,
    CloudSun,
    Leaf,
    Calendar,
    CheckCircle,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import CustomDropdown from "../../components/CustomDropdown";
import HybridDateInput from "../../components/HybridDateInput";
import { useLanguage } from "../../context/LanguageContext";

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

// Constants
const DISTRICTS = [
    { label: "Anuradhapura", value: "Anuradhapura" },
    { label: "Polonnaruwa", value: "Polonnaruwa" },
    { label: "Kurunegala", value: "Kurunegala" },
    { label: "Ampara", value: "Ampara" },
    { label: "Monaragala", value: "Monaragala" },
    { label: "Hambantota", value: "Hambantota" },
    { label: "Badulla", value: "Badulla" },
];

const LOCATIONS: { [key: string]: string[] } = {
    Anuradhapura: ["Eppawala", "Tambuttegama", "Nochchiyagama", "Kahatagasdigiliya", "Horowpothana"],
    Polonnaruwa: ["Hingurakgoda", "Medirigiriya", "Dimbulagala"],
    Kurunegala: ["Nikaweratiya", "Galgamuwa", "Maho"],
    Ampara: ["Maha Oya", "Padiyathalawa", "Dehiattakandiya"],
    Monaragala: ["Siyambalanduwa", "Wellawaya", "Buttala", "Thanamalwila"],
    Hambantota: ["Weerawila", "Tissamaharama", "Ambalantota"],
    Badulla: ["Mahiyanganaya", "Rideemaliyadda", "Passara"],
};

const SOIL_TYPES = [
    { label: "Reddish Brown Earth", value: "Reddish Brown Earth" },
    { label: "Red-Yellow Podzolic", value: "Red-Yellow Podzolic" },
    { label: "Alluvial Soil", value: "Alluvial Soil" },
    { label: "Sandy-Loam", value: "Sandy-Loam" },
    { label: "Sandy-Clay-Loam", value: "Sandy-Clay-Loam" },
    { label: "Loamy-Clay", value: "Loamy-Clay" },
];

const SOIL_CONDITIONS = [
    { label: "Good", value: "Good" },
    { label: "Medium", value: "Medium" },
    { label: "Poor", value: "Poor" },
];

const NPK_STATUS = [
    { label: "High", value: "High" },
    { label: "Medium", value: "Medium" },
    { label: "Low", value: "Low" },
];

const IRRIGATION_TYPES = [
    { label: "Irrigated", value: "Irrigated" },
    { label: "Mixed", value: "Mixed" },
    { label: "Rainfed", value: "Rainfed" },
];

const RAINFALL_CONDITIONS = [
    { label: "High", value: "High" },
    { label: "Normal", value: "Normal" },
    { label: "Low", value: "Low" },
];

const SEED_VARIETIES = [
    { label: "Jet 999", value: "Jet 999" },
    { label: "Pacific 808", value: "Pacific 808" },
    { label: "GT 709", value: "GT 709" },
    { label: "GT200", value: "GT200" },
    { label: "Commando", value: "Commando" },
    { label: "Local Variety", value: "Local Variety" },
];

const SEASONS = [
    { label: "Maha", value: "Maha" },
    { label: "Yala", value: "Yala" },
];

const YieldPredictionOfficerFormScreenNew = () => {
    const navigation = useNavigation<NavProp>();
    const route = useRoute();
    const { role } = route.params as { role: "farmer" | "officer" };

    const { language: lang } = useLanguage();
    const language: Language = lang === "sinhala" ? "si" : "en";

    // Step management
    const [currentStep, setCurrentStep] = useState(1);

    // Step 1: Location & Soil Profile
    const [district, setDistrict] = useState("");
    const [location, setLocation] = useState("");
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

    // Step 2: Climate Data
    const [irrigationType, setIrrigationType] = useState("");
    const [rainfallCondition, setRainfallCondition] = useState("");
    const [rainfall30d, setRainfall30d] = useState("");
    const [seasonalRainfall, setSeasonalRainfall] = useState("");
    const [avgTemperature, setAvgTemperature] = useState("");
    const [maxTemperature, setMaxTemperature] = useState("");
    const [avgHumidity, setAvgHumidity] = useState("");
    const [sunshineHours, setSunshineHours] = useState("");

    // Step 3: Crop Information
    const [seedVariety, setSeedVariety] = useState("");
    const [plantingDate, setPlantingDate] = useState("");
    const [season, setSeason] = useState("");
    const [fieldSizeHa, setFieldSizeHa] = useState("");
    const [fieldSizeUnit, setFieldSizeUnit] = useState<"Acres" | "Hectares">("Acres");

    // Step 4: Fertilizer Dates
    const [firstFertDate, setFirstFertDate] = useState("");
    const [secondFertDate, setSecondFertDate] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    const content = {
        si: {
            title: "අස්වැන්න පුරෝකථනය",
            subtitle: "වෘත්තීය/උසස් විශ්ලේෂණය - කෘෂිකර්ම නිලධාරී",
            step: "පියවර",
            of: "න්",
            next: "ඊළඟ",
            previous: "පෙර",
            submit: "ඉදිරිපත් කරන්න",
            // Step 1
            locationSoil: "ස්ථානය සහ පස් විස්තර",
            district: "දිස්ත්‍රික්කය",
            location: "ස්ථානය",
            soilType: "පස් වර්ගය",
            soilCondition: "පස් තත්ත්වය",
            soilPh: "පස් pH",
            soilNitrogen: "පස් නයිට්‍රජන් (N)",
            soilPhosphorus: "පස් පොස්පරස් (P)",
            soilPotassium: "පස් පොටෑසියම් (K)",
            fertilityIndex: "පස් සාරවත් දර්ශකය",
            nStatus: "N තත්ත්වය",
            pStatus: "P තත්ත්වය",
            kStatus: "K තත්ත්වය",
            // Step 2
            climateData: "දේශගුණ දත්ත",
            irrigation: "වාරිමාර්ග වර්ගය",
            rainfallCondition: "වර්ෂාපතන තත්ත්වය",
            rainfall30d: "30 දින වර්ෂාපතනය (mm)",
            seasonalRainfall: "සෘතුමය වර්ෂාපතනය (mm)",
            avgTemp: "සාමාන්‍ය උෂ්ණත්වය (°C)",
            maxTemp: "උපරිම උෂ්ණත්වය (°C)",
            humidity: "සාමාන්‍ය ආර්ද්‍රතාවය (%)",
            sunshine: "හිරු එළිය (පැය)",
            // Step 3
            cropInfo: "බෝග තොරතුරු",
            variety: "බීජ ප්‍රභේදය",
            plantingDate: "වගා කළ දිනය",
            season: "සෘතුව",
            fieldSize: "ඉඩම් ප්‍රමාණය",
            fieldSizeUnit: "ඒකකය",
            // Step 4
            fertilizerDates: "පොහොර දිනයන්",
            firstFert: "පළමු පොහොර දිනය",
            secondFert: "දෙවන පොහොර දිනය",
            select: "තෝරන්න",
            required: "අවශ්‍යයි",
            optional: "විකල්ප",
        },
        en: {
            title: "Yield Prediction",
            subtitle: "Professional/Advanced Analysis - Agricultural Officer",
            step: "Step",
            of: "of",
            next: "Next",
            previous: "Previous",
            submit: "Submit",
            // Step 1
            locationSoil: "Location & Soil Profile",
            district: "District",
            location: "Location",
            soilType: "Soil Type",
            soilCondition: "Soil Condition",
            soilPh: "Soil pH",
            soilNitrogen: "Soil Nitrogen (N)",
            soilPhosphorus: "Soil Phosphorus (P)",
            soilPotassium: "Soil Potassium (K)",
            fertilityIndex: "Soil Fertility Index",
            nStatus: "N Status",
            pStatus: "P Status",
            kStatus: "K Status",
            // Step 2
            climateData: "Climate Data",
            irrigation: "Irrigation Type",
            rainfallCondition: "Rainfall Condition",
            rainfall30d: "30-Day Rainfall (mm)",
            seasonalRainfall: "Seasonal Rainfall (mm)",
            avgTemp: "Average Temperature (°C)",
            maxTemp: "Maximum Temperature (°C)",
            humidity: "Average Humidity (%)",
            sunshine: "Sunshine Hours",
            // Step 3
            cropInfo: "Crop Information",
            variety: "Seed Variety",
            plantingDate: "Planting Date",
            season: "Season",
            fieldSize: "Field Size",
            fieldSizeUnit: "Unit",
            // Step 4
            fertilizerDates: "Fertilizer Dates",
            firstFert: "First Fertilizer Date",
            secondFert: "Second Fertilizer Date",
            select: "Select",
            required: "Required",
            optional: "Optional",
        },
    };

    const validateStep1 = () => {
        if (
            !district ||
            !location ||
            !soilType ||
            !soilCondition ||
            !soilPh ||
            !soilNitrogen ||
            !soilPhosphorus ||
            !soilPotassium ||
            !soilFertilityIndex ||
            !nStatusClass ||
            !pStatusClass ||
            !kStatusClass
        ) {
            Alert.alert(
                language === "si" ? "දෝෂයකි" : "Error",
                language === "si"
                    ? "කරුණාකර සියලු අනිවාර්ය තොරතුරු පුරවන්න"
                    : "Please fill all required fields"
            );
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        if (
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
            return false;
        }
        return true;
    };

    const validateStep3 = () => {
        if (!seedVariety || !plantingDate || !season || !fieldSizeHa) {
            Alert.alert(
                language === "si" ? "දෝෂයකි" : "Error",
                language === "si"
                    ? "කරුණාකර සියලු අනිවාර්ය තොරතුරු පුරවන්න"
                    : "Please fill all required fields"
            );
            return false;
        }
        
        // Validate field size is greater than 0
        const fieldSize = parseFloat(fieldSizeHa);
        if (isNaN(fieldSize) || fieldSize <= 0) {
            Alert.alert(
                language === "si" ? "දෝෂයකි" : "Error",
                language === "si"
                    ? "ඉඩම් ප්‍රමාණය 0 ට වඩා වැඩි විය යුතුය"
                    : "Field size must be greater than 0"
            );
            return false;
        }
        
        return true;
    };

    const handleNext = () => {
        if (currentStep === 1 && !validateStep1()) return;
        if (currentStep === 2 && !validateStep2()) return;
        if (currentStep === 3 && !validateStep3()) return;
        setCurrentStep(currentStep + 1);
    };

    const handlePrevious = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async () => {
        if (!firstFertDate) {
            Alert.alert(
                language === "si" ? "දෝෂයකි" : "Error",
                language === "si"
                    ? "කරුණාකර පළමු පොහොර දිනය ඇතුළත් කරන්න"
                    : "Please enter first fertilizer date"
            );
            return;
        }

        setIsSubmitting(true);

        try {
            // Extract planting month from date
            const plantingMonth = parseInt(plantingDate.split("-")[1]);

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
                    planting_month: plantingMonth,
                    season,
                    field_size_ha: fieldSizeUnit === "Acres" 
                        ? parseFloat(fieldSizeHa) * 0.404686 
                        : parseFloat(fieldSizeHa),
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
                // Handle error message - convert array to string if needed
                let errorMessage = "Prediction failed";
                if (result.detail) {
                    if (Array.isArray(result.detail)) {
                        // FastAPI validation errors are arrays
                        errorMessage = result.detail.map((err: any) => 
                            err.msg || err.message || JSON.stringify(err)
                        ).join(", ");
                    } else if (typeof result.detail === "string") {
                        errorMessage = result.detail;
                    } else {
                        errorMessage = JSON.stringify(result.detail);
                    }
                }
                
                Alert.alert(
                    language === "si" ? "දෝෂයකි" : "Error",
                    errorMessage
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
        } finally {
            setIsSubmitting(false);
        }
    };

    const getAvailableLocations = () => {
        return district ? LOCATIONS[district] || [] : [];
    };

    const renderStepIndicator = () => (
        <View style={styles.stepIndicator}>
            {[1, 2, 3, 4].map((step) => (
                <View key={step} style={styles.stepItem}>
                    <View
                        style={[
                            styles.stepCircle,
                            currentStep >= step && styles.stepCircleActive,
                        ]}
                    >
                        {currentStep > step ? (
                            <CheckCircle color="#FFFFFF" size={20} />
                        ) : (
                            <Text
                                style={[
                                    styles.stepNumber,
                                    currentStep >= step && styles.stepNumberActive,
                                ]}
                            >
                                {step}
                            </Text>
                        )}
                    </View>
                    {step < 4 && (
                        <View
                            style={[
                                styles.stepLine,
                                currentStep > step && styles.stepLineActive,
                            ]}
                        />
                    )}
                </View>
            ))}
        </View>
    );

    const renderStep1 = () => (
        <View style={styles.stepContainer}>
            <View style={styles.sectionHeader}>
                <MapPin color="#16A34A" size={24} />
                <Text style={styles.sectionTitle}>{content[language].locationSoil}</Text>
            </View>

            <CustomDropdown
                label={`${content[language].district} *`}
                value={district}
                options={DISTRICTS}
                onSelect={(value) => {
                    setDistrict(value);
                    setLocation("");
                }}
                placeholder={content[language].select}
            />

            <CustomDropdown
                label={`${content[language].location} *`}
                value={location}
                options={getAvailableLocations().map((loc) => ({ label: loc, value: loc }))}
                onSelect={setLocation}
                placeholder={content[language].select}
                disabled={!district}
            />

            <CustomDropdown
                label={`${content[language].soilType} *`}
                value={soilType}
                options={SOIL_TYPES}
                onSelect={setSoilType}
                placeholder={content[language].select}
            />

            <CustomDropdown
                label={`${content[language].soilCondition} *`}
                value={soilCondition}
                options={SOIL_CONDITIONS}
                onSelect={setSoilCondition}
                placeholder={content[language].select}
            />

            <View style={styles.formGroup}>
                <Text style={styles.label}>{content[language].soilPh} *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="6.5"
                    value={soilPh}
                    onChangeText={setSoilPh}
                    keyboardType="decimal-pad"
                    placeholderTextColor="#9CA3AF"
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>{content[language].soilNitrogen} * (mg/kg)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="85"
                    value={soilNitrogen}
                    onChangeText={setSoilNitrogen}
                    keyboardType="numeric"
                    placeholderTextColor="#9CA3AF"
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>{content[language].soilPhosphorus} * (mg/kg)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="20"
                    value={soilPhosphorus}
                    onChangeText={setSoilPhosphorus}
                    keyboardType="numeric"
                    placeholderTextColor="#9CA3AF"
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>{content[language].soilPotassium} * (mg/kg)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="190"
                    value={soilPotassium}
                    onChangeText={setSoilPotassium}
                    keyboardType="numeric"
                    placeholderTextColor="#9CA3AF"
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>{content[language].fertilityIndex} * (0-1)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="0.72"
                    value={soilFertilityIndex}
                    onChangeText={setSoilFertilityIndex}
                    keyboardType="decimal-pad"
                    placeholderTextColor="#9CA3AF"
                />
            </View>

            <CustomDropdown
                label={`${content[language].nStatus} *`}
                value={nStatusClass}
                options={NPK_STATUS}
                onSelect={setNStatusClass}
                placeholder={content[language].select}
            />

            <CustomDropdown
                label={`${content[language].pStatus} *`}
                value={pStatusClass}
                options={NPK_STATUS}
                onSelect={setPStatusClass}
                placeholder={content[language].select}
            />

            <CustomDropdown
                label={`${content[language].kStatus} *`}
                value={kStatusClass}
                options={NPK_STATUS}
                onSelect={setKStatusClass}
                placeholder={content[language].select}
            />
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.stepContainer}>
            <View style={styles.sectionHeader}>
                <CloudSun color="#16A34A" size={24} />
                <Text style={styles.sectionTitle}>{content[language].climateData}</Text>
            </View>

            <CustomDropdown
                label={`${content[language].irrigation} *`}
                value={irrigationType}
                options={IRRIGATION_TYPES}
                onSelect={setIrrigationType}
                placeholder={content[language].select}
            />

            <CustomDropdown
                label={`${content[language].rainfallCondition} *`}
                value={rainfallCondition}
                options={RAINFALL_CONDITIONS}
                onSelect={setRainfallCondition}
                placeholder={content[language].select}
            />

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
                    keyboardType="decimal-pad"
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
                    keyboardType="decimal-pad"
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
                    keyboardType="decimal-pad"
                    placeholderTextColor="#9CA3AF"
                />
            </View>
        </View>
    );

    const renderStep3 = () => (
        <View style={styles.stepContainer}>
            <View style={styles.sectionHeader}>
                <Leaf color="#16A34A" size={24} />
                <Text style={styles.sectionTitle}>{content[language].cropInfo}</Text>
            </View>

            <CustomDropdown
                label={`${content[language].variety} *`}
                value={seedVariety}
                options={SEED_VARIETIES}
                onSelect={setSeedVariety}
                placeholder={content[language].select}
            />

            <HybridDateInput
                label={content[language].plantingDate}
                value={plantingDate}
                onChangeText={setPlantingDate}
                placeholder="YYYY-MM-DD"
                required={true}
            />

            <CustomDropdown
                label={`${content[language].season} *`}
                value={season}
                options={SEASONS}
                onSelect={setSeason}
                placeholder={content[language].select}
            />

            <View style={styles.formGroup}>
                <Text style={styles.label}>{content[language].fieldSize} *</Text>
                <View style={styles.fieldSizeContainer}>
                    <TextInput
                        style={styles.fieldSizeInput}
                        placeholder="2.5"
                        value={fieldSizeHa}
                        onChangeText={(value) => {
                            if (/^\d*\.?\d*$/.test(value)) {
                                setFieldSizeHa(value);
                            }
                        }}
                        keyboardType="decimal-pad"
                        placeholderTextColor="#9CA3AF"
                        maxLength={6}
                    />
                    <View style={styles.unitSelector}>
                        <TouchableOpacity
                            style={[styles.unitButton, fieldSizeUnit === "Acres" && styles.unitButtonActive]}
                            onPress={() => setFieldSizeUnit("Acres")}
                        >
                            <Text style={[styles.unitButtonText, fieldSizeUnit === "Acres" && styles.unitButtonTextActive]}>
                                Acres
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.unitButton, fieldSizeUnit === "Hectares" && styles.unitButtonActive]}
                            onPress={() => setFieldSizeUnit("Hectares")}
                        >
                            <Text style={[styles.unitButtonText, fieldSizeUnit === "Hectares" && styles.unitButtonTextActive]}>
                                Hectares
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {fieldSizeHa && (
                    <Text style={styles.conversionText}>
                        {fieldSizeUnit === "Acres"
                            ? `≈ ${(parseFloat(fieldSizeHa) * 0.404686).toFixed(2)} Hectares`
                            : `≈ ${(parseFloat(fieldSizeHa) * 2.47105).toFixed(2)} Acres`}
                    </Text>
                )}
            </View>
        </View>
    );

    const renderStep4 = () => (
        <View style={styles.stepContainer}>
            <View style={styles.sectionHeader}>
                <Calendar color="#16A34A" size={24} />
                <Text style={styles.sectionTitle}>{content[language].fertilizerDates}</Text>
            </View>

            <HybridDateInput
                label={content[language].firstFert}
                value={firstFertDate}
                onChangeText={setFirstFertDate}
                placeholder="YYYY-MM-DD"
                required={true}
            />

            <HybridDateInput
                label={`${content[language].secondFert} (${content[language].optional})`}
                value={secondFertDate}
                onChangeText={setSecondFertDate}
                placeholder="YYYY-MM-DD"
                required={false}
            />

            <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>
                    {language === "si" ? "සාරාංශය" : "Summary"}
                </Text>
                <Text style={styles.summaryText}>
                    {content[language].district}: {district}
                </Text>
                <Text style={styles.summaryText}>
                    {content[language].location}: {location}
                </Text>
                <Text style={styles.summaryText}>
                    {content[language].variety}: {seedVariety}
                </Text>
                <Text style={styles.summaryText}>
                    {content[language].season}: {season}
                </Text>
                <Text style={styles.summaryText}>
                    {content[language].fieldSize}: {fieldSizeHa} ha
                </Text>
            </View>
        </View>
    );

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
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>{content[language].title}</Text>
                    <Text style={styles.headerSubtitle}>{content[language].subtitle}</Text>
                </View>
            </LinearGradient>

            {/* Step Indicator */}
            {renderStepIndicator()}

            {/* Step Progress Text */}
            <Text style={styles.stepText}>
                {content[language].step} {currentStep} {content[language].of} 4
            </Text>

            {/* Form Content */}
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Navigation Buttons */}
            <View style={styles.buttonContainer}>
                {currentStep > 1 && (
                    <TouchableOpacity style={styles.previousButton} onPress={handlePrevious}>
                        <ArrowLeft color="#16A34A" size={20} />
                        <Text style={styles.previousButtonText}>{content[language].previous}</Text>
                    </TouchableOpacity>
                )}

                {currentStep < 4 ? (
                    <TouchableOpacity
                        style={[styles.nextButton, currentStep === 1 && styles.nextButtonFull]}
                        onPress={handleNext}
                    >
                        <Text style={styles.nextButtonText}>{content[language].next}</Text>
                        <ArrowRight color="#FFFFFF" size={20} />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.submitButtonText}>
                            {isSubmitting
                                ? language === "si"
                                    ? "ඉදිරිපත් කරමින්..."
                                    : "Submitting..."
                                : content[language].submit}
                        </Text>
                        <ArrowRight color="#FFFFFF" size={20} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F0FDF4",
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    backButton: {
        marginRight: 15,
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#D1FAE5",
        marginTop: 4,
    },
    stepIndicator: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    stepItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    stepCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#E5E7EB",
        justifyContent: "center",
        alignItems: "center",
    },
    stepCircleActive: {
        backgroundColor: "#10b981",
    },
    stepNumber: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#9CA3AF",
    },
    stepNumberActive: {
        color: "#FFFFFF",
    },
    stepLine: {
        width: 40,
        height: 2,
        backgroundColor: "#E5E7EB",
        marginHorizontal: 5,
    },
    stepLineActive: {
        backgroundColor: "#10b981",
    },
    stepText: {
        textAlign: "center",
        fontSize: 14,
        color: "#6B7280",
        marginBottom: 10,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 20,
    },
    stepContainer: {
        marginTop: 10,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        backgroundColor: "#ECFDF5",
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#A7F3D0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#065F46",
        marginLeft: 10,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 8,
    },
    input: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 15,
        color: "#1F2937",
    },
    summaryCard: {
        backgroundColor: "#FFFFFF",
        padding: 20,
        borderRadius: 12,
        marginTop: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1F2937",
        marginBottom: 15,
    },
    summaryText: {
        fontSize: 14,
        color: "#6B7280",
        marginBottom: 8,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
    },
    previousButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#10b981",
    },
    previousButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#10b981",
        marginLeft: 8,
    },
    nextButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#10b981",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    nextButtonFull: {
        flex: 1,
        justifyContent: "center",
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
        marginRight: 8,
    },
    submitButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#10b981",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        flex: 1,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
        marginRight: 8,
    },
    fieldSizeContainer: {
        marginBottom: 8,
    },
    fieldSizeInput: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 15,
        color: "#1F2937",
        marginBottom: 8,
    },
    unitSelector: {
        flexDirection: "row",
        gap: 8,
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
        backgroundColor: "#ECFDF5",
        borderColor: "#10b981",
    },
    unitButtonText: {
        fontSize: 14,
        color: "#6B7280",
        fontWeight: "500",
    },
    unitButtonTextActive: {
        color: "#10b981",
        fontWeight: "600",
    },
    conversionText: {
        fontSize: 12,
        color: "#059669",
        marginTop: 4,
        fontStyle: "italic",
    },
});

export default YieldPredictionOfficerFormScreenNew;
