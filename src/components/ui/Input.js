import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  onFocus,
  error,
  disabled = false,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
  labelStyle,
  errorStyle,
  required = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const getContainerStyles = () => {
    const baseStyles = 'border rounded-lg bg-white';
    
    if (error) {
      return `${baseStyles} border-red-500`;
    }
    
    if (isFocused) {
      return `${baseStyles} border-green-500`;
    }
    
    if (disabled) {
      return `${baseStyles} border-gray-300 bg-gray-50`;
    }
    
    return `${baseStyles} border-gray-300`;
  };

  const getInputStyles = () => {
    const baseStyles = 'flex-1 text-gray-900';
    
    if (disabled) {
      return `${baseStyles} text-gray-500`;
    }
    
    return baseStyles;
  };

  const renderLeftIcon = () => {
    if (leftIcon) {
      return (
        <View className="pl-3 pr-2">
          {leftIcon}
        </View>
      );
    }
    return null;
  };

  const renderRightIcon = () => {
    if (secureTextEntry) {
      return (
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          className="pr-3 pl-2"
        >
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={20}
            color="#6b7280"
          />
        </TouchableOpacity>
      );
    }

    if (rightIcon) {
      return (
        <TouchableOpacity
          onPress={onRightIconPress}
          className="pr-3 pl-2"
          disabled={!onRightIconPress}
        >
          {rightIcon}
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <View className={`mb-4 ${style}`}>
      {label && (
        <Text className={`text-sm font-medium text-gray-700 mb-2 ${labelStyle}`}>
          {label}
          {required && <Text className="text-red-500 ml-1">*</Text>}
        </Text>
      )}
      
      <View className={`${getContainerStyles()} flex-row items-center`}>
        {renderLeftIcon()}
        
        <TextInput
          className={`${getInputStyles()} py-3 ${multiline ? 'min-h-[80px]' : ''} ${inputStyle}`}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          {...props}
        />
        
        {renderRightIcon()}
      </View>
      
      {error && (
        <Text className={`text-sm text-red-500 mt-1 ${errorStyle}`}>
          {error}
        </Text>
      )}
    </View>
  );
};

export default Input; 