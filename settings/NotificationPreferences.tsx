import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Bell, 
  BellOff, 
  Heart, 
  MessageSquare, 
  Users, 
  AtSign, 
  Rss, 
  Shield,
  Volume2,
  VolumeX,
  Smartphone,
  Moon,
  Sun,
  Clock,
  Settings
} from 'lucide-react';
import { Card } from '../ui/card';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { notificationService, type NotificationPreferences } from '../../utils/notification-service';

interface NotificationPreferencesProps {
  onPreferencesChange?: (preferences: NotificationPreferences) => void;
}

export function NotificationPreferences({ onPreferencesChange }: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    notificationService.getPreferences()
  );
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [testingNotification, setTestingNotification] = useState(false);

  useEffect(() => {
    setPermission(notificationService.getPermissionStatus());
    setIsSupported(notificationService.isSupported());
  }, []);

  const updatePreferences = (newPreferences: Partial<NotificationPreferences>) => {
    const updated = { ...preferences, ...newPreferences };
    setPreferences(updated);
    notificationService.updatePreferences(updated);
    onPreferencesChange?.(updated);
  };

  const handleRequestPermission = async () => {
    const newPermission = await notificationService.requestPermission();
    setPermission(newPermission);
    
    if (newPermission === 'granted') {
      // Show success message
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl z-50 success-bounce shadow-2xl';
      successMsg.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="text-xl">🔔</span>
          <span class="font-medium">Notifications enabled!</span>
        </div>
      `;
      document.body.appendChild(successMsg);
      setTimeout(() => successMsg.remove(), 3000);
    }
  };

  const handleTestNotification = async () => {
    setTestingNotification(true);
    try {
      await notificationService.testNotification();
    } finally {
      setTimeout(() => setTestingNotification(false), 2000);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (!isSupported) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <BellOff className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="text-lg font-semibold text-gray-900">Notifications Not Supported</h3>
          <p className="text-gray-600">
            Your browser doesn't support push notifications. Please use a modern browser like Chrome, Firefox, or Safari.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Permission Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              permission === 'granted' ? 'bg-green-100 text-green-600' : 
              permission === 'denied' ? 'bg-red-100 text-red-600' : 
              'bg-yellow-100 text-yellow-600'
            }`}>
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">Notification Status</h3>
              <p className="text-sm text-gray-600">
                {permission === 'granted' && 'Notifications are enabled'}
                {permission === 'denied' && 'Notifications are blocked'}
                {permission === 'default' && 'Notifications are not configured'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={permission === 'granted' ? 'default' : 'secondary'}>
              {permission === 'granted' ? 'Enabled' : 
               permission === 'denied' ? 'Blocked' : 'Not Set'}
            </Badge>
            
            {permission !== 'granted' && (
              <Button size="sm" onClick={handleRequestPermission}>
                Enable
              </Button>
            )}
            
            {permission === 'granted' && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleTestNotification}
                disabled={testingNotification}
              >
                {testingNotification ? 'Testing...' : 'Test'}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Master Toggle */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-full">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">Push Notifications</h3>
              <p className="text-sm text-gray-600">Receive notifications for important updates</p>
            </div>
          </div>
          <Switch
            checked={preferences.enabled}
            onCheckedChange={(enabled) => updatePreferences({ enabled })}
            disabled={permission !== 'granted'}
          />
        </div>
      </Card>

      {/* Notification Categories */}
      {preferences.enabled && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4"
        >
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Notification Types
            </h3>
            
            <div className="space-y-4">
              {/* Likes */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="font-medium">Likes</p>
                    <p className="text-sm text-gray-600">When someone likes your posts</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.likes}
                  onCheckedChange={(likes) => updatePreferences({ likes })}
                />
              </div>

              {/* Comments */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Comments</p>
                    <p className="text-sm text-gray-600">When someone comments on your posts</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.comments}
                  onCheckedChange={(comments) => updatePreferences({ comments })}
                />
              </div>

              {/* Mentions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AtSign className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium">Mentions</p>
                    <p className="text-sm text-gray-600">When someone mentions you</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.mentions}
                  onCheckedChange={(mentions) => updatePreferences({ mentions })}
                />
              </div>

              {/* Follows */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="font-medium">New Followers</p>
                    <p className="text-sm text-gray-600">When someone follows you</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.follows}
                  onCheckedChange={(follows) => updatePreferences({ follows })}
                />
              </div>

              <Separator />

              {/* Messages */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-indigo-500" />
                  <div>
                    <p className="font-medium">Direct Messages</p>
                    <p className="text-sm text-gray-600">New messages and chat notifications</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.messages}
                  onCheckedChange={(messages) => updatePreferences({ messages })}
                />
              </div>

              {/* Communities */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-medium">Communities</p>
                    <p className="text-sm text-gray-600">Updates from communities you've joined</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.communities}
                  onCheckedChange={(communities) => updatePreferences({ communities })}
                />
              </div>

              {/* Reels */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Rss className="w-5 h-5 text-pink-500" />
                  <div>
                    <p className="font-medium">Reels</p>
                    <p className="text-sm text-gray-600">Trending reels and video updates</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.reels}
                  onCheckedChange={(reels) => updatePreferences({ reels })}
                />
              </div>

              <Separator />

              {/* System */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">System Notifications</p>
                    <p className="text-sm text-gray-600">App updates and important announcements</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.system}
                  onCheckedChange={(system) => updatePreferences({ system })}
                />
              </div>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Notification Settings
            </h3>
            
            <div className="space-y-4">
              {/* Sound */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {preferences.sound ? (
                    <Volume2 className="w-5 h-5 text-blue-500" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium">Sound</p>
                    <p className="text-sm text-gray-600">Play notification sounds</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.sound}
                  onCheckedChange={(sound) => updatePreferences({ sound })}
                />
              </div>

              {/* Vibration */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium">Vibration</p>
                    <p className="text-sm text-gray-600">Vibrate on mobile devices</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.vibration}
                  onCheckedChange={(vibration) => updatePreferences({ vibration })}
                />
              </div>
            </div>
          </Card>

          {/* Quiet Hours */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Moon className="w-5 h-5" />
              Quiet Hours
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Quiet Hours</p>
                  <p className="text-sm text-gray-600">Pause notifications during specific hours</p>
                </div>
                <Switch
                  checked={preferences.quietHours.enabled}
                  onCheckedChange={(enabled) => 
                    updatePreferences({ 
                      quietHours: { ...preferences.quietHours, enabled }
                    })
                  }
                />
              </div>

              {preferences.quietHours.enabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="start-time" className="flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      Start Time
                    </Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={preferences.quietHours.start}
                      onChange={(e) =>
                        updatePreferences({
                          quietHours: { ...preferences.quietHours, start: e.target.value }
                        })
                      }
                    />
                    <p className="text-xs text-gray-600">
                      {formatTime(preferences.quietHours.start)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end-time" className="flex items-center gap-2">
                      <Moon className="w-4 h-4" />
                      End Time
                    </Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={preferences.quietHours.end}
                      onChange={(e) =>
                        updatePreferences({
                          quietHours: { ...preferences.quietHours, end: e.target.value }
                        })
                      }
                    />
                    <p className="text-xs text-gray-600">
                      {formatTime(preferences.quietHours.end)}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </Card>

          {/* Preview */}
          <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <div className="flex items-center gap-3 mb-3">
              <Bell className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">Notification Preview</h3>
            </div>
            
            <div className="bg-white rounded-lg p-4 border shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  ∞
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Looply</p>
                  <p className="text-sm text-gray-600">
                    {preferences.likes && '❤️ Someone liked your post'}
                    {!preferences.likes && preferences.comments && '💬 New comment on your post'}
                    {!preferences.likes && !preferences.comments && preferences.mentions && '👋 You were mentioned'}
                    {!preferences.likes && !preferences.comments && !preferences.mentions && '🔔 You have new notifications'}
                  </p>
                </div>
                <div className="text-xs text-gray-500">now</div>
              </div>
            </div>
            
            <p className="text-sm text-purple-700 mt-3">
              This is how notifications will appear on your device
            </p>
          </Card>
        </motion.div>
      )}
    </div>
  );
}