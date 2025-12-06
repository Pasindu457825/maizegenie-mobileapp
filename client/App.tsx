import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { ThemeProvider } from "./src/context/ThemeProvider";
import { AppProvider } from "./src/context/AppContext";
import { ErrorProvider } from "./src/utils/errorHandling";
import { SafeAreaProvider } from "react-native-safe-area-context";
import 'react-native-gesture-handler';
import RootNavigator from "./src/navigation";
import "./global.css";
import "react-native-url-polyfill/auto";

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <SafeAreaProvider>
          <ErrorProvider>
            <NavigationContainer theme={{ ...DefaultTheme, colors: { ...DefaultTheme.colors, background: "#fff" } }}>
              <RootNavigator />
            </NavigationContainer>
          </ErrorProvider>
        </SafeAreaProvider>
      </AppProvider>
    </ThemeProvider>
  );
}
