import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import DiseaseIdentificationScreen from "@screens/DiseaseIdentification/DiseaseIdentificationScreen";
import ChatScreen from "@screens/DiseaseIdentification/ChatScreen";
import OfficerRoomsScreen from "@screens/DiseaseIdentification/OfficerRoomsScreen";
import SeverityDetailsScreen from "@screens/DiseaseIdentification/SeverityDetailsScreen";

// ---- NEW TYPE FOR PREDICTIONS ----
type Prediction = {
  class_id: number;
  class_name: string;
  confidence: number;
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

  // ---- NEW SCREEN ----
  SeverityDetails: {
    image: string | null;
    severity_score: number;
    severity_label: string;
    predictions: Prediction[];
  };
};

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

      {/* ---- NEW SCREEN ---- */}
      <Stack.Screen name="SeverityDetails" component={SeverityDetailsScreen} />
    </Stack.Navigator>
  );
}
