import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Heart,
  Package,
  ShoppingCart,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react-native";
import { useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppContext } from "../context/AppContext";
import { cartAPI } from "../services/api";

const { width, height } = Dimensions.get("window");
const isSmallDevice = width < 375;
const isLargeDevice = width > 414;
const ITEM_WIDTH = (width - 36) / 2;
const ITEM_HEIGHT = isSmallDevice ? 160 : isLargeDevice ? 200 : 180;

export default function WishlistScreen() {
  const {
    wishlistItems,
    removeFromWishlist,
    updateCartItems,
    cartItems,
    updateWishlistItems,
  } = useAppContext();
  const navigation = useNavigation();
  const [animatedValues] = useState(new Map());
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    confirmText: "OK",
    cancelText: "Cancel",
    onConfirm: () => {},
    onCancel: () => {},
    showCancel: false,
  });

  const getAnimatedValue = (id) => {
    const key = id || "default";
    if (!animatedValues.has(key)) {
      animatedValues.set(key, new Animated.Value(1));
    }
    return animatedValues.get(key);
  };

  const openModal = (config) => {
    setModalConfig(config);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleAddToCart = async (item) => {
    const isOutOfStock = !item.inStock && !(item.stockQuantity > 0);
    if (isOutOfStock) {
      openModal({
        title: "Out of Stock",
        message: `${item.name} is currently out of stock`,
        confirmText: "OK",
        onConfirm: closeModal,
        showCancel: false,
      });
      return;
    }

    const animatedValue = getAnimatedValue(item._id || item.id);
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 0.98,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
    try {
      const response = await cartAPI.addToCart({
        productId: item._id || item.id,
        quantity: 1,
      });
      updateCartItems(response.data.data.cart.items);
      openModal({
        title: "Added to Cart",
        message: `${item.name} has been added to your cart`,
        confirmText: "OK",
        onConfirm: closeModal,
        showCancel: false,
      });
    } catch (error) {
      console.error("Failed to add:", error);
      openModal({
        title: "Error",
        message: "Could not add item to cart. Please try again.",
        confirmText: "OK",
        onConfirm: closeModal,
        showCancel: false,
      });
    }
  };

  const handleBuyNow = (item) => {
    const isOutOfStock = !item.inStock && !(item.stockQuantity > 0);
    if (isOutOfStock) {
      openModal({
        title: "Out of Stock",
        message: `${item.name} is currently out of stock`,
        confirmText: "OK",
        onConfirm: closeModal,
        showCancel: false,
      });
      return;
    }

    navigation.navigate("OrderSummary", {
      items: [{ ...item, quantity: 1 }],
    });
  };

  const handleRemoveFromWishlist = (item) => {
    openModal({
      title: "Remove from Wishlist",
      message: `Remove "${item.name}" from your wishlist?`,
      confirmText: "Remove",
      cancelText: "Cancel",
      onConfirm: () => {
        const animatedValue = getAnimatedValue(item._id || item.id);
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start(() => {
          removeFromWishlist(item._id || item.id);
          closeModal();
        });
      },
      onCancel: closeModal,
      showCancel: true,
    });
  };

  const renderItem = ({ item }) => {
    const animatedValue = getAnimatedValue(item._id || item.id);
    const isOutOfStock = !item.inStock && !(item.stockQuantity > 0);
    const isLowStock = !isOutOfStock && item.stockQuantity > 0 && item.stockQuantity < 5;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate("ProductDetails", { product: item })}
        disabled={isOutOfStock}
      >
        <Animated.View
          style={{
            transform: [{ scale: animatedValue }],
            opacity: animatedValue,
            width: ITEM_WIDTH,
            marginBottom: 16,
          }}
        >
          <View
            className="bg-white rounded-2xl overflow-hidden"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            {/* Image */}
            <View className="relative">
              <Image
                source={{
                  uri:
                    (item.images && item.images[0]?.url) ||
                    item.image ||
                    "https://via.placeholder.com/256?text=No+Image",
                }}
                style={{ width: "100%", height: ITEM_HEIGHT }}
                className="rounded-t-2xl"
                resizeMode="cover"
              />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.05)"]}
                className="absolute bottom-0 left-0 right-0 h-12"
              />
              <View
                className="absolute top-2 left-2 bg-red-500 rounded-full px-2 py-1 flex-row items-center"
                style={{
                  shadowColor: "#ef4444",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.3,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <Heart
                  size={isSmallDevice ? 10 : 12}
                  color="white"
                  fill="white"
                />
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveFromWishlist(item)}
                className="absolute top-2 right-2 bg-white/95 rounded-full p-1.5"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <Trash2 size={isSmallDevice ? 14 : 16} color="#ef4444" />
              </TouchableOpacity>
              {isOutOfStock ? (
                <View className="absolute bottom-2 right-2 bg-red-600 rounded-lg px-2 py-1">
                  <Text className="text-white text-xs font-bold">Out of Stock</Text>
                </View>
              ) : item.offerPercentage > 0 ? (
                <View className="absolute bottom-2 right-2 bg-emerald-500 rounded-lg px-2 py-1">
                  <Text className="text-white text-xs font-bold">
                    -{Math.round(item.offerPercentage)}%
                  </Text>
                </View>
              ) : null}
              {isLowStock && (
                <View className="absolute bottom-2 left-2 bg-amber-500 rounded-lg px-2 py-1">
                  <Text className="text-white text-xs font-bold">Only {item.stockQuantity} left</Text>
                </View>
              )}
            </View>

            {/* Product Content */}
            <View className="p-3">
              <Text
                className={`${isSmallDevice ? "text-xs" : "text-sm"} font-bold text-gray-900 mb-1.5`}
                numberOfLines={2}
                style={{ lineHeight: isSmallDevice ? 16 : 18 }}
              >
                {item.name}
              </Text>

              {/* Rating */}
              <View className="flex-row items-center mb-2">
                <View className="flex-row items-center mr-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={isSmallDevice ? 10 : 12}
                      color={
                        i < Math.round(item.averageRating || 0)
                          ? "#f59e0b"
                          : "#e5e7eb"
                      }
                      fill={
                        i < Math.round(item.averageRating || 0)
                          ? "#f59e0b"
                          : "none"
                      }
                    />
                  ))}
                </View>
                <Text className="text-gray-500 text-xs">
                  ({item.averageRating || 0})
                </Text>
              </View>

              {/* Price */}
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  {item.discountedPrice && item.discountedPrice < item.price ? (
                    <>
                      <Text className="text-gray-400 line-through text-xs mr-1">
                        ₹{item.price}
                      </Text>
                      <Text
                        className={`text-gray-900 font-bold ${isSmallDevice ? "text-sm" : "text-base"}`}
                      >
                        ₹{item.discountedPrice}
                      </Text>
                    </>
                  ) : (
                    <Text
                      className={`text-gray-900 font-bold ${isSmallDevice ? "text-sm" : "text-base"}`}
                    >
                      ₹{item.price}
                    </Text>
                  )}
                </View>
                {item.discountedPrice && item.discountedPrice < item.price && !isOutOfStock && (
                  <View className="bg-emerald-50 rounded-md px-1.5 py-0.5">
                    <Text className="text-emerald-600 text-xs font-semibold">
                      Save ₹{Math.round(item.price - item.discountedPrice)}
                    </Text>
                  </View>
                )}
              </View>

              {/* Buttons */}
              <View className="flex-row justify-between gap-4">
                <TouchableOpacity
                  onPress={() => handleAddToCart(item)}
                  className="flex-1 overflow-hidden rounded-xl"
                  style={{
                    shadowColor: "#059669",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 1.15,
                    shadowRadius: 4,
                    elevation: 2,
                    opacity: isOutOfStock ? 0.6 : 1,
                  }}
                  disabled={isOutOfStock}
                >
                  <LinearGradient
                    colors={["#10b981", "#059669"]}
                    className="py-2.5 flex-row items-center justify-center"
                  >
                    <ShoppingCart
                      size={isSmallDevice ? 12 : 14}
                      color="white"
                    />
                    <Text className="text-white font-semibold text-sm ml-1.5">
                      Add
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleBuyNow(item)}
                  className="flex-1 rounded-xl border border-green-500 bg-white"
                  style={{
                    opacity: isOutOfStock ? 0.6 : 1,
                  }}
                  disabled={isOutOfStock}
                >
                  <View className="py-2.5 flex-row items-center justify-center">
                    <Text className="text-green-500 font-semibold text-sm">
                      Buy Now
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View className="flex-1 justify-center items-center py-16 px-4">
      <View
        className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-3xl p-12 mb-6"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 12,
          elevation: 3,
        }}
      >
        <Package size={isSmallDevice ? 48 : 56} color="#9ca3af" />
        <View className="absolute top-8 right-8">
          <Sparkles size={isSmallDevice ? 16 : 20} color="#d1d5db" />
        </View>
      </View>
      <Text
        className={`${isSmallDevice ? "text-lg" : "text-xl"} font-bold text-gray-800 mb-2 text-center`}
      >
        Your wishlist is empty
      </Text>
      <Text className="text-gray-500 text-center px-4 leading-5">
        Discover amazing products and add them to your wishlist by tapping the
        heart icon!
      </Text>
    </View>
  );

  const fetchWishlist = async () => {
    setRefreshing(true);
    try {
      const response =
        await require("../services/api").wishlistAPI.getWishlist();
      updateWishlistItems(response.data.data.wishlist || []);
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchWishlist();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Custom Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View
            className={`bg-white rounded-xl p-6 mx-4 w-11/12 max-w-md shadow-lg`}
          >
            <Text
              className={`${isSmallDevice ? "text-lg" : "text-xl"} font-bold text-gray-800 mb-2`}
            >
              {modalConfig.title}
            </Text>
            <Text
              className={`${isSmallDevice ? "text-sm" : "text-base"} text-gray-600 mb-6`}
            >
              {modalConfig.message}
            </Text>
            <View className="flex-row justify-end space-x-4">
              {modalConfig.showCancel && (
                <TouchableOpacity
                  onPress={() => {
                    modalConfig.onCancel();
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-200"
                >
                  <Text
                    className={`${isSmallDevice ? "text-sm" : "text-base"} text-gray-800 font-semibold`}
                  >
                    {modalConfig.cancelText}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => {
                  modalConfig.onConfirm();
                }}
                className={`px-4 py-2 rounded-lg ${modalConfig.confirmText === "Remove" ? "bg-red-500" : "bg-green-500"}`}
              >
                <Text
                  className={`${isSmallDevice ? "text-sm" : "text-base"} text-white font-semibold`}
                >
                  {modalConfig.confirmText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* AppBar */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 mr-2"
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <ArrowLeft size={isSmallDevice ? 20 : 22} color="black" />
        </TouchableOpacity>
        <Text
          className={`${isSmallDevice ? "text-lg" : "text-xl"} font-bold text-black`}
        >
          My Wishlist
        </Text>
      </View>

      {/* Page Title */}
      <View className="px-4 mt-2 mb-3">
        <Text
          className={`${isSmallDevice ? "text-xl" : "text-2xl"} font-bold text-gray-900`}
        >
          Saved Items
        </Text>
        <Text className="text-gray-500 text-sm mt-0.5">
          {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"}{" "}
          saved
        </Text>
      </View>

      {/* Wishlist Items */}
      <View className="flex-1 px-4">
        <FlatList
          data={wishlistItems}
          keyExtractor={(item) =>
            item._id || item.id || Math.random().toString()
          }
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: height * 0.15,
            minHeight: height * 0.6,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#059669"]}
              progressViewOffset={isSmallDevice ? 10 : 20}
            />
          }
          ListEmptyComponent={renderEmpty}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={10}
        />
      </View>
    </SafeAreaView>
  );
}