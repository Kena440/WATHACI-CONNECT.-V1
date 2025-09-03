/**
 * Logger utility for the application
 * Provides structured logging with different levels
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: any;
}

class Logger {
  private isDevelopment = import.meta.env.DEV || import.meta.env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, context?: string, data?: any): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      data
    };
  }

  private log(entry: LogEntry): void {
    // In development, still use console for immediate feedback
    if (this.isDevelopment) {
      const contextStr = entry.context ? `[${entry.context}] ` : '';
      const logMessage = `${entry.timestamp} ${entry.level.toUpperCase()}: ${contextStr}${entry.message}`;
      
      switch (entry.level) {
        case LogLevel.ERROR:
          console.error(logMessage, entry.data || '');
          break;
        case LogLevel.WARN:
          console.warn(logMessage, entry.data || '');
          break;
        case LogLevel.INFO:
          console.info(logMessage, entry.data || '');
          break;
        case LogLevel.DEBUG:
          console.debug(logMessage, entry.data || '');
          break;
      }
    }
    
    // In production, you could send logs to a service like Sentry, LogRocket, etc.
    // For now, we'll just suppress them in production
  }

  error(message: string, data?: any, context?: string): void {
    this.log(this.formatMessage(LogLevel.ERROR, message, context, data));
  }

  warn(message: string, data?: any, context?: string): void {
    this.log(this.formatMessage(LogLevel.WARN, message, context, data));
  }

  info(message: string, data?: any, context?: string): void {
    this.log(this.formatMessage(LogLevel.INFO, message, context, data));
  }

  debug(message: string, data?: any, context?: string): void {
    this.log(this.formatMessage(LogLevel.DEBUG, message, context, data));
  }
}

// Export a singleton instance
export const logger = new Logger();