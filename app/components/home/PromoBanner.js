import React from 'react';
import { View, ScrollView, Image, TouchableOpacity } from 'react-native';

const PromoBanner = () => {
    // Specifically vegetable themed banners
    const banners = [
        'https://img.freepik.com/free-vector/vegetables-market-horizontal-banner-template_23-2149363384.jpg', // Veggie Market
        'https://img.freepik.com/free-psd/organic-vegetables-social-media-banner-template_23-2148756303.jpg', // Organic Veg
        'https://img.freepik.com/free-vector/flat-design-food-sale-banner_23-2149117604.jpg' // Generic Healthy Food
    ];

    return (
        <View style={{ marginBottom: 24 }}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                pagingEnabled
                decelerationRate="fast"
                snapToInterval={300 + 16}
            >
                {banners.map((url, index) => (
                    <TouchableOpacity key={index} activeOpacity={0.9} style={{ marginRight: 16 }}>
                        <Image
                            source={{ uri: url }}
                            style={{ width: 300, height: 160, borderRadius: 16, resizeMode: 'cover' }}
                        />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

export default PromoBanner;
