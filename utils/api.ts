// Clean Local API - No External Dependencies
import { localAuth } from './local-auth';
import { localPostsAPI } from './local-api';
import { localCommunitiesAPI } from './local-api';
import { localNotificationsAPI } from './local-api';

export interface ApiPost {
  id: string;
  authorId: string;
  author?: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
    verified?: boolean;
  };
  content: string;
  type: 'text' | 'image' | 'video' | 'reel' | 'link';
  mediaUrl?: string;
  videoId?: string;
  thumbnail?: string;
  community?: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  createdAt: string;
  isLiked?: boolean;
  isDeleted?: boolean;
}

export interface ApiCommunity {
  id: string;
  name: string;
  description: string;
  category: string;
  creatorId: string;
  memberCount: number;
  postCount: number;
  createdAt: string;
  isPrivate: boolean;
  isJoined?: boolean;
  role?: 'admin' | 'moderator' | 'member';
}

export interface ApiNotification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'community_join';
  fromUserId?: string;
  fromUser?: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  postId?: string;
  commentId?: string;
  communityId?: string;
  read: boolean;
  createdAt: string;
}

// Local API Client - Uses localStorage instead of external APIs
class LocalApiClient {
  // Auth API
  async login(email: string, password: string): Promise<{ user?: any; error?: string }> {
    return localAuth.signIn(email, password);
  }

  async signup(email: string, password: string, name: string, username: string): Promise<{ user?: any; error?: string }> {
    return localAuth.signUp(email, password, name, username);
  }

  // Feed API
  async getFeed(): Promise<{ posts?: ApiPost[]; error?: string }> {
    return localPostsAPI.getFeed();
  }

  // Posts API
  async createPost(postData: {
    content: string;
    type?: string;
    mediaUrl?: string;
    community?: string;
    videoId?: string;
    thumbnail?: string;
  }): Promise<{ post?: ApiPost; error?: string }> {
    return localPostsAPI.create(postData);
  }

  async likePost(postId: string): Promise<{ liked?: boolean; likes?: number; error?: string }> {
    return localPostsAPI.like(postId);
  }

  // Communities API
  async createCommunity(communityData: {
    name: string;
    description: string;
    category?: string;
    isPrivate?: boolean;
  }): Promise<{ community?: ApiCommunity; error?: string }> {
    return localCommunitiesAPI.create(communityData);
  }

  async getCommunities(): Promise<{ communities?: ApiCommunity[]; error?: string }> {
    return localCommunitiesAPI.getAll();
  }

  async joinCommunity(communityId: string): Promise<{ joined?: boolean; memberCount?: number; error?: string }> {
    return localCommunitiesAPI.join(communityId);
  }

  // Notifications API
  async getNotifications(): Promise<{ notifications?: ApiNotification[]; error?: string }> {
    const currentUser = await localAuth.getCurrentUser();
    if (!currentUser) {
      return { error: 'Not authenticated' };
    }
    return localNotificationsAPI.getAll(currentUser.id);
  }

  // File Upload API (Mock implementation for local use)
  async uploadFile(file: File): Promise<{ url?: string; error?: string }> {
    try {
      // Create a local object URL for the file
      const url = URL.createObjectURL(file);
      return { url };
    } catch (error) {
      return { error: 'Upload failed' };
    }
  }

  // Analytics API (No-op for local version)
  async trackView(postId?: string, type: string = 'post'): Promise<void> {
    // Local analytics tracking - could be enhanced to store in localStorage
    console.log(`Tracking view: ${type}${postId ? ` for post ${postId}` : ''}`);
  }

  // Health check
  async healthCheck(): Promise<{ status?: string; error?: string }> {
    return { status: 'healthy' };
  }
}

// Export singleton instance
export const apiClient = new LocalApiClient();

// Helper functions for easier use
export const AuthAPI = {
  login: (email: string, password: string) => apiClient.login(email, password),
  signup: (email: string, password: string, name: string, username: string) => 
    apiClient.signup(email, password, name, username)
};

export const FeedAPI = {
  get: () => apiClient.getFeed(),
  getHome: () => apiClient.getFeed(),
  getCommunity: (communityId: string) => apiClient.getFeed()
};

export const PostsAPI = {
  create: (data: Parameters<LocalApiClient['createPost']>[0]) => apiClient.createPost(data),
  getFeed: () => apiClient.getFeed(),
  like: (postId: string) => apiClient.likePost(postId),
  trackView: (postId: string) => apiClient.trackView(postId, 'post')
};

export const CommunitiesAPI = {
  create: (data: Parameters<LocalApiClient['createCommunity']>[0]) => apiClient.createCommunity(data),
  getAll: () => apiClient.getCommunities(),
  join: (communityId: string) => apiClient.joinCommunity(communityId)
};

export const NotificationsAPI = {
  getAll: () => apiClient.getNotifications()
};

export const FilesAPI = {
  upload: (file: File) => apiClient.uploadFile(file)
};