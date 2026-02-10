import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StatusBar, Platform, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { cartAPI } from '../services/api';
import { useAppContext } from '../context/AppContext';

const CartScreen = () => {
  const navigation = useNavigation();
  const { cartItems, removeFromCart, updateCartItemQuantity, updateCartItems } = useAppContext();

  // Local UI state
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [updatingItems, setUpdatingItems] = useState({});

  // Refresh context on focus
  useFocusEffect(
    React.useCallback(() => {
      fetchCartData();
    }, [])
  );

  const fetchCartData = async () => {
    try {
      // setLoading(true); // Optional: depends if we want full spinner
      setError(null);
      const response = await cartAPI.getCart();
      if (response.data.success) {
        const fetchedItems = response.data.data?.cart?.items || response.data.data?.items || [];
        console.log('🛒 Frontend Cart Items Debug:', JSON.stringify(fetchedItems.map(i => ({
          name: i.product?.name,
          price: i.product?.price,
          discounted: i.product?.discountedPrice
        })), null, 2));
        updateCartItems(fetchedItems);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCartData();
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    // If quantity is 0, remove it
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }

    setUpdatingItems(prev => ({ ...prev, [productId]: true }));
    try {
      await updateCartItemQuantity(productId, newQuantity);
    } catch (err) {
      Alert.alert('Error', 'Failed to update quantity');
    } finally {
      setUpdatingItems(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleRemoveItem = async (productId) => {
    setUpdatingItems(prev => ({ ...prev, [productId]: true }));
    try {
      await removeFromCart(productId);
    } catch (err) {
      Alert.alert('Error', 'Failed to remove item');
    } finally {
      setUpdatingItems(prev => ({ ...prev, [productId]: false }));
    }
  };

  const calculateTotals = () => {
    // Calculate total from cartItems directly
    const orderTotal = cartItems.reduce((sum, item) => {
      const price = item.product?.discountedPrice ?? item.product?.price ?? 0;
      return sum + (price * item.quantity);
    }, 0);
    const savings = 0; // Can implement discount logic later
    const grandTotal = orderTotal;
    return { orderTotal, savings, grandTotal };
  };

  const { orderTotal, savings, grandTotal } = calculateTotals();
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);


  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#004C46' }} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="light-content" backgroundColor="#004C46" />
        <View style={{ backgroundColor: '#004C46', paddingBottom: 16, paddingTop: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16 }}>
            <View>
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 20, letterSpacing: -0.5 }}>FarmFerry</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>Deliver to Selected Location</Text>
                <Feather name="chevron-down" size={16} color="white" />
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ backgroundColor: 'white', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
                <Feather name="clock" size={12} color="black" />
                <Text style={{ fontSize: 12, fontWeight: 'bold', marginLeft: 4 }}>30 mins</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
                <Feather name="user" size={20} color="#004C46" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
          <ActivityIndicator size="large" color="#004C46" />
          <Text style={{ marginTop: 12, fontSize: 14, color: '#6b7280' }}>Loading cart...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#004C46' }} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="light-content" backgroundColor="#004C46" />
        <View style={{ backgroundColor: '#004C46', paddingBottom: 16, paddingTop: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16 }}>
            <View>
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 20, letterSpacing: -0.5 }}>FarmFerry</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>Deliver to Selected Location</Text>
                <Feather name="chevron-down" size={16} color="white" />
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ backgroundColor: 'white', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
                <Feather name="clock" size={12} color="black" />
                <Text style={{ fontSize: 12, fontWeight: 'bold', marginLeft: 4 }}>30 mins</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
                <Feather name="user" size={20} color="#004C46" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, backgroundColor: 'white' }}>
          <Feather name="alert-circle" size={48} color="#dc2626" />
          <Text style={{ marginTop: 16, fontSize: 15, color: '#6b7280', textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity
            style={{ marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#004C46', borderRadius: 8 }}
            onPress={fetchCartData}
          >
            <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!loading && cartItems.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#004C46' }} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="light-content" backgroundColor="#004C46" />
        <View style={{ backgroundColor: '#004C46', paddingBottom: 16, paddingTop: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16 }}>
            <View>
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 20, letterSpacing: -0.5 }}>FarmFerry</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>Deliver to Selected Location</Text>
                <Feather name="chevron-down" size={16} color="white" />
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ backgroundColor: 'white', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
                <Feather name="clock" size={12} color="black" />
                <Text style={{ fontSize: 12, fontWeight: 'bold', marginLeft: 4 }}>30 mins</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
                <Feather name="user" size={20} color="#004C46" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, backgroundColor: 'white' }}>
          <MaterialCommunityIcons name="cart-outline" size={80} color="#d1d5db" />
          <Text style={{ marginTop: 16, fontSize: 18, fontWeight: '700', color: '#1f2937' }}>Your Cart is Empty</Text>
          <Text style={{ marginTop: 8, fontSize: 14, color: '#6b7280', textAlign: 'center' }}>Add products to your cart to see them here</Text>
          <TouchableOpacity
            style={{ marginTop: 24, paddingHorizontal: 32, paddingVertical: 12, backgroundColor: '#004C46', borderRadius: 8 }}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#004C46' }} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#004C46" />

      {/* Header - Matching HomeScreen */}
      <View style={{
        backgroundColor: '#004C46',
        paddingBottom: 16,
        paddingTop: 10
      }}>
        {/* Top Row: Brand, Location, Timer, Profile */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 }}>
          <View>
            <Text style={{ color: 'white', fontWeight: '800', fontSize: 20, letterSpacing: -0.5 }}>FarmFerry</Text>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>Deliver to Selected Location</Text>
              <Feather name="chevron-down" size={16} color="white" />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* 5 mins Badge */}
            <View style={{ backgroundColor: 'white', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
              <Feather name="clock" size={12} color="black" />
              <Text style={{ fontSize: 12, fontWeight: 'bold', marginLeft: 4 }}>30 mins</Text>
            </View>
            {/* Profile Icon */}
            <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
              <Feather name="user" size={20} color="#004C46" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 150 }}
        style={{ flex: 1, backgroundColor: 'white' }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#004C46']}
            tintColor="#004C46"
          />
        }
      >
        {/* Cart Items */}
        <View style={{ padding: 16 }}>
          {cartItems.map((item) => (
            <View key={item.productId} style={{
              flexDirection: 'row',
              backgroundColor: 'white',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: '#f3f4f6',
              padding: 12,
              marginBottom: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
              opacity: updatingItems[item.productId] ? 0.6 : 1
            }}>
              {/* Image */}
              <Image
                source={{ uri: item.product?.image || item.product?.images?.[0]?.url || 'https://via.placeholder.com/150' }}
                style={{ width: 70, height: 70, borderRadius: 12, backgroundColor: '#f9fafb' }}
                resizeMode="cover"
              />

              {/* Details */}
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#1f2937', flex: 1 }}>
                    {item.product?.name || 'Product'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveItem(item.productId)}
                    disabled={updatingItems[item.productId]}
                  >
                    <Feather name="trash-2" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                  {item.product?.unit || 'unit'}
                </Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#1f2937' }}>
                    ₹{item.product?.discountedPrice ?? item.product?.price ?? 0}
                  </Text>

                  {/* Stepper */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity
                      style={{ width: 28, height: 28, borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db', justifyContent: 'center', alignItems: 'center' }}
                      onPress={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                      disabled={updatingItems[item.productId]}
                    >
                      <Feather name="minus" size={14} color="#374151" />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937' }}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={{ width: 28, height: 28, borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db', justifyContent: 'center', alignItems: 'center' }}
                      onPress={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                      disabled={updatingItems[item.productId]}
                    >
                      <Feather name="plus" size={14} color="#374151" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Price Summary */}
        <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#1f2937', marginBottom: 12 }}>Price Summary</Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: '#4b5563' }}>Order Total</Text>
            <Text style={{ color: '#1f2937' }}>₹{orderTotal.toFixed(2)}</Text>
          </View>
          {savings > 0 && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: '#4b5563' }}>Savings</Text>
              <Text style={{ color: '#004C46', fontWeight: '600' }}>-₹{savings.toFixed(2)}</Text>
            </View>
          )}
          <View style={{ height: 1, backgroundColor: '#e5e7eb', marginBottom: 12 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: '#1f2937', fontWeight: '700' }}>Grand Total</Text>
            <Text style={{ color: '#1f2937', fontWeight: '700', fontSize: 18 }}>₹{grandTotal.toFixed(2)}</Text>
          </View>
        </View>

      </ScrollView>


      {/* Sticky Footer */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        padding: 16,
        paddingBottom: Platform.OS === 'ios' ? 32 : 16,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#1f2937' }}>₹{grandTotal.toFixed(2)}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="truck-delivery" size={16} color="#004C46" />
            <Text style={{ color: '#004C46', fontWeight: '600', marginLeft: 4, fontSize: 13 }}>Free Shipping</Text>
          </View>
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: '#004C46',
            borderRadius: 12,
            paddingVertical: 14,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          onPress={() => navigation.navigate('OrderSummary', { items: cartItems })}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '700', marginRight: 8 }}>Checkout Now</Text>
          <Feather name="arrow-right" size={20} color="white" />
        </TouchableOpacity>
        <Text style={{ textAlign: 'center', fontSize: 10, color: '#9ca3af', marginTop: 8 }}>to avail 5% off on prepaid orders</Text>
      </View>

    </SafeAreaView>
  );
};

export default CartScreen;