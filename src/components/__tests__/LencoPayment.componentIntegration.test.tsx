import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock the toast hook
const mockToast = jest.fn();
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}));

// Mock Supabase
const mockInvoke = jest.fn();
jest.mock('@/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: mockInvoke
    }
  }
}));

// Mock LencoPayment component for testing integration
jest.mock('../LencoPayment', () => ({
  LencoPayment: ({ amount, description, onSuccess, onCancel }: any) => (
    <div data-testid="lenco-payment">
      <div data-testid="payment-amount">{amount}</div>
      <div data-testid="payment-description">{description}</div>
      <button onClick={onSuccess} data-testid="mock-pay-success">
        Pay Successfully
      </button>
      <button onClick={onCancel} data-testid="mock-pay-cancel">
        Cancel Payment
      </button>
    </div>
  )
}));

// Import components after mocks
import { DonateButton } from '../DonateButton';
import { SubscriptionCard } from '../SubscriptionCard';

describe('Lenco Payment Integration in Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('DonateButton Integration', () => {
    it('renders donate button and opens payment dialog', async () => {
      const user = userEvent.setup();
      render(<DonateButton />);
      
      const donateButton = screen.getByRole('button', { name: /donate/i });
      expect(donateButton).toBeInTheDocument();
      
      // Click donate button to open dialog
      await user.click(donateButton);
      
      // Should open dialog with payment options
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('shows donation amount options in dialog', async () => {
      const user = userEvent.setup();
      render(<DonateButton />);
      
      // Open donate dialog
      const donateButton = screen.getByRole('button', { name: /donate/i });
      await user.click(donateButton);
      
      await waitFor(() => {
        // Should show amount options
        expect(screen.getByText('K10')).toBeInTheDocument();
        expect(screen.getByText('K25')).toBeInTheDocument();
        expect(screen.getByText('K50')).toBeInTheDocument();
        expect(screen.getByText('K100')).toBeInTheDocument();
      });
    });

    it('opens LencoPayment component when amount is selected', async () => {
      const user = userEvent.setup();
      render(<DonateButton />);
      
      // Open dialog and select amount
      const donateButton = screen.getByRole('button', { name: /donate/i });
      await user.click(donateButton);
      
      await waitFor(async () => {
        const amount50Button = screen.getByText('K50');
        await user.click(amount50Button);
      });
      
      await waitFor(() => {
        // Should show LencoPayment component
        expect(screen.getByTestId('lenco-payment')).toBeInTheDocument();
        expect(screen.getByTestId('payment-amount')).toHaveTextContent('50');
      });
    });

    it('handles successful donation payment', async () => {
      const user = userEvent.setup();
      render(<DonateButton />);
      
      // Open dialog, select amount, and complete payment
      const donateButton = screen.getByRole('button', { name: /donate/i });
      await user.click(donateButton);
      
      await waitFor(async () => {
        const amount25Button = screen.getByText('K25');
        await user.click(amount25Button);
      });
      
      await waitFor(async () => {
        const payButton = screen.getByTestId('mock-pay-success');
        await user.click(payButton);
      });
      
      // Should handle successful payment
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Thank you for your donation!",
          description: "Your contribution helps us continue providing valuable services.",
        });
      });
    });

    it('handles custom donation amount', async () => {
      const user = userEvent.setup();
      render(<DonateButton />);
      
      // Open dialog
      const donateButton = screen.getByRole('button', { name: /donate/i });
      await user.click(donateButton);
      
      await waitFor(() => {
        // Enter custom amount
        const customInput = screen.getByPlaceholderText('Enter custom amount');
        expect(customInput).toBeInTheDocument();
      });
      
      const customInput = screen.getByPlaceholderText('Enter custom amount');
      await user.type(customInput, '75');
      
      const continueButton = screen.getByRole('button', { name: /continue/i });
      await user.click(continueButton);
      
      await waitFor(() => {
        // Should show LencoPayment with custom amount
        expect(screen.getByTestId('lenco-payment')).toBeInTheDocument();
        expect(screen.getByTestId('payment-amount')).toHaveTextContent('75');
      });
    });
  });

  describe('SubscriptionCard Integration', () => {
    const mockSubscriptionPlan = {
      id: '1',
      name: 'Basic Plan',
      description: 'Basic subscription plan',
      price: 'K50',
      lencoAmount: 5000,
      currency: 'ZMW',
      interval: 'monthly',
      period: 'monthly',
      features: ['Feature 1', 'Feature 2'],
      popular: false,
      user_type: 'individual',
      userTypes: ['individual'],
      category: 'basic' as const
    };

    it('renders subscription card with Lenco payment integration', () => {
      render(
        <SubscriptionCard 
          plan={mockSubscriptionPlan}
          isCurrentPlan={false}
          onSubscribe={jest.fn()}
        />
      );
      
      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
      expect(screen.getByText('Basic subscription plan')).toBeInTheDocument();
      expect(screen.getByText(/K50/)).toBeInTheDocument();
    });

    it('shows subscribe button for non-current plans', () => {
      render(
        <SubscriptionCard 
          plan={mockSubscriptionPlan}
          isCurrentPlan={false}
          onSubscribe={jest.fn()}
        />
      );
      
      expect(screen.getByRole('button', { name: /subscribe/i })).toBeInTheDocument();
    });

    it('opens LencoPayment when subscribe button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnSubscribe = jest.fn();
      
      render(
        <SubscriptionCard 
          plan={mockSubscriptionPlan}
          isCurrentPlan={false}
          onSubscribe={mockOnSubscribe}
        />
      );
      
      const subscribeButton = screen.getByRole('button', { name: /subscribe/i });
      await user.click(subscribeButton);
      
      await waitFor(() => {
        // Should show LencoPayment component
        expect(screen.getByTestId('lenco-payment')).toBeInTheDocument();
        expect(screen.getByTestId('payment-amount')).toHaveTextContent('5000');
        expect(screen.getByTestId('payment-description')).toHaveTextContent('Basic Plan');
      });
    });

    it('handles successful subscription payment', async () => {
      const user = userEvent.setup();
      const mockOnSubscribe = jest.fn();
      
      render(
        <SubscriptionCard 
          plan={mockSubscriptionPlan}
          isCurrentPlan={false}
          onSubscribe={mockOnSubscribe}
        />
      );
      
      // Click subscribe and complete payment
      const subscribeButton = screen.getByRole('button', { name: /subscribe/i });
      await user.click(subscribeButton);
      
      await waitFor(async () => {
        const payButton = screen.getByTestId('mock-pay-success');
        await user.click(payButton);
      });
      
      // Should call onSubscribe callback
      await waitFor(() => {
        expect(mockOnSubscribe).toHaveBeenCalledWith(mockSubscriptionPlan);
      });
    });

    it('handles payment cancellation', async () => {
      const user = userEvent.setup();
      const mockOnSubscribe = jest.fn();
      
      render(
        <SubscriptionCard 
          plan={mockSubscriptionPlan}
          isCurrentPlan={false}
          onSubscribe={mockOnSubscribe}
        />
      );
      
      // Click subscribe then cancel
      const subscribeButton = screen.getByRole('button', { name: /subscribe/i });
      await user.click(subscribeButton);
      
      await waitFor(async () => {
        const cancelButton = screen.getByTestId('mock-pay-cancel');
        await user.click(cancelButton);
      });
      
      // Payment dialog should close
      await waitFor(() => {
        expect(screen.queryByTestId('lenco-payment')).not.toBeInTheDocument();
      });
    });

    it('shows current plan status correctly', () => {
      render(
        <SubscriptionCard 
          plan={mockSubscriptionPlan}
          isCurrentPlan={true}
          onSubscribe={jest.fn()}
        />
      );
      
      // Should show current plan status instead of subscribe button
      expect(screen.getByText(/current plan/i)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /subscribe/i })).not.toBeInTheDocument();
    });
  });

  describe('Payment Error Handling', () => {
    it('handles payment errors gracefully in donation flow', async () => {
      const user = userEvent.setup();
      
      // Mock payment error
      const PaymentWithError = ({ onError }: any) => (
        <div data-testid="lenco-payment">
          <button 
            onClick={() => onError && onError(new Error('Payment failed'))}
            data-testid="mock-pay-error"
          >
            Trigger Error
          </button>
        </div>
      );
      
      // Temporarily override the mock
      jest.doMock('../LencoPayment', () => ({
        LencoPayment: PaymentWithError
      }));
      
      render(<DonateButton />);
      
      // Open dialog and select amount
      const donateButton = screen.getByRole('button', { name: /donate/i });
      await user.click(donateButton);
      
      await waitFor(async () => {
        const amount10Button = screen.getByText('K10');
        await user.click(amount10Button);
      });
      
      await waitFor(async () => {
        const errorButton = screen.getByTestId('mock-pay-error');
        await user.click(errorButton);
      });
      
      // Should handle error gracefully (error handling depends on component implementation)
      await waitFor(() => {
        expect(screen.getByTestId('lenco-payment')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('maintains accessibility standards in payment flow', async () => {
      const user = userEvent.setup();
      render(<DonateButton />);
      
      // Check that donate button has proper accessibility
      const donateButton = screen.getByRole('button', { name: /donate/i });
      expect(donateButton).toBeInTheDocument();
      expect(donateButton).toHaveAttribute('type', 'button');
      
      // Open dialog
      await user.click(donateButton);
      
      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
        expect(dialog).toHaveAttribute('aria-modal', 'true');
      });
    });

    it('provides proper labeling for subscription actions', () => {
      const mockPlan = {
        id: '1',
        name: 'Premium Plan',
        description: 'Premium features',
        price: 'K100',
        lencoAmount: 10000,
        currency: 'ZMW',
        interval: 'monthly',
        period: 'monthly',
        features: ['Premium Feature'],
        popular: true,
        user_type: 'business',
        userTypes: ['business'],
        category: 'professional' as const
      };
      
      render(
        <SubscriptionCard 
          plan={mockPlan}
          isCurrentPlan={false}
          onSubscribe={jest.fn()}
        />
      );
      
      const subscribeButton = screen.getByRole('button', { name: /subscribe/i });
      expect(subscribeButton).toBeInTheDocument();
      expect(subscribeButton).toHaveAccessibleName();
    });
  });
});