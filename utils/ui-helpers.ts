/**
 * UI Helper Functions
 * Utility functions for common UI operations
 */

import { SUCCESS_MESSAGE_TEMPLATES, SUCCESS_MESSAGE_CLASSES, SUCCESS_MESSAGE_DURATION } from './app-constants';

export type SuccessMessageType = 'POST_CREATED' | 'LIA_POST_CREATED';

/**
 * Show a success message with animation
 */
export const showSuccessMessage = (type: SuccessMessageType): void => {
  const successMessage = document.createElement('div');
  successMessage.className = SUCCESS_MESSAGE_CLASSES[type];
  successMessage.innerHTML = SUCCESS_MESSAGE_TEMPLATES[type];
  
  document.body.appendChild(successMessage);
  
  setTimeout(() => {
    successMessage.remove();
  }, SUCCESS_MESSAGE_DURATION);
};

/**
 * Extract hashtags from text
 */
export const extractHashtags = (text: string): string[] => {
  return text.match(/#\w+/g) || [];
};

/**
 * Extract mentions from text
 */
export const extractMentions = (text: string): string[] => {
  return text.match(/@\w+/g) || [];
};

/**
 * Create post data object
 */
export const createPostData = (content: string, type: 'text' | 'image' | 'video' = 'text') => ({
  content,
  type,
  hashtags: extractHashtags(content),
  mentions: extractMentions(content)
});

/**
 * Handle native share functionality
 */
export const handleNativeShare = async (title: string, text: string, url: string): Promise<boolean> => {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return true;
    } catch (error) {
      console.error('Native share failed:', error);
      return false;
    }
  }
  return false;
};