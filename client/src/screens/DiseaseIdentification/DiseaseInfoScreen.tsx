import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { useNavigation, RouteProp } from "@react-navigation/native";
import { DiseaseIdentifyStackParamList } from "../../navigation/DiseaseIdentifyStack";
import { StackNavigationProp } from "@react-navigation/stack";

type NavProp = StackNavigationProp<
  DiseaseIdentifyStackParamList,
  "DiseaseInfo"
>;

// ------------------ ROUTE TYPE ------------------
type DiseaseInfoRouteProp = RouteProp<
  DiseaseIdentifyStackParamList,
  "DiseaseInfo"
>;

interface Props {
  route: DiseaseInfoRouteProp;
}

// ---------- DISEASE DATABASE ----------
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
      "Common rust is caused by *Puccinia sorghi* and spreads rapidly in humid, cool conditions. Early treatment prevents grain loss.",
    symptoms: [
      "Reddish-brown raised pustules",
      "Yellow areas around lesions",
      "Black hardened spores in late stage",
    ],
    causes: ["Wind-borne spores", "High humidity", "Dense planting"],
    conditions: [
      "Cool temperatures (16–24°C)",
      "Moist leaf surfaces",
      "Shaded fields",
    ],
    management: [
      "Early fungicide application",
      "Use resistant maize varieties",
      "Remove severely infected leaves",
    ],
    prevention: [
      "Rotate crops",
      "Avoid overcrowding",
      "Destroy leftover infected debris",
    ],
  },

  blight: {
    name: "Leaf Blight",
    overview:
      "A fast-spreading fungal disease that reduces photosynthesis and weakens plant structure.",
    symptoms: [
      "Large brown irregular lesions",
      "Leaves curl and dry",
      "Dark edges spreading upward",
    ],
    causes: ["Fungus in residue", "Rain splash", "Poor airflow"],
    conditions: ["Warm weather (22–30°C)", "Frequent rainfall", "Morning dew"],
    management: [
      "Improve airflow through spacing",
      "Apply fungicides early",
      "Destroy infected residue",
    ],
    prevention: [
      "Use certified disease-free seeds",
      "Rotate crops regularly",
      "Avoid excessive nitrogen",
    ],
  },

  gray_leaf_spot: {
    name: "Gray Leaf Spot",
    overview:
      "One of the most destructive maize foliar diseases, caused by *Cercospora zeae-maydis*.",
    symptoms: [
      "Long rectangular gray lesions",
      "Lesions form parallel lines",
      "Lower leaves dry first",
    ],
    causes: [
      "Spores surviving in debris",
      "High humidity",
      "Continuous maize cropping",
    ],
    conditions: ["Humidity above 90%", "Warm nights (25–30°C)", "Dense canopy"],
    management: [
      "Use resistant hybrids",
      "Preventive fungicide before tasseling",
      "Remove residue",
    ],
    prevention: [
      "Rotate crops yearly",
      "Avoid evening overhead irrigation",
      "Reduce canopy density",
    ],
  },
};

// ------------------ COMPONENT ------------------
export default function DiseaseInfoScreen({ route }: Props) {
  const navigation = useNavigation<NavProp>();

  const { predictions } = route.params;

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

      {/* CONTACT AGRO OFFICER BUTTON */}
      <TouchableOpacity
        style={styles.contactBtn}
        onPress={() =>
          navigation.navigate("Chat", {
            roomId: null, // force auto-create farmer room
            userId: "", // ChatScreen will use logged-in farmer ID
          })
        }
      >
        <Text style={styles.contactBtnText}>Contact Agro Officer</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Disease Information</Text>

      {predictions?.map((p, i) => {
        const key = p.class_name.toLowerCase().replace(/ /g, "_");
        const d = DISEASE_INFO[key];
        if (!d) return null;

        return (
          <View key={i} style={styles.card}>
            <Text style={styles.diseaseTitle}>{d.name}</Text>

            {/* Overview */}
            <Text style={styles.sectionLabel}>Overview</Text>
            <Text style={styles.sectionText}>{d.overview}</Text>

            {/* Symptoms */}
            <Text style={styles.sectionLabel}>Symptoms</Text>
            {d.symptoms.map((s, idx) => (
              <Text key={idx} style={styles.listItem}>
                • {s}
              </Text>
            ))}

            {/* Causes */}
            <Text style={styles.sectionLabel}>Causes</Text>
            {d.causes.map((s, idx) => (
              <Text key={idx} style={styles.listItem}>
                • {s}
              </Text>
            ))}

            {/* Favorable Conditions */}
            <Text style={styles.sectionLabel}>Favorable Conditions</Text>
            {d.conditions.map((s, idx) => (
              <Text key={idx} style={styles.listItem}>
                • {s}
              </Text>
            ))}

            {/* Management */}
            <Text style={[styles.sectionLabel, { color: "#B91C1C" }]}>
              Management Recommendations
            </Text>
            {d.management.map((s, idx) => (
              <Text key={idx} style={styles.managementItem}>
                • {s}
              </Text>
            ))}

            {/* Prevention */}
            <Text style={styles.sectionLabel}>Prevention Tips</Text>
            {d.prevention.map((s, idx) => (
              <Text key={idx} style={styles.listItem}>
                • {s}
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
    marginLeft: 6,
    fontSize: 16,
    color: "#1565C0",
    fontWeight: "700",
  },

  header: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1565C0",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E3F2FD",
    marginBottom: 20,
  },

  diseaseTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0D47A1",
    marginBottom: 14,
  },

  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1565C0",
    marginTop: 12,
    marginBottom: 6,
  },

  sectionText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginBottom: 6,
  },

  listItem: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginLeft: 4,
    paddingVertical: 2,
  },

  managementItem: {
    fontSize: 14,
    color: "#B91C1C",
    fontWeight: "600",
    lineHeight: 20,
    marginLeft: 4,
    paddingVertical: 2,
  },
  contactBtn: {
    backgroundColor: "#0D8A43",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 16,
  },
  contactBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
