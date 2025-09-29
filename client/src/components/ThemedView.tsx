import React from "react";
import { View, ViewProps } from "react-native";
import { colors } from "../theme";

export default function ThemedView(props: ViewProps) {
  return <View {...props} style={[{ backgroundColor: colors.bg }, props.style]} />;
}
