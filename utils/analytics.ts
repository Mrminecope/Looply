interface AnalyticsEvent {
  userId: string;
  event: string;
  properties?: Record<string, any>;
  timestamp: string;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private isEnabled: boolean = true;
  private maxEvents: number = 1000; // Limit stored events
  private batchSize: number = 10; // Batch size for processing
  private lastLogTime: number = 0;
  private logThrottle: number = 100; // Minimum time between logs (ms)

  track(
    userId: string,
    event: string,
    properties?: Record<string, any>,
  ) {
    if (!this.isEnabled) return;

    // Throttle logging to prevent spam
    const now = Date.now();
    if (now - this.lastLogTime < this.logThrottle) {
      return;
    }
    this.lastLogTime = now;

    const analyticsEvent: AnalyticsEvent = {
      userId,
      event,
      properties,
      timestamp: new Date().toISOString(),
    };

    // Limit memory usage
    if (this.events.length >= this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents / 2); // Keep only recent half
    }

    this.events.push(analyticsEvent);

    // Only log important events to reduce console spam
    const importantEvents = [
      "session_start",
      "user_login",
      "user_logout",
      "post_created",
      "error_occurred",
    ];

    if (
      importantEvents.includes(event) ||
      properties?.important
    ) {
      console.log("📊 Analytics:", {
        event,
        userId: userId.substring(0, 8) + "...", // Truncate for privacy
        timestamp: analyticsEvent.timestamp
          .split("T")[1]
          .split(".")[0], // Just time
      });
    }
  }

  getEvents(userId?: string): AnalyticsEvent[] {
    if (userId) {
      return this.events.filter(
        (event) => event.userId === userId,
      );
    }
    return this.events.slice(); // Return copy
  }

  getEventsByType(eventType: string): AnalyticsEvent[] {
    return this.events.filter(
      (event) => event.event === eventType,
    );
  }

  clearEvents(): void {
    this.events = [];
  }

  disable(): void {
    this.isEnabled = false;
  }

  enable(): void {
    this.isEnabled = true;
  }

  // Get analytics summary without logging
  getSummary(): Record<string, number> {
    const summary: Record<string, number> = {};

    this.events.forEach((event) => {
      summary[event.event] = (summary[event.event] || 0) + 1;
    });

    return summary;
  }

  // Process events in batches to prevent blocking
  private async processBatch(
    events: AnalyticsEvent[],
  ): Promise<void> {
    // In production, this would send to analytics service
    // For demo, we just simulate processing
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate API call
        resolve();
      }, 10);
    });
  }

  // Batch process events periodically
  async flush(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToProcess = this.events.splice(
      0,
      this.batchSize,
    );
    await this.processBatch(eventsToProcess);
  }

  // Get user activity stats
  getUserStats(userId: string): Record<string, any> {
    const userEvents = this.getEvents(userId);

    return {
      totalEvents: userEvents.length,
      uniqueEventTypes: [
        ...new Set(userEvents.map((e) => e.event)),
      ].length,
      lastActivity:
        userEvents[userEvents.length - 1]?.timestamp,
      mostCommonEvent: this.getMostCommonEvent(userEvents),
    };
  }

  // End user session (for logout/sign out)
  endSession(): void {
    // Flush any remaining events before ending session
    this.flush().catch(() => {
      // Silently handle errors
    });
    
    // Clear events for privacy
    this.clearEvents();
    
    // Track session end if needed
    if (this.isEnabled) {
      console.log('📊 Analytics: Session ended');
    }
  }

  private getMostCommonEvent(
    events: AnalyticsEvent[],
  ): string | null {
    if (events.length === 0) return null;

    const eventCounts: Record<string, number> = {};
    events.forEach((event) => {
      eventCounts[event.event] =
        (eventCounts[event.event] || 0) + 1;
    });

    return (
      Object.entries(eventCounts).sort(
        ([, a], [, b]) => b - a,
      )[0]?.[0] || null
    );
  }
}

export const analyticsService = new AnalyticsService();

// Auto-flush events periodically to prevent memory buildup
if (typeof window !== "undefined") {
  setInterval(() => {
    analyticsService.flush().catch(() => {
      // Silently handle errors to prevent console spam
    });
  }, 30000); // Flush every 30 seconds
}