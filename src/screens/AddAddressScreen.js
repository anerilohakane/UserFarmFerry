import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Dimensions, SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View, KeyboardAvoidingView, Platform } from 'react-native';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { customerAPI } from '../services/api';

const { width } = Dimensions.get('window');

// Responsive sizing helper
const responsiveValue = (mobile, tablet) => {
  return width >= 768 ? tablet : mobile;
};

const ADDRESS_TYPES = [
  { label: 'Home', value: 'Home' },
  { label: 'Work', value: 'Work' },
  { label: 'Other', value: 'Other' },
];

const AddAddressScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Parse address from navigation params

  const parseAddressFromString = (addressString) => {
    if (!addressString) return {};

    console.log('Parsing address string:', addressString);

    // Handle coordinate-based addresses
    if (addressString.startsWith('Location:')) {
      return { street: addressString };
    }

    const parts = addressString.split(', ').filter(Boolean);
    const parsed = {};

    console.log('Address parts:', parts);

    // Try to extract postal code (6 digits for India)
    const postalCodeMatch = addressString.match(/\b\d{6}\b/);
    if (postalCodeMatch) {
      parsed.postalCode = postalCodeMatch[0];
    }

    // Common Indian states for matching (including abbreviations)
    const indianStates = [
      'Maharashtra', 'MH', 'Karnataka', 'KA', 'Tamil Nadu', 'TN', 'Gujarat', 'GJ',
      'Rajasthan', 'RJ', 'Uttar Pradesh', 'UP', 'Madhya Pradesh', 'MP',
      'West Bengal', 'WB', 'Andhra Pradesh', 'AP', 'Telangana', 'TS',
      'Kerala', 'KL', 'Punjab', 'PB', 'Haryana', 'HR', 'Bihar', 'BR',
      'Odisha', 'OR', 'Assam', 'AS', 'Jharkhand', 'JH', 'Chhattisgarh', 'CG',
      'Uttarakhand', 'UK', 'Himachal Pradesh', 'HP', 'Delhi', 'DL'
    ];

    // Find state (case insensitive)
    const stateMatch = parts.find(part =>
      indianStates.some(state =>
        part.toLowerCase().trim() === state.toLowerCase() ||
        part.toLowerCase().includes(state.toLowerCase())
      )
    );
    if (stateMatch) {
      parsed.state = stateMatch.trim();
    }

    // Find city (usually before state, or second to last if no state found)
    let cityIndex = -1;
    if (stateMatch) {
      cityIndex = parts.findIndex(part => part === stateMatch) - 1;
    } else {
      // If no state found, assume city is second to last (before postal code/country)
      cityIndex = Math.max(0, parts.length - 2);
    }

    if (cityIndex >= 0 && parts[cityIndex] && !parts[cityIndex].match(/\d{6}/)) {
      parsed.city = parts[cityIndex].trim();
    }

    // Street address (combine first parts, excluding identified components)
    const excludeFromStreet = [
      parsed.city,
      parsed.state,
      parsed.postalCode,
      'India'
    ].filter(Boolean);

    const streetParts = parts.filter(part => {
      const trimmedPart = part.trim();
      return !excludeFromStreet.some(exclude =>
        trimmedPart.toLowerCase() === exclude.toLowerCase() ||
        trimmedPart === exclude
      ) && !trimmedPart.match(/^\d{6}$/); // Exclude standalone postal codes
    });

    if (streetParts.length > 0) {
      parsed.street = streetParts.join(', ').trim();
    }

    console.log('Parsed address components:', parsed);
    return parsed;
  };

  const {
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      addressType: 'Home',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      name: '',
      phone: '',

    },
  });

  // Populate form fields when component mounts with navigation params
  useEffect(() => {
    const { suggestedAddress, latitude, longitude } = route.params || {};

    if (suggestedAddress) {
      const parsedAddress = parseAddressFromString(suggestedAddress);

      // Set form values with parsed address
      if (parsedAddress.street) setValue('street', parsedAddress.street);
      if (parsedAddress.city) setValue('city', parsedAddress.city);
      if (parsedAddress.state) setValue('state', parsedAddress.state);
      if (parsedAddress.postalCode) setValue('postalCode', parsedAddress.postalCode);

      // Store coordinates for future use if needed
      if (latitude && longitude) {
        console.log('Address coordinates:', { latitude, longitude });
      }
    }
  }, [route.params, setValue]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setGeneralError('');
    try {
      // Map form data to backend schema expected format
      const payload = {
        ...data,
        type: data.addressType ? data.addressType.toLowerCase() : 'home', // Map addressType to type and lowercase
        // Coordinates support if we want to add them to schema later, currently not in schema but good to have prepared
        // location: (route.params?.latitude && route.params?.longitude) ? {
        //   type: 'Point',
        //   coordinates: [route.params.longitude, route.params.latitude]
        // } : undefined
      };

      // Clean up frontend-only fields
      delete payload.addressType;

      console.log('Sending address payload:', payload);

      await customerAPI.addAddress(payload);
      Alert.alert('Success', 'Address added successfully!', [
        {
          text: 'Continue to Order',
          onPress: () => {
            // Navigate to OrderSummary screen to complete the order
            navigation.navigate('OrderSummary');
          }
        },
      ]);
    } catch (error) {
      console.error('Address save error:', error);
      const backendErrors = error.response?.data?.errors;
      const backendMessage = error.response?.data?.message || error.response?.data?.error; // Check for 'error' field too

      let mapped = false;
      if (Array.isArray(backendErrors)) {
        backendErrors.forEach((err) => {
          if (err.field && err.message) {
            setError(err.field, { type: 'server', message: err.message });
            mapped = true;
          }
        });
      }
      if (!mapped) {
        const debugError = JSON.stringify(error.response?.data || error.message || error);
        console.log('Full Error:', debugError); // Console log for developer tools
        Alert.alert('Error Details', `Debug Info: ${debugError}`); // Alert for user/tester
        setGeneralError(backendMessage || `An unexpected error occurred: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      {/* AppBar with back arrow */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <Feather name="arrow-left" size={responsiveValue(20, 24)} color="black" />
        </TouchableOpacity>
        <Text className={`${responsiveValue('text-base', 'text-lg')} text-black font-medium`}>Add Address</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: responsiveValue(16, 24),
            paddingVertical: responsiveValue(16, 20),
            paddingBottom: responsiveValue(24, 32)
          }}
        >
          {generalError ? (
            <Text
              className="text-red-500 mb-4 text-center"
              style={{ fontSize: responsiveValue(14, 16) }}
            >
              {generalError}
            </Text>
          ) : null}

          {/* Address Type Picker */}
          <Controller
            control={control}
            name="addressType"
            rules={{ required: 'Address type is required' }}
            render={({ field: { onChange, value } }) => (
              <View className="mb-4">
                <Text
                  className="mb-2 text-gray-700 font-medium"
                  style={{ fontSize: responsiveValue(14, 16) }}
                >
                  Address Type
                </Text>
                <View className="border border-gray-300 rounded-lg">
                  <Picker
                    selectedValue={value}
                    onValueChange={onChange}
                    style={{
                      height: responsiveValue(50, 52)
                    }}
                  >
                    {ADDRESS_TYPES.map((type) => (
                      <Picker.Item
                        key={type.value}
                        label={type.label}
                        value={type.value}
                      />
                    ))}
                  </Picker>
                </View>
                {errors.addressType?.message && (
                  <Text
                    className="text-red-500 text-xs mt-1"
                    style={{ fontSize: responsiveValue(12, 14) }}
                  >
                    {errors.addressType.message}
                  </Text>
                )}
              </View>
            )}
          />

          {/* Street Address */}
          <Controller
            control={control}
            name="street"
            rules={{ required: 'Street address is required' }}
            render={({ field: { onChange, value } }) => (
              <View className="mb-4">
                <Input
                  label="Street Address"
                  placeholder="Enter street address"
                  value={value}
                  onChangeText={onChange}
                  error={errors.street?.message}
                  fontSize={responsiveValue(14, 16)}
                  inputHeight={responsiveValue(48, 52)}
                />
              </View>
            )}
          />

          {/* City */}
          <Controller
            control={control}
            name="city"
            rules={{ required: 'City is required' }}
            render={({ field: { onChange, value } }) => (
              <View className="mb-4">
                <Input
                  label="City"
                  placeholder="Enter city"
                  value={value}
                  onChangeText={onChange}
                  error={errors.city?.message}
                  fontSize={responsiveValue(14, 16)}
                  inputHeight={responsiveValue(48, 52)}
                />
              </View>
            )}
          />

          {/* State */}
          <Controller
            control={control}
            name="state"
            rules={{ required: 'State is required' }}
            render={({ field: { onChange, value } }) => (
              <View className="mb-4">
                <Input
                  label="State"
                  placeholder="Enter state"
                  value={value}
                  onChangeText={onChange}
                  error={errors.state?.message}
                  fontSize={responsiveValue(14, 16)}
                  inputHeight={responsiveValue(48, 52)}
                />
              </View>
            )}
          />

          {/* Postal Code */}
          <Controller
            control={control}
            name="postalCode"
            rules={{ required: 'Postal code is required' }}
            render={({ field: { onChange, value } }) => (
              <View className="mb-4">
                <Input
                  label="Postal Code"
                  placeholder="Enter postal code"
                  value={value}
                  onChangeText={onChange}
                  error={errors.postalCode?.message}
                  keyboardType="numeric"
                  fontSize={responsiveValue(14, 16)}
                  inputHeight={responsiveValue(48, 52)}
                />
              </View>
            )}
          />

          {/* Country */}
          <Controller
            control={control}
            name="country"
            rules={{ required: 'Country is required' }}
            render={({ field: { onChange, value } }) => (
              <View className="mb-4">
                <Input
                  label="Country"
                  placeholder="Enter country"
                  value={value}
                  onChangeText={onChange}
                  error={errors.country?.message}
                  fontSize={responsiveValue(14, 16)}
                  inputHeight={responsiveValue(48, 52)}
                />
              </View>
            )}
          />

          {/* Name */}
          <Controller
            control={control}
            name="name"
            rules={{ required: 'Name is required' }}
            render={({ field: { onChange, value } }) => (
              <View className="mb-4">
                <Input
                  label="Full Name"
                  placeholder="Enter full name"
                  value={value}
                  onChangeText={onChange}
                  error={errors.name?.message}
                  fontSize={responsiveValue(14, 16)}
                  inputHeight={responsiveValue(48, 52)}
                />
              </View>
            )}
          />


          {/* Phone Number */}
          <Controller
            control={control}
            name="phone"
            rules={{
              required: 'Phone number is required',
              pattern: {
                value: /^[0-9]{10}$/,
                message: 'Phone number must be 10 digits',
              },
            }}
            render={({ field: { onChange, value } }) => (
              <View className="mb-6">
                <Input
                  label="Phone Number"
                  placeholder="Enter phone number"
                  value={value}
                  onChangeText={onChange}
                  error={errors.phone?.message}
                  keyboardType="phone-pad"
                  maxLength={10}
                  fontSize={responsiveValue(14, 16)}
                  inputHeight={responsiveValue(48, 52)}
                />
              </View>
            )}
          />

          {/* Save Button */}
          <Button
            title="Save Address"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            fullWidth
            size={responsiveValue('medium', 'large')}
            fontSize={responsiveValue(16, 18)}
            buttonHeight={responsiveValue(50, 56)}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddAddressScreen;