import { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

interface AdaptiveVideoPlayerProps {
  src: string; // HLS manifest URL or direct video URL
  poster?: string; // Thumbnail URL
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
  className?: string;
  onViewCount?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: string) => void;
}

export function AdaptiveVideoPlayer({
  src,
  poster,
  autoPlay = false,
  muted = true,
  controls = true,
  className = '',
  onViewCount,
  onPlay,
  onPause,
  onEnded,
  onError
}: AdaptiveVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [hasStarted, setHasStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Show/hide controls with timeout
  const showControlsWithTimeout = useCallback(() => {
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    // Set initial properties
    video.muted = muted;
    video.autoplay = autoPlay;
    
    // HLS support detection and setup
    const setupVideo = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check if URL is HLS manifest
        const isHLS = src.includes('.m3u8');
        
        if (isHLS) {
          // Try native HLS support first (Safari, iOS)
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
          } else if ('MediaSource' in window) {
            // Use hls.js for browsers that don't support HLS natively
            try {
              const { default: Hls } = await import('hls.js');
              
              if (Hls.isSupported()) {
                const hls = new Hls({
                  enableWorker: true,
                  lowLatencyMode: false,
                  maxBufferLength: 30,
                  maxBufferSize: 60 * 1000 * 1000, // 60MB
                  capLevelToPlayerSize: true,
                  startLevel: -1, // Auto-select quality
                });
                
                hls.loadSource(src);
                hls.attachMedia(video);
                
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                  setIsLoading(false);
                });
                
                hls.on(Hls.Events.ERROR, (event, data) => {
                  console.error('HLS error:', data);
                  if (data.fatal) {
                    setError('Failed to load video');
                    onError?.('HLS playback error');
                  }
                });
                
                // Cleanup function
                return () => {
                  hls.destroy();
                };
              }
            } catch (err) {
              console.error('Failed to load hls.js:', err);
              setError('Video format not supported');
              onError?.('HLS not supported');
            }
          } else {
            setError('Video format not supported in this browser');
            onError?.('MediaSource not supported');
          }
        } else {
          // Direct video file
          video.src = src;
        }
      } catch (err) {
        console.error('Video setup error:', err);
        setError('Failed to load video');
        onError?.('Video setup error');
      }
    };
    
    setupVideo();
    
    // Event listeners
    const handleLoadedData = () => {
      setIsLoading(false);
      setDuration(video.duration);
    };
    
    const handlePlay = () => {
      if (!hasStarted) {
        setHasStarted(true);
        onViewCount?.();
      }
      setIsPlaying(true);
      onPlay?.();
    };
    
    const handlePause = () => {
      setIsPlaying(false);
      onPause?.();
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };
    
    const handleError = () => {
      setIsLoading(false);
      setError('Failed to load video');
      onError?.('Video load error');
    };
    
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('error', handleError);
    
    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('error', handleError);
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [src, muted, autoPlay, hasStarted, onViewCount, onPlay, onPause, onEnded, onError]);
  
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video || isLoading) return;
    
    if (video.paused) {
      video.play().catch((err) => {
        console.error('Play failed:', err);
        setError('Playback failed');
      });
    } else {
      video.pause();
    }
  };
  
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };
  
  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen().catch((err) => {
        console.error('Fullscreen failed:', err);
      });
    }
  };
  
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    video.currentTime = percent * duration;
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  if (error) {
    return (
      <div className={cn("relative bg-muted rounded-lg overflow-hidden", className)}>
        <div className="aspect-video flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive mb-2">Failed to load video</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={cn("relative group bg-black rounded-lg overflow-hidden", className)}
      onMouseEnter={showControlsWithTimeout}
      onMouseMove={showControlsWithTimeout}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        poster={poster}
        playsInline
        preload="metadata"
        className="w-full h-auto"
        onClick={togglePlay}
      />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="size-8 text-white animate-spin" />
        </div>
      )}
      
      {/* Play button overlay for paused state */}
      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            size="lg"
            variant="secondary"
            onClick={togglePlay}
            className="rounded-full bg-black/50 hover:bg-black/70 text-white border-0"
          >
            <Play className="size-6 ml-1" />
          </Button>
        </div>
      )}
      
      {/* Controls */}
      {controls && (showControls || !isPlaying) && !isLoading && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity">
          {/* Progress bar */}
          {duration > 0 && (
            <div 
              className="w-full h-1 bg-white/30 rounded-full mb-3 cursor-pointer"
              onClick={handleSeek}
            >
              <div 
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
          )}
          
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={togglePlay}
                className="text-white hover:text-white hover:bg-white/20 p-1"
              >
                {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleMute}
                className="text-white hover:text-white hover:bg-white/20 p-1"
              >
                {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
              </Button>
              
              {duration > 0 && (
                <span className="text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              )}
            </div>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleFullscreen}
              className="text-white hover:text-white hover:bg-white/20 p-1"
            >
              <Maximize className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}