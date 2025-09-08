import React from 'react';
import { View, Text, TouchableOpacity, Dimensions, StatusBar, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ArrowLeft, Bell, MapPin, Search, Filter } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../../context/AppContext';
import { useUserLocation } from '../../hooks/useUserLocation';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');

// Responsive breakpoints
const isSmallScreen = width < 375;
const isMediumScreen = width >= 375 && width < 768;
const isLargeScreen = width >= 768;

const responsiveValue = (small, medium, large) => {
  if (isSmallScreen) return small;
  if (isMediumScreen) return medium;
  return large;
};

export default function Header({
  // Basic props
  title = "FarmFerry",
  showBack = false,
  showLogo = false,
  showLocation = false,
  showNotifications = false,
  showSearch = false,
  showFilter = false,
  
  // Custom actions
  onBackPress,
  onLogoPress,
  onSearchPress,
  onFilterPress,
  onNotificationPress,
  
  // Search props
  searchQuery = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  
  // Styling
  backgroundColor = "white",
  textColor = "#374151",
  iconColor = "#10B981",
  borderColor = "#e5e7eb",
  
  // Layout
  paddingHorizontal = 16,
  showBorder = true,
  showShadow = true,
  
  // Children for custom content
  children,
  
  // Right side custom content
  rightContent,
  
  // Status bar
  statusBarStyle = "dark-content",
  statusBarBackgroundColor = "#ffffff"
}) {
  const navigation = useNavigation();
  const { unreadNotificationCount } = useAppContext();
  const { address } = useUserLocation();
  
  // Get status bar height
  const statusBarHeight = Constants.statusBarHeight;
  
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };
  
  const handleLogoPress = () => {
    if (onLogoPress) {
      onLogoPress();
    } else {
      navigation.navigate('LogoScreen');
    }
  };
  
  const handleNotificationPress = () => {
    if (onNotificationPress) {
      onNotificationPress();
    } else {
      navigation.navigate('NotificationsScreen');
    }
  };

  return (
    <>
      <StatusBar 
        barStyle={statusBarStyle} 
        backgroundColor={statusBarBackgroundColor} 
      />
      <View
        style={{
          backgroundColor,
          paddingTop: statusBarHeight,
          paddingHorizontal: responsiveValue(paddingHorizontal - 4, paddingHorizontal, paddingHorizontal + 4),
          paddingBottom: responsiveValue(12, 16, 20),
          borderBottomWidth: showBorder ? 1 : 0,
          borderBottomColor: borderColor,
          shadowColor: showShadow ? '#000' : 'transparent',
          shadowOffset: { width: 0, height: showShadow ? 1 : 0 },
          shadowOpacity: showShadow ? 0.05 : 0,
          shadowRadius: showShadow ? 2 : 0,
          elevation: showShadow ? 3 : 0,
        }}
      >
        {/* Main Header Content */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Left Section */}
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            {/* Back Button */}
            {showBack && (
              <TouchableOpacity
                onPress={handleBackPress}
                style={{
                  marginRight: responsiveValue(12, 16, 20),
                  backgroundColor: '#f3f4f6',
                  borderRadius: 9999,
                  padding: responsiveValue(8, 10, 12),
                }}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              >
                <ArrowLeft 
                  size={responsiveValue(18, 20, 22)} 
                  color={iconColor} 
                />
              </TouchableOpacity>
            )}
            
                         {/* Logo */}
             {showLogo && (
               <TouchableOpacity
                 onPress={handleLogoPress}
                 style={{ marginRight: responsiveValue(12, 16, 20) }}
               >
                 <Image
                   source={require('../../../assets/images/Icon2.jpeg')}
                   style={{
                     width: responsiveValue(55, 60, 64),
                     height: responsiveValue(55, 60, 64),
                     borderRadius: 12,
                     resizeMode: 'cover',
                   }}
                 />
               </TouchableOpacity>
             )}
            
            {/* Title and Location */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: responsiveValue(18, 20, 22),
                  fontWeight: 'bold',
                  color: textColor,
                  marginBottom: showLocation ? 2 : 0,
                }}
                numberOfLines={1}
              >
                {title}
              </Text>
              
              {showLocation && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MapPin 
                    size={responsiveValue(12, 14, 16)} 
                    color="#16a34a" 
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={{
                      fontSize: responsiveValue(12, 14, 16),
                      color: '#16a34a',
                      fontWeight: '500',
                    }}
                    numberOfLines={1}
                  >
                    {address || 'Locating...'}
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Right Section */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* Search Button */}
            {showSearch && !onSearchChange && (
              <TouchableOpacity
                onPress={onSearchPress}
                style={{
                  width: responsiveValue(40, 44, 48),
                  height: responsiveValue(40, 44, 48),
                  borderRadius: 12,
                  backgroundColor: '#f3f4f6',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: responsiveValue(8, 12, 16),
                }}
              >
                <Search size={responsiveValue(18, 20, 22)} color={iconColor} />
              </TouchableOpacity>
            )}
            
            {/* Filter Button */}
            {showFilter && (
              <TouchableOpacity
                onPress={onFilterPress}
                style={{
                  width: responsiveValue(40, 44, 48),
                  height: responsiveValue(40, 44, 48),
                  borderRadius: 12,
                  backgroundColor: '#f3f4f6',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: responsiveValue(8, 12, 16),
                }}
              >
                <Filter size={responsiveValue(18, 20, 22)} color={iconColor} />
              </TouchableOpacity>
            )}
            
            {/* Notifications */}
            {showNotifications && (
              <TouchableOpacity
                onPress={handleNotificationPress}
                style={{
                  width: responsiveValue(40, 44, 48),
                  height: responsiveValue(40, 44, 48),
                  borderRadius: 12,
                  backgroundColor: '#f0fdf4',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#dcfce7',
                  position: 'relative',
                }}
              >
                {unreadNotificationCount > 0 && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      width: responsiveValue(18, 20, 22),
                      height: responsiveValue(18, 20, 22),
                      borderRadius: responsiveValue(9, 10, 11),
                      backgroundColor: '#ef4444',
                      justifyContent: 'center',
                      alignItems: 'center',
                      zIndex: 10,
                      borderWidth: 2,
                      borderColor: '#f0fdf4',
                    }}
                  >
                    <Text style={{ 
                      color: 'white', 
                      fontSize: responsiveValue(10, 11, 12), 
                      fontWeight: '800' 
                    }}>
                      {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                    </Text>
                  </View>
                )}
                <Bell size={responsiveValue(18, 20, 22)} color="#16a34a" />
              </TouchableOpacity>
            )}
            
            {/* Custom Right Content */}
            {rightContent}
          </View>
        </View>
        
        {/* Search Bar */}
        {showSearch && onSearchChange && (
          <View style={{ 
            marginTop: responsiveValue(12, 16, 20),
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#f9fafb',
            borderRadius: 12,
            paddingHorizontal: responsiveValue(12, 16, 20),
            paddingVertical: responsiveValue(10, 12, 14),
            borderWidth: 1,
            borderColor: '#e5e7eb',
          }}>
            <Search size={responsiveValue(16, 18, 20)} color="#6b7280" />
            <TextInput
              placeholder={searchPlaceholder}
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={onSearchChange}
              style={{
                flex: 1,
                marginLeft: responsiveValue(8, 12, 16),
                fontSize: responsiveValue(14, 16, 16),
                color: '#374151',
              }}
              returnKeyType="search"
            />
          </View>
        )}
        
        {/* Custom Children Content */}
        {children}
      </View>
    </>
  );
}

// Predefined header variants for common use cases
export const HeaderVariants = {
  // Main app header with logo, location, and notifications
  Main: (props) => (
    <Header
      showLogo={true}
      showLocation={true}
      showNotifications={true}
      title="FarmFerry"
      {...props}
    />
  ),
  
  // Simple back button header
  Back: (props) => (
    <Header
      showBack={true}
      {...props}
    />
  ),
  
  // Header with back button and search
  BackWithSearch: (props) => (
    <Header
      showBack={true}
      showSearch={true}
      {...props}
    />
  ),
  
  // Header with back button and filter
  BackWithFilter: (props) => (
    <Header
      showBack={true}
      showFilter={true}
      {...props}
    />
  ),
  
  // Header with back button, search, and filter
  BackWithSearchAndFilter: (props) => (
    <Header
      showBack={true}
      showSearch={true}
      showFilter={true}
      {...props}
    />
  ),
  
  // Header with notifications only
  Notifications: (props) => (
    <Header
      showNotifications={true}
      {...props}
    />
  ),
};
