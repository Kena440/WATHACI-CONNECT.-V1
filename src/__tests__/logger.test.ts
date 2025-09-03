/**
 * Tests for the logger functionality
 */

import { logger, Logger, LogLevel } from '@/lib/logger';

describe('Logger', () => {
  beforeEach(() => {
    // Clear logs before each test
    logger.clearLogs();
    localStorage.clear();
  });

  test('should create log entries with proper format', () => {
    logger.info('Test message', { test: 'data' }, 'TestSource');
    
    const logs = logger.getLogs();
    expect(logs).toHaveLength(1);
    
    const log = logs[0];
    expect(log.message).toBe('Test message');
    expect(log.level).toBe(LogLevel.INFO);
    expect(log.source).toBe('TestSource');
    expect(log.data).toEqual({ test: 'data' });
    expect(log.timestamp).toBeDefined();
  });

  test('should filter logs by level', () => {
    const customLogger = new Logger({ logLevel: LogLevel.WARN });
    
    customLogger.debug('Debug message');
    customLogger.info('Info message');
    customLogger.warn('Warn message');
    customLogger.error('Error message');
    
    const logs = customLogger.getLogs();
    expect(logs).toHaveLength(2); // Only warn and error should be logged
    expect(logs[0].level).toBe(LogLevel.WARN);
    expect(logs[1].level).toBe(LogLevel.ERROR);
  });

  test('should rotate logs when exceeding max entries', () => {
    const customLogger = new Logger({ maxLogEntries: 3 });
    
    customLogger.info('Message 1');
    customLogger.info('Message 2');
    customLogger.info('Message 3');
    customLogger.info('Message 4'); // This should trigger rotation
    
    const logs = customLogger.getLogs();
    expect(logs).toHaveLength(3);
    expect(logs[0].message).toBe('Message 2'); // First message should be removed
    expect(logs[2].message).toBe('Message 4');
  });

  test('should log API calls with proper format', () => {
    logger.logApiCall('POST', '/api/users', { name: 'test' });
    
    const logs = logger.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].message).toBe('API Call: POST /api/users');
    expect(logs[0].source).toBe('API');
  });

  test('should log route changes', () => {
    logger.logRouteChange('/home', '/profile');
    
    const logs = logger.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].message).toBe('Route changed: /home -> /profile');
    expect(logs[0].source).toBe('Router');
  });

  test('should export logs as JSON string', () => {
    logger.info('Test message');
    const exported = logger.exportLogs();
    
    const parsed = JSON.parse(exported);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].message).toBe('Test message');
  });

  test('should provide log statistics', () => {
    logger.info('Message 1');
    logger.warn('Message 2');
    logger.error('Message 3');
    
    const stats = logger.getLogStats();
    expect(stats.totalLogs).toBe(3);
    expect(stats.sizeInBytes).toBeGreaterThan(0);
    expect(stats.oldestLog).toBeDefined();
    expect(stats.newestLog).toBeDefined();
  });

  test('should handle localStorage errors gracefully', () => {
    // Mock localStorage to throw error
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = jest.fn(() => {
      throw new Error('Storage full');
    });

    // Should not throw error
    expect(() => {
      logger.info('Test message');
    }).not.toThrow();

    // Restore original method
    localStorage.setItem = originalSetItem;
  });

  test('should disable console logging when configured', () => {
    const consoleSpy = jest.spyOn(console, 'info');
    const customLogger = new Logger({ enableConsole: false });
    
    customLogger.info('Test message');
    
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test('should disable storage when configured', () => {
    const customLogger = new Logger({ enableStorage: false });
    
    customLogger.info('Test message');
    
    expect(customLogger.getLogs()).toHaveLength(0);
  });
});