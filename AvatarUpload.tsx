import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Upload, 
  Check, 
  X, 
  Image as ImageIcon,
  Loader2,
  User
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { toast } from 'sonner@2.0.3';
import { processAvatarImage, validateImageFile } from '../utils/image-processing';

interface AvatarUploadProps {
  currentAvatar?: string;
  userName?: string;
  onAvatarUpdate: (avatarUrl: string) => Promise<void>;
  className?: string;
}

export function AvatarUpload({
  currentAvatar,
  userName = 'User',
  onAvatarUpdate,
  className = ''
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate the file
    const validation = validateImageFile(file);
    if (validation) {
      toast.error(validation);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrl(previewUrl);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 20;
        });
      }, 100);

      // Process the image
      const processedImage = await processAvatarImage(file);
      
      // Update progress to 100%
      setUploadProgress(100);
      
      // Update the avatar
      await onAvatarUpdate(processedImage.dataUrl);
      
      // Clean up
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      
      toast.success('Avatar updated successfully!');
      
      // Add haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([15, 10, 15]);
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update avatar');
      
      // Clean up preview on error
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    } else {
      toast.error('Please drop an image file');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Avatar Display */}
      <div className="flex items-center justify-center">
        <div className="relative">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
              <AvatarImage 
                src={previewUrl || currentAvatar} 
                alt={userName}
                className="object-cover"
              />
              <AvatarFallback className="text-2xl font-semibold">
                {userName[0]?.toUpperCase() || <User className="w-8 h-8" />}
              </AvatarFallback>
            </Avatar>
            
            {/* Upload Status Overlay */}
            <AnimatePresence>
              {isUploading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center"
                >
                  <div className="text-center text-white">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-1" />
                    <div className="text-xs">{Math.round(uploadProgress)}%</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Camera Button */}
            <motion.button
              onClick={handleClick}
              disabled={isUploading}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute -bottom-2 -right-2 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mobile-touch-optimized"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Upload Progress */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-sm text-center text-muted-foreground">
              Processing avatar... {Math.round(uploadProgress)}%
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag & Drop Area */}
      <motion.div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
          ${isDragOver 
            ? 'border-primary bg-primary/10 scale-105' 
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
          }
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
        whileHover={{ scale: isDragOver ? 1.05 : 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="space-y-3">
          <div className="flex justify-center">
            <div className={`p-3 rounded-full ${isDragOver ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {isDragOver ? (
                <Check className="w-6 h-6" />
              ) : (
                <ImageIcon className="w-6 h-6" />
              )}
            </div>
          </div>
          
          <div>
            <p className="font-medium text-sm">
              {isDragOver ? 'Drop your image here' : 'Click or drag to upload'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG, WebP up to 5MB
            </p>
          </div>
        </div>
      </motion.div>

      {/* Upload Button */}
      <Button
        onClick={handleClick}
        disabled={isUploading}
        className="w-full"
        variant="outline"
      >
        <Upload className="w-4 h-4 mr-2" />
        {isUploading ? 'Uploading...' : 'Choose File'}
      </Button>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
}