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
  Sparkles,
  MapPin,
  Plus,
  Minus,
} from "lucide-react-native";
import * as Location from "expo-location";
import { fetchWeatherByCoordinates } from "../../services/weatherApi";

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

const DISTRICTS = [
  "Anuradhapura",
  "Monaragala",
  "Badulla",
  "Ampara",
  "Dambulla",
  "Panadura",
  "Piliyandala",
  "Malabe",
  "Kaduwela",
];
const VARIETIES = [
  "Jet 999",
  "GT 709",
  "Pacific 808",
  "GT200",
  "Commando",
];
const RAINFALL_CONDITIONS = ["High", "Medium", "Low"];

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
};

const YieldPredictionOfficerFormScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute();
  const { language: initialLanguage } = route.params as { language: Language };

  const [language, setLanguage] = useState<Language>(initialLanguage);

  // Soil Profile
  const [district, setDistrict] = useState("");
  const [location, setLocation] = useState("");
  const [soilType, setSoilType] = useState("");
  const [soilPh, setSoilPh] = useState("");
  const [soilNitrogen, setSoilNitrogen] = useState("");
  const [soilPhosphorus, setSoilPhosphorus] = useState("");
  const [soilPotassium, setSoilPotassium] = useState("");
  const [organicMatter, setOrganicMatter] = useState("");

  // Climate Data
  const [seasonalRainfall, setSeasonalRainfall] = useState("");
  // Live weather data
  const [avgTemperature, setAvgTemperature] = useState("");
  const [humidity, setHumidity] = useState("");
  const [rainfall30d, setRainfall30d] = useState("");
  
  // Seasonal average data
  const [seasonalTemperature, setSeasonalTemperature] = useState("");
  const [seasonalHumidity, setSeasonalHumidity] = useState("");
  const [rainfallSeasonal, setRainfallSeasonal] = useState("");
  
  const [isLiveData, setIsLiveData] = useState(false);

  // Crop Information
  const [variety, setVariety] = useState("");
  const [plantingDate, setPlantingDate] = useState("");
  const [landSize, setLandSize] = useState("");

  // Dropdowns
  const [showDistrictPopup, setShowDistrictPopup] = useState(false);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [showSoilTypePopup, setShowSoilTypePopup] = useState(false);
  const [showVarietyPopup, setShowVarietyPopup] = useState(false);
  const [showRainfallPopup, setShowRainfallPopup] = useState(false);
  
  // Weather info
  const [weatherData, setWeatherData] = useState<{ temp: string; condition: string }>({ 
    temp: "N/A", 
    condition: "Weather unavailable" 
  });
  const [locationName, setLocationName] = useState("Location");
  
  // Get location options based on selected district
  const getLocationOptions = () => {
    if (!district || !LOCATION_COORDINATES[district]) return [];
    return Object.keys(LOCATION_COORDINATES[district]);
  };
  
  // Get soil type options based on selected location
  const getSoilTypeOptions = () => {
    if (!district || !location || !LOCATION_COORDINATES[district] || !LOCATION_COORDINATES[district][location]) {
      return [];
    }
    return LOCATION_COORDINATES[district][location].soilTypes;
  };
  
  // Auto-fill soil type when location changes
  React.useEffect(() => {
    if (location && district && LOCATION_COORDINATES[district] && LOCATION_COORDINATES[district][location]) {
      const soilTypes = LOCATION_COORDINATES[district][location].soilTypes;
      if (soilTypes.length > 0) {
        setSoilType(soilTypes[0]);
      }
    } else {
      setSoilType("");
    }
  }, [location, district]);

  const content = {
    si: {
      title: "අස්වැන්න පුරෝකථනය",
      subtitle: "කෘෂිකර්ම නිලධාරී",
      soilProfile: "පස් පැතිකඩ",
      climateData: "කාලගුණ දත්ත",
      cropInfo: "බෝග තොරතුරු",
      district: "දිස්ත්‍රික්කය",
      location: "ස්ථානය",
      soilType: "පස් වර්ගය",
      soilPh: "පස් pH",
      nitrogen: "නයිට්‍රජන් (ppm)",
      phosphorus: "පොස්පරස් (ppm)",
      potassium: "පොටෑසියම් (ppm)",
      organicMatter: "කාබනික ද්‍රව්‍ය (%)",
      seasonalRainfall: "වාර වර්ෂාපතනය",
      avgTemperature: "සාමාන්‍ය උෂ්ණත්වය (°C)",
      variety: "බීජ වර්ගය",
      plantingDate: "වගා කළ දිනය",
      landSize: "ඉඩම් ප්‍රමාණය (අක්කර)",
      autoFill: "ස්වයංක්‍රීය පිරවීම",
      humidity: "ආර්ද්‍රතාවය (%)",
      rainfall30d: "වර්ෂාපතනය 30d (mm)",
      seasonalTemperature: "වාර උෂ්ණත්වය (°C)",
      seasonalHumidity: "වාර ආර්ද්‍රතාවය (%)",
      rainfallSeasonal: "වාර වර්ෂාපතනය (mm)",
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
      location: "Location",
      soilType: "Soil Type",
      soilPh: "Soil pH",
      nitrogen: "Nitrogen (ppm)",
      phosphorus: "Phosphorus (ppm)",
      potassium: "Potassium (ppm)",
      organicMatter: "Organic Matter (%)",
      seasonalRainfall: "Seasonal Rainfall",
      avgTemperature: "Average Temperature (°C)",
      variety: "Seed Variety",
      plantingDate: "Planting Date",
      landSize: "Land Size (acres)",
      autoFill: "Auto Fill",
      humidity: "Humidity (%)",
      rainfall30d: "Rainfall 30d (mm)",
      seasonalTemperature: "Seasonal Temperature (°C)",
      seasonalHumidity: "Seasonal Humidity (%)",
      rainfallSeasonal: "Seasonal Rainfall (mm)",
      submit: "Get Prediction",
      back: "Back",
      select: "Select",
      cancel: "Cancel",
      adequate: "Adequate",
      deficit: "Deficit",
      excess: "Excess",
    },
  };
  
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
      setAvgTemperature(weather.temperature.toString());
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
          districtName.toLowerCase().includes(d.toLowerCase()) ||
          cityName.toLowerCase().includes(d.toLowerCase())
        );
        
        // Use matched district or default to Panadura for wet zone areas
        const targetDistrict = matchedDistrict || "Panadura";
        
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
          setDistrict(matchedDistrict);
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
  
  // Handle auto-fill button press
  const handleAutoFill = () => {
    Alert.alert(
      language === "si" ? "ස්ථානය සක්‍රිය කරන්න" : "Enable Location",
      language === "si" 
        ? "දිස්ත්‍රික්කය සහ කාලගුණ දත්ත ස්වයංක්‍රීයව පුරවීමට ස්ථානය සක්‍රිය කරන්න" 
        : "Enable location to auto-fill district and weather data",
      [
        {
          text: language === "si" ? "අවලංගු" : "Cancel",
          style: "cancel",
        },
        {
          text: language === "si" ? "සක්‍රිය කරන්න" : "Enable",
          onPress: requestLocationAndWeather,
        },
      ]
    );
  };
  
  // Land size increment/decrement
  const increaseLandSize = () => {
    const current = parseFloat(landSize) || 0;
    setLandSize((current + 0.1).toFixed(1));
  };

  const decreaseLandSize = () => {
    const current = parseFloat(landSize) || 0;
    if (current > 0.1) {
      setLandSize((current - 0.1).toFixed(1));
    }
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

export default YieldPredictionOfficerFormScreen;
