import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark,
  MoreHorizontal,
  Send,
  Copy,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReactionType {
  emoji: string;
  label: string;
  count: number;
}

interface EnhancedReactionBarProps {
  postId: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reactions?: ReactionType[];
  isLiked?: boolean;
  isBookmarked?: boolean;
  currentUserId?: string;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
  onReaction?: (postId: string, emoji: string) => void;
  onExternalShare?: (platform: string, postId: string) => void;
  className?: string;
}

export function EnhancedReactionBar({
  postId,
  likes,
  comments,
  shares,
  saves,
  reactions = [],
  isLiked = false,
  isBookmarked = false,
  currentUserId,
  onLike,
  onComment,
  onShare,
  onSave,
  onReaction,
  onExternalShare,
  className = ''
}: EnhancedReactionBarProps) {
  const [showReactions, setShowReactions] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Default reactions if none provided
  const defaultReactions = [
    { emoji: '❤️', label: 'Love', count: 0 },
    { emoji: '😂', label: 'Haha', count: 0 },
    { emoji: '🔥', label: 'Fire', count: 0 },
    { emoji: '👏', label: 'Clap', count: 0 },
    { emoji: '😮', label: 'Wow', count: 0 },
    { emoji: '😢', label: 'Sad', count: 0 },
    { emoji: '😡', label: 'Angry', count: 0 },
    { emoji: '🎉', label: 'Celebrate', count: 0 }
  ];

  const availableReactions = reactions.length > 0 ? reactions : defaultReactions;

  const handleReactionClick = (emoji: string) => {
    onReaction?.(postId, emoji);
    setShowReactions(false);
  };

  const handleExternalShare = (platform: string) => {
    onExternalShare?.(platform, postId);
    setShowShareMenu(false);
  };

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(postUrl).then(() => {
      setShowShareMenu(false);
      // Show success toast (would need toast system)
    });
  };

  const formatCount = (count: number): string => {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}k`;
    return `${(count / 1000000).toFixed(1)}m`;
  };

  return (
    <div className={`flex items-center justify-between px-4 py-3 border-t border-border bg-card ${className}`}>
      {/* Left side - Like, Comment, Share */}
      <div className="flex items-center gap-1">
        {/* Enhanced Like Button with Reaction Picker */}
        <Popover open={showReactions} onOpenChange={setShowReactions}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all ${
                isLiked 
                  ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                  : 'text-muted-foreground hover:text-red-500 hover:bg-red-50'
              }`}
              onClick={(e) => {
                if (e.detail === 1) {
                  // Single click - like
                  onLike();
                } else if (e.detail === 2) {
                  // Double click - show reactions
                  setShowReactions(true);
                }
              }}
            >
              <Heart 
                className={`size-5 transition-all ${isLiked ? 'fill-current' : ''}`} 
              />
              <span className="font-medium">{formatCount(likes)}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3" align="start">
            <div className="grid grid-cols-4 gap-2">
              {availableReactions.map((reaction, index) => (
                <motion.button
                  key={`${reaction.emoji}-${index}`} // Use index to ensure uniqueness
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleReactionClick(reaction.emoji)}
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <span className="text-2xl mb-1">{reaction.emoji}</span>
                  <span className="text-xs font-medium">{reaction.label}</span>
                  {reaction.count > 0 && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      {formatCount(reaction.count)}
                    </Badge>
                  )}
                </motion.button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Comment Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onComment}
          className="flex items-center gap-2 px-3 py-2 rounded-full text-muted-foreground hover:text-blue-500 hover:bg-blue-50 transition-all"
        >
          <MessageCircle className="size-5" />
          <span className="font-medium">{formatCount(comments)}</span>
        </Button>

        {/* Enhanced Share Button */}
        <Popover open={showShareMenu} onOpenChange={setShowShareMenu}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 px-3 py-2 rounded-full text-muted-foreground hover:text-green-500 hover:bg-green-50 transition-all"
            >
              <Share2 className="size-5" />
              <span className="font-medium">{formatCount(shares)}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="start">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm mb-3">Share this post</h4>
              
              {/* External Platform Shares */}
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleExternalShare('whatsapp')}
                  className="w-full justify-start gap-3 px-3 py-2"
                >
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Send className="size-3 text-white" />
                  </div>
                  <span>WhatsApp</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleExternalShare('twitter')}
                  className="w-full justify-start gap-3 px-3 py-2"
                >
                  <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
                    <ExternalLink className="size-3 text-white" />
                  </div>
                  <span>Twitter</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleExternalShare('facebook')}
                  className="w-full justify-start gap-3 px-3 py-2"
                >
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <ExternalLink className="size-3 text-white" />
                  </div>
                  <span>Facebook</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleExternalShare('instagram')}
                  className="w-full justify-start gap-3 px-3 py-2"
                >
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <ExternalLink className="size-3 text-white" />
                  </div>
                  <span>Instagram</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleExternalShare('linkedin')}
                  className="w-full justify-start gap-3 px-3 py-2"
                >
                  <div className="w-6 h-6 bg-blue-700 rounded-full flex items-center justify-center">
                    <ExternalLink className="size-3 text-white" />
                  </div>
                  <span>LinkedIn</span>
                </Button>
              </div>
              
              <div className="border-t pt-2 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyLink}
                  className="w-full justify-start gap-3 px-3 py-2"
                >
                  <Copy className="size-4" />
                  <span>Copy Link</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onShare();
                    setShowShareMenu(false);
                  }}
                  className="w-full justify-start gap-3 px-3 py-2"
                >
                  <Share2 className="size-4" />
                  <span>Share within app</span>
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Right side - Save and More */}
      <div className="flex items-center gap-1">
        {/* Save/Bookmark Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onSave}
          className={`p-2 rounded-full transition-all ${
            isBookmarked 
              ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100' 
              : 'text-muted-foreground hover:text-yellow-500 hover:bg-yellow-50'
          }`}
        >
          <Bookmark className={`size-5 ${isBookmarked ? 'fill-current' : ''}`} />
        </Button>

        {/* More Options */}
        <Button
          variant="ghost"
          size="sm"
          className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          <MoreHorizontal className="size-5" />
        </Button>
      </div>

      {/* Active Reactions Display */}
      {reactions.some(r => r.count > 0) && (
        <div className="absolute -top-6 left-4 flex items-center gap-1 bg-background border border-border rounded-full px-2 py-1 shadow-sm">
          {reactions
            .filter(r => r.count > 0)
            .slice(0, 3)
            .map((reaction, index) => (
              <div key={`active-${reaction.emoji}-${index}`} className="flex items-center">
                <span className="text-sm">{reaction.emoji}</span>
                {index < 2 && reactions.filter(r => r.count > 0).length > index + 1 && (
                  <span className="text-xs text-muted-foreground mx-1">•</span>
                )}
              </div>
            ))}
          {reactions.filter(r => r.count > 0).length > 3 && (
            <span className="text-xs text-muted-foreground ml-1">
              +{reactions.filter(r => r.count > 0).length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}