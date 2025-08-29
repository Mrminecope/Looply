import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card } from "../ui/card";
import { AlertTriangle, Flag, Shield, X } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { moderationService, type ContentReport } from "../../utils/moderation";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
  contentType: 'post' | 'comment' | 'user' | 'community';
  contentPreview?: string;
  reporterId: string;
}

export function ReportModal({
  isOpen,
  onClose,
  contentId,
  contentType,
  contentPreview,
  reporterId
}: ReportModalProps) {
  const [reason, setReason] = useState<ContentReport['reason'] | ''>('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const reportReasons = [
    { value: 'spam', label: 'Spam or unwanted content', description: 'Repetitive, promotional, or irrelevant content' },
    { value: 'harassment', label: 'Harassment or bullying', description: 'Targeting individuals with harmful behavior' },
    { value: 'hate_speech', label: 'Hate speech', description: 'Content that attacks or demeans based on identity' },
    { value: 'violence', label: 'Violence or threats', description: 'Content depicting or threatening violence' },
    { value: 'nudity', label: 'Nudity or sexual content', description: 'Inappropriate sexual or graphic content' },
    { value: 'copyright', label: 'Copyright violation', description: 'Unauthorized use of copyrighted material' },
    { value: 'misinformation', label: 'False information', description: 'Deliberately false or misleading content' },
    { value: 'other', label: 'Other', description: 'Other violation not listed above' }
  ];

  const handleSubmit = async () => {
    if (!reason) {
      toast.error('Please select a reason for reporting');
      return;
    }

    // Check rate limit for reports
    if (!moderationService.checkRateLimit(reporterId, 'reports')) {
      toast.error('You have reached the daily limit for reports. Please try again later.');
      return;
    }

    setLoading(true);
    try {
      const report = moderationService.createReport({
        reporterId,
        contentId,
        contentType,
        reason: reason as ContentReport['reason'],
        description: description.trim() || undefined
      });

      // Create a violation for the content owner if it's serious
      if (['harassment', 'hate_speech', 'violence', 'nudity'].includes(reason)) {
        moderationService.createViolation({
          userId: 'content_owner_id', // In real app, get from content
          type: 'content',
          description: `Reported for ${reason}: ${description || 'No additional details'}`,
          severity: reason === 'violence' || reason === 'hate_speech' ? 'high' : 'medium',
          contentId
        });
      }

      toast.success('Report submitted successfully. Our moderation team will review it.');
      onClose();
      
      // Reset form
      setReason('');
      setDescription('');
    } catch (error) {
      console.error('Failed to submit report:', error);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedReason = reportReasons.find(r => r.value === reason);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-destructive" />
            Report Content
          </DialogTitle>
          <DialogDescription>
            Help us keep the community safe by reporting content that violates our guidelines. Your report will be reviewed by our moderation team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Content Preview */}
          {contentPreview && (
            <Card className="p-3 bg-muted/50">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium mb-1">Reporting this {contentType}:</p>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {contentPreview}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Reason Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Why are you reporting this content?</label>
            <Select value={reason} onValueChange={(value) => setReason(value as ContentReport['reason'])}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {reportReasons.map((reportReason) => (
                  <SelectItem key={reportReason.value} value={reportReason.value}>
                    <div>
                      <div className="font-medium">{reportReason.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {reportReason.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Details */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Additional details (optional)</label>
            <Textarea
              placeholder="Provide any additional context that might help our moderation team..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">
              {description.length}/500 characters
            </div>
          </div>

          {/* Warning for selected reason */}
          {selectedReason && (
            <Card className="p-3 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-1 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-orange-800 dark:text-orange-200 mb-1">
                    Report Guidelines
                  </p>
                  <p className="text-orange-700 dark:text-orange-300">
                    {selectedReason.description}. False reports may result in action against your account.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !reason}
            className="bg-destructive hover:bg-destructive/90"
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}