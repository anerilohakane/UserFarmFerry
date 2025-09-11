import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { CONFIG } from '../../constants/config';

const OTPVerificationForm = ({
  phone,
  email = null,
  onVerificationSuccess,
  onVerificationFailure,
  onResendOTP,
  onBack,
  title = 'Verify Phone Number',
  subtitle = 'We\'ve sent a verification code to',
  buttonText = 'Verify & Continue',
  showBackButton = true,
  autoSendOTP = true,
}) => {
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (autoSendOTP && phone) {
      handleSendOTP();
    }
  }, [autoSendOTP, phone]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOTP = async () => {
    if (!phone) {
      Alert.alert('Error', 'Phone number is required to send OTP.');
      return;
    }

    setIsSendingOtp(true);
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/auth/send-phone-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone,
          email 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.data?.customerId) {
          setCustomerId(data.data.customerId);
        }
        setCountdown(60); // 60 seconds countdown
        Alert.alert(
          'OTP Sent Successfully',
          `A verification code has been sent to ${phone}. Please check your phone and enter the code below.`
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      Alert.alert('Error', 'Network error while sending OTP. Please check your connection.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 4) {
      Alert.alert('Error', 'Please enter the complete OTP.');
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
          phone,
          otp,
          customerId
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (onVerificationSuccess) {
          onVerificationSuccess(data, { phone, otp, customerId });
        } else {
          Alert.alert('Success', 'Phone number verified successfully!');
        }
      } else {
        if (onVerificationFailure) {
          onVerificationFailure(data.message || 'Invalid OTP. Please try again.');
        } else {
          Alert.alert('Verification Failed', data.message || 'Invalid OTP. Please try again.');
        }
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      const errorMessage = 'Network error while verifying OTP. Please check your connection.';
      if (onVerificationFailure) {
        onVerificationFailure(errorMessage);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (onResendOTP) {
      onResendOTP();
    } else {
      await handleSendOTP();
    }
  };

  return (
    <View className="flex-1 justify-center px-6 py-8">
      <Text className="text-3xl font-bold text-gray-800 mb-2 text-center">
        {title}
      </Text>
      <Text className="text-gray-500 text-center mb-2">
        {subtitle}
      </Text>
      <Text className="text-gray-700 font-semibold text-center mb-8">
        {phone}
      </Text>

      <View className="mb-6">
        <Text className="text-gray-700 mb-2 text-center">Enter Verification Code</Text>
        <TextInput
          value={otp}
          onChangeText={setOtp}
          placeholder="Enter 6-digit code"
          keyboardType="numeric"
          maxLength={6}
          className="bg-white border-2 border-gray-200 rounded-xl p-4 text-lg text-center tracking-widest shadow-sm"
        />
      </View>

      <TouchableOpacity
        onPress={handleVerifyOTP}
        disabled={isVerifying}
        className="bg-green-600 py-4 rounded-xl items-center mb-4 shadow-md"
        activeOpacity={0.8}
      >
        {isVerifying ? (
          <View className="flex-row items-center">
            <ActivityIndicator size="small" color="#fff" />
            <Text className="text-white font-bold text-lg ml-3">Verifying...</Text>
          </View>
        ) : (
          <Text className="text-white font-bold text-lg">{buttonText}</Text>
        )}
      </TouchableOpacity>

      <View className="flex-row justify-center items-center mb-4">
        <Text className="text-gray-500 mr-1">Didn't receive the code?</Text>
        <TouchableOpacity 
          onPress={handleResendOTP} 
          disabled={isSendingOtp || countdown > 0}
        >
          <Text className={`font-bold ${countdown > 0 ? 'text-gray-400' : 'text-green-600'}`}>
            {isSendingOtp ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
          </Text>
        </TouchableOpacity>
      </View>

      {showBackButton && onBack && (
        <TouchableOpacity
          onPress={onBack}
          className="py-3 items-center"
        >
          <Text className="text-gray-600 font-medium">Go Back</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default OTPVerificationForm;
