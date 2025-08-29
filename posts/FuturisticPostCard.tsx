import { useState, useRef } from 'react';
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Bookmark, 
  MoreHorizontal,
  Play,
  Volume2,
  VolumeX,
  Zap,
  Eye,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import type { Post } from '../../types/app';

interface FuturisticPostCardProps {
  post: Post;
  currentUserId?: string;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onSave?: (postId: string) => void;
  onView?: (postId: string) => void;
  onVideoClick?: (post: Post) => void;
  onDelete?: (postId: string) => void;
  compact?: boolean;
}

export function FuturisticPostCard({
  post,
  currentUserId,
  onLike,
  onComment,
  onShare,
  onSave,
  onView,
  onVideoClick,
  onDelete,
  compact = false
}: FuturisticPostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [likes, setLikes] = useState(post.likes);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isOwnPost = post.author.id === currentUserId;
  const timeAgo = getTimeAgo(post.timestamp);

  function getTimeAgo(timestamp: string): string {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - postTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  }

  const handleLike = async () => {
    const newLiked = !isLiked;
    const newLikes = newLiked ? likes + 1 : likes - 1;
    
    setIsLiked(newLiked);
    setLikes(newLikes);
    
    try {
      await onLike?.(post.id);
    } catch (error) {
      // Revert on error
      setIsLiked(!newLiked);
      setLikes(likes);
      toast.error('Failed to like post');
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave?.(post.id);
    toast.success(isSaved ? 'Removed from saved' : 'Added to saved');
  };

  const handleShare = () => {
    onShare?.(post.id);
    if (navigator.share) {
      navigator.share({
        title: `Post by @${post.author.username}`,
        text: post.content,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleVideoPlay = () => {
    if (post.type === 'video' || post.type === 'reel') {
      onVideoClick?.(post);
    }
  };

  return (
    <motion.article
      className={`futuristic-card glass-card hover:glass-card-strong ${compact ? 'p-3' : 'p-4'} mb-4 glow-on-hover`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onViewportEnter={() => onView?.(post.id)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Avatar className="w-10 h-10 ring-2 ring-primary/30 hover:ring-primary/60 transition-all duration-300">
              <img src={post.author.avatar} alt={post.author.name} />
            </Avatar>
          </motion.div>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground gradient-heading">
                {post.author.name}
              </span>
              {post.author.verified && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center neon-element"
                >
                  <span className="text-white text-xs">✓</span>
                </motion.div>
              )}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <span>@{post.author.username}</span>
              <span>•</span>
              <span>{timeAgo}</span>
              {post.views && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Eye className="size-3" />
                    <span>{post.views}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Post Type Badge */}
          <AnimatePresence>
            {(post.type === 'reel' || post.type === 'video') && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
              >
                <Badge variant="secondary" className="glass-card text-xs neon-border">
                  {post.type === 'reel' ? '⚡ Reel' : '🎥 Video'}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>

          {/* More Menu */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button variant="ghost" size="sm" className="opacity-60 hover:opacity-100">
              <MoreHorizontal className="size-4" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <motion.div
          className="mb-3 text-foreground leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <p>{post.content}</p>
        </motion.div>
      )}

      {/* Media */}
      <AnimatePresence>
        {(post.image || post.video) && (
          <motion.div
            className="relative mb-4 rounded-lg overflow-hidden glass-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            {post.type === 'video' || post.type === 'reel' ? (
              <div 
                className="relative aspect-video cursor-pointer group"
                onClick={handleVideoPlay}
              >
                {post.thumbnail ? (
                  <img
                    src={post.thumbnail}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Play className="size-12 text-muted-foreground" />
                  </div>
                )}
                
                {/* Video Overlay */}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <motion.div
                    className="w-16 h-16 rounded-full glass-card flex items-center justify-center neon-border"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Play className="size-6 text-white ml-1" />
                  </motion.div>
                </div>

                {/* Video Duration */}
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded text-white text-xs font-secondary">
                  {post.type === 'reel' ? '0:15' : '2:34'}
                </div>

                {/* Views Count */}
                {post.views && (
                  <div className="absolute top-2 right-2 px-2 py-1 glass-card rounded text-white text-xs flex items-center gap-1">
                    <Eye className="size-3" />
                    <span>{post.views}</span>
                  </div>
                )}
              </div>
            ) : post.image && (
              <motion.div
                className="relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: imageLoaded ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ImageWithFallback
                  src={post.image}
                  alt="Post image"
                  className="w-full h-auto max-h-96 object-cover"
                  onLoad={() => setImageLoaded(true)}
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <div className="futuristic-loading" />
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Like */}
          <motion.button
            onClick={handleLike}
            className="flex items-center space-x-2 hover:scale-105 transition-transform"
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={isLiked ? { 
                scale: [1, 1.2, 1], 
                rotate: [0, 10, -10, 0] 
              } : {}}
              transition={{ duration: 0.3 }}
            >
              <Heart 
                className={`size-5 transition-colors ${
                  isLiked 
                    ? 'text-red-500 fill-red-500 neon-element' 
                    : 'text-muted-foreground hover:text-red-500'
                }`} 
              />
            </motion.div>
            <span className={`text-sm ${isLiked ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
              {likes}
            </span>
          </motion.button>

          {/* Comment */}
          <motion.button
            onClick={() => onComment?.(post.id)}
            className="flex items-center space-x-2 text-muted-foreground hover:text-blue-500 hover:scale-105 transition-all"
            whileTap={{ scale: 0.95 }}
          >
            <MessageCircle className="size-5" />
            <span className="text-sm">{post.comments}</span>
          </motion.button>

          {/* Share */}
          <motion.button
            onClick={handleShare}
            className="flex items-center space-x-2 text-muted-foreground hover:text-green-500 hover:scale-105 transition-all"
            whileTap={{ scale: 0.95 }}
          >
            <Share className="size-5" />
            <span className="text-sm">{post.shares}</span>
          </motion.button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Trending Indicator */}
          <AnimatePresence>
            {post.likes > 100 && (
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 90 }}
                className="flex items-center gap-1 text-orange-500"
              >
                <TrendingUp className="size-4" />
                <span className="text-xs font-medium">Trending</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Save */}
          <motion.button
            onClick={handleSave}
            className={`p-2 rounded-full transition-colors ${
              isSaved 
                ? 'text-yellow-500 bg-yellow-500/10' 
                : 'text-muted-foreground hover:text-yellow-500'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <Bookmark className={`size-4 ${isSaved ? 'fill-current' : ''}`} />
          </motion.button>

          {/* Delete (if own post) */}
          {isOwnPost && onDelete && (
            <motion.button
              onClick={() => onDelete(post.id)}
              className="p-2 rounded-full text-muted-foreground hover:text-red-500 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <MoreHorizontal className="size-4" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Community Tag */}
      {post.community && (
        <motion.div
          className="mt-3 pt-3 border-t border-border/50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
              <span className="text-xs text-white">C</span>
            </div>
            <span className="text-sm text-muted-foreground">
              Posted in <span className="text-primary font-medium">Community</span>
            </span>
          </div>
        </motion.div>
      )}

      {/* Hover Effects */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg" />
            <div className="absolute inset-0 ring-1 ring-primary/20 rounded-lg" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}