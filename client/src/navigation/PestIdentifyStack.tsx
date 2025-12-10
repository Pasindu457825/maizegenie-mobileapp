import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import PestIdentificationLoadingScreen from "@screens/PestIdentification/PestIdentifyLoadingScreen";    
import FallArmywormLifecycleScreen from "@screens/PestIdentification/FallArmywormLifecycleScreen";

export type PestIdentifyStackParamList = {
    PestIdentifyLoading: undefined;
    FallArmywormLifecycle: undefined;
    // add other screens here, e.g.:
    // PestIdentifyResult: { id: string };
};

const Stack = createStackNavigator<PestIdentifyStackParamList>();

export default function PestIdentifyStack() {
    return (
        <Stack.Navigator
            initialRouteName="PestIdentifyLoading"
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen 
                name="PestIdentifyLoading" 
                component={PestIdentificationLoadingScreen} 
            />
            <Stack.Screen 
                name="FallArmywormLifecycle" 
                component={FallArmywormLifecycleScreen} 
            />
        </Stack.Navigator>
    );
}