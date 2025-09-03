/**
 * Unit tests for browser validation utility
 */

// Mock import.meta.env
const mockEnv = {
  VITE_SUPABASE_URL: 'https://test.supabase.co',
  VITE_SUPABASE_KEY: 'test-key'
};

// Mock the services module
jest.mock('../../lib/services', () => ({
  userService: {
    getCurrentUser: jest.fn(),
  },
  profileService: {
    getByUserId: jest.fn(),
  },
  subscriptionService: {
    getAllPlans: jest.fn(),
  },
  transactionService: {
    createTransaction: jest.fn(),
  },
  testConnection: jest.fn(),
}));

// Mock console methods
const consoleSpy = {
  log: jest.spyOn(console, 'log').mockImplementation(() => {}),
  error: jest.spyOn(console, 'error').mockImplementation(() => {}),
  warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
};

describe('Browser Validation Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    Object.values(consoleSpy).forEach(spy => spy.mockRestore());
  });

  it('should be available as a module export', async () => {
    const { validateDatabaseSetup } = await import('../validate-database-browser');
    expect(typeof validateDatabaseSetup).toBe('function');
  });

  it('should validate service imports successfully', async () => {
    const { validateDatabaseSetup } = await import('../validate-database-browser');
    
    await validateDatabaseSetup();
    
    expect(consoleSpy.log).toHaveBeenCalledWith('🔍 Validating Database Setup in Browser...\n');
    expect(consoleSpy.log).toHaveBeenCalledWith('📦 Testing service imports...');
    expect(consoleSpy.log).toHaveBeenCalledWith('✅ All services imported successfully');
  });

  it('should validate service instantiation', async () => {
    const { validateDatabaseSetup } = await import('../validate-database-browser');
    
    await validateDatabaseSetup();
    
    expect(consoleSpy.log).toHaveBeenCalledWith('\n🏗️ Testing service instantiation...');
    expect(consoleSpy.log).toHaveBeenCalledWith('✅ userService instantiated correctly');
    expect(consoleSpy.log).toHaveBeenCalledWith('✅ profileService instantiated correctly');
    expect(consoleSpy.log).toHaveBeenCalledWith('✅ subscriptionService instantiated correctly');
    expect(consoleSpy.log).toHaveBeenCalledWith('✅ transactionService instantiated correctly');
  });

  it('should validate environment variables', async () => {
    const { validateDatabaseSetup } = await import('../validate-database-browser');
    
    await validateDatabaseSetup();
    
    expect(consoleSpy.log).toHaveBeenCalledWith('\n🌍 Testing environment variables...');
    expect(consoleSpy.log).toHaveBeenCalledWith('✅ Environment variables are set');
    expect(consoleSpy.log).toHaveBeenCalledWith('📍 Supabase URL: https://test.supabase.co...');
  });

  it('should test service methods availability', async () => {
    const { validateDatabaseSetup } = await import('../validate-database-browser');
    
    await validateDatabaseSetup();
    
    expect(consoleSpy.log).toHaveBeenCalledWith('\n⚙️ Testing service methods...');
    expect(consoleSpy.log).toHaveBeenCalledWith('✅ Object.getCurrentUser() available');
    expect(consoleSpy.log).toHaveBeenCalledWith('✅ Object.getByUserId() available');
    expect(consoleSpy.log).toHaveBeenCalledWith('✅ Object.getAllPlans() available');
  });

  it('should test connection function availability', async () => {
    const { validateDatabaseSetup } = await import('../validate-database-browser');
    
    await validateDatabaseSetup();
    
    expect(consoleSpy.log).toHaveBeenCalledWith('\n🔌 Testing database connection...');
    expect(consoleSpy.log).toHaveBeenCalledWith('✅ Connection test function available');
    expect(consoleSpy.log).toHaveBeenCalledWith('ℹ️ Actual connection test skipped in browser validation');
  });

  it('should complete validation successfully', async () => {
    const { validateDatabaseSetup } = await import('../validate-database-browser');
    
    await validateDatabaseSetup();
    
    expect(consoleSpy.log).toHaveBeenCalledWith('\n🎉 Database setup validation completed!');
    expect(consoleSpy.log).toHaveBeenCalledWith('ℹ️ All core components are working correctly.');
    expect(consoleSpy.log).toHaveBeenCalledWith('ℹ️ Run actual database operations to test full functionality.');
  });

  it('should handle errors gracefully', async () => {
    // Mock a service import failure
    jest.doMock('../../../lib/services', () => {
      throw new Error('Import failed');
    });

    const { validateDatabaseSetup } = await import('../validate-database-browser');
    
    await validateDatabaseSetup();
    
    expect(consoleSpy.error).toHaveBeenCalledWith('❌ Validation failed with error:', expect.any(Error));
  });
});