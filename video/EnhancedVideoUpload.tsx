import { useState, useRef, useCallback } from 'react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Card } from '../ui/card';
import { toast } from 'sonner@2.0.3';
import { Upload, X, Video, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface VideoUploadState {
  status: 'idle' | 'requesting-url' | 'uploading' | 'processing' | 'ready' | 'error';
  progress: number;
  uploadUrl?: string;
  videoId?: string;
  playbackUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  error?: string;
}

interface VideoMetadata {
  videoId: string;
  playbackUrl: string;
  thumbnailUrl: string;
  duration?: number;
  status: 'processing' | 'ready';
  provider: string;
}

interface EnhancedVideoUploadProps {
  onUploadComplete: (metadata: VideoMetadata) => void;
  onUploadStart?: () => void;
  onUploadCancel?: () => void;
  maxFileSize?: number; // in MB
  allowedFormats?: string[];
  className?: string;
}

export function EnhancedVideoUpload({ 
  onUploadComplete,
  onUploadStart,
  onUploadCancel,
  maxFileSize = 100,
  allowedFormats = ['mp4', 'mov', 'avi', 'mkv', 'webm'],
  className = ''
}: EnhancedVideoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<VideoUploadState>({
    status: 'idle',
    progress: 0
  });
  const [dragOver, setDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<XMLHttpRequest | null>(null);
  const processingPollingRef = useRef<NodeJS.Timeout | null>(null);
  
  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('video/')) {
      return 'Please select a video file';
    }
    
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }
    
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedFormats.includes(extension)) {
      return `Supported formats: ${allowedFormats.join(', ')}`;
    }
    
    return null;
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Step 1: Request upload URL from backend
  const requestUploadUrl = async (file: File): Promise<any> => {
    // Mock implementation for standalone app
    // In a real app, this would call your backend API
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    
    const videoId = `video_${Date.now()}`;
    const uploadUrl = URL.createObjectURL(file);
    
    return {
      videoId,
      uploadUrl,
      provider: 'mock',
      expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    };
  };

  // Step 2: Upload directly to CDN
  const uploadToProvider = async (file: File, uploadData: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10 + Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          setUploadState(prev => ({ ...prev, progress }));
          clearInterval(interval);
          setTimeout(resolve, 500); // Simulate final upload completion
        } else {
          setUploadState(prev => ({ ...prev, progress }));
        }
      }, 200);
    });
  };

  // Step 3: Poll for processing completion
  const pollProcessingStatus = useCallback(async (videoId: string) => {
    try {
      // Mock processing completion
      // In a real app, this would poll your backend for video processing status
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
      
      // Generate mock thumbnail
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 180;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Video Thumbnail', canvas.width / 2, canvas.height / 2);
      }
      const thumbnailUrl = canvas.toDataURL();
      
      setUploadState(prev => ({
        ...prev,
        status: 'ready',
        playbackUrl: uploadState.uploadUrl || URL.createObjectURL(selectedFile!),
        thumbnailUrl,
        duration: 60, // Mock 60 second duration
      }));

      // Notify parent component
      onUploadComplete({
        videoId,
        playbackUrl: uploadState.uploadUrl || URL.createObjectURL(selectedFile!),
        thumbnailUrl,
        duration: 60,
        status: 'ready',
        provider: 'mock',
      });

      if (processingPollingRef.current) {
        clearTimeout(processingPollingRef.current);
      }
    } catch (error) {
      console.error('Error polling status:', error);
      setUploadState(prev => ({
        ...prev,
        status: 'error',
        error: 'Failed to process video',
      }));
    }
  }, [onUploadComplete, uploadState.uploadUrl, selectedFile]);

  const handleFileSelect = (file: File) => {
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }
    
    setSelectedFile(file);
    setUploadState({ status: 'idle', progress: 0 });
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };
  
  const startUpload = async () => {
    if (!selectedFile) return;
    
    try {
      onUploadStart?.();
      
      // Step 1: Request upload URL
      setUploadState({ status: 'requesting-url', progress: 0 });
      const uploadData = await requestUploadUrl(selectedFile);
      
      // Step 2: Upload directly to provider
      setUploadState(prev => ({ 
        ...prev, 
        status: 'uploading',
        uploadUrl: uploadData.uploadUrl,
        videoId: uploadData.videoId,
      }));
      
      await uploadToProvider(selectedFile, uploadData);
      
      // Step 3: Start polling for processing completion
      setUploadState(prev => ({ 
        ...prev, 
        status: 'processing',
        progress: 100,
      }));
      
      // Start polling for completion
      pollProcessingStatus(uploadData.videoId);
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadState({
        status: 'error',
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed',
      });
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    }
  };
  
  const cancelUpload = () => {
    if (uploadRef.current) {
      uploadRef.current.abort();
    }
    
    if (processingPollingRef.current) {
      clearTimeout(processingPollingRef.current);
    }
    
    onUploadCancel?.();
    resetUpload();
  };
  
  const resetUpload = () => {
    setUploadState({ status: 'idle', progress: 0 });
    setSelectedFile(null);
    uploadRef.current = null;
    
    if (processingPollingRef.current) {
      clearTimeout(processingPollingRef.current);
      processingPollingRef.current = null;
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusDisplay = () => {
    switch (uploadState.status) {
      case 'requesting-url':
        return { text: 'Preparing upload...', icon: <Loader2 className="size-4 animate-spin" /> };
      case 'uploading':
        return { text: 'Uploading video...', icon: <Upload className="size-4" /> };
      case 'processing':
        return { text: 'Processing video...', icon: <Loader2 className="size-4 animate-spin" /> };
      case 'ready':
        return { text: 'Video ready!', icon: <CheckCircle className="size-4 text-green-600" /> };
      case 'error':
        return { text: 'Upload failed', icon: <AlertCircle className="size-4 text-destructive" /> };
      default:
        return null;
    }
  };
  
  return (
    <div className={`space-y-4 ${className}`}>
      {!selectedFile && uploadState.status === 'idle' && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${dragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
            }
          `}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
          
          <div className="space-y-2">
            <Upload className="mx-auto size-8 text-muted-foreground" />
            <div>
              <p className="font-medium">Click to upload or drag and drop</p>
              <p className="text-sm text-muted-foreground">
                Video files up to {maxFileSize}MB
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports: {allowedFormats.join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {(selectedFile || uploadState.status !== 'idle') && (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded">
                <Video className="size-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {selectedFile?.name || 'Video file'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedFile ? formatFileSize(selectedFile.size) : 'Processing...'}
                </p>
                {uploadState.duration && (
                  <p className="text-sm text-muted-foreground">
                    Duration: {formatDuration(uploadState.duration)}
                  </p>
                )}
              </div>
              {uploadState.status !== 'ready' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={uploadState.status === 'idle' ? resetUpload : cancelUpload}
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
            
            {uploadState.status !== 'idle' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getStatusDisplay()?.icon}
                  <span className="text-sm font-medium">
                    {getStatusDisplay()?.text}
                  </span>
                  {uploadState.status === 'uploading' && (
                    <span className="text-sm text-muted-foreground">
                      {Math.round(uploadState.progress)}%
                    </span>
                  )}
                </div>
                
                {(uploadState.status === 'uploading' || uploadState.status === 'processing') && (
                  <Progress 
                    value={uploadState.status === 'processing' ? 100 : uploadState.progress} 
                    className="w-full" 
                  />
                )}
                
                {uploadState.error && (
                  <p className="text-sm text-destructive">{uploadState.error}</p>
                )}
              </div>
            )}
            
            {uploadState.status === 'idle' && (
              <div className="flex gap-2">
                <Button onClick={startUpload} className="flex-1">
                  Upload Video
                </Button>
                <Button variant="outline" onClick={resetUpload}>
                  Cancel
                </Button>
              </div>
            )}
            
            {uploadState.status === 'ready' && (
              <div className="flex gap-2">
                <Button onClick={resetUpload} variant="outline" className="flex-1">
                  Upload Another
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}