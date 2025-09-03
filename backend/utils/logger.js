/**
 * Simple logger for backend services
 */

const LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  formatMessage(level, message, context, data) {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}] ` : '';
    return `${timestamp} ${level.toUpperCase()}: ${contextStr}${message}`;
  }

  log(level, message, data, context) {
    const logMessage = this.formatMessage(level, message, context, data);
    
    switch (level) {
      case LogLevel.ERROR:
        console.error(logMessage, data || '');
        break;
      case LogLevel.WARN:
        console.warn(logMessage, data || '');
        break;
      case LogLevel.INFO:
        console.info(logMessage, data || '');
        break;
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.debug(logMessage, data || '');
        }
        break;
    }
  }

  error(message, data, context) {
    this.log(LogLevel.ERROR, message, data, context);
  }

  warn(message, data, context) {
    this.log(LogLevel.WARN, message, data, context);
  }

  info(message, data, context) {
    this.log(LogLevel.INFO, message, data, context);
  }

  debug(message, data, context) {
    this.log(LogLevel.DEBUG, message, data, context);
  }
}

// Export a singleton instance
module.exports = new Logger();