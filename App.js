import "./global.css";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from "./src/context/AuthContext";
import { AppProvider } from "./src/context/AppContext";
import AppNavigator from "./src/navigation/AppNavigator";
import Toast from "react-native-toast-message";
import { NavigationContainer } from "@react-navigation/native";

import { toastConfig } from "./src/components/CustomToast";

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AuthProvider>
          <AppProvider>
            <AppNavigator />
            <Toast config={toastConfig} />
            <StatusBar style="light" backgroundColor="#000000" translucent={true} />
          </AppProvider>
        </AuthProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
