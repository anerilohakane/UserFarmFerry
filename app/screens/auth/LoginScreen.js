import React from 'react';
import { View, ScrollView, Image, SafeAreaView, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LoginForm from '../../components/forms/LoginForm';
import { SCREEN_NAMES } from '../../types';

const LoginScreen = () => {
  const navigation = useNavigation();

  const handleLoginSuccess = () => {
    // AuthContext will set isAuthenticated=true and AppNavigator will
    // automatically swap AuthStack → AppStack. No manual reset needed here.
    console.log('Login success callback triggered - AuthContext should handle navigation');
  };

  const handleForgotPassword = () => {
    navigation.navigate(SCREEN_NAMES.FORGOT_PASSWORD);
  };

  const handleRegister = () => {
    navigation.navigate(SCREEN_NAMES.REGISTER);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center px-6 py-8">
          {/* Logo and Branding */}
          <View style={{ alignItems: 'center' }}>
            <Image source={require('../../../assets/images/Icon2.jpeg')} style={{ width: 150, height: 150, resizeMode: 'contain' }} />
          </View>
          {/* Login Form */}
          <LoginForm
            onSuccess={handleLoginSuccess}
            onForgotPassword={handleForgotPassword}
            onRegister={handleRegister}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen; 