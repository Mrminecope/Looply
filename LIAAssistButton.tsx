import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Send, 
  Loader2, 
  X, 
  Wand2, 
  Brain,
  MessageCircle,
  Lightbulb,
  TrendingUp,
  Hash,
  Smile
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { liaService, type LIAResponse } from '../utils/lia';
import { toast } from 'sonner@2.0.3';

interface LIAAssistButtonProps {
  onApply?: (content: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  currentContent?: string;
  context?: {
    text?: string;
    images?: string[];
    videos?: string[];
  };
}

function LIAAssistButton({
  onApply,
  placeholder = "How can LIA help you today?",
  className = "",
  disabled = false,
  currentContent = "",
  context = {}
}: LIAAssistButtonProps) {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<LIAResponse | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Quick suggestions for common LIA tasks
  const quickSuggestions = [
    '🎯 Make this more engaging',
    '📈 Add trending hashtags',
    '✨ Improve the caption',
    '💡 Suggest post ideas',
    '🔥 Add call-to-action',
    '📸 Optimize for reach'
  ];

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const contextData = {
        text: currentContent || input,
        ...context
      };

      const result = await liaService.processRequest({
        type: 'analyze',
        content: input,
        context: contextData
      });

      setResponse(result);
      
      if (result.success && result.suggestions) {
        setSuggestions(result.suggestions);
        toast.success('LIA analysis complete!');
      } else {
        toast.error(result.error || 'LIA analysis failed');
      }
    } catch (error) {
      console.error('LIA request failed:', error);
      toast.error('Failed to connect to LIA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSuggestion = async (suggestion: string) => {
    setInput(suggestion);
    await handleSubmit();
  };

  const handleApplyResponse = () => {
    if (response?.data && onApply) {
      const content = typeof response.data === 'string' 
        ? response.data 
        : (response.data as any).enhancedContent || input;
      
      onApply(content);
      setIsOpen(false);
      setInput('');
      setResponse(null);
      toast.success('LIA suggestions applied!');
    }
  };

  const handleEnhanceContent = async (type: string) => {
    if (!currentContent) {
      toast.error('No content to enhance');
      return;
    }

    setIsLoading(true);
    try {
      const result = await liaService.processRequest({
        type: 'enhance',
        content: currentContent,
        enhancementType: type
      });

      if (result.success && result.data) {
        setResponse(result);
        toast.success('Content enhanced!');
      } else {
        toast.error(result.error || 'Enhancement failed');
      }
    } catch (error) {
      console.error('Content enhancement failed:', error);
      toast.error('Failed to enhance content');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        className={`relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-200 ${className}`}
        size="lg"
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="mr-2"
        >
          <Brain className="w-5 h-5" />
        </motion.div>
        Ask LIA
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 transform -skew-x-12" />
      </Button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white/95 backdrop-blur-lg border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-500 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              LIA Assistant
              <Badge variant="secondary" className="ml-2 bg-white/20 text-white">
                v3.0
              </Badge>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {/* Quick Enhancement Actions */}
          {currentContent && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 flex items-center">
                <Wand2 className="w-4 h-4 mr-2" />
                Quick Enhancements
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => handleEnhanceContent('emoji')}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="text-xs"
                >
                  <Smile className="w-3 h-3 mr-1" />
                  Add Emojis
                </Button>
                <Button
                  onClick={() => handleEnhanceContent('hashtags')}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="text-xs"
                >
                  <Hash className="w-3 h-3 mr-1" />
                  Add Hashtags
                </Button>
                <Button
                  onClick={() => handleEnhanceContent('engaging')}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="text-xs"
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Make Engaging
                </Button>
                <Button
                  onClick={() => handleEnhanceContent('motivational')}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="text-xs"
                >
                  <Lightbulb className="w-3 h-3 mr-1" />
                  Motivational
                </Button>
              </div>
              <Separator />
            </div>
          )}

          {/* Quick Suggestions */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 flex items-center">
              <Sparkles className="w-4 h-4 mr-2" />
              Quick Actions
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {quickSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  onClick={() => handleQuickSuggestion(suggestion)}
                  variant="ghost"
                  size="sm"
                  disabled={isLoading}
                  className="justify-start text-left text-sm hover:bg-purple-50 hover:text-purple-700"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Input Area */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 flex items-center">
              <MessageCircle className="w-4 h-4 mr-2" />
              Ask LIA Anything
            </h4>
            <div className="space-y-3">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={placeholder}
                className="min-h-[100px] resize-none"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <div className="flex space-x-2">
                <Button
                  onClick={handleSubmit}
                  disabled={!input.trim() || isLoading}
                  className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
                  size="sm"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {isLoading ? 'Processing...' : 'Ask LIA'}
                </Button>
              </div>
            </div>
          </div>

          {/* Response */}
          <AnimatePresence>
            {response && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-3"
              >
                <Separator />
                <h4 className="text-sm font-medium text-gray-700 flex items-center">
                  <Brain className="w-4 h-4 mr-2" />
                  LIA Response
                </h4>
                
                {response.success ? (
                  <div className="space-y-3">
                    {/* Analysis Data */}
                    {response.data && typeof response.data === 'object' && (response.data as any).score !== undefined && (
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Content Score</span>
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                            {(response.data as any).score}/100
                          </Badge>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-600 to-pink-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(response.data as any).score}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Enhanced Content */}
                    {response.data && typeof response.data === 'object' && (response.data as any).enhancedContent && (
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <h5 className="text-sm font-medium mb-2">Enhanced Content</h5>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {(response.data as any).enhancedContent}
                        </p>
                      </div>
                    )}

                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium">Suggestions</h5>
                        <div className="space-y-1">
                          {suggestions.map((suggestion, index) => (
                            <div key={index} className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                              • {suggestion}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Apply Button */}
                    {onApply && (response.data || suggestions.length > 0) && (
                      <Button
                        onClick={handleApplyResponse}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        Apply Suggestions
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="text-sm text-red-700">
                      {response.error || 'LIA encountered an error'}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Export both named and default exports
export { LIAAssistButton };
export default LIAAssistButton;