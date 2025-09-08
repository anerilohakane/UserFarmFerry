
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { ArrowLeft, Bell, MapPin } from 'lucide-react-native';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useAppContext } from '../../context/AppContext';
import { useUserLocation } from '../../hooks/useUserLocation';

export default function AppBar({ showBack = false, title = "FarmFerry" }) {
  const navigation = useNavigation();
  const { cartItems, unreadNotificationCount } = useAppContext();
  const { address } = useUserLocation(); 
  
  // Get status bar height
  const statusBarHeight = Constants.statusBarHeight;
  
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: statusBarHeight,
        paddingHorizontal: 16,
        // paddingBottom: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 3,
      }}
    >
      {/* Left: Logo or Back Arrow */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {showBack ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              marginRight: 12,
              backgroundColor: '#f0fdf4',
              borderRadius: 9999,
              padding: 8,
            }}
          >
            <ArrowLeft size={20} color="#16a34a" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => navigation.navigate('LogoScreen')}>
            <Image
              source={require('../../../assets/images/Icon2.jpeg')}
              style={{ width: 58, height: 58, borderRadius: 12, marginRight: 12, marginTop: 4 }}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
        <View>
           <Text className="text-lg font-bold text-green-800 mt-4">FarmFerry</Text>
          <View className="flex-row items-center">
            <MapPin size={14} color="green" className="mr-1" />
            <Text className="text-base font-xl text-green-700">
              {address || 'Locating...'}
            </Text>
          </View>
        </View>
      </View>

      {/* Right: Icons */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            backgroundColor: '#f0fdf4',
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 12,
            position: 'relative',
            borderWidth: 1,
            borderColor: '#dcfce7',
          }}
          onPress={() => navigation.navigate('NotificationsScreen')}
        >
          {unreadNotificationCount > 0 && (
            <View
              style={{
                position: 'absolute',
                top: -6,
                right: -6,
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: 'red',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 10,
                borderWidth: 2,
                borderColor: '#f0fdf4',
              }}
            >
              <Text style={{ color: 'white', fontSize: 11, fontWeight: '800' }}>
                {unreadNotificationCount}
              </Text>
            </View>
          )}
          <Bell width={22} height={22} color="#16a34a" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
