import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { Image, SafeAreaView, ScrollView, View } from 'react-native';
import OTPVerificationForm from '../components/forms/OTPVerificationForm';
import { SCREEN_NAMES } from '../types';

export default function PhoneVerificationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get phone number from route params or use default
  const phone = route.params?.phone || '';

  const handleVerificationSuccess = (data, verificationData) => {
    // Navigate to appropriate screen based on context
    if (route.params?.fromRegistration) {
      // If coming from registration, go to login
      navigation.navigate(SCREEN_NAMES.LOGIN);
    } else {
      // If standalone verification, go back or to home
      navigation.goBack();
    }
  };

  const handleVerificationFailure = (errorMessage) => {
    // Error is already handled by the OTPVerificationForm component
    console.log('Verification failed:', errorMessage);
  };

  const handleBack = () => {
    navigation.goBack();
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
          <View className="items-center mb-8">
            <Image 
              source={require('../../assets/images/Icon2.jpeg')} 
              className="w-38 h-38"
              resizeMode="contain"
            />
          </View>

          <OTPVerificationForm
            phone={phone}
            onVerificationSuccess={handleVerificationSuccess}
            onVerificationFailure={handleVerificationFailure}
            onBack={handleBack}
            title="Phone Verification"
            subtitle="We've sent a verification code to"
            buttonText="Verify Phone Number"
            showBackButton={true}
            autoSendOTP={true}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

