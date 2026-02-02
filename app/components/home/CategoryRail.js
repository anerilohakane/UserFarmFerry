import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import Animated, { FadeInLeft } from 'react-native-reanimated';

const CategoryRail = ({ categories = [], onCategoryPress }) => {
    // Fallback if no categories
    const defaultCategories = [
        { id: 1, name: 'Vegetables', image: 'https://img.freepik.com/free-photo/fresh-vegetables_1339-1647.jpg' },
        { id: 2, name: 'Fruits', image: 'https://img.freepik.com/free-photo/composition-delicious-fruits_23-2148115456.jpg' },
        { id: 3, name: 'Dairy', image: 'https://img.freepik.com/free-photo/fresh-dairy-products_144627-10111.jpg' },
        { id: 4, name: 'Grains', image: 'https://img.freepik.com/free-photo/rice-grains_1339-1045.jpg' },
        { id: 5, name: 'Spices', image: 'https://img.freepik.com/free-photo/spices-herbs_1339-1423.jpg' },
    ];

    const displayCategories = categories.length > 0 ? categories : defaultCategories;

    return (
        <Animated.View
            entering={FadeInLeft.delay(300).duration(500).springify()}
            style={{ marginBottom: 24 }}
        >
            <View style={{ paddingHorizontal: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#1f2937' }}>Shop by Category</Text>
                <TouchableOpacity>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#16a34a' }}>View All</Text>
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
                {displayCategories.map((cat) => (
                    <TouchableOpacity
                        key={cat.id}
                        onPress={() => onCategoryPress && onCategoryPress(cat)}
                        style={{
                            width: 80,
                            alignItems: 'center'
                        }}
                    >
                        <View style={{
                            width: 72,
                            height: 72,
                            borderRadius: 36,
                            backgroundColor: '#f3f4f6',
                            overflow: 'hidden',
                            marginBottom: 8,
                            borderWidth: 2,
                            borderColor: '#e5e7eb'
                        }}>
                            <Image
                                source={{ uri: typeof cat.image === 'string' ? cat.image : cat.image?.url }}
                                style={{ width: '100%', height: '100%' }}
                                resizeMode="cover"
                            />
                        </View>
                        <Text
                            numberOfLines={1}
                            style={{ fontSize: 12, fontWeight: '600', color: '#374151', textAlign: 'center' }}
                        >
                            {cat.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </Animated.View>
    );
};

export default CategoryRail;
