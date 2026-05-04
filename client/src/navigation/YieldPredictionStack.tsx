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

// Knowledge Bank Screens
import KnowledgeBankMainScreen from "../screens/FertilizerAdvisor/KnowledgeBank/KnowledgeBankMainScreen";
import NutrientDeficiencyScreen from "../screens/FertilizerAdvisor/KnowledgeBank/NutrientDeficiencyScreen";

// Advice Requests Screen
import FarmerAdviceRequestsScreen from "../screens/YieldPrediction/FarmerAdviceRequestsScreen";
import ViewAdviceRequestDetailsScreen from "../screens/YieldPrediction/ViewAdviceRequestDetailsScreen";
import ProvideAdviceScreen from "../screens/YieldPrediction/ProvideAdviceScreen";
import MyAdviceRequestsScreen from "../screens/YieldPrediction/MyAdviceRequestsScreen";

// Soil Test Request Screen
import SoilTestRequestScreen from "../screens/YieldPrediction/SoilTestRequestScreen";

// Edit Fertilizer Plans Screens
import EditFertilizerPlansScreen from "../screens/YieldPrediction/EditFertilizerPlansScreen";
import EditFertilizerPlanDetailScreen from "../screens/YieldPrediction/EditFertilizerPlanDetailScreen";

// Wet Weight Prediction Screens (Officer Only)
import WetWeightPredictionFormScreen from "../screens/YieldPrediction/WetWeightPredictionFormScreen";
import WetWeightPredictionResultsScreen from "../screens/YieldPrediction/WetWeightPredictionResultsScreen";
import WetWeightVarietyComparisonScreen from "../screens/YieldPrediction/WetWeightVarietyComparisonScreen";
import WetWeightTrialHistoryScreen from "../screens/YieldPrediction/WetWeightTrialHistoryScreen";

// Fertilizer Guide Screen
import FertilizerGuideMainScreen from "../screens/YieldPrediction/FertilizerGuideMain";

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
  KnowledgeBankMain: undefined;
  NutrientDeficiency: undefined;
  FarmerAdviceRequestsScreen: undefined;
  ViewAdviceRequestDetailsScreen: { requestId: string };
  ProvideAdviceScreen: { requestId: string };
  MyAdviceRequestsScreen: undefined;
  SoilTestRequest: undefined;
  EditFertilizerPlans: undefined;
  EditFertilizerPlanDetail: { plan: any; isFromSupabase?: boolean };
  WetWeightPredictionForm: undefined;
  WetWeightPredictionResults: {
    data: any;
    meta?: {
      trial_name?: string;
      field_block_id?: string;
      replicate_number?: string;
      plot_number?: number;
      plot_area_m2?: number;
      seed_variety?: string;
    };
  };
  WetWeightVarietyComparison: {
    baseInputs: {
      cob_height_cm: number;
      plant_height_cm: number;
      cob_wet_weight_g: number;
      cob_length_cm: number;
      num_seed_rows: number;
      plot_area_m2?: number;
    };
    currentVariety: string;
    currentResult: number;
  };
  WetWeightTrialHistory: undefined;
  FertilizerGuideMain: undefined;
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
        name="KnowledgeBankMain"
        component={KnowledgeBankMainScreen}
      />
      <Stack.Screen
        name="NutrientDeficiency"
        component={NutrientDeficiencyScreen}
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
      <Stack.Screen
        name="MyAdviceRequestsScreen"
        component={MyAdviceRequestsScreen}
      />
      <Stack.Screen
        name="SoilTestRequest"
        component={SoilTestRequestScreen}
      />
      <Stack.Screen
        name="EditFertilizerPlans"
        component={EditFertilizerPlansScreen}
      />
      <Stack.Screen
        name="EditFertilizerPlanDetail"
        component={EditFertilizerPlanDetailScreen}
      />
      <Stack.Screen
        name="WetWeightPredictionForm"
        component={WetWeightPredictionFormScreen}
      />
      <Stack.Screen
        name="WetWeightPredictionResults"
        component={WetWeightPredictionResultsScreen}
      />
      <Stack.Screen
        name="WetWeightVarietyComparison"
        component={WetWeightVarietyComparisonScreen}
      />
      <Stack.Screen
        name="WetWeightTrialHistory"
        component={WetWeightTrialHistoryScreen}
      />
      <Stack.Screen
        name="FertilizerGuideMain"
        component={FertilizerGuideMainScreen}
      />
    </Stack.Navigator>
  );
}
