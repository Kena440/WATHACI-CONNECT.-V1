jest.mock('@/lib/supabase', () => ({
  supabase: { functions: { invoke: jest.fn() } },
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: jest.fn() }),
}));

jest.mock('@/utils/logger', () => ({
  logger: { error: jest.fn(), info: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}));

import { render, screen } from '@testing-library/react';
import { LencoPayment } from '@/components/LencoPayment';

describe('LencoPayment fee breakdown', () => {
  it.each([
    { amount: 100, total: 'K100.00', fee: 'K2.00', provider: 'K98.00' },
    { amount: 250.5, total: 'K250.50', fee: 'K5.01', provider: 'K245.49' },
    { amount: 'K1,000', total: 'K1000.00', fee: 'K20.00', provider: 'K980.00' },
  ])('renders correct breakdown for %p', ({ amount, total, fee, provider }) => {
    render(<LencoPayment amount={amount} description="Test" />);
    expect(screen.getByText(total)).toBeInTheDocument();
    expect(screen.getByText(fee)).toBeInTheDocument();
    expect(screen.getByText(provider)).toBeInTheDocument();
  });
});
