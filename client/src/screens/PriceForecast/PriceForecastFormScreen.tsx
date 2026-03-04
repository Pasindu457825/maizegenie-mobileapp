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
  Image,
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
import { useApp } from "../../context/AppContext";
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
// 🔥 NEW IMPORTS
import {
  saveFormData,
  getFormData,
  saveAutoData,
  getAutoData,
  saveLocationData,
  getLocationData,
  saveWeatherData,
  getWeatherData,
  savePriceData,
  getPriceData,
} from "../../utils/storage";
import useUniversalLocation from "../../utils/useUniversalLocation";
import { Platform } from "react-native";
import { useLanguage } from "../../context/LanguageContext";
import { useNotifications } from "../../context/NotificationContext";
import { Modal } from "react-native";
import { supabase } from "../../lib/supabase";

// 🔥 ADD THIS HERE (top of file, after imports)

const VARIETIES = [
  {
    name: "Commando",
    image: require("../../../assets/varieties/commando.png"),
  },
  { name: "GT200", image: require("../../../assets/varieties/gt200.png") },
  { name: "GT 709", image: require("../../../assets/varieties/gt709.png") },
  { name: "Jet 999", image: require("../../../assets/varieties/jet999.png") },
  {
    name: "Pacific 808",
    image: require("../../../assets/varieties/pacific808.png"),
  },
  {
    name: "Local Variety",
    image: require("../../../assets/varieties/Unknown.png"),
  },
];

const LOCATION_TRANSLATIONS = {
  Colombo: "කොළඹ",
  Gampaha: "ගම්පහ",
  Kandy: "මහනුවර",
  Matara: "මාතර",
  Hambantota: "හම්බන්තොට",
  Monaragala: "මොණරාගල",
  Anuradhapura: "අනුරාධපුර",
  Polonnaruwa: "පොලොන්නරුව",
  Jaffna: "යාපනය",
  Kurunegala: "කුරුණෑගල",
  Puttalam: "පුත්තලම",
  Badulla: "බදුල්ල",
  "Nuwara Eliya": "නුවර එලිය",
};

type Language = "si" | "en" | "ta";
type NavProp = StackNavigationProp<
  PriceForecastStackParamList,
  "PriceForecastFormScreen"
>;

type RootStackParamList = {
  PriceForecastFormScreen: undefined;
  WeatherForecastScreen: undefined;
  PriceAdvisorScreen: { formData: any } | undefined;
  Notifications: undefined;
};

// 🔥 Dynamic API URL using .env + Platform detection
const getApiUrl = () => {
  if (Platform.OS === "android") {
    // Real Android Device → Uses .env
    return process.env.EXPO_PUBLIC_API_BASE;
  } else if (Platform.OS === "ios") {
    // iOS simulator
    return "http://localhost:8000";
  } else {
    // Expo Web fallback
    return "http://localhost:8000";
  }
};

const API_URL = getApiUrl();

const PriceForecastFormScreen = () => {
  const { unreadCount } = useNotifications();
  type RootNavProp = StackNavigationProp<RootStackParamList>;
  const rootNavigation = useNavigation<RootNavProp>();
  const navigation = useNavigation<NavProp>();
  // 🌐 Get global language & convert to "si" | "en"
  const { language: globalLang, setLanguage: setAppLanguage } = useLanguage();
  const language: Language =
    globalLang === "sinhala" ? "si" : globalLang === "tamil" ? "ta" : "en";
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
  const [district, setDistrict] = useState(""); // User selection
  const [autoDistrict, setAutoDistrict] = useState(""); // GPS location (top display ONLY)

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
  // Dropdown state
  const [showDistrictPopup, setShowDistrictPopup] = useState(false);
  const { user } = useApp();

  // 🌍 District weekly weather (replaces GPS weather for ML model inputs)
  const [districtWeather, setDistrictWeather] = useState<{
    avg_temperature: number;
    avg_rainfall: number;
    source: string;
  } | null>(null);
  const [isLoadingDistrictWeather, setIsLoadingDistrictWeather] =
    useState(false);

  /**
   * Fetch ISO-week average temperature (°C) and rainfall (mm) for the given
   * district. Called whenever the user selects / changes a district.
   */
  const fetchDistrictWeatherData = async (
    selectedDistrict: string,
    yearVal: string,
    weekVal: string,
  ) => {
    const yearNum = parseInt(yearVal, 10);
    const weekNum = parseInt(weekVal, 10);
    if (
      !selectedDistrict ||
      !Number.isFinite(yearNum) ||
      !Number.isFinite(weekNum) ||
      weekNum < 1 ||
      weekNum > 53
    )
      return;

    setIsLoadingDistrictWeather(true);
    try {
      const url =
        `${API_URL}/api/price-forecast/district-weather` +
        `?district=${encodeURIComponent(selectedDistrict)}` +
        `&year=${yearNum}&week=${weekNum}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) {
        setDistrictWeather({
          avg_temperature: data.avg_temperature,
          avg_rainfall: data.avg_rainfall,
          source: data.source,
        });
        return;
      }
      throw new Error("success=false");
    } catch (err) {
      console.warn("Form fetchDistrictWeather failed:", err);
      // Seasonal fallback so cards always show a value
      const isMaha = weekNum >= 40 || weekNum <= 13;
      setDistrictWeather({
        avg_temperature: isMaha ? 26.5 : 28.5,
        avg_rainfall: isMaha ? 28.0 : 12.0,
        source: "fallback",
      });
    } finally {
      setIsLoadingDistrictWeather(false);
    }
  };

  // 🔥 NEW: Fetch PREVIOUS WEEK prices for the selected district based on form week number
  const fetchPricesByDistrict = async (
    selectedDistrict: string,
    selectedYear: string,
    selectedWeek: string,
  ) => {
    if (!selectedDistrict || !selectedYear || !selectedWeek) {
      // Clear prices if any required parameter is missing
      setFuelPrice("");
      setCornImportTax("");
      setFarmGatePrice("");
      return;
    }

    // Clear stale prices while fetching new ones
    setFuelPrice("");
    setCornImportTax("");
    setFarmGatePrice("");

    try {
      // Calculate previous week
      const currentWeek = parseInt(selectedWeek, 10);
      const currentYear = parseInt(selectedYear, 10);

      let prevWeek = currentWeek - 1;
      let prevYear = currentYear;

      // Handle edge case: if week = 1, previous week = 52 of previous year
      if (currentWeek === 1) {
        prevWeek = 52;
        prevYear = currentYear - 1;
      }

      console.log(
        `📅 Fetching previous week price: Year=${prevYear}, Week=${prevWeek}, District=${selectedDistrict}`,
      );

      // Query the SPECIFIC previous week price for the selected district
      const { data, error } = await supabase
        .from("maize_prices")
        .select("price, fuel_price, import_tax")
        .eq("district", selectedDistrict)
        .eq("year", prevYear)
        .eq("week", prevWeek)
        .single();

      if (error) {
        console.warn(
          `No price data found for ${selectedDistrict} on Year=${prevYear}, Week=${prevWeek}:`,
          error,
        );
        // Prices already cleared above; leave them as empty
        return;
      }

      if (data) {
        // Format and set the prices
        const fuelPriceFormatted =
          language === "si"
            ? `රු. ${data.fuel_price?.toFixed(2) || "0.00"}`
            : language === "ta"
              ? `Rs. ${data.fuel_price?.toFixed(2) || "0.00"}`
              : `Rs. ${data.fuel_price?.toFixed(2) || "0.00"}`;

        const farmGatePriceFormatted =
          language === "si"
            ? `රු. ${data.price?.toFixed(2) || "0.00"}/kg`
            : language === "ta"
              ? `Rs. ${data.price?.toFixed(2) || "0.00"}/kg`
              : `Rs. ${data.price?.toFixed(2) || "0.00"}/kg`;

        const taxFormatted = data.import_tax?.toFixed(2) || "0.00";

        setFuelPrice(fuelPriceFormatted);
        setCornImportTax(`${taxFormatted}%`);
        setFarmGatePrice(farmGatePriceFormatted);

        console.log(
          `✅ Loaded PREVIOUS WEEK prices for ${selectedDistrict} (Year=${prevYear}, Week=${prevWeek}):`,
          data,
        );
      }
    } catch (error) {
      console.error("Error fetching prices by district:", error);
      // Prices already cleared above; leave them as empty on error
    }
  };

  // 🔥 NEW: Auto-load PREVIOUS WEEK prices when district, year, or week changes
  useEffect(() => {
    if (district && year && week) {
      fetchPricesByDistrict(district, year, week);
    }
  }, [district, year, week, language]);

  // Re-fetch district weather whenever the selected district (or week) changes
  useEffect(() => {
    if (district && year && week) {
      setDistrictWeather(null); // clear stale value while fetching
      fetchDistrictWeatherData(district, year, week);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [district, year, week]);

  const isFarmer = user?.role === "farmer";
  const isOfficer = user?.role === "officer";
  // user.role = "FARMER" | "OFFICER"

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
      currentPrice: "පසුගිය සතියේ මිල",
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
      currentPrice: "Last week’s price",
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
    ta: {
      title: "சோள விலை மதிப்பீடு",
      subtitle: "தகவல்களை உள்ளிடவும்",
      autoData: "தானாக பதிவான தரவு",
      userInputs: "உங்கள் உள்ளீடுகள்",
      year: "ஆண்டு",
      week: "வாரம்",
      district: "மாவட்டம்",
      season: "பருவம்",
      weather: "வானிலை",
      fuelPrice: "எரிபொருள் விலை",
      importTax: "இறக்குமதி வரி",
      currentPrice: "கடந்த வாரத்தின் விலை",
      seedVariety: "விதை வகை",
      expectedYield: "எதிர்பார்க்கப்படும் மகசூல் (kg/ஏக்கர்)",
      farmArea: "பண்ணை பரப்பு (ஏக்கர்)",
      seedCost: "விதை செலவு (ரூ)",
      fertilizerCost: "உர செலவு (ரூ)",
      labourCost: "தொழிலாளர் செலவு (ரூ)",
      otherCosts: "மற்ற செலவுகள் (ரூ)",
      hasStorage: "உங்களுக்கு சேமிப்பு வசதி உள்ளதா?",
      yes: "ஆம்",
      no: "இல்லை",
      submit: "மதிப்பீடு பெறுக",
      back: "பின்செல்",
      detecting: "கண்டறிகிறது...",
      loading: "ஏற்றுகிறது...",
      locationDetecting: "இடம் கண்டறிகிறது...",
      weatherLoading: "வானிலை ஏற்றுகிறது...",
    },
  };
  type LocationKey = keyof typeof LOCATION_TRANSLATIONS;
  const getTranslatedLocation = (rawName: string | null, lang: Language) => {
    if (!rawName)
      return lang === "si" ? "ස්ථානය" : lang === "ta" ? "இடம்" : "Location";
    if (lang === "en") return rawName;

    let enName = rawName.trim();

    // Remove unwanted words
    enName = enName
      .replace(/District/i, "")
      .replace(/Province/i, "")
      .trim();

    if (lang === "ta") {
      // Tamil province mapping
      const taProvinceMap: Record<string, string> = {
        Western: "மேற்கு மாகாணம்",
        Southern: "தெற்கு மாகாணம்",
        Central: "மத்திய மாகாணம்",
        Northern: "வடக்கு மாகாணம்",
        Eastern: "கிழக்கு மாகாணம்",
        NorthWestern: "வடமேற்கு மாகாணம்",
        NorthCentral: "வட மத்திய மாகாணம்",
        Uva: "ஊவா மாகாணம்",
        Sabaragamuwa: "சபரகமுவ மாகாணம்",
      };
      if (taProvinceMap[enName]) return taProvinceMap[enName];

      // Tamil district mapping
      const taDistrictMap: Record<string, string> = {
        Colombo: "கொழும்பு",
        Gampaha: "கம்பஹா",
        Kalutara: "களுத்துறை",
        Kandy: "கண்டி",
        Matale: "மாத்தளை",
        NuwaraEliya: "நுவரெலியா",
        Galle: "காலி",
        Matara: "மாத்தறை",
        Hambantota: "அம்பாந்தோட்டை",
        Jaffna: "யாழ்ப்பாணம்",
        Kilinochchi: "கிளிநொச்சி",
        Mannar: "மன்னார்",
        Vavuniya: "வவுனியா",
        Mullaitivu: "முல்லைத்தீவு",
        Batticaloa: "மட்டக்களப்பு",
        Ampara: "அம்பாறை",
        Trincomalee: "திருகோணமலை",
        Kurunegala: "குருநாகல்",
        Puttalam: "புத்தளம்",
        Anuradhapura: "அனுராதாபுரம்",
        Polonnaruwa: "பொலன்னருவை",
        Badulla: "பதுளை",
        Monaragala: "மொணராகல",
        Thissamaharama: "திஸ்ஸமஹாராம",
        Ratnapura: "இரத்தினபுரி",
        Kegalle: "கேகாலை",
      };
      if (taDistrictMap[enName]) return taDistrictMap[enName];
      return rawName;
    }

    // Sinhala province mapping
    const provinceMap: Record<string, string> = {
      Western: "බස්නාහිර",
      Southern: "දකුණු",
      Central: "මධ්‍යම",
      Northern: "උතුරු",
      Eastern: "නැගෙනහිර",
      NorthWestern: "වයඹ",
      NorthCentral: "උතුරු මැද",
      Uva: "ඌව",
      Sabaragamuwa: "සබරගමුව",
    };

    if (provinceMap[enName]) return provinceMap[enName] + " පළාත";

    // Sinhala district mapping
    const districtMap: Record<string, string> = {
      Colombo: "කොළඹ",
      Gampaha: "ගම්පහ",
      Kalutara: "කළුතර",
      Kandy: "මහනුවර",
      Matale: "මාතලේ",
      NuwaraEliya: "නුවර එලිය",
      Galle: "ගාල්ල",
      Matara: "මාතර",
      Hambantota: "හම්බන්තොට",
      Jaffna: "යාපනය",
      Kilinochchi: "කිලිනොච්චි",
      Mannar: "මන්නාරම",
      Vavuniya: "වවුනියාව",
      Mullaitivu: "මුලතිව්",
      Batticaloa: "බතිකලාව",
      Ampara: "අම්පාර",
      Trincomalee: "ත්‍රිකුණාමලය",
      Kurunegala: "කුරුණෑගල",
      Puttalam: "පුත්තලම",
      Anuradhapura: "අනුරාධපුර",
      Polonnaruwa: "පොලොන්නරුව",
      Badulla: "බදුල්ල",
      Monaragala: "මොණරාගල",
      Thissamaharama: "තිස්සමහාරාමය",
      Ratnapura: "රත්නපුර",
      Kegalle: "කෑගල්ල",
    };

    if (districtMap[enName]) return districtMap[enName];

    // Fallback for towns/villages → Keep English
    return rawName;
  };

  // Enhanced weather translation mapping
  const getWeatherTranslation = (condition: string, lang: Language): string => {
    if (!condition)
      return lang === "si" ? "කාලගුණය" : lang === "ta" ? "வானிலை" : "Weather";

    const c = condition.toLowerCase();

    // ---- RAIN ----
    if (c.includes("shower rain") || c.includes("light intensity shower")) {
      return lang === "si"
        ? "සෙමෙන් වැසි"
        : lang === "ta"
          ? "இலகுவான மழை"
          : "Light Shower Rain";
    }
    if (c.includes("light rain")) {
      return lang === "si"
        ? "සැහැල්ලු වැසි"
        : lang === "ta"
          ? "சிறு மழை"
          : "Light Rain";
    }
    if (c.includes("moderate rain")) {
      return lang === "si"
        ? "මධ්‍යම වැසි"
        : lang === "ta"
          ? "மிதமான மழை"
          : "Moderate Rain";
    }
    if (c.includes("heavy") && c.includes("rain")) {
      return lang === "si" ? "බර වැසි" : lang === "ta" ? "கனமழை" : "Heavy Rain";
    }

    // ---- CLOUDS ----
    if (c.includes("clear")) {
      return lang === "si"
        ? "පිරිසිදු අහස"
        : lang === "ta"
          ? "தெளிவான வானம்"
          : "Clear Sky";
    }
    if (c.includes("few clouds")) {
      return lang === "si"
        ? "සුළු වලාකුළු"
        : lang === "ta"
          ? "சிறிய மேகங்கள்"
          : "Few Clouds";
    }
    if (c.includes("scattered")) {
      return lang === "si"
        ? "විසිරුණු වලාකුළු"
        : lang === "ta"
          ? "சிதறிய மேகங்கள்"
          : "Scattered Clouds";
    }
    if (c.includes("broken")) {
      return lang === "si"
        ? "කැබලි වලාකුළු"
        : lang === "ta"
          ? "உடைந்த மேகங்கள்"
          : "Broken Clouds";
    }
    if (c.includes("overcast")) {
      return lang === "si"
        ? "තද වලාකුළු"
        : lang === "ta"
          ? "மேகமூட்டம்"
          : "Overcast Clouds";
    }

    // ---- THUNDER ----
    if (c.includes("thunder")) {
      return lang === "si"
        ? "අකුණු සහිත වැසි"
        : lang === "ta"
          ? "இடியுடன் கூடிய மழை"
          : "Thunderstorm";
    }

    // ---- MIST / FOG ----
    if (c.includes("mist") || c.includes("fog") || c.includes("haze")) {
      return lang === "si" ? "මීදුම" : lang === "ta" ? "மூடுபனி" : "Mist";
    }

    // DEFAULT
    return lang === "si" ? "කාලගුණය" : lang === "ta" ? "வானிலை" : condition;
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

  useEffect(() => {
    loadSavedData();
  }, []);
  // Auto-save form data whenever user types
  useEffect(() => {
    if (
      seedVariety ||
      expectedYield ||
      farmArea ||
      seedCost ||
      fertilizerCost ||
      labourCost
    ) {
      saveFormData({
        district,
        seedVariety,
        expectedYield,
        farmArea,
        seedCost,
        fertilizerCost,
        labourCost,
        otherCosts,
        hasStorage,
      });
    }
  }, [
    seedVariety,
    expectedYield,
    farmArea,
    seedCost,
    fertilizerCost,
    labourCost,
    otherCosts,
    hasStorage,
  ]);

  const [isLoadingSavedData, setIsLoadingSavedData] = useState(true);

  const loadSavedData = async () => {
    setIsLoadingSavedData(true);
    try {
      const savedForm = await getFormData();
      const savedAuto = await getAutoData();
      const savedPrice = await getPriceData();

      if (savedForm) {
        setDistrict(savedForm.district || "");
        setSeedVariety(savedForm.seedVariety || "");
        setExpectedYield(savedForm.expectedYield || "");
        setFarmArea(savedForm.farmArea || "");
        setSeedCost(savedForm.seedCost || "");
        setFertilizerCost(savedForm.fertilizerCost || "");
        setLabourCost(savedForm.labourCost || "");
        setOtherCosts(savedForm.otherCosts || "");
        setHasStorage(savedForm.hasStorage || false);
      }

      if (savedAuto) {
        setYear(savedAuto.year);
        setWeek(savedAuto.week);
        setSeason(savedAuto.season);
      }

      // Only load saved prices if we have a saved district
      // This prevents stale data from a previous form session showing up
      if (savedPrice && savedForm && savedForm.district) {
        setFuelPrice(savedPrice.fuelPrice);
        setCornImportTax(savedPrice.cornImportTax);
        setFarmGatePrice(savedPrice.farmGatePrice);
      }
    } catch (error) {
      console.log("Load saved failed:", error);
    } finally {
      setIsLoadingSavedData(false);
    }
  };

  // � REMOVED: Global price fetching is no longer needed
  // All prices are now district-specific and managed through the maize_prices table
  // This is called by the admin panel during price entry

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
      await saveAutoData({
        year: currentYear,
        week: weekNumber,
        season: currentSeason,
      });

      // � Global price fetching removed - prices are now district-specific
    } catch (error) {
      console.error("Error capturing system data:", error);
      Alert.alert(
        language === "si" ? "දෝෂයකි" : language === "ta" ? "பிழை" : "Error",
        language === "si"
          ? "දත්ත ලබා ගැනීමේදී දෝෂයක් සිදුවිය"
          : language === "ta"
            ? "தரவு பெறுவதில் பிழை ஏற்பட்டது"
            : "Error capturing data",
      );
    }
  };

  useEffect(() => {
    // GPS LOCATION → ONLY UPDATE autoDistrict
    if (isLoading) {
      setAutoDistrict(
        language === "si"
          ? "හඳුනාගනිමින්..."
          : language === "ta"
            ? "கண்டறிகிறது..."
            : "Detecting...",
      );
    } else if (locationName && locationName !== "Loading...") {
      setAutoDistrict(locationName);
    } else {
      setAutoDistrict(
        language === "si"
          ? "ස්ථානය නොමැත"
          : language === "ta"
            ? "இடம் கிடைக்கவில்லை"
            : "Location unavailable",
      );
    }

    // WEATHER
    if (isLoading) {
      setWeather(content[language].weatherLoading);
    } else if (temperature !== null && weatherCondition) {
      const translatedCondition = getWeatherTranslation(
        weatherCondition,
        language,
      );
      setWeather(`${Math.round(temperature)}°C • ${translatedCondition}`);
    } else {
      setWeather(
        language === "si"
          ? "කාලගුණ දත්ත නොමැත"
          : language === "ta"
            ? "வானிலை கிடைக்கவில்லை"
            : "Weather unavailable",
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
      return language === "si"
        ? "මහ කන්නය"
        : language === "ta"
          ? "மஹா பருவம்"
          : "Maha Season";
    } else {
      return language === "si"
        ? "යල කන්නය"
        : language === "ta"
          ? "யால பருவம்"
          : "Yala Season";
    }
  };
  // 🔄 Removed: useFocusEffect that called fetchPriceDataFromAPI()
  // Global price data is no longer fetched on screen focus
  useEffect(() => {
    const now = new Date();
    const updatedSeason = determineSeason(now);
    setSeason(updatedSeason);
  }, [language]);

  // Add console.logs to see what's being saved
  /* useEffect(() => {
    if (
      seedVariety ||
      expectedYield ||
      farmArea ||
      seedCost ||
      fertilizerCost ||
      labourCost
    ) {
      console.log("💾 Saving form data:", {
        seedVariety,
        expectedYield,
        farmArea,
        seedCost,
        fertilizerCost,
        labourCost,
        otherCosts,
        hasStorage,
      });

      saveFormData({
        seedVariety,
        expectedYield,
        farmArea,
        seedCost,
        fertilizerCost,
        labourCost,
        otherCosts,
        hasStorage,
      });
    }
  }, [
    seedVariety,
    expectedYield,
    farmArea,
    seedCost,
    fertilizerCost,
    labourCost,
    otherCosts,
    hasStorage,
  ]);*/

  const handleSubmit = async () => {
    try {
      // Validation
      if (
        !district ||
        !seedVariety ||
        !expectedYield ||
        !farmArea ||
        !seedCost ||
        !fertilizerCost ||
        !labourCost
      ) {
        Alert.alert(
          language === "si" ? "දෝෂයකි" : language === "ta" ? "பிழை" : "Error",
          language === "si"
            ? "කරුණාකර සියලු අනිවාර්ය තොරතුරු පුරවන්න"
            : language === "ta"
              ? "அனைத்து தேவையான தகவல்களையும் நிரப்பவும்"
              : "Please fill all required fields",
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

      // Save Form Data Locally 🔥
      await saveFormData({
        seedVariety,
        expectedYield,
        farmArea,
        seedCost,
        fertilizerCost,
        labourCost,
        otherCosts,
        hasStorage,
      });

      // Prepare forecast data
      const forecastData = {
        year,
        week,
        district,
        season,
        weather,
        fuelPrice,
        cornImportTax,
        farmGatePrice,
        isFestivalWeek,
        seedVariety,
        expectedYield: parseFloat(expectedYield),
        farmArea: parseFloat(farmArea),
        totalCost,
        productionCostPerKg,
        hasStorage,
        language,
      };

      // Navigate to next page
      if (isOfficer) {
        navigation.navigate("OfficerPriceForecastScreen", {
          data: forecastData,
        });
      } else {
        navigation.navigate("PriceForecastScreen", {
          data: forecastData,
        });
      }
    } catch (error) {
      console.log("Submit Error:", error);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const fetchFestivalWeek = async () => {
    try {
      const today = new Date();
      const year = today.getFullYear();

      // Calendarific – supported holiday types: national, local, religious, observance
      const calendarificUrl =
        `https://calendarific.com/api/v2/holidays?api_key=0TTNl4fXIobqjfegCz7yHxHEEo57WOi3` +
        `&country=LK&year=${year}&type=national`;

      let holidayDates: Date[] = [];

      // Force a JSON response and check status
      try {
        const holidaysRes = await fetch(calendarificUrl, {
          headers: { Accept: "application/json" },
        });
        if (holidaysRes.ok) {
          const json = await holidaysRes.json();
          const holidays = json?.response?.holidays || [];
          holidayDates = holidays.map((h: any) => new Date(h.date.iso));
        } else {
          console.warn(
            `Calendarific responded with status ${holidaysRes.status}`,
          );
        }
      } catch (calendarErr) {
        console.warn("Calendarific fetch failed:", calendarErr);
      }

      // fallback – use Nager.Date API if Calendarific fails
      if (holidayDates.length === 0) {
        try {
          const fallback = await fetch(
            `https://date.nager.at/api/v3/PublicHolidays/${year}/LK`,
          );
          if (fallback.ok) {
            const nagerHolidays = await fallback.json();
            holidayDates = nagerHolidays.map((h: any) => new Date(h.date));
          } else {
            console.warn(`Nager API responded with status ${fallback.status}`);
          }
        } catch (nagerErr) {
          console.warn("Nager API fetch failed:", nagerErr);
        }
      }

      // Mark as festival week if within ±3 days of any holiday
      let festival = false;
      holidayDates.forEach((date) => {
        const diffDays =
          Math.abs(today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays <= 3) festival = true;
      });
      setIsFestivalWeek(festival);
    } catch (err) {
      console.warn("Festival week detect error:", err);
      setIsFestivalWeek(false);
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
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => rootNavigation.navigate("Notifications")}
          >
            <Bell color="#10B981" size={20} />

            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Enhanced Sub-header with better styling */}
      <View style={styles.subHeader}>
        <View style={styles.infoCard}>
          {getWeatherIcon(weatherCondition)}

          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>
              {language === "si"
                ? "ස්ථානය"
                : language === "ta"
                  ? "இடம்"
                  : "Location"}
            </Text>
            <Text style={styles.infoValue}>
              {getTranslatedLocation(autoDistrict, language)}
            </Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoCard}>
          <CloudSun color="#10B981" size={18} />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>
              {language === "si"
                ? "කාලගුණය"
                : language === "ta"
                  ? "வானிலை"
                  : "Weather"}
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

            {/* Only show price fields after district is selected */}
            {district ? (
              <>
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
              </>
            ) : (
              <View style={[styles.autoDataCard, { opacity: 0.6 }]}>
                <Text style={styles.autoDataLabel}>
                  {language === "si"
                    ? "දැනට පිරිවිතුරු දත්ත අදහස් නොකරයි"
                    : language === "ta"
                      ? "பொறுத்தமான விலை தரவு இல்லை"
                      : "No price data yet"}
                </Text>
              </View>
            )}

            <View style={styles.autoDataCard}>
              <View style={styles.cardIconContainer}>
                <Calendar color="#10B981" size={22} />
              </View>
              <Text style={styles.autoDataLabel}>
                {language === "si"
                  ? "උත්සව සතිය"
                  : language === "ta"
                    ? "பண்டிகை வாரம்"
                    : "Festival Week"}
              </Text>
              <Text style={styles.autoDataValue}>
                {isFestivalWeek
                  ? language === "si"
                    ? "ඔව්"
                    : language === "ta"
                      ? "ஆம்"
                      : "Yes"
                  : language === "si"
                    ? "නැත"
                    : language === "ta"
                      ? "இல்லை"
                      : "No"}
              </Text>
            </View>

            {/* ─── District-level weekly weather ─────────────────────────── */}
            {/* These values replace GPS weather as ML model inputs.           */}
            {district ? (
              isLoadingDistrictWeather ? (
                <View style={[styles.autoDataCard, { opacity: 0.7 }]}>
                  <Text style={styles.autoDataLabel}>
                    {language === "si"
                      ? "කාලගුණ පූරණය..."
                      : language === "ta"
                        ? "வானிலை ஏற்றுகிறது..."
                        : "Loading weather..."}
                  </Text>
                </View>
              ) : districtWeather ? (
                <>
                  <View style={styles.autoDataCard}>
                    <View style={styles.cardIconContainer}>
                      <Droplets color="#0284c7" size={22} />
                    </View>
                    <Text style={styles.autoDataLabel}>
                      {language === "si"
                        ? "සාමාන්. වර්ෂාව (mm)"
                        : language === "ta"
                          ? "சராசரி மழை (mm)"
                          : "Avg. Rainfall (mm)"}
                    </Text>
                    <Text style={styles.autoDataValue}>
                      {districtWeather.avg_rainfall.toFixed(1)}
                    </Text>
                  </View>
                  <View style={styles.autoDataCard}>
                    <View style={styles.cardIconContainer}>
                      <Sun color="#f59e0b" size={22} />
                    </View>
                    <Text style={styles.autoDataLabel}>
                      {language === "si"
                        ? "සාමාන්. තාපය (°C)"
                        : language === "ta"
                          ? "சராசரி வெப்பம் (°C)"
                          : "Avg. Temp (°C)"}
                    </Text>
                    <Text style={styles.autoDataValue}>
                      {districtWeather.avg_temperature.toFixed(1)}
                    </Text>
                  </View>
                </>
              ) : null
            ) : null}
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
                {district ||
                  (language === "si"
                    ? "තෝරන්න"
                    : language === "ta"
                      ? "தேர்ந்தெடுக்கவும்"
                      : "Select")}
              </Text>
            </TouchableOpacity>
          </View>

          <Modal
            visible={showDistrictPopup}
            transparent
            animationType="fade"
            onRequestClose={() => setShowDistrictPopup(false)}
          >
            <View style={styles.popupContainer}>
              <View style={styles.popupBox}>
                <ScrollView>
                  {["Anuradhapura", "Monaragala", "Tissamaharama"].map((d) => (
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
                    {language === "si"
                      ? "අවලංගු"
                      : language === "ta"
                        ? "ரத்து செய்"
                        : "Cancel"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{content[language].seedVariety} *</Text>

            <View style={styles.varietyGrid}>
              {VARIETIES.map((item) => {
                const selected = seedVariety === item.name;

                return (
                  <TouchableOpacity
                    key={item.name}
                    style={[
                      styles.varietyCard,
                      selected && styles.varietyCardSelected,
                    ]}
                    onPress={() => setSeedVariety(item.name)}
                  >
                    <Image source={item.image} style={styles.varietyImage} />
                    <Text
                      style={[
                        styles.varietyText,
                        selected && styles.varietyTextSelected,
                      ]}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
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
  popupContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  popupBox: {
    backgroundColor: "#fff",
    width: "80%",
    maxHeight: "60%",
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: "#D1FAE5",
  },

  popupItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  popupText: {
    fontSize: 16,
    color: "#047857",
  },

  popupCancel: {
    marginTop: 10,
    paddingVertical: 12,
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
  },

  popupCancelText: {
    textAlign: "center",
    color: "#B91C1C",
    fontWeight: "bold",
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1FAE5",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  varietyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  varietyCard: {
    width: "30%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 10,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },

  varietyCardSelected: {
    borderColor: "#10B981",
    backgroundColor: "#ECFDF5",
  },

  varietyImage: {
    width: 70,
    height: 70,
    resizeMode: "contain",
    marginBottom: 8,
  },

  varietyText: {
    fontSize: 13,
    color: "#374151",
    textAlign: "center",
    fontWeight: "600",
  },

  varietyTextSelected: {
    color: "#047857",
    fontWeight: "bold",
  },
});

export default PriceForecastFormScreen;
