import { z } from 'zod';
import { CONFIG } from '../constants/config';

// Common validation schemas
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required');

export const passwordSchema = z
  .string()
  .min(CONFIG.VALIDATION.PASSWORD_MIN_LENGTH, `Password must be at least ${CONFIG.VALIDATION.PASSWORD_MIN_LENGTH} characters`)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number');

export const phoneSchema = z
  .string()
  .regex(CONFIG.VALIDATION.PHONE_REGEX, 'Please enter a valid 10-digit phone number')
  // .min(1, 'Phone number is required');

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces');

// Login validation schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Registration validation schema
export const registerSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  ownerName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  phone: phoneSchema,
  businessType: z.enum(['farmer', 'wholesaler', 'retailer', 'processor', 'Agriculture', 'other']),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Product validation schema
export const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be greater than or equal to 0'),
  stockQuantity: z.number().min(0, 'Stock quantity must be greater than or equal to 0'),
  categoryId: z.string().min(1, 'Category is required'),
  unit: z.enum(['kg', 'g', 'liters', 'ml', 'pcs', 'box', 'dozen']),
  discountedPrice: z.number().min(0).optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  expiryDate: z.date().optional(),
  manufactureDate: z.date().optional(),
  variations: z.array(z.object({
    name: z.string(),
    value: z.string(),
    additionalPrice: z.number().default(0),
    stockQuantity: z.number().default(0),
  })).optional(),
}).refine((data) => {
  if (data.discountedPrice) {
    return data.discountedPrice <= data.price;
  }
  return true;
}, {
  message: "Discounted price must be less than or equal to regular price",
  path: ["discountedPrice"],
});

// Profile update validation schema
export const profileUpdateSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  ownerName: nameSchema,
  phone: phoneSchema,
  businessType: z.enum(['farmer', 'wholesaler', 'retailer', 'processor', 'Agriculture', 'other']),
  shopName: z.string().optional(),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
  }),
  bankDetails: z.object({
    accountHolderName: z.string().optional(),
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
    ifscCode: z.string().optional(),
  }).optional(),
});

// Forgot password validation schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Reset password validation schema
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Reset password with OTP validation schema
export const resetPasswordOTPSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Helper function to validate data against a schema
export const validateData = (schema, data) => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return { success: false, errors };
    }
    return { success: false, errors: [{ field: 'general', message: 'Validation failed' }] };
  }
};

// Helper function to get field error
export const getFieldError = (errors, fieldName) => {
  const error = errors?.find(err => err.field === fieldName);
  return error?.message || '';
}; 