import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Alert, 
  Image, 
  TouchableOpacity, 
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { z } from 'zod';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Card from '../ui/Card';
import DatePicker from '../ui/DatePicker';
import { PRODUCT_UNITS } from '../../types';

// Enhanced responsive scaling
const { width, height } = Dimensions.get('window');

// Breakpoints based on common device sizes
const breakpoints = {
  small: 375,   // iPhone SE, small phones
  medium: 414,   // iPhone 8 Plus, Pixel 3
  large: 768,    // iPad mini, small tablets
  xlarge: 1024   // Standard iPad, larger tablets
};

// Get current breakpoint
const getBreakpoint = () => {
  if (width < breakpoints.small) return 'small';
  if (width < breakpoints.medium) return 'medium';
  if (width < breakpoints.large) return 'large';
  return 'xlarge';
};

// Responsive scaling function with more granular control
const scaleSize = (size, breakpointMultipliers = {}) => {
  const breakpoint = getBreakpoint();
  const multiplier = breakpointMultipliers[breakpoint] || 1;
  return size * multiplier;
};

// Font scaling with minimum and maximum limits
const scaleFont = (size, { min = 12, max = Infinity } = {}) => {
  const scaledSize = scaleSize(size, {
    small: 0.9,
    medium: 1,
    large: 1.1,
    xlarge: 1.2
  });
  return Math.max(min, Math.min(max, scaledSize));
};

// Enhanced responsive styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingTop: scaleSize(24),
    paddingBottom: scaleSize(40),
    paddingHorizontal: scaleSize(16, {
      small: 0.8,
      medium: 1,
      large: 1.2,
      xlarge: 1.5
    }),
  },
  sectionTitle: {
    fontSize: scaleFont(18, { min: 16, max: 22 }),
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: scaleSize(16),
  },
  imageContainer: {
    width: scaleSize(80, {
      small: 0.9,
      medium: 1,
      large: 1.1,
      xlarge: 1.2
    }),
    height: scaleSize(80, {
      small: 0.9,
      medium: 1,
      large: 1.1,
      xlarge: 1.2
    }),
    marginRight: scaleSize(8),
    marginBottom: scaleSize(8),
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: scaleSize(8),
  },
  removeButton: {
    position: 'absolute',
    top: scaleSize(-6),
    right: scaleSize(-6),
    width: scaleSize(24),
    height: scaleSize(24),
    borderRadius: scaleSize(12),
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helperText: {
    fontSize: scaleFont(12),
    color: '#64748b',
    marginTop: scaleSize(4),
  },
  errorText: {
    fontSize: scaleFont(12),
    color: '#ef4444',
    marginTop: scaleSize(4),
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: scaleSize(8),
    backgroundColor: 'white',
    marginBottom: scaleSize(4),
  },
  picker: {
    height: scaleSize(50, {
      small: 0.95,
      medium: 1,
      large: 1.05
    }),
  },
  buttonGroup: {
    flexDirection: width < breakpoints.medium ? 'column' : 'row',
    gap: scaleSize(12),
    marginTop: scaleSize(8),
  },
  dualInputContainer: {
    flexDirection: width < breakpoints.medium ? 'column' : 'row',
    gap: scaleSize(12),
    marginBottom: scaleSize(12),
  },
  dualInputItem: {
    flex: width < breakpoints.medium ? undefined : 1,
  },
  inputLabel: {
    fontSize: scaleFont(14, { min: 12, max: 16 }),
    color: '#334155',
    marginBottom: scaleSize(6),
  },
  requiredIndicator: {
    color: '#ef4444'
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: scaleSize(12),
  },
  cardContent: {
    padding: scaleSize(16, {
      small: 0.9,
      medium: 1,
      large: 1.1
    })
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: scaleSize(8),
  },
  checkboxLabel: {
    fontSize: scaleFont(14),
    marginLeft: scaleSize(8),
    color: '#334155',
  }
});

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100, 'Name too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description too long'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  discountedPrice: z.number().optional(),
  stockQuantity: z.number().min(0, 'Stock quantity cannot be negative'),
  unit: z.string().min(1, 'Unit is required'),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().optional(),
  weight: z.number().optional(),
  dimensions: z.string().optional(),
  expiryDate: z.date().optional(),
  manufactureDate: z.date().optional(),
  isOrganic: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
});

const ProductForm = ({ 
  initialData = null, 
  onSubmit, 
  isLoading = false, 
  categories = [],
  submitButtonText = 'Save Product' 
}) => {
  const [images, setImages] = useState(initialData?.images || []);
  const [uploadingImages, setUploadingImages] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price || 0,
      discountedPrice: initialData?.discountedPrice || 0,
      stockQuantity: initialData?.stockQuantity || 0,
      unit: initialData?.unit || 'kg',
      category: initialData?.categoryId || initialData?.category || '',
      brand: initialData?.brand || '',
      weight: initialData?.weight || 0,
      dimensions: initialData?.dimensions || '',
      expiryDate: initialData?.expiryDate ? new Date(initialData.expiryDate) : null,
      manufactureDate: initialData?.manufactureDate ? new Date(initialData.manufactureDate) : null,
      isOrganic: initialData?.isOrganic || false,
      isAvailable: initialData?.isAvailable !== false,
    },
  });

  const watchedPrice = watch('price');
  const watchedDiscountedPrice = watch('discountedPrice');

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photo library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImage = result.assets[0];
        setImages(prev => [...prev, newImage]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your camera');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImage = result.assets[0];
        setImages(prev => [...prev, newImage]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (data) => {
    try {
      if (data.discountedPrice && data.discountedPrice >= data.price) {
        Alert.alert('Error', 'Discounted price must be less than original price');
        return;
      }

      const formData = {
        ...data,
        images: images,
      };

      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const unitOptions = Object.entries(PRODUCT_UNITS).map(([key, value]) => ({
    label: value.toUpperCase(),
    value: value,
  }));

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.select({ 
        ios: scaleSize(80, { small: 0.8, medium: 1, large: 1.2 }),
        android: scaleSize(20) 
      })}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Basic Information */}
        <Card variant="elevated" margin="mb-4" style={styles.cardContent}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Product Name"
                placeholder="Enter product name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.name?.message}
                leftIcon={<Ionicons name="cube-outline" size={scaleSize(20)} color="#6b7280" />}
                required
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Description"
                placeholder="Describe your product"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.description?.message}
                multiline
                numberOfLines={4}
                leftIcon={<Ionicons name="document-text-outline" size={scaleSize(20)} color="#6b7280" />}
                required
              />
            )}
          />

          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <Text style={styles.inputLabel}>
                  Category <Text style={styles.requiredIndicator}>*</Text>
                </Text>
                <View className="border border-gray-300 rounded-lg bg-white mb-1 h-14 justify-center">
  <Picker
    selectedValue={value}
    onValueChange={onChange}
    onBlur={onBlur}
    className="h-full"
  >
    <Picker.Item label="Select a category" value="" />
    {categories.map((category) => (
      <Picker.Item 
        key={category._id} 
        label={category.name} 
        value={category._id} 
      />
    ))}
  </Picker>
</View>
                {errors.category && (
                  <Text style={styles.errorText}>{errors.category.message}</Text>
                )}
              </View>
            )}
          />
        </Card>

        {/* Pricing */}
        <Card variant="elevated" margin="mb-4" style={styles.cardContent}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          
          <Controller
            control={control}
            name="price"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Price"
                placeholder="0.00"
                value={value.toString()}
                onChangeText={(text) => onChange(parseFloat(text) || 0)}
                onBlur={onBlur}
                error={errors.price?.message}
                keyboardType="numeric"
                leftIcon={<Ionicons name="cash-outline" size={scaleSize(20)} color="#6b7280" />}
                required
              />
            )}
          />

          <Controller
            control={control}
            name="discountedPrice"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Discounted Price (Optional)"
                placeholder="0.00"
                value={value ? value.toString() : ''}
                onChangeText={(text) => onChange(parseFloat(text) || 0)}
                onBlur={onBlur}
                error={errors.discountedPrice?.message}
                keyboardType="numeric"
                leftIcon={<Ionicons name="pricetag-outline" size={scaleSize(20)} color="#6b7280" />}
                helperText={watchedDiscountedPrice && watchedDiscountedPrice >= watchedPrice ? 'Discounted price must be less than original price' : ''}
              />
            )}
          />
        </Card>

        {/* Inventory */}
        <Card variant="elevated" margin="mb-4" style={styles.cardContent}>
          <Text style={styles.sectionTitle}>Inventory</Text>
          
          <View style={styles.dualInputContainer}>
            <View style={styles.dualInputItem}>
              <Controller
                control={control}
                name="stockQuantity"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Stock Quantity"
                    placeholder="0"
                    value={value.toString()}
                    onChangeText={(text) => onChange(parseInt(text) || 0)}
                    onBlur={onBlur}
                    error={errors.stockQuantity?.message}
                    keyboardType="numeric"
                    leftIcon={<Ionicons name="basket-outline" size={scaleSize(20)} color="#6b7280" />}
                    required
                  />
                )}
              />
            </View>
            
            <View style={styles.dualInputItem}>
              <Controller
                control={control}
                name="unit"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <Text style={styles.inputLabel}>
                      Unit <Text style={styles.requiredIndicator}>*</Text>
                    </Text>
                    <View className="border border-gray-300 rounded-lg bg-white mb-2 h-16 justify-center">
  <Picker
    selectedValue={value}
    onValueChange={onChange}
    onBlur={onBlur}
    className="h-full text-base"
  >
    {unitOptions.map((option) => (
      <Picker.Item 
        key={option.value} 
        label={option.label} 
        value={option.value} 
      />
    ))}
  </Picker>
</View>
                    {errors.unit && (
                      <Text style={styles.errorText}>{errors.unit.message}</Text>
                    )}
                  </View>
                )}
              />
            </View>
          </View>
        </Card>

        {/* Images */}
        <Card variant="elevated" margin="mb-4" style={styles.cardContent}>
          <Text style={styles.sectionTitle}>Product Images</Text>
          
          <View style={styles.imagesContainer}>
            {images.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image
                  source={{ uri: image.uri || image.url || image }}
                  style={styles.image}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => removeImage(index)}
                  style={styles.removeButton}
                >
                  <Ionicons name="close" size={scaleFont(12)} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          
          {images.length < 5 && (
            <View style={styles.buttonGroup}>
              <Button
                title="Take Photo"
                variant="outline"
                onPress={takePhoto}
                icon={<Ionicons name="camera-outline" size={scaleSize(20)} color="#059669" />}
                fullWidth={width < breakpoints.medium}
              />
              <Button
                title="Choose from Gallery"
                variant="outline"
                onPress={pickImage}
                icon={<Ionicons name="images-outline" size={scaleSize(20)} color="#059669" />}
                fullWidth={width < breakpoints.medium}
              />
            </View>
          )}
          
          <Text style={styles.helperText}>
            Add up to 5 images. First image will be the main product image.
          </Text>
        </Card>

        {/* Additional Details */}
        <Card variant="elevated" margin="mb-4" style={styles.cardContent}>
          <Text style={styles.sectionTitle}>Additional Details</Text>
          
          <Controller
            control={control}
            name="brand"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Brand (Optional)"
                placeholder="Enter brand name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.brand?.message}
                leftIcon={<Ionicons name="business-outline" size={scaleSize(20)} color="#6b7280" />}
              />
            )}
          />

          <View style={styles.dualInputContainer}>
            <View style={styles.dualInputItem}>
              <Controller
                control={control}
                name="weight"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Weight (Optional)"
                    placeholder="0.00"
                    value={value ? value.toString() : ''}
                    onChangeText={(text) => onChange(parseFloat(text) || 0)}
                    onBlur={onBlur}
                    error={errors.weight?.message}
                    keyboardType="numeric"
                    leftIcon={<Ionicons name="scale-outline" size={scaleSize(20)} color="#6b7280" />}
                  />
                )}
              />
            </View>
            
            <View style={styles.dualInputItem}>
              <Controller
                control={control}
                name="dimensions"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Dimensions (Optional)"
                    placeholder="L x W x H"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.dimensions?.message}
                    leftIcon={<Ionicons name="resize-outline" size={scaleSize(20)} color="#6b7280" />}
                  />
                )}
              />
            </View>
          </View>

          <View style={styles.dualInputContainer}>
            <View style={styles.dualInputItem}>
              <Controller
                control={control}
                name="manufactureDate"
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    label="Manufacture Date (Optional)"
                    value={value}
                    onChange={onChange}
                    placeholder="Select manufacture date"
                    error={errors.manufactureDate?.message}
                    maximumDate={new Date()}
                  />
                )}
              />
            </View>
            
            <View style={styles.dualInputItem}>
              <Controller
                control={control}
                name="expiryDate"
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    label="Expiry Date (Optional)"
                    value={value}
                    onChange={onChange}
                    placeholder="Select expiry date"
                    error={errors.expiryDate?.message}
                    minimumDate={new Date()}
                  />
                )}
              />
            </View>
          </View>

          <View style={styles.checkboxContainer}>
            <Controller
              control={control}
              name="isOrganic"
              render={({ field: { onChange, value } }) => (
                <>
                  <Ionicons 
                    name={value ? "checkbox" : "square-outline"} 
                    size={scaleSize(24)} 
                    color={value ? "#059669" : "#6b7280"} 
                    onPress={() => onChange(!value)}
                  />
                  <Text style={styles.checkboxLabel}>Organic Product</Text>
                </>
              )}
            />
          </View>

          <View style={styles.checkboxContainer}>
            <Controller
              control={control}
              name="isAvailable"
              render={({ field: { onChange, value } }) => (
                <>
                  <Ionicons 
                    name={value ? "checkbox" : "square-outline"} 
                    size={scaleSize(24)} 
                    color={value ? "#059669" : "#6b7280"} 
                    onPress={() => onChange(!value)}
                  />
                  <Text style={styles.checkboxLabel}>Available for sale</Text>
                </>
              )}
            />
          </View>
        </Card>

        {/* Submit Button */}
        <Button
          title={submitButtonText}
          onPress={handleSubmit(handleFormSubmit)}
          loading={isLoading}
          fullWidth
          size="large"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ProductForm;