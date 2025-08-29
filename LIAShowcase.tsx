import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Sparkles, Hash, Search, TrendingUp, Wand2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLIA } from '../hooks/useLIA';
import type { Post, User } from '../types/app';

interface LIAShowcaseProps {
  posts: Post[];
  user: User;
  onClose: () => void;
}

export function LIAShowcase({ posts, user, onClose }: LIAShowcaseProps) {
  const { 
    quickCaption, 
    quickHashtags, 
    searchContent, 
    getTrendingHashtags,
    getRecommendations,
    loading, 
    error 
  } = useLIA();

  const [activeTab, setActiveTab] = useState('captions');
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any>(null);

  const handleQuickCaption = async () => {
    if (!inputText.trim()) return;
    
    try {
      const result = await quickCaption(inputText, 'Trendy');
      setResults(result);
    } catch (err) {
      console.error('Caption generation failed:', err);
    }
  };

  const handleQuickHashtags = async () => {
    if (!inputText.trim()) return;
    
    try {
      const result = await quickHashtags(inputText);
      setResults(result);
    } catch (err) {
      console.error('Hashtag generation failed:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const result = await searchContent(searchQuery, posts, { 
        sort: 'trending', 
        limit: 5 
      });
      setResults(result);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const handleTrendingHashtags = async () => {
    try {
      const result = await getTrendingHashtags(posts, 10);
      setResults({ hashtags: result });
    } catch (err) {
      console.error('Trending hashtags failed:', err);
    }
  };

  const handleRecommendations = async () => {
    try {
      const result = await getRecommendations(user, posts, 5);
      setResults({ items: result, total: result.length });
    } catch (err) {
      console.error('Recommendations failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-background rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        <Card className="border-0">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="size-5 text-white" />
                </div>
                <div>
                  <CardTitle>LIA Assistant Showcase</CardTitle>
                  <CardDescription>
                    AI-powered content creation and discovery tools
                  </CardDescription>
                </div>
              </div>
              
              <Button variant="ghost" onClick={onClose}>
                ×
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="captions" className="flex items-center gap-2">
                  <Wand2 className="size-4" />
                  Captions
                </TabsTrigger>
                <TabsTrigger value="hashtags" className="flex items-center gap-2">
                  <Hash className="size-4" />
                  Hashtags
                </TabsTrigger>
                <TabsTrigger value="search" className="flex items-center gap-2">
                  <Search className="size-4" />
                  Search
                </TabsTrigger>
                <TabsTrigger value="trending" className="flex items-center gap-2">
                  <TrendingUp className="size-4" />
                  Trending
                </TabsTrigger>
              </TabsList>

              {/* Captions Tab */}
              <TabsContent value="captions" className="space-y-4">
                <div className="space-y-3">
                  <Textarea
                    placeholder="Enter your post idea..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="min-h-24"
                  />
                  
                  <Button 
                    onClick={handleQuickCaption}
                    disabled={loading || !inputText.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {loading ? (
                      <Loader2 className="size-4 mr-2 animate-spin" />
                    ) : (
                      <Wand2 className="size-4 mr-2" />
                    )}
                    Generate Captions
                  </Button>
                </div>

                <AnimatePresence>
                  {results?.options && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <h4 className="font-medium">Generated Captions:</h4>
                      {results.options.map((caption: string, i: number) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="p-3 bg-muted/50 rounded-lg"
                        >
                          <p className="text-sm">{caption}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>

              {/* Hashtags Tab */}
              <TabsContent value="hashtags" className="space-y-4">
                <div className="space-y-3">
                  <Input
                    placeholder="Enter topic for hashtags..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleQuickHashtags}
                      disabled={loading || !inputText.trim()}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {loading ? (
                        <Loader2 className="size-4 mr-2 animate-spin" />
                      ) : (
                        <Hash className="size-4 mr-2" />
                      )}
                      Generate Tags
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={handleTrendingHashtags}
                      disabled={loading}
                    >
                      <TrendingUp className="size-4 mr-2" />
                      Trending
                    </Button>
                  </div>
                </div>

                <AnimatePresence>
                  {results?.hashtags && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <h4 className="font-medium">Suggested Hashtags:</h4>
                      <div className="flex flex-wrap gap-2">
                        {results.hashtags.map((tag: string, i: number) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <Badge variant="outline" className="cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30">
                              {tag}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>

              {/* Search Tab */}
              <TabsContent value="search" className="space-y-4">
                <div className="space-y-3">
                  <Input
                    placeholder="Search posts, users, communities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  
                  <Button 
                    onClick={handleSearch}
                    disabled={loading || !searchQuery.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {loading ? (
                      <Loader2 className="size-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="size-4 mr-2" />
                    )}
                    Smart Search
                  </Button>
                </div>

                <AnimatePresence>
                  {results?.items && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <h4 className="font-medium">Search Results ({results.total}):</h4>
                      {results.items.slice(0, 3).map((post: Post, i: number) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="p-3 bg-muted/50 rounded-lg"
                        >
                          <p className="font-medium text-sm">{post.author.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {post.content.substring(0, 100)}...
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <span>♥ {post.likes}</span>
                            <span>💬 {post.comments.length}</span>
                            {post.community && <Badge variant="outline">{post.community}</Badge>}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>

              {/* Trending Tab */}
              <TabsContent value="trending" className="space-y-4">
                <div className="space-y-3">
                  <Button 
                    onClick={handleRecommendations}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {loading ? (
                      <Loader2 className="size-4 mr-2 animate-spin" />
                    ) : (
                      <TrendingUp className="size-4 mr-2" />
                    )}
                    Get Recommendations
                  </Button>
                </div>

                <AnimatePresence>
                  {results?.items && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <h4 className="font-medium">Recommended for You:</h4>
                      {results.items.map((post: Post, i: number) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="p-3 bg-muted/50 rounded-lg"
                        >
                          <p className="font-medium text-sm">{post.author.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {post.content.substring(0, 100)}...
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <span>♥ {post.likes}</span>
                            <span>💬 {post.comments.length}</span>
                            {post.community && <Badge variant="outline">{post.community}</Badge>}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>
            </Tabs>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}