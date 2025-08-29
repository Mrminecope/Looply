import React, { useState, useRef, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'motion/react';
import { 
  Star, 
  Quote, 
  ChevronLeft, 
  ChevronRight,
  Play,
  Heart,
  Users,
  TrendingUp,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Avatar } from '../ui/avatar';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  avatar: string;
  content: string;
  rating: number;
  featured: boolean;
  verified: boolean;
  videoUrl?: string;
  metrics?: {
    followers?: string;
    engagement?: string;
    growth?: string;
  };
  platform?: string;
  tags?: string[];
}

interface TestimonialsSectionProps {
  darkMode: boolean;
  onGetStarted: () => void;
}

export function TestimonialsSection({ darkMode, onGetStarted }: TestimonialsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'creators' | 'businesses' | 'communities'>('all');
  
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      role: 'Content Creator',
      company: '@sarahcreates',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face',
      content: 'Looply completely transformed how I connect with my audience. The AI assistant helps me create engaging content, and the community features are incredible. My engagement has increased by 300% since joining!',
      rating: 5,
      featured: true,
      verified: true,
      metrics: {
        followers: '125K',
        engagement: '+300%',
        growth: '+150%'
      },
      platform: 'Instagram → Looply',
      tags: ['content creator', 'growth', 'ai']
    },
    {
      id: '2',
      name: 'Marcus Johnson',
      role: 'Small Business Owner',
      company: 'Urban Coffee Co.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      content: 'As a small business, Looply gave us the tools to compete with bigger brands. The community features helped us build a loyal customer base, and the analytics insights are incredibly valuable.',
      rating: 5,
      featured: true,
      verified: true,
      metrics: {
        followers: '25K',
        engagement: '+250%',
        growth: '+400%'
      },
      platform: 'Traditional Marketing → Looply',
      tags: ['business', 'analytics', 'community']
    },
    {
      id: '3',
      name: 'Elena Rodriguez',
      role: 'Community Manager',
      company: 'TechStartup Inc.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      content: 'The moderation tools and community management features on Looply are outstanding. We moved our entire community here and engagement has never been higher. The safety features give us peace of mind.',
      rating: 5,
      featured: true,
      verified: true,
      videoUrl: 'https://example.com/testimonial-video',
      metrics: {
        followers: '50K',
        engagement: '+180%',
        growth: '+200%'
      },
      platform: 'Discord → Looply',
      tags: ['community', 'moderation', 'safety']
    },
    {
      id: '4',
      name: 'David Park',
      role: 'Video Creator',
      company: '@davidfilms',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      content: 'The video editing tools and reel features are game-changing. I can create professional-quality content right in the app. The algorithm actually helps good content reach the right audience.',
      rating: 5,
      featured: false,
      verified: true,
      metrics: {
        followers: '88K',
        engagement: '+220%',
        growth: '+175%'
      },
      platform: 'TikTok → Looply',
      tags: ['video', 'reels', 'algorithm']
    },
    {
      id: '5',
      name: 'Priya Patel',
      role: 'Fitness Influencer',
      company: '@fithealthypriya',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
      content: 'Finally, a platform that prioritizes authentic connections over vanity metrics. My fitness community on Looply is more engaged and supportive than anywhere else. The wellness features are perfect!',
      rating: 5,
      featured: false,
      verified: true,
      metrics: {
        followers: '67K',
        engagement: '+280%',
        growth: '+190%'
      },
      platform: 'Multiple Platforms → Looply',
      tags: ['fitness', 'wellness', 'authentic']
    },
    {
      id: '6',
      name: 'Alex Thompson',
      role: 'Tech Reviewer',
      company: '@techwithalex',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f74?w=100&h=100&fit=crop&crop=face',
      content: 'The privacy controls and data transparency on Looply are exactly what the industry needs. As someone who reviews tech, I appreciate platforms that respect user privacy while delivering great features.',
      rating: 5,
      featured: false,
      verified: true,
      metrics: {
        followers: '92K',
        engagement: '+160%',
        growth: '+130%'
      },
      platform: 'YouTube → Looply',
      tags: ['tech', 'privacy', 'reviews']
    }
  ];

  const categories = [
    { id: 'all', label: 'All Stories', count: testimonials.length },
    { id: 'creators', label: 'Creators', count: testimonials.filter(t => t.tags?.includes('content creator') || t.tags?.includes('video')).length },
    { id: 'businesses', label: 'Businesses', count: testimonials.filter(t => t.tags?.includes('business') || t.tags?.includes('analytics')).length },
    { id: 'communities', label: 'Communities', count: testimonials.filter(t => t.tags?.includes('community')).length }
  ];

  const filteredTestimonials = testimonials.filter(testimonial => {
    if (selectedCategory === 'all') return true;
    
    const categoryMap = {
      creators: ['content creator', 'video', 'reels', 'fitness'],
      businesses: ['business', 'analytics', 'tech'],
      communities: ['community', 'moderation', 'safety']
    };
    
    return testimonial.tags?.some(tag => 
      categoryMap[selectedCategory]?.includes(tag)
    );
  });

  const featuredTestimonials = filteredTestimonials.filter(t => t.featured);
  const displayTestimonials = featuredTestimonials.length > 0 ? featuredTestimonials : filteredTestimonials.slice(0, 3);

  // Auto-play carousel
  useEffect(() => {
    if (!autoPlay || displayTestimonials.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % displayTestimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoPlay, displayTestimonials.length]);

  const nextTestimonial = () => {
    setCurrentIndex(prev => (prev + 1) % displayTestimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex(prev => (prev - 1 + displayTestimonials.length) % displayTestimonials.length);
  };

  const currentTestimonial = displayTestimonials[currentIndex];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
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
    <section ref={ref} className="py-20 sm:py-32 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-200 dark:bg-purple-800 rounded-full opacity-20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-200 dark:bg-pink-800 rounded-full opacity-20 blur-3xl" />
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
              ⭐ Success Stories
            </Badge>
          </motion.div>

          <motion.h2 
            variants={itemVariants}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Loved by creators{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              worldwide
            </span>
          </motion.h2>

          <motion.p 
            variants={itemVariants}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8"
          >
            Join thousands of creators, businesses, and communities who have transformed 
            their social media presence with Looply.
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
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 border border-gray-200 dark:border-gray-700'
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

        {/* Featured Testimonial Carousel */}
        <motion.div
          className="mb-16"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
              
              <div className="relative p-8 sm:p-12">
                <AnimatePresence mode="wait">
                  {currentTestimonial && (
                    <motion.div
                      key={currentTestimonial.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center"
                    >
                      {/* Content */}
                      <div className="lg:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-5 h-5 ${
                                  i < currentTestimonial.rating 
                                    ? 'text-yellow-400 fill-current' 
                                    : 'text-gray-300'
                                }`} 
                              />
                            ))}
                          </div>
                          
                          {currentTestimonial.verified && (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          
                          {currentTestimonial.videoUrl && (
                            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                              <Play className="w-3 h-3 mr-1" />
                              Video
                            </Badge>
                          )}
                        </div>

                        <Quote className="w-8 h-8 text-purple-500 mb-4" />
                        
                        <blockquote className="text-lg sm:text-xl text-gray-900 dark:text-white leading-relaxed mb-6">
                          "{currentTestimonial.content}"
                        </blockquote>

                        <div className="flex items-center gap-4 mb-6">
                          <Avatar className="w-12 h-12 border-2 border-purple-200 dark:border-purple-700">
                            <img 
                              src={currentTestimonial.avatar} 
                              alt={currentTestimonial.name}
                              className="w-full h-full object-cover"
                            />
                          </Avatar>
                          
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {currentTestimonial.name}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400">
                              {currentTestimonial.role}
                              {currentTestimonial.company && (
                                <span className="text-purple-600 dark:text-purple-400 ml-1">
                                  {currentTestimonial.company}
                                </span>
                              )}
                            </p>
                            {currentTestimonial.platform && (
                              <p className="text-sm text-gray-500 dark:text-gray-500">
                                {currentTestimonial.platform}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          {currentTestimonial.tags?.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="lg:col-span-1">
                        {currentTestimonial.metrics && (
                          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700">
                            <h5 className="font-semibold text-gray-900 dark:text-white mb-4 text-center">
                              Impact on Looply
                            </h5>
                            
                            <div className="space-y-4">
                              {currentTestimonial.metrics.followers && (
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Users className="w-4 h-4" />
                                    Followers
                                  </span>
                                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                                    {currentTestimonial.metrics.followers}
                                  </span>
                                </div>
                              )}
                              
                              {currentTestimonial.metrics.engagement && (
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Heart className="w-4 h-4" />
                                    Engagement
                                  </span>
                                  <span className="font-semibold text-green-600 dark:text-green-400">
                                    {currentTestimonial.metrics.engagement}
                                  </span>
                                </div>
                              )}
                              
                              {currentTestimonial.metrics.growth && (
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <TrendingUp className="w-4 h-4" />
                                    Growth
                                  </span>
                                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                                    {currentTestimonial.metrics.growth}
                                  </span>
                                </div>
                              )}
                            </div>
                          </Card>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Carousel Controls */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    {displayTestimonials.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentIndex
                            ? 'bg-purple-600'
                            : 'bg-gray-300 dark:bg-gray-600 hover:bg-purple-400'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setAutoPlay(!autoPlay)}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                      {autoPlay ? 'Pause' : 'Play'}
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={prevTestimonial}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-all"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={nextTestimonial}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-all"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Additional Testimonials Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {filteredTestimonials.filter(t => !t.featured).slice(0, 6).map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              variants={itemVariants}
              className="group"
            >
              <Card className="p-6 h-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-xl group-hover:scale-[1.02]">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${
                          i < testimonial.rating 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                  
                  {testimonial.verified && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>

                <p className="text-gray-900 dark:text-white mb-4 line-clamp-4">
                  "{testimonial.content}"
                </p>

                <div className="flex items-center gap-3 mt-auto">
                  <Avatar className="w-10 h-10">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </Avatar>
                  
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-xs truncate">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="text-center"
          variants={itemVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <Card className="p-8 sm:p-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                Ready to write your success story?
              </h3>
              
              <p className="text-lg text-purple-100 mb-8">
                Join thousands of creators who have transformed their social media presence. 
                Start building authentic connections today.
              </p>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={onGetStarted}
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-2xl min-w-[200px]"
                >
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}