import '../global.css';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from '../src/context/AuthContext';
import { AppProvider } from '../src/context/AppContext';
import AppNavigator from '../src/navigation/AppNavigator';
import Toast from 'react-native-toast-message';

import { toastConfig } from '../src/components/CustomToast';

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <AppProvider>
          <AppNavigator />
          <Toast config={toastConfig} />
          <StatusBar style="auto" />
        </AppProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}
