import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { categoriesAPI } from '../services/api';

const { width } = Dimensions.get('window');

export default function ProductListScreen() {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch only parent categories (categories without parents) for the main category list
        const response = await categoriesAPI.getCategories({ parent: 'null' });
        const cats = response?.data?.data?.categories || response?.data?.data || [];
        setCategories(cats);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Fallback: try to fetch all categories and filter on frontend
        try {
          const fallbackResponse = await categoriesAPI.getCategories();
          const allCats = fallbackResponse?.data?.data?.categories || fallbackResponse?.data?.data || [];
          // Filter to only show parent categories
          const parentCategories = allCats.filter(cat => !cat.parent);
          setCategories(parentCategories);
        } catch (fallbackError) {
          console.error('Fallback category fetch also failed:', fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const CategoryItem = ({ item }) => {
    return (
      <View style={{ width: width * 0.3, alignItems: 'center', marginBottom: 16 }}>
        <TouchableOpacity 
          activeOpacity={0.9} 
          style={{ width: '100%' }}
          onPress={() => {
            // Navigate to subcategories screen
            navigation.navigate('Subcategories', { category: item });
          }}
        >
          <View style={{ 
            backgroundColor: 'white', 
            borderRadius: 16, 
            padding: 8, 
            marginBottom: 8, 
            shadowColor: '#000', 
            shadowOffset: { width: 0, height: 2 }, 
            shadowOpacity: 0.1, 
            shadowRadius: 4, 
            elevation: 2, 
            borderWidth: 1, 
            borderColor: '#f3f4f6' 
          }}>
            <View style={{ width: '100%', aspectRatio: 1, borderRadius: 12, overflow: 'hidden' }}>
              <Image
                source={
                  item.image && typeof item.image === 'object' && item.image.url
                    ? { uri: item.image.url }
                    : item.image && typeof item.image === 'string' && item.image.trim() !== ''
                    ? { uri: item.image }
                    : { uri: 'https://via.placeholder.com/100' }
                }
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            </View>
          </View>
          <Text style={{ 
            fontSize: 14, 
            color: '#1f2937', 
            fontWeight: '600', 
            textAlign: 'center' 
          }}>
            {item.name}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 px-4 pt-6">
      {/* <Text className="text-2xl font-bold text-gray-800 mb-4">All Categories</Text> */}

      <FlatList
        data={categories}
        keyExtractor={(item) => (item._id || item.id).toString()}
        numColumns={3}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        renderItem={({ item }) => <CategoryItem item={item} />}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}
