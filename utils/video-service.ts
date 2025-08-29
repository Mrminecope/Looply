/**
 * Video Service - Abstraction layer for video hosting platforms
 * Supports both Cloudflare Stream and Mux for flexibility
 */

export interface VideoUploadResult {
  videoId: string;
  playbackUrl: string;
  thumbnailUrl: string;
  duration?: number;
  status: 'queued' | 'inprogress' | 'ready' | 'error';
  provider: 'cloudflare' | 'mux' | 'mock';
  metadata?: {
    width?: number;
    height?: number;
    fileSize?: number;
    originalName?: string;
  };
}

export interface VideoAnalytics {
  videoId: string;
  views: number;
  uniqueViewers: number;
  totalWatchTime: number;
  averageViewDuration: number;
  completionRate: number;
  qualityDistribution: Record<string, number>;
  deviceBreakdown: Record<string, number>;
  geographicDistribution: Record<string, number>;
}

export interface VideoServiceConfig {
  provider: 'cloudflare' | 'mux' | 'mock';
  apiKey?: string;
  apiSecret?: string;
  accountId?: string;
}

abstract class VideoService {
  protected config: VideoServiceConfig;

  constructor(config: VideoServiceConfig) {
    this.config = config;
  }

  abstract uploadVideo(file: File | Buffer, metadata: any): Promise<VideoUploadResult>;
  abstract getVideoInfo(videoId: string): Promise<VideoUploadResult>;
  abstract getSignedUrl(videoId: string, expiresIn?: number): Promise<string>;
  abstract deleteVideo(videoId: string): Promise<boolean>;
  abstract getAnalytics(videoId: string, timeframe?: string): Promise<VideoAnalytics>;
}

/**
 * Cloudflare Stream Implementation
 */
class CloudflareStreamService extends VideoService {
  private baseUrl: string;

  constructor(config: VideoServiceConfig) {
    super(config);
    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/stream`;
  }

  async uploadVideo(file: File | Buffer, metadata: any): Promise<VideoUploadResult> {
    const formData = new FormData();
    
    if (file instanceof File) {
      formData.append('file', file);
    } else {
      formData.append('file', new Blob([file]));
    }
    
    // Add metadata
    const videoMetadata = {
      ...metadata,
      uploadedAt: new Date().toISOString(),
    };
    formData.append('meta', JSON.stringify(videoMetadata));

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Cloudflare Stream upload failed: ${error.errors?.[0]?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    
    return {
      videoId: result.result.uid,
      playbackUrl: `https://customer-${this.config.accountId}.cloudflarestream.com/${result.result.uid}/manifest/video.m3u8`,
      thumbnailUrl: `https://customer-${this.config.accountId}.cloudflarestream.com/${result.result.uid}/thumbnails/thumbnail.jpg`,
      duration: result.result.duration,
      status: this.mapCloudflareStatus(result.result.status?.state),
      provider: 'cloudflare',
      metadata: {
        width: result.result.input?.width,
        height: result.result.input?.height,
        fileSize: result.result.size,
        originalName: metadata.originalName,
      },
    };
  }

  async getVideoInfo(videoId: string): Promise<VideoUploadResult> {
    const response = await fetch(`${this.baseUrl}/${videoId}`, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get video info: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      videoId: result.result.uid,
      playbackUrl: `https://customer-${this.config.accountId}.cloudflarestream.com/${result.result.uid}/manifest/video.m3u8`,
      thumbnailUrl: `https://customer-${this.config.accountId}.cloudflarestream.com/${result.result.uid}/thumbnails/thumbnail.jpg`,
      duration: result.result.duration,
      status: this.mapCloudflareStatus(result.result.status?.state),
      provider: 'cloudflare',
      metadata: {
        width: result.result.input?.width,
        height: result.result.input?.height,
        fileSize: result.result.size,
      },
    };
  }

  async getSignedUrl(videoId: string, expiresIn: number = 3600): Promise<string> {
    const response = await fetch(`${this.baseUrl}/${videoId}/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: videoId,
        exp: Math.floor(Date.now() / 1000) + expiresIn,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate signed URL: ${response.statusText}`);
    }

    const result = await response.json();
    return `https://customer-${this.config.accountId}.cloudflarestream.com/${videoId}/manifest/video.m3u8?token=${result.result}`;
  }

  async deleteVideo(videoId: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/${videoId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
    });

    return response.ok;
  }

  async getAnalytics(videoId: string, timeframe: string = '7d'): Promise<VideoAnalytics> {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.config.accountId}/stream/analytics/views?videoUID=${videoId}&since=${timeframe}`,
      {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get analytics: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Transform Cloudflare analytics to our format
    return {
      videoId,
      views: result.result.views || 0,
      uniqueViewers: result.result.uniqueViewers || 0,
      totalWatchTime: result.result.totalWatchTime || 0,
      averageViewDuration: result.result.averageViewDuration || 0,
      completionRate: result.result.completionRate || 0,
      qualityDistribution: result.result.qualityDistribution || {},
      deviceBreakdown: result.result.deviceBreakdown || {},
      geographicDistribution: result.result.geographicDistribution || {},
    };
  }

  private mapCloudflareStatus(status: string): VideoUploadResult['status'] {
    switch (status) {
      case 'pendingupload':
      case 'queued':
        return 'queued';
      case 'inprogress':
        return 'inprogress';
      case 'ready':
        return 'ready';
      case 'error':
        return 'error';
      default:
        return 'queued';
    }
  }
}

/**
 * Mux Implementation
 */
class MuxService extends VideoService {
  private baseUrl = 'https://api.mux.com';

  async uploadVideo(file: File | Buffer, metadata: any): Promise<VideoUploadResult> {
    // Mux requires a two-step process: create upload URL, then upload
    
    // Step 1: Create upload URL
    const uploadResponse = await fetch(`${this.baseUrl}/video/v1/uploads`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${this.config.apiKey}:${this.config.apiSecret}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cors_origin: '*',
        new_asset_settings: {
          playback_policy: ['public'],
          mp4_support: 'standard',
        },
      }),
    });

    if (!uploadResponse.ok) {
      throw new Error(`Mux upload URL creation failed: ${uploadResponse.statusText}`);
    }

    const uploadData = await uploadResponse.json();
    
    // Step 2: Upload file to Mux
    const formData = new FormData();
    if (file instanceof File) {
      formData.append('file', file);
    } else {
      formData.append('file', new Blob([file]));
    }

    const fileUploadResponse = await fetch(uploadData.data.url, {
      method: 'PUT',
      body: file,
    });

    if (!fileUploadResponse.ok) {
      throw new Error(`Mux file upload failed: ${fileUploadResponse.statusText}`);
    }

    // Return upload result
    return {
      videoId: uploadData.data.id,
      playbackUrl: `https://stream.mux.com/${uploadData.data.asset_id}.m3u8`,
      thumbnailUrl: `https://image.mux.com/${uploadData.data.asset_id}/thumbnail.jpg`,
      duration: 0, // Will be updated when processing completes
      status: 'queued',
      provider: 'mux',
      metadata: {
        originalName: metadata.originalName,
      },
    };
  }

  async getVideoInfo(videoId: string): Promise<VideoUploadResult> {
    const response = await fetch(`${this.baseUrl}/video/v1/assets/${videoId}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${this.config.apiKey}:${this.config.apiSecret}`).toString('base64')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get Mux video info: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      videoId: result.data.id,
      playbackUrl: `https://stream.mux.com/${result.data.playback_ids[0]?.id}.m3u8`,
      thumbnailUrl: `https://image.mux.com/${result.data.playback_ids[0]?.id}/thumbnail.jpg`,
      duration: result.data.duration,
      status: this.mapMuxStatus(result.data.status),
      provider: 'mux',
      metadata: {
        width: result.data.tracks?.[0]?.width,
        height: result.data.tracks?.[0]?.height,
      },
    };
  }

  async getSignedUrl(videoId: string, expiresIn: number = 3600): Promise<string> {
    // Mux uses signing keys for private videos
    // This is a simplified implementation - in practice, you'd use JWT
    const response = await fetch(`${this.baseUrl}/video/v1/signing-keys`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${this.config.apiKey}:${this.config.apiSecret}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Signing key configuration
      }),
    });

    // For now, return the public URL
    // In production, implement proper JWT signing
    return `https://stream.mux.com/${videoId}.m3u8`;
  }

  async deleteVideo(videoId: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/video/v1/assets/${videoId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${this.config.apiKey}:${this.config.apiSecret}`).toString('base64')}`,
      },
    });

    return response.ok;
  }

  async getAnalytics(videoId: string, timeframe: string = '7d'): Promise<VideoAnalytics> {
    const response = await fetch(
      `${this.baseUrl}/data/v1/metrics/video_view_events?filters[]=asset_id:${videoId}&timeframe[]=${timeframe}`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.config.apiKey}:${this.config.apiSecret}`).toString('base64')}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get Mux analytics: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Transform Mux analytics to our format
    return {
      videoId,
      views: result.data.total_row_count || 0,
      uniqueViewers: 0, // Mux calculates this differently
      totalWatchTime: 0,
      averageViewDuration: 0,
      completionRate: 0,
      qualityDistribution: {},
      deviceBreakdown: {},
      geographicDistribution: {},
    };
  }

  private mapMuxStatus(status: string): VideoUploadResult['status'] {
    switch (status) {
      case 'preparing':
        return 'queued';
      case 'ready':
        return 'ready';
      case 'errored':
        return 'error';
      default:
        return 'inprogress';
    }
  }
}

/**
 * Mock Service for Development
 */
class MockVideoService extends VideoService {
  async uploadVideo(file: File | Buffer, metadata: any): Promise<VideoUploadResult> {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const videoId = `mock_${Date.now()}`;
    
    return {
      videoId,
      playbackUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnailUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
      duration: 596, // Big Buck Bunny duration
      status: 'ready',
      provider: 'mock',
      metadata: {
        width: 1920,
        height: 1080,
        fileSize: file instanceof File ? file.size : file.length,
        originalName: metadata.originalName,
      },
    };
  }

  async getVideoInfo(videoId: string): Promise<VideoUploadResult> {
    return {
      videoId,
      playbackUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnailUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
      duration: 596,
      status: 'ready',
      provider: 'mock',
      metadata: {
        width: 1920,
        height: 1080,
        fileSize: 158000000, // ~158MB
      },
    };
  }

  async getSignedUrl(videoId: string, expiresIn: number = 3600): Promise<string> {
    // Return the same URL for mock (it's already public)
    return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  }

  async deleteVideo(videoId: string): Promise<boolean> {
    // Simulate successful deletion
    return true;
  }

  async getAnalytics(videoId: string, timeframe: string = '7d'): Promise<VideoAnalytics> {
    // Return mock analytics data
    return {
      videoId,
      views: Math.floor(Math.random() * 1000) + 100,
      uniqueViewers: Math.floor(Math.random() * 500) + 50,
      totalWatchTime: Math.floor(Math.random() * 10000) + 1000,
      averageViewDuration: Math.floor(Math.random() * 300) + 30,
      completionRate: Math.random() * 0.8 + 0.2,
      qualityDistribution: {
        '480p': 0.2,
        '720p': 0.5,
        '1080p': 0.3,
      },
      deviceBreakdown: {
        mobile: 0.6,
        desktop: 0.3,
        tablet: 0.1,
      },
      geographicDistribution: {
        'US': 0.4,
        'UK': 0.2,
        'CA': 0.15,
        'Others': 0.25,
      },
    };
  }
}

/**
 * Video Service Factory
 */
export function createVideoService(config: VideoServiceConfig): VideoService {
  switch (config.provider) {
    case 'cloudflare':
      return new CloudflareStreamService(config);
    case 'mux':
      return new MuxService(config);
    case 'mock':
      return new MockVideoService(config);
    default:
      throw new Error(`Unsupported video provider: ${config.provider}`);
  }
}

/**
 * Default service instance
 */
let defaultService: VideoService | null = null;

export function getVideoService(): VideoService {
  if (!defaultService) {
    const config: VideoServiceConfig = {
      provider: (process.env.VIDEO_PROVIDER as any) || 'mock',
      apiKey: process.env.VIDEO_API_KEY,
      apiSecret: process.env.VIDEO_API_SECRET,
      accountId: process.env.VIDEO_ACCOUNT_ID,
    };
    
    defaultService = createVideoService(config);
  }
  
  return defaultService;
}

/**
 * Utility functions
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function validateVideoFile(file: File, maxSizeMB: number = 100): string | null {
  // Check file type
  if (!file.type.startsWith('video/')) {
    return 'Please select a video file';
  }
  
  // Check file size
  if (file.size > maxSizeMB * 1024 * 1024) {
    return `File size must be less than ${maxSizeMB}MB`;
  }
  
  return null;
}