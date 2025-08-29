import React from 'react';
import { motion } from 'motion/react';
import { 
  Home, 
  Search, 
  Plus, 
  Bell, 
  User, 
  Play,
  Users,
  TrendingUp,
  Hash
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadNotifications?: number;
  isOnline?: boolean;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  badge?: number;
  color: string;
  gradient: string;
}

export function BottomNavigation({ 
  activeTab, 
  onTabChange, 
  unreadNotifications = 0,
  isOnline = true 
}: BottomNavigationProps) {
  const navItems: NavItem[] = [
    {
      id: 'feed',
      label: 'Home',
      icon: <Home className="w-5 h-5" />,
      activeIcon: <Home className="w-5 h-5 fill-current" />,
      color: 'text-purple-600',
      gradient: 'from-purple-600 to-pink-500'
    },
    {
      id: 'reels',
      label: 'Reels',
      icon: <Play className="w-5 h-5" />,
      activeIcon: <Play className="w-5 h-5 fill-current" />,
      color: 'text-pink-600',
      gradient: 'from-pink-600 to-orange-500'
    },
    {
      id: 'create',
      label: 'Create',
      icon: <Plus className="w-5 h-5" />,
      activeIcon: <Plus className="w-5 h-5" />,
      color: 'text-orange-500',
      gradient: 'from-orange-500 to-yellow-500'
    },
    {
      id: 'communities',
      label: 'Groups',
      icon: <Users className="w-5 h-5" />,
      activeIcon: <Users className="w-5 h-5 fill-current" />,
      color: 'text-green-600',
      gradient: 'from-green-600 to-teal-500'
    },
    {
      id: 'notifications',
      label: 'Alerts',
      icon: <Bell className="w-5 h-5" />,
      activeIcon: <Bell className="w-5 h-5 fill-current" />,
      badge: unreadNotifications,
      color: 'text-red-500',
      gradient: 'from-red-500 to-pink-500'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="w-5 h-5" />,
      activeIcon: <User className="w-5 h-5 fill-current" />,
      color: 'text-blue-600',
      gradient: 'from-blue-600 to-purple-600'
    }
  ];

  const handleTabClick = (tabId: string) => {
    // Add haptic feedback for mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    onTabChange(tabId);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-gray-200/50 mobile-safe-area">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          
          return (
            <div key={item.id} className="flex-1 flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTabClick(item.id)}
                className={`
                  relative flex flex-col items-center justify-center p-2 min-h-[60px] w-full max-w-[80px] 
                  transition-all duration-200 ease-out rounded-xl
                  ${isActive 
                    ? 'bg-gradient-to-br ' + item.gradient + ' text-white shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100'
                  }
                  mobile-touch-optimized focus-ring
                `}
                disabled={!isOnline && item.id !== 'profile'}
              >
                {/* Icon with animation */}
                <motion.div
                  animate={{ 
                    scale: isActive ? 1.1 : 1,
                    rotateY: isActive ? 360 : 0
                  }}
                  transition={{ 
                    duration: 0.3,
                    rotateY: { duration: 0.6 }
                  }}
                  className="relative"
                >
                  {isActive ? (item.activeIcon || item.icon) : item.icon}
                  
                  {/* Badge for notifications */}
                  {item.badge && item.badge > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2"
                    >
                      <Badge 
                        variant="destructive" 
                        className="min-w-[18px] h-[18px] text-xs px-1 flex items-center justify-center rounded-full shadow-lg"
                      >
                        {item.badge > 99 ? '99+' : item.badge}
                      </Badge>
                    </motion.div>
                  )}
                </motion.div>

                {/* Label */}
                <span className={`
                  text-xs font-medium mt-1 transition-all duration-200
                  ${isActive ? 'text-white' : 'text-gray-500'}
                `}>
                  {item.label}
                </span>

                {/* Active indicator line */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}

                {/* Ripple effect container */}
                <div className="absolute inset-0 rounded-xl overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-white/20 rounded-full"
                    initial={{ scale: 0, opacity: 0 }}
                    whileTap={{ scale: 4, opacity: [0, 0.3, 0] }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </Button>
            </div>
          );
        })}
      </div>

      {/* Online status indicator */}
      {!isOnline && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-center py-1 text-xs">
          Offline Mode
        </div>
      )}

      {/* Enhanced visual separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
    </div>
  );
}