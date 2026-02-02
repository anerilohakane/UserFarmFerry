import React from 'react';
import { View, ScrollView, Image, SafeAreaView, StyleSheet, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
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
      // Check if we can go back, otherwise go to home
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('MainApp'); // Fallback
      }
    }
  };

  const handleVerificationFailure = (errorMessage) => {
    console.log('Verification failed:', errorMessage);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0fdf4" />

      {/* Background - Clean & Subtle, matching LoginScreen */}
      <LinearGradient
        colors={['#f0fdf4', '#ffffff', '#ffffff']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.4 }}
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.contentContainer}>
              {/* Logo and Branding */}
              <View style={styles.logoContainer}>
                <View style={styles.logoWrapper}>
                  <Image
                    source={require('../../assets/images/Icon2.jpeg')}
                    style={styles.logo}
                    resizeMode="cover"
                  />
                </View>
              </View>

              <View style={styles.formContainer}>
                <OTPVerificationForm
                  phone={phone}
                  onVerificationSuccess={handleVerificationSuccess}
                  onVerificationFailure={handleVerificationFailure}
                  onBack={handleBack}
                  title="Verification Code"
                  subtitle="We have sent the verification code to your mobile number"
                  buttonText="Verify Now"
                  showBackButton={true}
                  autoSendOTP={true}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 20,
  },
  contentContainer: {
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoWrapper: {
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderRadius: 60,
  },
  logo: {
    width: 100, // Slightly smaller than LoginScreen to give more room for keypad
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  formContainer: {
    width: '100%',
  },
});
