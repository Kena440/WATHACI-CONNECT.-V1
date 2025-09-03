/**
 * Enhanced Supabase client configuration with error handling and validation
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment validation
const validateEnvironment = (): { url: string; key: string } | null => {
  // Check if we're in test environment (Jest)
  const isJestEnv = typeof jest !== 'undefined' || process?.env?.NODE_ENV === 'test';

  let url: string | undefined;
  let key: string | undefined;

  if (isJestEnv) {
    // Use hardcoded test values for Jest environment
    url = 'https://test.supabase.co';
    key = 'test-key';
  } else {
    // For normal runtime, use import.meta.env
    url = (import.meta as any).env?.VITE_SUPABASE_URL;
    key = (import.meta as any).env?.VITE_SUPABASE_KEY;
  }

  if (!url || !key) {
    console.warn('Supabase environment variables are missing; client will not be initialized.');
    return null;
  }

  // Skip URL validation in test environment
  if (!isJestEnv) {
    try {
      new URL(url);
    } catch {
      console.warn('Invalid VITE_SUPABASE_URL format; client will not be initialized.');
      return null;
    }
  }

  return { url, key };
};

// Create the enhanced Supabase client
const createSupabaseClient = (): SupabaseClient | null => {
  const env = validateEnvironment();
  if (!env) return null;

  const client = createClient(env.url, env.key, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      // Storage for auth tokens
      storage: window.localStorage,
    },
    global: {
      headers: {
        'X-Client-Info': 'wathaci-connect-v1',
      },
    },
    // Enhanced error handling
    db: {
      schema: 'public',
    },
  });

  return client;
};

// Initialize the client
let supabaseClient: SupabaseClient | null = null;

try {
  supabaseClient = createSupabaseClient();
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
}

const supabaseFallback = new Proxy({}, {
  get() {
    throw new Error('Supabase client is not initialized. Set VITE_SUPABASE_URL and VITE_SUPABASE_KEY.');
  },
}) as SupabaseClient;

// Connection testing function
export const testConnection = async (): Promise<boolean> => {
  if (!supabaseClient) return false;
  try {
    const { error } = await supabaseClient
      .from('profiles')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return false;
  }
};

// Enhanced error handling wrapper
export const withErrorHandling = async <T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  context: string
): Promise<{ data: T | null; error: Error | null }> => {
  try {
    const result = await operation();
    
    if (result.error) {
      const error = new Error(`${context}: ${result.error.message}`);
      console.error(error);
      return { data: null, error };
    }

    return { data: result.data, error: null };
  } catch (error) {
    const wrappedError = new Error(`${context}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error(wrappedError);
    return { data: null, error: wrappedError };
  }
};

// Retry logic for failed operations
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }

  throw lastError!;
};

// Export the main client
export const supabase = supabaseClient ?? supabaseFallback;

// Export client getter for testing purposes
export const getSupabaseClient = (): SupabaseClient => supabaseClient ?? supabaseFallback;

// Health check function
export const healthCheck = async (): Promise<{
  status: 'healthy' | 'unhealthy';
  details: {
    connection: boolean;
    auth: boolean;
    timestamp: string;
  };
}> => {
  const timestamp = new Date().toISOString();
  
  if (!supabaseClient) {
    return {
      status: 'unhealthy',
      details: {
        connection: false,
        auth: false,
        timestamp,
      },
    };
  }

  try {
    // Test basic connection
    const connection = await testConnection();

    // Test auth status
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    const auth = !authError;

    const status = connection && auth ? 'healthy' : 'unhealthy';

    return {
      status,
      details: {
        connection,
        auth,
        timestamp,
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      details: {
        connection: false,
        auth: false,
        timestamp,
      },
    };
  }
};

// Export types for use in other modules
export type SupabaseClientType = typeof supabaseClient;
