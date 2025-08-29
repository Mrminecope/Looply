import { toast } from 'sonner@2.0.3';
import { APP_CONSTANTS } from './app-constants';

export class AppHelpers {
  static createErrorHandler(setPerformanceMetrics: (fn: (prev: any) => any) => void) {
    return (error: Error, errorInfo: any) => {
      console.error('App Error:', error, errorInfo);
      setPerformanceMetrics(prev => ({ ...prev, errorCount: prev.errorCount + 1 }));
      
      // Show user-friendly error message
      toast.error(APP_CONSTANTS.TOAST_MESSAGES.ERROR_GENERIC, {
        action: {
          label: 'Refresh',
          onClick: () => window.location.reload()
        }
      });

      // Log error for analytics (in production, send to error tracking service)
      if (process.env.NODE_ENV === 'production') {
        console.error('Production error:', { error, errorInfo, userAgent: navigator.userAgent });
      }
    };
  }

  static createPerformanceHandler(setPerformanceMetrics: (fn: (prev: any) => any) => void) {
    return () => {
      const startTime = performance.now();
      
      const handleLoad = () => {
        const loadTime = performance.now() - startTime;
        setPerformanceMetrics(prev => ({ ...prev, loadTime }));
      };

      if (document.readyState === 'complete') {
        handleLoad();
      } else {
        window.addEventListener('load', handleLoad);
        return () => window.removeEventListener('load', handleLoad);
      }
    };
  }

  static createKeyboardHandler({
    showVideoPlayer,
    showCreateModal,
    showAuthModal,
    isAuthenticated,
    activeTab,
    handleCloseVideoPlayer,
    setShowCreateModal,
    setShowAuthModal,
    handleTabChange
  }: {
    showVideoPlayer: boolean;
    showCreateModal: boolean;
    showAuthModal: boolean;
    isAuthenticated: boolean;
    activeTab: string;
    handleCloseVideoPlayer: () => void;
    setShowCreateModal: (show: boolean) => void;
    setShowAuthModal: (show: boolean) => void;
    handleTabChange: (tab: string) => void;
  }) {
    return (event: KeyboardEvent) => {
      // Escape key to close modals
      if (event.key === APP_CONSTANTS.KEYBOARD_KEYS.ESCAPE) {
        if (showVideoPlayer) {
          handleCloseVideoPlayer();
        } else if (showCreateModal) {
          setShowCreateModal(false);
        } else if (showAuthModal) {
          setShowAuthModal(false);
        }
      }
      
      // Tab navigation enhancement
      if (event.key === APP_CONSTANTS.KEYBOARD_KEYS.TAB && isAuthenticated) {
        const currentIndex = APP_CONSTANTS.TABS.indexOf(activeTab);
        
        if (event.shiftKey && currentIndex > 0) {
          event.preventDefault();
          handleTabChange(APP_CONSTANTS.TABS[currentIndex - 1]);
        } else if (!event.shiftKey && currentIndex < APP_CONSTANTS.TABS.length - 1) {
          event.preventDefault();
          handleTabChange(APP_CONSTANTS.TABS[currentIndex + 1]);
        }
      }
    };
  }

  static createLIAApplyHandler({
    showCreateModal,
    handleLIAApply
  }: {
    showCreateModal: boolean;
    handleLIAApply: (content: string) => void;
  }) {
    return (content: string) => {
      try {
        if (!content) {
          toast.error(APP_CONSTANTS.TOAST_MESSAGES.NO_CONTENT);
          return;
        }

        // Apply LIA content based on current context
        if (showCreateModal) {
          // Apply to create modal
          handleLIAApply(content);
          toast.success(APP_CONSTANTS.TOAST_MESSAGES.LIA_APPLIED);
        } else {
          // Copy to clipboard as fallback
          navigator.clipboard.writeText(content).then(() => {
            toast.success(APP_CONSTANTS.TOAST_MESSAGES.LIA_COPIED);
          }).catch(() => {
            toast.error(APP_CONSTANTS.TOAST_MESSAGES.COPY_FAILED);
          });
        }

        // Add haptic feedback
        AppHelpers.addHapticFeedback(APP_CONSTANTS.VIBRATION_PATTERNS.SUCCESS);
      } catch (error) {
        console.error('LIA Apply Error:', error);
        toast.error(APP_CONSTANTS.TOAST_MESSAGES.LIA_APPLY_FAILED);
      }
    };
  }

  static addHapticFeedback(pattern: number | number[]) {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  static createRetryHandler({
    setError,
    setLoading
  }: {
    setError: (error: string | null) => void;
    setLoading: (loading: boolean) => void;
  }) {
    return () => {
      setError(null);
      setLoading(true);
      // Trigger re-initialization
      setTimeout(() => {
        window.location.reload();
      }, 500);
    };
  }

  static getLIAContext(user: any) {
    return {
      ...APP_CONSTANTS.LIA_CONTEXT_DEFAULT,
      userProfile: user
    };
  }
}