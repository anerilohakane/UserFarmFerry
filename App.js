import "./global.css";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./app/context/AuthContext";
import { AppProvider } from "./app/context/AppContext";
import AppNavigator from "./app/navigation/AppNavigator";
import Toast from "react-native-toast-message";
import { NavigationContainer } from "@react-navigation/native";

export default function App() {
  return (
    <NavigationContainer>
    <AuthProvider>
      <AppProvider>
        <AppNavigator />
        <Toast />
        <StatusBar style="light" backgroundColor="#000000" translucent={true} />
      </AppProvider>
    </AuthProvider>
    </NavigationContainer>
  );
}
