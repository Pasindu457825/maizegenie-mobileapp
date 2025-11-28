import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  TrendingUp,
  Leaf,
  CloudRain,
  CloudLightning,
  Cloud,
  Sun,
  ArrowLeft,
} from "lucide-react-native";

const PriceAdvisorScreen = ({ route, navigation }: any) => {
  const formData = route?.params?.formData || {};

  const [language, setLanguage] = useState<"si" | "en">("si");

  // --------------------------
  // PHASE 1 – DUMMY FORECAST
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
  // USER INPUTS
  // ----------------------
  const plantingDate = new Date(formData.plantingDate);
  const plantingWeek = formData.plantingWeek || 1;
  const cropDurationWeeks = formData.cropDuration || 14;
  const yieldKg = parseFloat(formData.yieldKg) || 1500;
  const cost = parseFloat(formData.cost) || 45000;
  const weatherCondition = formData.weatherCondition || "";

  // -------------------------------------
  // CALCULATIONS – PHASE 1 ADVISOR LOGIC
  // -------------------------------------

  // Harvest date
  const harvestDate = new Date(plantingDate);
  harvestDate.setDate(harvestDate.getDate() + cropDurationWeeks * 7);

  // Harvest week
  const harvestWeek = plantingWeek + cropDurationWeeks;

  // Get price for harvest week
  const forecast =
    dummyPriceWeeks[Math.min(harvestWeek - 1, dummyPriceWeeks.length - 1)] ||
    dummyPriceWeeks[0];

  const expectedPrice = forecast.price;

  // Profit
  const totalRevenue = yieldKg * expectedPrice;
  const profit = totalRevenue - cost;

  // -----------------------------
  // WEATHER WARNINGS (PLANTING)
  // -----------------------------
  let warningLevel = "SAFE";
  let warningText = "";
  let warningColor = "#16A34A";

  const wc = weatherCondition.toLowerCase();

  if (wc.includes("heavy rain")) {
    warningLevel = "UNSAFE";
    warningText =
      language === "si"
        ? "අද තද වැසි තියෙනවා. අද බීජ පැල නොකරන්න."
        : "Heavy rain today. Avoid planting today.";
    warningColor = "#DC2626";
  } else if (wc.includes("thunder")) {
    warningLevel = "UNSAFE";
    warningText =
      language === "si"
        ? "අද අකුණු සහිත වැසි තියෙනවා. බීජ පැල කිරීම නවත්වන්න."
        : "Thunderstorm detected. Avoid planting.";
    warningColor = "#DC2626";
  } else if (wc.includes("moderate rain") || wc.includes("light rain")) {
    warningLevel = "CAUTION";
    warningText =
      language === "si"
        ? "අවදානයෙන් ඉන්න. සැහැල්ලු/මධ්‍යම වැසි නිසා මූල බොදු විය හැක."
        : "Plant with care. Light/Moderate rain may affect germination.";
    warningColor = "#EAB308";
  } else {
    warningLevel = "SAFE";
    warningText =
      language === "si"
        ? "වගාව සඳහා සුදුසු කාලගුණය."
        : "Weather is good for planting.";
    warningColor = "#16A34A";
  }

  // --------------------------
  // SIGNAL COLOR FOR PROFIT
  // --------------------------
  let profitColor = "#DC2626";
  if (profit > 50000) profitColor = "#16A34A";
  else if (profit > 0) profitColor = "#EAB308";

  // --------------------------
  // LANGUAGE SWITCH CONTENT
  // --------------------------
  const L = {
    si: {
      title: "🌽 වගා උපදෙස්",
      plantingStatus:
        warningLevel === "UNSAFE"
          ? "⚠️ අද වගා නොකරන්න"
          : warningLevel === "CAUTION"
          ? "🟡 අවදානයෙන් වගා කරන්න"
          : "🟢 වගාවට සුදුසු වේ",
      plantingDate: "බීජ පැල කිරීමේ දිනය",
      harvestDate: "අස්වැන්න දිනය",
      harvestWeek: "අස්වැන්න සතිය",
      expectedPrice: "අපේක්ෂිත මිල",
      profit: "ලාභය",
      warning: "මෙදාහරිය",
      goBack: "ආපසු යන්න",
    },
    en: {
      title: "🌽 Cultivation Advisor",
      plantingStatus:
        warningLevel === "UNSAFE"
          ? "⚠️ Do NOT plant today"
          : warningLevel === "CAUTION"
          ? "🟡 Plant with caution"
          : "🟢 Suitable for planting",
      plantingDate: "Planting Date",
      harvestDate: "Expected Harvest Date",
      harvestWeek: "Harvest Week",
      expectedPrice: "Expected Price",
      profit: "Expected Profit",
      warning: "Warning",
      goBack: "Go Back",
    },
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={26} color="#065F46" />
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.headerTitle}>{L[language].title}</Text>

        {/* Lang Switch */}
        <TouchableOpacity
          style={styles.langSwitch}
          onPress={() => setLanguage(language === "si" ? "en" : "si")}
        >
          <Text style={styles.langText}>{language === "si" ? "EN" : "සිං"}</Text>
        </TouchableOpacity>
      </View>

      {/* Planting Warning */}
      <View style={[styles.warningCard, { borderLeftColor: warningColor }]}>
        <Text style={[styles.warningTitle, { color: warningColor }]}>
          {L[language].plantingStatus}
        </Text>
        <Text style={styles.warningText}>{warningText}</Text>
      </View>

      {/* Advisor Info */}
      <View style={styles.card}>
        <Text style={styles.label}>
          {L[language].plantingDate}: {plantingDate.toDateString()}
        </Text>
        <Text style={styles.label}>
          {L[language].harvestDate}: {harvestDate.toDateString()}
        </Text>
        <Text style={styles.label}>
          {L[language].harvestWeek}: Week {harvestWeek}
        </Text>

        <Text style={styles.label}>
          {L[language].expectedPrice}: Rs. {expectedPrice}/kg
        </Text>
        <Text style={[styles.label, { color: profitColor }]}>
          {L[language].profit}: Rs. {profit.toLocaleString()}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backBtnText}>{L[language].goBack}</Text>
      </TouchableOpacity>
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

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
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

  warningCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 5,
    marginBottom: 20,
  },

  warningTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 4,
  },

  warningText: {
    fontSize: 14,
    color: "#374151",
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 2,
    borderColor: "#D1FAE5",
    marginBottom: 20,
  },

  label: {
    fontSize: 15,
    color: "#065F46",
    marginBottom: 8,
    fontWeight: "500",
  },

  backBtn: {
    backgroundColor: "#10B981",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  backBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
});

export default PriceAdvisorScreen;
