import React, { useEffect, useState, useRef } from "react";
import {
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  Text,
  TouchableOpacity,
  TextInput,
  Dimensions,
  FlatList,
  Animated,
  Alert
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Services (Keep your existing service calls)
import { categoriesAPI, productsAPI, cartAPI, wishlistAPI } from "../services/api";
import { CONFIG } from '../constants/config';
import { useAppContext } from '../context/AppContext';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

// --- COLORS ---
const THEME = {
  primary: '#004C46',      // Dark teal header
  background: '#f3f4f6',   // Global background
  accent: '#166534',       // Green for buttons/tags
  text: '#1f2937',
  textLight: '#6b7280',
  white: '#ffffff',
  bannerGreen: '#1fa362',  // Steal deal green

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
  const { wishlistItems, updateWishlistItems } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;

  // State for dynamic data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryGroups, setCategoryGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [addingToCart, setAddingToCart] = useState(null);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const cartPopupAnim = useRef(new Animated.Value(100)).current;

  // Banner auto-scroll state
  const bannerScrollRef = useRef(null);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Category filtering
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [allProducts, setAllProducts] = useState([]);

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

        setCategoryGroups(groupedCategories.length > 0 ? groupedCategories : CATEGORY_GROUPS);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setCategoryGroups(CATEGORY_GROUPS);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Cart popup animation
  useEffect(() => {
    if (showCartPopup) {
      Animated.timing(cartPopupAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start();
    } else {
      Animated.timing(cartPopupAnim, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true
      }).start();
    }
  }, [showCartPopup]);

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

  // Add to cart handler
  const handleAddToCart = async (product) => {
    setAddingToCart(product.id);
    try {
      console.log('🛒 Adding product to cart:', product.id);

      // Use simplified API call
      await cartAPI.addToCart(product.id, 1);

      setCartCount(prev => prev + 1);
      setShowCartPopup(true);

      // Auto-hide popup after 3 seconds
      setTimeout(() => {
        setShowCartPopup(false);
      }, 3000);

      Alert.alert('Success', `${product.name} added to cart!`);
    } catch (error) {
      console.error('❌ Add to cart error:', error);
      Alert.alert('Error', error.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  // Handle wishlist toggle
  const handleToggleWishlist = async (product) => {
    console.log('🔍 Toggle wishlist for product:', product);
    const isInWishlist = wishlistItems?.some(
      w => (w.productId?._id || w.productId) === (product.id || product._id)
    );
    console.log('❤️ Is in wishlist:', isInWishlist);
    console.log('📋 Current wishlist items:', wishlistItems);

    try {
      if (isInWishlist) {
        // Remove from wishlist
        console.log('🗑️ Removing from wishlist, productId:', product.id || product._id);
        await wishlistAPI.removeFromWishlist(product.id || product._id);
        updateWishlistItems(wishlistItems.filter(item =>
          (item.productId?._id || item.productId) !== (product.id || product._id)
        ));
        Toast.show({
          type: 'info',
          text1: 'Removed from Wishlist',
          text2: product.name,
          position: 'bottom',
          visibilityTime: 2000
        });
      } else {
        // Add to wishlist
        console.log('➕ Adding to wishlist, productId:', product.id || product._id);
        const addResponse = await wishlistAPI.addToWishlist(product.id || product._id);
        console.log('✅ Add to wishlist response:', JSON.stringify(addResponse.data, null, 2));

        // Refresh wishlist data from API - use correct response path
        const response = await wishlistAPI.getWishlist();
        console.log('📥 Wishlist API Response after add:', JSON.stringify(response.data, null, 2));

        if (response.data.success && response.data.data?.wishlist) {
          console.log('✅ Updating wishlist items, count:', response.data.data.wishlist.length);
          updateWishlistItems(response.data.data.wishlist);
        } else {
          console.warn('⚠️ Unexpected response structure:', response.data);
        }
        Toast.show({
          type: 'success',
          text1: '❤️ Added to Wishlist',
          text2: product.name,
          position: 'bottom',
          visibilityTime: 2000
        });
      }
    } catch (error) {
      console.error('❌ Wishlist toggle error:', error);
      console.error('❌ Error details:', error.response?.data);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || error.message || 'Failed to update wishlist',
        position: 'bottom',
        visibilityTime: 3000
      });
    }
  };

  // --- RENDER HELPERS ---

  // Handle category selection
  const handleCategoryPress = (category) => {
    if (category.id === 'all') {
      // Show all products
      setSelectedCategory(null);
      setProducts(allProducts);
    } else if (selectedCategory?.id === category.id) {
      // Deselect - show all products
      setSelectedCategory(null);
      setProducts(allProducts);
    } else {
      // Select category - filter products
      setSelectedCategory(category);
      const filtered = allProducts.filter(p => p.categoryId === category.id);
      setProducts(filtered);
    }
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
          backgroundColor: isSelected ? '#166534' : '#0d5e56',
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
    const isInWishlist = wishlistItems?.some(
      w => (w.productId?._id || w.productId) === (item.id || item._id)
    );

    return (
      <View style={{
        width: (width - 48) / 2,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3
      }}>
        {/* Discount Badge */}
        {item.discount && (
          <View style={{
            position: 'absolute',
            top: 8,
            left: 8,
            backgroundColor: THEME.accent,
            borderRadius: 6,
            paddingHorizontal: 6,
            paddingVertical: 3,
            zIndex: 1
          }}>
            <Text style={{ color: 'white', fontSize: 10, fontWeight: '700' }}>{item.discount}</Text>
          </View>
        )}

        {/* Wishlist Heart Icon */}
        <TouchableOpacity
          onPress={() => handleToggleWishlist(item)}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'white',
            borderRadius: 50,
            padding: 6,
            zIndex: 1,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 2
          }}
        >
          <MaterialCommunityIcons
            name={isInWishlist ? 'heart' : 'heart-outline'}
            size={20}
            color={isInWishlist ? '#166534' : '#9ca3af'}
          />
        </TouchableOpacity>

        {/* Product Image */}
        <Image
          source={{ uri: item.image }}
          style={{
            width: '100%',
            height: 140,
            resizeMode: 'contain',
            marginVertical: 8,
            borderRadius: 8
          }}
        />

        {/* Product Name */}
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

        {/* Weight */}
        <Text style={{ fontSize: 12, color: THEME.textLight, marginBottom: 8 }}>
          {item.weight}
        </Text>

        {/* Price Row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <View>
            {item.mrp > item.price && (
              <Text style={{ fontSize: 11, textDecorationLine: 'line-through', color: THEME.textLight }}>
                ₹{item.mrp}
              </Text>
            )}
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>
              ₹{item.price}
            </Text>
          </View>
        </View>

        {/* ADD Button */}
        <TouchableOpacity
          style={{
            backgroundColor: addingToCart === item.id ? '#d1d5db' : THEME.accent,
            borderRadius: 8,
            paddingVertical: 10,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            shadowColor: THEME.accent,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 2
          }}
          onPress={() => handleAddToCart(item)}
          disabled={addingToCart === item.id}
        >
          <Feather name="shopping-bag" size={14} color="white" style={{ marginRight: 6 }} />
          <Text style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>
            {addingToCart === item.id ? 'ADDING...' : 'ADD'}
          </Text>
        </TouchableOpacity>
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
          outputRange: [75, 0],
          extrapolate: 'clamp'
        }),
        overflow: 'hidden'
      }}>

        {/* Top Row: Brand, Location, Timer, Profile */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 26 }}>
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
              <Text style={{ fontSize: 12, fontWeight: 'bold', marginLeft: 4 }}>5 mins</Text>
            </View>
            {/* Profile Icon */}
            <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
              <Feather name="user" size={20} color={THEME.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* ================= STICKY SEARCH & CATEGORIES ================= */}
      <Animated.View style={{
        backgroundColor: THEME.primary,
        paddingBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
      }}>

        {/* Search Row */}
        <View style={{ marginHorizontal: 16, marginTop: 16, flexDirection: 'row', alignItems: 'center' }}>
          {/* Search Bar */}
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 24, paddingHorizontal: 10, height: 44 }}>
            <Feather name="search" size={20} color="#9ca3af" />
            <TextInput
              style={{ flex: 1, marginLeft: 8, fontSize: 14, color: 'black' }}
              placeholder="Search for 'vegetables'"
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Note/List Icon (The square green icon to the right) */}
          <TouchableOpacity style={{ marginLeft: 10, backgroundColor: 'white', height: 44, width: 44, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="edit-3" size={20} color={THEME.primary} />
          </TouchableOpacity>
        </View>

        {/* Quick Links Rail */}
        <View style={{ marginTop: 20 }}>
          <FlatList
            horizontal
            data={categories.length > 0 ? categories : DEFAULT_QUICK_LINKS}
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
                <TouchableOpacity style={{ height: 150, borderRadius: 16, overflow: 'hidden', marginRight: 12 }}>
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
            <TouchableOpacity>
              <Text style={{ color: THEME.accent, fontWeight: '600', fontSize: 14 }}>View All →</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={products.length > 0 ? products : DEFAULT_STEAL_DEALS}
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
              backgroundColor: '#166534',
              paddingVertical: 14,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#166534',
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
              borderColor: '#166534'
            }}
          >
            <Feather name="package" size={20} color="#166534" style={{ marginRight: 8 }} />
            <Text style={{ color: '#166534', fontWeight: 'bold', fontSize: 16 }}>View Orders</Text>
          </TouchableOpacity>
        </View>

        {/* Static Interactive Sections */}
        <View style={{ marginHorizontal: 16, marginTop: 24 }}>

          {/* Why Choose Us Section */}
          <View style={{ backgroundColor: '#f0fdf4', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#bbf7d0' }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#166534', marginBottom: 16 }}>Why Choose FarmFerry?</Text>
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#166534', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                  <Feather name="check-circle" size={20} color="white" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#14532d' }}>Farm Fresh Products</Text>
                  <Text style={{ fontSize: 12, color: '#15803d', marginTop: 2 }}>Directly from local farms</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#166534', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                  <Feather name="truck" size={20} color="white" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#14532d' }}>5-Minute Delivery</Text>
                  <Text style={{ fontSize: 12, color: '#15803d', marginTop: 2 }}>Quick delivery to your doorstep</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#166534', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                  <Feather name="shield" size={20} color="white" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#14532d' }}>Quality Guaranteed</Text>
                  <Text style={{ fontSize: 12, color: '#15803d', marginTop: 2 }}>100% fresh or money back</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Popular Categories Grid */}
          <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 }}>Popular Categories</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {[
                { name: 'Vegetables', icon: 'leaf', color: '#166534' },
                { name: 'Fruits', icon: 'feather', color: '#dc2626' },
                { name: 'Dairy', icon: 'droplet', color: '#2563eb' },
                { name: 'Bakery', icon: 'coffee', color: '#ca8a04' },
              ].map((cat, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={{
                    flex: 1,
                    minWidth: '45%',
                    backgroundColor: '#f9fafb',
                    borderRadius: 12,
                    padding: 16,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#e5e7eb'
                  }}
                >
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: cat.color + '20', justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
                    <Feather name={cat.icon} size={24} color={cat.color} />
                  </View>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151' }}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Customer Reviews */}
          <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 }}>What Our Customers Say</Text>
            <View style={{ gap: 12 }}>
              {[
                { name: 'Priya Sharma', rating: 5, text: 'Fresh vegetables delivered on time!' },
                { name: 'Rajesh Kumar', rating: 5, text: 'Best quality products and quick delivery.' },
                { name: 'Anjali Patel', rating: 4, text: 'Great service and affordable prices!' },
              ].map((review, idx) => (
                <View key={idx} style={{ backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, borderLeftWidth: 3, borderLeftColor: '#166534' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>{review.name}</Text>
                    <View style={{ flexDirection: 'row' }}>
                      {[...Array(review.rating)].map((_, i) => (
                        <Feather key={i} name="star" size={12} color="#fbbf24" fill="#fbbf24" />
                      ))}
                    </View>
                  </View>
                  <Text style={{ fontSize: 12, color: '#6b7280' }}>{review.text}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* App Features */}
          <View style={{ backgroundColor: '#eff6ff', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#bfdbfe' }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#1e40af', marginBottom: 16 }}>Download Our App</Text>
            <View style={{ gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="smartphone" size={18} color="#2563eb" style={{ marginRight: 10 }} />
                <Text style={{ fontSize: 13, color: '#1e40af' }}>Easy ordering on the go</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="bell" size={18} color="#2563eb" style={{ marginRight: 10 }} />
                <Text style={{ fontSize: 13, color: '#1e40af' }}>Get instant delivery updates</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="gift" size={18} color="#2563eb" style={{ marginRight: 10 }} />
                <Text style={{ fontSize: 13, color: '#1e40af' }}>Exclusive app-only offers</Text>
              </View>
            </View>
            <TouchableOpacity
              style={{ backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 10, marginTop: 16, alignItems: 'center' }}
            >
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>Download Now</Text>
            </TouchableOpacity>
          </View>

        </View>

      </Animated.ScrollView>


      {/* ================= ANIMATED CART POPUP ================= */}
      {cartCount > 0 && (
        <Animated.View style={{
          position: 'absolute',
          bottom: 100, // Above tab bar - increased for better visibility
          right: 16,
          left: 16,
          transform: [{ translateY: cartPopupAnim }],
          opacity: cartPopupAnim.interpolate({
            inputRange: [0, 100],
            outputRange: [1, 0]
          })
        }}>
          <TouchableOpacity
            style={{
              backgroundColor: THEME.accent,
              borderRadius: 12,
              paddingVertical: 14,
              paddingHorizontal: 20,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              shadowColor: "#166534",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 10,
              elevation: 8
            }}
            onPress={() => navigation.navigate('Cart')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Feather name="shopping-bag" size={22} color="white" />
              <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 10, fontSize: 16 }}>
                {cartCount} {cartCount === 1 ? 'Product' : 'Products'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: 'white', fontWeight: 'bold', marginRight: 6, fontSize: 16 }}>View Cart</Text>
              <Feather name="chevron-right" size={18} color="white" />
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

    </SafeAreaView>
  );
};

export default HomeScreen;