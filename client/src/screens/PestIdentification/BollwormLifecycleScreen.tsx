import React from "react";
import { View, Text, Image, ScrollView, StyleSheet } from "react-native";

const stages = [
  {
    key: "egg",
    label: "Egg",
    image: require("../../../assets/pest_lifecycle/bollworm/boll_egg.jpg"),
    description: "Bollworm eggs are tiny, laid singly on leaves, buds, or fruits.",
  },
  {
    key: "larva",
    label: "Larva",
    image: require("../../../assets/pest_lifecycle/bollworm/boll_larva.jpg"),
    description: "The larva (caterpillar) feeds on leaves and bores into buds and fruits causing major crop damage.",
  },
  {
    key: "pupa",
    label: "Pupa",
    image: require("../../../assets/pest_lifecycle/bollworm/boll_pupa.png"),
    description: "Pupation occurs in the soil or plant debris, where the larva transforms into an adult.",
  },
  {
    key: "adult",
    label: "Adult (Moth)",
    image: require("../../../assets/pest_lifecycle/bollworm/boll_adult.png"),
    description: "The adult moth is pale brown. It lays eggs and starts the lifecycle again.",
  },
];

export default function BollwormLifecycleScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Bollworm Lifecycle</Text>
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
