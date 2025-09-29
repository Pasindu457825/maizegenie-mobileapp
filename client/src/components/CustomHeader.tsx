import React from "react";
import { View, StyleSheet } from "react-native";
import { colors, radius, spacing } from "../theme";
import ThemedText from "./ThemedText";

export default function CustomHeader({ title }: { title: string }) {
  return (
    <View style={styles.wrapper}>
      <ThemedText style={styles.title}>🌽 {title}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    paddingVertical: spacing(1.5),
    paddingHorizontal: spacing(2),
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  title: { fontSize: 20, fontWeight: "800", color: colors.primaryDark },
});
