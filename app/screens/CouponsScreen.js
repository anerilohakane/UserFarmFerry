import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft, Copy, Gift, Percent, Tag, Clock, CheckCircle
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Clipboard
} from 'react-native';
import { couponAPI } from '../services/api';

export default function CouponsScreen({ navigation }) {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const fetchCoupons = async () => {
    try {
      const response = await couponAPI.getActiveCoupons();
      setCoupons(response.data.data.coupons || []);
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
      Alert.alert('Error', 'Failed to load coupons. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCoupons();
  };

  const copyToClipboard = (code) => {
    Clipboard.setString(code);
    Alert.alert('Copied!', `Coupon code "${code}" copied to clipboard`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const CouponCard = ({ coupon }) => {
    const isExpiringSoon = () => {
      const today = new Date();
      const endDate = new Date(coupon.endDate);
      const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
      return daysLeft <= 7;
    };

    const getDaysLeft = () => {
      const today = new Date();
      const endDate = new Date(coupon.endDate);
      const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
      return daysLeft;
    };

    return (
      <View className="bg-white rounded-xl mb-4 overflow-hidden shadow-sm border border-gray-100">
        <LinearGradient
          colors={['#059669', '#10b981']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="p-4"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="bg-white/20 p-2 rounded-lg mr-3">
                {coupon.type === 'percentage' ? (
                  <Percent size={responsiveValue(20, 22, 24)} color="white" />
                ) : (
                  <Tag size={responsiveValue(20, 22, 24)} color="white" />
                )}
              </View>
              <View className="flex-1">
                <Text 
                  className="text-white font-bold"
                  style={{ fontSize: responsiveValue(16, 18, 20) }}
                >
                  {coupon.type === 'percentage' 
                    ? `${coupon.value}% OFF` 
                    : `₹${coupon.value} OFF`
                  }
                </Text>
                <Text 
                  className="text-white/80"
                  style={{ fontSize: responsiveValue(12, 13, 14) }}
                >
                  {coupon.description || 'Save on your order'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => copyToClipboard(coupon.code)}
              className="bg-white/20 px-3 py-2 rounded-lg flex-row items-center"
            >
              <Text 
                className="text-white font-bold mr-2"
                style={{ fontSize: responsiveValue(12, 13, 14) }}
              >
                {coupon.code}
              </Text>
              <Copy size={responsiveValue(14, 16, 18)} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View className="p-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Gift size={responsiveValue(16, 18, 20)} color="#6b7280" />
              <Text 
                className="text-gray-600 ml-2"
                style={{ fontSize: responsiveValue(12, 13, 14) }}
              >
                Min. order: ₹{coupon.minPurchase || 0}
              </Text>
            </View>
            {coupon.maxDiscount && (
              <Text 
                className="text-gray-600"
                style={{ fontSize: responsiveValue(12, 13, 14) }}
              >
                Max: ₹{coupon.maxDiscount}
              </Text>
            )}
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Clock size={responsiveValue(16, 18, 20)} color={isExpiringSoon() ? "#ef4444" : "#6b7280"} />
              <Text 
                className={`ml-2 ${isExpiringSoon() ? 'text-red-500' : 'text-gray-600'}`}
                style={{ fontSize: responsiveValue(12, 13, 14) }}
              >
                {getDaysLeft() > 0 
                  ? `${getDaysLeft()} days left`
                  : 'Expires today'
                }
              </Text>
            </View>
            <Text 
              className="text-gray-500"
              style={{ fontSize: responsiveValue(11, 12, 13) }}
            >
              Valid till {formatDate(coupon.endDate)}
            </Text>
          </View>

          {isExpiringSoon() && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-2 mt-3">
              <Text 
                className="text-red-600 text-center font-medium"
                style={{ fontSize: responsiveValue(11, 12, 13) }}
              >
                ⚡ Hurry! This coupon expires soon
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (isLoading) {
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
            Coupons & Offers
          </Text>
        </View>

        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#059669" />
          <Text 
            className="text-gray-500 mt-4"
            style={{ fontSize: responsiveValue(14, 15, 16) }}
          >
            Loading coupons...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
          Coupons & Offers
        </Text>
        <View className="bg-green-100 px-2 py-1 rounded-full">
          <Text 
            className="text-green-600 font-medium"
            style={{ fontSize: responsiveValue(11, 12, 13) }}
          >
            {coupons.length} Available
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="p-4">
          {coupons.length === 0 ? (
            <View className="flex-1 justify-center items-center py-20">
              <View className="bg-gray-100 p-6 rounded-full mb-4">
                <Gift size={responsiveValue(40, 45, 50)} color="#9ca3af" />
              </View>
              <Text 
                className="text-gray-900 font-semibold mb-2"
                style={{ fontSize: responsiveValue(16, 18, 20) }}
              >
                No Coupons Available
              </Text>
              <Text 
                className="text-gray-500 text-center"
                style={{ fontSize: responsiveValue(14, 15, 16) }}
              >
                Check back later for exciting offers and discounts!
              </Text>
            </View>
          ) : (
            <>
              <View className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <View className="flex-row items-center mb-2">
                  <CheckCircle size={responsiveValue(18, 20, 22)} color="#059669" />
                  <Text 
                    className="text-green-800 font-semibold ml-2"
                    style={{ fontSize: responsiveValue(14, 15, 16) }}
                  >
                    How to use coupons
                  </Text>
                </View>
                <Text 
                  className="text-green-700"
                  style={{ fontSize: responsiveValue(12, 13, 14) }}
                >
                  1. Copy the coupon code by tapping on it{'\n'}
                  2. Add items to your cart{'\n'}
                  3. Apply the coupon during checkout{'\n'}
                  4. Enjoy your savings!
                </Text>
              </View>

              {coupons.map((coupon) => (
                <CouponCard key={coupon._id} coupon={coupon} />
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
