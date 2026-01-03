import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AdminDashboard from "../screens/AdminPanel/AdminDashboard";
import AdminPanelScreen from "../screens/AdminPanel/PriceForecast/AdminPanelScreen";
import AdminAddOfficialNewsScreen from "../screens/AdminPanel/AdminAddOfficialNewsScreen";
import AdminEditOfficialNewsScreen from "@screens/AdminPanel/AdminEditOfficialNewsScreen";

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      <Stack.Screen name="AdminPriceUpdate" component={AdminPanelScreen} />
      

      <Stack.Screen
        name="AdminAddOfficialNews"
        component={AdminAddOfficialNewsScreen}
      />
            <Stack.Screen
        name="AdminEditOfficialNews"
        component={AdminEditOfficialNewsScreen}
      />
    </Stack.Navigator>
  );
}
