import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Check,
  Tag,
  X,
  AlertCircle,
  Gift,
} from "lucide-react-native";
import { useEffect, useState } from "react";
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
  View,
} from "react-native";
import { useAppContext } from "../context/AppContext";
import { couponAPI, cartAPI } from "../services/api";

export default function PromoCodeScreen({ navigation }) {
  const { cartItems, updateCartItems } = useAppContext();
  const [couponCode, setCouponCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);

  // Get screen dimensions
  const { width } = Dimensions.get("window");
  const isSmallScreen = width < 375;
  const isMediumScreen = width >= 375 && width < 768;

  // Responsive sizing helper
  const responsiveValue = (small, medium, large) => {
    if (isSmallScreen) return small;
    if (isMediumScreen) return medium;
    return large;
  };

  // Responsive spacing helper
  const responsiveSpacing = (small, medium, large) =>
    responsiveValue(small, medium, large);

  // Define responsive spacings
  const screenPadding = responsiveSpacing(12, 16, 20);
  const sectionPadding = responsiveSpacing(16, 20, 24);
  const cardPadding = responsiveSpacing(12, 16, 20);
  const cardMarginBottom = responsiveSpacing(12, 16, 20);
  const sectionMarginBottom = responsiveSpacing(24, 32, 40);
  const inputPaddingHorizontal = responsiveSpacing(12, 16, 20);
  const inputPaddingVertical = responsiveSpacing(10, 12, 16);
  const buttonPaddingHorizontal = responsiveSpacing(16, 20, 24);
  const buttonPaddingVertical = responsiveSpacing(10, 12, 16);
  const iconMarginRight = responsiveSpacing(8, 12, 16);
  const smallPadding = responsiveSpacing(6, 8, 10);
  const largePadding = responsiveSpacing(20, 24, 28);
  const tagPaddingHorizontal = responsiveSpacing(10, 12, 16);
  const tagPaddingVertical = responsiveSpacing(4, 6, 8);
  const smallMargin = responsiveSpacing(4, 6, 8);
  const mediumMarginBottom = responsiveSpacing(8, 12, 16);
  const largeMarginTop = responsiveSpacing(12, 16, 20);
  const loadingPaddingVertical = responsiveSpacing(24, 32, 40);
  const headerPaddingVertical = responsiveSpacing(8, 12, 16);
  const headerMarginRight = responsiveSpacing(12, 16, 20);
  const textMarginBottom = responsiveSpacing(12, 16, 20);
  const titleMarginBottom = responsiveSpacing(16, 20, 24);

  // Calculate cart total
  const getCartTotal = () => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce((total, item) => {
      const price = item.discountedPrice || item.price;
      return total + price * item.quantity;
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
      console.error("Failed to fetch coupons:", error);
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
      console.error("Failed to check applied coupon:", error);
    }
  };

  const validateAndApplyCoupon = async (code) => {
    if (!code.trim()) {
      Alert.alert("Error", "Please enter a coupon code");
      return;
    }

    if (cartTotal === 0) {
      Alert.alert(
        "Error",
        "Your cart is empty. Add items before applying a coupon."
      );
      return;
    }

    setIsLoading(true);
    try {
      // First validate the coupon
      const validateResponse = await couponAPI.validateCoupon({
        code: code.trim().toUpperCase(),
        cartTotal,
      });

      if (validateResponse.data.success) {
        // Apply the coupon to cart
        const applyResponse = await couponAPI.applyCoupon({
          code: code.trim().toUpperCase(),
        });

        if (applyResponse.data.success) {
          const couponData = validateResponse.data.data.coupon;
          const discount = validateResponse.data.data.discount;

          setAppliedCoupon({
            code: couponData.code,
            type: couponData.type,
            value: couponData.value,
            discount,
          });

          // Update cart items to reflect the coupon application
          const updatedCart = applyResponse.data.data.cart;
          updateCartItems(updatedCart.items);

          Alert.alert(
            "Coupon Applied!",
            `You saved ₹${discount} with coupon ${couponData.code}`,
            [{ text: "OK", onPress: () => navigation.goBack() }]
          );
        }
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to apply coupon";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const removeCoupon = async () => {
    setIsLoading(true);
    try {
      await couponAPI.removeCoupon();
      setAppliedCoupon(null);
      setCouponCode("");

      // Refresh cart
      const response = await cartAPI.getCart();
      updateCartItems(response.data.data.cart.items);

      Alert.alert("Coupon Removed", "Coupon has been removed from your cart");
    } catch (error) {
      Alert.alert("Error", "Failed to remove coupon");
    } finally {
      setIsLoading(false);
    }
  };

  const CouponCard = ({ coupon }) => {
    const canApply = cartTotal >= (coupon.minPurchase || 0);

    return (
      <TouchableOpacity
        onPress={() => (canApply ? validateAndApplyCoupon(coupon.code) : null)}
        disabled={!canApply || isLoading}
        style={{
          padding: cardPadding,
          marginBottom: cardMarginBottom,
          backgroundColor: "white",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: canApply ? "#dcfce7" : "#e5e7eb",
        }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <View
              style={{ marginBottom: mediumMarginBottom }}
              className="flex-row items-center"
            >
              <View
                style={{
                  padding: smallPadding,
                  marginRight: iconMarginRight,
                  borderRadius: 8,
                  backgroundColor: canApply ? "#dcfce7" : "#f3f4f6",
                }}
              >
                <Tag
                  size={responsiveValue(16, 18, 20)}
                  color={canApply ? "#059669" : "#9ca3af"}
                />
              </View>
              <View className="flex-1">
                <Text
                  className={`font-bold ${canApply ? "text-green-600" : "text-gray-400"}`}
                  style={{ fontSize: responsiveValue(14, 16, 18) }}
                >
                  {coupon.type === "percentage"
                    ? `${coupon.value}% OFF`
                    : `₹${coupon.value} OFF`}
                </Text>
                <Text
                  className={`${canApply ? "text-gray-600" : "text-gray-400"}`}
                  style={{ fontSize: responsiveValue(11, 12, 13) }}
                >
                  Code: {coupon.code}
                </Text>
              </View>
            </View>

            <Text
              className={`${canApply ? "text-gray-600" : "text-gray-400"}`}
              style={{ fontSize: responsiveValue(11, 12, 13) }}
            >
              Min. order: ₹{coupon.minPurchase || 0}
            </Text>

            {!canApply && (
              <Text
                className="text-red-500"
                style={{
                  marginTop: smallMargin,
                  fontSize: responsiveValue(10, 11, 12),
                }}
              >
                Add ₹{(coupon.minPurchase || 0) - cartTotal} more to apply
              </Text>
            )}
          </View>

          <View
            style={{
              paddingHorizontal: tagPaddingHorizontal,
              paddingVertical: tagPaddingVertical,
              borderRadius: 9999,
              backgroundColor: canApply ? "#dcfce7" : "#f3f4f6",
            }}
          >
            <Text
              className={`font-medium ${canApply ? "text-green-600" : "text-gray-400"}`}
              style={{ fontSize: responsiveValue(10, 11, 12) }}
            >
              {canApply ? "APPLY" : "N/A"}
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
      <LinearGradient
        colors={["#FFFFFF", "#F8FAFC"]}
        className="px-6 py-4 border-b border-gray-100 mt-14"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="p-2 -ml-2 bg-gray-100 rounded-full"
            >
              <ArrowLeft size={20} color="#16a34a" />
            </TouchableOpacity>
            <View className="ml-3">
              <Text className="text-xl font-bold text-gray-900">
                Apply Coupon
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View style={{ padding: screenPadding }}>
          {/* Cart Total Info */}
          <View
            className="bg-blue-50 border border-blue-200 rounded-xl"
            style={{
              padding: sectionPadding,
              marginBottom: sectionMarginBottom,
            }}
          >
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
            <View
              className="bg-green-50 border border-green-200 rounded-xl"
              style={{
                padding: sectionPadding,
                marginBottom: sectionMarginBottom,
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View
                    style={{ marginBottom: mediumMarginBottom }}
                    className="flex-row items-center"
                  >
                    <Check size={responsiveValue(18, 20, 22)} color="#059669" />
                    <Text
                      className="text-green-800 font-semibold ml-2"
                      style={{
                        marginLeft: smallMargin * 2,
                        fontSize: responsiveValue(14, 15, 16),
                      }}
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
                  style={{ padding: smallPadding }}
                >
                  <X size={responsiveValue(18, 20, 22)} color="#059669" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Manual Coupon Entry */}
          {!appliedCoupon && (
            <View
              className="bg-white rounded-xl border border-gray-100"
              style={{
                padding: sectionPadding,
                marginBottom: sectionMarginBottom,
              }}
            >
              <Text
                className="text-gray-900 font-semibold"
                style={{
                  marginBottom: textMarginBottom,
                  fontSize: responsiveValue(14, 15, 16),
                }}
              >
                Enter Coupon Code
              </Text>

              <View className="flex-row items-center">
                <TextInput
                  value={couponCode}
                  onChangeText={setCouponCode}
                  placeholder="Enter coupon code"
                  placeholderTextColor="#9ca3af"
                  className="flex-1 border border-gray-300 rounded-lg"
                  style={{
                    paddingHorizontal: inputPaddingHorizontal,
                    paddingVertical: inputPaddingVertical,
                    marginRight: iconMarginRight,
                    fontSize: responsiveValue(14, 15, 16),
                  }}
                  autoCapitalize="characters"
                  editable={!isLoading}
                />

                <TouchableOpacity
                  onPress={() => validateAndApplyCoupon(couponCode)}
                  disabled={isLoading || !couponCode.trim()}
                  className={`rounded-lg ${
                    isLoading || !couponCode.trim()
                      ? "bg-gray-300"
                      : "bg-green-600"
                  }`}
                  style={{
                    paddingHorizontal: buttonPaddingHorizontal,
                    paddingVertical: buttonPaddingVertical,
                  }}
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
          <View style={{ marginBottom: sectionMarginBottom }}>
            <Text
              className="text-gray-900 font-semibold"
              style={{
                marginBottom: titleMarginBottom,
                fontSize: responsiveValue(16, 17, 18),
              }}
            >
              Available Coupons
            </Text>

            {loadingCoupons ? (
              <View
                className="flex-row justify-center"
                style={{ paddingVertical: loadingPaddingVertical }}
              >
                <ActivityIndicator size="large" color="#059669" />
              </View>
            ) : availableCoupons.length === 0 ? (
              <View
                className="bg-white rounded-xl items-center"
                style={{ padding: largePadding }}
              >
                <Gift size={responsiveValue(40, 45, 50)} color="#9ca3af" />
                <Text
                  className="text-gray-500 text-center"
                  style={{
                    marginTop: largeMarginTop,
                    fontSize: responsiveValue(14, 15, 16),
                  }}
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
          <View
            className="bg-yellow-50 border border-yellow-200 rounded-xl"
            style={{ padding: sectionPadding }}
          >
            <View className="flex-row items-start">
              <AlertCircle size={responsiveValue(18, 20, 22)} color="#f59e0b" />
              <View style={{ marginLeft: iconMarginRight }} className="flex-1">
                <Text
                  className="text-yellow-800 font-semibold mb-1"
                  style={{
                    marginBottom: smallMargin,
                    fontSize: responsiveValue(13, 14, 15),
                  }}
                >
                  Coupon Terms
                </Text>
                <Text
                  className="text-yellow-700"
                  style={{ fontSize: responsiveValue(11, 12, 13) }}
                >
                  • Only one coupon can be applied per order{"\n"}• Coupons
                  cannot be combined with other offers{"\n"}• Check minimum
                  order requirements{"\n"}• Coupons are valid until expiry date
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
