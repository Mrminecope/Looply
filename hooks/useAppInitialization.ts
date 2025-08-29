import { useEffect, useCallback } from 'react';
import { localStorageService } from '../utils/local-storage-service';
import { generateMockUserData, generateMockPosts, generateMockCommunities } from '../utils/demo-data';
import { INITIALIZATION_TIMEOUT, INITIALIZATION_DELAY } from '../utils/app-constants';
import { toast } from 'sonner@2.0.3';
import type { User, Post, Community } from '../types/app';

interface UseAppInitializationProps {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setUser: (user: User | null) => void;
  setIsAuthenticated: (auth: boolean) => void;
  setPosts: (posts: Post[]) => void;
  setCommunities: (communities: Community[]) => void;
  user: User | null;
  isAuthenticated: boolean;
}

export function useAppInitialization({
  setLoading,
  setError,
  setUser,
  setIsAuthenticated,
  setPosts,
  setCommunities,
  user,
  isAuthenticated
}: UseAppInitializationProps) {
  
  const initializeApp = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, INITIALIZATION_DELAY));

      // Check for saved user session
      const savedUser = await localStorageService.getCurrentUser();
      
      if (savedUser) {
        setUser(savedUser);
        setIsAuthenticated(true);
        
        // Load user's data
        await loadUserData();
        
        console.log('User session restored:', savedUser.username);
      } else {
        // No saved session, user needs to authenticate
        setIsAuthenticated(false);
        
        // Load demo data for unauthenticated state
        await loadDemoData();
      }

    } catch (error) {
      console.error('App initialization failed:', error);
      setError('Failed to initialize app. Please refresh and try again.');
      toast.error('App initialization failed');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setUser, setIsAuthenticated, setPosts, setCommunities]);

  const loadUserData = useCallback(async () => {
    try {
      // Load posts
      const savedPosts = await localStorageService.getAllPosts();
      if (savedPosts.length > 0) {
        setPosts(savedPosts);
      } else {
        // Generate initial demo posts if none exist
        const demoPosts = generateMockPosts(30);
        await localStorageService.savePosts(demoPosts);
        setPosts(demoPosts);
      }

      // Load communities
      const savedCommunities = await localStorageService.getAllCommunities();
      if (savedCommunities.length > 0) {
        setCommunities(savedCommunities);
      } else {
        // Generate initial demo communities if none exist
        const demoCommunities = generateMockCommunities(8);
        await localStorageService.saveCommunities(demoCommunities);
        setCommunities(demoCommunities);
      }

    } catch (error) {
      console.error('Failed to load user data:', error);
      toast.error('Failed to load your data');
    }
  }, [setPosts, setCommunities]);

  const loadDemoData = useCallback(async () => {
    try {
      // Load demo posts for unauthenticated users
      const demoPosts = generateMockPosts(20);
      setPosts(demoPosts);

      // Load demo communities
      const demoCommunities = generateMockCommunities(5);
      setCommunities(demoCommunities);

    } catch (error) {
      console.error('Failed to load demo data:', error);
      // Don't show error toast for demo data failure
    }
  }, [setPosts, setCommunities]);

  const handleStorageChange = useCallback((event: StorageEvent) => {
    // Handle changes from other tabs/windows
    if (event.key === 'looply_user') {
      if (event.newValue) {
        try {
          const userData = JSON.parse(event.newValue);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to parse user data from storage:', error);
        }
      } else {
        // User logged out in another tab
        setUser(null);
        setIsAuthenticated(false);
      }
    }
  }, [setUser, setIsAuthenticated]);

  const cleanupOldData = useCallback(async () => {
    try {
      // Clean up old cached data (older than 7 days)
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7);

      const allPosts = await localStorageService.getAllPosts();
      const recentPosts = allPosts.filter(post => 
        new Date(post.timestamp) > cutoffDate
      );

      if (recentPosts.length !== allPosts.length) {
        await localStorageService.savePosts(recentPosts);
        console.log(`Cleaned up ${allPosts.length - recentPosts.length} old posts`);
      }

    } catch (error) {
      console.error('Failed to cleanup old data:', error);
    }
  }, []);

  const validateStorageIntegrity = useCallback(async () => {
    try {
      // Check if localStorage is available and working
      const testKey = 'looply_test';
      const testValue = 'test';
      
      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      if (retrieved !== testValue) {
        throw new Error('localStorage integrity check failed');
      }

      return true;
    } catch (error) {
      console.error('Storage integrity validation failed:', error);
      setError('Storage is not available. Some features may not work properly.');
      return false;
    }
  }, [setError]);

  // Initialize app on mount
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const initialize = async () => {
      // Validate storage first
      const storageValid = await validateStorageIntegrity();
      if (!storageValid) return;

      // Set timeout for initialization
      timeoutId = setTimeout(() => {
        setError('App initialization is taking longer than expected. Please refresh the page.');
        setLoading(false);
      }, INITIALIZATION_TIMEOUT);

      await initializeApp();
      
      // Cleanup old data in background
      cleanupOldData();
      
      clearTimeout(timeoutId);
    };

    initialize();

    // Listen for storage changes from other tabs
    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Only run once on mount

  // Re-initialize data when user authentication status changes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData();
    } else if (!isAuthenticated) {
      loadDemoData();
    }
  }, [isAuthenticated, user?.id]); // Re-run when auth status or user ID changes

  // Periodic data refresh (every 5 minutes)
  useEffect(() => {
    if (!isAuthenticated) return;

    const refreshInterval = setInterval(async () => {
      try {
        await loadUserData();
      } catch (error) {
        console.error('Periodic data refresh failed:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(refreshInterval);
  }, [isAuthenticated, loadUserData]);

  // Return utility functions for manual operations
  return {
    reinitialize: initializeApp,
    loadUserData,
    loadDemoData,
    cleanupOldData,
    validateStorageIntegrity
  };
}