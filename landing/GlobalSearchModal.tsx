import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  X, 
  FileText, 
  HelpCircle, 
  Zap, 
  ArrowRight,
  Calendar,
  Hash,
  Star,
  TrendingUp,
  Filter
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

interface SearchResult {
  id: string;
  type: 'feature' | 'faq' | 'blog' | 'page';
  title: string;
  content: string;
  url: string;
  category?: string;
  date?: string;
  popularity?: number;
  tags?: string[];
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: string) => void;
  darkMode: boolean;
}

export function GlobalSearchModal({ isOpen, onClose, onNavigate, darkMode }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'features' | 'faq' | 'blog' | 'pages'>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock search data - in a real app, this would come from an API or search service
  const searchData: SearchResult[] = [
    // Features
    {
      id: 'reels',
      type: 'feature',
      title: 'Immersive Reels',
      content: 'Create and discover short-form videos with AI-powered editing tools and trending effects. Share your daily moments with cinematic quality.',
      url: '#features',
      category: 'Video',
      popularity: 95,
      tags: ['video', 'ai', 'editing', 'reels']
    },
    {
      id: 'lia',
      type: 'feature',
      title: 'LIA Assistant',
      content: 'Your personal AI companion that helps create engaging content and captions. Get intelligent suggestions for your posts.',
      url: '#features',
      category: 'AI',
      popularity: 90,
      tags: ['ai', 'assistant', 'content', 'captions']
    },
    {
      id: 'communities',
      type: 'feature',
      title: 'Vibrant Communities',
      content: 'Join thousands of communities based on your interests, hobbies, and passions. Connect with like-minded creators and fans.',
      url: '#features',
      category: 'Social',
      popularity: 85,
      tags: ['communities', 'social', 'interests']
    },
    {
      id: 'safety',
      type: 'feature',
      title: 'Advanced Safety',
      content: 'Comprehensive moderation tools and privacy controls to keep your experience secure. Feel safe sharing your authentic self.',
      url: '#features',
      category: 'Security',
      popularity: 80,
      tags: ['safety', 'privacy', 'security', 'moderation']
    },
    // FAQs
    {
      id: 'what-is-looply',
      type: 'faq',
      title: 'What is Looply?',
      content: 'Looply is a next-generation social media platform that focuses on authentic connections, creative expression, and community building.',
      url: '#faq',
      category: 'General',
      popularity: 100,
      tags: ['platform', 'social media', 'authentic']
    },
    {
      id: 'lia-how-it-works',
      type: 'faq',
      title: 'How does LIA work?',
      content: 'LIA (Looply Intelligent Assistant) learns from your preferences to offer personalized suggestions that match your style and interests.',
      url: '#faq',
      category: 'Features',
      popularity: 85,
      tags: ['lia', 'ai', 'personalized', 'suggestions']
    },
    {
      id: 'pricing-free',
      type: 'faq',
      title: 'Is Looply really free?',
      content: 'Yes! Looply offers a generous free plan that includes basic posting, community joining, video creation, and LIA assistance.',
      url: '#faq',
      category: 'Pricing',
      popularity: 95,
      tags: ['free', 'pricing', 'plan']
    },
    // Blog posts
    {
      id: 'blog-1',
      type: 'blog',
      title: 'The Future of Social Media: Why Authenticity Matters',
      content: 'Exploring how genuine connections and authentic content are reshaping the social media landscape in 2025.',
      url: '/blog/future-of-social-media',
      category: 'Insights',
      date: '2025-01-15',
      popularity: 88,
      tags: ['authenticity', 'future', 'social media', 'trends']
    },
    {
      id: 'blog-2',
      type: 'blog',
      title: 'Building Communities That Last: Lessons from Looply',
      content: 'How we designed community features that foster long-term engagement and meaningful relationships.',
      url: '/blog/building-communities',
      category: 'Community',
      date: '2025-01-10',
      popularity: 82,
      tags: ['communities', 'engagement', 'design']
    },
    {
      id: 'blog-3',
      type: 'blog',
      title: 'AI in Social Media: Introducing LIA',
      content: 'Meet LIA, your intelligent social media assistant that helps you create better content and connect more meaningfully.',
      url: '/blog/introducing-lia',
      category: 'AI',
      date: '2025-01-05',
      popularity: 92,
      tags: ['ai', 'lia', 'content creation', 'assistant']
    },
    // Pages
    {
      id: 'about',
      type: 'page',
      title: 'About Looply',
      content: 'Learn about our mission to reimagine social media for human connection and our core values.',
      url: '#about',
      category: 'Company',
      popularity: 75,
      tags: ['about', 'mission', 'values', 'company']
    },
    {
      id: 'pricing',
      type: 'page',
      title: 'Pricing Plans',
      content: 'Choose your perfect plan. Start free, upgrade when ready. All plans include core features with no hidden fees.',
      url: '#pricing',
      category: 'Pricing',
      popularity: 90,
      tags: ['pricing', 'plans', 'free', 'upgrade']
    },
    {
      id: 'contact',
      type: 'page',
      title: 'Contact Us',
      content: 'Get in touch with our team. We respond to all inquiries within 24 hours during business days.',
      url: '#contact',
      category: 'Support',
      popularity: 70,
      tags: ['contact', 'support', 'help']
    }
  ];

  // Filter and search logic
  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];

    setIsSearching(true);
    
    let filtered = searchData;

    // Apply type filter
    if (selectedFilter !== 'all') {
      const typeMap = {
        features: 'feature',
        faq: 'faq',
        blog: 'blog',
        pages: 'page'
      };
      filtered = filtered.filter(item => item.type === typeMap[selectedFilter]);
    }

    // Search query
    const searchQuery = query.toLowerCase().trim();
    filtered = filtered.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(searchQuery);
      const contentMatch = item.content.toLowerCase().includes(searchQuery);
      const tagMatch = item.tags?.some(tag => tag.toLowerCase().includes(searchQuery));
      const categoryMatch = item.category?.toLowerCase().includes(searchQuery);
      
      return titleMatch || contentMatch || tagMatch || categoryMatch;
    });

    // Sort by relevance (popularity + title match boost)
    filtered.sort((a, b) => {
      const aTitle = a.title.toLowerCase().includes(searchQuery) ? 10 : 0;
      const bTitle = b.title.toLowerCase().includes(searchQuery) ? 10 : 0;
      const aScore = (a.popularity || 0) + aTitle;
      const bScore = (b.popularity || 0) + bTitle;
      return bScore - aScore;
    });

    setTimeout(() => setIsSearching(false), 300);
    return filtered.slice(0, 10); // Limit results
  }, [query, selectedFilter]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (!isOpen) {
          // This would be handled by parent component
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const handleResultClick = (result: SearchResult) => {
    if (result.url.startsWith('#')) {
      const section = result.url.replace('#', '');
      onNavigate(section);
      onClose();
    } else {
      // For blog posts or external URLs
      window.open(result.url, '_blank');
    }
  };

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'feature': return Zap;
      case 'faq': return HelpCircle;
      case 'blog': return FileText;
      case 'page': return Hash;
      default: return Search;
    }
  };

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'feature': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'faq': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'blog': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'page': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-8">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-2xl mt-8 sm:mt-16"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Card className="overflow-hidden bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search features, FAQs, blog posts..."
                    className="pl-10 pr-4 h-12 text-base border-0 focus:ring-0 bg-gray-50 dark:bg-gray-800"
                  />
                </div>
                
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 mt-4 overflow-x-auto">
                {[
                  { id: 'all', label: 'All', icon: Search },
                  { id: 'features', label: 'Features', icon: Zap },
                  { id: 'faq', label: 'FAQ', icon: HelpCircle },
                  { id: 'blog', label: 'Blog', icon: FileText },
                  { id: 'pages', label: 'Pages', icon: Hash }
                ].map((filter) => {
                  const IconComponent = filter.icon;
                  const isActive = selectedFilter === filter.id;
                  return (
                    <button
                      key={filter.id}
                      onClick={() => setSelectedFilter(filter.id as any)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                        isActive
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      {filter.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {isSearching ? (
                <div className="p-8 text-center">
                  <div className="inline-block w-6 h-6 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                  <p className="mt-2 text-gray-600 dark:text-gray-400">Searching...</p>
                </div>
              ) : query.trim() && filteredResults.length === 0 ? (
                <div className="p-8 text-center">
                  <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No results found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try adjusting your search terms or filters
                  </p>
                </div>
              ) : filteredResults.length > 0 ? (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredResults.map((result, index) => {
                    const IconComponent = getResultIcon(result.type);
                    return (
                      <motion.button
                        key={result.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleResultClick(result)}
                        className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                            <IconComponent className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                                {result.title}
                              </h4>
                              <Badge className={`text-xs ${getTypeColor(result.type)}`}>
                                {result.type}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                              {result.content}
                            </p>
                            
                            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
                              {result.category && (
                                <span className="flex items-center gap-1">
                                  <Hash className="w-3 h-3" />
                                  {result.category}
                                </span>
                              )}
                              {result.date && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(result.date).toLocaleDateString()}
                                </span>
                              )}
                              {result.popularity && result.popularity > 80 && (
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  Popular
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors opacity-0 group-hover:opacity-100" />
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Search Looply
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Find features, FAQs, blog posts, and more
                  </p>
                  <div className="text-sm text-gray-500 dark:text-gray-500">
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">⌘</kbd>
                    <span className="mx-1">+</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">K</kbd>
                    <span className="ml-2">to search</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {query.trim() && filteredResults.length > 0 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>
                    {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} found
                  </span>
                  <div className="flex items-center gap-4">
                    <span>
                      <kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded">↑</kbd>
                      <kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded ml-1">↓</kbd>
                      <span className="ml-2">to navigate</span>
                    </span>
                    <span>
                      <kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded">Enter</kbd>
                      <span className="ml-2">to select</span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}