import { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Card } from '../ui/card';
import { toast } from 'sonner@2.0.3';
import { Upload, X, Video } from 'lucide-react';

interface VideoUploadResult {
  videoId: string;
  playbackUrl: string;
  thumbnailUrl: string;
  duration?: number;
  status: 'queued' | 'inprogress' | 'ready' | 'error';
}

interface VideoUploadComponentProps {
  onUploadComplete: (result: VideoUploadResult) => void;
  onUploadStart?: () => void;
  onUploadCancel?: () => void;
  maxFileSize?: number; // in MB
  allowedFormats?: string[];
  className?: string;
}

export function VideoUploadComponent({ 
  onUploadComplete,
  onUploadStart,
  onUploadCancel,
  maxFileSize = 100,
  allowedFormats = ['mp4', 'mov', 'avi', 'mkv', 'webm'],
  className = ''
}: VideoUploadComponentProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<XMLHttpRequest | null>(null);
  
  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('video/')) {
      return 'Please select a video file';
    }
    
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }
    
    // Check format
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedFormats.includes(extension)) {
      return `Supported formats: ${allowedFormats.join(', ')}`;
    }
    
    // Check duration (basic check via video element)
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
  
  const handleFileSelect = (file: File) => {
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }
    
    setSelectedFile(file);
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
    
    setUploading(true);
    setProgress(0);
    onUploadStart?.();
    
    try {
      // Create FormData for upload
      const formData = new FormData();
      formData.append('video', selectedFile);
      formData.append('metadata', JSON.stringify({
        originalName: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type
      }));
      
      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      uploadRef.current = xhr;
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setProgress(percentComplete);
        }
      });
      
      xhr.onload = async () => {
        if (xhr.status === 200) {
          try {
            const result = JSON.parse(xhr.responseText);
            onUploadComplete(result);
            toast.success('Video uploaded successfully!');
            resetUpload();
          } catch (err) {
            throw new Error('Invalid response from server');
          }
        } else {
          throw new Error(`Upload failed with status ${xhr.status}`);
        }
      };
      
      xhr.onerror = () => {
        throw new Error('Network error during upload');
      };
      
      xhr.onabort = () => {
        toast.info('Upload cancelled');
        resetUpload();
      };
      
      // Start upload
      xhr.open('POST', '/api/videos/upload');
      xhr.send(formData);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
      setUploading(false);
    }
  };
  
  const cancelUpload = () => {
    if (uploadRef.current) {
      uploadRef.current.abort();
    }
    onUploadCancel?.();
    resetUpload();
  };
  
  const resetUpload = () => {
    setUploading(false);
    setProgress(0);
    setSelectedFile(null);
    uploadRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className={`space-y-4 ${className}`}>
      {!selectedFile && !uploading && (
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
      
      {selectedFile && !uploading && (
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded">
              <Video className="size-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={resetUpload}
            >
              <X className="size-4" />
            </Button>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button onClick={startUpload} className="flex-1">
              Upload Video
            </Button>
            <Button variant="outline" onClick={resetUpload}>
              Cancel
            </Button>
          </div>
        </Card>
      )}
      
      {uploading && (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded">
                <Video className="size-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Uploading video...</p>
                <p className="text-sm text-muted-foreground">
                  {selectedFile?.name}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
            
            <Button 
              variant="outline" 
              onClick={cancelUpload}
              className="w-full"
            >
              Cancel Upload
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}