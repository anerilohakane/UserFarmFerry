// hooks/useUserLocation.js
import * as Location from 'expo-location';
import { useState, useEffect } from 'react';

export const useUserLocation = () => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        // Ask permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        // Get coordinates
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);

        // Convert to address
        const geo = await Location.reverseGeocodeAsync(loc.coords);
        if (geo.length > 0) {
          const { city, region, country } = geo[0];
          setAddress(`${city}, ${region}, ${country}`);
        }
      } catch (error) {
        setErrorMsg('Could not fetch location');
        console.error(error);
      }
    })();
  }, []);

  return { location, address, errorMsg };
};
