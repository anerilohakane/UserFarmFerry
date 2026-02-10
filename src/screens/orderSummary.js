import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import React, { useState, useEffect, useRef } from 'react';
import { Modal, Text, TouchableOpacity, View, Alert, ScrollView, ActivityIndicator, Platform, Dimensions } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { ordersAPI, customerAPI, productsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import eventBus from '../utils/eventBus';

const { width } = Dimensions.get('window');

export default function OrderSummaryScreen({ navigation, route }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' or 'upi'

  // Map State
  const mapRef = useRef(null);
  const [region, setRegion] = useState({
    latitude: 20.5937, // Default India
    longitude: 78.9629,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const { user } = useAuth();
  const { updateCartItems } = useAppContext();

  // Get data from route params (passed from CartScreen)
  const cartItems = route?.params?.items || [];

  // Calculate totals if not provided
  const calculateTotals = () => {
    const itemsTotal = cartItems.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0);
    const deliveryFee = 50; // Hardcoded for now as per UI design
    const grandTotal = itemsTotal + deliveryFee;
    return { itemsTotal, deliveryFee, grandTotal };
  };

  const { itemsTotal, deliveryFee, grandTotal } = calculateTotals();

  // Fetch address logic
  useEffect(() => {
    initializeAddress();
  }, []);

  const initializeAddress = async () => {
    setLoading(true);
    try {
      // 1. Try to get saved profile address first
      const response = await customerAPI.getProfile();
      const addresses = response?.data?.data?.customer?.addresses;

      if (Array.isArray(addresses) && addresses.length > 0) {
        setAddress(addresses[0]);
        // Note: Saved addresses usually don't have coords unless saved with them. 
        // If we want map to center on saved address, we might need geocoding if coords are missing.
        // For now, let's fetch current location as fallback for map centering if needed.
        fetchCurrentLocation();
      } else {
        // 2. If no saved address, try fetching current location
        await fetchCurrentLocation();
      }
    } catch (error) {
      console.error('Error initializing address:', error);
      await fetchCurrentLocation();
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentLocation = async () => {
    if (locationLoading) return;
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Update Map Region
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });

      // Reverse geocode
      const reverseGeocoded = await Location.reverseGeocodeAsync({ latitude, longitude });

      if (reverseGeocoded.length > 0) {
        const place = reverseGeocoded[0];
        const newAddress = {
          street: `${place.name || ''} ${place.street || ''}`.trim() || 'Current Location',
          city: place.city || place.subregion || '',
          state: place.region || '',
          postalCode: place.postalCode || '',
          country: place.country || '',
          phone: user?.phone || "",
          latitude, // Save coords so we can use them
          longitude
        };
        setAddress(newAddress);
      }
    } catch (error) {
      console.error('Error fetching current location:', error);
      // Alert.alert('Location Error', 'Failed to fetch current location');
    } finally {
      setLocationLoading(false);
    }
  };

  const getSupplierId = async (items) => {
    let supplierId = null;
    if (items.length > 0) {
      const firstItem = items[0];

      // 1. Try to get supplier from existing product data
      if (firstItem.product) {
        if (typeof firstItem.product === 'object') {
          const supp = firstItem.product.supplierId || firstItem.product.supplier;
          if (supp) {
            if (typeof supp === 'object' && supp._id) {
              supplierId = supp._id;
            } else if (typeof supp === 'string') {
              supplierId = supp;
            }
          }
        }
      }

      // 2. If not found, fetch product via SEARCH (List API) -> Workaround for restricted Details API
      if (!supplierId && firstItem.product) {
        try {
          const productObj = firstItem.product;
          const productId = productObj._id || productObj.id || productObj;
          const productName = productObj.name;

          if (productName) {
            const searchRes = await productsAPI.getProducts({ q: productName });
            const searchItems = searchRes?.data?.data?.items || searchRes?.data?.data || [];
            const match = searchItems.find(p => String(p._id) === String(productId));

            if (match) {
              const supp = match.supplierId || match.supplier;
              if (supp) {
                if (typeof supp === 'object' && supp._id) {
                  supplierId = supp._id;
                } else if (typeof supp === 'string') {
                  supplierId = supp;
                }
              }
            }
          }
        } catch (err) {
          console.error("❌ Failed to fetch product via search:", err);
        }
      }
    }
    return supplierId;
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    if (!address) {
      Alert.alert('Error', 'No delivery address found. Please add an address.');
      return;
    }

    setIsPlacing(true);
    try {
      // 1. Construct Delivery Address Object
      const deliveryAddress = {
        street: address.street,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        phone: address.phone || user?.phone || "",
        location: {
          type: "Point",
          coordinates: [region.longitude || 0, region.latitude || 0], // Use map coords
        },
      };

      // 2. Construct Items Array
      const items = cartItems.map((item) => {
        const productId = item.product?._id || item.product?.id || item.product;
        return {
          product: productId,
          quantity: item.quantity,
          ...(item.variation ? { variation: item.variation } : {})
        };
      });

      // 3. Get Supplier ID
      const supplierId = await getSupplierId(cartItems);

      if (!supplierId) {
        Alert.alert('Order Error', 'Could not determine the supplier for these products.');
        setIsPlacing(false);
        return;
      }

      // 4. Create Order Payload
      const orderData = {
        supplier: supplierId,
        deliveryAddress,
        paymentMethod: paymentMethod === 'cod' ? 'cash_on_delivery' : 'upi',
        items,
        clearCart: true,
      };

      console.log('🚀 Placing order with data:', JSON.stringify(orderData, null, 2));

      const response = await ordersAPI.createOrder(orderData);

      // Check for success (201 or similar)
      if (response && (response.data || response.status === 201 || response.status === 200)) {
        updateCartItems([]); // Clear local cart
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          // Emit event to refresh orders list
          eventBus.emit('ORDER_REFRESH');
          // Navigate to the Tab controller's Orders screen to keep the tab bar visible
          navigation.navigate('MainApp', { screen: 'Orders' });
        }, 2000);
      } else {
        throw new Error('Order creation failed');
      }
    } catch (error) {
      console.error('❌ Order placement error:', error);
      if (error.response?.status === 401) {
        Alert.alert('Session Expired', 'Your session has expired. Please log out and log in again.');
      } else {
        Alert.alert('Order Failed', error.response?.data?.message || error.message || 'Failed to place order');
      }
    } finally {
      setIsPlacing(false);
    }
  };

  const formatAddress = () => {
    if (!address) return "fetching address...";
    return `${address.street}, ${address.city} - ${address.postalCode}`;
  };

  if (loading && !address) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#388E3C" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Success Animation Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center">
          <View className="bg-white p-8 rounded-2xl items-center shadow-2xl w-4/5">
            <Text className="text-6xl mb-4">🎉</Text>
            <Text className="text-2xl font-bold text-green-700 mt-2 text-center">Order Placed!</Text>
            <Text className="text-gray-500 mt-2 text-center">Your order has been confirmed successfully.</Text>
          </View>
        </View>
      </Modal>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Map Header */}
        <View className="bg-white shadow-sm mb-4">
          <MapView
            ref={mapRef}
            style={{ width: '100%', height: 220 }}
            provider={PROVIDER_GOOGLE}
            region={region}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            <Marker
              coordinate={{ latitude: region.latitude, longitude: region.longitude }}
              title="Delivery Location"
            />
          </MapView>
          <View className="p-4 bg-white border-t border-gray-100">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <Text className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Delivering to</Text>
                <Text className="text-gray-800 font-semibold text-base" numberOfLines={2}>
                  {address ? formatAddress() : 'Select Location'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={fetchCurrentLocation}
                disabled={locationLoading}
                className="bg-green-50 p-2 rounded-full"
              >
                {locationLoading ? (
                  <ActivityIndicator size="small" color="#388E3C" />
                ) : (
                  <MaterialIcons name="my-location" size={24} color="#388E3C" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="px-4">

          {/* Payment Method Section */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-3 px-1">Payment Method</Text>

            {/* UPI Option */}
            <TouchableOpacity
              onPress={() => setPaymentMethod('upi')}
              className={`flex-row items-center p-4 rounded-xl mb-3 border ${paymentMethod === 'upi' ? 'bg-green-50 border-green-500' : 'bg-white border-gray-200'}`}
            >
              <View className={`w-5 h-5 rounded-full border-2 mr-3 justify-center items-center ${paymentMethod === 'upi' ? 'border-green-600' : 'border-gray-300'}`}>
                {paymentMethod === 'upi' && <View className="w-2.5 h-2.5 rounded-full bg-green-600" />}
              </View>
              <View className="w-10 h-10 bg-gray-100 rounded-lg justify-center items-center mr-3">
                <FontAwesome5 name="google-pay" size={20} color="#333" />
              </View>
              <View className="flex-1">
                <Text className={`font-semibold text-base ${paymentMethod === 'upi' ? 'text-green-800' : 'text-gray-700'}`}>UPI Payment</Text>
                <Text className="text-xs text-gray-500">Google Pay, PhonePe, Paytm</Text>
              </View>
            </TouchableOpacity>

            {/* COD Option */}
            <TouchableOpacity
              onPress={() => setPaymentMethod('cod')}
              className={`flex-row items-center p-4 rounded-xl border ${paymentMethod === 'cod' ? 'bg-green-50 border-green-500' : 'bg-white border-gray-200'}`}
            >
              <View className={`w-5 h-5 rounded-full border-2 mr-3 justify-center items-center ${paymentMethod === 'cod' ? 'border-green-600' : 'border-gray-300'}`}>
                {paymentMethod === 'cod' && <View className="w-2.5 h-2.5 rounded-full bg-green-600" />}
              </View>
              <View className="w-10 h-10 bg-gray-100 rounded-lg justify-center items-center mr-3">
                <FontAwesome5 name="money-bill-wave" size={18} color="#333" />
              </View>
              <View className="flex-1">
                <Text className={`font-semibold text-base ${paymentMethod === 'cod' ? 'text-green-800' : 'text-gray-700'}`}>Cash on Delivery</Text>
                <Text className="text-xs text-gray-500">Pay when you receive the order</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Order Summary */}
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-4">Order Summary</Text>

            <View className="flex-row justify-between mb-3">
              <Text className="text-gray-500">Subtotal ({cartItems.length} items)</Text>
              <Text className="text-gray-800 font-medium">₹{itemsTotal.toLocaleString()}</Text>
            </View>

            <View className="flex-row justify-between mb-3">
              <Text className="text-gray-500">Delivery Fee</Text>
              <Text className="text-green-600 font-medium">₹{deliveryFee}</Text>
            </View>

            <View className="border-b border-dashed border-gray-200 my-3" />

            <View className="flex-row justify-between items-center mt-1">
              <Text className="text-lg font-bold text-gray-900">Total Amount</Text>
              <Text className="text-2xl font-bold text-green-700">₹{grandTotal.toLocaleString()}</Text>
            </View>
          </View>

        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-100 shadow-lg">
        <TouchableOpacity
          onPress={handlePlaceOrder}
          disabled={isPlacing || !address}
          className={`py-4 rounded-xl flex-row justify-center items-center shadow-md ${isPlacing || !address ? 'bg-gray-300' : 'bg-green-700'}`}
          activeOpacity={0.9}
        >
          <Text className="text-white text-lg font-bold mr-2">
            {isPlacing ? 'Processing Order...' : `Place Order • ₹${grandTotal}`}
          </Text>
          {!isPlacing && <MaterialIcons name="arrow-forward" size={20} color="white" />}
        </TouchableOpacity>
      </View>
    </View>
  );
}
