import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

const LoadingScreen = () => {
  return (
    <View className="flex-1 bg-white justify-center items-center">
      <ActivityIndicator size="large" color="#059669" />
      <Text className="text-gray-600 mt-4 text-lg font-medium">
        Loading FarmFerry...
      </Text>
    </View>
  );
};

export default LoadingScreen;
