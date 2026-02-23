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
import CreatePostScreen from "../screens/Marketplace/CreatePostScreen";
import PostReviewScreen from "../screens/Marketplace/PostReviewScreen";
import MarketPlaceScreen from "../screens/Marketplace/MarketPlaceScreen";
import PostDetailScreen from "../screens/Marketplace/PostDetailScreen";
import EditPostScreen from "../screens/Marketplace/EditPostScreen";

export interface PostDraft {
  // Buyer-visible fields
  seedVariety: string;
  quantityKg: number;
  pricePerKg: number;
  district: string;
  week: number;

  // 🔒 Internal / AI metadata (NOT shown to buyers)
  forecastWeek?: number;
  predictedPrice?: number;
  season?: string;

  // 🗓 Scheduling support
  publishAt?: Date | null;
}

export interface ForecastData {
  year: string;
  week: string;
  district: string;
  season: string;
  weather: string;
  fuelPrice: string;
  cornImportTax: string;
  farmGatePrice: string;
  seedVariety: string;
  expectedYield: number;
  farmArea: number;
  totalCost: number;
  productionCostPerKg: number;
  hasStorage: boolean;
  language: "si" | "en";
}

export type PriceForecastStackParamList = {
  PriceForecastLoadingScreen: undefined;
  PriceForecastFormScreen: undefined;
  PriceForecastScreen: { data: ForecastData };
  CreatePostScreen: { bestPrice: number; formData: ForecastData };
  PostReviewScreen: { postDraft: PostDraft };
  MarketPlaceScreen: undefined;
  PostDetailScreen: { postId: string };
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
  EditPostScreen: {
    postId: string;
    currentData: {
      seed_variety: string;
      price_per_kg: number;
      quantity_kg: number;
      district: string;
      week: number;
      season: string;
    };
  };
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
      <Stack.Screen name="CreatePostScreen" component={CreatePostScreen} />
      <Stack.Screen name="PostReviewScreen" component={PostReviewScreen} />
      <Stack.Screen name="MarketPlaceScreen" component={MarketPlaceScreen} />
      <Stack.Screen name="PostDetailScreen" component={PostDetailScreen} />
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
      <Stack.Screen name="EditPostScreen" component={EditPostScreen} />
    </Stack.Navigator>
  );
};

export default PriceForecastStack;
