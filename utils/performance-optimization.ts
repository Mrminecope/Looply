/**
 * Performance Optimization Utilities for Looply Landing Page
 * Handles image optimization, lazy loading, and performance monitoring
 */

import { landingAnalytics } from './analytics-landing';

interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  sizes?: string;
  lazy?: boolean;
  placeholder?: 'blur' | 'empty';
  priority?: boolean;
}

interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  timeToFirstByte: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  firstInputDelay?: number;
}

class PerformanceOptimizer {
  private observer?: IntersectionObserver;
  private imageQueue: Set<HTMLImageElement> = new Set();
  private performanceMetrics: PerformanceMetrics | null = null;
  private resourceHints: Set<string> = new Set();

  constructor() {
    this.initializeLazyLoading();
    this.preloadCriticalResources();
    this.monitorPerformance();
    this.optimizeAnimations();
  }

  /**
   * Initialize lazy loading for images
   */
  private initializeLazyLoading() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              this.loadImage(img);
              this.observer?.unobserve(img);
            }
          });
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01
        }
      );
    }
  }

  /**
   * Optimize image loading with modern formats and lazy loading
   */
  optimizeImage(
    src: string, 
    options: ImageOptimizationOptions = {}
  ): {
    src: string;
    srcSet?: string;
    sizes?: string;
    loading: 'lazy' | 'eager';
    decoding: 'async' | 'sync';
    onLoad?: () => void;
  } {
    const {
      quality = 85,
      format = 'webp',
      sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
      lazy = true,
      priority = false
    } = options;

    // Generate optimized URLs (this would integrate with your image service)
    const optimizedSrc = this.generateOptimizedUrl(src, { quality, format });
    const srcSet = this.generateSrcSet(src, { quality, format });

    return {
      src: optimizedSrc,
      srcSet,
      sizes,
      loading: priority ? 'eager' : lazy ? 'lazy' : 'eager',
      decoding: 'async',
      onLoad: () => {
        landingAnalytics.trackEvent('image_loaded', {
          src: optimizedSrc,
          format,
          lazy: lazy && !priority
        });
      }
    };
  }

  /**
   * Generate optimized image URL
   */
  private generateOptimizedUrl(
    src: string, 
    options: { quality: number; format: string }
  ): string {
    // This would integrate with your image optimization service
    // For now, return the original URL
    return src;
  }

  /**
   * Generate responsive srcSet
   */
  private generateSrcSet(
    src: string, 
    options: { quality: number; format: string }
  ): string {
    const sizes = [400, 800, 1200, 1600];
    return sizes
      .map(size => `${this.generateOptimizedUrl(src, { ...options, width: size })} ${size}w`)
      .join(', ');
  }

  /**
   * Load image with proper error handling
   */
  private loadImage(img: HTMLImageElement) {
    const src = img.dataset.src;
    const srcSet = img.dataset.srcset;

    if (!src) return;

    // Create a new image to preload
    const imageLoader = new Image();
    
    imageLoader.onload = () => {
      img.src = src;
      if (srcSet) img.srcset = srcSet;
      img.classList.add('loaded');
      img.classList.remove('loading');
      
      // Track successful load
      landingAnalytics.trackEvent('lazy_image_loaded', {
        src,
        loadTime: performance.now()
      });
    };

    imageLoader.onerror = () => {
      img.classList.add('error');
      img.classList.remove('loading');
      
      // Track failed load
      landingAnalytics.trackEvent('image_load_error', {
        src,
        error: 'Failed to load image'
      });
    };

    img.classList.add('loading');
    imageLoader.src = src;
  }

  /**
   * Register image for lazy loading
   */
  registerLazyImage(img: HTMLImageElement) {
    if (this.observer && img.dataset.src) {
      this.observer.observe(img);
      this.imageQueue.add(img);
    }
  }

  /**
   * Preload critical resources
   */
  private preloadCriticalResources() {
    // Preload critical CSS
    this.preloadResource('/styles/globals.css', 'style');
    
    // Preload hero images
    this.preloadResource('https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=400&fit=crop', 'image');
    
    // Preload fonts
    this.preloadResource('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap', 'style');
    
    // DNS prefetch for external domains
    this.dnsPrefetch('https://images.unsplash.com');
    this.dnsPrefetch('https://fonts.googleapis.com');
    this.dnsPrefetch('https://fonts.gstatic.com');
  }

  /**
   * Preload a resource with the appropriate hint
   */
  private preloadResource(href: string, as: 'image' | 'style' | 'script' | 'font') {
    if (this.resourceHints.has(href)) return;
    this.resourceHints.add(href);

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    
    if (as === 'font') {
      link.crossOrigin = 'anonymous';
    }
    
    document.head.appendChild(link);
  }

  /**
   * Add DNS prefetch hint
   */
  private dnsPrefetch(href: string) {
    if (this.resourceHints.has(href)) return;
    this.resourceHints.add(href);

    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = href;
    document.head.appendChild(link);
  }

  /**
   * Monitor performance metrics
   */
  private monitorPerformance() {
    // Wait for the page to load
    window.addEventListener('load', () => {
      this.collectPerformanceMetrics();
    });

    // Monitor Core Web Vitals
    this.monitorCoreWebVitals();
  }

  /**
   * Collect performance metrics
   */
  private collectPerformanceMetrics() {
    if (!window.performance || !window.performance.timing) return;

    const timing = window.performance.timing;
    const navigationStart = timing.navigationStart;

    this.performanceMetrics = {
      loadTime: timing.loadEventEnd - navigationStart,
      domContentLoaded: timing.domContentLoadedEventEnd - navigationStart,
      timeToFirstByte: timing.responseStart - navigationStart
    };

    // Track performance metrics
    landingAnalytics.trackEvent('performance_metrics', this.performanceMetrics);

    // Check if performance is poor and report
    if (this.performanceMetrics.loadTime > 3000) {
      landingAnalytics.trackEvent('slow_page_load', {
        loadTime: this.performanceMetrics.loadTime,
        connection: (navigator as any).connection?.effectiveType || 'unknown'
      });
    }
  }

  /**
   * Monitor Core Web Vitals
   */
  private monitorCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          if (this.performanceMetrics) {
            this.performanceMetrics.largestContentfulPaint = lastEntry.startTime;
          }
          
          landingAnalytics.trackEvent('lcp', {
            value: lastEntry.startTime,
            good: lastEntry.startTime <= 2500
          });
        });
        
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Contentful Paint (FCP)
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          if (this.performanceMetrics) {
            this.performanceMetrics.firstContentfulPaint = lastEntry.startTime;
          }
          
          landingAnalytics.trackEvent('fcp', {
            value: lastEntry.startTime,
            good: lastEntry.startTime <= 1800
          });
        });
        
        fcpObserver.observe({ entryTypes: ['paint'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          
          if (this.performanceMetrics) {
            this.performanceMetrics.cumulativeLayoutShift = clsValue;
          }
        });
        
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          if (this.performanceMetrics) {
            this.performanceMetrics.firstInputDelay = (lastEntry as any).processingStart - lastEntry.startTime;
          }
          
          landingAnalytics.trackEvent('fid', {
            value: (lastEntry as any).processingStart - lastEntry.startTime,
            good: ((lastEntry as any).processingStart - lastEntry.startTime) <= 100
          });
        });
        
        fidObserver.observe({ entryTypes: ['first-input'] });

      } catch (error) {
        console.warn('Performance monitoring not available:', error);
      }
    }
  }

  /**
   * Optimize animations for performance
   */
  private optimizeAnimations() {
    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      document.documentElement.style.setProperty('--animation-duration', '0.01ms');
      landingAnalytics.trackEvent('reduced_motion_detected');
    }

    // Add will-change optimization
    this.optimizeWillChange();
  }

  /**
   * Optimize will-change properties
   */
  private optimizeWillChange() {
    const animatedElements = document.querySelectorAll('[class*="animate-"], [class*="transition-"]');
    
    animatedElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      
      // Add will-change before animation
      htmlElement.addEventListener('animationstart', () => {
        htmlElement.style.willChange = 'transform, opacity';
      });
      
      // Remove will-change after animation
      htmlElement.addEventListener('animationend', () => {
        htmlElement.style.willChange = 'auto';
      });
      
      htmlElement.addEventListener('transitionstart', () => {
        htmlElement.style.willChange = 'transform, opacity';
      });
      
      htmlElement.addEventListener('transitionend', () => {
        htmlElement.style.willChange = 'auto';
      });
    });
  }

  /**
   * Preload next section's content
   */
  preloadNextSection(sectionId: string) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    // Preload images in the next section
    const images = section.querySelectorAll('img[data-src]');
    images.forEach((img) => {
      if (img instanceof HTMLImageElement) {
        this.loadImage(img);
      }
    });

    landingAnalytics.trackEvent('section_preloaded', { section: sectionId });
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics | null {
    return this.performanceMetrics;
  }

  /**
   * Cleanup resources
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    
    this.imageQueue.clear();
    this.resourceHints.clear();
  }
}

// Create optimized image component hook
export function useOptimizedImage(src: string, options: ImageOptimizationOptions = {}) {
  const optimizer = new PerformanceOptimizer();
  return optimizer.optimizeImage(src, options);
}

// Critical resource loader
export function loadCriticalResources() {
  // Load critical CSS
  const criticalCSS = `
    .loading { opacity: 0; transform: translateY(20px); }
    .loaded { opacity: 1; transform: translateY(0); transition: all 0.3s ease; }
    .error { opacity: 0.5; }
  `;
  
  const style = document.createElement('style');
  style.textContent = criticalCSS;
  document.head.appendChild(style);
}

// Create global performance optimizer instance
export const performanceOptimizer = new PerformanceOptimizer();

// Load critical resources immediately
loadCriticalResources();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  performanceOptimizer.destroy();
});

export default performanceOptimizer;