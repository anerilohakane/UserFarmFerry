// MainTabNavigator.js (No changes needed, but included for completeness)
import React from 'react';
import { View, Text, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/HomeScreen'; // or FarmFerryHome
import CartScreen from '../screens/CartScreen';
import OrdersScreen from '../screens/OrdersScreen';
import WishlistScreen from '../screens/WishlistScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { ShoppingCart, Package, Heart, User, Home, Truck } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  const { cartItems, wishlistItems } = useAppContext(); // ✅ use actual context arrays
  const insets = useSafeAreaInsets();

  const cartCount = Array.isArray(cartItems) ? cartItems.length : 0;
  const wishlistCount = Array.isArray(wishlistItems) ? wishlistItems.length : 0;

  const renderIcon = (Icon, focused, badge) => (
    <View className="items-center relative">
      <Icon size={22} color={focused ? '#166534' : '#6b7280'} />
      {badge > 0 && (
        <View className="absolute -top-1 -right-2 bg-red-500 w-4 h-4 rounded-full items-center justify-center">
          <Text className="text-white text-[10px] font-bold">{badge}</Text>
        </View>
      )}
    </View>
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#166534', // ✅ Theme color
        tabBarInactiveTintColor: '#9ca3af', // gray-400 (optional)
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: -2,
        },
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen} // or FarmFerryHome
        options={{
          tabBarIcon: ({ focused }) => renderIcon(Home, focused, 0),
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarIcon: ({ focused }) => renderIcon(ShoppingCart, focused, cartCount),
          tabBarLabel: 'Cart',
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarIcon: ({ focused }) => renderIcon(Truck, focused, 0),
          tabBarLabel: 'Orders',
        }}
      />
      <Tab.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{
          tabBarIcon: ({ focused }) => renderIcon(Heart, focused, wishlistCount),
          tabBarLabel: 'Wishlist',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => renderIcon(User, focused, 0),
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}