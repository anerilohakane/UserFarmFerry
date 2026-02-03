import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { customerAPI } from '../services/api';

const AVAILABLE_METHODS = [
  { key: 'COD', label: 'Cash on Delivery' },
  { key: 'CARD', label: 'Credit/Debit Card' },
  { key: 'UPI', label: 'UPI' },
];

const PaymentMethodsScreen = () => {
  const [defaultMethod, setDefaultMethod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchDefaultMethod();
  }, []);

  const fetchDefaultMethod = async () => {
    setLoading(true);
    try {
      const res = await customerAPI.getProfile();
      setDefaultMethod(res.data.data.defaultPaymentMethod || 'COD');
    } catch (e) {
      Alert.alert('Error', 'Failed to fetch payment method');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (method) => {
    setUpdating(true);
    try {
      await customerAPI.updateProfile({ defaultPaymentMethod: method });
      setDefaultMethod(method);
      Alert.alert('Success', 'Default payment method updated!');
    } catch (e) {
      Alert.alert('Error', 'Failed to update payment method');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold text-gray-800 mb-4">Payment Methods</Text>
      <Text className="text-gray-500 mb-6">Select your default payment method for orders.</Text>
      {AVAILABLE_METHODS.map((method) => (
        <TouchableOpacity
          key={method.key}
          className={`flex-row items-center justify-between p-4 mb-3 rounded-xl border ${defaultMethod === method.key ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
          onPress={() => handleSetDefault(method.key)}
          disabled={updating}
        >
          <Text className="text-lg text-gray-800">{method.label}</Text>
          {defaultMethod === method.key && (
            <Text className="text-green-600 font-semibold">Default</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default PaymentMethodsScreen; 