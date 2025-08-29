# Video Hosting & Codec Implementation Guide

## 🎯 **Executive Summary**

For social media platforms, **avoid building your own video transcoding pipeline**. Use managed services like **Cloudflare Stream** or **Mux** for:

- ✅ **Automatic transcoding** to multiple formats/qualities
- ✅ **Global CDN delivery** with adaptive streaming
- ✅ **Signed playback URLs** for security
- ✅ **Real-time analytics** and performance metrics
- ✅ **Cost optimization** through efficient encoding

---

## 🏆 **Recommended Platforms Comparison**

### **🔥 Cloudflare Stream (Recommended)**

#### **Pros:**
```yaml
Cost: $1/1000 minutes stored + $1/1000 minutes delivered
Global CDN: Included in all plans
Features:
  - H.264 + VP9 transcoding
  - HLS adaptive streaming
  - Thumbnail generation
  - Live streaming support
  - 4K support
  - Built-in analytics
Integration: Simple REST API
Bandwidth: Unlimited (included)
```

#### **Cons:**
- Limited to H.264/VP9 (no AV1 yet)
- Less advanced analytics than Mux
- Newer platform (less mature)

---

### **⚡ Mux (Enterprise Choice)**

#### **Pros:**
```yaml
Cost: $0.005/minute encoding + $0.01/GB delivery
Global CDN: Included
Features:
  - H.264 + H.265 + VP9 transcoding
  - Advanced analytics & QoE metrics
  - Real-time monitoring
  - Webhook notifications
  - Advanced player SDK
  - Live streaming
Integration: Comprehensive APIs + SDKs
Quality: Industry-leading encoding
```

#### **Cons:**
- More expensive for high-volume apps
- Complex pricing structure
- Overkill for simple use cases

---

## 🎨 **Codec Strategy**

### **Primary Codec: H.264 (AVC)**
```typescript
// Recommended settings for social media
const h264Settings = {
  codec: 'H.264',
  profile: 'Main',
  level: '4.0',
  bitrate: {
    '480p': '800 kbps',
    '720p': '1200 kbps', 
    '1080p': '2000 kbps'
  },
  compatibility: '99.5% of devices',
  use_case: 'Primary delivery format'
};
```

### **Secondary Codec: VP9**
```typescript
// For bandwidth savings (Chrome, Firefox)
const vp9Settings = {
  codec: 'VP9',
  bitrate_savings: '30-50% vs H.264',
  compatibility: '75% of modern browsers',
  use_case: 'Bandwidth optimization'
};
```

### **Future Codec: AV1**
```typescript
// For next-gen efficiency (limited support)
const av1Settings = {
  codec: 'AV1',
  bitrate_savings: '50% vs H.264',
  compatibility: '45% of modern browsers',
  use_case: 'Future-proofing',
  considerations: [
    'High encoding cost',
    'Battery impact on mobile',
    'Limited hardware support'
  ]
};
```

---

## 📱 **Implementation Guide**

### **1. Cloudflare Stream Integration**

#### **Backend Upload Handler**
```typescript
// utils/cloudflare-stream.ts
export class CloudflareStreamService {
  private apiToken: string;
  private accountId: string;
  
  constructor() {
    this.apiToken = process.env.CLOUDFLARE_API_TOKEN!;
    this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
  }
  
  async uploadVideo(file: File, userId: string): Promise<VideoUploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add metadata
    const metadata = {
      userId,
      uploadedAt: new Date().toISOString(),
      originalName: file.name
    };
    formData.append('meta', JSON.stringify(metadata));
    
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
        },
        body: formData,
      }
    );
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(`Upload failed: ${result.errors?.[0]?.message}`);
    }
    
    return {
      videoId: result.result.uid,
      playbackUrl: `https://customer-${this.accountId}.cloudflarestream.com/${result.result.uid}/manifest/video.m3u8`,
      thumbnailUrl: `https://customer-${this.accountId}.cloudflarestream.com/${result.result.uid}/thumbnails/thumbnail.jpg`,
      duration: result.result.duration,
      status: result.result.status.state // 'queued', 'inprogress', 'ready'
    };
  }
  
  async getSignedUrl(videoId: string, expiresIn: number = 3600): Promise<string> {
    // For private videos - generate signed URL
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream/${videoId}/token`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: videoId,
          exp: Math.floor(Date.now() / 1000) + expiresIn
        }),
      }
    );
    
    const result = await response.json();
    return result.result;
  }
  
  async getVideoAnalytics(videoId: string, timeframe: string = '7d') {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream/analytics/views?videoUID=${videoId}&since=${timeframe}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
        },
      }
    );
    
    return response.json();
  }
}

interface VideoUploadResult {
  videoId: string;
  playbackUrl: string;
  thumbnailUrl: string;
  duration?: number;
  status: 'queued' | 'inprogress' | 'ready' | 'error';
}
```

#### **Frontend Video Upload Component**
```typescript
// components/video/VideoUploadComponent.tsx
import { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { toast } from 'sonner@2.0.3';

interface VideoUploadComponentProps {
  onUploadComplete: (result: VideoUploadResult) => void;
  maxFileSize?: number; // in MB
  allowedFormats?: string[];
}

export function VideoUploadComponent({ 
  onUploadComplete, 
  maxFileSize = 100,
  allowedFormats = ['mp4', 'mov', 'avi', 'mkv']
}: VideoUploadComponentProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }
    
    // Check format
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedFormats.includes(extension)) {
      return `Supported formats: ${allowedFormats.join(', ')}`;
    }
    
    return null;
  };
  
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }
    
    setUploading(true);
    setProgress(0);
    
    try {
      // Create FormData for upload
      const formData = new FormData();
      formData.append('video', file);
      
      // Upload with progress tracking
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setProgress(percentComplete);
        }
      });
      
      xhr.onload = async () => {
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText);
          onUploadComplete(result);
          toast.success('Video uploaded successfully!');
        } else {
          throw new Error('Upload failed');
        }
        setUploading(false);
      };
      
      xhr.onerror = () => {
        toast.error('Upload failed');
        setUploading(false);
      };
      
      xhr.open('POST', '/api/videos/upload');
      xhr.send(formData);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
      setUploading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full"
      >
        {uploading ? 'Uploading...' : 'Select Video'}
      </Button>
      
      {uploading && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground text-center">
            Uploading... {Math.round(progress)}%
          </p>
        </div>
      )}
    </div>
  );
}
```

#### **Frontend Video Player Component**
```typescript
// components/video/AdaptiveVideoPlayer.tsx
import { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { Button } from '../ui/button';

interface AdaptiveVideoPlayerProps {
  src: string; // HLS manifest URL
  poster?: string; // Thumbnail URL
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
  onViewCount?: () => void;
}

export function AdaptiveVideoPlayer({
  src,
  poster,
  autoPlay = false,
  muted = true,
  controls = true,
  onViewCount
}: AdaptiveVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [hasStarted, setHasStarted] = useState(false);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    // Load HLS if supported
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if ('MediaSource' in window) {
      // Use hls.js for browsers that don't support HLS natively
      import('hls.js').then(({ default: Hls }) => {
        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
          });
          
          hls.loadSource(src);
          hls.attachMedia(video);
          
          // Cleanup
          return () => hls.destroy();
        }
      });
    }
    
    // Track view when video starts playing
    const handlePlay = () => {
      if (!hasStarted) {
        setHasStarted(true);
        onViewCount?.();
      }
      setIsPlaying(true);
    };
    
    const handlePause = () => setIsPlaying(false);
    
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    
    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [src, hasStarted, onViewCount]);
  
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.paused) {
      video.play();
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
      video.requestFullscreen();
    }
  };
  
  return (
    <div className="relative group">
      <video
        ref={videoRef}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        playsInline
        preload="metadata"
        className="w-full h-auto rounded-lg"
        onClick={togglePlay}
      />
      
      {controls && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={togglePlay}
                className="text-white hover:text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleMute}
                className="text-white hover:text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
              </Button>
            </div>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleFullscreen}
              className="text-white hover:text-white hover:bg-white/20"
            >
              <Maximize className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 📊 **Cost Analysis**

### **Cloudflare Stream Pricing**
```typescript
const cloudflareStreamCosts = {
  storage: '$1 per 1,000 minutes stored per month',
  delivery: '$1 per 1,000 minutes delivered',
  
  example_1000_users: {
    avg_video_length: '60 seconds',
    videos_per_user_month: 10,
    views_per_video: 50,
    
    storage_cost: '$60/month', // 10k videos * 1 min
    delivery_cost: '$500/month', // 500k views * 1 min
    total: '$560/month'
  },
  
  example_10000_users: {
    storage_cost: '$600/month',
    delivery_cost: '$5000/month', 
    total: '$5600/month'
  }
};
```

### **Mux Pricing**
```typescript
const muxCosts = {
  encoding: '$0.005 per minute encoded',
  delivery: '$0.01 per GB delivered',
  
  example_1000_users: {
    encoding_cost: '$50/month', // 10k videos * 1 min
    delivery_cost: '$750/month', // ~75GB (500k views * 150KB avg)
    total: '$800/month'
  },
  
  example_10000_users: {
    encoding_cost: '$500/month',
    delivery_cost: '$7500/month',
    total: '$8000/month'
  }
};
```

---

## 🚀 **Performance Optimization**

### **1. Adaptive Bitrate Streaming**
```typescript
// Automatic quality adjustment based on connection
const hlsConfig = {
  enableWorker: true,
  startLevel: -1, // Auto-select initial quality
  capLevelToPlayerSize: true, // Don't exceed player dimensions
  maxBufferLength: 30, // 30 seconds buffer
  maxBufferSize: 60 * 1000 * 1000, // 60MB max buffer
};
```

### **2. Preloading Strategy**
```typescript
// Intelligent preloading for social feeds
const preloadStrategy = {
  metadata: 'Always load video metadata',
  thumbnail: 'Always load poster/thumbnail',
  video_data: 'Only preload if user pauses on video',
  intersection_observer: 'Load when video enters viewport'
};
```

### **3. Quality Selection Logic**
```typescript
function selectOptimalQuality(connectionSpeed: number, deviceType: string) {
  if (deviceType === 'mobile' && connectionSpeed < 1) {
    return '480p';
  } else if (connectionSpeed < 5) {
    return '720p';
  } else {
    return '1080p';
  }
}
```

---

## 📱 **Mobile Optimization**

### **1. iOS Considerations**
```typescript
const iosOptimizations = {
  format: 'HLS native support',
  autoplay: 'Requires user interaction',
  fullscreen: 'Native fullscreen controls',
  pip: 'Picture-in-picture support',
  codec: 'H.264 preferred for hardware acceleration'
};
```

### **2. Android Considerations**
```typescript
const androidOptimizations = {
  format: 'HLS via ExoPlayer/hls.js',
  autoplay: 'Limited support',
  hardware_decoding: 'H.264/H.265 support varies',
  battery: 'Monitor decoder efficiency'
};
```

---

## 🔒 **Security Best Practices**

### **1. Signed URLs for Private Content**
```typescript
// Generate time-limited access URLs
async function generateSignedVideoUrl(videoId: string, userId: string) {
  const expiresIn = 3600; // 1 hour
  const permissions = await checkUserPermissions(userId, videoId);
  
  if (!permissions.canView) {
    throw new Error('Access denied');
  }
  
  return cloudflareStream.getSignedUrl(videoId, expiresIn);
}
```

### **2. Upload Validation**
```typescript
const uploadValidation = {
  file_size_limit: '100MB',
  duration_limit: '10 minutes',
  resolution_limit: '1920x1080',
  bitrate_limit: '5000 kbps',
  allowed_formats: ['mp4', 'mov', 'avi'],
  virus_scanning: 'Required for user uploads'
};
```

---

## 📈 **Analytics Integration**

### **1. Video Performance Metrics**
```typescript
interface VideoAnalytics {
  videoId: string;
  views: number;
  unique_viewers: number;
  total_watch_time: number;
  average_view_duration: number;
  completion_rate: number;
  quality_distribution: {
    '480p': number;
    '720p': number;
    '1080p': number;
  };
  device_breakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  geographic_distribution: Record<string, number>;
}
```

### **2. Real-time Monitoring**
```typescript
// Track video performance in real-time
function trackVideoEvent(eventType: string, videoId: string, metadata: any) {
  analytics.track('video_event', {
    event_type: eventType, // 'play', 'pause', 'complete', 'error'
    video_id: videoId,
    timestamp: Date.now(),
    user_agent: navigator.userAgent,
    connection_speed: navigator.connection?.effectiveType,
    ...metadata
  });
}
```

---

## ⚡ **Quick Start Implementation**

### **1. Add Video Support to Posts**
```typescript
// Update Post interface
interface Post {
  id: string;
  author: User;
  content: string;
  media?: {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
    duration?: number; // for videos
    width?: number;
    height?: number;
  };
  // ... rest of post fields
}
```

### **2. Environment Variables**
```bash
# .env
CLOUDFLARE_API_TOKEN=your_token_here
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
CLOUDFLARE_CUSTOMER_SUBDOMAIN=your_subdomain

# Alternative: Mux
MUX_TOKEN_ID=your_mux_token_id
MUX_TOKEN_SECRET=your_mux_token_secret
```

### **3. API Route Example**
```typescript
// pages/api/videos/upload.ts
import { CloudflareStreamService } from '../../../utils/cloudflare-stream';

const streamService = new CloudflareStreamService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const result = await streamService.uploadVideo(req.body.file, req.body.userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

---

## 🎯 **Recommendation Summary**

### **For MVP (< 1K users):**
- **Platform**: Cloudflare Stream
- **Codec**: H.264 only
- **Quality**: 720p max
- **Features**: Basic upload + playback

### **For Growth (1K-10K users):**
- **Platform**: Cloudflare Stream
- **Codec**: H.264 + VP9
- **Quality**: Up to 1080p
- **Features**: Analytics + signed URLs

### **For Scale (10K+ users):**
- **Platform**: Mux (advanced analytics)
- **Codec**: H.264 + VP9 + AV1 (selective)
- **Quality**: Up to 4K
- **Features**: Advanced analytics + live streaming

This approach provides a scalable, cost-effective video infrastructure that grows with your social media platform while maintaining excellent user experience across all devices.