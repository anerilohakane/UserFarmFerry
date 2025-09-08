import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AddressCard({ address, isSelected, onSelect, onEdit, onDelete }) {
  return (
    <TouchableOpacity
      onPress={() => onSelect?.(address.id)}
      className={`p-4 mb-3 rounded-2xl border ${
        isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
      }`}
      activeOpacity={0.9}
    >
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-base font-semibold text-gray-800">{address.name}</Text>
        {isSelected && <Ionicons name="checkmark-circle" size={20} color="#10B981" />}
      </View>

      <Text className="text-sm text-gray-600 mb-2">{address.details}</Text>

      <View className="flex-row space-x-4">
        {onEdit && (
          <TouchableOpacity onPress={() => onEdit(address.id)}>
            <Text className="text-blue-600 text-sm font-medium">Edit</Text>
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity onPress={() => onDelete(address.id)}>
            <Text className="text-red-500 text-sm font-medium">Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}
