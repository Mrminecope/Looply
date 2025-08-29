import React, { useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Image, 
  Video, 
  MapPin, 
  Hash, 
  AtSign, 
  Smile,
  Send,
  Eye,
  EyeOff,
  Users,
  Globe,
  Lock,
  Camera,
  Plus,
  Wand2,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
// Fixed import - use named import instead of default
import { LIAAssistButton } from '../LIAAssistButton';
import { toast } from 'sonner@2.0.3';
import { APP_CONFIG, VALIDATION_RULES } from '../../utils/app-constants';
import type { Post, Community, User } from '../../types/app';

interface EnhancedCreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePost: (postData: Partial<Post>) => Promise<void>;
  user: User;
  communities?: Community[];
  className?: string;
}

export function EnhancedCreatePostModal({
  isOpen,
  onClose,
  onCreatePost,
  user,
  communities = [],
  className = ""
}: EnhancedCreatePostModalProps) {
  const [content, setContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [location, setLocation] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [mentions, setMentions] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [selectedCommunity, setSelectedCommunity] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('compose');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Character count and validation
  const characterCount = content.length;
  const isOverLimit = characterCount > VALIDATION_RULES.POST_CONTENT.MAX_LENGTH;
  const hasContent = content.trim().length >= VALIDATION_RULES.POST_CONTENT.MIN_LENGTH;

  // File size validation
  const totalImageSize = selectedImages.reduce((sum, file) => sum + file.size, 0);
  const videoSize = selectedVideo?.size || 0;
  const totalSize = totalImageSize + videoSize;
  const isOverSizeLimit = totalSize > APP_CONFIG.MAX_FILE_SIZE;

  // Media preview URLs
  const imagePreviewUrls = useMemo(() => {
    return selectedImages.map(file => URL.createObjectURL(file));
  }, [selectedImages]);

  const videoPreviewUrl = useMemo(() => {
    return selectedVideo ? URL.createObjectURL(selectedVideo) : null;
  }, [selectedVideo]);

  // Clean up URLs on unmount
  React.useEffect(() => {
    return () => {
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    };
  }, [imagePreviewUrls, videoPreviewUrl]);

  const handleImageSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validImages = files.filter(file => {
      if (!APP_CONFIG.SUPPORTED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not a supported image format`);
        return false;
      }
      if (file.size > APP_CONFIG.MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large (max ${Math.round(APP_CONFIG.MAX_FILE_SIZE / 1024 / 1024)}MB)`);
        return false;
      }
      return true;
    });

    if (validImages.length + selectedImages.length > 10) {
      toast.error('Maximum 10 images allowed per post');
      return;
    }

    setSelectedImages(prev => [...prev, ...validImages]);
    
    // Clear video if images are selected
    if (validImages.length > 0 && selectedVideo) {
      setSelectedVideo(null);
      toast.info('Video removed - posts can contain either images or video, not both');
    }
  }, [selectedImages.length, selectedVideo]);

  const handleVideoSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!APP_CONFIG.SUPPORTED_VIDEO_TYPES.includes(file.type)) {
      toast.error('Unsupported video format');
      return;
    }

    if (file.size > APP_CONFIG.MAX_FILE_SIZE) {
      toast.error(`Video is too large (max ${Math.round(APP_CONFIG.MAX_FILE_SIZE / 1024 / 1024)}MB)`);
      return;
    }

    setSelectedVideo(file);
    
    // Clear images if video is selected
    if (selectedImages.length > 0) {
      setSelectedImages([]);
      toast.info('Images removed - posts can contain either images or video, not both');
    }
  }, [selectedImages.length]);

  const handleRemoveImage = useCallback((index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleRemoveVideo = useCallback(() => {
    setSelectedVideo(null);
  }, []);

  const handleHashtagAdd = useCallback((tag: string) => {
    const cleanTag = tag.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
    if (cleanTag && !hashtags.includes(cleanTag) && hashtags.length < 20) {
      setHashtags(prev => [...prev, cleanTag]);
    }
  }, [hashtags]);

  const handleHashtagRemove = useCallback((tag: string) => {
    setHashtags(prev => prev.filter(t => t !== tag));
  }, []);

  const handleMentionAdd = useCallback((username: string) => {
    const cleanUsername = username.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
    if (cleanUsername && !mentions.includes(cleanUsername) && mentions.length < 10) {
      setMentions(prev => [...prev, cleanUsername]);
    }
  }, [mentions]);

  const handleMentionRemove = useCallback((username: string) => {
    setMentions(prev => prev.filter(u => u !== username));
  }, []);

  const handleLIAApply = useCallback((enhancedContent: string) => {
    setContent(enhancedContent);
    toast.success('LIA suggestions applied!');
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!hasContent || isOverLimit || isOverSizeLimit || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const postData: Partial<Post> = {
        content: content.trim(),
        type: selectedVideo ? 'video' : selectedImages.length > 0 ? 'image' : 'text',
        hashtags,
        mentions,
        location: location.trim() || null,
        visibility,
        community: selectedCommunity || null,
        // Note: In a real app, files would be uploaded to a service and URLs returned
        image: selectedImages.length > 0 ? imagePreviewUrls[0] : null,
        video: selectedVideo ? videoPreviewUrl : null
      };

      await onCreatePost(postData);
      
      // Reset form
      setContent('');
      setSelectedImages([]);
      setSelectedVideo(null);
      setLocation('');
      setHashtags([]);
      setMentions([]);
      setVisibility('public');
      setSelectedCommunity('');
      setShowPreview(false);
      setActiveTab('compose');
      
      onClose();
      toast.success('Post created successfully!');
    } catch (error) {
      console.error('Failed to create post:', error);
      toast.error('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    hasContent, 
    isOverLimit, 
    isOverSizeLimit, 
    isSubmitting, 
    content, 
    selectedVideo, 
    selectedImages, 
    hashtags, 
    mentions, 
    location, 
    visibility, 
    selectedCommunity, 
    imagePreviewUrls, 
    videoPreviewUrl, 
    onCreatePost, 
    onClose
  ]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`w-full max-w-2xl max-h-[90vh] ${className}`}
        >
          <Card className="bg-white/95 backdrop-blur-lg border-purple-200 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-500 text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Post
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-50">
                  <TabsTrigger value="compose" className="text-sm">
                    Compose
                  </TabsTrigger>
                  <TabsTrigger value="enhance" className="text-sm">
                    <Wand2 className="w-4 h-4 mr-1" />
                    Enhance
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="text-sm">
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </TabsTrigger>
                </TabsList>

                {/* Compose Tab */}
                <TabsContent value="compose" className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {/* User Info */}
                  <div className="flex items-center space-x-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-100"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                    </div>
                  </div>

                  {/* Content Input */}
                  <div className="space-y-2">
                    <Textarea
                      ref={textareaRef}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="What's on your mind?"
                      className="min-h-[120px] resize-none border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                      disabled={isSubmitting}
                    />
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex space-x-4">
                        <span className={`${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
                          {characterCount}/{VALIDATION_RULES.POST_CONTENT.MAX_LENGTH}
                        </span>
                        {totalSize > 0 && (
                          <span className={`${isOverSizeLimit ? 'text-red-500' : 'text-gray-500'}`}>
                            {Math.round(totalSize / 1024 / 1024 * 10) / 10}MB / {Math.round(APP_CONFIG.MAX_FILE_SIZE / 1024 / 1024)}MB
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Media Attachments */}
                  {(selectedImages.length > 0 || selectedVideo) && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">Media</h4>
                      
                      {/* Image Grid */}
                      {selectedImages.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {selectedImages.map((file, index) => (
                            <div key={index} className="relative">
                              <img
                                src={imagePreviewUrls[index]}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-gray-200"
                              />
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveImage(index)}
                                className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Video Preview */}
                      {selectedVideo && (
                        <div className="relative">
                          <video
                            src={videoPreviewUrl || undefined}
                            className="w-full h-48 object-cover rounded-lg border border-gray-200"
                            controls
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleRemoveVideo}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Hashtags */}
                  {hashtags.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Hashtags</h4>
                      <div className="flex flex-wrap gap-2">
                        {hashtags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-purple-50 text-purple-700 hover:bg-purple-100 cursor-pointer"
                            onClick={() => handleHashtagRemove(tag)}
                          >
                            #{tag}
                            <X className="w-3 h-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Location */}
                  {location && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{location}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLocation('')}
                        className="p-0 h-auto text-red-500 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}

                  {/* Post Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Visibility */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Visibility</label>
                      <Select value={visibility} onValueChange={(value: any) => setVisibility(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">
                            <div className="flex items-center">
                              <Globe className="w-4 h-4 mr-2" />
                              Public
                            </div>
                          </SelectItem>
                          <SelectItem value="friends">
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-2" />
                              Friends
                            </div>
                          </SelectItem>
                          <SelectItem value="private">
                            <div className="flex items-center">
                              <Lock className="w-4 h-4 mr-2" />
                              Private
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Community */}
                    {communities.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Community</label>
                        <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
                          <SelectTrigger>
                            <SelectValue placeholder="None (post to your profile)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            {communities.map((community) => (
                              <SelectItem key={community.id} value={community.id}>
                                {community.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Enhance Tab */}
                <TabsContent value="enhance" className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                      Enhance Your Post
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Use LIA to improve your post content, add engaging elements, and optimize for better reach.
                    </p>
                    
                    <LIAAssistButton
                      onApply={handleLIAApply}
                      currentContent={content}
                      context={{
                        text: content,
                        images: imagePreviewUrls,
                        videos: videoPreviewUrl ? [videoPreviewUrl] : []
                      }}
                      placeholder="Ask LIA to help improve your post..."
                    />
                  </div>
                </TabsContent>

                {/* Preview Tab */}
                <TabsContent value="preview" className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Post Preview</h3>
                    
                    {/* Preview Card */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center space-x-3 mb-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="font-semibold text-sm">{user.name}</h4>
                          <p className="text-xs text-gray-500">@{user.username} • now</p>
                        </div>
                      </div>
                      
                      {content && (
                        <p className="text-sm text-gray-800 mb-3 whitespace-pre-wrap">{content}</p>
                      )}
                      
                      {hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {hashtags.map((tag) => (
                            <span key={tag} className="text-xs text-purple-600">#{tag}</span>
                          ))}
                        </div>
                      )}
                      
                      {location && (
                        <p className="text-xs text-gray-500 flex items-center mb-3">
                          <MapPin className="w-3 h-3 mr-1" />
                          {location}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>0 likes</span>
                        <span>0 comments</span>
                        <span>0 shares</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Action Bar */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-2">
                  {/* Media Upload Buttons */}
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept={APP_CONFIG.SUPPORTED_IMAGE_TYPES.join(',')}
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={isSubmitting || !!selectedVideo}
                    className="text-purple-600 hover:bg-purple-50"
                  >
                    <Image className="w-4 h-4" />
                  </Button>

                  <input
                    ref={videoInputRef}
                    type="file"
                    accept={APP_CONFIG.SUPPORTED_VIDEO_TYPES.join(',')}
                    onChange={handleVideoSelect}
                    className="hidden"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => videoInputRef.current?.click()}
                    disabled={isSubmitting || selectedImages.length > 0}
                    className="text-purple-600 hover:bg-purple-50"
                  >
                    <Video className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const tag = prompt('Enter hashtag (without #):');
                      if (tag) handleHashtagAdd(tag);
                    }}
                    disabled={isSubmitting}
                    className="text-purple-600 hover:bg-purple-50"
                  >
                    <Hash className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const username = prompt('Enter username to mention (without @):');
                      if (username) handleMentionAdd(username);
                    }}
                    disabled={isSubmitting}
                    className="text-purple-600 hover:bg-purple-50"
                  >
                    <AtSign className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const loc = prompt('Enter location:');
                      if (loc) setLocation(loc);
                    }}
                    disabled={isSubmitting}
                    className="text-purple-600 hover:bg-purple-50"
                  >
                    <MapPin className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!hasContent || isOverLimit || isOverSizeLimit || isSubmitting}
                    className="bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600"
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-2"
                        >
                          <TrendingUp className="w-4 h-4" />
                        </motion.div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Create Post
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default EnhancedCreatePostModal;