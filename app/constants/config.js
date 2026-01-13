export const CONFIG = {
  API_BASE_URL: 'https://farm-ferry-backend-new.vercel.app/api/v1',
  // API_BASE_URL: 'http://localhost:3001/api/v1', // Local Backend
  // API_BASE_URL: 'https://your-production-api.com/api/v1', // For production

  // API Endpoints
  ENDPOINTS: {
    AUTH: {
      //LOGIN: '/auth/login/customer',
      //REGISTER: '/auth/register/customer',
      SEND_OTP: '/auth/login/send-otp',     // Corrected Path
      LOGIN_OTP: '/auth/login/verify-otp',  // Corrected Path
      REFRESH_TOKEN: '/auth/refresh-token',
      LOGOUT: '/auth/logout',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
    },
    CUSTOMER: {
      PROFILE: '/customer',        // Singular to match Backend route.js
      UPDATE_PROFILE: '/customer', // Singular
      ADD_ADDRESS: '/customer/addresses', // Guessing based on folder structure, will need verification
      UPDATE_ADDRESS: '/customer/addresses',
      DELETE_ADDRESS: '/customer/addresses',
    },
    PRODUCTS: {
      LIST: '/products',
      DETAILS: '/products',
      SEARCH: '/products/search',
    },
    ORDERS: {
      CREATE: '/orders',
      LIST: '/orders/my-orders',
      DETAILS: '/orders',
      UPDATE_STATUS: '/orders', // We'll use `/orders/:id/status` for status updates
    },
    CART: {
      GET: '/cart',
      ADD: '/cart/items',
      UPDATE: '/cart/items',
      REMOVE: '/cart/items',
    },
    CATEGORIES: {
      LIST: '/categories',
      DETAILS: '/categories',
    },
  },

  // App Configuration
  APP: {
    NAME: 'FarmFerry',
    VERSION: '1.0.0',
  },

  // Storage Keys
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_data',
    THEME: 'theme',
  },

  // Validation Rules
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 6,
    PHONE_REGEX: /^[0-9]{10}$/,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
};

// Default export to satisfy Expo Router
export default function ConfigIndex() {
  return null;
}