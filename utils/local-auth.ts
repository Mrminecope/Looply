import { localStorageService } from './local-storage-service';
import { generateMockUserData } from './demo-data';
import type { User } from '../types/app';
import { toast } from 'sonner@2.0.3';

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export class LocalAuthService {
  private static DEMO_ACCOUNTS = [
    {
      email: 'demo@looply.app',
      password: 'demo123',
      name: 'Demo User',
      username: 'demouser'
    },
    {
      email: 'alex@looply.app',
      password: 'alex123',
      name: 'Alex Chen',
      username: 'alexchen'
    },
    {
      email: 'sarah@looply.app',
      password: 'sarah123',
      name: 'Sarah Johnson',
      username: 'sarahj'
    }
  ];

  static async getCurrentUser(): Promise<User | null> {
    return await localStorageService.getCurrentUser();
  }

  static async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return !!user;
  }

  static async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Check demo accounts first
      const demoAccount = this.DEMO_ACCOUNTS.find(acc => 
        acc.email.toLowerCase() === email.toLowerCase() && acc.password === password
      );

      if (demoAccount) {
        const user = generateMockUserData();
        user.email = demoAccount.email;
        user.name = demoAccount.name;
        user.username = demoAccount.username;
        
        await localStorageService.setCurrentUser(user);
        
        return {
          success: true,
          user
        };
      }

      // For any other email/password, create a new user (local development)
      if (email.includes('@') && password.length >= 6) {
        const user = generateMockUserData();
        user.email = email;
        user.name = email.split('@')[0];
        user.username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        
        await localStorageService.setCurrentUser(user);
        
        return {
          success: true,
          user
        };
      }

      return {
        success: false,
        error: 'Invalid email or password'
      };

    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: 'Sign in failed. Please try again.'
      };
    }
  }

  static async signUp(email: string, password: string, name: string, username: string): Promise<AuthResult> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Basic validation
      if (!email.includes('@') || password.length < 6 || !name.trim() || !username.trim()) {
        return {
          success: false,
          error: 'Please provide valid email, password (6+ chars), name, and username'
        };
      }

      // Check if user already exists
      const existingUsers = await localStorageService.getItem<User[]>('looply_users') || [];
      if (existingUsers.some(u => u.email === email || u.username === username)) {
        return {
          success: false,
          error: 'Email or username already exists'
        };
      }

      // Create new user
      const user = generateMockUserData();
      user.email = email;
      user.name = name.trim();
      user.username = username.toLowerCase().trim();
      user.followerCount = 0;
      user.followingCount = 0;
      user.postsCount = 0;
      
      await localStorageService.setCurrentUser(user);

      // Add to users list
      existingUsers.push(user);
      await localStorageService.setItem('looply_users', existingUsers);
      
      return {
        success: true,
        user
      };

    } catch (error) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: 'Sign up failed. Please try again.'
      };
    }
  }

  static async signOut(): Promise<void> {
    try {
      await localStorageService.logout();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  static async updateProfile(updates: Partial<User>): Promise<AuthResult> {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        return {
          success: false,
          error: 'Not authenticated'
        };
      }

      const updatedUser = { ...currentUser, ...updates };
      await localStorageService.updateUser(currentUser.id, updates);
      
      return {
        success: true,
        user: updatedUser
      };

    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: 'Failed to update profile'
      };
    }
  }

  // Demo account helpers
  static getDemoAccounts() {
    return this.DEMO_ACCOUNTS.map(acc => ({
      email: acc.email,
      name: acc.name,
      username: acc.username
    }));
  }

  static async signInWithDemo(accountIndex: number = 0): Promise<AuthResult> {
    const demoAccount = this.DEMO_ACCOUNTS[accountIndex];
    if (!demoAccount) {
      return {
        success: false,
        error: 'Demo account not found'
      };
    }

    return await this.signIn(demoAccount.email, demoAccount.password);
  }

  // Password reset (mock implementation)
  static async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (!email.includes('@')) {
        return {
          success: false,
          error: 'Please enter a valid email address'
        };
      }

      // In a real app, this would send an email
      toast.info('Password reset functionality is not implemented in the local version');
      
      return {
        success: true
      };

    } catch (error) {
      return {
        success: false,
        error: 'Password reset failed'
      };
    }
  }

  // Health check for the auth system
  static async healthCheck(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return true; // Local auth is always "healthy"
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const localAuth = LocalAuthService;