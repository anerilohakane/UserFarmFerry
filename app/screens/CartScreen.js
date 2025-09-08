import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft, ChevronRight, Heart, MapPin, Minus,
  Plus, Tag, Trash2
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Header, { HeaderVariants } from '../components/ui/Header';
import { useAppContext } from '../context/AppContext';
import { cartAPI } from '../services/api';

export default function CartScreen({ navigation }) {
  const {
    cartItems,
    updateCartItems,
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
  } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // Add GST and GST percent from backend
  const [cartGST, setCartGST] = useState(0);
  const [cartGSTPercent, setCartGSTPercent] = useState(0);

  // Get screen dimensions
  const { width, height } = Dimensions.get('window');
  const isSmallScreen = width < 375;
  const isMediumScreen = width >= 375 && width < 768;
  const isLargeScreen = width >= 768;

  // Responsive sizing helper
  const responsiveValue = (small, medium, large) => {
    if (isSmallScreen) return small;
    if (isMediumScreen) return medium;
    return large;
  };

  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

  const fetchCart = async () => {
    try {
      const response = await cartAPI.getCart();
      const cartData = response.data.data.cart;
      const items = cartData.items;
      // Set GST and GST percent from backend if present
      setCartGST(cartData.gst || 0);
      setCartGSTPercent(cartData.gstPercent || 0);
      
      // Detailed logging for GST debugging
      console.log('=== CART DATA DEBUG ===');
      console.log('Full cart response:', JSON.stringify(response.data.data.cart, null, 2));
      
      items.forEach((item, index) => {
        console.log(`Item ${index + 1}:`, {
          name: item.product?.name || item.name,
          productId: item.product?._id,
          gst: item.product?.gst,
          gstType: typeof item.product?.gst,
          price: item.price,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
          fullProductData: item.product
        });
      });
      
      console.log('🔄 Updating cart items in context...');
      updateCartItems(items);
      console.log('✅ Cart items updated in context');
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCart();
  };

  const handleUpdateQuantity = async (cartItemId, quantity) => {
    try {
      const response = await cartAPI.updateCartItem(cartItemId, quantity);
      updateCartItems(response.data.data.cart.items);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const increaseQty = (item) => {
    handleUpdateQuantity(item._id, item.quantity + 1);
  };

  const decreaseQty = (item) => {
    if (item.quantity > 1) {
      handleUpdateQuantity(item._id, item.quantity - 1);
    } else {
      removeFromCart(item._id);
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const response = await cartAPI.removeCartItem(cartItemId);
      updateCartItems(response.data.data.cart.items);
    } catch (error) {
      console.error('Failed to remove from cart:', error);
    }
  };

  const toggleWishlist = (product) => {
    if (!product || !product.name) return;
    const productId = product._id;
    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
      Alert.alert('Removed from Wishlist', `${product.name} has been removed from your wishlist`);
    } else {
      addToWishlist(product);
      Alert.alert('Added to Wishlist', `${product.name} has been added to your wishlist`);
    }
  };

  const isInWishlist = (id) => {
    if (!id) {
      console.warn('isInWishlist called with invalid id:', id);
      return false;
    }
    return wishlistItems.some((item) => item && item._id === id);
  };

  const moveToWishlist = (product) => {
    if (!product || !product.name) return;
    const productId = product._id;
    if (!isInWishlist(productId)) {
      addToWishlist(product);
    }
    removeFromCart(product._id);
    Alert.alert('Moved to Wishlist', `${product.name} has been moved to your wishlist`);
  };

  const handlePromoCode = () => navigation.navigate('PromoCode');
  const handleChangeAddress = () => navigation.navigate('SetDefaultAddress');

  // GST rate (5%)
  const GST_RATE = 0.05;
  // Platform fee constant
  const PLATFORM_FEE = 2.0;

  // GST and cart logic from CheckoutScreen
  const getSubtotal = (items) => items.reduce((sum, item) => {
    const price = item.discountedPrice !== undefined && item.discountedPrice !== null ? item.discountedPrice : item.price;
    return sum + price * item.quantity;
  }, 0);
  const getTotalDiscount = (items) => {
    const totalOriginalPrice = items.reduce((sum, item) => {
      const orig = item.originalPrice !== undefined && item.originalPrice !== null ? item.originalPrice : item.price;
      return sum + orig * item.quantity;
    }, 0);
    const subtotal = getSubtotal(items);
    return Math.max(0, totalOriginalPrice - subtotal);
  };
  const getTotalGST = (items) => {
    // Sum GST for each item
    return items.reduce((sum, item) => {
      const itemPrice = item.discountedPrice !== undefined && item.discountedPrice !== null ? item.discountedPrice : item.price;
      const itemQuantity = item.quantity || 1;
      let gstPercent = 0;
      if (item.product && typeof item.product === 'object') {
        gstPercent = item.product.gst || 0;
      } else if (item.gst !== undefined) {
        gstPercent = item.gst;
      }
      const gstAmount = (itemPrice * gstPercent / 100) * itemQuantity;
      return sum + gstAmount;
    }, 0);
  };
  const getShipping = (subtotal = 0) => {
    // Waive delivery charges for orders above ₹500
    return subtotal >= 500 ? 0 : 20.0;
  };
  const getPlatformFee = () => PLATFORM_FEE;
  const getGrandTotal = (items) => {
    const subtotal = getSubtotal(items);
    return subtotal + getTotalGST(items) + getShipping(subtotal) + getPlatformFee();
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  const handleProceedToCheckout = () => {
    if (!Array.isArray(safeCartItems) || safeCartItems.length === 0) {
      Alert.alert('Cart is empty');
      return;
    }
    
    const subtotal = getSubtotal(safeCartItems);
    const gst = getTotalGST(safeCartItems);
    const shipping = getShipping(subtotal);
    const platformFee = getPlatformFee();
    const total = getGrandTotal(safeCartItems);
    const savings = getTotalDiscount(safeCartItems);
    
    console.log('CartScreen - Passing to Checkout:', {
      subtotal,
      gst,
      shipping,
      platformFee,
      total,
      savings,
      itemsCount: safeCartItems.length
    });
    
    navigation.navigate('OrderSummary', {
      subtotal,
      gst,
      shipping,
      platformFee,
      total,
      savings,
      items: safeCartItems
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <HeaderVariants.Back title="Cart" />

      {/* Deliver to block */}
      <View className={`bg-white px-4 ${responsiveValue('py-2', 'py-3', 'py-3')} border-b border-gray-100`}>
        <TouchableOpacity 
          className="flex-row items-center" 
          onPress={handleChangeAddress}
        >
          <MapPin size={responsiveValue(16, 18, 20)} color="#059669" />
          <Text className={`${responsiveValue('text-sm', 'text-base', 'text-base')} text-gray-700 ml-2`}>
            Deliver to 
          </Text>
          <Text className={`${responsiveValue('text-sm', 'text-base', 'text-base')} font-semibold text-gray-900 ml-1`}>
            Selected Location
          </Text>
          <ChevronRight size={responsiveValue(16, 18, 20)} color="#059669" className="ml-1" />
        </TouchableOpacity>
        <Text className={`${responsiveValue('text-xs', 'text-sm', 'text-sm')} text-gray-500 mt-1 ml-8`}>
          Mokarwadi, Pune - 411046
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: responsiveValue(140, 160, 180) }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh} 
            colors={["#059669"]} 
          />
        }
      >
        {(safeCartItems?.length ?? 0) === 0 ? (
          <View className="flex-1 items-center justify-center mt-20">
            <View className={`${responsiveValue('w-16 h-16', 'w-20 h-20', 'w-24 h-24')} bg-green-100 rounded-full items-center justify-center mb-4`}>
              <Text className="text-green-500 text-4xl">🛒</Text>
            </View>
            <Text className={`${responsiveValue('text-lg', 'text-xl', 'text-xl')} font-semibold text-gray-800`}>
              Your cart is empty
            </Text>
            <Text className={`${responsiveValue('text-sm', 'text-base', 'text-base')} text-gray-500 mt-2`}>
              Add some fresh items to get started!
            </Text>
          </View>
        ) : (
          <>
            {/* Delivery Summary */}
            <View className={`bg-white mx-4 mt-4 rounded-xl p-4 border border-green-100 shadow-sm`}>
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className={`${responsiveValue('text-base', 'text-lg', 'text-lg')} font-semibold text-gray-800`}>
                    Get it in 10 mins
                  </Text>
                  <Text className={`${responsiveValue('text-xs', 'text-sm', 'text-sm')} text-green-600 mt-1`}>
                    {safeCartItems.length} Product{safeCartItems.length > 1 ? 's' : ''}
                  </Text>
                </View>
                <View className="bg-green-100 px-3 py-1 rounded-full">
                  <Text className={`${responsiveValue('text-xs', 'text-sm', 'text-sm')} font-medium text-green-800`}>
                    Express Delivery
                  </Text>
                </View>
              </View>
            </View>

            {/* Cart Items */}
            <View className={`px-4 ${responsiveValue('pt-3', 'pt-4', 'pt-4')}`}>
              {safeCartItems.map((item) => {
                if (!item) return null;
                                 // Calculate discount for individual item: Original Price - Current Price
                 const originalTotal = item.originalPrice ? item.originalPrice * item.quantity : item.price * item.quantity;
                 const currentTotal = item.totalPrice || item.price * item.quantity;
                 const discount = Math.max(0, originalTotal - currentTotal);
                 
                 // GST is now calculated on subtotal, not per item
                 const itemTotal = item.totalPrice || item.price * item.quantity;
                const imageSize = responsiveValue(80, 96, 100);

                return (
                  <View
                    key={item._id}
                    className={`bg-white rounded-xl mb-4 p-4 border border-gray-100 shadow-sm`}
                  >
                    <View className="flex-row items-start">
                      {/* Product Image */}
                      <View
                        className={`${responsiveValue('w-20 h-20', 'w-24 h-24', 'w-28 h-28')} rounded-lg bg-gray-50 items-center justify-center mr-3 border border-gray-200 overflow-hidden`}
                      >
                        <Image
                          source={{ uri: item.product?.images?.[0]?.url || item.product?.image || item.image || 'https://via.placeholder.com/96x96?text=No+Image' }}
                          className="w-full h-full"
                          resizeMode="contain"
                        />
                      </View>

                      {/* Product Details */}
                      <View className="flex-1">
                        <View className="flex-row justify-between items-start mb-1">
                          <Text 
                            className={`${responsiveValue('text-sm', 'text-base', 'text-base')} font-semibold text-gray-900 flex-1`}
                            numberOfLines={2}
                          >
                            {item.product?.name || item.name}
                          </Text>
                          <TouchableOpacity 
                            onPress={() => removeFromCart(item._id)}
                            className="ml-2"
                          >
                            <Trash2 size={responsiveValue(18, 20, 20)} color="#ef4444" />
                          </TouchableOpacity>
                        </View>
                        {/* Per-item GST display */}
                        <Text className={`${responsiveValue('text-xs', 'text-sm', 'text-sm')} text-blue-500 mb-1`}>
                          GST: ₹{(() => {
                            const itemPrice = item.discountedPrice !== undefined && item.discountedPrice !== null ? item.discountedPrice : item.price;
                            const itemQuantity = item.quantity || 1;
                            let gstPercent = 0;
                            if (item.product && typeof item.product === 'object') {
                              gstPercent = item.product.gst || 0;
                            } else if (item.gst !== undefined) {
                              gstPercent = item.gst;
                            }
                            return ((itemPrice * gstPercent / 100) * itemQuantity).toFixed(2);
                          })()} ({(() => {
                            let gstPercent = 0;
                            if (item.product && typeof item.product === 'object') {
                              gstPercent = item.product.gst || 0;
                            } else if (item.gst !== undefined) {
                              gstPercent = item.gst;
                            }
                            return gstPercent;
                          })()}%)
                        </Text>

                        <Text className={`${responsiveValue('text-xs', 'text-sm', 'text-sm')} text-gray-500 mb-1`}>
                          {item.unit || '500 g'}
                        </Text>

                        <View className="flex-row items-center mb-1">
                          <Text className={`${responsiveValue('text-base', 'text-lg', 'text-lg')} font-bold text-green-700`}>
                            ₹{(item.totalPrice || item.price * item.quantity).toFixed(2)}
                          </Text>
                          {item.originalPrice && (
                            <Text className={`${responsiveValue('text-xs', 'text-sm', 'text-sm')} text-gray-400 line-through ml-2`}>
                              ₹{(item.originalPrice * item.quantity).toFixed(2)}
                            </Text>
                          )}
                        </View>

                        {discount > 0 && (
                          <Text className={`${responsiveValue('text-xs', 'text-xs', 'text-sm')} text-red-500 mb-1`}>
                            You save: ₹{discount.toFixed(2)}
                          </Text>
                        )}

                        <View className="flex-row items-center justify-between mt-2">
                          {/* Quantity Selector */}
                          <View className="flex-row items-center bg-green-50 rounded-full px-1 py-1">
                            <TouchableOpacity
                              onPress={() => decreaseQty(item)}
                              className={`${responsiveValue('w-7 h-7', 'w-8 h-8', 'w-8 h-8')} rounded-full bg-white items-center justify-center border border-gray-200`}
                            >
                              <Minus size={responsiveValue(14, 16, 16)} color="#059669" />
                            </TouchableOpacity>
                            <Text className={`${responsiveValue('text-sm', 'text-base', 'text-base')} font-medium text-gray-800 mx-3`}>
                              {item.quantity}
                            </Text>
                            <TouchableOpacity
                              onPress={() => increaseQty(item)}
                              className={`${responsiveValue('w-7 h-7', 'w-8 h-8', 'w-8 h-8')} rounded-full bg-white items-center justify-center border border-gray-200`}
                            >
                              <Plus size={responsiveValue(14, 16, 16)} color="#059669" />
                            </TouchableOpacity>
                          </View>

                          {/* Savings Tag */}
                          <View className="flex-row items-center bg-green-100 px-3 py-1 rounded-full">
                            <Text className={`${responsiveValue('text-xs', 'text-sm', 'text-sm')} font-medium text-green-800`}>
                              Har Din Sasta
                            </Text>
                          </View>
                        </View>

                        {/* Move to Wishlist */}
                        <TouchableOpacity
                          className="flex-row items-center mt-3 pt-3 border-t border-gray-100"
                          onPress={() => moveToWishlist(item)}
                        >
                          <Heart
                            size={responsiveValue(16, 18, 18)}
                            color={isInWishlist(item._id) ? "#ef4444" : "#059669"}
                            fill={isInWishlist(item._id) ? "#ef4444" : "none"}
                          />
                          <Text className={`${responsiveValue('text-xs', 'text-sm', 'text-sm')} text-gray-600 ml-2`}>
                            {isInWishlist(item._id) ? 'In Wishlist' : 'Move to Wishlist'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Promo Code Section */}
            <View className="bg-white mx-4 mt-4 rounded-xl p-4 border border-gray-100">
              <TouchableOpacity
                className="flex-row items-center justify-between"
                onPress={handlePromoCode}
              >
                <View className="flex-row items-center">
                  <Tag size={responsiveValue(18, 20, 20)} color="#059669" />
                  <Text className={`${responsiveValue('text-sm', 'text-base', 'text-base')} text-gray-700 ml-3`}>
                    Apply Promo Code
                  </Text>
                </View>
                <ChevronRight size={responsiveValue(18, 20, 20)} color="#059669" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      {/* Checkout Bar - Only shown when cart has items */}
      {(safeCartItems?.length ?? 0) > 0 && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <View className="px-4 py-3">
            <View className="flex-row justify-between items-center mb-1">
              <Text className={`${responsiveValue('text-sm', 'text-base', 'text-base')} text-gray-600`}>
                Subtotal
              </Text>
              <Text className={`${responsiveValue('text-sm', 'text-base', 'text-base')} font-semibold text-gray-900`}>
                ₹{getSubtotal(safeCartItems).toFixed(2)}
              </Text>
            </View>
            <View className="flex-row justify-between items-center mb-1">
              <Text className={`${responsiveValue('text-sm', 'text-base', 'text-base')} text-gray-600`}>
                Discount
              </Text>
              <Text className={`${responsiveValue('text-sm', 'text-base', 'text-base')} font-semibold text-red-500`}>
                -₹{getTotalDiscount(safeCartItems).toFixed(2)}
              </Text>
            </View>
            <View className="flex-row justify-between items-center mb-1">
              <Text className={`${responsiveValue('text-sm', 'text-base', 'text-base')} text-gray-600`}>
                GST
                {/* Show GST range if multiple rates, as in CheckoutScreen */}
                {(() => {
                  const gstRates = [...new Set(safeCartItems.map(item => {
                    if (item.product && typeof item.product === 'object') {
                      return item.product.gst || 0;
                    } else if (item.gst !== undefined) {
                      return item.gst;
                    }
                    return 5; // default
                  }))];
                  if (gstRates.length === 1) {
                    return ` (${gstRates[0]}%)`;
                  } else if (gstRates.length > 1) {
                    const minRate = Math.min(...gstRates);
                    const maxRate = Math.max(...gstRates);
                    return minRate === maxRate ? ` (${minRate}%)` : ` (${minRate}%-${maxRate}%)`;
                  }
                  return '';
                })()}
              </Text>
              <Text className={`${responsiveValue('text-sm', 'text-base', 'text-base')} font-semibold text-blue-500`}>
                ₹{getTotalGST(safeCartItems).toFixed(2)}
              </Text>
            </View>
            <View className="flex-row justify-between items-center mb-1">
              <Text className={`${responsiveValue('text-sm', 'text-base', 'text-base')} text-gray-600`}>
                Platform Fee
              </Text>
              <Text className={`${responsiveValue('text-sm', 'text-base', 'text-base')} font-semibold text-gray-900`}>
                ₹{getPlatformFee().toFixed(2)}
              </Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className={`${responsiveValue('text-sm', 'text-base', 'text-base')} text-gray-600`}>
                Shipping
              </Text>
              <Text className={`${responsiveValue('text-sm', 'text-base', 'text-base')} font-semibold text-gray-900`}>
                ₹{getShipping().toFixed(2)}
              </Text>
            </View>
            <View className="border-t border-gray-200 pt-2 mt-1">
              <View className="flex-row justify-between items-center">
                <Text className={`${responsiveValue('text-base', 'text-lg', 'text-lg')} font-bold text-gray-900`}>
                  Total
                </Text>
                <Text className={`${responsiveValue('text-base', 'text-lg', 'text-lg')} font-bold text-green-700`}>
                  ₹{getGrandTotal(safeCartItems).toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Checkout Button */}
            <TouchableOpacity
              onPress={handleProceedToCheckout}
              activeOpacity={0.9}
              className={`mt-4 rounded-xl overflow-hidden shadow-md`}
            >
              <LinearGradient
                colors={['#10b981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className={`${responsiveValue('py-3', 'py-4', 'py-4')} items-center justify-center`}
              >
                <Text className={`${responsiveValue('text-base', 'text-lg', 'text-lg')} font-semibold text-white`}>
                  Proceed to Checkout
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}