import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './supabase/info';

// Create Supabase client for frontend auth
const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// Server URL for API calls
const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-5a529b02`;

export interface SupabaseUser {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  followerCount?: number;
  followingCount?: number;
  postCount?: number;
  verified?: boolean;
  links?: string[];
  location?: string;
  createdAt?: string;
}

export class SupabaseAuthService {
  // Get current authenticated user
  static async getCurrentUser(): Promise<SupabaseUser | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        return null;
      }

      // Get full user profile from backend
      const response = await fetch(`${SERVER_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Failed to fetch user profile:', await response.text());
        return null;
      }

      const { user } = await response.json();
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session?.access_token;
    } catch {
      return false;
    }
  }

  // Sign in with email and password
  static async signIn(email: string, password: string): Promise<{ user: SupabaseUser | null; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (!data.session?.access_token) {
        return { user: null, error: 'No session created' };
      }

      // Get full user profile from backend
      const response = await fetch(`${SERVER_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${data.session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch user profile:', errorText);
        return { user: null, error: 'Failed to load user profile' };
      }

      const { user } = await response.json();
      return { user };
    } catch (error) {
      console.error('Sign in error:', error);
      return { user: null, error: 'Sign in failed' };
    }
  }

  // Sign up with email and password
  static async signUp(email: string, password: string, name: string, username: string): Promise<{ user: SupabaseUser | null; error?: string }> {
    try {
      // Create user via backend which handles both Supabase Auth and profile data
      const response = await fetch(`${SERVER_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          name,
          username
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { user: null, error: errorData.error || 'Sign up failed' };
      }

      const { user } = await response.json();
      
      // Now sign in to get the session
      const signInResult = await this.signIn(email, password);
      return signInResult;
    } catch (error) {
      console.error('Sign up error:', error);
      return { user: null, error: 'Sign up failed' };
    }
  }

  // Google Sign-in
  static async signInWithGoogle(): Promise<{ user: SupabaseUser | null; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        return { user: null, error: error.message };
      }

      // OAuth redirect will handle the rest
      return { user: null };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { user: null, error: 'Google sign-in failed. Please ensure OAuth is configured.' };
    }
  }

  // Handle OAuth callback
  static async handleAuthCallback(): Promise<{ user: SupabaseUser | null; error?: string }> {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        return { user: null, error: error.message };
      }

      if (!data.session?.access_token) {
        return { user: null, error: 'No session found' };
      }

      // Check if user profile exists, if not create one
      let response = await fetch(`${SERVER_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${data.session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401 || response.status === 404) {
        // Create user profile for OAuth users
        const oauthUser = data.session.user;
        const createResponse = await fetch(`${SERVER_URL}/auth/signup`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: oauthUser.email,
            password: Math.random().toString(36), // Random password for OAuth users
            name: oauthUser.user_metadata?.name || oauthUser.email?.split('@')[0] || 'User',
            username: oauthUser.email?.split('@')[0] || `user${Date.now()}`
          })
        });

        if (!createResponse.ok) {
          const errorData = await createResponse.json();
          return { user: null, error: errorData.error || 'Failed to create user profile' };
        }

        // Retry fetching user profile
        response = await fetch(`${SERVER_URL}/users/me`, {
          headers: {
            'Authorization': `Bearer ${data.session.access_token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch user profile:', errorText);
        return { user: null, error: 'Failed to load user profile' };
      }

      const { user } = await response.json();
      return { user };
    } catch (error) {
      console.error('Auth callback error:', error);
      return { user: null, error: 'Authentication failed' };
    }
  }

  // Reset password
  static async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: 'Password reset failed' };
    }
  }

  // Update password
  static async updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Password update error:', error);
      return { success: false, error: 'Password update failed' };
    }
  }

  // Sign out
  static async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  // Get access token for API calls
  static async getAccessToken(): Promise<string | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch {
      return null;
    }
  }

  // Update user profile
  static async updateProfile(updates: Partial<SupabaseUser>): Promise<{ user: SupabaseUser | null; error?: string }> {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        return { user: null, error: 'Not authenticated' };
      }

      const response = await fetch(`${SERVER_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { user: null, error: errorData.error || 'Update failed' };
      }

      const { user } = await response.json();
      return { user };
    } catch (error) {
      console.error('Profile update error:', error);
      return { user: null, error: 'Update failed' };
    }
  }
}

// Export the supabase client for direct use if needed
export { supabase };