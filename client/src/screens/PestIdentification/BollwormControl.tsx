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
      si: "බෝල්වෝම් (Bollworm) larva පත්‍ර, කොළ හෝ බීජ කොටස් තුළ සිටිනවාදැයි පරීක්ෂා කර දැකිය හැකි larva අතින් ඉවත් කරන්න.",
      en: "Inspect leaves, flowers, and cobs for Bollworm larvae and manually remove visible larvae.",
    },
  },
  {
    icon: <Leaf size={26} color="#15803d" />,
    title: {
      si: "ජෛව හා යාන්ත්‍රික පාලනය",
      en: "Mechanical & Biological Control",
    },
    description: {
      si: "pheromone traps භාවිතා කර කෘමීන්ගේ ගණන අඩු කරන්න. Neem-based ජෛව පළිබෝධ නාශක භාවිතා කළ හැක.",
      en: "Use pheromone traps to reduce adult moth populations and apply neem-based biopesticides if needed.",
    },
  },
  {
    icon: <ShieldCheck size={26} color="#0f766e" />,
    title: {
      si: "බෝග පිරිසිදුකම සහ ආරක්ෂාව",
      en: "Crop Sanitation & Protection",
    },
    description: {
      si: "ආසාදිත කොළ, මල් සහ බීජ කොටස් ඉවත් කර නිසි ලෙස විනාශ කරන්න. කුඹුර පිරිසිදුව තබා ගන්න.",
      en: "Remove and properly destroy infected leaves, flowers, and cobs to prevent further spread.",
    },
  },
  {
    icon: <AlertTriangle size={26} color="#b45309" />,
    title: {
      si: "රසායනික පාලනය (දැනුවත් කිරීම පමණි)",
      en: "Chemical Control (Awareness Only)",
    },
    description: {
      si: "බෝගයට දැඩි හානියක් පවතින අවස්ථාවලදී පමණක් කෘෂි උපදේශකයෙකුගෙන් නිල උපදේශනය ලබා ගන්න.",
      en: "Only in cases of severe damage, seek official advice from agricultural officers before applying chemicals.",
    },
  },
  {
    icon: <Leaf size={26} color="#065f46" />,
    title: {
      si: "අනාගත වැළැක්වීම",
      en: "Future Prevention",
    },
    description: {
      si: "වගා මාරු කිරීම, එකම බෝගය නැවත නැවත වගා කිරීමෙන් වළකින්න සහ වගා අවසානයේ ආසාදිත කොටස් විනාශ කරන්න.",
      en: "Practice crop rotation, avoid continuous monocropping, and destroy infected residues after harvest.",
    },
  },
];

export default function BollwormControl() {
  const [language, setLanguage] = useState<Language>("si");

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {language === "si"
            ? "Bollworm වැළැක්වීමේ පද්ධතිය"
            : "Bollworm Prevention System"}
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
