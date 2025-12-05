import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import DiseaseIdentificationScreen from "@screens/DiseaseIdentification/DiseaseIdentificationScreen"; 
// 🔹 adjust the import path if your folder is different

export type DiseaseIdentifyStackParamList = {
  DiseaseDetection: undefined;
  // add other screens later, e.g.:
  // DiseaseResult: { id: string };
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
      <Stack.Screen name="DiseaseDetection" component={DiseaseIdentificationScreen} />
      {/* Add more screens (e.g., DiseaseResult) when ready */}
    </Stack.Navigator>
  );
}
