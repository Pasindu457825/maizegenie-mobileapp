import { createNativeStackNavigator } from "@react-navigation/native-stack";
import EnhancedPredictYieldFormWizard from "../screens/PredictYield/EnhancedPredictYieldFormWizard";
import PredictYieldLoadingScreen from "../screens/PredictYield/PredictYieldLoadingScreen";
import PredictYieldResultsScreen from "../screens/PredictYield/PredictYieldResultsScreen";
import { ROUTES } from "../constants";

type PredictYieldStackParamList = {
    [ROUTES.TABS.PREDICTYIELD]: undefined;
    PredictYieldLoading: undefined;
    PredictYieldFormWizard: undefined;
    PredictYieldScreen: undefined;
};

const Stack = createNativeStackNavigator<PredictYieldStackParamList>();

export default function PredictYieldStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="PredictYieldFormWizard" component={EnhancedPredictYieldFormWizard} />
            <Stack.Screen name="PredictYieldLoading" component={PredictYieldLoadingScreen} />
            <Stack.Screen name="PredictYieldScreen" component={PredictYieldResultsScreen} />
        </Stack.Navigator>
    );
}
