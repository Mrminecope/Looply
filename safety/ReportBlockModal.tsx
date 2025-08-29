import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { AlertTriangle, Shield, UserX, Flag, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReportBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'user' | 'post' | 'comment';
  targetId: string;
  targetUser?: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  targetContent?: string;
  onReport: (data: ReportData) => void;
  onBlock: (targetId: string, targetType: 'user' | 'post' | 'comment') => void;
  currentUserId?: string;
}

interface ReportData {
  targetId: string;
  targetType: 'user' | 'post' | 'comment';
  reason: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
  blockUser?: boolean;
}

const REPORT_CATEGORIES = {
  post: [
    { id: 'spam', label: 'Spam or misleading', severity: 'medium' },
    { id: 'harassment', label: 'Harassment or bullying', severity: 'high' },
    { id: 'hate_speech', label: 'Hate speech', severity: 'high' },
    { id: 'violence', label: 'Violence or threats', severity: 'high' },
    { id: 'sexual_content', label: 'Sexual or adult content', severity: 'medium' },
    { id: 'copyright', label: 'Copyright infringement', severity: 'medium' },
    { id: 'misinformation', label: 'False information', severity: 'medium' },
    { id: 'self_harm', label: 'Self-harm or suicide', severity: 'high' },
    { id: 'other', label: 'Other violation', severity: 'low' }
  ],
  user: [
    { id: 'harassment', label: 'Harassment or bullying', severity: 'high' },
    { id: 'impersonation', label: 'Impersonation', severity: 'high' },
    { id: 'spam_account', label: 'Spam account', severity: 'medium' },
    { id: 'fake_account', label: 'Fake account', severity: 'medium' },
    { id: 'hate_speech', label: 'Hate speech', severity: 'high' },
    { id: 'inappropriate_profile', label: 'Inappropriate profile', severity: 'low' },
    { id: 'other', label: 'Other violation', severity: 'low' }
  ],
  comment: [
    { id: 'harassment', label: 'Harassment or bullying', severity: 'high' },
    { id: 'hate_speech', label: 'Hate speech', severity: 'high' },
    { id: 'spam', label: 'Spam', severity: 'medium' },
    { id: 'threatening', label: 'Threatening language', severity: 'high' },
    { id: 'inappropriate', label: 'Inappropriate content', severity: 'medium' },
    { id: 'other', label: 'Other violation', severity: 'low' }
  ]
};

export function ReportBlockModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetUser,
  targetContent,
  onReport,
  onBlock,
  currentUserId
}: ReportBlockModalProps) {
  const [step, setStep] = useState<'select' | 'report' | 'block' | 'success'>('select');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [description, setDescription] = useState('');
  const [blockUser, setBlockUser] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = REPORT_CATEGORIES[targetType] || [];
  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  const handleReport = async () => {
    if (!selectedCategory) return;

    setIsSubmitting(true);
    try {
      await onReport({
        targetId,
        targetType,
        reason: selectedCategoryData?.label || '',
        description,
        category: selectedCategory,
        severity: selectedCategoryData?.severity || 'low',
        blockUser
      });

      if (blockUser && targetUser) {
        await onBlock(targetUser.id, 'user');
      }

      setStep('success');
    } catch (error) {
      console.error('Report failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBlock = async () => {
    setIsSubmitting(true);
    try {
      await onBlock(targetUser?.id || targetId, targetType);
      setStep('success');
    } catch (error) {
      console.error('Block failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep('select');
    setSelectedCategory('');
    setDescription('');
    setBlockUser(false);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-background rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <Shield className="size-5 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Safety Center</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Report or block inappropriate content
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="size-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Select Action */}
              {step === 'select' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* Target Preview */}
                  {targetUser && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-12">
                          <AvatarImage src={targetUser.avatar} />
                          <AvatarFallback>{targetUser.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{targetUser.name}</p>
                          <p className="text-sm text-muted-foreground">@{targetUser.username}</p>
                        </div>
                      </div>
                      {targetContent && (
                        <div className="mt-2 p-2 bg-background rounded text-sm">
                          {targetContent.length > 100 
                            ? `${targetContent.substring(0, 100)}...` 
                            : targetContent
                          }
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-3">
                    <h3 className="font-semibold">What would you like to do?</h3>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start h-auto p-4"
                      onClick={() => setStep('report')}
                    >
                      <div className="flex items-center gap-3">
                        <Flag className="size-5 text-orange-500" />
                        <div className="text-left">
                          <p className="font-medium">Report this {targetType}</p>
                          <p className="text-sm text-muted-foreground">
                            Let us know if this violates our community guidelines
                          </p>
                        </div>
                      </div>
                    </Button>

                    {targetUser && (
                      <Button
                        variant="outline"
                        className="w-full justify-start h-auto p-4"
                        onClick={() => setStep('block')}
                      >
                        <div className="flex items-center gap-3">
                          <UserX className="size-5 text-red-500" />
                          <div className="text-left">
                            <p className="font-medium">Block @{targetUser.username}</p>
                            <p className="text-sm text-muted-foreground">
                              They won't be able to interact with you
                            </p>
                          </div>
                        </div>
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Report Form */}
              {step === 'report' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStep('select')}
                      className="mb-3"
                    >
                      ← Back
                    </Button>
                    <h3 className="font-semibold">Why are you reporting this {targetType}?</h3>
                    <p className="text-sm text-muted-foreground">
                      Your report helps keep our community safe
                    </p>
                  </div>

                  <RadioGroup value={selectedCategory} onValueChange={setSelectedCategory}>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <RadioGroupItem value={category.id} id={category.id} />
                          <Label htmlFor={category.id} className="flex-1 cursor-pointer">
                            <div className="flex items-center justify-between">
                              <span>{category.label}</span>
                              <Badge 
                                variant={category.severity === 'high' ? 'destructive' : 'secondary'}
                                className="text-xs"
                              >
                                {category.severity}
                              </Badge>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>

                  {selectedCategory && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-3"
                    >
                      <div>
                        <Label htmlFor="description">Additional details (optional)</Label>
                        <Textarea
                          id="description"
                          placeholder="Provide more context about why you're reporting this..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="mt-1"
                          rows={3}
                        />
                      </div>

                      {targetUser && (
                        <div className="flex items-start space-x-2 p-3 bg-muted/50 rounded-lg">
                          <Checkbox
                            id="blockUser"
                            checked={blockUser}
                            onCheckedChange={(checked) => setBlockUser(checked as boolean)}
                          />
                          <div>
                            <Label htmlFor="blockUser" className="font-medium">
                              Also block @{targetUser.username}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              They won't be able to see your content or interact with you
                            </p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={() => setStep('select')} className="flex-1">
                      Cancel
                    </Button>
                    <Button
                      onClick={handleReport}
                      disabled={!selectedCategory || isSubmitting}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="loading-spinner" />
                          Reporting...
                        </div>
                      ) : (
                        <>
                          <Send className="size-4 mr-1" />
                          Submit Report
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Block Confirmation */}
              {step === 'block' && targetUser && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStep('select')}
                      className="mb-3"
                    >
                      ← Back
                    </Button>
                  </div>

                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                      <UserX className="size-8 text-red-600" />
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg">Block @{targetUser.username}?</h3>
                      <p className="text-muted-foreground">
                        They won't be able to see your posts, follow you, or send you messages.
                      </p>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg text-left space-y-2">
                      <h4 className="font-medium">When you block someone:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• They can't see your profile or posts</li>
                        <li>• They can't follow you or tag you</li>
                        <li>• You won't see their content in your feed</li>
                        <li>• Previous interactions remain but they can't add new ones</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep('select')} className="flex-1">
                      Cancel
                    </Button>
                    <Button
                      onClick={handleBlock}
                      disabled={isSubmitting}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="loading-spinner" />
                          Blocking...
                        </div>
                      ) : (
                        <>
                          <UserX className="size-4 mr-1" />
                          Block User
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Success */}
              {step === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                    <Shield className="size-8 text-green-600" />
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg">Thank you for reporting</h3>
                    <p className="text-muted-foreground">
                      We'll review this content and take appropriate action if it violates our guidelines.
                    </p>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <p className="text-sm">
                      Our moderation team typically reviews reports within 24-48 hours. 
                      You'll receive updates on any actions taken.
                    </p>
                  </div>

                  <Button onClick={handleClose} className="w-full">
                    Done
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}