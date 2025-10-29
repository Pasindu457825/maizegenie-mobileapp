import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PredictYieldFormScreen from "../screens/PredictYield/PredictYieldFormScreen";
import PredictYieldLoadingScreen from "../screens/PredictYield/PredictYieldLoadingScreen";
import PredictYieldScreen from "../screens/PredictYield/PredictYieldScreen";
import { ROUTES } from "../constants";

type PredictYieldStackParamList = {
    [ROUTES.TABS.PREDICTYIELD]: undefined;
    PredictYieldLoading: undefined;
    PredictYieldFormScreen: undefined;
    PredictYieldScreen: undefined;
};

const Stack = createNativeStackNavigator<PredictYieldStackParamList>();

export default function PredictYieldStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="PredictYieldLoading" component={PredictYieldLoadingScreen} />
            <Stack.Screen name="PredictYieldFormScreen" component={PredictYieldFormScreen} />
            <Stack.Screen name="PredictYieldScreen" component={PredictYieldScreen} />
        </Stack.Navigator>
    );
}
