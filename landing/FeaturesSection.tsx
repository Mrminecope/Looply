import React, { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { 
  Video, 
  Users, 
  Shield, 
  Sparkles, 
  MessageSquare, 
  Heart,
  Camera,
  Zap,
  Globe,
  Palette,
  Bot,
  TrendingUp,
  ArrowRight,
  PlayCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

interface FeaturesSectionProps {
  darkMode: boolean;
  onNavigate: (section: string) => void;
}

export function FeaturesSection({ darkMode, onNavigate }: FeaturesSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const mainFeatures = [
    {
      icon: Video,
      title: "Immersive Reels",
      description: "Create and discover short-form videos with AI-powered editing tools and trending effects.",
      color: "from-purple-500 to-violet-600",
      useCase: "Share your daily moments with cinematic quality",
      demo: "Try Video Editor",
      stats: "500M+ videos created"
    },
    {
      icon: Users,
      title: "Vibrant Communities",
      description: "Join thousands of communities based on your interests, hobbies, and passions.",
      color: "from-blue-500 to-cyan-600",
      useCase: "Connect with like-minded creators and fans",
      demo: "Explore Communities",
      stats: "10K+ active communities"
    },
    {
      icon: Bot,
      title: "LIA Assistant",
      description: "Your personal AI companion that helps create engaging content and captions.",
      color: "from-pink-500 to-rose-600",
      useCase: "Get intelligent suggestions for your posts",
      demo: "Meet LIA",
      stats: "1M+ captions generated"
    },
    {
      icon: Shield,
      title: "Advanced Safety",
      description: "Comprehensive moderation tools and privacy controls to keep your experience secure.",
      color: "from-green-500 to-emerald-600",
      useCase: "Feel safe sharing your authentic self",
      demo: "Safety Center",
      stats: "99.9% spam detection rate"
    }
  ];

  const additionalFeatures = [
    {
      icon: Camera,
      title: "Smart Camera",
      description: "AI-powered camera with filters and effects",
      color: "text-purple-500"
    },
    {
      icon: MessageSquare,
      title: "Real-time Chat",
      description: "Instant messaging with multimedia support",
      color: "text-blue-500"
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Connect with users worldwide",
      color: "text-green-500"
    },
    {
      icon: Palette,
      title: "Custom Themes",
      description: "Personalize your experience",
      color: "text-pink-500"
    },
    {
      icon: TrendingUp,
      title: "Analytics",
      description: "Track your content performance",
      color: "text-orange-500"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized for speed and performance",
      color: "text-yellow-500"
    }
  ];

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
    <section ref={ref} className="py-20 sm:py-32 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-100 dark:bg-pink-900/20 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16 sm:mb-20"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <motion.div variants={itemVariants} className="mb-6">
            <Badge variant="outline" className="px-4 py-2 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700">
              ✨ Powerful Features
            </Badge>
          </motion.div>

          <motion.h2 
            variants={itemVariants}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Everything you need to{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              create and connect
            </span>
          </motion.h2>

          <motion.p 
            variants={itemVariants}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto"
          >
            From AI-powered content creation to immersive video experiences, 
            Looply provides all the tools you need for authentic social engagement.
          </motion.p>
        </motion.div>

        {/* Main Features Grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {mainFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="group"
              >
                <Card className="p-8 h-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-2xl group-hover:scale-[1.02]">
                  <div className="flex items-start gap-6">
                    <div className={`p-4 bg-gradient-to-r ${feature.color} rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                          <Sparkles className="w-4 h-4" />
                          <span className="font-medium">{feature.useCase}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            {feature.stats}
                          </span>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 group/btn"
                          >
                            {feature.demo}
                            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Additional Features Grid */}
        <motion.div
          className="mb-16"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <motion.h3 
            variants={itemVariants}
            className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-12"
          >
            And so much more...
          </motion.h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  className="group"
                >
                  <Card className="p-6 text-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-lg group-hover:scale-105">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className={`w-6 h-6 ${feature.color}`} />
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {feature.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Feature Demo CTA */}
        <motion.div
          className="text-center bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-3xl p-8 sm:p-12 border border-purple-100 dark:border-purple-800"
          variants={itemVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
                <PlayCircle className="w-12 h-12 text-white" />
              </div>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Ready to experience the future?
            </h3>

            <p className="text-lg text-gray-600 dark:text-gray-400">
              Join millions of creators who are already using Looply to share their stories, 
              build communities, and connect with the world.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => onNavigate('pricing')}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold rounded-2xl min-w-[200px]"
                >
                  Start Creating Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>

              <Button
                variant="outline"
                size="lg"
                className="border-2 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-8 py-4 text-lg font-semibold rounded-2xl min-w-[180px]"
              >
                <PlayCircle className="w-5 h-5 mr-2" />
                Watch Features
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}