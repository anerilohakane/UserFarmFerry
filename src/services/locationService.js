import * as Location from 'expo-location';

export const getCurrentAddress = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Permission to access location was denied');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });

    return `${address.name}, ${address.street}, ${address.city}`;
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
};
