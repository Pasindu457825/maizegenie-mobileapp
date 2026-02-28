import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import type { StackNavigationProp } from "@react-navigation/stack"; // ✅ needed for other screens

import DiseaseIdentificationScreen from "@screens/DiseaseIdentification/DiseaseIdentificationScreen";
import ChatScreen from "@screens/DiseaseIdentification/ChatScreen";
import OfficerRoomsScreen from "@screens/DiseaseIdentification/OfficerRoomsScreen";
import SeverityDetailsScreen from "@screens/DiseaseIdentification/SeverityDetailsScreen";
import DiseaseInfoScreen from "@screens/DiseaseIdentification/DiseaseInfoScreen"; // ✅ NEW SCREEN IMPORT

// ---------------- TYPES ----------------
export type Prediction = {
  class_id: number;
  class_name: string;
  confidence: number;
  box_xyxy?: number[];
  impact_boxes?: number[][];
};

export type DiseaseIdentifyStackParamList = {
  DiseaseDetection: undefined;

  Chat: {
    roomId: string | null;
    userId: string;
  };

  OfficerRooms: {
    officerId: string;
  };

  SeverityDetails: {
    image: string | null;
    severity_score: number;
    severity_label: string;
    predictions: Prediction[];
    diseaseNameEn?: string;
    diseaseNameSi?: string;
    diseaseNameTa?: string;
  };

  DiseaseInfo: {
    predictions: Prediction[];
    severity_label: string;
  };
};

// ---------------- STACK ----------------
const Stack = createStackNavigator<DiseaseIdentifyStackParamList>();

export default function DiseaseIdentifyStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="DiseaseDetection"
        component={DiseaseIdentificationScreen}
      />

      <Stack.Screen name="Chat" component={ChatScreen} />

      <Stack.Screen name="OfficerRooms" component={OfficerRoomsScreen} />

      <Stack.Screen name="SeverityDetails" component={SeverityDetailsScreen} />

      {/* ✅ NEW: FULL DISEASE DETAILS SCREEN */}
      <Stack.Screen name="DiseaseInfo" component={DiseaseInfoScreen} />
    </Stack.Navigator>
  );
}
