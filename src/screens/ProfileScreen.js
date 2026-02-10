import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Linking,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather, Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  // Helper to get display name/info safely
  const profileUser = user?.customer || user || {};
  const displayName = profileUser.name || (profileUser.firstName ? `${profileUser.firstName} ${profileUser.lastName || ''}` : 'User');
  const displayEmail = profileUser.email || '';
  const displayPhone = profileUser.phone || '';

  const MenuItem = ({ icon, title, subtitle, onPress, iconColor = "#333", iconBg = "transparent" }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6'
      }}
    >
      <View style={{ width: 40, alignItems: 'center' }}>
        {icon}
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#1f2937' }}>{title}</Text>
        <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{subtitle}</Text>
      </View>
      <Feather name="chevron-right" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );

  const FooterLink = ({ title, onPress }) => (
    <TouchableOpacity onPress={onPress} style={{ paddingVertical: 12 }}>
      <Text style={{ fontSize: 14, color: '#4b5563', fontWeight: '500' }}>{title}</Text>
    </TouchableOpacity>
  );

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error("Logout failed:", error);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#004C46' }} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#004C46" />

      {/* Standardized Header */}
      <View style={{
        backgroundColor: '#004C46',
        paddingBottom: 16,
        paddingTop: 10
      }}>
        {/* Top Row: Brand, Location, Timer, Profile */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 }}>
          <View>
            <Text style={{ color: 'white', fontWeight: '800', fontSize: 20, letterSpacing: -0.5 }}>FarmFerry</Text>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>Deliver to Selected Location</Text>
              <Feather name="chevron-down" size={16} color="white" />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* 5 mins Badge */}
            <View style={{ backgroundColor: 'white', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
              <Feather name="clock" size={12} color="black" />
              <Text style={{ fontSize: 12, fontWeight: 'bold', marginLeft: 4 }}>30 mins</Text>
            </View>
            {/* Profile Icon */}
            <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
              <Feather name="user" size={20} color="#004C46" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* User Info Section (Below Header) */}
      <View style={{ padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* Profile Pic Placeholder */}
          <View style={{
            width: 64, height: 64,
            borderRadius: 32,
            backgroundColor: 'white',
            justifyContent: 'center', alignItems: 'center',
            borderWidth: 2, borderColor: '#dcfce7'
          }}>
            <Feather name="user" size={32} color="#004C46" />
          </View>

          {/* User Details */}
          <View style={{ marginLeft: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
              {displayEmail || 'user@farmferry.com'}
            </Text>
            <Text style={{ fontSize: 13, color: '#4b5563', marginTop: 2 }}>
              {displayPhone || '+91 00000 00000'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: 'white' }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      >

        {/* 2. Menu Items */}
        <View style={{ marginTop: 10 }}>
          <MenuItem
            icon={<Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3500/3500833.png' }} style={{ width: 28, height: 28 }} ResizeMode="contain" />}
            title="My Orders"
            subtitle="Track Orders, Orders History"
            onPress={() => navigation.navigate('Orders')}
          />
          <MenuItem
            icon={<Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1077/1077035.png' }} style={{ width: 24, height: 24 }} ResizeMode="contain" />}
            title="Wishlist"
            subtitle="Your Wishlist"
            onPress={() => navigation.navigate('Wishlist')}
          />
          <MenuItem
            icon={<Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/535/535239.png' }} style={{ width: 24, height: 24 }} ResizeMode="contain" />}
            title="Manage Address"
            subtitle="Manage Delivery, Billing Address Here"
            onPress={() => navigation.navigate('AddAddress')} // Or ManageAddress screen
          />
          <MenuItem
            icon={<Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/747/747376.png' }} style={{ width: 24, height: 24 }} ResizeMode="contain" />}
            title="Create Custom Profile"
            subtitle="See Products Best Suited For Your Needs"
            onPress={() => { }} // Placeholder
          />
          <MenuItem
            icon={<Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/471/471662.png' }} style={{ width: 24, height: 24 }} ResizeMode="contain" />}
            title="About Us"
            subtitle="Know More About FarmFerry"
            onPress={() => { }} // Placeholder
          />
        </View>

        {/* 3. Footer Links */}
        <View style={{ backgroundColor: '#f9fafb', borderRadius: 16, padding: 20, marginTop: 30 }}>
          <FooterLink title="Contact Us" onPress={() => navigation.navigate('Support')} />
          <FooterLink title="Our Policies" onPress={() => { }} />
          <FooterLink title="Blogs" onPress={() => { }} />
          <FooterLink title="FAQ" onPress={() => navigation.navigate('Support')} />
          <FooterLink title="Terms & Conditions" onPress={() => { }} />
          <FooterLink title="Terms Of Service" onPress={() => { }} />
          <FooterLink title="Grievance Officer" onPress={() => { }} />
          <FooterLink title="Delete Account" onPress={() => navigation.navigate('Settings')} />
        </View>

        {/* 4. Sign Out Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 30,
            marginBottom: 20,
            paddingVertical: 12,
            borderRadius: 30,
            borderWidth: 1,
            borderColor: '#dcfce7',
            backgroundColor: 'white'
          }}
        >
          <Feather name="log-out" size={18} color="#004C46" />
          <Text style={{ marginLeft: 8, color: '#004C46', fontWeight: '700', fontSize: 16 }}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;