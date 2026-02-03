import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { CONFIG } from '../constants/config';
import { authAPI, customerAPI } from '../services/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false
      };
    case 'SET_TOKEN':
      return { ...state, token: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.accessToken,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
        console.log('AuthContext - Token found:', !!token);

        if (token) {
          console.log('AuthContext - Fetching user profile...');
          // Optimization: Maybe verify token validity first or specific profile endpoint
          const userResponse = await customerAPI.getProfile();
          const userData = userResponse?.data?.data;

          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user: userData, accessToken: token },
          });
        } else {
          console.log('AuthContext - No token found');
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('AuthContext - Error in checkAuthStatus:', error);
        await logout();
      }
    };

    const timeoutId = setTimeout(() => {
      console.log('AuthContext - Timeout reached, setting loading to false');
      dispatch({ type: 'SET_LOADING', payload: false });
    }, 5000);

    checkAuthStatus().finally(() => {
      clearTimeout(timeoutId);
    });
  }, []);

  // Send OTP to customer phone
  const sendCustomerOTP = async (phone) => {
    try {
      const url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.AUTH.SEND_OTP}`;
      console.log('AuthContext: Sending OTP to', url);
      console.log('AuthContext: Phone payload:', JSON.stringify({ phone }));

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      console.log('AuthContext: Response status:', response.status);
      const data = await response.json();
      console.log('AuthContext: Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      return { success: true, message: data.message || 'OTP sent successfully' };
    } catch (error) {
      console.error('AuthContext - Send customer OTP error:', error);
      throw error;
    }
  };

  // Login with OTP (phone + otp)
  const loginWithOTP = async (phone, otp) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.AUTH.LOGIN_OTP}`;
      console.log('AuthContext: Verifying OTP at', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        dispatch({ type: 'SET_LOADING', payload: false });
        throw new Error(data.message || 'Invalid OTP');
      }

      // Extract user and token data from API response
      const { customer, accessToken, refreshToken } = data.data || data;
      const user = customer || data.user;

      // Store authentication data
      if (accessToken) {
        await AsyncStorage.setItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      }
      if (refreshToken) {
        await AsyncStorage.setItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }
      if (user) {
        await AsyncStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      }

      // Update state to authenticated
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, accessToken },
      });

      console.log('AuthContext - OTP login successful, user authenticated');
      return { success: true, user, accessToken };

    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      console.error('AuthContext - OTP login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authAPI.register(userData);

      // Clear any existing tokens
      await AsyncStorage.multiRemove([
        CONFIG.STORAGE_KEYS.ACCESS_TOKEN,
        CONFIG.STORAGE_KEYS.REFRESH_TOKEN,
        CONFIG.STORAGE_KEYS.USER_DATA,
      ]);

      dispatch({ type: 'SET_LOADING', payload: false });
      return response;
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const verifyPhoneOtp = async (phone, otp, customerId = null) => {
    try {
      const response = await authAPI.verifyOtp({ phone, otp, customerId });
      if (response.data?.success) {
        dispatch({ type: 'UPDATE_USER', payload: { isPhoneVerified: true } });
        return { success: true, message: response.data.message };
      } else {
        return { success: false, message: response.data?.message || 'OTP verification failed.' };
      }
    } catch (error) {
      console.error('AuthContext - OTP verification error:', error);
      return { success: false, message: error.response?.data?.message || 'An error occurred during OTP verification.' };
    }
  };

  const sendPhoneVerification = async (phone, email = null) => {
    try {
      const response = await authAPI.sendPhoneVerification({ phone, email });
      if (response.data?.success) {
        return { success: true, message: response.data.message, data: response.data.data };
      } else {
        return { success: false, message: response.data?.message || 'Failed to send OTP.' };
      }
    } catch (error) {
      console.error('AuthContext - Send OTP error:', error);
      return { success: false, message: error.response?.data?.message || 'An error occurred while sending OTP.' };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      await AsyncStorage.multiRemove([
        CONFIG.STORAGE_KEYS.ACCESS_TOKEN,
        CONFIG.STORAGE_KEYS.REFRESH_TOKEN,
        CONFIG.STORAGE_KEYS.USER_DATA,
      ]);
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
    AsyncStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify({ ...state.user, ...userData }));
  };

  const forgotPassword = async (email, role = 'customer') => {
    try {
      await authAPI.forgotPassword(email, role);
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (token, password) => {
    try {
      await authAPI.resetPassword(token, password);
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  const resetPasswordWithOTP = async (email, otp, password) => {
    try {
      await authAPI.resetPasswordWithOTP(email, otp, password);
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  const refreshUserData = async () => {
    try {
      const token = await AsyncStorage.getItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) {
        throw new Error('No token found');
      }

      const userResponse = await customerAPI.getProfile();
      const userData = userResponse?.data?.data;

      if (userData) {
        dispatch({
          type: 'SET_USER',
          payload: userData,
        });
        return userData;
      } else {
        throw new Error('No user data received');
      }
    } catch (error) {
      console.error('AuthContext - Error refreshing user data:', error);
      throw error;
    }
  };

  // Needed for old login (email/pass) if still referenced
  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authAPI.login({ email, password });

      // ... (Simplified for brevity as we are moving to OTP, but keeping stub or implementation if needed)
      // For now, let's just keep the original logic roughly or assume usage of OTP
      // Re-implementing simplified version to avoid breaking imports

      const { customer, accessToken, refreshToken } = response.data.data;
      const user = customer;
      await AsyncStorage.setItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      await AsyncStorage.setItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      await AsyncStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, accessToken },
      });
      return { success: true };

    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    forgotPassword,
    resetPassword,
    resetPasswordWithOTP,
    refreshUserData,
    verifyPhoneOtp,
    sendPhoneVerification,
    sendCustomerOTP,
    loginWithOTP,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Default export to satisfy Expo Router if needed
export default function AuthContextIndex() {
  return null;
}