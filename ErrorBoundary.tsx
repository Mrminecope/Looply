import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';
import { RefreshCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    retryCount: 0
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      retryCount: 0
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      hasError: true
    });

    // Log to analytics/monitoring service if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      });
    }
  }

  private handleRetry = () => {
    if (this.state.retryCount >= 3) {
      // Max retries reached, reload the page
      window.location.reload();
      return;
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));

    // Clear any existing timeout
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }

    // Set a timeout to automatically retry if the error persists
    this.retryTimeoutId = setTimeout(() => {
      if (this.state.hasError) {
        this.handleRetry();
      }
    }, 5000);
  };

  private handleReload = () => {
    window.location.reload();
  };

  public componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isTimeoutError = this.state.error?.message.includes('timeout') || 
                            this.state.error?.message.includes('getPage');
      const isRetryableError = isTimeoutError || this.state.retryCount < 3;

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card rounded-xl shadow-lg border p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {isTimeoutError ? 'Loading Timeout' : 'Something went wrong'}
              </h2>
              <p className="text-muted-foreground text-sm">
                {isTimeoutError 
                  ? 'The app is taking longer than expected to load. This might be due to a slow connection or temporary issue.'
                  : 'An unexpected error occurred while loading the application.'
                }
              </p>
              
              {this.state.retryCount > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Retry attempt {this.state.retryCount}/3
                </p>
              )}
            </div>

            <div className="space-y-2">
              {isRetryableError && (
                <Button 
                  onClick={this.handleRetry}
                  className="w-full"
                  disabled={this.state.retryCount >= 3}
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  {this.state.retryCount >= 3 ? 'Max retries reached' : 'Try Again'}
                </Button>
              )}
              
              <Button 
                onClick={this.handleReload}
                variant="outline"
                className="w-full"
              >
                Reload Page
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-muted rounded p-3 text-xs">
                <summary className="cursor-pointer font-medium mb-2">
                  Error Details (Development)
                </summary>
                <pre className="whitespace-pre-wrap overflow-auto max-h-32">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}