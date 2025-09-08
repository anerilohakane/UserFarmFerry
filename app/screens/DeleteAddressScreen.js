import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DeleteAddressScreen({ route, navigation }) {
  const { address } = route.params; // expect: { id, name, street, city, pincode }

  const handleDelete = () => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete this address?\n\n${address.name}, ${address.street}, ${address.city} - ${address.pincode}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Simulate delete
            setTimeout(() => {
              Alert.alert('Deleted', 'Address removed successfully.');
              navigation.goBack();
            }, 600);
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-50 px-5">
      <Ionicons name="trash-outline" size={60} color="#EF4444" />
      <Text className="text-xl font-bold text-red-500 mt-4 mb-2">Delete Address</Text>
      <Text className="text-gray-700 text-center mb-6">
        {address.name}, {address.street}, {address.city} - {address.pincode}
      </Text>

      <TouchableOpacity
        className="bg-red-500 rounded-2xl px-8 py-4 mb-3"
        onPress={handleDelete}
      >
        <Text className="text-white font-semibold text-base">Confirm Delete</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="py-3"
        onPress={() => navigation.goBack()}
      >
        <Text className="text-gray-500 font-medium text-base">Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}
