import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import PestIdentificationLoadingScreen from "@screens/PestIdentification/PestIdentifyLoadingScreen";    

export type PestIdentifyStackParamList = {
    PestIdentifyLoading: undefined;
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
            <Stack.Screen name="PestIdentifyLoading" component={PestIdentificationLoadingScreen} />
            {/* Add additional Stack.Screen entries for other screens when ready */}
        </Stack.Navigator>
    );
}