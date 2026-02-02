import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, TextInput, TouchableOpacity, Alert, SafeAreaView, StatusBar } from 'react-native';
import { ordersAPI, reviewsAPI } from '../services/api';
import { Feather } from '@expo/vector-icons';

const RateReviewScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState({});
  const [userReviews, setUserReviews] = useState({});
  const [reviewForms, setReviewForms] = useState({}); // { [productId]: { rating, text } }

  useEffect(() => {
    fetchOrdersAndReviews();
  }, []);

  const fetchOrdersAndReviews = async () => {
    setLoading(true);
    try {
      const res = await ordersAPI.getMyOrders();
      console.log('Orders Response:', res.data);

      const allProducts = [];
      const ordersData = res.data.data || [];

      ordersData.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            if (item.product) {
              allProducts.push({
                ...item.product,
                orderId: order._id,
                productId: item.product._id,
              });
            }
          });
        }
      });

      setOrders(allProducts);

      // Fetch existing reviews
      const reviewsMap = {};
      const formsMap = {};

      await Promise.all(
        allProducts.map(async (p) => {
          try {
            const r = await reviewsAPI.getProductReviews(p._id);
            console.log(`Reviews for ${p._id}:`, r.data);

            // Find review by current user
            const myReview = r.data.data?.find(rev => rev.customer?._id || rev.user?._id);
            if (myReview) {
              reviewsMap[p._id] = myReview;
              formsMap[p._id] = {
                rating: myReview.rating || 0,
                text: myReview.text || ''
              };
            } else {
              formsMap[p._id] = { rating: 0, text: '' };
            }
          } catch (err) {
            console.log(`No reviews found for product ${p._id}`);
            formsMap[p._id] = { rating: 0, text: '' };
          }
        })
      );

      setUserReviews(reviewsMap);
      setReviewForms(formsMap);
    } catch (e) {
      console.error('Error fetching orders:', e);
      Alert.alert('Error', 'Failed to fetch orders: ' + (e?.response?.data?.message || e.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (productId, rating, text) => {
    if (!rating || rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }
    if (!text || text.trim() === '') {
      Alert.alert('Error', 'Please write a review');
      return;
    }

    setReviewing(r => ({ ...r, [productId]: { ...r[productId], loading: true } }));
    try {
      await reviewsAPI.createReview({ product: productId, rating, text });
      Alert.alert('Success', 'Review submitted!');
      await fetchOrdersAndReviews();
    } catch (e) {
      console.error('Error submitting review:', e);
      Alert.alert('Error', e?.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewing(r => ({ ...r, [productId]: { ...r[productId], loading: false } }));
    }
  };

  const handleEditReview = async (reviewId, rating, text, productId) => {
    if (!rating || rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }
    if (!text || text.trim() === '') {
      Alert.alert('Error', 'Please write a review');
      return;
    }

    setReviewing(r => ({ ...r, [productId]: { ...r[productId], loading: true } }));
    try {
      await reviewsAPI.updateReview(reviewId, { rating, text });
      Alert.alert('Success', 'Review updated!');
      await fetchOrdersAndReviews();
    } catch (e) {
      console.error('Error updating review:', e);
      Alert.alert('Error', e?.response?.data?.message || 'Failed to update review');
    } finally {
      setReviewing(r => ({ ...r, [productId]: { ...r[productId], loading: false } }));
    }
  };

  const handleDeleteReview = async (reviewId, productId) => {
    setReviewing(r => ({ ...r, [productId]: { ...r[productId], loading: true } }));
    try {
      await reviewsAPI.deleteReview(reviewId);
      Alert.alert('Success', 'Review deleted!');
      await fetchOrdersAndReviews();
    } catch (e) {
      console.error('Error deleting review:', e);
      Alert.alert('Error', e?.response?.data?.message || 'Failed to delete review');
    } finally {
      setReviewing(r => ({ ...r, [productId]: { ...r[productId], loading: false } }));
    }
  };

  const updateReviewForm = (productId, field, value) => {
    setReviewForms(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={{ marginTop: 12, fontSize: 14, color: '#6b7280' }}>Loading products...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!orders.length) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
          <Feather name="package" size={64} color="#d1d5db" />
          <Text style={{ marginTop: 16, fontSize: 18, fontWeight: '700', color: '#1f2937' }}>No products to review</Text>
          <Text style={{ marginTop: 8, fontSize: 14, color: '#6b7280', textAlign: 'center' }}>
            Order some products first to leave reviews
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#1f2937' }}>Rate & Review</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={item => item._id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          const review = userReviews[item._id];
          const isLoading = reviewing[item._id]?.loading;
          const formData = reviewForms[item._id] || { rating: 0, text: '' };

          return (
            <View style={{
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#f3f4f6',
              marginBottom: 16,
              backgroundColor: 'white',
              shadowColor: '#000',
              shadowOpacity: 0.05,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 4,
              elevation: 2
            }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#1f2937', marginBottom: 8 }}>{item.name}</Text>

              {review ? (
                <View style={{ marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={{ color: '#f59e0b', fontWeight: '700', fontSize: 16 }}>
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </Text>
                    <Text style={{ marginLeft: 8, color: '#6b7280', fontSize: 12 }}>
                      {review.rating}/5
                    </Text>
                  </View>
                  <Text style={{ color: '#374151', marginBottom: 12, lineHeight: 20 }}>{review.text}</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                      style={{ flex: 1, backgroundColor: '#eff6ff', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center' }}
                      onPress={() => handleEditReview(review._id, formData.rating, formData.text, item._id)}
                      disabled={isLoading}
                    >
                      <Text style={{ color: '#2563eb', fontWeight: '600' }}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ flex: 1, backgroundColor: '#fef2f2', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center' }}
                      onPress={() => handleDeleteReview(review._id, item._id)}
                      disabled={isLoading}
                    >
                      <Text style={{ color: '#dc2626', fontWeight: '600' }}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={{ marginBottom: 8 }}>
                  <Text style={{ color: '#6b7280', marginBottom: 8, fontSize: 13 }}>Rate this product:</Text>
                  <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => updateReviewForm(item._id, 'rating', star)}
                        style={{ marginRight: 4 }}
                      >
                        <Text style={{ fontSize: 28, color: star <= formData.rating ? '#f59e0b' : '#d1d5db' }}>
                          ★
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: '#e5e7eb',
                      borderRadius: 8,
                      padding: 12,
                      marginBottom: 12,
                      minHeight: 80,
                      textAlignVertical: 'top'
                    }}
                    placeholder="Write your review..."
                    value={formData.text}
                    onChangeText={(text) => updateReviewForm(item._id, 'text', text)}
                    editable={!isLoading}
                    multiline
                  />
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#16a34a',
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      alignItems: 'center',
                      opacity: (isLoading || !formData.rating || !formData.text) ? 0.5 : 1
                    }}
                    onPress={() => handleReview(item._id, formData.rating, formData.text)}
                    disabled={isLoading || !formData.rating || !formData.text}
                  >
                    <Text style={{ color: 'white', fontWeight: '700' }}>
                      {isLoading ? 'Submitting...' : 'Submit Review'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
};

export default RateReviewScreen; 