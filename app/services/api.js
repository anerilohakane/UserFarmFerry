import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { CONFIG } from '../constants/config';

// Create axios instance
const api = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    // Do not add Authorization header for login, register, refresh-token, forgot-password, reset-password
    const authEndpoints = [
      CONFIG.ENDPOINTS.AUTH.LOGIN,
      CONFIG.ENDPOINTS.AUTH.REGISTER,
      CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN,
      CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD,
      '/auth/reset-password-otp', // OTP reset endpoint
      '/auth/register/validate', // New registration validation endpoint
      '/auth/register/complete', // New registration completion endpoint
      '/auth/send-phone-verification', // Phone verification endpoint
      '/auth/verify-phone-otp', // OTP verification endpoint
    ];
    
    // Check if the URL contains any of the auth endpoints (not just ends with)
    const shouldSkipAuth = authEndpoints.some((ep) => config.url.includes(ep));
    if (shouldSkipAuth) {
      console.log('🔐 API Request - Skipping auth for:', config.url);
      return config;
    }
    try {
      const token = await AsyncStorage.getItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
      console.log('🔐 API Request - URL:', config.url);
      console.log('🔐 API Request - Token:', token ? `Present (${token.substring(0, 20)}...)` : 'Missing');
      console.log('🔐 API Request - Method:', config.method?.toUpperCase());
      if (config.url.includes('/notifications')) {
        console.log('🔔 /notifications request - token:', token);
      }
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        if (config.url.includes('/notifications')) {
          console.log('🔔 /notifications request - Authorization header set:', config.headers.Authorization);
        }
        console.log('✅ API Request - Authorization header set');
      } else {
        if (config.url.includes('/notifications')) {
          console.log('🔔 /notifications request - No token found');
        }
        console.log('❌ API Request - No token found');
      }
    } catch (error) {
      console.error('❌ Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    console.log('API Response - Success:', response.config.url, response.status);
    return response;
  },
  async (error) => {
    console.log('API Response - Error:', error.config?.url, error.response?.status, error.response?.data);
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
        
        if (refreshToken) {
          const response = await axios.post(
            `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN}`,
            { refreshToken }
          );

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          await AsyncStorage.setItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN, accessToken);
          await AsyncStorage.setItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Token refresh failed, redirect to login
        await AsyncStorage.multiRemove([
          CONFIG.STORAGE_KEYS.ACCESS_TOKEN,
          CONFIG.STORAGE_KEYS.REFRESH_TOKEN,
          CONFIG.STORAGE_KEYS.USER_DATA,
        ]);
        
        // You can emit an event here to notify the app to redirect to login
        // EventBus.emit('AUTH_EXPIRED');
      }
    }

    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  login: (credentials) => api.post(CONFIG.ENDPOINTS.AUTH.LOGIN, credentials),
  register: (userData) => api.post(CONFIG.ENDPOINTS.AUTH.REGISTER, userData),
  logout: () => api.post(CONFIG.ENDPOINTS.AUTH.LOGOUT),
  forgotPassword: (email, role = 'customer') => api.post(CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, { email, role }),
  resetPassword: (token, password) => api.post(`${CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD}/${token}`, { password }),
  resetPasswordWithOTP: (email, otp, password) => api.post('/auth/reset-password-otp', { email, otp, password }),
  
  changePassword: (currentPassword, newPassword) => api.post('/auth/change-password', { currentPassword, newPassword }),
  sendPhoneVerification: (data) => api.post('/auth/send-phone-verification', data),
  verifyOtp: (data) => api.post('/auth/verify-phone-otp', data),
  
  // New two-phase registration endpoints
  registerValidate: (userData) => api.post('/auth/register/validate', userData),
  registerComplete: (userData) => api.post('/auth/register/complete', userData),
};

export const customerAPI = {
  getProfile: () => api.get(CONFIG.ENDPOINTS.CUSTOMER.PROFILE),
  updateProfile: (data) => api.put(CONFIG.ENDPOINTS.CUSTOMER.UPDATE_PROFILE, data),
  addAddress: (addressData) => api.post(CONFIG.ENDPOINTS.CUSTOMER.ADD_ADDRESS, addressData),
  updateAddress: (id, addressData) => api.put(`${CONFIG.ENDPOINTS.CUSTOMER.UPDATE_ADDRESS}/${id}`, addressData),
  deleteAddress: (id) => api.delete(`${CONFIG.ENDPOINTS.CUSTOMER.DELETE_ADDRESS}/${id}`),
};

export const productsAPI = {
  getProducts: (params) => api.get(CONFIG.ENDPOINTS.PRODUCTS.LIST, { params }),
  getProductDetails: (id) => api.get(`${CONFIG.ENDPOINTS.PRODUCTS.DETAILS}/${id}`),
  searchProducts: (query) => api.get(`${CONFIG.ENDPOINTS.PRODUCTS.SEARCH}?q=${query}`),
};

export const ordersAPI = {
  createOrder: (orderData) => api.post(CONFIG.ENDPOINTS.ORDERS.CREATE, orderData),
  getMyOrders: (params) => api.get(CONFIG.ENDPOINTS.ORDERS.LIST, { params }),
  getOrderDetails: (id) => api.get(`${CONFIG.ENDPOINTS.ORDERS.DETAILS}/${id}`),
  updateOrderStatus: (id, status, note) => api.put(`${CONFIG.ENDPOINTS.ORDERS.UPDATE_STATUS}/${id}/status`, { status, note }),
  returnOrder: (id, note) => api.put(`${CONFIG.ENDPOINTS.ORDERS.UPDATE_STATUS}/${id}/status`, { status: 'returned', note }),
  generateInvoice: (id) => api.post(`${CONFIG.ENDPOINTS.ORDERS.DETAILS}/${id}/invoice`),
  getInvoice: (id) => api.get(`${CONFIG.ENDPOINTS.ORDERS.DETAILS}/${id}/invoice`),
};

export const cartAPI = {
  getCart: () => api.get(CONFIG.ENDPOINTS.CART.GET),
  addToCart: (item) => api.post(CONFIG.ENDPOINTS.CART.ADD, item),
  updateCartItem: (id, quantity) => api.put(`${CONFIG.ENDPOINTS.CART.UPDATE}/${id}`, { quantity }),
  removeCartItem: (id) => api.delete(`${CONFIG.ENDPOINTS.CART.REMOVE}/${id}`),
};

export const categoriesAPI = {
  getCategories: (params = {}) => api.get(CONFIG.ENDPOINTS.CATEGORIES.LIST, { params }),
  getSubcategories: (parentId) => api.get(`${CONFIG.ENDPOINTS.CATEGORIES.LIST}?parent=${parentId}`),
  getCategoryById: (id) => api.get(`${CONFIG.ENDPOINTS.CATEGORIES.LIST}/${id}`),
  getCategoryTree: () => api.get(`${CONFIG.ENDPOINTS.CATEGORIES.LIST}/tree`),
  getCategoryHandlingFee: (categoryId) => api.get(`${CONFIG.ENDPOINTS.CATEGORIES.LIST}/${categoryId}/handling-fee`),
};

export const notificationsAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

export const wishlistAPI = {
  getWishlist: () => api.get('/customers/wishlist'),
  addToWishlist: (productId) => api.post('/customers/wishlist', { productId }),
  removeFromWishlist: (productId) => api.delete(`/customers/wishlist/${productId}`),
};

export const reviewsAPI = {
  getProductReviews: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
  createReview: (reviewData) => api.post('/reviews', reviewData),
  updateReview: (reviewId, reviewData) => api.put(`/reviews/${reviewId}`, reviewData),
  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`),
  markAsHelpful: (reviewId) => api.post(`/reviews/${reviewId}/helpful`),
  reportReview: (reviewId, reason) => api.post(`/reviews/${reviewId}/report`, { reason }),
  getMyReviews: () => api.get('/customers/reviews'),
  getPendingReviews: () => api.get('/customers/reviews/pending'),
  addCustomerReply: (reviewId, replyData) => api.post(`/reviews/${reviewId}/customer-reply`, replyData),
};

// Advanced Delivery APIs
export const advancedDeliveryAPI = {
  // Order Replacement
  requestReplacement: (orderId, data) => api.post(`/advanced-delivery/replacement/request/${orderId}`, data),
  getCustomerReplacements: () => api.get('/advanced-delivery/replacement/customer'),
  // OTP Verification
  verifyDeliveryOTP: (orderId, data) => api.post(`/advanced-delivery/verify/delivery/${orderId}`, data),
  verifyReplacementOTP: (replacementOrderId, data) => api.post(`/advanced-delivery/verify/replacement/${replacementOrderId}`, data),
  // QR Code
  getDeliveryQRCode: (orderId) => api.post(`/advanced-delivery/qr/delivery/${orderId}`),
  getReplacementQRCode: (replacementOrderId) => api.post(`/advanced-delivery/qr/replacement/${replacementOrderId}`),
  // Route Optimization (optional, for delivery associate)
  optimizeRoute: (payload) => api.post('/advanced-delivery/route/optimize', payload),
  // Analytics (optional)
  getAnalytics: () => api.get('/advanced-delivery/analytics'),
};

export default api; 