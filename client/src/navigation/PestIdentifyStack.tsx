import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import PestIdentificationLoadingScreen from "@screens/PestIdentification/PestIdentifyLoadingScreen";    
import FallArmywormLifecycleScreen from "@screens/PestIdentification/FallArmywormLifecycleScreen";
import BollwormLifecycleScreen from "@screens/PestIdentification/BollwormLifecycleScreen";
import AsianCornBorerLifecycleScreen from "@screens/PestIdentification/AsianCornBorerLifecycleScreen";
import PestHomeScreen from "@screens/PestIdentification/PestHomeScreen";
import PestRiskMeter from "@screens/PestIdentification/PestRiskMeter";
import FallArmywormControl from "@screens/PestIdentification/FallArmywormControl";
import BollwormControl from "@screens/PestIdentification/BollwormControl";
import AsianCornBorerControl from "@screens/PestIdentification/AsianCornBorerControl";
export type PestIdentifyStackParamList = {
    pesthome: undefined;
    PestIdentifyLoading: undefined;
    FallArmywormLifecycle: undefined;
    BollwormLifecycle: undefined;
    AsianCornBorerLifecycle: undefined;
    PestRiskMeter: undefined;
    FallArmywormControl: undefined;
    BollwormControl: undefined;
    AsianCornBorerControl: undefined;
    // add other screens here, e.g.:
    // PestIdentifyResult: { id: string };
};

const Stack = createStackNavigator<PestIdentifyStackParamList>();

export default function PestIdentifyStack() {
    return (
        <Stack.Navigator
            initialRouteName="pesthome"
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
            <Stack.Screen 
                name="pesthome" 
                component={PestHomeScreen} 
            />
            <Stack.Screen 
                name="PestRiskMeter" 
                component={PestRiskMeter} 
            />
            <Stack.Screen 
                name="FallArmywormControl" 
                component={FallArmywormControl} 
            />
            <Stack.Screen 
                name="BollwormControl" 
                component={BollwormControl} 
            />
            <Stack.Screen 
                name="AsianCornBorerControl" 
                component={AsianCornBorerControl} 
            />
        </Stack.Navigator>
    );
}