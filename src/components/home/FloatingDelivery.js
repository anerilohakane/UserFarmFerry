import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { SlideInDown } from 'react-native-reanimated';

const FloatingDelivery = () => {
    return (
        <Animated.View
            entering={SlideInDown.delay(1000).springify().damping(12)}
            style={{
                position: 'absolute',
                bottom: 20,
                left: 20,
                right: 20,
            }}
        >
            <LinearGradient
                colors={['#84cc16', '#65a30d']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                    borderRadius: 16,
                    padding: 12,
                    paddingHorizontal: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.25,
                    shadowRadius: 10,
                    elevation: 8
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={{
                        width: 40,
                        height: 40,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        borderRadius: 12,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 12
                    }}>
                        <Feather name="truck" size={20} color="white" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>Your delivery is on the way</Text>
                        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 11 }}>Arriving in 15-20 minutes</Text>
                    </View>
                </View>

                <TouchableOpacity
                    activeOpacity={0.8}
                    style={{ backgroundColor: 'white', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 }}
                >
                    <Text style={{ color: '#65a30d', fontWeight: '700', fontSize: 12 }}>Track</Text>
                </TouchableOpacity>
            </LinearGradient>
        </Animated.View>
    );
};

export default FloatingDelivery;
