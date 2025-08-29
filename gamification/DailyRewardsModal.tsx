import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Gift, Star, Trophy, Zap, Calendar, Flame, Target, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DailyReward {
  day: number;
  reward: string;
  type: 'points' | 'badge' | 'boost' | 'premium';
  value: number;
  claimed: boolean;
  available: boolean;
}

interface UserStats {
  currentStreak: number;
  longestStreak: number;
  totalRewards: number;
  level: number;
  xp: number;
  xpToNext: number;
  badges: string[];
}

interface DailyRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userStats: UserStats;
  onClaimReward: (day: number) => void;
  onComplete: () => void;
}

const WEEKLY_REWARDS: DailyReward[] = [
  { day: 1, reward: "Welcome Points", type: 'points', value: 10, claimed: false, available: true },
  { day: 2, reward: "Engagement Boost", type: 'boost', value: 2, claimed: false, available: false },
  { day: 3, reward: "Creator Badge", type: 'badge', value: 1, claimed: false, available: false },
  { day: 4, reward: "Double XP", type: 'boost', value: 24, claimed: false, available: false },
  { day: 5, reward: "Premium Points", type: 'points', value: 50, claimed: false, available: false },
  { day: 6, reward: "Streak Master", type: 'badge', value: 1, claimed: false, available: false },
  { day: 7, reward: "Premium Week", type: 'premium', value: 7, claimed: false, available: false },
];

const ACHIEVEMENTS = [
  { id: 'first_post', name: 'First Post', icon: '✍️', description: 'Create your first post' },
  { id: 'social_butterfly', name: 'Social Butterfly', icon: '🦋', description: 'Comment on 10 posts' },
  { id: 'community_builder', name: 'Community Builder', icon: '🏗️', description: 'Join 5 communities' },
  { id: 'content_creator', name: 'Content Creator', icon: '🎨', description: 'Create 25 posts' },
  { id: 'influencer', name: 'Influencer', icon: '⭐', description: 'Get 100 likes' },
  { id: 'streak_master', name: 'Streak Master', icon: '🔥', description: '7-day login streak' },
];

export function DailyRewardsModal({
  isOpen,
  onClose,
  userStats,
  onClaimReward,
  onComplete
}: DailyRewardsModalProps) {
  const [activeTab, setActiveTab] = useState<'daily' | 'achievements'>('daily');
  const [rewards, setRewards] = useState<DailyReward[]>(WEEKLY_REWARDS);
  const [showCelebration, setShowCelebration] = useState(false);

  // Update rewards availability based on streak
  useEffect(() => {
    if (isOpen) {
      setRewards(prev => prev.map(reward => ({
        ...reward,
        available: reward.day <= userStats.currentStreak + 1,
        claimed: reward.day < userStats.currentStreak + 1
      })));
    }
  }, [isOpen, userStats.currentStreak]);

  const handleClaimReward = async (day: number) => {
    const reward = rewards.find(r => r.day === day);
    if (!reward || !reward.available || reward.claimed) return;

    // Show celebration animation
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2000);

    // Update local state
    setRewards(prev => prev.map(r => 
      r.day === day ? { ...r, claimed: true } : r
    ));

    // Notify parent
    onClaimReward(day);
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'points': return <Star className="size-5 text-yellow-500" />;
      case 'badge': return <Award className="size-5 text-purple-500" />;
      case 'boost': return <Zap className="size-5 text-blue-500" />;
      case 'premium': return <Trophy className="size-5 text-gold-500" />;
      default: return <Gift className="size-5 text-gray-500" />;
    }
  };

  const getRewardDescription = (reward: DailyReward) => {
    switch (reward.type) {
      case 'points':
        return `${reward.value} points`;
      case 'boost':
        return reward.day === 2 ? '2x engagement' : `${reward.value}h double XP`;
      case 'badge':
        return 'Special badge';
      case 'premium':
        return `${reward.value} days premium`;
      default:
        return reward.reward;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-background rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="text-center border-b">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Gift className="size-8 text-white" />
            </div>
            <CardTitle className="text-xl">Daily Rewards</CardTitle>
            <p className="text-sm text-muted-foreground">
              Keep your streak going to unlock amazing rewards!
            </p>
          </CardHeader>

          <CardContent className="p-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Flame className="size-6 text-orange-500" />
                </div>
                <p className="text-sm text-muted-foreground">Streak</p>
                <p className="font-bold text-lg">{userStats.currentStreak}</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Trophy className="size-6 text-purple-500" />
                </div>
                <p className="text-sm text-muted-foreground">Level</p>
                <p className="font-bold text-lg">{userStats.level}</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Star className="size-6 text-yellow-500" />
                </div>
                <p className="text-sm text-muted-foreground">Rewards</p>
                <p className="font-bold text-lg">{userStats.totalRewards}</p>
              </div>
            </div>

            {/* XP Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Level {userStats.level} Progress</span>
                <span className="text-sm text-muted-foreground">
                  {userStats.xp} / {userStats.xp + userStats.xpToNext} XP
                </span>
              </div>
              <Progress 
                value={(userStats.xp / (userStats.xp + userStats.xpToNext)) * 100} 
                className="h-3"
              />
            </div>

            {/* Tabs */}
            <div className="flex bg-muted rounded-lg p-1 mb-4">
              <Button
                variant={activeTab === 'daily' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('daily')}
                className="flex-1"
              >
                <Calendar className="size-4 mr-2" />
                Daily
              </Button>
              <Button
                variant={activeTab === 'achievements' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('achievements')}
                className="flex-1"
              >
                <Target className="size-4 mr-2" />
                Achievements
              </Button>
            </div>

            {/* Daily Rewards Tab */}
            {activeTab === 'daily' && (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                <h4 className="font-semibold flex items-center gap-2">
                  <Calendar className="size-4" />
                  Week {Math.floor(userStats.currentStreak / 7) + 1}
                </h4>
                
                {rewards.map((reward, index) => (
                  <motion.div
                    key={reward.day}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                      relative p-4 rounded-lg border transition-all
                      ${reward.claimed 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                        : reward.available 
                        ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700 cursor-pointer hover:border-purple-300' 
                        : 'bg-muted/30 border-border opacity-60'
                      }
                    `}
                    onClick={() => reward.available && !reward.claimed && handleClaimReward(reward.day)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                            ${reward.claimed 
                              ? 'bg-green-500 text-white' 
                              : reward.available 
                              ? 'bg-purple-500 text-white' 
                              : 'bg-muted text-muted-foreground'
                            }
                          `}>
                            {reward.claimed ? '✓' : reward.day}
                          </div>
                          {getRewardIcon(reward.type)}
                        </div>
                        
                        <div>
                          <p className="font-medium">{reward.reward}</p>
                          <p className="text-sm text-muted-foreground">
                            {getRewardDescription(reward)}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        {reward.claimed ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Claimed
                          </Badge>
                        ) : reward.available ? (
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                            Available
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="opacity-60">
                            Locked
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Glow effect for available rewards */}
                    {reward.available && !reward.claimed && (
                      <motion.div
                        className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20"
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                <h4 className="font-semibold flex items-center gap-2">
                  <Target className="size-4" />
                  Your Achievements
                </h4>
                
                {ACHIEVEMENTS.map((achievement, index) => {
                  const isUnlocked = userStats.badges.includes(achievement.id);
                  
                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`
                        p-4 rounded-lg border transition-all
                        ${isUnlocked 
                          ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700' 
                          : 'bg-muted/30 border-border'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-12 h-12 rounded-full flex items-center justify-center text-2xl
                          ${isUnlocked 
                            ? 'bg-yellow-100 dark:bg-yellow-900/40' 
                            : 'bg-muted text-muted-foreground grayscale'
                          }
                        `}>
                          {achievement.icon}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{achievement.name}</p>
                            {isUnlocked && (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                                ✓ Unlocked
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Close
              </Button>
              <Button 
                onClick={onComplete}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Celebration Animation */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 1, repeat: 2 }}
                  className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Gift className="size-12 text-white" />
                </motion.div>
                <motion.h3
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  className="text-2xl font-bold text-yellow-600 dark:text-yellow-400"
                >
                  Reward Claimed! 🎉
                </motion.h3>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}