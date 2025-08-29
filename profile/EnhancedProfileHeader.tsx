import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  Camera, 
  MapPin, 
  Link as LinkIcon, 
  Calendar,
  Settings,
  Edit3,
  Plus,
  X,
  Check,
  Globe
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { processAvatarImage } from "../../utils/image-processing";

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  bio?: string;
  avatar: string;
  followers: number;
  following: number;
  verified?: boolean;
  location?: string;
  links?: string[];
  stats?: {
    posts: number;
    likes: number;
    comments: number;
    shares: number;
  };
}

interface EnhancedProfileHeaderProps {
  user: User;
  onUpdateProfile: (updates: Partial<User>) => Promise<void>;
  onAvatarUpload?: (file: File) => void; // Made optional since we handle it internally now
}

export function EnhancedProfileHeader({ 
  user, 
  onUpdateProfile, 
  onAvatarUpload 
}: EnhancedProfileHeaderProps) {
  // Add safety checks for user data
  if (!user) {
    return <div className="p-4">Loading profile...</div>;
  }

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name || '',
    bio: user.bio || '',
    location: user.location || '',
    links: user.links || []
  });
  const [newLink, setNewLink] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    try {
      await onUpdateProfile(editForm);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditForm({
      name: user.name || '',
      bio: user.bio || '',
      location: user.location || '',
      links: user.links || []
    });
    setIsEditing(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      toast.info('Processing avatar...');
      
      // Process the image (resize, compress, optimize)
      const processedImage = await processAvatarImage(file);
      
      // Update user avatar via onUpdateProfile
      await onUpdateProfile({ avatar: processedImage.dataUrl });
      
      toast.success('Avatar updated successfully!');
      
      // Add haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([15, 10, 15]);
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update avatar');
    } finally {
      setIsUploading(false);
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddLink = () => {
    if (newLink.trim() && editForm.links.length < 3) {
      setEditForm({
        ...editForm,
        links: [...editForm.links, newLink.trim()]
      });
      setNewLink('');
    }
  };

  const handleRemoveLink = (index: number) => {
    setEditForm({
      ...editForm,
      links: editForm.links.filter((_, i) => i !== index)
    });
  };

  const formatNumber = (num: number | undefined) => {
    if (!num || isNaN(num)) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Safe access to stats with fallbacks
  const safeStats = {
    posts: user.stats?.posts || 0,
    followers: user.followers || 0,
    following: user.following || 0
  };

  return (
    <>
      <div className="relative">
        {/* Cover Image */}
        <div className="h-32 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500" />
        
        {/* Profile Content */}
        <div className="relative px-4 pb-4">
          {/* Avatar */}
          <div className="relative -mt-16 mb-4">
            <div className="relative w-24 h-24">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-24 h-24 rounded-full border-4 border-background object-cover"
              />
              <button
                onClick={handleAvatarClick}
                disabled={isUploading}
                className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mobile-touch-optimized"
              >
                {isUploading ? (
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-3 h-3" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Profile Info */}
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold">{user.name}</h1>
                  {user.verified && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground">@{user.username}</p>
              </div>
              
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="text-sm leading-relaxed">{user.bio}</p>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {user.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{user.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Joined March 2024</span>
              </div>
            </div>

            {/* Links */}
            {user.links && user.links.length > 0 && (
              <div className="space-y-2">
                {user.links.map((link, index) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <LinkIcon className="w-4 h-4" />
                    <span className="truncate">{link}</span>
                  </a>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-6 pt-2">
              <div className="text-center">
                <div className="font-bold">{formatNumber(safeStats.posts)}</div>
                <div className="text-xs text-muted-foreground">Posts</div>
              </div>
              <div className="text-center">
                <div className="font-bold">{formatNumber(safeStats.followers)}</div>
                <div className="text-xs text-muted-foreground">Followers</div>
              </div>
              <div className="text-center">
                <div className="font-bold">{formatNumber(safeStats.following)}</div>
                <div className="text-xs text-muted-foreground">Following</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information to let others know more about you.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                placeholder="Your display name"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Bio</label>
              <Textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                placeholder="Tell people about yourself..."
                rows={3}
                maxLength={160}
              />
              <div className="text-xs text-muted-foreground text-right">
                {editForm.bio.length}/160 characters
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={editForm.location}
                  onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                  placeholder="Where are you located?"
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Links (max 3)</label>
              <div className="space-y-2">
                {editForm.links.map((link, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={link}
                        onChange={(e) => {
                          const newLinks = [...editForm.links];
                          newLinks[index] = e.target.value;
                          setEditForm({...editForm, links: newLinks});
                        }}
                        placeholder="https://example.com"
                        className="pl-10"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveLink(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                
                {editForm.links.length < 3 && (
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={newLink}
                        onChange={(e) => setNewLink(e.target.value)}
                        placeholder="Add a link..."
                        className="pl-10"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddLink()}
                      />
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleAddLink}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}