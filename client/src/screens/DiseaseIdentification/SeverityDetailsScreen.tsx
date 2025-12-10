import React from "react";
import { View, Text, Image, ScrollView, StyleSheet } from "react-native";
import { RouteProp } from "@react-navigation/native";
import { DiseaseIdentifyStackParamList } from "../../navigation/DiseaseIdentifyStack";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";
import { ArrowLeft } from "lucide-react-native";

// ---------- ROUTE TYPE ----------
type SeverityDetailsRouteProp = RouteProp<
  DiseaseIdentifyStackParamList,
  "SeverityDetails"
>;

interface Props {
  route: SeverityDetailsRouteProp;
}

export default function SeverityDetailsScreen({ route }: Props) {
  const { image, severity_score, severity_label, predictions } = route.params;
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <ArrowLeft size={24} color="#1565C0" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Disease Severity Details</Text>

      {image && (
        <Image
          source={{ uri: image }}
          style={styles.preview}
          resizeMode="cover"
        />
      )}

      <View style={styles.card}>
        <Text style={styles.title}>Severity Level</Text>
        <Text style={styles.value}>{severity_label}</Text>
        <Text style={styles.subValue}>
          {Math.round(severity_score * 100)}% Affected
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Detected Diseases</Text>
        {predictions?.map((p, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.className}>{p.class_name}</Text>
            <Text style={styles.conf}>{Math.round(p.confidence * 100)}%</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ---------- STYLES ----------
const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#F8FBFE", flex: 1 },
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
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "#90CAF9",
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#E3F2FD",
  },

  title: { fontSize: 18, fontWeight: "700", color: "#0D47A1" },
  value: { fontSize: 22, fontWeight: "900", color: "#1565C0", marginTop: 6 },
  subValue: { fontSize: 14, color: "#4CAF50", marginTop: 4 },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
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

  className: { fontSize: 16, fontWeight: "600", color: "#1F2937" },
  conf: { fontSize: 16, fontWeight: "800", color: "#1565C0" },
});
