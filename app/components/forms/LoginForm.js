import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { SCREEN_NAMES } from '../../types';
import { CONFIG } from '../../constants/config';

const LoginForm = ({ onSuccess, onForgotPassword, onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [phoneOTP, setPhoneOTP] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [customerData, setCustomerData] = useState(null);
  const { login } = useAuth();
  const navigation = useNavigation();

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const result = await login(email, password);
      
      if (result.success) {
        onSuccess?.();
      } else if (result.requiresPhoneVerification) {
        setCustomerData(result.customer);
        setShowPhoneVerification(true);
        Alert.alert(
          'Phone Verification Required',
          result.message || 'Please verify your phone number with the OTP sent to your mobile.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Login Failed',
        error.response?.data?.message || 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (!phoneOTP) {
      Alert.alert('Error', 'Please enter the OTP sent to your phone.');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/auth/verify-phone-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: customerData?.phone,
          otp: phoneOTP
        })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Success', 
          'Phone number verified successfully! Please try logging in again.',
          [
            {
              text: 'OK',
              onPress: () => {
                setShowPhoneVerification(false);
                setPhoneOTP('');
                setCustomerData(null);
              }
            }
          ]
        );
      } else {
        Alert.alert('Verification Failed', data.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify phone number. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/auth/send-phone-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: customerData?.phone })
      });

      if (response.ok) {
        Alert.alert('Success', 'New OTP has been sent to your phone.');
      } else {
        Alert.alert('Error', 'Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    }
  };

  if (showPhoneVerification) {
    return (
      <View style={{ width: '100%' }}>
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>
            Verify Phone Number
          </Text>
          <Text style={{ textAlign: 'center', color: '#666', marginBottom: 8 }}>
            We've sent a verification code to
          </Text>
          <Text style={{ textAlign: 'center', fontWeight: '600', color: '#333' }}>
            {customerData?.phone}
          </Text>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8 }}>
            Enter OTP *
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#d1d5db',
              borderRadius: 8,
              padding: 12,
              backgroundColor: 'white',
              textAlign: 'center',
              fontSize: 18,
              letterSpacing: 2,
            }}
            placeholder="Enter 6-digit code"
            placeholderTextColor="#9ca3af"
            value={phoneOTP}
            onChangeText={setPhoneOTP}
            keyboardType="numeric"
            maxLength={6}
          />
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: '#2563eb',
            borderRadius: 8,
            padding: 16,
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            marginBottom: 16,
          }}
          onPress={handleVerifyPhone}
          disabled={isVerifying}
        >
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
            {isVerifying ? 'Verifying...' : 'Verify & Continue'}
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ color: '#666', fontSize: 14 }}>Didn't receive code? </Text>
          <TouchableOpacity onPress={handleResendOTP}>
            <Text style={{ color: '#2563eb', fontWeight: '500', fontSize: 14 }}>Resend OTP</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => {
            setShowPhoneVerification(false);
            setPhoneOTP('');
            setCustomerData(null);
          }}
          style={{ alignItems: 'center' }}
        >
          <Text style={{ color: '#666', fontSize: 14 }}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ width: '100%' }}>
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>
          Welcome Back
        </Text>
        <Text style={{ textAlign: 'center', color: '#666' }}>
          Sign in to your FarmFerry account
        </Text>
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8 }}>
          Email Address *
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#d1d5db',
            borderRadius: 8,
            padding: 12,
            backgroundColor: 'white',
          }}
          placeholder="Enter your email"
          placeholderTextColor="#9ca3af"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8 }}>
          Password *
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#d1d5db',
            borderRadius: 8,
            padding: 12,
            backgroundColor: 'white',
          }}
          placeholder="Enter your password"
          placeholderTextColor="#9ca3af"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        onPress={onForgotPassword}
        style={{ alignSelf: 'flex-end', marginBottom: 24 }}
      >
        <Text style={{ color: '#059669', fontSize: 14, fontWeight: '500' }}>
          Forgot Password?
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: '#059669',
          borderRadius: 8,
          padding: 16,
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        }}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
          {isLoading ? 'Signing In...' : 'Sign In'} 
        </Text>
      </TouchableOpacity>

      <View style={{ marginTop: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#666', fontSize: 14 }}>Don't have an account?</Text>
        <TouchableOpacity onPress={onRegister} style={{ marginLeft: 4 }}>
          <Text style={{ color: '#059669', fontWeight: '500', fontSize: 14 }}>Register here</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginForm; 