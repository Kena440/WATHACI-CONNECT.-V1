/**
 * React context for logger integration
 */

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { logger, LogEntry, LogLevel } from '@/lib/logger';
import { 
  createSupabaseLogger, 
  createFetchLogger, 
  createRouterLogger,
  logError,
  logPerformance,
  logUserInteraction
} from '@/lib/logger-middleware';
import { supabase } from '@/lib/supabase';

interface LoggerContextType {
  logger: typeof logger;
  logUserAction: (action: string, data?: any) => void;
  logError: (error: Error, errorInfo?: any) => void;
  logPerformance: (name: string, startTime: number) => void;
  logUserInteraction: (element: string, action: string, data?: any) => void;
  getLogs: () => LogEntry[];
  clearLogs: () => void;
  exportLogs: () => string;
  getLogStats: () => { totalLogs: number; sizeInBytes: number; oldestLog?: string; newestLog?: string };
}

const LoggerContext = createContext<LoggerContextType | undefined>(undefined);

interface LoggerProviderProps {
  children: ReactNode;
  logLevel?: LogLevel;
  enableConsole?: boolean;
  enableStorage?: boolean;
}

export const LoggerProvider: React.FC<LoggerProviderProps> = ({ 
  children, 
  logLevel = LogLevel.INFO,
  enableConsole = true,
  enableStorage = true
}) => {
  useEffect(() => {
    // Initialize logging middleware
    const initializeLogging = () => {
      try {
        // Configure logger
        logger.info('Initializing logger system', { 
          logLevel: LogLevel[logLevel],
          enableConsole,
          enableStorage 
        }, 'Logger');

        // Set up Supabase logging
        createSupabaseLogger(supabase);
        
        // Set up fetch logging
        createFetchLogger();
        
        // Set up router logging
        createRouterLogger();
        
        // Log application start
        logger.info('Application started', {
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString()
        }, 'App');

        // Log unhandled errors
        window.addEventListener('error', (event) => {
          logger.error('Unhandled JavaScript error', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error?.stack
          }, 'GlobalError');
        });

        // Log unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
          logger.error('Unhandled promise rejection', {
            reason: event.reason,
            promise: event.promise
          }, 'GlobalError');
        });

        // Log page visibility changes
        document.addEventListener('visibilitychange', () => {
          logger.info(`Page visibility changed: ${document.hidden ? 'hidden' : 'visible'}`, 
            undefined, 'App');
        });

        // Performance monitoring
        if ('performance' in window && 'getEntriesByType' in performance) {
          // Log initial page load performance
          window.addEventListener('load', () => {
            setTimeout(() => {
              const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
              if (navigation) {
                logger.info('Page load performance', {
                  domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.navigationStart),
                  load: Math.round(navigation.loadEventEnd - navigation.navigationStart),
                  redirect: Math.round(navigation.redirectEnd - navigation.redirectStart),
                  dns: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
                  connect: Math.round(navigation.connectEnd - navigation.connectStart),
                  request: Math.round(navigation.responseEnd - navigation.requestStart)
                }, 'Performance');
              }
            }, 0);
          });
        }

      } catch (error) {
        console.error('Failed to initialize logging:', error);
      }
    };

    initializeLogging();

    // Cleanup function
    return () => {
      logger.info('Logger system shutting down', undefined, 'Logger');
    };
  }, [logLevel, enableConsole, enableStorage]);

  const contextValue: LoggerContextType = {
    logger,
    logUserAction: (action: string, data?: any) => {
      logger.logUserAction(action, data);
    },
    logError: (error: Error, errorInfo?: any) => {
      logError(error, errorInfo);
    },
    logPerformance: (name: string, startTime: number) => {
      logPerformance(name, startTime);
    },
    logUserInteraction: (element: string, action: string, data?: any) => {
      logUserInteraction(element, action, data);
    },
    getLogs: () => logger.getLogs(),
    clearLogs: () => logger.clearLogs(),
    exportLogs: () => logger.exportLogs(),
    getLogStats: () => logger.getLogStats()
  };

  return (
    <LoggerContext.Provider value={contextValue}>
      {children}
    </LoggerContext.Provider>
  );
};

export const useLogger = (): LoggerContextType => {
  const context = useContext(LoggerContext);
  if (!context) {
    throw new Error('useLogger must be used within a LoggerProvider');
  }
  return context;
};

// Higher-order component for automatic component logging
export const withLogging = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) => {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';
  
  const LoggedComponent: React.FC<P> = (props) => {
    const { logger } = useLogger();

    useEffect(() => {
      logger.debug(`Component ${displayName} mounted`, undefined, 'Component');
      
      return () => {
        logger.debug(`Component ${displayName} unmounted`, undefined, 'Component');
      };
    }, [logger]);

    return <WrappedComponent {...props} />;
  };

  LoggedComponent.displayName = `withLogging(${displayName})`;
  
  return LoggedComponent;
};