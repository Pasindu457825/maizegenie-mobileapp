import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { ShieldCheck, Bug, Leaf, AlertTriangle } from "lucide-react-native";

type Language = "si" | "en";

const preventionSteps = [
  {
    icon: <Bug size={26} color="#166534" />,
    title: {
      si: "ඉක්මන් ක්ෂේත්‍ර ක්‍රියා (පළමු පැය 24)",
      en: "Immediate Field Actions (First 24 Hours)",
    },
    description: {
      si: "Asian Corn Borer larva බෝගයේ කඳ තුළ හෝ කඳ ආසන්නයේ පවතිනවාදැයි පරීක්ෂා කර දැකිය හැකි larva ඉවත් කරන්න.",
      en: "Inspect maize stems and nearby whorl areas for Asian Corn Borer larvae and remove visible larvae where possible.",
    },
  },
  {
    icon: <Leaf size={26} color="#15803d" />,
    title: {
      si: "ජෛව හා යාන්ත්‍රික පාලනය",
      en: "Mechanical & Biological Control",
    },
    description: {
      si: "pheromone traps භාවිතා කර මදුරු (moth) ගණන අඩු කරන්න. ජෛව පාලන ක්‍රම ලෙස neem-based ජෛව පළිබෝධ නාශක භාවිතා කළ හැක.",
      en: "Use pheromone traps to reduce adult moth populations and apply neem-based biopesticides as biological control.",
    },
  },
  {
    icon: <ShieldCheck size={26} color="#0f766e" />,
    title: {
      si: "බෝග පිරිසිදුකම සහ ආරක්ෂාව",
      en: "Crop Sanitation & Protection",
    },
    description: {
      si: "ආසාදිත කඳ සහ ශාක කොටස් කපා ඉවත් කර නිසි ලෙස විනාශ කරන්න. කුඹුර පිරිසිදු තත්ත්වයේ තබා ගන්න.",
      en: "Cut and destroy infested stems and plant residues properly to prevent internal spread of the pest.",
    },
  },
  {
    icon: <AlertTriangle size={26} color="#b45309" />,
    title: {
      si: "රසායනික පාලනය (දැනුවත් කිරීම පමණි)",
      en: "Chemical Control (Awareness Only)",
    },
    description: {
      si: "කඳ තුළ දැඩි හානියක් පවතින බව පෙනී යන අවස්ථාවලදී පමණක් කෘෂි උපදේශකයෙකුගෙන් නිල උපදේශනය ලබා ගන්න.",
      en: "Only if severe internal stem damage is observed, seek official advice from agricultural officers before applying chemicals.",
    },
  },
  {
    icon: <Leaf size={26} color="#065f46" />,
    title: {
      si: "අනාගත වැළැක්වීම",
      en: "Future Prevention",
    },
    description: {
      si: "වගා අවසානයේ ශාක ඉතිරි කොටස් විනාශ කිරීම, ගැඹුරු පස උදැල්ල සහ වගා මාරු කිරීම Asian Corn Borer ආසාදන අවම කරයි.",
      en: "Destroy crop residues after harvest, practice deep ploughing, and crop rotation to reduce future Asian Corn Borer infestations.",
    },
  },
];

export default function AsianCornBorerControl() {
  const [language, setLanguage] = useState<Language>("si");

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {language === "si"
            ? "Asian Corn Borer වැළැක්වීමේ පද්ධතිය"
            : "Asian Corn Borer Prevention System"}
        </Text>
        <Text style={styles.headerSubtitle}>
          {language === "si"
            ? "කෘමිය හඳුනාගැනීමෙන් පසු ක්ෂණික ආරක්ෂාව"
            : "Immediate protection after pest detection"}
        </Text>
      </View>

      {/* Language Toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            language === "si" && styles.toggleActive,
          ]}
          onPress={() => setLanguage("si")}
        >
          <Text
            style={[
              styles.toggleText,
              language === "si" && styles.toggleTextActive,
            ]}
          >
            සිංහල
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleBtn,
            language === "en" && styles.toggleActive,
          ]}
          onPress={() => setLanguage("en")}
        >
          <Text
            style={[
              styles.toggleText,
              language === "en" && styles.toggleTextActive,
            ]}
          >
            English
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {preventionSteps.map((step, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.cardIcon}>{step.icon}</View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>
                {step.title[language]}
              </Text>
              <Text style={styles.cardDescription}>
                {step.description[language]}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

/* ================== STYLES ================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0fdf4",
  },
  header: {
    padding: 45,
    backgroundColor: "#dcfce7",
    borderBottomWidth: 1,
    borderColor: "#bbf7d0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#14532d",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#166534",
    marginTop: 4,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 6,
  },
  toggleActive: {
    backgroundColor: "#16a34a",
  },
  toggleText: {
    fontSize: 14,
    color: "#374151",
  },
  toggleTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  cardIcon: {
    marginRight: 12,
    marginTop: 4,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#064e3b",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 18,
  },
});
