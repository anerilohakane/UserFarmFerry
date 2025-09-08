import { NOTIFICATION_TYPES, ORDER_STATUS, PAYMENT_STATUS } from '../types';

// Format currency
export const formatCurrency = (amount, currency = '₹') => {
  if (typeof amount !== 'number') return `${currency}0`;
  return `${currency}${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Format date
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };
  
  return new Date(date).toLocaleDateString('en-IN', defaultOptions);
};

// Format date and time
export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Get status color
export const getStatusColor = (status, type = 'order') => {
  const statusColors = {
    order: {
      [ORDER_STATUS.PENDING]: '#f59e0b', // amber
      [ORDER_STATUS.PROCESSING]: '#3b82f6', // blue
      [ORDER_STATUS.OUT_FOR_DELIVERY]: '#8b5cf6', // purple
      [ORDER_STATUS.DELIVERED]: '#10b981', // green
      [ORDER_STATUS.CANCELLED]: '#ef4444', // red
      [ORDER_STATUS.RETURNED]: '#6b7280', // gray
    },
    payment: {
      [PAYMENT_STATUS.PENDING]: '#f59e0b',
      [PAYMENT_STATUS.PAID]: '#10b981',
      [PAYMENT_STATUS.FAILED]: '#ef4444',
      [PAYMENT_STATUS.REFUNDED]: '#6b7280',
    },
  };
  
  return statusColors[type]?.[status] || '#6b7280';
};

// Get status text
export const getStatusText = (status) => {
  const statusTexts = {
    [ORDER_STATUS.PENDING]: 'Pending',
    [ORDER_STATUS.PROCESSING]: 'Processing',
    [ORDER_STATUS.OUT_FOR_DELIVERY]: 'Out for Delivery',
    [ORDER_STATUS.DELIVERED]: 'Delivered',
    [ORDER_STATUS.CANCELLED]: 'Cancelled',
    [ORDER_STATUS.RETURNED]: 'Returned',
  };
  
  return statusTexts[status] || status;
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Generate random ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Check if object is empty
export const isEmpty = (obj) => {
  if (obj == null) return true;
  if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
  return Object.keys(obj).length === 0;
};

// Deep clone object
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number
export const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

// Get file extension
export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Calculate percentage
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// Sleep function for async operations
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Retry function for API calls
export const retry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await sleep(delay);
    return retry(fn, retries - 1, delay * 2);
  }
};

// Default export to satisfy Expo Router
export default function HelpersIndex() {
  return null;
}