import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import PriceForecastLoadingScreen from "../screens/PriceForecast/PriceForecastLoadingScreen";
import PriceForecastFormScreen from "../screens/PriceForecast/PriceForecastFormScreen";
import PriceForecastScreen from "../screens/PriceForecast/PriceForecastScreen";
import AdminPanelScreen from "../screens/AdminPanel/PriceForecast/AdminPanelScreen";
import WeatherForecastScreen from "../screens/PriceForecast/WeatherForecastScreen";
import PriceAdvisorScreen from "../screens/PriceForecast/PriceAdvisorScreen";
import OfficerPriceForecastScreen from "@screens/PriceForecast/OfficerPriceForecastScreen";
import ProAdvisorPage from "../screens/PriceForecast/ProAdvisorPage";
import ProAdvisorFollowScreen from "../screens/PriceForecast/ProAdvisorFollowScreen";
import AgricultureDepartmentScreen from "@screens/PriceForecast/AgricultureDepartmentScreen";

export type PriceForecastStackParamList = {
  PriceForecastLoadingScreen: undefined;
  PriceForecastFormScreen: undefined;
  PriceForecastScreen: { data: any };
  OfficerPriceForecastScreen: { data: any };
  AdminPanelScreen: undefined;
  WeatherForecastScreen: undefined;
  PriceAdvisorScreen: {
    data: any;
    weeklyForecast: any[];
    weatherCondition?: string | null;
    temperature?: number | null;
    district?: string | null;
    plantingDate?: string;
  };
    ProAdvisorPage: {
    formData: any;
  };
   ProAdvisorFollowScreen: {
    formData: any;   
  };
  AgricultureDepartmentScreen: undefined;
};

const Stack = createStackNavigator<PriceForecastStackParamList>();

const PriceForecastStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="PriceForecastLoadingScreen"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: "#F0FDF4" },
      }}
    >
      <Stack.Screen
        name="PriceForecastLoadingScreen"
        component={PriceForecastLoadingScreen}
      />
      <Stack.Screen
        name="PriceForecastFormScreen"
        component={PriceForecastFormScreen}
      />
      <Stack.Screen
        name="PriceForecastScreen"
        component={PriceForecastScreen}
      />
      <Stack.Screen
        name="OfficerPriceForecastScreen"
        component={OfficerPriceForecastScreen}
      />
      <Stack.Screen
        name="AdminPanelScreen"
        component={AdminPanelScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WeatherForecastScreen"
        component={WeatherForecastScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PriceAdvisorScreen"
        component={PriceAdvisorScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProAdvisorPage"
        component={ProAdvisorPage}
        options={{
          headerShown: false,
        }}
      />
            <Stack.Screen
        name="ProAdvisorFollowScreen"
        component={ProAdvisorFollowScreen}
      />
      <Stack.Screen
        name="AgricultureDepartmentScreen"
        component={AgricultureDepartmentScreen}
      />
    </Stack.Navigator>
  );
};

export default PriceForecastStack;
