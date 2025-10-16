"use client"

import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, ChevronRight, Filter, Heart, Leaf, Percent, Search as SearchIcon, ShoppingCart, Star, Truck, User, X, Mic, Bell, AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react-native';
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
  View,
  PermissionsAndroid,
  Modal,
  Alert,
} from 'react-native';
import Animated, { SlideInDown, SlideInRight, SlideOutLeft, SlideOutUp, FadeIn, FadeOut } from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';
import Header, { HeaderVariants } from '../components/ui/Header';
import { farmers } from '../components/ui/farmers';
import { useAppContext } from '../context/AppContext';
import { cartAPI, categoriesAPI, productsAPI } from '../services/api';

// Voice recognition setup with fallbacks
let Voice = null;
let isVoiceModuleLoaded = false;

try {
  Voice = require('@react-native-voice/voice');
  isVoiceModuleLoaded = true;
  console.log('Voice module loaded successfully');
} catch (error) {
  console.warn('Voice module not available, using fallback:', error);
}

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
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceAvailable, setIsVoiceAvailable] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [voiceResults, setVoiceResults] = useState([]);
  const [showVoiceResults, setShowVoiceResults] = useState(false);
  const [voiceInitialized, setVoiceInitialized] = useState(false);
  const [recordingTimer, setRecordingTimer] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [loadingVoiceResults, setLoadingVoiceResults] = useState(false);

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

  // Dynamically calculate number of categories to display based on screen width
  const getVisibleCategoriesCount = () => {
    if (width < 360) return 4;
    if (width < 375) return 6;
    if (width < 414) return 8;
    if (width < 768) return 10;
    return 12;
  };

  const visibleCategoriesCount = getVisibleCategoriesCount();

  // Fuzzy search utility functions
  const levenshteinDistance = (str1, str2) => {
    const track = Array(str2.length + 1).fill(null).map(() =>
      Array(str1.length + 1).fill(null));
    for (let i = 0; i <= str1.length; i += 1) {
      track[0][i] = i;
    }
    for (let j = 0; j <= str2.length; j += 1) {
      track[j][0] = j;
    }
    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1,
          track[j - 1][i] + 1,
          track[j - 1][i - 1] + indicator,
        );
      }
    }
    return track[str2.length][str1.length];
  };

  const calculateSimilarity = (str1, str2) => {
    const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
    const maxLength = Math.max(str1.length, str2.length);
    return 1 - distance / maxLength;
  };

  const getBestMatch = (query, target) => {
    const queryWords = query.toLowerCase().split(/\s+/);
    const targetWords = target.toLowerCase().split(/\s+/);
    
    let totalSimilarity = 0;
    let matchesFound = 0;

    queryWords.forEach(queryWord => {
      let bestMatchSimilarity = 0;
      targetWords.forEach(targetWord => {
        const similarity = calculateSimilarity(queryWord, targetWord);
        if (similarity > bestMatchSimilarity) {
          bestMatchSimilarity = similarity;
        }
      });
      if (bestMatchSimilarity > 0.3) {
        totalSimilarity += bestMatchSimilarity;
        matchesFound++;
      }
    });

    return matchesFound > 0 ? totalSimilarity / queryWords.length : 0;
  };

  const fuzzySearch = (products, query) => {
    if (!query.trim()) return products;

    const searchResults = products.map(product => {
      const searchableFields = [
        product.name || '',
        product.category || '',
        product.farmer || '',
        product.description || ''
      ];

      let bestScore = 0;
      
      searchableFields.forEach(field => {
        const score = getBestMatch(query, field);
        if (score > bestScore) {
          bestScore = score;
        }
      });

      return { product, score: bestScore };
    })
    .filter(item => item.score > 0.4)
    .sort((a, b) => b.score - a.score)
    .map(item => item.product);

    return searchResults;
  };

  // Professional alert system
  const showAlert = (message, type = 'info', duration = 4000) => {
    const id = Date.now();
    const alert = { id, message, type };
    
    setAlerts(prev => [...prev, alert]);
    
    setTimeout(() => {
      dismissAlert(id);
    }, duration);
  };

  const dismissAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const getAlertConfig = (type) => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          icon: <CheckCircle width={20} height={20} color="#166534" />,
          iconBg: 'bg-green-100'
        };
      case 'error':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          icon: <XCircle width={20} height={20} color="#991b1b" />,
          iconBg: 'bg-red-100'
        };
      case 'warning':
        return {
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          textColor: 'text-amber-800',
          icon: <AlertCircle width={20} height={20} color="#92400e" />,
          iconBg: 'bg-amber-100'
        };
      default:
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          icon: <Info width={20} height={20} color="#1e40af" />,
          iconBg: 'bg-blue-100'
        };
    }
  };

  // Check voice availability safely
  const checkVoiceAvailability = async () => {
    if (!isVoiceModuleLoaded || !Voice) {
      console.log('Voice module not loaded');
      setIsVoiceAvailable(false);
      return false;
    }

    try {
      setIsVoiceAvailable(true);
      return true;
    } catch (error) {
      console.warn('Error checking voice availability:', error);
      setIsVoiceAvailable(false);
      return false;
    }
  };

  // Request microphone permission
  const requestMicrophonePermission = async () => {
    if (!isVoiceModuleLoaded) {
      return false;
    }

    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs access to your microphone for voice search.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Microphone permission error:', err);
        return false;
      }
    }
    return true;
  };

  // Fetch voice search suggestions from real data - ALL categories
  const fetchVoiceSearchSuggestions = async (query) => {
    try {
      setLoadingVoiceResults(true);
      
      // Fetch ALL categories (no limit) and products
      const [categoriesRes, productsRes] = await Promise.all([
        categoriesAPI.getCategories(), // Fetch all categories
        productsAPI.getProducts({ limit: 100 })
      ]);

      const cats = categoriesRes?.data?.data?.categories || categoriesRes?.data?.data || [];
      const prods = productsRes?.data?.data?.products || [];

      // If query is provided, filter based on similarity
      if (query && query.trim()) {
        // Create suggestions from categories with fuzzy matching
        const categorySuggestions = cats
          .filter(cat => cat.name && getBestMatch(query, cat.name) > 0.3)
          .sort((a, b) => getBestMatch(query, b.name) - getBestMatch(query, a.name))
          .slice(0, 5)
          .map(cat => cat.name);

        // Create suggestions from products with fuzzy matching
        const productSuggestions = prods
          .filter(prod => prod.name && getBestMatch(query, prod.name) > 0.3)
          .sort((a, b) => getBestMatch(query, b.name) - getBestMatch(query, a.name))
          .slice(0, 5)
          .map(prod => prod.name);

        // Combine and deduplicate suggestions, prioritizing categories
        const allSuggestions = [...new Set([...categorySuggestions, ...productSuggestions])];
        
        // If we have suggestions, return them
        if (allSuggestions.length > 0) {
          return allSuggestions.slice(0, 8);
        }

        // If no matches found, return the original query
        return [query];
      } else {
        // No query provided, return top categories and products
        const topCategories = cats.slice(0, 5).map(cat => cat.name).filter(Boolean);
        const topProducts = prods.slice(0, 3).map(prod => prod.name).filter(Boolean);
        
        const suggestions = [...topCategories, ...topProducts];
        return suggestions.length > 0 ? suggestions : ['Search for products'];
      }
    } catch (error) {
      console.error('Failed to fetch voice search suggestions:', error);
      // Return fallback suggestions
      return ['Try searching for products'];
    } finally {
      setLoadingVoiceResults(false);
    }
  };

  // Voice event handlers
  const onSpeechStart = (e) => {
    console.log('Speech started');
    setIsRecording(true);
    setVoiceResults([]);
    setRecordingTime(0);
    
    const timer = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 4) {
          stopVoiceRecognition();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    
    setRecordingTimer(timer);
  };

  const onSpeechEnd = (e) => {
    console.log('Speech ended');
    cleanupRecording();
  };

  const onSpeechResults = async (e) => {
    console.log('Speech results:', e);
    if (e.value && e.value.length > 0) {
      const recognizedText = e.value[0];
      setSearchQuery(recognizedText);
      
      // Fetch real suggestions based on recognized text
      const suggestions = await fetchVoiceSearchSuggestions(recognizedText);
      setVoiceResults(suggestions);
      setShowVoiceResults(true);
    }
    cleanupRecording();
  };

  const onSpeechError = (e) => {
    console.error('Speech recognition error:', e);
    cleanupRecording();
    
    let errorMessage = 'Could not recognize speech. Please try again.';
    if (e.error && e.error.message) {
      errorMessage = e.error.message;
    }
    
    showAlert(errorMessage, 'error');
  };

  // Cleanup recording state
  const cleanupRecording = () => {
    setIsRecording(false);
    setRecordingTime(0);
    if (recordingTimer) {
      clearInterval(recordingTimer);
      setRecordingTimer(null);
    }
  };

  // Initialize Voice recognition
  const initializeVoiceRecognition = async () => {
    if (!isVoiceModuleLoaded || !Voice) {
      console.log('Voice module not available for initialization');
      setVoiceInitialized(false);
      return;
    }

    try {
      Voice.removeAllListeners();

      Voice.onSpeechStart = onSpeechStart;
      Voice.onSpeechEnd = onSpeechEnd;
      Voice.onSpeechResults = onSpeechResults;
      Voice.onSpeechError = onSpeechError;

      setVoiceInitialized(true);
      console.log('Voice recognition initialized successfully');
    } catch (error) {
      console.error('Failed to initialize voice recognition:', error);
      setVoiceInitialized(false);
    }
  };

  // Start voice recognition
  const startVoiceRecognition = async () => {
    if (!isVoiceModuleLoaded || !Voice || !voiceInitialized) {
      showAlert('Voice recognition is not available on this device', 'warning');
      return false;
    }

    try {
      await Voice.stop();
      await Voice.start('en-US');
      return true;
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      
      let errorMessage = 'Failed to start voice recognition';
      if (error.message?.includes('permission')) {
        errorMessage = 'Microphone permission is required';
      }
      
      showAlert(errorMessage, 'error');
      return false;
    }
  };

  // Stop voice recognition
  const stopVoiceRecognition = async () => {
    if (!isVoiceModuleLoaded || !Voice) return;

    try {
      await Voice.stop();
      cleanupRecording();
    } catch (error) {
      console.error('Failed to stop voice recognition:', error);
      cleanupRecording();
    }
  };

  // Enhanced microphone handler
  const handleMicrophonePress = async () => {
    if (isRecording) {
      await stopVoiceRecognition();
      return;
    }

    if (!isVoiceModuleLoaded) {
      await simulateVoiceSearch();
      return;
    }

    if (!voiceInitialized) {
      await initializeVoiceRecognition();
    }

    const available = await checkVoiceAvailability();
    if (!available) {
      showAlert('Voice recognition is not available on this device', 'warning');
      await simulateVoiceSearch();
      return;
    }

    const hasPermission = await requestMicrophonePermission();
    if (hasPermission) {
      const started = await startVoiceRecognition();
      if (!started) {
        await simulateVoiceSearch();
      }
    } else {
      showAlert('Microphone permission is required for voice search', 'warning');
    }
  };

  // Fallback voice search simulation with ALL real categories
  const simulateVoiceSearch = async () => {
    console.log('Using simulated voice search with all categories');
    setIsRecording(true);
    setVoiceResults([]);
    setRecordingTime(0);
    setLoadingVoiceResults(true);

    const timer = setInterval(async () => {
      setRecordingTime(prev => {
        if (prev >= 4) {
          clearInterval(timer);
          setIsRecording(false);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    
    setRecordingTimer(timer);

    // Fetch ALL categories and products for suggestions
    setTimeout(async () => {
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          categoriesAPI.getCategories(), // Fetch all categories
          productsAPI.getProducts({ limit: 50 })
        ]);

        const cats = categoriesRes?.data?.data?.categories || categoriesRes?.data?.data || [];
        const prods = productsRes?.data?.data?.products || [];

        // Create suggestions from real data - prioritize categories
        const suggestions = [
          ...cats.slice(0, 6).map(cat => cat.name),
          ...prods.slice(0, 2).map(prod => prod.name)
        ].filter(Boolean).slice(0, 8);

        setVoiceResults(suggestions.length > 0 ? suggestions : ['Try searching for products']);
        setShowVoiceResults(true);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        setVoiceResults(['Try searching for products']);
        setShowVoiceResults(true);
      } finally {
        setLoadingVoiceResults(false);
      }
    }, 5000);
  };

  const handleVoiceResultSelect = (result) => {
    setSearchQuery(result);
    setShowVoiceResults(false);
    setIsSearchActive(true);
  };

  // Close voice results when search query changes
  useEffect(() => {
    if (searchQuery && showVoiceResults) {
      setShowVoiceResults(false);
    }
  }, [searchQuery]);

  // Initialize voice recognition on component mount
  useEffect(() => {
    initializeVoiceRecognition();

    return () => {
      if (isVoiceModuleLoaded && Voice) {
        try {
          Voice.destroy().then(() => {
            Voice.removeAllListeners();
          });
        } catch (error) {
          console.warn('Error cleaning up voice recognition:', error);
        }
      }
      if (recordingTimer) {
        clearInterval(recordingTimer);
      }
    };
  }, []);

  // Fetch products
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

  // Fetch all products from the system
  const fetchAllProducts = async () => {
    try {
      setLoadingSearch(true);
      
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

  // Handle search functionality with fuzzy search
  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim() === '') {
        setFilteredProducts(fetchedProducts);
        setIsSearchActive(false);
      } else {
        setIsSearchActive(true);
        setLoadingSearch(true);
        
        let allProducts = allCategoryProducts;
        if (allCategoryProducts.length === 0) {
          allProducts = await fetchAllProducts();
        }
        
        const searchResults = fuzzySearch(allProducts, searchQuery);
        
        setFilteredProducts(searchResults);
        setLoadingSearch(false);
      }
    };
    
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
      image: 'https://media.istockphoto.com/id/1280856062/photo/variety-of-fresh-organic-vegetables-and-fruits-in-the-garden.jpg?s=612x612&w=0&k=20&c=KoF5Ue-g3wO3vXPgLw9e2Qzf498Yow7WGXMSCNz7O60=',
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
      bgColor: '#f0fdf4',
      borderColor: '#bbf7d0',
      iconBg: '#16a34a',
      textColor: '#166534',
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
      bgColor: '#eff6ff',
      borderColor: '#dbeafe',
      iconBg: '#2563eb',
      textColor: '#1e40af',
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
      bgColor: '#fff7ed',
      borderColor: '#fed7aa',
      iconBg: '#f97316',
      textColor: '#9a3412',
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
        className="flex-1 mx-2 rounded-2xl overflow-hidden border-2"
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
              className="w-12 h-12 rounded-full justify-center items-center"
              style={{ backgroundColor: item.iconBg }}
            >
              {item.icon}
            </View>
          </View>

          <View className="flex-row justify-between items-center mt-6">
            <View
              className="rounded-lg px-3 py-2"
              style={{ backgroundColor: `${item.iconBg}20` }}
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
      setCartNotificationProduct({ 
        name: 'Out of stock', 
        error: true, 
        message: `${product.name} is currently out of stock` 
      });
      setShowCartNotification(true);
      setTimeout(() => setShowCartNotification(false), 3000);
      return;
    }
    if (!isInCart(productId)) {
      try {
        const response = await cartAPI.addToCart({ productId, quantity: 1 });
        updateCartItems(response.data.data.cart.items);
        
        setCartNotificationProduct(product);
        setShowCartNotification(true);
        
        setTimeout(() => {
          setShowCartNotification(false);
        }, 3000);
      } catch (error) {
        console.error('Failed to add to cart:', error);
        
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
          <View className={`bg-white rounded-2xl p-2 mb-2 border border-gray-100`}>
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
      <View className={`bg-white rounded-3xl p-4 items-center border border-gray-100 mr-4`}
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
        disabled={isOutOfStock}
      >
        <View className="bg-white rounded-2xl overflow-hidden border border-gray-100">
          <View className="relative">
            <Image
              source={{ uri: item.image }}
              className="w-full"
              style={{ height: productHeight }}
              resizeMode="cover"
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.05)"]}
              className="absolute bottom-0 left-0 right-0 h-12"
            />
            {isOutOfStock ? (
              <View className="absolute bottom-2 right-2 bg-red-600 rounded-lg px-2 py-1">
                <Text className="text-white text-xs font-bold">Out of Stock</Text>
              </View>
            ) : item.discount ? (
              <View className="absolute bottom-2 right-2 bg-emerald-500 rounded-lg px-2 py-1">
                <Text className="text-white text-xs font-bold">{Number(item.discount).toFixed(0)}% OFF</Text>
              </View>
            ) : null}
            {isLowStock && (
              <View className="absolute bottom-2 left-2 bg-amber-500 rounded-lg px-2 py-1">
                <Text className="text-white text-xs font-bold">Only {item.stockQuantity} left</Text>
              </View>
            )}
            <TouchableOpacity
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 justify-center items-center"
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
              style={{
                opacity: isOutOfStock ? 0.6 : 1,
              }}
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
              ) : (
                <LinearGradient
                  colors={['#10b981', '#059669']}
                  className="py-2 flex-row items-center justify-center rounded-lg"
                >
                  <ShoppingCart width={14} height={14} color="#fff" />
                  <Text className="text-white font-semibold text-sm ml-1">Add</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              className="overflow-hidden rounded-lg mt-1.5 py-2 flex-row items-center justify-center border border-green-500 bg-white"
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
                opacity: isOutOfStock ? 0.6 : 1,
              }}
              disabled={isOutOfStock}
            >
              <Text className={`font-semibold ${responsiveValue('text-xs', 'text-sm', 'text-sm')} ${isOutOfStock ? 'text-green-500' : (buyNowPressedId === productId ? 'text-green-600' : 'text-green-600')}`}>
                Buy Now
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
      {/* Professional Alert System */}
      <View className="absolute top-20 left-4 right-4 z-50">
        {alerts.map((alert, index) => {
          const config = getAlertConfig(alert.type);
          return (
            <Animated.View
              key={alert.id}
              entering={SlideInDown.duration(300).delay(index * 100)}
              exiting={FadeOut.duration(200)}
              className={`${config.bgColor} ${config.borderColor} border-2 rounded-xl mb-2 overflow-hidden`}
              style={{ marginTop: index * 8 }}
            >
              <View className="p-4 flex-row items-start">
                <View className={`${config.iconBg} w-10 h-10 rounded-full justify-center items-center mr-3`}>
                  {config.icon}
                </View>
                <View className="flex-1">
                  <Text className={`${config.textColor} font-semibold text-sm`}>
                    {alert.message}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => dismissAlert(alert.id)}
                  className="ml-2 w-8 h-8 rounded-full bg-black/5 justify-center items-center"
                >
                  <X width={16} height={16} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </Animated.View>
          );
        })}
      </View>

      {/* Cart Notification */}
      {showCartNotification && (
        <Animated.View 
          entering={SlideInDown.duration(300)}
          exiting={SlideOutUp.duration(300)}
          className="absolute top-16 left-4 right-4 z-50 rounded-xl overflow-hidden"
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
                    ? cartNotificationProduct.name 
                    : 'Added to Cart'}
                </Text>
                {!cartNotificationProduct?.error && (
                  <Text className="text-white/90 text-xs mt-1">
                    {cartNotificationProduct.name} has been added to your cart
                  </Text>
                )}
                {cartNotificationProduct?.error && (
                  <Text className="text-white/90 text-xs mt-1">
                    {cartNotificationProduct.message}
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

      {/* Voice Recording Modal - Professional & Simple Design */}
      <Modal
        visible={isRecording}
        transparent={true}
        animationType="fade"
        onRequestClose={stopVoiceRecognition}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <Animated.View 
            entering={FadeIn.duration(200)}
            className="bg-white rounded-3xl p-8 w-full max-w-sm items-center shadow-xl"
          >
            {/* Animated Microphone Icon */}
            <View className="relative mb-6">
              <View className="w-24 h-24 rounded-full bg-blue-50 justify-center items-center">
                <View className="w-20 h-20 rounded-full bg-blue-100 justify-center items-center">
                  <View className="w-16 h-16 rounded-full bg-blue-400 justify-center items-center">
                    <Mic width={28} height={28} color="#fff" />
                  </View>
                </View>
              </View>
              
              {/* Recording Indicator */}
              <View className="absolute -bottom-2 left-0 right-0 flex-row justify-center">
                <View className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              </View>
            </View>

            {/* Status Text */}
            <View className="items-center mb-4">
              <Text className="text-xl font-semibold text-gray-800 mb-2">
                Listening...
              </Text>
              <Text className="text-sm text-gray-600 text-center">
                Speak clearly to search
              </Text>
            </View>

            {/* Timer Display */}
            <View className="bg-gray-50 rounded-xl px-6 py-3 mb-6">
              <Text className="text-2xl font-bold text-gray-700 text-center">
                {recordingTime}s
              </Text>
            </View>

            {/* Stop Button */}
            <TouchableOpacity
              className="bg-blue-400 rounded-xl px-8 py-3 w-full"
              onPress={stopVoiceRecognition}
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-center text-base">
                Stop
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Voice Results Modal - Professional & Simple Design */}
      <Modal
        visible={showVoiceResults && voiceResults.length > 0}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowVoiceResults(false)}
      >
        <View className="flex-1 bg-black/40 justify-end">
          <Animated.View 
            entering={SlideInDown.duration(300)}
            className="bg-white rounded-t-3xl max-h-[70%]"
          >
            {/* Header */}
            <View className="px-6 py-4 border-b border-gray-200">
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-lg font-semibold text-gray-800">
                    Voice Search Results
                  </Text>
                  <Text className="text-sm text-gray-500 mt-1">
                    Tap on a suggestion to search
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setShowVoiceResults(false)}
                  className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
                >
                  <X width={20} height={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Results Content */}
            <ScrollView 
              className="px-4 py-4"
              showsVerticalScrollIndicator={false}
            >
              {loadingVoiceResults ? (
                <View className="py-8 items-center">
                  <Text className="text-gray-500">Loading suggestions...</Text>
                </View>
              ) : (
                <View className="space-y-3">
                  {voiceResults.map((result, index) => (
                    <TouchableOpacity
                      key={index}
                      className="bg-white rounded-xl p-4 border border-gray-200 active:bg-gray-50"
                      onPress={() => handleVoiceResultSelect(result)}
                    >
                      <View className="flex-row items-center">
                        <View className="w-8 h-8 rounded-full bg-blue-100 justify-center items-center mr-3">
                          <SearchIcon width={16} height={16} color="#3b82f6" />
                        </View>
                        <Text className="text-gray-800 font-medium flex-1">
                          {result}
                        </Text>
                        <ChevronRight width={16} height={16} color="#9ca3af" />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>

            {/* Footer Actions */}
            <View className="px-4 py-4 border-t border-gray-200">
              <TouchableOpacity
                className="bg-gray-100 rounded-xl py-3"
                onPress={handleMicrophonePress}
              >
                <View className="flex-row items-center justify-center">
                  <Mic width={18} height={18} color="#6b7280" />
                  <Text className="text-gray-700 font-medium ml-2">
                    Try Again
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      <HeaderVariants.Main />

      <View className={`px-${responsivePadding} pt-2 pb-2`}>
        <View className="flex-row items-center justify-between">
          <View className={`flex-row items-center bg-white rounded-xl px-${responsivePadding} py-3 border border-gray-200 flex-1`}>
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
            <TouchableOpacity 
              className="p-1"
              onPress={handleMicrophonePress}
            >
              <Mic 
                width={20} 
                height={20} 
                color={isRecording ? "#3b82f6" : (isVoiceModuleLoaded ? "#94a3b8" : "#d1d5db")} 
              />
            </TouchableOpacity>
            {/* <View className="w-px h-6 bg-gray-200 mx-3" />
            <TouchableOpacity className="p-1">
              <Filter width={20} height={20} color="#94a3b8" />
            </TouchableOpacity> */}
          </View>
        </View>
      </View>

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
                    className="flex-1 mx-1 rounded-xl overflow-hidden"
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
                  {categories.slice(0, visibleCategoriesCount).map((item, index) => (
                    <CategoryItem key={item._id || item.id || index} item={item} />
                  ))}
                </View>
              )}
            </View>

            <View className={`h-64 rounded-2xl overflow-hidden mx-${responsivePadding} mb-6`}>
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
          </>
        ) : null}

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
              <Text className={`${responsiveValue('text-lg', 'text-xl', 'text-xl')} font-bold text-gray-800`}>Today's Smart Saves</Text>
              <TouchableOpacity className="flex-row items-center">
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
              data={isSearchActive ? filteredProducts : filteredProducts.filter(product => product.discount && product.discount > 0)}
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