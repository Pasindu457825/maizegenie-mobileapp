import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { ArrowLeft } from "lucide-react-native";
import { DiseaseIdentifyStackParamList } from "../../navigation/DiseaseIdentifyStack";
import SeverityGauge from "../../components/SeverityGauge";
import { StackNavigationProp } from "@react-navigation/stack";

// 🌐 LANGUAGE CONTEXT
import { useLanguage } from "../../context/LanguageContext";

// NAV TYPES
type NavProp = StackNavigationProp<
  DiseaseIdentifyStackParamList,
  "SeverityDetails"
>;

type SeverityDetailsRouteProp = RouteProp<
  DiseaseIdentifyStackParamList,
  "SeverityDetails"
>;

interface Props {
  route: SeverityDetailsRouteProp;
}

export default function SeverityDetailsScreen({ route }: Props) {
  const { image, severity_score, severity_label, predictions } = route.params;
  const navigation = useNavigation<NavProp>();

  // 🌐 GLOBAL LANGUAGE (sinhala/english)
  const { language: lang } = useLanguage();
  const language = lang === "sinhala" ? "si" : "en";

  // 🌐 TRANSLATION CONTENT
  const content = {
    si: {
      back: "ආපසු",
      header: "පැලැස්ම සෞඛ්‍ය තත්ත්වය",
      currentSeverity: "වත්මන් තත්ත්වය",
      infectionDetected: "ආසාදනය හමුවිය",
      mild: "ඔබේ බිම හොඳ තත්ත්වයකි. සුළු රෝග ලක්ෂණ තිබේ.",
      moderate: "සැලකිල්ලක් යොමු කරන්න. රෝගය මධ්‍යම ලෙස පැතිරෙමින් ඇත.",
      severe:
        "අවදානම් තත්ත්වයකි! දැඩි ආසාදනයක් හමුවිය. වහාම ක්‍රියාමාර්ග ගන්න.",
      viewDetails: "සම්පූර්ණ විස්තර බලන්න",
    },
    en: {
      back: "Back",
      header: "Plant Health Status",
      currentSeverity: "Current Severity Level",
      infectionDetected: "Infection Detected",
      mild: "Your plant is in good condition. Mild signs of disease detected.",
      moderate: "Your plant needs attention. Disease is spreading moderately.",
      severe:
        "Warning! Severe infection levels detected. Immediate action required.",
      viewDetails: "View Full Disease Details",
    },
  };

  // Status text logic stays 100% the same
  const statusText =
    severity_score < 0.33
      ? content[language].mild
      : severity_score < 0.66
      ? content[language].moderate
      : content[language].severe;

  return (
    <ScrollView style={styles.container}>
      {/* BACK BUTTON */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <ArrowLeft size={24} color="#1565C0" />
        <Text style={styles.backText}>{content[language].back}</Text>
      </TouchableOpacity>

      {/* HEADER */}
      <Text style={styles.header}>{content[language].header}</Text>

      {/* IMAGE */}
      {image && (
        <Image
          source={{ uri: image }}
          style={styles.preview}
          resizeMode="cover"
        />
      )}

      {/* INFO CARD */}
      <View style={styles.card}>
        <Text style={styles.title}>{content[language].currentSeverity}</Text>
        <Text style={styles.value}>{severity_label}</Text>

        <Text style={styles.subValue}>
          {Math.round(severity_score * 100)}%{" "}
          {content[language].infectionDetected}
        </Text>

        {/* GAUGE */}
        <SeverityGauge severity={severity_score} />

        {/* DESCRIPTION */}
        <Text style={styles.statusText}>{statusText}</Text>

        {/* BUTTON → FULL DETAILS */}
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() =>
            navigation.navigate("DiseaseInfo", {
              predictions,
            })
          }
        >
          <Text style={styles.detailsButtonText}>
            {content[language].viewDetails}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ---------- STYLES ----------
const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#F8FBFE", flex: 1 },

  backButton: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  backText: {
    fontSize: 16,
    color: "#1565C0",
    fontWeight: "700",
    marginLeft: 6,
  },

  header: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1565C0",
    marginBottom: 20,
  },

  preview: {
    width: "100%",
    height: 240,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#90CAF9",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#E3F2FD",
    marginBottom: 20,
  },

  title: { fontSize: 18, fontWeight: "700", color: "#0D47A1" },
  value: { fontSize: 22, fontWeight: "900", color: "#1565C0", marginTop: 6 },

  subValue: {
    fontSize: 14,
    color: "#4CAF50",
    marginTop: 4,
    fontWeight: "600",
  },

  statusText: {
    fontSize: 15,
    color: "#374151",
    marginTop: 16,
    textAlign: "center",
    lineHeight: 20,
  },

  detailsButton: {
    marginTop: 20,
    paddingVertical: 12,
    backgroundColor: "#1565C0",
    borderRadius: 10,
  },

  detailsButtonText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
