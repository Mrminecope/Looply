import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  BookmarkCheck,
  MoreHorizontal,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Eye,
  Smile,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { OptimizedMedia } from './OptimizedMedia';
import { EnhancedReactionBar } from './EnhancedReactionBar';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner@2.0.3';
import type { Post } from '../types/app';

interface PostCardProps {
  post: Post;
  onLike: (postId: string, reactionType?: string) => void;
  onComment: (postId: string, comment: string) => void;
  onShare: (postId: string) => void;
  onView: (postId: string) => void;
  onSave?: (postId: string) => void;
  onVideoClick?: (postId: string) => void;
  currentUserId?: string;
  autoplay?: boolean;
  priority?: boolean;
}

export function PostCard({
  post,
  onLike,
  onComment,
  onShare,
  onView,
  onSave,
  onVideoClick,
  currentUserId,
  autoplay = false,
  priority = false
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isSaved, setIsSaved] = useState(post.isSaved);
  const [showReactions, setShowReactions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  
  const postRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Enhanced like handler with haptic feedback
  const handleLike = useCallback((reactionType: string = 'like') => {
    try {
      // Optimistic update
      setIsLiked(!isLiked);
      
      // Add haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(isLiked ? 5 : 15);
      }
      
      onLike(post.id, reactionType);
      
      // Show reaction animation
      const emoji = reactionType === 'love' ? '❤️' : reactionType === 'laugh' ? '😂' : '👍';
      toast.success(isLiked ? 'Reaction removed' : `${emoji} Reacted!`, {
        duration: 1500,
        position: 'bottom-center'
      });
    } catch (error) {
      // Revert optimistic update on error
      setIsLiked(!isLiked);
      toast.error('Failed to update reaction');
    }
  }, [isLiked, onLike, post.id]);

  // Enhanced save handler
  const handleSave = useCallback(() => {
    try {
      setIsSaved(!isSaved);
      
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
      
      onSave?.(post.id);
      toast.success(isSaved ? 'Post unsaved' : 'Post saved!');
    } catch (error) {
      setIsSaved(!isSaved);
      toast.error('Failed to save post');
    }
  }, [isSaved, onSave, post.id]);

  // Enhanced comment handler
  const handleComment = useCallback(() => {
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      onComment(post.id, newComment);
      setNewComment('');
      setShowComments(false);
      
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
      
      toast.success('Comment added!');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  }, [newComment, onComment, post.id]);

  // Enhanced share handler
  const handleShare = useCallback(async () => {
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate([5, 5, 5]);
      }
      
      await onShare(post.id);
    } catch (error) {
      toast.error('Failed to share post');
    }
  }, [onShare, post.id]);

  // Video controls
  const toggleVideoPlay = useCallback(() => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  }, [isVideoPlaying]);

  const toggleVideoMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isVideoMuted;
      setIsVideoMuted(!isVideoMuted);
    }
  }, [isVideoMuted]);

  // Intersection observer for view tracking
  React.useEffect(() => {
    if (!postRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasViewed) {
          setHasViewed(true);
          onView(post.id);
        }
      },
      { threshold: 0.5 }
    );

    observerRef.current.observe(postRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasViewed, onView, post.id]);

  // Format content for display
  const content = post.content || '';
  const shouldTruncate = content.length > 150;
  const displayContent = shouldTruncate && !isExpanded 
    ? content.substring(0, 150) + '...' 
    : content;

  // Format timestamp
  const timeAgo = formatDistanceToNow(new Date(post.timestamp), { addSuffix: true });

  return (
    <motion.div
      ref={postRef}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="looply-card rounded-xl p-4 mb-4 bg-white shadow-soft hover:shadow-medium transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10 ring-2 ring-purple-100">
            <AvatarImage src={post.author.avatar} alt={post.author.name} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              {post.author.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
              {post.author.verified && (
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                  ✓
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500">@{post.author.username} • {timeAgo}</p>
          </div>
        </div>
        
        <Button variant="ghost" size="icon-sm" className="text-gray-500 hover:text-gray-700">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      {content && (
        <div className="mb-3">
          <p className="text-gray-800 leading-relaxed">
            {displayContent}
            {shouldTruncate && (
              <Button
                variant="link"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-0 h-auto ml-2 text-purple-600"
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </Button>
            )}
          </p>
          
          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {post.hashtags.slice(0, 5).map((hashtag, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs text-purple-600 border-purple-200 hover:bg-purple-50 cursor-pointer"
                >
                  #{hashtag}
                </Badge>
              ))}
              {post.hashtags.length > 5 && (
                <Badge variant="outline" className="text-xs text-gray-500">
                  +{post.hashtags.length - 5} more
                </Badge>
              )}
            </div>
          )}
        </div>
      )}

      {/* Media */}
      {(post.image || post.video) && (
        <div className="mb-4 rounded-lg overflow-hidden bg-gray-100">
          {post.video ? (
            <div className="relative">
              <video
                ref={videoRef}
                src={post.video}
                className="w-full h-auto max-h-96 object-cover cursor-pointer"
                poster={post.image || undefined}
                muted={isVideoMuted}
                loop
                playsInline
                onClick={() => onVideoClick?.(post.id)}
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
              />
              
              {/* Video controls overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <div className="flex space-x-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleVideoPlay}
                    className="bg-black/50 text-white hover:bg-black/70"
                  >
                    {isVideoPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleVideoMute}
                    className="bg-black/50 text-white hover:bg-black/70"
                  >
                    {isVideoMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                  </Button>
                </div>
              </div>
              
              {/* Video type indicator */}
              <div className="absolute top-2 right-2">
                <Badge className="bg-black/70 text-white">
                  <Play className="w-3 h-3 mr-1" />
                  Video
                </Badge>
              </div>
            </div>
          ) : post.image && (
            <OptimizedMedia
              src={post.image}
              alt={`Post by ${post.author.name}`}
              type="image"
              className="w-full h-auto max-h-96 object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
              priority={priority}
            />
          )}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <Eye className="w-4 h-4 mr-1" />
            {post.views.toLocaleString()}
          </span>
          {post.likes > 0 && (
            <span>{post.likes.toLocaleString()} likes</span>
          )}
          {post.comments > 0 && (
            <span>{post.comments.toLocaleString()} comments</span>
          )}
        </div>
        {post.location && (
          <span className="text-purple-600">📍 {post.location}</span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <div className="flex items-center space-x-1">
          {/* Like Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReactions(!showReactions)}
            className={`
              relative transition-all duration-200 group
              ${isLiked ? 'text-red-500 bg-red-50' : 'text-gray-600 hover:text-red-500 hover:bg-red-50'}
            `}
          >
            <motion.div
              whileTap={{ scale: 0.8 }}
              className="flex items-center"
            >
              <Heart className={`w-5 h-5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">Like</span>
              {post.likes > 0 && (
                <Badge variant="secondary" className="ml-2 bg-red-100 text-red-700">
                  {post.likes}
                </Badge>
              )}
            </motion.div>
          </Button>

          {/* Comment Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="text-gray-600 hover:text-blue-500 hover:bg-blue-50 transition-all duration-200"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Comment</span>
            {post.comments > 0 && (
              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                {post.comments}
              </Badge>
            )}
          </Button>

          {/* Share Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="text-gray-600 hover:text-green-500 hover:bg-green-50 transition-all duration-200"
          >
            <Share2 className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Share</span>
            {post.shares > 0 && (
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                {post.shares}
              </Badge>
            )}
          </Button>
        </div>

        {/* Save Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSave}
          className={`
            transition-all duration-200
            ${isSaved ? 'text-yellow-500 bg-yellow-50' : 'text-gray-600 hover:text-yellow-500 hover:bg-yellow-50'}
          `}
        >
          {isSaved ? (
            <BookmarkCheck className="w-5 h-5 fill-current" />
          ) : (
            <Bookmark className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Enhanced Reaction Bar */}
      <AnimatePresence>
        {showReactions && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="mt-3"
          >
            <EnhancedReactionBar
              onReaction={handleLike}
              currentReactions={post.reactions}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comment Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 border-t border-gray-100 pt-4"
          >
            <div className="flex space-x-3">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src="/default-avatar.png" alt="Your avatar" />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm">
                  {currentUserId?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-gray-50 focus:bg-white transition-all duration-200"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleComment();
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={handleComment}
                    disabled={!newComment.trim()}
                    className="bg-purple-600 hover:bg-purple-700 text-white min-w-[60px]"
                  >
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}