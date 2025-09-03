/**
 * Middleware for logging API calls and other application events
 */

import { logger } from './logger';

// Supabase middleware for logging database operations
export const createSupabaseLogger = (supabaseClient: any) => {
  // Store original methods
  const originalFrom = supabaseClient.from;
  const originalAuth = supabaseClient.auth;
  
  // Wrap from() method for table operations
  supabaseClient.from = function(table: string) {
    const query = originalFrom.call(this, table);
    
    // Wrap common query methods
    const wrapMethod = (methodName: string, originalMethod: (...args: any[]) => any) => {
      return function(...args: any[]) {
        const startTime = Date.now();
        logger.info(`Supabase ${methodName} on table: ${table}`, { args }, 'Supabase');
        
        const result = originalMethod.apply(this, args);
        
        // If the result is a promise, log the completion
        if (result && typeof result.then === 'function') {
          return result
            .then((data: any) => {
              const duration = Date.now() - startTime;
              logger.info(`Supabase ${methodName} completed`, { 
                table, 
                duration: `${duration}ms`,
                success: true 
              }, 'Supabase');
              return data;
            })
            .catch((error: any) => {
              const duration = Date.now() - startTime;
              logger.error(`Supabase ${methodName} failed`, { 
                table, 
                duration: `${duration}ms`,
                error: error.message 
              }, 'Supabase');
              throw error;
            });
        }
        
        return result;
      };
    };
    
    // Wrap common query methods
    ['select', 'insert', 'update', 'delete', 'upsert'].forEach(method => {
      if (query[method]) {
        query[method] = wrapMethod(method, query[method]);
      }
    });
    
    return query;
  };
  
  // Wrap auth methods
  if (originalAuth) {
    const authMethods = ['signIn', 'signUp', 'signOut', 'getUser', 'getSession'];
    authMethods.forEach(method => {
      if (originalAuth[method]) {
        const originalMethod = originalAuth[method];
        originalAuth[method] = function(...args: any[]) {
          logger.info(`Auth ${method} called`, undefined, 'Auth');
          
          const result = originalMethod.apply(this, args);
          
          if (result && typeof result.then === 'function') {
            return result
              .then((data: any) => {
                logger.info(`Auth ${method} completed`, { success: true }, 'Auth');
                return data;
              })
              .catch((error: any) => {
                logger.error(`Auth ${method} failed`, { error: error.message }, 'Auth');
                throw error;
              });
          }
          
          return result;
        };
      }
    });
  }
  
  return supabaseClient;
};

// Fetch middleware for logging HTTP requests
export const createFetchLogger = () => {
  const originalFetch = window.fetch;
  
  window.fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === 'string' ? input : input.toString();
    const method = init?.method || 'GET';
    const startTime = Date.now();
    
    logger.logApiCall(method, url, init?.body ? { body: init.body } : undefined);
    
    try {
      const response = await originalFetch(input, init);
      const duration = Date.now() - startTime;
      
      logger.logApiResponse(method, url, response.status, { 
        duration: `${duration}ms`,
        ok: response.ok 
      });
      
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`Fetch failed: ${method} ${url}`, { 
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, 'Fetch');
      throw error;
    }
  };
  
  return originalFetch;
};

// Router middleware for logging navigation
export const createRouterLogger = () => {
  let currentPath = window.location.pathname;
  
  // Monitor hash changes
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function(...args) {
    const newPath = args[2] as string || window.location.pathname;
    if (newPath !== currentPath) {
      logger.logRouteChange(currentPath, newPath);
      currentPath = newPath;
    }
    return originalPushState.apply(this, args);
  };
  
  history.replaceState = function(...args) {
    const newPath = args[2] as string || window.location.pathname;
    if (newPath !== currentPath) {
      logger.logRouteChange(currentPath, newPath);
      currentPath = newPath;
    }
    return originalReplaceState.apply(this, args);
  };
  
  // Listen for popstate events (back/forward buttons)
  window.addEventListener('popstate', () => {
    const newPath = window.location.pathname;
    if (newPath !== currentPath) {
      logger.logRouteChange(currentPath, newPath);
      currentPath = newPath;
    }
  });
  
  return { originalPushState, originalReplaceState };
};

// Error boundary logger
export const logError = (error: Error, errorInfo?: any) => {
  logger.error('React Error Boundary caught error', {
    error: error.message,
    stack: error.stack,
    errorInfo
  }, 'ErrorBoundary');
};

// Performance logger
export const logPerformance = (name: string, startTime: number) => {
  const duration = Date.now() - startTime;
  logger.info(`Performance: ${name}`, { duration: `${duration}ms` }, 'Performance');
};

// User interaction logger
export const logUserInteraction = (element: string, action: string, data?: any) => {
  logger.logUserAction(`${action} on ${element}`, data);
};

// Component lifecycle logger
export const logComponentLifecycle = (componentName: string, lifecycle: string, data?: any) => {
  logger.debug(`Component ${componentName} ${lifecycle}`, data, 'Component');
};