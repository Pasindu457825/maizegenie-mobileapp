import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import PestIdentificationLoadingScreen from "@screens/PestIdentification/PestIdentifyLoadingScreen";    
import FallArmywormLifecycleScreen from "@screens/PestIdentification/FallArmywormLifecycleScreen";
import BollwormLifecycleScreen from "@screens/PestIdentification/BollwormLifecycleScreen";
import AsianCornBorerLifecycleScreen from "@screens/PestIdentification/AsianCornBorerLifecycleScreen";
export type PestIdentifyStackParamList = {
    PestIdentifyLoading: undefined;
    FallArmywormLifecycle: undefined;
    BollwormLifecycle: undefined;
    AsianCornBorerLifecycle: undefined;
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
            <Stack.Screen 
                name="BollwormLifecycle" 
                component={BollwormLifecycleScreen} 
            />
            <Stack.Screen 
                name="AsianCornBorerLifecycle" 
                component={AsianCornBorerLifecycleScreen} 
            />
        </Stack.Navigator>
    );
}