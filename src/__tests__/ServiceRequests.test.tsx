import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ServiceRequests from '../pages/ServiceRequests';
import { AppProvider } from '../contexts/AppContext';
import { serviceRequestService } from '../lib/services';

// Mock the supabase module
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: {
              id: 'sr_123',
              title: 'Test Service Request',
              description: 'Test description',
              skills: ['React', 'TypeScript'],
              willing_to_pay: true,
              budget: 500
            },
            error: null
          }))
        }))
      }))
    })),
    functions: {
      invoke: jest.fn(() => Promise.resolve({
        data: { freelancers: [] },
        error: null
      }))
    }
  }
}));

// Mock the service
jest.mock('../lib/services', () => ({
  serviceRequestService: {
    getRequestsByUser: jest.fn(() => Promise.resolve({
      data: [
        {
          id: 'sr_123',
          title: 'Test Service Request',
          description: 'Test description',
          skills: ['React', 'TypeScript'],
          willing_to_pay: true,
          budget: 500,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ],
      error: null
    })),
    createRequest: jest.fn(() => Promise.resolve({
      data: {
        id: 'sr_124',
        title: 'New Service Request',
        description: 'New description',
        skills: ['Vue', 'JavaScript'],
        willing_to_pay: false
      },
      error: null
    })),
    updateRequest: jest.fn(() => Promise.resolve({
      data: { updated: true },
      error: null
    })),
    deleteRequest: jest.fn(() => Promise.resolve({
      data: null,
      error: null
    }))
  }
}));

// Mock AppLayout
jest.mock('../components/AppLayout', () => {
  return function MockAppLayout({ children }: { children: React.ReactNode }) {
    return <div data-testid="app-layout">{children}</div>;
  };
});

// Mock useToast
jest.mock('../components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}));

// Mock the context
const mockUser = {
  id: 'user_123',
  email: 'test@example.com'
};

jest.mock('../contexts/AppContext', () => ({
  useAppContext: () => ({
    user: mockUser
  }),
  AppProvider: ({ children }: { children: React.ReactNode }) => children
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        {children}
      </AppProvider>
    </QueryClientProvider>
  </MemoryRouter>
);

describe('ServiceRequests Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders service requests page with form', () => {
    render(
      <TestWrapper>
        <ServiceRequests />
      </TestWrapper>
    );

    expect(screen.getByText('Service Requests')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Service title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Detailed description')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Required skills or tags (comma separated)')).toBeInTheDocument();
    expect(screen.getByText('Willing to pay')).toBeInTheDocument();
    expect(screen.getByText('Submit Request')).toBeInTheDocument();
  });

  it('submits a new service request', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <ServiceRequests />
      </TestWrapper>
    );

    // Fill out the form
    await user.type(screen.getByPlaceholderText('Service title'), 'Test Service');
    await user.type(screen.getByPlaceholderText('Detailed description'), 'This is a test service description');
    await user.type(screen.getByPlaceholderText('Required skills or tags (comma separated)'), 'React, TypeScript');

    // Submit the form
    await user.click(screen.getByText('Submit Request'));

    // Verify that the service was called
    expect(serviceRequestService.createRequest).toHaveBeenCalledWith({
      user_id: mockUser.id,
      title: 'Test Service',
      description: 'This is a test service description',
      skills: ['React', 'TypeScript'],
      willing_to_pay: false,
      budget: undefined
    });
  });

  it('shows budget field when willing to pay is enabled', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <ServiceRequests />
      </TestWrapper>
    );

    // Initially budget field should not be visible
    expect(screen.queryByPlaceholderText('Budget')).not.toBeInTheDocument();

    // Enable willing to pay
    const willingToPaySwitch = screen.getByRole('switch');
    await user.click(willingToPaySwitch);

    // Now budget field should be visible
    expect(screen.getByPlaceholderText('Budget')).toBeInTheDocument();
  });

  it('displays existing service requests', async () => {
    render(
      <TestWrapper>
        <ServiceRequests />
      </TestWrapper>
    );

    // Wait for service requests to load
    await waitFor(() => {
      expect(screen.getByText('Test Service Request')).toBeInTheDocument();
    });

    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('Skills: React, TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Budget: 500')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('handles edit functionality', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <ServiceRequests />
      </TestWrapper>
    );

    // Wait for service requests to load and click edit
    await waitFor(() => {
      expect(screen.getByText('Test Service Request')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Edit'));

    // Verify form is populated with existing data
    expect(screen.getByDisplayValue('Test Service Request')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('React, TypeScript')).toBeInTheDocument();
    expect(screen.getByDisplayValue('500')).toBeInTheDocument();
    expect(screen.getByText('Update Request')).toBeInTheDocument();
  });

  it('handles delete functionality', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <ServiceRequests />
      </TestWrapper>
    );

    // Wait for service requests to load and click delete
    await waitFor(() => {
      expect(screen.getByText('Test Service Request')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Delete'));

    // Verify delete service was called
    expect(serviceRequestService.deleteRequest).toHaveBeenCalledWith('sr_123');
  });
});
