import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Plus, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  User,
  FileText,
  Image,
  Settings
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { AvatarUpload } from './AvatarUpload';
import { toast } from 'sonner@2.0.3';

interface FeatureShowcaseProps {
  user: any;
  onUpdateProfile: (updates: any) => Promise<void>;
  onOpenCreateModal: () => void;
}

export function FeatureShowcase({
  user,
  onUpdateProfile,
  onOpenCreateModal
}: FeatureShowcaseProps) {
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const features = [
    {
      id: 'avatar',
      title: 'Upload Avatar',
      description: 'Personalize your profile with a custom avatar',
      icon: Camera,
      color: 'from-purple-500 to-pink-500',
      action: () => setShowAvatarUpload(true),
      completed: user?.avatar && user.avatar !== '/default-avatar.png'
    },
    {
      id: 'create',
      title: 'Create Post',
      description: 'Share your thoughts with the community',
      icon: Plus,
      color: 'from-blue-500 to-cyan-500',
      action: onOpenCreateModal,
      completed: false // You could track this based on user's post count
    },
    {
      id: 'profile',
      title: 'Complete Profile',
      description: 'Add bio, location, and links to your profile',
      icon: User,
      color: 'from-green-500 to-emerald-500',
      action: () => toast.info('Navigate to Profile tab to complete your profile'),
      completed: user?.bio && user.bio.length > 0
    }
  ];

  const handleAvatarUpdate = async (avatarUrl: string) => {
    try {
      await onUpdateProfile({ avatar: avatarUrl });
      setCompletedSteps(prev => [...prev, 'avatar']);
      setShowAvatarUpload(false);
    } catch (error) {
      console.error('Failed to update avatar:', error);
      throw error;
    }
  };

  const completedCount = features.filter(f => f.completed || completedSteps.includes(f.id)).length;
  const progress = (completedCount / features.length) * 100;

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center space-x-2"
        >
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Get Started with Looply
          </h2>
        </motion.div>
        <p className="text-muted-foreground">
          Complete these steps to make the most of your Looply experience
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Setup Progress</span>
            <Badge variant="secondary" className="bg-white/50">
              {completedCount}/{features.length}
            </Badge>
          </div>
          <div className="w-full bg-white/50 rounded-full h-2 mb-3">
            <motion.div
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <p className="text-xs text-purple-700">
            {progress === 100 
              ? "🎉 All set! You're ready to explore Looply!" 
              : `${Math.round(progress)}% complete - Keep going!`
            }
          </p>
        </CardContent>
      </Card>

      {/* Feature Cards */}
      <div className="grid gap-4">
        {features.map((feature, index) => {
          const isCompleted = feature.completed || completedSteps.includes(feature.id);
          
          return (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`
                transition-all duration-200 cursor-pointer hover:shadow-lg
                ${isCompleted 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-border hover:border-primary/50'
                }
              `}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`
                        p-2 rounded-lg bg-gradient-to-r ${feature.color} text-white
                        ${isCompleted ? 'opacity-75' : ''}
                      `}>
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <feature.icon className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">
                          {feature.title}
                          {isCompleted && <span className="text-green-600 ml-2">✓</span>}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                    
                    {!isCompleted && (
                      <Button
                        onClick={feature.action}
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                      >
                        Start
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Avatar Upload Modal */}
      <AnimatePresence>
        {showAvatarUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && setShowAvatarUpload(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md"
            >
              <Card className="bg-white/95 backdrop-blur-lg border-purple-200">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-500 text-white">
                  <CardTitle className="text-lg flex items-center">
                    <Camera className="w-5 h-5 mr-2" />
                    Upload Avatar
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <AvatarUpload
                    currentAvatar={user?.avatar}
                    userName={user?.name}
                    onAvatarUpdate={handleAvatarUpdate}
                  />
                  <Separator className="my-4" />
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowAvatarUpload(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm text-blue-800 mb-2 flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Pro Tips
          </h3>
          <div className="space-y-2 text-xs text-blue-700">
            <div className="flex items-start space-x-2">
              <div className="w-1 h-1 bg-blue-600 rounded-full mt-2" />
              <p>Use high-quality images for your avatar (recommended: 200x200px)</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-1 h-1 bg-blue-600 rounded-full mt-2" />
              <p>Posts with images get 3x more engagement than text-only posts</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-1 h-1 bg-blue-600 rounded-full mt-2" />
              <p>Complete your profile to help others discover and connect with you</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}