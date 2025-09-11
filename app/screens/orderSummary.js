import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import LottieView from "lottie-react-native";
import { CheckCircle, CreditCard, Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import Modal from "../components/ui/Modal";
import { useAppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import {
  cartAPI,
  categoriesAPI,
  customerAPI,
  ordersAPI,
} from "../services/api";
import PaymentService from "../services/paymentService";
import RazorpayService from "../services/razorpayService";

const { width, height } = Dimensions.get("window");

// Responsive sizing helper
const responsiveValue = (mobile, tablet) => {
  return width >= 768 ? tablet : mobile;
};

// Reusable PaymentOption component with responsive sizing
const PaymentOption = ({
  icon,
  title,
  selected,
  onPress,
  disabled,
  comingSoon,
}) => (
  <TouchableOpacity
    className={`flex-row items-center p-2 rounded-lg ${selected ? "bg-green-50" : ""}`}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.7}
    style={{ minHeight: responsiveValue(50, 60) }}
  >
    <View className="bg-white p-1.5 rounded-lg mr-3">{icon}</View>
    <Text
      className={`flex-1 ${disabled ? "text-gray-400" : "text-gray-800"}`}
      style={{ fontSize: responsiveValue(14, 16) }}
    >
      {title}
      {comingSoon && (
        <Text className="text-gray-400 text-xs"> (Coming Soon)</Text>
      )}
    </Text>
    {!disabled && (
      <View
        className={`w-5 h-5 rounded-full border-2 ${selected ? "bg-green-500 border-green-500" : "border-gray-300"}`}
      >
        {selected && <Ionicons name="checkmark" size={14} color="white" />}
      </View>
    )}
  </TouchableOpacity>
);

const OrderSummaryScreen = ({ route }) => {
  const navigation = useNavigation();
  const { updateCartItems } = useAppContext();
  const { user, isAuthenticated, refreshUserData } = useAuth();

  // Debug user authentication status
  useEffect(() => {
    // Extract user data from nested customer object
    const userData = user?.customer || user;

    console.log("OrderSummaryScreen - User Authentication Status:", {
      isAuthenticated,
      user: userData
        ? {
            _id: userData._id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phone: userData.phone,
            hasEmail: !!userData.email,
          }
        : null,
      fullUserObject: user,
      userKeys: user ? Object.keys(user) : [],
      customerData: user?.customer,
    });
  }, [user, isAuthenticated]);

  // Location useEffect
  useEffect(() => {
    (async () => {
      try {
        setIsLoadingLocation(true);
        setLocationError(null);

        // Request permission
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setLocationError(
            "Location permission denied. Using default location."
          );

          // Set default location (Pune coordinates)
          const defaultLocation = {
            latitude: 18.5204,
            longitude: 73.8567,
          };

          setLocation(defaultLocation);
          setRegion({
            ...defaultLocation,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          });
          setIsLoadingLocation(false);
          return;
        }

        // Get current location
        let currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeout: 15000, // 15 second timeout
        });

        const coords = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        };

        console.log("Location obtained:", coords);

        setLocation(coords);
        setRegion({
          ...coords,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        });
      } catch (error) {
        console.error("Location error:", error);
        setLocationError("Failed to get location. Using default location.");

        // Fallback to default location
        const defaultLocation = {
          latitude: 18.5204,
          longitude: 73.8567,
        };

        setLocation(defaultLocation);
        setRegion({
          ...defaultLocation,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        });
      } finally {
        setIsLoadingLocation(false);
      }
    })();
  }, []);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [cart, setCart] = useState({
    items: [],
    subtotal: 0,
    shipping: 0,
    gst: 0,
    total: 0,
    savings: 0,
    handlingFee: 0,
    platformFee: 2,
  });
  const [handlingFees, setHandlingFees] = useState({});
  const [totalHandlingFee, setTotalHandlingFee] = useState(0);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [expandedSection, setExpandedSection] = useState("upi");
  const [selectedPayment, setSelectedPayment] = useState("gpay");
  const [customUpiId, setCustomUpiId] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [orderId, setOrderId] = useState(null);

  // Location state
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [mapError, setMapError] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  // Get items and calculated values from route params (from CartScreen)
  const routeItems = route?.params?.items;
  const routeSubtotal = route?.params?.subtotal;
  const routeGst = route?.params?.gst;
  const routeShipping = route?.params?.shipping;
  const routePlatformFee = route?.params?.platformFee;
  const routeTotal = route?.params?.total;
  const routeSavings = route?.params?.savings;

  // GST rate (5%)
  const GST_RATE = 0.05;

  // Calculation helpers
  const getSubtotal = (items) =>
    items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const getTotalDiscount = (items) =>
    items.reduce((sum, item) => {
      if (item.originalPrice) {
        return sum + (item.originalPrice - item.price) * item.quantity;
      }
      return sum;
    }, 0);

  const getTotalGST = (items) => {
    return items.reduce((sum, item) => {
      // Get the item price and quantity
      const itemPrice = item.price;
      const itemQuantity = item.quantity || 1;

      // Get GST percentage from product data
      let gstPercent = 0;

      if (item.product && typeof item.product === "object") {
        // If product is populated object
        gstPercent = item.product.gst || 0;
      } else if (item.gst !== undefined) {
        // If GST is directly on the item
        gstPercent = item.gst;
      }

      // Calculate GST amount: (price * gst_percentage / 100) * quantity
      const gstAmount = ((itemPrice * gstPercent) / 100) * itemQuantity;

      return sum + gstAmount;
    }, 0);
  };

  const getShipping = () => 20.0;
  const getGrandTotal = (items) =>
    getSubtotal(items) +
    getTotalGST(items) +
    getShipping() +
    (cart.handlingFee || 0);

  // Get handling fee for a specific item
  const getItemHandlingFee = (item) => {
    if (
      item.product &&
      typeof item.product === "object" &&
      item.product.categoryId
    ) {
      return handlingFees[item.product.categoryId] || 0;
    }
    return 0;
  };

  // Fetch handling fees for all categories in cart
  const fetchHandlingFees = async (items) => {
    try {
      const categoryIds = [
        ...new Set(
          items
            .map((item) => {
              if (item.product && typeof item.product === "object") {
                return item.product.categoryId;
              }
              return null;
            })
            .filter(Boolean)
        ),
      ];

      const fees = {};
      let totalFee = 0;

      for (const categoryId of categoryIds) {
        try {
          const response =
            await categoriesAPI.getCategoryHandlingFee(categoryId);
          const handlingFee = response?.data?.data?.category?.handlingFee || 0;
          fees[categoryId] = handlingFee;
          totalFee += handlingFee;
        } catch (error) {
          console.error(
            `Failed to fetch handling fee for category ${categoryId}:`,
            error
          );
          fees[categoryId] = 0;
        }
      }

      setHandlingFees(fees);
      setTotalHandlingFee(totalFee);
      return totalFee;
    } catch (error) {
      console.error("Failed to fetch handling fees:", error);
      setHandlingFees({});
      setTotalHandlingFee(0);
      return 0;
    }
  };

  // Fetch cart and addresses on mount/focus
  const fetchCartAndAddresses = async () => {
    setIsLoading(true);

    try {
      let items = [];

      if (routeItems && Array.isArray(routeItems)) {
        items = routeItems;
      } else {
        const cartRes = await cartAPI.getCart();
        const cartData = cartRes?.data?.data?.cart || {};
        items = Array.isArray(cartData.items) ? cartData.items : [];
      }

      // Use route parameters if available (from CartScreen), otherwise calculate
      const subtotal =
        routeSubtotal !== undefined ? routeSubtotal : getSubtotal(items);
      const gst = routeGst !== undefined ? routeGst : getTotalGST(items);
      const platformFee = routePlatformFee !== undefined ? routePlatformFee : 2;
      const shipping =
        routeShipping !== undefined ? routeShipping : getShipping();
      const savings =
        routeSavings !== undefined ? routeSavings : getTotalDiscount(items);

      // Fetch handling fees for the items
      const handlingFeeTotal = await fetchHandlingFees(items);

      console.log("OrderSummaryScreen calculations:", {
        fromRoute: {
          routeSubtotal,
          routeGst,
          routeShipping,
          routePlatformFee,
          routeTotal,
          routeSavings,
        },
        calculated: {
          subtotal,
          gst,
          platformFee,
          shipping,
          savings,
          handlingFeeTotal,
        },
        items: items.length,
        categoryIds: items
          .map((item) => item.product?.categoryId)
          .filter(Boolean),
      });

      // For route parameters, use the total as-is since it already includes all fees
      // For calculated values, add handling fees to the total
      const total =
        routeTotal !== undefined
          ? routeTotal
          : subtotal + gst + shipping + platformFee + handlingFeeTotal;
      setCart({
        items,
        subtotal,
        gst,
        platformFee,
        shipping,
        total,
        savings,
        handlingFee: handlingFeeTotal,
      });

      if (!routeItems) {
        updateCartItems(items);
      }

      const response = await customerAPI.getProfile();
      const addresses = response?.data?.data?.customer?.addresses;
      setAddresses(Array.isArray(addresses) ? addresses : []);
      if (Array.isArray(addresses) && addresses.length > 0) {
        setSelectedAddress(addresses[0]._id);
      }
    } catch (error) {
      console.error("Failed to fetch cart or addresses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCartAndAddresses();
  }, [routeItems]);

  // Recalculate total when handling fees change (only if not using route parameters)
  useEffect(() => {
    if (cart.items.length > 0 && routeTotal === undefined) {
      const newTotal =
        cart.subtotal +
        cart.gst +
        cart.shipping +
        cart.platformFee +
        totalHandlingFee;
      setCart((prev) => ({
        ...prev,
        total: newTotal,
        handlingFee: totalHandlingFee,
      }));
    } else if (cart.items.length > 0 && routeTotal !== undefined) {
      // If using route parameters, just update the handling fee without changing the total
      setCart((prev) => ({ ...prev, handlingFee: totalHandlingFee }));
    }
  }, [totalHandlingFee, routeTotal]);

  useFocusEffect(
    React.useCallback(() => {
      fetchCartAndAddresses();
    }, [routeItems])
  );

  // Create order with payment status
  const createOrderWithPayment = async (paymentResult) => {
    if (!selectedAddress) {
      throw new Error("Please select a shipping address.");
    }
    if (!cart.items || cart.items.length === 0) {
      throw new Error("Your cart is empty.");
    }

    const addressObj = addresses.find((addr) => addr._id === selectedAddress);
    if (!addressObj) {
      throw new Error("Selected address not found.");
    }

    const deliveryAddress = {
      street: addressObj.street,
      city: addressObj.city,
      state: addressObj.state,
      postalCode: addressObj.postalCode,
      country: addressObj.country,
      phone: addressObj.phone || user?.phone || "",
      location: {
        type: "Point",
        coordinates: [0, 0],
      },
    };

    if (!deliveryAddress.phone || deliveryAddress.phone.trim() === "") {
      throw new Error(
        "No phone number found for delivery address. Please edit your address or profile."
      );
    }

    let paymentMethodValue = paymentMethod;
    if (paymentMethod === "Cash on Delivery")
      paymentMethodValue = "cash_on_delivery";
    else if (paymentMethod === "Online Payment") paymentMethodValue = "upi";

    const items = cart.items.map((item) => {
      let productId = null;
      if (item.product && typeof item.product === "object") {
        productId = item.product._id || item.product.id;
      } else if (item.product) {
        productId = item.product;
      } else if (item._id) {
        productId = item._id;
      }

      if (!productId) {
        console.error("Could not find product ID for item:", item);
        throw new Error(
          `Product ID not found for item: ${item.name || "Unknown item"}`
        );
      }

      if (!item.quantity || item.quantity <= 0) {
        console.error("Invalid quantity for item:", item);
        throw new Error(
          `Invalid quantity for item: ${item.name || "Unknown item"}`
        );
      }

      const base = {
        product: productId,
        quantity: item.quantity,
      };

      if (item.variation && item.variation.name && item.variation.value) {
        base.variation = {
          name: item.variation.name,
          value: item.variation.value,
        };
      }

      return base;
    });

    const orderData = {
      deliveryAddress,
      paymentMethod: paymentMethodValue,
      items,
      clearCart: true,
      ...(paymentResult && {
        paymentStatus: "paid",
        transactionId: paymentResult.transactionId,
        paymentDetails: {
          method: paymentResult.paymentMethod,
          amount: paymentResult.amount,
          timestamp: paymentResult.timestamp,
        },
      }),
    };

    const response = await ordersAPI.createOrder(orderData);
    const createdOrderId =
      response?.data?.data?.order?._id || response?.data?.data?._id;
    setOrderId(createdOrderId);

    return response;
  };

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    setPaymentError(null);

    try {
      if (paymentMethod === "Online Payment") {
        // Set default payment method for direct processing
        if (!selectedPayment) {
          setSelectedPayment("razorpay");
        }

        console.log("Processing online payment...");
        const paymentResult = await processDirectPayment();

        // Only create order if payment was actually successful
        if (paymentResult && paymentResult.success) {
          console.log("Payment successful, creating order...");
          await createOrderWithPayment(paymentResult);
          updateCartItems([]);
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            navigation.navigate("Orders");
          }, 3000);
        } else {
          console.log("Payment failed, not creating order");
          throw new Error("Payment was not successful");
        }
      } else {
        // For COD, create order directly
        await createOrderWithPayment();
        updateCartItems([]);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          navigation.navigate("Orders");
        }, 3000);
      }
    } catch (error) {
      console.error("Order processing error:", error);

      // Check if error is due to payment cancellation
      const errorMessage = error.message || "";
      if (
        errorMessage.includes("cancelled by user") ||
        errorMessage.includes("Payment was cancelled")
      ) {
        Alert.alert(
          "Payment Cancelled",
          "You cancelled the payment. Your order has not been placed."
        );
      } else {
        Alert.alert(
          "Order Failed",
          errorMessage ||
            error.response?.data?.message ||
            "An unexpected error occurred. Please try again."
        );
      }
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Process payment directly without modal
  const processDirectPayment = async () => {
    console.log("Starting direct payment processing...");

    // Default to Razorpay for online payments
    const paymentMethod = "razorpay";

    // Check authentication for Razorpay
    if (!user) {
      throw new Error("Please log in to use online payment");
    }

    const userData = user?.customer || user;
    // Email validation removed for online payments
    // Online payments (including UPI, Razorpay, etc.) no longer require email

    try {
      const orderId = `ORDER_${Date.now()}`;

      // Build customer name with proper fallback
      let customerName = "Customer";
      if (userData.firstName && userData.lastName) {
        customerName = `${userData.firstName} ${userData.lastName}`.trim();
      } else if (userData.firstName) {
        customerName = userData.firstName;
      } else if (userData.lastName) {
        customerName = userData.lastName;
      } else if (userData.email) {
        // Use email prefix as name if no name is available
        customerName = userData.email.split("@")[0];
      }

      const options = {
        customerName: customerName,
        customerEmail: userData.email,
        customerPhone: userData.phone || "",
        description: `Payment for FarmFerry order`,
        prefill: {
          name: customerName,
          email: userData.email,
          contact: userData.phone || "",
        },
        notes: {
          order_id: orderId,
          customer_id: userData._id || "unknown",
        },
      };

      console.log("Direct payment processing:", {
        method: paymentMethod,
        amount: cart.total,
        orderId: orderId,
        options: options,
      });

      const paymentResult = await PaymentService.processPayment(
        paymentMethod,
        cart.total,
        orderId,
        options
      );

      console.log("Direct payment result:", paymentResult);

      if (paymentResult && paymentResult.success) {
        return paymentResult;
      } else {
        throw new Error("Payment was not successful");
      }
    } catch (error) {
      console.error("Direct payment failed:", error);
      throw new Error(error.message || "Payment failed. Please try again.");
    }
  };

  const handlePayment = async () => {
    if (!selectedPayment) {
      Alert.alert("Error", "Please select a payment method");
      return;
    }

    if (selectedPayment === "upi_id" && !customUpiId.trim()) {
      Alert.alert("Error", "Please enter a valid UPI ID");
      return;
    }

    // Check authentication for Razorpay
    if (
      (selectedPayment === "razorpay" || selectedPayment === "razorpay_web") &&
      !user
    ) {
      Alert.alert(
        "Authentication Required",
        "Please log in to use Razorpay payment"
      );
      return;
    }

    const userData = user?.customer || user;
    // Email validation removed for all online payments
    // Users can now proceed with any payment method without email requirement

    setIsPaying(true);
    setPaymentError(null);

    try {
      const orderId = `ORDER_${Date.now()}`;
      let options = {};

      if (selectedPayment === "upi_id") {
        options = { upiId: customUpiId.trim() };
      } else if (
        selectedPayment === "razorpay" ||
        selectedPayment === "razorpay_web"
      ) {
        // Extract user data from nested customer object
        const userData = user?.customer || user;

        // Debug user data
        console.log("User data for Razorpay:", {
          user: user,
          userData: userData,
          firstName: userData?.firstName,
          lastName: userData?.lastName,
          email: userData?.email,
          phone: userData?.phone,
          _id: userData?._id,
          isAuthenticated: user ? true : false,
        });

        // Check if user is authenticated and has required data
        if (!user) {
          throw new Error("Please log in to use Razorpay payment");
        }

        // Email validation removed for all online payments
        // Razorpay payments no longer require email

        // Build customer name with proper fallback
        let customerName = "Customer";
        if (userData.firstName && userData.lastName) {
          customerName = `${userData.firstName} ${userData.lastName}`.trim();
        } else if (userData.firstName) {
          customerName = userData.firstName;
        } else if (userData.lastName) {
          customerName = userData.lastName;
        } else if (userData.email) {
          // Use email prefix as name if no name is available
          customerName = userData.email.split("@")[0];
        }

        options = {
          customerName: customerName,
          customerEmail: userData.email,
          customerPhone: userData.phone || "",
          description: `Payment for FarmFerry order`,
          prefill: {
            name: customerName,
            email: userData.email,
            contact: userData.phone || "",
          },
          notes: {
            order_id: orderId,
            customer_id: userData._id || "unknown",
          },
        };

        console.log("Razorpay options prepared:", options);
      }

      console.log("Processing payment:", {
        method: selectedPayment,
        amount: cart.total,
        orderId: orderId,
        options: options,
      });

      const paymentResult = await PaymentService.processPayment(
        selectedPayment,
        cart.total,
        orderId,
        options
      );

      console.log("Payment result:", paymentResult);

      if (paymentResult && paymentResult.success) {
        await createOrderWithPayment(paymentResult);
        updateCartItems([]);
        setPaymentModalVisible(false);

        navigation.navigate("PaymentStatus", {
          paymentMethod: selectedPayment,
          amount: cart.total,
          orderId: orderId,
          transactionId: paymentResult.transactionId,
          onPaymentComplete: () => {
            setShowSuccess(true);
            setTimeout(() => {
              setShowSuccess(false);
              navigation.navigate("Orders");
            }, 3000);
          },
          onPaymentFailed: (error) => {
            setPaymentError(error);
            Alert.alert("Payment Failed", error);
          },
        });
      } else {
        throw new Error("Payment was not successful");
      }
    } catch (error) {
      setPaymentError(error.message || "Payment failed. Please try again.");
      Alert.alert(
        "Payment Failed",
        error.message || "Payment was not successful. Please try again."
      );
    } finally {
      setIsPaying(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await customerAPI.deleteAddress(addressId);
              fetchCartAndAddresses();
              Alert.alert("Deleted", "Address deleted successfully.");
            } catch (error) {
              Alert.alert(
                "Error",
                error.response?.data?.message || "Failed to delete address."
              );
            }
          },
        },
      ]
    );
  };

  const RadioButton = ({ selected, color = "#059669" }) => (
    <View
      className={`w-5 h-5 rounded-full border-2 items-center justify-center ${selected ? "border-green-600 bg-green-100" : "border-gray-300"}`}
      style={
        selected ? { borderColor: color, backgroundColor: `${color}20` } : {}
      }
    >
      {selected ? (
        <View
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      ) : null}
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-lg mb-2">Your cart is empty.</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Text className="text-green-600 font-semibold">Go Shopping</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!addresses || addresses.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: responsiveValue(16, 24),
            paddingTop: responsiveValue(16, 24),
          }}
        >
          {/* Welcome Message for New Users */}
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <Text
              className="text-lg font-semibold mb-2"
              style={{ fontSize: responsiveValue(16, 18) }}
            >
              Welcome! Let's set up your delivery address
            </Text>
            <Text
              className="text-gray-600 mb-3"
              style={{ fontSize: responsiveValue(14, 16) }}
            >
              Use the map below to select your location and add your delivery address.
            </Text>
          </View>

          {/* Map View for New Users */}
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <Text
              className="text-lg font-semibold mb-2"
              style={{ fontSize: responsiveValue(16, 18) }}
            >
              Your Location
            </Text>

            {locationError && (
              <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-2">
                <Text
                  className="text-yellow-700 text-xs"
                  style={{ fontSize: responsiveValue(11, 13) }}
                >
                  {locationError}
                </Text>
              </View>
            )}

            <View style={{ height: 220, borderRadius: 12, overflow: "hidden" }}>
              {isLoadingLocation ? (
                <View className="flex-1 justify-center items-center bg-gray-100">
                  <ActivityIndicator size="large" color="#059669" />
                  <Text
                    className="text-gray-500 mt-2"
                    style={{ fontSize: responsiveValue(13, 15) }}
                  >
                    Getting your location...
                  </Text>
                </View>
              ) : region ? (
                <MapView
                  style={{ flex: 1 }}
                  initialRegion={region}
                  showsUserLocation={true}
                  showsMyLocationButton={true}
                  showsCompass={true}
                  showsScale={true}
                  zoomEnabled={true}
                  scrollEnabled={true}
                  rotateEnabled={true}
                  pitchEnabled={true}
                  mapType="standard"
                  onMapReady={() => console.log("Map is ready")}
                  onRegionChangeComplete={setRegion}
                >
                  {location && (
                    <Marker
                      coordinate={location}
                      title="Your Location"
                      description="Your current location"
                      pinColor="#059669"
                      draggable={true}
                      onDragEnd={(e) => {
                        const newCoords = e.nativeEvent.coordinate;
                        setLocation(newCoords);
                        setRegion({
                          ...newCoords,
                          latitudeDelta: 0.02,
                          longitudeDelta: 0.02,
                        });
                      }}
                    />
                  )}
                </MapView>
              ) : (
                <View className="flex-1 justify-center items-center bg-gray-100">
                  <Text
                    className="text-gray-500"
                    style={{ fontSize: responsiveValue(13, 15) }}
                  >
                    Map not available
                  </Text>
                </View>
              )}
            </View>

            {mapError && (
              <View className="bg-red-50 border border-red-200 rounded-lg p-2 mt-2">
                <Text
                  className="text-red-700 text-xs"
                  style={{ fontSize: responsiveValue(11, 13) }}
                >
                  {mapError}
                </Text>
              </View>
            )}

            {/* Location Coordinates */}
            {location && (
              <View className="mt-2 p-2 bg-gray-50 rounded-lg">
                <Text
                  className="text-xs text-gray-600"
                  style={{ fontSize: responsiveValue(10, 12) }}
                >
                  Latitude: {location.latitude.toFixed(6)}
                </Text>
                <Text
                  className="text-xs text-gray-600"
                  style={{ fontSize: responsiveValue(10, 12) }}
                >
                  Longitude: {location.longitude.toFixed(6)}
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={async () => {
                if (location) {
                  try {
                    // Get address from coordinates using reverse geocoding
                    const result = await Location.reverseGeocodeAsync(location, {
                      useGoogleMaps: true,
                    });

                    let suggestedAddress = "";
                    if (result && result.length > 0) {
                      const addr = result[0];
                      const addressParts = [];

                      // Build address string
                      if (addr.streetNumber) addressParts.push(addr.streetNumber);
                      if (addr.street) addressParts.push(addr.street);
                      if (addr.district && addr.district !== addr.city)
                        addressParts.push(addr.district);
                      if (addr.city) addressParts.push(addr.city);
                      if (addr.region) addressParts.push(addr.region);
                      if (addr.postalCode) addressParts.push(addr.postalCode);
                      if (addr.country && addr.country !== "India")
                        addressParts.push(addr.country);

                      suggestedAddress = addressParts.filter(Boolean).join(", ");
                    }

                    navigation.navigate("AddAddress", {
                      latitude: location.latitude,
                      longitude: location.longitude,
                      suggestedAddress:
                        suggestedAddress ||
                        `Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
                    });
                  } catch (error) {
                    console.error("Error getting address:", error);
                    // Fallback to coordinates
                    navigation.navigate("AddAddress", {
                      latitude: location.latitude,
                      longitude: location.longitude,
                      suggestedAddress: `Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
                    });
                  }
                } else {
                  Alert.alert(
                    "Location Not Available",
                    "Please wait for your location to load or enable location services."
                  );
                }
              }}
              className="mt-3 bg-green-600 py-3 rounded-xl"
            >
              <Text
                className="text-white text-center font-semibold"
                style={{ fontSize: responsiveValue(14, 16) }}
              >
                Add Address from Current Location
              </Text>
            </TouchableOpacity>
          </View>

          {/* Alternative Option */}
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <Text
              className="text-lg font-semibold mb-2"
              style={{ fontSize: responsiveValue(16, 18) }}
            >
              Or Add Address Manually
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("AddAddress")}
              className="bg-gray-100 py-3 rounded-xl"
            >
              <Text
                className="text-gray-700 text-center font-semibold"
                style={{ fontSize: responsiveValue(14, 16) }}
              >
                Enter Address Details
              </Text>
            </TouchableOpacity>
          </View>

          {/* Order Summary for New Users */}
          {cart.items && cart.items.length > 0 && (
            <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <View className="flex-row justify-between items-center mb-2">
                <Text
                  className="text-lg font-semibold"
                  style={{ fontSize: responsiveValue(16, 18) }}
                >
                  Order Summary
                </Text>
                {routeItems && (
                  <View className="bg-green-100 px-2 py-1 rounded-full">
                    <Text
                      className="text-xs font-medium text-green-700"
                      style={{ fontSize: responsiveValue(10, 12) }}
                    >
                      Buy Now
                    </Text>
                  </View>
                )}
              </View>
              {cart.items.map((item) => (
                <View
                  key={item.product?._id || item.product?.id || item.product}
                  className="flex-row justify-between items-center mb-2"
                  style={{ minHeight: responsiveValue(30, 36) }}
                >
                  <Text
                    className="flex-1"
                    style={{ fontSize: responsiveValue(13, 15) }}
                  >
                    {item.product?.name || item.name} x{item.quantity}
                  </Text>
                  <Text style={{ fontSize: responsiveValue(13, 15) }}>
                    ₹
                    {(item.product?.price
                      ? item.product.price * item.quantity
                      : item.price * item.quantity
                    ).toFixed(2)}
                  </Text>
                </View>
              ))}
              <View className="border-t border-gray-200 mt-2 pt-2">
                <View className="flex-row justify-between items-center mb-1">
                  <Text style={{ fontSize: responsiveValue(13, 15) }}>
                    Subtotal
                  </Text>
                  <Text style={{ fontSize: responsiveValue(13, 15) }}>
                    ₹{cart.subtotal.toFixed(2)}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center mb-1">
                  <Text style={{ fontSize: responsiveValue(13, 15) }}>
                    GST
                  </Text>
                  <Text style={{ fontSize: responsiveValue(13, 15) }}>
                    ₹{cart.gst.toFixed(2)}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center mb-1">
                  <Text style={{ fontSize: responsiveValue(13, 15) }}>
                    Platform Fee
                  </Text>
                  <Text style={{ fontSize: responsiveValue(13, 15) }}>
                    ₹{cart.platformFee.toFixed(2)}
                  </Text>
                </View>
                {totalHandlingFee > 0 && (
                  <View className="flex-row justify-between items-center mb-1">
                    <Text style={{ fontSize: responsiveValue(13, 15) }}>
                      Handling Fee
                    </Text>
                    <Text style={{ fontSize: responsiveValue(13, 15) }}>
                      ₹{totalHandlingFee.toFixed(2)}
                    </Text>
                  </View>
                )}
                <View className="flex-row justify-between items-center mb-1">
                  <Text style={{ fontSize: responsiveValue(13, 15) }}>
                    Shipping
                  </Text>
                  <Text style={{ fontSize: responsiveValue(13, 15) }}>
                    ₹{cart.shipping.toFixed(2)}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center font-bold">
                  <Text
                    className="font-bold"
                    style={{ fontSize: responsiveValue(14, 16) }}
                  >
                    Total
                  </Text>
                  <Text
                    className="font-bold"
                    style={{ fontSize: responsiveValue(14, 16) }}
                  >
                    ₹{cart.total.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: responsiveValue(16, 24),
          paddingTop: responsiveValue(16, 24),
        }}
      >
        {/* Shipping Address */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <Text
            className="text-lg font-semibold mb-2"
            style={{ fontSize: responsiveValue(16, 18) }}
          >
            Shipping Address
          </Text>
          {(Array.isArray(addresses) ? addresses : []).map((address) => (
            <View
              key={address._id}
              className={`border p-4 rounded-lg mb-2 ${selectedAddress === address._id ? "border-green-500 bg-green-50" : "border-gray-200"}`}
              style={{ minHeight: responsiveValue(100, 120) }}
            >
              <TouchableOpacity
                className="absolute top-2 right-2 z-10"
                onPress={() => handleDeleteAddress(address._id)}
                disabled={addresses.length <= 1}
                style={{ opacity: addresses.length <= 1 ? 0.4 : 1 }}
              >
                <Trash2 size={responsiveValue(16, 18)} color="#ef4444" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSelectedAddress(address._id)}
                className="flex-1"
                activeOpacity={0.8}
              >
                <View className="flex-row justify-between">
                  <Text
                    className="font-semibold"
                    style={{ fontSize: responsiveValue(14, 16) }}
                  >
                    {user ? user.name : ""}
                  </Text>
                </View>
                <Text style={{ fontSize: responsiveValue(13, 14) }}>
                  {address.street}, {address.city}
                </Text>
                <Text style={{ fontSize: responsiveValue(13, 14) }}>
                  {address.state}, {address.postalCode}
                </Text>
                <Text style={{ fontSize: responsiveValue(13, 14) }}>
                  {address.country}
                </Text>
                <Text
                  className="text-xs text-gray-500 mt-1"
                  style={{ fontSize: responsiveValue(11, 12) }}
                >
                  {address.phone && address.phone.trim() !== ""
                    ? address.phone
                    : user?.phone && user.phone.trim() !== ""
                      ? `${user.phone} (from profile)`
                      : "No phone number"}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            onPress={() => navigation.navigate("AddAddress")}
            className="mt-2"
          >
            <Text
              className="text-green-600 font-semibold"
              style={{ fontSize: responsiveValue(14, 16) }}
            >
              Add New Address
            </Text>
          </TouchableOpacity>
        </View>

        {/* Map View */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <Text
            className="text-lg font-semibold mb-2"
            style={{ fontSize: responsiveValue(16, 18) }}
          >
            Your Location
          </Text>

          {locationError && (
            <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-2">
              <Text
                className="text-yellow-700 text-xs"
                style={{ fontSize: responsiveValue(11, 13) }}
              >
                {locationError}
              </Text>
            </View>
          )}

          <View style={{ height: 220, borderRadius: 12, overflow: "hidden" }}>
            {isLoadingLocation ? (
              <View className="flex-1 justify-center items-center bg-gray-100">
                <ActivityIndicator size="large" color="#059669" />
                <Text
                  className="text-gray-500 mt-2"
                  style={{ fontSize: responsiveValue(13, 15) }}
                >
                  Getting your location...
                </Text>
              </View>
            ) : region ? (
              <MapView
                style={{ flex: 1 }}
                initialRegion={region}
                showsUserLocation={true}
                showsMyLocationButton={true}
                showsCompass={true}
                showsScale={true}
                zoomEnabled={true}
                scrollEnabled={true}
                rotateEnabled={true}
                pitchEnabled={true}
                mapType="standard"
                onMapReady={() => console.log("Map is ready")}
                onRegionChangeComplete={setRegion}
              >
                {location && (
                  <Marker
                    coordinate={location}
                    title="Your Location"
                    description="Your current location"
                    pinColor="#059669"
                    draggable={true}
                    onDragEnd={(e) => {
                      const newCoords = e.nativeEvent.coordinate;
                      setLocation(newCoords);
                      setRegion({
                        ...newCoords,
                        latitudeDelta: 0.02,
                        longitudeDelta: 0.02,
                      });
                    }}
                  />
                )}
              </MapView>
            ) : (
              <View className="flex-1 justify-center items-center bg-gray-100">
                <Text
                  className="text-gray-500"
                  style={{ fontSize: responsiveValue(13, 15) }}
                >
                  Map not available
                </Text>
              </View>
            )}
          </View>

          {mapError && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-2 mt-2">
              <Text
                className="text-red-700 text-xs"
                style={{ fontSize: responsiveValue(11, 13) }}
              >
                {mapError}
              </Text>
            </View>
          )}

          {/* Location Coordinates */}
          {location && (
            <View className="mt-2 p-2 bg-gray-50 rounded-lg">
              <Text
                className="text-xs text-gray-600"
                style={{ fontSize: responsiveValue(10, 12) }}
              >
                Latitude: {location.latitude.toFixed(6)}
              </Text>
              <Text
                className="text-xs text-gray-600"
                style={{ fontSize: responsiveValue(10, 12) }}
              >
                Longitude: {location.longitude.toFixed(6)}
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={async () => {
              if (location) {
                try {
                  // Get address from coordinates using reverse geocoding
                  const result = await Location.reverseGeocodeAsync(location, {
                    useGoogleMaps: true,
                  });

                  let suggestedAddress = "";
                  if (result && result.length > 0) {
                    const addr = result[0];
                    const addressParts = [];

                    // Build address string
                    if (addr.streetNumber) addressParts.push(addr.streetNumber);
                    if (addr.street) addressParts.push(addr.street);
                    if (addr.district && addr.district !== addr.city)
                      addressParts.push(addr.district);
                    if (addr.city) addressParts.push(addr.city);
                    if (addr.region) addressParts.push(addr.region);
                    if (addr.postalCode) addressParts.push(addr.postalCode);
                    if (addr.country && addr.country !== "India")
                      addressParts.push(addr.country);

                    suggestedAddress = addressParts.filter(Boolean).join(", ");
                  }

                  navigation.navigate("AddAddress", {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    suggestedAddress:
                      suggestedAddress ||
                      `Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
                  });
                } catch (error) {
                  console.error("Error getting address:", error);
                  // Fallback to coordinates
                  navigation.navigate("AddAddress", {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    suggestedAddress: `Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
                  });
                }
              } else {
                Alert.alert(
                  "Location Not Available",
                  "Please wait for your location to load or enable location services."
                );
              }
            }}
            className="mt-3 bg-green-600 py-3 rounded-xl"
          >
            <Text
              className="text-white text-center font-semibold"
              style={{ fontSize: responsiveValue(14, 16) }}
            >
              Add Address from Current Location
            </Text>
          </TouchableOpacity>
        </View>

        {/* Payment Method */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <Text
            className="text-lg font-semibold mb-2"
            style={{ fontSize: responsiveValue(16, 18) }}
          >
            Payment Method
          </Text>
          <TouchableOpacity
            className={`border p-4 rounded-lg flex-row justify-between items-center ${paymentMethod === "Cash on Delivery" ? "border-green-500 bg-green-50" : "border-gray-200"}`}
            onPress={() => {
              setPaymentMethod("Cash on Delivery");
              setShowPaymentOptions(false);
              setPaymentModalVisible(false);
            }}
            style={{ minHeight: responsiveValue(60, 70) }}
          >
            <View className="flex-row items-center">
              <CreditCard size={responsiveValue(20, 24)} color="#6b7280" />
              <Text
                className="ml-4"
                style={{ fontSize: responsiveValue(14, 16) }}
              >
                Cash on Delivery (COD)
              </Text>
            </View>
            {paymentMethod === "Cash on Delivery" && (
              <CheckCircle size={responsiveValue(18, 20)} color="#059669" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            className={`border p-4 rounded-lg flex-row justify-between items-center mt-2 ${paymentMethod === "Online Payment" ? "border-green-500 bg-green-50" : "border-gray-200"}`}
            onPress={() => {
              setPaymentMethod("Online Payment");
              setShowPaymentOptions(false);
              setSelectedPayment("razorpay");
            }}
            style={{ minHeight: responsiveValue(60, 70) }}
          >
            <View className="flex-row items-center">
              <CreditCard size={responsiveValue(20, 24)} color="#6b7280" />
              <Text
                className="ml-4"
                style={{ fontSize: responsiveValue(14, 16) }}
              >
                Online Payment
              </Text>
            </View>
            {paymentMethod === "Online Payment" && (
              <CheckCircle size={responsiveValue(18, 20)} color="#059669" />
            )}
          </TouchableOpacity>
        </View>

        {/* Order Summary */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <View className="flex-row justify-between items-center mb-2">
            <Text
              className="text-lg font-semibold"
              style={{ fontSize: responsiveValue(16, 18) }}
            >
              Order Summary
            </Text>
            {routeItems && (
              <View className="bg-green-100 px-2 py-1 rounded-full">
                <Text
                  className="text-xs font-medium text-green-700"
                  style={{ fontSize: responsiveValue(10, 12) }}
                >
                  Buy Now
                </Text>
              </View>
            )}
          </View>
          {cart.items.map((item) => (
            <View
              key={item.product?._id || item.product?.id || item.product}
              className="flex-row justify-between items-center mb-2"
              style={{ minHeight: responsiveValue(30, 36) }}
            >
              <Text
                className="flex-1"
                style={{ fontSize: responsiveValue(13, 15) }}
              >
                {item.product?.name || item.name} x{item.quantity}
              </Text>
              <Text style={{ fontSize: responsiveValue(13, 15) }}>
                ₹
                {(item.product?.price
                  ? item.product.price * item.quantity
                  : item.price * item.quantity
                ).toFixed(2)}
              </Text>
            </View>
          ))}
          <View className="border-t border-gray-200 mt-2 pt-2">
            <View className="flex-row justify-between items-center mb-1">
              <Text style={{ fontSize: responsiveValue(13, 15) }}>
                Subtotal
              </Text>
              <Text style={{ fontSize: responsiveValue(13, 15) }}>
                ₹{cart.subtotal.toFixed(2)}
              </Text>
            </View>
            <View className="flex-row justify-between items-center mb-1">
              <Text style={{ fontSize: responsiveValue(13, 15) }}>
                GST
                {(() => {
                  const gstRates = [
                    ...new Set(
                      cart.items.map((item) => {
                        if (item.product && typeof item.product === "object") {
                          return item.product.gst || 0;
                        } else if (item.gst !== undefined) {
                          return item.gst;
                        }
                        return 5; // default
                      })
                    ),
                  ];

                  if (gstRates.length === 1) {
                    return `(${gstRates[0]}%)`;
                  } else if (gstRates.length > 1) {
                    const minRate = Math.min(...gstRates);
                    const maxRate = Math.max(...gstRates);
                    return minRate === maxRate
                      ? `(${minRate}%)`
                      : `(${minRate}%-${maxRate}%)`;
                  }
                  return "";
                })()}
              </Text>
              <Text style={{ fontSize: responsiveValue(13, 15) }}>
                ₹{cart.gst.toFixed(2)}
              </Text>
            </View>
            <View className="flex-row justify-between items-center mb-1">
              <Text style={{ fontSize: responsiveValue(13, 15) }}>
                Platform Fee
              </Text>
              <Text style={{ fontSize: responsiveValue(13, 15) }}>
                ₹{cart.platformFee.toFixed(2)}
              </Text>
            </View>
            {totalHandlingFee > 0 && (
              <View className="flex-row justify-between items-center mb-1">
                <Text style={{ fontSize: responsiveValue(13, 15) }}>
                  Handling Fee
                </Text>
                <Text style={{ fontSize: responsiveValue(13, 15) }}>
                  ₹{totalHandlingFee.toFixed(2)}
                </Text>
              </View>
            )}
            <View className="flex-row justify-between items-center mb-1">
              <Text style={{ fontSize: responsiveValue(13, 15) }}>
                Shipping
              </Text>
              <Text style={{ fontSize: responsiveValue(13, 15) }}>
                ₹{cart.shipping.toFixed(2)}
              </Text>
            </View>
            <View className="flex-row justify-between items-center font-bold">
              <Text
                className="font-bold"
                style={{ fontSize: responsiveValue(14, 16) }}
              >
                Total
              </Text>
              <Text
                className="font-bold"
                style={{ fontSize: responsiveValue(14, 16) }}
              >
                ₹{cart.total.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      <View
        className="bg-white border-t border-gray-200 p-4"
        style={{ paddingHorizontal: responsiveValue(16, 24) }}
      >
        <TouchableOpacity
          onPress={handlePlaceOrder}
          disabled={isPlacingOrder}
          style={{ borderRadius: 12, overflow: "hidden" }}
        >
          <LinearGradient
            colors={["#10b981", "#059669"]}
            className="py-4 flex-row items-center justify-center rounded-xl"
          >
            <CheckCircle
              width={responsiveValue(16, 18)}
              height={responsiveValue(16, 18)}
              color="#fff"
            />
            <Text
              className="text-white font-semibold text-sm ml-1.5"
              style={{ fontSize: responsiveValue(14, 16) }}
            >
              {isPlacingOrder
                ? "Placing Order..."
                : paymentMethod === "Online Payment"
                  ? "Pay & Place Order"
                  : `Place Order - ₹${cart.total.toFixed(2)}`}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Payment Options Modal */}
      <Modal
        visible={paymentModalVisible}
        onClose={() => setPaymentModalVisible(false)}
        title="Payment Options"
        size="full"
        showCloseButton
        closeOnBackdropPress
        style="pb-0"
      >
        {/* Authentication Status Banner */}
        {!isAuthenticated && (
          <View className="bg-red-50 border-b border-red-200 p-3">
            <Text className="text-red-700 text-sm text-center mb-2">
              🔐 Please log in to use payment options
            </Text>
            <TouchableOpacity
              className="bg-red-600 py-2 px-4 rounded-lg"
              onPress={() => {
                setPaymentModalVisible(false);
                navigation.navigate("Login");
              }}
            >
              <Text className="text-white text-sm text-center font-medium">
                Go to Login
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: responsiveValue(16, 24),
            paddingBottom: responsiveValue(100, 120),
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Amount Summary */}
          <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
            <View className="flex-row justify-between items-center mb-2">
              <Text
                className="text-gray-600"
                style={{ fontSize: responsiveValue(13, 15) }}
              >
                Total Amount
              </Text>
              <Text
                className="text-gray-400 line-through"
                style={{ fontSize: responsiveValue(13, 15) }}
              >
                ₹{(cart.total + 19).toFixed(0)}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text
                className="text-2xl font-bold text-green-700"
                style={{ fontSize: responsiveValue(20, 24) }}
              >
                ₹{cart.total.toFixed(0)}
              </Text>
              <View className="bg-green-100 px-2 py-1 rounded-full">
                <Text
                  className="text-green-700 text-xs font-medium"
                  style={{ fontSize: responsiveValue(10, 12) }}
                >
                  Save ₹19
                </Text>
              </View>
            </View>
          </View>

          {/* Payment Error Display */}
          {paymentError && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <Text
                className="text-red-700 text-sm"
                style={{ fontSize: responsiveValue(12, 14) }}
              >
                {paymentError}
              </Text>
            </View>
          )}

          {/* Offers Banner */}
          <TouchableOpacity
            className="bg-amber-50 rounded-lg p-3 mb-4 border border-amber-200 flex-row justify-between items-center"
            onPress={() => {}}
          >
            <Text
              className="text-amber-800 font-medium"
              style={{ fontSize: responsiveValue(13, 15) }}
            >
              Bank offers available
            </Text>
            <Ionicons
              name="chevron-forward"
              size={responsiveValue(16, 18)}
              color="#d97706"
            />
          </TouchableOpacity>

          {/* Payment Options */}
          <View className="space-y-3">
            {/* UPI */}
            <View className="bg-white rounded-xl p-3 border border-gray-200">
              <TouchableOpacity
                className="flex-row justify-between items-center"
                onPress={() =>
                  setExpandedSection(expandedSection === "upi" ? "" : "upi")
                }
              >
                <View className="flex-row items-center">
                  <View className="bg-green-100 p-2 rounded-full mr-3">
                    <MaterialCommunityIcons
                      name="bank"
                      size={responsiveValue(16, 18)}
                      color="#059669"
                    />
                  </View>
                  <Text
                    className="font-medium"
                    style={{ fontSize: responsiveValue(14, 16) }}
                  >
                    UPI Payment
                  </Text>
                </View>
                <Ionicons
                  name={
                    expandedSection === "upi" ? "chevron-up" : "chevron-down"
                  }
                  size={responsiveValue(16, 18)}
                  color="#6b7280"
                />
              </TouchableOpacity>

              {expandedSection === "upi" && (
                <View className="mt-3 space-y-2">
                  <PaymentOption
                    icon={
                      <FontAwesome5
                        name="google-pay"
                        size={responsiveValue(18, 20)}
                        color="#34A853"
                      />
                    }
                    title="Google Pay"
                    selected={selectedPayment === "gpay"}
                    onPress={() => setSelectedPayment("gpay")}
                  />
                  <PaymentOption
                    icon={
                      <MaterialCommunityIcons
                        name="phone"
                        size={responsiveValue(18, 20)}
                        color="#5F259F"
                      />
                    }
                    title="PhonePe"
                    selected={selectedPayment === "phonepe"}
                    onPress={() => setSelectedPayment("phonepe")}
                  />
                  <PaymentOption
                    icon={
                      <MaterialCommunityIcons
                        name="account-plus-outline"
                        size={responsiveValue(18, 20)}
                        color="#059669"
                      />
                    }
                    title="Enter UPI ID"
                    selected={selectedPayment === "upi_id"}
                    onPress={() => setSelectedPayment("upi_id")}
                  />

                  {selectedPayment === "upi_id" && (
                    <View className="mt-2 bg-gray-50 rounded-lg p-3">
                      <TextInput
                        value={customUpiId}
                        onChangeText={setCustomUpiId}
                        placeholder="yourname@upi"
                        className="border-b border-gray-200 pb-1"
                        autoCapitalize="none"
                        style={{ fontSize: responsiveValue(14, 16) }}
                      />
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Razorpay */}
            <View className="bg-white rounded-xl p-3 border border-gray-200">
              <TouchableOpacity
                className="flex-row justify-between items-center"
                onPress={() =>
                  setExpandedSection(
                    expandedSection === "razorpay" ? "" : "razorpay"
                  )
                }
              >
                <View className="flex-row items-center">
                  <View className="bg-blue-100 p-2 rounded-full mr-3">
                    <MaterialCommunityIcons
                      name="credit-card"
                      size={responsiveValue(16, 18)}
                      color="#3399CC"
                    />
                  </View>
                  <Text
                    className="font-medium"
                    style={{ fontSize: responsiveValue(14, 16) }}
                  >
                    Razorpay
                  </Text>
                </View>
                <Ionicons
                  name={
                    expandedSection === "razorpay"
                      ? "chevron-up"
                      : "chevron-down"
                  }
                  size={responsiveValue(16, 18)}
                  color="#6b7280"
                />
              </TouchableOpacity>

              {expandedSection === "razorpay" && (
                <View className="mt-3">
                  {/* Authentication Status */}
                  {!user ? (
                    <View className="bg-red-50 border border-red-200 rounded-lg p-2 mb-2">
                      <Text className="text-red-700 text-xs">
                        🔐 Please log in to use Razorpay
                      </Text>
                    </View>
                  ) : (
                    <View className="bg-green-50 border border-green-200 rounded-lg p-2 mb-2">
                      <Text className="text-green-700 text-xs">
                        ✅ Ready for Razorpay payment
                      </Text>
                    </View>
                  )}

                  <PaymentOption
                    icon={
                      <MaterialCommunityIcons
                        name="credit-card"
                        size={responsiveValue(18, 20)}
                        color="#3399CC"
                      />
                    }
                    title="Credit/Debit Cards, UPI, Net Banking"
                    selected={selectedPayment === "razorpay"}
                    onPress={() => setSelectedPayment("razorpay")}
                    disabled={!user}
                  />

                  <PaymentOption
                    icon={
                      <MaterialCommunityIcons
                        name="web"
                        size={responsiveValue(18, 20)}
                        color="#059669"
                      />
                    }
                    title="🌐 Razorpay Web (Expo Go Compatible)"
                    subtitle="Opens in browser - Works with Expo Go"
                    selected={selectedPayment === "razorpay_web"}
                    onPress={() => setSelectedPayment("razorpay_web")}
                    disabled={!user || !(user?.customer?.email || user?.email)}
                  />

                  {/* User Info for Payment */}
                  {(user?.customer?.email || user?.email) && (
                    <View className="mt-2 bg-blue-50 rounded-lg p-2">
                      <Text className="text-xs text-blue-600 mb-1">
                        Payment Details:
                      </Text>
                      <Text className="text-xs text-blue-700">
                        Name:{" "}
                        {(() => {
                          const customer = user?.customer || user;
                          return customer?.firstName && customer?.lastName
                            ? `${customer.firstName} ${customer.lastName}`
                            : customer?.firstName ||
                                customer?.lastName ||
                                customer?.email?.split("@")[0];
                        })()}
                      </Text>
                      <Text className="text-xs text-blue-700">
                        Email: {user?.customer?.email || user?.email}
                      </Text>
                      {(user?.customer?.phone || user?.phone) && (
                        <Text className="text-xs text-blue-700">
                          Phone: {user?.customer?.phone || user?.phone}
                        </Text>
                      )}
                    </View>
                  )}

                  {/* Supported Payment Methods */}
                  <View className="mt-2 bg-gray-50 rounded-lg p-2">
                    <Text className="text-xs text-gray-600 mb-1">
                      Supported:
                    </Text>
                    <View className="flex-row flex-wrap">
                      {RazorpayService.getSupportedPaymentMethods().map(
                        (method, index) => (
                          <Text
                            key={index}
                            className="text-xs text-gray-500 mr-2"
                          >
                            • {method.charAt(0).toUpperCase() + method.slice(1)}
                          </Text>
                        )
                      )}
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Wallet */}
            <View className="bg-white rounded-xl p-3 border border-gray-200">
              <TouchableOpacity
                className="flex-row justify-between items-center"
                onPress={() =>
                  setExpandedSection(
                    expandedSection === "wallet" ? "" : "wallet"
                  )
                }
              >
                <View className="flex-row items-center">
                  <View className="bg-purple-100 p-2 rounded-full mr-3">
                    <MaterialCommunityIcons
                      name="wallet"
                      size={responsiveValue(16, 18)}
                      color="#7e22ce"
                    />
                  </View>
                  <Text
                    className="font-medium"
                    style={{ fontSize: responsiveValue(14, 16) }}
                  >
                    Wallet
                  </Text>
                </View>
                <Ionicons
                  name={
                    expandedSection === "wallet" ? "chevron-up" : "chevron-down"
                  }
                  size={responsiveValue(16, 18)}
                  color="#6b7280"
                />
              </TouchableOpacity>

              {expandedSection === "wallet" && (
                <View className="mt-3">
                  <PaymentOption
                    icon={
                      <MaterialCommunityIcons
                        name="wallet-outline"
                        size={responsiveValue(18, 20)}
                        color="#7e22ce"
                      />
                    }
                    title="Wallet Balance"
                    selected={false}
                    disabled
                    comingSoon
                  />
                </View>
              )}
            </View>

            {/* Cards */}
            <View className="bg-white rounded-xl p-3 border border-gray-200">
              <TouchableOpacity
                className="flex-row justify-between items-center"
                onPress={() =>
                  setExpandedSection(expandedSection === "card" ? "" : "card")
                }
              >
                <View className="flex-row items-center">
                  <View className="bg-blue-100 p-2 rounded-full mr-3">
                    <MaterialCommunityIcons
                      name="credit-card-outline"
                      size={responsiveValue(16, 18)}
                      color="#1d4ed8"
                    />
                  </View>
                  <Text
                    className="font-medium"
                    style={{ fontSize: responsiveValue(14, 16) }}
                  >
                    Credit/Debit Card
                  </Text>
                </View>
                <Ionicons
                  name={
                    expandedSection === "card" ? "chevron-up" : "chevron-down"
                  }
                  size={responsiveValue(16, 18)}
                  color="#6b7280"
                />
              </TouchableOpacity>

              {expandedSection === "card" && (
                <View className="mt-3">
                  <PaymentOption
                    icon={
                      <MaterialCommunityIcons
                        name="credit-card"
                        size={responsiveValue(18, 20)}
                        color="#1d4ed8"
                      />
                    }
                    title="Add Card"
                    selected={false}
                    disabled
                    comingSoon
                  />
                </View>
              )}
            </View>
          </View>

          {/* Security Note */}
          <View className="mt-4 flex-row items-center">
            <Ionicons
              name="shield-checkmark"
              size={responsiveValue(14, 16)}
              color="#059669"
            />
            <Text
              className="text-gray-500 text-xs ml-1"
              style={{ fontSize: responsiveValue(11, 13) }}
            >
              Secure and encrypted payments
            </Text>
          </View>
        </ScrollView>

        {/* Payment Button */}
        <View
          className="bg-white p-4 border-t border-gray-200"
          style={{ paddingHorizontal: responsiveValue(16, 24) }}
        >
          <TouchableOpacity
            className={`rounded-lg py-3 items-center ${isPaying || (selectedPayment === "upi_id" && !customUpiId) ? "bg-gray-300" : "bg-green-600"}`}
            onPress={handlePayment}
            disabled={
              isPaying || (selectedPayment === "upi_id" && !customUpiId)
            }
          >
            {isPaying ? (
              <ActivityIndicator
                color="#ffffff"
                size={responsiveValue("small", "large")}
              />
            ) : (
              <Text
                className="text-white font-bold"
                style={{ fontSize: responsiveValue(14, 16) }}
              >
                Pay ₹{cart.total.toFixed(0)}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View
          className="bg-white rounded-3xl p-8 items-center shadow-lg"
          style={{
            width: responsiveValue(280, 320),
            maxWidth: responsiveValue(300, 360),
          }}
        >
          <LottieView
            source={require("../../assets/Payment-Success.json")}
            autoPlay
            loop={false}
            style={{
              width: responsiveValue(120, 150),
              height: responsiveValue(120, 150),
            }}
            resizeMode="cover"
          />
          <Text
            className="text-2xl font-bold text-green-600 mt-2 text-center"
            style={{ fontSize: responsiveValue(20, 24) }}
          >
            Order Placed!
          </Text>
          <Text
            className="text-gray-700 mt-2 text-base text-center font-medium"
            style={{ fontSize: responsiveValue(14, 16) }}
          >
            Your order has been confirmed
          </Text>
          <View className="mt-4 w-full items-center">
            <Text
              className="text-gray-500 text-sm text-center"
              style={{ fontSize: responsiveValue(12, 14) }}
            >
              Thank you for shopping with FarmFerry!
            </Text>
            {orderId && (
              <Text
                className="text-gray-400 text-xs mt-2"
                style={{ fontSize: responsiveValue(10, 12) }}
              >
                Order ID: {orderId}
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Add displayName to help with debugging
OrderSummaryScreen.displayName = "OrderSummaryScreen";

export default OrderSummaryScreen;

// 05-09-2025   --- 15:35

// import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// import { useFocusEffect, useNavigation } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';
// import * as Location from 'expo-location';
// import MapView, { Marker } from 'react-native-maps'; // Updated import
// import LottieView from 'lottie-react-native';
// import { CheckCircle, CreditCard, Trash2 } from 'lucide-react-native';
// import React, { useEffect, useState } from 'react';
// import { ActivityIndicator, Alert, Dimensions, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import Modal from '../components/ui/Modal';
// import { useAppContext } from '../context/AppContext';
// import { useAuth } from '../context/AuthContext';
// import { cartAPI, categoriesAPI, customerAPI, ordersAPI } from '../services/api';
// import PaymentService from '../services/paymentService';
// import RazorpayService from '../services/razorpayService';

// const { width, height } = Dimensions.get('window');

// // Responsive sizing helper
// const responsiveValue = (mobile, tablet) => {
//   return width >= 768 ? tablet : mobile;
// };

// // Reusable PaymentOption component with responsive sizing
// const PaymentOption = ({ icon, title, selected, onPress, disabled, comingSoon }) => (
//   <TouchableOpacity
//     className={`flex-row items-center p-2 rounded-lg ${selected ? 'bg-green-50' : ''}`}
//     onPress={onPress}
//     disabled={disabled}
//     activeOpacity={0.7}
//     style={{ minHeight: responsiveValue(50, 60) }}
//   >
//     <View className="bg-white p-1.5 rounded-lg mr-3">
//       {icon}
//     </View>
//     <Text
//       className={`flex-1 ${disabled ? 'text-gray-400' : 'text-gray-800'}`}
//       style={{ fontSize: responsiveValue(14, 16) }}
//     >
//       {title}
//       {comingSoon && <Text className="text-gray-400 text-xs"> (Coming Soon)</Text>}
//     </Text>
//     {!disabled && (
//       <View className={`w-5 h-5 rounded-full border-2 ${selected ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
//         {selected && <Ionicons name="checkmark" size={14} color="white" />}
//       </View>
//     )}
//   </TouchableOpacity>
// );

// const OrderSummaryScreen = ({ route }) => {
//   const navigation = useNavigation();
//   const { updateCartItems } = useAppContext();
//   const { user, isAuthenticated, refreshUserData } = useAuth();

//   // Debug user authentication status
//   useEffect(() => {
//     // Extract user data from nested customer object
//     const userData = user?.customer || user;

//     console.log('OrderSummaryScreen - User Authentication Status:', {
//       isAuthenticated,
//       user: userData ? {
//         _id: userData._id,
//         firstName: userData.firstName,
//         lastName: userData.lastName,
//         email: userData.email,
//         phone: userData.phone,
//         hasEmail: !!userData.email
//       } : null,
//       fullUserObject: user,
//       userKeys: user ? Object.keys(user) : [],
//       customerData: user?.customer
//     });
//   }, [user, isAuthenticated]);

//   // Location useEffect
//   useEffect(() => {
//     (async () => {
//       try {
//         setIsLoadingLocation(true);
//         setLocationError(null);

//         // Request permission
//         let { status } = await Location.requestForegroundPermissionsAsync();

//         if (status !== 'granted') {
//           setLocationError('Location permission denied. Using default location.');

//           // Set default location (Pune coordinates)
//           const defaultLocation = {
//             latitude: 18.5204,
//             longitude: 73.8567,
//           };

//           setLocation(defaultLocation);
//           setRegion({
//             ...defaultLocation,
//             latitudeDelta: 0.02,
//             longitudeDelta: 0.02,
//           });
//           setIsLoadingLocation(false);
//           return;
//         }

//         // Get current location
//         let currentLocation = await Location.getCurrentPositionAsync({
//           accuracy: Location.Accuracy.High,
//           timeout: 15000, // 15 second timeout
//         });

//         const coords = {
//           latitude: currentLocation.coords.latitude,
//           longitude: currentLocation.coords.longitude,
//         };

//         console.log('Location obtained:', coords);

//         setLocation(coords);
//         setRegion({
//           ...coords,
//           latitudeDelta: 0.02,
//           longitudeDelta: 0.02,
//         });

//       } catch (error) {
//         console.error('Location error:', error);
//         setLocationError('Failed to get location. Using default location.');

//         // Fallback to default location
//         const defaultLocation = {
//           latitude: 18.5204,
//           longitude: 73.8567,
//         };

//         setLocation(defaultLocation);
//         setRegion({
//           ...defaultLocation,
//           latitudeDelta: 0.02,
//           longitudeDelta: 0.02,
//         });
//       } finally {
//         setIsLoadingLocation(false);
//       }
//     })();
//   }, []);

//   const [addresses, setAddresses] = useState([]);
//   const [selectedAddress, setSelectedAddress] = useState(null);
//   const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
//   const [isLoading, setIsLoading] = useState(true);
//   const [isPlacingOrder, setIsPlacingOrder] = useState(false);
//   const [cart, setCart] = useState({ items: [], subtotal: 0, shipping: 0, gst: 0, total: 0, savings: 0, handlingFee: 0, platformFee: 2 });
//   const [handlingFees, setHandlingFees] = useState({});
//   const [totalHandlingFee, setTotalHandlingFee] = useState(0);
//   const [showPaymentOptions, setShowPaymentOptions] = useState(false);
//   const [isPaying, setIsPaying] = useState(false);
//   const [paymentModalVisible, setPaymentModalVisible] = useState(false);
//   const [expandedSection, setExpandedSection] = useState('upi');
//   const [selectedPayment, setSelectedPayment] = useState('gpay');
//   const [customUpiId, setCustomUpiId] = useState('');
//   const [showSuccess, setShowSuccess] = useState(false);
//   const [paymentError, setPaymentError] = useState(null);
//   const [orderId, setOrderId] = useState(null);

//   // Location state
//   const [location, setLocation] = useState(null);
//   const [region, setRegion] = useState(null);
//   const [locationError, setLocationError] = useState(null);
//   const [mapError, setMapError] = useState(null);
//   const [isLoadingLocation, setIsLoadingLocation] = useState(true);

//   // Get items and calculated values from route params (from CartScreen)
//   const routeItems = route?.params?.items;
//   const routeSubtotal = route?.params?.subtotal;
//   const routeGst = route?.params?.gst;
//   const routeShipping = route?.params?.shipping;
//   const routePlatformFee = route?.params?.platformFee;
//   const routeTotal = route?.params?.total;
//   const routeSavings = route?.params?.savings;

//   // GST rate (5%)
//   const GST_RATE = 0.05;

//   // Calculation helpers
//   const getSubtotal = (items) => items.reduce((sum, item) => sum + item.price * item.quantity, 0);
//   const getTotalDiscount = (items) => items.reduce((sum, item) => {
//     if (item.originalPrice) {
//       return sum + (item.originalPrice - item.price) * item.quantity;
//     }
//     return sum;
//   }, 0);
//   //const getTotalGST = (items) => items.reduce((sum, item) => sum + (item.price * GST_RATE) * item.quantity, 0);
//   const getTotalGST = (items) => {
//     return items.reduce((sum, item) => {
//       // Get the item price and quantity
//       const itemPrice = item.price;
//       const itemQuantity = item.quantity || 1;

//       // Get GST percentage from product data
//       // Check multiple possible locations for GST data
//       let gstPercent = 0;

//       if (item.product && typeof item.product === 'object') {
//         // If product is populated object
//         gstPercent = item.product.gst || 0;
//       } else if (item.gst !== undefined) {
//         // If GST is directly on the item
//         gstPercent = item.gst;
//       }

//       // Calculate GST amount: (price * gst_percentage / 100) * quantity
//       const gstAmount = (itemPrice * gstPercent / 100) * itemQuantity;

//       // Debug log to help track GST calculations (remove in production)
//       console.log(`GST calculation for ${item.product?.name || item.name}:`, {
//         price: itemPrice,
//         quantity: itemQuantity,
//         gstPercent: gstPercent,
//         gstAmount: gstAmount
//       });

//       return sum + gstAmount;
//     }, 0);
//   };

//   const getShipping = () => 20.0;
//   const getGrandTotal = (items) => getSubtotal(items) + getTotalGST(items) + getShipping() + (cart.handlingFee || 0);

//   // Get handling fee for a specific item
//   const getItemHandlingFee = (item) => {
//     if (item.product && typeof item.product === 'object' && item.product.categoryId) {
//       return handlingFees[item.product.categoryId] || 0;
//     }
//     return 0;
//   };

//   // Fetch handling fees for all categories in cart
//   const fetchHandlingFees = async (items) => {
//     try {
//       const categoryIds = [...new Set(items.map(item => {
//         if (item.product && typeof item.product === 'object') {
//           return item.product.categoryId;
//         }
//         return null;
//       }).filter(Boolean))];

//       const fees = {};
//       let totalFee = 0;

//       for (const categoryId of categoryIds) {
//         try {
//           const response = await categoriesAPI.getCategoryHandlingFee(categoryId);
//           const handlingFee = response?.data?.data?.category?.handlingFee || 0;
//           fees[categoryId] = handlingFee;
//           totalFee += handlingFee;
//         } catch (error) {
//           console.error(`Failed to fetch handling fee for category ${categoryId}:`, error);
//           fees[categoryId] = 0;
//         }
//       }

//       setHandlingFees(fees);
//       setTotalHandlingFee(totalFee);
//       return totalFee;
//     } catch (error) {
//       console.error('Failed to fetch handling fees:', error);
//       setHandlingFees({});
//       setTotalHandlingFee(0);
//       return 0;
//     }
//   };

//   // Fetch cart and addresses on mount/focus
//   const fetchCartAndAddresses = async () => {
//     setIsLoading(true);

//     try {
//       let items = [];

//       if (routeItems && Array.isArray(routeItems)) {
//         items = routeItems;
//       } else {
//         const cartRes = await cartAPI.getCart();
//         const cartData = cartRes?.data?.data?.cart || {};
//         items = Array.isArray(cartData.items) ? cartData.items : [];
//       }

//       // Use route parameters if available (from CartScreen), otherwise calculate
//       const subtotal = routeSubtotal !== undefined ? routeSubtotal : getSubtotal(items);
//       const gst = routeGst !== undefined ? routeGst : getTotalGST(items);
//       const platformFee = routePlatformFee !== undefined ? routePlatformFee : 2;
//       const shipping = routeShipping !== undefined ? routeShipping : getShipping();
//       const savings = routeSavings !== undefined ? routeSavings : getTotalDiscount(items);

//       // Fetch handling fees for the items
//       const handlingFeeTotal = await fetchHandlingFees(items);

//       console.log('OrderSummaryScreen calculations:', {
//         fromRoute: {
//           routeSubtotal,
//           routeGst,
//           routeShipping,
//           routePlatformFee,
//           routeTotal,
//           routeSavings
//         },
//         calculated: {
//           subtotal,
//           gst,
//           platformFee,
//           shipping,
//           savings,
//           handlingFeeTotal
//         },
//         items: items.length,
//         categoryIds: items.map(item => item.product?.categoryId).filter(Boolean)
//       });

//       // For route parameters, use the total as-is since it already includes all fees
//       // For calculated values, add handling fees to the total
//       const total = routeTotal !== undefined ? routeTotal : (subtotal + gst + shipping + platformFee + handlingFeeTotal);
//       setCart({
//         items,
//         subtotal,
//         gst,
//         platformFee,
//         shipping,
//         total,
//         savings,
//         handlingFee: handlingFeeTotal,
//       });

//       if (!routeItems) {
//         updateCartItems(items);
//       }

//       const response = await customerAPI.getProfile();
//       const addresses = response?.data?.data?.customer?.addresses;
//       setAddresses(Array.isArray(addresses) ? addresses : []);
//       if (Array.isArray(addresses) && addresses.length > 0) {
//         setSelectedAddress(addresses[0]._id);
//       }
//     } catch (error) {
//       console.error('Failed to fetch cart or addresses:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCartAndAddresses();
//   }, [routeItems]);

//   // Recalculate total when handling fees change (only if not using route parameters)
//   useEffect(() => {
//     if (cart.items.length > 0 && routeTotal === undefined) {
//       const newTotal = cart.subtotal + cart.gst + cart.shipping + cart.platformFee + totalHandlingFee;
//       setCart(prev => ({ ...prev, total: newTotal, handlingFee: totalHandlingFee }));
//     } else if (cart.items.length > 0 && routeTotal !== undefined) {
//       // If using route parameters, just update the handling fee without changing the total
//       setCart(prev => ({ ...prev, handlingFee: totalHandlingFee }));
//     }
//   }, [totalHandlingFee, routeTotal]);

//   useFocusEffect(
//     React.useCallback(() => {
//       fetchCartAndAddresses();
//     }, [routeItems])
//   );

//   // Create order with payment status
//   const createOrderWithPayment = async (paymentResult) => {
//     if (!selectedAddress) {
//       throw new Error('Please select a shipping address.');
//     }
//     if (!cart.items || cart.items.length === 0) {
//       throw new Error('Your cart is empty.');
//     }

//     const addressObj = addresses.find(addr => addr._id === selectedAddress);
//     if (!addressObj) {
//       throw new Error('Selected address not found.');
//     }

//     const deliveryAddress = {
//       street: addressObj.street,
//       city: addressObj.city,
//       state: addressObj.state,
//       postalCode: addressObj.postalCode,
//       country: addressObj.country,
//       phone: addressObj.phone || user?.phone || '',
//       location: {
//         type: 'Point',
//         coordinates: [0, 0]
//       }
//     };

//     if (!deliveryAddress.phone || deliveryAddress.phone.trim() === '') {
//       throw new Error('No phone number found for delivery address. Please edit your address or profile.');
//     }

//     let paymentMethodValue = paymentMethod;
//     if (paymentMethod === 'Cash on Delivery') paymentMethodValue = 'cash_on_delivery';
//     else if (paymentMethod === 'Online Payment') paymentMethodValue = 'upi';

//     const items = cart.items.map(item => {
//       let productId = null;
//       if (item.product && typeof item.product === 'object') {
//         productId = item.product._id || item.product.id;
//       } else if (item.product) {
//         productId = item.product;
//       } else if (item._id) {
//         productId = item._id;
//       }

//       if (!productId) {
//         console.error('Could not find product ID for item:', item);
//         throw new Error(`Product ID not found for item: ${item.name || 'Unknown item'}`);
//       }

//       if (!item.quantity || item.quantity <= 0) {
//         console.error('Invalid quantity for item:', item);
//         throw new Error(`Invalid quantity for item: ${item.name || 'Unknown item'}`);
//       }

//       const base = {
//         product: productId,
//         quantity: item.quantity,
//       };

//       if (item.variation && item.variation.name && item.variation.value) {
//         base.variation = {
//           name: item.variation.name,
//           value: item.variation.value,
//         };
//       }

//       return base;
//     });

//     const orderData = {
//       deliveryAddress,
//       paymentMethod: paymentMethodValue,
//       items,
//       clearCart: true,
//       ...(paymentResult && {
//         paymentStatus: 'paid',
//         transactionId: paymentResult.transactionId,
//         paymentDetails: {
//           method: paymentResult.paymentMethod,
//           amount: paymentResult.amount,
//           timestamp: paymentResult.timestamp
//         }
//       })
//     };

//     const response = await ordersAPI.createOrder(orderData);
//     const createdOrderId = response?.data?.data?.order?._id || response?.data?.data?._id;
//     setOrderId(createdOrderId);

//     return response;
//   };

//   const handlePlaceOrder = async () => {
//     setIsPlacingOrder(true);
//     setPaymentError(null);

//     try {
//       if (paymentMethod === 'Online Payment') {
//         // Set default payment method for direct processing
//         if (!selectedPayment) {
//           setSelectedPayment('razorpay');
//         }

//         console.log('Processing online payment...');
//         const paymentResult = await processDirectPayment();

//         // Only create order if payment was actually successful
//         if (paymentResult && paymentResult.success) {
//           console.log('Payment successful, creating order...');
//           await createOrderWithPayment(paymentResult);
//           updateCartItems([]);
//           setShowSuccess(true);
//           setTimeout(() => {
//             setShowSuccess(false);
//             navigation.navigate('Orders');
//           }, 3000);
//         } else {
//           console.log('Payment failed, not creating order');
//           throw new Error('Payment was not successful');
//         }
//       } else {
//         // For COD, create order directly
//         await createOrderWithPayment();
//         updateCartItems([]);
//         setShowSuccess(true);
//         setTimeout(() => {
//           setShowSuccess(false);
//           navigation.navigate('Orders');
//         }, 3000);
//       }
//     } catch (error) {
//       console.error('Order processing error:', error);

//       // Check if error is due to payment cancellation
//       const errorMessage = error.message || '';
//       if (errorMessage.includes('cancelled by user') || errorMessage.includes('Payment was cancelled')) {
//         Alert.alert(
//           'Payment Cancelled',
//           'You cancelled the payment. Your order has not been placed.'
//         );
//       } else {
//         Alert.alert(
//           'Order Failed',
//           errorMessage || error.response?.data?.message || 'An unexpected error occurred. Please try again.'
//         );
//       }
//     } finally {
//       setIsPlacingOrder(false);
//     }
//   };

//   // Process payment directly without modal
//   const processDirectPayment = async () => {
//     console.log('Starting direct payment processing...');

//     // Default to Razorpay for online payments
//     const paymentMethod = 'razorpay';

//     // Check authentication for Razorpay
//     if (!user) {
//       throw new Error('Please log in to use online payment');
//     }

//     const userData = user?.customer || user;
//     if (!userData?.email) {
//       throw new Error('Email is required for online payment. Please update your profile.');
//     }

//     try {
//       const orderId = `ORDER_${Date.now()}`;

//       // Build customer name with proper fallback
//       let customerName = 'Customer';
//       if (userData.firstName && userData.lastName) {
//         customerName = `${userData.firstName} ${userData.lastName}`.trim();
//       } else if (userData.firstName) {
//         customerName = userData.firstName;
//       } else if (userData.lastName) {
//         customerName = userData.lastName;
//       } else if (userData.email) {
//         // Use email prefix as name if no name is available
//         customerName = userData.email.split('@')[0];
//       }

//       const options = {
//         customerName: customerName,
//         customerEmail: userData.email,
//         customerPhone: userData.phone || '',
//         description: `Payment for FarmFerry order`,
//         prefill: {
//           name: customerName,
//           email: userData.email,
//           contact: userData.phone || ''
//         },
//         notes: {
//           order_id: orderId,
//           customer_id: userData._id || 'unknown'
//         }
//       };

//       console.log('Direct payment processing:', {
//         method: paymentMethod,
//         amount: cart.total,
//         orderId: orderId,
//         options: options
//       });

//       const paymentResult = await PaymentService.processPayment(
//         paymentMethod,
//         cart.total,
//         orderId,
//         options
//       );

//       console.log('Direct payment result:', paymentResult);

//       if (paymentResult && paymentResult.success) {
//         return paymentResult;
//       } else {
//         throw new Error('Payment was not successful');
//       }

//     } catch (error) {
//       console.error('Direct payment failed:', error);
//       throw new Error(error.message || 'Payment failed. Please try again.');
//     }
//   };

//   const handlePayment = async () => {
//     if (!selectedPayment) {
//       Alert.alert('Error', 'Please select a payment method');
//       return;
//     }

//     if (selectedPayment === 'upi_id' && !customUpiId.trim()) {
//       Alert.alert('Error', 'Please enter a valid UPI ID');
//       return;
//     }

//     // Check authentication for Razorpay
//     if ((selectedPayment === 'razorpay' || selectedPayment === 'razorpay_web') && !user) {
//       Alert.alert('Authentication Required', 'Please log in to use Razorpay payment');
//       return;
//     }

//     const userData = user?.customer || user;
//     if ((selectedPayment === 'razorpay' || selectedPayment === 'razorpay_web') && !userData?.email) {
//       Alert.alert('Email Required', 'Email is required for Razorpay payment. Please update your profile.');
//       return;
//     }

//     setIsPaying(true);
//     setPaymentError(null);

//     try {
//       const orderId = `ORDER_${Date.now()}`;
//       let options = {};

//       if (selectedPayment === 'upi_id') {
//         options = { upiId: customUpiId.trim() };
//       } else if (selectedPayment === 'razorpay' || selectedPayment === 'razorpay_web') {
//         // Extract user data from nested customer object
//         const userData = user?.customer || user;

//         // Debug user data
//         console.log('User data for Razorpay:', {
//           user: user,
//           userData: userData,
//           firstName: userData?.firstName,
//           lastName: userData?.lastName,
//           email: userData?.email,
//           phone: userData?.phone,
//           _id: userData?._id,
//           isAuthenticated: user ? true : false
//         });

//         // Check if user is authenticated and has required data
//         if (!user) {
//           throw new Error('Please log in to use Razorpay payment');
//         }

//         if (!userData?.email) {
//           throw new Error('Email is required for Razorpay payment');
//         }

//         // Build customer name with proper fallback
//         let customerName = 'Customer';
//         if (userData.firstName && userData.lastName) {
//           customerName = `${userData.firstName} ${userData.lastName}`.trim();
//         } else if (userData.firstName) {
//           customerName = userData.firstName;
//         } else if (userData.lastName) {
//           customerName = userData.lastName;
//         } else if (userData.email) {
//           // Use email prefix as name if no name is available
//           customerName = userData.email.split('@')[0];
//         }

//         options = {
//           customerName: customerName,
//           customerEmail: userData.email,
//           customerPhone: userData.phone || '',
//           description: `Payment for FarmFerry order`,
//           prefill: {
//             name: customerName,
//             email: userData.email,
//             contact: userData.phone || ''
//           },
//           notes: {
//             order_id: orderId,
//             customer_id: userData._id || 'unknown'
//           }
//         };

//         console.log('Razorpay options prepared:', options);
//       }

//       console.log('Processing payment:', {
//         method: selectedPayment,
//         amount: cart.total,
//         orderId: orderId,
//         options: options
//       });

//       const paymentResult = await PaymentService.processPayment(
//         selectedPayment,
//         cart.total,
//         orderId,
//         options
//       );

//       console.log('Payment result:', paymentResult);

//       if (paymentResult && paymentResult.success) {
//         await createOrderWithPayment(paymentResult);
//         updateCartItems([]);
//         setPaymentModalVisible(false);

//         navigation.navigate('PaymentStatus', {
//           paymentMethod: selectedPayment,
//           amount: cart.total,
//           orderId: orderId,
//           transactionId: paymentResult.transactionId,
//           onPaymentComplete: () => {
//             setShowSuccess(true);
//             setTimeout(() => {
//               setShowSuccess(false);
//               navigation.navigate('Orders');
//             }, 3000);
//           },
//           onPaymentFailed: (error) => {
//             setPaymentError(error);
//             Alert.alert('Payment Failed', error);
//           }
//         });
//       } else {
//         throw new Error('Payment was not successful');
//       }

//     } catch (error) {
//       setPaymentError(error.message || 'Payment failed. Please try again.');
//       Alert.alert('Payment Failed', error.message || 'Payment was not successful. Please try again.');
//     } finally {
//       setIsPaying(false);
//     }
//   };

//   const handleDeleteAddress = async (addressId) => {
//     Alert.alert(
//       'Delete Address',
//       'Are you sure you want to delete this address?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               await customerAPI.deleteAddress(addressId);
//               fetchCartAndAddresses();
//               Alert.alert('Deleted', 'Address deleted successfully.');
//             } catch (error) {
//               Alert.alert('Error', error.response?.data?.message || 'Failed to delete address.');
//             }
//           },
//         },
//       ]
//     );
//   };

//   const RadioButton = ({ selected, color = "#059669" }) => (
//     <View
//       className={`w-5 h-5 rounded-full border-2 items-center justify-center ${selected ? 'border-green-600 bg-green-100' : 'border-gray-300'}`}
//       style={selected ? { borderColor: color, backgroundColor: `${color}20` } : {}}
//     >
//       {selected ? <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} /> : null}
//     </View>
//   );

//   if (isLoading) {
//     return (
//       <View className="flex-1 justify-center items-center">
//         <ActivityIndicator size="large" color="#059669" />
//       </View>
//     );
//   }

//   if (!cart.items || cart.items.length === 0) {
//     return (
//       <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
//         <Text className="text-lg mb-2">Your cart is empty.</Text>
//         <TouchableOpacity onPress={() => navigation.navigate('Home')}>
//           <Text className="text-green-600 font-semibold">Go Shopping</Text>
//         </TouchableOpacity>
//       </SafeAreaView>
//     );
//   }

//   if (!addresses || addresses.length === 0) {
//     return (
//       <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
//         <Text className="text-lg mb-2">No addresses found. Please add a shipping address.</Text>
//         <TouchableOpacity onPress={() => navigation.navigate('AddAddress')}>
//           <Text className="text-green-600 font-semibold">Add Address</Text>
//         </TouchableOpacity>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView className="flex-1 bg-gray-50">
//       <ScrollView
//         className="flex-1"
//         contentContainerStyle={{ paddingHorizontal: responsiveValue(16, 24), paddingTop: responsiveValue(16, 24) }}
//       >
//         {/* Shipping Address */}
//         <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
//           <Text className="text-lg font-semibold mb-2" style={{ fontSize: responsiveValue(16, 18) }}>
//             Shipping Address
//           </Text>
//           {(Array.isArray(addresses) ? addresses : []).map((address) => (
//             <View
//               key={address._id}
//               className={`border p-4 rounded-lg mb-2 ${selectedAddress === address._id ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
//               style={{ minHeight: responsiveValue(100, 120) }}
//             >
//               <TouchableOpacity
//                 className="absolute top-2 right-2 z-10"
//                 onPress={() => handleDeleteAddress(address._id)}
//                 disabled={addresses.length <= 1}
//                 style={{ opacity: addresses.length <= 1 ? 0.4 : 1 }}
//               >
//                 <Trash2 size={responsiveValue(16, 18)} color="#ef4444" />
//               </TouchableOpacity>
//               <TouchableOpacity
//                 onPress={() => setSelectedAddress(address._id)}
//                 className="flex-1"
//                 activeOpacity={0.8}
//               >
//                 <View className="flex-row justify-between">
//                   <Text
//                     className="font-semibold"
//                     style={{ fontSize: responsiveValue(14, 16) }}
//                   >
//                     {user ? user.name : ''}
//                   </Text>
//                 </View>
//                 <Text style={{ fontSize: responsiveValue(13, 14) }}>
//                   {address.street}, {address.city}
//                 </Text>
//                 <Text style={{ fontSize: responsiveValue(13, 14) }}>
//                   {address.state}, {address.postalCode}
//                 </Text>
//                 <Text style={{ fontSize: responsiveValue(13, 14) }}>
//                   {address.country}
//                 </Text>
//                 <Text
//                   className="text-xs text-gray-500 mt-1"
//                   style={{ fontSize: responsiveValue(11, 12) }}
//                 >
//                   {address.phone && address.phone.trim() !== ''
//                     ? address.phone
//                     : user?.phone && user.phone.trim() !== ''
//                       ? `${user.phone} (from profile)`
//                       : 'No phone number'}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           ))}
//           <TouchableOpacity
//             onPress={() => navigation.navigate("AddAddress")}
//             className="mt-2"
//           >
//             <Text
//               className="text-green-600 font-semibold"
//               style={{ fontSize: responsiveValue(14, 16) }}
//             >
//               Add New Address
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* Map View */}
//         <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
//           <Text className="text-lg font-semibold mb-2" style={{ fontSize: responsiveValue(16, 18) }}>
//             Your Location
//           </Text>

//           {locationError && (
//             <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-2">
//               <Text className="text-yellow-700 text-xs" style={{ fontSize: responsiveValue(11, 13) }}>
//                 {locationError}
//               </Text>
//             </View>
//           )}

//           // In your MapView section, update to use react-native-maps:
// <View style={{ height: 220, borderRadius: 12, overflow: 'hidden' }}>
//   {isLoadingLocation ? (
//     <View className="flex-1 justify-center items-center bg-gray-100">
//       <ActivityIndicator size="large" color="#059669" />
//       <Text className="text-gray-500 mt-2" style={{ fontSize: responsiveValue(13, 15) }}>
//         Getting your location...
//       </Text>
//     </View>
//   ) : region ? (
//     <MapView
//       style={{ flex: 1, width: '100%', height: '100%' }}
//       initialRegion={region}
//       showsUserLocation={true}
//       showsMyLocationButton={true}
//       showsCompass={true}
//       showsScale={true}
//       zoomEnabled={true}
//       scrollEnabled={true}
//       rotateEnabled={true}
//       pitchEnabled={true}
//       mapType="standard"
//       onMapReady={() => console.log('Map is ready')}
//       onRegionChangeComplete={setRegion}
//     >
//       {location && (
//         <Marker
//           coordinate={location}
//           title="Your Location"
//           description="Your current location"
//           pinColor="#059669"
//           draggable={true}
//           onDragEnd={(e) => {
//             const newCoords = e.nativeEvent.coordinate;
//             setLocation(newCoords);
//             setRegion({
//               ...newCoords,
//               latitudeDelta: 0.02,
//               longitudeDelta: 0.02,
//             });
//           }}
//         />
//       )}
//     </MapView>
//   ) : (
//     <View className="flex-1 justify-center items-center bg-gray-100">
//       <Text className="text-gray-500" style={{ fontSize: responsiveValue(13, 15) }}>
//         Map not available
//       </Text>
//     </View>
//   )}
// </View>

//           {mapError && (
//             <View className="bg-red-50 border border-red-200 rounded-lg p-2 mt-2">
//               <Text className="text-red-700 text-xs" style={{ fontSize: responsiveValue(11, 13) }}>
//                 {mapError}
//               </Text>
//             </View>
//           )}

//           {/* Location Coordinates */}
//           {location && (
//             <View className="mt-2 p-2 bg-gray-50 rounded-lg">
//               <Text className="text-xs text-gray-600" style={{ fontSize: responsiveValue(10, 12) }}>
//                 Latitude: {location.latitude.toFixed(6)}
//               </Text>
//               <Text className="text-xs text-gray-600" style={{ fontSize: responsiveValue(10, 12) }}>
//                 Longitude: {location.longitude.toFixed(6)}
//               </Text>
//             </View>
//           )}

//           <TouchableOpacity
//             onPress={async () => {
//               if (location) {
//                 try {
//                   // Get address from coordinates using reverse geocoding
//                   const result = await Location.reverseGeocodeAsync(location, {
//                     useGoogleMaps: true,
//                   });

//                   let suggestedAddress = '';
//                   if (result && result.length > 0) {
//                     const addr = result[0];
//                     const addressParts = [];

//                     // Build address string
//                     if (addr.streetNumber) addressParts.push(addr.streetNumber);
//                     if (addr.street) addressParts.push(addr.street);
//                     if (addr.district && addr.district !== addr.city) addressParts.push(addr.district);
//                     if (addr.city) addressParts.push(addr.city);
//                     if (addr.region) addressParts.push(addr.region);
//                     if (addr.postalCode) addressParts.push(addr.postalCode);
//                     if (addr.country && addr.country !== 'India') addressParts.push(addr.country);

//                     suggestedAddress = addressParts.filter(Boolean).join(', ');
//                   }

//                   navigation.navigate('AddAddress', {
//                     latitude: location.latitude,
//                     longitude: location.longitude,
//                     suggestedAddress: suggestedAddress || `Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
//                   });
//                 } catch (error) {
//                   console.error('Error getting address:', error);
//                   // Fallback to coordinates
//                   navigation.navigate('AddAddress', {
//                     latitude: location.latitude,
//                     longitude: location.longitude,
//                     suggestedAddress: `Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
//                   });
//                 }
//               } else {
//                 Alert.alert('Location Not Available', 'Please wait for your location to load or enable location services.');
//               }
//             }}
//             className="mt-3 bg-green-600 py-3 rounded-xl"
//           >
//             <Text className="text-white text-center font-semibold" style={{ fontSize: responsiveValue(14, 16) }}>
//               Add Address from Current Location
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* Payment Method */}
//         <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
//           <Text
//             className="text-lg font-semibold mb-2"
//             style={{ fontSize: responsiveValue(16, 18) }}
//           >
//             Payment Method
//           </Text>
//           <TouchableOpacity
//             className={`border p-4 rounded-lg flex-row justify-between items-center ${paymentMethod === 'Cash on Delivery' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
//             onPress={() => {
//               setPaymentMethod('Cash on Delivery');
//               setShowPaymentOptions(false);
//               setPaymentModalVisible(false);
//             }}
//             style={{ minHeight: responsiveValue(60, 70) }}
//           >
//             <View className="flex-row items-center">
//               <CreditCard size={responsiveValue(20, 24)} color="#6b7280" />
//               <Text
//                 className="ml-4"
//                 style={{ fontSize: responsiveValue(14, 16) }}
//               >
//                 Cash on Delivery (COD)
//               </Text>
//             </View>
//             {paymentMethod === 'Cash on Delivery' && <CheckCircle size={responsiveValue(18, 20)} color="#059669" />}
//           </TouchableOpacity>
//           <TouchableOpacity
//             className={`border p-4 rounded-lg flex-row justify-between items-center mt-2 ${paymentMethod === 'Online Payment' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
//             onPress={() => {
//               setPaymentMethod('Online Payment');
//               setShowPaymentOptions(false);
//               setSelectedPayment('razorpay');
//             }}
//             style={{ minHeight: responsiveValue(60, 70) }}
//           >
//             <View className="flex-row items-center">
//               <CreditCard size={responsiveValue(20, 24)} color="#6b7280" />
//               <Text
//                 className="ml-4"
//                 style={{ fontSize: responsiveValue(14, 16) }}
//               >
//                 Online Payment
//               </Text>
//             </View>
//             {paymentMethod === 'Online Payment' && <CheckCircle size={responsiveValue(18, 20)} color="#059669" />}
//           </TouchableOpacity>
//         </View>

//         {/* Order Summary */}
//         <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
//           <View className="flex-row justify-between items-center mb-2">
//             <Text
//               className="text-lg font-semibold"
//               style={{ fontSize: responsiveValue(16, 18) }}
//             >
//               Order Summary
//             </Text>
//             {routeItems && (
//               <View className="bg-green-100 px-2 py-1 rounded-full">
//                 <Text
//                   className="text-xs font-medium text-green-700"
//                   style={{ fontSize: responsiveValue(10, 12) }}
//                 >
//                   Buy Now
//                 </Text>
//               </View>
//             )}
//           </View>
//           {cart.items.map((item) => (
//             <View
//               key={item.product?._id || item.product?.id || item.product}
//               className="flex-row justify-between items-center mb-2"
//               style={{ minHeight: responsiveValue(30, 36) }}
//             >
//               <Text
//                 className="flex-1"
//                 style={{ fontSize: responsiveValue(13, 15) }}
//               >
//                 {item.product?.name || item.name} x{item.quantity}
//               </Text>
//               <Text style={{ fontSize: responsiveValue(13, 15) }}>
//                 ₹{(item.product?.price ? item.product.price * item.quantity : item.price * item.quantity).toFixed(2)}
//               </Text>
//             </View>
//           ))}
//           <View className="border-t border-gray-200 mt-2 pt-2">
//             <View className="flex-row justify-between items-center mb-1">
//               <Text style={{ fontSize: responsiveValue(13, 15) }}>Subtotal</Text>
//               <Text style={{ fontSize: responsiveValue(13, 15) }}>₹{cart.subtotal.toFixed(2)}</Text>
//             </View>
//             <View className="flex-row justify-between items-center mb-1">
//               {/* <Text style={{ fontSize: responsiveValue(13, 15) }}>GST</Text>
//               <Text style={{ fontSize: responsiveValue(13, 15) }}>₹{cart.gst.toFixed(2)}</Text> */}
//               <Text style={{ fontSize: responsiveValue(13, 15) }}>
//                 GST
//                 {/* Show GST range if multiple rates */}
//                 {(() => {
//                   const gstRates = [...new Set(cart.items.map(item => {
//                     if (item.product && typeof item.product === 'object') {
//                       return item.product.gst || 0;
//                     } else if (item.gst !== undefined) {
//                       return item.gst;
//                     }
//                     return 5; // default
//                   }))];

//                   if (gstRates.length === 1) {
//                     return `(${gstRates[0]}%)`;
//                   } else if (gstRates.length > 1) {
//                     const minRate = Math.min(...gstRates);
//                     const maxRate = Math.max(...gstRates);
//                     return minRate === maxRate ? `(${minRate}%)` : `(${minRate}%-${maxRate}%)`;
//                   }
//                   return '';
//                 })()}
//               </Text>
//               <Text style={{ fontSize: responsiveValue(13, 15) }}>₹{cart.gst.toFixed(2)}</Text>
//             </View>
//             <View className="flex-row justify-between items-center mb-1">
//               <Text style={{ fontSize: responsiveValue(13, 15) }}>Platform Fee</Text>
//               <Text style={{ fontSize: responsiveValue(13, 15) }}>₹{cart.platformFee.toFixed(2)}</Text>
//             </View>
//             {totalHandlingFee > 0 && (
//               <View className="flex-row justify-between items-center mb-1">
//                 <Text style={{ fontSize: responsiveValue(13, 15) }}>Handling Fee</Text>
//                 <Text style={{ fontSize: responsiveValue(13, 15) }}>₹{totalHandlingFee.toFixed(2)}</Text>
//               </View>
//             )}
//             <View className="flex-row justify-between items-center mb-1">
//               <Text style={{ fontSize: responsiveValue(13, 15) }}>Shipping</Text>
//               <Text style={{ fontSize: responsiveValue(13, 15) }}>₹{cart.shipping.toFixed(2)}</Text>
//             </View>
//             <View className="flex-row justify-between items-center font-bold">
//               <Text
//                 className="font-bold"
//                 style={{ fontSize: responsiveValue(14, 16) }}
//               >
//                 Total
//               </Text>
//               <Text
//                 className="font-bold"
//                 style={{ fontSize: responsiveValue(14, 16) }}
//               >
//                 ₹{cart.total.toFixed(2)}
//               </Text>
//             </View>
//           </View>
//         </View>
//       </ScrollView>

//       {/* Bottom Action Button */}
//       <View
//         className="bg-white border-t border-gray-200 p-4"
//         style={{ paddingHorizontal: responsiveValue(16, 24) }}
//       >
//         <TouchableOpacity
//           onPress={handlePlaceOrder}
//           disabled={isPlacingOrder}
//           style={{ borderRadius: 12, overflow: 'hidden' }}
//         >
//           <LinearGradient
//             colors={["#10b981", "#059669"]}
//             className="py-4 flex-row items-center justify-center rounded-xl"
//           >
//             <CheckCircle
//               width={responsiveValue(16, 18)}
//               height={responsiveValue(16, 18)}
//               color="#fff"
//             />
//             <Text
//               className="text-white font-semibold text-sm ml-1.5"
//               style={{ fontSize: responsiveValue(14, 16) }}
//             >
//               {isPlacingOrder
//                 ? 'Placing Order...'
//                 : paymentMethod === 'Online Payment'
//                   ? 'Pay & Place Order'
//                   : `Place Order - ₹${cart.total.toFixed(2)}`}
//             </Text>
//           </LinearGradient>
//         </TouchableOpacity>
//       </View>

//       {/* Payment Options Modal */}
//       <Modal
//         visible={paymentModalVisible}
//         onClose={() => setPaymentModalVisible(false)}
//         title="Payment Options"
//         size="full"
//         showCloseButton
//         closeOnBackdropPress
//         style="pb-0"
//       >
//         {/* Authentication Status Banner */}
//         {!isAuthenticated && (
//           <View className="bg-red-50 border-b border-red-200 p-3">
//             <Text className="text-red-700 text-sm text-center mb-2">
//               🔐 Please log in to use payment options
//             </Text>
//             <TouchableOpacity
//               className="bg-red-600 py-2 px-4 rounded-lg"
//               onPress={() => {
//                 setPaymentModalVisible(false);
//                 navigation.navigate('Login');
//               }}
//             >
//               <Text className="text-white text-sm text-center font-medium">
//                 Go to Login
//               </Text>
//             </TouchableOpacity>
//           </View>
//         )}
//         <ScrollView
//           className="flex-1"
//           contentContainerStyle={{
//             paddingHorizontal: responsiveValue(16, 24),
//             paddingBottom: responsiveValue(100, 120)
//           }}
//           showsVerticalScrollIndicator={false}
//         >
//           {/* Debug Info - Remove this in production */}
//           {/* <View className="bg-gray-50 rounded-xl p-3 mb-4 border border-gray-200">
//             <Text className="text-xs text-gray-600 mb-1">Debug Info:</Text>
//             <Text className="text-xs text-gray-700">
//               Logged In: {isAuthenticated ? '✅ Yes' : '❌ No'}
//             </Text>
//             <Text className="text-xs text-gray-700">
//               User ID: {(user?.customer?._id || user?._id) || 'Not available'}
//             </Text>
//             <Text className="text-xs text-gray-700">
//               Email: {(user?.customer?.email || user?.email) || 'Not available'}
//             </Text>
//             <Text className="text-xs text-gray-700">
//               Name: {(() => {
//                 const customer = user?.customer || user;
//                 return (customer?.firstName && customer?.lastName) ?
//                   `${customer.firstName} ${customer.lastName}` : 'Not available';
//               })()}
//             </Text>
//             {user && Object.keys(user).length > 0 && (
//               <Text className="text-xs text-gray-700 mt-1">
//                 User Keys: {Object.keys(user).join(', ')}
//               </Text>
//             )}
//             <TouchableOpacity
//               className="bg-blue-500 py-1 px-2 rounded mt-2 mr-2"
//               onPress={() => {
//                 console.log('Manual refresh - Current user object:', user);
//                 console.log('Manual refresh - User keys:', user ? Object.keys(user) : 'No user');
//               }}
//             >
//               <Text className="text-white text-xs text-center">Log User Data</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               className="bg-green-500 py-1 px-2 rounded mt-2"
//               onPress={async () => {
//                 try {
//                   console.log('Manual refresh requested...');
//                   const refreshedUser = await refreshUserData();
//                   console.log('Manual refresh successful:', refreshedUser);
//                   Alert.alert('Success', 'User data refreshed successfully!');
//                 } catch (error) {
//                   console.error('Manual refresh failed:', error);
//                   Alert.alert('Error', 'Failed to refresh user data: ' + error.message);
//                 }
//               }}
//             >
//               <Text className="text-white text-xs text-center">Refresh User Data</Text>
//             </TouchableOpacity>
//           </View> */}

//           {/* Amount Summary */}
//           <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
//             <View className="flex-row justify-between items-center mb-2">
//               <Text
//                 className="text-gray-600"
//                 style={{ fontSize: responsiveValue(13, 15) }}
//               >
//                 Total Amount
//               </Text>
//               <Text
//                 className="text-gray-400 line-through"
//                 style={{ fontSize: responsiveValue(13, 15) }}
//               >
//                 ₹{(cart.total + 19).toFixed(0)}
//               </Text>
//             </View>
//             <View className="flex-row justify-between items-center">
//               <Text
//                 className="text-2xl font-bold text-green-700"
//                 style={{ fontSize: responsiveValue(20, 24) }}
//               >
//                 ₹{cart.total.toFixed(0)}
//               </Text>
//               <View className="bg-green-100 px-2 py-1 rounded-full">
//                 <Text
//                   className="text-green-700 text-xs font-medium"
//                   style={{ fontSize: responsiveValue(10, 12) }}
//                 >
//                   Save ₹19
//                 </Text>
//               </View>
//             </View>
//           </View>

//           {/* Payment Error Display */}
//           {paymentError && (
//             <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
//               <Text
//                 className="text-red-700 text-sm"
//                 style={{ fontSize: responsiveValue(12, 14) }}
//               >
//                 {paymentError}
//               </Text>
//             </View>
//           )}

//           {/* Offers Banner */}
//           <TouchableOpacity
//             className="bg-amber-50 rounded-lg p-3 mb-4 border border-amber-200 flex-row justify-between items-center"
//             onPress={() => { }}
//           >
//             <Text
//               className="text-amber-800 font-medium"
//               style={{ fontSize: responsiveValue(13, 15) }}
//             >
//               Bank offers available
//             </Text>
//             <Ionicons
//               name="chevron-forward"
//               size={responsiveValue(16, 18)}
//               color="#d97706"
//             />
//           </TouchableOpacity>

//           {/* Payment Options */}
//           <View className="space-y-3">
//             {/* UPI */}
//             <View className="bg-white rounded-xl p-3 border border-gray-200">
//               <TouchableOpacity
//                 className="flex-row justify-between items-center"
//                 onPress={() => setExpandedSection(expandedSection === 'upi' ? '' : 'upi')}
//               >
//                 <View className="flex-row items-center">
//                   <View className="bg-green-100 p-2 rounded-full mr-3">
//                     <MaterialCommunityIcons
//                       name="bank"
//                       size={responsiveValue(16, 18)}
//                       color="#059669"
//                     />
//                   </View>
//                   <Text
//                     className="font-medium"
//                     style={{ fontSize: responsiveValue(14, 16) }}
//                   >
//                     UPI Payment
//                   </Text>
//                 </View>
//                 <Ionicons
//                   name={expandedSection === 'upi' ? 'chevron-up' : 'chevron-down'}
//                   size={responsiveValue(16, 18)}
//                   color="#6b7280"
//                 />
//               </TouchableOpacity>

//               {expandedSection === 'upi' && (
//                 <View className="mt-3 space-y-2">
//                   <PaymentOption
//                     icon={<FontAwesome5 name="google-pay" size={responsiveValue(18, 20)} color="#34A853" />}
//                     title="Google Pay"
//                     selected={selectedPayment === 'gpay'}
//                     onPress={() => setSelectedPayment('gpay')}
//                   />
//                   <PaymentOption
//                     icon={<MaterialCommunityIcons name="phone" size={responsiveValue(18, 20)} color="#5F259F" />}
//                     title="PhonePe"
//                     selected={selectedPayment === 'phonepe'}
//                     onPress={() => setSelectedPayment('phonepe')}
//                   />
//                   <PaymentOption
//                     icon={<MaterialCommunityIcons name="account-plus-outline" size={responsiveValue(18, 20)} color="#059669" />}
//                     title="Enter UPI ID"
//                     selected={selectedPayment === 'upi_id'}
//                     onPress={() => setSelectedPayment('upi_id')}
//                   />

//                   {selectedPayment === 'upi_id' && (
//                     <View className="mt-2 bg-gray-50 rounded-lg p-3">
//                       <TextInput
//                         value={customUpiId}
//                         onChangeText={setCustomUpiId}
//                         placeholder="yourname@upi"
//                         className="border-b border-gray-200 pb-1"
//                         autoCapitalize="none"
//                         style={{ fontSize: responsiveValue(14, 16) }}
//                       />
//                     </View>
//                   )}
//                 </View>
//               )}
//             </View>

//             {/* Razorpay */}
//             <View className="bg-white rounded-xl p-3 border border-gray-200">
//               <TouchableOpacity
//                 className="flex-row justify-between items-center"
//                 onPress={() => setExpandedSection(expandedSection === 'razorpay' ? '' : 'razorpay')}
//               >
//                 <View className="flex-row items-center">
//                   <View className="bg-blue-100 p-2 rounded-full mr-3">
//                     <MaterialCommunityIcons
//                       name="credit-card"
//                       size={responsiveValue(16, 18)}
//                       color="#3399CC"
//                     />
//                   </View>
//                   <Text
//                     className="font-medium"
//                     style={{ fontSize: responsiveValue(14, 16) }}
//                   >
//                     Razorpay
//                   </Text>
//                 </View>
//                 <Ionicons
//                   name={expandedSection === 'razorpay' ? 'chevron-up' : 'chevron-down'}
//                   size={responsiveValue(16, 18)}
//                   color="#6b7280"
//                 />
//               </TouchableOpacity>

//               {expandedSection === 'razorpay' && (
//                 <View className="mt-3">
//                   {/* Authentication Status */}
//                   {!user ? (
//                     <View className="bg-red-50 border border-red-200 rounded-lg p-2 mb-2">
//                       <Text className="text-red-700 text-xs">
//                         🔐 Please log in to use Razorpay
//                       </Text>
//                     </View>
//                   ) : !(user?.customer?.email || user?.email) ? (
//                     <View className="bg-orange-50 border border-orange-200 rounded-lg p-2 mb-2">
//                       <Text className="text-orange-700 text-xs">
//                         📧 Email required for Razorpay payment
//                       </Text>
//                     </View>
//                   ) : (
//                     <View className="bg-green-50 border border-green-200 rounded-lg p-2 mb-2">
//                       <Text className="text-green-700 text-xs">
//                         ✅ Ready for Razorpay payment
//                       </Text>
//                     </View>
//                   )}

//                   {/* Razorpay Status Indicator */}
//                   {/* <View className={`p-2 rounded-lg mb-2 ${RazorpayService.isAvailable() ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
//                     <Text className={`text-xs ${RazorpayService.isAvailable() ? 'text-green-700' : 'text-yellow-700'}`}>
//                       {RazorpayService.isAvailable() ? '✅ Razorpay Available' : '⚠️ Using Mock Payment'}
//                     </Text>
//                   </View> */}

//                   <PaymentOption
//                     icon={<MaterialCommunityIcons name="credit-card" size={responsiveValue(18, 20)} color="#3399CC" />}
//                     title="Credit/Debit Cards, UPI, Net Banking"
//                     selected={selectedPayment === 'razorpay'}
//                     onPress={() => setSelectedPayment('razorpay')}
//                     disabled={!user || !(user?.customer?.email || user?.email)}
//                   />

//                   <PaymentOption
//                     icon={<MaterialCommunityIcons name="web" size={responsiveValue(18, 20)} color="#059669" />}
//                     title="🌐 Razorpay Web (Expo Go Compatible)"
//                     subtitle="Opens in browser - Works with Expo Go"
//                     selected={selectedPayment === 'razorpay_web'}
//                     onPress={() => setSelectedPayment('razorpay_web')}
//                     disabled={!user || !(user?.customer?.email || user?.email)}
//                   />

//                   {/* User Info for Payment */}
//                   {(user?.customer?.email || user?.email) && (
//                     <View className="mt-2 bg-blue-50 rounded-lg p-2">
//                       <Text className="text-xs text-blue-600 mb-1">Payment Details:</Text>
//                       <Text className="text-xs text-blue-700">
//                         Name: {(() => {
//                           const customer = user?.customer || user;
//                           return (customer?.firstName && customer?.lastName) ?
//                             `${customer.firstName} ${customer.lastName}` :
//                             customer?.firstName || customer?.lastName || customer?.email?.split('@')[0];
//                         })()}
//                       </Text>
//                       <Text className="text-xs text-blue-700">
//                         Email: {user?.customer?.email || user?.email}
//                       </Text>
//                       {(user?.customer?.phone || user?.phone) && (
//                         <Text className="text-xs text-blue-700">
//                           Phone: {user?.customer?.phone || user?.phone}
//                         </Text>
//                       )}
//                     </View>
//                   )}

//                   {/* Supported Payment Methods */}
//                   <View className="mt-2 bg-gray-50 rounded-lg p-2">
//                     <Text className="text-xs text-gray-600 mb-1">Supported:</Text>
//                     <View className="flex-row flex-wrap">
//                       {RazorpayService.getSupportedPaymentMethods().map((method, index) => (
//                         <Text key={index} className="text-xs text-gray-500 mr-2">
//                           • {method.charAt(0).toUpperCase() + method.slice(1)}
//                         </Text>
//                       ))}
//                     </View>
//                   </View>
//                 </View>
//               )}
//             </View>

//             {/* Wallet */}
//             <View className="bg-white rounded-xl p-3 border border-gray-200">
//               <TouchableOpacity
//                 className="flex-row justify-between items-center"
//                 onPress={() => setExpandedSection(expandedSection === 'wallet' ? '' : 'wallet')}
//               >
//                 <View className="flex-row items-center">
//                   <View className="bg-purple-100 p-2 rounded-full mr-3">
//                     <MaterialCommunityIcons
//                       name="wallet"
//                       size={responsiveValue(16, 18)}
//                       color="#7e22ce"
//                     />
//                   </View>
//                   <Text
//                     className="font-medium"
//                     style={{ fontSize: responsiveValue(14, 16) }}
//                   >
//                     Wallet
//                   </Text>
//                 </View>
//                 <Ionicons
//                   name={expandedSection === 'wallet' ? 'chevron-up' : 'chevron-down'}
//                   size={responsiveValue(16, 18)}
//                   color="#6b7280"
//                 />
//               </TouchableOpacity>

//               {expandedSection === 'wallet' && (
//                 <View className="mt-3">
//                   <PaymentOption
//                     icon={<MaterialCommunityIcons name="wallet-outline" size={responsiveValue(18, 20)} color="#7e22ce" />}
//                     title="Wallet Balance"
//                     selected={false}
//                     disabled
//                     comingSoon
//                   />
//                 </View>
//               )}
//             </View>

//             {/* Cards */}
//             <View className="bg-white rounded-xl p-3 border border-gray-200">
//               <TouchableOpacity
//                 className="flex-row justify-between items-center"
//                 onPress={() => setExpandedSection(expandedSection === 'card' ? '' : 'card')}
//               >
//                 <View className="flex-row items-center">
//                   <View className="bg-blue-100 p-2 rounded-full mr-3">
//                     <MaterialCommunityIcons
//                       name="credit-card-outline"
//                       size={responsiveValue(16, 18)}
//                       color="#1d4ed8"
//                     />
//                   </View>
//                   <Text
//                     className="font-medium"
//                     style={{ fontSize: responsiveValue(14, 16) }}
//                   >
//                     Credit/Debit Card
//                   </Text>
//                 </View>
//                 <Ionicons
//                   name={expandedSection === 'card' ? 'chevron-up' : 'chevron-down'}
//                   size={responsiveValue(16, 18)}
//                   color="#6b7280"
//                 />
//               </TouchableOpacity>

//               {expandedSection === 'card' && (
//                 <View className="mt-3">
//                   <PaymentOption
//                     icon={<MaterialCommunityIcons name="credit-card" size={responsiveValue(18, 20)} color="#1d4ed8" />}
//                     title="Add Card"
//                     selected={false}
//                     disabled
//                     comingSoon
//                   />
//                 </View>
//               )}
//             </View>
//           </View>

//           {/* Security Note */}
//           <View className="mt-4 flex-row items-center">
//             <Ionicons
//               name="shield-checkmark"
//               size={responsiveValue(14, 16)}
//               color="#059669"
//             />
//             <Text
//               className="text-gray-500 text-xs ml-1"
//               style={{ fontSize: responsiveValue(11, 13) }}
//             >
//               Secure and encrypted payments
//             </Text>
//           </View>
//         </ScrollView>

//         {/* Payment Button */}
//         <View
//           className="bg-white p-4 border-t border-gray-200"
//           style={{ paddingHorizontal: responsiveValue(16, 24) }}
//         >
//           <TouchableOpacity
//             className={`rounded-lg py-3 items-center ${isPaying || (selectedPayment === 'upi_id' && !customUpiId) ? 'bg-gray-300' : 'bg-green-600'}`}
//             onPress={handlePayment}
//             disabled={isPaying || (selectedPayment === 'upi_id' && !customUpiId)}
//           >
//             {isPaying ? (
//               <ActivityIndicator color="#ffffff" size={responsiveValue('small', 'large')} />
//             ) : (
//               <Text
//                 className="text-white font-bold"
//                 style={{ fontSize: responsiveValue(14, 16) }}
//               >
//                 Pay ₹{cart.total.toFixed(0)}
//               </Text>
//             )}
//           </TouchableOpacity>
//         </View>
//       </Modal>

//       {/* Success Modal */}
//       <Modal visible={showSuccess} transparent animationType="fade">
//         <View
//           className="bg-white rounded-3xl p-8 items-center shadow-lg"
//           style={{
//             width: responsiveValue(280, 320),
//             maxWidth: responsiveValue(300, 360)
//           }}
//         >
//           <LottieView
//             source={require('../../assets/Payment-Success.json')}
//             autoPlay
//             loop={false}
//             style={{
//               width: responsiveValue(120, 150),
//               height: responsiveValue(120, 150)
//             }}
//             resizeMode="cover"
//           />
//           <Text
//             className="text-2xl font-bold text-green-600 mt-2 text-center"
//             style={{ fontSize: responsiveValue(20, 24) }}
//           >
//             Order Placed!
//           </Text>
//           <Text
//             className="text-gray-700 mt-2 text-base text-center font-medium"
//             style={{ fontSize: responsiveValue(14, 16) }}
//           >
//             Your order has been confirmed
//           </Text>
//           <View className="mt-4 w-full items-center">
//             <Text
//               className="text-gray-500 text-sm text-center"
//               style={{ fontSize: responsiveValue(12, 14) }}
//             >
//               Thank you for shopping with FarmFerry!
//             </Text>
//             {orderId && (
//               <Text
//                 className="text-gray-400 text-xs mt-2"
//                 style={{ fontSize: responsiveValue(10, 12) }}
//               >
//                 Order ID: {orderId}
//               </Text>
//             )}
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// // Ensure the component is properly defined before setting displayName
// if (OrderSummaryScreen) {
//   OrderSummaryScreen.displayName = 'OrderSummaryScreen';
// }

// export default OrderSummaryScreen;

// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';
// import * as Location from 'expo-location';
// import { CheckCircle, CreditCard, Trash2 } from 'lucide-react-native';
// import React, { useEffect, useState } from 'react';
// import { ActivityIndicator, Alert, Dimensions, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
// import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
// import { useAppContext } from '../context/AppContext';
// import { useAuth } from '../context/AuthContext';
// import { cartAPI, categoriesAPI, customerAPI, ordersAPI } from '../services/api';

// const { width } = Dimensions.get('window');
// const responsiveValue = (mobile, tablet) => width >= 768 ? tablet : mobile;

// const PaymentOption = ({ icon, title, selected, onPress, disabled, comingSoon }) => (
//   <TouchableOpacity
//     className={`flex-row items-center p-2 rounded-lg ${selected ? 'bg-green-50' : ''}`}
//     onPress={onPress}
//     disabled={disabled}
//     activeOpacity={0.7}
//     style={{ minHeight: responsiveValue(50, 60) }}
//   >
//     <View className="bg-white p-1.5 rounded-lg mr-3">{icon}</View>
//     <Text className={`flex-1 ${disabled ? 'text-gray-400' : 'text-gray-800'}`} style={{ fontSize: responsiveValue(14, 16) }}>
//       {title}
//       {comingSoon && <Text className="text-gray-400 text-xs"> (Coming Soon)</Text>}
//     </Text>
//     {!disabled && (
//       <View className={`w-5 h-5 rounded-full border-2 ${selected ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
//         {selected && <Ionicons name="checkmark" size={14} color="white" />}
//       </View>
//     )}
//   </TouchableOpacity>
// );

// const CheckoutScreen = ({ route }) => {
//   const navigation = useNavigation();
//   const { updateCartItems } = useAppContext();
//   const { user, isAuthenticated, refreshUserData } = useAuth();

//   const [addresses, setAddresses] = useState([]);
//   const [selectedAddress, setSelectedAddress] = useState(null);
//   const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
//   const [isLoading, setIsLoading] = useState(true);
//   const [isPlacingOrder, setIsPlacingOrder] = useState(false);
//   const [cart, setCart] = useState({ items: [], subtotal: 0, shipping: 0, gst: 0, total: 0, savings: 0, handlingFee: 0, platformFee: 2 });
//   const [handlingFees, setHandlingFees] = useState({});
//   const [totalHandlingFee, setTotalHandlingFee] = useState(0);
//   const [paymentModalVisible, setPaymentModalVisible] = useState(false);
//   const [expandedSection, setExpandedSection] = useState('upi');
//   const [selectedPayment, setSelectedPayment] = useState('gpay');
//   const [customUpiId, setCustomUpiId] = useState('');
//   const [showSuccess, setShowSuccess] = useState(false);
//   const [paymentError, setPaymentError] = useState(null);
//   const [orderId, setOrderId] = useState(null);

//   // Location state
//   const [location, setLocation] = useState(null);
//   const [region, setRegion] = useState(null);
//   const [locationError, setLocationError] = useState(null);
//   const [mapError, setMapError] = useState(null);
//   const [isLoadingLocation, setIsLoadingLocation] = useState(true);

//   // Location useEffect
//   useEffect(() => {
//     (async () => {
//       try {
//         setIsLoadingLocation(true);
//         setLocationError(null);

//         // Request permission
//         let { status } = await Location.requestForegroundPermissionsAsync();

//         if (status !== 'granted') {
//           setLocationError('Location permission denied. Using default location.');

//           // Set default location (Pune coordinates)
//           const defaultLocation = {
//             latitude: 18.5204,
//             longitude: 73.8567,
//           };

//           setLocation(defaultLocation);
//           setRegion({
//             ...defaultLocation,
//             latitudeDelta: 0.02,
//             longitudeDelta: 0.02,
//           });
//           setIsLoadingLocation(false);
//           return;
//         }

//         // Get current location
//         let currentLocation = await Location.getCurrentPositionAsync({
//           accuracy: Location.Accuracy.High,
//           timeout: 15000, // 15 second timeout
//         });

//         const coords = {
//           latitude: currentLocation.coords.latitude,
//           longitude: currentLocation.coords.longitude,
//         };

//         console.log('Location obtained:', coords);

//         setLocation(coords);
//         setRegion({
//           ...coords,
//           latitudeDelta: 0.02,
//           longitudeDelta: 0.02,
//         });

//       } catch (error) {
//         console.error('Location error:', error);
//         setLocationError('Failed to get location. Using default location.');

//         // Fallback to default location
//         const defaultLocation = {
//           latitude: 18.5204,
//           longitude: 73.8567,
//         };

//         setLocation(defaultLocation);
//         setRegion({
//           ...defaultLocation,
//           latitudeDelta: 0.02,
//           longitudeDelta: 0.02,
//         });
//       } finally {
//         setIsLoadingLocation(false);
//       }
//     })();
//   }, []);

//   const routeItems = route?.params?.items;
//   const routeSubtotal = route?.params?.subtotal;
//   const routeGst = route?.params?.gst;
//   const routeShipping = route?.params?.shipping;
//   const routePlatformFee = route?.params?.platformFee;
//   const routeTotal = route?.params?.total;
//   const routeSavings = route?.params?.savings;

//   const getSubtotal = (items) => items.reduce((sum, item) => sum + item.price * item.quantity, 0);
//   const getTotalDiscount = (items) => items.reduce((sum, item) => {
//     if (item.originalPrice) return sum + (item.originalPrice - item.price) * item.quantity;
//     return sum;
//   }, 0);

//   const getTotalGST = (items) => {
//     return items.reduce((sum, item) => {
//       const gstPercent = item.product?.gst || item.gst || 0;
//       return sum + (item.price * gstPercent / 100) * (item.quantity || 1);
//     }, 0);
//   };

//   const getShipping = (subtotal = 0) => {
//     return subtotal >= 500 ? 0 : 20.0;
//   };

//   const getGrandTotal = (items) => {
//     const subtotal = getSubtotal(items);
//     return subtotal + getTotalGST(items) + getShipping(subtotal) + (cart.handlingFee || 0);
//   };

//   const getItemHandlingFee = (item) => {
//     if (item.product && typeof item.product === 'object' && item.product.categoryId) {
//       return handlingFees[item.product.categoryId] || 0;
//     }
//     return 0;
//   };

//   const fetchHandlingFees = async (items) => {
//     try {
//       const categoryIds = [...new Set(items.map(item => item.product?.categoryId).filter(Boolean))];
//       const fees = {};
//       let totalFee = 0;

//       for (const categoryId of categoryIds) {
//         try {
//           const response = await categoriesAPI.getCategoryHandlingFee(categoryId);
//           const handlingFee = response?.data?.data?.category?.handlingFee || 0;
//           fees[categoryId] = handlingFee;
//           totalFee += handlingFee;
//         } catch {
//           fees[categoryId] = 0;
//         }
//       }

//       setHandlingFees(fees);
//       setTotalHandlingFee(totalFee);
//       return totalFee;
//     } catch {
//       setHandlingFees({});
//       setTotalHandlingFee(0);
//       return 0;
//     }
//   };

//   const fetchCartAndAddresses = async () => {
//     setIsLoading(true);
//     try {
//       let items = routeItems && Array.isArray(routeItems) ? routeItems : [];
//       if (!items.length) {
//         const cartRes = await cartAPI.getCart();
//         items = cartRes?.data?.data?.cart?.items || [];
//       }

//       const subtotal = routeSubtotal !== undefined ? routeSubtotal : getSubtotal(items);
//       const gst = routeGst !== undefined ? routeGst : getTotalGST(items);
//       const platformFee = routePlatformFee !== undefined ? routePlatformFee : 2;
//       const shipping = routeShipping !== undefined ? routeShipping : getShipping(subtotal);
//       const savings = routeSavings !== undefined ? routeSavings : getTotalDiscount(items);

//       const handlingFeeTotal = await fetchHandlingFees(items);
//       const total = routeTotal !== undefined ? routeTotal : (subtotal + gst + shipping + platformFee + handlingFeeTotal);

//       setCart({ items, subtotal, gst, platformFee, shipping, total, savings, handlingFee: handlingFeeTotal });
//       if (!routeItems) updateCartItems(items);

//       const response = await customerAPI.getProfile();
//       const addr = response?.data?.data?.customer?.addresses || [];
//       setAddresses(addr);
//       if (addr.length > 0) setSelectedAddress(addr[0]._id);
//     } catch {
//       // Handle error silently
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCartAndAddresses();
//   }, [routeItems]);

//   const handlePlaceOrder = async () => {
//     if (!selectedAddress) {
//       Alert.alert('Address Required', 'Please select a delivery address before placing your order.');
//       return;
//     }

//     if (!cart.items || cart.items.length === 0) {
//       Alert.alert('Empty Cart', 'Your cart is empty. Please add items before placing an order.');
//       return;
//     }

//     setIsPlacingOrder(true);
//     try {
//       // Prepare order data
//       const orderData = {
//         items: cart.items.map(item => ({
//           productId: item.product?._id || item._id,
//           quantity: item.quantity,
//           price: item.price
//         })),
//         shippingAddress: selectedAddress,
//         paymentMethod: paymentMethod,
//         subtotal: cart.subtotal,
//         gst: cart.gst,
//         shipping: cart.shipping,
//         platformFee: cart.platformFee,
//         handlingFee: cart.handlingFee || 0,
//         total: cart.total
//       };

//       console.log('Placing order with data:', orderData);

//       if (paymentMethod === 'Cash on Delivery') {
//         // Place COD order
//         const response = await ordersAPI.createOrder(orderData);
//         const order = response.data.data.order;

//         Alert.alert('Order Placed Successfully!', `Your order #${order._id} has been placed and will be delivered soon.`, [
//           {
//             text: 'View Order',
//             onPress: () => navigation.navigate('OrderDetails', { orderId: order._id })
//           },
//           {
//             text: 'Continue Shopping',
//             onPress: () => navigation.navigate('Home')
//           }
//         ]);

//         // Clear cart after successful order
//         updateCartItems([]);
//       } else {
//         // Handle online payment
//         Alert.alert('Payment Integration', 'Online payment integration will be implemented here.');
//       }

//     } catch (error) {
//       console.error('Error placing order:', error);
//       Alert.alert('Order Failed', 'Failed to place your order. Please try again.');
//     } finally {
//       setIsPlacingOrder(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <View className="flex-1 justify-center items-center">
//         <ActivityIndicator size="large" color="#059669" />
//       </View>
//     );
//   }

//   if (!cart.items || cart.items.length === 0) {
//     return (
//       <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
//         <Text className="text-lg mb-2">Your cart is empty.</Text>
//         <TouchableOpacity onPress={() => navigation.navigate('Home')}>
//           <Text className="text-green-600 font-semibold">Go Shopping</Text>
//         </TouchableOpacity>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView className="flex-1 bg-gray-50">
//       <ScrollView
//         className="flex-1"
//         contentContainerStyle={{ paddingHorizontal: responsiveValue(16, 24), paddingTop: responsiveValue(16, 24) }}
//       >
//         {/* Shipping Address */}
//         <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
//           <Text className="text-lg font-semibold mb-2">Shipping Address</Text>
//           {addresses.map((address) => (
//             <View
//               key={address._id}
//               className={`border p-4 rounded-lg mb-2 ${selectedAddress === address._id ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
//             >
//               <TouchableOpacity
//                 className="absolute top-2 right-2 z-10"
//                 onPress={() => {
//                   Alert.alert('Delete Address', 'Are you sure?', [
//                     { text: 'Cancel' },
//                     {
//                       text: 'Delete',
//                       style: 'destructive',
//                       onPress: async () => {
//                         await customerAPI.deleteAddress(address._id);
//                         fetchCartAndAddresses();
//                       }
//                     }
//                   ]);
//                 }}
//               >
//                 <Trash2 size={16} color="#ef4444" />
//               </TouchableOpacity>
//               <TouchableOpacity onPress={() => setSelectedAddress(address._id)}>
//                 <Text className="font-semibold">{user ? user.name : ''}</Text>
//                 <Text>{address.street}, {address.city}</Text>
//                 <Text>{address.state}, {address.postalCode}</Text>
//                 <Text>{address.country}</Text>
//               </TouchableOpacity>
//             </View>
//           ))}
//           <TouchableOpacity onPress={() => navigation.navigate("AddAddress")}>
//             <Text className="text-green-600 font-semibold mt-2">Add New Address</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Map View */}
//         <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
//           <Text className="text-lg font-semibold mb-2">Your Location</Text>

//           {locationError && (
//             <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-2">
//               <Text className="text-yellow-700 text-xs">{locationError}</Text>
//             </View>
//           )}

//           <View style={{ height: 220, borderRadius: 12, overflow: 'hidden' }}>
//             {isLoadingLocation ? (
//               <View className="flex-1 justify-center items-center bg-gray-100">
//                 <ActivityIndicator size="large" color="#059669" />
//                 <Text className="text-gray-500 mt-2">Getting your location...</Text>
//               </View>
//             ) : region ? (
//               <MapView
//                 style={{ flex: 1 }}
//                 provider={PROVIDER_GOOGLE}
//                 region={region}
//                 showsUserLocation={true}
//                 showsMyLocationButton={true}
//                 showsCompass={true}
//                 showsScale={true}
//                 zoomEnabled={true}
//                 scrollEnabled={true}
//                 rotateEnabled={true}
//                 pitchEnabled={true}
//                 mapType="standard"
//                 onMapReady={() => console.log('Map is ready')}
//                 onError={(error) => {
//                   console.log('Map loading error:', error);
//                   setMapError('Failed to load map. Please check your internet connection.');
//                 }}
//                 onRegionChangeComplete={setRegion}
//               >
//                 {location && (
//                   <Marker
//                     coordinate={location}
//                     title="Your Location"
//                     description="Your current location"
//                     pinColor="#059669"
//                     draggable={true}
//                     onDragEnd={(e) => {
//                       const newCoords = e.nativeEvent.coordinate;
//                       setLocation(newCoords);
//                       setRegion({
//                         ...newCoords,
//                         latitudeDelta: 0.02,
//                         longitudeDelta: 0.02,
//                       });
//                     }}
//                   />
//                 )}
//               </MapView>
//             ) : (
//               <View className="flex-1 justify-center items-center bg-gray-100">
//                 <Text className="text-gray-500">Map not available</Text>
//               </View>
//             )}
//           </View>

//           {mapError && (
//             <View className="bg-red-50 border border-red-200 rounded-lg p-2 mt-2">
//               <Text className="text-red-700 text-xs">{mapError}</Text>
//             </View>
//           )}

//           {/* Location Coordinates */}
//           {location && (
//             <View className="mt-2 p-2 bg-gray-50 rounded-lg">
//               <Text className="text-xs text-gray-600">
//                 Latitude: {location.latitude.toFixed(6)}
//               </Text>
//               <Text className="text-xs text-gray-600">
//                 Longitude: {location.longitude.toFixed(6)}
//               </Text>
//             </View>
//           )}

//           <TouchableOpacity
//             onPress={async () => {
//               if (location) {
//                 try {
//                   // Get address from coordinates using reverse geocoding
//                   const result = await Location.reverseGeocodeAsync(location, {
//                     useGoogleMaps: true,
//                   });

//                   let suggestedAddress = '';
//                   if (result && result.length > 0) {
//                     const addr = result[0];
//                     const addressParts = [];

//                     // Build address string
//                     if (addr.streetNumber) addressParts.push(addr.streetNumber);
//                     if (addr.street) addressParts.push(addr.street);
//                     if (addr.district && addr.district !== addr.city) addressParts.push(addr.district);
//                     if (addr.city) addressParts.push(addr.city);
//                     if (addr.region) addressParts.push(addr.region);
//                     if (addr.postalCode) addressParts.push(addr.postalCode);
//                     if (addr.country && addr.country !== 'India') addressParts.push(addr.country);

//                     suggestedAddress = addressParts.filter(Boolean).join(', ');
//                   }

//                   navigation.navigate('AddAddress', {
//                     latitude: location.latitude,
//                     longitude: location.longitude,
//                     suggestedAddress: suggestedAddress || `Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
//                   });
//                 } catch (error) {
//                   console.error('Error getting address:', error);
//                   // Fallback to coordinates
//                   navigation.navigate('AddAddress', {
//                     latitude: location.latitude,
//                     longitude: location.longitude,
//                     suggestedAddress: `Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
//                   });
//                 }
//               } else {
//                 Alert.alert('Location Not Available', 'Please wait for your location to load or enable location services.');
//               }
//             }}
//             className="mt-3 bg-green-600 py-3 rounded-xl"
//           >
//             <Text className="text-white text-center font-semibold">
//               Add Address from Current Location
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* Payment Method */}
//         <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
//           <Text className="text-lg font-semibold mb-2">Payment Method</Text>
//           <TouchableOpacity
//             className={`border p-4 rounded-lg flex-row justify-between items-center ${paymentMethod === 'Cash on Delivery' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
//             onPress={() => {
//               setPaymentMethod('Cash on Delivery');
//               setPaymentModalVisible(false);
//             }}
//           >
//             <View className="flex-row items-center">
//               <CreditCard size={20} color="#6b7280" />
//               <Text className="ml-4">Cash on Delivery (COD)</Text>
//             </View>
//             {paymentMethod === 'Cash on Delivery' && <CheckCircle size={18} color="#059669" />}
//           </TouchableOpacity>

//           <TouchableOpacity
//             className={`border p-4 rounded-lg flex-row justify-between items-center mt-2 ${paymentMethod === 'Online Payment' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
//             onPress={() => {
//               setPaymentMethod('Online Payment');
//               setPaymentModalVisible(true);
//               setSelectedPayment('razorpay');
//             }}
//           >
//             <View className="flex-row items-center">
//               <CreditCard size={20} color="#6b7280" />
//               <Text className="ml-4">Online Payment</Text>
//             </View>
//             {paymentMethod === 'Online Payment' && <CheckCircle size={18} color="#059669" />}
//           </TouchableOpacity>
//         </View>

//         {/* Order Summary */}
//         <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
//           <View className="flex-row justify-between items-center mb-2">
//             <Text className="text-lg font-semibold">Order Summary</Text>
//           </View>
//           {cart.items.map((item) => (
//             <View key={item.product?._id || item.product} className="flex-row justify-between items-center mb-2">
//               <Text>{item.product?.name || item.name} x{item.quantity}</Text>
//               <Text>₹{(item.product?.price ? item.product.price * item.quantity : item.price * item.quantity).toFixed(2)}</Text>
//             </View>
//           ))}
//           <View className="border-t border-gray-200 mt-2 pt-2">
//             <View className="flex-row justify-between">
//               <Text>Subtotal</Text><Text>₹{cart.subtotal.toFixed(2)}</Text>
//             </View>
//             <View className="flex-row justify-between">
//               <Text>GST</Text><Text>₹{cart.gst.toFixed(2)}</Text>
//             </View>
//             <View className="flex-row justify-between">
//               <Text>Platform Fee</Text><Text>₹{cart.platformFee.toFixed(2)}</Text>
//             </View>
//             {totalHandlingFee > 0 && (
//               <View className="flex-row justify-between">
//                 <Text>Handling Fee</Text><Text>₹{totalHandlingFee.toFixed(2)}</Text>
//               </View>
//             )}
//             <View className="flex-row justify-between">
//               <Text>Shipping</Text><Text>₹{cart.shipping.toFixed(2)}</Text>
//             </View>
//             <View className="flex-row justify-between font-bold mt-1">
//               <Text>Total</Text><Text>₹{cart.total.toFixed(2)}</Text>
//             </View>
//           </View>
//         </View>
//       </ScrollView>

//       {/* Bottom Action Button */}
//       <View
//         className="bg-white border-t border-gray-200 p-4"
//         style={{ paddingHorizontal: responsiveValue(16, 24) }}
//       >
//         <TouchableOpacity
//           onPress={handlePlaceOrder}
//           disabled={isPlacingOrder}
//           style={{ borderRadius: 12, overflow: 'hidden' }}
//         >
//           <LinearGradient
//             colors={["#10b981", "#059669"]}
//             className="py-4 flex-row items-center justify-center rounded-xl"
//           >
//             <CheckCircle
//               width={responsiveValue(16, 18)}
//               height={responsiveValue(16, 18)}
//               color="#fff"
//             />
//             <Text
//               className="text-white font-semibold text-sm ml-1.5"
//               style={{ fontSize: responsiveValue(14, 16) }}
//             >
//               {isPlacingOrder
//                 ? 'Placing Order...'
//                 : paymentMethod === 'Online Payment'
//                   ? 'Pay & Place Order'
//                   : `Place Order - ₹${cart.total.toFixed(2)}`}
//             </Text>
//           </LinearGradient>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default CheckoutScreen;
