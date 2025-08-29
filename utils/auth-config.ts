// Local Authentication Configuration
export const AUTH_CONFIG = {
  // Session duration in milliseconds (7 days)
  SESSION_DURATION: 7 * 24 * 60 * 60 * 1000,
  
  // Storage keys for local storage
  STORAGE_KEYS: {
    USER: 'social-app-user',
    SESSION: 'social-app-session',
    USERS: 'social-app-users',
    POSTS: 'social-app-posts',
    COMMUNITIES: 'social-app-communities',
    NOTIFICATIONS: 'social-app-notifications',
    ANALYTICS: 'social-app-analytics',
    MODERATION: 'social-app-moderation'
  },
  
  // Validation rules
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 6,
    MAX_USERNAME_LENGTH: 20,
    MAX_NAME_LENGTH: 50,
    MAX_BIO_LENGTH: 160,
    USERNAME_PATTERN: /^[a-zA-Z0-9_]+$/,
    EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  
  // Default user settings
  DEFAULTS: {
    AVATAR_SEED: 'user',
    BIO: 'Welcome to my social profile!',
    LOCATION: 'San Francisco, CA',
    LINKS: ['https://example.com'],
    FOLLOWER_COUNT: 42,
    FOLLOWING_COUNT: 128,
    POST_COUNT: 15,
    VERIFIED: false
  }
};

// Generate default avatar URL
export function generateAvatarUrl(username: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
}

// Generate unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Check if session is valid
export function isValidSession(timestamp: number): boolean {
  return Date.now() - timestamp < AUTH_CONFIG.SESSION_DURATION;
}