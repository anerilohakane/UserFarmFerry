import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const TrendingReels = () => {
    const reels = [
        { id: 1, title: "Salad Tips", image: "https://img.freepik.com/free-photo/woman-making-salad-kitchen_23-2148025251.jpg" },
        { id: 2, title: "Farm Tour", image: "https://img.freepik.com/free-photo/man-holding-crate-full-vegetables_23-2148580006.jpg" },
        { id: 3, title: "Juicing 101", image: "https://img.freepik.com/free-photo/glass-orange-juice-placed-wood_1150-34907.jpg" },
        { id: 4, title: "Meal Prep", image: "https://img.freepik.com/free-photo/top-view-healthy-food-assortment_23-2148301768.jpg" }
    ];

    return (
        <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#1f2937' }}>Now Trending</Text>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#f59e0b', marginLeft: 6 }}>Videos</Text>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
            >
                {reels.map((item) => (
                    <TouchableOpacity key={item.id} activeOpacity={0.9} style={{ marginRight: 12 }}>
                        <View style={{ width: 120, height: 200, borderRadius: 12, overflow: 'hidden', backgroundColor: '#e5e7eb', position: 'relative' }}>
                            <Image
                                source={{ uri: item.image }}
                                style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                            />

                            {/* Overlay Gradient */}
                            <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,0.6)']}
                                style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%' }}
                            />

                            {/* Play Icon */}
                            <View style={{ position: 'absolute', top: '50%', left: '50%', marginLeft: -16, marginTop: -16, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'white' }}>
                                <Ionicons name="play" size={14} color="white" />
                            </View>

                            <Text style={{ position: 'absolute', bottom: 10, left: 10, color: 'white', fontSize: 11, fontWeight: '600', marginRight: 10 }}>
                                {item.title}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

export default TrendingReels;
