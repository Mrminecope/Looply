import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { BarChart3, Users, Clock, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  endsAt: string;
  allowMultiple: boolean;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  community: string;
  createdAt: string;
  isActive: boolean;
}

interface CommunityPollCardProps {
  poll: Poll;
  currentUserId?: string;
  userVotes?: string[]; // Array of option IDs the user has voted for
  onVote: (pollId: string, optionId: string) => void;
  onViewResults: (pollId: string) => void;
  compact?: boolean;
}

export function CommunityPollCard({
  poll,
  currentUserId,
  userVotes = [],
  onVote,
  onViewResults,
  compact = false
}: CommunityPollCardProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(userVotes);
  const [showResults, setShowResults] = useState(userVotes.length > 0 || !poll.isActive);

  const hasVoted = userVotes.length > 0;
  const timeLeft = poll.isActive ? getTimeLeft(poll.endsAt) : null;

  function getTimeLeft(endsAt: string): string {
    const end = new Date(endsAt);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h left`;
    return `${hours}h left`;
  }

  const handleOptionSelect = (optionId: string) => {
    if (!poll.isActive || hasVoted) return;

    if (poll.allowMultiple) {
      setSelectedOptions(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const handleVoteSubmit = () => {
    if (selectedOptions.length === 0) return;
    
    selectedOptions.forEach(optionId => {
      onVote(poll.id, optionId);
    });
    
    setShowResults(true);
  };

  const maxVotes = Math.max(...poll.options.map(opt => opt.votes));

  return (
    <Card className={`${compact ? '' : 'mb-4'} overflow-hidden border-l-4 border-l-purple-500`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarImage src={poll.author.avatar} />
              <AvatarFallback>{poll.author.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{poll.author.name}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">{poll.community}</Badge>
                <span>•</span>
                <span>{new Date(poll.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-purple-500" />
            <Badge variant={poll.isActive ? "default" : "secondary"}>
              {poll.isActive ? "Active" : "Ended"}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Question */}
        <div>
          <h3 className="font-semibold text-lg mb-2">{poll.question}</h3>
          
          {/* Poll Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Users className="size-4" />
              <span>{poll.totalVotes} votes</span>
            </div>
            {timeLeft && (
              <div className="flex items-center gap-1">
                <Clock className="size-4" />
                <span>{timeLeft}</span>
              </div>
            )}
            {poll.allowMultiple && (
              <Badge variant="outline" className="text-xs">
                Multiple choice
              </Badge>
            )}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {poll.options.map((option, index) => {
            const isSelected = selectedOptions.includes(option.id);
            const hasUserVoted = userVotes.includes(option.id);
            const isWinning = showResults && option.votes === maxVotes && maxVotes > 0;

            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-3 rounded-lg border transition-all cursor-pointer ${
                  !showResults && poll.isActive && !hasVoted
                    ? 'hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                    : ''
                } ${
                  isSelected && !showResults 
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30' 
                    : 'border-border'
                } ${
                  hasUserVoted && showResults
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                    : ''
                }`}
                onClick={() => handleOptionSelect(option.id)}
              >
                {/* Background Progress Bar for Results */}
                {showResults && (
                  <motion.div
                    className={`absolute inset-0 rounded-lg ${
                      isWinning 
                        ? 'bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-900/40 dark:to-pink-900/40' 
                        : 'bg-muted/30'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${option.percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    style={{ width: `${option.percentage}%` }}
                  />
                )}

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Selection Indicator */}
                    {!showResults && poll.isActive && !hasVoted && (
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected 
                          ? 'border-purple-500 bg-purple-500' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 bg-white rounded-full"
                          />
                        )}
                      </div>
                    )}

                    {/* Vote Check Mark */}
                    {hasUserVoted && showResults && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-purple-500"
                      >
                        <CheckCircle className="size-5" />
                      </motion.div>
                    )}

                    <span className="font-medium">{option.text}</span>
                    
                    {isWinning && showResults && (
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        Leading
                      </Badge>
                    )}
                  </div>

                  {/* Results */}
                  {showResults && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{option.percentage}%</span>
                      <span className="text-sm text-muted-foreground">({option.votes})</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            {!showResults && poll.isActive && !hasVoted && (
              <Button
                onClick={handleVoteSubmit}
                disabled={selectedOptions.length === 0}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                Vote ({selectedOptions.length})
              </Button>
            )}
            
            {!showResults && hasVoted && (
              <Button variant="outline" onClick={() => setShowResults(true)}>
                View Results
              </Button>
            )}
          </div>

          {showResults && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewResults(poll.id)}
              className="text-purple-600 hover:text-purple-700"
            >
              Detailed Results
            </Button>
          )}
        </div>

        {/* Results Preview */}
        {showResults && !compact && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="pt-3 border-t border-border"
          >
            <div className="text-sm text-muted-foreground">
              <p>Total votes: {poll.totalVotes}</p>
              {hasVoted && (
                <p className="text-purple-600 dark:text-purple-400 font-medium">
                  You voted for: {poll.options.filter(opt => userVotes.includes(opt.id)).map(opt => opt.text).join(', ')}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}