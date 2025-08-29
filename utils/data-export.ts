// Data Export/Import System - Full backup and restore functionality
import { analyticsService } from './analytics';
import { localAuth } from './local-auth';
import { toast } from 'sonner@2.0.3';

export interface ExportedData {
  version: string;
  exportDate: string;
  user: any;
  posts: any[];
  communities: any[];
  notifications: any[];
  analytics: any;
  settings: any;
  metadata: {
    totalUsers: number;
    totalPosts: number;
    totalCommunities: number;
    appVersion: string;
  };
}

export interface ImportOptions {
  mergeData: boolean;
  overwriteExisting: boolean;
  preserveIds: boolean;
  importAnalytics: boolean;
}

class DataExportService {
  private readonly EXPORT_VERSION = '1.0.0';
  private readonly APP_VERSION = '1.0.0';

  // Export all user data
  async exportUserData(userId: string): Promise<ExportedData> {
    try {
      const currentUser = await localAuth.getCurrentUser();
      if (!currentUser || currentUser.id !== userId) {
        throw new Error('User not authenticated or ID mismatch');
      }

      // Get all data from localStorage
      const posts = this.getAllPosts();
      const communities = this.getAllCommunities();
      const notifications = this.getAllNotifications(userId);
      const analytics = this.getAnalyticsData(userId);
      const settings = this.getUserSettings(userId);

      // Count totals
      const allUsers = this.getAllUsers();
      const totalUsers = allUsers.length;
      const totalPosts = posts.length;
      const totalCommunities = communities.length;

      const exportData: ExportedData = {
        version: this.EXPORT_VERSION,
        exportDate: new Date().toISOString(),
        user: currentUser,
        posts: posts.filter(post => post.authorId === userId),
        communities: communities.filter(c => c.creatorId === userId || c.memberIds?.includes(userId)),
        notifications: notifications,
        analytics: analytics,
        settings: settings,
        metadata: {
          totalUsers,
          totalPosts,
          totalCommunities,
          appVersion: this.APP_VERSION
        }
      };

      return exportData;
    } catch (error) {
      console.error('Export error:', error);
      throw new Error('Failed to export data');
    }
  }

  // Export data as downloadable JSON file
  async downloadUserData(userId: string, filename?: string): Promise<void> {
    try {
      const exportData = await this.exportUserData(userId);
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const defaultFilename = `socialflow-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.href = url;
      link.download = filename || defaultFilename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      // Track export
      analyticsService.track(userId, 'data_exported', {
        exportSize: jsonString.length,
        exportDate: new Date().toISOString()
      });
      
      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download data');
      throw error;
    }
  }

  // Import data from JSON
  async importUserData(
    jsonData: string | ExportedData, 
    userId: string, 
    options: ImportOptions = {
      mergeData: true,
      overwriteExisting: false,
      preserveIds: true,
      importAnalytics: true
    }
  ): Promise<{ success: boolean; message: string }> {
    try {
      let importData: ExportedData;
      
      if (typeof jsonData === 'string') {
        importData = JSON.parse(jsonData);
      } else {
        importData = jsonData;
      }

      // Validate import data
      const validation = this.validateImportData(importData);
      if (!validation.valid) {
        return { success: false, message: validation.error || 'Invalid data format' };
      }

      // Check version compatibility
      if (importData.version !== this.EXPORT_VERSION) {
        console.warn(`Version mismatch: expected ${this.EXPORT_VERSION}, got ${importData.version}`);
        // Could add migration logic here
      }

      const currentUser = await localAuth.getCurrentUser();
      if (!currentUser || currentUser.id !== userId) {
        return { success: false, message: 'User not authenticated' };
      }

      // Import user profile updates
      if (importData.user && options.overwriteExisting) {
        await this.importUserProfile(importData.user, userId);
      }

      // Import posts
      if (importData.posts?.length > 0) {
        await this.importPosts(importData.posts, userId, options);
      }

      // Import communities
      if (importData.communities?.length > 0) {
        await this.importCommunities(importData.communities, userId, options);
      }

      // Import notifications
      if (importData.notifications?.length > 0) {
        await this.importNotifications(importData.notifications, userId, options);
      }

      // Import analytics
      if (importData.analytics && options.importAnalytics) {
        await this.importAnalytics(importData.analytics, userId, options);
      }

      // Import settings
      if (importData.settings) {
        await this.importSettings(importData.settings, userId, options);
      }

      // Track import
      analyticsService.track(userId, 'data_imported', {
        importDate: new Date().toISOString(),
        originalExportDate: importData.exportDate,
        postsImported: importData.posts?.length || 0,
        communitiesImported: importData.communities?.length || 0
      });

      toast.success('Data imported successfully!');
      return { success: true, message: 'Data imported successfully' };
    } catch (error) {
      console.error('Import error:', error);
      const message = error instanceof Error ? error.message : 'Failed to import data';
      toast.error(message);
      return { success: false, message };
    }
  }

  // Validate import data structure
  private validateImportData(data: any): { valid: boolean; error?: string } {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'Invalid data format' };
    }

    if (!data.version) {
      return { valid: false, error: 'Missing version information' };
    }

    if (!data.exportDate) {
      return { valid: false, error: 'Missing export date' };
    }

    if (!data.user || !data.user.id) {
      return { valid: false, error: 'Missing user data' };
    }

    return { valid: true };
  }

  // Import user profile
  private async importUserProfile(userData: any, currentUserId: string): Promise<void> {
    try {
      // Only import non-sensitive profile data
      const profileUpdates = {
        name: userData.name,
        bio: userData.bio,
        avatar: userData.avatar,
        location: userData.location,
        links: userData.links,
        verified: userData.verified
      };

      await localAuth.updateProfile(profileUpdates);
    } catch (error) {
      console.error('Failed to import user profile:', error);
    }
  }

  // Import posts
  private async importPosts(posts: any[], userId: string, options: ImportOptions): Promise<void> {
    try {
      const existingPosts = this.getAllPosts();
      const existingPostIds = new Set(existingPosts.map(p => p.id));

      for (const post of posts) {
        // Skip if post exists and not overwriting
        if (existingPostIds.has(post.id) && !options.overwriteExisting) {
          continue;
        }

        // Update author ID to current user
        post.authorId = userId;

        // Generate new ID if not preserving
        if (!options.preserveIds) {
          post.id = `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }

        // Add to posts
        if (options.mergeData || !existingPostIds.has(post.id)) {
          existingPosts.push(post);
        }
      }

      localStorage.setItem('social-app-posts', JSON.stringify(existingPosts));
    } catch (error) {
      console.error('Failed to import posts:', error);
    }
  }

  // Import communities
  private async importCommunities(communities: any[], userId: string, options: ImportOptions): Promise<void> {
    try {
      const existingCommunities = this.getAllCommunities();
      const existingCommunityIds = new Set(existingCommunities.map(c => c.id));

      for (const community of communities) {
        // Skip if community exists and not overwriting
        if (existingCommunityIds.has(community.id) && !options.overwriteExisting) {
          continue;
        }

        // Update creator ID to current user if they were the creator
        if (community.creatorId === community.originalUserId) {
          community.creatorId = userId;
        }

        // Generate new ID if not preserving
        if (!options.preserveIds) {
          community.id = `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }

        // Add to communities
        if (options.mergeData || !existingCommunityIds.has(community.id)) {
          existingCommunities.push(community);
        }
      }

      localStorage.setItem('social-app-communities', JSON.stringify(existingCommunities));
    } catch (error) {
      console.error('Failed to import communities:', error);
    }
  }

  // Import notifications
  private async importNotifications(notifications: any[], userId: string, options: ImportOptions): Promise<void> {
    try {
      const existingNotifications = this.getAllNotifications(userId);

      for (const notification of notifications) {
        // Update user ID to current user
        notification.userId = userId;

        // Generate new ID if not preserving
        if (!options.preserveIds) {
          notification.id = `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }

        // Add to notifications if merging
        if (options.mergeData) {
          existingNotifications.push(notification);
        }
      }

      localStorage.setItem(`social-app-notifications-${userId}`, JSON.stringify(existingNotifications));
    } catch (error) {
      console.error('Failed to import notifications:', error);
    }
  }

  // Import analytics
  private async importAnalytics(analyticsData: any, userId: string, options: ImportOptions): Promise<void> {
    try {
      if (!options.importAnalytics) return;

      // Import analytics data carefully, updating user IDs
      const existingAnalytics = this.getAnalyticsData(userId);
      
      // Merge analytics data
      if (analyticsData.sessions) {
        existingAnalytics.sessions = [...(existingAnalytics.sessions || []), ...analyticsData.sessions];
      }

      if (analyticsData.posts) {
        existingAnalytics.posts = { ...(existingAnalytics.posts || {}), ...analyticsData.posts };
      }

      localStorage.setItem(`social-app-analytics-${userId}`, JSON.stringify(existingAnalytics));
    } catch (error) {
      console.error('Failed to import analytics:', error);
    }
  }

  // Import settings
  private async importSettings(settingsData: any, userId: string, options: ImportOptions): Promise<void> {
    try {
      const existingSettings = this.getUserSettings(userId);
      
      // Merge settings
      const mergedSettings = options.mergeData 
        ? { ...existingSettings, ...settingsData }
        : settingsData;

      localStorage.setItem(`social-app-settings-${userId}`, JSON.stringify(mergedSettings));
    } catch (error) {
      console.error('Failed to import settings:', error);
    }
  }

  // Helper methods to get data from localStorage
  private getAllUsers(): any[] {
    try {
      return JSON.parse(localStorage.getItem('social-app-users') || '[]');
    } catch {
      return [];
    }
  }

  private getAllPosts(): any[] {
    try {
      return JSON.parse(localStorage.getItem('social-app-posts') || '[]');
    } catch {
      return [];
    }
  }

  private getAllCommunities(): any[] {
    try {
      return JSON.parse(localStorage.getItem('social-app-communities') || '[]');
    } catch {
      return [];
    }
  }

  private getAllNotifications(userId: string): any[] {
    try {
      return JSON.parse(localStorage.getItem(`social-app-notifications-${userId}`) || '[]');
    } catch {
      return [];
    }
  }

  private getAnalyticsData(userId: string): any {
    try {
      return JSON.parse(localStorage.getItem(`social-app-analytics-${userId}`) || '{}');
    } catch {
      return {};
    }
  }

  private getUserSettings(userId: string): any {
    try {
      return JSON.parse(localStorage.getItem(`social-app-settings-${userId}`) || '{}');
    } catch {
      return {};
    }
  }

  // Clear all user data (useful for testing)
  async clearAllUserData(userId: string): Promise<void> {
    try {
      // Remove user-specific data
      localStorage.removeItem(`social-app-analytics-${userId}`);
      localStorage.removeItem(`social-app-settings-${userId}`);
      localStorage.removeItem(`social-app-notifications-${userId}`);
      
      // Remove posts by user
      const posts = this.getAllPosts();
      const filteredPosts = posts.filter(post => post.authorId !== userId);
      localStorage.setItem('social-app-posts', JSON.stringify(filteredPosts));
      
      // Remove communities created by user
      const communities = this.getAllCommunities();
      const filteredCommunities = communities.filter(community => community.creatorId !== userId);
      localStorage.setItem('social-app-communities', JSON.stringify(filteredCommunities));
      
      // Remove user from users list
      const users = this.getAllUsers();
      const filteredUsers = users.filter(user => user.id !== userId);
      localStorage.setItem('social-app-users', JSON.stringify(filteredUsers));
      
      toast.success('All user data cleared');
    } catch (error) {
      console.error('Failed to clear user data:', error);
      toast.error('Failed to clear user data');
    }
  }

  // Get export statistics
  getExportStats(userId: string): { 
    posts: number; 
    communities: number; 
    notifications: number; 
    dataSize: string; 
  } {
    const posts = this.getAllPosts().filter(p => p.authorId === userId);
    const communities = this.getAllCommunities().filter(c => c.creatorId === userId || c.memberIds?.includes(userId));
    const notifications = this.getAllNotifications(userId);
    
    // Estimate data size
    const estimatedData = {
      posts,
      communities,
      notifications,
      analytics: this.getAnalyticsData(userId),
      settings: this.getUserSettings(userId)
    };
    
    const dataSize = new Blob([JSON.stringify(estimatedData)]).size;
    const dataSizeFormatted = dataSize < 1024 
      ? `${dataSize} B`
      : dataSize < 1024 * 1024
      ? `${(dataSize / 1024).toFixed(1)} KB`
      : `${(dataSize / (1024 * 1024)).toFixed(1)} MB`;

    return {
      posts: posts.length,
      communities: communities.length,
      notifications: notifications.length,
      dataSize: dataSizeFormatted
    };
  }
}

// Export singleton instance
export const dataExportService = new DataExportService();