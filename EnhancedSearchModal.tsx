import { useState, useEffect, useMemo } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Search, X, Users, Hash, TrendingUp, Filter, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLIA } from '../hooks/useLIA';
import type { Post, User, Community } from '../types/app';

interface EnhancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: Post[];
  communities: Community[];
  onPostClick: (postId: string) => void;
  onUserClick: (userId: string) => void;
  onCommunityClick: (communityId: string) => void;
}

export function EnhancedSearchModal({
  isOpen,
  onClose,
  posts,
  communities,
  onPostClick,
  onUserClick,
  onCommunityClick
}: EnhancedSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState<'recent' | 'trending' | 'popular'>('recent');
  const [filterType, setFilterType] = useState<'all' | 'text' | 'image' | 'video' | 'reel'>('all');
  const { searchContent, getTrendingHashtags, loading } = useLIA();
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [trendingTags, setTrendingTags] = useState<string[]>([]);

  // Get unique users from posts
  const users = useMemo(() => {
    const uniqueUsers = new Map();
    posts.forEach(post => {
      if (!uniqueUsers.has(post.author.id)) {
        uniqueUsers.set(post.author.id, post.author);
      }
    });
    return Array.from(uniqueUsers.values());
  }, [posts]);

  // Load trending hashtags on mount
  useEffect(() => {
    if (isOpen) {
      loadTrendingTags();
    }
  }, [isOpen]);

  // Perform search when query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, sortBy, filterType]);

  const loadTrendingTags = async () => {
    try {
      const tags = await getTrendingHashtags(posts, 10);
      setTrendingTags(tags);
    } catch (error) {
      console.error('Failed to load trending tags:', error);
    }
  };

  const performSearch = async () => {
    try {
      const result = await searchContent(searchQuery, posts, {
        type: filterType === 'all' ? undefined : filterType as any,
        sort: sortBy,
        limit: 50
      });
      setSearchResults(result.items);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    return users.filter(user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 10);
  }, [users, searchQuery]);

  const filteredCommunities = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    return communities.filter(community =>
      community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 10);
  }, [communities, searchQuery]);

  const handleHashtagClick = (tag: string) => {
    setSearchQuery(tag.replace('#', ''));
    setActiveTab('all');
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setActiveTab('all');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border border-border"
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/30">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search posts, users, communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 rounded-full border-purple-200 dark:border-purple-700 focus:border-purple-500"
              autoFocus
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 h-6 w-6 rounded-full"
              >
                <X className="size-3" />
              </Button>
            )}
          </div>
          
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <X className="size-5" />
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 p-4 border-b border-border overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            <Button
              variant={sortBy === 'recent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('recent')}
              className="rounded-full"
            >
              <Clock className="size-4 mr-1" />
              Recent
            </Button>
            
            <Button
              variant={sortBy === 'trending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('trending')}
              className="rounded-full"
            >
              <TrendingUp className="size-4 mr-1" />
              Trending
            </Button>
            
            <Button
              variant={sortBy === 'popular' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('popular')}
              className="rounded-full"
            >
              Popular
            </Button>
          </div>

          <div className="h-4 w-px bg-border mx-2" />

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="text-sm border border-border rounded-full px-3 py-1 bg-background"
          >
            <option value="all">All Types</option>
            <option value="text">Text</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="reel">Reels</option>
          </select>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 rounded-none border-b">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="communities">Communities</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              {/* All Results */}
              <TabsContent value="all" className="h-full">
                <ScrollArea className="h-[400px] p-4">
                  {!searchQuery.trim() && (
                    <div className="space-y-4">
                      {trendingTags.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Hash className="size-4" />
                            Trending Hashtags
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {trendingTags.map((tag, i) => (
                              <motion.button
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => handleHashtagClick(tag)}
                              >
                                <Badge 
                                  variant="outline" 
                                  className="hover:bg-purple-100 dark:hover:bg-purple-900/30 cursor-pointer transition-colors"
                                >
                                  {tag}
                                </Badge>
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="text-center py-8 text-muted-foreground">
                        <Search className="size-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">Start typing to search</p>
                        <p className="text-sm">Find posts, users, and communities</p>
                      </div>
                    </div>
                  )}

                  {searchQuery.trim() && (
                    <div className="space-y-6">
                      {/* Posts */}
                      {searchResults.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-3">Posts</h4>
                          <div className="space-y-3">
                            {searchResults.slice(0, 3).map((post, i) => (
                              <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                              >
                                <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onPostClick(post.id)}>
                                  <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                      <Avatar className="size-8">
                                        <AvatarImage src={post.author.avatar} />
                                        <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-medium text-sm">{post.author.name}</span>
                                          <Badge variant="outline" className="text-xs">{post.type}</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                          <span>♥ {post.likes}</span>
                                          <span>💬 {post.comments.length}</span>
                                          {post.community && <Badge variant="outline">{post.community}</Badge>}
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Users */}
                      {filteredUsers.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-3">Users</h4>
                          <div className="space-y-2">
                            {filteredUsers.slice(0, 3).map((user, i) => (
                              <motion.div
                                key={user.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
                                onClick={() => onUserClick(user.id)}
                              >
                                <Avatar className="size-10">
                                  <AvatarImage src={user.avatar} />
                                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{user.name}</p>
                                  <p className="text-sm text-muted-foreground">@{user.username}</p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Communities */}
                      {filteredCommunities.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-3">Communities</h4>
                          <div className="space-y-2">
                            {filteredCommunities.slice(0, 3).map((community, i) => (
                              <motion.div
                                key={community.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
                                onClick={() => onCommunityClick(community.id)}
                              >
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-semibold">
                                  {community.name[0]}
                                </div>
                                <div>
                                  <p className="font-medium">{community.name}</p>
                                  <p className="text-sm text-muted-foreground">{community.members} members</p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* No Results */}
                      {searchQuery.trim() && searchResults.length === 0 && filteredUsers.length === 0 && filteredCommunities.length === 0 && !loading && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Search className="size-12 mx-auto mb-3 opacity-50" />
                          <p className="font-medium">No results found</p>
                          <p className="text-sm">Try different keywords or check your spelling</p>
                        </div>
                      )}

                      {loading && (
                        <div className="flex items-center justify-center py-8">
                          <div className="loading-spinner" />
                          <span className="ml-2 text-muted-foreground">Searching...</span>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              {/* Posts Tab */}
              <TabsContent value="posts" className="h-full">
                <ScrollArea className="h-[400px] p-4">
                  <div className="space-y-3">
                    {searchResults.map((post, i) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onPostClick(post.id)}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Avatar className="size-8">
                                <AvatarImage src={post.author.avatar} />
                                <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm">{post.author.name}</span>
                                  <Badge variant="outline" className="text-xs">{post.type}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-3">{post.content}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <span>♥ {post.likes}</span>
                                  <span>💬 {post.comments.length}</span>
                                  {post.community && <Badge variant="outline">{post.community}</Badge>}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users" className="h-full">
                <ScrollArea className="h-[400px] p-4">
                  <div className="space-y-2">
                    {filteredUsers.map((user, i) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
                        onClick={() => onUserClick(user.id)}
                      >
                        <Avatar className="size-12">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">@{user.username}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Communities Tab */}
              <TabsContent value="communities" className="h-full">
                <ScrollArea className="h-[400px] p-4">
                  <div className="space-y-2">
                    {filteredCommunities.map((community, i) => (
                      <motion.div
                        key={community.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
                        onClick={() => onCommunityClick(community.id)}
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-semibold">
                          {community.name[0]}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{community.name}</p>
                          <p className="text-sm text-muted-foreground">{community.members} members</p>
                          {community.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{community.description}</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
}