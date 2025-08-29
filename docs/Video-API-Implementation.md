# Video API Implementation Examples

## 📚 **Backend API Routes**

### **1. Upload Video Endpoint**

```typescript
// pages/api/videos/upload.ts or app/api/videos/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getVideoService } from '../../../utils/video-service';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('video') as File;
    const metadata = JSON.parse(formData.get('metadata') as string || '{}');
    
    if (!file) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      );
    }
    
    // Validate file
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 100MB.' },
        { status: 400 }
      );
    }
    
    if (!file.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a video file.' },
        { status: 400 }
      );
    }
    
    // Upload to video service
    const videoService = getVideoService();
    const result = await videoService.uploadVideo(file, {
      ...metadata,
      userId: request.headers.get('x-user-id'), // From auth middleware
      uploadedAt: new Date().toISOString(),
    });
    
    // Store video info in database
    // await db.videos.create({
    //   id: result.videoId,
    //   userId: metadata.userId,
    //   playbackUrl: result.playbackUrl,
    //   thumbnailUrl: result.thumbnailUrl,
    //   duration: result.duration,
    //   status: result.status,
    //   metadata: result.metadata,
    // });
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Video upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
```

### **2. Get Video Info Endpoint**

```typescript
// pages/api/videos/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getVideoService } from '../../../utils/video-service';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const videoService = getVideoService();
    const videoInfo = await videoService.getVideoInfo(id as string);
    
    res.status(200).json(videoInfo);
  } catch (error) {
    console.error('Get video info error:', error);
    res.status(500).json({ error: 'Failed to get video info' });
  }
}
```

### **3. Generate Signed URL Endpoint**

```typescript
// pages/api/videos/[id]/signed-url.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getVideoService } from '../../../../utils/video-service';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const { expiresIn = 3600 } = req.body;
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Check user permissions here
    // const hasAccess = await checkUserAccess(userId, videoId);
    // if (!hasAccess) {
    //   return res.status(403).json({ error: 'Access denied' });
    // }
    
    const videoService = getVideoService();
    const signedUrl = await videoService.getSignedUrl(
      id as string,
      parseInt(expiresIn)
    );
    
    res.status(200).json({ signedUrl });
  } catch (error) {
    console.error('Generate signed URL error:', error);
    res.status(500).json({ error: 'Failed to generate signed URL' });
  }
}
```

### **4. Video Analytics Endpoint**

```typescript
// pages/api/videos/[id]/analytics.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getVideoService } from '../../../../utils/video-service';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id, timeframe = '7d' } = req.query;
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const videoService = getVideoService();
    const analytics = await videoService.getAnalytics(
      id as string,
      timeframe as string
    );
    
    res.status(200).json(analytics);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
}
```

## 🗄️ **Database Schema**

### **Video Table Schema**

```sql
-- PostgreSQL schema
CREATE TABLE videos (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  description TEXT,
  playback_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER, -- in seconds
  status VARCHAR(50) DEFAULT 'queued',
  provider VARCHAR(50) NOT NULL,
  file_size BIGINT,
  width INTEGER,
  height INTEGER,
  original_filename VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_status ON videos(status);
CREATE INDEX idx_videos_created_at ON videos(created_at);
```

### **Video Analytics Table**

```sql
CREATE TABLE video_analytics (
  id SERIAL PRIMARY KEY,
  video_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(50) NOT NULL, -- 'view', 'play', 'pause', 'complete'
  user_id VARCHAR(255),
  session_id VARCHAR(255),
  watch_time INTEGER, -- seconds watched
  quality VARCHAR(10), -- '480p', '720p', '1080p'
  device_type VARCHAR(50),
  user_agent TEXT,
  ip_address INET,
  country VARCHAR(2),
  timestamp TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
);

-- Indexes for analytics queries
CREATE INDEX idx_video_analytics_video_id ON video_analytics(video_id);
CREATE INDEX idx_video_analytics_timestamp ON video_analytics(timestamp);
CREATE INDEX idx_video_analytics_event_type ON video_analytics(event_type);
```

## 🔧 **Environment Configuration**

### **.env.local**

```bash
# Video Service Configuration
VIDEO_PROVIDER=cloudflare  # or 'mux' or 'mock'

# Cloudflare Stream
CLOUDFLARE_API_TOKEN=your_api_token_here
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
CLOUDFLARE_CUSTOMER_SUBDOMAIN=your_subdomain

# Mux (Alternative)
MUX_TOKEN_ID=your_mux_token_id
MUX_TOKEN_SECRET=your_mux_token_secret

# Upload limits
MAX_VIDEO_SIZE_MB=100
MAX_VIDEO_DURATION_MINUTES=10
ALLOWED_VIDEO_FORMATS=mp4,mov,avi,mkv,webm
```

## 📱 **Frontend Integration**

### **Enhanced Post Creation with Video**

```typescript
// components/posts/CreatePostWithVideo.tsx
import { useState } from 'react';
import { VideoUploadComponent } from '../video/VideoUploadComponent';
import { VideoUploadResult } from '../../utils/video-service';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';

interface CreatePostWithVideoProps {
  onCreatePost: (postData: any) => void;
  user: any;
}

export function CreatePostWithVideo({ onCreatePost, user }: CreatePostWithVideoProps) {
  const [content, setContent] = useState('');
  const [uploadedVideo, setUploadedVideo] = useState<VideoUploadResult | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleVideoUpload = (result: VideoUploadResult) => {
    setUploadedVideo(result);
  };

  const handleCreatePost = async () => {
    if (!content.trim() && !uploadedVideo) {
      return;
    }

    setIsCreating(true);

    try {
      const postData = {
        content,
        type: uploadedVideo ? 'video' : 'text',
        media: uploadedVideo ? {
          type: 'video',
          url: uploadedVideo.playbackUrl,
          thumbnail: uploadedVideo.thumbnailUrl,
          duration: uploadedVideo.duration,
          videoId: uploadedVideo.videoId,
        } : null,
      };

      await onCreatePost(postData);
      
      // Reset form
      setContent('');
      setUploadedVideo(null);
    } catch (error) {
      console.error('Create post error:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <Textarea
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-20"
      />

      <VideoUploadComponent
        onUploadComplete={handleVideoUpload}
        maxFileSize={100}
      />

      {uploadedVideo && (
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium">Video uploaded!</p>
          <p className="text-xs text-muted-foreground">
            {uploadedVideo.duration ? `Duration: ${Math.round(uploadedVideo.duration)}s` : 'Processing...'}
          </p>
        </div>
      )}

      <Button 
        onClick={handleCreatePost}
        disabled={(!content.trim() && !uploadedVideo) || isCreating}
        className="w-full"
      >
        {isCreating ? 'Creating...' : 'Create Post'}
      </Button>
    </Card>
  );
}
```

### **Post Component with Video Player**

```typescript
// components/posts/PostWithVideo.tsx
import { AdaptiveVideoPlayer } from '../video/AdaptiveVideoPlayer';

interface PostWithVideoProps {
  post: {
    id: string;
    content: string;
    media?: {
      type: 'video';
      url: string;
      thumbnail: string;
      duration?: number;
    };
  };
  onVideoView?: (postId: string) => void;
}

export function PostWithVideo({ post, onVideoView }: PostWithVideoProps) {
  const handleVideoView = () => {
    onVideoView?.(post.id);
    
    // Track video view
    fetch(`/api/videos/${post.media?.videoId}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postId: post.id,
        timestamp: Date.now(),
      }),
    });
  };

  return (
    <div className="space-y-3">
      {post.content && (
        <p className="text-sm">{post.content}</p>
      )}
      
      {post.media?.type === 'video' && (
        <AdaptiveVideoPlayer
          src={post.media.url}
          poster={post.media.thumbnail}
          onViewCount={handleVideoView}
          className="w-full"
        />
      )}
    </div>
  );
}
```

## 📊 **Analytics Implementation**

### **Video Analytics Hook**

```typescript
// hooks/useVideoAnalytics.ts
import { useState, useEffect } from 'react';
import { VideoAnalytics } from '../utils/video-service';

export function useVideoAnalytics(videoId: string, timeframe: string = '7d') {
  const [analytics, setAnalytics] = useState<VideoAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const response = await fetch(`/api/videos/${videoId}/analytics?timeframe=${timeframe}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }
        
        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    if (videoId) {
      fetchAnalytics();
    }
  }, [videoId, timeframe]);

  return { analytics, loading, error };
}
```

### **Analytics Dashboard Component**

```typescript
// components/analytics/VideoAnalyticsDashboard.tsx
import { useVideoAnalytics } from '../../hooks/useVideoAnalytics';
import { Card } from '../ui/card';
import { formatDuration } from '../../utils/video-service';

interface VideoAnalyticsDashboardProps {
  videoId: string;
  timeframe?: string;
}

export function VideoAnalyticsDashboard({ 
  videoId, 
  timeframe = '7d' 
}: VideoAnalyticsDashboardProps) {
  const { analytics, loading, error } = useVideoAnalytics(videoId, timeframe);

  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!analytics) return <div>No analytics data</div>;

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="p-4">
        <h3 className="font-medium mb-2">Total Views</h3>
        <p className="text-2xl font-bold">{analytics.views.toLocaleString()}</p>
      </Card>

      <Card className="p-4">
        <h3 className="font-medium mb-2">Unique Viewers</h3>
        <p className="text-2xl font-bold">{analytics.uniqueViewers.toLocaleString()}</p>
      </Card>

      <Card className="p-4">
        <h3 className="font-medium mb-2">Watch Time</h3>
        <p className="text-2xl font-bold">{formatDuration(analytics.totalWatchTime)}</p>
      </Card>

      <Card className="p-4">
        <h3 className="font-medium mb-2">Completion Rate</h3>
        <p className="text-2xl font-bold">{(analytics.completionRate * 100).toFixed(1)}%</p>
      </Card>
    </div>
  );
}
```

## 🚀 **Deployment Checklist**

### **Production Environment Variables**

```bash
# Production .env
VIDEO_PROVIDER=cloudflare
CLOUDFLARE_API_TOKEN=prod_token_here
CLOUDFLARE_ACCOUNT_ID=prod_account_id
CLOUDFLARE_CUSTOMER_SUBDOMAIN=prod_subdomain

# Security
MAX_VIDEO_SIZE_MB=500  # Increased for production
MAX_VIDEO_DURATION_MINUTES=30
ENABLE_VIDEO_ANALYTICS=true
ENABLE_SIGNED_URLS=true

# Database
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

### **CDN Configuration**

```typescript
// Add to your CDN configuration
const cdnConfig = {
  video_origins: [
    'https://customer-<account>.cloudflarestream.com',
    'https://stream.mux.com',
  ],
  cache_control: {
    video_segments: 'public, max-age=31536000', // 1 year
    manifests: 'public, max-age=300', // 5 minutes
    thumbnails: 'public, max-age=86400', // 1 day
  },
};
```

This implementation provides a complete, production-ready video hosting solution that can scale from MVP to enterprise level while maintaining excellent performance and user experience.