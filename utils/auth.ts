// Simple local authentication system
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar?: string;
}

export class AuthService {
  private static readonly STORAGE_KEY = 'social_app_auth';
  private static readonly USERS_KEY = 'social_app_users';

  // Get current authenticated user
  static getCurrentUser(): AuthUser | null {
    try {
      const authData = localStorage.getItem(this.STORAGE_KEY);
      return authData ? JSON.parse(authData) : null;
    } catch {
      return null;
    }
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  // Sign in with email and password
  static async signIn(email: string, password: string): Promise<{ user: AuthUser | null; error?: string }> {
    try {
      const users = this.getStoredUsers();
      const user = users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        return { user: null, error: 'Invalid email or password' };
      }

      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        avatar: user.avatar
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authUser));
      return { user: authUser };
    } catch {
      return { user: null, error: 'Sign in failed' };
    }
  }

  // Sign up with email and password
  static async signUp(email: string, password: string, name: string, username: string): Promise<{ user: AuthUser | null; error?: string }> {
    try {
      const users = this.getStoredUsers();
      
      // Check if user already exists
      if (users.some(u => u.email === email)) {
        return { user: null, error: 'Email already exists' };
      }

      if (users.some(u => u.username === username)) {
        return { user: null, error: 'Username already taken' };
      }

      const newUser = {
        id: Date.now().toString(),
        email,
        password, // In a real app, this would be hashed
        name,
        username,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
      };

      users.push(newUser);
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

      const authUser: AuthUser = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        username: newUser.username,
        avatar: newUser.avatar
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authUser));
      return { user: authUser };
    } catch {
      return { user: null, error: 'Sign up failed' };
    }
  }

  // Google Sign-in (simplified mock)
  static async signInWithGoogle(): Promise<{ user: AuthUser | null; error?: string }> {
    try {
      // Mock Google user data
      const googleUser = {
        id: 'google_' + Date.now().toString(),
        email: 'user@gmail.com',
        name: 'Google User',
        username: 'googleuser',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=google'
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(googleUser));
      return { user: googleUser };
    } catch {
      return { user: null, error: 'Google sign-in failed' };
    }
  }

  // Reset password (simplified)
  static async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const users = this.getStoredUsers();
      const userExists = users.some(u => u.email === email);
      
      if (!userExists) {
        return { success: false, error: 'Email not found' };
      }

      // In a real app, this would send an email
      return { success: true };
    } catch {
      return { success: false, error: 'Reset failed' };
    }
  }

  // Sign out
  static signOut(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Get stored users
  private static getStoredUsers(): any[] {
    try {
      const users = localStorage.getItem(this.USERS_KEY);
      return users ? JSON.parse(users) : [];
    } catch {
      return [];
    }
  }

  // Initialize with demo users
  static initializeDemoUsers(): void {
    const existingUsers = this.getStoredUsers();
    if (existingUsers.length === 0) {
      const demoUsers = [
        {
          id: '1',
          email: 'demo@example.com',
          password: 'demo123',
          name: 'Demo User',
          username: 'demo',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo'
        },
        {
          id: '2',
          email: 'jane@example.com',
          password: 'jane123',
          name: 'Jane Smith',
          username: 'jane',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane'
        }
      ];
      localStorage.setItem(this.USERS_KEY, JSON.stringify(demoUsers));
    }
  }
}