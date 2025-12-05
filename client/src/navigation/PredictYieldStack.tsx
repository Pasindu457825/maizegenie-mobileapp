import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { YieldFormProvider } from "../contexts/YieldFormContext";
import { LocationFieldScreen } from "../screens/YieldPrediction/FamerUI/LocationFieldScreen";
import { CropInformationScreen } from "../screens/YieldPrediction/FamerUI/CropInformationScreen";
import { WeatherConditionScreen } from "../screens/YieldPrediction/FamerUI/WeatherConditionScreen";
import { SoilProfileScreen, ClimateScreen, CropMeasurementsScreen, FertilizerSchedulingScreen } from "../screens/YieldPrediction/OfficerUI";
import PredictYieldLoadingScreen from "../screens/PredictYield/PredictYieldLoadingScreen";
import PredictYieldResultsScreen from "../screens/PredictYield/PredictYieldResultsScreen";
import LanguageSelectionScreen from "../screens/PredictYield/LanguageSelectionScreen";
import { ROUTES } from "../constants";
import { YieldPredictionRequest, YieldPredictionFormData, YieldPredictionResponse } from "../types/farmerYieldPrediction";

export type PredictYieldStackParamList = {
    [ROUTES.TABS.PREDICTYIELD]: undefined;
    LanguageSelection: undefined;
    // Farmer Flow
    LocationField: { language?: 'si' | 'en' };
    CropInformation: undefined;
    WeatherCondition: undefined;
    // Officer Flow
    OfficerSoilProfile: { language?: 'si' | 'en' };
    OfficerClimate: undefined;
    OfficerCropMeasurements: undefined;
    OfficerFertilizer: undefined;
    // Common
    PredictYieldLoading: {
        payload: YieldPredictionRequest;
        formData: YieldPredictionFormData;
    };
    PredictYieldScreen: {
        result: YieldPredictionResponse;
        formData: YieldPredictionFormData;
    };
};

const Stack = createNativeStackNavigator<PredictYieldStackParamList>();

export default function PredictYieldStack() {
    return (
        <YieldFormProvider>
            <Stack.Navigator 
                initialRouteName="LanguageSelection"
                screenOptions={{ headerShown: false }}
            >
                {/* Language & Role Selection */}
                <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
                
                {/* Farmer Flow */}
                <Stack.Screen name="LocationField" component={LocationFieldScreen} />
                <Stack.Screen name="CropInformation" component={CropInformationScreen} />
                <Stack.Screen name="WeatherCondition" component={WeatherConditionScreen} />
                
                {/* Officer Flow */}
                <Stack.Screen name="OfficerSoilProfile" component={SoilProfileScreen} />
                <Stack.Screen name="OfficerClimate" component={ClimateScreen} />
                <Stack.Screen name="OfficerCropMeasurements" component={CropMeasurementsScreen} />
                <Stack.Screen name="OfficerFertilizer" component={FertilizerSchedulingScreen} />
                
                {/* Common Screens */}
                <Stack.Screen name="PredictYieldLoading" component={PredictYieldLoadingScreen} />
                <Stack.Screen name="PredictYieldScreen" component={PredictYieldResultsScreen} />
            </Stack.Navigator>
        </YieldFormProvider>
    );
}
