import React from 'react';
import { Modal as RNModal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Modal = ({
  visible,
  onClose,
  title,
  children,
  variant = 'default',
  size = 'medium',
  showCloseButton = true,
  closeOnBackdropPress = true,
  style,
  titleStyle,
  contentStyle,
  ...props
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return 'w-80 max-w-[90%]';
      case 'medium':
        return 'w-96 max-w-[95%]';
      case 'large':
        return 'w-[500px] max-w-[98%]';
      case 'full':
        return 'w-full h-full';
      default:
        return 'w-96 max-w-[95%]';
    }
  };

  const getVariantStyles = () => {
    const baseStyles = 'bg-white rounded-lg shadow-xl';
    
    switch (variant) {
      case 'default':
        return baseStyles;
      case 'success':
        return `${baseStyles} border-l-4 border-l-green-500`;
      case 'warning':
        return `${baseStyles} border-l-4 border-l-yellow-500`;
      case 'error':
        return `${baseStyles} border-l-4 border-l-red-500`;
      case 'info':
        return `${baseStyles} border-l-4 border-l-blue-500`;
      default:
        return baseStyles;
    }
  };

  const modalStyles = [
    getVariantStyles(),
    getSizeStyles(),
    style,
  ].filter(Boolean).join(' ');

  const renderHeader = () => {
    if (!title && !showCloseButton) return null;

    return (
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <View className="flex-1">
          {title && (
            <Text className={`text-lg font-semibold text-gray-900 ${titleStyle}`}>
              {title}
            </Text>
          )}
        </View>
        {showCloseButton && (
          <TouchableOpacity
            onPress={onClose}
            className="p-1"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderContent = () => {
    if (size === 'full') {
      return (
        <ScrollView 
          className={`flex-1 ${contentStyle}`}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      );
    }

    return (
      <View className={`p-4 ${contentStyle}`}>
        {children}
      </View>
    );
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      {...props}
    >
      <View className="flex-1 bg-black bg-opacity-50 justify-center items-center p-4">
        <TouchableOpacity
          className="absolute inset-0"
          activeOpacity={1}
          onPress={closeOnBackdropPress ? onClose : undefined}
        />
        
        <View className={modalStyles}>
          {renderHeader()}
          {renderContent()}
        </View>
      </View>
    </RNModal>
  );
};

export default Modal; 