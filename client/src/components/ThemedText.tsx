import React from "react";
import { Text, TextProps } from "react-native";
import { colors } from "../theme";

export default function ThemedText(props: TextProps) {
  return <Text {...props} style={[{ color: colors.text }, props.style]} />;
}
