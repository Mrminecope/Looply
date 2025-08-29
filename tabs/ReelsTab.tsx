import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Shuffle, TrendingUp, Sparkles, Heart, MessageCircle, Share, MoreVertical } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { EnhancedReactionBar } from '../EnhancedReactionBar';
import { reelAlgorithm } from '../../utils/reel-algorithm';
import type { Post, User } from '../../types/app';

interface ReelsTabProps {
  posts: Post[];
  user: User | null;
  onVideoClick: (index: number) => void;
  onLike: (postId: string) => void;
  onComment: (postId: string, comment: string) => void;
  onShare: (postId: string) => void;
}

export function ReelsTab({ 
  posts, 
  user, 
  onVideoClick, 
  onLike, 
  onComment, 
  onShare 
}: ReelsTabProps) {
  const [activeTab, setActiveTab] = useState<'foryou' | 'trending' | 'random'>('foryou');
  const [loading, setLoading] = useState(false);
  const [reels, setReels] = useState<Post[]>([]);

  // Return early if user is not available
  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Loading reels...</h2>
          <p className="text-muted-foreground">Please wait while we load your personalized reels.</p>
        </div>
      </div>
    );
  }

  // Filter video posts (reels and videos)
  const videoMemos = useMemo(() => {
    return posts.filter(post => post.type === 'reel' || post.type === 'video');
  }, [posts]);

  // Load reels based on active tab
  const loadReels = useCallback(async () => {
    setLoading(true);
    
    try {
      let newReels: Post[] = [];
      
      switch (activeTab) {
        case 'foryou':
          newReels = reelAlgorithm.getPersonalizedReels(user.id, videoMemos, 20);
          // Track algorithm usage
          reelAlgorithm.trackInteraction(user.id, 'algorithm_foryou', 'view');
          break;
        case 'trending':
          newReels = reelAlgorithm.getTrendingReels(videoMemos, 20);
          break;
        case 'random':
          newReels = reelAlgorithm.getRandomReels(videoMemos, 20);
          break;
      }
      
      setReels(newReels);
    } catch (error) {
      console.error('Failed to load reels:', error);
      // Fallback to all videos
      setReels(videoMemos.slice(0, 20));
    } finally {
      setLoading(false);
    }
  }, [activeTab, user.id, videoMemos]);

  // Load reels on tab change
  useEffect(() => {
    loadReels();
  }, [loadReels]);

  // Handle reel interaction
  const handleReelClick = useCallback((reel: Post, index: number) => {
    // Track view interaction
    reelAlgorithm.trackInteraction(user.id, reel.id, 'view');
    onVideoClick(videoMemos.findIndex(p => p.id === reel.id));
  }, [user.id, onVideoClick, videoMemos]);

  // Handle like
  const handleLike = useCallback((postId: string) => {
    reelAlgorithm.trackInteraction(user.id, postId, 'like');
    onLike(postId);
  }, [user.id, onLike]);

  // Handle comment
  const handleComment = useCallback((postId: string, comment: string) => {
    reelAlgorithm.trackInteraction(user.id, postId, 'comment');
    onComment(postId, comment);
  }, [user.id, onComment]);

  // Handle share
  const handleShare = useCallback((postId: string) => {
    reelAlgorithm.trackInteraction(user.id, postId, 'share');
    onShare(postId);
  }, [user.id, onShare]);

  // Get random reel with animation
  const handleRandomReel = useCallback(() => {
    const randomReels = reelAlgorithm.getRandomReels(videoMemos, 1);
    if (randomReels.length > 0) {
      const randomIndex = videoMemos.findIndex(p => p.id === randomReels[0].id);
      if (randomIndex !== -1) {
        handleReelClick(randomReels[0], randomIndex);
      }
    }
  }, [videoMemos, handleReelClick]);

  // Tab configuration
  const tabs = [
    { id: 'foryou', label: 'For You', icon: Sparkles },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'random', label: 'Random', icon: Shuffle }
  ] as const;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Mobile-first tab header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  className="relative h-9 px-3 text-sm font-medium mobile-tap-highlight"
                >
                  <Icon className="h-4 w-4 mr-1.5" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary rounded-md -z-10"
                      transition={{ type: "spring", duration: 0.3 }}
                    />
                  )}
                </Button>
              );
            })}
          </div>

          {/* Random reel button */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleRandomReel}
            className="h-9 px-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 mobile-tap-highlight"
          >
            <Shuffle className="h-4 w-4 mr-1.5" />
            Random
          </Button>
        </div>
      </div>

      {/* Reels grid - mobile optimized */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-64"
            >
              <div className="futuristic-loading" />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 gap-3 p-4"
            >
              {reels.map((reel, index) => (
                <ReelCard
                  key={reel.id}
                  reel={reel}
                  index={index}
                  onClick={() => handleReelClick(reel, index)}
                  onLike={() => handleLike(reel.id)}
                  onComment={(comment) => handleComment(reel.id, comment)}
                  onShare={() => handleShare(reel.id)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!loading && reels.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-64 px-6 text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
              <Play className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Reels Found</h3>
            <p className="text-muted-foreground text-sm">
              Try switching to a different tab or check back later!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Individual reel card component
interface ReelCardProps {
  reel: Post;
  index: number;
  onClick: () => void;
  onLike: () => void;
  onComment: (comment: string) => void;
  onShare: () => void;
}

function ReelCard({ reel, index, onClick, onLike, onComment, onShare }: ReelCardProps) {
  const [showReactions, setShowReactions] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="relative group"
    >
      <Card 
        className="relative aspect-[9/16] overflow-hidden cursor-pointer bg-gradient-to-br from-gray-900 to-gray-800 border-0 mobile-tap-highlight"
        onClick={onClick}
      >
        {/* Video thumbnail */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20">
          {reel.image && (
            <img
              src={reel.image}
              alt="Reel thumbnail"
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Play overlay */}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/30 transition-colors">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              <Play className="h-6 w-6 text-white fill-white" />
            </motion.div>
          </div>
        </div>

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
          {/* Author info */}
          <div className="flex items-center space-x-2 mb-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={reel.author.avatar} alt={reel.author.name} />
              <AvatarFallback className="text-xs">
                {reel.author.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-white text-xs font-medium truncate">
              {reel.author.username}
            </span>
            {reel.author.verified && (
              <Badge variant="secondary" className="h-4 px-1 py-0 text-xs bg-blue-500 text-white">
                ✓
              </Badge>
            )}
          </div>

          {/* Content preview */}
          <p className="text-white text-xs leading-tight line-clamp-2 mb-2">
            {reel.content}
          </p>

          {/* Hashtags */}
          {reel.hashtags && reel.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {reel.hashtags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-purple-300 text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Engagement stats */}
          <div className="flex items-center space-x-3 text-white/80">
            <div className="flex items-center space-x-1">
              <Heart className="h-3 w-3" />
              <span className="text-xs">{reel.likes}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-3 w-3" />
              <span className="text-xs">{reel.comments.length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Share className="h-3 w-3" />
              <span className="text-xs">{reel.shares}</span>
            </div>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 bg-black/20 backdrop-blur-sm text-white hover:bg-black/40"
            onClick={(e) => {
              e.stopPropagation();
              setShowReactions(!showReactions);
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        {/* Enhanced reaction bar */}
        <AnimatePresence>
          {showReactions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute top-12 right-2 z-10"
            >
              <EnhancedReactionBar
                reactions={reel.reactions}
                onReact={(emoji) => {
                  onLike();
                  setShowReactions(false);
                }}
                showLabels={false}
                compact={true}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}