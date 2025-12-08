import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomNavigator from "./BottomNavigator";
import LoginScreen from "../screens/LoginScreen";
import { ROUTES } from "../constants";

import ChatScreen from "../screens/DiseaseIdentification/ChatScreen";
import OfficerRoomsScreen from "../screens/DiseaseIdentification/OfficerRoomsScreen";

// STARTUP SCREENS
import SplashScreen from "../screens/Startup/SplashScreen";
import LanguageSelectScreen from "../screens/Startup/LanguageSelectScreen";
import Onboarding1 from "../screens/Startup/Onboarding1";
import Onboarding2 from "../screens/Startup/Onboarding2";

type RootStackParamList = {
  Splash: undefined;
  LanguageSelect: undefined;
  Onboarding1: undefined;
  Onboarding2: undefined;

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
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Splash"     // ⭐ ADDED — Forces Splash to load first
    >

      {/* STARTUP FLOW */}
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="LanguageSelect" component={LanguageSelectScreen} />
      <Stack.Screen name="Onboarding1" component={Onboarding1} />
      <Stack.Screen name="Onboarding2" component={Onboarding2} />

      {/* LOGIN */}
      <Stack.Screen name={ROUTES.AUTH.LOGIN} component={LoginScreen} />

      {/* MAIN TABS */}
      <Stack.Screen name={ROUTES.ROOT.MAIN} component={BottomNavigator} />

      {/* CHAT SYSTEM */}
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="OfficerRooms" component={OfficerRoomsScreen} />
    </Stack.Navigator>
  );
}
