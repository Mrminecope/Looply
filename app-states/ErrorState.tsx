import React from 'react';
import { Button } from '../ui/button';
import { RefreshCcw, AlertTriangle, Wifi, WifiOff } from 'lucide-react';

interface AppErrorStateProps {
  error: string;
  onRetry?: () => void;
  isOnline?: boolean;
}

export function AppErrorState({ error, onRetry, isOnline = true }: AppErrorStateProps) {
  const handleReload = () => {
    window.location.reload();
  };

  const isTimeoutError = error.includes('timeout') || error.includes('taking longer than expected');
  const isNetworkError = error.includes('network') || error.includes('connection') || !isOnline;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-xl shadow-lg border p-6 text-center space-y-6">
        {/* Error Icon */}
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
          {isNetworkError ? (
            <WifiOff className="w-10 h-10 text-destructive" />
          ) : (
            <AlertTriangle className="w-10 h-10 text-destructive" />
          )}
        </div>
        
        {/* Error Content */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-foreground">
            {isTimeoutError ? 'Loading Timeout' : 
             isNetworkError ? 'Connection Issue' : 
             'Something went wrong'}
          </h1>
          
          <p className="text-muted-foreground">
            {error}
          </p>

          {isNetworkError && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              <span>{isOnline ? 'Connected' : 'No internet connection'}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {onRetry && (
            <Button 
              onClick={onRetry}
              className="w-full button-primary"
              size="lg"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
          
          <Button 
            onClick={handleReload}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Reload App
          </Button>
        </div>

        {/* Helpful Tips */}
        {(isTimeoutError || isNetworkError) && (
          <div className="bg-muted rounded-lg p-4 text-left">
            <h3 className="font-medium text-sm mb-2">Troubleshooting Tips:</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              {isNetworkError && (
                <>
                  <li>• Check your internet connection</li>
                  <li>• Try switching between WiFi and mobile data</li>
                </>
              )}
              {isTimeoutError && (
                <>
                  <li>• Wait a moment and try again</li>
                  <li>• Check if you have a stable internet connection</li>
                </>
              )}
              <li>• Clear your browser cache and reload</li>
              <li>• Try refreshing the page</li>
            </ul>
          </div>
        )}

        {/* Looply Branding */}
        <div className="text-xs text-muted-foreground">
          <span className="text-gradient font-medium">Looply</span> will be back shortly
        </div>
      </div>
    </div>
  );
}