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
import RuleBasedAdvisoryInputScreen from "../screens/FertilizerAdvisor/RuleBasedAdvisoryFarmer/FertilizerAdvisoryFarmerInputScreen";
import RuleBasedAdvisoryResultsScreen from "../screens/FertilizerAdvisor/RuleBasedAdvisoryFarmer/FertilizerAdvisoryFarmerResultsScreen";

// Fertilizer Advisor Screens - Officer Side
import FertilizerAdvisorOfficerLandingScreen from "../screens/FertilizerAdvisor/FertilizerAdvisorOfficerLandingScreen";
import OfficerAdvisoryInputScreen from "../screens/FertilizerAdvisor/RuleBasedAdviceHelperOfficer/OfficerAdvisoryInputScreen";
import OfficerAdvisoryResultsScreen from "../screens/FertilizerAdvisor/RuleBasedAdviceHelperOfficer/OfficerAdvisoryResultsScreen";

// Advice Requests Screen
import FarmerAdviceRequestsScreen from "../screens/YieldPrediction/FarmerAdviceRequestsScreen";
import ViewAdviceRequestDetailsScreen from "../screens/YieldPrediction/ViewAdviceRequestDetailsScreen";
import ProvideAdviceScreen from "../screens/YieldPrediction/ProvideAdviceScreen";

export type YieldPredictionStackParamList = {
  YieldPredictionLoadingScreen: undefined;
  YieldPredictionFormScreen: { role: 'farmer' | 'officer'; language: 'si' | 'en' };
  YieldPredictionResultsScreen: { 
    data: any; 
    language: 'si' | 'en';
    farmerInput?: {
      district?: string;
      location?: string;
      variety?: string;
      field_size_ha?: number;
      irrigation_type?: string;
      rainfall_condition?: string;
      planting_date?: string;
    };
  };
  YieldPredictionOfficerFormScreen: { language: 'si' | 'en' };
  YieldPredictionOfficerResultsScreen: { data: any; language: 'si' | 'en'; requestData?: any };
  FertilizerAdvisorLanding: undefined;
  FertilizerAdvisorOfficerLanding: undefined;
  RuleBasedAdvisoryInputScreen: undefined;
  RuleBasedAdvisoryResultsScreen: { data: any; language: 'si' | 'en' };
  OfficerAdvisoryInputScreen: undefined;
  OfficerAdvisoryResultsScreen: { data: any; language: 'si' | 'en' };
  FarmerAdviceRequestsScreen: undefined;
  ViewAdviceRequestDetailsScreen: { requestId: string };
  ProvideAdviceScreen: { requestId: string };
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
        name="FertilizerAdvisorOfficerLanding"
        component={FertilizerAdvisorOfficerLandingScreen}
      />
      <Stack.Screen
        name="RuleBasedAdvisoryInputScreen"
        component={RuleBasedAdvisoryInputScreen}
      />
      <Stack.Screen
        name="RuleBasedAdvisoryResultsScreen"
        component={RuleBasedAdvisoryResultsScreen}
      />
      <Stack.Screen
        name="OfficerAdvisoryInputScreen"
        component={OfficerAdvisoryInputScreen}
      />
      <Stack.Screen
        name="OfficerAdvisoryResultsScreen"
        component={OfficerAdvisoryResultsScreen}
      />
      <Stack.Screen
        name="FarmerAdviceRequestsScreen"
        component={FarmerAdviceRequestsScreen}
      />
      <Stack.Screen
        name="ViewAdviceRequestDetailsScreen"
        component={ViewAdviceRequestDetailsScreen}
      />
      <Stack.Screen
        name="ProvideAdviceScreen"
        component={ProvideAdviceScreen}
      />
    </Stack.Navigator>
  );
}
