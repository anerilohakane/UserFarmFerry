import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, ChevronRight, Filter, Heart, Leaf, Percent, Search as SearchIcon, ShoppingCart, Star, Truck, User, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { SlideInDown, SlideInRight, SlideOutLeft, SlideOutUp } from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';
import Header, { HeaderVariants } from '../components/ui/Header';
import { farmers } from '../components/ui/farmers';
import { useAppContext } from '../context/AppContext';
import { cartAPI, categoriesAPI, productsAPI } from '../services/api';

const HomeScreen = ({ navigation }) => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [currentOffer, setCurrentOffer] = useState(0);
  const scrollViewRef = useRef(null);
  const [featuredProductsY, setFeaturedProductsY] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchedProducts, setFetchedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [buyNowPressedId, setBuyNowPressedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [allCategoryProducts, setAllCategoryProducts] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [cartNotificationProduct, setCartNotificationProduct] = useState(null);

  // Get screen dimensions
  const { width, height } = Dimensions.get('window');
  const isSmallScreen = width < 375;
  const isMediumScreen = width >= 375 && width < 414;
  const isLargeScreen = width >= 414;

  // Responsive sizing utility
  const responsiveValue = (small, medium, large) => {
    if (isSmallScreen) return small;
    if (isMediumScreen) return medium;
    return large;
  };

  // Responsive padding/margin
  const responsivePadding = responsiveValue(3, 4, 5);
  const responsiveMargin = responsiveValue(2, 3, 4);

  useEffect(() => {
    (async () => {
      try {
        const res = await productsAPI.getProducts();
        const products = (res?.data?.data?.products || []).map(p => ({
          ...p,
          id: p._id,
          image: p.images?.[0]?.url || '',
          discount: p.offerPercentage,
          rating: p.averageRating,
          reviews: p.totalReviews,
          farmer: p.supplierId?.businessName || '',
          category: p.categoryId?.name || '',
          price: (p.discountedPrice > 0) ? p.discountedPrice : p.price,
          originalPrice: p.price,
          stockQuantity: typeof p.stockQuantity === 'number' ? p.stockQuantity : 0,
          inStock: (typeof p.stockQuantity === 'number' ? p.stockQuantity : 0) > 0,
        }));
        setFetchedProducts(products);
        setFilteredProducts(products);
      } catch (err) {
        console.error('Failed to fetch products:', err?.response?.data || err.message);
      } finally {
        setLoadingProducts(false);
      }
    })();
  }, []);

  // Fetch all products from the system (simpler approach)
  const fetchAllProducts = async () => {
    try {
      setLoadingSearch(true);
      
      // Fetch all products without category filtering to get comprehensive results
      const allProductsRes = await productsAPI.getProducts({ limit: 1000 });
      const allProducts = (allProductsRes?.data?.data?.products || []).map(p => ({
        ...p,
        id: p._id,
        image: p.images?.[0]?.url || '',
        discount: p.offerPercentage,
        rating: p.averageRating,
        reviews: p.totalReviews,
        farmer: p.supplierId?.businessName || '',
        category: p.categoryId?.name || '',
        price: (p.discountedPrice > 0) ? p.discountedPrice : p.price,
        originalPrice: p.price,
        stockQuantity: typeof p.stockQuantity === 'number' ? p.stockQuantity : 0,
        inStock: (typeof p.stockQuantity === 'number' ? p.stockQuantity : 0) > 0,
      }));
      
      setAllCategoryProducts(allProducts);
      return allProducts;
    } catch (error) {
      console.error('Failed to fetch all products:', error);
      return [];
    } finally {
      setLoadingSearch(false);
    }
  };

  // Handle search functionality with comprehensive product search
  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim() === '') {
        setFilteredProducts(fetchedProducts);
        setIsSearchActive(false);
      } else {
        setIsSearchActive(true);
        setLoadingSearch(true);
        
        // If we don't have all products cached, fetch them
        let allProducts = allCategoryProducts;
        if (allCategoryProducts.length === 0) {
          allProducts = await fetchAllProducts();
        }
        
        // Search in all products (includes subcategory products)
        const searchResults = allProducts.filter(product => {
          const query = searchQuery.toLowerCase();
          return (
            (product.name && product.name.toLowerCase().includes(query)) ||
            (product.category && product.category.toLowerCase().includes(query)) ||
            (product.farmer && product.farmer.toLowerCase().includes(query)) ||
            (product.description && product.description.toLowerCase().includes(query))
          );
        });
        
        setFilteredProducts(searchResults);
        setLoadingSearch(false);
      }
    };
    
    // Debounce search to avoid too many API calls
    const searchTimeout = setTimeout(performSearch, 300);
    return () => clearTimeout(searchTimeout);
  }, [searchQuery, fetchedProducts, allCategoryProducts]);

  // Fetch categories
  useEffect(() => {
    (async () => {
      try {
        const res = await categoriesAPI.getCategories({ parent: 'null' });
        const cats = res?.data?.data?.categories || res?.data?.data || [];
        setCategories(cats);
      } catch (err) {
        console.error('Failed to fetch categories:', err?.response?.data || err.message);
        try {
          const fallbackRes = await categoriesAPI.getCategories();
          const allCats = fallbackRes?.data?.data?.categories || fallbackRes?.data?.data || [];
          const parentCategories = allCats.filter(cat => !cat.parent);
          setCategories(parentCategories);
        } catch (fallbackErr) {
          console.error('Fallback category fetch also failed:', fallbackErr);
        }
      } finally {
        setLoadingCategories(false);
      }
    })();
  }, []);

  const { cartItems, wishlistItems, updateCartItems, addToWishlist, removeFromWishlist } = useAppContext();
  const allProducts = fetchedProducts.length ? fetchedProducts : featuredProducts;

  const banners = [
    {
      id: 1,
      title: 'Free Delivery',
      subtitle: 'On order ₹500',
      description: 'Limited time offer - Direct from farm to your doorstep',
      icon: <Percent width={24} height={24} color="#fff" />,
      tag: 'Limited Time',
      gradient: 'bg-gradient-to-r from-green-500 to-emerald-700',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXoXvo9LcdoOtIf2eedVwHvi2i01qVBIMrjQ&s',
    },
    {
      id: 2,
      title: 'Organic Week',
      subtitle: '15% OFF Organic Products',
      description: 'Go organic for better health and environment',
      icon: <Leaf width={24} height={24} color="#fff" />,
      tag: 'Health First',
      gradient: ['#84cc16', '#65a30d'],
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80',
      buttonText: 'Explore Organic',
      buttonColor: '#ffffff',
      buttonTextColor: '#65a30d'
    }
  ];

  const specialOffers = [
    {
      id: 2,
      title: 'Organic Week',
      subtitle: '15% OFF on Organic',
      description: 'Premium quality organic produce',
      icon: <Leaf size={24} color="#fff" />,
      bgColor: '#f0fdf4', // Light green background
      borderColor: '#bbf7d0', // Light green border
      iconBg: '#16a34a', // Green icon background
      textColor: '#166534', // Dark green text
      highlightText: 'ORGANIC15',
      cta: 'Shop Organic',
      ctaColor: '#fff',
      expiration: 'Limited time only'
    },
    {
      id: 3,
      title: 'New Customer',
      subtitle: '10% OFF on First Order',
      description: 'Welcome discount for new customers',
      icon: <User size={24} color="#fff" />,
      bgColor: '#eff6ff', // Light blue background
      borderColor: '#dbeafe', // Light blue border
      iconBg: '#2563eb', // Blue icon background
      textColor: '#1e40af', // Dark blue text
      highlightText: 'WELCOME10',
      cta: 'Start Shopping',
      ctaColor: '#fff',
      expiration: 'First order only'
    },
    {
      id: 4,
      title: 'Free Delivery',
      subtitle: 'On orders above ₹500',
      description: 'No delivery charges for all orders',
      icon: <Truck size={24} color="#fff" />,
      bgColor: '#fff7ed',  // Light orange background
      borderColor: '#fed7aa', // Light orange border
      iconBg: '#f97316', // Orange icon background
      textColor: '#9a3412', // Dark orange text
      highlightText: 'FREESHIP',
      cta: 'Shop Now',
      ctaColor: '#fff',
      expiration: 'Limited period offer'
    }
  ];

  const renderOfferItem = ({ item }) => {
    return (
      <Animated.View
        entering={SlideInRight.duration(500)}
        exiting={SlideOutLeft.duration(500)}
        className="flex-1 mx-2 rounded-2xl overflow-hidden shadow-xl border-2"
        style={{
          backgroundColor: item.bgColor,
          borderColor: item.borderColor
        }}
      >
        <View className="h-full p-6 justify-between">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text
                className="text-sm font-medium mb-1"
                style={{ color: item.textColor }}
              >
                {item.subtitle}
              </Text>
              <Text
                className="text-2xl font-bold mb-2"
                style={{ color: item.textColor }}
              >
                {item.title}
              </Text>
              <Text
                className="text-xs"
                style={{ color: item.textColor, opacity: 0.8 }}
              >
                {item.description}
              </Text>
              <View className="mt-2">
                <Text
                  className="text-xs italic"
                  style={{ color: item.textColor, opacity: 0.7 }}
                >
                  {item.expiration}
                </Text>
              </View>
            </View>
            <View
              className="w-12 h-12 rounded-full justify-center items-center shadow-md"
              style={{ backgroundColor: item.iconBg }}
            >
              {item.icon}
            </View>
          </View>

          <View className="flex-row justify-between items-center mt-6">
            <View
              className="rounded-lg px-3 py-2"
              style={{ backgroundColor: `${item.iconBg}20` }} // 20% opacity of icon color
            >
              <Text
                className="font-bold text-xs"
                style={{ color: item.textColor }}
              >
                Use code: {item.highlightText}
              </Text>
            </View>

            <TouchableOpacity
              className="rounded-lg px-4 py-2"
              style={{ backgroundColor: item.iconBg }}
              onPress={() => navigation.navigate('Products')}
            >
              <Text className="text-white font-semibold text-sm">
                {item.cta}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  const featuredProducts = [
    {
      id: '1',
      _id: '1',
      name: 'Organic Tomatoes',
      image: 'https://images.unsplash.com/photo-1594282402317-6af14d6ab718?w=800&h=800&fit=crop',
      discount: 15,
      rating: 4.5,
      reviews: 128,
      farmer: 'Green Valley Farms',
      category: 'Vegetables',
      price: 45,
      originalPrice: 53,
      categoryId: 'vegetables',
      description: 'Fresh organic tomatoes grown without pesticides',
      stock: 50,
      supplierId: {
        businessName: 'Green Valley Farms'
      }
    },
  ];

  useEffect(() => {
    const bannerInterval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => {
      clearInterval(bannerInterval);
    };
  }, []);

  const isInWishlist = (id) => wishlistItems.some((item) => item && item._id === id);
  const isInCart = (id) => cartItems.some((item) => item && item._id === id);

  const toggleWishlist = async (product) => {
    const productId = product._id;
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(product);
    }
  };

  const handleAddToCart = async (product) => {
    const productId = product._id || product.id;
    if (!product.inStock && !(product.stockQuantity > 0)) {
      // Show error notification
      setCartNotificationProduct({ 
        name: 'Out of stock', 
        error: true, 
        message: 'This product is currently out of stock' 
      });
      setShowCartNotification(true);
      setTimeout(() => setShowCartNotification(false), 3000);
      return;
    }
    if (!isInCart(productId)) {
      try {
        const response = await cartAPI.addToCart({ productId, quantity: 1 });
        updateCartItems(response.data.data.cart.items);
        
        // Show custom notification instead of Alert
        setCartNotificationProduct(product);
        setShowCartNotification(true);
        
        // Auto hide after 3 seconds
        setTimeout(() => {
          setShowCartNotification(false);
        }, 3000);
      } catch (error) {
        console.error('Failed to add to cart:', error);
        
        // Show error notification
        setCartNotificationProduct({ 
          name: 'Error', 
          error: true, 
          message: 'Could not add item to cart' 
        });
        setShowCartNotification(true);
        
        setTimeout(() => {
          setShowCartNotification(false);
        }, 3000);
      }
    }
  };

  const scrollToFeaturedProducts = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: featuredProductsY, animated: true });
    }
  };

  const CategoryItem = ({ item }) => {
    const categoryItemSize = responsiveValue(width * 0.28, width * 0.23, width * 0.18);
    const imageSize = responsiveValue(60, 70, 80);

    return (
      <View className={`items-center mb-4`} style={{ width: categoryItemSize }}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Subcategories', { category: item })}
        >
          <View className={`bg-white rounded-2xl p-2 mb-2 shadow-sm border border-gray-100`}>
            <View className="w-full aspect-square rounded-xl overflow-hidden">
              <Image
                source={
                  item.image && typeof item.image === 'object' && item.image.url
                    ? { uri: item.image.url }
                    : item.image && typeof item.image === 'string' && item.image.trim() !== ''
                      ? { uri: item.image }
                      : { uri: 'https://via.placeholder.com/100' }
                }
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            </View>
          </View>
          <Text className={`${responsiveValue('text-xs', 'text-sm', 'text-sm')} font-semibold text-gray-800 text-center`} numberOfLines={1}>
            {item.name}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFarmerItem = ({ item }) => {
    const farmerItemWidth = responsiveValue(140, 160, 180);
    const farmerImageSize = responsiveValue(16, 18, 20);

    return (
      <View className={`bg-white rounded-3xl p-4 items-center shadow-md border border-gray-100 mr-4`}
        style={{ width: farmerItemWidth }}>
        <View className="relative mb-3">
          <Image
            source={{ uri: item.image }}
            style={{
              width: farmerImageSize,
              height: farmerImageSize,
              borderRadius: farmerImageSize / 2,
              borderWidth: 2,
              borderColor: '#f3f4f6'
            }}
          />
          {item.verified && (
            <View className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-green-500 justify-center items-center border-2 border-white">
              <Text className="text-white text-xs">✓</Text>
            </View>
          )}
        </View>
        <Text className={`${responsiveValue('text-xs', 'text-sm', 'text-sm')} font-bold text-gray-800 mb-0.5 text-center`} numberOfLines={1}>{item.name}</Text>
        <Text className={`text-xs text-gray-500 mb-0.5 text-center`} numberOfLines={1}>{item.farm}</Text>
        <Text className={`text-xs text-green-500 font-medium mb-0.5 text-center`} numberOfLines={1}>{item.location}</Text>
        <View className="flex-row items-center bg-amber-50 rounded-lg px-2 py-1 border border-amber-200 mt-2">
          <Star width={12} height={12} fill="#facc15" color="#facc15" />
          <Text className="text-xs font-bold text-amber-800 ml-1">{item.rating}</Text>
        </View>
      </View>
    );
  };

  const renderProductItem = ({ item }) => {
    const productId = item._id || item.id;
    const inWishlist = isInWishlist(productId);
    const inCart = isInCart(productId);
    const isOutOfStock = !item.inStock && !(item.stockQuantity > 0);
    const isLowStock = !isOutOfStock && (typeof item.stockQuantity === 'number' ? item.stockQuantity : 0) > 0 && (typeof item.stockQuantity === 'number' ? item.stockQuantity : 0) < 5;
    const productHeight = responsiveValue(120, 140, 160);
    const productPadding = responsiveValue(2, 3, 3);
    const productTextSize = responsiveValue('text-xs', 'text-sm', 'text-sm');

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('ProductDetails', { product: item })}
        activeOpacity={0.9}
        className={`mb-2 mx-1 ${isLargeScreen ? 'w-[48%]' : 'w-[47%]'}`}
      >
        <View className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <View className="relative">
            <Image
              source={{ uri: item.image }}
              className="w-full"
              style={{ height: productHeight }}
              resizeMode="cover"
            />
            <View className="absolute inset-0 bg-black/20" />
            {isOutOfStock ? (
              <View className="absolute top-2 left-2 bg-red-600 px-2 py-1 rounded-lg shadow-md">
                <Text className="text-white text-xs font-bold">Out of stock</Text>
              </View>
            ) : item.discount && (
              <View className="absolute top-2 left-2 bg-red-500 px-2 py-1 rounded-lg shadow-md">
                <Text className="text-white text-xs font-bold">{Number(item.discount).toFixed(2)}% OFF</Text>
              </View>
            )}
            {isLowStock && (
              <View className="absolute bottom-2 left-2 bg-amber-500 px-2 py-1 rounded-lg shadow-md">
                <Text className="text-white text-xs font-bold">Only {item.stockQuantity} left</Text>
              </View>
            )}
            <TouchableOpacity
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 justify-center items-center shadow-sm"
              onPress={(e) => {
                e.stopPropagation();
                toggleWishlist(item);
              }}
            >
              <Heart
                width={16}
                height={16}
                color={inWishlist ? '#ef4444' : '#9ca3af'}
                fill={inWishlist ? '#ef4444' : 'none'}
              />
            </TouchableOpacity>
          </View>
          <View className={`p-${productPadding}`}>
            <Text className={`${productTextSize} font-bold text-gray-800 mb-1`} numberOfLines={1}>{item.name}</Text>
            <Text className="text-xs text-green-500 font-medium mb-1" numberOfLines={1}>by {item.farmer}</Text>
            <View className="flex-row justify-between items-center mb-1">
              <Text className={`${responsiveValue('text-sm', 'text-base', 'text-base')} font-bold text-green-500`}>₹{item.price}</Text>
              {(item.discountedPrice > 0) && (
                <Text className="text-xs text-gray-400 line-through">
                  ₹{item.originalPrice}
                </Text>
              )}
              <View className="flex-row items-center bg-amber-50 rounded-lg px-1.5 py-1 border border-amber-200">
                <Star width={10} height={10} fill="#facc15" color="#facc15" />
                <Text className="text-xs text-amber-800 ml-1">{item.rating}</Text>
              </View>
            </View>
            <TouchableOpacity
              className="overflow-hidden rounded-lg mt-2"
              onPress={(e) => {
                e.stopPropagation();
                handleAddToCart(item);
              }}
              disabled={inCart || isOutOfStock}
            >
              {inCart ? (
                <View className="py-2 flex-row items-center justify-center bg-gray-100 rounded-lg">
                  <Text className="text-gray-500 font-semibold text-xs">Added</Text>
                </View>
              ) : isOutOfStock ? (
                <View className="py-2 flex-row items-center justify-center bg-gray-200 rounded-lg">
                  <Text className="text-red-500 font-semibold text-xs">Out of stock</Text>
                </View>
              ) : (
                <LinearGradient
                  colors={["#fdba74", "#fb923c"]}
                  className="py-2 flex-row items-center justify-center rounded-lg"
                >
                  <ShoppingCart width={14} height={14} color="#fff" />
                  <Text className="text-white font-semibold text-sm ml-1">Add</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              className="overflow-hidden rounded-lg mt-1.5 py-2 flex-row items-center justify-center"
              onPress={async (e) => {
                e.stopPropagation();
                setBuyNowPressedId(productId);
                setTimeout(() => {
                  setBuyNowPressedId(null);
                  if (isOutOfStock) return;
                  navigation.navigate('OrderSummary', {
                    items: [{ ...item, quantity: 1 }]
                  });
                }, 150);
              }}
              style={{
                backgroundColor: isOutOfStock
                  ? '#e5e7eb'
                  : (buyNowPressedId === productId ? '#10b981': '#059669'),
              }}
              disabled={isOutOfStock}
            >
              <Text className={`font-semibold ${responsiveValue('text-xs', 'text-sm', 'text-sm')} ${isOutOfStock ? 'text-red-500' : (buyNowPressedId === productId ? 'text-white' : 'text-white')}`}>
                {isOutOfStock ? 'Out of stock' : 'Buy Now'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const fetchAllData = async () => {
    setLoadingProducts(true);
    setLoadingCategories(true);
    try {
      await Promise.all([
        productsAPI.getProducts(),
        categoriesAPI.getCategories(),
      ]);
    } catch (err) {
      console.error('Failed to fetch data:', err?.response?.data || err.message);
    } finally {
      setLoadingProducts(false);
      setLoadingCategories(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Cart Notification */}
      {showCartNotification && (
        <Animated.View 
          entering={SlideInDown.duration(300)}
          exiting={SlideOutUp.duration(300)}
          className="absolute top-16 left-4 right-4 z-50 rounded-xl overflow-hidden shadow-xl"
        >
          <LinearGradient
            colors={cartNotificationProduct?.error ? ['#ef4444', '#dc2626'] : ['#10b981', '#059669']}
            className="p-4 flex-row items-center justify-between"
          >
            <View className="flex-row items-center flex-1">
              {!cartNotificationProduct?.error && (
                <View className="w-10 h-10 rounded-lg bg-white/20 justify-center items-center mr-3">
                  <ShoppingCart width={20} height={20} color="#fff" />
                </View>
              )}
              <View className="flex-1">
                <Text className="text-white font-bold text-sm">
                  {cartNotificationProduct?.error 
                    ? cartNotificationProduct.message 
                    : 'Added to Cart'}
                </Text>
                {!cartNotificationProduct?.error && (
                  <Text className="text-white/90 text-xs mt-1">
                    {cartNotificationProduct.name} has been added to your cart
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity 
              onPress={() => setShowCartNotification(false)}
              className="p-1"
            >
              <X width={18} height={18} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      )}

      {/* Header */}
      <HeaderVariants.Main />

      {/* Search Bar */}
      <View className={`px-${responsivePadding} pt-2 pb-2`}>
        <View className={`flex-row items-center bg-white rounded-xl px-${responsivePadding} py-3 shadow-sm border border-gray-200`}>
          <SearchIcon width={20} height={20} color="#6b7280" />
          <TextInput
            placeholder="Search fresh produce, grains, organic foods..."
            placeholderTextColor="#94a3b8"
            className={`flex-1 ml-3 text-gray-800 ${responsiveValue('text-xs', 'text-sm', 'text-sm')}`}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          <View className="w-px h-6 bg-gray-200 mx-3" />
          <TouchableOpacity className="p-1">
            <Filter width={18} height={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#059669"]}
            progressViewOffset={Platform.OS === 'ios' ? responsiveValue(40, 50, 60) : 0}
          />
        }
      >
        {!isSearchActive ? (
          <>
            {/* Special Offers Carousel */}

            <View className={`h-16 mb-3`}>
              <Carousel
                width={width}
                height={60}
                data={specialOffers}
                scrollAnimationDuration={1000}
                autoPlay={true}
                autoPlayInterval={3000}
                renderItem={({ item }) => (
                  <Animated.View
                    entering={SlideInRight.duration(500)}
                    exiting={SlideOutLeft.duration(500)}
                    className="flex-1 mx-1 rounded-xl overflow-hidden shadow-sm"
                    style={{ backgroundColor: item.bgColor, borderColor: item.borderColor, borderWidth: 1 }}
                  >
                    <View className="h-full px-4 flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <View
                          className="w-8 h-8 rounded-full justify-center items-center mr-3"
                          style={{ backgroundColor: item.iconBg }}
                        >
                          {item.icon}
                        </View>
                        <View>
                          <Text
                            className="text-lg font-bold"
                            style={{ color: item.textColor }}
                            numberOfLines={1}
                          >
                            {item.title}
                          </Text>
                          <Text
                            className="text-xs font-medium"
                            style={{ color: item.textColor, opacity: 0.8 }}
                            numberOfLines={1}
                          >
                            {item.subtitle}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </Animated.View>
                )}
                mode="parallax"
                modeConfig={{
                  parallaxScrollingScale: 0.95,
                  parallaxScrollingOffset: 20,
                }}
              />
            </View>
            {/* Categories */}
            <View className={`px-${responsivePadding} mb-6`}>
              <View className="flex-row justify-between items-center mb-4">
                <Text className={`${responsiveValue('text-lg', 'text-xl', 'text-xl')} font-bold text-gray-800`}>Shop by Category</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
                  <Text className="text-green-600 font-semibold text-sm">View All</Text>
                </TouchableOpacity>
              </View>
              {loadingCategories ? (
                <Text>Loading categories...</Text>
              ) : (
                <View className="flex-row flex-wrap justify-between">
                  {categories.slice(0, 6).map((item, index) => (
                    <CategoryItem key={item._id || item.id || index} item={item} />
                  ))}
                </View>
              )}
            </View>

            {/* Banner */}
            <View className={`h-64 rounded-2xl overflow-hidden mx-${responsivePadding} mb-6 shadow-md`}>
              <Image
                source={{ uri: banners[currentBanner].image }}
                className="w-full h-full absolute"
                resizeMode="cover"
              />
              <View className="absolute inset-0 bg-black/40" />
              <View className={`flex-1 p-${responsivePadding} justify-between`}>
                <View className="flex-row justify-between items-start">
                  <View className="bg-white/20 rounded-lg px-3 py-2 border border-white/30">
                    <Text className="text-white text-xs font-bold">{banners[currentBanner].tag}</Text>
                  </View>
                  <View className="w-8 h-8 rounded-full bg-white/20 justify-center items-center">
                    {banners[currentBanner].icon}
                  </View>
                </View>
                <View className={`mb-${responsivePadding}`}>
                  <Text className={`${responsiveValue('text-xl', 'text-2xl', 'text-2xl')} font-bold text-white mb-1`}>{banners[currentBanner].title}</Text>
                  <Text className={`${responsiveValue('text-lg', 'text-lg', 'text-xl')} font-semibold text-white mb-1`}>{banners[currentBanner].subtitle}</Text>
                  <Text className={`${responsiveValue('text-xs', 'text-sm', 'text-sm')} text-white/95`}>{banners[currentBanner].description}</Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <TouchableOpacity
                    className="flex-row items-center bg-white px-5 py-2 rounded-lg"
                    onPress={scrollToFeaturedProducts}
                  >
                    <Text className="text-gray-800 font-semibold mr-2">Shop Now</Text>
                    <ArrowRight width={16} height={16} color="#1f2937" />
                  </TouchableOpacity>
                  <View className="flex-row items-center gap-4">
                    <View className="flex-row items-center bg-white/20 rounded-lg px-3 py-1.5 border border-white/30">
                      <Star width={14} height={14} fill="#facc15" color="#facc15" />
                      <Text className="text-white text-xs font-medium ml-1">4.8 Rating</Text>
                    </View>
                  </View>
                </View>
              </View>
              <View className="flex-row justify-center items-center mt-4 gap-2">
                {banners.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setCurrentBanner(index)}
                    className={`h-1.5 rounded-full ${index === currentBanner ? 'w-6 bg-green-500' : 'w-2 bg-gray-300'}`}
                  />
                ))}
              </View>
            </View>

            {/* Farmers */}
            <View className={`px-${responsivePadding} mb-6`}>
              <View className="flex-row justify-between items-center mb-4">
                <Text className={`${responsiveValue('text-lg', 'text-xl', 'text-xl')} font-bold text-gray-800`}>Popular Farmers</Text>
                <TouchableOpacity className="flex-row items-center">
                  <Text className="text-green-600 font-semibold text-sm mr-1">View All</Text>
                  <ChevronRight width={14} height={14} color="#16a34a" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={farmers}
                renderItem={renderFarmerItem}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: responsivePadding * 4 }}
              />
            </View>
          </>
        ) : null}

        {/* Featured Products - Always visible but shows search results when searching */}
        <View
          onLayout={event => setFeaturedProductsY(event.nativeEvent.layout.y)}
          className={`px-${responsivePadding} mb-6`}
        >
          {isSearchActive ? (
            <View className="flex-row justify-between items-center mb-4">
              <Text className={`${responsiveValue('text-lg', 'text-xl', 'text-xl')} font-bold text-gray-800`}>Search Results</Text>
              <Text className="text-gray-500 text-sm">{filteredProducts.length} items found</Text>
            </View>
          ) : (
            <View className="flex-row justify-between items-center mb-4">
              <Text className={`${responsiveValue('text-lg', 'text-xl', 'text-xl')} font-bold text-gray-800`}>Featured Products</Text>
              <TouchableOpacity className="flex-row items-center">
                <Text className="text-green-600 font-semibold text-sm mr-1">View All</Text>
                <ChevronRight width={14} height={14} color="#16a34a" />
              </TouchableOpacity>
            </View>
          )}

          {loadingSearch ? (
            <View className="items-center justify-center py-10">
              <Text className="text-gray-500">Searching all products...</Text>
            </View>
          ) : filteredProducts.length === 0 ? (
            <View className="items-center justify-center py-10">
              <Text className="text-gray-500">No products found matching your search</Text>
              {isSearchActive && (
                <Text className="text-gray-400 text-sm mt-2">Try searching with different keywords</Text>
              )}
            </View>
          ) : (
            <FlatList
              data={filteredProducts}
              renderItem={renderProductItem}
              keyExtractor={(item) => (item._id || item.id).toString()}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={{ gap: 8 }}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
