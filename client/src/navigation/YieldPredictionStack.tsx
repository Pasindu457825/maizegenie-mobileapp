import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Farmer Screens
import YieldPredictionLoadingScreen from "../screens/YieldPrediction/YieldPredictionLoadingScreen";
import YieldPredictionFormScreen from "../screens/YieldPrediction/YieldPredictionFarmerFormScreen";
import YieldPredictionResultsScreen from "../screens/YieldPrediction/YieldPredictionFarmerResultsScreen";

// Officer Screens
import YieldPredictionOfficerFormScreen from "../screens/YieldPrediction/YieldPredictionOfficerFormScreen";
import YieldPredictionOfficerResultsScreen from "../screens/YieldPrediction/YieldPredictionOfficerResultsScreen";

// Fertilizer Advisor Screens - Farmer Side
import FertilizerAdvisorLandingScreen from "../screens/FertilizerAdvisor/FertilizerAdvisorFarmerLandingScreen";
import NLPAdvisoryInputScreen from "../screens/FertilizerAdvisor/NLPAdvisoryFarmer/NLPAdvisoryFarmerInputScreen";
import NLPAdvisoryResultsScreen from "../screens/FertilizerAdvisor/NLPAdvisoryFarmer/NLPAdvisoryFarmerResultsScreen";

export type YieldPredictionStackParamList = {
  YieldPredictionLoadingScreen: undefined;
  YieldPredictionFormScreen: { role: 'farmer' | 'officer'; language: 'si' | 'en' };
  YieldPredictionResultsScreen: { data: any; language: 'si' | 'en' };
  YieldPredictionOfficerFormScreen: { language: 'si' | 'en' };
  YieldPredictionOfficerResultsScreen: { data: any; language: 'si' | 'en' };
  FertilizerAdvisorLanding: undefined;
  NLPAdvisoryInputScreen: undefined;
  NLPAdvisoryResultsScreen: { data: any; language: 'si' | 'en' };
};

const Stack = createNativeStackNavigator<YieldPredictionStackParamList>();

export default function YieldPredictionStack() {
  return (
    <Stack.Navigator
      initialRouteName="YieldPredictionLoadingScreen"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name="YieldPredictionLoadingScreen"
        component={YieldPredictionLoadingScreen}
      />
      <Stack.Screen
        name="YieldPredictionFormScreen"
        component={YieldPredictionFormScreen}
      />
      <Stack.Screen
        name="YieldPredictionResultsScreen"
        component={YieldPredictionResultsScreen}
      />
      <Stack.Screen
        name="YieldPredictionOfficerFormScreen"
        component={YieldPredictionOfficerFormScreen}
      />
      <Stack.Screen
        name="YieldPredictionOfficerResultsScreen"
        component={YieldPredictionOfficerResultsScreen}
      />
      <Stack.Screen
        name="FertilizerAdvisorLanding"
        component={FertilizerAdvisorLandingScreen}
      />
      <Stack.Screen
        name="NLPAdvisoryInputScreen"
        component={NLPAdvisoryInputScreen}
      />
      <Stack.Screen
        name="NLPAdvisoryResultsScreen"
        component={NLPAdvisoryResultsScreen}
      />
    </Stack.Navigator>
  );
}
