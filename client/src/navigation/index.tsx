import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomNavigator from "./BottomNavigator";
import LoginScreen from "../screens/LoginScreen";
import { ROUTES } from "../constants";

import ChatScreen from "../screens/DiseaseIdentification/ChatScreen";
import OfficerRoomsScreen from "../screens/DiseaseIdentification/OfficerRoomsScreen";

type RootStackParamList = {
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
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* AUTH SCREENS */}
      <Stack.Screen name={ROUTES.AUTH.LOGIN} component={LoginScreen} />

      {/* MAIN TABS */}
      <Stack.Screen name={ROUTES.ROOT.MAIN} component={BottomNavigator} />

      {/* CHAT SYSTEM */}
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="OfficerRooms" component={OfficerRoomsScreen} />
    </Stack.Navigator>
  );
}
