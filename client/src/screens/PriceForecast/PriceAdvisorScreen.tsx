import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import {
  ArrowLeft,
  CloudRain,
  Thermometer,
  Wind,
  Droplets,
} from "lucide-react-native";
import axios from "axios";
import useUniversalLocation from "../../utils/useUniversalLocation";

// Sinhala Location Translation Maps
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
  Ratnapura: "රත්නපුර",
  Kegalle: "කෑගල්ල",
};

// ------ NEW: Variety list + default durations (dummy values for now) ------
const VARIETY_OPTIONS = [
  "Jet 999",
  "808",
  "GT 709",
  "Pacific 998",
  "Goldstar",
  "Bisco Hybrid",
  "Unknown",
];

const VARIETY_DURATION_WEEKS: Record<string, number> = {
  "Jet 999": 13, // ~90 days
  "808": 16, // ~110 days
  "GT 709": 14,
  "Pacific 998": 15,
  Goldstar: 14,
  "Bisco Hybrid": 15,
  Unknown: 14,
};

// API Configuration
const API_BASE_URL = "http://192.168.8.181:8000";

interface WeatherRecommendation {
  success: boolean;
  condition: string;
  confidence: number;
  weather_data: {
    temperature: number;
    rainfall: number;
    windspeed: number;
  };
  recommendation: {
    status: string;
    action: string;
    irrigation: string;
    fertilizer: string;
    activities: string[];
    risk_level: string;
    color: string;
  };
}

const translateLocation = (raw: string | null, lang: "si" | "en") => {
  if (!raw) return lang === "si" ? "ස්ථානය" : "Location";
  if (lang === "en") return raw;

  let name = raw
    .replace(/District/i, "")
    .replace(/Province/i, "")
    .trim();

  if (provinceMap[name]) return provinceMap[name] + " පළාත";
  if (districtMap[name]) return districtMap[name];

  return raw;
};

const PriceAdvisorScreen = ({ route, navigation }: any) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [plantingDate, setPlantingDate] = useState(new Date());

  const formData = route?.params?.formData || {};

  const [language, setLanguage] = useState<"si" | "en">("si");

  const {
    locationName,
    latitude,
    longitude,
    temperature: currentTemp,
    weatherCondition: currentCondition,
    weatherIcon,
    isLoading: locLoading,
  } = useUniversalLocation(language);
  console.log("GPS DEBUG →", {
    locationName,
    latitude,
    longitude,
    locLoading,
  });

  const [loading, setLoading] = useState(true);
  const [weatherRec, setWeatherRec] = useState<WeatherRecommendation | null>(
    null
  );

  // --------------------------
  // PRICE FORECAST DATA (dummy for now)
  // --------------------------
  const dummyPriceWeeks = [
    { week: 1, price: 32 },
    { week: 2, price: 36 },
    { week: 3, price: 41 },
    { week: 4, price: 45 },
    { week: 5, price: 47 },
    { week: 6, price: 52 },
  ];

  // ----------------------
  // USER INPUT FORM STATES (NEW)
  // ----------------------
  const [plantingDateStr, setPlantingDateStr] = useState<string>(
    formData.plantingDate || ""
  );
  const [selectedVariety, setSelectedVariety] = useState<string>(
    formData.variety || "Jet 999"
  );
  const [durationWeeks, setDurationWeeks] = useState<string>(
    String(
      formData.cropDuration ||
        VARIETY_DURATION_WEEKS[formData.variety || "Jet 999"] ||
        14
    )
  );
  const [yieldKgInput, setYieldKgInput] = useState<string>(
    formData.yieldKg ? String(formData.yieldKg) : "1500"
  );
  const [costInput, setCostInput] = useState<string>(
    formData.cost ? String(formData.cost) : "45000"
  );
  const [showVarietyDropdown, setShowVarietyDropdown] = useState(false);

  // Auto-update duration when variety changes (can still override manually)
  useEffect(() => {
    const vWeeks = VARIETY_DURATION_WEEKS[selectedVariety];
    if (vWeeks) {
      setDurationWeeks(String(vWeeks));
    }
  }, [selectedVariety]);

  // ----------------------
  // REAL WEATHER (GPS)
  // ----------------------
  const fetchRealWeather = async (lat: number, lon: number) => {
    try {
      const res = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,rain&hourly=temperature_2m,rain,windspeed_10m&timezone=auto`
      );

      const current = res.data.current || {};
      const hourly = res.data.hourly || {};

      // Find correct hour index
      const nowISO = current.time;
      const index = hourly.time.indexOf(nowISO);

      return {
        temperature:
          current.temperature_2m ?? hourly.temperature_2m?.[index] ?? 0,
        temperature_max: Math.max(
          ...(hourly.temperature_2m || [current.temperature_2m])
        ),
        temperature_min: Math.min(
          ...(hourly.temperature_2m || [current.temperature_2m])
        ),
        rainfall: current.rain ?? hourly.rain?.[index] ?? 0,
        windspeed: current.wind_speed_10m ?? hourly.windspeed_10m?.[index] ?? 0,
        radiation: hourly.shortwave_radiation?.[index] ?? 200,
      };
    } catch (e) {
      console.log("Real weather error:", e);
      return null;
    }
  };

  const lat = Number(latitude ?? 0);
  const lon = Number(longitude ?? 0);

  // -------------------------------------
  // Weather Advisor Loader (unchanged)
  // -------------------------------------
  const loadRealWeatherAdvisor = async () => {
    setLoading(true);

    try {
      if (isNaN(lat) || isNaN(lon) || lat === 0 || lon === 0) {
        console.log("GPS still invalid →", { lat, lon });
        setLoading(false);
        return;
      }

      const safeLat = latitude ?? 0;
      const safeLon = longitude ?? 0;

      const w = await fetchRealWeather(Number(safeLat), Number(safeLon));

      if (!w) {
        Alert.alert("Weather Error", "Could not get GPS weather.");
        setLoading(false);
        return;
      }

      const payload = {
        temperature: Number(w.temperature ?? 0),
        temperature_max: Number(w.temperature_max ?? w.temperature ?? 0),
        temperature_min: Number(w.temperature_min ?? w.temperature ?? 0),
        rainfall: Number(w.rainfall ?? 0),
        windspeed: Number(w.windspeed ?? 0),
        radiation: Number(w.radiation ?? 200),
        language,
      };

      console.log("PAYLOAD →", payload);

      const response = await axios.post(
        `${API_BASE_URL}/api/weather/recommend`,
        payload
      );

      setWeatherRec(response.data);
    } catch (err) {
      console.log("Advisor error:", err);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------
  // useEffect – load advisor once GPS ready
  // -------------------------------------
  useEffect(() => {
    if (locLoading) return; // GPS still detecting

    console.log("GPS CHECK →", { lat, lon });

    if (!isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0) {
      loadRealWeatherAdvisor();
    } else {
      console.log("⛔ GPS NOT READY YET");
    }
  }, [locLoading, latitude, longitude, language]);

  // -------------------------------------
  // PRICE CALCULATIONS – now using FORM values
  // -------------------------------------
  // planting date parsing
  const safePlantingDate =
    plantingDateStr && !isNaN(Date.parse(plantingDateStr))
      ? new Date(plantingDateStr)
      : formData.plantingDate
      ? new Date(formData.plantingDate)
      : new Date();

  const plantingWeek = formData.plantingWeek || 1;

  const cropDurationWeeks =
    parseInt(durationWeeks, 10) ||
    formData.cropDuration ||
    VARIETY_DURATION_WEEKS[selectedVariety] ||
    14;

  const yieldKg =
    parseFloat(yieldKgInput.replace(",", ".")) ||
    parseFloat(formData.yieldKg) ||
    1500;

  const cost =
    parseFloat(costInput.replace(",", ".")) ||
    parseFloat(formData.cost) ||
    45000;

  const harvestDate = new Date(safePlantingDate);
  harvestDate.setDate(harvestDate.getDate() + cropDurationWeeks * 7);

  const harvestWeek = plantingWeek + cropDurationWeeks;

  const forecast =
    dummyPriceWeeks[Math.min(harvestWeek - 1, dummyPriceWeeks.length - 1)] ||
    dummyPriceWeeks[0];

  const expectedPrice = forecast.price;
  const totalRevenue = yieldKg * expectedPrice;
  const profit = totalRevenue - cost;

  let profitColor = "#DC2626";
  if (profit > 50000) profitColor = "#16A34A";
  else if (profit > 0) profitColor = "#EAB308";

  // --------------------------
  // LANGUAGE TEXT
  // --------------------------
  const L = {
    si: {
      title: "🌽 වගා උපදෙස්",
      loading: "කරුණාකර රැඳී සිටින්න...",
      weatherCondition: "කාලගුණ තත්වය",
      confidence: "විශ්වාසනීයත්වය",
      currentWeather: "වත්මන් කාලගුණය",
      temperature: "උෂ්ණත්වය",
      rainfall: "වර්ෂාපතනය",
      windspeed: "සුළං වේගය",
      recommendation: "නිර්දේශ",
      action: "ක්‍රියාමාර්ගය",
      irrigation: "වාරිමාර්ග",
      fertilizer: "පොහොර",
      activities: "කටයුතු",
      riskLevel: "අවදානම් මට්ටම",
      plantingDate: "බීජ පැල කිරීමේ දිනය",
      harvestDate: "අස්වැන්න දිනය",
      harvestWeek: "අස්වැන්න සතිය",
      expectedPrice: "අපේක්ෂිත මිල",
      profit: "ලාභය",
      goBack: "ආපසු යන්න",
      cultivationInputs: "වගා තොරතුරු",
      variety: "බීජ වර්ගය",
      duration: "වගා කාලය (සති)",
      yieldKgLabel: "අපේක්ෂිත අස්වැන්න (kg)",
      costLabel: "සම්පූර්ණ වියදම (රු.)",
      updatePrediction: "අනාවැකි යාවත්කාලීන කරන්න",
    },
    en: {
      title: "🌽 Cultivation Advisor",
      loading: "Please wait...",
      weatherCondition: "Weather Condition",
      confidence: "Confidence",
      currentWeather: "Current Weather",
      temperature: "Temperature",
      rainfall: "Rainfall",
      windspeed: "Wind Speed",
      recommendation: "Recommendations",
      action: "Action",
      irrigation: "Irrigation",
      fertilizer: "Fertilizer",
      activities: "Activities",
      riskLevel: "Risk Level",
      plantingDate: "Planting Date",
      harvestDate: "Expected Harvest Date",
      harvestWeek: "Harvest Week",
      expectedPrice: "Expected Price",
      profit: "Expected Profit",
      goBack: "Go Back",
      cultivationInputs: "Cultivation Inputs",
      variety: "Variety",
      duration: "Crop Duration (weeks)",
      yieldKgLabel: "Expected Yield (kg)",
      costLabel: "Total Cost (Rs.)",
      updatePrediction: "Update Prediction",
    },
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>{L[language].loading}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={26} color="#065F46" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{L[language].title}</Text>

        <TouchableOpacity
          style={styles.langSwitch}
          onPress={() => setLanguage(language === "si" ? "en" : "si")}
        >
          <Text style={styles.langText}>
            {language === "si" ? "EN" : "සිං"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Location & Real Weather */}
      <View style={{ marginBottom: 15 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold", color: "#065F46" }}>
          📍 {translateLocation(locationName, language)}
        </Text>

        <Text style={{ color: "#047857", marginTop: 4 }}>
          {weatherRec ? `${weatherRec.weather_data.temperature}°C` : "..."} |
          Open-Meteo
        </Text>
      </View>

      {/* Weather Alert Card */}
      {weatherRec && (
        <View
          style={[
            styles.alertCard,
            { borderLeftColor: weatherRec.recommendation.color },
          ]}
        >
          <Text
            style={[
              styles.alertTitle,
              { color: weatherRec.recommendation.color },
            ]}
          >
            {weatherRec.recommendation.status}
          </Text>
          <Text style={styles.alertSubtext}>
            {L[language].confidence}: {weatherRec.confidence}%
          </Text>
        </View>
      )}

      {/* Current Weather Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{L[language].currentWeather} 🌤️</Text>

        <View style={styles.weatherRow}>
          <View style={styles.weatherItem}>
            <Thermometer size={20} color="#EF4444" />
            <Text style={styles.weatherLabel}>{L[language].temperature}</Text>
            <Text style={styles.weatherValue}>
              {weatherRec?.weather_data.temperature}°C
            </Text>
          </View>

          <View style={styles.weatherItem}>
            <CloudRain size={20} color="#3B82F6" />
            <Text style={styles.weatherLabel}>{L[language].rainfall}</Text>
            <Text style={styles.weatherValue}>
              {weatherRec?.weather_data.rainfall}mm
            </Text>
          </View>

          <View style={styles.weatherItem}>
            <Wind size={20} color="#6B7280" />
            <Text style={styles.weatherLabel}>{L[language].windspeed}</Text>
            <Text style={styles.weatherValue}>
              {weatherRec?.weather_data.windspeed}km/h
            </Text>
          </View>
        </View>
      </View>

      {/* Recommendations */}
      {weatherRec && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{L[language].recommendation} 📋</Text>

          <View style={styles.recItem}>
            <Text style={styles.recLabel}>{L[language].action}:</Text>
            <Text style={styles.recValue}>
              {weatherRec.recommendation.action}
            </Text>
          </View>

          <View style={styles.recItem}>
            <Text style={styles.recLabel}>{L[language].irrigation}:</Text>
            <Text style={styles.recValue}>
              {weatherRec.recommendation.irrigation}
            </Text>
          </View>

          <View style={styles.recItem}>
            <Text style={styles.recLabel}>{L[language].fertilizer}:</Text>
            <Text style={styles.recValue}>
              {weatherRec.recommendation.fertilizer}
            </Text>
          </View>

          <View style={styles.recItem}>
            <Text style={styles.recLabel}>{L[language].riskLevel}:</Text>
            <Text
              style={[
                styles.recValue,
                { color: weatherRec.recommendation.color },
              ]}
            >
              {weatherRec.recommendation.risk_level}
            </Text>
          </View>
        </View>
      )}

      {/* Activities */}
      {weatherRec && weatherRec.recommendation.activities && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{L[language].activities} ✅</Text>
          {weatherRec.recommendation.activities.map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <Text style={styles.activityText}>{activity}</Text>
            </View>
          ))}
        </View>
      )}

      {/* 🚜 NEW: Cultivation Inputs Form */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{L[language].cultivationInputs}</Text>

        {/* Planting Date */}
        <Text style={styles.label}>{L[language].plantingDate}</Text>
        <TextInput
          style={styles.input}
          value={plantingDateStr}
          onChangeText={setPlantingDateStr}
          placeholder={language === "si" ? "YYYY-MM-DD" : "YYYY-MM-DD"}
          placeholderTextColor="#9CA3AF"
        />

        {/* Variety Dropdown */}
        <Text style={styles.label}>{L[language].variety}</Text>
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={styles.dropdownSelected}
            onPress={() => setShowVarietyDropdown(!showVarietyDropdown)}
          >
            <Text style={styles.dropdownSelectedText}>{selectedVariety}</Text>
          </TouchableOpacity>
          {showVarietyDropdown && (
            <View style={styles.dropdownList}>
              {VARIETY_OPTIONS.map((v) => (
                <TouchableOpacity
                  key={v}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedVariety(v);
                    setShowVarietyDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Duration */}
        <Text style={styles.label}>{L[language].duration}</Text>
        <TextInput
          style={styles.input}
          value={durationWeeks}
          onChangeText={setDurationWeeks}
          keyboardType="numeric"
          placeholder={language === "si" ? "සති ගණන" : "Number of weeks"}
          placeholderTextColor="#9CA3AF"
        />

        {/* Expected Yield */}
        <Text style={styles.label}>{L[language].yieldKgLabel}</Text>
        <TextInput
          style={styles.input}
          value={yieldKgInput}
          onChangeText={setYieldKgInput}
          keyboardType="numeric"
          placeholder={language === "si" ? "kg වලින්" : "in kg"}
          placeholderTextColor="#9CA3AF"
        />

        {/* Cost */}
        <Text style={styles.label}>{L[language].costLabel}</Text>
        <TextInput
          style={styles.input}
          value={costInput}
          onChangeText={setCostInput}
          keyboardType="numeric"
          placeholder={language === "si" ? "රු." : "Rs."}
          placeholderTextColor="#9CA3AF"
        />

        {/* Update Button (for UX – logic already reactive) */}
        <TouchableOpacity
          style={styles.updateBtn}
          onPress={() => {
            Alert.alert(
              language === "si" ? "යාවත්කාලීන විය" : "Updated",
              language === "si"
                ? "අනාවැකි ගණනය කරන්නේ යාවත්කාලීන වගා තොරතුරු මතයි."
                : "Predictions are now based on your updated cultivation inputs."
            );
          }}
        >
          <Text style={styles.updateBtnText}>
            {L[language].updatePrediction}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Price Forecast */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💰 {L[language].profit}</Text>

        <Text style={styles.label}>
          {L[language].plantingDate}: {safePlantingDate.toLocaleDateString()}
        </Text>
        <Text style={styles.label}>
          {L[language].harvestDate}: {harvestDate.toLocaleDateString()}
        </Text>
        <Text style={styles.label}>
          {L[language].harvestWeek}: {harvestWeek}
        </Text>

        <Text style={styles.label}>
          {L[language].expectedPrice}: Rs. {expectedPrice}/kg
        </Text>
        <Text style={[styles.profitText, { color: profitColor }]}>
          {L[language].profit}: Rs. {profit.toLocaleString()}
        </Text>
      </View>

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backBtnText}>{L[language].goBack}</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

// ------------------------
// STYLES
// ------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ECFDF5",
    padding: 20,
  },

  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#065F46",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },

  backIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#065F46",
  },

  langSwitch: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#10B981",
  },

  langText: {
    color: "#10B981",
    fontWeight: "bold",
  },

  alertCard: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 16,
    borderLeftWidth: 6,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },

  alertTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },

  alertSubtext: {
    fontSize: 14,
    color: "#6B7280",
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 2,
    borderColor: "#D1FAE5",
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#065F46",
    marginBottom: 14,
  },

  weatherRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },

  weatherItem: {
    alignItems: "center",
  },

  weatherLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 6,
  },

  weatherValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#065F46",
    marginTop: 4,
  },

  recItem: {
    marginBottom: 12,
  },

  recLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#065F46",
    marginBottom: 4,
  },

  recValue: {
    fontSize: 14,
    color: "#374151",
  },

  activityItem: {
    backgroundColor: "#F0FDF4",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#10B981",
  },

  activityText: {
    fontSize: 14,
    color: "#065F46",
  },

  label: {
    fontSize: 15,
    color: "#065F46",
    marginBottom: 8,
    fontWeight: "500",
  },

  profitText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },

  backBtn: {
    backgroundColor: "#10B981",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },

  backBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },

  // NEW styles for form + dropdown
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    fontSize: 14,
    color: "#111827",
  },

  dropdownContainer: {
    marginBottom: 10,
  },

  dropdownSelected: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  dropdownSelectedText: {
    fontSize: 14,
    color: "#111827",
  },

  dropdownList: {
    marginTop: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    maxHeight: 180,
    overflow: "hidden",
  },

  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  dropdownItemText: {
    fontSize: 14,
    color: "#111827",
  },

  updateBtn: {
    backgroundColor: "#10B981",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },

  updateBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
});

export default PriceAdvisorScreen;
