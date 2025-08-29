import React, { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'motion/react';
import { 
  HelpCircle, 
  Plus, 
  Minus, 
  Search, 
  Users, 
  Shield, 
  CreditCard,
  Smartphone,
  Zap,
  MessageSquare
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Input } from '../ui/input';

interface FAQSectionProps {
  darkMode: boolean;
  onNavigate: (section: string) => void;
}

export function FAQSection({ darkMode, onNavigate }: FAQSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openItems, setOpenItems] = useState<string[]>([]);

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const categories = [
    { id: 'all', label: 'All Questions', icon: HelpCircle },
    { id: 'general', label: 'General', icon: Users },
    { id: 'features', label: 'Features', icon: Zap },
    { id: 'privacy', label: 'Privacy & Safety', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'mobile', label: 'Mobile App', icon: Smartphone },
    { id: 'support', label: 'Support', icon: MessageSquare }
  ];

  const faqs = [
    {
      id: 'what-is-looply',
      category: 'general',
      question: 'What is Looply?',
      answer: 'Looply is a next-generation social media platform that focuses on authentic connections, creative expression, and community building. We combine AI-powered features like LIA (Looply Intelligent Assistant) with immersive reels, vibrant communities, and advanced safety tools to create a better social experience.'
    },
    {
      id: 'how-to-get-started',
      category: 'general',
      question: 'How do I get started with Looply?',
      answer: 'Getting started is simple! Click the "Get Started" button, create your account with an email or social login, customize your profile, and start exploring. You can begin posting, joining communities, and connecting with others immediately.'
    },
    {
      id: 'what-is-lia',
      category: 'features',
      question: 'What is LIA and how does it work?',
      answer: 'LIA (Looply Intelligent Assistant) is your personal AI companion that helps create engaging content, suggests captions, recommends hashtags, and provides creative inspiration. LIA learns from your preferences to offer personalized suggestions that match your style and interests.'
    },
    {
      id: 'reel-features',
      category: 'features',
      question: 'What makes Looply Reels special?',
      answer: 'Looply Reels offer advanced editing tools, AI-powered effects, smart cropping, music synchronization, and personalized algorithms that learn your preferences. Our reels support multiple formats, collaborative editing, and seamless sharing across communities.'
    },
    {
      id: 'community-features',
      category: 'features',
      question: 'How do communities work on Looply?',
      answer: 'Communities are spaces where people with shared interests gather to discuss, create, and connect. You can join existing communities, create your own, participate in community challenges, and discover content tailored to your interests. Each community has its own rules and moderation.'
    },
    {
      id: 'data-privacy',
      category: 'privacy',
      question: 'How does Looply protect my data?',
      answer: 'We take privacy seriously. Your data is encrypted, we never sell personal information to third parties, you control your privacy settings, and we comply with GDPR, CCPA, and other privacy regulations. You can export or delete your data at any time.'
    },
    {
      id: 'content-moderation',
      category: 'privacy',
      question: 'How does content moderation work?',
      answer: 'We use a combination of AI-powered content filtering, community reporting, and human moderation to keep Looply safe. Our moderation team reviews reports quickly, and we have clear community guidelines that are consistently enforced.'
    },
    {
      id: 'blocking-reporting',
      category: 'privacy',
      question: 'Can I block or report users?',
      answer: 'Yes! You can block users to prevent them from interacting with you, report inappropriate content or behavior, and control who can message or mention you. We take all reports seriously and investigate them promptly.'
    },
    {
      id: 'free-plan',
      category: 'billing',
      question: 'Is Looply really free?',
      answer: 'Yes! Looply offers a generous free plan that includes basic posting, community joining, video creation, and LIA assistance. You can use Looply completely free forever, with optional paid plans for advanced features.'
    },
    {
      id: 'paid-features',
      category: 'billing',
      question: 'What do I get with paid plans?',
      answer: 'Paid plans include unlimited posts, advanced editing tools, premium themes, detailed analytics, priority support, increased storage, advanced LIA features, and no watermarks on content. See our pricing page for full details.'
    },
    {
      id: 'cancel-subscription',
      category: 'billing',
      question: 'Can I cancel my subscription anytime?',
      answer: 'Absolutely! You can cancel your subscription at any time from your account settings. Your paid features will remain active until the end of your billing period, then you\'ll automatically switch to the free plan.'
    },
    {
      id: 'mobile-app',
      category: 'mobile',
      question: 'Is there a mobile app?',
      answer: 'Looply is designed as a Progressive Web App (PWA) that works seamlessly on mobile devices. You can add it to your home screen for an app-like experience. Native iOS and Android apps are coming soon!'
    },
    {
      id: 'offline-features',
      category: 'mobile',
      question: 'Does Looply work offline?',
      answer: 'Yes! Our PWA includes offline functionality. You can view cached content, create drafts, and your posts will sync automatically when you\'re back online. This ensures you never lose your creative momentum.'
    },
    {
      id: 'device-sync',
      category: 'mobile',
      question: 'Do my posts sync across devices?',
      answer: 'Yes! Your account, posts, messages, and preferences sync across all devices where you\'re logged in. Start creating on your phone and finish on your computer, or vice versa.'
    },
    {
      id: 'get-help',
      category: 'support',
      question: 'How can I get help if I have issues?',
      answer: 'We offer multiple support channels: live chat (24/7), email support, help center with guides, community forums, and video tutorials. Our response time is typically under 24 hours for most inquiries.'
    },
    {
      id: 'report-bugs',
      category: 'support',
      question: 'How do I report bugs or suggest features?',
      answer: 'You can report bugs or suggest features through our feedback form, email us directly, or use the feedback option in your account settings. We actively review all suggestions and regularly update Looply based on user feedback.'
    },
    {
      id: 'account-recovery',
      category: 'support',
      question: 'What if I forget my password or lose access?',
      answer: 'Use the "Forgot Password" link on the login page to reset your password via email. If you lose access to your email, contact our support team with your account details, and we\'ll help you recover your account safely.'
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
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

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <motion.div variants={itemVariants} className="mb-6">
            <Badge variant="outline" className="px-4 py-2 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700">
              ❓ Frequently Asked Questions
            </Badge>
          </motion.div>

          <motion.h2 
            variants={itemVariants}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Got questions?{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              We've got answers
            </span>
          </motion.h2>

          <motion.p 
            variants={itemVariants}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8"
          >
            Find answers to the most common questions about Looply, or reach out 
            to our support team if you need additional help.
          </motion.p>

          {/* Search Bar */}
          <motion.div variants={itemVariants} className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions..."
                className="pl-10 h-12 text-base"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          className="mb-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <motion.div variants={itemVariants}>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {categories.map((category) => {
                const IconComponent = category.icon;
                const isActive = activeCategory === category.id;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="hidden sm:inline">{category.label}</span>
                    <span className="sm:hidden">{category.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>

        {/* FAQ Items */}
        <motion.div
          className="space-y-4 mb-16"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {filteredFAQs.map((faq, index) => {
            const isOpen = openItems.includes(faq.id);
            
            return (
              <motion.div
                key={faq.id}
                variants={itemVariants}
                className="group"
              >
                <Card className="overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300">
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full p-6 text-left focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-inset"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors pr-4">
                        {faq.question}
                      </h3>
                      
                      <div className={`flex-shrink-0 p-1 rounded-full transition-all duration-200 ${
                        isOpen 
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rotate-180' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}>
                        <Plus className="w-5 h-5" />
                      </div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6">
                          <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* No Results */}
        {filteredFAQs.length === 0 && (
          <motion.div
            className="text-center py-12"
            variants={itemVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                <HelpCircle className="w-12 h-12 text-gray-400" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No questions found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your search or browse different categories.
            </p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              variant="outline"
              className="border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300"
            >
              Clear Filters
            </Button>
          </motion.div>
        )}

        {/* Still Need Help CTA */}
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
                  <MessageSquare className="w-12 h-12 text-white" />
                </div>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Still need help?
              </h3>
              
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Can't find the answer you're looking for? Our support team is here 
                to help you with any questions or issues you might have.
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
                    Contact Support
                  </Button>
                </motion.div>

                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-8 py-4 text-lg font-semibold rounded-2xl min-w-[180px]"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Live Chat
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}