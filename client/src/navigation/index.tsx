import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomNavigator from "./BottomNavigator";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import { ROUTES } from "../constants";

import ChatScreen from "../screens/DiseaseIdentification/ChatScreen";
import OfficerRoomsScreen from "../screens/DiseaseIdentification/OfficerRoomsScreen";

// STARTUP SCREENS
import SplashScreen from "../screens/Startup/SplashScreen";
import LanguageSelectScreen from "../screens/Startup/LanguageSelectScreen";
import Onboarding1 from "../screens/Startup/Onboarding1";
import Onboarding2 from "../screens/Startup/Onboarding2";
import Onboarding3 from "../screens/Startup/Onboarding3";
import OfficialNewsScreen from "../screens/Notifications/OfficialNewsScreen";

import NotificationsScreen from "../screens/Notifications/NotificationsScreen";
import NewsDetailScreen from "../screens/Notifications/NewsDetailScreen";
import AdminAddOfficialNewsScreen from "@screens/AdminPanel/AdminAddOfficialNewsScreen";
import AdminEditOfficialNewsScreen from "@screens/AdminPanel/AdminEditOfficialNewsScreen";

import PaymentScreen from "../screens/Payment/PaymentScreen";
import PaymentSuccessScreen from "../screens/Payment/PaymentSuccessScreen";
import ProAdvisorAdminAddScreen from "@screens/AdminPanel/ProAdvisor/ProAdvisorAdminAddScreen";
import ProAdvisorAdminEditScreen from "@screens/AdminPanel/ProAdvisor/ProAdvisorAdminEditScreen";
import ProAdvisorFollowScreen from "../screens/PriceForecast/ProAdvisorFollowScreen";
import AgricultureDepartmentScreen from "@screens/PriceForecast/AgricultureDepartmentScreen";

export type RootStackParamList = {
  Splash: undefined;
  LanguageSelect: undefined;
  Onboarding1: undefined;
  Onboarding2: undefined;
  Onboarding3: undefined;
  Notifications: undefined;
  OfficialNews: undefined;
  AdminAddOfficialNews: undefined;
  AdminEditOfficialNews: {
    newsId: string;
  };

  NewsDetail: {
    id: string;
  };

  SoilTestRequest: undefined;
  Payment: {
    plan?: string;
    amount?: number;
  };
  PaymentSuccess: {
    orderId?: string;
    amount?: number;
  };

  [ROUTES.AUTH.LOGIN]: undefined;
  [ROUTES.AUTH.SIGNUP]: undefined;

  [ROUTES.ROOT.MAIN]: undefined;
  [ROUTES.ROOT.MODAL]: { id: string } | undefined;

  Chat: {
    roomId?: string | null;
    userId?: string;
  };

  OfficerRooms: {
    officerId: string;
  };

  ProAdvisorAdminAdd: undefined;
  ProAdvisorAdminEdit: {
    advisorId: string;
  };
  ProAdvisorFollowScreen: {
    formData: any;
  };
  AgricultureDepartmentScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Splash" // ⭐ ADDED — Forces Splash to load first
    >
      {/* STARTUP FLOW */}
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="LanguageSelect" component={LanguageSelectScreen} />
      <Stack.Screen name="Onboarding1" component={Onboarding1} />
      <Stack.Screen name="Onboarding2" component={Onboarding2} />
      <Stack.Screen name="Onboarding3" component={Onboarding3} />

      {/* LOGIN */}
      <Stack.Screen
        name={ROUTES.AUTH.LOGIN}
        component={LoginScreen}
        options={{
          animation: "slide_from_left",
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
          animationTypeForReplace: "push",
        }}
      />
      <Stack.Screen
        name={ROUTES.AUTH.SIGNUP}
        component={SignupScreen}
        options={{
          animation: "slide_from_right",
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
          animationTypeForReplace: "push",
        }}
      />

      {/* MAIN TABS */}
      <Stack.Screen name={ROUTES.ROOT.MAIN} component={BottomNavigator} />

      {/* CHAT SYSTEM */}
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="OfficerRooms" component={OfficerRoomsScreen} />

      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ headerShown: false }}
      />

      {/* 🆕 OFFICIAL NEWS */}
      <Stack.Screen name="OfficialNews" component={OfficialNewsScreen} />

      {/* 🆕 NEWS DETAIL */}
      <Stack.Screen
        name="NewsDetail"
        component={NewsDetailScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="AdminAddOfficialNews"
        component={AdminAddOfficialNewsScreen}
      />
      <Stack.Screen
        name="AdminEditOfficialNews"
        component={AdminEditOfficialNewsScreen}
      />

      <Stack.Screen
        name="ProAdvisorAdminAdd"
        component={ProAdvisorAdminAddScreen}
      />

      <Stack.Screen
        name="ProAdvisorAdminEdit"
        component={ProAdvisorAdminEditScreen}
      />
      <Stack.Screen
        name="ProAdvisorFollowScreen"
        component={ProAdvisorFollowScreen}
      />

      {/* PAYMENT */}
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />

      <Stack.Screen
        name="AgricultureDepartmentScreen"
        component={AgricultureDepartmentScreen}
      />
    </Stack.Navigator>
  );
}
