import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function LogoScreen() {
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ position: 'absolute', top: 40, left: 20, backgroundColor: '#f0fdf4', borderRadius: 9999, padding: 8, zIndex: 10 }}
      >
        <ArrowLeft size={24} color="#16a34a" />
      </TouchableOpacity>
      <Image
        source={require('../../assets/images/Icon2.jpeg')}
        style={{ width: 500, height: 500, borderRadius: 24 }}
        resizeMode="contain"
      />
    </View>
  );
} 