import "./global.css";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from "./src/context/AuthContext";
import { AppProvider } from "./src/context/AppContext";
import AppNavigator from "./src/navigation/AppNavigator";
import Toast from "react-native-toast-message";
import { NavigationContainer } from "@react-navigation/native";

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AuthProvider>
          <AppProvider>
            <AppNavigator />
            <Toast />
            <StatusBar style="light" backgroundColor="#000000" translucent={true} />
          </AppProvider>
        </AuthProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
