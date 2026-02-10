import React, { useEffect, useState, useRef } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, StatusBar, TextInput, FlatList, Dimensions, Animated, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Services (Keep your existing service calls)
import { productsAPI, categoriesAPI, cartAPI, wishlistAPI } from '../services/api';
import { CONFIG } from '../constants/config';
import { useAppContext } from '../context/AppContext';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding constrained by parent view

// --- COLORS ---
const THEME = {
  primary: '#004C46',      // Dark teal header
  background: '#f3f4f6',   // Global background
  accent: '#004C46',       // Green for buttons/tags
  text: '#1f2937',
  textLight: '#6b7280',
  white: '#ffffff',
  bannerGreen: '#004C46',  // Steal deal green

  // Category Backgrounds (Approximate from screenshots)
  catBlue: '#eef2ff',      // Light blue for Fresh/Snacks
  catPink: '#fdf2f8',      // Light pink for Grocery/Beauty
};

// --- MOCK DATA FOR EXACT VISUAL REPLICATION ---

// Default quick links (fallback if no categories)
const DEFAULT_QUICK_LINKS = [
  { id: 1, name: 'Fresh', icon: 'food-apple', type: 'mci' },
  { id: 2, name: 'Electronics', icon: 'headphones', type: 'feather' },
  { id: 3, name: 'Deals', icon: 'percent', type: 'feather' },
  { id: 4, name: 'Organic', icon: 'leaf', type: 'mci' },
  { id: 5, name: 'Health', icon: 'heart', type: 'feather' },
  { id: 6, name: 'Gifting', icon: 'gift', type: 'feather' },
];

// Default steal deals (fallback if no products)
const DEFAULT_STEAL_DEALS = [
  {
    id: 101,
    name: 'freshol Tender Coconut',
    weight: '1 pc',
    price: 62.40,
    mrp: 78,
    discount: '20% OFF',
    offer: 'Buy 1, Get 1',
    image: 'https://cdn.pixabay.com/photo/2017/02/06/11/26/coconut-2042898_1280.jpg',
    time: '5 mins'
  },
  {
    id: 102,
    name: 'freshol Onion',
    weight: '1 kg',
    price: 10,
    mrp: 44,
    discount: '77% OFF',
    offer: 'Har Din Sasta!',
    image: 'https://cdn.pixabay.com/photo/2016/03/05/19/33/onion-1238466_1280.jpg',
    time: '5 mins'
  },
  {
    id: 103,
    name: 'bb Popular Arhar Dal',
    weight: '1 kg - Pouch',
    price: 99,
    mrp: 190,
    discount: '48% OFF',
    offer: 'Exclusive Offer',
    image: 'https://cdn.pixabay.com/photo/2014/12/22/16/05/lentils-577607_1280.jpg',
    time: '5 mins'
  }
];

// Exact sections from Image 1
const CATEGORY_GROUPS = [
  {
    title: "Fresh",
    bgColor: THEME.catBlue,
    data: [
      { name: "Fruits & veggies", img: "https://cdn-icons-png.flaticon.com/512/3194/3194591.png" },
      { name: "Bakery & batters", img: "https://cdn-icons-png.flaticon.com/512/992/992747.png" },
      { name: "Dairy", img: "https://cdn-icons-png.flaticon.com/512/2674/2674486.png" },
      { name: "Eggs, meat & fish", img: "https://cdn-icons-png.flaticon.com/512/1046/1046774.png" },
    ]
  },
  {
    title: "Grocery & kitchen",
    bgColor: THEME.catPink,
    data: [
      { name: "Atta, rice & dals", img: "https://cdn-icons-png.flaticon.com/512/2829/2829768.png" },
      { name: "Oils, ghee & masala", img: "https://cdn-icons-png.flaticon.com/512/3014/3014521.png" },
      { name: "Dry fruits & cereals", img: "https://cdn-icons-png.flaticon.com/512/5029/5029236.png" },
      { name: "Kitchenware & appliances", img: "https://cdn-icons-png.flaticon.com/512/3565/3565418.png" },
    ]
  },
  {
    title: "Snacks & drinks",
    bgColor: THEME.catBlue,
    data: [
      { name: "Hot & cold beverages", img: "https://cdn-icons-png.flaticon.com/512/3050/3050115.png" },
      { name: "Namkeen & chips", img: "https://cdn-icons-png.flaticon.com/512/2553/2553691.png" },
      { name: "Biscuits & cookies", img: "https://cdn-icons-png.flaticon.com/512/541/541732.png" },
      { name: "Instant & frozen food", img: "https://cdn-icons-png.flaticon.com/512/2722/2722160.png" },
    ]
  },
  {
    title: "Beauty & personal care",
    bgColor: THEME.catPink,
    data: [
      { name: "Bath & oral care", img: "https://cdn-icons-png.flaticon.com/512/2553/2553644.png" },
      { name: "Hair", img: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" },
      { name: "Beauty & cosmetics", img: "https://cdn-icons-png.flaticon.com/512/3460/3460335.png" },
      { name: "Men's grooming", img: "https://cdn-icons-png.flaticon.com/512/10090/10090400.png" },
    ]
  },
  {
    title: "Household essentials",
    bgColor: THEME.catBlue,
    data: [
      { name: "Electronics", img: "https://cdn-icons-png.flaticon.com/512/3659/3659899.png" },
      { name: "Cleaners & repellents", img: "https://cdn-icons-png.flaticon.com/512/2203/2203124.png" },
      { name: "Home appliances", img: "https://cdn-icons-png.flaticon.com/512/1261/1261106.png" },
      { name: "Home & lifestyle", img: "https://cdn-icons-png.flaticon.com/512/2933/2933683.png" },
    ]
  }
];


const HomeScreen = () => {
  const navigation = useNavigation();
  const { wishlistItems, addToWishlist, removeFromWishlist, cartItems, addToCart: addToCartContext } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;

  // State for dynamic data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryGroups, setCategoryGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [addingToCart, setAddingToCart] = useState(null);
  // const [showCartPopup, setShowCartPopup] = useState(false); // Removed popup


  // Banner auto-scroll state
  const bannerScrollRef = React.useRef(null);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const popularProductScrollRef = React.useRef(null);
  const [popularProductIndex, setPopularProductIndex] = useState(0);

  // Dynamic Section Data
  const [popularProducts, setPopularProducts] = useState([]);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);

  // Category filtering
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [allProducts, setAllProducts] = useState([]);

  // Filter products based on search query
  useEffect(() => {
    if (!allProducts.length) return;

    let filtered = allProducts;

    // Filter by Category first if selected
    if (selectedCategory && selectedCategory.id !== 'all') {
      filtered = filtered.filter(p => p.categoryId === selectedCategory.id);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(query));
    }

    setProducts(filtered);
  }, [searchQuery, selectedCategory, allProducts]);

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          productsAPI.getProducts(),
          categoriesAPI.getCategories()
        ]);

        // Transform products data - API returns data.items, not data.products
        const productsData = productsRes?.data?.data?.items || [];
        const transformedProducts = productsData.map(p => ({
          id: p._id,
          name: p.name,
          categoryId: p.categoryId?._id || p.categoryId,
          weight: `${p.stockQuantity} ${p.unit}` || '1 pc',
          price: p.discountedPrice || p.price,
          mrp: p.price,
          discount: p.offerPercentage > 0 ? `${Math.round(p.offerPercentage)}% OFF` : '',
          offer: p.hasActiveOffer ? 'Special Offer' : '',
          image: p.images?.[0]?.url || 'https://via.placeholder.com/150',
          time: '5 mins'
        }));
        setAllProducts(transformedProducts);
        setProducts(transformedProducts);

        // --- RANDOM SELECTION FOR DYNAMIC SECTIONS ---
        if (transformedProducts.length > 0) {
          // Shuffle function
          const shuffle = (array) => [...array].sort(() => 0.5 - Math.random());
          const shuffled = shuffle(transformedProducts);

          // Take 3-4 for Popular Banner
          const popular = shuffled.slice(0, 4);
          setPopularProducts(popular);

          // Take 4-5 different ones for Best Selling (or just next slice)
          const bestSelling = shuffled.slice(4, 9);
          setBestSellingProducts(bestSelling);
        }

        // Transform categories data with images
        const categoriesData = categoriesRes?.data?.data || [];

        // Quick links (top row categories) - only use categories with images
        const categoriesWithImages = categoriesData.filter(c => c.image?.url);
        const transformedCategories = categoriesWithImages.slice(0, 6).map(c => ({
          id: c._id,
          name: c.name,
          icon: 'food-apple',
          type: 'mci',
          image: c.image.url
        }));

        // Add "All" category at the beginning
        const allCategory = {
          id: 'all',
          name: 'All',
          icon: 'apps',
          type: 'mci',
          image: null
        };

        setCategories([allCategory, ...transformedCategories]);

        // Category groups (with images from API)
        const allCategories = categoriesData.filter(c => c.image?.url);
        const groupedCategories = [];

        // Group categories by 8
        for (let i = 0; i < allCategories.length; i += 8) {
          const categorySlice = allCategories.slice(i, i + 8);
          if (categorySlice.length > 0) {
            groupedCategories.push({
              title: i === 0 ? "Fresh" : i === 8 ? "Grocery & kitchen" : i === 16 ? "Snacks & drinks" : "More categories",
              bgColor: i % 2 === 0 ? THEME.catBlue : THEME.catPink,
              data: categorySlice.map(cat => ({
                name: cat.name,
                img: cat.image.url || 'https://via.placeholder.com/100'
              }))
            });
          }
        }

        setCategoryGroups(groupedCategories.length > 0 ? groupedCategories : []);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setCategoryGroups([]);
        setLoading(false);
      }
    };
    fetchData();
  }, []);



  // Auto-scroll banner every 3 seconds
  useEffect(() => {
    const bannerData = [
      { id: 1, title: 'Fresh Vegetables', subtitle: 'Farm to Table', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800', color: '#15803d' },
      { id: 2, title: 'Juicy Fruits', subtitle: 'Sweet & Nutritious', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800', color: '#dc2626' },
      { id: 3, title: 'Fresh Dairy', subtitle: 'Pure & Creamy', image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800', color: '#2563eb' },
      { id: 4, title: 'Whole Grains', subtitle: 'Healthy Choice', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800', color: '#ca8a04' },
      { id: 5, title: 'Organic Picks', subtitle: '100% Natural', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800', color: '#166534' },
    ];

    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % bannerData.length;
        if (bannerScrollRef.current) {
          bannerScrollRef.current.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
        }
        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll POPULAR PRODUCT banner every 4 seconds
  useEffect(() => {
    const scrollPopular = () => {
      setPopularProductIndex((prev) => {
        const next = (prev + 1) % 3; // 3 items
        if (popularProductScrollRef.current) {
          popularProductScrollRef.current.scrollToIndex({ index: next, animated: true });
        }
        return next;
      });
    };

    const popInterval = setInterval(scrollPopular, 4000);
    return () => clearInterval(popInterval);
  }, []);

  // Add to cart handler
  const handleAddToCart = async (product) => {
    setAddingToCart(product.id);
    try {
      console.log('🛒 Adding product to cart:', product.id);

      // Use Context API call which updates state
      const success = await addToCartContext(product.id, 1);

      if (success) {
        setCartCount(prev => prev + 1);
        // No popup
      }

    } catch (error) {
      console.error('❌ Add to cart error:', error);
      Alert.alert('Error', error.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  // Handle wishlist toggle
  // Handle wishlist toggle
  const handleToggleWishlist = async (product) => {
    const productId = (product.id || product._id).toString();
    console.log('Home: Toggling wishlist for product:', productId);

    // Check w.product._id (populated) or w.product (if ObjectId/string)
    const isInWishlist = wishlistItems?.some(w => {
      const wId = w.product?._id || w.product;
      return wId?.toString() === productId;
    });

    console.log('Home: Is in wishlist?', isInWishlist);

    if (isInWishlist) {
      const success = await removeFromWishlist(productId);
      if (success) {
        Toast.show({
          type: 'wishlist',
          text1: 'Removed from Wishlist',
          text2: `${product.name} has been removed.`,
          position: 'top',
          visibilityTime: 2000,
          topOffset: 60
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to remove from wishlist. Please try again.',
          position: 'top',
          visibilityTime: 2000,
          topOffset: 60
        });
      }
    } else {
      const success = await addToWishlist(product);
      if (success) {
        Toast.show({
          type: 'wishlist',
          text1: 'Added to Wishlist',
          text2: `${product.name} is now in your wishlist!`,
          position: 'top',
          visibilityTime: 2000,
          topOffset: 60
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to add to wishlist. Please login and try again.',
          position: 'top',
          visibilityTime: 2000,
          topOffset: 60
        });
      }
    }
  };


  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
    // Optional: Scroll to products?
  };

  const renderQuickLink = ({ item }) => {
    const isSelected = selectedCategory?.id === item.id || (item.id === 'all' && !selectedCategory);

    return (
      <TouchableOpacity
        onPress={() => handleCategoryPress(item)}
        style={{ alignItems: 'center', marginRight: 20, width: 60 }}
      >
        <View style={{
          width: 48, height: 48, borderRadius: 24,
          backgroundColor: isSelected ? '#004C46' : '#0d5e56',
          justifyContent: 'center', alignItems: 'center', marginBottom: 6,
          borderWidth: isSelected ? 2 : 0,
          borderColor: '#ffffff',
          overflow: 'hidden'
        }}>
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            item.type === 'mci' ?
              <MaterialCommunityIcons name={item.icon} size={22} color="white" /> :
              <Feather name={item.icon} size={22} color="white" />
          )}
        </View>
        <Text style={{ color: '#e5e7eb', fontSize: 11, fontWeight: '500' }} numberOfLines={1}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };


  const renderProductCard = ({ item }) => {
    // Robust ID extraction helper
    const getSafeId = (obj) => {
      if (!obj) return null;
      // Valid ID sources in priority
      const id = obj.productId || obj.id || obj._id || (typeof obj.product === 'string' ? obj.product : obj.product?._id) || obj.product?.id;
      return id ? id.toString() : null;
    };

    const productId = getSafeId(item);

    // Debug log (cleaned up)
    // console.log('Card ID:', productId, 'Cart IDs:', cartItems?.map(getSafeId));

    const isInWishlist = wishlistItems?.some(w => getSafeId(w) === productId);

    const isInCart = cartItems?.some(c => getSafeId(c) === productId);

    return (
      <View style={{
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 10,
        marginBottom: 16,
        width: CARD_WIDTH,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 280
      }}>
        {/* Top Section */}
        <View>
          {/* Top Left Badge AREA */}
          {isInCart ? (
            <View style={{
              position: 'absolute',
              top: 0,
              left: 0,
              backgroundColor: '#dcfce7', // Light green bg
              borderRadius: 4,
              paddingHorizontal: 6,
              paddingVertical: 4,
              zIndex: 2, // Higher z-index
              borderWidth: 1,
              borderColor: '#166534'
            }}>
              <Text style={{ color: '#166534', fontSize: 9, fontWeight: '700' }}>ADDED</Text>
            </View>
          ) : (
            null
          )}

          {/* Wishlist Heart Icon */}
          <TouchableOpacity
            onPress={() => handleToggleWishlist(item)}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              backgroundColor: 'white',
              borderRadius: 20,
              padding: 6,
              zIndex: 1,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 1
            }}
          >
            <MaterialCommunityIcons
              name={isInWishlist ? 'heart' : 'heart-outline'}
              size={18}
              color={isInWishlist ? '#ef4444' : '#9ca3af'}
            />
          </TouchableOpacity>

          {/* Product Image */}
          <View style={{ width: '100%', height: 120, alignItems: 'center', justifyContent: 'center', marginBottom: 8, marginTop: 14, position: 'relative' }}>
            <Image
              source={{ uri: item.image }}
              style={{
                width: '100%',
                height: '100%',
                resizeMode: 'contain',
              }}
            />



          </View>

          {/* Product Name & Weight */}
          <View style={{ minHeight: 60 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: THEME.text,
                marginBottom: 4,
                lineHeight: 18
              }}
              numberOfLines={2}
            >
              {item.name}
            </Text>

            <Text style={{ fontSize: 12, color: THEME.textLight }}>
              {item.weight}
            </Text>
          </View>
        </View>

        {/* Bottom Section: Price & Button */}
        <View style={{ marginTop: 8, position: 'relative' }}>

          {/* Price Row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginRight: 8 }}>
              ₹{item.price}
            </Text>
            {item.mrp > item.price && (
              <>
                <Text style={{ fontSize: 12, textDecorationLine: 'line-through', color: THEME.textLight, marginRight: 8 }}>
                  ₹{item.mrp}
                </Text>
                {/* Discount Badge - Inline with Price */}
                {item.discount && (
                  <View style={{
                    backgroundColor: THEME.accent,
                    borderRadius: 4,
                    paddingHorizontal: 4,
                    paddingVertical: 2,
                  }}>
                    <Text style={{ color: 'white', fontSize: 9, fontWeight: '700' }}>{item.discount}</Text>
                  </View>
                )}
              </>
            )}
          </View>

          {/* ADD Button */}
          <TouchableOpacity
            style={{
              backgroundColor: addingToCart === item.id ? '#f3f4f6' : (isInCart ? '#9ca3af' : THEME.accent), // Gray if in cart
              borderRadius: 8,
              paddingVertical: 8,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              borderWidth: addingToCart === item.id ? 1 : 0,
              borderColor: '#e5e7eb'
            }}
            onPress={() => handleAddToCart(item)}
            disabled={addingToCart === item.id || isInCart}
          >
            {addingToCart === item.id ? (
              <ActivityIndicator size="small" color={THEME.accent} />
            ) : (
              <>
                <Feather
                  name={isInCart ? "check" : "shopping-bag"}
                  size={14}
                  color={isInCart ? 'white' : 'white'}
                  style={{ marginRight: 6 }}
                />
                <Text style={{
                  color: 'white',
                  fontWeight: '700',
                  fontSize: 13
                }}>
                  {isInCart ? 'ADDED' : 'ADD'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCategoryGroup = (group) => (
    <View key={group.title} style={{ marginTop: 24, paddingHorizontal: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 14 }}>
        {group.title}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {group.data.map((cat, index) => (
          <TouchableOpacity key={index} style={{ width: '23%', alignItems: 'center', marginBottom: 16 }}>
            {/* Category Image Box */}
            <View style={{
              width: '100%', aspectRatio: 1, backgroundColor: group.bgColor, borderRadius: 12,
              marginBottom: 8, alignItems: 'center', justifyContent: 'center'
            }}>
              <Image source={{ uri: cat.img }} style={{ width: '70%', height: '70%', resizeMode: 'contain' }} />
            </View>
            {/* Category Name */}
            <Text style={{ fontSize: 11, textAlign: 'center', color: '#374151', lineHeight: 14, fontWeight: '500' }}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: THEME.primary }} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.primary} />

      {/* ================= HEADER SECTION ================= */}
      <Animated.View style={{
        backgroundColor: THEME.primary,
        paddingBottom: 16,
        opacity: scrollY.interpolate({
          inputRange: [0, 100],
          outputRange: [1, 0],
          extrapolate: 'clamp'
        }),
        height: scrollY.interpolate({
          inputRange: [0, 100],
          outputRange: [70, 0],
          extrapolate: 'clamp'
        }),
        overflow: 'hidden'
      }}>

        {/* Top Row: Brand, Location, Timer, Profile */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 5 }}>
          <View>
            <Text style={{ color: 'white', fontWeight: '800', fontSize: 20, letterSpacing: -0.5 }}>FarmFerry</Text>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>Deliver to Selected Location</Text>
              <Feather name="chevron-down" size={16} color="white" />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* 5 mins Badge */}
            <View style={{ backgroundColor: 'white', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
              <Feather name="clock" size={12} color="black" />
              <Text style={{ fontSize: 12, fontWeight: 'bold', marginLeft: 4 }}>30 mins</Text>
            </View>
            {/* Profile Icon */}
            <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
              <Feather name="user" size={20} color={THEME.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
          <ActivityIndicator size="large" color={THEME.primary} />
          <Text style={{ marginTop: 12, color: THEME.textLight, fontSize: 14, fontWeight: '500' }}>
            Fetching fresh farm produce...
          </Text>
        </View>
      ) : (
        <>
          {/* ================= STICKY SEARCH & CATEGORIES ================= */}
          <Animated.View style={{
            backgroundColor: THEME.primary,
            paddingBottom: 14,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3
          }}>

            {/* Search Row */}
            <View style={{ marginHorizontal: 16, marginTop: 4, flexDirection: 'row', alignItems: 'center' }}>
              {/* Search Bar - Full Width */}
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 24, paddingHorizontal: 10, height: 44 }}>
                <Feather name="search" size={20} color="#9ca3af" />
                <TextInput
                  style={{ flex: 1, marginLeft: 8, fontSize: 14, color: 'black' }}
                  placeholder="Search for 'vegetables'"
                  placeholderTextColor="#9ca3af"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                    <Feather name="x" size={18} color="#9ca3af" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Quick Links Rail */}
            <View style={{ marginTop: 20 }}>
              <FlatList
                horizontal
                data={categories}
                renderItem={renderQuickLink}
                keyExtractor={item => item.id.toString()}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
              />
            </View>
          </Animated.View>

          {/* ================= BODY SCROLL ================= */}
          <Animated.ScrollView
            style={{ flex: 1, backgroundColor: 'white' }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 180 }}
            scrollEventThrottle={16}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
          >
            {/* Inner loading check removed, just render existing children */}

            {/* 1. AUTO-SCROLLING BANNER (Moved Above Products) */}
            <View style={{ marginHorizontal: 16, marginTop: 16 }}>
              <FlatList
                ref={bannerScrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                data={[
                  { id: 1, title: 'Fresh Vegetables', subtitle: 'Farm to Table', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800', color: '#15803d' },
                  { id: 2, title: 'Juicy Fruits', subtitle: 'Sweet & Nutritious', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800', color: '#dc2626' },
                  { id: 3, title: 'Fresh Dairy', subtitle: 'Pure & Creamy', image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800', color: '#2563eb' },
                  { id: 4, title: 'Whole Grains', subtitle: 'Healthy Choice', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800', color: '#ca8a04' },
                  { id: 5, title: 'Organic Picks', subtitle: '100% Natural', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800', color: '#166534' },
                ]}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={{ width: width - 32 }}>
                    <TouchableOpacity onPress={() => navigation.navigate('AllCategories')} style={{ height: 150, borderRadius: 16, overflow: 'hidden', marginRight: 12 }}>
                      <Image
                        source={{ uri: item.image }}
                        style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                      />
                      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', padding: 20 }}>
                        <Text style={{ color: 'white', fontSize: 24, fontWeight: '900', marginBottom: 4 }}>{item.title}</Text>
                        <Text style={{ color: 'white', fontSize: 14, opacity: 0.9 }}>{item.subtitle}</Text>
                        <View style={{ marginTop: 12, backgroundColor: 'white', alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}>
                          <Text style={{ color: item.color, fontWeight: '700', fontSize: 12 }}>SHOP NOW</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
                onScrollToIndexFailed={(info) => {
                  const wait = new Promise(resolve => setTimeout(resolve, 500));
                  wait.then(() => {
                    bannerScrollRef.current?.scrollToIndex({ index: info.index, animated: true });
                  });
                }}
              />
            </View>

            {/* 2. PRODUCTS GRID (2x2) */}
            <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <View>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: '#111827' }}>Fresh Products</Text>
                  <Text style={{ fontSize: 13, color: THEME.textLight, marginTop: 2 }}>Handpicked for you</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('AllCategories')} style={{ backgroundColor: '#004C46', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
                  <Text style={{ color: 'white', fontWeight: '600', fontSize: 12 }}>View All →</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={products}
                renderItem={renderProductCard}
                keyExtractor={item => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                scrollEnabled={false}
              />
            </View>

            {/* ================= NAVIGATION BUTTONS ================= */}
            <View style={{ marginHorizontal: 16, marginTop: 24, gap: 12 }}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Cart')}
                style={{
                  backgroundColor: '#004C46',
                  paddingVertical: 14,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#004C46',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4
                }}
              >
                <Feather name="shopping-cart" size={20} color="white" style={{ marginRight: 8 }} />
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>View Cart</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('Orders')}
                style={{
                  backgroundColor: 'white',
                  paddingVertical: 14,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1.5,
                  borderColor: '#004C46'
                }}
              >
                <Feather name="package" size={20} color="#004C46" style={{ marginRight: 8 }} />
                <Text style={{ color: '#004C46', fontWeight: 'bold', fontSize: 16 }}>View Orders</Text>
              </TouchableOpacity>
            </View>

            {/* Static Interactive Sections */}
            <View style={{ marginHorizontal: 16, marginTop: 24 }}>

              {/* Why Choose Us Section */}




              {/* ================= NEW SECTIONS ================= */}

              {/* Our Popular Product (Auto-Switching Banner) */}
              <View style={{ marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>Our Popular Products</Text>
                </View>
                <FlatList
                  ref={popularProductScrollRef}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  data={popularProducts}
                  keyExtractor={item => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={{
                        width: width - 32,
                        height: 180,
                        borderRadius: 16,
                        overflow: 'hidden',
                        marginRight: 0, // Paging enabled requires full width items
                        position: 'relative',
                        backgroundColor: '#e5e7eb' // Fallback color
                      }}
                      onPress={() => navigation.navigate('AllCategories', { searchQuery: item.name })}
                    >
                      <Image
                        source={{ uri: item.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800' }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 }}
                      >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                          <View style={{ flex: 1, marginRight: 16 }}>
                            <View style={{ backgroundColor: THEME.accent, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginBottom: 8 }}>
                              <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{item.offer || 'Hot Deal'}</Text>
                            </View>
                            <Text numberOfLines={1} style={{ color: 'white', fontSize: 22, fontWeight: 'bold' }}>{item.name}</Text>
                            <Text style={{ color: '#e5e7eb', fontSize: 14 }}>Now at ₹{item.price}</Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => navigation.navigate('AllCategories', { searchQuery: item.name })}
                            style={{ backgroundColor: 'white', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 }}
                          >
                            <Text style={{ color: THEME.primary, fontWeight: 'bold' }}>Buy Now</Text>
                          </TouchableOpacity>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                />
              </View>

              {/* Most Selling Product (Static Vertical List) */}
              <View style={{ marginBottom: 30 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 }}>Most Selling Products</Text>
                <View style={{ gap: 16 }}>
                  {bestSellingProducts.map((item) => {
                    const isInWishlist = wishlistItems?.some(
                      w => (w.productId?._id || w.productId) === (item.id || item._id)
                    );
                    return (
                      <View key={item.id} style={{ flexDirection: 'row', backgroundColor: 'white', borderRadius: 12, padding: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
                        <Image source={{ uri: item.image }} style={{ width: 80, height: 80, borderRadius: 8, backgroundColor: '#f3f4f6' }} resizeMode="contain" />
                        <View style={{ flex: 1, marginLeft: 16, justifyContent: 'center' }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: '600', color: '#1f2937', flex: 1, marginRight: 8 }}>{item.name}</Text>
                            <TouchableOpacity
                              onPress={() => handleToggleWishlist(item)}
                              style={{ padding: 4 }}
                            >
                              <MaterialCommunityIcons
                                name={isInWishlist ? 'heart' : 'heart-outline'}
                                size={20}
                                color={isInWishlist ? '#ef4444' : '#9ca3af'}
                              />
                            </TouchableOpacity>
                          </View>
                          <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{item.weight || item.unit}</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                            <Feather name="star" size={12} color="#fbbf24" fill="#fbbf24" />
                            <Text style={{ fontSize: 12, color: '#4b5563', marginLeft: 4, fontWeight: '600' }}>4.8</Text>
                          </View>
                        </View>
                        <View style={{ justifyContent: 'center', alignItems: 'flex-end', gap: 10 }}>
                          <Text style={{ fontSize: 16, fontWeight: '700', color: '#1f2937' }}>₹{item.price}</Text>
                          <TouchableOpacity
                            onPress={() => handleAddToCart(item)}
                            disabled={addingToCart === item.id}
                            style={{
                              backgroundColor: addingToCart === item.id ? '#f3f4f6' : THEME.primary,
                              paddingHorizontal: 16,
                              paddingVertical: 8,
                              borderRadius: 8,
                              minWidth: 60,
                              alignItems: 'center'
                            }}
                          >
                            {addingToCart === item.id ? (
                              <ActivityIndicator size="small" color={THEME.primary} />
                            ) : (
                              <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>Add</Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Why Choose Us Section */}
              <View style={{ backgroundColor: '#f0fdf4', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#bbf7d0' }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#004C46', marginBottom: 16 }}>Why Choose FarmFerry?</Text>
                <View style={{ gap: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#004C46', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                      <Feather name="check-circle" size={20} color="white" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#004C46' }}>Farm Fresh Products</Text>
                      <Text style={{ fontSize: 12, color: '#004C46', marginTop: 2 }}>Directly from local farms</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#004C46', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                      <Feather name="truck" size={20} color="white" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#004C46' }}>30-Minute Delivery</Text>
                      <Text style={{ fontSize: 12, color: '#004C46', marginTop: 2 }}>Quick delivery to your doorstep</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#004C46', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                      <Feather name="shield" size={20} color="white" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#004C46' }}>Quality Guaranteed</Text>
                      <Text style={{ fontSize: 12, color: '#004C46', marginTop: 2 }}>100% fresh or money back</Text>
                    </View>
                  </View>
                </View>
              </View>


            </View>

          </Animated.ScrollView>
        </>
      )}




    </SafeAreaView>
  );
};

export default HomeScreen;