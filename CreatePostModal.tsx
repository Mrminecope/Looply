import { useState, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { LIAAssistButton } from './LIAAssistButton';
import { 
  X, 
  Image as ImageIcon, 
  Video, 
  Smile, 
  MapPin, 
  Hash, 
  Users, 
  Globe,
  Lock,
  UserCheck,
  Upload,
  Trash2,
  Play,
  Pause
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLIA } from '../hooks/useLIA';
import type { User, Community } from '../types/app';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePost: (postData: any) => void;
  user: User;
  communities: Community[];
  maxLength?: number;
}

type MediaType = 'image' | 'video' | null;
type VisibilityType = 'public' | 'followers' | 'private';

interface MediaFile {
  file: File;
  url: string;
  type: MediaType;
  uploading: boolean;
  progress: number;
  error?: string;
}

export function CreatePostModal({
  isOpen,
  onClose,
  onCreatePost,
  user,
  communities,
  maxLength = 2000
}: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<string>('');
  const [location, setLocation] = useState('');
  const [visibility, setVisibility] = useState<VisibilityType>('public');
  const [isCreating, setIsCreating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  const { generateCaption, generateHashtags, loading: liaLoading } = useLIA();

  // Handle file upload
  const handleFileUpload = useCallback((files: FileList | null, type: MediaType) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      // Validate file type
      const isValidType = type === 'image' 
        ? file.type.startsWith('image/')
        : file.type.startsWith('video/');
      
      if (!isValidType) {
        setUploadError(`Invalid ${type} file type`);
        return;
      }

      // Validate file size (10MB for images, 100MB for videos)
      const maxSize = type === 'image' ? 10 * 1024 * 1024 : 100 * 1024 * 1024;
      if (file.size > maxSize) {
        setUploadError(`File too large. Max size: ${type === 'image' ? '10MB' : '100MB'}`);
        return;
      }

      const url = URL.createObjectURL(file);
      const mediaFile: MediaFile = {
        file,
        url,
        type,
        uploading: true,
        progress: 0
      };

      setMediaFiles(prev => [...prev, mediaFile]);
      setUploadError('');

      // Simulate upload progress
      simulateUpload(mediaFile);
    });
  }, []);

  // Simulate file upload with progress
  const simulateUpload = (mediaFile: MediaFile) => {
    const interval = setInterval(() => {
      setMediaFiles(prev => prev.map(file => {
        if (file.url === mediaFile.url && file.uploading) {
          const newProgress = Math.min(file.progress + Math.random() * 30, 100);
          
          if (newProgress >= 100) {
            clearInterval(interval);
            return { ...file, uploading: false, progress: 100 };
          }
          
          return { ...file, progress: newProgress };
        }
        return file;
      }));
    }, 200);
  };

  // Remove media file
  const removeMediaFile = (url: string) => {
    setMediaFiles(prev => {
      const updated = prev.filter(file => file.url !== url);
      // Clean up object URL
      URL.revokeObjectURL(url);
      return updated;
    });
  };

  // Handle LIA assistance
  const handleLIAGenerateCaption = async () => {
    try {
      const generatedCaption = await generateCaption('', mediaFiles[0]?.file);
      setContent(generatedCaption);
    } catch (error) {
      console.error('Failed to generate caption:', error);
    }
  };

  const handleLIAGenerateHashtags = async () => {
    try {
      const hashtags = await generateHashtags(content, 5);
      const hashtagText = hashtags.map(tag => `#${tag}`).join(' ');
      setContent(prev => `${prev} ${hashtagText}`.trim());
    } catch (error) {
      console.error('Failed to generate hashtags:', error);
    }
  };

  // Handle post creation
  const handleCreatePost = async () => {
    if (!content.trim() && mediaFiles.length === 0) return;

    setIsCreating(true);
    try {
      // Determine post type
      let postType = 'text';
      if (mediaFiles.length > 0) {
        postType = mediaFiles[0].type === 'video' ? 'video' : 'image';
      }

      const postData = {
        content: content.trim(),
        type: postType,
        mediaFiles: mediaFiles.filter(file => !file.uploading),
        community: selectedCommunity || undefined,
        location: location || undefined,
        visibility,
        hashtags: extractHashtags(content),
        mentions: extractMentions(content)
      };

      await onCreatePost(postData);
      
      // Reset form
      setContent('');
      setMediaFiles([]);
      setSelectedCommunity('');
      setLocation('');
      setVisibility('public');
      setShowAdvanced(false);
      setUploadError('');
      
      onClose();
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // Extract hashtags from content
  const extractHashtags = (text: string): string[] => {
    const hashtags = text.match(/#[\w]+/g);
    return hashtags ? hashtags.map(tag => tag.slice(1)) : [];
  };

  // Extract mentions from content
  const extractMentions = (text: string): string[] => {
    const mentions = text.match(/@[\w]+/g);
    return mentions ? mentions.map(mention => mention.slice(1)) : [];
  };

  // Get character count color
  const getCharCountColor = () => {
    const ratio = content.length / maxLength;
    if (ratio < 0.7) return 'text-muted-foreground';
    if (ratio < 0.9) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Check if post can be created
  const canCreatePost = content.trim().length > 0 || mediaFiles.some(file => !file.uploading);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-16 px-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden border border-border"
      >
        <Card className="border-0 shadow-none">
          {/* Header */}
          <CardHeader className="border-b border-border bg-muted/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Create Post</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
                  <X className="size-5" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Content */}
          <CardContent className="p-6 max-h-[calc(85vh-200px)] overflow-y-auto custom-scrollbar">
            {/* User Info */}
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="size-12">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{user.name}</p>
                <div className="flex items-center gap-2">
                  <Select value={visibility} onValueChange={(value: VisibilityType) => setVisibility(value)}>
                    <SelectTrigger className="w-auto border-0 p-1 h-auto text-sm text-muted-foreground hover:bg-muted rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center gap-2">
                          <Globe className="size-4" />
                          <span>Public</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="followers">
                        <div className="flex items-center gap-2">
                          <UserCheck className="size-4" />
                          <span>Followers</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex items-center gap-2">
                          <Lock className="size-4" />
                          <span>Private</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Text Input */}
            <div className="mb-4">
              <Textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="border-0 resize-none text-lg placeholder:text-muted-foreground focus:ring-0 p-0 min-h-[120px]"
                maxLength={maxLength}
              />
              
              {/* Character Count */}
              <div className="flex justify-end mt-2">
                <span className={`text-sm ${getCharCountColor()}`}>
                  {content.length}/{maxLength}
                </span>
              </div>
            </div>

            {/* Media Preview */}
            <AnimatePresence>
              {mediaFiles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4"
                >
                  <div className="grid grid-cols-2 gap-3">
                    {mediaFiles.map((mediaFile, index) => (
                      <motion.div
                        key={mediaFile.url}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative group rounded-lg overflow-hidden bg-muted"
                      >
                        {mediaFile.type === 'image' ? (
                          <img
                            src={mediaFile.url}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-40 object-cover"
                          />
                        ) : (
                          <div className="relative w-full h-40 bg-black flex items-center justify-center">
                            <video
                              src={mediaFile.url}
                              className="w-full h-full object-cover"
                              muted
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Play className="size-12 text-white opacity-80" />
                            </div>
                          </div>
                        )}

                        {/* Upload Progress */}
                        {mediaFile.uploading && (
                          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                            <Upload className="size-8 text-white mb-2" />
                            <Progress value={mediaFile.progress} className="w-3/4 h-2" />
                            <p className="text-white text-sm mt-2">{Math.round(mediaFile.progress)}%</p>
                          </div>
                        )}

                        {/* Remove Button */}
                        {!mediaFile.uploading && (
                          <button
                            onClick={() => removeMediaFile(mediaFile.url)}
                            className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="size-4 text-white" />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Upload Error */}
            <AnimatePresence>
              {uploadError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
                >
                  <p className="text-destructive text-sm">{uploadError}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Advanced Options */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 mb-4 p-4 bg-muted/30 rounded-lg"
                >
                  {/* Community Selection */}
                  {communities.length > 0 && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Post to Community</label>
                      <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a community (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {communities.map(community => (
                            <SelectItem key={community.id} value={community.id}>
                              <div className="flex items-center gap-2">
                                <Users className="size-4" />
                                <span>{community.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {community.members} members
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Location */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Add location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* LIA Assistant */}
            <div className="mb-4">
              <LIAAssistButton
                onGenerateCaption={handleLIAGenerateCaption}
                onGenerateHashtags={handleLIAGenerateHashtags}
                disabled={liaLoading}
                hasMedia={mediaFiles.length > 0}
                hasContent={content.length > 0}
              />
            </div>
          </CardContent>

          {/* Footer */}
          <div className="border-t border-border p-4 bg-muted/30">
            {/* Media and Options */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {/* Image Upload */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-primary/10"
                  disabled={mediaFiles.length >= 4}
                >
                  <ImageIcon className="size-5 text-primary" />
                </Button>
                
                {/* Video Upload */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => videoInputRef.current?.click()}
                  className="p-2 hover:bg-primary/10"
                  disabled={mediaFiles.length >= 1}
                >
                  <Video className="size-5 text-primary" />
                </Button>

                {/* More Options */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={`p-2 ${showAdvanced ? 'bg-primary/10 text-primary' : 'hover:bg-primary/10'}`}
                >
                  <Hash className="size-5" />
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePost}
                  disabled={!canCreatePost || isCreating || mediaFiles.some(file => file.uploading)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isCreating ? (
                    <div className="flex items-center gap-2">
                      <div className="loading-spinner" />
                      Creating...
                    </div>
                  ) : (
                    'Post'
                  )}
                </Button>
              </div>
            </div>

            {/* Upload Info */}
            {mediaFiles.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {mediaFiles.length}/4 files • Images: 10MB max • Videos: 100MB max
              </div>
            )}
          </div>
        </Card>

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileUpload(e.target.files, 'image')}
          className="hidden"
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          onChange={(e) => handleFileUpload(e.target.files, 'video')}
          className="hidden"
        />
      </motion.div>
    </div>
  );
}