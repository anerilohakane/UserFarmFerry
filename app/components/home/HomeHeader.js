import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
// FIX: Use safe area insets to handle notch/dynamic island/status bar correctly
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNavigation } from '@react-navigation/native';

const HomeHeader = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    // Define safe padding top - use insets.top but add a little buffer if it's 0 (like older androids without translucent status bar)
    // or just use insets.top if styling is handled by parent SafeAreaView.
    // Actually, since HomeScreen wraps everything in SafeAreaView style={{flex:1}}, that handles the Padding on iOS.
    // BUT on Android with translucent bars, we manually need padding.
    // To be safe and "custom", let's remove the wrapper SafeAreaView's default padding (if any) and handle it here for full control.

    // However, HomeScreen has <SafeAreaView>. To be "in safe area", we usually just rely on that.
    // If the user said "keep it in safe area", maybe it was overlapping? 
    // Let's explicitly add padding equal to insets.top + some spacing.

    const paddingTop = Platform.OS === 'android' ? (insets.top + 10) : 10;

    return (
        <Animated.View
            entering={FadeInDown.delay(100).duration(500).springify()}
            style={{
                paddingHorizontal: 16,
                paddingTop: paddingTop,
                paddingBottom: 10,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'white'
            }}
        >
            {/* Left: Profile / Menu */}
            <TouchableOpacity activeOpacity={0.7}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' }}>
                    <Feather name="user" size={18} color="#374151" />
                </View>
            </TouchableOpacity>

            {/* Middle: Delivery Status */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="location-outline" size={14} color="#16a34a" />
                <Text style={{ fontSize: 13, color: '#16a34a', fontWeight: '600', marginLeft: 4 }}>
                    Delivery in 45 mins
                </Text>
            </View>

            {/* Right: Wishlist & Cart */}
            <View style={{ flexDirection: 'row', gap: 16 }}>
                <TouchableOpacity activeOpacity={0.7}>
                    <Feather name="heart" size={24} color="#374151" />
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={0.7}
                    style={{ position: 'relative' }}
                    onPress={() => navigation.navigate('Cart')}
                >
                    <Feather name="shopping-bag" size={24} color="#374151" />
                    <View style={{
                        position: 'absolute',
                        top: -2,
                        right: -2,
                        width: 14,
                        height: 14,
                        borderRadius: 7,
                        backgroundColor: '#16a34a',
                        borderWidth: 1.5,
                        borderColor: 'white',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <Text style={{ fontSize: 8, color: 'white', fontWeight: 'bold' }}>2</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

export default HomeHeader;
