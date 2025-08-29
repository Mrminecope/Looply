import React, { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { 
  Target, 
  Heart, 
  Globe, 
  Users, 
  Zap, 
  Shield,
  Award,
  TrendingUp,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

interface AboutSectionProps {
  darkMode: boolean;
  onNavigate: (section: string) => void;
}

export function AboutSection({ darkMode, onNavigate }: AboutSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const values = [
    {
      icon: Heart,
      title: "Authentic Connections",
      description: "We believe in fostering genuine relationships and meaningful interactions, not just follower counts."
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your data belongs to you. We're committed to transparency and giving you control over your information."
    },
    {
      icon: Globe,
      title: "Global Community",
      description: "Connecting people across cultures and borders to create a truly inclusive social experience."
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "Constantly pushing boundaries with AI-powered features and cutting-edge technology."
    }
  ];

  const stats = [
    { number: "2M+", label: "Active Users", icon: Users },
    { number: "50M+", label: "Posts Created", icon: TrendingUp },
    { number: "10K+", label: "Communities", icon: Globe },
    { number: "99.9%", label: "Uptime", icon: Zap }
  ];

  const team = [
    {
      name: "Alex Chen",
      role: "CEO & Founder",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      bio: "Former VP of Product at Meta, passionate about human-centered design."
    },
    {
      name: "Sarah Johnson",
      role: "CTO",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face",
      bio: "Ex-Google engineer with 15+ years in scalable systems and AI."
    },
    {
      name: "Marcus Rodriguez",
      role: "Head of Design",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      bio: "Award-winning designer from Apple, focused on accessibility and inclusion."
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
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-pink-100 dark:bg-pink-900/20 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16 sm:mb-20"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <motion.div variants={itemVariants} className="mb-6">
            <Badge variant="outline" className="px-4 py-2 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700">
              🚀 About Looply
            </Badge>
          </motion.div>

          <motion.h2 
            variants={itemVariants}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Reimagining social media for{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              human connection
            </span>
          </motion.h2>

          <motion.p 
            variants={itemVariants}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed"
          >
            Looply was born from a simple belief: social media should bring people together, 
            not drive them apart. We're building a platform that celebrates authenticity, 
            creativity, and genuine human connection.
          </motion.p>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          className="mb-20"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-3xl p-8 sm:p-12 border border-purple-100 dark:border-purple-800"
          >
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
                  <Target className="w-12 h-12 text-white" />
                </div>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Our Mission
              </h3>

              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                To create a social platform where creativity flourishes, communities thrive, 
                and every voice matters. We're committed to building technology that enhances 
                human connection rather than replacing it.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { icon: Heart, title: "Authentic", desc: "Real connections" },
                  { icon: Shield, title: "Safe", desc: "Protected community" },
                  { icon: Sparkles, title: "Creative", desc: "Express yourself" }
                ].map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={index} className="text-center">
                      <div className="inline-flex p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-3">
                        <IconComponent className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Core Values */}
        <motion.div
          className="mb-20"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Core Values
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              These principles guide everything we do, from product decisions to community building.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <motion.div
                  key={value.title}
                  variants={itemVariants}
                  className="group"
                >
                  <Card className="p-8 h-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-xl group-hover:scale-[1.02]">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                          {value.title}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                          {value.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="mb-20"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Growing Together
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Our community continues to grow every day
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
                  className="text-center group"
                >
                  <Card className="p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-lg group-hover:scale-105">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stat.number}
                      </div>
                      
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        {stat.label}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Team */}
        <motion.div
          className="mb-16"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Meet Our Team
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Passionate individuals from diverse backgrounds, united by a shared vision 
              for better social media.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                variants={itemVariants}
                className="group"
              >
                <Card className="p-8 text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-xl group-hover:scale-[1.02]">
                  <div className="relative inline-block mb-6">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-24 h-24 rounded-full mx-auto group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute -bottom-2 -right-2 p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                      <Award className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {member.name}
                  </h4>
                  
                  <p className="text-purple-600 dark:text-purple-400 font-medium mb-4">
                    {member.role}
                  </p>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {member.bio}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center"
          variants={itemVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <Card className="p-8 sm:p-12 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Join Our Journey
              </h3>
              
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Be part of building the future of social media. Your voice, creativity, 
                and connections matter to us.
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
                    Get In Touch
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>

                <Button
                  onClick={() => onNavigate('features')}
                  variant="outline"
                  size="lg"
                  className="border-2 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-8 py-4 text-lg font-semibold rounded-2xl min-w-[180px]"
                >
                  Explore Features
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}