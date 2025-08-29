// Backend Service for Looply
// Abstract layer for API calls, ready for backend integration

import type { User, Post, Community, Notification, Message } from '../types/app';

export interface BackendConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
  retryAttempts?: number;
  enableCache?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

class BackendService {
  private config: BackendConfig;
  private authTokens: AuthTokens | null = null;
  private requestQueue: Map<string, Promise<any>> = new Map();

  constructor(config: BackendConfig) {
    this.config = {
      timeout: 10000,
      retryAttempts: 3,
      enableCache: true,
      ...config
    };
    
    // Load stored auth tokens
    this.loadAuthTokens();
  }

  // ===========================================
  // AUTHENTICATION METHODS
  // ===========================================

  async login(email: string, password: string): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    try {
      const response = await this.makeRequest('/auth/login', {
        method: 'POST',
        body: { email, password }
      });

      if (response.success && response.data) {
        this.authTokens = response.data.tokens;
        this.saveAuthTokens();
      }

      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
    username: string;
  }): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    try {
      const response = await this.makeRequest('/auth/register', {
        method: 'POST',
        body: userData
      });

      if (response.success && response.data) {
        this.authTokens = response.data.tokens;
        this.saveAuthTokens();
      }

      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async logout(): Promise<ApiResponse> {
    try {
      if (this.authTokens) {
        await this.makeRequest('/auth/logout', {
          method: 'POST',
          body: { refreshToken: this.authTokens.refreshToken }
        });
      }

      this.clearAuthTokens();
      return { success: true };
    } catch (error) {
      this.clearAuthTokens();
      return this.handleError(error);
    }
  }

  async refreshToken(): Promise<boolean> {
    if (!this.authTokens?.refreshToken) {
      return false;
    }

    try {
      const response = await this.makeRequest('/auth/refresh', {
        method: 'POST',
        body: { refreshToken: this.authTokens.refreshToken },
        skipAuth: true
      });

      if (response.success && response.data) {
        this.authTokens = response.data.tokens;
        this.saveAuthTokens();
        return true;
      }

      this.clearAuthTokens();
      return false;
    } catch (error) {
      this.clearAuthTokens();
      return false;
    }
  }

  // ===========================================
  // USER METHODS
  // ===========================================

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.makeRequest('/users/me');
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<ApiResponse<User>> {
    return this.makeRequest(`/users/${userId}`, {
      method: 'PATCH',
      body: updates
    });
  }

  async getUserById(userId: string): Promise<ApiResponse<User>> {
    return this.makeRequest(`/users/${userId}`);
  }

  async followUser(userId: string): Promise<ApiResponse> {
    return this.makeRequest(`/users/${userId}/follow`, {
      method: 'POST'
    });
  }

  async unfollowUser(userId: string): Promise<ApiResponse> {
    return this.makeRequest(`/users/${userId}/unfollow`, {
      method: 'DELETE'
    });
  }

  async getFollowers(userId: string, page = 1, limit = 20): Promise<ApiResponse<User[]>> {
    return this.makeRequest(`/users/${userId}/followers?page=${page}&limit=${limit}`);
  }

  async getFollowing(userId: string, page = 1, limit = 20): Promise<ApiResponse<User[]>> {
    return this.makeRequest(`/users/${userId}/following?page=${page}&limit=${limit}`);
  }

  // ===========================================
  // POST METHODS
  // ===========================================

  async getPosts(page = 1, limit = 20): Promise<ApiResponse<Post[]>> {
    return this.makeRequest(`/posts?page=${page}&limit=${limit}`);
  }

  async getPost(postId: string): Promise<ApiResponse<Post>> {
    return this.makeRequest(`/posts/${postId}`);
  }

  async createPost(postData: Omit<Post, 'id' | 'createdAt'>): Promise<ApiResponse<Post>> {
    return this.makeRequest('/posts', {
      method: 'POST',
      body: postData
    });
  }

  async updatePost(postId: string, updates: Partial<Post>): Promise<ApiResponse<Post>> {
    return this.makeRequest(`/posts/${postId}`, {
      method: 'PATCH',
      body: updates
    });
  }

  async deletePost(postId: string): Promise<ApiResponse> {
    return this.makeRequest(`/posts/${postId}`, {
      method: 'DELETE'
    });
  }

  async likePost(postId: string): Promise<ApiResponse> {
    return this.makeRequest(`/posts/${postId}/like`, {
      method: 'POST'
    });
  }

  async unlikePost(postId: string): Promise<ApiResponse> {
    return this.makeRequest(`/posts/${postId}/like`, {
      method: 'DELETE'
    });
  }

  async commentOnPost(postId: string, content: string): Promise<ApiResponse> {
    return this.makeRequest(`/posts/${postId}/comments`, {
      method: 'POST',
      body: { content }
    });
  }

  async sharePost(postId: string): Promise<ApiResponse> {
    return this.makeRequest(`/posts/${postId}/share`, {
      method: 'POST'
    });
  }

  async getFeedPosts(algorithm = 'for-you', page = 1, limit = 20): Promise<ApiResponse<Post[]>> {
    return this.makeRequest(`/feed/${algorithm}?page=${page}&limit=${limit}`);
  }

  // ===========================================
  // COMMUNITY METHODS
  // ===========================================

  async getCommunities(page = 1, limit = 20): Promise<ApiResponse<Community[]>> {
    return this.makeRequest(`/communities?page=${page}&limit=${limit}`);
  }

  async getCommunity(communityId: string): Promise<ApiResponse<Community>> {
    return this.makeRequest(`/communities/${communityId}`);
  }

  async createCommunity(communityData: Omit<Community, 'id' | 'createdAt'>): Promise<ApiResponse<Community>> {
    return this.makeRequest('/communities', {
      method: 'POST',
      body: communityData
    });
  }

  async joinCommunity(communityId: string): Promise<ApiResponse> {
    return this.makeRequest(`/communities/${communityId}/join`, {
      method: 'POST'
    });
  }

  async leaveCommunity(communityId: string): Promise<ApiResponse> {
    return this.makeRequest(`/communities/${communityId}/leave`, {
      method: 'DELETE'
    });
  }

  // ===========================================
  // NOTIFICATION METHODS
  // ===========================================

  async getNotifications(page = 1, limit = 20): Promise<ApiResponse<Notification[]>> {
    return this.makeRequest(`/notifications?page=${page}&limit=${limit}`);
  }

  async markNotificationRead(notificationId: string): Promise<ApiResponse> {
    return this.makeRequest(`/notifications/${notificationId}/read`, {
      method: 'PATCH'
    });
  }

  async markAllNotificationsRead(): Promise<ApiResponse> {
    return this.makeRequest('/notifications/read-all', {
      method: 'PATCH'
    });
  }

  // ===========================================
  // MESSAGE METHODS
  // ===========================================

  async getMessages(chatId: string, page = 1, limit = 50): Promise<ApiResponse<Message[]>> {
    return this.makeRequest(`/messages/${chatId}?page=${page}&limit=${limit}`);
  }

  async sendMessage(chatId: string, content: string, attachments?: File[]): Promise<ApiResponse<Message>> {
    const formData = new FormData();
    formData.append('content', content);
    
    if (attachments) {
      attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });
    }

    return this.makeRequest(`/messages/${chatId}`, {
      method: 'POST',
      body: formData,
      isFormData: true
    });
  }

  async getChats(page = 1, limit = 20): Promise<ApiResponse<any[]>> {
    return this.makeRequest(`/chats?page=${page}&limit=${limit}`);
  }

  // ===========================================
  // MEDIA UPLOAD METHODS
  // ===========================================

  async uploadMedia(file: File, type: 'image' | 'video'): Promise<ApiResponse<{ url: string; metadata: any }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.makeRequest('/media/upload', {
      method: 'POST',
      body: formData,
      isFormData: true,
      timeout: 60000 // 60 seconds for media uploads
    });
  }

  async deleteMedia(mediaUrl: string): Promise<ApiResponse> {
    return this.makeRequest('/media/delete', {
      method: 'DELETE',
      body: { url: mediaUrl }
    });
  }

  // ===========================================
  // SEARCH METHODS
  // ===========================================

  async search(query: string, type = 'all', page = 1, limit = 20): Promise<ApiResponse<any>> {
    return this.makeRequest(`/search?q=${encodeURIComponent(query)}&type=${type}&page=${page}&limit=${limit}`);
  }

  // ===========================================
  // ANALYTICS METHODS
  // ===========================================

  async trackEvent(event: string, data: any): Promise<ApiResponse> {
    return this.makeRequest('/analytics/track', {
      method: 'POST',
      body: { event, data, timestamp: Date.now() }
    });
  }

  async getAnalytics(timeRange = '7d'): Promise<ApiResponse<any>> {
    return this.makeRequest(`/analytics?range=${timeRange}`);
  }

  // ===========================================
  // PUSH NOTIFICATION METHODS
  // ===========================================

  async subscribeToPush(subscription: PushSubscription): Promise<ApiResponse> {
    return this.makeRequest('/push/subscribe', {
      method: 'POST',
      body: { subscription: subscription.toJSON() }
    });
  }

  async unsubscribeFromPush(endpoint: string): Promise<ApiResponse> {
    return this.makeRequest('/push/unsubscribe', {
      method: 'DELETE',
      body: { endpoint }
    });
  }

  // ===========================================
  // CORE REQUEST METHODS
  // ===========================================

  private async makeRequest(
    endpoint: string, 
    options: {
      method?: string;
      body?: any;
      headers?: Record<string, string>;
      skipAuth?: boolean;
      isFormData?: boolean;
      timeout?: number;
    } = {}
  ): Promise<ApiResponse> {
    const {
      method = 'GET',
      body,
      headers = {},
      skipAuth = false,
      isFormData = false,
      timeout = this.config.timeout
    } = options;

    // Create cache key for GET requests
    const cacheKey = method === 'GET' ? `${endpoint}` : null;
    
    // Check cache for GET requests
    if (cacheKey && this.config.enableCache && this.requestQueue.has(cacheKey)) {
      return this.requestQueue.get(cacheKey)!;
    }

    const requestPromise = this.executeRequest(endpoint, {
      method,
      body,
      headers,
      skipAuth,
      isFormData,
      timeout
    });

    // Cache GET requests
    if (cacheKey && this.config.enableCache) {
      this.requestQueue.set(cacheKey, requestPromise);
      
      // Clear cache after request completes
      requestPromise.finally(() => {
        setTimeout(() => {
          this.requestQueue.delete(cacheKey);
        }, 5000); // Cache for 5 seconds
      });
    }

    return requestPromise;
  }

  private async executeRequest(
    endpoint: string,
    options: {
      method: string;
      body?: any;
      headers: Record<string, string>;
      skipAuth: boolean;
      isFormData: boolean;
      timeout?: number;
    }
  ): Promise<ApiResponse> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const { method, body, headers, skipAuth, isFormData, timeout } = options;

    // Prepare headers
    const requestHeaders: Record<string, string> = {
      ...headers
    };

    // Add auth header if needed
    if (!skipAuth && this.authTokens?.accessToken) {
      // Check if token is expired
      if (Date.now() >= this.authTokens.expiresAt) {
        const refreshed = await this.refreshToken();
        if (!refreshed) {
          return {
            success: false,
            error: 'Authentication required'
          };
        }
      }
      
      requestHeaders['Authorization'] = `Bearer ${this.authTokens.accessToken}`;
    }

    // Add API key if configured
    if (this.config.apiKey) {
      requestHeaders['X-API-Key'] = this.config.apiKey;
    }

    // Prepare body
    let requestBody: any;
    if (body) {
      if (isFormData) {
        requestBody = body; // FormData object
      } else {
        requestHeaders['Content-Type'] = 'application/json';
        requestBody = JSON.stringify(body);
      }
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: requestBody,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle different response statuses
      if (response.status === 401 && !skipAuth) {
        // Try to refresh token
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry request with new token
          return this.executeRequest(endpoint, options);
        } else {
          return {
            success: false,
            error: 'Authentication required'
          };
        }
      }

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
          message: data.message
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
        pagination: data.pagination
      };

    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timeout'
        };
      }

      return this.handleError(error);
    }
  }

  private handleError(error: any): ApiResponse {
    console.error('Backend service error:', error);
    
    if (error.name === 'NetworkError' || !navigator.onLine) {
      return {
        success: false,
        error: 'Network unavailable'
      };
    }

    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }

  // ===========================================
  // AUTH TOKEN MANAGEMENT
  // ===========================================

  private loadAuthTokens(): void {
    try {
      const stored = localStorage.getItem('looply_auth_tokens');
      if (stored) {
        this.authTokens = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load auth tokens:', error);
    }
  }

  private saveAuthTokens(): void {
    try {
      if (this.authTokens) {
        localStorage.setItem('looply_auth_tokens', JSON.stringify(this.authTokens));
      }
    } catch (error) {
      console.error('Failed to save auth tokens:', error);
    }
  }

  private clearAuthTokens(): void {
    this.authTokens = null;
    try {
      localStorage.removeItem('looply_auth_tokens');
    } catch (error) {
      console.error('Failed to clear auth tokens:', error);
    }
  }

  // ===========================================
  // UTILITY METHODS
  // ===========================================

  isAuthenticated(): boolean {
    return !!this.authTokens?.accessToken && Date.now() < this.authTokens.expiresAt;
  }

  getAuthToken(): string | null {
    return this.authTokens?.accessToken || null;
  }

  updateConfig(newConfig: Partial<BackendConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  clearCache(): void {
    this.requestQueue.clear();
  }
}

// Create service instance (will be configured when backend is ready)
export const backendService = new BackendService({
  baseUrl: process.env.REACT_APP_API_URL || 'https://api.looply.app',
  apiKey: process.env.REACT_APP_API_KEY,
  timeout: 10000,
  retryAttempts: 3,
  enableCache: true
});

// Export types
export type { BackendConfig, ApiResponse, AuthTokens };