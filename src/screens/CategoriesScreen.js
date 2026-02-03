import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import Header, { HeaderVariants } from '../components/ui/Header';
import { categoriesAPI } from '../services/api';
import { ArrowLeft } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const CategoriesScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Responsive sizing
  const isSmallScreen = width < 375;
  const isMediumScreen = width >= 375 && width < 768;
  const isLargeScreen = width >= 768;

  const responsiveValue = (small, medium, large) => {
    if (isSmallScreen) return small;
    if (isMediumScreen) return medium;
    return large;
  };

  const fetchCategories = async () => {
    try {
      const res = await categoriesAPI.getCategories({ parent: 'null' });
      const cats = res?.data?.data?.categories || res?.data?.data || [];
      setCategories(cats);
    } catch (err) {
      console.error('Failed to fetch categories:', err?.response?.data || err.message);
      try {
        const fallbackRes = await categoriesAPI.getCategories();
        const allCats = fallbackRes?.data?.data?.categories || fallbackRes?.data?.data || [];
        const parentCategories = allCats.filter(cat => !cat.parent);
        setCategories(parentCategories);
      } catch (fallbackErr) {
        console.error('Fallback category fetch also failed:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCategories();
    setRefreshing(false);
  };

  const CategoryItem = ({ item }) => {
    const categoryItemSize = responsiveValue(width * 0.28, width * 0.23, width * 0.18);
    const imagePadding = responsiveValue(6, 8, 10);
    const textSize = responsiveValue('text-xs', 'text-sm', 'text-sm');
    
    return (
      <View className="items-center mb-5" style={{ width: categoryItemSize }}>
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Subcategories', { category: item })}
          className="w-full"
        >
          <View 
            className="bg-white rounded-xl shadow-sm border border-gray-100"
            style={{
              padding: imagePadding,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 2
            }}
          >
            <View className="w-full aspect-square rounded-lg overflow-hidden">
              <Image
                source={
                  item.image && typeof item.image === 'object' && item.image.url
                    ? { uri: item.image.url }
                    : item.image && typeof item.image === 'string' && item.image.trim() !== ''
                    ? { uri: item.image }
                    : { uri: 'https://via.placeholder.com/100' }
                }
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          </View>
          <Text 
            className={`${textSize} font-semibold text-gray-800 text-center mt-2`} 
            numberOfLines={2}
            style={{ lineHeight: responsiveValue(14, 16, 18) }}
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size={responsiveValue('large', 'large', 'large')} color="#16a34a" />
        <Text className="text-gray-600 mt-3" style={{ fontSize: responsiveValue(14, 16, 16) }}>
          Loading categories...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <HeaderVariants.Back title="All Categories" />
  
    {/* Categories Grid */}
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1"
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={handleRefresh} 
          colors={["#059669"]} 
        />
      }
      contentContainerStyle={{
        paddingVertical: responsiveValue(12, 16, 20),
        paddingHorizontal: responsiveValue(12, 16, 20)
      }}
    >
      <View className="flex-row flex-wrap justify-between">
        {categories.map((item, index) => (
          <CategoryItem key={item._id || item.id || index} item={item} />
        ))}
      </View>
    </ScrollView>
  </View>
  );
};

export default CategoriesScreen;