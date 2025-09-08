import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { PaymentStatusTracker } from '../services/paymentService';

const PaymentStatusScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { 
    paymentMethod, 
    amount, 
    orderId, 
    transactionId, 
    onPaymentComplete,
    onPaymentFailed 
  } = route.params || {};

  const [status, setStatus] = useState('processing'); // 'processing', 'success', 'failed'
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (transactionId) {
      trackPaymentStatus();
    } else {
      // Simulate payment processing for demo
      setTimeout(() => {
        const isSuccess = Math.random() > 0.2; // 80% success rate
        setStatus(isSuccess ? 'success' : 'failed');
        setIsLoading(false);
        
        if (isSuccess && onPaymentComplete) {
          onPaymentComplete();
        } else if (!isSuccess && onPaymentFailed) {
          onPaymentFailed('Payment processing failed');
        }
      }, 3000);
    }
  }, [transactionId]);

  const trackPaymentStatus = async () => {
    try {
      const result = await PaymentStatusTracker.trackPaymentStatus(transactionId);
      setStatus(result.status === 'success' ? 'success' : 'failed');
      
      if (result.status === 'success' && onPaymentComplete) {
        onPaymentComplete();
      } else if (result.status !== 'success' && onPaymentFailed) {
        onPaymentFailed('Payment verification failed');
      }
    } catch (error) {
      setStatus('failed');
      setErrorMessage(error.message || 'Payment verification failed');
      if (onPaymentFailed) {
        onPaymentFailed(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle size={60} color="#059669" />;
      case 'failed':
        return <XCircle size={60} color="#ef4444" />;
      default:
        return <Clock size={60} color="#f59e0b" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'success':
        return 'Payment Successful!';
      case 'failed':
        return 'Payment Failed';
      default:
        return 'Processing Payment...';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'success':
        return 'Your payment has been processed successfully. Your order will be confirmed shortly.';
      case 'failed':
        return errorMessage || 'Payment could not be processed. Please try again.';
      default:
        return 'Please wait while we process your payment...';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return '#059669';
      case 'failed':
        return '#ef4444';
      default:
        return '#f59e0b';
    }
  };

  const handleRetry = () => {
    setStatus('processing');
    setIsLoading(true);
    setErrorMessage('');
    
    setTimeout(() => {
      const isSuccess = Math.random() > 0.3; // 70% success rate on retry
      setStatus(isSuccess ? 'success' : 'failed');
      setIsLoading(false);
      
      if (isSuccess && onPaymentComplete) {
        onPaymentComplete();
      } else if (!isSuccess && onPaymentFailed) {
        onPaymentFailed('Payment retry failed');
      }
    }, 2000);
  };

  const handleContinue = () => {
    if (status === 'success') {
      navigation.navigate('Orders');
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 justify-center items-center px-6">
        {/* Header */}
        <View className="absolute top-12 left-6">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="flex-row items-center"
          >
            <ArrowLeft size={24} color="#374151" />
            <Text className="ml-2 text-gray-700 font-medium">Back</Text>
          </TouchableOpacity>
        </View>

        {/* Status Content */}
        <View className="items-center">
          {/* Status Icon */}
          <View className="mb-6">
            {isLoading ? (
              <View className="items-center">
                <ActivityIndicator size="large" color={getStatusColor()} />
                <LottieView
                  source={require('../../assets/Payment-Success.json')}
                  autoPlay
                  loop
                  style={{ width: 100, height: 100, opacity: 0.5 }}
                />
              </View>
            ) : (
              getStatusIcon()
            )}
          </View>

          {/* Status Title */}
          <Text className="text-2xl font-bold text-gray-800 mb-3 text-center">
            {getStatusTitle()}
          </Text>

          {/* Status Message */}
          <Text className="text-gray-600 text-center mb-8 leading-6">
            {getStatusMessage()}
          </Text>

          {/* Payment Details */}
          <View className="bg-white rounded-xl p-4 mb-6 w-full shadow-sm">
            <Text className="text-sm font-medium text-gray-500 mb-3">Payment Details</Text>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Amount</Text>
                <Text className="font-semibold">₹{amount?.toFixed(2) || '0.00'}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Payment Method</Text>
                <Text className="font-semibold capitalize">
                  {paymentMethod?.replace('_', ' ') || 'Unknown'}
                </Text>
              </View>
              {orderId && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Order ID</Text>
                  <Text className="font-semibold text-xs">{orderId}</Text>
                </View>
              )}
              {transactionId && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Transaction ID</Text>
                  <Text className="font-semibold text-xs">{transactionId}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View className="w-full space-y-3">
            {status === 'failed' && (
              <TouchableOpacity
                onPress={handleRetry}
                className="bg-blue-600 py-3 rounded-xl items-center"
              >
                <Text className="text-white font-semibold">Retry Payment</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleContinue}
              style={{ borderRadius: 12, overflow: 'hidden' }}
            >
              <LinearGradient
                colors={status === 'success' ? ["#10b981", "#059669"] : ["#6b7280", "#4b5563"]}
                className="py-3 items-center rounded-xl"
              >
                <Text className="text-white font-semibold">
                  {status === 'success' ? 'Continue to Orders' : 'Go Back'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {status === 'success' && (
              <TouchableOpacity
                onPress={() => navigation.navigate('Home')}
                className="bg-gray-100 py-3 rounded-xl items-center"
              >
                <Text className="text-gray-700 font-medium">Continue Shopping</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PaymentStatusScreen; 