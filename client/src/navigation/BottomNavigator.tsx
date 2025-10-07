import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import BookingsScreen from "../screens/BookingsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { ROUTES } from "../constants";
import PriceForecastLoadingScreen from "@screens/PriceForecast/PriceForecastLoadingScreen";

export type TabsParamList = {
  [ROUTES.TABS.HOME]: undefined;
  [ROUTES.TABS.BOOKINGS]: undefined;
  [ROUTES.TABS.SETTINGS]: undefined;
  [ROUTES.TABS.PRICEFORECAST]: undefined;
};

const Tab = createBottomTabNavigator<TabsParamList>();

export default function BottomNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name={ROUTES.TABS.HOME} component={HomeScreen} />
      <Tab.Screen name={ROUTES.TABS.BOOKINGS} component={BookingsScreen} />
      <Tab.Screen name={ROUTES.TABS.SETTINGS} component={SettingsScreen} />
      <Tab.Screen name={ROUTES.TABS.PRICEFORECAST} component={PriceForecastLoadingScreen} />
    </Tab.Navigator>
  );
}
