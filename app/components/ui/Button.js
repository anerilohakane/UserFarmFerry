import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  children,
}) => {
  const getVariantStyles = () => {
    const baseStyles = 'rounded-lg flex-row items-center justify-center';
    switch (variant) {
      case 'primary':
        return `${baseStyles} bg-green-600 ${disabled ? 'bg-gray-400' : 'active:bg-green-700'}`;
      case 'secondary':
        return `${baseStyles} bg-gray-200 ${disabled ? 'bg-gray-100' : 'active:bg-gray-300'}`;
      case 'outline':
        return `${baseStyles} border-2 border-green-600 bg-transparent ${disabled ? 'border-gray-400' : 'active:bg-green-50'}`;
      case 'danger':
        return `${baseStyles} bg-red-600 ${disabled ? 'bg-gray-400' : 'active:bg-red-700'}`;
      case 'ghost':
        return `${baseStyles} bg-transparent ${disabled ? '' : 'active:bg-gray-100'}`;
      default:
        return `${baseStyles} bg-green-600 ${disabled ? 'bg-gray-400' : 'active:bg-green-700'}`;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return 'px-3 py-2';
      case 'medium':
        return 'px-4 py-3';
      case 'large':
        return 'px-6 py-4';
      default:
        return 'px-4 py-3';
    }
  };

  const getTextStyles = () => {
    const baseTextStyles = 'font-semibold text-center';
    switch (variant) {
      case 'primary':
        return `${baseTextStyles} text-white ${disabled ? 'text-gray-500' : ''}`;
      case 'secondary':
        return `${baseTextStyles} text-gray-800 ${disabled ? 'text-gray-500' : ''}`;
      case 'outline':
        return `${baseTextStyles} text-green-600 ${disabled ? 'text-gray-500' : ''}`;
      case 'danger':
        return `${baseTextStyles} text-white ${disabled ? 'text-gray-500' : ''}`;
      case 'ghost':
        return `${baseTextStyles} text-green-600 ${disabled ? 'text-gray-500' : ''}`;
      default:
        return `${baseTextStyles} text-white ${disabled ? 'text-gray-500' : ''}`;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 'text-sm';
      case 'medium':
        return 'text-base';
      case 'large':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  // Only use string for className
  const buttonStyles = [
    getVariantStyles(),
    getSizeStyles(),
    fullWidth ? 'w-full' : '',
    typeof style === 'string' ? style : ''
  ].filter(Boolean).join(' ');

  // Only use object/array for style
  const rnStyle = typeof style === 'object' ? style : undefined;

  const textStyles = [
    getTextStyles(),
    getTextSize(),
    textStyle,
  ].filter(Boolean).join(' ');

  const renderContent = () => {
    if (loading) {
      return (
        <View className="flex-row items-center">
          <ActivityIndicator 
            size="small" 
            color={variant === 'outline' || variant === 'ghost' ? '#059669' : '#ffffff'} 
          />
          <Text className={`${textStyles} ml-2`}>Loading...</Text>
        </View>
      );
    }

    if (children) {
      return children;
    }

    if (icon) {
      return (
        <View className="flex-row items-center">
          {iconPosition === 'left' && icon}
          <Text className={textStyles}>{title}</Text>
          {iconPosition === 'right' && icon}
        </View>
      );
    }

    return <Text className={textStyles}>{title}</Text>;
  };

  return (
    <TouchableOpacity
      className={buttonStyles}
      style={rnStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

export default Button;

 