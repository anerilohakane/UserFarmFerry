import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Plus, Star } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Header, { HeaderVariants } from '../components/ui/Header';
import ReviewComponent from '../components/ReviewComponent';
import { useAppContext } from '../context/AppContext';
import { cartAPI } from '../services/api';

// Helper to safely get entries from an object
function safeObjectEntries(obj) {
  try {
    if (
      obj &&
      typeof obj === 'object' &&
      !Array.isArray(obj) &&
      obj !== null &&
      Object.prototype.toString.call(obj) === '[object Object]' &&
      Object.keys(obj).length > 0
    ) {
      return Object.entries(obj);
    }
  } catch (e) {
    // ignore
  }
  return [];
}

const ProductDetailsScreen = ({ route, navigation }) => {
  const { product, onReviewSubmitted, openReviewModal } = route.params;
  console.log('📱 ProductDetailsScreen received params:', { productId: product._id || product.id, hasCallback: !!onReviewSubmitted });
  const { cartItems, wishlistItems, updateCartItems, addToWishlist, removeFromWishlist } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);

  // Test callback on mount (for debugging)
  useEffect(() => {
    if (onReviewSubmitted) {
      console.log('🧪 Testing callback on mount');
      // Uncomment the line below to test if callback works
      // setTimeout(() => onReviewSubmitted(), 2000);
    }
  }, [onReviewSubmitted]);

  if (!product) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Product not found.</Text>
      </View>
    );
  }

  const isInWishlist = wishlistItems.some(item => item._id === product._id);
  const isInCart = cartItems.some(item => (item.product?._id || item._id) === product._id);

  // Compute discount percentage with two decimals
  const basePrice = Number(
    product.originalPrice ?? product.price ?? 0
  );
  const discounted = Number(
    product.discountedPrice ?? 0
  );
  let discountPercent = 0;
  if (typeof product.offerPercentage === 'number' && isFinite(product.offerPercentage) && product.offerPercentage > 0) {
    discountPercent = product.offerPercentage;
  } else if (typeof product.discount === 'number' && isFinite(product.discount) && product.discount > 0) {
    discountPercent = product.discount;
  } else if (basePrice > 0 && discounted > 0 && discounted < basePrice) {
    discountPercent = ((basePrice - discounted) / basePrice) * 100;
  }
  const discountPercentText = discountPercent > 0 ? `${discountPercent.toFixed(2)}% OFF` : null;

  const toggleWishlist = async () => {
    if (isInWishlist) {
      await removeFromWishlist(product._id);
    } else {
      await addToWishlist(product);
    }
  };

  const handleAddToCart = async () => {
    const stockQty = typeof product.stockQuantity === 'number' ? product.stockQuantity : 0;
    const inStock = stockQty > 0 || product.inStock;
    if (!inStock) {
      Alert.alert('Out of stock', 'This product is currently out of stock.');
      return;
    }
    if (!isInCart) {
      try {
        const response = await cartAPI.addToCart({ productId: product._id || product.id, quantity: 1 });
        updateCartItems(response.data.data.cart.items);
        Alert.alert('Added to Cart', `${product.name} has been added to your cart`);
      } catch (error) {
        console.error('Failed to add to cart:', error);
        Alert.alert('Error', 'Could not add item to cart. Please try again.');
      }
    }
  };

  const handleBuyNow = async () => {
    const stockQty = typeof product.stockQuantity === 'number' ? product.stockQuantity : 0;
    const inStock = stockQty > 0 || product.inStock;
    if (!inStock) {
      Alert.alert('Out of stock', 'This product is currently out of stock.');
      return;
    }
    
    const buyNowItems = isInCart ? cartItems : [...cartItems, { ...product, quantity: 1 }];
    
    if (!isInCart) {
      updateCartItems(buyNowItems);
    }
    
    // Navigate directly to OrderSummary for Buy Now
    navigation.navigate('OrderSummary', {
      items: buyNowItems
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Header with back button */}
        {/* <View className="px-4 pt-4 flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#4b5563" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-700 ml-4">Product Details</Text>
        </View> */}

        {/* Product Image */}
        {/* Product Image */}
<View className="w-full bg-gray-50 items-center justify-center py-6">
  <View
    className="bg-white rounded-3xl shadow-lg"
    style={{
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      transform: [{ translateY: -16 }],
    }}
  >
    <Image
      source={{ uri: product.image || (product.images && product.images[0]?.url) || 'https://via.placeholder.com/256?text=No+Image' }}
      className="w-64 h-64 rounded-2xl"
      resizeMode="cover" // Changed from 'contain' to 'cover'
    />
  </View>
</View>

        {/* Product Info */}
        <View className="bg-white p-6 mt-4 rounded-t-3xl shadow-sm">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-2xl font-bold text-gray-900">{product.name}</Text>
            <View className="flex-row">
              {discountPercentText && (
                <View className="bg-red-500 px-3 py-1 rounded-full ml-2">
                  <Text className="text-white text-sm font-medium">{discountPercentText}</Text>
                </View>
              )}
              <TouchableOpacity onPress={toggleWishlist} className="ml-2">
                <Heart
                  size={24}
                  color={isInWishlist ? '#ef4444' : '#9ca3af'}
                  fill={isInWishlist ? '#ef4444' : 'transparent'}
                />
              </TouchableOpacity>
            </View>
          </View>

          <Text className="text-sm text-green-600 mb-4">by {product.farmer || product.supplierId?.businessName || 'FarmFerry'}</Text>

          <View className="items-start mb-4 flex flex-col">
            <Text className="text-sm text-gray-500 ml-1 mb-2">Available: {typeof product.stockQuantity === 'number' ? product.stockQuantity : 0} {product.unit}</Text>
            {((typeof product.stockQuantity === 'number' ? product.stockQuantity : 0) > 0 && (typeof product.stockQuantity === 'number' ? product.stockQuantity : 0) <= 5) && (
              <View className="bg-amber-100 border border-amber-300 px-3 py-1 rounded-lg mb-2">
                <Text className="text-amber-800 text-sm font-medium">Hurry! Only {product.stockQuantity} left in stock</Text>
              </View>
            )}
            <View className="flex-row items-center bg-amber-50 rounded-lg px-3 py-1 border border-amber-200 mr-4">
              <Star width={14} height={14} fill="#facc15" color="#facc15" />
              <Text className="text-sm text-amber-800">
                {product.averageRating?.toFixed(1) || product.rating?.toFixed(1) || '0.0'}
                ({product.totalReviews || product.reviews || 0} reviews)
              </Text>
            </View>
            {/* <Text className="text-sm text-gray-500">Available: {product.stockQuantity} {product.unit}</Text> */}
          </View>

          <View className="flex-row items-center mb-6">
            <Text className="text-2xl font-bold text-green-600">₹{product.discountedPrice || product.price}</Text>
            {product.discountedPrice && product.originalPrice && (
              <Text className="text-base text-gray-400 line-through ml-3">₹{product.originalPrice}</Text>
            )}
          </View>

          {/* Product Description */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">Description</Text>
            <Text className="text-gray-600">
              {product.description || 'No description available.'}
            </Text>
          </View>

          {/* Product Details */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">Product Details</Text>
            <View className="bg-gray-50 p-4 rounded-lg">
              <View className="flex-row justify-between py-2 border-b border-gray-200">
                <Text className="text-gray-600">Category</Text>
                <Text className="text-gray-800 font-medium">{product.category || product.categoryId?.name || 'N/A'}</Text>
              </View>
              <View className="flex-row justify-between py-2 border-b border-gray-200">
                <Text className="text-gray-600">Manufacture Date</Text>
                <Text className="text-gray-800 font-medium">{formatDate(product.manufactureDate)}</Text>
              </View>
              <View className="flex-row justify-between py-2">
                <Text className="text-gray-600">Expiry Date</Text>
                <Text className="text-gray-800 font-medium">{formatDate(product.expiryDate)}</Text>
              </View>
            </View>
          </View>

          {/* Farmer Info */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-800 mb-3">About the Farmer</Text>
            <View className="flex-row items-center bg-green-50 p-4 rounded-lg">
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop' }}
                className="w-12 h-12 rounded-full mr-3"
              />
              <View>
                <Text className="text-gray-800 font-medium">{product.farmer || product.supplierId?.businessName || 'Unknown Farmer'}</Text>
                <Text className="text-gray-500 text-sm">Organic Farm</Text>
                <Text className="text-green-600 text-sm">Verified Supplier</Text>
              </View>
            </View>
          </View>

          {/* Reviews Section */}
          <View className="mb-8">
            <ReviewComponent
              productId={product._id || product.id}
              productName={product.name}
              onReviewSubmitted={() => {
                console.log('🎯 ReviewComponent onReviewSubmitted called');
                // Call the callback to update product rating in parent screen
                if (onReviewSubmitted) {
                  console.log('📞 Calling parent callback');
                  onReviewSubmitted();
                } else {
                  console.log('⚠️ No parent callback found');
                }
              }}
              openReviewModal={openReviewModal}
            />
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="bg-white border-t border-gray-200 p-4 flex-row">
        <TouchableOpacity
          className={`flex-1 justify-center items-center rounded-xl ml-0 shadow-sm ${isInCart ? '' : ''}`}
          onPress={handleAddToCart}
          disabled={isInCart || !((typeof product.stockQuantity === 'number' ? product.stockQuantity : 0) > 0 || product.inStock)}
          style={{ overflow: 'hidden', height: 44 }}
        >
          {isInCart ? (
            <Text className="text-gray-600 text-lg font-semibold">Added to Cart</Text>
          ) : !((typeof product.stockQuantity === 'number' ? product.stockQuantity : 0) > 0 || product.inStock) ? (
            <View style={{ flex: 1, width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', borderRadius: 12 }}>
              <Text className="text-red-500 text-lg font-semibold">Out of stock</Text>
            </View>
          ) : (
            <LinearGradient
              colors={["#fdba74", "#fb923c"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                flex: 1,
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 12,
                flexDirection: 'row',
              }}
            >
              <Plus width={20} height={20} color="#fff" />
              <Text className="text-white text-lg font-semibold ml-2">Add to Cart</Text>
            </LinearGradient>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 justify-center items-center rounded-xl ml-4 shadow-sm"
          onPress={handleBuyNow}
          disabled={!((typeof product.stockQuantity === 'number' ? product.stockQuantity : 0) > 0 || product.inStock)}
          style={{ overflow: 'hidden', height: 44, opacity: !((typeof product.stockQuantity === 'number' ? product.stockQuantity : 0) > 0 || product.inStock) ? 0.6 : 1 }}
        >
          <LinearGradient
            colors={["#10b981", "#059669"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              flex: 1,
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              flexDirection: 'row',
            }}
          >
            <Text className="text-white text-lg font-semibold">Buy Now</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProductDetailsScreen;