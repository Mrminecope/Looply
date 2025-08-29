import type { User, Post, Community, Notification, Message } from '../types/app';
import { richDemoData } from '../data/richDemoData';

// Local storage keys
const STORAGE_KEYS = {
  USER: 'looply_current_user',
  USERS: 'looply_users',
  POSTS: 'looply_posts',
  COMMUNITIES: 'looply_communities',
  NOTIFICATIONS: 'looply_notifications',
  MESSAGES: 'looply_messages',
  USER_INTERACTIONS: 'looply_user_interactions',
  APP_SETTINGS: 'looply_app_settings',
  ANALYTICS: 'looply_analytics',
  PERFORMANCE: 'looply_performance'
};

// Performance tracking
interface PerformanceMetrics {
  loadTime: number;
  lastActivity: number;
  sessionDuration: number;
  interactions: number;
}

class LocalStorageService {
  private performanceStart = performance.now();
  private sessionStart = Date.now();

  constructor() {
    this.initializeData();
    this.trackPerformance();
  }

  // Initialize data if not exists
  private initializeData() {
    try {
      // Initialize users
      if (!this.getItem(STORAGE_KEYS.USERS)) {
        this.setItem(STORAGE_KEYS.USERS, richDemoData.users);
      }

      // Initialize posts
      if (!this.getItem(STORAGE_KEYS.POSTS)) {
        this.setItem(STORAGE_KEYS.POSTS, richDemoData.posts);
      }

      // Initialize communities
      if (!this.getItem(STORAGE_KEYS.COMMUNITIES)) {
        this.setItem(STORAGE_KEYS.COMMUNITIES, richDemoData.communities);
      }

      // Initialize notifications
      if (!this.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
        this.setItem(STORAGE_KEYS.NOTIFICATIONS, richDemoData.notifications);
      }

      // Initialize messages
      if (!this.getItem(STORAGE_KEYS.MESSAGES)) {
        this.setItem(STORAGE_KEYS.MESSAGES, richDemoData.messages);
      }

      // Initialize performance metrics
      if (!this.getItem(STORAGE_KEYS.PERFORMANCE)) {
        this.setItem(STORAGE_KEYS.PERFORMANCE, {
          loadTime: 0,
          lastActivity: Date.now(),
          sessionDuration: 0,
          interactions: 0
        });
      }

      console.log('✅ Local storage initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize local storage:', error);
    }
  }

  // Generic storage methods with timeout protection
  private setItem(key: string, value: any): void {
    try {
      // Add timeout protection for storage operations
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Storage operation timeout')), 5000);
      });

      const storagePromise = new Promise<void>((resolve) => {
        localStorage.setItem(key, JSON.stringify(value));
        resolve();
      });

      // Use immediate execution for synchronous operations
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error);
      // Don't throw to prevent app crashes
    }
  }

  private getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Failed to load ${key} from localStorage:`, error);
      return null;
    }
  }

  // User management
  async getCurrentUser(): Promise<User | null> {
    return this.getItem<User>(STORAGE_KEYS.USER);
  }

  async setCurrentUser(user: User): Promise<void> {
    this.setItem(STORAGE_KEYS.USER, user);
    this.trackInteraction('user_login');
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const users = this.getItem<User[]>(STORAGE_KEYS.USERS) || [];
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) return null;

    const updatedUser = { ...users[userIndex], ...updates };
    users[userIndex] = updatedUser;
    
    this.setItem(STORAGE_KEYS.USERS, users);
    
    // Update current user if it's the same
    const currentUser = await this.getCurrentUser();
    if (currentUser?.id === userId) {
      this.setItem(STORAGE_KEYS.USER, updatedUser);
    }

    return updatedUser;
  }

  async getUserById(userId: string): Promise<User | null> {
    const users = this.getItem<User[]>(STORAGE_KEYS.USERS) || [];
    return users.find(u => u.id === userId) || null;
  }

  // Post management
  async getPosts(): Promise<Post[]> {
    return this.getItem<Post[]>(STORAGE_KEYS.POSTS) || [];
  }

  async createPost(postData: Omit<Post, 'id' | 'createdAt'>): Promise<Post> {
    const posts = await this.getPosts();
    const newPost: Post = {
      ...postData,
      id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };

    posts.unshift(newPost);
    this.setItem(STORAGE_KEYS.POSTS, posts);
    this.trackInteraction('post_created');

    return newPost;
  }

  async updatePost(postId: string, updates: Partial<Post>): Promise<Post | null> {
    const posts = await this.getPosts();
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex === -1) return null;

    const updatedPost = { ...posts[postIndex], ...updates };
    posts[postIndex] = updatedPost;
    
    this.setItem(STORAGE_KEYS.POSTS, posts);
    return updatedPost;
  }

  async deletePost(postId: string): Promise<boolean> {
    const posts = await this.getPosts();
    const filteredPosts = posts.filter(p => p.id !== postId);
    
    if (filteredPosts.length === posts.length) return false;

    this.setItem(STORAGE_KEYS.POSTS, filteredPosts);
    this.trackInteraction('post_deleted');
    return true;
  }

  async likePost(postId: string, userId: string): Promise<boolean> {
    const post = await this.getPostById(postId);
    if (!post) return false;

    post.likes = (post.likes || 0) + 1;
    
    // Track user interaction
    const interactions = this.getItem('user_post_interactions') || {};
    if (!interactions[userId]) interactions[userId] = {};
    interactions[userId][postId] = { liked: true, timestamp: Date.now() };
    this.setItem('user_post_interactions', interactions);

    await this.updatePost(postId, { likes: post.likes });
    this.trackInteraction('post_liked');
    return true;
  }

  async commentOnPost(postId: string, comment: any): Promise<boolean> {
    const post = await this.getPostById(postId);
    if (!post) return false;

    const newComment = {
      ...comment,
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      likes: 0,
      replies: []
    };

    post.comments = [...(post.comments || []), newComment];
    await this.updatePost(postId, { comments: post.comments });
    this.trackInteraction('comment_added');
    return true;
  }

  async sharePost(postId: string): Promise<boolean> {
    const post = await this.getPostById(postId);
    if (!post) return false;

    post.shares = (post.shares || 0) + 1;
    await this.updatePost(postId, { shares: post.shares });
    this.trackInteraction('post_shared');
    return true;
  }

  private async getPostById(postId: string): Promise<Post | null> {
    const posts = await this.getPosts();
    return posts.find(p => p.id === postId) || null;
  }

  // Community management
  async getCommunities(): Promise<Community[]> {
    return this.getItem<Community[]>(STORAGE_KEYS.COMMUNITIES) || [];
  }

  async joinCommunity(communityId: string, userId: string): Promise<boolean> {
    const communities = await this.getCommunities();
    const community = communities.find(c => c.id === communityId);
    
    if (!community) return false;

    community.isJoined = true;
    community.members = (community.members || 0) + 1;
    
    this.setItem(STORAGE_KEYS.COMMUNITIES, communities);
    this.trackInteraction('community_joined');
    return true;
  }

  async leaveCommunity(communityId: string, userId: string): Promise<boolean> {
    const communities = await this.getCommunities();
    const community = communities.find(c => c.id === communityId);
    
    if (!community) return false;

    community.isJoined = false;
    community.members = Math.max((community.members || 1) - 1, 0);
    
    this.setItem(STORAGE_KEYS.COMMUNITIES, communities);
    this.trackInteraction('community_left');
    return true;
  }

  // Notification management
  async getNotifications(userId: string): Promise<Notification[]> {
    const notifications = this.getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS) || [];
    return notifications.filter(n => !n.fromUser || n.fromUser.id !== userId);
  }

  async markNotificationRead(notificationId: string): Promise<boolean> {
    const notifications = this.getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS) || [];
    const notification = notifications.find(n => n.id === notificationId);
    
    if (!notification) return false;

    notification.read = true;
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
    return true;
  }

  async markAllNotificationsRead(userId: string): Promise<boolean> {
    const notifications = this.getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS) || [];
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, updatedNotifications);
    return true;
  }

  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const notifications = this.getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS) || [];
    const newNotification: Notification = {
      ...notification,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };

    notifications.unshift(newNotification);
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
    return newNotification;
  }

  // Message management
  async getMessages(userId: string): Promise<Message[]> {
    const messages = this.getItem<Message[]>(STORAGE_KEYS.MESSAGES) || [];
    return messages.filter(m => m.senderId === userId || m.receiverId === userId);
  }

  async sendMessage(messageData: Omit<Message, 'id' | 'createdAt'>): Promise<Message> {
    const messages = this.getItem<Message[]>(STORAGE_KEYS.MESSAGES) || [];
    const newMessage: Message = {
      ...messageData,
      id: `message_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };

    messages.unshift(newMessage);
    this.setItem(STORAGE_KEYS.MESSAGES, messages);
    this.trackInteraction('message_sent');
    return newMessage;
  }

  // Analytics and performance
  private trackInteraction(action: string) {
    const performance = this.getItem<PerformanceMetrics>(STORAGE_KEYS.PERFORMANCE) || {
      loadTime: 0,
      lastActivity: Date.now(),
      sessionDuration: 0,
      interactions: 0
    };

    performance.lastActivity = Date.now();
    performance.interactions++;
    performance.sessionDuration = Date.now() - this.sessionStart;

    this.setItem(STORAGE_KEYS.PERFORMANCE, performance);

    // Track analytics
    const analytics = this.getItem(STORAGE_KEYS.ANALYTICS) || {};
    if (!analytics[action]) analytics[action] = 0;
    analytics[action]++;
    this.setItem(STORAGE_KEYS.ANALYTICS, analytics);
  }

  private trackPerformance() {
    const loadTime = performance.now() - this.performanceStart;
    
    const performanceData = this.getItem<PerformanceMetrics>(STORAGE_KEYS.PERFORMANCE) || {
      loadTime: 0,
      lastActivity: Date.now(),
      sessionDuration: 0,
      interactions: 0
    };

    performanceData.loadTime = loadTime;
    this.setItem(STORAGE_KEYS.PERFORMANCE, performanceData);

    console.log(`📊 Looply loaded in ${loadTime.toFixed(2)}ms`);
  }

  async getAnalytics(): Promise<any> {
    const analytics = this.getItem(STORAGE_KEYS.ANALYTICS) || {};
    const performance = this.getItem<PerformanceMetrics>(STORAGE_KEYS.PERFORMANCE) || {};
    
    return {
      totalInteractions: Object.values(analytics).reduce((sum: number, count: any) => sum + count, 0),
      actionBreakdown: analytics,
      performance,
      dataSize: this.calculateStorageSize()
    };
  }

  private calculateStorageSize(): number {
    let totalSize = 0;
    try {
      for (const key in localStorage) {
        if (key.startsWith('looply_')) {
          totalSize += localStorage[key].length;
        }
      }
    } catch (error) {
      console.warn('Failed to calculate storage size:', error);
    }
    return totalSize;
  }

  // Method aliases for compatibility with previous API usage
  async getAllPosts(): Promise<Post[]> {
    return this.getPosts();
  }

  async savePosts(posts: Post[]): Promise<void> {
    this.setItem(STORAGE_KEYS.POSTS, posts);
  }

  async getAllCommunities(): Promise<Community[]> {
    return this.getCommunities();
  }

  async saveCommunities(communities: Community[]): Promise<void> {
    this.setItem(STORAGE_KEYS.COMMUNITIES, communities);
  }

  async savePost(post: Post): Promise<void> {
    const posts = await this.getPosts();
    const existingIndex = posts.findIndex(p => p.id === post.id);
    
    if (existingIndex >= 0) {
      posts[existingIndex] = post;
    } else {
      posts.unshift(post);
    }
    
    this.setItem(STORAGE_KEYS.POSTS, posts);
    this.trackInteraction('post_saved');
  }

  async saveUser(user: User): Promise<void> {
    this.setItem(STORAGE_KEYS.USER, user);
    
    // Also update user in users array
    const users = this.getItem<User[]>(STORAGE_KEYS.USERS) || [];
    const existingIndex = users.findIndex(u => u.id === user.id);
    
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    
    this.setItem(STORAGE_KEYS.USERS, users);
  }

  async logout(): Promise<void> {
    this.setItem(STORAGE_KEYS.USER, null);
    this.trackInteraction('user_logout');
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('🗑️ All Looply data cleared');
  }

  async exportData(): Promise<any> {
    const data: any = {};
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      data[name] = this.getItem(key);
    });
    return data;
  }

  async importData(data: any): Promise<void> {
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      if (data[name]) {
        this.setItem(key, data[name]);
      }
    });
    console.log('📥 Data imported successfully');
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const testKey = 'looply_health_check';
      const testValue = { timestamp: Date.now() };
      
      this.setItem(testKey, testValue);
      const retrieved = this.getItem(testKey);
      localStorage.removeItem(testKey);
      
      return retrieved !== null && retrieved.timestamp === testValue.timestamp;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

// Create singleton instance
export const localStorageService = new LocalStorageService();

// Export types for use in other files
export type { PerformanceMetrics };