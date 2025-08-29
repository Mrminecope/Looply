import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Bell, MessageCircle, Settings, Wifi, WifiOff } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Logo, CompactLogo } from './Logo';
import type { User } from '../types/app';

interface TopHeaderProps {
  user: User | null;
  activeTab: string;
  isOnline: boolean;
  onSearch: () => void;
}

export function TopHeader({ user, activeTab, isOnline, onSearch }: TopHeaderProps) {
  const [showNetworkStatus, setShowNetworkStatus] = useState(false);

  // Return early if user is not available
  if (!user) {
    return (
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between h-14 px-4 max-w-md mx-auto">
          <CompactLogo className="flex-shrink-0" />
          <motion.h1 className="text-lg font-semibold text-foreground">
            Looply
          </motion.h1>
        </div>
      </header>
    );
  }

  // Get tab title
  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'feed': return 'Feed';
      case 'reels': return 'Reels';
      case 'search': return 'Search';
      case 'notifications': return 'Notifications';
      case 'communities': return 'Communities';
      case 'profile': return 'Profile';
      default: return 'Looply';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border">
      <div className="flex items-center justify-between h-14 px-4 max-w-md mx-auto">
        {/* Left side - Logo and Title */}
        <div className="flex items-center space-x-3">
          {/* Animated Looply Logo */}
          <CompactLogo className="flex-shrink-0" />
          
          {/* Tab title with animation */}
          <motion.h1
            key={activeTab}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="text-lg font-semibold text-foreground truncate"
          >
            {getTabTitle(activeTab)}
          </motion.h1>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2">
          {/* Network status indicator */}
          <motion.div
            onTap={() => setShowNetworkStatus(!showNetworkStatus)}
            className="relative"
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 text-muted-foreground"
            >
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
            </Button>
            
            {/* Network status tooltip */}
            {showNetworkStatus && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                className="absolute top-full right-0 mt-2 bg-card border rounded-lg shadow-lg p-2 text-xs whitespace-nowrap z-50"
              >
                {isOnline ? '🟢 Online' : '🔴 Offline'}
              </motion.div>
            )}
          </motion.div>

          {/* Search button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onSearch}
            className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground mobile-tap-highlight"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Messages button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground mobile-tap-highlight relative"
          >
            <MessageCircle className="h-4 w-4" />
            {/* Unread message indicator */}
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-3 w-3 p-0 text-xs flex items-center justify-center"
            >
              <span className="sr-only">Unread messages</span>
            </Badge>
          </Button>

          {/* Profile avatar */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <Avatar className="h-8 w-8 cursor-pointer mobile-tap-highlight">
              <AvatarImage src={user.avatar} alt={user.name || 'User'} />
              <AvatarFallback className="text-xs bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                {user.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            {/* Online status indicator */}
            <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 border-2 border-background rounded-full" />
          </motion.div>
        </div>
      </div>

      {/* Tab-specific content */}
      {activeTab === 'reels' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-border/50"
        >
          <div className="flex items-center justify-center py-2 px-4 max-w-md mx-auto">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              />
              <span>Swipe up for endless entertainment</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Performance indicator for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-full left-4 bg-black text-white text-xs px-2 py-1 rounded-b opacity-50">
          {isOnline ? 'Online' : 'Offline'} | {activeTab}
        </div>
      )}
    </header>
  );
}