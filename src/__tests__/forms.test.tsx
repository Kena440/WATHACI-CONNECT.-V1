import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, jest } from '@jest/globals';
import { MemoryRouter } from 'react-router-dom';
import { GetStarted } from '../pages/GetStarted';

const mockSignUp = jest.fn().mockResolvedValue(undefined);

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// @ts-ignore
global.ResizeObserver = MockResizeObserver;

jest.mock('@/contexts/AppContext', () => ({
  useAppContext: () => ({ signUp: mockSignUp }),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: jest.fn() }),
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ onValueChange, children }: any) => (
    <select id="accountType" onChange={(e) => onValueChange(e.target.value)}>
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: any) => <>{children}</>,
  SelectValue: ({ placeholder }: any) => <option value="">{placeholder}</option>,
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ value, children }: any) => <option value={value}>{children}</option>,
}));

describe('GetStarted form', () => {
  it('submits form data', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <GetStarted />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText('First Name'), 'John');
    await user.type(screen.getByLabelText('Last Name'), 'Doe');
    await user.type(screen.getByLabelText('Email'), 'john@example.com');
    await user.type(screen.getByLabelText('Company (Optional)'), 'Acme');
    await user.selectOptions(screen.getByLabelText('Account Type'), 'professional');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.type(screen.getByLabelText('Confirm Password'), 'password123');
    await user.click(screen.getByRole('checkbox'));

    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(mockSignUp).toHaveBeenCalledWith('john@example.com', 'password123', {
      first_name: 'John',
      last_name: 'Doe',
      company: 'Acme',
      account_type: 'professional',
      full_name: 'John Doe',
      profile_completed: false,
    });
  });
});
