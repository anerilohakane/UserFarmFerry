/**
 * Configuration file for the FarmFerry User App
 * Contains API endpoints, storage keys, and other app-wide constants
 */

export const CONFIG = {
    // Base API URL
    API_BASE_URL: 'https://farm-ferry-backend-new.vercel.app/api/v1',

    // Storage Keys for AsyncStorage
    STORAGE_KEYS: {
        ACCESS_TOKEN: 'access_token',
        REFRESH_TOKEN: 'refresh_token',
        USER_DATA: 'user_data',
    },

    // API Endpoints
    ENDPOINTS: {
        // Authentication endpoints
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/register',
            LOGOUT: '/auth/logout',
            REFRESH_TOKEN: '/auth/refresh-token',
            FORGOT_PASSWORD: '/auth/forgot-password',
            RESET_PASSWORD: '/auth/reset-password',
            SEND_OTP: '/auth/login/send-otp',
            LOGIN_OTP: '/auth/login/verify-otp',
        },

        // Customer endpoints
        CUSTOMER: {
            PROFILE: '/customer',
            UPDATE_PROFILE: '/customer',
            ADD_ADDRESS: '/customer/addresses',
            UPDATE_ADDRESS: '/customer/addresses',
            DELETE_ADDRESS: '/customer/addresses',
        },

        // Products endpoints
        PRODUCTS: {
            LIST: '/supplier/products',
            DETAILS: '/supplier/products',
            SEARCH: '/supplier/products/search',
        },

        // Orders endpoints
        ORDERS: {
            CREATE: '/orders',
            LIST: '/orders',
            DETAILS: '/orders',
            UPDATE_STATUS: '/orders',
        },

        // Cart endpoints
        CART: {
            GET: '/cart',
            ADD: '/cart',
            UPDATE: '/cart',
            REMOVE: '/cart',
        },

        // Categories endpoints
        CATEGORIES: {
            LIST: '/admin/category',
        },
    },

    // App constants
    APP: {
        NAME: 'FarmFerry',
        VERSION: '1.0.0',
        DEFAULT_TIMEOUT: 30000,
    },

    // Validation constants
    VALIDATION: {
        PASSWORD_MIN_LENGTH: 8,
        PHONE_REGEX: /^[0-9]{10}$/,
    },
};

export default CONFIG;
