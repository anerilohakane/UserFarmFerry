import React from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { LinearGradient } from 'expo-linear-gradient';

const width = Dimensions.get('window').width;

const HeroCarousel = () => {
    const banners = [
        {
            id: 1,
            title: "Farm Fresh Veggies",
            subtitle: "100% Organic & Clean",
            image: "https://img.freepik.com/free-photo/fresh-vegetables-wooden-table_1339-1647.jpg",
            color: ['transparent', 'rgba(22, 101, 52, 0.8)'], // Green
            textColor: '#166534'
        },
        {
            id: 2,
            title: "Dairy Delights",
            subtitle: "Pure Milk & Fresh Eggs",
            image: "https://img.freepik.com/free-photo/fresh-dairy-products_144627-10111.jpg",
            color: ['transparent', 'rgba(30, 58, 138, 0.7)'], // Blue
            textColor: '#1e3a8a'
        },
        {
            id: 3,
            title: "Summer Fruits",
            subtitle: "Sweet & Juicy Selection",
            image: "https://img.freepik.com/free-photo/composition-delicious-fruits_23-2148115456.jpg",
            color: ['transparent', 'rgba(180, 83, 9, 0.7)'], // Orange
            textColor: '#b45309'
        }
    ];

    return (
        <View style={{ marginBottom: 24, alignItems: 'center' }}>
            <Carousel
                loop
                width={width - 32} // Padding horizontal 16*2
                height={200}
                autoPlay={true}
                data={banners}
                scrollAnimationDuration={1000}
                renderItem={({ item }) => (
                    <View style={{ flex: 1, borderRadius: 16, overflow: 'hidden', marginHorizontal: 0 }}>
                        <Image
                            source={{ uri: item.image }}
                            style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                        />
                        <LinearGradient
                            colors={item.color}
                            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingTop: 40 }}
                        >
                            <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>{item.title}</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, marginBottom: 12 }}>{item.subtitle}</Text>
                            <TouchableOpacity style={{ backgroundColor: 'white', alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}>
                                <Text style={{ color: item.textColor, fontWeight: '700', fontSize: 12 }}>SHOP NOW</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                )}
            />
            {/* Simple Pagination Dots (Static for now as Carousel handles it internally visually usually, or state needed) */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12, gap: 6 }}>
                <View style={{ width: 24, height: 4, borderRadius: 2, backgroundColor: '#16a34a' }} />
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#d1d5db' }} />
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#d1d5db' }} />
            </View>
        </View>
    );
};

export default HeroCarousel;
