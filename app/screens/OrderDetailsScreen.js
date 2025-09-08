import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, RefreshControl, TextInput, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { ordersAPI } from '../services/api';
import { advancedDeliveryAPI } from '../services/api';
import { formatDateTime } from '../utils/helpers';
import { Ionicons } from '@expo/vector-icons';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { Image as RNImage } from 'react-native';
import { CONFIG } from '../constants/config';
import InvoiceService from '../services/invoiceService';
import { useAuth } from '../context/AuthContext';

// Price calculation functions from CheckoutScreen for consistency
const getSubtotal = (items) => items.reduce((sum, item) => {
  // Use discounted price if available, otherwise use regular price
  const price = item.discountedPrice || item.price;
  return sum + price * item.quantity;
}, 0);

const getShipping = (subtotal = 0) => {
  // Waive delivery charges for orders above ₹500
  return subtotal >= 500 ? 0 : 20.0;
};
const PLATFORM_FEE = 2.0;

// Helper function to calculate total amount using backend GST
const calculateTotalAmount = (order) => {
  if (!order.items || order.items.length === 0) {
    return order.totalAmount || 0;
  }

  // Calculate subtotal using discounted prices
  const subtotal = getSubtotal(order.items);
  
  // Use GST from backend order data (already calculated and stored)
  const gst = order.gst || 0;
  const shipping = getShipping(subtotal);
  const platformFee = PLATFORM_FEE;
  
  // Total calculation: subtotal(discounted) + gst(from backend) + shipping + platformFee
  const calculatedTotal = subtotal + gst + shipping + platformFee;
  
  // Debug log to verify calculation (remove in production)
  console.log('OrderDetailsScreen Total Calculation (Using Backend GST):', {
    orderId: order.orderId || order._id,
    subtotal,
    gst,
    shipping,
    platformFee,
    calculatedTotal
  });
  
  return calculatedTotal;
};

export default function OrderDetailsScreen() {
  const route = useRoute();
  const { orderId } = route.params || {};
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showReplacementModal, setShowReplacementModal] = useState(false);
  const [replacementReason, setReplacementReason] = useState('');
  const [replacementDescription, setReplacementDescription] = useState('');
  const [replacementPriority, setReplacementPriority] = useState('normal');
  const [isRequestingReplacement, setIsRequestingReplacement] = useState(false);
  const [replacementSuccess, setReplacementSuccess] = useState(false);
  const [replacementError, setReplacementError] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isLoadingQr, setIsLoadingQr] = useState(false);
  const [qrError, setQrError] = useState('');
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ordersAPI.getOrderDetails(orderId);
      if (response?.data?.data?.order) {
        setOrder(response.data.data.order);
      } else {
        setError('Order not found.');
      }
    } catch (err) {
      setError('Failed to fetch order details.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) fetchOrder();
    else setError('No order ID provided.');
  }, [orderId, fetchOrder]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrder();
  }, [fetchOrder]);

  const isReplacementAllowed = order && order.status === 'delivered' && order.deliveredAt &&
    (new Date() - new Date(order.deliveredAt)) / (1000 * 60 * 60 * 24) <= 7;

  const isDeliveryVerificationNeeded = order && order.status === 'delivered' && !order.deliveryVerified;

  const handleRequestReplacement = async () => {
    if (!replacementReason) {
      setReplacementError('Please select a reason.');
      return;
    }
    setIsRequestingReplacement(true);
    setReplacementError('');
    try {
      await advancedDeliveryAPI.requestReplacement(order._id, {
        reason: replacementReason,
        description: replacementDescription,
        priority: replacementPriority,
      });
      setReplacementSuccess(true);
      setShowReplacementModal(false);
      setTimeout(() => setReplacementSuccess(false), 2000);
      fetchOrder();
    } catch (err) {
      setReplacementError(err?.response?.data?.message || 'Failed to request replacement.');
    } finally {
      setIsRequestingReplacement(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpValue || otpValue.length !== 6) {
      setOtpError('Please enter the 6-digit OTP.');
      return;
    }
    setIsVerifyingOtp(true);
    setOtpError('');
    try {
      await advancedDeliveryAPI.verifyDeliveryOTP(order._id, { otp: otpValue });
      setOtpSuccess(true);
      setShowOtpModal(false);
      setTimeout(() => setOtpSuccess(false), 2000);
      fetchOrder();
    } catch (err) {
      setOtpError(err?.response?.data?.message || 'Failed to verify OTP.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleShowQr = async () => {
    setIsLoadingQr(true);
    setQrError('');
    try {
      const res = await advancedDeliveryAPI.getDeliveryQRCode(order._id);
      setQrCodeUrl(res.data?.qrCode || res.data?.qrCodeDataURL || '');
      setShowQrModal(true);
    } catch (err) {
      setQrError(err?.response?.data?.message || 'Failed to load QR code.');
    } finally {
      setIsLoadingQr(false);
    }
  };

  const handleGenerateInvoice = async () => {
    setGeneratingInvoice(true);
    try {
      // Get order details with customer and supplier information
      const orderResponse = await ordersAPI.getOrderDetails(order._id);
      const orderDetails = orderResponse.data.data.order || orderResponse.data.data;
      
      console.log('Order details received in OrderDetailsScreen:', JSON.stringify(orderDetails, null, 2));
      console.log('Customer data:', JSON.stringify(orderDetails.customer, null, 2));
      console.log('Supplier data:', JSON.stringify(orderDetails.supplier, null, 2));
      console.log('Items data:', JSON.stringify(orderDetails.items, null, 2));
      
      // Validate the data structure
      InvoiceService.validateOrderData(orderDetails, orderDetails.customer, orderDetails.supplier);
      
      // Try using the original order data if the fetched data is empty
      let finalOrderData = orderDetails;
      let finalCustomerData = orderDetails.customer;
      let finalSupplierData = orderDetails.supplier;
      
      // If the fetched data is missing information, try using the original order
      if (!orderDetails.orderId && !orderDetails._id) {
        console.log('Using original order data as fallback');
        finalOrderData = order;
        finalCustomerData = order.customer;
        finalSupplierData = order.supplier;
      }
      
      // If we still don't have customer data, try to get it from the user context
      if (!finalCustomerData || !finalCustomerData.firstName) {
        console.log('Customer data missing, trying to get from user context');
        if (user) {
          finalCustomerData = {
            firstName: user.firstName || 'Customer',
            lastName: user.lastName || 'Name',
            email: user.email || 'customer@example.com',
            phone: user.phone || 'N/A'
          };
          console.log('Using user data from context:', finalCustomerData);
        } else {
          finalCustomerData = {
            firstName: 'Customer',
            lastName: 'Name',
            email: 'customer@example.com',
            phone: 'N/A'
          };
        }
      }
      
      // Generate PDF invoice locally
      const pdfUri = await InvoiceService.generateInvoicePDF(
        finalOrderData,
        finalCustomerData,
        finalSupplierData
      );
      
      // Show options to user
      Alert.alert(
        'Invoice Generated Successfully! 📄',
        'Your invoice has been created. What would you like to do with it?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Share Invoice', 
            onPress: async () => {
              try {
                const shared = await InvoiceService.shareInvoice(pdfUri, order.orderId);
                if (!shared) {
                  Alert.alert(
                    'Sharing Not Available',
                    'Sharing is not available on this device. The invoice has been generated successfully.'
                  );
                }
              } catch (error) {
                console.error('Error sharing invoice:', error);
                Alert.alert('Error', 'Failed to share invoice. Please try again.');
              }
            }
          },
          { 
            text: 'Save to Device', 
            onPress: async () => {
              try {
                const savedPath = await InvoiceService.saveInvoiceToDevice(pdfUri, order.orderId);
                Alert.alert(
                  'Invoice Saved!',
                  `Invoice has been saved to your device.\nPath: ${savedPath}`,
                  [{ text: 'OK', style: 'default' }]
                );
              } catch (error) {
                console.error('Error saving invoice:', error);
                Alert.alert('Error', 'Failed to save invoice to device. Please try again.');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Invoice generation error:', error);
      Alert.alert('Error', 'Failed to generate invoice.');
    } finally {
      setGeneratingInvoice(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center px-8">
        <Text className="text-lg font-bold text-red-600 mb-4">{error}</Text>
        <Button title="Retry" onPress={fetchOrder} />
      </View>
    );
  }

  if (!order) return null;

  return (
    <ScrollView 
      className="flex-1 bg-gray-50" 
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh} 
          colors={["#10B981"]} 
        />
      }
    >
      {/* Order Summary Card */}
      <View className="bg-white mx-4 mt-4 mb-4 rounded-2xl shadow-sm border border-gray-100">
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold text-gray-800">
              Order #{order.orderId?.slice(-6) || order._id?.slice(-6) || ''}
            </Text>
            <View className={`px-3 py-1 rounded-full ${
              order.status === 'delivered' ? 'bg-green-100' :
              order.status === 'pending' ? 'bg-yellow-100' :
              order.status === 'cancelled' ? 'bg-red-100' : 'bg-blue-100'
            }`}>
              <Text className={`text-xs font-semibold ${
                order.status === 'delivered' ? 'text-green-800' :
                order.status === 'pending' ? 'text-yellow-800' :
                order.status === 'cancelled' ? 'text-red-800' : 'text-blue-800'
              }`}>
                {order.status?.toUpperCase()}
              </Text>
            </View>
          </View>

          {order.isExpressDelivery && (
            <View className="flex-row items-center mb-2">
              <Ionicons name="flash" size={14} color="#f59e0b" />
              <Text className="ml-1 text-yellow-600 font-medium text-xs">Express Delivery</Text>
            </View>
          )}

          <View className="space-y-2">
            {order.createdAt && (
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={14} color="#6b7280" />
                <Text className="text-gray-500 text-sm ml-2">{formatDateTime(order.createdAt)}</Text>
              </View>
            )}

            {order.paymentMethod && (
              <View className="flex-row items-center">
                <Ionicons name="card-outline" size={14} color="#6b7280" />
                <Text className="text-gray-500 text-sm ml-2">{order.paymentMethod}</Text>
              </View>
            )}

            {order.supplier && (
              <View className="flex-row items-center">
                <Ionicons name="business-outline" size={14} color="#6b7280" />
                <Text className="text-gray-500 text-sm ml-2">
                  {order.supplier.businessName || order.supplier.name || order.supplier.email || ''}
                </Text>
              </View>
            )}

            {order.deliveryAddress && (
              <View className="flex-row items-start">
                <Ionicons name="location-outline" size={14} color="#6b7280" className="mt-1" />
                <Text className="text-gray-500 text-sm ml-2 flex-1">
                  {order.deliveryAddress.addressLine1 || 
                    [order.deliveryAddress.street, order.deliveryAddress.city, order.deliveryAddress.state, order.deliveryAddress.postalCode, order.deliveryAddress.country]
                      .filter(Boolean)
                      .join(', ')}
                </Text>
              </View>
            )}

            {order.customer && (
              <View className="flex-row items-center">
                <Ionicons name="person-outline" size={14} color="#6b7280" />
                <Text className="text-gray-500 text-sm ml-2">
                  {order.customer.firstName ? `${order.customer.firstName} ${order.customer.lastName}` : order.customer.email || order.customer.phone || ''}
                </Text>
              </View>
            )}

            {order.notes && (
              <View className="flex-row items-start mt-2">
                <Ionicons name="document-text-outline" size={14} color="#10b981" className="mt-0.5" />
                <Text className="ml-2 text-green-700 text-sm italic flex-1">{order.notes}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Divider */}
      <View className="h-px bg-gray-200 mx-4 my-2" />

      {/* Order Items */}
      <Text className="text-lg font-bold text-gray-800 px-4 mb-3">Order Items</Text>
      
      {order.items?.length > 0 ? (
        <View className="px-4">
          {order.items.map((item, index) => (
            <View
              key={index}
              className="flex-row bg-white p-3 mb-3 rounded-xl items-center border border-gray-100"
            >
              {item.product?.images?.[0]?.url ? (
                <Image 
                  source={{ uri: item.product.images[0].url }} 
                  className="w-14 h-14 mr-3 rounded-lg" 
                  resizeMode="cover" 
                />
              ) : (
                <View className="w-14 h-14 mr-3 bg-gray-100 rounded-lg items-center justify-center">
                  <Text>🛒</Text>
                </View>
              )}
                             <View className="flex-1">
                 <Text className="font-medium text-gray-800 text-sm mb-1" numberOfLines={1}>
                   {item.product?.name || 'Product'}
                 </Text>
                 <Text className="text-xs text-gray-500 mb-1">Qty: {item.quantity || item.qty}</Text>
                 <View className="flex-row items-center">
                   {item.discountedPrice && item.discountedPrice < item.price ? (
                     <>
                       <Text className="text-sm text-green-600 font-medium">₹{item.discountedPrice}</Text>
                       <Text className="text-xs text-gray-400 line-through ml-2">₹{item.price}</Text>
                     </>
                   ) : (
                     <Text className="text-sm text-gray-700 font-medium">₹{item.price}</Text>
                   )}
                 </View>
               </View>
            </View>
          ))}
        </View>
      ) : (
        <Text className="text-gray-500 px-4">No items in this order.</Text>
      )}

      {/* Order Summary - Same format as CheckoutScreen */}
      <View className="bg-white mx-4 my-4 rounded-2xl p-4 shadow-sm border border-gray-100">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-lg font-semibold text-gray-800">
            Order Summary
          </Text>
        </View>
        
        {/* Order Items */}
        {order.items?.map((item, index) => (
          <View
            key={index}
            className="flex-row justify-between items-center mb-2"
          >
            <Text className="flex-1 text-gray-700">
              {item.product?.name || 'Product'} x{item.quantity || item.qty}
            </Text>
            <Text className="text-gray-700">
              ₹{((item.discountedPrice || item.price) * (item.quantity || item.qty)).toFixed(2)}
            </Text>
          </View>
        ))}
        
        {/* Price Breakdown */}
        <View className="border-t border-gray-200 mt-2 pt-2">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-gray-600">Subtotal</Text>
            <Text className="text-gray-700">₹{getSubtotal(order.items).toFixed(2)}</Text>
          </View>
          
                     <View className="flex-row justify-between items-center mb-1">
             <Text className="text-gray-600">
               GST
               {/* Show GST percentage from backend */}
               {(() => {
                 // Calculate GST percentage from backend GST amount and subtotal
                 const subtotal = getSubtotal(order.items);
                 if (subtotal > 0 && order.gst > 0) {
                   const gstPercentage = ((order.gst / subtotal) * 100).toFixed(1);
                   return ` (${gstPercentage}%)`;
                 }
                 return '';
               })()}
             </Text>
             <Text className="text-gray-700">₹{(order.gst || 0).toFixed(2)}</Text>
           </View>
          
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-gray-600">Platform Fee</Text>
            <Text className="text-gray-700">₹{PLATFORM_FEE.toFixed(2)}</Text>
          </View>
          
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-gray-600">Shipping</Text>
            <Text className="text-gray-700">₹{getShipping().toFixed(2)}</Text>
          </View>
          
          <View className="flex-row justify-between items-center font-bold">
            <Text className="font-bold text-gray-800">
              Total
            </Text>
            <Text className="font-bold text-gray-800">
              ₹{calculateTotalAmount(order).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Success Messages */}
      {replacementSuccess && (
        <View className="mx-4 mb-4 bg-green-100 rounded-lg p-3">
          <Text className="text-green-700 font-medium text-center">
            Replacement request submitted!
          </Text>
        </View>
      )}

      {otpSuccess && (
        <View className="mx-4 mb-4 bg-green-100 rounded-lg p-3">
          <Text className="text-green-700 font-medium text-center">
            Delivery verified successfully!
          </Text>
        </View>
      )}
    </ScrollView>
  );
}