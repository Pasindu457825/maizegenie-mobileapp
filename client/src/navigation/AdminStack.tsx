import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AdminDashboard from "../screens/AdminPanel/AdminDashboard";
import AdminPanelScreen from "../screens/AdminPanel/PriceForecast/AdminPanelScreen";
// Add more admin screens…

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      <Stack.Screen name="AdminPriceUpdate" component={AdminPanelScreen} />

      {/* Add more screens here later */}
    </Stack.Navigator>
  );
}
