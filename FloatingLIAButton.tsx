import React from 'react';
import { EnhancedLIAButton } from './EnhancedLIAButton';
import type { ContentContext } from '../utils/lia';

interface FloatingLIAButtonProps {
  showLIAButton: boolean;
  text?: string;
  onApply?: (content: string) => void;
  currentContent?: string;
  context?: ContentContext;
}

export function FloatingLIAButton({
  showLIAButton,
  text,
  onApply,
  currentContent,
  context
}: FloatingLIAButtonProps) {
  // Don't render if LIA button should not be shown
  if (!showLIAButton) {
    return null;
  }

  return (
    <EnhancedLIAButton
      showLIAButton={showLIAButton}
      text={text}
      onApply={onApply}
      currentContent={currentContent}
      context={context}
      position="bottom-right"
      size="medium"
    />
  );
}

// Export for backward compatibility
export default FloatingLIAButton;