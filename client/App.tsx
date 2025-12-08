import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { ThemeProvider } from "./src/context/ThemeProvider";
import { AppProvider, useApp } from "./src/context/AppContext";
import { ErrorProvider } from "./src/utils/errorHandling";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-gesture-handler";
import RootNavigator from "./src/navigation";

import { View, ActivityIndicator, StyleSheet } from "react-native";
import "./global.css";

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <SafeAreaProvider>
          <ErrorProvider>
            <Root />
          </ErrorProvider>
        </SafeAreaProvider>
      </AppProvider>
    </ThemeProvider>
  );
}

function Root() {
  const { loading } = useApp();

  console.log("APP STARTED — LOADING:", loading);

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer
        theme={{
          ...DefaultTheme,
          colors: { ...DefaultTheme.colors, background: "#fff" },
        }}
      >
        <RootNavigator />
      </NavigationContainer>

      {/* ✅ GLOBAL LOADING OVERLAY (does NOT block touches) */}
      {/* GLOBAL LOADING OVERLAY */}
      {loading && (
        <View style={styles.overlay} pointerEvents="box-none">
          <ActivityIndicator size="large" color="green" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
});
