import React from "react";
import { View, Text, Image, ScrollView, StyleSheet } from "react-native";

const stages = [
  {
    key: "egg",
    label: "Egg",
    image: require("../../../assets/pest_lifecycle/fallarmyworm/fall_egg.png"),
    description: "Eggs are laid in clusters, usually on the underside of leaves.",
  },
  {
    key: "larva",
    label: "Larva",
    image: require("../../../assets/pest_lifecycle/fallarmyworm/fall_larva.png"),
    description: "Larvae (caterpillars) are the damaging stage, feeding on plant leaves.",
  },
  {
    key: "pupa",
    label: "Pupa",
    image: require("../../../assets/pest_lifecycle/fallarmyworm/fall_pupa.png"),
    description: "Pupa stage occurs in the soil. The caterpillar transforms into an adult.",
  },
  {
    key: "adult",
    label: "Adult (Moth)",
    image: require("../../../assets/pest_lifecycle/fallarmyworm/fall_adult.png"),
    description: "The adult is a moth that lays eggs to start the cycle again.",
  },
];

export default function FallArmywormLifecycleScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Fall Armyworm Lifecycle</Text>
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
