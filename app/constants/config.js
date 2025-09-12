export const CONFIG = {
   API_BASE_URL: 'https://farmferry-backend-revised-r4y2.onrender.com/api/v1',
   //API_BASE_URL: 'http://10.167.110.104:9000/api/v1', // For web development
  // API_BASE_URL: 'https://your-production-api.com/api/v1', // For production

  // API Endpoints
  ENDPOINTS: {
    AUTH: {
      //LOGIN: '/auth/login/customer',
      //REGISTER: '/auth/register/customer',
      SEND_OTP: '/auth/send-customer-otp',     // Step 1: send OTP
      LOGIN_OTP: '/auth/login/customer-otp',
      REFRESH_TOKEN: '/auth/refresh-token',
      LOGOUT: '/auth/logout',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
    },
    CUSTOMER: {
      PROFILE: '/customers/profile',
      UPDATE_PROFILE: '/customers/profile',
      ADD_ADDRESS: '/customers/address',
      UPDATE_ADDRESS: '/customers/address',
      DELETE_ADDRESS: '/customers/address',
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