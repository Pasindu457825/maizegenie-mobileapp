import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PriceForecastLoadingScreen from '../screens/PriceForecast/PriceForecastLoadingScreen';
import PriceForecastFormScreen from '../screens/PriceForecast/PriceForecastFormScreen';
import PriceForecastScreen from '../screens/PriceForecast/PriceForecastScreen';
import AdminPanelScreen from '../screens/AdminPanel/PriceForecast/AdminPanelScreen';
import WeatherForecastScreen from '../screens/PriceForecast/WeatherForecastScreen';

export type PriceForecastStackParamList = {
  PriceForecastLoadingScreen: undefined;
  PriceForecastFormScreen: undefined;
  PriceForecastScreen: undefined;
   AdminPanelScreen: undefined;
    WeatherForecastScreen: undefined;
};

const Stack = createStackNavigator<PriceForecastStackParamList>();

const PriceForecastStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="PriceForecastLoadingScreen"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#F0FDF4' },
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
  name="AdminPanelScreen"
  component={AdminPanelScreen}
  options={{ headerShown: false }}
/>
<Stack.Screen 
  name="WeatherForecastScreen" 
  component={WeatherForecastScreen}
  options={{ headerShown: false }}
/>

    </Stack.Navigator>
  );
};

export default PriceForecastStack;
