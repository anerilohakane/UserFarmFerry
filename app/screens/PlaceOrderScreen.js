import { MaterialIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import React, { useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

export default function PlaceOrderScreen({ navigation }) {
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePlaceOrder = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      navigation.navigate('Orders');
    }, 2000);
  };

  return (
    <View className="flex-1 bg-gray-50 p-5 justify-between">
      {/* Success Animation Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View className="flex-1 bg-black/30 justify-center items-center">
          <View className="bg-white p-8 rounded-2xl items-center">
            <LottieView
              source={require('../../assets/Payment-Success.json')} // Add your Lottie JSON file
              autoPlay
              loop={false}
              style={{ width: 150, height: 150 }}
            />
            <Text className="text-2xl font-bold text-green-600 mt-4">Order Placed!</Text>
            <Text className="text-gray-600 mt-2">Your order has been confirmed</Text>
          </View>
        </View>
      </Modal>

      <View className="flex-1">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-green-800 mb-2">Confirm Your Order</Text>
          <Text className="text-lg text-gray-600">Review your details before placing the order</Text>
        </View>

        {/* Delivery Address Card */}
        <View className="bg-white rounded-xl p-5 shadow-sm shadow-green-200 mb-5">
          <View className="flex-row items-center mb-3">
            <MaterialIcons name="location-on" size={24} color="#388E3C" />
            <Text className="text-xl font-semibold text-green-800 ml-2">Delivery Address</Text>
          </View>
          <Text className="text-gray-700 text-base ml-8">5A, Main Road, Chennai - 600001</Text>
        </View>

        {/* Payment Method Card */}
        <View className="bg-white rounded-xl p-5 shadow-sm shadow-green-200 mb-5">
          <View className="flex-row items-center mb-3">
            <MaterialIcons name="payment" size={24} color="#388E3C" />
            <Text className="text-xl font-semibold text-green-800 ml-2">Payment Method</Text>
          </View>
          <Text className="text-gray-700 text-base ml-8">Cash on Delivery</Text>
        </View>

        {/* Order Summary Card */}
        <View className="bg-white rounded-xl p-5 shadow-sm shadow-green-200">
          <Text className="text-xl font-semibold text-green-800 mb-4">Order Summary</Text>
          
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-600">Items Total</Text>
            <Text className="text-gray-800 font-medium">₹1,250</Text>
          </View>
          
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-600">Delivery Fee</Text>
            <Text className="text-gray-800 font-medium">₹50</Text>
          </View>
          
          <View className="border-b border-gray-200 my-3" />
          
          <View className="flex-row justify-between mt-2">
            <Text className="text-lg font-bold text-green-800">Total Amount</Text>
            <Text className="text-lg font-bold text-green-800">₹1,300</Text>
          </View>
        </View>
      </View>

      {/* Place Order Button */}
      <TouchableOpacity
        onPress={handlePlaceOrder}
        className="bg-green-600 py-4 rounded-xl flex-row justify-center items-center shadow-lg shadow-green-400"
        activeOpacity={0.9}
      >
        <Text className="text-white text-lg font-bold mr-2">Place Order</Text>
        <MaterialIcons name="arrow-forward" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
}