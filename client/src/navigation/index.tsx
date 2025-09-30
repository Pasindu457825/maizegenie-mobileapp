import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomNavigator from "./BottomNavigator";
import { ROUTES } from "../constants";

type RootStackParamList = {
  [ROUTES.ROOT.MAIN]: undefined;
  [ROUTES.ROOT.MODAL]: { id: string } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.ROOT.MAIN} component={BottomNavigator} />
      {/* example place for modal or details screen later */}
    </Stack.Navigator>
  );
}
