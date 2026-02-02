import React from 'react';
import { View, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';

const SearchBar = ({ value, onChangeText }) => {
    return (
        <Animated.View
            entering={FadeIn.delay(200).duration(500)}
            style={{ paddingHorizontal: 16, marginBottom: 16 }}
        >
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'white',
                borderRadius: 8, // Less rounded
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderWidth: 1,
                borderColor: '#e5e7eb'
            }}>
                <Feather name="search" size={18} color="#9ca3af" />
                <TextInput
                    placeholder="Explore freshness..."
                    placeholderTextColor="#9ca3af"
                    style={{ flex: 1, marginLeft: 10, fontSize: 14, color: '#1f2937' }}
                    value={value}
                    onChangeText={onChangeText}
                />
            </View>
        </Animated.View>
    );
};

export default SearchBar;
