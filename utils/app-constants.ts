export const APP_CONSTANTS = {
  TABS: ['feed', 'reels', 'communities', 'notifications', 'profile'],
  
  PERFORMANCE_METRICS_INITIAL: {
    loadTime: 0,
    renderTime: 0,
    errorCount: 0
  },

  KEYBOARD_KEYS: {
    ESCAPE: 'Escape',
    TAB: 'Tab'
  },

  TOAST_MESSAGES: {
    ERROR_GENERIC: 'Something went wrong. Please try again.',
    NO_CONTENT: 'No content to apply',
    LIA_APPLIED: 'LIA suggestions applied to your post!',
    LIA_COPIED: 'LIA content copied to clipboard!',
    LIA_APPLY_FAILED: 'Failed to apply LIA suggestions',
    COPY_FAILED: 'Failed to copy content'
  },

  ANIMATION_CONFIG: {
    INITIAL_FADE: { opacity: 0 },
    ANIMATE_FADE: { opacity: 1 },
    EXIT_FADE: { opacity: 0 },
    WELCOME_INITIAL: { opacity: 0, y: 20 },
    WELCOME_ANIMATE: { opacity: 1, y: 0 },
    WELCOME_EXIT: { opacity: 0, y: -20 },
    ERROR_INITIAL: { opacity: 0, scale: 0.9 },
    ERROR_ANIMATE: { opacity: 1, scale: 1 },
    ERROR_EXIT: { opacity: 0, scale: 0.9 },
    VIDEO_INITIAL: { opacity: 0, scale: 0.9 },
    VIDEO_ANIMATE: { opacity: 1, scale: 1 },
    VIDEO_EXIT: { opacity: 0, scale: 0.9 },
    APP_INITIAL: { opacity: 0 },
    APP_ANIMATE: { opacity: 1 }
  },

  TRANSITIONS: {
    WELCOME: { duration: 0.5 },
    DEFAULT: { duration: 0.3 },
    VIDEO_SPRING: { type: 'spring', stiffness: 300, damping: 30 }
  },

  VIBRATION_PATTERNS: {
    LIGHT: 5,
    MEDIUM: 10,
    SUCCESS: [10, 10, 10],
    SHARE: [5, 5, 5]
  },

  LIA_CONTEXT_DEFAULT: {
    text: "",
    currentTrends: [] as string[],
    timeOfDay: new Date().getHours().toString()
  }
} as const;

export const CSS_CLASSES = {
  MOBILE_OPTIMIZED: "min-h-screen bg-background mobile-optimized",
  LOADING_CONTAINER: "min-h-screen bg-background mobile-optimized",
  ERROR_CONTAINER: "min-h-screen bg-background mobile-optimized"
} as const;

// Export individual constants that hooks are looking for
export const INITIALIZATION_TIMEOUT = 10000; // 10 seconds
export const INITIALIZATION_DELAY = 500; // 0.5 seconds
export const LIA_CONNECTION_TIMEOUT = 5000; // 5 seconds
export const MAX_RETRY_ATTEMPTS = 3;
export const DEFAULT_ERROR_MESSAGE = 'An unexpected error occurred';
export const NETWORK_CHECK_INTERVAL = 5000; // 5 seconds
export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
export const DEBOUNCE_DELAY = 300; // 300ms
export const ANIMATION_DURATION = 300; // 300ms

// Default values for useAppState hook
export const DEFAULT_ACTIVE_TAB = 'feed';
export const DEFAULT_PROFILE_TAB = 'posts';
export const DEFAULT_SETTINGS_TAB = 'account';
export const DEFAULT_ANALYTICS_TIME_RANGE = '7d';

// Default user preferences
export const DEFAULT_USER_PREFERENCES = {
  theme: 'light' as const,
  language: 'en' as const,
  notifications: {
    likes: true,
    comments: true,
    follows: true,
    mentions: true,
    communities: true,
    messages: true
  },
  privacy: {
    profileVisibility: 'public' as const,
    postVisibility: 'public' as const,
    messagePermissions: 'everyone' as const,
    searchability: true,
    onlineStatus: true
  },
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium' as const,
    screenReader: false
  }
} as const;

// App configuration constants
export const APP_CONFIG = {
  NAME: 'Looply',
  VERSION: '3.0.0',
  API_VERSION: 'v1',
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  SUPPORTED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/mov'],
  MAX_POST_LENGTH: 2000,
  MAX_COMMENT_LENGTH: 500,
  PAGINATION_LIMIT: 20,
  DEFAULT_AVATAR: '/default-avatar.png',
  DEFAULT_COVER: '/default-cover.jpg'
} as const;

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_LIA: true,
  ENABLE_VIDEO_UPLOAD: true,
  ENABLE_COMMUNITIES: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_ANALYTICS: true,
  ENABLE_OFFLINE_MODE: true,
  ENABLE_DARK_MODE: false, // Not implemented yet
  ENABLE_GAMIFICATION: true,
  ENABLE_MESSAGING: true,
  ENABLE_STORIES: false, // Future feature
  ENABLE_LIVE_STREAMING: false, // Future feature
  ENABLE_MARKETPLACE: false // Future feature
} as const;

// UI Constants
export const UI_CONSTANTS = {
  HEADER_HEIGHT: 60,
  BOTTOM_NAV_HEIGHT: 80,
  SIDEBAR_WIDTH: 280,
  MAX_CONTENT_WIDTH: 640,
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  DESKTOP_BREAKPOINT: 1280,
  SAFE_AREA_PADDING: 16,
  CARD_BORDER_RADIUS: 12,
  BUTTON_BORDER_RADIUS: 8
} as const;

// Storage keys
export const STORAGE_KEYS = {
  USER_DATA: 'looply_user',
  POSTS_DATA: 'looply_posts',
  COMMUNITIES_DATA: 'looply_communities',
  SETTINGS: 'looply_settings',
  NOTIFICATIONS: 'looply_notifications',
  ANALYTICS: 'looply_analytics',
  THEME: 'looply_theme',
  AUTH_TOKEN: 'looply_auth_token',
  LAST_SYNC: 'looply_last_sync',
  DRAFT_POSTS: 'looply_draft_posts',
  SEARCH_HISTORY: 'looply_search_history',
  VIEW_HISTORY: 'looply_view_history'
} as const;

// Error types
export const ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  CLIENT_ERROR: 'CLIENT_ERROR',
  LIA_ERROR: 'LIA_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  QUOTA_ERROR: 'QUOTA_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR'
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  POST_CREATED: 'Post created successfully!',
  POST_UPDATED: 'Post updated successfully!',
  POST_DELETED: 'Post deleted successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  EMAIL_VERIFIED: 'Email verified successfully!',
  NOTIFICATION_MARKED_READ: 'Notification marked as read',
  DATA_EXPORTED: 'Data exported successfully!',
  ACCOUNT_DELETED: 'Account deleted successfully!',
  COMMUNITY_JOINED: 'Successfully joined community!',
  COMMUNITY_LEFT: 'Successfully left community!',
  MESSAGE_SENT: 'Message sent successfully!',
  REPORT_SUBMITTED: 'Report submitted successfully!'
} as const;

// Error messages
export const ERROR_MESSAGES = {
  GENERIC_ERROR: 'Something went wrong. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTH_REQUIRED: 'You must be logged in to perform this action.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  VALIDATION_FAILED: 'Please check your input and try again.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  UNSUPPORTED_FILE_TYPE: 'This file type is not supported.',
  QUOTA_EXCEEDED: 'You have exceeded your quota limit.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  CONTENT_NOT_FOUND: 'The requested content was not found.',
  COMMUNITY_FULL: 'This community has reached its member limit.',
  ALREADY_REPORTED: 'You have already reported this content.',
  ACCOUNT_SUSPENDED: 'Your account has been suspended.'
} as const;

// API endpoints (for future backend integration)
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY_EMAIL: '/auth/verify-email',
    RESET_PASSWORD: '/auth/reset-password'
  },
  POSTS: {
    GET_FEED: '/posts/feed',
    CREATE: '/posts',
    GET_BY_ID: '/posts/:id',
    UPDATE: '/posts/:id',
    DELETE: '/posts/:id',
    LIKE: '/posts/:id/like',
    COMMENT: '/posts/:id/comments',
    SHARE: '/posts/:id/share'
  },
  USERS: {
    GET_PROFILE: '/users/:id',
    UPDATE_PROFILE: '/users/:id',
    GET_FOLLOWERS: '/users/:id/followers',
    GET_FOLLOWING: '/users/:id/following',
    FOLLOW: '/users/:id/follow',
    UNFOLLOW: '/users/:id/unfollow',
    SEARCH: '/users/search'
  },
  COMMUNITIES: {
    GET_ALL: '/communities',
    CREATE: '/communities',
    GET_BY_ID: '/communities/:id',
    JOIN: '/communities/:id/join',
    LEAVE: '/communities/:id/leave',
    GET_POSTS: '/communities/:id/posts'
  },
  MEDIA: {
    UPLOAD_IMAGE: '/media/images',
    UPLOAD_VIDEO: '/media/videos',
    GET_BY_ID: '/media/:id',
    DELETE: '/media/:id'
  },
  NOTIFICATIONS: {
    GET_ALL: '/notifications',
    MARK_READ: '/notifications/:id/read',
    MARK_ALL_READ: '/notifications/read-all',
    GET_UNREAD_COUNT: '/notifications/unread-count'
  },
  LIA: {
    ANALYZE: '/lia/analyze',
    ENHANCE: '/lia/enhance',
    SUGGEST: '/lia/suggest',
    GENERATE_CAPTION: '/lia/caption'
  }
} as const;

// Validation rules
export const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    PATTERN: /^[a-zA-Z0-9_]+$/,
    RESERVED_NAMES: ['admin', 'root', 'system', 'looply', 'support', 'help']
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: false
  },
  POST_CONTENT: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 2000
  },
  COMMENT: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 500
  },
  BIO: {
    MAX_LENGTH: 300
  },
  COMMUNITY_NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50
  },
  COMMUNITY_DESCRIPTION: {
    MAX_LENGTH: 500
  }
} as const;

// Theme constants
export const THEME_CONSTANTS = {
  COLORS: {
    PRIMARY: '#7c3aed',
    SECONDARY: '#ec4899',
    SUCCESS: '#10b981',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',
    INFO: '#3b82f6'
  },
  GRADIENTS: {
    PRIMARY: 'linear-gradient(135deg, #7c3aed, #ec4899)',
    SECONDARY: 'linear-gradient(135deg, #ec4899, #f59e0b)',
    SUCCESS: 'linear-gradient(135deg, #10b981, #059669)',
    BRAND: 'linear-gradient(135deg, #7c3aed, #ec4899, #f59e0b)'
  },
  ANIMATIONS: {
    FAST: '150ms',
    NORMAL: '300ms',
    SLOW: '500ms',
    EASING: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
} as const;

// Social media sharing
export const SOCIAL_SHARING = {
  PLATFORMS: {
    TWITTER: 'twitter',
    FACEBOOK: 'facebook',
    INSTAGRAM: 'instagram',
    LINKEDIN: 'linkedin',
    WHATSAPP: 'whatsapp',
    TELEGRAM: 'telegram'
  },
  TEMPLATES: {
    POST_SHARE: 'Check out this post from {author} on Looply: {content}',
    PROFILE_SHARE: 'Check out {username}\'s profile on Looply!',
    COMMUNITY_SHARE: 'Join the {community} community on Looply!'
  }
} as const;

// Export all constants for easy importing
export const LOOPLY_CONSTANTS = {
  APP_CONSTANTS,
  CSS_CLASSES,
  APP_CONFIG,
  FEATURE_FLAGS,
  UI_CONSTANTS,
  STORAGE_KEYS,
  ERROR_TYPES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  API_ENDPOINTS,
  VALIDATION_RULES,
  THEME_CONSTANTS,
  SOCIAL_SHARING
} as const;