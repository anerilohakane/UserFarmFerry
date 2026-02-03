import React from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2; // 2 columns with padding

const BestSellerRail = ({ products = [] }) => {
    const navigation = useNavigation();

    // Fallback products if none provided
    const defaultProducts = [
        {
            id: 1,
            name: 'Organic Tomatoes',
            image: 'https://img.freepik.com/free-photo/fresh-red-tomatoes_2829-13490.jpg',
            price: 45,
            originalPrice: 60,
            weights: ['500g', '1kg']
        },
        {
            id: 2,
            name: 'Fresh Apples',
            image: 'https://img.freepik.com/free-photo/red-apples-isolated_1203-9128.jpg',
            price: 120,
            originalPrice: 150,
            weights: ['500g', '1kg', '2kg']
        },
        {
            id: 3,
            name: 'Green Cabbage',
            image: 'https://img.freepik.com/free-photo/cabbage_1203-7880.jpg',
            price: 30,
            originalPrice: 40,
            weights: ['1pc']
        },
        {
            id: 4,
            name: 'Sweet Corn',
            image: 'https://img.freepik.com/free-photo/sweet-corn_1203-2415.jpg',
            price: 25,
            originalPrice: 35,
            weights: ['2pc', '4pc']
        },
    ];

    const displayProducts = products.length > 0 ? products : defaultProducts;

    const renderProductCard = ({ item }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('ProductDetails', { product: item })}
            style={{
                width: ITEM_WIDTH,
                marginBottom: 16,
                backgroundColor: 'white',
                borderRadius: 12,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: '#f3f4f6',
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 4,
                elevation: 2
            }}
        >
            {/* Image */}
            <Image
                source={{ uri: item.image }}
                style={{ width: '100%', height: 140, backgroundColor: '#f9fafb' }}
                resizeMode="cover"
            />

            {/* Wishlist Icon */}
            <TouchableOpacity
                style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: 'white',
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowOffset: { width: 0, height: 1 },
                    shadowRadius: 4,
                    elevation: 2
                }}
            >
                <Feather name="heart" size={14} color="#374151" />
            </TouchableOpacity>

            {/* Content */}
            <View style={{ padding: 12 }}>
                <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: '700', color: '#1f2937', marginBottom: 4 }}>
                    {item.name}
                </Text>

                {/* Price */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#004C46', marginRight: 6 }}>
                        ₹{item.price}
                    </Text>
                    {item.originalPrice && item.originalPrice > item.price && (
                        <Text style={{ fontSize: 12, color: '#9ca3af', textDecorationLine: 'line-through' }}>
                            ₹{item.originalPrice}
                        </Text>
                    )}
                </View>

                {/* Add to Cart Button */}
                <TouchableOpacity
                    style={{
                        backgroundColor: '#004C46',
                        borderRadius: 8,
                        paddingVertical: 8,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 4
                    }}
                >
                    <Feather name="shopping-cart" size={14} color="white" />
                    <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>Add to Cart</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <Animated.View
            entering={FadeInRight.delay(400).duration(500).springify()}
            style={{ paddingHorizontal: 16, marginBottom: 24 }}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#1f2937' }}>Bestsellers</Text>
                <TouchableOpacity>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#004C46' }}>View All</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={displayProducts}
                renderItem={renderProductCard}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={{ gap: 16 }}
                scrollEnabled={false}
            />
        </Animated.View>
    );
};

export default BestSellerRail;
