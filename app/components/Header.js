// import React from 'react';
// import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Feather } from '@expo/vector-icons';

// export default function Header() {
//   return (
//     <>
//       {/* Status Bar - matches header green */}
//       <StatusBar backgroundColor="#16a34a" barStyle="light-content" />

//       <SafeAreaView edges={['top']} className="bg-green-700">
//         <View className="px-4 py-3 flex-row items-center justify-between rounded-b-xl">
//           {/* Location */}
//           <View className="flex-row items-center flex-1">
//             <Feather name="map-pin" size={20} color="white" />
//             <Text className="text-white text-base ml-2">Pune, Maharashtra, India</Text>
//           </View>

//           {/* Right Actions */}
//           <View className="flex-row items-center gap-4">
//             {/* Notification Bell */}
//             <TouchableOpacity>
//               <Feather name="bell" size={22} color="white" />
//             </TouchableOpacity>

//             {/* More Options */}
//             <TouchableOpacity>
//               <Feather name="more-vertical" size={22} color="white" />
//             </TouchableOpacity>
//           </View>
//         </View>
//       </SafeAreaView>
//     </>
//   );
// }



import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';

export default function Header() {
  const [coords, setCoords] = useState(null); // { latitude, longitude }
  const [locationText, setLocationText] = useState('Pune, Maharashtra, India');
  const [loadingLocation, setLoadingLocation] = useState(false);

  const getLocationPermissionAndFetch = useCallback(async (opts = { force: false }) => {
    try {
      setLoadingLocation(true);
      setLocationText('Fetching location...');

      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationText('Location access denied');
        setLoadingLocation(false);
        return;
      }

      // Get current position
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
        maximumAge: 10000,
        timeout: 10000,
      });

      if (!pos || !pos.coords) {
        setLocationText('Location not available');
        setLoadingLocation(false);
        return;
      }

      const { latitude, longitude } = pos.coords;
      setCoords({ latitude, longitude });

      // Reverse geocode to get readable address (expo-location helper)
      try {
        const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (Array.isArray(addresses) && addresses.length > 0) {
          const addr = addresses[0];
          // Construct compact display line similar to the web snippet
          const parts = [
            addr.name, // building / place name
            addr.street,
            addr.city,
            addr.region, // state
            addr.postalCode,
            addr.country,
          ].filter(Boolean);
          const display = parts.join(', ');
          setLocationText(display || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        } else {
          setLocationText(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        }
      } catch (revErr) {
        // fallback to coords if reverse geocode fails
        setLocationText(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      }
    } catch (err) {
      console.warn('getLocation error', err);
      if (err?.code === 'E_LOCATION_TIMEOUT' || (err?.message && err.message.includes('timed out'))) {
        setLocationText('Location timeout');
      } else {
        setLocationText('Unable to fetch location');
      }
    } finally {
      setLoadingLocation(false);
    }
  }, []);

  useEffect(() => {
    // initial fetch; keep default text visible until we fetch
    getLocationPermissionAndFetch();
  }, [getLocationPermissionAndFetch]);

  const openInMaps = useCallback(async () => {
    if (!coords) {
      await getLocationPermissionAndFetch({ force: true });
      if (!coords) {
        Alert.alert('Location not available', 'Could not determine your location.');
        return;
      }
    }
    const { latitude, longitude } = coords || {};
    if (!latitude || !longitude) {
      Alert.alert('Location not available', 'Could not determine your coordinates.');
      return;
    }

    // Try platform-specific map urls then fallback to google maps web
    const iosUrl = `maps:0,0?q=${latitude},${longitude}`;
    const androidUrl = `geo:${latitude},${longitude}?q=${latitude},${longitude}`;
    const webUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    try {
      const urlToTry = Platform.OS === 'ios' ? iosUrl : androidUrl;
      const canOpen = await Linking.canOpenURL(urlToTry);
      if (canOpen) {
        await Linking.openURL(urlToTry);
      } else {
        await Linking.openURL(webUrl);
      }
    } catch (err) {
      console.warn('openInMaps error', err);
      try { await Linking.openURL(webUrl); }
      catch (err2) { console.warn('Failed to open maps fallback', err2); Alert.alert('Unable to open maps', 'Please check your device settings.'); }
    }
  }, [coords, getLocationPermissionAndFetch]);

  return (
    <>
      {/* Status Bar - matches header green */}
      <StatusBar backgroundColor="#16a34a" barStyle="light-content" />

      <SafeAreaView edges={['top']} className="bg-green-700">
        <View className="px-4 py-3 flex-row items-center justify-between rounded-b-xl">
          {/* Location (touchable - opens maps) */}
          <TouchableOpacity
            style={{ flex: 1 }}
            className="flex-row items-center flex-1"
            activeOpacity={0.8}
            onPress={openInMaps}
          >
            <Feather name="map-pin" size={20} color="white" />
            <View style={{ marginLeft: 8, flex: 1 }}>
              <Text className="text-white text-base" numberOfLines={1} ellipsizeMode="tail">
                {loadingLocation ? 'Fetching location...' : locationText}
              </Text>
            </View>

            {/* refresh icon */}
            {/* <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation && e.stopPropagation();
                getLocationPermissionAndFetch({ force: true });
              }}
              className="ml-2"
              accessibilityLabel="Refresh location"
            >
              {loadingLocation ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Feather name="refresh-ccw" size={18} color="white" />
              )}
            </TouchableOpacity> */}
          </TouchableOpacity>

          {/* Right Actions */}
          <View className="flex-row items-center gap-4">
            {/* Notification Bell */}
            <TouchableOpacity>
              <Feather name="bell" size={22} color="white" />
            </TouchableOpacity>

            {/* More Options */}
            <TouchableOpacity>
              <Feather name="more-vertical" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}
