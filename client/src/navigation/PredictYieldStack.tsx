import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { YieldFormProvider } from "../contexts/YieldFormContext";
import { LocationFieldScreen } from "../screens/YieldPrediction/LocationFieldScreen";
import { CropInformationScreen } from "../screens/YieldPrediction/CropInformationScreen";
import { WeatherConditionScreen } from "../screens/YieldPrediction/WeatherConditionScreen";
import PredictYieldLoadingScreen from "../screens/PredictYield/PredictYieldLoadingScreen";
import PredictYieldResultsScreen from "../screens/PredictYield/PredictYieldResultsScreen";
import { ROUTES } from "../constants";
import { YieldPredictionRequest, YieldPredictionFormData, YieldPredictionResponse } from "../types/yieldPrediction";

type PredictYieldStackParamList = {
    [ROUTES.TABS.PREDICTYIELD]: undefined;
    LocationField: undefined;
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
                initialRouteName="LocationField"
                screenOptions={{ headerShown: false }}
            >
                <Stack.Screen name="LocationField" component={LocationFieldScreen} />
                <Stack.Screen name="CropInformation" component={CropInformationScreen} />
                <Stack.Screen name="WeatherCondition" component={WeatherConditionScreen} />
                <Stack.Screen name="PredictYieldLoading" component={PredictYieldLoadingScreen} />
                <Stack.Screen name="PredictYieldScreen" component={PredictYieldResultsScreen} />
            </Stack.Navigator>
        </YieldFormProvider>
    );
}
