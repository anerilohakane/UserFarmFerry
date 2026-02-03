import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function UpdateProfileImageScreen() {
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'We need access to your media to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.5 });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleUpload = () => {
    if (!image) {
      Alert.alert('No Image', 'Please select an image first.');
      return;
    }

    Alert.alert('Success', 'Profile picture updated.');
  };

  return (
    <View className="flex-1 bg-gray-50 p-5 items-center justify-center">
      {image ? (
        <Image source={{ uri: image }} className="w-40 h-40 rounded-full mb-6" />
      ) : (
        <View className="w-40 h-40 bg-gray-200 rounded-full mb-6 items-center justify-center">
          <Text className="text-gray-500">No Image</Text>
        </View>
      )}

      <TouchableOpacity
        onPress={pickImage}
        className="bg-green-500 px-6 py-3 rounded-xl mb-4"
      >
        <Text className="text-white font-semibold">Select Image</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleUpload}
        className="bg-green-700 px-6 py-3 rounded-xl"
      >
        <Text className="text-white font-semibold">Upload</Text>
      </TouchableOpacity>
    </View>
  );
}
