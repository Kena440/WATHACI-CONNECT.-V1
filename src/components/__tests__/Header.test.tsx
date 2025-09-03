import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { Header } from '../Header';
import { useAppContext } from '@/contexts/AppContext';

jest.mock('@/contexts/AppContext', () => ({
  useAppContext: jest.fn(),
}));

jest.mock('../NotificationCenter', () => ({
  NotificationCenter: () => <div data-testid="notification-center" />,
}));

jest.mock('../DonateButton', () => ({
  DonateButton: () => <div>Donate</div>,
}));

const renderHeader = () => {
  return render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );
};

describe('Header', () => {
  const mockUseAppContext = useAppContext as jest.MockedFunction<typeof useAppContext>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders navigation links and sign in button when unauthenticated', () => {
    mockUseAppContext.mockReturnValue({
      sidebarOpen: false,
      toggleSidebar: jest.fn(),
      user: null,
      profile: null,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      refreshUser: jest.fn(),
    });

    renderHeader();

    const navLinks = ['Home', 'Marketplace', 'Freelancer Hub', 'Resources', 'Partnership Hub'];
    navLinks.forEach((text) => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });

    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('shows sign out option for authenticated users', async () => {
    mockUseAppContext.mockReturnValue({
      sidebarOpen: false,
      toggleSidebar: jest.fn(),
      user: { email: 'user@example.com', profile_completed: true },
      profile: null,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      refreshUser: jest.fn(),
    });

    renderHeader();

    const userButton = screen.getByText('user');
    await userEvent.click(userButton);

    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('toggles mobile menu', async () => {
    mockUseAppContext.mockReturnValue({
      sidebarOpen: false,
      toggleSidebar: jest.fn(),
      user: null,
      profile: null,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      refreshUser: jest.fn(),
    });

    renderHeader();

    const toggle = screen.getByLabelText('Toggle navigation menu');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getAllByRole('navigation')).toHaveLength(1);

    await userEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByRole('navigation')).toHaveLength(2);
  });
});
