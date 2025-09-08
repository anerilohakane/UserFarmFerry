// User Types
export const USER_ROLES = {
  SUPPLIER: 'supplier',
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  DELIVERY_ASSOCIATE: 'delivery_associate',
};

export const SUPPLIER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const BUSINESS_TYPES = {
  FARMER: 'farmer',
  WHOLESALER: 'wholesaler',
  RETAILER: 'retailer',
  PROCESSOR: 'processor',
  AGRICULTURE: 'Agriculture',
  OTHER: 'other',
};

// Product Types
export const PRODUCT_UNITS = {
  KG: 'kg',
  GRAMS: 'g',
  LITERS: 'liters',
  ML: 'ml',
  PIECES: 'pcs',
  BOX: 'box',
  DOZEN: 'dozen',
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  CASH_ON_DELIVERY: 'cash_on_delivery',
  UPI: 'upi',
  BANK_TRANSFER: 'bank_transfer',
};

// Navigation Types
export const SCREEN_NAMES = {
  // Auth Screens
  LOGIN: 'Login',
  REGISTER: 'Register',
  FORGOT_PASSWORD: 'ForgotPassword',
  RESET_PASSWORD: 'ResetPassword',
  RESET_PASSWORD_WITH_OTP: 'ResetPasswordWithOTP',
  PHONE_VERIFICATION: 'PhoneVerification',
  
  // Main App Screens
  DASHBOARD: 'Dashboard',
  PRODUCTS: 'Products',
  ORDERS: 'Orders',
  PROFILE: 'Profile',
  
  // Product Screens
  PRODUCT_LIST: 'ProductList',
  PRODUCT_DETAILS: 'ProductDetails',
  ADD_PRODUCT: 'AddProduct',
  EDIT_PRODUCT: 'EditProduct',
  
  // Order Screens
  ORDER_LIST: 'OrderList',
  ORDER_DETAILS: 'OrderDetails',
  ADD_ADDRESS: 'AddAddress',
  
  // Profile Screens
  EDIT_PROFILE: 'EditProfile',
  VERIFICATION_STATUS: 'VerificationStatus',
  SETTINGS: 'Settings',

  ADD_ADDRESS: 'AddAddress',
};

// API Response Types
export const API_STATUS = {
  SUCCESS: 'success',
  FAIL: 'fail',
  ERROR: 'error',
};

// Form Validation Types
export const VALIDATION_TYPES = {
  REQUIRED: 'required',
  EMAIL: 'email',
  MIN_LENGTH: 'minLength',
  MAX_LENGTH: 'maxLength',
  PATTERN: 'pattern',
  CUSTOM: 'custom',
};

// Theme Types
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Image Types
export const IMAGE_TYPES = {
  PRODUCT: 'product',
  PROFILE: 'profile',
  DOCUMENT: 'document',
};

// Filter Types
export const FILTER_TYPES = {
  CATEGORY: 'category',
  PRICE_RANGE: 'priceRange',
  STATUS: 'status',
  DATE_RANGE: 'dateRange',
  SEARCH: 'search',
};

// Sort Types
export const SORT_TYPES = {
  NAME_ASC: 'name_asc',
  NAME_DESC: 'name_desc',
  PRICE_ASC: 'price_asc',
  PRICE_DESC: 'price_desc',
  DATE_ASC: 'date_asc',
  DATE_DESC: 'date_desc',
  RATING_ASC: 'rating_asc',
  RATING_DESC: 'rating_desc',
};

// Default export to satisfy Expo Router
export default function TypesIndex() {
  return null;
}