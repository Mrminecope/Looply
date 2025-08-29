import React, { useState, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  ArrowRight, 
  Eye, 
  Heart,
  MessageCircle,
  Share2,
  Tag,
  TrendingUp,
  User,
  ExternalLink,
  BookOpen,
  Filter
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Avatar } from '../ui/avatar';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  publishedAt: string;
  readTime: string;
  category: string;
  tags: string[];
  featuredImage: string;
  stats: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  featured: boolean;
  trending: boolean;
}

interface BlogSectionProps {
  darkMode: boolean;
  onNavigate: (section: string) => void;
}

export function BlogSection({ darkMode, onNavigate }: BlogSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'insights' | 'features' | 'community' | 'ai'>('all');
  const [showAll, setShowAll] = useState(false);
  
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const blogPosts: BlogPost[] = [
    {
      id: '1',
      title: 'The Future of Social Media: Why Authenticity Matters More Than Ever',
      excerpt: 'Exploring how genuine connections and authentic content are reshaping the social media landscape in 2025, and why platforms like Looply are leading this transformation.',
      content: 'In an era where social media algorithms favor engagement over authenticity, users are craving genuine connections...',
      author: {
        name: 'Sarah Mitchell',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face',
        role: 'Head of Community'
      },
      publishedAt: '2025-01-15',
      readTime: '8 min read',
      category: 'Insights',
      tags: ['authenticity', 'future', 'social media', 'trends', 'connections'],
      featuredImage: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=400&fit=crop',
      stats: {
        views: 12400,
        likes: 856,
        comments: 127,
        shares: 89
      },
      featured: true,
      trending: true
    },
    {
      id: '2',
      title: 'Building Communities That Last: Design Principles from Looply',
      excerpt: 'Learn how we designed community features that foster long-term engagement, meaningful relationships, and sustainable growth for creators and businesses.',
      content: 'Creating online communities is easy, but building ones that last requires thoughtful design and deep understanding of human psychology...',
      author: {
        name: 'Marcus Chen',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        role: 'Product Designer'
      },
      publishedAt: '2025-01-12',
      readTime: '6 min read',
      category: 'Community',
      tags: ['community', 'design', 'engagement', 'psychology', 'growth'],
      featuredImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop',
      stats: {
        views: 9800,
        likes: 642,
        comments: 95,
        shares: 67
      },
      featured: true,
      trending: false
    },
    {
      id: '3',
      title: 'Introducing LIA: Your AI Social Media Assistant',
      excerpt: 'Meet LIA, the intelligent assistant that helps you create better content, engage more meaningfully, and grow your presence authentically on social media.',
      content: 'Artificial intelligence in social media has often been associated with algorithmic manipulation and fake content...',
      author: {
        name: 'Dr. Elena Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        role: 'AI Research Lead'
      },
      publishedAt: '2025-01-10',
      readTime: '10 min read',
      category: 'AI',
      tags: ['ai', 'lia', 'assistant', 'content creation', 'machine learning'],
      featuredImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
      stats: {
        views: 15600,
        likes: 1123,
        comments: 189,
        shares: 156
      },
      featured: true,
      trending: true
    },
    {
      id: '4',
      title: 'Privacy First: How Looply Protects Your Data',
      excerpt: 'A transparent look at our privacy practices, data protection measures, and why user trust is the foundation of everything we build.',
      content: 'Privacy has become a luxury in the modern digital landscape, but we believe it should be a fundamental right...',
      author: {
        name: 'James Wilson',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        role: 'Security Engineer'
      },
      publishedAt: '2025-01-08',
      readTime: '7 min read',
      category: 'Features',
      tags: ['privacy', 'security', 'data protection', 'transparency', 'trust'],
      featuredImage: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop',
      stats: {
        views: 8200,
        likes: 498,
        comments: 73,
        shares: 91
      },
      featured: false,
      trending: false
    },
    {
      id: '5',
      title: 'The Creator Economy Revolution: Monetization Done Right',
      excerpt: 'Exploring sustainable monetization strategies that benefit creators while maintaining authentic audience relationships and platform integrity.',
      content: 'The creator economy has exploded in recent years, but traditional monetization methods often compromise the very authenticity that made creators successful...',
      author: {
        name: 'Lisa Park',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
        role: 'Creator Success Manager'
      },
      publishedAt: '2025-01-05',
      readTime: '9 min read',
      category: 'Insights',
      tags: ['creator economy', 'monetization', 'sustainability', 'authenticity'],
      featuredImage: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=400&fit=crop',
      stats: {
        views: 11300,
        likes: 789,
        comments: 145,
        shares: 102
      },
      featured: false,
      trending: true
    },
    {
      id: '6',
      title: 'Video First: The Technical Magic Behind Looply Reels',
      excerpt: 'A deep dive into the engineering challenges and innovations that power our seamless video experience, from compression to real-time editing.',
      content: 'Building a video-first social platform requires solving complex technical challenges around compression, delivery, and real-time processing...',
      author: {
        name: 'Alex Kumar',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f74?w=100&h=100&fit=crop&crop=face',
        role: 'Senior Engineer'
      },
      publishedAt: '2025-01-03',
      readTime: '12 min read',
      category: 'Features',
      tags: ['video', 'engineering', 'reels', 'technology', 'performance'],
      featuredImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop',
      stats: {
        views: 6700,
        likes: 412,
        comments: 58,
        shares: 45
      },
      featured: false,
      trending: false
    }
  ];

  const categories = [
    { id: 'all', label: 'All Posts', count: blogPosts.length },
    { id: 'insights', label: 'Insights', count: blogPosts.filter(p => p.category === 'Insights').length },
    { id: 'features', label: 'Features', count: blogPosts.filter(p => p.category === 'Features').length },
    { id: 'community', label: 'Community', count: blogPosts.filter(p => p.category === 'Community').length },
    { id: 'ai', label: 'AI & Tech', count: blogPosts.filter(p => p.category === 'AI').length }
  ];

  const filteredPosts = blogPosts.filter(post => {
    if (selectedCategory === 'all') return true;
    return post.category.toLowerCase() === selectedCategory || 
           (selectedCategory === 'ai' && post.category === 'AI');
  });

  const featuredPosts = filteredPosts.filter(p => p.featured);
  const regularPosts = filteredPosts.filter(p => !p.featured);
  const displayPosts = showAll ? regularPosts : regularPosts.slice(0, 6);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section ref={ref} className="py-20 sm:py-32 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-pink-100 dark:bg-pink-900/20 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <motion.div variants={itemVariants} className="mb-6">
            <Badge variant="outline" className="px-4 py-2 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700">
              📚 Blog & Updates
            </Badge>
          </motion.div>

          <motion.h2 
            variants={itemVariants}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Insights from the{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Looply team
            </span>
          </motion.h2>

          <motion.p 
            variants={itemVariants}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8"
          >
            Stay updated with the latest insights, feature announcements, and thought leadership 
            from our team of creators, engineers, and community builders.
          </motion.p>

          {/* Category Filters */}
          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <span>{category.label}</span>
                <Badge variant="secondary" className="text-xs">
                  {category.count}
                </Badge>
              </button>
            ))}
          </motion.div>
        </motion.div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <motion.div
            className="mb-16"
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <motion.div variants={itemVariants} className="mb-8">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Featured Articles
                </h3>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredPosts.slice(0, 2).map((post, index) => (
                <motion.div
                  key={post.id}
                  variants={itemVariants}
                  className="group"
                >
                  <Card className="overflow-hidden h-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-2xl group-hover:scale-[1.02]">
                    <div className="relative overflow-hidden">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        <Badge className="bg-purple-600 text-white">
                          {post.category}
                        </Badge>
                        {post.trending && (
                          <Badge className="bg-red-500 text-white">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Trending
                          </Badge>
                        )}
                      </div>

                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-4 text-white text-sm">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {formatNumber(post.stats.views)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {formatNumber(post.stats.likes)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {formatNumber(post.stats.comments)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <img src={post.author.avatar} alt={post.author.name} />
                          </Avatar>
                          <span>{post.author.name}</span>
                        </div>
                        
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(post.publishedAt)}
                        </span>
                        
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.readTime}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {post.title}
                      </h3>

                      <p className="text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                        {post.excerpt}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 3).map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="outline" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <Button 
                        variant="ghost" 
                        className="w-full group-hover:bg-purple-50 dark:group-hover:bg-purple-900/30 group-hover:text-purple-600 dark:group-hover:text-purple-400"
                      >
                        Read Article
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Regular Posts Grid */}
        <motion.div
          className="mb-12"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Latest Articles
                </h3>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className="border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300"
              >
                <Filter className="w-4 h-4 mr-2" />
                {showAll ? 'Show Less' : 'Show All'}
              </Button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayPosts.map((post, index) => (
              <motion.div
                key={post.id}
                variants={itemVariants}
                className="group"
              >
                <Card className="overflow-hidden h-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-xl group-hover:scale-[1.02]">
                  <div className="relative overflow-hidden">
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-purple-600 text-white text-xs">
                        {post.category}
                      </Badge>
                    </div>

                    {post.trending && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-red-500 text-white text-xs">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Hot
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-5 h-5">
                          <img src={post.author.avatar} alt={post.author.name} />
                        </Avatar>
                        <span>{post.author.name}</span>
                      </div>
                      
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.publishedAt)}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {post.title}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                      
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {formatNumber(post.stats.views)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {formatNumber(post.stats.likes)}
                        </span>
                      </div>
                    </div>

                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="w-full group-hover:bg-purple-50 dark:group-hover:bg-purple-900/30 group-hover:text-purple-600 dark:group-hover:text-purple-400"
                    >
                      Read More
                      <ExternalLink className="w-3 h-3 ml-2" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Newsletter Signup CTA */}
        <motion.div
          className="text-center"
          variants={itemVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <Card className="p-8 sm:p-12 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700">
            <div className="max-w-3xl mx-auto">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
                  <BookOpen className="w-12 h-12 text-white" />
                </div>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Never miss an update
              </h3>
              
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Get the latest insights, feature updates, and industry trends delivered 
                directly to your inbox. Join thousands of creators staying ahead of the curve.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => onNavigate('contact')}
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold rounded-2xl min-w-[200px]"
                  >
                    Subscribe Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>

                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-8 py-4 text-lg font-semibold rounded-2xl min-w-[180px]"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  View All Posts
                </Button>
              </div>

              <div className="mt-6 text-sm text-gray-500 dark:text-gray-500">
                📧 Weekly insights • 🚀 Feature updates • 🎯 Industry trends
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}