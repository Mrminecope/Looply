/**
 * Landing Page Analytics Integration
 * Tracks user behavior, conversion events, and engagement metrics
 */

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
}

interface ConversionFunnel {
  step: string;
  timestamp: number;
  source?: string;
  medium?: string;
  campaign?: string;
}

class LandingAnalytics {
  private sessionId: string;
  private userId?: string;
  private conversionFunnel: ConversionFunnel[] = [];
  private startTime: number;
  private isEnabled: boolean = true;
  private debug: boolean = false;

  // Analytics providers (add your actual provider configurations)
  private providers: {
    googleAnalytics?: any;
    mixpanel?: any;
    hotjar?: any;
    posthog?: any;
    amplitude?: any;
  } = {};

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.initializeProviders();
    this.setupPageTracking();
    this.debug = process.env.NODE_ENV === 'development';
  }

  /**
   * Initialize analytics providers
   */
  private initializeProviders() {
    try {
      // Google Analytics 4
      if (window.gtag) {
        this.providers.googleAnalytics = window.gtag;
        this.log('Google Analytics initialized');
      }

      // Mixpanel
      if (window.mixpanel) {
        this.providers.mixpanel = window.mixpanel;
        this.log('Mixpanel initialized');
      }

      // Hotjar
      if (window.hj) {
        this.providers.hotjar = window.hj;
        this.log('Hotjar initialized');
      }

      // PostHog
      if (window.posthog) {
        this.providers.posthog = window.posthog;
        this.log('PostHog initialized');
      }

      // Amplitude
      if (window.amplitude) {
        this.providers.amplitude = window.amplitude;
        this.log('Amplitude initialized');
      }

      // Initialize session tracking
      this.trackEvent('session_start', {
        sessionId: this.sessionId,
        timestamp: this.startTime,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        url: window.location.href
      });

    } catch (error) {
      console.error('Analytics initialization error:', error);
    }
  }

  /**
   * Set up automatic page tracking
   */
  private setupPageTracking() {
    // Track page views
    this.trackPageView();

    // Track scroll depth
    this.setupScrollTracking();

    // Track time on page
    this.setupTimeTracking();

    // Track exit intent
    this.setupExitIntentTracking();
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Set user ID for tracking
   */
  setUserId(userId: string) {
    this.userId = userId;
    
    // Update providers with user ID
    if (this.providers.googleAnalytics) {
      this.providers.googleAnalytics('config', 'GA_MEASUREMENT_ID', {
        user_id: userId
      });
    }

    if (this.providers.mixpanel) {
      this.providers.mixpanel.identify(userId);
    }

    if (this.providers.posthog) {
      this.providers.posthog.identify(userId);
    }

    this.log('User ID set:', userId);
  }

  /**
   * Track generic events
   */
  trackEvent(eventName: string, properties: Record<string, any> = {}) {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        userId: this.userId,
        timestamp: Date.now(),
        url: window.location.href,
        referrer: document.referrer
      },
      timestamp: Date.now()
    };

    this.log('Tracking event:', event);

    // Send to all configured providers
    this.sendToProviders(event);

    // Store in local storage for debugging
    if (this.debug) {
      this.storeEventLocally(event);
    }
  }

  /**
   * Track page views
   */
  trackPageView(page?: string) {
    const pageData = {
      page: page || window.location.pathname,
      title: document.title,
      url: window.location.href,
      referrer: document.referrer,
      timestamp: Date.now()
    };

    this.trackEvent('page_view', pageData);
  }

  /**
   * Track navigation between sections
   */
  trackNavigation(section: string, source?: string) {
    this.trackEvent('navigation', {
      section,
      source: source || 'menu',
      timestamp: Date.now()
    });

    // Add to conversion funnel
    this.addToFunnel(`navigate_${section}`, source);
  }

  /**
   * Track CTA clicks with detailed context
   */
  trackCTA(ctaName: string, location: string, context?: Record<string, any>) {
    this.trackEvent('cta_click', {
      cta_name: ctaName,
      cta_location: location,
      ...context
    });

    // Add to conversion funnel
    this.addToFunnel(`cta_${ctaName}`, location);
  }

  /**
   * Track form interactions
   */
  trackFormInteraction(formName: string, action: 'start' | 'complete' | 'abandon', field?: string) {
    this.trackEvent('form_interaction', {
      form_name: formName,
      action,
      field,
      timestamp: Date.now()
    });

    if (action === 'complete') {
      this.addToFunnel(`form_${formName}_complete`);
    }
  }

  /**
   * Track search behavior
   */
  trackSearch(query: string, category?: string, resultsCount?: number) {
    this.trackEvent('search', {
      query,
      category,
      results_count: resultsCount,
      timestamp: Date.now()
    });
  }

  /**
   * Track video/media interactions
   */
  trackMediaInteraction(mediaType: 'video' | 'image', action: 'play' | 'pause' | 'complete', mediaId?: string) {
    this.trackEvent('media_interaction', {
      media_type: mediaType,
      action,
      media_id: mediaId,
      timestamp: Date.now()
    });
  }

  /**
   * Track user engagement metrics
   */
  trackEngagement(action: string, value?: number, context?: Record<string, any>) {
    this.trackEvent('engagement', {
      action,
      value,
      ...context,
      timestamp: Date.now()
    });
  }

  /**
   * Track conversion events
   */
  trackConversion(conversionType: string, value?: number, currency?: string) {
    this.trackEvent('conversion', {
      type: conversionType,
      value,
      currency: currency || 'USD',
      funnel: this.conversionFunnel,
      session_duration: Date.now() - this.startTime
    });

    // Reset funnel after conversion
    this.conversionFunnel = [];
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(feature: string, action: string, context?: Record<string, any>) {
    this.trackEvent('feature_usage', {
      feature,
      action,
      ...context,
      timestamp: Date.now()
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance() {
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      const navigationStart = timing.navigationStart;
      
      const metrics = {
        page_load_time: timing.loadEventEnd - navigationStart,
        dom_content_loaded: timing.domContentLoadedEventEnd - navigationStart,
        time_to_first_byte: timing.responseStart - navigationStart,
        dom_interactive: timing.domInteractive - navigationStart
      };

      this.trackEvent('performance', metrics);
    }
  }

  /**
   * Set up scroll depth tracking
   */
  private setupScrollTracking() {
    const thresholds = [25, 50, 75, 100];
    const triggered = new Set<number>();

    const trackScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );

      thresholds.forEach(threshold => {
        if (scrollPercent >= threshold && !triggered.has(threshold)) {
          triggered.add(threshold);
          this.trackEvent('scroll_depth', {
            depth_percent: threshold,
            timestamp: Date.now()
          });
        }
      });
    };

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          trackScroll();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  /**
   * Set up time tracking
   */
  private setupTimeTracking() {
    const intervals = [30000, 60000, 120000, 300000]; // 30s, 1m, 2m, 5m
    const triggered = new Set<number>();

    intervals.forEach(interval => {
      setTimeout(() => {
        if (!triggered.has(interval)) {
          triggered.add(interval);
          this.trackEvent('time_on_page', {
            duration_seconds: interval / 1000,
            timestamp: Date.now()
          });
        }
      }, interval);
    });
  }

  /**
   * Set up exit intent tracking
   */
  private setupExitIntentTracking() {
    let hasTriggered = false;

    const trackExitIntent = (e: MouseEvent) => {
      if (!hasTriggered && e.clientY <= 0) {
        hasTriggered = true;
        this.trackEvent('exit_intent', {
          time_on_page: Date.now() - this.startTime,
          timestamp: Date.now()
        });
      }
    };

    document.addEventListener('mouseleave', trackExitIntent);
  }

  /**
   * Add event to conversion funnel
   */
  private addToFunnel(step: string, source?: string) {
    this.conversionFunnel.push({
      step,
      timestamp: Date.now(),
      source
    });

    // Keep only last 10 steps
    if (this.conversionFunnel.length > 10) {
      this.conversionFunnel = this.conversionFunnel.slice(-10);
    }
  }

  /**
   * Send event to all configured providers
   */
  private sendToProviders(event: AnalyticsEvent) {
    // Google Analytics
    if (this.providers.googleAnalytics) {
      this.providers.googleAnalytics('event', event.name, {
        event_category: 'landing_page',
        event_label: event.properties?.section || 'general',
        custom_parameters: event.properties
      });
    }

    // Mixpanel
    if (this.providers.mixpanel) {
      this.providers.mixpanel.track(event.name, event.properties);
    }

    // Hotjar (for heatmaps and recordings)
    if (this.providers.hotjar) {
      this.providers.hotjar('event', event.name);
    }

    // PostHog
    if (this.providers.posthog) {
      this.providers.posthog.capture(event.name, event.properties);
    }

    // Amplitude
    if (this.providers.amplitude) {
      this.providers.amplitude.getInstance().logEvent(event.name, event.properties);
    }
  }

  /**
   * Store event locally for debugging
   */
  private storeEventLocally(event: AnalyticsEvent) {
    try {
      const events = JSON.parse(localStorage.getItem('looply_analytics_debug') || '[]');
      events.push(event);
      
      // Keep only last 100 events
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      
      localStorage.setItem('looply_analytics_debug', JSON.stringify(events));
    } catch (error) {
      console.warn('Could not store analytics event locally:', error);
    }
  }

  /**
   * Get analytics data for debugging
   */
  getDebugData() {
    if (!this.debug) return null;

    try {
      return {
        sessionId: this.sessionId,
        userId: this.userId,
        conversionFunnel: this.conversionFunnel,
        sessionDuration: Date.now() - this.startTime,
        events: JSON.parse(localStorage.getItem('looply_analytics_debug') || '[]')
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    this.log('Analytics', enabled ? 'enabled' : 'disabled');
  }

  /**
   * Debug logging
   */
  private log(...args: any[]) {
    if (this.debug) {
      console.log('[Looply Analytics]', ...args);
    }
  }

  /**
   * Clean up on page unload
   */
  destroy() {
    this.trackEvent('session_end', {
      session_duration: Date.now() - this.startTime,
      final_funnel: this.conversionFunnel
    });
  }
}

// Create global instance
export const landingAnalytics = new LandingAnalytics();

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  landingAnalytics.destroy();
});

// Track performance when page is fully loaded
window.addEventListener('load', () => {
  landingAnalytics.trackPerformance();
});

// Expose to window for debugging in development
if (process.env.NODE_ENV === 'development') {
  (window as any).landingAnalytics = landingAnalytics;
}

export default landingAnalytics;