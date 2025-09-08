import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList
} from 'react-native';
import { Star, Heart, MessageCircle, Flag, Edit, Trash2, X } from 'lucide-react-native';
import { reviewsAPI } from '../services/api';
import { useAppContext } from '../context/AppContext';

const ReviewComponent = ({ productId, productName, onReviewSubmitted, openReviewModal }) => {
  console.log('🎯 ReviewComponent props:', { productId, productName, hasCallback: !!onReviewSubmitted });
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [editing, setEditing] = useState(false);
  
  // New state for reply functionality
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [likedReplies, setLikedReplies] = useState(new Set());

  const { user } = useAppContext();
  console.log('👤 Current user:', user?._id || user?.id);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  useEffect(() => {
    if (openReviewModal) setShowReviewModal(true);
  }, [openReviewModal]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewsAPI.getProductReviews(productId, {
        page: 1,
        limit: 10,
        sort: 'createdAt',
        order: 'desc'
      });
      
      const reviewsData = response.data.data.reviews || [];
      console.log('📊 Fetched reviews:', reviewsData.length);
      console.log('📊 Reviews with admin replies:', reviewsData.filter(r => r.reply).length);
      console.log('📊 Reviews with customer replies:', reviewsData.filter(r => r.customerReply).length);
      
      setReviews(reviewsData);
      
      // Check if user has already reviewed this product
      const userReviewData = reviewsData.find(review => 
        review.customer?._id === user?._id || review.customer?.id === user?.id
      );
      setUserReview(userReviewData || null);
      
      if (userReviewData) {
        setRating(userReviewData.rating);
        setTitle(userReviewData.title || '');
        setComment(userReviewData.comment || '');
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!rating) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    if (!comment.trim()) {
      Alert.alert('Error', 'Please write a review comment');
      return;
    }

    try {
      setSubmitting(true);
      const reviewData = {
        productId,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim()
      };

      if (editing && userReview) {
        await reviewsAPI.updateReview(userReview._id, reviewData);
      } else {
        await reviewsAPI.createReview(reviewData);
      }

      setShowReviewModal(false);
      setEditing(false);
      setRating(0);
      setTitle('');
      setComment('');
      await fetchReviews();
      
      console.log('🎯 ReviewComponent: Calling onReviewSubmitted callback for', editing ? 'EDIT' : 'CREATE');
      if (onReviewSubmitted) {
        onReviewSubmitted();
        console.log('✅ onReviewSubmitted callback executed successfully');
      } else {
        console.log('⚠️ No onReviewSubmitted callback provided');
      }
      
      // Show success alert after callback
      setTimeout(() => {
        Alert.alert('Success', editing ? 'Review updated successfully!' : 'Review submitted successfully!');
      }, 100);
    } catch (error) {
      console.error('Failed to submit review:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete your review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await reviewsAPI.deleteReview(userReview._id);
              Alert.alert('Success', 'Review deleted successfully!');
              setUserReview(null);
              setRating(0);
              setTitle('');
              setComment('');
              await fetchReviews();
              
              // Call callback to update product card
              console.log('🎯 ReviewComponent: Calling onReviewSubmitted callback for DELETE');
              if (onReviewSubmitted) {
                onReviewSubmitted();
                console.log('✅ onReviewSubmitted callback executed successfully for DELETE');
              } else {
                console.log('⚠️ No onReviewSubmitted callback provided for DELETE');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete review');
            }
          }
        }
      ]
    );
  };

  const handleEditReview = () => {
    setEditing(true);
    setShowReviewModal(true);
  };

  // Handle liking admin/seller reply
  const handleLikeReply = async (reviewId) => {
    console.log('❤️ Attempting to like reply for review:', reviewId);
    try {
      await reviewsAPI.markAsHelpful(reviewId);
      console.log('✅ Successfully liked reply');
      
      // Update local state to show the like
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review._id === reviewId
            ? { ...review, helpfulCount: (review.helpfulCount || 0) + 1 }
            : review
        )
      );
      
      // Add to liked replies set
      setLikedReplies(prev => new Set(prev).add(reviewId));
      
      Alert.alert('Success', 'Reply marked as helpful!');
    } catch (error) {
      console.error('❌ Failed to like reply:', error);
      Alert.alert('Error', 'Failed to mark reply as helpful');
    }
  };

  // Handle replying to admin/seller response
  const handleReplyToAdmin = (review) => {
    console.log('💬 Opening reply modal for review:', review._id);
    setSelectedReview(review);
    setReplyText('');
    setShowReplyModal(true);
  };

  // Submit reply to admin/seller response
  const handleSubmitReply = async () => {
    console.log('📝 Submitting reply for review:', selectedReview?._id);
    console.log('📝 Reply text:', replyText);
    
    if (!replyText.trim()) {
      Alert.alert('Error', 'Please enter a reply');
      return;
    }

    try {
      setSubmittingReply(true);
      
      // Add customer reply to the review
      const response = await reviewsAPI.addCustomerReply(selectedReview._id, {
        content: replyText.trim()
      });
      
      console.log('✅ Reply submitted successfully:', response.data);
      
      // Update local state
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review._id === selectedReview._id
            ? { 
                ...review, 
                customerReply: {
                  content: replyText.trim(),
                  createdAt: new Date().toISOString(),
                  customer: user
                }
              }
            : review
        )
      );
      
      setShowReplyModal(false);
      setSelectedReview(null);
      setReplyText('');
      
      Alert.alert('Success', 'Reply submitted successfully!');
    } catch (error) {
      console.error('❌ Failed to submit reply:', error);
      console.error('❌ Error response:', error.response?.data);
      Alert.alert('Error', 'Failed to submit reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const renderStars = (rating, size = 16, interactive = false, onPress = null) => {
    return (
      <View style={{ flexDirection: 'row' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => {
              if (interactive && onPress) {
                onPress(star);
              }
            }}
            disabled={!interactive}
          >
            <Star
              size={size}
              color={star <= rating ? '#fbbf24' : '#d1d5db'}
              fill={star <= rating ? '#fbbf24' : 'none'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderReviewItem = ({ item }) => (
    <View style={{
      backgroundColor: 'white',
      padding: 16,
      marginBottom: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#e5e7eb',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Image
          source={
            item.customer?.profileImage
              ? { uri: item.customer.profileImage }
              : { uri: 'https://via.placeholder.com/40' }
          }
          style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937' }}>
            {item.customer?.firstName} {item.customer?.lastName}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
            {renderStars(item.rating, 12)}
            <Text style={{ fontSize: 12, color: '#6b7280', marginLeft: 8 }}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        {item.isVerified && (
          <View style={{
            backgroundColor: '#10b981',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8
          }}>
            <Text style={{ fontSize: 10, color: 'white', fontWeight: '600' }}>
              Verified
            </Text>
          </View>
        )}
      </View>

      {item.title && (
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 8 }}>
          {item.title}
        </Text>
      )}

      <Text style={{ fontSize: 14, color: '#374151', lineHeight: 20, marginBottom: 12 }}>
        {item.comment}
      </Text>

      {item.images && item.images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          {item.images.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image.url }}
              style={{ width: 80, height: 80, borderRadius: 8, marginRight: 8 }}
            />
          ))}
        </ScrollView>
      )}

      {item.reply && (
        <View style={{
          backgroundColor: '#f9fafb',
          padding: 12,
          borderRadius: 8,
          marginTop: 8,
          borderLeftWidth: 3,
          borderLeftColor: '#10b981'
        }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 4 }}>
            Seller Response:
          </Text>
          <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
            {item.reply.content}
          </Text>
          
          {/* Customer reply to admin response */}
          {item.customerReply && (
            <View style={{
              backgroundColor: '#f0f9ff',
              padding: 8,
              borderRadius: 6,
              marginTop: 8,
              borderLeftWidth: 2,
              borderLeftColor: '#0ea5e9'
            }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#0c4a6e', marginBottom: 2 }}>
                Your Reply:
              </Text>
              <Text style={{ fontSize: 11, color: '#0369a1' }}>
                {item.customerReply.content}
              </Text>
            </View>
          )}
          
          {/* Action buttons for admin response */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity 
                style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}
                onPress={() => handleLikeReply(item._id)}
              >
                <Heart 
                  size={12} 
                  color={likedReplies.has(item._id) ? '#ef4444' : '#6b7280'} 
                  fill={likedReplies.has(item._id) ? '#ef4444' : 'none'}
                />
                <Text style={{ 
                  fontSize: 10, 
                  color: likedReplies.has(item._id) ? '#ef4444' : '#6b7280', 
                  marginLeft: 4,
                  fontWeight: likedReplies.has(item._id) ? '600' : '400'
                }}>
                  {item.helpfulCount || 0}
                </Text>
              </TouchableOpacity>
              
              {!item.customerReply && (
                <TouchableOpacity 
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                  onPress={() => handleReplyToAdmin(item)}
                >
                  <MessageCircle size={12} color="#6b7280" />
                  <Text style={{ fontSize: 10, color: '#6b7280', marginLeft: 4 }}>
                    Reply
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            
            <Text style={{ fontSize: 10, color: '#9ca3af' }}>
              {new Date(item.reply.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      )}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
            <Heart size={14} color="#6b7280" />
            <Text style={{ fontSize: 12, color: '#6b7280', marginLeft: 4 }}>
              {item.helpfulCount || 0}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MessageCircle size={14} color="#6b7280" />
            <Text style={{ fontSize: 12, color: '#6b7280', marginLeft: 4 }}>
              Reply
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity>
          <Flag size={14} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderReviewModal = () => (
    <Modal
      visible={showReviewModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb'
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937' }}>
            {editing ? 'Edit Review' : 'Write a Review'}
          </Text>
          <TouchableOpacity onPress={() => setShowReviewModal(false)}>
            <X size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1, padding: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 8 }}>
            {productName}
          </Text>

          {/* Rating */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
              Your Rating *
            </Text>
            {renderStars(rating, 24, true, setRating)}
          </View>

          {/* Title */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
              Review Title (Optional)
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Summarize your experience..."
              style={{
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 8,
                padding: 12,
                fontSize: 14,
                color: '#1f2937'
              }}
            />
          </View>

          {/* Comment */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
              Your Review *
            </Text>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Share your experience with this product..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              style={{
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 8,
                padding: 12,
                fontSize: 14,
                color: '#1f2937',
                minHeight: 120
              }}
            />
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={{
          padding: 16,
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          flexDirection: 'row',
          gap: 12
        }}>
          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#d1d5db',
              alignItems: 'center'
            }}
            onPress={() => setShowReviewModal(false)}
            disabled={submitting}
          >
            <Text style={{ color: '#6b7280', fontWeight: '600' }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 8,
              backgroundColor: rating && comment.trim() ? '#10b981' : '#d1d5db',
              alignItems: 'center'
            }}
            onPress={handleSubmitReview}
            disabled={submitting || !rating || !comment.trim()}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={{ color: 'white', fontWeight: '600' }}>
                {editing ? 'Update Review' : 'Submit Review'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderReplyModal = () => (
    <Modal
      visible={showReplyModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb'
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937' }}>
            Reply to Seller
          </Text>
          <TouchableOpacity onPress={() => setShowReplyModal(false)}>
            <X size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1, padding: 16 }}>
          {/* Original Review */}
          {selectedReview && (
            <View style={{
              backgroundColor: '#f9fafb',
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
              borderLeftWidth: 3,
              borderLeftColor: '#10b981'
            }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                Your Original Review:
              </Text>
              <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
                {selectedReview.comment}
              </Text>
              
              {selectedReview.reply && (
                <>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 12 }}>
                    Seller's Response:
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6b7280' }}>
                    {selectedReview.reply.content}
                  </Text>
                </>
              )}
            </View>
          )}

          {/* Reply Input */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
              Your Reply *
            </Text>
            <TextInput
              value={replyText}
              onChangeText={setReplyText}
              placeholder="Write your reply to the seller's response..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={{
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 8,
                padding: 12,
                fontSize: 14,
                color: '#1f2937',
                minHeight: 100
              }}
            />
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={{
          padding: 16,
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          flexDirection: 'row',
          gap: 12
        }}>
          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#d1d5db',
              alignItems: 'center'
            }}
            onPress={() => setShowReplyModal(false)}
            disabled={submittingReply}
          >
            <Text style={{ color: '#6b7280', fontWeight: '600' }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 8,
              backgroundColor: replyText.trim() ? '#10b981' : '#d1d5db',
              alignItems: 'center'
            }}
            onPress={handleSubmitReply}
            disabled={submittingReply || !replyText.trim()}
          >
            {submittingReply ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={{ color: 'white', fontWeight: '600' }}>
                Send Reply
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={{ marginTop: 8, fontSize: 14, color: '#6b7280' }}>
          Loading reviews...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: '#f9fafb' }}>
      {/* Review Summary */}
      <View style={{
        backgroundColor: 'white',
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb'
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937' }}>
            Customer Reviews
          </Text>
          <TouchableOpacity onPress={() => setShowAllReviews(!showAllReviews)}>
            <Text style={{ color: '#10b981', fontWeight: '600' }}>
              {showAllReviews ? 'Show Less' : `View All (${reviews.length})`}
            </Text>
          </TouchableOpacity>
        </View>

        {userReview ? (
          <View style={{
            backgroundColor: '#f0fdf4',
            padding: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#bbf7d0',
            marginBottom: 12
          }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#166534', marginBottom: 4 }}>
              Your Review
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              {renderStars(userReview.rating, 14)}
              <Text style={{ fontSize: 12, color: '#6b7280', marginLeft: 8 }}>
                {new Date(userReview.createdAt).toLocaleDateString()}
              </Text>
            </View>
            {userReview.title && (
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 4 }}>
                {userReview.title}
              </Text>
            )}
            <Text style={{ fontSize: 12, color: '#374151', marginBottom: 8 }}>
              {userReview.comment}
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  backgroundColor: '#10b981',
                  borderRadius: 6
                }}
                onPress={handleEditReview}
              >
                <Edit size={12} color="white" />
                <Text style={{ fontSize: 12, color: 'white', marginLeft: 4 }}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  backgroundColor: '#ef4444',
                  borderRadius: 6
                }}
                onPress={handleDeleteReview}
              >
                <Trash2 size={12} color="white" />
                <Text style={{ fontSize: 12, color: 'white', marginLeft: 4 }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={{
              backgroundColor: '#10b981',
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: 12
            }}
            onPress={() => setShowReviewModal(true)}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>
              Write a Review
            </Text>
          </TouchableOpacity>
        )}

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <FlatList
            data={showAllReviews ? reviews : reviews.slice(0, 2)}
            renderItem={renderReviewItem}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center' }}>
              No reviews yet. Be the first to review this product!
            </Text>
          </View>
        )}
      </View>

      {renderReviewModal()}
      {renderReplyModal()}
    </View>
  );
};

export default ReviewComponent; 