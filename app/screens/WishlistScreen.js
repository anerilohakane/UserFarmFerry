import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Heart,
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
const ITEM_WIDTH = (width - 48) / 2;
const ITEM_HEIGHT = isSmallDevice ? 160 : 180;

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
        toValue: 0.95,
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
            className="bg-white rounded-xl overflow-hidden border border-gray-100"
          >
            {/* Image Container */}
            <View className="relative">
              <Image
                source={{
                  uri:
                    (item.images && item.images[0]?.url) ||
                    item.image ||
                    "https://via.placeholder.com/256?text=No+Image",
                }}
                style={{ width: "100%", height: ITEM_HEIGHT }}
                className="bg-gray-50"
                resizeMode="cover"
              />
              
              {/* Wishlist Badge */}
              <View className="absolute top-2 left-2">
                <View className="bg-black/80 rounded-full p-1.5">
                  <Heart size={14} color="white" fill="white" />
                </View>
              </View>

              {/* Delete Button */}
              <TouchableOpacity
                onPress={() => handleRemoveFromWishlist(item)}
                className="absolute top-2 right-2 bg-white/95 rounded-full p-1.5"
              >
                <Trash2 size={14} color="#666" />
              </TouchableOpacity>

              {/* Status Badges */}
              {isOutOfStock ? (
                <View className="absolute bottom-2 left-2 bg-gray-600 rounded px-2 py-1">
                  <Text className="text-white text-xs font-medium">Out of Stock</Text>
                </View>
              ) : item.offerPercentage > 0 ? (
                <View className="absolute bottom-2 left-2 bg-blue-500 rounded px-2 py-1">
                  <Text className="text-white text-xs font-medium">
                    -{Math.round(item.offerPercentage)}%
                  </Text>
                </View>
              ) : null}
              
              {isLowStock && (
                <View className="absolute bottom-2 right-2 bg-amber-500 rounded px-2 py-1">
                  <Text className="text-white text-xs font-medium">{item.stockQuantity} left</Text>
                </View>
              )}
            </View>

            {/* Product Info */}
            <View className="p-3">
              <Text
                className="text-sm font-medium text-gray-900 mb-2"
                numberOfLines={2}
                style={{ lineHeight: 18 }}
              >
                {item.name}
              </Text>

              {/* Rating */}
              <View className="flex-row items-center mb-2">
                <View className="flex-row items-center mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={12}
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
                      <Text className="text-gray-400 line-through text-xs mr-2">
                        ₹{item.price}
                      </Text>
                      <Text className="text-gray-900 font-semibold text-base">
                        ₹{item.discountedPrice}
                      </Text>
                    </>
                  ) : (
                    <Text className="text-gray-900 font-semibold text-base">
                      ₹{item.price}
                    </Text>
                  )}
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => handleAddToCart(item)}
                  className="flex-1 bg-black rounded-lg py-2.5 flex-row items-center justify-center"
                  disabled={isOutOfStock}
                >
                  <ShoppingCart size={14} color="white" />
                  <Text className="text-white font-medium text-sm ml-1.5">
                    Add
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => handleBuyNow(item)}
                  className="flex-1 border border-gray-300 rounded-lg py-2.5 items-center justify-center"
                  disabled={isOutOfStock}
                >
                  <Text className="text-gray-900 font-medium text-sm">
                    Buy
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View className="flex-1 justify-center items-center px-8" style={{ minHeight: height * 0.6 }}>
      {/* Icon */}
      <View className="mb-6">
        <View className="bg-gray-100 rounded-full p-6">
          <Heart size={48} color="#16A34A" />
        </View>
      </View>

      {/* Text Content */}
      <Text className="text-2xl font-semibold text-gray-900 mb-3 text-center">
        Your Wishlist is Empty
      </Text>
      
      <Text 
        className="text-gray-500 text-center mb-8"
        style={{ 
          fontSize: 16,
          lineHeight: 24 
        }}
      >
        Save items you love and they'll appear here
      </Text>

      {/* CTA Button */}
      <TouchableOpacity
  onPress={() => navigation.navigate("Home")}
  className="bg-green-600 rounded-full px-8 py-4"
>
  <Text className="text-white font-semibold text-base">
    Start Shopping
  </Text>
</TouchableOpacity>

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
    <SafeAreaView className="flex-1 bg-white">
      {/* Custom Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View className="flex-1 justify-center items-center bg-black/40">
          <View className="bg-white rounded-2xl p-6 mx-6 w-full max-w-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              {modalConfig.title}
            </Text>
            <Text className="text-gray-600 text-base mb-6">
              {modalConfig.message}
            </Text>
            <View className="flex-row justify-end space-x-3">
              {modalConfig.showCancel && (
                <TouchableOpacity
                  onPress={modalConfig.onCancel}
                  className="px-4 py-2.5 rounded-lg"
                >
                  <Text className="text-gray-600 font-medium text-base">
                    {modalConfig.cancelText}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={modalConfig.onConfirm}
                className={`px-4 py-2.5 rounded-lg ${modalConfig.confirmText === "Remove" ? "bg-red-500" : "bg-black"}`}
              >
                <Text className="text-white font-medium text-base">
                  {modalConfig.confirmText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <View className="px-6 py-4 border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-2 -ml-2"
          >
            <ArrowLeft size={20} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-gray-900 ml-2">
            Wishlist
          </Text>
        </View>
        <Text className="text-gray-500 text-sm mt-1">
          {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"}
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
            paddingBottom: 100,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#000"]}
              tintColor="#000"
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