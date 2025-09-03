# Logger System Documentation

## Overview

The WATHACI-CONNECT application now includes a comprehensive logging system with automatic rotation and middleware capabilities. This system provides structured logging across the entire application with configurable output options and automatic log management.

## Features

### Core Logging
- **Multiple Log Levels**: DEBUG, INFO, WARN, ERROR with filtering capabilities
- **Automatic Rotation**: Configurable limits for log entries and storage size
- **Browser Storage**: Uses localStorage for persistent logging across sessions
- **Structured Format**: Consistent log format with timestamps, sources, and user context
- **Performance Optimized**: Minimal overhead with configurable options

### Middleware Integration
- **Database Operations**: Automatic logging of Supabase queries with performance metrics
- **HTTP Requests**: Fetch API monitoring with request/response logging
- **Route Navigation**: React Router integration for navigation tracking
- **Error Handling**: Global error catching and logging
- **User Actions**: Track user interactions and authentication events

## Usage

### Basic Logging

```typescript
import { logger } from '@/lib/logger';

// Different log levels
logger.debug('Debug information', { data: 'value' });
logger.info('General information', { userId: '123' });
logger.warn('Warning message', { issue: 'non-critical' });
logger.error('Error occurred', { error: errorObject });

// With source identification
logger.info('User signed in', { email: 'user@example.com' }, 'Auth');
```

### Using Logger Context

```typescript
import { useLogger } from '@/contexts/LoggerContext';

function MyComponent() {
  const { logger, logUserAction } = useLogger();
  
  const handleClick = () => {
    logUserAction('button_click', { buttonId: 'submit' });
  };
  
  return <button onClick={handleClick}>Submit</button>;
}
```

### Error Boundary Integration

```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourAppContent />
    </ErrorBoundary>
  );
}
```

### Log Viewer Component

```typescript
import { LogViewer } from '@/components/LogViewer';

function AdminPanel() {
  return (
    <div>
      <h1>Admin Panel</h1>
      <LogViewer />
    </div>
  );
}
```

## Configuration

### Logger Configuration

```typescript
import { Logger, LogLevel } from '@/lib/logger';

const customLogger = new Logger({
  maxLogEntries: 2000,        // Maximum number of log entries
  maxStorageSize: 10485760,   // Maximum storage size (10MB)
  enableConsole: true,        // Enable console output
  enableStorage: true,        // Enable localStorage storage
  logLevel: LogLevel.INFO     // Minimum log level to output
});
```

### Provider Configuration

```typescript
import { LoggerProvider } from '@/contexts/LoggerContext';

function App() {
  return (
    <LoggerProvider 
      logLevel={LogLevel.DEBUG}
      enableConsole={true}
      enableStorage={true}
    >
      <YourApp />
    </LoggerProvider>
  );
}
```

## API Reference

### Logger Class

#### Methods

- `debug(message, data?, source?)` - Log debug information
- `info(message, data?, source?)` - Log general information
- `warn(message, data?, source?)` - Log warnings
- `error(message, data?, source?)` - Log errors
- `logApiCall(method, url, data?)` - Log API calls
- `logApiResponse(method, url, status, data?)` - Log API responses
- `logRouteChange(from, to)` - Log route navigation
- `logUserAction(action, data?)` - Log user actions

#### Utility Methods

- `getLogs()` - Get all stored logs
- `clearLogs()` - Clear all logs
- `exportLogs()` - Export logs as JSON string
- `getLogStats()` - Get logging statistics

### Logger Context

#### Properties

- `logger` - Logger instance
- `logUserAction` - Function to log user actions
- `logError` - Function to log errors
- `logPerformance` - Function to log performance metrics
- `logUserInteraction` - Function to log UI interactions
- `getLogs` - Get all logs
- `clearLogs` - Clear all logs
- `exportLogs` - Export logs
- `getLogStats` - Get statistics

## Log Format

Each log entry includes:

```typescript
interface LogEntry {
  timestamp: string;    // ISO timestamp
  level: LogLevel;      // Log level (0-3)
  message: string;      // Log message
  data?: any;          // Additional data
  source?: string;     // Source identifier
  userId?: string;     // Current user ID (if authenticated)
}
```

## Automatic Middleware

The logger system automatically captures:

### Authentication Events
- Sign in attempts and results
- Sign up attempts and results
- Sign out events
- User data refresh operations

### Database Operations
- Supabase query execution
- Query performance metrics
- Database errors

### HTTP Requests
- Fetch API calls
- Response status and timing
- Request/response errors

### Navigation
- Route changes
- Browser navigation events

### Global Errors
- Unhandled JavaScript errors
- Unhandled promise rejections
- React component errors (via ErrorBoundary)

## Log Rotation

The system automatically manages log storage:

- **Entry Limit**: Removes oldest entries when limit exceeded
- **Size Limit**: Removes 25% of oldest logs when storage size exceeded
- **Automatic Cleanup**: Happens on each new log entry
- **Configurable Limits**: Both entry count and storage size are configurable

## Security Considerations

- **No Sensitive Data**: Avoid logging passwords, tokens, or sensitive user data
- **User Context**: User IDs are logged for tracking but emails/names should be avoided
- **Data Sanitization**: Consider sanitizing logged data in production
- **Storage Limits**: Browser localStorage has size limits (typically 5-10MB)

## Performance Impact

The logger is designed for minimal performance impact:

- **Synchronous Logging**: Fast, non-blocking operations
- **Efficient Storage**: JSON serialization with rotation
- **Configurable Output**: Disable console/storage as needed
- **Conditional Logging**: Log level filtering reduces processing

## Troubleshooting

### Common Issues

1. **Storage Full**: Browser storage limit reached
   - Solution: Reduce `maxStorageSize` or `maxLogEntries`

2. **Console Spam**: Too many debug logs
   - Solution: Increase `logLevel` to `LogLevel.INFO` or higher

3. **Missing Logs**: Logs not appearing
   - Check `enableStorage` and `enableConsole` settings
   - Verify log level configuration

4. **Performance Issues**: Logging impacting performance
   - Reduce log frequency
   - Disable storage in performance-critical areas
   - Use higher log levels in production

### Debug Tools

Use the LogViewer component for:
- Real-time log monitoring
- Log filtering and searching
- Export capabilities
- Storage statistics
- Log level distribution

## Best Practices

1. **Use Appropriate Log Levels**
   - DEBUG: Development debugging
   - INFO: General application flow
   - WARN: Recoverable issues
   - ERROR: Actual errors requiring attention

2. **Include Context**
   - Always provide relevant data objects
   - Use source parameters for categorization
   - Include user context when relevant

3. **Performance Considerations**
   - Use DEBUG level for verbose logging
   - Avoid logging in tight loops
   - Consider disabling storage in production

4. **Data Privacy**
   - Never log sensitive user data
   - Sanitize or redact personal information
   - Be mindful of GDPR and privacy regulations