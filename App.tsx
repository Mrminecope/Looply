import { useState, useEffect, useCallback } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { MainApp } from "./components/MainApp";
import { ResponsiveLayout } from "./components/ResponsiveLayout";
import { FuturisticVideoPlayer } from "./components/video/FuturisticVideoPlayer";
import { AppLoadingState } from "./components/app-states/LoadingState";
import { AppErrorState } from "./components/app-states/ErrorState";
import { OfflineIndicator } from "./components/app-states/OfflineIndicator";
import { FloatingLIAButton } from "./components/FloatingLIAButton";
import { AnimatePresence, motion } from 'motion/react';
import { Toaster } from 'sonner@2.0.3';

// Hooks
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { useVideoPlayer } from './hooks/useVideoPlayer';
import { useAppState } from './hooks/useAppState';
import { useAppInitialization } from './hooks/useAppInitialization';
import { useAppHandlers } from './hooks/useAppHandlers';
import { useLIAButton } from './hooks/useLIAButton';

// Utils
import { AppHelpers } from './utils/app-helpers';
import { APP_CONSTANTS, CSS_CLASSES } from './utils/app-constants';
import { TOAST_CONFIG } from './utils/app-config';

export default function App() {
  // State and hooks
  const appState = useAppState();
  const { isOnline } = useNetworkStatus();
  const [performanceMetrics, setPerformanceMetrics] = useState(APP_CONSTANTS.PERFORMANCE_METRICS_INITIAL);

  // Initialize app
  useAppInitialization({
    setLoading: appState.setLoading,
    setError: appState.setError,
    setUser: appState.setUser,
    setIsAuthenticated: appState.setIsAuthenticated,
    setPosts: appState.setPosts,
    setCommunities: appState.setCommunities,
    user: appState.user,
    isAuthenticated: appState.isAuthenticated
  });

  // Video player functionality
  const {
    showVideoPlayer,
    videoPlayerIndex,
    handleVideoClick,
    handleCloseVideoPlayer,
    handleVideoSave
  } = useVideoPlayer({ videoPosts: appState.videoPosts, user: appState.user });

  // App handlers
  const handlers = useAppHandlers({
    user: appState.user,
    posts: appState.posts,
    setUser: appState.setUser,
    setPosts: appState.setPosts,
    setCommunities: appState.setCommunities,
    setShowCreateModal: appState.setShowCreateModal,
    setActiveTab: appState.setActiveTab,
    setIsAuthenticated: appState.setIsAuthenticated,
    setShowAuthModal: appState.setShowAuthModal,
    setError: appState.setError,
    setLoading: appState.setLoading
  });

  // LIA button management
  useLIAButton({
    isAuthenticated: appState.isAuthenticated,
    showCreateModal: appState.showCreateModal,
    showVideoPlayer,
    setShowLIAButton: appState.setShowLIAButton
  });

  // Event handlers
  const handleError = useCallback(
    AppHelpers.createErrorHandler(setPerformanceMetrics),
    [setPerformanceMetrics]
  );

  const handleLIAApply = useCallback(
    AppHelpers.createLIAApplyHandler({
      showCreateModal: appState.showCreateModal,
      handleLIAApply: handlers.handleLIAApply
    }),
    [appState.showCreateModal, handlers.handleLIAApply]
  );

  const handleRetry = useCallback(
    AppHelpers.createRetryHandler({
      setError: appState.setError,
      setLoading: appState.setLoading
    }),
    [appState.setError, appState.setLoading]
  );

  // Performance monitoring
  useEffect(() => {
    const cleanup = AppHelpers.createPerformanceHandler(setPerformanceMetrics)();
    return cleanup;
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = AppHelpers.createKeyboardHandler({
      showVideoPlayer,
      showCreateModal: appState.showCreateModal,
      showAuthModal: appState.showAuthModal,
      isAuthenticated: appState.isAuthenticated,
      activeTab: appState.activeTab,
      handleCloseVideoPlayer,
      setShowCreateModal: appState.setShowCreateModal,
      setShowAuthModal: appState.setShowAuthModal,
      handleTabChange: handlers.handleTabChange
    });

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    showVideoPlayer,
    appState.showCreateModal,
    appState.showAuthModal,
    appState.isAuthenticated,
    appState.activeTab,
    handleCloseVideoPlayer,
    handlers.handleTabChange
  ]);

  // Loading state
  if (appState.loading) {
    return (
      <motion.div {...APP_CONSTANTS.ANIMATION_CONFIG.INITIAL_FADE} 
                  animate={APP_CONSTANTS.ANIMATION_CONFIG.ANIMATE_FADE} 
                  exit={APP_CONSTANTS.ANIMATION_CONFIG.EXIT_FADE}>
        <AppLoadingState />
      </motion.div>
    );
  }

  // Error state
  if (appState.error) {
    return (
      <motion.div {...APP_CONSTANTS.ANIMATION_CONFIG.ERROR_INITIAL}
                  animate={APP_CONSTANTS.ANIMATION_CONFIG.ERROR_ANIMATE}
                  exit={APP_CONSTANTS.ANIMATION_CONFIG.ERROR_EXIT}>
        <AppErrorState 
          error={appState.error} 
          onRetry={handleRetry}
          isOnline={isOnline}
        />
      </motion.div>
    );
  }

  // Welcome screen for unauthenticated users
  if (!appState.isAuthenticated) {
    return (
      <motion.div {...APP_CONSTANTS.ANIMATION_CONFIG.WELCOME_INITIAL}
                  animate={APP_CONSTANTS.ANIMATION_CONFIG.WELCOME_ANIMATE}
                  exit={APP_CONSTANTS.ANIMATION_CONFIG.WELCOME_EXIT}
                  transition={APP_CONSTANTS.TRANSITIONS.WELCOME}>
        <WelcomeScreen
          showAuthModal={appState.showAuthModal}
          isOnline={isOnline}
          onGetStarted={() => appState.setShowAuthModal(true)}
          onCloseAuth={() => appState.setShowAuthModal(false)}
          onAuthSuccess={handlers.handleAuthSuccess}
        />
      </motion.div>
    );
  }

  // Main authenticated app
  return (
    <ErrorBoundary onError={handleError}>
      <ResponsiveLayout>
        <motion.div 
          className={CSS_CLASSES.MOBILE_OPTIMIZED}
          {...APP_CONSTANTS.ANIMATION_CONFIG.APP_INITIAL}
          animate={APP_CONSTANTS.ANIMATION_CONFIG.APP_ANIMATE}
          transition={APP_CONSTANTS.TRANSITIONS.DEFAULT}
        >
          <MainApp
            user={appState.user}
            activeTab={appState.activeTab}
            posts={appState.posts}
            communities={appState.communities}
            showCreateModal={appState.showCreateModal}
            profileTab={appState.profileTab}
            settingsTab={appState.settingsTab}
            analyticsTimeRange={appState.analyticsTimeRange}
            isOnline={isOnline}
            joinedCommunities={appState.joinedCommunities}
            userPosts={appState.userPosts}
            mediaPosts={appState.mediaPosts}
            onTabChange={handlers.handleTabChange}
            onCreatePost={handlers.handleCreatePost}
            onCloseCreateModal={() => appState.setShowCreateModal(false)}
            onLike={handlers.handleLike}
            onComment={handlers.handleComment}
            onShare={handlers.handleShare}
            onView={handlers.handlePostView}
            onJoinCommunity={handlers.handleJoinCommunity}
            onCreateCommunity={handlers.handleCreateCommunity}
            onMarkNotificationRead={handlers.handleMarkNotificationRead}
            onMarkAllNotificationsRead={handlers.handleMarkAllNotificationsRead}
            onUpdateProfile={handlers.handleUpdateProfile}
            onDataChange={handlers.handleDataChange}
            onProfileTabChange={appState.setProfileTab}
            onSettingsTabChange={appState.setSettingsTab}
            onAnalyticsTimeRangeChange={appState.setAnalyticsTimeRange}
            onVideoClick={(videoId, index) => handleVideoClick(videoId, index)}
          />

          {/* Video Player */}
          <AnimatePresence>
            {showVideoPlayer && appState.videoPosts.length > 0 && (
              <ErrorBoundary>
                <motion.div
                  {...APP_CONSTANTS.ANIMATION_CONFIG.VIDEO_INITIAL}
                  animate={APP_CONSTANTS.ANIMATION_CONFIG.VIDEO_ANIMATE}
                  exit={APP_CONSTANTS.ANIMATION_CONFIG.VIDEO_EXIT}
                  transition={APP_CONSTANTS.TRANSITIONS.VIDEO_SPRING}
                >
                  <FuturisticVideoPlayer
                    posts={appState.videoPosts}
                    initialIndex={videoPlayerIndex}
                    onClose={handleCloseVideoPlayer}
                    onLike={handlers.handleLike}
                    onComment={handlers.handleComment}
                    onShare={handlers.handleShare}
                    onSave={handleVideoSave}
                    currentUserId={appState.user?.id}
                  />
                </motion.div>
              </ErrorBoundary>
            )}
          </AnimatePresence>

          {/* Offline Indicator */}
          <OfflineIndicator isOnline={isOnline} />

          {/* Floating LIA V3 Button */}
          <FloatingLIAButton
            showLIAButton={appState.showLIAButton}
            text={appState.memoizedLiaText}
            onApply={handleLIAApply}
            currentContent=""
            context={AppHelpers.getLIAContext(appState.user)}
          />

          {/* Toast Container */}
          <Toaster {...TOAST_CONFIG} />
        </motion.div>
      </ResponsiveLayout>
    </ErrorBoundary>
  );
}