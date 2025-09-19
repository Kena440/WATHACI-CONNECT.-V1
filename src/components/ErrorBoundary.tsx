import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });
    this.logErrorToService(error, errorInfo).catch((loggingError) => {
      console.error('Failed to log error to service', loggingError);
    });
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  private logErrorToService(error: Error, errorInfo: React.ErrorInfo) {
    return fetch('/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      }),
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="p-4 text-center">
          <h2 className="text-lg font-semibold">Something went wrong.</h2>
          <p className="mt-2">
            An unexpected error occurred. Please try again or let us know about the issue so we
            can fix it.
          </p>
          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <details className="mt-4 text-left whitespace-pre-wrap">
              <summary className="cursor-pointer font-medium">Error details (development only)</summary>
              <div className="mt-2">
                <p className="font-semibold">{this.state.error.message}</p>
                <pre className="overflow-auto text-sm">
                  {this.state.error.stack}
                  {'\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            </details>
          )}
          <button onClick={this.handleReload}>Reload</button>
          <p className="mt-4 text-sm">
            Need help?{' '}
            <a className="text-blue-600 underline" href="mailto:support@example.com">
              Contact support
            </a>{' '}
            or report the issue via our{' '}
            <a className="text-blue-600 underline" href="https://example.com/support" target="_blank" rel="noreferrer">
              help center
            </a>
            .
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;