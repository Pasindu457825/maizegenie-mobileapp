import React from "react";
import { StyleSheet, View } from "react-native";
import ThemedText from "../components/ThemedText";
import CustomHeader from "../components/CustomHeader";
import CustomButton from "../components/CustomButton";
import { useTheme } from "../hooks/useTheme";
import { spacing } from "../theme";

export default function SettingsScreen() {
  const { scheme, toggle } = useTheme();
  return (
    <View style={styles.container}>
      <CustomHeader title="Settings" />
      <View style={styles.body}>
        <ThemedText>Theme: {scheme}</ThemedText>
        <CustomButton label="Toggle Theme" onPress={toggle} variant="outline" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { flex: 1, padding: spacing(2), gap: spacing(2), alignItems: "center", justifyContent: "center" },
});
