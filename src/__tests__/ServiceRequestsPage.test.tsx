import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ServiceRequestsPage from '@/pages/ServiceRequestsPage';

// Mock the entire context to avoid supabase import issues
jest.mock('@/contexts/AppContext', () => ({
  AppProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAppContext: () => ({
    user: null,
    signOut: jest.fn(),
    loading: false
  })
}));

// Mock supabase module
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: { id: '1', description: 'Test request', skills: ['React'], location: 'Lagos' },
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

// Mock logger
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn()
  }
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter>
      {children}
    </MemoryRouter>
  </QueryClientProvider>
);

describe('ServiceRequestsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders service requests page correctly', () => {
    render(
      <TestWrapper>
        <ServiceRequestsPage />
      </TestWrapper>
    );

    // Check for the main heading (not the navigation link)
    expect(screen.getByRole('heading', { name: 'Service Requests' })).toBeInTheDocument();
    expect(screen.getByText('Post a Service Request')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Describe the service you need...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Required skills (comma separated)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Preferred location')).toBeInTheDocument();
  });

  it('shows validation error for empty fields', () => {
    // Mock alert
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <TestWrapper>
        <ServiceRequestsPage />
      </TestWrapper>
    );

    const submitButton = screen.getByText('Submit Request');
    fireEvent.click(submitButton);

    expect(alertSpy).toHaveBeenCalledWith('Please provide a description and required skills');
    
    alertSpy.mockRestore();
  });

  it('allows user to enter service request details', () => {
    render(
      <TestWrapper>
        <ServiceRequestsPage />
      </TestWrapper>
    );

    const descriptionInput = screen.getByPlaceholderText('Describe the service you need...');
    const skillsInput = screen.getByPlaceholderText('Required skills (comma separated)');
    const locationInput = screen.getByPlaceholderText('Preferred location');

    fireEvent.change(descriptionInput, { target: { value: 'Need a React developer' } });
    fireEvent.change(skillsInput, { target: { value: 'React, JavaScript' } });
    fireEvent.change(locationInput, { target: { value: 'Lagos, Nigeria' } });

    expect(descriptionInput).toHaveValue('Need a React developer');
    expect(skillsInput).toHaveValue('React, JavaScript');
    expect(locationInput).toHaveValue('Lagos, Nigeria');
  });
});