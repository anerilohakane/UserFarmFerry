import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authAPI } from '../services/api';

const { width } = Dimensions.get('window');

export default function ChangePasswordScreen({ navigation }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [secure, setSecure] = useState(true);

  // Responsive values
  const isSmallScreen = width < 375;
  const paddingHorizontal = isSmallScreen ? 'px-4' : 'px-6';
  const cardPadding = isSmallScreen ? 'p-4' : 'p-6';
  const inputPadding = isSmallScreen ? 'py-2' : 'py-3';
  const buttonPadding = isSmallScreen ? 'py-3' : 'py-4';
  const titleSize = isSmallScreen ? 'text-xl' : 'text-2xl';
  const textSize = isSmallScreen ? 'text-sm' : 'text-base';

  const handleSubmit = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Missing Fields', 'Please fill out all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New passwords do not match.');
      return;
    }
    setIsLoading(true);
    try {
      await authAPI.changePassword(oldPassword, newPassword);
      setIsLoading(false);
      Alert.alert('Success', 'Password changed successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', error.response?.data?.message || 'Failed to change password.');
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        className={`flex-1 ${paddingHorizontal}`}
        contentContainerStyle={{ justifyContent: 'center', flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Card Container */}
        <View className={`bg-white rounded-2xl shadow-lg ${cardPadding} mx-2`}>
          {/* Title */}
          <Text className={`${titleSize} font-bold text-green-800 mb-6 text-center`}>
            Update your password
          </Text>

          {/* Current Password */}
          <View className="mb-4">
            <Text className={`text-gray-800 font-medium mb-2 ${textSize}`}>Current Password</Text>
            <View className={`flex-row items-center bg-green-50 rounded-xl px-4 ${inputPadding}`}>
              <TextInput
                value={oldPassword}
                onChangeText={setOldPassword}
                placeholder="Enter current password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={secure}
                className={`flex-1 ${textSize} text-gray-800`}
              />
              <TouchableOpacity onPress={() => setSecure(!secure)}>
                <Ionicons name={secure ? 'eye-off' : 'eye'} size={20} color="#008000" />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View className="mb-4">
            <Text className={`text-gray-800 font-medium mb-2 ${textSize}`}>New Password</Text>
            <View className={`flex-row items-center bg-green-50 rounded-xl px-4 ${inputPadding}`}>
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={secure}
                className={`flex-1 ${textSize} text-gray-800`}
              />
              <TouchableOpacity onPress={() => setSecure(!secure)}>
                <Ionicons name={secure ? 'eye-off' : 'eye'} size={20} color="#008000" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm New Password */}
          <View className="mb-6">
            <Text className={`text-gray-800 font-medium mb-2 ${textSize}`}>Confirm New Password</Text>
            <View className={`flex-row items-center bg-green-50 rounded-xl px-4 ${inputPadding}`}>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={secure}
                className={`flex-1 ${textSize} text-gray-800`}
              />
              <TouchableOpacity onPress={() => setSecure(!secure)}>
                <Ionicons name={secure ? 'eye-off' : 'eye'} size={20} color="#008000" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className={`bg-green-600 ${buttonPadding} rounded-xl items-center`}
            disabled={isLoading}
            onPress={handleSubmit}
          >
            <Text className={`text-white ${textSize} font-semibold`}>
              {isLoading ? 'Updating...' : 'Change Password'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}