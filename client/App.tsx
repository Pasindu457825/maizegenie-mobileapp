import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { ThemeProvider } from "./src/context/ThemeProvider";
import { AppProvider } from "./src/context/AppContext";
import 'react-native-gesture-handler';
import RootNavigator from "./src/navigation";
import "./global.css";

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <NavigationContainer theme={{ ...DefaultTheme, colors: { ...DefaultTheme.colors, background: "#fff" } }}>
          <RootNavigator />
        </NavigationContainer>
      </AppProvider>
    </ThemeProvider>
  );
}
