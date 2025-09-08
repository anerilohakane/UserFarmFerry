import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import RazorpayService from '../services/razorpayService';
import { useAuth } from '../context/AuthContext';

const RazorpayTestScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRazorpayAvailable, setIsRazorpayAvailable] = useState(false);

  useEffect(() => {
    setIsRazorpayAvailable(RazorpayService.isAvailable());
  }, []);

  const handleTestPayment = async () => {
    setIsProcessing(true);
    
    try {
      const paymentData = {
        amount: 100,
        orderId: `test_order_${Date.now()}`,
        customerName: user?.firstName + ' ' + user?.lastName || 'Test Customer',
        customerEmail: user?.email || 'test@farmferry.com',
        customerPhone: user?.phone || '9876543210',
        description: 'Test payment for FarmFerry',
        prefill: {},
        notes: {
          order_id: `test_order_${Date.now()}`,
          customer_id: user?._id || 'test_customer'
        }
      };

      const result = await RazorpayService.processPayment(paymentData);
      
      const isMock = result.paymentMethod === 'razorpay_mock';
      const title = isMock ? 'Mock Payment Successful!' : 'Payment Successful!';
      const message = `Transaction ID: ${result.transactionId}\nAmount: ₹${result.amount}${isMock ? '\n\n(Using mock payment - Razorpay library not available)' : ''}`;
      
      Alert.alert(title, message, [{ text: 'OK', onPress: () => navigation.goBack() }]);

    } catch (error) {
      Alert.alert(
        'Payment Failed',
        error.message || 'Payment could not be processed',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold ml-3">Razorpay Test</Text>
      </View>

      <View className="flex-1 p-6">
        <View className="bg-white rounded-xl p-6 shadow-sm">
                     <Text className="text-2xl font-bold text-center mb-2">Test Razorpay Integration</Text>
           
           {/* Status Indicator */}
           <View className={`p-3 rounded-lg mb-4 ${isRazorpayAvailable ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
             <Text className={`text-center font-medium ${isRazorpayAvailable ? 'text-green-700' : 'text-yellow-700'}`}>
               {isRazorpayAvailable ? '✅ Razorpay Available' : '⚠️ Using Mock Payment'}
             </Text>
             <Text className={`text-center text-sm mt-1 ${isRazorpayAvailable ? 'text-green-600' : 'text-yellow-600'}`}>
               {isRazorpayAvailable ? 'Real Razorpay integration will be used' : 'Razorpay library not available, using mock payment'}
             </Text>
           </View>
           
           <Text className="text-gray-600 text-center mb-6">
             This will initiate a test payment of ₹1.00 using {isRazorpayAvailable ? 'Razorpay' : 'mock payment'}
           </Text>

          <TouchableOpacity
            className={`rounded-lg py-4 items-center ${isProcessing ? 'bg-gray-300' : 'bg-blue-600'}`}
            onPress={handleTestPayment}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text className="text-white font-bold text-lg">Start Test Payment</Text>
            )}
          </TouchableOpacity>

          <Text className="text-xs text-gray-500 text-center mt-4">
            This is a test payment. No actual charges will be made.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default RazorpayTestScreen; 