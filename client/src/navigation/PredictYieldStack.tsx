import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { YieldFormProvider } from "../contexts/YieldFormContext";
import { LocationFieldScreen } from "../screens/YieldPrediction/LocationFieldScreen";
import { CropInformationScreen } from "../screens/YieldPrediction/CropInformationScreen";
import { WeatherConditionScreen } from "../screens/YieldPrediction/WeatherConditionScreen";
import PredictYieldLoadingScreen from "../screens/PredictYield/PredictYieldLoadingScreen";
import PredictYieldResultsScreen from "../screens/PredictYield/PredictYieldResultsScreen";
import LanguageSelectionScreen from "../screens/PredictYield/LanguageSelectionScreen";
import { ROUTES } from "../constants";
import { YieldPredictionRequest, YieldPredictionFormData, YieldPredictionResponse } from "../types/yieldPrediction";

export type PredictYieldStackParamList = {
    [ROUTES.TABS.PREDICTYIELD]: undefined;
    LanguageSelection: undefined;
    LocationField: { language?: 'si' | 'en' };
    CropInformation: undefined;
    WeatherCondition: undefined;
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
                <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
                <Stack.Screen name="LocationField" component={LocationFieldScreen} />
                <Stack.Screen name="CropInformation" component={CropInformationScreen} />
                <Stack.Screen name="WeatherCondition" component={WeatherConditionScreen} />
                <Stack.Screen name="PredictYieldLoading" component={PredictYieldLoadingScreen} />
                <Stack.Screen name="PredictYieldScreen" component={PredictYieldResultsScreen} />
            </Stack.Navigator>
        </YieldFormProvider>
    );
}
