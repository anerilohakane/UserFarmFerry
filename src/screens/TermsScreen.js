import React from 'react';
import { View, Text, ScrollView } from 'react-native';

export default function TermsScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-50 p-5">
      <Text className="text-2xl font-bold text-gray-800 mb-4">Terms & Conditions</Text>

      <Text className="text-base text-gray-700 mb-4">
        By using FarmFerry, you agree to our terms and conditions. Please read them carefully.
      </Text>

      <Text className="text-sm text-gray-600 leading-relaxed">
        - We deliver only to serviceable locations.
        {'\n'}- Orders once placed cannot be canceled after dispatch.
        {'\n'}- Prices are subject to change based on availability and demand.
        {'\n'}- Refunds are processed within 5–7 business days for valid issues.
        {'\n'}- Abusive behavior toward delivery staff is strictly prohibited.
        {'\n\n'}For more information, please contact support.
      </Text>
    </ScrollView>
  );
}
