import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import PriceForecastStack from "./PriceForecastStack";
import PestIdentifyStack from "./PestIdentifyStack";
import DiseaseIdentifyStack from "./DiseaseIdentifyStack";
import YieldPredictionStack from "./YieldPredictionStack";
import { ROUTES } from "../constants";
import { useLanguage } from "../context/LanguageContext";

export type TabsParamList = {
  [ROUTES.TABS.HOME]: undefined;
  [ROUTES.TABS.PESTIDENTIFIER]: undefined;
  [ROUTES.TABS.DISEASEIDENTIFIER]: undefined;
  [ROUTES.TABS.PREDICTYIELD]: undefined;
  [ROUTES.TABS.PRICEFORECAST]: undefined;
  [ROUTES.TABS.USERPROFILE]: undefined;
  [ROUTES.TABS.ADMINPANEL]: undefined;
};

const Tab = createBottomTabNavigator<TabsParamList>();

export default function BottomNavigator() {
  const insets = useSafeAreaInsets();
  const { language } = useLanguage();

  const tabLabels = {
    english: {
      home: "Home",
      pests: "Pests",
      disease: "Disease",
      yield: "Yield",
      price: "Price",
      profile: "Profile",
    },
    sinhala: {
      home: "මුල් පිටුව",
      pests: "පළිබෝධ",
      disease: "රෝග",
      yield: "අස්වැන්න",
      price: "මිල",
      profile: "විස්තර",
    },
    tamil: {
      home: "முகப்பு",
      pests: "பூச்சிகள்",
      disease: "நோய்",
      yield: "மகசூல்",
      price: "விலை",
      profile: "சுயவிவரம்",
    },
  } as const;

  const labels = tabLabels[language];

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
          height: 45 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
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
          tabBarLabel: labels.home,
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
          tabBarLabel: labels.pests,
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
          tabBarLabel: labels.disease,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="leaf-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 🌽 Yield */}
      <Tab.Screen
        name={ROUTES.TABS.PREDICTYIELD}
        component={YieldPredictionStack}
        options={{
          tabBarLabel: labels.yield,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 💹 Price */}
      <Tab.Screen
        name={ROUTES.TABS.PRICEFORECAST}
        component={PriceForecastStack}
        options={{
          tabBarLabel: labels.price,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-up-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 👤 Profile */}
      <Tab.Screen
        name={ROUTES.TABS.USERPROFILE}
        component={ProfileScreen}
        options={{
          tabBarLabel: labels.profile,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
