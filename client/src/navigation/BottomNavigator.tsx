import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import PriceForecastStack from "./PriceForecastStack";
import PredictYieldStack from "./PredictYieldStack";
import PestIdentifyStack from "./PestIdentifyStack";
import DiseaseIdentifyStack from "./DiseaseIdentifyStack";
import FertilizerAdvisorStack from "./FertilizerAdvisorStack";
import AdminStack from "./AdminStack";
import { ROUTES } from "../constants";

export type TabsParamList = {
  [ROUTES.TABS.HOME]: undefined;
  [ROUTES.TABS.PESTIDENTIFIER]: undefined;
  [ROUTES.TABS.DISEASEIDENTIFIER]: undefined;
  [ROUTES.TABS.FERTILIZERADVISOR]: undefined;
  [ROUTES.TABS.PREDICTYIELD]: undefined;
  [ROUTES.TABS.PRICEFORECAST]: undefined;
  [ROUTES.TABS.USERPROFILE]: undefined;
  [ROUTES.TABS.ADMINPANEL]: undefined; // <-- NEW
};

const Tab = createBottomTabNavigator<TabsParamList>();

export default function BottomNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#22c55e",
        tabBarInactiveTintColor: "#64748b",
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
      {/* 🏠 Home */}
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

      {/* 🐛 Pest */}
      <Tab.Screen
        name={ROUTES.TABS.PESTIDENTIFIER}
        component={PestIdentifyStack}
        options={{
          tabBarLabel: "Pests",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bug-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 🌿 Disease */}
      <Tab.Screen
        name={ROUTES.TABS.DISEASEIDENTIFIER}
        component={DiseaseIdentifyStack}
        options={{
          tabBarLabel: "Disease",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="medical-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 🧪 Fertilizer */}
      <Tab.Screen
        name={ROUTES.TABS.FERTILIZERADVISOR}
        component={FertilizerAdvisorStack}
        options={{
          tabBarLabel: "Fertilizer",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="leaf-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 🌾 Yield */}
      <Tab.Screen
        name={ROUTES.TABS.PREDICTYIELD}
        component={PredictYieldStack}
        options={{
          tabBarLabel: "Yield",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="analytics-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 💹 Price */}
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

      {/* 👤 Profile */}
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

      {/* 🛠 Admin Panel */}
      <Tab.Screen
        name={ROUTES.TABS.ADMINPANEL}
        component={AdminStack} // <-- replace single screen with whole stack
        options={{
          tabBarLabel: "Admin",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="shield-checkmark-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
