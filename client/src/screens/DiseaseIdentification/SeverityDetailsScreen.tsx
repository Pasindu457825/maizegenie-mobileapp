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

// ---------- ROUTE TYPE ----------
type SeverityDetailsRouteProp = RouteProp<
  DiseaseIdentifyStackParamList,
  "SeverityDetails"
>;

interface Props {
  route: SeverityDetailsRouteProp;
}

// ---------- DISEASE DESCRIPTIONS ----------
const DISEASE_INFO: Record<string, string> = {
  common_rust:
    "Common rust appears as round reddish-brown pustules on the leaves. It spreads in cool, humid conditions and can reduce crop yield if untreated.",
  blight:
    "Leaf blight causes large irregular brown lesions. It spreads rapidly during warm, wet weather and weakens plant growth.",
  gray_leaf_spot:
    "Gray Leaf Spot produces long rectangular gray lesions. It thrives in humid climates and thick canopy conditions.",
};

export default function SeverityDetailsScreen({ route }: Props) {
  const { image, severity_score, severity_label, predictions } = route.params;
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container}>
      {/* BACK BUTTON */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <ArrowLeft size={24} color="#1565C0" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      {/* HEADER */}
      <Text style={styles.header}>Disease Severity Details</Text>

      {/* IMAGE */}
      {image && (
        <Image
          source={{ uri: image }}
          style={styles.preview}
          resizeMode="cover"
        />
      )}

      {/* SEVERITY CARD */}
      <View style={styles.card}>
        <Text style={styles.title}>Severity Level</Text>
        <Text style={styles.value}>{severity_label}</Text>

        <Text style={styles.subValue}>
          {Math.round(severity_score * 100)}% Affected
        </Text>

        {/* ADVANCED SVG GAUGE */}
        <SeverityGauge severity={severity_score} />
      </View>

      {/* DISEASE DETAILS */}
      <View style={styles.card}>
        <Text style={styles.title}>Detected Diseases</Text>

        {predictions?.map((p, i) => {
          const key = p.class_name.toLowerCase().replace(/ /g, "_");
          const desc = DISEASE_INFO[key] || "No description available.";

          return (
            <View key={i} style={styles.diseaseCard}>
              <View style={styles.diseaseRow}>
                <Text style={styles.className}>{p.class_name}</Text>
                <Text style={styles.conf}>
                  {Math.round(p.confidence * 100)}%
                </Text>
              </View>

              <Text style={styles.diseaseDescription}>{desc}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

// ---------- STYLES ----------
const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#F8FBFE", flex: 1 },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
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
    borderWidth: 3,
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
  subValue: { fontSize: 14, color: "#4CAF50", marginTop: 4, fontWeight: "600" },

  diseaseCard: {
    backgroundColor: "#F8FBFE",
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    borderColor: "#E3F2FD",
    marginTop: 14,
  },

  diseaseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  className: { fontSize: 16, fontWeight: "700", color: "#1F2937" },
  conf: { fontSize: 16, fontWeight: "800", color: "#1565C0" },

  diseaseDescription: {
    marginTop: 6,
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    fontWeight: "500",
  },
});
