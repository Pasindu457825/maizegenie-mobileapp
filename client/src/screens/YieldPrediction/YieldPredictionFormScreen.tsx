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
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { YieldPredictionStackParamList } from "../../navigation/YieldPredictionStack";
import { ArrowLeft, MapPin, CloudSun, Plus, Minus, Sparkles } from "lucide-react-native";
import CustomDropdown from "../../components/CustomDropdown";
import CustomDatePicker from "../../components/CustomDatePicker";
import * as Location from "expo-location";
import { fetchWeatherByCoordinates, getLocationCoordinates } from "../../services/weatherApi";

type Language = "si" | "en";
type NavProp = StackNavigationProp<
    YieldPredictionStackParamList,
    "YieldPredictionFormScreen"
>;

const DISTRICTS = [
    { label: "Anuradhapura", value: "Anuradhapura" },
    { label: "Monaragala", value: "Monaragala" },
    { label: "Badulla", value: "Badulla" },
    { label: "Ampara", value: "Ampara" },
    { label: "Dambulla", value: "Dambulla" },
    { label: "Panadura", value: "Panadura" },
    { label: "Piliyandala", value: "Piliyandala" },
    { label: "Malabe", value: "Malabe" },
    { label: "Kaduwela", value: "Kaduwela" },
];

const SEED_VARIETIES = [
    { name: "Commando", image: require("../../../assets/varieties/commando.png") },
    { name: "GT 200", image: require("../../../assets/varieties/gt200.png") },
    { name: "GT 709", image: require("../../../assets/varieties/gt709.png") },
    { name: "Jet 999", image: require("../../../assets/varieties/jet999.png") },
    { name: "Pacific 808", image: require("../../../assets/varieties/pacific808.png") },
    { name: "Unkown", image: require("../../../assets/varieties/Unknown.png") }
];

// Seasonal climate data for Sri Lankan districts
// Unit: Total Millimeters (mm) per season for rainfall
// Temperature in Celsius, Humidity in percentage
const SEASONAL_CLIMATE_DATA: {
    [key: string]: {
        maha: { 
            rainfall: { min: number; max: number; reliability: string };
            temp: { min: number; max: number };
            humidity: number;
        };
        yala: { 
            rainfall: { min: number; max: number; reliability: string };
            temp: { min: number; max: number };
            humidity: number;
        };
    };
} = {
    Anuradhapura: {
        maha: { 
            rainfall: { min: 900, max: 1100, reliability: "High" },
            temp: { min: 22, max: 30 },
            humidity: 82
        },
        yala: { 
            rainfall: { min: 350, max: 500, reliability: "Low" },
            temp: { min: 25, max: 34 },
            humidity: 70
        }
    },
    Monaragala: {
        maha: { 
            rainfall: { min: 1000, max: 1300, reliability: "High" },
            temp: { min: 22, max: 29 },
            humidity: 82
        },
        yala: { 
            rainfall: { min: 500, max: 650, reliability: "Medium" },
            temp: { min: 25, max: 33 },
            humidity: 72
        }
    },
    Badulla: {
        maha: { 
            rainfall: { min: 1100, max: 1500, reliability: "High" },
            temp: { min: 23, max: 29 },
            humidity: 80
        },
        yala: { 
            rainfall: { min: 600, max: 800, reliability: "Medium" },
            temp: { min: 24, max: 33 },
            humidity: 68
        }
    },
    Ampara: {
        maha: { 
            rainfall: { min: 1100, max: 1400, reliability: "High" },
            temp: { min: 23, max: 28 },
            humidity: 85
        },
        yala: { 
            rainfall: { min: 350, max: 450, reliability: "Low" },
            temp: { min: 26, max: 34 },
            humidity: 72
        }
    },
    Dambulla: {
        maha: { 
            rainfall: { min: 800, max: 1100, reliability: "High" },
            temp: { min: 21, max: 29 },
            humidity: 83
        },
        yala: { 
            rainfall: { min: 400, max: 550, reliability: "Low" },
            temp: { min: 24, max: 33 },
            humidity: 70
        }
    },
    Panadura: {
        maha: { 
            rainfall: { min: 1200, max: 1500, reliability: "High" },
            temp: { min: 23, max: 30 },
            humidity: 85
        },
        yala: { 
            rainfall: { min: 1500, max: 2000, reliability: "High" },
            temp: { min: 25, max: 31 },
            humidity: 90
        }
    },
    Piliyandala: {
        maha: { 
            rainfall: { min: 1100, max: 1400, reliability: "High" },
            temp: { min: 23, max: 30 },
            humidity: 82
        },
        yala: { 
            rainfall: { min: 1400, max: 1800, reliability: "High" },
            temp: { min: 25, max: 31 },
            humidity: 88
        }
    },
    Malabe: {
        maha: { 
            rainfall: { min: 1100, max: 1400, reliability: "High" },
            temp: { min: 22, max: 30 },
            humidity: 82
        },
        yala: { 
            rainfall: { min: 1300, max: 1700, reliability: "High" },
            temp: { min: 24, max: 31 },
            humidity: 88
        }
    },
    Kaduwela: {
        maha: { 
            rainfall: { min: 1100, max: 1400, reliability: "High" },
            temp: { min: 23, max: 31 },
            humidity: 85
        },
        yala: { 
            rainfall: { min: 1300, max: 1700, reliability: "High" },
            temp: { min: 25, max: 32 },
            humidity: 90
        }
    },
};

// Location coordinates and soil types by district
const LOCATION_COORDINATES: { 
    [key: string]: { 
        [key: string]: { 
            lat: number; 
            lng: number; 
            soilTypes: string[];
        } 
    } 
} = {
    Anuradhapura: {
        'Eppawala': { 
            lat: 8.2833, 
            lng: 80.4667,
            soilTypes: ['Reddish Brown Earth', 'Non-Calcic Brown Soil', 'Sandy-Loam']
        },
        'Tambuttegama': { 
            lat: 8.0167, 
            lng: 80.5000,
            soilTypes: ['Reddish Brown Earth', 'Alluvial Soil', 'Sandy-Clay-Loam']
        },
        'Nochchiyagama': { 
            lat: 8.3833, 
            lng: 80.2333,
            soilTypes: ['Reddish Brown Earth', 'Non-Calcic Brown Soil']
        },
        'Kahatagasdigiliya': { 
            lat: 8.4500, 
            lng: 80.7167,
            soilTypes: ['Reddish Brown Earth', 'Sandy-Loam']
        },
        'Horowpathana': { 
            lat: 8.3167, 
            lng: 80.3833,
            soilTypes: ['Reddish Brown Earth', 'Non-Calcic Brown Soil']
        },
    },
    Monaragala: {
        'Siyambalanduwa': { 
            lat: 6.7333, 
            lng: 81.5333,
            soilTypes: ['Reddish Brown Earth', 'Red-Yellow Podzolic Soil', 'Sandy-Loam']
        },
        'Wellawaya': { 
            lat: 6.7333, 
            lng: 81.1000,
            soilTypes: ['Reddish Brown Earth', 'Alluvial Soil', 'Loamy-Sand']
        },
        'Buttala': { 
            lat: 6.7500, 
            lng: 81.2333,
            soilTypes: ['Reddish Brown Earth', 'Red-Yellow Podzolic Soil', 'Sandy-Clay-Loam']
        },
        'Thanamalwila': { 
            lat: 6.4333, 
            lng: 81.1833,
            soilTypes: ['Reddish Brown Earth', 'Alluvial Soil']
        },
    },
    Badulla: {
        'Mahiyanganaya': { 
            lat: 7.3333, 
            lng: 81.0000,
            soilTypes: ['Red-Yellow Podzolic Soil', 'Alluvial Soil', 'Loamy-Clay']
        },
        'Rideemaliyadda': { 
            lat: 7.2667, 
            lng: 81.1333,
            soilTypes: ['Red-Yellow Podzolic Soil', 'Lateritic Soil']
        },
    },
    Ampara: {
        'Maha Oya': { 
            lat: 7.4167, 
            lng: 81.5333,
            soilTypes: ['Reddish Brown Earth', 'Alluvial Soil']
        },
        'Padiyathalawa': { 
            lat: 7.7167, 
            lng: 81.0333,
            soilTypes: ['Reddish Brown Earth', 'Sandy-Loam']
        },
        'Dehiattakandiya': { 
            lat: 7.9167, 
            lng: 81.1167,
            soilTypes: ['Reddish Brown Earth', 'Alluvial Soil']
        },
    },
    Dambulla: {
        'Dambulla': { 
            lat: 7.8731, 
            lng: 80.6514,
            soilTypes: ['Reddish Brown Earth', 'Red-Brown Latosolic Soil', 'Alluvial Soil', 'Sandy-Loam']
        },
        'Pelwehera': { 
            lat: 7.903092, 
            lng: 80.670837,
            soilTypes: ['Reddish Brown Earth', 'Latosolic Soil', 'Sandy-Clay-Loam']
        },
    },
    Panadura: {
        'Panadura': { 
            lat: 6.7114, 
            lng: 79.9074,
            soilTypes: ['Sandy Regosol', 'Bog Soil', 'Red-Yellow Podzolic']
        },
    },
    Piliyandala: {
        'Piliyandala': { 
            lat: 6.8018, 
            lng: 79.9227,
            soilTypes: ['Red-Yellow Podzolic', 'Lateritic Soil']
        },
    },
    Malabe: {
        'Malabe': { 
            lat: 6.9061, 
            lng: 79.9647,
            soilTypes: ['Red-Yellow Podzolic', 'Lateritic Soil', 'Gravelly']
        },
    },
    Kaduwela: {
        'Kaduwela': { 
            lat: 6.9328, 
            lng: 79.9842,
            soilTypes: ['Alluvial Soil', 'Red-Yellow Podzolic']
        },
    },
};

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
    const { role, language: initialLanguage } = route.params as {
        role: "farmer" | "officer";
        language: Language;
    };

    const [language, setLanguage] = useState<Language>(initialLanguage);
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
    
    // Auto-detected fields from Weather API (LIVE)
    const [temperature, setTemperature] = useState("");
    const [humidity, setHumidity] = useState("");
    const [rainfall30d, setRainfall30d] = useState("");
    
    // Seasonal average fields from Database
    const [seasonalTemperature, setSeasonalTemperature] = useState("");
    const [seasonalHumidity, setSeasonalHumidity] = useState("");
    const [rainfallSeasonal, setRainfallSeasonal] = useState("");
    
    const [isLiveData, setIsLiveData] = useState(false);
    
    // Get location options based on selected district
    const getLocationOptions = () => {
        if (!district || !LOCATION_COORDINATES[district]) return [];
        return Object.keys(LOCATION_COORDINATES[district]).map(loc => ({
            label: loc,
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

    const content = {
        si: {
            title: "අස්වැන්න පුරෝකථනය",
            subtitle: "තොරතුරු ඇතුළත් කරන්න",
            yourInputs: "ඔබේ දත්ත",
            district: "දිස්ත්‍රික්කය",
            location: "ස්ථානය",
            plantingDate: "වගා කළ දිනය",
            season: "වාරය",
            landSize: "ඉඩම් ප්‍රමාණය (අක්කර)",
            autoFill: "ස්වයංක්‍රීය පිරවීම",
            autoDetected: "ස්වයංක්‍රීය හඳුනාගත්",
            temperature: "උෂ්ණත්වය (°C)",
            humidity: "ආර්ද්‍රතාවය (%)",
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
            landSize: "Land Size (acres)",
            autoFill: "Auto Fill",
            autoDetected: "Auto-Detected",
            temperature: "Temperature (°C)",
            humidity: "Humidity (%)",
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

    // Auto-calculate season when planting date changes
    useEffect(() => {
        if (plantingDate) {
            const month = plantingDate.getMonth() + 1;
            // Maha Season: October to March (months 10-3)
            // Yala Season: April to September (months 4-9)
            if (month >= 10 || month <= 3) {
                setSeason(language === "si" ? "මහ වාරය" : "Maha Season");
            } else {
                setSeason(language === "si" ? "යල වාරය" : "Yala Season");
            }
        }
    }, [plantingDate, language]);

    // Request location permission and fetch weather
    const requestLocationAndWeather = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            
            if (status !== "granted") {
                Alert.alert(
                    language === "si" ? "අවසරය අවශ්‍යයි" : "Permission Required",
                    language === "si" ? "කරුණාකර ස්ථානය සක්‍රිය කරන්න" : "Please enable location access"
                );
                return;
            }

            const loc = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = loc.coords;

            // Fetch weather data
            const weather = await fetchWeatherByCoordinates(latitude, longitude);
            setWeatherData({
                temp: `${weather.temperature}°C`,
                condition: weather.description,
            });

            // Auto-fill weather fields (LIVE DATA from OpenWeatherMap API)
            setTemperature(weather.temperature.toString());
            setHumidity(weather.humidity.toString());
            
            // Mark as live data
            setIsLiveData(true);
            
            // Determine current season based on month
            const currentMonth = new Date().getMonth() + 1;
            const currentSeason = (currentMonth >= 10 || currentMonth <= 3) ? 'maha' : 'yala';

            // Reverse geocode to get location name and district
            const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (geocode[0]) {
                const cityName = geocode[0].city || geocode[0].district || "";
                const districtName = geocode[0].region || geocode[0].district || "";
                
                setLocationName(cityName || "Location");
                
                // Auto-fill district if it matches
                const matchedDistrict = DISTRICTS.find(d => 
                    districtName.toLowerCase().includes(d.value.toLowerCase()) ||
                    cityName.toLowerCase().includes(d.value.toLowerCase())
                );
                
                // Use matched district or default to Panadura for wet zone areas
                const targetDistrict = matchedDistrict ? matchedDistrict.value : "Panadura";
                
                // Set seasonal climate data for the target district
                if (SEASONAL_CLIMATE_DATA[targetDistrict]) {
                    const seasonalData = SEASONAL_CLIMATE_DATA[targetDistrict][currentSeason];
                    
                    // Calculate average rainfall from min/max range
                    const avgRainfall = Math.round((seasonalData.rainfall.min + seasonalData.rainfall.max) / 2);
                    setRainfallSeasonal(avgRainfall.toString());
                    
                    // Calculate average temperature from min/max range
                    const avgSeasonalTemp = Math.round(((seasonalData.temp.min + seasonalData.temp.max) / 2) * 10) / 10;
                    setSeasonalTemperature(avgSeasonalTemp.toString());
                    
                    // Set seasonal humidity
                    setSeasonalHumidity(seasonalData.humidity.toString());
                    
                    // Calculate 30-day rainfall estimate
                    // If current rainfall is 0, use 10% of seasonal average as estimate
                    const currentRainfall = weather.rainfall || 0;
                    let estimated30d: number;
                    if (currentRainfall > 0) {
                        // Extrapolate from current rainfall
                        estimated30d = Math.round(currentRainfall * 720);
                    } else {
                        // Use 10% of seasonal average as fallback (represents typical 30-day period)
                        estimated30d = Math.round(avgRainfall * 0.1);
                    }
                    setRainfall30d(estimated30d.toString());
                    
                    console.log(`Data set for ${targetDistrict} (${currentSeason}):`, {
                        temp: avgSeasonalTemp,
                        humidity: seasonalData.humidity,
                        rainfall: avgRainfall,
                        rainfall30d: estimated30d
                    });
                }
                
                // Only set district dropdown if matched
                if (matchedDistrict) {
                    setDistrict(matchedDistrict.value);
                }
                
                // Auto-fill location if it matches
                if (district && LOCATION_COORDINATES[district]) {
                    const matchedLocation = Object.keys(LOCATION_COORDINATES[district]).find(loc =>
                        cityName.toLowerCase().includes(loc.toLowerCase())
                    );
                    if (matchedLocation) {
                        setLocation(matchedLocation);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching location/weather:", error);
            Alert.alert(
                language === "si" ? "දෝෂයකි" : "Error",
                language === "si" ? "කාලගුණ දත්ත ලබා ගත නොහැක" : "Unable to fetch weather data"
            );
        }
    };

    // Auto-fill district and location
    const handleAutoFill = () => {
        Alert.alert(
            language === "si" ? "ස්ථානය සක්‍රිය කරන්න" : "Enable Location",
            language === "si" ? "ස්වයංක්‍රීය පිරවීම සඳහා ස්ථානය සක්‍රිය කරන්න" : "Enable location to auto-fill district and location",
            [
                { text: language === "si" ? "අවලංගු කරන්න" : "Cancel", style: "cancel" },
                { text: language === "si" ? "සක්‍රිය කරන්න" : "Enable", onPress: requestLocationAndWeather },
            ]
        );
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

    const handleSubmit = () => {
        // Required field validation
        if (!district || !plantingDate || !landSize || !soilCondition || !irrigationType || !variety || !rainfallCondition) {
            Alert.alert(
                language === "si" ? "අවශ්‍ය දත්ත" : "Required Fields",
                language === "si" ? "කරුණාකර සියලු අවශ්‍ය ක්ෂේත්‍ර පුරවන්න" : "Please fill all required fields"
            );
            return;
        }

        // Numeric field validations
        const landSizeNum = parseFloat(landSize);
        if (isNaN(landSizeNum) || landSizeNum <= 0 || landSizeNum > 1000) {
            Alert.alert(
                language === "si" ? "වලංගු නොවේ" : "Invalid Input",
                language === "si" ? "ඉඩම් ප්‍රමාණය 0.1 සහ 1000 අතර විය යුතුය" : "Land size must be between 0.1 and 1000 acres"
            );
            return;
        }

        // Temperature validation (optional field)
        if (temperature && temperature.trim() !== "") {
            const tempNum = parseFloat(temperature);
            if (isNaN(tempNum) || tempNum < 0 || tempNum > 60) {
                Alert.alert(
                    language === "si" ? "වලංගු නොවේ" : "Invalid Input",
                    language === "si" ? "උෂ්ණත්වය 0°C සහ 60°C අතර විය යුතුය" : "Temperature must be between 0°C and 60°C"
                );
                return;
            }
        }

        // Humidity validation (optional field)
        if (humidity && humidity.trim() !== "") {
            const humidityNum = parseFloat(humidity);
            if (isNaN(humidityNum) || humidityNum < 0 || humidityNum > 100) {
                Alert.alert(
                    language === "si" ? "වලංගු නොවේ" : "Invalid Input",
                    language === "si" ? "ආර්ද්‍රතාවය 0% සහ 100% අතර විය යුතුය" : "Humidity must be between 0% and 100%"
                );
                return;
            }
        }

        // Rainfall validations (optional fields)
        if (rainfall30d && rainfall30d.trim() !== "") {
            const rainfall30dNum = parseFloat(rainfall30d);
            if (isNaN(rainfall30dNum) || rainfall30dNum < 0 || rainfall30dNum > 5000) {
                Alert.alert(
                    language === "si" ? "වලංගු නොවේ" : "Invalid Input",
                    language === "si" ? "වර්ෂාපතනය 30d 0mm සහ 5000mm අතර විය යුතුය" : "Rainfall 30d must be between 0mm and 5000mm"
                );
                return;
            }
        }

        if (rainfallSeasonal && rainfallSeasonal.trim() !== "") {
            const rainfallSeasonalNum = parseFloat(rainfallSeasonal);
            if (isNaN(rainfallSeasonalNum) || rainfallSeasonalNum < 0 || rainfallSeasonalNum > 10000) {
                Alert.alert(
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
                Alert.alert(
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
                Alert.alert(
                    language === "si" ? "වලංගු නොවේ" : "Invalid Input",
                    language === "si" ? "වාර ආර්ද්‍රතාවය 0% සහ 100% අතර විය යුතුය" : "Seasonal humidity must be between 0% and 100%"
                );
                return;
            }
        }

        // Navigate to results with mock data
        navigation.navigate("YieldPredictionResultsScreen", {
            data: {
                prediction: {
                    predicted_yield: 4500,
                    yield_unit: "kg/ha",
                    confidence_score: 0.85,
                    yield_category: "High",
                },
                impact_factors: [
                    { factor: "Soil Quality", impact_percentage: 15, description: "Good soil condition" },
                    { factor: "Irrigation", impact_percentage: 10, description: "Proper irrigation" },
                ],
                recommendations: [
                    { title: "Fertilizer", description: "Apply NPK as recommended" },
                ],
            },
            language,
        });
    };

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
                <TouchableOpacity
                    style={styles.langButton}
                    onPress={() => setLanguage((prev) => (prev === "si" ? "en" : "si"))}
                >
                    <Text style={styles.langText}>{language === "si" ? "EN" : "සිං"}</Text>
                </TouchableOpacity>
            </View>

            {/* Location & Weather Bar */}
            <View style={styles.infoBar}>
                <View style={styles.infoItem}>
                    <MapPin color="#10B981" size={18} />
                    <Text style={styles.infoText}>{locationName}</Text>
                </View>
                <View style={styles.infoItem}>
                    {isLiveData && <View style={styles.liveDot} />}
                    {isLiveData && <Text style={styles.liveText}>Live</Text>}
                    <CloudSun color="#10B981" size={18} />
                    <Text style={styles.infoText}>{weatherData.temp} • {weatherData.condition}</Text>
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
                        options={DISTRICTS}
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

                    {/* Land Size Input with +/- Buttons */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>
                            {content[language].landSize} <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.landSizeContainer}>
                            <TextInput
                                style={styles.landSizeInput}
                                value={landSize}
                                onChangeText={(value) => handleNumericChange(setLandSize, value, true)}
                                placeholder="2.5"
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
                        
                        {/* Temperature */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{content[language].temperature}</Text>
                            <TextInput
                                style={[styles.input, styles.autoDetectedInput]}
                                value={temperature}
                                onChangeText={(value) => handleNumericChange(setTemperature, value, true)}
                                placeholder="Auto-filled"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="decimal-pad"
                                maxLength={5}
                            />
                        </View>

                        {/* Humidity */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{content[language].humidity}</Text>
                            <TextInput
                                style={[styles.input, styles.autoDetectedInput]}
                                value={humidity}
                                onChangeText={(value) => handleNumericChange(setHumidity, value, true)}
                                placeholder="Auto-filled"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="decimal-pad"
                                maxLength={5}
                            />
                        </View>

                        {/* Rainfall 30d */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{content[language].rainfall30d}</Text>
                            <TextInput
                                style={[styles.input, styles.autoDetectedInput]}
                                value={rainfall30d}
                                onChangeText={(value) => handleNumericChange(setRainfall30d, value, true)}
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
                                onChangeText={(value) => handleNumericChange(setSeasonalTemperature, value, true)}
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
                                onChangeText={(value) => handleNumericChange(setSeasonalHumidity, value, true)}
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
                                onChangeText={(value) => handleNumericChange(setRainfallSeasonal, value, true)}
                                placeholder="Auto-filled"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="decimal-pad"
                                maxLength={6}
                            />
                        </View>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.submitText}>{content[language].submit}</Text>
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
        color: "#000000",
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 13,
        color: "#000000",
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
        borderColor: "#10B981",
    },
});

export default YieldPredictionFormScreen;
