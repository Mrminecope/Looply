import { useState, useMemo } from 'react';
import { 
  DEFAULT_ACTIVE_TAB,
  DEFAULT_PROFILE_TAB,
  DEFAULT_SETTINGS_TAB,
  DEFAULT_ANALYTICS_TIME_RANGE
} from '../utils/app-constants';
import type { User, Post, Community } from '../types/app';

export function useAppState() {
  // Core app state
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState(DEFAULT_ACTIVE_TAB);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLIAButton, setShowLIAButton] = useState(false);

  // Profile and settings state
  const [profileTab, setProfileTab] = useState(DEFAULT_PROFILE_TAB);
  const [settingsTab, setSettingsTab] = useState(DEFAULT_SETTINGS_TAB);
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState(DEFAULT_ANALYTICS_TIME_RANGE);

  // Data state
  const [posts, setPosts] = useState<Post[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);

  // Derived state - memoized for performance
  const joinedCommunities = useMemo(() => {
    if (!user?.joinedCommunities) return [];
    return communities.filter(community => 
      user.joinedCommunities?.includes(community.id)
    );
  }, [communities, user?.joinedCommunities]);

  const userPosts = useMemo(() => {
    if (!user) return [];
    return posts.filter(post => post.author.id === user.id);
  }, [posts, user?.id]);

  const mediaPosts = useMemo(() => {
    return posts.filter(post => post.type === 'image' || post.type === 'video');
  }, [posts]);

  const videoPosts = useMemo(() => {
    return posts.filter(post => post.type === 'video');
  }, [posts]);

  const imagePosts = useMemo(() => {
    return posts.filter(post => post.type === 'image');
  }, [posts]);

  const textPosts = useMemo(() => {
    return posts.filter(post => post.type === 'text');
  }, [posts]);

  // LIA text based on current state
  const memoizedLiaText = useMemo(() => {
    if (showCreateModal) {
      return "Get LIA's help with your post";
    }
    
    if (activeTab === 'profile') {
      return "Ask LIA to optimize your profile";
    }
    
    if (activeTab === 'communities') {
      return "Get LIA's community suggestions";
    }
    
    return "Ask LIA for assistance";
  }, [showCreateModal, activeTab]);

  // User statistics
  const userStats = useMemo(() => {
    if (!user) return null;
    
    const totalLikes = userPosts.reduce((sum, post) => sum + post.likes, 0);
    const totalComments = userPosts.reduce((sum, post) => sum + post.comments, 0);
    const totalShares = userPosts.reduce((sum, post) => sum + post.shares, 0);
    const totalViews = userPosts.reduce((sum, post) => sum + post.views, 0);
    
    return {
      postsCount: userPosts.length,
      totalLikes,
      totalComments,
      totalShares,
      totalViews,
      totalEngagement: totalLikes + totalComments + totalShares,
      averageLikesPerPost: userPosts.length > 0 ? Math.round(totalLikes / userPosts.length) : 0,
      averageEngagementPerPost: userPosts.length > 0 ? Math.round((totalLikes + totalComments + totalShares) / userPosts.length) : 0
    };
  }, [userPosts]);

  // Community statistics
  const communityStats = useMemo(() => {
    const ownedCommunities = communities.filter(community => 
      community.moderators.includes(user?.id || '')
    );
    
    const totalMembers = joinedCommunities.reduce((sum, community) => sum + community.memberCount, 0);
    
    return {
      joinedCount: joinedCommunities.length,
      ownedCount: ownedCommunities.length,
      totalMembers,
      averageMembersInJoined: joinedCommunities.length > 0 ? Math.round(totalMembers / joinedCommunities.length) : 0
    };
  }, [communities, joinedCommunities, user?.id]);

  // Notification count
  const unreadNotificationCount = useMemo(() => {
    if (!user?.notifications) return 0;
    return user.notifications.filter(notification => !notification.read).length;
  }, [user?.notifications]);

  // App health status
  const appStatus = useMemo(() => {
    return {
      isLoading: loading,
      hasError: !!error,
      isAuthenticated,
      hasUser: !!user,
      hasData: posts.length > 0 || communities.length > 0,
      isOnline: navigator.onLine
    };
  }, [loading, error, isAuthenticated, user, posts.length, communities.length]);

  return {
    // Core state
    user,
    isAuthenticated,
    loading,
    error,
    
    // UI state
    activeTab,
    showCreateModal,
    showAuthModal,
    showLIAButton,
    profileTab,
    settingsTab,
    analyticsTimeRange,
    
    // Data state
    posts,
    communities,
    
    // Derived state
    joinedCommunities,
    userPosts,
    mediaPosts,
    videoPosts,
    imagePosts,
    textPosts,
    memoizedLiaText,
    userStats,
    communityStats,
    unreadNotificationCount,
    appStatus,
    
    // Setters
    setUser,
    setIsAuthenticated,
    setLoading,
    setError,
    setActiveTab,
    setShowCreateModal,
    setShowAuthModal,
    setShowLIAButton,
    setProfileTab,
    setSettingsTab,
    setAnalyticsTimeRange,
    setPosts,
    setCommunities
  };
}

export default useAppState;