import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { wishlistAPI, cartAPI } from '../services/api';

const { width } = Dimensions.get('window');

export default function WishlistScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // State
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [removingItems, setRemovingItems] = useState({});

  // Fetch wishlist when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchWishlist();
    }, [])
  );

  const fetchWishlist = async () => {
    try {
      setError(null);
      const response = await wishlistAPI.getWishlist();
      console.log('Wishlist API Response:', response.data);

      if (response.data.success) {
        setWishlistItems(response.data.data.wishlist || []);
      } else {
        setError('Failed to fetch wishlist');
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError(err.response?.data?.message || 'Failed to load wishlist. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchWishlist();
  };

  // --- Handlers ---
  const handleAddToCart = async (item) => {
    try {
      await cartAPI.addToCart(item._id || item.id, 1);
      Alert.alert('Success', 'Added to Cart');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.message || 'Failed to add to cart');
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    setRemovingItems(prev => ({ ...prev, [productId]: true }));
    try {
      await wishlistAPI.removeFromWishlist(productId);
      await fetchWishlist();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to remove from wishlist');
    } finally {
      setRemovingItems(prev => ({ ...prev, [productId]: false }));
    }
  };


  const renderHeader = () => (
    <View style={{
      backgroundColor: '#166534',
      paddingBottom: 16,
      paddingTop: 10
    }}>
      {/* Top Row: Brand, Location, Timer, Profile */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16 }}>
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
            <Feather name="user" size={20} color="#166534" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <LinearGradient
      colors={['#f0fdf4', '#fff']} // Greenish to White
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: width }}
    >
      {/* Icon */}
      <View style={{ marginBottom: 24, alignItems: 'center' }}>
        <MaterialCommunityIcons name="heart-multiple-outline" size={64} color="#166534" />
        <View style={{ position: 'absolute', top: -10, right: -15 }}>
          <MaterialCommunityIcons name="star-outline" size={24} color="#166534" />
        </View>
      </View>

      {/* Text */}
      <Text style={{ fontSize: 26, color: '#166534', fontWeight: '400', marginBottom: 4 }}>
        Your <Text style={{ fontWeight: '700' }}>WISHLIST</Text>
      </Text>
      <Text style={{ fontSize: 26, color: '#166534', fontWeight: '400', marginBottom: 24 }}>
        is <Text style={{ fontWeight: '700' }}>EMPTY!</Text>
      </Text>

      <Text style={{ fontSize: 16, fontStyle: 'italic', color: '#1f2937', marginBottom: 32, fontFamily: 'serif' }}>
        Add Your Favourites To Wishlist
      </Text>

      {/* Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Home')}
        style={{
          paddingHorizontal: 32,
          paddingVertical: 12,
          borderRadius: 30,
          borderWidth: 2,
          borderColor: '#166534',
          backgroundColor: 'white'
        }}
      >
        <Text style={{ color: '#166534', fontWeight: '700', fontSize: 14 }}>ADD TO WISHLIST</Text>
      </TouchableOpacity>

    </LinearGradient>
  );

  const renderItem = ({ item }) => (
    <View style={{
      width: (width - 48) / 2,
      margin: 8,
      backgroundColor: 'white',
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#f3f4f6',
      opacity: removingItems[item._id] ? 0.6 : 1
    }}>
      <Image
        source={{ uri: item.images?.[0]?.url || item.image || 'https://via.placeholder.com/150' }}
        style={{ width: '100%', height: 160 }}
        resizeMode="cover"
      />
      <TouchableOpacity
        onPress={() => handleRemoveFromWishlist(item._id)}
        disabled={removingItems[item._id]}
        style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'white', borderRadius: 12, padding: 4 }}
      >
        <Feather name="trash-2" size={16} color="red" />
      </TouchableOpacity>
      <View style={{ padding: 8 }}>
        <Text numberOfLines={1} style={{ fontWeight: '600', fontSize: 13 }}>{item.name}</Text>
        <Text style={{ fontWeight: 'bold', fontSize: 14, marginTop: 4 }}>₹{item.price}</Text>
        <TouchableOpacity
          onPress={() => handleAddToCart(item)}
          style={{
            marginTop: 8,
            paddingVertical: 6,
            backgroundColor: '#166534',
            borderRadius: 8,
            alignItems: 'center'
          }}
        >
          <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Main Render
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <StatusBar barStyle="light-content" backgroundColor="#166534" />

        {/* Header - Fixed at top */}
        <View style={{
          backgroundColor: '#166534',
          paddingBottom: 16,
          paddingTop: 10
        }}>
          {/* Top Row: Brand, Location, Timer, Profile */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16 }}>
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
                <Feather name="user" size={20} color="#166534" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{ flex: 1, backgroundColor: 'white' }}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#166534" />
            <Text style={{ marginTop: 12, fontSize: 14, color: '#6b7280' }}>Loading wishlist...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <StatusBar barStyle="light-content" backgroundColor="#166534" />

        {/* Header - Fixed at top */}
        <View style={{
          backgroundColor: '#166534',
          paddingBottom: 16,
          paddingTop: 10
        }}>
          {/* Top Row: Brand, Location, Timer, Profile */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16 }}>
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
                <Feather name="user" size={20} color="#166534" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{ flex: 1, backgroundColor: 'white' }}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
            <Feather name="alert-circle" size={48} color="#dc2626" />
            <Text style={{ marginTop: 16, fontSize: 15, color: '#6b7280', textAlign: 'center' }}>{error}</Text>
            <TouchableOpacity
              style={{ marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#166534', borderRadius: 8 }}
              onPress={fetchWishlist}
            >
              <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar barStyle="light-content" backgroundColor="#166534" />

      {/* Header - Fixed at top */}
      <View style={{
        backgroundColor: '#166534',
        paddingBottom: 16,
        paddingTop: 10
      }}>
        {/* Top Row: Brand, Location, Timer, Profile */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16 }}>
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
              <Feather name="user" size={20} color="#166534" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Scrollable Content Area - White Background */}
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        {wishlistItems.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={wishlistItems}
            keyExtractor={item => (item.id || item._id).toString()}
            renderItem={renderItem}
            numColumns={2}
            contentContainerStyle={{ padding: 8 }}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        )}
      </View>
    </SafeAreaView>
  );
}