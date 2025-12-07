import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import DiseaseIdentificationScreen from "@screens/DiseaseIdentification/DiseaseIdentificationScreen";
import ChatScreen from "@screens/DiseaseIdentification/ChatScreen";
import OfficerRoomsScreen from "@screens/DiseaseIdentification/OfficerRoomsScreen";

export type DiseaseIdentifyStackParamList = {
  DiseaseDetection: undefined;

  Chat: {
    roomId: string | null;
    userId: string;
  };

  OfficerRooms: {
    officerId: string;
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
    </Stack.Navigator>
  );
}
