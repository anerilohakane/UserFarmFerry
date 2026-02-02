import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const CategoryGrid = ({ categories, onCategoryPress }) => {
    return (
        <View style={{ paddingHorizontal: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#1f2937' }}>Shop by Category</Text>
                <TouchableOpacity>
                    <Text style={{ fontSize: 13, color: '#6b7280' }}>See all</Text>
                </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {categories.map((item, index) => (
                    <Animated.View
                        key={item.id}
                        entering={FadeInUp.delay(index * 50 + 400).duration(500).springify()}
                        style={{ width: '31%', marginBottom: 20 }}
                    >
                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={{ alignItems: 'center' }}
                            onPress={() => onCategoryPress(item)}
                        >
                            <View style={{
                                width: '100%',
                                aspectRatio: 1,
                                backgroundColor: item.color || '#f9fafb',
                                borderRadius: 20,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: 8,
                                padding: 15,
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.05,
                                shadowRadius: 3,
                                elevation: 2
                            }}>
                                <Image
                                    source={{ uri: item.image }}
                                    style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                                />
                            </View>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151' }}>{item.name}</Text>
                        </TouchableOpacity>
                    </Animated.View>
                ))}
            </View>
        </View>
    );
};

export default CategoryGrid;
