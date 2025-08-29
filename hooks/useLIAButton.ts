import { useEffect, useMemo } from 'react';

interface UseLIAButtonProps {
  isAuthenticated: boolean;
  showCreateModal: boolean;
  showVideoPlayer: boolean;
  setShowLIAButton: (show: boolean) => void;
}

export function useLIAButton({
  isAuthenticated,
  showCreateModal,
  showVideoPlayer,
  setShowLIAButton
}: UseLIAButtonProps) {
  
  // Determine when to show LIA button
  const shouldShowLIAButton = useMemo(() => {
    // Don't show if user is not authenticated
    if (!isAuthenticated) return false;
    
    // Don't show when video player is open (fullscreen experience)
    if (showVideoPlayer) return false;
    
    // Show in most other cases when authenticated
    return true;
  }, [isAuthenticated, showVideoPlayer]);

  // Update LIA button visibility when conditions change
  useEffect(() => {
    setShowLIAButton(shouldShowLIAButton);
  }, [shouldShowLIAButton, setShowLIAButton]);

  // Generate contextual LIA text based on current state
  const liaText = useMemo(() => {
    if (showCreateModal) {
      return "Get LIA's help with your post";
    }
    
    return "Ask LIA for assistance";
  }, [showCreateModal]);

  return {
    shouldShowLIAButton,
    liaText
  };
}