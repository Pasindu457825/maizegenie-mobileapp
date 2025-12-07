import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomNavigator from "./BottomNavigator";
import LoginScreen from "../screens/LoginScreen";
// import SignupScreen from "../screens/SignupScreen";
import { ROUTES } from "../constants";

type RootStackParamList = {
  [ROUTES.AUTH.LOGIN]: undefined;
  [ROUTES.AUTH.SIGNUP]: undefined;
  [ROUTES.ROOT.MAIN]: undefined;
  [ROUTES.ROOT.MODAL]: { id: string } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* AUTH SCREENS */}
      <Stack.Screen name={ROUTES.AUTH.LOGIN} component={LoginScreen} />
      {/* <Stack.Screen name={ROUTES.AUTH.SIGNUP} component={SignupScreen} /> */}

      {/* MAIN APPLICATION (BOTTOM TABS) */}
      <Stack.Screen name={ROUTES.ROOT.MAIN} component={BottomNavigator} />
    </Stack.Navigator>
  );
}
