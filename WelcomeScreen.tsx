import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Logo } from './Logo';
import { AuthModal } from './auth/AuthModal';
import { ErrorBoundary } from './ErrorBoundary';
import { motion, AnimatePresence } from 'motion/react';
import { FloatingNavBar } from './landing/FloatingNavBar';
import { EnhancedHeroSection } from './landing/EnhancedHeroSection';
import { FeaturesSection } from './landing/FeaturesSection';
import { TestimonialsSection } from './landing/TestimonialsSection';
import { PricingSection } from './landing/PricingSection';
import { BlogSection } from './landing/BlogSection';
import { AboutSection } from './landing/AboutSection';
import { ContactSection } from './landing/ContactSection';
import { FAQSection } from './landing/FAQSection';
import { GlobalSearchModal } from './landing/GlobalSearchModal';
import { landingAnalytics } from '../utils/analytics-landing';
import { Search, ArrowUp } from 'lucide-react';
import type { User } from '../types/app';

interface WelcomeScreenProps {
  showAuthModal: boolean;
  isOnline: boolean;
  onGetStarted: () => void;
  onCloseAuth: () => void;
  onAuthSuccess: (user: User) => void;
}

export function WelcomeScreen({ 
  showAuthModal, 
  isOnline, 
  onGetStarted, 
  onCloseAuth, 
  onAuthSuccess 
}: WelcomeScreenProps) {
  const [currentSection, setCurrentSection] = useState('home');
  const [darkMode, setDarkMode] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('looply-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialDarkMode = savedTheme ? savedTheme === 'dark' : systemPrefersDark;
    setDarkMode(initialDarkMode);
    
    if (initialDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Track initial page load
    landingAnalytics.trackPageView('/welcome');
    landingAnalytics.trackEvent('landing_page_loaded', {
      theme: initialDarkMode ? 'dark' : 'light',
      online: isOnline,
      userAgent: navigator.userAgent
    });
  }, [isOnline]);

  // Handle dark mode toggle
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('looply-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('looply-theme', 'light');
    }

    // Track theme change
    landingAnalytics.trackEvent('theme_changed', {
      new_theme: newDarkMode ? 'dark' : 'light'
    });
  };

  // Enhanced navigation with analytics
  const handleNavigation = (sectionId: string) => {
    setCurrentSection(sectionId);
    
    // Track navigation
    landingAnalytics.trackNavigation(sectionId, 'navigation');
    
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80; // Account for floating nav
      const elementPosition = element.offsetTop - headerOffset;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  // Enhanced Get Started with analytics
  const handleGetStarted = (source: string = 'unknown') => {
    landingAnalytics.trackCTA('get_started', source, {
      section: currentSection,
      timestamp: Date.now()
    });
    
    onGetStarted();
  };

  // Global search functionality
  const handleSearchOpen = () => {
    setShowSearchModal(true);
    landingAnalytics.trackEvent('search_opened', {
      source: 'global_search',
      section: currentSection
    });
  };

  const handleSearchClose = () => {
    setShowSearchModal(false);
    landingAnalytics.trackEvent('search_closed');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Search shortcut (Cmd/Ctrl + K)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleSearchOpen();
      }
      
      // Escape to close search
      if (e.key === 'Escape' && showSearchModal) {
        handleSearchClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSearchModal]);

  // Track scroll position to update active nav item
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'features', 'testimonials', 'pricing', 'blog', 'about', 'contact', 'faq'];
      const scrollPosition = window.scrollY + 200; // Offset for better UX

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const element = document.getElementById(section);
        
        if (element && scrollPosition >= element.offsetTop) {
          if (currentSection !== section) {
            setCurrentSection(section);
            landingAnalytics.trackEvent('section_viewed', {
              section,
              scroll_position: scrollPosition
            });
          }
          break;
        }
      }

      // Special case for top of page
      if (window.scrollY < 100) {
        setCurrentSection('home');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentSection]);

  // Track demo video interaction
  const handleWatchDemo = () => {
    landingAnalytics.trackCTA('watch_demo', 'hero_section');
    landingAnalytics.trackMediaInteraction('video', 'play', 'demo_video');
    console.log('Open demo video');
  };

  return (
    <ErrorBoundary>
      <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
        {/* Floating Navigation with Search */}
        <FloatingNavBar
          onNavigate={handleNavigation}
          onGetStarted={(source) => handleGetStarted('nav_bar')}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          currentSection={currentSection}
        />

        {/* Global Search Button - Fixed Position */}
        <motion.button
          onClick={handleSearchOpen}
          className="fixed top-24 right-4 z-40 p-3 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
        >
          <Search className="w-5 h-5" />
          <span className="sr-only">Search Looply</span>
          
          {/* Keyboard shortcut hint */}
          <div className="absolute -bottom-8 right-0 hidden sm:block text-xs text-gray-400 dark:text-gray-600 whitespace-nowrap">
            <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">⌘K</kbd>
          </div>
        </motion.button>

        {/* Global Search Modal */}
        <GlobalSearchModal
          isOpen={showSearchModal}
          onClose={handleSearchClose}
          onNavigate={handleNavigation}
          darkMode={darkMode}
        />

        {/* Hero Section */}
        <section id="home" className="relative">
          <EnhancedHeroSection
            onGetStarted={() => handleGetStarted('hero_primary')}
            onWatchDemo={handleWatchDemo}
            darkMode={darkMode}
            isOnline={isOnline}
          />
        </section>

        {/* Features Section */}
        <section id="features">
          <FeaturesSection 
            darkMode={darkMode}
            onNavigate={handleNavigation}
          />
        </section>

        {/* Testimonials Section */}
        <section id="testimonials">
          <TestimonialsSection 
            darkMode={darkMode}
            onGetStarted={() => handleGetStarted('testimonials_cta')}
          />
        </section>

        {/* Pricing Section */}
        <section id="pricing">
          <PricingSection 
            onGetStarted={() => handleGetStarted('pricing_cta')}
            darkMode={darkMode}
          />
        </section>

        {/* Blog Section */}
        <section id="blog">
          <BlogSection 
            darkMode={darkMode}
            onNavigate={handleNavigation}
          />
        </section>

        {/* About Section */}
        <section id="about">
          <AboutSection 
            darkMode={darkMode}
            onNavigate={handleNavigation}
          />
        </section>

        {/* Contact Section */}
        <section id="contact">
          <ContactSection darkMode={darkMode} />
        </section>

        {/* FAQ Section */}
        <section id="faq">
          <FAQSection 
            darkMode={darkMode}
            onNavigate={handleNavigation}
          />
        </section>

        {/* Final CTA Banner */}
        <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to transform your social media?
              </h2>
              <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
                Join millions of creators building authentic connections on Looply. 
                Start your journey today – it's free!
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => handleGetStarted('final_cta')}
                    size="lg"
                    className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-2xl min-w-[200px]"
                  >
                    Get Started Free
                  </Button>
                </motion.div>
                <Button
                  onClick={() => handleNavigation('features')}
                  variant="outline"
                  size="lg"
                  className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-2xl min-w-[180px]"
                >
                  Explore Features
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 dark:bg-black text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
              {/* Logo & Description */}
              <div className="md:col-span-2">
                <div className="flex items-center mb-4">
                  <Logo size="md" showText={true} className="text-white" />
                </div>
                <p className="text-gray-400 mb-6 max-w-md">
                  Reimagining social media for authentic connections, creative expression, 
                  and meaningful communities. Join millions who are already creating 
                  their story on Looply.
                </p>
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
                  <span className="text-sm text-gray-400">
                    {isOnline ? 'All systems operational' : 'Demo mode active'}
                  </span>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2 text-gray-400">
                  {[
                    { label: 'Features', id: 'features' },
                    { label: 'Testimonials', id: 'testimonials' },
                    { label: 'Pricing', id: 'pricing' },
                    { label: 'Blog', id: 'blog' },
                    { label: 'About', id: 'about' },
                    { label: 'FAQ', id: 'faq' }
                  ].map((link) => (
                    <li key={link.id}>
                      <button
                        onClick={() => {
                          handleNavigation(link.id);
                          landingAnalytics.trackCTA('footer_link', 'footer', { link: link.label });
                        }}
                        className="hover:text-white transition-colors"
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support */}
              <div>
                <h3 className="font-semibold mb-4">Support</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <button
                      onClick={() => {
                        handleNavigation('contact');
                        landingAnalytics.trackCTA('contact_footer', 'footer');
                      }}
                      className="hover:text-white transition-colors"
                    >
                      Contact Us
                    </button>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Community Guidelines
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Privacy Policy
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between">
              <p className="text-gray-400 text-sm mb-4 sm:mb-0">
                © 2025 Looply. All rights reserved. Made with ❤️ for authentic connections.
              </p>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    toggleDarkMode();
                    landingAnalytics.trackEvent('theme_toggle', { source: 'footer' });
                  }}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                </button>
                
                <Button
                  onClick={() => handleGetStarted('footer_cta')}
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </footer>

        {/* Authentication Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={onCloseAuth}
          onSuccess={onAuthSuccess}
        />

        {/* Scroll to Top Button */}
        <AnimatePresence>
          {currentSection !== 'home' && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => {
                handleNavigation('home');
                landingAnalytics.trackCTA('scroll_to_top', 'floating_button');
              }}
              className="fixed bottom-8 right-8 p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowUp className="w-6 h-6" />
              <span className="sr-only">Scroll to top</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}