// Payment Configuration Constants
export const PAYMENT_CONFIG = {
  // Razorpay Configuration
  RAZORPAY: {
    KEY_ID: 'rzp_test_Sbs1ZuKmKT2RXE',
    KEY_SECRET: '0qbempWNDNxKOu5QYGKe7Jvz',
    MERCHANT_NAME: 'FarmFerry',
    MERCHANT_DESCRIPTION: 'Fresh Farm Products',
    CURRENCY: 'INR',
    THEME_COLOR: '#059669',
  },

  // UPI Configuration
  UPI: {
    MERCHANT_ID: 'farmferry@okicici',
    MERCHANT_NAME: 'FarmFerry',
    DEFAULT_APPS: ['google_pay', 'phonepe', 'paytm', 'bhim'],
    VALIDATION_REGEX: /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/,
  },

  // Payment Limits
  LIMITS: {
    MIN_AMOUNT: 1,
    MAX_AMOUNT: 100000,
    MAX_RETRIES: 3,
  },

  // Supported Payment Methods
  METHODS: {
    UPI: 'upi',
    CARD: 'card',
    WALLET: 'wallet',
    COD: 'cash_on_delivery',
    NET_BANKING: 'net_banking',
  },

  // Payment Status
  STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SUCCESS: 'success',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
  },

  // Error Messages
  ERRORS: {
    INVALID_AMOUNT: 'Invalid payment amount',
    AMOUNT_TOO_LOW: 'Payment amount is too low',
    AMOUNT_TOO_HIGH: 'Payment amount exceeds maximum limit',
    INVALID_UPI_ID: 'Invalid UPI ID format',
    PAYMENT_FAILED: 'Payment failed. Please try again.',
    NETWORK_ERROR: 'Network error. Please check your connection.',
    UPI_APP_NOT_FOUND: 'UPI app not found on your device',
    TRANSACTION_TIMEOUT: 'Transaction timed out',
    USER_CANCELLED: 'Payment was cancelled by user',
  },

  // Success Messages
  SUCCESS: {
    PAYMENT_COMPLETE: 'Payment completed successfully',
    ORDER_CONFIRMED: 'Order confirmed successfully',
  },

  // UI Configuration
  UI: {
    PAYMENT_TIMEOUT: 30000, // 30 seconds
    RETRY_DELAY: 2000, // 2 seconds
    SUCCESS_DISPLAY_TIME: 3000, // 3 seconds
    LOADING_ANIMATION_DURATION: 2000, // 2 seconds
  },

  // Test Configuration
  TEST: {
    ENABLED: __DEV__, // Enable in development
    SUCCESS_RATE: 0.8, // 80% success rate for mock payments
    MOCK_DELAY: 2000, // 2 seconds delay for mock payments
  },
};

// Payment Method Icons and Labels
export const PAYMENT_METHODS_CONFIG = {
  razorpay: {
    label: 'Razorpay',
    icon: 'credit-card',
    color: '#3399CC',
    bgColor: '#E6F3FF',
  },
  gpay: {
    label: 'Google Pay',
    icon: 'google-pay',
    color: '#34A853',
    bgColor: '#E8F5E8',
  },
  phonepe: {
    label: 'PhonePe',
    icon: 'phone',
    color: '#5F259F',
    bgColor: '#F3E8FF',
  },
  paytm: {
    label: 'Paytm',
    icon: 'wallet',
    color: '#00BAF2',
    bgColor: '#E6F7FF',
  },
  bhim: {
    label: 'BHIM',
    icon: 'bank',
    color: '#FF6B35',
    bgColor: '#FFF2ED',
  },
  upi_id: {
    label: 'Other UPI',
    icon: 'account-plus-outline',
    color: '#059669',
    bgColor: '#ECFDF5',
  },
  card: {
    label: 'Credit/Debit Card',
    icon: 'credit-card',
    color: '#1D4ED8',
    bgColor: '#EFF6FF',
  },
  wallet: {
    label: 'Wallet',
    icon: 'wallet-outline',
    color: '#7E22CE',
    bgColor: '#F3E8FF',
  },
  cod: {
    label: 'Cash on Delivery',
    icon: 'cash',
    color: '#059669',
    bgColor: '#ECFDF5',
  },
};

// UPI Apps Configuration
export const UPI_APPS_CONFIG = {
  GOOGLE_PAY: {
    name: 'Google Pay',
    package: 'com.google.android.apps.nbu.paisa.user',
    icon: 'google-pay',
    color: '#34A853',
  },
  PHONEPE: {
    name: 'PhonePe',
    package: 'com.phonepe.app',
    icon: 'phone',
    color: '#5F259F',
  },
  PAYTM: {
    name: 'Paytm',
    package: 'net.one97.paytm',
    icon: 'wallet',
    color: '#00BAF2',
  },
  BHIM: {
    name: 'BHIM',
    package: 'in.org.npci.upiapp',
    icon: 'bank',
    color: '#FF6B35',
  },
  AMAZON_PAY: {
    name: 'Amazon Pay',
    package: 'in.amazonpay',
    icon: 'shopping-bag',
    color: '#FF9900',
  },
  WHATSAPP: {
    name: 'WhatsApp Pay',
    package: 'com.whatsapp',
    icon: 'message-circle',
    color: '#25D366',
  },
};

// Payment Validation Rules
export const PAYMENT_VALIDATION_RULES = {
  amount: {
    required: true,
    min: PAYMENT_CONFIG.LIMITS.MIN_AMOUNT,
    max: PAYMENT_CONFIG.LIMITS.MAX_AMOUNT,
  },
  upiId: {
    required: true,
    pattern: PAYMENT_CONFIG.UPI.VALIDATION_REGEX,
  },
  orderId: {
    required: true,
    minLength: 5,
  },
  phone: {
    required: true,
    pattern: /^[0-9]{10}$/,
  },
};

// Payment Analytics Events
export const PAYMENT_EVENTS = {
  PAYMENT_INITIATED: 'payment_initiated',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  PAYMENT_CANCELLED: 'payment_cancelled',
  PAYMENT_RETRY: 'payment_retry',
  UPI_APP_SELECTED: 'upi_app_selected',
  PAYMENT_METHOD_CHANGED: 'payment_method_changed',
};

export default PAYMENT_CONFIG; 