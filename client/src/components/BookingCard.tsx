import React from "react";
import { View, StyleSheet } from "react-native";
import Card from "./Card";
import ThemedText from "./ThemedText";
import { spacing } from "../theme";

export default function BookingCard({ id, title, date }: { id: string; title: string; date: string }) {
  return (
    <Card style={styles.card}>
      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText style={styles.sub}>#{id} • {date}</ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing(1.5) },
  title: { fontSize: 16, fontWeight: "700" },
  sub: { marginTop: 4, opacity: 0.7 },
});
