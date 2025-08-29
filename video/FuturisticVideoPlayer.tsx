import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar } from '../ui/avatar';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Heart, 
  MessageCircle, 
  Share, 
  Bookmark,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  X,
  Maximize,
  Music
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import type { Post } from '../../types/app';

interface FuturisticVideoPlayerProps {
  posts: Post[];
  initialIndex?: number;
  onClose?: () => void;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onSave?: (postId: string) => void;
  currentUserId?: string;
}

export function FuturisticVideoPlayer({
  posts,
  initialIndex = 0,
  onClose,
  onLike,
  onComment,
  onShare,
  onSave,
  currentUserId
}: FuturisticVideoPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const y = useMotionValue(0);
  const opacity = useTransform(y, [-100, 0, 100], [0.8, 1, 0.8]);
  const scale = useTransform(y, [-100, 0, 100], [0.95, 1, 0.95]);

  const videoPosts = posts.filter(post => post.type === 'video' || post.type === 'reel');
  const currentPost = videoPosts[currentIndex];

  // Auto-hide controls
  const resetControlsTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowControls(true);
    timeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  // Video event handlers
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setProgress((current / total) * 100);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
    resetControlsTimeout();
  }, [isPlaying, resetControlsTimeout]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
    resetControlsTimeout();
  }, [isMuted, resetControlsTimeout]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Swipe navigation
  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    const threshold = 50;
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    if (Math.abs(velocity) > 500 || Math.abs(offset) > threshold) {
      if (offset > 0 || velocity > 0) {
        // Swipe down - previous video
        if (currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
        }
      } else {
        // Swipe up - next video
        if (currentIndex < videoPosts.length - 1) {
          setCurrentIndex(currentIndex + 1);
        }
      }
    }
    y.set(0);
  }, [currentIndex, videoPosts.length, y]);

  // Touch handlers for mobile
  const handleTouchStart = useCallback(() => {
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (currentIndex < videoPosts.length - 1) {
            setCurrentIndex(currentIndex + 1);
          }
          break;
        case 'Escape':
          onClose?.();
          break;
        case 'm':
        case 'M':
          toggleMute();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, videoPosts.length, togglePlay, toggleMute, toggleFullscreen, onClose]);

  // Auto-play next video
  useEffect(() => {
    const video = videoRef.current;
    const handleEnded = () => {
      if (currentIndex < videoPosts.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0); // Loop back to first video
      }
    };

    if (video) {
      video.addEventListener('ended', handleEnded);
      return () => video.removeEventListener('ended', handleEnded);
    }
  }, [currentIndex, videoPosts.length]);

  // Reset video when index changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      setProgress(0);
      setIsPlaying(true);
      videoRef.current.play();
    }
  }, [currentIndex]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!currentPost || videoPosts.length === 0) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black z-50 overflow-hidden glassmorphism neon-glow smooth-transitions"
      onTouchStart={handleTouchStart}
      onClick={resetControlsTimeout}
    >
      {/* Background Particles */}
      <div className="particle-bg absolute inset-0" />
      
      {/* Video Container */}
      <motion.div
        className="relative w-full h-full flex items-center justify-center"
        style={{ y, opacity, scale }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
      >
        {/* Main Video */}
        <div className="relative w-full h-full max-w-md mx-auto">
          <video
            ref={videoRef}
            src={currentPost.video}
            poster={currentPost.thumbnail}
            className="w-full h-full object-cover rounded-lg"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            loop={false}
            muted={isMuted}
            playsInline
            preload="metadata"
          />
          
          {/* Video Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
          
          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-400 to-purple-500 neon-border"
              style={{ width: `${progress}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>

        {/* Controls Overlay */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none"
            >
              {/* Top Controls */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="glass-card hover:glass-card-strong text-white"
                >
                  <X className="size-5" />
                </Button>
                
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="glass-card text-white">
                    {currentIndex + 1} / {videoPosts.length}
                  </Badge>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="glass-card hover:glass-card-strong text-white"
                  >
                    <Maximize className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Center Play/Pause */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
                <motion.button
                  onClick={togglePlay}
                  className="w-20 h-20 rounded-full glass-card flex items-center justify-center text-white hover:glass-card-strong neon-border"
                  whileTap={{ scale: 0.9 }}
                  initial={{ scale: 0 }}
                  animate={{ scale: isPlaying ? 0 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Play className="size-8 ml-1" />
                </motion.button>
              </div>

              {/* Side Actions */}
              <div className="absolute right-4 bottom-20 flex flex-col gap-4 pointer-events-auto">
                {/* Author */}
                <motion.div 
                  className="flex flex-col items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <Avatar className="w-12 h-12 ring-2 ring-white/30">
                    <img src={currentPost.author.avatar} alt={currentPost.author.name} />
                  </Avatar>
                  {currentPost.author.verified && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </motion.div>

                {/* Like */}
                <motion.button
                  onClick={() => onLike?.(currentPost.id)}
                  className="flex flex-col items-center gap-1 text-white"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <div className="w-12 h-12 rounded-full glass-card flex items-center justify-center hover:glass-card-strong">
                    <Heart 
                      className={`size-6 ${currentPost.isLiked ? 'text-red-500 fill-red-500' : ''}`} 
                    />
                  </div>
                  <span className="text-xs font-medium">{currentPost.likes}</span>
                </motion.button>

                {/* Comment */}
                <motion.button
                  onClick={() => onComment?.(currentPost.id)}
                  className="flex flex-col items-center gap-1 text-white"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <div className="w-12 h-12 rounded-full glass-card flex items-center justify-center hover:glass-card-strong">
                    <MessageCircle className="size-6" />
                  </div>
                  <span className="text-xs font-medium">{currentPost.comments?.length || 0}</span>
                </motion.button>

                {/* Share */}
                <motion.button
                  onClick={() => onShare?.(currentPost.id)}
                  className="flex flex-col items-center gap-1 text-white"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <div className="w-12 h-12 rounded-full glass-card flex items-center justify-center hover:glass-card-strong">
                    <Share className="size-6" />
                  </div>
                  <span className="text-xs font-medium">{currentPost.shares}</span>
                </motion.button>

                {/* Save */}
                <motion.button
                  onClick={() => onSave?.(currentPost.id)}
                  className="flex flex-col items-center gap-1 text-white"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <div className="w-12 h-12 rounded-full glass-card flex items-center justify-center hover:glass-card-strong">
                    <Bookmark className={`size-6 ${currentPost.isSaved ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                  </div>
                </motion.button>

                {/* More */}
                <motion.button
                  className="flex flex-col items-center gap-1 text-white"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <div className="w-12 h-12 rounded-full glass-card flex items-center justify-center hover:glass-card-strong">
                    <MoreVertical className="size-6" />
                  </div>
                </motion.button>
              </div>

              {/* Bottom Info */}
              <div className="absolute bottom-4 left-4 right-20 pointer-events-auto">
                <div className="space-y-3">
                  {/* Author Name */}
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold font-accent">
                      @{currentPost.author.username}
                    </span>
                    {currentPost.author.verified && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <p className="text-white text-sm leading-relaxed">
                    {currentPost.content}
                  </p>

                  {/* Music Info */}
                  <motion.div 
                    className="flex items-center gap-2 text-white/80"
                    animate={{ x: [-10, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                  >
                    <Music className="size-4" />
                    <span className="text-xs">Original Audio</span>
                  </motion.div>
                </div>
              </div>

              {/* Navigation Hints */}
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 pointer-events-auto">
                {currentIndex > 0 && (
                  <motion.button
                    onClick={() => setCurrentIndex(currentIndex - 1)}
                    className="w-8 h-8 rounded-full glass-card flex items-center justify-center text-white hover:glass-card-strong"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ArrowUp className="size-4" />
                  </motion.button>
                )}
                
                {currentIndex < videoPosts.length - 1 && (
                  <motion.button
                    onClick={() => setCurrentIndex(currentIndex + 1)}
                    className="w-8 h-8 rounded-full glass-card flex items-center justify-center text-white hover:glass-card-strong"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ArrowDown className="size-4" />
                  </motion.button>
                )}
              </div>

              {/* Volume Control */}
              <div className="absolute bottom-4 right-4 pointer-events-auto">
                <motion.button
                  onClick={toggleMute}
                  className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-white hover:glass-card-strong"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
                </motion.button>
              </div>

              {/* Time Display */}
              <div className="absolute bottom-16 left-4 text-white/80 text-xs font-secondary pointer-events-none">
                {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(duration)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Indicator */}
        {!videoRef.current?.readyState && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="futuristic-loading" />
          </div>
        )}
      </motion.div>

      {/* Swipe Instructions */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/60 text-center pointer-events-none"
          >
            <div className="text-xs font-secondary">
              Swipe up/down to navigate • Tap to play/pause
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}