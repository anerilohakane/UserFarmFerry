import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';

const addresses = [
  { id: '1', name: 'Home', detail: '123 Green Street, Chennai' },
  { id: '2', name: 'Work', detail: '45 Tech Park, Bangalore' },
];

export default function SetDefaultAddressScreen() {
  const [selected, setSelected] = useState('1');

  const handleSave = () => {
    Alert.alert('Updated', 'Default address has been updated.');
  };

  return (
    <View className="flex-1 bg-gray-50 p-5">
      <Text className="text-2xl font-bold text-gray-800 mb-4">Set Default Address</Text>

      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            className={`bg-white p-4 rounded-2xl mb-3 border ${
              selected === item.id ? 'border-green-500' : 'border-gray-100'
            }`}
            onPress={() => setSelected(item.id)}
          >
            <Text className="font-semibold text-gray-800">{item.name}</Text>
            <Text className="text-sm text-gray-600 mt-1">{item.detail}</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        onPress={handleSave}
        className="bg-green-500 py-4 rounded-2xl items-center mt-6"
      >
        <Text className="text-white font-semibold">Save Default</Text>
      </TouchableOpacity>
    </View>
  );
}
