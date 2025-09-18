import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft, Check, Tag, X, AlertCircle, Gift
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAppContext } from '../context/AppContext';
import { couponAPI, cartAPI } from '../services/api';

export default function PromoCodeScreen({ navigation }) {
  const { cartItems, updateCartItems } = useAppContext();
  const [couponCode, setCouponCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);

  // Get screen dimensions
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;
  const isMediumScreen = width >= 375 && width < 768;

  // Responsive sizing helper
  const responsiveValue = (small, medium, large) => {
    if (isSmallScreen) return small;
    if (isMediumScreen) return medium;
    return large;
  };

  // Calculate cart total
  const getCartTotal = () => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce((total, item) => {
      const price = item.discountedPrice || item.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const cartTotal = getCartTotal();

  useEffect(() => {
    fetchAvailableCoupons();
    checkAppliedCoupon();
  }, []);

  const fetchAvailableCoupons = async () => {
    try {
      const response = await couponAPI.getActiveCoupons({ limit: 5 });
      setAvailableCoupons(response.data.data.coupons || []);
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
    } finally {
      setLoadingCoupons(false);
    }
  };

  const checkAppliedCoupon = async () => {
    try {
      const response = await cartAPI.getCart();
      const cart = response.data.data.cart;
      if (cart.coupon && cart.coupon.code) {
        setAppliedCoupon(cart.coupon);
        setCouponCode(cart.coupon.code);
      }
    } catch (error) {
      console.error('Failed to check applied coupon:', error);
    }
  };

  const validateAndApplyCoupon = async (code) => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please enter a coupon code');
      return;
    }

    if (cartTotal === 0) {
      Alert.alert('Error', 'Your cart is empty. Add items before applying a coupon.');
      return;
    }

    setIsLoading(true);
    try {
      // First validate the coupon
      const validateResponse = await couponAPI.validateCoupon({
        code: code.trim().toUpperCase(),
        cartTotal
      });

      if (validateResponse.data.success) {
        // Apply the coupon to cart
        const applyResponse = await couponAPI.applyCoupon({
          code: code.trim().toUpperCase()
        });

        if (applyResponse.data.success) {
          const couponData = validateResponse.data.data.coupon;
          const discount = validateResponse.data.data.discount;
          
          setAppliedCoupon({
            code: couponData.code,
            type: couponData.type,
            value: couponData.value,
            discount
          });

          // Update cart items to reflect the coupon application
          const updatedCart = applyResponse.data.data.cart;
          updateCartItems(updatedCart.items);

          Alert.alert(
            'Coupon Applied!',
            `You saved ₹${discount} with coupon ${couponData.code}`,
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to apply coupon';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const removeCoupon = async () => {
    setIsLoading(true);
    try {
      await couponAPI.removeCoupon();
      setAppliedCoupon(null);
      setCouponCode('');
      
      // Refresh cart
      const response = await cartAPI.getCart();
      updateCartItems(response.data.data.cart.items);
      
      Alert.alert('Coupon Removed', 'Coupon has been removed from your cart');
    } catch (error) {
      Alert.alert('Error', 'Failed to remove coupon');
    } finally {
      setIsLoading(false);
    }
  };

  const CouponCard = ({ coupon }) => {
    const canApply = cartTotal >= (coupon.minPurchase || 0);
    
    return (
      <TouchableOpacity
        onPress={() => canApply ? validateAndApplyCoupon(coupon.code) : null}
        disabled={!canApply || isLoading}
        className={`bg-white rounded-xl p-4 mb-3 border ${canApply ? 'border-green-200' : 'border-gray-200'}`}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <View className={`p-2 rounded-lg mr-3 ${canApply ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Tag size={responsiveValue(16, 18, 20)} color={canApply ? "#059669" : "#9ca3af"} />
              </View>
              <View className="flex-1">
                <Text 
                  className={`font-bold ${canApply ? 'text-green-600' : 'text-gray-400'}`}
                  style={{ fontSize: responsiveValue(14, 16, 18) }}
                >
                  {coupon.type === 'percentage' 
                    ? `${coupon.value}% OFF` 
                    : `₹${coupon.value} OFF`
                  }
                </Text>
                <Text 
                  className={`${canApply ? 'text-gray-600' : 'text-gray-400'}`}
                  style={{ fontSize: responsiveValue(11, 12, 13) }}
                >
                  Code: {coupon.code}
                </Text>
              </View>
            </View>
            
            <Text 
              className={`${canApply ? 'text-gray-600' : 'text-gray-400'}`}
              style={{ fontSize: responsiveValue(11, 12, 13) }}
            >
              Min. order: ₹{coupon.minPurchase || 0}
            </Text>
            
            {!canApply && (
              <Text 
                className="text-red-500 mt-1"
                style={{ fontSize: responsiveValue(10, 11, 12) }}
              >
                Add ₹{(coupon.minPurchase || 0) - cartTotal} more to apply
              </Text>
            )}
          </View>
          
          <View className={`px-3 py-1 rounded-full ${canApply ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Text 
              className={`font-medium ${canApply ? 'text-green-600' : 'text-gray-400'}`}
              style={{ fontSize: responsiveValue(10, 11, 12) }}
            >
              {canApply ? 'APPLY' : 'N/A'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-100">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mr-4 p-2 -ml-2"
        >
          <ArrowLeft size={responsiveValue(20, 22, 24)} color="#374151" />
        </TouchableOpacity>
        <Text 
          className="text-gray-900 font-semibold flex-1"
          style={{ fontSize: responsiveValue(16, 18, 20) }}
        >
          Apply Coupon
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {/* Cart Total Info */}
          <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <Text 
              className="text-blue-800 font-semibold mb-1"
              style={{ fontSize: responsiveValue(14, 15, 16) }}
            >
              Cart Total: ₹{cartTotal.toFixed(2)}
            </Text>
            <Text 
              className="text-blue-600"
              style={{ fontSize: responsiveValue(12, 13, 14) }}
            >
              Apply a coupon to save more on your order
            </Text>
          </View>

          {/* Applied Coupon */}
          {appliedCoupon && (
            <View className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center mb-2">
                    <Check size={responsiveValue(18, 20, 22)} color="#059669" />
                    <Text 
                      className="text-green-800 font-semibold ml-2"
                      style={{ fontSize: responsiveValue(14, 15, 16) }}
                    >
                      Coupon Applied
                    </Text>
                  </View>
                  <Text 
                    className="text-green-700 font-medium"
                    style={{ fontSize: responsiveValue(13, 14, 15) }}
                  >
                    {appliedCoupon.code} - You saved ₹{appliedCoupon.discount}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={removeCoupon}
                  disabled={isLoading}
                  className="p-2"
                >
                  <X size={responsiveValue(18, 20, 22)} color="#059669" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Manual Coupon Entry */}
          {!appliedCoupon && (
            <View className="bg-white rounded-xl p-4 mb-6 border border-gray-100">
              <Text 
                className="text-gray-900 font-semibold mb-3"
                style={{ fontSize: responsiveValue(14, 15, 16) }}
              >
                Enter Coupon Code
              </Text>
              
              <View className="flex-row items-center">
                <TextInput
                  value={couponCode}
                  onChangeText={setCouponCode}
                  placeholder="Enter coupon code"
                  placeholderTextColor="#9ca3af"
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-3 mr-3"
                  style={{ fontSize: responsiveValue(14, 15, 16) }}
                  autoCapitalize="characters"
                  editable={!isLoading}
                />
                
                <TouchableOpacity
                  onPress={() => validateAndApplyCoupon(couponCode)}
                  disabled={isLoading || !couponCode.trim()}
                  className={`px-6 py-3 rounded-lg ${
                    isLoading || !couponCode.trim() 
                      ? 'bg-gray-300' 
                      : 'bg-green-600'
                  }`}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text 
                      className="text-white font-semibold"
                      style={{ fontSize: responsiveValue(12, 13, 14) }}
                    >
                      APPLY
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Available Coupons */}
          <View className="mb-6">
            <Text 
              className="text-gray-900 font-semibold mb-4"
              style={{ fontSize: responsiveValue(16, 17, 18) }}
            >
              Available Coupons
            </Text>
            
            {loadingCoupons ? (
              <View className="flex-row justify-center py-8">
                <ActivityIndicator size="large" color="#059669" />
              </View>
            ) : availableCoupons.length === 0 ? (
              <View className="bg-white rounded-xl p-6 items-center">
                <Gift size={responsiveValue(40, 45, 50)} color="#9ca3af" />
                <Text 
                  className="text-gray-500 mt-3 text-center"
                  style={{ fontSize: responsiveValue(14, 15, 16) }}
                >
                  No coupons available at the moment
                </Text>
              </View>
            ) : (
              availableCoupons.map((coupon) => (
                <CouponCard key={coupon._id} coupon={coupon} />
              ))
            )}
          </View>

          {/* Info Section */}
          <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <View className="flex-row items-start">
              <AlertCircle size={responsiveValue(18, 20, 22)} color="#f59e0b" />
              <View className="flex-1 ml-3">
                <Text 
                  className="text-yellow-800 font-semibold mb-1"
                  style={{ fontSize: responsiveValue(13, 14, 15) }}
                >
                  Coupon Terms
                </Text>
                <Text 
                  className="text-yellow-700"
                  style={{ fontSize: responsiveValue(11, 12, 13) }}
                >
                  • Only one coupon can be applied per order{'\n'}
                  • Coupons cannot be combined with other offers{'\n'}
                  • Check minimum order requirements{'\n'}
                  • Coupons are valid until expiry date
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
