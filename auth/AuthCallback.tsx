import { useEffect, useState } from 'react';
import { SupabaseAuthService, type SupabaseUser } from '../../utils/supabase-auth';

interface AuthCallbackProps {
  onSuccess: (user: SupabaseUser) => void;
  onError: (error: string) => void;
}

export function AuthCallback({ onSuccess, onError }: AuthCallbackProps) {
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const result = await SupabaseAuthService.handleAuthCallback();
        
        if (result.error) {
          throw new Error(result.error);
        }

        if (result.user) {
          onSuccess(result.user);
        } else {
          throw new Error('No user data received');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        onError(error instanceof Error ? error.message : 'Authentication failed');
      } finally {
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, [onSuccess, onError]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-background max-w-md mx-auto flex items-center justify-center">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-lg font-medium mb-2">Completing sign in...</h2>
          <p className="text-muted-foreground">Please wait while we set up your account.</p>
        </div>
      </div>
    );
  }

  return null;
}