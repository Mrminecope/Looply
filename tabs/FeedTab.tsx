import { useState, useMemo } from 'react';
import { PostCard } from '../PostCard';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { TrendingUp, Hash, Flame, Clock, Users, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FeatureShowcase } from '../FeatureShowcase';
import { richDemoData } from '../../data/richDemoData';
import type { User, Post } from '../../types/app';

interface FeedTabProps {
  posts?: Post[];
  user: User | null;
  onLike: (postId: string, reactionType?: string) => void;
  onComment: (postId: string, comment: string) => void;
  onShare: (postId: string, platform?: string) => void;
  onView: (postId: string) => void;
  onVideoClick: (videoId: string, index: number) => void;
  onReport?: (type: 'post', id: string, user?: User, content?: string) => void;
  onUpdateProfile?: (updates: any) => Promise<void>;
  onOpenCreateModal?: () => void;
}

export function FeedTab({
  posts = [],
  user,
  onLike,
  onComment,
  onShare,
  onView,
  onVideoClick,
  onReport
}: FeedTabProps) {
  const [feedFilter, setFeedFilter] = useState<'all' | 'following' | 'trending'>('all');
  const [contentFilter, setContentFilter] = useState<'all' | 'text' | 'image' | 'video'>('all');

  // Return early if user is not available
  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Loading feed...</h2>
          <p className="text-muted-foreground">Please wait while we prepare your content.</p>
        </div>
      </div>
    );
  }

  // Ensure posts is always defined
  const safePosts = posts || [];

  // Filter posts based on selected filters
  const filteredPosts = useMemo(() => {
    let filtered = [...safePosts];

    // Apply feed filter
    if (feedFilter === 'following') {
      // In a real app, this would filter by followed users
      filtered = filtered.filter(post => Math.random() > 0.3);
    } else if (feedFilter === 'trending') {
      // Sort by engagement (likes + comments + shares)
      filtered = filtered.sort((a, b) => {
        const engagementA = a.likes + a.comments.length + a.shares;
        const engagementB = b.likes + b.comments.length + b.shares;
        return engagementB - engagementA;
      });
    }

    // Apply content filter
    if (contentFilter !== 'all') {
      filtered = filtered.filter(post => post.type === contentFilter);
    }

    return filtered;
  }, [safePosts, feedFilter, contentFilter]);

  // Enhanced like handler with multiple reactions
  const handleLike = (postId: string) => {
    onLike(postId);
    
    // Add visual feedback
    const element = document.querySelector(`[data-post-id="${postId}"]`);
    if (element) {
      element.classList.add('reaction-bounce');
      setTimeout(() => element.classList.remove('reaction-bounce'), 600);
    }
  };

  // Enhanced share handler with external platforms
  const handleShare = (postId: string) => {
    onShare(postId);
  };

  const handleExternalShare = (platform: string, postId: string) => {
    onShare(postId, platform);
    
    // Show success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg z-50 notification-slide';
    notification.textContent = `Shared to ${platform}! 🚀`;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
  };

  // Handle reaction (beyond just like)
  const handleReaction = (postId: string, emoji: string) => {
    // In a real app, this would update the specific reaction count
    console.log('Reaction:', emoji, 'on post:', postId);
    
    // Add visual feedback
    const element = document.querySelector(`[data-post-id="${postId}"]`);
    if (element) {
      const reactionElement = document.createElement('div');
      reactionElement.className = 'fixed pointer-events-none z-50 text-2xl';
      reactionElement.textContent = emoji;
      reactionElement.style.left = '50%';
      reactionElement.style.top = '50%';
      reactionElement.style.transform = 'translate(-50%, -50%)';
      
      document.body.appendChild(reactionElement);
      
      // Animate reaction
      reactionElement.animate([
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        { transform: 'translate(-50%, -200%) scale(2)', opacity: 0 }
      ], {
        duration: 1500,
        easing: 'ease-out'
      });
      
      setTimeout(() => reactionElement.remove(), 1500);
    }
  };

  // Handle post save
  const handleSave = (postId: string) => {
    console.log('Save post:', postId);
    
    // Show feedback
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg z-50 notification-slide';
    notification.textContent = 'Post saved! 📌';
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6">
      {/* Feed Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border pb-4 mb-4">
        {/* Feed Filters */}
        <Tabs value={feedFilter} onValueChange={(value: any) => setFeedFilter(value)} className="mb-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Zap className="size-4" />
              <span className="hidden sm:inline">All Posts</span>
              <span className="sm:hidden">All</span>
            </TabsTrigger>
            <TabsTrigger value="following" className="flex items-center gap-2">
              <Users className="size-4" />
              <span className="hidden sm:inline">Following</span>
              <span className="sm:hidden">Following</span>
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="size-4" />
              <span className="hidden sm:inline">Trending</span>
              <span className="sm:hidden">Trending</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Content Type Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Button
            variant={contentFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setContentFilter('all')}
            className="rounded-full shrink-0"
          >
            All Content
          </Button>
          <Button
            variant={contentFilter === 'text' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setContentFilter('text')}
            className="rounded-full shrink-0"
          >
            Text
          </Button>
          <Button
            variant={contentFilter === 'image' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setContentFilter('image')}
            className="rounded-full shrink-0"
          >
            Images
          </Button>
          <Button
            variant={contentFilter === 'video' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setContentFilter('video')}
            className="rounded-full shrink-0"
          >
            Videos
          </Button>
        </div>
      </div>

      {/* Trending Hashtags */}
      <Card className="white-theme-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Hash className="size-5 text-primary" />
            <h3 className="font-semibold">Trending Now</h3>
            <Flame className="size-4 text-orange-500" />
          </div>
          <div className="flex flex-wrap gap-2">
            {richDemoData.trendingHashtags.slice(0, 6).map((hashtag, index) => (
              <motion.div
                key={hashtag.tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {hashtag.tag}
                  <span className="ml-1 text-xs opacity-70">{hashtag.growth}</span>
                </Badge>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-6">
        <AnimatePresence>
          {filteredPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="size-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No posts to show</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or check back later for new content.
              </p>
            </motion.div>
          ) : (
            filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                data-post-id={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="white-theme-card rounded-2xl overflow-hidden"
              >
                <PostCard
                  post={post}
                  currentUserId={user.id}
                  onLike={(postId, reactionType) => onLike(postId, reactionType)}
                  onComment={(postId, comment) => onComment(postId, comment)}
                  onShare={(postId) => onShare(postId)}
                  onView={(postId) => onView(postId)}
                  onVideoClick={() => onVideoClick(post.id, index)}
                  onSave={(postId) => handleSave(postId)}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Load More */}
      {filteredPosts.length > 0 && (
        <div className="text-center py-8">
          <Button variant="outline" className="rounded-full">
            Load More Posts
          </Button>
        </div>
      )}
    </div>
  );
}