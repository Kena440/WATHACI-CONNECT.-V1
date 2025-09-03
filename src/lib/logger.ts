/**
 * Logger utility with rotation and middleware capabilities
 * Provides structured logging with different levels and automatic log rotation
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  source?: string;
  userId?: string;
}

export interface LoggerConfig {
  maxLogEntries: number;
  maxStorageSize: number; // in bytes
  enableConsole: boolean;
  enableStorage: boolean;
  logLevel: LogLevel;
}

class Logger {
  private config: LoggerConfig;
  private storageKey = 'wathaci_logs';

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      maxLogEntries: 1000,
      maxStorageSize: 5 * 1024 * 1024, // 5MB
      enableConsole: true,
      enableStorage: true,
      logLevel: LogLevel.INFO,
      ...config,
    };
  }

  private formatMessage(level: LogLevel, message: string, data?: any, source?: string): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      source,
      userId: this.getCurrentUserId(),
    };
  }

  private getCurrentUserId(): string | undefined {
    // Get user ID from app context or session storage
    try {
      const user = JSON.parse(sessionStorage.getItem('user') || '{}');
      return user?.id;
    } catch {
      return undefined;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.logLevel;
  }

  private writeToConsole(entry: LogEntry): void {
    if (!this.config.enableConsole) return;

    const levelName = LogLevel[entry.level];
    const prefix = `[${entry.timestamp}] [${levelName}]${entry.source ? ` [${entry.source}]` : ''}`;
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(prefix, entry.message, entry.data);
        break;
      case LogLevel.INFO:
        console.info(prefix, entry.message, entry.data);
        break;
      case LogLevel.WARN:
        console.warn(prefix, entry.message, entry.data);
        break;
      case LogLevel.ERROR:
        console.error(prefix, entry.message, entry.data);
        break;
    }
  }

  private writeToStorage(entry: LogEntry): void {
    if (!this.config.enableStorage) return;

    try {
      const existingLogs = this.getStoredLogs();
      const newLogs = [...existingLogs, entry];
      
      // Rotate logs if needed
      const rotatedLogs = this.rotateLogs(newLogs);
      
      localStorage.setItem(this.storageKey, JSON.stringify(rotatedLogs));
    } catch (error) {
      console.warn('Failed to write to log storage:', error);
    }
  }

  private getStoredLogs(): LogEntry[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private rotateLogs(logs: LogEntry[]): LogEntry[] {
    // Remove excess entries
    if (logs.length > this.config.maxLogEntries) {
      logs = logs.slice(-this.config.maxLogEntries);
    }

    // Check storage size and remove oldest entries if needed
    const logString = JSON.stringify(logs);
    const sizeInBytes = new Blob([logString]).size;
    
    if (sizeInBytes > this.config.maxStorageSize) {
      // Remove 25% of oldest logs
      const removeCount = Math.floor(logs.length * 0.25);
      logs = logs.slice(removeCount);
    }

    return logs;
  }

  private log(level: LogLevel, message: string, data?: any, source?: string): void {
    if (!this.shouldLog(level)) return;

    const entry = this.formatMessage(level, message, data, source);
    
    this.writeToConsole(entry);
    this.writeToStorage(entry);
  }

  debug(message: string, data?: any, source?: string): void {
    this.log(LogLevel.DEBUG, message, data, source);
  }

  info(message: string, data?: any, source?: string): void {
    this.log(LogLevel.INFO, message, data, source);
  }

  warn(message: string, data?: any, source?: string): void {
    this.log(LogLevel.WARN, message, data, source);
  }

  error(message: string, data?: any, source?: string): void {
    this.log(LogLevel.ERROR, message, data, source);
  }

  // Middleware methods
  logApiCall(method: string, url: string, data?: any): void {
    this.info(`API Call: ${method} ${url}`, data, 'API');
  }

  logApiResponse(method: string, url: string, status: number, data?: any): void {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    this.log(level, `API Response: ${method} ${url} - ${status}`, data, 'API');
  }

  logRouteChange(from: string, to: string): void {
    this.info(`Route changed: ${from} -> ${to}`, undefined, 'Router');
  }

  logUserAction(action: string, data?: any): void {
    this.info(`User action: ${action}`, data, 'User');
  }

  // Utility methods
  getLogs(): LogEntry[] {
    return this.getStoredLogs();
  }

  clearLogs(): void {
    try {
      localStorage.removeItem(this.storageKey);
      this.info('Logs cleared', undefined, 'Logger');
    } catch (error) {
      console.warn('Failed to clear logs:', error);
    }
  }

  exportLogs(): string {
    const logs = this.getStoredLogs();
    return JSON.stringify(logs, null, 2);
  }

  getLogStats(): { totalLogs: number; sizeInBytes: number; oldestLog?: string; newestLog?: string } {
    const logs = this.getStoredLogs();
    const logString = JSON.stringify(logs);
    const sizeInBytes = new Blob([logString]).size;

    return {
      totalLogs: logs.length,
      sizeInBytes,
      oldestLog: logs[0]?.timestamp,
      newestLog: logs[logs.length - 1]?.timestamp,
    };
  }
}

// Create default logger instance
export const logger = new Logger();

// Export Logger class for custom configurations
export { Logger };