import React, { useState } from 'react';
import { View, Text, SafeAreaView, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { resetPasswordOTPSchema } from '../../utils/validation';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { SCREEN_NAMES } from '../../types';

const ResetPasswordWithOTPScreen = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOTPVerified, setIsOTPVerified] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const { resetPasswordWithOTP, forgotPassword } = useAuth();
  const email = route.params?.email || '';

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordOTPSchema),
    defaultValues: {
      otp: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    if (!email || !isOTPVerified) {
      Alert.alert('Error', 'Please verify OTP first.');
      return;
    }

    try {
      setIsLoading(true);
      await resetPasswordWithOTP(email, data.otp, data.password);
      Alert.alert(
        'Success',
        'Your password has been reset successfully. You can now sign in with your new password.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate(SCREEN_NAMES.LOGIN)
          }
        ]
      );
    } catch (error) {
      console.error('Reset password with OTP error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reset password. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (otpValue) => {
    if (!email || !otpValue) {
      Alert.alert('Error', 'Please enter the OTP.');
      return;
    }

    if (otpValue.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP.');
      return;
    }

    // For now, we'll just validate the format and proceed to password entry
    // The actual OTP verification will happen when the user submits the new password
    setIsOTPVerified(true);
    Alert.alert('Success', 'OTP format validated! Now you can set your new password.');
  };

  const handleResendOTP = async () => {
    if (!email) {
      Alert.alert('Error', 'Email not found. Please go back and try again.');
      return;
    }

    try {
      await forgotPassword(email, 'customer');
      Alert.alert('Success', 'New OTP has been sent to your email.');
    } catch (error) {
      console.error('Resend OTP error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to resend OTP. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center px-6 py-8">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
            {isOTPVerified ? 'Set New Password' : 'Reset Password with OTP'}
          </Text>
          <Text className="text-gray-600 text-center">
            {isOTPVerified 
              ? 'Enter your new password below' 
              : `Enter the 6-digit OTP sent to ${email}`
            }
          </Text>
        </View>

        {/* Form */}
        {!isOTPVerified && (
          <>
            <Controller
              control={control}
              name="otp"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="OTP"
                  placeholder="Enter 6-digit OTP"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.otp?.message}
                  keyboardType="numeric"
                  maxLength={6}
                  autoCapitalize="none"
                  autoCorrect={false}
                  leftIcon={<Ionicons name="keypad-outline" size={20} color="#6b7280" />}
                  required
                />
              )}
            />

            <Controller
              control={control}
              name="otp"
              render={({ field: { value } }) => (
                <Button
                  title="Verify OTP"
                  onPress={() => handleVerifyOTP(value)}
                  loading={isVerifyingOTP}
                  fullWidth
                  size="large"
                />
              )}
            />

            <View className="mt-4">
              <Button
                title="Resend OTP"
                onPress={handleResendOTP}
                variant="outline"
                fullWidth
                size="medium"
              />
            </View>
          </>
        )}

        {isOTPVerified && (
          <>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="New Password"
                  placeholder="Enter new password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  secureTextEntry
                  leftIcon={<Ionicons name="lock-closed-outline" size={20} color="#6b7280" />}
                  required
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Confirm New Password"
                  placeholder="Confirm new password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.confirmPassword?.message}
                  secureTextEntry
                  leftIcon={<Ionicons name="lock-closed-outline" size={20} color="#6b7280" />}
                  required
                />
              )}
            />

            <Button
              title="Reset Password"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              fullWidth
              size="large"
            />
          </>
        )}

        <View className="mt-6">
          <Text className="text-gray-600 text-center text-sm">
            Remember your password?{' '}
            <Text className="text-green-600 font-medium">
              Sign in here
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ResetPasswordWithOTPScreen; 