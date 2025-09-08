import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

const DatePicker = ({ 
  label, 
  value, 
  onChange, 
  placeholder = "Select date",
  error,
  required = false,
  minimumDate,
  maximumDate,
  mode = 'date'
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const showDatePicker = () => {
    setShowPicker(true);
  };

  const formatDate = (date) => {
    if (!date) return '';
    if (mode === 'date') {
      return format(new Date(date), 'yyyy-MM-dd');
    }
    return format(new Date(date), 'yyyy-MM-dd HH:mm');
  };

  return (
    <View>
      <Text className="text-sm font-medium text-gray-700 mb-1">
        {label} {required && <Text className="text-red-500">*</Text>}
      </Text>
      
      <TouchableOpacity
        onPress={showDatePicker}
        className="flex-row items-center border border-gray-300 rounded-lg bg-white px-3 py-3"
      >
        <Ionicons name="calendar-outline" size={20} color="#6b7280" />
        <Text className="flex-1 ml-2 text-gray-900">
          {value ? formatDate(value) : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#6b7280" />
      </TouchableOpacity>
      
      {error && (
        <Text className="text-red-500 text-sm mt-1">{error}</Text>
      )}
      
      {showPicker && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode={mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </View>
  );
};

export default DatePicker; 