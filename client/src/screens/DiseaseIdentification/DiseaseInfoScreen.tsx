import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react-native";
import { useNavigation, RouteProp } from "@react-navigation/native";
import { DiseaseIdentifyStackParamList } from "../../navigation/DiseaseIdentifyStack";

// Enable Layout Animation for Android
if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ------------------ ROUTE TYPE ------------------
type DiseaseInfoRouteProp = RouteProp<
  DiseaseIdentifyStackParamList,
  "DiseaseInfo"
>;

interface Props {
  route: DiseaseInfoRouteProp;
}

// ---------- DISEASE DESCRIPTIONS ----------
const DISEASE_INFO: Record<
  string,
  {
    name: string;
    overview: string;
    symptoms: string[];
    causes: string[];
    conditions: string[];
    management: string[];
    prevention: string[];
  }
> = {
  common_rust: {
    name: "Common Rust",
    overview:
      "Common rust is caused by *Puccinia sorghi*. It spreads rapidly in humid, cool conditions. Early detection prevents severe yield loss.",
    symptoms: [
      "Reddish-brown raised pustules",
      "Yellowing around infected areas",
      "Black hardened spores in late stages",
    ],
    causes: [
      "Wind-borne fungal spores",
      "High humidity conditions",
      "Overcrowded planting",
    ],
    conditions: [
      "Cool temperatures (16–24°C)",
      "High moisture on leaves",
      "Shaded field areas",
    ],
    management: [
      "Apply recommended fungicides early",
      "Use rust-resistant maize hybrid seeds",
      "Remove heavily infected leaves",
    ],
    prevention: [
      "Crop rotation",
      "Avoid dense planting",
      "Remove leftover crop debris",
    ],
  },

  blight: {
    name: "Leaf Blight",
    overview:
      "Leaf blight affects leaf health and reduces photosynthesis. It spreads fast in warm, rainy periods.",
    symptoms: [
      "Large brown lesions",
      "Leaves dry and curl",
      "Dark brown edges spreading upward",
    ],
    causes: [
      "Fungal organisms in soil or residue",
      "Rain splash dispersal",
      "Poor airflow in crop canopy",
    ],
    conditions: [
      "Warm temperatures (22–30°C)",
      "Frequent rainfall",
      "Heavy morning dew",
    ],
    management: [
      "Improve airflow by proper spacing",
      "Apply fungicides early",
      "Destroy infected residues after harvest",
    ],
    prevention: [
      "Use certified clean seeds",
      "Practice crop rotation",
      "Avoid excessive nitrogen fertilizer",
    ],
  },

  gray_leaf_spot: {
    name: "Gray Leaf Spot",
    overview:
      "Gray Leaf Spot is one of the most damaging maize foliar diseases, caused by *Cercospora zeae-maydis*.",
    symptoms: [
      "Narrow rectangular gray lesions",
      "Parallel lesion alignment",
      "Lower leaves dry first",
    ],
    causes: [
      "Fungal spores surviving in debris",
      "High humidity and warm nights",
      "Continuous maize planting",
    ],
    conditions: [
      "Humidity > 90%",
      "Warm weather (25–30°C)",
      "Low airflow in dense fields",
    ],
    management: [
      "Use resistant maize hybrids",
      "Apply preventive fungicides before tasseling",
      "Remove plant debris",
    ],
    prevention: [
      "Crop rotation every season",
      "Avoid overhead irrigation in evenings",
      "Reduce canopy density",
    ],
  },
};

// ------------------ COMPONENT ------------------
export default function DiseaseInfoScreen({ route }: Props) {
  const navigation = useNavigation();
  const { predictions } = route.params;

  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    LayoutAnimation.easeInEaseOut();
    setOpenSection(openSection === section ? null : section);
  };

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

      <Text style={styles.header}>Full Disease Details</Text>

      {predictions?.map((p, index) => {
        const key = p.class_name.toLowerCase().replace(/ /g, "_");
        const disease = DISEASE_INFO[key];

        if (!disease) return null;

        return (
          <View key={index} style={styles.card}>
            <Text style={styles.diseaseTitle}>{disease.name}</Text>

            {/* ===================== OVERVIEW ===================== */}
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection(`overview-${index}`)}
            >
              <Text style={styles.sectionTitle}>Overview</Text>
              {openSection === `overview-${index}` ? (
                <ChevronUp color="#1565C0" />
              ) : (
                <ChevronDown color="#1565C0" />
              )}
            </TouchableOpacity>

            {openSection === `overview-${index}` && (
              <Text style={styles.sectionBody}>{disease.overview}</Text>
            )}

            {/* ===================== SYMPTOMS ===================== */}
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection(`symptoms-${index}`)}
            >
              <Text style={styles.sectionTitle}>Symptoms</Text>
              {openSection === `symptoms-${index}` ? (
                <ChevronUp color="#1565C0" />
              ) : (
                <ChevronDown color="#1565C0" />
              )}
            </TouchableOpacity>

            {openSection === `symptoms-${index}` &&
              disease.symptoms.map((item, i) => (
                <Text key={i} style={styles.listItem}>
                  • {item}
                </Text>
              ))}

            {/* ===================== CAUSES ===================== */}
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection(`causes-${index}`)}
            >
              <Text style={styles.sectionTitle}>Causes</Text>
              {openSection === `causes-${index}` ? (
                <ChevronUp color="#1565C0" />
              ) : (
                <ChevronDown color="#1565C0" />
              )}
            </TouchableOpacity>

            {openSection === `causes-${index}` &&
              disease.causes.map((item, i) => (
                <Text key={i} style={styles.listItem}>
                  • {item}
                </Text>
              ))}

            {/* ===================== FAVORABLE CONDITIONS ===================== */}
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection(`conditions-${index}`)}
            >
              <Text style={styles.sectionTitle}>Favorable Conditions</Text>
              {openSection === `conditions-${index}` ? (
                <ChevronUp color="#1565C0" />
              ) : (
                <ChevronDown color="#1565C0" />
              )}
            </TouchableOpacity>

            {openSection === `conditions-${index}` &&
              disease.conditions.map((item, i) => (
                <Text key={i} style={styles.listItem}>
                  • {item}
                </Text>
              ))}

            {/* ===================== MANAGEMENT ===================== */}
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection(`management-${index}`)}
            >
              <Text style={styles.sectionTitle}>Management</Text>
              {openSection === `management-${index}` ? (
                <ChevronUp color="#1565C0" />
              ) : (
                <ChevronDown color="#1565C0" />
              )}
            </TouchableOpacity>

            {openSection === `management-${index}` &&
              disease.management.map((item, i) => (
                <Text key={i} style={styles.managementItem}>
                  • {item}
                </Text>
              ))}

            {/* ===================== PREVENTION ===================== */}
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection(`prevention-${index}`)}
            >
              <Text style={styles.sectionTitle}>Prevention</Text>
              {openSection === `prevention-${index}` ? (
                <ChevronUp color="#1565C0" />
              ) : (
                <ChevronDown color="#1565C0" />
              )}
            </TouchableOpacity>

            {openSection === `prevention-${index}` &&
              disease.prevention.map((item, i) => (
                <Text key={i} style={styles.listItem}>
                  • {item}
                </Text>
              ))}
          </View>
        );
      })}
    </ScrollView>
  );
}

// ------------------ STYLES ------------------
const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#F8FBFE", flex: 1 },

  backButton: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  backText: {
    fontSize: 16,
    color: "#1565C0",
    fontWeight: "700",
    marginLeft: 6,
  },

  header: { fontSize: 24, fontWeight: "800", color: "#1565C0", marginBottom: 20 },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E3F2FD",
    marginBottom: 20,
  },

  diseaseTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0D47A1",
    marginBottom: 12,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },

  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1565C0" },

  sectionBody: {
    fontSize: 14,
    paddingVertical: 10,
    color: "#374151",
    lineHeight: 20,
  },

  listItem: {
    fontSize: 14,
    paddingVertical: 4,
    color: "#374151",
  },

  managementItem: {
    fontSize: 14,
    paddingVertical: 4,
    color: "#B91C1C",
    fontWeight: "600",
  },
});
