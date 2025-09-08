import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const Card = ({
  children,
  title,
  subtitle,
  onPress,
  variant = 'default',
  padding = 'p-4',
  margin = 'mb-4',
  style,
  titleStyle,
  subtitleStyle,
  headerRight,
  footer,
  footerStyle,
  disabled = false,
  ...props
}) => {
  const getVariantStyles = () => {
    const baseStyles = 'bg-white rounded-lg shadow-sm border';
    
    switch (variant) {
      case 'default':
        return `${baseStyles} border-gray-200`;
      case 'elevated':
        return `${baseStyles} border-gray-200 shadow-md`;
      case 'outlined':
        return `${baseStyles} border-gray-300 shadow-none`;
      case 'success':
        return `${baseStyles} border-green-200 bg-green-50`;
      case 'warning':
        return `${baseStyles} border-yellow-200 bg-yellow-50`;
      case 'error':
        return `${baseStyles} border-red-200 bg-red-50`;
      case 'info':
        return `${baseStyles} border-blue-200 bg-blue-50`;
      default:
        return `${baseStyles} border-gray-200`;
    }
  };

  const cardStyles = [
    getVariantStyles(),
    padding,
    margin,
    disabled ? 'opacity-50' : '',
    style,
  ].filter(Boolean).join(' ');

  const renderHeader = () => {
    if (!title && !subtitle && !headerRight) return null;

    return (
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-1">
          {title && (
            <Text className={`text-lg font-semibold text-gray-900 ${titleStyle}`}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text className={`text-sm text-gray-600 mt-1 ${subtitleStyle}`}>
              {subtitle}
            </Text>
          )}
        </View>
        {headerRight && (
          <View className="ml-3">
            {headerRight}
          </View>
        )}
      </View>
    );
  };

  const renderFooter = () => {
    if (!footer) return null;

    return (
      <View className={`mt-4 pt-3 border-t border-gray-200 ${footerStyle}`}>
        {footer}
      </View>
    );
  };

  const CardContent = () => (
    <View className={cardStyles} {...props}>
      {renderHeader()}
      <View className="flex-1">
        {children}
      </View>
      {renderFooter()}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
};

export default Card; 