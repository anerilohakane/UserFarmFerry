import React from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function LoadingIndicator({ size = 'large', color = '#10B981' }) {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}
