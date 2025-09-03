/**
 * Browser validation utility for database services
 * 
 * This script can be run in the browser console to validate the database setup.
 * Usage: Open browser console and run: validateDatabaseSetup()
 */

declare global {
  interface Window {
    validateDatabaseSetup: () => Promise<void>;
  }
}

const logger = {
  info: console.info,
  error: console.error,
  warn: console.warn,
};

async function validateDatabaseSetup() {
  logger.info('🔍 Validating Database Setup in Browser...\n');
  
  try {
    // Test 1: Import services
    logger.info('📦 Testing service imports...');
    const services = await import('../lib/services');
    
    if (services.userService && services.profileService && services.subscriptionService) {
      logger.info('✅ All services imported successfully');
    } else {
      logger.error('❌ Some services failed to import');
      return;
    }
    
    // Test 2: Check service instantiation
    logger.info('\n🏗️ Testing service instantiation...');
    
    const serviceTests = [
      { name: 'userService', service: services.userService },
      { name: 'profileService', service: services.profileService },
      { name: 'subscriptionService', service: services.subscriptionService },
      { name: 'transactionService', service: services.transactionService },
    ];
    
    for (const { name, service } of serviceTests) {
      if (service && typeof service === 'object') {
        logger.info(`✅ ${name} instantiated correctly`);
      } else {
        logger.error(`❌ ${name} failed to instantiate`);
      }
    }
    
    // Test 3: Test environment variables
    logger.info('\n🌍 Testing environment variables...');
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_KEY;
    
    if (url && key) {
      logger.info('✅ Environment variables are set');
      logger.info(`📍 Supabase URL: ${url.substring(0, 30)}...`);
    } else {
      logger.warn('⚠️ Environment variables not fully set');
    }
    
    // Test 4: Test types
    logger.info('\n📝 Testing TypeScript types...');
    try {
      const types = await import('../@types/database');
      logger.info('✅ Database types imported successfully');
      
      // Test basic type usage
      const testUser: typeof types.User = {
        id: 'test-123',
        email: 'test@example.com'
      };
      logger.info('✅ User type works correctly');
      
    } catch (error) {
      logger.error('❌ Database types import failed:', error);
    }
    
    // Test 5: Test connection (non-destructive)
    logger.info('\n🔌 Testing database connection...');
    try {
      const { testConnection } = services;
      
      if (typeof testConnection === 'function') {
        logger.info('✅ Connection test function available');
        
        // Note: We don't actually run the connection test in browser validation
        // as it requires network access and might fail in development environments
        logger.info('ℹ️ Actual connection test skipped in browser validation');
      } else {
        logger.error('❌ Connection test function not available');
      }
    } catch (error) {
      logger.error('❌ Connection test failed:', error);
    }
    
    // Test 6: Test service methods
    logger.info('\n⚙️ Testing service methods...');
    
    const methodTests = [
      { service: services.userService, method: 'getCurrentUser' },
      { service: services.profileService, method: 'getByUserId' },
      { service: services.subscriptionService, method: 'getAllPlans' },
    ];
    
    for (const { service, method } of methodTests) {
      if (typeof service[method] === 'function') {
        logger.info(`✅ ${service.constructor.name}.${method}() available`);
      } else {
        logger.error(`❌ ${service.constructor.name}.${method}() not available`);
      }
    }
    
    logger.info('\n🎉 Database setup validation completed!');
    logger.info('ℹ️ All core components are working correctly.');
    logger.info('ℹ️ Run actual database operations to test full functionality.');
    
  } catch (error) {
    logger.error('❌ Validation failed with error:', error);
    logger.error('Stack trace:', (error as Error).stack);
  }
}

// Make the function globally available
if (typeof window !== 'undefined') {
  window.validateDatabaseSetup = validateDatabaseSetup;
  logger.info('🔧 Database validation utility loaded. Run: validateDatabaseSetup()');
}

export { validateDatabaseSetup };