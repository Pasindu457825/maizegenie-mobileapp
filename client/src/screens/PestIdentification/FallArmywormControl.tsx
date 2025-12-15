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
      si: "පත්‍ර මධ්‍යයේ (whorl) පරීක්ෂා කර දැකිය හැකි Fall Armyworm larva සහ බිත්තර කණ්ඩායම් අතින් ඉවත් කරන්න.",
      en: "Inspect the leaf whorl and manually remove visible Fall Armyworm larvae and egg masses.",
    },
  },
  {
    icon: <Leaf size={26} color="#15803d" />,
    title: {
      si: "ජෛව හා යාන්ත්‍රික පාලනය",
      en: "Mechanical & Biological Control",
    },
    description: {
      si: "Neem-based ජෛව පළිබෝධ නාශක හෝ pheromone traps භාවිතා කර කෘමීන්ගේ ව්‍යාප්තිය අඩු කරන්න.",
      en: "Use neem-based biopesticides or pheromone traps to suppress pest spread.",
    },
  },
  {
    icon: <ShieldCheck size={26} color="#0f766e" />,
    title: {
      si: "බෝග පිරිසිදුකම සහ ආරක්ෂාව",
      en: "Crop Sanitation & Protection",
    },
    description: {
      si: "ආසාදිත පත්‍ර සහ ශාක කොටස් ඉවත් කර නිසි ලෙස විනාශ කර කුඹුර පිරිසිදු තත්ත්වයේ තබා ගන්න.",
      en: "Remove and properly destroy infected leaves and plant residues to maintain field sanitation.",
    },
  },
  {
    icon: <AlertTriangle size={26} color="#b45309" />,
    title: {
      si: "රසායනික පාලනය (දැනුවත් කිරීම පමණි)",
      en: "Chemical Control (Awareness Only)",
    },
    description: {
      si: "දැඩි හානියක් පවතින බව පෙනී යන අවස්ථාවලදී පමණක් කෘෂි උපදේශකයෙකුගෙන් නිල උපදේශනය ලබා ගන්න.",
      en: "Only if severe damage is observed, seek official guidance from agricultural officers before applying chemicals.",
    },
  },
  {
    icon: <Leaf size={26} color="#065f46" />,
    title: {
      si: "අනාගත වැළැක්වීම",
      en: "Future Prevention",
    },
    description: {
      si: "වගා කාලය අවසානයේ ආසාදිත ශාක කොටස් විනාශ කිරීම සහ වගා මාරු කිරීම Fall Armyworm ආසාදන අවම කරයි.",
      en: "Destroy infected crop residues after harvest and practice crop rotation to reduce future infestations.",
    },
  },
];

export default function FallArmywormControl() {
  const [language, setLanguage] = useState<Language>("si");

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {language === "si"
            ? "Fall Armyworm වැළැක්වීමේ පද්ධතිය"
            : "Fall Armyworm Prevention System"}
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
