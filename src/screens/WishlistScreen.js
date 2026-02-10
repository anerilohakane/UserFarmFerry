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
import { useAppContext } from '../context/AppContext';

const { width } = Dimensions.get('window');

export default function WishlistScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // State
  const { wishlistItems, updateWishlistItems, removeFromWishlist } = useAppContext();
  // const [wishlistItems, setWishlistItems] = useState([]); // Removed local state
  const [loading, setLoading] = useState(false); // Changed default to false as context might have data
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
        // Backend returns items array in data.data.items
        updateWishlistItems(response.data.data.items || []);
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
      // Use product ID
      const productId = item.product?._id || item.product || item._id || item.id;
      await cartAPI.addToCart(productId, 1);
      Alert.alert('Success', 'Added to Cart');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.message || 'Failed to add to cart');
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    setRemovingItems(prev => ({ ...prev, [productId]: true }));
    try {
      await removeFromWishlist(productId);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to remove from wishlist');
    } finally {
      setRemovingItems(prev => ({ ...prev, [productId]: false }));
    }
  };


  const renderHeader = () => (
    <View style={{
      backgroundColor: '#004C46',
      paddingBottom: 16,
      paddingTop: 10
    }}>
      {/* Top Row: Brand, Location, Timer, Profile */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 }}>
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
            <Feather name="user" size={20} color="#004C46" />
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

  const renderItem = ({ item }) => {
    // Robust property access
    const productId = item.product?._id || item.product || item._id;
    const name = item.product?.name || item.name;
    const price = item.product?.price || item.price;
    const image = item.product?.images?.[0]?.url || item.thumbnail || item.image || 'https://via.placeholder.com/150';

    return (
      <View style={{
        flexDirection: 'row',
        width: width - 32, // Full width minus padding
        marginHorizontal: 16, // Align with header padding
        marginBottom: 16,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 12,
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        alignItems: 'center',
        opacity: removingItems[productId] ? 0.6 : 1
      }}>
        {/* Left: Image */}
        <View style={{
          width: 90,
          height: 90,
          borderRadius: 12,
          overflow: 'hidden',
          backgroundColor: '#f3f4f6',
          marginRight: 16
        }}>
          <Image
            source={{ uri: image }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </View>

        {/* Middle: Info */}
        <View style={{ flex: 1, justifyContent: 'space-between', height: 90, paddingVertical: 4 }}>
          <View>
            <Text numberOfLines={2} style={{ fontWeight: '700', fontSize: 15, color: '#1f2937', lineHeight: 20 }}>
              {name}
            </Text>
            {/* Optional: Add Unit/Weight if available in data */}
            {item.product?.unit && (
              <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                {item.product.unit}
              </Text>
            )}
            <Text style={{ fontWeight: '800', fontSize: 16, color: '#166534', marginTop: 8 }}>
              ₹{price}
            </Text>
          </View>
        </View>

        {/* Right: Actions */}
        <View style={{ justifyContent: 'space-between', alignItems: 'flex-end', height: 90, paddingVertical: 4 }}>
          {/* Delete Button (Top Right) */}
          <TouchableOpacity
            onPress={() => handleRemoveFromWishlist(productId)}
            disabled={removingItems[productId]}
            style={{
              padding: 8,
              backgroundColor: '#fee2e2',
              borderRadius: 8,
            }}
          >
            {removingItems[productId] ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <Feather name="trash-2" size={18} color="#ef4444" />
            )}
          </TouchableOpacity>

          {/* Add Button (Bottom Right) */}
          <TouchableOpacity
            onPress={() => handleAddToCart(item)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 10,
              backgroundColor: '#166534',
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 'auto'
            }}
          >
            <Feather name="shopping-cart" size={16} color="white" style={{ marginRight: 6 }} />
            <Text style={{ color: 'white', fontSize: 13, fontWeight: '700' }}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Main Render
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#004C46' }} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="light-content" backgroundColor="#004C46" />
        <View style={{ backgroundColor: '#004C46', paddingBottom: 16, paddingTop: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16 }}>
            <View>
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 20, letterSpacing: -0.5 }}>FarmFerry</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>Deliver to Selected Location</Text>
                <Feather name="chevron-down" size={16} color="white" />
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ backgroundColor: 'white', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
                <Feather name="clock" size={12} color="black" />
                <Text style={{ fontSize: 12, fontWeight: 'bold', marginLeft: 4 }}>30 mins</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
                <Feather name="user" size={20} color="#004C46" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
          <ActivityIndicator size="large" color="#004C46" />
          <Text style={{ marginTop: 12, fontSize: 14, color: '#6b7280' }}>Loading wishlist...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#004C46' }} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="light-content" backgroundColor="#004C46" />
        <View style={{ backgroundColor: '#004C46', paddingBottom: 16, paddingTop: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16 }}>
            <View>
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 20, letterSpacing: -0.5 }}>FarmFerry</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>Deliver to Selected Location</Text>
                <Feather name="chevron-down" size={16} color="white" />
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ backgroundColor: 'white', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
                <Feather name="clock" size={12} color="black" />
                <Text style={{ fontSize: 12, fontWeight: 'bold', marginLeft: 4 }}>30 mins</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
                <Feather name="user" size={20} color="#004C46" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, backgroundColor: 'white' }}>
          <Feather name="alert-circle" size={48} color="#dc2626" />
          <Text style={{ marginTop: 16, fontSize: 15, color: '#6b7280', textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity
            style={{ marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#004C46', borderRadius: 8 }}
            onPress={fetchWishlist}
          >
            <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#004C46' }} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#004C46" />

      {/* Header - Fixed at top */}
      <View style={{
        backgroundColor: '#004C46',
        paddingBottom: 16,
        paddingTop: 10
      }}>
        {/* Top Row: Brand, Location, Timer, Profile */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 }}>
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
              <Feather name="user" size={20} color="#004C46" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Title Section */}
      <View style={{ backgroundColor: '#003B37', paddingHorizontal: 16, paddingVertical: 12 }}>
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>Your Wishlist ({wishlistItems.length})</Text>
      </View>

      {/* Scrollable Content Area - White Background */}
      <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        {wishlistItems.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={wishlistItems}
            keyExtractor={item => {
              // Use product ID as key
              return (item.product?._id || item.product || item._id || Math.random()).toString();
            }}
            renderItem={renderItem}
            contentContainerStyle={{ paddingVertical: 16 }}
            refreshing={refreshing}
            onRefresh={onRefresh}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}