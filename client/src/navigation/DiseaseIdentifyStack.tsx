import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import DiseaseIdentificationScreen from "@screens/DiseaseIdentification/DiseaseIdentificationScreen";
import ChatScreen from "@screens/DiseaseIdentification/ChatScreen"; // ✅ Add this

export type DiseaseIdentifyStackParamList = {
  DiseaseDetection: undefined;
  Chat: undefined; // ✅ add chat route type
};

const Stack = createStackNavigator<DiseaseIdentifyStackParamList>();

export default function DiseaseIdentifyStack() {
  return (
    <Stack.Navigator
      initialRouteName="DiseaseDetection"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="DiseaseDetection"
        component={DiseaseIdentificationScreen}
      />

      {/* ✅ Chat Screen added here */}
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}
