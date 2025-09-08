import React, { useState } from 'react';
import { View, Text, SafeAreaView, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { forgotPasswordSchema } from '../../utils/validation';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { SCREEN_NAMES } from '../../types';

const ForgotPasswordScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { forgotPassword } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      // Send email with role parameter for OTP-based reset
      await forgotPassword(data.email, 'customer');
      Alert.alert(
        'OTP Sent',
        'A 6-digit OTP has been sent to your email. Please check your inbox and enter the OTP to reset your password.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate(SCREEN_NAMES.RESET_PASSWORD_WITH_OTP, { email: data.email })
          }
        ]
      );
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center px-6 py-8">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
            Forgot Password?
          </Text>
          <Text className="text-gray-600 text-center">
            Enter your email address and we'll send you a 6-digit OTP to reset your password.
          </Text>
        </View>

        {/* Form */}
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Email Address"
              placeholder="Enter your email"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.email?.message}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon={<Ionicons name="mail-outline" size={20} color="#6b7280" />}
              required
            />
          )}
        />

        <Button
          title="Send OTP"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          fullWidth
          size="large"
        />

        {/* <View className="mt-6">
          <Text className="text-gray-600 text-center text-sm">
            Remember your password?{' '}
            <Text className="text-green-600 font-medium">
              Sign in here
            </Text>
          </Text>
        </View> */}
      </View>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen; 