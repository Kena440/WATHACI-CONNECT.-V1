/**
 * Basic functionality test for database services
 */

// Mock the entire supabase-enhanced module to avoid import.meta issues
jest.mock('../../supabase-enhanced', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } }))
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      delete: jest.fn(),
      range: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      contains: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis()
    }))
  },
  withErrorHandling: jest.fn(async (operation, context) => {
    try {
      const result = await operation();
      return result;
    } catch (error) {
      return { data: null, error };
    }
  }),
  withRetry: jest.fn(async (operation) => {
    return await operation();
  }),
  testConnection: jest.fn().mockResolvedValue(true),
  healthCheck: jest.fn().mockResolvedValue({
    status: 'healthy',
    details: { connection: true, auth: true, timestamp: new Date().toISOString() }
  }),
  getSupabaseClient: jest.fn(() => ({
    auth: { getUser: jest.fn() },
    from: jest.fn()
  }))
}));

// Mock Supabase client directly as well for any direct imports
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } }))
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      delete: jest.fn(),
      range: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      contains: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis()
    }))
  }))
}));

describe('Database Services', () => {
  describe('Service Imports', () => {
    it('should import all services without errors', async () => {
      const services = await import('../index');
      
      expect(services.userService).toBeDefined();
      expect(services.profileService).toBeDefined();
      expect(services.subscriptionService).toBeDefined();
      expect(services.transactionService).toBeDefined();
      expect(services.supabase).toBeDefined();
    });

    it('should have proper service types', async () => {
      const { userService, profileService, subscriptionService } = await import('../index');
      
      expect(typeof userService).toBe('object');
      expect(typeof profileService).toBe('object');
      expect(typeof subscriptionService).toBe('object');
    });
  });

  describe('Service Methods', () => {
    it('should have expected methods on user service', async () => {
      const { userService } = await import('../index');
      
      expect(typeof userService.getCurrentUser).toBe('function');
      expect(typeof userService.signIn).toBe('function');
      expect(typeof userService.signUp).toBe('function');
      expect(typeof userService.signOut).toBe('function');
    });

    it('should have expected methods on profile service', async () => {
      const { profileService } = await import('../index');
      
      expect(typeof profileService.getByUserId).toBe('function');
      expect(typeof profileService.createProfile).toBe('function');
      expect(typeof profileService.updateProfile).toBe('function');
      expect(typeof profileService.setAccountType).toBe('function');
      expect(typeof profileService.markProfileCompleted).toBe('function');
    });

    it('should have expected methods on subscription service', async () => {
      const { subscriptionService } = await import('../index');
      
      expect(typeof subscriptionService.getPlansByAccountType).toBe('function');
      expect(typeof subscriptionService.getCurrentUserSubscription).toBe('function');
      expect(typeof subscriptionService.createSubscription).toBe('function');
      expect(typeof subscriptionService.hasActiveSubscription).toBe('function');
    });
  });

  describe('Database Types', () => {
    it('should import database types without errors', async () => {
      // Import the types directly from the database types file
      const types = await import('../../../@types/database');
      
      // Since these are type exports, we can't test them at runtime
      // Instead, just ensure the module imports without errors
      expect(types).toBeDefined();
    });
  });

  describe('Utility Functions', () => {
    it('should have utility functions available', async () => {
      const { withErrorHandling, testConnection, healthCheck } = await import('../index');
      
      expect(typeof withErrorHandling).toBe('function');
      expect(typeof testConnection).toBe('function');
      expect(typeof healthCheck).toBe('function');
    });
  });
});