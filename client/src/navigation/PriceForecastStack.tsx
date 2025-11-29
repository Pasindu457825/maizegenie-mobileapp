import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PriceForecastFormScreen from "../screens/PriceForecast/PriceForecastFormScreen";
import PriceForecastLoadingScreen from "../screens/PriceForecast/PriceForecastLoadingScreen";
import PriceForecastScreen from "../screens/PriceForecast/PriceForecastScreen";
import { ROUTES } from "../constants";

type PriceStackParamList = {
    PriceForecastLoading: undefined;
    PriceForecastForm: undefined;
    PriceForecastScreen: undefined;
};

const Stack = createNativeStackNavigator<PriceStackParamList>();

export default function PriceForecastStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="PriceForecastLoading" component={PriceForecastLoadingScreen} />
            <Stack.Screen name="PriceForecastForm" component={PriceForecastFormScreen} />
            <Stack.Screen name="PriceForecastScreen" component={PriceForecastScreen} />
        </Stack.Navigator>
    );
}
