import { useState, useRef, useEffect, useCallback, memo } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Bookmark,
  Play,
  Pause,
  Volume2,
  VolumeX,
  MoreHorizontal,
  Flag,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Trash2
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { ReportModal } from "../moderation/ReportModal";
import { moderationService } from "../../utils/moderation";
import { analyticsService } from "../../utils/analytics";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../ui/utils";

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified?: boolean;
}

interface Post {
  id: string;
  author: User;
  content: string;
  image?: string;
  video?: string;
  thumbnail?: string;
  linkPreview?: {
    url: string;
    title: string;
    description: string;
    image?: string;
  };
  type: 'text' | 'image' | 'video' | 'reel' | 'link';
  community?: string;
  likes: number;
  comments: Array<{ id: string; content: string; author: User; createdAt: string; likes: number; replies: any[] }>;
  shares: number;
  views?: number;
  timestamp: string;
  isLiked: boolean;
  isSaved?: boolean;
}

interface EnhancedPostCardProps {
  post: Post;
  currentUserId?: string;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
  onSave?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onView?: (postId: string) => void;
}

export const EnhancedPostCard = memo(function EnhancedPostCard({
  post,
  currentUserId,
  onLike,
  onComment,
  onShare,
  onSave,
  onDelete,
  onView
}: EnhancedPostCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasViewed, setHasViewed] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const lastProgressUpdate = useRef(0);

  useEffect(() => {
    if (currentUserId && moderationService.isUserBlocked(post.author.id)) {
      setIsBlocked(true);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasViewed) {
            setHasViewed(true);
            onView?.(post.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [post.id, post.author.id, currentUserId, hasViewed, onView]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentUserId) return;

    const handleLoadedMetadata = () => {
      setVideoDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      const duration = video.duration;
      const progress = (currentTime / duration) * 100;
      
      setVideoProgress(progress);

      const now = Date.now();
      if (now - lastProgressUpdate.current > 5000 || progress >= 25 || progress >= 50 || progress >= 75 || progress >= 95) {
        lastProgressUpdate.current = now;
        analyticsService.trackVideoProgress(post.id, currentUserId, currentTime, duration);
      }
    };

    const handleEnded = () => {
      analyticsService.trackVideoEvent(post.id, currentUserId, 'complete', video.duration, video.duration);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [post.id, currentUserId]);

  const formatTime = useCallback((timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  }, []);

  const formatNumber = useCallback((num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }, []);

  const handleVideoClick = useCallback(() => {
    if (videoRef.current && currentUserId) {
      if (isPlaying) {
        videoRef.current.pause();
        analyticsService.trackVideoEvent(post.id, currentUserId, 'pause', videoRef.current.currentTime, videoRef.current.duration);
      } else {
        videoRef.current.play();
        if (!isPlaying) {
          analyticsService.trackVideoPlay(post.id, currentUserId, videoRef.current.duration);
          analyticsService.updateUserEngagement(currentUserId, 'video_play');
        }
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying, post.id, currentUserId]);

  const handleMuteToggle = useCallback(() => {
    if (videoRef.current && currentUserId) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      analyticsService.track(currentUserId, 'video_mute_toggle', { 
        postId: post.id, 
        muted: !isMuted 
      });
    }
  }, [isMuted, post.id, currentUserId]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    toast.success('Link copied to clipboard!');
    
    if (currentUserId) {
      analyticsService.track(currentUserId, 'post_link_copied', { postId: post.id });
    }
  }, [post.id, currentUserId]);

  const handleReport = useCallback(() => {
    if (!currentUserId) {
      toast.error('Please sign in to report content');
      return;
    }

    if (!moderationService.checkRateLimit(currentUserId, 'reports')) {
      toast.error('You have reached the daily limit for reports. Please try again later.');
      return;
    }

    setShowReportModal(true);
    analyticsService.track(currentUserId, 'report_initiated', { 
      postId: post.id, 
      authorId: post.author.id 
    });
  }, [currentUserId, post.id, post.author.id]);

  const handleHidePost = useCallback(() => {
    toast.success('Post hidden from your feed');
    
    if (currentUserId) {
      analyticsService.track(currentUserId, 'post_hidden', { postId: post.id });
    }
  }, [currentUserId, post.id]);

  const handleOpenInNewTab = useCallback(() => {
    window.open(`/post/${post.id}`, '_blank');
    
    if (currentUserId) {
      analyticsService.track(currentUserId, 'post_opened_new_tab', { postId: post.id });
    }
  }, [post.id, currentUserId]);

  const handleLike = useCallback(() => {
    setIsInteracting(true);
    onLike(post.id);
    setTimeout(() => setIsInteracting(false), 300);
  }, [onLike, post.id]);

  if (isBlocked) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-4 border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950 mx-4 my-2 rounded-lg"
      >
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <EyeOff className="w-4 h-4" />
          <span className="text-sm">Content from blocked user</span>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="border-b border-border hover:bg-accent/20 transition-colors"
      >
        <Card className="border-0 shadow-none rounded-none">
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <motion.div
                className="flex items-center gap-3"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <motion.img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent hover:ring-primary/20 transition-all"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <h3 className="font-medium truncate">{post.author.name}</h3>
                    <AnimatePresence>
                      {post.author.verified && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center"
                        >
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>@{post.author.username}</span>
                    <span>•</span>
                    <span>{formatTime(post.createdAt)}</span>
                    {post.community && (
                      <>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs">
                          {post.community}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleCopyLink}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleOpenInNewTab}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in new tab
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleHidePost}>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Hide post
                  </DropdownMenuItem>
                  {currentUserId !== post.author.id && (
                    <DropdownMenuItem onClick={handleReport} className="text-red-600">
                      <Flag className="w-4 h-4 mr-2" />
                      Report
                    </DropdownMenuItem>
                  )}
                  {currentUserId === post.author.id && onDelete && (
                    <DropdownMenuItem onClick={() => onDelete(post.id)} className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Content */}
            <div className="space-y-3">
              {post.content && (
                <motion.p
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {post.content}
                </motion.p>
              )}

              {/* Media Content */}
              {post.image && (
                <motion.div
                  className="rounded-lg overflow-hidden"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <img
                    src={post.image}
                    alt="Post content"
                    className="w-full h-auto max-h-96 object-cover"
                  />
                </motion.div>
              )}

              {(post.video || post.type === 'reel') && (
                <motion.div
                  className="relative rounded-lg overflow-hidden bg-black"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <video
                    ref={videoRef}
                    src={post.video}
                    poster={post.thumbnail}
                    className="w-full h-auto max-h-96 object-cover cursor-pointer"
                    onClick={handleVideoClick}
                    loop={post.type === 'reel'}
                    muted={isMuted}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                  
                  {/* Video Controls */}
                  <motion.div
                    className="absolute bottom-4 left-4 flex items-center gap-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 border-0"
                        onClick={handleVideoClick}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 border-0"
                        onClick={handleMuteToggle}
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </Button>
                    </motion.div>
                  </motion.div>

                  {/* Video Progress Bar */}
                  <AnimatePresence>
                    {isPlaying && videoDuration > 0 && (
                      <motion.div
                        className="absolute bottom-2 left-4 right-4"
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        exit={{ opacity: 0, scaleX: 0 }}
                      >
                        <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-white rounded-full"
                            style={{ width: `${videoProgress}%` }}
                            transition={{ duration: 0.1 }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {post.type === 'reel' && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.4, type: "spring" }}
                    >
                      <Badge className="absolute top-4 left-4 bg-gradient-to-r from-purple-500 to-pink-500 border-0">
                        Reel
                      </Badge>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Link Preview */}
              {post.linkPreview && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="p-3 hover:bg-muted/50 transition-colors cursor-pointer border">
                    <div className="flex gap-3">
                      {post.linkPreview.image && (
                        <img
                          src={post.linkPreview.image}
                          alt=""
                          className="w-16 h-16 rounded object-cover flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-sm line-clamp-1">
                          {post.linkPreview.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {post.linkPreview.description}
                        </p>
                        <p className="text-xs text-primary mt-1">
                          {new URL(post.linkPreview.url).hostname}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Stats */}
            {post.views && (
              <motion.div
                className="flex items-center gap-1 text-xs text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Eye className="w-3 h-3" />
                <span>{formatNumber(post.views)} views</span>
              </motion.div>
            )}

            {/* Actions */}
            <motion.div
              className="flex items-center justify-between pt-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-1">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  animate={isInteracting ? { scale: [1, 1.2, 1] } : {}}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "flex items-center gap-1 transition-colors",
                      post.isLiked ? 'text-red-500 hover:text-red-600' : 'hover:text-red-500'
                    )}
                    onClick={handleLike}
                  >
                    <motion.div
                      animate={post.isLiked ? { scale: [1, 1.3, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <Heart className={cn("w-4 h-4", post.isLiked && "fill-current")} />
                    </motion.div>
                    <span className="text-xs">{formatNumber(post.likes)}</span>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                    onClick={() => onComment(post.id)}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-xs">{formatNumber(post.comments.length || 0)}</span>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 hover:text-green-500 transition-colors"
                    onClick={() => onShare(post.id)}
                  >
                    <Share className="w-4 h-4" />
                    <span className="text-xs">{formatNumber(post.shares)}</span>
                  </Button>
                </motion.div>
              </div>

              {onSave && (
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "transition-colors",
                      post.isSaved ? 'text-yellow-600 hover:text-yellow-700' : 'hover:text-yellow-600'
                    )}
                    onClick={() => onSave(post.id)}
                  >
                    <Bookmark className={cn("w-4 h-4", post.isSaved && "fill-current")} />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </Card>
      </motion.div>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        contentId={post.id}
        contentType="post"
        contentPreview={post.content}
        reporterId={currentUserId || ''}
      />
    </>
  );
});