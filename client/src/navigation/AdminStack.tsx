import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AdminPanelScreen from "../screens/AdminPanel/PriceForecast/AdminPanelScreen";
import AdminAddOfficialNewsScreen from "../screens/AdminPanel/AdminAddOfficialNewsScreen";
import AdminEditOfficialNewsScreen from "@screens/AdminPanel/AdminEditOfficialNewsScreen";
import ProAdvisorAdminAddScreen from "@screens/AdminPanel/ProAdvisor/ProAdvisorAdminAddScreen";
import ProAdvisorAdminEditScreen from "@screens/AdminPanel/ProAdvisor/ProAdvisorAdminEditScreen";

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminPriceUpdate" component={AdminPanelScreen} />
      

      <Stack.Screen
        name="AdminAddOfficialNews"
        component={AdminAddOfficialNewsScreen}
      />
            <Stack.Screen
        name="AdminEditOfficialNews"
        component={AdminEditOfficialNewsScreen}
      />
            <Stack.Screen
        name="ProAdvisorAdminAdd"
        component={ProAdvisorAdminAddScreen}
      />
            <Stack.Screen
        name="ProAdvisorAdminEdit"
        component={ProAdvisorAdminEditScreen}
      />
    </Stack.Navigator>
  );
}
