import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { TopHeader } from './TopHeader';
import { BottomNavigation } from './BottomNavigation';
import { FeedTab } from './tabs/FeedTab';
import { ReelsTab } from './tabs/ReelsTab';
import { NotificationsTab } from './tabs/NotificationsTab';
import { ProfileTab } from './tabs/ProfileTab';
import { CommunitiesTab } from './tabs/CommunitiesTab';
import { EnhancedSearchModal } from './EnhancedSearchModal';
import { EnhancedCreatePostModal } from './posts/EnhancedCreatePostModal';
import { ErrorBoundary } from './ErrorBoundary';
import { localStorageService } from '../utils/local-storage-service';
import { toast } from 'sonner@2.0.3';
import type { User, Post, Community } from '../types/app';

interface MainAppProps {
  user: User | null;
  activeTab: string;
  posts: Post[];
  communities: Community[];
  showCreateModal: boolean;
  profileTab: string;
  settingsTab: string;
  analyticsTimeRange: '7d' | '30d' | '90d';
  isOnline: boolean;
  joinedCommunities: Community[];
  userPosts: Post[];
  mediaPosts: Post[];
  onTabChange: (tab: string) => void;
  onCreatePost: (postData: any) => Promise<void>;
  onCloseCreateModal: () => void;
  onLike: (postId: string) => void;
  onComment: (postId: string, comment: string) => void;
  onShare: (postId: string) => void;
  onView: (postId: string) => void;
  onJoinCommunity: (communityId: string) => void;
  onCreateCommunity: (communityData: any) => void;
  onMarkNotificationRead: (notificationId: string) => void;
  onMarkAllNotificationsRead: () => void;
  onUpdateProfile: (profileData: any) => Promise<void>;
  onDataChange: () => void;
  onProfileTabChange: (tab: string) => void;
  onSettingsTabChange: (tab: string) => void;
  onAnalyticsTimeRangeChange: (range: '7d' | '30d' | '90d') => void;
  onVideoClick: (videoId: string, index: number) => void;
}

export function MainApp({
  user,
  activeTab,
  posts,
  communities,
  showCreateModal,
  profileTab,
  settingsTab,
  analyticsTimeRange,
  isOnline,
  joinedCommunities,
  userPosts,
  mediaPosts,
  onTabChange,
  onCreatePost,
  onCloseCreateModal,
  onLike,
  onComment,
  onShare,
  onView,
  onJoinCommunity,
  onCreateCommunity,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onUpdateProfile,
  onDataChange,
  onProfileTabChange,
  onSettingsTabChange,
  onAnalyticsTimeRangeChange,
  onVideoClick
}: MainAppProps) {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isPageVisible, setIsPageVisible] = useState(!document.hidden);

  // Enhanced unread notifications tracking with real-time updates
  const updateNotificationCount = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const notifications = await localStorageService.getNotifications(user.id);
      const unread = notifications.filter((n: any) => !n.read).length;
      setUnreadNotifications(unread);
    } catch (error) {
      console.warn('Failed to load notifications:', error);
    }
  }, [user?.id]);

  // Load and track unread notifications
  useEffect(() => {
    updateNotificationCount();
    
    // Update every 30 seconds when page is visible
    const interval = setInterval(() => {
      if (isPageVisible) {
        updateNotificationCount();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [updateNotificationCount, isPageVisible]);

  // Handle page visibility changes for better performance
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
      if (!document.hidden) {
        updateNotificationCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [updateNotificationCount]);

  // Enhanced tab change with haptic feedback and analytics
  const handleTabChange = useCallback((tab: string) => {
    if (tab === 'search') {
      setShowSearchModal(true);
      // Track search modal open
      console.log('Search modal opened');
    } else {
      onTabChange(tab);
      // Track tab change
      console.log(`Tab changed to: ${tab}`);
    }

    // Add haptic feedback for mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }

    // Update notification count when switching to notifications tab
    if (tab === 'notifications') {
      updateNotificationCount();
    }
  }, [onTabChange, updateNotificationCount]);

  // Enhanced create post handler with validation
  const handleCreatePost = useCallback(() => {
    if (!isOnline) {
      toast.error('You need to be online to create posts');
      return;
    }
    
    onTabChange('create'); // This will trigger the create modal
    
    // Add haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 5, 10]);
    }
  }, [onTabChange, isOnline]);

  // Render tab content
  const renderTabContent = () => {
    if (!user) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Loading...</h2>
            <p className="text-muted-foreground">Please wait while we load your content.</p>
          </div>
        </div>
      );
    }

    const tabProps = {
      user,
      posts,
      communities,
      onLike,
      onComment,
      onShare,
      onView,
      onJoinCommunity,
      onCreateCommunity,
      onVideoClick
    };

    switch (activeTab) {
      case 'feed':
        return <FeedTab {...tabProps} />;
      
      case 'reels':
        return (
          <ReelsTab
            posts={posts}
            user={user}
            onVideoClick={(videoId, index) => onVideoClick(videoId, index)}
            onLike={onLike}
            onComment={onComment}
            onShare={onShare}
          />
        );
      
      case 'communities':
        return <CommunitiesTab {...tabProps} />;
      
      case 'notifications':
        return user ? (
          <NotificationsTab
            userId={user.id}
            onMarkAsRead={onMarkNotificationRead}
            onMarkAllAsRead={onMarkAllNotificationsRead}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Loading notifications...</h2>
              <p className="text-muted-foreground">Please wait while we load your notifications.</p>
            </div>
          </div>
        );
      
      case 'profile':
        return (
          <ProfileTab
            user={user}
            profileTab={profileTab}
            settingsTab={settingsTab}
            userPosts={userPosts}
            mediaPosts={mediaPosts}
            joinedCommunities={joinedCommunities}
            onProfileTabChange={onProfileTabChange}
            onSettingsTabChange={onSettingsTabChange}
            onUpdateProfile={onUpdateProfile}
            onDataChange={onDataChange}
            onLike={onLike}
            onComment={onComment}
            onShare={onShare}
            onView={onView}
          />
        );
      
      default:
        return <FeedTab {...tabProps} />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen bg-background overflow-hidden mobile-safe-area">
        {/* Top Header - Enhanced mobile optimization */}
        <TopHeader
          user={user}
          activeTab={activeTab}
          isOnline={isOnline}
          onSearch={() => {
            setShowSearchModal(true);
            // Add haptic feedback
            if ('vibrate' in navigator) {
              navigator.vibrate(5);
            }
          }}
        />

        {/* Main Content - Enhanced mobile-first layout with performance optimizations */}
        <main className="flex-1 overflow-hidden relative mobile-optimized">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 35,
                mass: 0.8
              }}
              className="h-full w-full performance-optimized"
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>

          {/* Offline indicator overlay */}
          {!isOnline && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="absolute top-4 left-4 right-4 z-50 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm text-center shadow-lg"
            >
              📱 You're offline - Some features may be limited
            </motion.div>
          )}
        </main>

        {/* Bottom Navigation - Enhanced with better touch targets */}
        <BottomNavigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onCreatePost={handleCreatePost}
          unreadNotifications={unreadNotifications}
        />

        {/* Enhanced Search Modal with better mobile UX */}
        <AnimatePresence>
          {showSearchModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <EnhancedSearchModal
                posts={posts}
                communities={communities}
                users={[user]}
                onClose={() => {
                  setShowSearchModal(false);
                  // Add haptic feedback
                  if ('vibrate' in navigator) {
                    navigator.vibrate(5);
                  }
                }}
                onUserClick={(userId) => {
                  setShowSearchModal(false);
                  // Future: Navigate to user profile
                  toast.info('User profile navigation coming soon!');
                }}
                onPostClick={(postId) => {
                  setShowSearchModal(false);
                  // Future: Navigate to specific post
                  toast.info('Post navigation coming soon!');
                }}
                onCommunityClick={(communityId) => {
                  setShowSearchModal(false);
                  // Future: Navigate to community
                  toast.info('Community navigation coming soon!');
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Create Post Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 30 }}
            >
              <EnhancedCreatePostModal
                isOpen={showCreateModal}
                user={user}
                communities={communities}
                onCreatePost={async (postData) => {
                  try {
                    await onCreatePost(postData);
                    updateNotificationCount(); // Update notifications after posting
                    // Add celebration haptic feedback
                    if ('vibrate' in navigator) {
                      navigator.vibrate([50, 30, 50, 30, 100]);
                    }
                  } catch (error) {
                    console.error('Failed to create post:', error);
                    toast.error('Failed to create post. Please try again.');
                  }
                }}
                onClose={() => {
                  onCloseCreateModal();
                  // Add haptic feedback
                  if ('vibrate' in navigator) {
                    navigator.vibrate(5);
                  }
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}