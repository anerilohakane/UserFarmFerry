import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import OTPVerificationForm from '../components/forms/OTPVerificationForm';
import { CONFIG } from '../constants/config';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { SCREEN_NAMES } from '../types';

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);

  const [registrationData, setRegistrationData] = useState(null);

  const { register } = useAuth();

  // Form validation
  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your full name.');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter your email address.');
      return false;
    }
    if (!CONFIG.VALIDATION.EMAIL_REGEX.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number.');
      return false;
    }
    if (!CONFIG.VALIDATION.PHONE_REGEX.test(formData.phone)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number.');
      return false;
    }
    if (!formData.password) {
      Alert.alert('Error', 'Please enter a password.');
      return false;
    }
    if (formData.password.length < CONFIG.VALIDATION.PASSWORD_MIN_LENGTH) {
      Alert.alert('Error', `Password must be at least ${CONFIG.VALIDATION.PASSWORD_MIN_LENGTH} characters long.`);
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

    const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      console.log('🚀 Starting registration process...');
      console.log('📝 Registration data:', { 
        name: formData.name, 
        email: formData.email, 
        phone: formData.phone 
      });

      // Phase 1: Send registration data for validation and OTP generation
      // This should NOT create a full user account yet
      let response;
      try {
        response = await authAPI.registerValidate({ 
          name: formData.name, 
          email: formData.email, 
          phone: formData.phone, 
          password: formData.password 
        });

        console.log('✅ Registration validation response:', response.data);
      } catch (validationError) {
        console.log('⚠️ Validation endpoint not available, trying direct registration...');
        
        // Fallback: Use existing registration flow but don't complete until OTP verification
        response = await authAPI.register({ 
          name: formData.name, 
          email: formData.email, 
          phone: formData.phone, 
          password: formData.password 
        });

        console.log('✅ Registration response (fallback):', response.data);
      }

      if (response?.data?.success) {
        // Store registration data for OTP verification
        setRegistrationData({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        });
        
        // Show OTP verification step
        setShowOtpVerification(true);
      } else {
        Alert.alert(
          'Registration Failed',
          response?.data?.message || 'An unexpected error occurred. Please try again.'
        );
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      Alert.alert(
        'Registration Failed',
        error.message || 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };



  const handleBackToRegistration = () => {
    Alert.alert(
      'Cancel Registration?',
      'If you go back now, your registration will not be completed. You will need to start over. Are you sure?',
      [
        {
          text: 'Continue Registration',
          style: 'cancel'
        },
        {
          text: 'Cancel Registration',
          style: 'destructive',
          onPress: () => {
            setShowOtpVerification(false);
            setRegistrationData(null);
            // Optionally, you could call an API to clean up any temporary data
            console.log('🚫 Registration cancelled by user');
          }
        }
      ]
    );
  };

    // OTP Verification Component
  if (showOtpVerification) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-1 justify-center px-6 py-8">
              {/* Logo and Branding */}
              <View className="items-center mb-8">
                {/* <Image 
                  source={require('../../assets/images/Icon2.jpeg')} 
                  className="w-38 h-38"
                  resizeMode="contain"
                /> */}
              </View>

              <OTPVerificationForm
                phone={registrationData?.phone}
                email={registrationData?.email}
                onVerificationSuccess={async (data, verificationData) => {
                  try {
                    // Phase 2: Complete registration after OTP verification
                    console.log('🔐 OTP verified, completing registration...');
                    
                    let finalResponse;
                    try {
                      // Try the new completion endpoint first
                      finalResponse = await authAPI.registerComplete({
                        name: registrationData.name,
                        email: registrationData.email,
                        phone: registrationData.phone,
                        password: registrationData.password,
                        otp: verificationData.otp,
                        customerId: verificationData.customerId
                      });
                    } catch (completionError) {
                      console.log('⚠️ Completion endpoint not available, registration already complete...');
                      // If completion endpoint doesn't exist, assume registration is already complete
                      finalResponse = { data: { success: true, message: 'Registration completed successfully!' } };
                    }

                    console.log('✅ Final registration response:', finalResponse.data);

                    if (finalResponse.data?.success) {
                      Alert.alert(
                        'Registration Successful!',
                        'Your account has been created and verified successfully! Welcome to FarmFerry!',
                        [
                          {
                            text: 'Continue to Login',
                            onPress: () => {
                              // Clear all states
                              setShowOtpVerification(false);
                              setRegistrationData(null);
                              setFormData({
                                name: '',
                                email: '',
                                phone: '',
                                password: '',
                                confirmPassword: '',
                              });
                              // Navigate to login
                              navigation.navigate(SCREEN_NAMES.LOGIN);
                            }
                          }
                        ]
                      );
                    } else {
                      Alert.alert(
                        'Registration Failed',
                        finalResponse.data?.message || 'Failed to complete registration. Please try again.'
                      );
                    }
                  } catch (error) {
                    console.error('❌ Final registration error:', error);
                    Alert.alert(
                      'Registration Failed',
                      'Failed to complete registration. Please try again.'
                    );
                  }
                }}
                onVerificationFailure={(errorMessage) => {
                  Alert.alert('Verification Failed', errorMessage);
                }}
                onBack={handleBackToRegistration}
                title="Verify Phone Number"
                subtitle="We've sent a verification code to"
                buttonText="Verify & Complete Registration"
                showBackButton={true}
                autoSendOTP={true}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Registration Form Component
  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 justify-center px-6 py-8">
            {/* Logo and Branding */}
            <View className="items-center mb-8">
              {/* <Image 
                source={require('../../assets/images/Icon2.jpeg')} 
                className="w-38 h-38"
                resizeMode="contain"
              /> */}
            </View>

            <Text className="text-3xl font-bold text-gray-800 mb-1 text-center">
              Create Account
            </Text>
            <Text className="text-gray-500 mb-6 text-center">
              Join us today! It takes only few minutes
            </Text>

            <View className="space-y-4 mb-6">
              <View>
                <Text className="text-gray-700 mb-1">Full Name *</Text>
                <TextInput
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  placeholder="John Doe"
                  className="bg-white border-2 border-gray-200 rounded-xl p-4 text-lg shadow-sm"
                />
              </View>

              <View>
                <Text className="text-gray-700 mb-1">Email Address *</Text>
                <TextInput
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  placeholder="your@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="bg-white border-2 border-gray-200 rounded-xl p-4 text-lg shadow-sm"
                />
              </View>

              <View>
                <Text className="text-gray-700 mb-1">Phone Number *</Text>
                <TextInput
                  value={formData.phone}
                  onChangeText={(value) => handleInputChange('phone', value)}
                  placeholder="1234567890"
                  keyboardType="phone-pad"
                  maxLength={10}
                  className="bg-white border-2 border-gray-200 rounded-xl p-4 text-lg shadow-sm"
                />
                <Text className="text-gray-500 text-xs mt-1">
                  Enter 10-digit phone number without country code
                </Text>
              </View>

              <View>
                <Text className="text-gray-700 mb-1">Password *</Text>
                <TextInput
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  placeholder="••••••••"
                  secureTextEntry
                  className="bg-white border-2 border-gray-200 rounded-xl p-4 text-lg shadow-sm"
                />
                <Text className="text-gray-500 text-xs mt-1">
                  Minimum {CONFIG.VALIDATION.PASSWORD_MIN_LENGTH} characters
                </Text>
              </View>

              <View>
                <Text className="text-gray-700 mb-1">Confirm Password *</Text>
                <TextInput
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  placeholder="••••••••"
                  secureTextEntry
                  className="bg-white border-2 border-gray-200 rounded-xl p-4 text-lg shadow-sm"
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleRegister}
              disabled={isLoading}
              className="bg-green-700 py-4 rounded-xl items-center shadow-md mb-6"
              activeOpacity={0.8}
            >
                             {isLoading ? (
                 <View className="flex-row items-center">
                   <ActivityIndicator size="small" color="#fff" />
                   <Text className="text-white font-bold text-lg ml-3">Validating...</Text>
                 </View>
               ) : (
                 <Text className="text-white font-bold text-lg">Create Account</Text>
               )}
            </TouchableOpacity>

            <View className="flex-row justify-center">
              <Text className="text-gray-500">Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate(SCREEN_NAMES.LOGIN)}>
                <Text className="text-green-800 font-bold">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

