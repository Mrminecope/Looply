export interface ModerationResult {
  isBlocked: boolean;
  reason?: string;
  confidence?: number;
  flaggedWords?: string[];
}

export interface RateLimit {
  action: string;
  count: number;
  windowStart: number;
  windowDuration: number; // in milliseconds
}

export interface UserViolation {
  id: string;
  userId: string;
  type: 'content' | 'behavior' | 'spam' | 'harassment' | 'copyright';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  moderatorId?: string;
  contentId?: string;
}

export interface ContentReport {
  id: string;
  reporterId: string;
  contentId: string;
  contentType: 'post' | 'comment' | 'user' | 'community';
  reason: 'spam' | 'harassment' | 'hate_speech' | 'violence' | 'nudity' | 'copyright' | 'misinformation' | 'other';
  description?: string;
  timestamp: string;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  moderatorId?: string;
  moderatorNotes?: string;
}

class ModerationService {
  private readonly PROFANITY_LIST = [
    // Basic profanity list - in production, use a more comprehensive list
    'damn', 'hell', 'crap', 'stupid', 'idiot', 'moron', 'dumb', 'shut up',
    // Add more words as needed - this is a very basic example
  ];

  private readonly SUSPICIOUS_PATTERNS = [
    /\b(?:click here|buy now|free money|get rich|make money fast)\b/i,
    /\b(?:viagra|cialis|casino|lottery|winner)\b/i,
    /(?:https?:\/\/)?(?:bit\.ly|tinyurl|t\.co)/i, // Suspicious short URLs
    /[A-Z]{5,}/g, // Excessive caps
  ];

  private readonly RATE_LIMITS = {
    posts: { count: 10, window: 60 * 60 * 1000 }, // 10 posts per hour
    comments: { count: 50, window: 60 * 60 * 1000 }, // 50 comments per hour
    likes: { count: 200, window: 60 * 60 * 1000 }, // 200 likes per hour
    follows: { count: 100, window: 24 * 60 * 60 * 1000 }, // 100 follows per day
    reports: { count: 20, window: 24 * 60 * 60 * 1000 }, // 20 reports per day
  };

  private readonly REPORTS_KEY = 'social_app_reports';
  private readonly VIOLATIONS_KEY = 'social_app_violations';
  private readonly RATE_LIMITS_KEY = 'social_app_rate_limits';
  private readonly BLOCKED_USERS_KEY = 'social_app_blocked_users';

  // Content moderation methods
  moderateText(text: string): ModerationResult {
    const lowerText = text.toLowerCase();
    const flaggedWords: string[] = [];
    let severity = 0;

    // Check for profanity
    for (const word of this.PROFANITY_LIST) {
      if (lowerText.includes(word.toLowerCase())) {
        flaggedWords.push(word);
        severity += 1;
      }
    }

    // Check for suspicious patterns
    for (const pattern of this.SUSPICIOUS_PATTERNS) {
      if (pattern.test(text)) {
        severity += 2;
      }
    }

    // Check for excessive caps (more than 50% uppercase)
    const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
    if (capsRatio > 0.5 && text.length > 10) {
      severity += 1;
    }

    // Check for repeated characters (spam indicators)
    if (/(.)\1{4,}/.test(text)) {
      severity += 2;
    }

    const isBlocked = severity >= 3;
    const confidence = Math.min(severity / 5, 1);

    return {
      isBlocked,
      reason: isBlocked ? 'Content violates community guidelines' : undefined,
      confidence,
      flaggedWords: flaggedWords.length > 0 ? flaggedWords : undefined
    };
  }

  // Rate limiting methods
  checkRateLimit(userId: string, action: keyof typeof this.RATE_LIMITS): boolean {
    const rateLimits = this.getRateLimits();
    const userLimits = rateLimits[userId] || {};
    const actionLimit = userLimits[action];
    const config = this.RATE_LIMITS[action];
    const now = Date.now();

    if (!actionLimit) {
      // First action of this type
      this.updateRateLimit(userId, action, 1, now);
      return true;
    }

    // Check if window has expired
    if (now - actionLimit.windowStart > config.window) {
      // Reset window
      this.updateRateLimit(userId, action, 1, now);
      return true;
    }

    // Check if within limit
    if (actionLimit.count >= config.count) {
      return false; // Rate limit exceeded
    }

    // Increment count
    this.updateRateLimit(userId, action, actionLimit.count + 1, actionLimit.windowStart);
    return true;
  }

  private getRateLimits(): Record<string, Record<string, RateLimit>> {
    const data = localStorage.getItem(this.RATE_LIMITS_KEY);
    return data ? JSON.parse(data) : {};
  }

  private updateRateLimit(userId: string, action: string, count: number, windowStart: number): void {
    const rateLimits = this.getRateLimits();
    const config = this.RATE_LIMITS[action as keyof typeof this.RATE_LIMITS];
    
    if (!rateLimits[userId]) {
      rateLimits[userId] = {};
    }

    rateLimits[userId][action] = {
      action,
      count,
      windowStart,
      windowDuration: config.window
    };

    localStorage.setItem(this.RATE_LIMITS_KEY, JSON.stringify(rateLimits));
  }

  // Reporting methods
  createReport(report: Omit<ContentReport, 'id' | 'timestamp' | 'status'>): ContentReport {
    const reports = this.getReports();
    const newReport: ContentReport = {
      ...report,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    reports.push(newReport);
    localStorage.setItem(this.REPORTS_KEY, JSON.stringify(reports));
    return newReport;
  }

  getReports(): ContentReport[] {
    const data = localStorage.getItem(this.REPORTS_KEY);
    return data ? JSON.parse(data) : [];
  }

  updateReport(reportId: string, updates: Partial<ContentReport>): boolean {
    const reports = this.getReports();
    const index = reports.findIndex(r => r.id === reportId);
    
    if (index === -1) return false;

    reports[index] = { ...reports[index], ...updates };
    localStorage.setItem(this.REPORTS_KEY, JSON.stringify(reports));
    return true;
  }

  // Violation tracking
  createViolation(violation: Omit<UserViolation, 'id' | 'timestamp' | 'status'>): UserViolation {
    const violations = this.getViolations();
    const newViolation: UserViolation = {
      ...violation,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    violations.push(newViolation);
    localStorage.setItem(this.VIOLATIONS_KEY, JSON.stringify(violations));
    return newViolation;
  }

  getViolations(): UserViolation[] {
    const data = localStorage.getItem(this.VIOLATIONS_KEY);
    return data ? JSON.parse(data) : [];
  }

  getUserViolations(userId: string): UserViolation[] {
    return this.getViolations().filter(v => v.userId === userId);
  }

  // User blocking/banning
  blockUser(userId: string, reason: string, duration?: number): void {
    const blockedUsers = this.getBlockedUsers();
    const blockExpiry = duration ? Date.now() + duration : null;
    
    blockedUsers[userId] = {
      reason,
      timestamp: new Date().toISOString(),
      expiry: blockExpiry ? new Date(blockExpiry).toISOString() : null,
      permanent: !duration
    };

    localStorage.setItem(this.BLOCKED_USERS_KEY, JSON.stringify(blockedUsers));
  }

  unblockUser(userId: string): void {
    const blockedUsers = this.getBlockedUsers();
    delete blockedUsers[userId];
    localStorage.setItem(this.BLOCKED_USERS_KEY, JSON.stringify(blockedUsers));
  }

  isUserBlocked(userId: string): boolean {
    const blockedUsers = this.getBlockedUsers();
    const blockInfo = blockedUsers[userId];
    
    if (!blockInfo) return false;
    if (blockInfo.permanent) return true;
    if (blockInfo.expiry && new Date(blockInfo.expiry) > new Date()) return true;
    
    // Block has expired
    if (blockInfo.expiry && new Date(blockInfo.expiry) <= new Date()) {
      this.unblockUser(userId);
      return false;
    }

    return false;
  }

  private getBlockedUsers(): Record<string, any> {
    const data = localStorage.getItem(this.BLOCKED_USERS_KEY);
    return data ? JSON.parse(data) : {};
  }

  // Utility methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Admin methods
  getReportsByStatus(status: ContentReport['status']): ContentReport[] {
    return this.getReports().filter(r => r.status === status);
  }

  getViolationsByStatus(status: UserViolation['status']): UserViolation[] {
    return this.getViolations().filter(v => v.status === status);
  }

  getModerationStats(): {
    totalReports: number;
    pendingReports: number;
    totalViolations: number;
    blockedUsers: number;
    reportsToday: number;
  } {
    const reports = this.getReports();
    const violations = this.getViolations();
    const blockedUsers = Object.keys(this.getBlockedUsers()).length;
    const today = new Date().toDateString();
    const reportsToday = reports.filter(r => 
      new Date(r.timestamp).toDateString() === today
    ).length;

    return {
      totalReports: reports.length,
      pendingReports: reports.filter(r => r.status === 'pending').length,
      totalViolations: violations.length,
      blockedUsers,
      reportsToday
    };
  }
}

export const moderationService = new ModerationService();