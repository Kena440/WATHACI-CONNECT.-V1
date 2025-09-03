import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { logger } from '@/lib/logger';

interface User {
  id: string;
  email: string;
  profile_completed?: boolean;
  account_type?: string;
}

interface AppContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData?: any) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const defaultAppContext: AppContextType = {
  sidebarOpen: false,
  toggleSidebar: () => {},
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  refreshUser: async () => {},
};

const AppContext = createContext<AppContextType>(defaultAppContext);

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
    logger.logUserAction('sidebar_toggle', { newState: !sidebarOpen });
  };

  const refreshUser = async () => {
    try {
      logger.info('Refreshing user data', undefined, 'Auth');
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('profile_completed, account_type')
          .eq('id', authUser.id)
          .single();

        setUser({
          id: authUser.id,
          email: authUser.email || '',
          profile_completed: profile?.profile_completed || false,
          account_type: profile?.account_type
        });
        
        // Store user in session storage for logger
        sessionStorage.setItem('user', JSON.stringify({
          id: authUser.id,
          email: authUser.email
        }));
        
        logger.info('User data refreshed successfully', { 
          userId: authUser.id,
          hasProfile: !!profile 
        }, 'Auth');
      } else {
        setUser(null);
        sessionStorage.removeItem('user');
        logger.info('No authenticated user found', undefined, 'Auth');
      }
    } catch (error) {
      logger.error('Error fetching user', { error: error instanceof Error ? error.message : 'Unknown error' }, 'Auth');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    logger.info('User sign in attempt', { email }, 'Auth');
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      logger.error('Sign in failed', { email, error: error.message }, 'Auth');
      throw error;
    }
    
    logger.info('User signed in successfully', { email }, 'Auth');
    
    toast({
      title: "Welcome back!",
      description: "You have been signed in successfully.",
    });
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    logger.info('User sign up attempt', { email, hasUserData: !!userData }, 'Auth');
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      logger.error('Sign up failed', { email, error: error.message }, 'Auth');
      throw error;
    }
    
    if (data.user && userData) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email,
          ...userData
        });
      
      if (profileError) {
        logger.error('Profile creation failed', { 
          userId: data.user.id, 
          error: profileError.message 
        }, 'Auth');
        throw profileError;
      }
      
      logger.info('Profile created successfully', { userId: data.user.id }, 'Auth');
    }
    
    logger.info('User signed up successfully', { email, userId: data.user?.id }, 'Auth');
    
    toast({
      title: "Account created!",
      description: "Please check your email to verify your account.",
    });
  };

  const signOut = async () => {
    try {
      logger.info('User sign out initiated', undefined, 'Auth');
      await supabase.auth.signOut();
      setUser(null);
      sessionStorage.removeItem('user');
      
      logger.info('User signed out successfully', undefined, 'Auth');
      
      toast({
        title: "Signed out successfully",
        description: "You have been logged out.",
      });
    } catch (error: any) {
      logger.error('Sign out failed', { error: error.message }, 'Auth');
      
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Initial user fetch
    refreshUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.info('Auth state changed', { event, hasSession: !!session }, 'Auth');
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await refreshUser();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          sessionStorage.removeItem('user');
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        user,
        loading,
        signIn,
        signUp,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};