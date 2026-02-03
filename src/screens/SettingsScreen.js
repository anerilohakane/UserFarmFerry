import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { logout } = useAuth();
  const [theme, setTheme] = useState('system');
  const [notifications, setNotifications] = useState(true);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert('Delete Account', 'This feature is coming soon. Please contact support to delete your account.', [
      { text: 'OK' },
    ]);
  };

  return (
    <View className="flex-1 bg-white p-6">
      {/* <Text className="text-2xl font-bold text-gray-800 mb-6">Settings</Text> */}

      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-700 mb-2">App Preferences</Text>
        {/* <View className="flex-row items-center justify-between mb-4">
          <Text className="text-base text-gray-800">Dark Mode</Text>
          <Switch
            value={theme === 'dark'}
            onValueChange={v => setTheme(v ? 'dark' : 'light')}
          />
        </View> */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-base text-gray-800">Notifications</Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
          />
        </View>
      </View>
{/* 
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-700 mb-2">Development</Text>
        <TouchableOpacity
          className="bg-blue-100 p-4 rounded-xl mb-4"
          onPress={() => navigation.navigate('RazorpayTest')}
        >
          <Text className="text-blue-600 font-semibold text-base">Test Razorpay Payment</Text>
        </TouchableOpacity>
      </View> */}

      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-700 mb-2">Account</Text>
        <TouchableOpacity
          className="bg-red-100 p-4 rounded-xl mb-4"
          onPress={handleDeleteAccount}
        >
          <Text className="text-red-600 font-semibold text-base">Delete Account</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-gray-100 p-4 rounded-xl"
          onPress={handleLogout}
        >
          <Text className="text-gray-800 font-semibold text-base">Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SettingsScreen; 