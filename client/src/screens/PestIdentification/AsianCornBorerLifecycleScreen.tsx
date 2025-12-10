import React from "react";
import { View, Text, Image, ScrollView, StyleSheet } from "react-native";

const stages = [
  {
    key: "egg",
    label: "Egg",
    image: require("../../../assets/pest_lifecycle/asiancornborer/asian_egg.jpg"),
    description: "Eggs are laid in groups on the underside of leaves, appearing like fish scales.",
  },
  {
    key: "larva",
    label: "Larva",
    image: require("../../../assets/pest_lifecycle/asiancornborer/asian_larva.jpg"),
    description: "Larvae (caterpillars) bore into stems and cause major damage to the corn plant.",
  },
  {
    key: "pupa",
    label: "Pupa",
    image: require("../../../assets/pest_lifecycle/asiancornborer/asian_pupa.jpg"),
    description: "Pupation usually takes place inside the stem or in crop debris.",
  },
  {
    key: "adult",
    label: "Adult (Moth)",
    image: require("../../../assets/pest_lifecycle/asiancornborer/asian_adult.jpg"),
    description: "Adults are small moths that fly at night and lay eggs to continue the cycle.",
  },
];

export default function AsianCornBorerLifecycleScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Asian Corn Borer Lifecycle</Text>
      {stages.map((stage) => (
        <View key={stage.key} style={styles.stageBox}>
          <Image source={stage.image} style={styles.stageImage} />
          <Text style={styles.stageTitle}>{stage.label}</Text>
          <Text style={styles.stageDesc}>{stage.description}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginVertical: 16 },
  stageBox: { marginBottom: 32, alignItems: "center" },
  stageImage: { width: 220, height: 160, borderRadius: 12, marginBottom: 10, resizeMode: "cover" },
  stageTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 4 },
  stageDesc: { fontSize: 15, color: "#444", textAlign: "center" },
});
