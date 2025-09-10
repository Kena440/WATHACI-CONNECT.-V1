/**
 * Payment Configuration
 * Centralized configuration for Lenco payment integration
 */

export interface PaymentConfig {
  publicKey: string;
  apiUrl: string;
  currency: string;
  country: string;
  platformFeePercentage: number;
  minAmount: number;
  maxAmount: number;
  environment: 'development' | 'production';
}

export interface LencoPaymentRequest {
  amount: number;
  currency: string;
  email: string;
  phone: string;
  name: string;
  description: string;
  reference: string;
  callback_url?: string;
  metadata?: Record<string, any>;
  payment_method?: 'mobile_money' | 'card' | 'bank_transfer';
  provider?: 'mtn' | 'airtel' | 'zamtel';
}

export interface LencoPaymentResponse {
  success: boolean;
  data?: {
    payment_url: string;
    reference: string;
    access_code: string;
  };
  message?: string;
  error?: string;
}

export interface PaymentStatus {
  reference: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  transaction_id?: string;
  gateway_response?: string;
  paid_at?: string;
  metadata?: Record<string, any>;
}

// Load configuration from environment variables
export const getPaymentConfig = (): PaymentConfig => {
  const config: PaymentConfig = {
    publicKey: import.meta.env.VITE_LENCO_PUBLIC_KEY || '',
    apiUrl: import.meta.env.VITE_LENCO_API_URL || 'https://api.lenco.ng/v1',
    currency: import.meta.env.VITE_PAYMENT_CURRENCY || 'ZMK',
    country: import.meta.env.VITE_PAYMENT_COUNTRY || 'ZM',
    platformFeePercentage: parseFloat(import.meta.env.VITE_PLATFORM_FEE_PERCENTAGE || '2'),
    minAmount: parseFloat(import.meta.env.VITE_MIN_PAYMENT_AMOUNT || '5'),
    maxAmount: parseFloat(import.meta.env.VITE_MAX_PAYMENT_AMOUNT || '1000000'),
    environment: (import.meta.env.VITE_APP_ENV as 'development' | 'production') || 'development'
  };

  return config;
};

// Validate payment configuration
export const validatePaymentConfig = (config: PaymentConfig): boolean => {
  if (!config.publicKey) {
    console.error('Payment Error: Lenco public key not configured');
    return false;
  }
  
  if (!config.apiUrl) {
    console.error('Payment Error: Lenco API URL not configured');
    return false;
  }

  return true;
};

// Calculate platform fee
export const calculatePlatformFee = (amount: number, feePercentage: number): number => {
  return Math.round((amount * feePercentage / 100) * 100) / 100;
};

// Generate payment reference
export const generatePaymentReference = (prefix: string = 'WC'): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}_${timestamp}_${random}`;
};

// Validate phone number for mobile money
export const validatePhoneNumber = (phone: string, country: string = 'ZM'): boolean => {
  if (country === 'ZM') {
    // Zambian phone number validation (09XXXXXXXX or 26009XXXXXXXX)
    const zambianRegex = /^(260)?(09[0-9]{8})$/;
    return zambianRegex.test(phone.replace(/\s/g, ''));
  }
  return phone.length >= 10;
};

// Format amount for display
export const formatAmount = (amount: number, currency: string = 'ZMK'): string => {
  return new Intl.NumberFormat('en-ZM', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};