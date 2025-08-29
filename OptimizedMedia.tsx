import { useState, useCallback, useRef, useEffect } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Loader2, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OptimizedMediaProps {
  src: string;
  alt?: string;
  type: 'image' | 'video';
  className?: string;
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
  onClick?: () => void;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
}

export function OptimizedMedia({
  src,
  alt = 'Media content',
  type,
  className = '',
  poster,
  autoPlay = false,
  muted = true,
  controls = false,
  onClick,
  onLoad,
  onError,
  priority = false,
  quality = 85,
  sizes,
  loading = 'lazy',
  objectFit = 'cover'
}: OptimizedMediaProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  }, [onError]);

  const handleVideoPlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handleVideoPause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const togglePlayPause = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {
          // Handle play error silently
        });
      }
    }
  }, [isPlaying]);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handleClick = useCallback(() => {
    if (type === 'video' && !controls) {
      togglePlayPause({} as React.MouseEvent);
    } else {
      onClick?.();
    }
  }, [type, controls, onClick, togglePlayPause]);

  // Optimize image source based on device capabilities and preferences
  const getOptimizedImageSrc = useCallback((originalSrc: string) => {
    if (!originalSrc) return '';

    // If it's already an optimized URL or external service, return as-is
    if (originalSrc.includes('unsplash.com') || 
        originalSrc.includes('cloudinary.com') ||
        originalSrc.includes('imgix.com')) {
      return originalSrc;
    }

    // For demo/placeholder images, return as-is
    if (originalSrc.startsWith('https://images.unsplash.com/') ||
        originalSrc.startsWith('https://example.com/') ||
        originalSrc.startsWith('figma:asset/')) {
      return originalSrc;
    }

    return originalSrc;
  }, []);

  useEffect(() => {
    if (type === 'video' && videoRef.current) {
      const video = videoRef.current;
      
      video.addEventListener('play', handleVideoPlay);
      video.addEventListener('pause', handleVideoPause);
      video.addEventListener('loadeddata', handleLoad);
      video.addEventListener('error', handleError);

      return () => {
        video.removeEventListener('play', handleVideoPlay);
        video.removeEventListener('pause', handleVideoPause);
        video.removeEventListener('loadeddata', handleLoad);
        video.removeEventListener('error', handleError);
      };
    }
  }, [type, handleVideoPlay, handleVideoPause, handleLoad, handleError]);

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-muted text-muted-foreground ${className}`}>
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-muted-foreground/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="size-8 opacity-50" />
          </div>
          <p className="text-sm">Failed to load media</p>
        </div>
      </div>
    );
  }

  if (type === 'image') {
    return (
      <div 
        className={`relative overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}
        onClick={handleClick}
      >
        <ImageWithFallback
          src={getOptimizedImageSrc(src)}
          alt={alt}
          className={`w-full h-full transition-all duration-300 ${
            objectFit === 'cover' ? 'object-cover' :
            objectFit === 'contain' ? 'object-contain' :
            objectFit === 'fill' ? 'object-fill' :
            objectFit === 'scale-down' ? 'object-scale-down' :
            'object-none'
          } ${onClick ? 'hover:scale-105' : ''}`}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : loading}
          sizes={sizes}
        />

        {/* Loading Overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-muted/50 flex items-center justify-center"
            >
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (type === 'video') {
    return (
      <div 
        className={`relative overflow-hidden group ${onClick ? 'cursor-pointer' : ''} ${className}`}
        onClick={handleClick}
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay={autoPlay}
          muted={isMuted}
          controls={controls}
          loop
          playsInline
          preload="metadata"
          className={`w-full h-full ${
            objectFit === 'cover' ? 'object-cover' :
            objectFit === 'contain' ? 'object-contain' :
            objectFit === 'fill' ? 'object-fill' :
            objectFit === 'scale-down' ? 'object-scale-down' :
            'object-none'
          }`}
          onLoadedData={handleLoad}
          onError={handleError}
        />

        {/* Loading Overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center"
            >
              <Loader2 className="size-8 animate-spin text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video Controls Overlay (when controls are disabled) */}
        {!controls && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          >
            <div className="flex items-center gap-4">
              {/* Play/Pause Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={togglePlayPause}
                className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
              >
                {isPlaying ? (
                  <Pause className="size-8 text-black" />
                ) : (
                  <Play className="size-8 text-black ml-1" />
                )}
              </motion.button>

              {/* Mute/Unmute Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleMute}
                className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
              >
                {isMuted ? (
                  <VolumeX className="size-5 text-black" />
                ) : (
                  <Volume2 className="size-5 text-black" />
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Play Icon for Static State */}
        {!controls && !isPlaying && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
              <Play className="size-10 text-black ml-1" />
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

// Enhanced version with additional features
interface OptimizedMediaEnhancedProps extends OptimizedMediaProps {
  aspectRatio?: string;
  borderRadius?: string;
  overlay?: React.ReactNode;
  caption?: string;
  downloadable?: boolean;
  watermark?: string;
}

export function OptimizedMediaEnhanced({
  aspectRatio,
  borderRadius = '0.5rem',
  overlay,
  caption,
  downloadable = false,
  watermark,
  ...props
}: OptimizedMediaEnhancedProps) {
  const handleDownload = useCallback(async () => {
    if (!downloadable || !props.src) return;

    try {
      const response = await fetch(props.src);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `media_${Date.now()}.${props.type === 'video' ? 'mp4' : 'jpg'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, [downloadable, props.src, props.type]);

  return (
    <div className="relative">
      <div 
        className="relative overflow-hidden"
        style={{ 
          aspectRatio: aspectRatio || undefined,
          borderRadius 
        }}
      >
        <OptimizedMedia {...props} />

        {/* Overlay Content */}
        {overlay && (
          <div className="absolute inset-0 pointer-events-none">
            {overlay}
          </div>
        )}

        {/* Watermark */}
        {watermark && (
          <div className="absolute bottom-4 right-4 text-white/70 text-sm font-medium bg-black/30 px-2 py-1 rounded">
            {watermark}
          </div>
        )}

        {/* Download Button */}
        {downloadable && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDownload}
            className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </motion.button>
        )}
      </div>

      {/* Caption */}
      {caption && (
        <p className="mt-2 text-sm text-muted-foreground">
          {caption}
        </p>
      )}
    </div>
  );
}

export default OptimizedMedia;