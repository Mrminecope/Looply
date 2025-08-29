import { Suspense } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { LoadingState } from '../ui/loading';
import { EnhancedProfileHeader } from '../profile/EnhancedProfileHeader';
import { EnhancedPostCard } from '../posts/EnhancedPostCard';
import { DataManagement } from '../settings/DataManagement';
import { ThemeCustomizer } from '../settings/ThemeCustomizer';
import { Settings, BarChart3, LogOut, Shield, FileText, Download, Palette, Database } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { analyticsService } from '../../utils/analytics';
import { localAuth } from '../../utils/local-auth';
import type { User, Post, Community } from '../../types/app';

interface ProfileTabProps {
  user: User | null;
  profileTab: string;
  settingsTab: string;
  userPosts?: Post[];
  mediaPosts?: Post[];
  joinedCommunities?: Community[];
  onProfileTabChange: (tab: string) => void;
  onSettingsTabChange: (tab: string) => void;
  onUpdateProfile: (updates: any) => Promise<void>;
  onDataChange: () => void;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
  onView: (postId: string) => void;
}

export function ProfileTab({
  user,
  profileTab,
  settingsTab,
  userPosts = [],
  mediaPosts = [],
  joinedCommunities = [],
  onProfileTabChange,
  onSettingsTabChange,
  onUpdateProfile,
  onDataChange,
  onLike,
  onComment,
  onShare,
  onView
}: ProfileTabProps) {

  // Return early if user is not available
  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Loading profile...</h2>
          <p className="text-muted-foreground">Please wait while we load your profile.</p>
        </div>
      </div>
    );
  }

  // Ensure arrays are always defined with fallback
  const safeUserPosts = userPosts || [];
  const safeMediaPosts = mediaPosts || [];
  const safeJoinedCommunities = joinedCommunities || [];

  const handleSignOut = () => {
    try {
      analyticsService.track(user.id, 'user_logout');
      analyticsService.endSession();
      localAuth.signOut();
      window.location.reload();
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  const navigateToTab = (tab: string) => {
    // This would be handled by parent component
    analyticsService.track(user.id, `${tab}_opened`);
  };

  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
      <div>
        <EnhancedProfileHeader
          user={user}
          onUpdateProfile={onUpdateProfile}
        />
        
        <Tabs value={profileTab} onValueChange={onProfileTabChange} className="px-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="communities">Communities</TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="size-4" />
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="mt-4">
            <div className="space-y-0">
              <Suspense fallback={<LoadingState type="posts" />}>
                {safeUserPosts.map((post) => (
                  <EnhancedPostCard
                    key={post.id}
                    post={post}
                    currentUserId={user.id}
                    onLike={onLike}
                    onComment={onComment}
                    onShare={onShare}
                    onView={onView}
                    onDelete={(postId) => {
                      analyticsService.track(user.id, 'post_delete_attempt', { postId });
                      toast.info('Delete post feature coming soon!');
                    }}
                  />
                ))}
              </Suspense>
              {safeUserPosts.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-muted-foreground p-8 space-y-4"
                >
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    📝
                  </div>
                  <div>
                    <p className="font-medium">No posts yet</p>
                    <p className="text-sm">Share your first post with the community!</p>
                  </div>
                </motion.div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="media" className="mt-4">
            <div className="grid grid-cols-3 gap-1">
              {safeMediaPosts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="aspect-square bg-muted rounded cursor-pointer overflow-hidden"
                >
                  {post.image ? (
                    <img
                      src={post.image}
                      alt="Media"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      🎥
                    </div>
                  )}
                </motion.div>
              ))}
              {safeMediaPosts.length === 0 && (
                <div className="col-span-3 text-center text-muted-foreground py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    📸
                  </div>
                  <p>No media posts yet</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="communities" className="mt-4">
            <div className="space-y-4">
              {safeJoinedCommunities.map((community) => (
                <motion.div
                  key={community.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div>
                    <h3 className="font-medium">{community.name}</h3>
                    <p className="text-sm text-muted-foreground">{community.memberCount} members</p>
                  </div>
                  {community.role && (
                    <Badge variant="outline">{community.role}</Badge>
                  )}
                </motion.div>
              ))}
              {safeJoinedCommunities.length === 0 && (
                <div className="text-center text-muted-foreground py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    👥
                  </div>
                  <p>No communities joined yet</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <Tabs value={settingsTab} onValueChange={onSettingsTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general" className="text-xs">General</TabsTrigger>
                <TabsTrigger value="data" className="text-xs">Data</TabsTrigger>
                <TabsTrigger value="themes" className="text-xs">Themes</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="mt-4">
                <div className="space-y-4">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => navigateToTab('analytics')}
                    >
                      <BarChart3 className="size-4 mr-2" />
                      View Analytics
                    </Button>
                  </motion.div>
                  
                  {user.isAdmin && (
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => navigateToTab('moderation')}
                      >
                        <Shield className="size-4 mr-2" />
                        Moderation Dashboard
                      </Button>
                    </motion.div>
                  )}
                  
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => navigateToTab('policies')}
                    >
                      <FileText className="size-4 mr-2" />
                      Community Guidelines
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-destructive hover:text-destructive"
                      onClick={handleSignOut}
                    >
                      <LogOut className="size-4 mr-2" />
                      Sign Out
                    </Button>
                  </motion.div>
                </div>
              </TabsContent>

              <TabsContent value="data" className="mt-4">
                <DataManagement userId={user.id} onDataChange={onDataChange} />
              </TabsContent>

              <TabsContent value="themes" className="mt-4">
                <ThemeCustomizer userId={user.id} />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}