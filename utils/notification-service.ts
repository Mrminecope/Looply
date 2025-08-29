// Notification Service for Looply
// Handles push notifications, in-app notifications, and user preferences

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
  timestamp?: number;
  priority?: 'high' | 'normal' | 'low';
  category?: 'social' | 'message' | 'system' | 'promotion';
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface NotificationPreferences {
  enabled: boolean;
  likes: boolean;
  comments: boolean;
  mentions: boolean;
  follows: boolean;
  messages: boolean;
  communities: boolean;
  reels: boolean;
  system: boolean;
  sound: boolean;
  vibration: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
}

class NotificationService {
  private permission: NotificationPermission = 'default';
  private registration: ServiceWorkerRegistration | null = null;
  private preferences: NotificationPreferences;

  constructor() {
    this.preferences = this.loadPreferences();
    this.initialize();
  }

  // Initialize the notification service
  async initialize(): Promise<void> {
    try {
      // Check if notifications are supported
      if (!('Notification' in window)) {
        console.warn('This browser does not support notifications');
        return;
      }

      // Check if service workers are supported
      if (!('serviceWorker' in navigator)) {
        console.warn('This browser does not support service workers');
        return;
      }

      // Get current permission status
      this.permission = Notification.permission;

      // Register service worker if not already registered
      await this.registerServiceWorker();

      // Set up message handlers for service worker communication
      this.setupMessageHandlers();

      console.log('✅ Notification service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize notification service:', error);
    }
  }

  // Register service worker for push notifications
  private async registerServiceWorker(): Promise<void> {
    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered:', this.registration);

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      
      // Update registration reference
      this.registration = await navigator.serviceWorker.getRegistration('/');
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  // Set up message handlers for service worker communication
  private setupMessageHandlers(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        const { type, data } = event.data;

        switch (type) {
          case 'NOTIFICATION_CLICK':
            this.handleNotificationClick(data);
            break;
          case 'NOTIFICATION_ACTION':
            this.handleNotificationAction(data);
            break;
          case 'NOTIFICATION_CLOSE':
            this.handleNotificationClose(data);
            break;
          default:
            console.log('Unknown message from service worker:', event.data);
        }
      });
    }
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (this.permission === 'granted') {
      return 'granted';
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;

    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      
      // Subscribe to push notifications
      await this.subscribeToPush();
    } else {
      console.log('❌ Notification permission denied');
    }

    return permission;
  }

  // Subscribe to push notifications
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.registration) {
      console.error('Service worker not registered');
      return null;
    }

    try {
      // Check if already subscribed
      let subscription = await this.registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Create new subscription
        const vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY || 
          'BLd3_RsaZq-lwGB-ji5V0-lxcgqQk9rjKLFxpDEUkS7bMNOGwdwdWqHsrBpRZ9xrIqrKmgL4jhDuAeH0p4-Lb1k'; // Demo key
        
        subscription = await this.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
        });

        console.log('✅ Push subscription created:', subscription);
      }

      // Send subscription to server (when backend is ready)
      await this.sendSubscriptionToServer(subscription);

      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  // Convert VAPID key
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Send subscription to server (placeholder for backend integration)
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      // This would send the subscription to your backend server
      // For now, store it locally for when backend is ready
      localStorage.setItem('push_subscription', JSON.stringify(subscription.toJSON()));
      
      console.log('Push subscription stored locally (ready for backend integration)');
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
    }
  }

  // Show local notification
  async showNotification(payload: NotificationPayload): Promise<void> {
    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    // Check if notifications are enabled
    if (!this.preferences.enabled) {
      console.log('Notifications disabled by user');
      return;
    }

    // Check category preferences
    if (payload.category && !this.isCategoryEnabled(payload.category)) {
      console.log(`Notifications for category '${payload.category}' disabled`);
      return;
    }

    // Check quiet hours
    if (this.isInQuietHours()) {
      console.log('In quiet hours, notification suppressed');
      return;
    }

    try {
      const options: NotificationOptions = {
        body: payload.body,
        icon: payload.icon || '/icons/icon-192x192.png',
        badge: payload.badge || '/icons/icon-72x72.png',
        image: payload.image,
        tag: payload.tag || `looply-${Date.now()}`,
        data: {
          ...payload.data,
          timestamp: payload.timestamp || Date.now(),
          category: payload.category
        },
        actions: payload.actions,
        requireInteraction: payload.priority === 'high',
        silent: !this.preferences.sound,
        vibrate: this.preferences.vibration ? [200, 100, 200] : undefined,
        timestamp: payload.timestamp || Date.now()
      };

      if (this.registration) {
        // Use service worker to show notification (supports actions)
        await this.registration.showNotification(payload.title, options);
      } else {
        // Fallback to basic notification
        new Notification(payload.title, options);
      }

      console.log('✅ Notification shown:', payload.title);
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }

  // Show notification for specific types
  async showLikeNotification(userName: string, postContent: string): Promise<void> {
    await this.showNotification({
      title: '❤️ New Like',
      body: `${userName} liked your post: "${postContent.substring(0, 50)}..."`,
      category: 'social',
      priority: 'normal',
      actions: [
        { action: 'view_post', title: 'View Post', icon: '/icons/view.png' },
        { action: 'like_back', title: 'Like Back', icon: '/icons/heart.png' }
      ],
      data: { type: 'like', userName, postContent }
    });
  }

  async showCommentNotification(userName: string, comment: string, postContent: string): Promise<void> {
    await this.showNotification({
      title: '💬 New Comment',
      body: `${userName}: ${comment.substring(0, 80)}...`,
      category: 'social',
      priority: 'normal',
      actions: [
        { action: 'view_post', title: 'View Post', icon: '/icons/view.png' },
        { action: 'reply', title: 'Reply', icon: '/icons/reply.png' }
      ],
      data: { type: 'comment', userName, comment, postContent }
    });
  }

  async showFollowNotification(userName: string, userAvatar?: string): Promise<void> {
    await this.showNotification({
      title: '👤 New Follower',
      body: `${userName} started following you`,
      category: 'social',
      priority: 'normal',
      image: userAvatar,
      actions: [
        { action: 'view_profile', title: 'View Profile', icon: '/icons/profile.png' },
        { action: 'follow_back', title: 'Follow Back', icon: '/icons/follow.png' }
      ],
      data: { type: 'follow', userName, userAvatar }
    });
  }

  async showMessageNotification(senderName: string, message: string, avatar?: string): Promise<void> {
    await this.showNotification({
      title: `💌 Message from ${senderName}`,
      body: message,
      category: 'message',
      priority: 'high',
      image: avatar,
      actions: [
        { action: 'reply_message', title: 'Reply', icon: '/icons/reply.png' },
        { action: 'view_chat', title: 'View Chat', icon: '/icons/chat.png' }
      ],
      data: { type: 'message', senderName, message, avatar }
    });
  }

  // Handle notification interactions
  private handleNotificationClick(data: any): void {
    console.log('Notification clicked:', data);
    
    // Navigate to appropriate screen based on notification type
    switch (data.type) {
      case 'like':
      case 'comment':
        // Navigate to post
        window.location.hash = '#/post/' + data.postId;
        break;
      case 'follow':
        // Navigate to profile
        window.location.hash = '#/profile/' + data.userId;
        break;
      case 'message':
        // Navigate to chat
        window.location.hash = '#/messages/' + data.chatId;
        break;
      default:
        // Navigate to main app
        window.location.hash = '#/';
    }
  }

  private handleNotificationAction(data: any): void {
    console.log('Notification action:', data);
    
    const { action, notificationData } = data;
    
    switch (action) {
      case 'view_post':
        window.location.hash = '#/post/' + notificationData.postId;
        break;
      case 'like_back':
        // TODO: Implement like functionality
        break;
      case 'reply':
        window.location.hash = '#/post/' + notificationData.postId + '?reply=true';
        break;
      case 'view_profile':
        window.location.hash = '#/profile/' + notificationData.userId;
        break;
      case 'follow_back':
        // TODO: Implement follow functionality
        break;
      case 'reply_message':
        window.location.hash = '#/messages/' + notificationData.chatId + '?reply=true';
        break;
      case 'view_chat':
        window.location.hash = '#/messages/' + notificationData.chatId;
        break;
    }
  }

  private handleNotificationClose(data: any): void {
    console.log('Notification closed:', data);
    // Analytics tracking could go here
  }

  // Preference management
  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  updatePreferences(newPreferences: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...newPreferences };
    this.savePreferences();
    console.log('Notification preferences updated:', this.preferences);
  }

  private loadPreferences(): NotificationPreferences {
    try {
      const stored = localStorage.getItem('notification_preferences');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }

    // Default preferences
    return {
      enabled: true,
      likes: true,
      comments: true,
      mentions: true,
      follows: true,
      messages: true,
      communities: true,
      reels: true,
      system: true,
      sound: true,
      vibration: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      }
    };
  }

  private savePreferences(): void {
    try {
      localStorage.setItem('notification_preferences', JSON.stringify(this.preferences));
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    }
  }

  private isCategoryEnabled(category: string): boolean {
    switch (category) {
      case 'social':
        return this.preferences.likes || this.preferences.comments || this.preferences.follows;
      case 'message':
        return this.preferences.messages;
      case 'system':
        return this.preferences.system;
      default:
        return true;
    }
  }

  private isInQuietHours(): boolean {
    if (!this.preferences.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = this.preferences.quietHours.start.split(':').map(Number);
    const [endHour, endMin] = this.preferences.quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime < endTime) {
      // Same day (e.g., 14:00 to 18:00)
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Crosses midnight (e.g., 22:00 to 08:00)
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  // Utility methods
  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  async clearAllNotifications(): Promise<void> {
    if (this.registration) {
      const notifications = await this.registration.getNotifications();
      notifications.forEach(notification => notification.close());
      console.log(`Cleared ${notifications.length} notifications`);
    }
  }

  // Test notification (for debugging)
  async testNotification(): Promise<void> {
    await this.showNotification({
      title: '🚀 Looply Test',
      body: 'Push notifications are working perfectly!',
      category: 'system',
      priority: 'normal',
      actions: [
        { action: 'dismiss', title: 'Dismiss', icon: '/icons/close.png' }
      ]
    });
  }
}

// Create singleton instance
export const notificationService = new NotificationService();

// Export types
export type { NotificationPreferences, NotificationPayload, NotificationAction };