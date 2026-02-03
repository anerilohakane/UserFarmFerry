import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';

const SimpleLoginForm = ({ onSuccess, onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      await login({ email, password });
      onSuccess?.();
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ width: '100%' }}>
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>
          Welcome Back
        </Text>
        <Text style={{ textAlign: 'center', color: '#666' }}>
          Sign in to your FarmFerry supplier account
        </Text>
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8 }}>
          Email Address *
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#d1d5db',
            borderRadius: 8,
            padding: 12,
            backgroundColor: 'white',
          }}
          placeholder="Enter your email"
          placeholderTextColor="#9ca3af"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8 }}>
          Password *
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#d1d5db',
            borderRadius: 8,
            padding: 12,
            backgroundColor: 'white',
          }}
          placeholder="Enter your password"
          placeholderTextColor="#9ca3af"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        onPress={onForgotPassword}
        style={{ alignSelf: 'flex-end', marginBottom: 24 }}
      >
        <Text style={{ color: '#059669', fontSize: 14, fontWeight: '500' }}>
          Forgot Password?
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: '#059669',
          borderRadius: 8,
          padding: 16,
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        }}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Text>
      </TouchableOpacity>

      <View style={{ marginTop: 24 }}>
        <Text style={{ textAlign: 'center', color: '#666', fontSize: 14 }}>
          Don't have an account?{' '}
          <Text style={{ color: '#059669', fontWeight: '500' }}>
            Contact support to register
          </Text>
        </Text>
      </View>
    </View>
  );
};

export default SimpleLoginForm; 