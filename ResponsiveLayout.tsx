import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

interface ViewportInfo {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const [viewport, setViewport] = useState<ViewportInfo>({
    width: typeof window !== 'undefined' ? window.innerWidth : 375,
    height: typeof window !== 'undefined' ? window.innerHeight : 667,
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : true,
    isTablet: typeof window !== 'undefined' ? window.innerWidth >= 768 && window.innerWidth < 1024 : false,
    isDesktop: typeof window !== 'undefined' ? window.innerWidth >= 1024 : false,
    orientation: typeof window !== 'undefined' ? (window.innerHeight > window.innerWidth ? 'portrait' : 'landscape') : 'portrait'
  });

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setViewport({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        orientation: height > width ? 'portrait' : 'landscape'
      });
    };

    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', () => {
      // Delay to allow orientation change to complete
      setTimeout(updateViewport, 100);
    });

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, []);

  // Calculate safe area insets for mobile devices
  const safeAreaTop = viewport.isMobile ? 'env(safe-area-inset-top, 0)' : '0';
  const safeAreaBottom = viewport.isMobile ? 'env(safe-area-inset-bottom, 0)' : '0';

  return (
    <motion.div
      className="responsive-layout"
      style={{
        width: '100vw',
        height: '100vh',
        paddingTop: safeAreaTop,
        paddingBottom: safeAreaBottom,
        '--viewport-width': `${viewport.width}px`,
        '--viewport-height': `${viewport.height}px`,
      } as React.CSSProperties}
    >
      <div 
        className={`
          mx-auto relative overflow-hidden
          ${viewport.isMobile ? 'w-full' : 'max-w-md'}
          ${viewport.isDesktop ? 'border-x border-border shadow-2xl' : ''}
        `}
        style={{ height: viewport.isMobile ? '100vh' : 'min(100vh, 800px)' }}
      >
        {children}
      </div>

      {/* Viewport Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 bg-black/80 text-white p-2 rounded text-xs z-[999] font-mono">
          <div>{viewport.width} × {viewport.height}</div>
          <div>{viewport.isMobile ? 'Mobile' : viewport.isTablet ? 'Tablet' : 'Desktop'}</div>
          <div>{viewport.orientation}</div>
        </div>
      )}
    </motion.div>
  );
}

// Hook to access viewport information
export function useViewport() {
  const [viewport, setViewport] = useState<ViewportInfo>({
    width: typeof window !== 'undefined' ? window.innerWidth : 375,
    height: typeof window !== 'undefined' ? window.innerHeight : 667,
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : true,
    isTablet: typeof window !== 'undefined' ? window.innerWidth >= 768 && window.innerWidth < 1024 : false,
    isDesktop: typeof window !== 'undefined' ? window.innerWidth >= 1024 : false,
    orientation: typeof window !== 'undefined' ? (window.innerHeight > window.innerWidth ? 'portrait' : 'landscape') : 'portrait'
  });

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setViewport({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        orientation: height > width ? 'portrait' : 'landscape'
      });
    };

    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  return viewport;
}

// Responsive text component
interface ResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  mobileClass?: string;
  tabletClass?: string;
  desktopClass?: string;
}

export function ResponsiveText({ 
  children, 
  className = '', 
  mobileClass = '', 
  tabletClass = '', 
  desktopClass = '' 
}: ResponsiveTextProps) {
  const viewport = useViewport();
  
  const responsiveClass = viewport.isMobile 
    ? mobileClass 
    : viewport.isTablet 
    ? tabletClass 
    : desktopClass;

  return (
    <div className={`${className} ${responsiveClass}`.trim()}>
      {children}
    </div>
  );
}