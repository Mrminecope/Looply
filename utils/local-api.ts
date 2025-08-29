import { localAuth, type LocalUser } from './local-auth';

export interface LocalPost {
  id: string;
  authorId: string;
  author?: LocalUser;
  content: string;
  type: 'text' | 'image' | 'video' | 'reel' | 'link';
  mediaUrl?: string;
  thumbnail?: string;
  community?: string;
  likes: number;
  comments: number;
  shares: number;
  views?: number;
  createdAt: string;
  updatedAt: string;
  isLiked?: boolean;
}

export interface LocalCommunity {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  postCount: number;
  isPrivate: boolean;
  createdAt: string;
  creatorId: string;
  isJoined?: boolean;
  role?: 'admin' | 'moderator' | 'member';
}

export interface LocalNotification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'community' | 'mention';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: any;
}

class LocalPostsAPI {
  private readonly POSTS_KEY = 'social_app_posts';
  private readonly LIKES_KEY = 'social_app_likes';

  private getPosts(): LocalPost[] {
    const postsJson = localStorage.getItem(this.POSTS_KEY);
    return postsJson ? JSON.parse(postsJson) : this.getInitialPosts();
  }

  private savePosts(posts: LocalPost[]): void {
    localStorage.setItem(this.POSTS_KEY, JSON.stringify(posts));
  }

  private getLikes(): Record<string, string[]> {
    const likesJson = localStorage.getItem(this.LIKES_KEY);
    return likesJson ? JSON.parse(likesJson) : {};
  }

  private saveLikes(likes: Record<string, string[]>): void {
    localStorage.setItem(this.LIKES_KEY, JSON.stringify(likes));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getInitialPosts(): LocalPost[] {
    // Generate some initial mock posts
    const mockPosts: LocalPost[] = [
      {
        id: 'post1',
        authorId: 'demo_user_1',
        content: '🚀 Just launched my new project! Excited to share this journey with everyone. The future is looking bright! #innovation #technology',
        type: 'text',
        likes: 42,
        comments: 8,
        shares: 3,
        views: 156,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'post2',
        authorId: 'demo_user_2',
        content: 'Beautiful sunset from my hiking trip today! Nature never fails to amaze me 🌅',
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=400&fit=crop',
        likes: 73,
        comments: 15,
        shares: 7,
        views: 234,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'post3',
        authorId: 'demo_user_3',
        content: 'Working on something exciting in the tech space. Can\'t wait to reveal more details soon! 💻✨',
        type: 'text',
        community: 'tech',
        likes: 28,
        comments: 12,
        shares: 2,
        views: 89,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Create demo users if they don't exist
    this.createDemoUsers();
    
    this.savePosts(mockPosts);
    return mockPosts;
  }

  private createDemoUsers(): void {
    const demoUsers = [
      {
        id: 'demo_user_1',
        email: 'alex@example.com',
        name: 'Alex Chen',
        username: 'alexchen',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
        bio: 'Software engineer & tech enthusiast',
        verified: true,
        followerCount: 1200,
        followingCount: 340,
        postCount: 28,
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo_user_2',
        email: 'sarah@example.com',
        name: 'Sarah Johnson',
        username: 'sarahj',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
        bio: 'Adventure seeker & photographer',
        verified: false,
        followerCount: 856,
        followingCount: 290,
        postCount: 42,
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo_user_3',
        email: 'mike@example.com',
        name: 'Mike Rodriguez',
        username: 'mikero',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
        bio: 'Startup founder & innovator',
        verified: true,
        followerCount: 2340,
        followingCount: 180,
        postCount: 65,
        createdAt: new Date().toISOString()
      }
    ];

    // Save demo users to users storage
    const usersKey = 'social_app_users';
    const existingUsers = JSON.parse(localStorage.getItem(usersKey) || '{}');
    
    demoUsers.forEach(user => {
      if (!existingUsers[user.id]) {
        existingUsers[user.id] = user;
      }
    });
    
    localStorage.setItem(usersKey, JSON.stringify(existingUsers));
  }

  async getFeed(): Promise<{ posts?: LocalPost[]; error?: string }> {
    try {
      const posts = this.getPosts();
      const currentUser = await localAuth.getCurrentUser();
      const likes = this.getLikes();
      
      // Add author information and like status
      const enrichedPosts = await Promise.all(
        posts.map(async (post) => {
          const author = await localAuth.getUserById(post.authorId);
          const isLiked = currentUser ? likes[post.id]?.includes(currentUser.id) : false;
          
          return {
            ...post,
            author,
            isLiked
          };
        })
      );

      // Sort by creation date (newest first)
      enrichedPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return { posts: enrichedPosts };
    } catch (error) {
      return { error: 'Failed to load posts' };
    }
  }

  async create(postData: {
    content: string;
    type: string;
    mediaUrl?: string;
    community?: string;
  }): Promise<{ post?: LocalPost; error?: string }> {
    try {
      const currentUser = await localAuth.getCurrentUser();
      if (!currentUser) {
        return { error: 'Not authenticated' };
      }

      const posts = this.getPosts();
      const newPost: LocalPost = {
        id: this.generateId(),
        authorId: currentUser.id,
        author: currentUser,
        content: postData.content,
        type: postData.type as any,
        mediaUrl: postData.mediaUrl,
        community: postData.community,
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      posts.unshift(newPost);
      this.savePosts(posts);

      // Update user's post count
      await localAuth.updateProfile({
        postCount: (currentUser.postCount || 0) + 1
      });

      return { post: newPost };
    } catch (error) {
      return { error: 'Failed to create post' };
    }
  }

  async like(postId: string): Promise<{ liked?: boolean; likes?: number; error?: string }> {
    try {
      const currentUser = await localAuth.getCurrentUser();
      if (!currentUser) {
        return { error: 'Not authenticated' };
      }

      const posts = this.getPosts();
      const likes = this.getLikes();
      
      const postIndex = posts.findIndex(p => p.id === postId);
      if (postIndex === -1) {
        return { error: 'Post not found' };
      }

      const post = posts[postIndex];
      const userLikes = likes[postId] || [];
      const hasLiked = userLikes.includes(currentUser.id);

      if (hasLiked) {
        // Remove like
        likes[postId] = userLikes.filter(id => id !== currentUser.id);
        post.likes = Math.max(0, post.likes - 1);
      } else {
        // Add like
        likes[postId] = [...userLikes, currentUser.id];
        post.likes = post.likes + 1;
      }

      this.savePosts(posts);
      this.saveLikes(likes);

      return { liked: !hasLiked, likes: post.likes };
    } catch (error) {
      return { error: 'Failed to update like' };
    }
  }
}

class LocalCommunitiesAPI {
  private readonly COMMUNITIES_KEY = 'social_app_communities';
  private readonly MEMBERSHIPS_KEY = 'social_app_memberships';

  private getCommunities(): LocalCommunity[] {
    const communitiesJson = localStorage.getItem(this.COMMUNITIES_KEY);
    return communitiesJson ? JSON.parse(communitiesJson) : this.getInitialCommunities();
  }

  private saveCommunities(communities: LocalCommunity[]): void {
    localStorage.setItem(this.COMMUNITIES_KEY, JSON.stringify(communities));
  }

  private getMemberships(): Record<string, string[]> {
    const membershipsJson = localStorage.getItem(this.MEMBERSHIPS_KEY);
    return membershipsJson ? JSON.parse(membershipsJson) : {};
  }

  private saveMemberships(memberships: Record<string, string[]>): void {
    localStorage.setItem(this.MEMBERSHIPS_KEY, JSON.stringify(memberships));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getInitialCommunities(): LocalCommunity[] {
    const mockCommunities: LocalCommunity[] = [
      {
        id: 'tech',
        name: 'Tech Innovation',
        description: 'Discuss the latest in technology and innovation',
        category: 'Technology',
        memberCount: 15420,
        postCount: 2340,
        isPrivate: false,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        creatorId: 'demo_user_1'
      },
      {
        id: 'photography',
        name: 'Photography Hub',
        description: 'Share your best shots and photography tips',
        category: 'Creative',
        memberCount: 8750,
        postCount: 1820,
        isPrivate: false,
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        creatorId: 'demo_user_2'
      },
      {
        id: 'startups',
        name: 'Startup Founders',
        description: 'Connect with fellow entrepreneurs and startup founders',
        category: 'Business',
        memberCount: 5630,
        postCount: 890,
        isPrivate: false,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        creatorId: 'demo_user_3'
      },
      {
        id: 'design',
        name: 'Design Inspiration',
        description: 'Showcase and discover amazing design work',
        category: 'Creative',
        memberCount: 12340,
        postCount: 3240,
        isPrivate: false,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        creatorId: 'demo_user_1'
      }
    ];

    this.saveCommunities(mockCommunities);
    return mockCommunities;
  }

  async getAll(): Promise<{ communities?: LocalCommunity[]; error?: string }> {
    try {
      const communities = this.getCommunities();
      const currentUser = await localAuth.getCurrentUser();
      const memberships = this.getMemberships();

      // Add membership status
      const enrichedCommunities = communities.map(community => ({
        ...community,
        isJoined: currentUser ? memberships[community.id]?.includes(currentUser.id) : false,
        role: currentUser && community.creatorId === currentUser.id ? 'admin' as const : 'member' as const
      }));

      return { communities: enrichedCommunities };
    } catch (error) {
      return { error: 'Failed to load communities' };
    }
  }

  async create(communityData: {
    name: string;
    description: string;
    category: string;
  }): Promise<{ community?: LocalCommunity; error?: string }> {
    try {
      const currentUser = await localAuth.getCurrentUser();
      if (!currentUser) {
        return { error: 'Not authenticated' };
      }

      const communities = this.getCommunities();
      const newCommunity: LocalCommunity = {
        id: this.generateId(),
        name: communityData.name,
        description: communityData.description,
        category: communityData.category,
        memberCount: 1,
        postCount: 0,
        isPrivate: false,
        createdAt: new Date().toISOString(),
        creatorId: currentUser.id,
        isJoined: true,
        role: 'admin'
      };

      communities.unshift(newCommunity);
      this.saveCommunities(communities);

      // Auto-join creator
      const memberships = this.getMemberships();
      memberships[newCommunity.id] = [currentUser.id];
      this.saveMemberships(memberships);

      return { community: newCommunity };
    } catch (error) {
      return { error: 'Failed to create community' };
    }
  }

  async join(communityId: string): Promise<{ joined?: boolean; memberCount?: number; error?: string }> {
    try {
      const currentUser = await localAuth.getCurrentUser();
      if (!currentUser) {
        return { error: 'Not authenticated' };
      }

      const communities = this.getCommunities();
      const memberships = this.getMemberships();
      
      const communityIndex = communities.findIndex(c => c.id === communityId);
      if (communityIndex === -1) {
        return { error: 'Community not found' };
      }

      const community = communities[communityIndex];
      const members = memberships[communityId] || [];
      const isMember = members.includes(currentUser.id);

      if (isMember) {
        // Leave community
        memberships[communityId] = members.filter(id => id !== currentUser.id);
        community.memberCount = Math.max(0, community.memberCount - 1);
      } else {
        // Join community
        memberships[communityId] = [...members, currentUser.id];
        community.memberCount = community.memberCount + 1;
      }

      this.saveCommunities(communities);
      this.saveMemberships(memberships);

      return { joined: !isMember, memberCount: community.memberCount };
    } catch (error) {
      return { error: 'Failed to update membership' };
    }
  }
}

class LocalNotificationsAPI {
  private readonly NOTIFICATIONS_KEY = 'social_app_notifications';

  private getNotifications(): LocalNotification[] {
    const notificationsJson = localStorage.getItem(this.NOTIFICATIONS_KEY);
    return notificationsJson ? JSON.parse(notificationsJson) : this.getInitialNotifications();
  }

  private saveNotifications(notifications: LocalNotification[]): void {
    localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(notifications));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getInitialNotifications(): LocalNotification[] {
    // Generate some initial notifications for demo
    const mockNotifications: LocalNotification[] = [
      {
        id: 'notif1',
        userId: 'current_user',
        type: 'like',
        title: 'New Like',
        message: 'Alex Chen liked your post',
        read: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        id: 'notif2',
        userId: 'current_user',
        type: 'follow',
        title: 'New Follower',
        message: 'Sarah Johnson started following you',
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'notif3',
        userId: 'current_user',
        type: 'community',
        title: 'Community Update',
        message: 'New post in Tech Innovation community',
        read: true,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      }
    ];

    this.saveNotifications(mockNotifications);
    return mockNotifications;
  }

  async getAll(userId: string): Promise<{ notifications?: LocalNotification[]; error?: string }> {
    try {
      const notifications = this.getNotifications();
      const userNotifications = notifications
        .filter(n => n.userId === userId || n.userId === 'current_user')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return { notifications: userNotifications };
    } catch (error) {
      return { error: 'Failed to load notifications' };
    }
  }

  async markAsRead(notificationId: string): Promise<{ error?: string }> {
    try {
      const notifications = this.getNotifications();
      const notificationIndex = notifications.findIndex(n => n.id === notificationId);
      
      if (notificationIndex !== -1) {
        notifications[notificationIndex].read = true;
        this.saveNotifications(notifications);
      }

      return {};
    } catch (error) {
      return { error: 'Failed to mark notification as read' };
    }
  }

  async markAllAsRead(userId: string): Promise<{ error?: string }> {
    try {
      const notifications = this.getNotifications();
      const updatedNotifications = notifications.map(n => 
        (n.userId === userId || n.userId === 'current_user') ? { ...n, read: true } : n
      );
      
      this.saveNotifications(updatedNotifications);
      return {};
    } catch (error) {
      return { error: 'Failed to mark all notifications as read' };
    }
  }
}

export const localPostsAPI = new LocalPostsAPI();
export const localCommunitiesAPI = new LocalCommunitiesAPI();
export const localNotificationsAPI = new LocalNotificationsAPI();