import { useEffect } from 'react';
import { analyticsService } from '../utils/analytics';
import type { User } from '../types/app';

interface UseAnalyticsTrackingProps {
  user: User | null;
  isAuthenticated: boolean;
  activeTab: string;
  loadData: () => void;
}

export function useAnalyticsTracking({
  user,
  isAuthenticated,
  activeTab,
  loadData
}: UseAnalyticsTrackingProps) {
  // Track tab changes
  useEffect(() => {
    if (user && isAuthenticated) {
      analyticsService.track(user.id, 'tab_change', { tab: activeTab });
    }
  }, [activeTab, user, isAuthenticated]);

  // Track session start
  useEffect(() => {
    if (user && isAuthenticated) {
      analyticsService.track(user.id, 'session_start');
      loadData();
    }
  }, [user, isAuthenticated, loadData]);
}