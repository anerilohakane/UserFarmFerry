import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import { ordersAPI } from '../services/api';
import api from '../services/api';

const RateReviewScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState({}); // { [productId]: { rating, text, loading } }
  const [userReviews, setUserReviews] = useState({}); // { [productId]: reviewObj }

  useEffect(() => {
    fetchOrdersAndReviews();
  }, []);

  const fetchOrdersAndReviews = async () => {
    setLoading(true);
    try {
      const res = await ordersAPI.getMyOrders();
      const allProducts = [];
      res.data.data.forEach(order => {
        order.items.forEach(item => {
          allProducts.push({
            ...item.product,
            orderId: order._id,
            productId: item.product._id,
          });
        });
      });
      setOrders(allProducts);
      // Fetch reviews for all products
      const reviewsMap = {};
      await Promise.all(
        allProducts.map(async (p) => {
          try {
            const r = await api.get(`/reviews/product/${p._id}`);
            // Find review by current user (assuming only one per user per product)
            const myReview = r.data.data.find(rev => rev.user?._id === p.user?._id || rev.customer?._id === p.user?._id);
            if (myReview) reviewsMap[p._id] = myReview;
          } catch {}
        })
      );
      setUserReviews(reviewsMap);
    } catch (e) {
      Alert.alert('Error', 'Failed to fetch orders or reviews: ' + (e?.response?.data?.message || e.message || JSON.stringify(e)));
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (productId, rating, text) => {
    setReviewing(r => ({ ...r, [productId]: { ...r[productId], loading: true } }));
    try {
      await api.post('/reviews', { product: productId, rating, text });
      Alert.alert('Success', 'Review submitted!');
      await fetchOrdersAndReviews();
    } catch (e) {
      Alert.alert('Error', 'Failed to submit review');
    } finally {
      setReviewing(r => ({ ...r, [productId]: { ...r[productId], loading: false } }));
    }
  };

  const handleEditReview = async (reviewId, rating, text, productId) => {
    setReviewing(r => ({ ...r, [productId]: { ...r[productId], loading: true } }));
    try {
      await api.put(`/reviews/${reviewId}`, { rating, text });
      Alert.alert('Success', 'Review updated!');
      await fetchOrdersAndReviews();
    } catch (e) {
      Alert.alert('Error', 'Failed to update review');
    } finally {
      setReviewing(r => ({ ...r, [productId]: { ...r[productId], loading: false } }));
    }
  };

  const handleDeleteReview = async (reviewId, productId) => {
    setReviewing(r => ({ ...r, [productId]: { ...r[productId], loading: true } }));
    try {
      await api.delete(`/reviews/${reviewId}`);
      Alert.alert('Success', 'Review deleted!');
      await fetchOrdersAndReviews();
    } catch (e) {
      Alert.alert('Error', 'Failed to delete review');
    } finally {
      setReviewing(r => ({ ...r, [productId]: { ...r[productId], loading: false } }));
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  if (!orders.length) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-gray-500">No products to review yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      className="bg-white"
      data={orders}
      keyExtractor={item => item._id}
      renderItem={({ item }) => {
        const review = userReviews[item._id];
        const isLoading = reviewing[item._id]?.loading;
        const [rating, setRating] = useState(review ? review.rating : 0);
        const [text, setText] = useState(review ? review.text : '');
        return (
          <View className="p-4 border-b border-gray-100">
            <Text className="text-base font-semibold text-gray-900 mb-1">{item.name}</Text>
            {review ? (
              <View className="mb-2">
                <Text className="text-yellow-600 font-bold">Your Rating: {review.rating} ★</Text>
                <Text className="text-gray-700 mb-2">{review.text}</Text>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    className="bg-blue-100 px-3 py-1 rounded"
                    onPress={() => handleEditReview(review._id, rating, text, item._id)}
                    disabled={isLoading}
                  >
                    <Text className="text-blue-600">Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-red-100 px-3 py-1 rounded"
                    onPress={() => handleDeleteReview(review._id, item._id)}
                    disabled={isLoading}
                  >
                    <Text className="text-red-600">Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View className="mb-2">
                <Text className="text-gray-700 mb-1">Rate this product:</Text>
                <View className="flex-row mb-2">
                  {[1,2,3,4,5].map(star => (
                    <TouchableOpacity key={star} onPress={() => setRating(star)}>
                      <Text className={`text-2xl ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}>★</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  className="border border-gray-200 rounded-xl p-2 mb-2"
                  placeholder="Write your review..."
                  value={text}
                  onChangeText={setText}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  className="bg-green-500 px-4 py-2 rounded-xl items-center"
                  onPress={() => handleReview(item._id, rating, text)}
                  disabled={isLoading || !rating || !text}
                >
                  <Text className="text-white font-semibold">Submit Review</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      }}
    />
  );
};

export default RateReviewScreen; 