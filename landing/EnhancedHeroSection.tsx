import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  Play, 
  Users, 
  Heart, 
  MessageCircle, 
  Share2,
  Sparkles,
  Zap,
  Star
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Logo } from '../Logo';

interface EnhancedHeroSectionProps {
  onGetStarted: () => void;
  onWatchDemo?: () => void;
  darkMode: boolean;
  isOnline: boolean;
}

export function EnhancedHeroSection({ 
  onGetStarted, 
  onWatchDemo, 
  darkMode,
  isOnline 
}: EnhancedHeroSectionProps) {
  const [typedText, setTypedText] = useState('');
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  const phrases = [
    'Connect with friends',
    'Share amazing content',
    'Join communities',
    'Discover new creators',
    'Express yourself'
  ];

  const stats = [
    { label: 'Active Users', value: '2M+', icon: Users },
    { label: 'Posts Shared', value: '100M+', icon: Heart },
    { label: 'Communities', value: '10K+', icon: MessageCircle }
  ];

  const floatingElements = [
    { icon: Heart, color: 'text-red-500', delay: 0, position: 'top-1/4 left-1/4' },
    { icon: MessageCircle, color: 'text-blue-500', delay: 1, position: 'top-1/3 right-1/4' },
    { icon: Share2, color: 'text-green-500', delay: 2, position: 'bottom-1/3 left-1/6' },
    { icon: Star, color: 'text-yellow-500', delay: 3, position: 'bottom-1/4 right-1/3' },
    { icon: Zap, color: 'text-purple-500', delay: 4, position: 'top-1/2 left-1/8' },
    { icon: Sparkles, color: 'text-pink-500', delay: 5, position: 'bottom-1/2 right-1/8' }
  ];

  // Typing animation effect
  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex];
    
    if (isTyping) {
      if (typedText.length < currentPhrase.length) {
        const timeout = setTimeout(() => {
          setTypedText(currentPhrase.slice(0, typedText.length + 1));
        }, 100);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
        return () => clearTimeout(timeout);
      }
    } else {
      if (typedText.length > 0) {
        const timeout = setTimeout(() => {
          setTypedText(typedText.slice(0, -1));
        }, 50);
        return () => clearTimeout(timeout);
      } else {
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
        setIsTyping(true);
      }
    }
  }, [typedText, isTyping, currentPhraseIndex, phrases]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 dark:bg-purple-600 rounded-full opacity-20 animate-pulse blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-300 dark:bg-pink-600 rounded-full opacity-20 animate-pulse blur-3xl" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-orange-300 dark:bg-orange-600 rounded-full opacity-10 animate-pulse blur-3xl" style={{ animationDelay: '4s' }} />

        {/* Floating Icons */}
        {floatingElements.map((element, index) => {
          const IconComponent = element.icon;
          return (
            <motion.div
              key={index}
              className={`absolute ${element.position} ${element.color} opacity-20 dark:opacity-30`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0.2, 0.6, 0.2], 
                scale: [1, 1.2, 1],
                y: [0, -20, 0]
              }}
              transition={{
                duration: 4,
                delay: element.delay,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <IconComponent className="w-8 h-8 sm:w-12 sm:h-12" />
            </motion.div>
          );
        })}

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxwYXRoIGlkPSJncmlkIiBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgc3Ryb2tlPSJyZ2JhKDEyNCwgNTgsIDIzNywgMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIi8+CjwvZGVmcz4KPHN2Zz4KPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPgo8L3N2Zz4=')] opacity-20 dark:opacity-10" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8 sm:space-y-12">
          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex justify-center"
          >
            <Badge 
              variant="outline" 
              className="px-4 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 flex items-center gap-2"
            >
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
              {isOnline ? 'Live & Ready' : 'Demo Mode'}
            </Badge>
          </motion.div>

          {/* Logo Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center"
          >
            <Logo size="xl" showText={true} className="justify-center" animated />
          </motion.div>

          {/* Main Headline */}
          <motion.div
            className="space-y-4 sm:space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                Social Media
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">
                Reimagined
              </span>
            </h1>

            {/* Animated Tagline */}
            <div className="text-xl sm:text-2xl lg:text-3xl text-gray-600 dark:text-gray-300 h-12 sm:h-16 flex items-center justify-center">
              <span className="mr-2">Ready to</span>
              <span className="font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent min-w-[200px] sm:min-w-[280px] text-left">
                {typedText}
                <motion.span
                  className="inline-block w-0.5 h-6 sm:h-8 bg-purple-600 ml-1"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              </span>
            </div>

            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Experience the future of social networking with AI-powered features, 
              immersive reels, vibrant communities, and authentic connections.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={onGetStarted}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold rounded-2xl shadow-2xl relative overflow-hidden group min-w-[200px]"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </Button>
            </motion.div>

            {onWatchDemo && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={onWatchDemo}
                  variant="outline"
                  size="lg"
                  className="border-2 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-8 py-4 text-lg font-semibold rounded-2xl backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 min-w-[180px]"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </motion.div>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 sm:pt-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  className="text-center group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 dark:border-purple-800 group-hover:border-purple-300 dark:group-hover:border-purple-600 transition-all duration-300 group-hover:shadow-xl">
                    <div className="flex items-center justify-center mb-3">
                      <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 not-italic not-italic italic">
                      {stat.value}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 font-medium">
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            className="pt-8 sm:pt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <motion.div
              className="flex flex-col items-center text-gray-400 dark:text-gray-600"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-sm mb-2">Scroll to explore</span>
              <div className="w-6 h-10 border-2 border-current rounded-full flex justify-center">
                <motion.div
                  className="w-1 h-3 bg-current rounded-full mt-2"
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}