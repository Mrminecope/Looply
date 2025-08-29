import type { Post, User } from '../types/app';

// Reel algorithm for personalized video recommendations
export class ReelAlgorithm {
  private userInteractions: Map<string, UserInteraction> = new Map();
  private reelPerformance: Map<string, ReelPerformance> = new Map();
  
  constructor() {
    this.loadFromLocalStorage();
  }

  // Track user interactions for algorithm learning
  trackInteraction(userId: string, postId: string, interaction: InteractionType, duration?: number) {
    const key = `${userId}_${postId}`;
    const existing = this.userInteractions.get(key) || {
      userId,
      postId,
      views: 0,
      likes: 0,
      shares: 0,
      comments: 0,
      watchTime: 0,
      completionRate: 0,
      timestamp: Date.now()
    };

    switch (interaction) {
      case 'view':
        existing.views++;
        if (duration) existing.watchTime += duration;
        break;
      case 'like':
        existing.likes++;
        break;
      case 'share':
        existing.shares++;
        break;
      case 'comment':
        existing.comments++;
        break;
    }

    existing.timestamp = Date.now();
    this.userInteractions.set(key, existing);
    this.updateReelPerformance(postId, interaction, duration);
    this.saveToLocalStorage();
  }

  // Update reel performance metrics
  private updateReelPerformance(postId: string, interaction: InteractionType, duration?: number) {
    const performance = this.reelPerformance.get(postId) || {
      postId,
      totalViews: 0,
      totalLikes: 0,
      totalShares: 0,
      totalComments: 0,
      averageWatchTime: 0,
      averageCompletionRate: 0,
      engagementRate: 0,
      trending: false,
      score: 0
    };

    switch (interaction) {
      case 'view':
        performance.totalViews++;
        if (duration) {
          performance.averageWatchTime = 
            (performance.averageWatchTime + duration) / 2;
        }
        break;
      case 'like':
        performance.totalLikes++;
        break;
      case 'share':
        performance.totalShares++;
        break;
      case 'comment':
        performance.totalComments++;
        break;
    }

    // Calculate engagement rate
    performance.engagementRate = 
      (performance.totalLikes + performance.totalShares + performance.totalComments) / 
      Math.max(performance.totalViews, 1);

    // Calculate trending score
    performance.score = this.calculateTrendingScore(performance);
    performance.trending = performance.score > 0.7;

    this.reelPerformance.set(postId, performance);
  }

  // Calculate trending score based on multiple factors
  private calculateTrendingScore(performance: ReelPerformance): number {
    const recencyWeight = this.getRecencyWeight(performance.postId);
    const engagementWeight = Math.min(performance.engagementRate * 2, 1);
    const watchTimeWeight = Math.min(performance.averageWatchTime / 30, 1); // 30s max
    const velocityWeight = this.getVelocityWeight(performance);

    return (
      recencyWeight * 0.2 +
      engagementWeight * 0.3 +
      watchTimeWeight * 0.3 +
      velocityWeight * 0.2
    );
  }

  // Get recency weight (newer videos get higher scores)
  private getRecencyWeight(postId: string): number {
    const hoursAgo = (Date.now() - parseInt(postId.split('_')[1])) / (1000 * 60 * 60);
    return Math.max(0, 1 - hoursAgo / 24); // Decays over 24 hours
  }

  // Get velocity weight (faster growing videos get higher scores)
  private getVelocityWeight(performance: ReelPerformance): number {
    const recentInteractions = Array.from(this.userInteractions.values())
      .filter(interaction => 
        interaction.postId === performance.postId &&
        Date.now() - interaction.timestamp < 3600000 // Last hour
      ).length;
    
    return Math.min(recentInteractions / 10, 1); // Normalize to 0-1
  }

  // Get personalized reel recommendations
  getPersonalizedReels(userId: string, availableReels: Post[], count = 10): Post[] {
    const userPreferences = this.getUserPreferences(userId);
    const scoredReels = availableReels
      .filter(post => post.type === 'reel' || post.type === 'video')
      .map(reel => ({
        post: reel,
        score: this.calculatePersonalizationScore(userId, reel, userPreferences)
      }))
      .sort((a, b) => b.score - a.score);

    // Add some randomness to avoid filter bubbles
    const randomizedResults = this.addRandomization(scoredReels, 0.2);
    
    return randomizedResults.slice(0, count).map(item => item.post);
  }

  // Get random reels for discovery
  getRandomReels(availableReels: Post[], count = 10): Post[] {
    const reels = availableReels.filter(post => 
      post.type === 'reel' || post.type === 'video'
    );
    
    // Shuffle array
    for (let i = reels.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [reels[i], reels[j]] = [reels[j], reels[i]];
    }
    
    return reels.slice(0, count);
  }

  // Get trending reels
  getTrendingReels(availableReels: Post[], count = 10): Post[] {
    const trendingReels = availableReels
      .filter(post => post.type === 'reel' || post.type === 'video')
      .map(reel => ({
        post: reel,
        performance: this.reelPerformance.get(reel.id) || this.createDefaultPerformance(reel.id)
      }))
      .sort((a, b) => b.performance.score - a.performance.score);

    return trendingReels.slice(0, count).map(item => item.post);
  }

  // Calculate personalization score for a user and reel
  private calculatePersonalizationScore(userId: string, reel: Post, preferences: UserPreferences): number {
    let score = 0;

    // Hashtag preferences
    const hashtagMatch = reel.hashtags?.some(tag => 
      preferences.favoriteHashtags.includes(tag)
    ) || false;
    if (hashtagMatch) score += 0.3;

    // Author preferences
    if (preferences.favoriteAuthors.includes(reel.author.id)) {
      score += 0.4;
    }

    // Time-based preferences
    const hour = new Date().getHours();
    const timeMatch = preferences.activeHours.includes(hour);
    if (timeMatch) score += 0.1;

    // Content type preferences
    if (preferences.contentTypes.includes(reel.type)) {
      score += 0.2;
    }

    // Add reel performance score
    const performance = this.reelPerformance.get(reel.id);
    if (performance) {
      score += performance.score * 0.3;
    }

    return Math.min(score, 1);
  }

  // Get user preferences based on interaction history
  private getUserPreferences(userId: string): UserPreferences {
    const userInteractions = Array.from(this.userInteractions.values())
      .filter(interaction => interaction.userId === userId);

    const favoriteHashtags = this.extractFavoriteHashtags(userInteractions);
    const favoriteAuthors = this.extractFavoriteAuthors(userInteractions);
    const activeHours = this.extractActiveHours(userInteractions);
    const contentTypes = this.extractContentTypes(userInteractions);

    return {
      favoriteHashtags,
      favoriteAuthors,
      activeHours,
      contentTypes
    };
  }

  // Extract favorite hashtags from user interactions
  private extractFavoriteHashtags(interactions: UserInteraction[]): string[] {
    const hashtagCounts = new Map<string, number>();
    
    // This would need post data to get hashtags
    // For now, return some defaults based on engagement
    const highEngagementPosts = interactions
      .filter(i => i.likes > 0 || i.shares > 0)
      .map(i => i.postId);

    // Mock hashtag extraction - in real app, would lookup post hashtags
    return ['#trending', '#viral', '#creative', '#music', '#dance'];
  }

  // Extract favorite authors from user interactions
  private extractFavoriteAuthors(interactions: UserInteraction[]): string[] {
    const authorCounts = new Map<string, number>();
    
    interactions.forEach(interaction => {
      if (interaction.likes > 0 || interaction.shares > 0) {
        // Would need to lookup author from post data
        // For now, return empty array
      }
    });

    return [];
  }

  // Extract active hours from user interactions
  private extractActiveHours(interactions: UserInteraction[]): number[] {
    const hourCounts = new Map<number, number>();
    
    interactions.forEach(interaction => {
      const hour = new Date(interaction.timestamp).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    // Return top 6 hours
    return Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([hour]) => hour);
  }

  // Extract content type preferences
  private extractContentTypes(interactions: UserInteraction[]): string[] {
    // Mock implementation - would need post data
    return ['reel', 'video'];
  }

  // Add randomization to avoid filter bubbles
  private addRandomization<T>(scoredItems: Array<{score: number} & T>, randomFactor: number): Array<{score: number} & T> {
    return scoredItems.map(item => ({
      ...item,
      score: item.score * (1 - randomFactor) + Math.random() * randomFactor
    })).sort((a, b) => b.score - a.score);
  }

  // Create default performance for new reels
  private createDefaultPerformance(postId: string): ReelPerformance {
    return {
      postId,
      totalViews: 0,
      totalLikes: 0,
      totalShares: 0,
      totalComments: 0,
      averageWatchTime: 0,
      averageCompletionRate: 0,
      engagementRate: 0,
      trending: false,
      score: Math.random() * 0.3 // Random initial score
    };
  }

  // Save data to localStorage
  private saveToLocalStorage() {
    try {
      localStorage.setItem('reel_interactions', 
        JSON.stringify(Array.from(this.userInteractions.entries())));
      localStorage.setItem('reel_performance', 
        JSON.stringify(Array.from(this.reelPerformance.entries())));
    } catch (error) {
      console.warn('Failed to save reel data to localStorage:', error);
    }
  }

  // Load data from localStorage
  private loadFromLocalStorage() {
    try {
      const interactions = localStorage.getItem('reel_interactions');
      if (interactions) {
        const parsed = JSON.parse(interactions);
        this.userInteractions = new Map(parsed);
      }

      const performance = localStorage.getItem('reel_performance');
      if (performance) {
        const parsed = JSON.parse(performance);
        this.reelPerformance = new Map(parsed);
      }
    } catch (error) {
      console.warn('Failed to load reel data from localStorage:', error);
    }
  }

  // Get analytics data
  getAnalytics(userId?: string) {
    const interactions = userId 
      ? Array.from(this.userInteractions.values()).filter(i => i.userId === userId)
      : Array.from(this.userInteractions.values());

    const totalViews = interactions.reduce((sum, i) => sum + i.views, 0);
    const totalEngagement = interactions.reduce((sum, i) => 
      sum + i.likes + i.shares + i.comments, 0);

    return {
      totalInteractions: interactions.length,
      totalViews,
      totalEngagement,
      averageEngagementRate: totalEngagement / Math.max(totalViews, 1),
      trendingReels: Array.from(this.reelPerformance.values())
        .filter(p => p.trending)
        .length
    };
  }
}

// Types for the algorithm
export type InteractionType = 'view' | 'like' | 'share' | 'comment';

export interface UserInteraction {
  userId: string;
  postId: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  watchTime: number; // in seconds
  completionRate: number; // 0-1
  timestamp: number;
}

export interface ReelPerformance {
  postId: string;
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  totalComments: number;
  averageWatchTime: number;
  averageCompletionRate: number;
  engagementRate: number;
  trending: boolean;
  score: number; // 0-1 trending score
}

export interface UserPreferences {
  favoriteHashtags: string[];
  favoriteAuthors: string[];
  activeHours: number[]; // Hours of day when user is most active
  contentTypes: string[];
}

// Create singleton instance
export const reelAlgorithm = new ReelAlgorithm();