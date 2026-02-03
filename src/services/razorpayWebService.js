import { Linking } from 'react-native';
import PAYMENT_CONFIG from '../constants/paymentConfig';

export class RazorpayWebService {
  static async processPayment(paymentData) {
    try {
      const {
        amount,
        orderId,
        customerName,
        customerEmail,
        customerPhone,
        description = PAYMENT_CONFIG.RAZORPAY.MERCHANT_DESCRIPTION,
        prefill = {},
        notes = {}
      } = paymentData;

      // Validate required fields
      if (!amount || !orderId || !customerName || !customerEmail) {
        throw new Error('Missing required payment data');
      }

      // Create Razorpay web checkout URL
      const checkoutUrl = this.createCheckoutUrl({
        amount: Math.round(amount * 100), // Convert to paise
        orderId,
        customerName,
        customerEmail,
        customerPhone,
        description,
        prefill,
        notes
      });

      console.log('Opening Razorpay web checkout:', checkoutUrl);

      // Open Razorpay checkout in browser
      const supported = await Linking.canOpenURL(checkoutUrl);
      if (!supported) {
        throw new Error('Cannot open payment gateway');
      }

      await Linking.openURL(checkoutUrl);

      // Return a promise that resolves when user returns to app
      return new Promise((resolve, reject) => {
        // For now, we'll simulate success after a delay
        // In a real implementation, you'd handle the return URL
        setTimeout(() => {
          resolve({
            success: true,
            transactionId: `WEB_TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            orderId: orderId,
            signature: 'web_signature',
            amount: amount,
            paymentMethod: 'razorpay_web',
            timestamp: new Date().toISOString(),
            response: { 
              web: true,
              message: 'Payment completed via web browser'
            }
          });
        }, 3000);
      });

    } catch (error) {
      console.error('Razorpay web payment error:', error);
      throw new Error(error.message || 'Payment failed. Please try again.');
    }
  }

  static createCheckoutUrl(paymentData) {
    const {
      amount,
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      description,
      prefill,
      notes
    } = paymentData;

    // Create a simple checkout URL (this is a simplified version)
    // In production, you'd use Razorpay's hosted checkout
    const params = new URLSearchParams({
      key: PAYMENT_CONFIG.RAZORPAY.KEY_ID,
      amount: amount,
      currency: PAYMENT_CONFIG.RAZORPAY.CURRENCY,
      name: PAYMENT_CONFIG.RAZORPAY.MERCHANT_NAME,
      description: description,
      order_id: orderId,
      prefill_name: customerName,
      prefill_email: customerEmail,
      prefill_contact: customerPhone,
      theme_color: PAYMENT_CONFIG.RAZORPAY.THEME_COLOR
    });

    return `https://checkout.razorpay.com/v1/checkout.html?${params.toString()}`;
  }

  static isAvailable() {
    return true; // Web service is always available
  }

  static getSupportedPaymentMethods() {
    return [
      'card',
      'netbanking', 
      'wallet',
      'upi',
      'paylater'
    ];
  }
}

export default RazorpayWebService; 