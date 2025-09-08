import '../global.css';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import AppNavigator from './navigation/AppNavigator';
import Toast from 'react-native-toast-message';

export default function App() {
  return (
    <NavigationContainer>
    <AuthProvider>
      <AppProvider>
        <AppNavigator />
        <Toast />
        <StatusBar style="auto" />
      </AppProvider>
    </AuthProvider>
    </NavigationContainer>
  );
}
