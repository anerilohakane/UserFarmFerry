import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { customerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function EditProfileScreen({ navigation, route }) {
  const { user } = route.params;
  const { updateUser } = useAuth();

  // Use firstName and lastName fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch fresh user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await customerAPI.getProfile();
        const userData = response.data.data;
        
        setFirstName(userData?.firstName || (userData?.name?.split(' ')[0] || ''));
        setLastName(userData?.lastName || (userData?.name?.split(' ')[1] || ''));
        setEmail(userData?.email || '');
        setPhone(userData?.phone || '');
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Fallback to route params if API fails
        setFirstName(user?.firstName || (user?.name?.split(' ')[0] || ''));
        setLastName(user?.lastName || (user?.name?.split(' ')[1] || ''));
        setEmail(user?.email || '');
        setPhone(user?.phone || '');
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleUpdate = async () => {
    if (!firstName || !lastName || !email || !phone) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }
    setIsSaving(true);
    try {
      const payload = { firstName, lastName, email, phone };
      console.log('EditProfileScreen update payload:', payload);
      await customerAPI.updateProfile(payload);
      const refreshed = await customerAPI.getProfile();
      console.log('EditProfileScreen backend response:', refreshed.data);
      updateUser(refreshed.data.data);
      console.log('EditProfileScreen context updated with:', refreshed.data.data);
      setIsSaving(false);
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      setIsSaving(false);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile.');
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-600 text-base">Loading profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        className="flex-1 px-6" 
        contentContainerStyle={{ justifyContent: 'center', flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Card Container */}
        <View className="bg-white rounded-2xl shadow-lg p-6 mx-4">
          {/* Title */}
          <Text className="text-2xl font-bold text-green-800 mb-8 text-center">
            Edit Profile
          </Text>

          {/* First Name */}
          <View className="mb-6">
            <Text className="text-gray-800 font-medium mb-2 text-base">First Name</Text>
            <View className="bg-green-50 rounded-xl px-4 py-3">
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter first name"
                placeholderTextColor="#9CA3AF"
                className="text-base text-gray-800"
              />
            </View>
          </View>

          {/* Last Name */}
          <View className="mb-6">
            <Text className="text-gray-800 font-medium mb-2 text-base">Last Name</Text>
            <View className="bg-green-50 rounded-xl px-4 py-3">
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter last name"
                placeholderTextColor="#9CA3AF"
                className="text-base text-gray-800"
              />
            </View>
          </View>

          {/* Email */}
          <View className="mb-6">
            <Text className="text-gray-800 font-medium mb-2 text-base">Email</Text>
            <View className="bg-green-50 rounded-xl px-4 py-3">
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholder="Enter email"
                placeholderTextColor="#9CA3AF"
                className="text-base text-gray-800"
              />
            </View>
          </View>

          {/* Phone Number */}
          <View className="mb-8">
            <Text className="text-gray-800 font-medium mb-2 text-base">Phone Number</Text>
            <View className="bg-green-50 rounded-xl px-4 py-3">
              <TextInput
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="Enter phone number"
                placeholderTextColor="#9CA3AF"
                className="text-base text-gray-800"
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleUpdate}
            disabled={isSaving}
            className="bg-green-600 py-4 rounded-xl items-center"
          >
            <Text className="text-white font-semibold text-base">
              {isSaving ? 'Updating...' : 'Update Profile'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
