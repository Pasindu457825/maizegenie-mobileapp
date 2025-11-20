import { createNativeStackNavigator } from "@react-navigation/native-stack";
import EnhancedFertilizerAdvisorWizard from "../screens/FertilizerAdvisor/EnhancedFertilizerAdvisorWizard";
import FertilizerAdvisorResultsScreen from "../screens/FertilizerAdvisor/FertilizerAdvisorResultsScreen";
import { ROUTES } from "../constants";

type FertilizerAdvisorStackParamList = {
    [ROUTES.TABS.FERTILIZERADVISOR]: undefined;
    FertilizerAdvisorResults: undefined;
};

const Stack = createNativeStackNavigator<FertilizerAdvisorStackParamList>();

export default function FertilizerAdvisorStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name={ROUTES.TABS.FERTILIZERADVISOR} component={EnhancedFertilizerAdvisorWizard} />
            <Stack.Screen name="FertilizerAdvisorResults" component={FertilizerAdvisorResultsScreen} />
        </Stack.Navigator>
    );
}