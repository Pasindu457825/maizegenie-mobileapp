import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/HomeScreen";
import PriceForecastStack from "./PriceForecastStack";
import { ROUTES } from "../constants";

export type TabsParamList = {
  [ROUTES.TABS.HOME]: undefined;
  [ROUTES.TABS.PRICEFORECAST]: undefined;
  [ROUTES.TABS.PESTIDENTIFIER]: undefined;
  [ROUTES.TABS.DISEASEIDENTIFIER]: undefined;
  [ROUTES.TABS.FERTILIZERADVISOR]: undefined;
  [ROUTES.TABS.USERPROFILE]: undefined;
};

const Tab = createBottomTabNavigator<TabsParamList>();

export default function BottomNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#22c55e", // Green active color
        tabBarInactiveTintColor: "#64748b", // Gray inactive color
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#e2e8f0",
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name={ROUTES.TABS.HOME}
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.TABS.PESTIDENTIFIER}
        component={HomeScreen}
        options={{
          tabBarLabel: "Pests",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bug-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.TABS.DISEASEIDENTIFIER}
        component={HomeScreen}
        options={{
          tabBarLabel: "Disease",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="medical-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.TABS.FERTILIZERADVISOR}
        component={HomeScreen}
        options={{
          tabBarLabel: "Fertilizer",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="leaf-outline" size={size} color={color} />
          ),
        }}
      />
       <Tab.Screen
        name={ROUTES.TABS.PRICEFORECAST}
        component={PriceForecastStack}
        options={{
          tabBarLabel: "Price",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-up-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.TABS.USERPROFILE}
        component={HomeScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
    
    </Tab.Navigator>
  );
}