import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    StatusBar,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    FlatList,
    ActivityIndicator,
    TextInput,
    Animated
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { productsAPI, categoriesAPI, cartAPI, wishlistAPI } from '../services/api'; // Adjust path if needed
import { useAppContext } from '../context/AppContext';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

// --- COLORS ---
const THEME = {
    primary: '#004C46',      // Dark teal
    background: '#f3f4f6',   // Global background
    sidebar: '#f0fdf4',      // Light green sidebar
    accent: '#166534',       // Green for selected items/buttons
    text: '#1f2937',
    textLight: '#6b7280',
    white: '#ffffff',
    border: '#e5e7eb',
};

const AllCategoriesScreen = () => {
    const navigation = useNavigation();
    const { wishlistItems, updateWishlistItems } = useAppContext();

    // Data State
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]); // Store all fetched products
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [subCategories, setSubCategories] = useState([]); // If we have subcats?
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [addingToCart, setAddingToCart] = useState(null);

    // Cart Popup State
    const [showCartPopup, setShowCartPopup] = useState(false);
    const [cartCount, setCartCount] = useState(0); // For demo, usually from context
    const cartPopupAnim = React.useRef(new Animated.Value(100)).current;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [categoriesRes, productsRes] = await Promise.all([
                categoriesAPI.getCategories(),
                productsAPI.getProducts()
            ]);

            // Process Categories
            const rawCategories = categoriesRes?.data?.data || [];
            const validCategories = rawCategories.filter(c => c.name);

            // Add "All" category at the start
            const allCategory = { _id: 'all', name: 'All', image: null };
            const categoriesWithAll = [allCategory, ...validCategories];

            setCategories(categoriesWithAll);

            // Default select "All"
            setSelectedCategory(allCategory);

            // Process Products
            const rawProducts = productsRes?.data?.data?.items || [];
            const transformedProducts = rawProducts.map(p => ({
                id: p._id,
                name: p.name,
                categoryId: p.categoryId?._id || p.categoryId,
                categoryName: p.categoryId?.name,
                image: p.images?.[0]?.url || 'https://via.placeholder.com/150',
                price: p.discountedPrice || p.price,
                mrp: p.price,
                discount: p.offerPercentage > 0 ? `${Math.round(p.offerPercentage)}% OFF` : '',
                unit: p.unit || 'pc',
                stock: p.stockQuantity
            }));

            setAllProducts(transformedProducts);
            setProducts(transformedProducts); // Initially show all
            setLoading(false);

        } catch (error) {
            console.error("Error fetching all categories data:", error);
            setLoading(false);
        }
    };

    // Filter products when category or search changes
    useEffect(() => {
        if (!selectedCategory && allProducts.length === 0) return;

        let filtered = allProducts;

        // 1. Filter by Category (if not 'all')
        if (selectedCategory && selectedCategory._id !== 'all') {
            filtered = filtered.filter(p => p.categoryId === selectedCategory._id);
        }

        // 2. Filter by Search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(p => p.name.toLowerCase().includes(q));
        }

        setProducts(filtered);
    }, [selectedCategory, searchQuery, allProducts]);

    // Cart Popup Animation
    useEffect(() => {
        if (showCartPopup) {
            Animated.timing(cartPopupAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true
            }).start();
        } else {
            Animated.timing(cartPopupAnim, {
                toValue: 100, // Hide off screen
                duration: 300,
                useNativeDriver: true
            }).start();
        }
    }, [showCartPopup]);

    // Handle Add to Cart
    const handleAddToCart = async (product) => {
        setAddingToCart(product.id);
        try {
            await cartAPI.addToCart(product.id, 1);
            await cartAPI.addToCart(product.id, 1);

            // Show custom popup instead of Toast
            setCartCount(prev => prev + 1);
            setShowCartPopup(true);

            // Auto-hide after 3 seconds
            setTimeout(() => {
                setShowCartPopup(false);
            }, 3000);
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to add to cart'
            });
        } finally {
            setAddingToCart(null);
        }
    };

    // Handle wishlist toggle
    const handleToggleWishlist = async (product) => {
        const isInWishlist = wishlistItems?.some(
            w => (w.productId?._id || w.productId) === (product.id || product._id)
        );

        try {
            if (isInWishlist) {
                // Remove from wishlist
                await wishlistAPI.removeFromWishlist(product.id || product._id);
                updateWishlistItems(wishlistItems.filter(item =>
                    (item.productId?._id || item.productId) !== (product.id || product._id)
                ));
                Toast.show({
                    type: 'info',
                    text1: 'Removed from Wishlist',
                    text2: product.name,
                    visibilityTime: 2000
                });
            } else {
                // Add to wishlist
                await wishlistAPI.addToWishlist(product.id || product._id);
                // Refresh wishlist to get full object if needed, or optimistically add
                const response = await wishlistAPI.getWishlist();
                if (response.data.success && response.data.data?.wishlist) {
                    updateWishlistItems(response.data.data.wishlist);
                }
                Toast.show({
                    type: 'success',
                    text1: 'Added to Wishlist',
                    text2: product.name,
                    visibilityTime: 2000
                });
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to update wishlist'
            });
        }
    };


    // --- RENDER HELPERS ---

    const renderSidebarItem = ({ item }) => {
        const isSelected = selectedCategory?._id === item._id;
        return (
            <TouchableOpacity
                style={{
                    paddingVertical: 16,
                    paddingHorizontal: 8,
                    alignItems: 'center',
                    backgroundColor: isSelected ? 'white' : 'transparent',
                    borderLeftWidth: isSelected ? 4 : 0,
                    borderLeftColor: '#004C46',
                    borderBottomWidth: 1,
                    borderBottomColor: '#e5e7eb'
                }}
                onPress={() => setSelectedCategory(item)}
            >
                <View style={{
                    width: 50, height: 50, borderRadius: 25,
                    backgroundColor: isSelected ? '#004C46' : '#f3f4f6', // Dark green highlight
                    justifyContent: 'center', alignItems: 'center', marginBottom: 6,
                    overflow: 'hidden'
                }}>
                    {item._id === 'all' ? (
                        <Feather name="grid" size={20} color={isSelected ? 'white' : '#9ca3af'} />
                    ) : item.image?.url ? (
                        <Image source={{ uri: item.image.url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : (
                        <Feather name="box" size={20} color={isSelected ? 'white' : '#9ca3af'} />
                    )}
                </View>
                <Text style={{
                    fontSize: 10,
                    textAlign: 'center',
                    color: isSelected ? '#004C46' : THEME.textLight,
                    fontWeight: isSelected ? '700' : '500'
                }}>
                    {item.name}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderProductItem = ({ item }) => {
        const isInWishlist = wishlistItems?.some(
            w => (w.productId?._id || w.productId) === (item.id || item._id)
        );

        return (
            <View style={{
                flex: 1,
                backgroundColor: 'white',
                margin: 6,
                borderRadius: 16,
                padding: 10,
                // Shadow
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
                maxWidth: (width * 0.75 - 24) / 2, // Approx width calculation
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 260
            }}>
                {/* Top Section */}
                <View>
                    {/* Wishlist */}
                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            zIndex: 1,
                            backgroundColor: 'white',
                            borderRadius: 15,
                            padding: 4,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.1,
                            shadowRadius: 2,
                            elevation: 1
                        }}
                        onPress={() => handleToggleWishlist(item)}
                    >
                        <MaterialIcons name={isInWishlist ? "favorite" : "favorite-border"} size={18} color={isInWishlist ? "#ef4444" : "#9ca3af"} />
                    </TouchableOpacity>

                    {/* Image */}
                    <View style={{ width: '100%', height: 110, alignItems: 'center', justifyContent: 'center', marginBottom: 8, marginTop: 4 }}>
                        <Image
                            source={{ uri: item.image }}
                            style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                        />
                    </View>

                    {/* Name */}
                    <View style={{ height: 40, justifyContent: 'flex-start' }}>
                        <Text numberOfLines={2} style={{ fontSize: 13, fontWeight: '600', color: THEME.text, lineHeight: 18 }}>
                            {item.name}
                        </Text>
                    </View>

                    {/* Unit */}
                    <Text style={{ fontSize: 11, color: THEME.textLight, marginTop: 4, marginBottom: 4 }}>{item.unit}</Text>
                </View>

                {/* Bottom Section: Price & Button */}
                <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <Text style={{ fontSize: 15, fontWeight: '700', color: '#111827' }}>₹{item.price}</Text>
                        {item.mrp > item.price && (
                            <Text style={{ fontSize: 11, textDecorationLine: 'line-through', color: THEME.textLight, marginLeft: 6 }}>₹{item.mrp}</Text>
                        )}
                    </View>

                    {/* Add Button */}
                    {item.stock > 0 ? (
                        <TouchableOpacity
                            style={{
                                backgroundColor: addingToCart === item.id ? '#f3f4f6' : 'white',
                                borderWidth: 1,
                                borderColor: '#004C46',
                                paddingVertical: 8,
                                borderRadius: 8,
                                alignItems: 'center',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                width: '100%'
                            }}
                            onPress={() => handleAddToCart(item)}
                            disabled={addingToCart === item.id}
                        >
                            {addingToCart === item.id ? (
                                <>
                                    <Text style={{ color: '#004C46', fontWeight: '700', fontSize: 12 }}>ADDING</Text>
                                    <ActivityIndicator size="small" color="#004C46" style={{ marginLeft: 6 }} />
                                </>
                            ) : (
                                <Text style={{ color: '#004C46', fontWeight: '700', fontSize: 12 }}>ADD</Text>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <View style={{ backgroundColor: '#f3f4f6', paddingVertical: 8, borderRadius: 8, alignItems: 'center', width: '100%' }}>
                            <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '600' }}>Out of Stock</Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: THEME.primary }}>
            <StatusBar barStyle="light-content" backgroundColor={THEME.primary} />

            {/* Header */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 18, // Increased padding
                backgroundColor: THEME.primary, // Match Home Screen Header Background
                elevation: 4,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
                paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 20 // Ensure content clear status bar depending on safe area behavior
            }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
                    <Feather name="arrow-left" size={24} color="white" />
                </TouchableOpacity>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 16, color: 'white' }}>All Categories</Text>

                {/* Search & Cart Icons right side */}
                <View style={{ marginLeft: 'auto', flexDirection: 'row' }}>
                    <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={{ padding: 4, marginLeft: 12 }}>
                        <Feather name="shopping-cart" size={22} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search Bar - Below Navbar */}
            <View style={{ backgroundColor: THEME.primary, paddingHorizontal: 16, paddingBottom: 16 }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'white',
                    borderRadius: 24,
                    paddingHorizontal: 12,
                    height: 44
                }}>
                    <Feather name="search" size={20} color="#9ca3af" />
                    <TextInput
                        style={{ flex: 1, marginLeft: 8, fontSize: 14, color: 'black' }}
                        placeholder="Search for 'vegetables'"
                        placeholderTextColor="#9ca3af"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <View style={{ flex: 1, flexDirection: 'row' }}>
                {/* SIDEBAR */}
                <View style={{ width: '25%', backgroundColor: '#f3f5f7' }}>
                    <FlatList
                        data={categories}
                        renderItem={renderSidebarItem}
                        keyExtractor={item => item._id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                </View>

                {/* MAIN CONTENT */}
                <View style={{ flex: 1, backgroundColor: 'white' }}>
                    {/* Header for selected category */}
                    <View style={{ padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: THEME.text }}>
                            {selectedCategory?.name || 'Products'} ({products.length})
                        </Text>
                        {/* Sort or Filter icon could go here */}
                    </View>

                    <FlatList
                        data={products}
                        renderItem={renderProductItem}
                        keyExtractor={item => item.id}
                        numColumns={2}
                        contentContainerStyle={{ padding: 6, paddingBottom: 40 }}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            !loading && (
                                <View style={{ alignItems: 'center', marginTop: 50 }}>
                                    <Text style={{ color: THEME.textLight }}>No products found in this category.</Text>
                                </View>
                            )
                        }
                    />
                </View>
            </View>

            {loading && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.8)' }}>
                    <ActivityIndicator size="large" color={THEME.accent} />
                </View>
            )}
            {/* ================= ANIMATED CART POPUP ================= */}
            {showCartPopup && (
                <Animated.View style={{
                    position: 'absolute',
                    bottom: 20, // Adjusted as AllCategories might not have bottom tabs in the same way, or just stick to bottom
                    right: 16,
                    left: 16,
                    transform: [{ translateY: cartPopupAnim }],
                    zIndex: 10
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
                            shadowColor: "#004C46",
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
                                {cartCount > 0 ? `${cartCount} Product${cartCount > 1 ? 's' : ''}` : 'View Cart'}
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

export default AllCategoriesScreen;
