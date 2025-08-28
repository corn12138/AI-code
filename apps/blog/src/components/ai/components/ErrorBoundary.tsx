'use client';

import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRetries?: number;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send error to monitoring service
    this.reportError(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    // Reset error state if resetKeys have changed
    if (hasError && resetOnPropsChange && resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== (prevProps.resetKeys?.[index])
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId);
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // Send error to monitoring service (e.g., Sentry, LogRocket, etc.)
    try {
      const errorReport = {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        errorInfo: {
          componentStack: errorInfo.componentStack
        },
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        url: window.location.href
      };

      // Send to monitoring service
      console.log('Error report:', errorReport);
      
      // You can replace this with actual error reporting
      // Example: Sentry.captureException(error, { contexts: { errorInfo } });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  private resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: 0
    });
  };

  private handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount < maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: prevState.retryCount + 1
      }));

      // Auto-reset after a delay to prevent infinite retry loops
      this.resetTimeoutId = window.setTimeout(() => {
        this.setState({ retryCount: 0 });
      }, 30000); // Reset retry count after 30 seconds
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    const { hasError, error, errorInfo, retryCount } = this.state;
    const { fallback, children, maxRetries = 3 } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="min-h-[400px] flex items-center justify-center p-8"
        >
          <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
            {/* Error Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
              className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
            </motion.div>

            {/* Error Title */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Oops! Something went wrong
            </h3>

            {/* Error Description */}
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The AI Assistant encountered an unexpected error. Don't worry, your data is safe.
            </p>

            {/* Error Details (in development) */}
            {process.env.NODE_ENV === 'development' && error && (
              <motion.details
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-4 text-left bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
              >
                <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Error Details
                </summary>
                <div className="text-xs font-mono text-red-600 dark:text-red-400 whitespace-pre-wrap overflow-auto max-h-32">
                  <div className="mb-2">
                    <strong>Error:</strong> {error.message}
                  </div>
                  {error.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <br />
                      {error.stack}
                    </div>
                  )}
                  {errorInfo && (
                    <div className="mt-2">
                      <strong>Component Stack:</strong>
                      <br />
                      {errorInfo.componentStack}
                    </div>
                  )}
                </div>
              </motion.details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {retryCount < maxRetries && (
                <motion.button
                  onClick={this.handleRetry}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  <span>Try Again ({maxRetries - retryCount} left)</span>
                </motion.button>
              )}

              <motion.button
                onClick={this.handleReload}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowPathIcon className="w-4 h-4" />
                <span>Reload Page</span>
              </motion.button>
            </div>

            {/* Retry Count Info */}
            {retryCount > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 text-sm text-gray-500 dark:text-gray-400"
              >
                Retry attempt: {retryCount}/{maxRetries}
              </motion.p>
            )}
          </div>
        </motion.div>
      );
    }

    return children;
  }
}

// Hook for functional component error handling
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      console.error('Error caught by useErrorHandler:', error);
    }
  }, [error]);

  return {
    error,
    resetError,
    handleError
  };
};
