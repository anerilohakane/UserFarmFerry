import React, { useState } from 'react';
import { View, Text, SafeAreaView, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { resetPasswordSchema } from '../../utils/validation';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const ResetPasswordScreen = ({ route }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { resetPassword } = useAuth();
  const token = route.params?.token;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      await resetPassword(data.token, data.password);
      Alert.alert(
        'Success',
        'Your password has been reset successfully. You can now sign in with your new password.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reset password. Please try again.';
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
            Reset Password
          </Text>
          <Text className="text-gray-600 text-center">
            Enter your new password below.
          </Text>
        </View>

        {/* Form */}
        {!token && (
          <Controller
            control={control}
            name="token"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Reset Token"
                placeholder="Enter reset token from email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.token?.message}
                autoCapitalize="none"
                autoCorrect={false}
                leftIcon={<Ionicons name="key-outline" size={20} color="#6b7280" />}
                required
              />
            )}
          />
        )}

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

export default ResetPasswordScreen; 