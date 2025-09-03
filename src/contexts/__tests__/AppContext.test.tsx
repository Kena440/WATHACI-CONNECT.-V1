import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppProvider, useAppContext } from '../AppContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

vi.mock('@/lib/supabase', () => {
  const auth = {
    getUser: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
  };
  return { supabase: { auth, from: vi.fn() } };
});

vi.mock('@/components/ui/use-toast', () => ({
  toast: vi.fn(),
}));

const mockSupabase = supabase as any;
const mockToast = toast as any;

const mockProfileChain = (profile = { profile_completed: false, account_type: null }) => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: profile }),
  insert: vi.fn().mockResolvedValue({ error: null }),
});

const renderWithContext = async () => {
  let ctx: ReturnType<typeof useAppContext> | undefined;
  const TestComponent = () => {
    ctx = useAppContext();
    return null;
  };
  
  await act(async () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );
  });
  
  await waitFor(() => expect(ctx).toBeDefined());
  await waitFor(() => expect(ctx!.loading).toBe(false));
  return ctx!;
};

beforeEach(() => {
  vi.clearAllMocks();
  // Reset mocks to default behavior
  mockSupabase.auth.onAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  } as any);
  mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } } as any);
  mockSupabase.from.mockImplementation(() => mockProfileChain() as any);
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
    
    // Mock the auth state change to trigger SIGNED_OUT event
    let authStateChangeCallback: any;
    mockSupabase.auth.onAuthStateChange.mockImplementation((callback: any) => {
      authStateChangeCallback = callback;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });
    
    mockSupabase.auth.signOut.mockImplementation(async () => {
      // Simulate the auth state change event
      if (authStateChangeCallback) {
        await authStateChangeCallback('SIGNED_OUT', null);
      }
      return { error: null };
    });

    const ctx = await renderWithContext();
    
    await act(async () => {
      await ctx.signOut();
    });
    
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

    await act(async () => {
      await ctx.refreshUser();
    });
    
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
