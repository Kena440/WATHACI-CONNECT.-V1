/**
 * Lenco Payment Service
 * Handles all Lenco payment gateway interactions
 */

import {
  PaymentConfig,
  LencoPaymentRequest,
  LencoPaymentResponse,
  PaymentStatus,
  getPaymentConfig,
  validatePaymentConfig,
  generatePaymentReference,
  validatePhoneNumber,
  calculatePlatformFee
} from '../payment-config';
import { logger } from '../logger';

export class LencoPaymentService {
  private config: PaymentConfig;
  private isConfigValid: boolean;

  constructor() {
    this.config = getPaymentConfig();
    this.isConfigValid = validatePaymentConfig(this.config);
  }

  /**
   * Initialize payment with Lenco
   */
  async initializePayment(request: Omit<LencoPaymentRequest, 'reference'>): Promise<LencoPaymentResponse> {
    let reference: string | undefined;
    try {
      if (!this.isConfigValid) {
        throw new Error('Payment configuration is invalid. Please check environment variables.');
      }

      // Validate request
      const validationResult = this.validatePaymentRequest(request);
      if (!validationResult.isValid) {
        throw new Error(validationResult.error);
      }

      // Generate reference
      reference = generatePaymentReference();
      
      const paymentRequest: LencoPaymentRequest = {
        ...request,
        reference,
        currency: this.config.currency,
        callback_url: `${window.location.origin}/payment/callback`,
      };

      // Call Lenco API
      const response = await this.callLencoAPI('/payments/initialize', 'POST', paymentRequest);
      
      if (response.success) {
        // Store payment reference for tracking
        localStorage.setItem('currentPaymentRef', reference);
        
        return {
          success: true,
          data: {
            payment_url: response.data.authorization_url || response.data.payment_url,
            reference: reference,
            access_code: response.data.access_code
          }
        };
      } else {
        throw new Error(response.message || 'Payment initialization failed');
      }

    } catch (error: any) {
      logger.error('Payment initialization error', error, {
        paymentReference: reference,
      });
      return {
        success: false,
        error: error.message || 'Payment initialization failed'
      };
    }
  }

  /**
   * Verify payment status
   */
  async verifyPayment(reference: string): Promise<PaymentStatus> {
    try {
      const response = await this.callLencoAPI(`/payments/verify/${reference}`, 'GET');
      
      return {
        reference,
        status: this.mapLencoStatus(response.data.status),
        amount: response.data.amount / 100, // Convert from kobo to naira/kwacha
        currency: response.data.currency,
        transaction_id: response.data.id,
        gateway_response: response.data.gateway_response,
        paid_at: response.data.paid_at,
        metadata: response.data.metadata
      };

    } catch (error: any) {
      logger.error('Payment verification error', error, {
        paymentReference: reference,
      });
      return {
        reference,
        status: 'failed',
        amount: 0,
        currency: this.config.currency
      };
    }
  }

  /**
   * Process mobile money payment
   */
  async processMobileMoneyPayment(request: {
    amount: number;
    phone: string;
    provider: 'mtn' | 'airtel' | 'zamtel';
    email: string;
    name: string;
    description: string;
  }): Promise<LencoPaymentResponse> {
    // Validate phone number
    if (!validatePhoneNumber(request.phone, this.config.country)) {
      return {
        success: false,
        error: 'Invalid phone number format'
      };
    }

    return this.initializePayment({
      ...request,
      payment_method: 'mobile_money',
      metadata: {
        payment_type: 'mobile_money',
        provider: request.provider
      }
    });
  }

  /**
   * Process card payment
   */
  async processCardPayment(request: {
    amount: number;
    email: string;
    name: string;
    description: string;
    phone?: string;
  }): Promise<LencoPaymentResponse> {
    return this.initializePayment({
      ...request,
      phone: request.phone || '',
      payment_method: 'card',
      metadata: {
        payment_type: 'card'
      }
    });
  }

  /**
   * Calculate total with fees
   */
  calculatePaymentTotal(amount: number): {
    baseAmount: number;
    platformFee: number;
    totalAmount: number;
    providerReceives: number;
  } {
    const platformFee = calculatePlatformFee(amount, this.config.platformFeePercentage);
    return {
      baseAmount: amount,
      platformFee,
      totalAmount: amount,
      providerReceives: amount - platformFee
    };
  }

  /**
   * Validate payment request
   */
  private validatePaymentRequest(request: Omit<LencoPaymentRequest, 'reference'>): {
    isValid: boolean;
    error?: string;
  } {
    if (!request.amount || request.amount < this.config.minAmount) {
      return { isValid: false, error: `Minimum payment amount is ${this.config.minAmount}` };
    }

    if (request.amount > this.config.maxAmount) {
      return { isValid: false, error: `Maximum payment amount is ${this.config.maxAmount}` };
    }

    if (!request.email || !this.isValidEmail(request.email)) {
      return { isValid: false, error: 'Valid email address is required' };
    }

    if (!request.name || request.name.trim().length < 2) {
      return { isValid: false, error: 'Valid name is required' };
    }

    if (!request.description || request.description.trim().length < 5) {
      return { isValid: false, error: 'Payment description is required' };
    }

    return { isValid: true };
  }

  /**
   * Call Lenco API
   */
  private async callLencoAPI(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any): Promise<any> {
    const url = `${this.config.apiUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.config.publicKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    const options: RequestInit = {
      method,
      headers,
      ...(data && method === 'POST' && { body: JSON.stringify(data) })
    };

    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Map Lenco status to our status
   */
  private mapLencoStatus(lencoStatus: string): PaymentStatus['status'] {
    const statusMap: Record<string, PaymentStatus['status']> = {
      'success': 'success',
      'failed': 'failed',
      'pending': 'pending',
      'cancelled': 'cancelled',
      'abandoned': 'cancelled'
    };

    return statusMap[lencoStatus.toLowerCase()] || 'failed';
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get payment configuration
   */
  getConfig(): PaymentConfig {
    return { ...this.config };
  }

  /**
   * Check if service is properly configured
   */
  isConfigured(): boolean {
    return this.isConfigValid;
  }
}

// Create singleton instance
export const lencoPaymentService = new LencoPaymentService();