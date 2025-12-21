import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StackNavigationProp } from "@react-navigation/stack";
import { PestIdentifyStackParamList } from "../../navigation/PestIdentifyStack";
import { useLanguage } from "../../context/LanguageContext";

const { width, height } = Dimensions.get("window");

type MaizeGenieHomeProps = {
  navigation: StackNavigationProp<PestIdentifyStackParamList>;
};

type LangKey = "si" | "en";

export default function MaizeGenieHome({
  navigation,
}: MaizeGenieHomeProps) {
  /* 🌐 GLOBAL LANGUAGE */
  const { language: appLang } = useLanguage();
  const language: LangKey = appLang === "sinhala" ? "si" : "en";

  const handlePestIdentification = () => {
    navigation.navigate("PestIdentifyLoading");
  };

  const handleCropDetails = () => {
    navigation.navigate("PestRiskMeter");
  };

  /* 📝 TEXT CONTENT */
  const content = {
    si: {
      tagline: "ස්මාර්ට් ගොවිතැනේ සහායක",
      subtitle: "ශ්‍රී ලාංකීය බඩඉරිගු බෝග ගොවියන් සඳහා",
      description:
        "කෘමි හඳුනාගැනීම සහ වගා කළමනාකරණය සඳහා \nඔබේ ස්මාර්ට් සහායක",
      pestBtnTitle: "කෘමියා හඳුනාගන්න",
      pestBtnSub: "AI මගින් ක්ෂණිකව හඳුනාගන්න",
      riskBtnTitle: "කෘමි අවධානම බලන්න ☠️",
      riskBtnSub: "වගාවට පෙර අවදානම හදුනාගන්න",
    },
    en: {
      tagline: "Smart Farming Companion",
      subtitle: "for Sri Lankan Corn Farmers",
      description:
        "Your smart assistant for pest detection \nand crop management",
      pestBtnTitle: "Identify Pest",
      pestBtnSub: "Instant AI-powered identification",
      riskBtnTitle: "View Pest Risk ☠️",
      riskBtnSub: "Check risk level before cultivation",
    },
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a7a5e" />

      <LinearGradient
        colors={["#2d9d78", "#1a7a5e", "#165c47"]}
        style={styles.gradient}
      >
        {/* Decorative circles */}
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoIcon}>🌾</Text>
            </View>
          </View>

          <Text style={styles.tagline}>
            {content[language].tagline}
          </Text>
          <Text style={styles.subtitle}>
            {content[language].subtitle}
          </Text>

          <View style={styles.divider} />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <Text style={styles.descriptionText}>
            {content[language].description}
          </Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handlePestIdentification}
              activeOpacity={0.8}
            >
              <View style={styles.buttonIcon}>
                <Text style={styles.iconText}>🔍</Text>
              </View>
              <Text style={styles.primaryButtonText}>
                {content[language].pestBtnTitle}
              </Text>
              <Text style={styles.buttonSubtext}>
                {content[language].pestBtnSub}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleCropDetails}
              activeOpacity={0.8}
            >
              <View style={styles.buttonIcon}>
                <Text style={styles.iconText}>📊</Text>
              </View>
              <Text style={styles.secondaryButtonText}>
                {content[language].riskBtnTitle}
              </Text>
              <Text style={styles.buttonSubtext}>
                {content[language].riskBtnSub}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

/* 🎨 STYLES — unchanged */
const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1, position: "relative" },
  circle: {
    position: "absolute",
    borderRadius: 1000,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  circle1: { width: 300, height: 300, top: -100, right: -100 },
  circle2: { width: 200, height: 200, bottom: 100, left: -50 },
  circle3: { width: 150, height: 150, top: "40%", right: -50 },

  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  logoContainer: { marginBottom: 20 },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  logoIcon: { fontSize: 60 },

  tagline: {
    fontSize: 18,
    color: "#e0f2e9",
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 14,
    color: "#c5e8d7",
    marginBottom: 20,
  },
  divider: {
    width: 80,
    height: 4,
    backgroundColor: "#ffa726",
    borderRadius: 2,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  descriptionText: {
    fontSize: 16,
    color: "#e0f2e9",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  buttonContainer: { width: "100%", gap: 20 },
  primaryButton: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    elevation: 8,
  },
  secondaryButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  buttonIcon: { marginBottom: 12 },
  iconText: { fontSize: 36 },
  primaryButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a7a5e",
    marginBottom: 6,
  },
  secondaryButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 6,
  },
  buttonSubtext: {
    fontSize: 13,
    color: "#64b896",
    fontWeight: "500",
  },
});
