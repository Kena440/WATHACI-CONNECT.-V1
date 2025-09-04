import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { AppProvider, useAppContext } from '../AppContext';
import { supabase } from '@/lib/supabase-enhanced';
import * as supabaseEnhanced from '@/lib/supabase-enhanced';
import { toast } from '@/components/ui/use-toast';

jest.mock('@/lib/supabase-enhanced', () => {
  const auth = {
    getUser: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
  };
  return {
    supabase: { auth, from: jest.fn() },
    withErrorHandling: jest.fn(async (fn: any) => fn()),
    isSupabaseConfigured: true,
    supabaseConfigurationError: null,
  };
});

jest.mock('@/components/ui/use-toast', () => ({
  toast: jest.fn(),
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;
const mockToast = toast as jest.MockedFunction<typeof toast>;

const mockProfileChain = (profile = { profile_completed: false, account_type: null }) => ({
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({ data: profile }),
  insert: jest.fn().mockResolvedValue({ error: null }),
});

const renderWithContext = async () => {
  let ctx: ReturnType<typeof useAppContext> | undefined;
  const TestComponent = () => {
    ctx = useAppContext();
    return null;
  };
  render(
    <AppProvider>
      <TestComponent />
    </AppProvider>
  );
  await waitFor(() => expect(ctx).toBeDefined());
  await waitFor(() => expect(ctx!.loading).toBe(false));
  return ctx!;
};

beforeEach(() => {
  jest.clearAllMocks();
  mockSupabase.auth.onAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: jest.fn() } },
  } as any);
});

describe('AppProvider configuration', () => {
  test('renders error when Supabase is not configured', () => {
    supabaseEnhanced.isSupabaseConfigured = false as any;
    (supabaseEnhanced as any).supabaseConfigurationError = new Error('config missing');

    const { getByText } = render(
      <AppProvider>
        <div />
      </AppProvider>
    );

    expect(getByText(/config missing/)).toBeInTheDocument();

    supabaseEnhanced.isSupabaseConfigured = true as any;
    (supabaseEnhanced as any).supabaseConfigurationError = null;
  });
});

describe('AppContext auth actions', () => {
  test('signIn success triggers toast', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } } as any);
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ data: {}, error: null } as any);
    mockSupabase.from.mockImplementation(() => mockProfileChain() as any);

    const ctx = await renderWithContext();
    await ctx.signIn('test@example.com', 'password');

    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password' });
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Welcome back!',
      description: 'You have been signed in successfully.',
    }));
    expect(ctx.user).toBeNull();
  });

  test('signIn failure throws error and no toast', async () => {
    const error = new Error('Invalid');
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } } as any);
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ error } as any);
    mockSupabase.from.mockImplementation(() => mockProfileChain() as any);

    const ctx = await renderWithContext();
    await expect(ctx.signIn('test@example.com', 'bad')).rejects.toThrow('Invalid');
    expect(mockToast).not.toHaveBeenCalled();
  });

  test('signUp success inserts profile and shows toast', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } } as any);
    mockSupabase.auth.signUp.mockResolvedValue({ data: { user: { id: '1', email: 'test@example.com' } }, error: null } as any);
    const profileChain = mockProfileChain();
    mockSupabase.from.mockImplementation(() => profileChain as any);

    const ctx = await renderWithContext();
    await ctx.signUp('test@example.com', 'pass', { foo: 'bar' });

    expect(profileChain.insert).toHaveBeenCalledWith({ id: '1', email: 'test@example.com', foo: 'bar' });
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Account created!' }));
  });

  test('signUp failure throws error and no toast', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } } as any);
    const error = new Error('signup error');
    mockSupabase.auth.signUp.mockResolvedValue({ data: {}, error } as any);
    mockSupabase.from.mockImplementation(() => mockProfileChain() as any);

    const ctx = await renderWithContext();
    await expect(ctx.signUp('email', 'pass')).rejects.toThrow('signup error');
    expect(mockToast).not.toHaveBeenCalled();
  });

  test('signOut clears user and shows toast', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: '1', email: 'a@test.com' } } } as any);
    mockSupabase.from.mockImplementation(() => mockProfileChain({ profile_completed: true, account_type: 'basic' }) as any);
    mockSupabase.auth.signOut.mockResolvedValue({ error: null } as any);

    const ctx = await renderWithContext();
    await ctx.signOut();
    await waitFor(() => expect(ctx.user).toBeNull());
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Signed out successfully' }));
  });

  test('signOut failure keeps user and shows error toast', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: '1', email: 'a@test.com' } } } as any);
    mockSupabase.from.mockImplementation(() => mockProfileChain({ profile_completed: true, account_type: 'basic' }) as any);
    mockSupabase.auth.signOut.mockRejectedValue(new Error('logout error'));

    const ctx = await renderWithContext();
    const userBefore = ctx.user;
    await ctx.signOut();
    await waitFor(() => expect(ctx.user).toEqual(userBefore));
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Error signing out',
      description: 'logout error',
      variant: 'destructive',
    }));
  });

  test('refreshUser updates user state', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } } as any);
    mockSupabase.from.mockImplementation(() => mockProfileChain() as any);
    const ctx = await renderWithContext();

    const profile = { profile_completed: true, account_type: 'admin' };
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: '123', email: 'b@test.com' } } } as any);
    mockSupabase.from.mockImplementation(() => mockProfileChain(profile) as any);

    await ctx.refreshUser();
    await waitFor(() => expect(ctx.user).toEqual({ id: '123', email: 'b@test.com', ...profile }));
    expect(mockToast).not.toHaveBeenCalled();
  });

  test('refreshUser failure leaves user null', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } } as any);
    mockSupabase.from.mockImplementation(() => mockProfileChain() as any);
    const ctx = await renderWithContext();

    mockSupabase.auth.getUser.mockRejectedValue(new Error('network'));
    await ctx.refreshUser();
    await waitFor(() => expect(ctx.user).toBeNull());
    expect(mockToast).not.toHaveBeenCalled();
  });
});

