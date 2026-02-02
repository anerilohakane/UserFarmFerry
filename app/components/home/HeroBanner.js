import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    FadeInRight,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';

const HeroBanner = () => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const handlePressIn = () => {
        scale.value = withSpring(0.95);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    return (
        <Animated.View
            entering={FadeInRight.delay(300).duration(600).springify()}
            style={[{ paddingHorizontal: 20, marginBottom: 25 }, animatedStyle]}
        >
            <TouchableOpacity
                activeOpacity={1}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
            >
                <LinearGradient
                    colors={['#166534', '#15803d', '#14532d']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                        borderRadius: 24,
                        padding: 24,
                        position: 'relative',
                        height: 180,
                        justifyContent: 'center',
                        shadowColor: "#166534",
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.3,
                        shadowRadius: 20,
                        elevation: 10
                    }}
                >
                    <View style={{ width: '65%', zIndex: 10 }}>
                        <Text style={{ fontSize: 22, fontWeight: '800', color: 'white', marginBottom: 6, lineHeight: 28 }}>
                            This week's fresh picks
                        </Text>
                        <Text style={{ fontSize: 13, color: '#bbf7d0', marginBottom: 16, lineHeight: 18 }}>
                            100% organic, delivered within 3 hours.
                        </Text>
                        <View style={{ backgroundColor: 'white', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 30, alignSelf: 'flex-start' }}>
                            <Text style={{ color: '#166534', fontWeight: '700', fontSize: 13 }}>Shop Now</Text>
                        </View>
                    </View>

                    {/* Decorative Image */}
                    <Image
                        source={{ uri: 'https://png.pngtree.com/png-vector/20240127/ourmid/pngtree-fresh-vegetables-with-wicker-basket-png-image_11561048.png' }}
                        style={{ position: 'absolute', right: -10, bottom: -10, width: 140, height: 140, resizeMode: 'contain' }}
                    />
                </LinearGradient>
            </TouchableOpacity>

            {/* Carousel Indicators */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12, gap: 6 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#1ea558' }} />
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#e5e7eb' }} />
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#e5e7eb' }} />
            </View>
        </Animated.View>
    );
};

export default HeroBanner;
