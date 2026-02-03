import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Animated
} from 'react-native';
import { ArrowLeft, Star, Edit, Trash2, MessageCircle, PlusCircle, CheckCircle, Clock } from 'lucide-react-native';
import { reviewsAPI } from '../services/api';
import { productsAPI } from '../services/api';
import { useAppContext } from '../context/AppContext';

const EMPTY_ILLUSTRATION = 'https://cdn-icons-png.flaticon.com/512/4076/4076549.png';

const MyReviewsScreen = ({ navigation }) => {
  const [reviews, setReviews] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [productLoadingId, setProductLoadingId] = useState(null);
  const { user } = useAppContext();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchAllReviews();
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

  const fetchAllReviews = async () => {
    try {
      setLoading(true);
      const [reviewsRes, pendingRes] = await Promise.all([
        reviewsAPI.getMyReviews(),
        reviewsAPI.getPendingReviews()
      ]);
      setReviews(reviewsRes.data.data.reviews || []);
      setPendingProducts(pendingRes.data.data.pendingProducts || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      Alert.alert('Error', 'Failed to load your reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllReviews();
    setRefreshing(false);
  };

  const handleDeleteReview = async (reviewId) => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete this review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await reviewsAPI.deleteReview(reviewId);
              Alert.alert('Success', 'Review deleted successfully!');
              await fetchAllReviews();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete review');
            }
          }
        }
      ]
    );
  };

  const handleViewProduct = async (productId) => {
    try {
      setProductLoadingId(productId);
      const response = await productsAPI.getProductDetails(productId);
      const fullProduct = response.data.data.product;
      navigation.navigate('ProductDetails', { product: fullProduct });
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch product details');
    } finally {
      setProductLoadingId(null);
    }
  };

  const renderStars = (rating) => (
    <View className="flex-row">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          color={star <= rating ? '#fbbf24' : '#d1d5db'}
          fill={star <= rating ? '#fbbf24' : 'none'}
        />
      ))}
    </View>
  );

  const renderReviewItem = (review) => (
    <Animated.View
      key={review._id}
      className="bg-white p-4 mb-4 rounded-xl border border-gray-200 shadow-sm"
      style={{ opacity: fadeAnim }}
    >
      {/* Product Info */}
      <View className="flex-row mb-3 items-center">
        <Image
          source={{ uri: review.product?.images?.[0]?.url || EMPTY_ILLUSTRATION }}
          className="w-14 h-14 rounded-lg mr-3 border border-gray-100 bg-gray-50"
        />
        <View className="flex-1">
          <Text className="text-base font-bold text-gray-800 mb-1" numberOfLines={1}>
            {review.product?.name || 'Product Name'}
          </Text>
          <Text className="text-xs text-gray-500 mb-1">
            {review.product?.categoryId?.name || 'Category'}
          </Text>
          <View className="flex-row items-center">
            <View className="bg-green-100 rounded px-2 py-1 mr-2 flex-row items-center">
              <CheckCircle size={12} color="#10b981" className="mr-1" />
              <Text className="text-xs text-green-800 font-semibold">Verified Purchase</Text>
            </View>
            <Text className="text-xs text-gray-400">
              {new Date(review.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Rating and Review Content */}
      <View className="flex-row items-center mb-2">
        {renderStars(review.rating)}
        {review.title && (
          <Text className="text-sm font-semibold text-gray-800 ml-2">
            {review.title}
          </Text>
        )}
      </View>
      <Text className="text-sm text-gray-700 mb-3 leading-5">
        {review.comment}
      </Text>

      {/* Seller Reply */}
      {review.reply && (
        <View className="bg-green-50 p-3 rounded-lg mb-3 border-l-4 border-green-500">
          <Text className="text-xs font-semibold text-green-800 mb-1">Seller Response:</Text>
          <Text className="text-xs text-green-700">{review.reply.content}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View className="flex-row justify-between items-center mt-2">
        <TouchableOpacity
          className="flex-row items-center px-3 py-1.5 bg-gray-100 rounded-lg mr-2"
          onPress={() => handleViewProduct(review.product._id || review.product.id)}
          disabled={productLoadingId === (review.product._id || review.product.id)}
        >
          {productLoadingId === (review.product._id || review.product.id) ? (
            <ActivityIndicator size={14} color="#10b981" className="mr-1" />
          ) : (
            <MessageCircle size={14} color="#10b981" className="mr-1" />
          )}
          <Text className="text-xs text-green-600">View Product</Text>
        </TouchableOpacity>

        <View className="flex-row">
          <TouchableOpacity
            className="flex-row items-center px-3 py-1.5 bg-green-600 rounded-lg mr-2"
            onPress={() => navigation.navigate('EditReview', { review })}
          >
            <Edit size={14} color="white" className="mr-1" />
            <Text className="text-xs text-white">Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center px-3 py-1.5 bg-red-500 rounded-lg"
            onPress={() => handleDeleteReview(review._id)}
          >
            <Trash2 size={14} color="white" className="mr-1" />
            <Text className="text-xs text-white">Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  const renderPendingProduct = (product) => (
    <Animated.View
      key={product._id}
      className="bg-white p-4 mb-4 rounded-xl border border-gray-200 shadow-sm flex-row items-center"
      style={{ opacity: fadeAnim }}
    >
      <Image
        source={{ uri: product.images?.[0]?.url || EMPTY_ILLUSTRATION }}
        className="w-14 h-14 rounded-lg mr-3 border border-gray-100 bg-gray-50"
      />
      <View className="flex-1">
        <Text className="text-base font-bold text-gray-800 mb-1" numberOfLines={1}>
          {product.name}
        </Text>
        <Text className="text-xs text-gray-500 mb-2">
          {product.categoryId?.name}
        </Text>
        <View className="bg-yellow-100 rounded px-2 py-1 self-start">
          <Text className="text-xs text-yellow-800 font-semibold">Pending Review</Text>
        </View>
      </View>
      <TouchableOpacity
        className="bg-green-600 rounded-lg px-3 py-2 flex-row items-center ml-2"
        onPress={() => {
          navigation.navigate('ProductDetails', {
            product,
            openReviewModal: true
          });
        }}
      >
        <PlusCircle size={16} color="white" className="mr-1" />
        <Text className="text-xs text-white font-semibold">Review</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#10b981" />
        <Text className="text-sm text-gray-500 mt-3">Loading your reviews...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-3 px-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center mr-3"
          >
            <ArrowLeft size={20} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">My Reviews</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh} 
            colors={["#10b981"]}
          />
        }
      >
        {/* Submitted Reviews Section */}
        <View className="mb-6">
          <View className="flex-row items-center mb-3">
            <CheckCircle size={18} color="#10b981" className="mr-2" />
            <Text className="text-lg font-bold text-gray-800">Your Reviews</Text>
          </View>

          {reviews.length === 0 ? (
            <View className="py-8 items-center">
              <Image 
                source={{ uri: EMPTY_ILLUSTRATION }} 
                className="w-20 h-20 opacity-70 mb-4" 
              />
              <Text className="text-base text-gray-500 text-center mb-1">
                You haven't written any reviews yet
              </Text>
              <Text className="text-sm text-gray-400 text-center">
                Start reviewing products you've purchased
              </Text>
            </View>
          ) : (
            reviews.map(renderReviewItem)
          )}
        </View>

        {/* Divider */}
        <View className="h-px bg-gray-200 my-4" />

        {/* Pending Reviews Section */}
        <View className="mb-6">
          <View className="flex-row items-center mb-3">
            <Clock size={18} color="#92400e" className="mr-2" />
            <Text className="text-lg font-bold text-gray-800">Pending Reviews</Text>
          </View>

          {pendingProducts.length === 0 ? (
            <View className="py-8 items-center">
              <Image 
                source={{ uri: EMPTY_ILLUSTRATION }} 
                className="w-20 h-20 opacity-70 mb-4" 
              />
              <Text className="text-base text-gray-500 text-center">
                No pending reviews
              </Text>
            </View>
          ) : (
            pendingProducts.map(renderPendingProduct)
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default MyReviewsScreen;