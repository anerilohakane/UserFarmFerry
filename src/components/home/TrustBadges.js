import React from 'react';
import { View, Text } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const TrustBadges = () => {
    const badges = [
        { icon: <MaterialCommunityIcons name="flask-outline" size={24} color="#16a34a" />, label: "Lab Tested" },
        { icon: <MaterialCommunityIcons name="leaf" size={24} color="#16a34a" />, label: "Cruelty Free" },
        { icon: <Feather name="check-circle" size={24} color="#16a34a" />, label: "100% Organic" },
    ];

    return (
        <View style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingVertical: 24,
            backgroundColor: '#f9fafb',
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: '#f3f4f6',
            marginBottom: 24
        }}>
            {badges.map((badge, index) => (
                <View key={index} style={{ alignItems: 'center' }}>
                    <View style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: 'white',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 8,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 2,
                        elevation: 1
                    }}>
                        {badge.icon}
                    </View>
                    <Text style={{ fontSize: 11, color: '#4b5563', fontWeight: '500' }}>{badge.label}</Text>
                </View>
            ))}
        </View>
    );
};

export default TrustBadges;
