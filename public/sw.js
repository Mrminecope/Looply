// Looply Service Worker
// Handles push notifications, caching, and offline functionality

const CACHE_NAME = 'looply-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Files to cache for offline functionality
const STATIC_CACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Claim control of all pages
      return self.clients.claim();
    })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip non-HTTP(S) requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Try to fetch from network
        return fetch(event.request)
          .then((networkResponse) => {
            // Cache successful responses
            if (networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseClone);
                });
            }
            return networkResponse;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            
            // Return placeholder for images
            if (event.request.destination === 'image') {
              return new Response(
                '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#f1f5f9"/><text x="100" y="100" text-anchor="middle" fill="#64748b">Image Offline</text></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
              );
            }
            
            throw error;
          });
      })
  );
});

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

  let notificationData = {
    title: 'Looply',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'default'
  };

  // Parse push data if available
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      console.error('Error parsing push data:', error);
      notificationData.body = event.data.text() || notificationData.body;
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    data: notificationData.data || {},
    actions: notificationData.actions || [],
    requireInteraction: notificationData.requireInteraction || false,
    silent: notificationData.silent || false,
    vibrate: notificationData.vibrate || [200, 100, 200],
    timestamp: Date.now()
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  // Close the notification
  notification.close();

  // Handle action clicks
  if (action) {
    event.waitUntil(
      handleNotificationAction(action, data)
    );
  } else {
    // Handle notification body click
    event.waitUntil(
      handleNotificationClick(data)
    );
  }
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  
  const data = event.notification.data || {};
  
  // Send message to client
  event.waitUntil(
    sendMessageToClient({
      type: 'NOTIFICATION_CLOSE',
      data: data
    })
  );
});

// Handle notification action
async function handleNotificationAction(action, data) {
  console.log('Handling notification action:', action, data);

  // Send message to client about the action
  await sendMessageToClient({
    type: 'NOTIFICATION_ACTION',
    data: { action, notificationData: data }
  });

  // Open or focus the app
  const urlToOpen = getUrlForAction(action, data);
  await openOrFocusClient(urlToOpen);
}

// Handle notification click
async function handleNotificationClick(data) {
  console.log('Handling notification click:', data);

  // Send message to client
  await sendMessageToClient({
    type: 'NOTIFICATION_CLICK',
    data: data
  });

  // Open or focus the app
  const urlToOpen = getUrlForNotification(data);
  await openOrFocusClient(urlToOpen);
}

// Get URL based on action
function getUrlForAction(action, data) {
  const baseUrl = self.location.origin;
  
  switch (action) {
    case 'view_post':
      return `${baseUrl}/#/post/${data.postId || ''}`;
    case 'view_profile':
      return `${baseUrl}/#/profile/${data.userId || ''}`;
    case 'reply_message':
    case 'view_chat':
      return `${baseUrl}/#/messages/${data.chatId || ''}`;
    case 'like_back':
    case 'follow_back':
    case 'reply':
      return `${baseUrl}/#/${data.redirectTo || ''}`;
    default:
      return baseUrl;
  }
}

// Get URL based on notification type
function getUrlForNotification(data) {
  const baseUrl = self.location.origin;
  
  switch (data.type) {
    case 'like':
    case 'comment':
      return `${baseUrl}/#/post/${data.postId || ''}`;
    case 'follow':
      return `${baseUrl}/#/profile/${data.userId || ''}`;
    case 'message':
      return `${baseUrl}/#/messages/${data.chatId || ''}`;
    case 'community':
      return `${baseUrl}/#/communities/${data.communityId || ''}`;
    case 'reel':
      return `${baseUrl}/#/reels`;
    default:
      return baseUrl;
  }
}

// Open or focus client window
async function openOrFocusClient(url) {
  try {
    const clients = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    });

    // Check if there's already a window open
    for (const client of clients) {
      if ('focus' in client) {
        await client.focus();
        if (url && client.url !== url) {
          client.postMessage({
            type: 'NAVIGATE',
            url: url
          });
        }
        return;
      }
    }

    // No window open, open a new one
    if (self.clients.openWindow) {
      await self.clients.openWindow(url);
    }
  } catch (error) {
    console.error('Error opening/focusing client:', error);
  }
}

// Send message to client
async function sendMessageToClient(message) {
  try {
    const clients = await self.clients.matchAll();
    
    clients.forEach(client => {
      client.postMessage(message);
    });
  } catch (error) {
    console.error('Error sending message to client:', error);
  }
}

// Background sync event (for future implementation)
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync-posts') {
    event.waitUntil(
      syncPosts()
    );
  }
});

// Sync posts in background (placeholder for backend integration)
async function syncPosts() {
  try {
    // This would sync posts with your backend when connection is restored
    console.log('Syncing posts in background...');
    
    // For now, just send a message to the client
    await sendMessageToClient({
      type: 'BACKGROUND_SYNC',
      data: { synced: true }
    });
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Message event - handle messages from client
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'CLAIM_CLIENTS':
      self.clients.claim();
      break;
    case 'CACHE_URLS':
      cacheUrls(data.urls);
      break;
    case 'CLEAR_CACHE':
      clearCache();
      break;
    default:
      console.log('Unknown message type:', type);
  }
});

// Cache specific URLs
async function cacheUrls(urls) {
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(urls);
    console.log('URLs cached successfully');
  } catch (error) {
    console.error('Failed to cache URLs:', error);
  }
}

// Clear all caches
async function clearCache() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('All caches cleared');
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
}

// Handle share target (when app is opened via share)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  if (url.pathname === '/share' && event.request.method === 'POST') {
    event.respondWith(handleShareTarget(event.request));
  }
});

// Handle share target
async function handleShareTarget(request) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') || '';
    const text = formData.get('text') || '';
    const url = formData.get('url') || '';
    const files = formData.getAll('files');

    // Store shared data for the app to retrieve
    await self.clients.claim();
    const clients = await self.clients.matchAll();
    
    if (clients.length > 0) {
      clients[0].postMessage({
        type: 'SHARE_TARGET',
        data: { title, text, url, files: Array.from(files) }
      });
    }

    // Redirect to the app
    return Response.redirect('/', 303);
  } catch (error) {
    console.error('Error handling share target:', error);
    return Response.redirect('/', 303);
  }
}

console.log('Looply Service Worker loaded');