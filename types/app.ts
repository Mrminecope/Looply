export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  bio?: string;
  avatar: string;
  followers: number;
  following: number;
  verified: boolean;
  joinedAt: string;
  badges?: string[];
  stats?: {
    posts: number;
    likes: number;
    comments: number;
    shares: number;
  };
  communities?: string[];
  location?: string;
  links?: string[];
  isAdmin?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  likes: number;
  replies: Comment[];
}

export interface Post {
  id: string;
  author: User;
  content: string;
  image?: string;
  video?: string;
  thumbnail?: string;
  linkPreview?: any;
  type: 'text' | 'image' | 'video' | 'reel' | 'link';
  community?: string;
  likes: number;
  comments: Comment[];
  shares: number;
  views?: number;
  createdAt: string;
  hashtags?: string[];
  mentions?: string[];
  location?: string;
  reactions?: Record<string, number>;
  isLiked?: boolean;
  isSaved?: boolean;
  // Additional properties for video player
  timestamp?: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  image?: string;
  members: number;
  posts: number;
  isJoined: boolean;
  category: string;
  tags?: string[];
  isPrivate: boolean;
  moderators?: string[];
  rules?: string[];
  stats?: {
    activeMembers: number;
    dailyPosts: number;
    weeklyGrowth: number;
  };
  role?: 'admin' | 'moderator' | 'member';
  createdAt?: string;
  // Legacy compatibility
  memberCount?: number;
  postCount?: number;
  coverImage?: string;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'community' | 'system';
  message: string;
  fromUser?: User;
  postId?: string;
  createdAt: string;
  read: boolean;
  actionUrl?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  read: boolean;
  type: 'text' | 'image' | 'file';
  reactions?: string[];
}

export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  showAuthModal: boolean;
  activeTab: string;
  posts: Post[];
  communities: Community[];
  showCreateModal: boolean;
  profileTab: string;
  settingsTab: string;
  analyticsTimeRange: '7d' | '30d' | '90d';
  loading: boolean;
  error: string | null;
  isOnline: boolean;
}