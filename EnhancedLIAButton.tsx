import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  Brain, 
  Zap, 
  Wand2, 
  TrendingUp, 
  Heart,
  MessageCircle,
  Share2,
  BarChart3,
  Clock,
  Hash,
  Camera,
  Video,
  Type,
  Smile,
  Target,
  Lightbulb,
  X,
  Check,
  RefreshCw,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { liaService, type LIAResponse, type ContentContext } from '../utils/lia';
import { toast } from 'sonner@2.0.3';

interface EnhancedLIAButtonProps {
  showLIAButton: boolean;
  text?: string;
  onApply?: (content: string) => void;
  currentContent?: string;
  context?: ContentContext;
  position?: 'bottom-right' | 'bottom-left' | 'center';
  size?: 'small' | 'medium' | 'large';
}

interface VoiceRecording {
  isRecording: boolean;
  transcript: string;
  confidence: number;
}

interface LIAAnalysisData {
  score: number;
  insights: any[];
  suggestions: string[];
  hashtags: string[];
  trends: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  engagementPrediction: number;
}

export function EnhancedLIAButton({
  showLIAButton,
  text = '',
  onApply,
  currentContent = '',
  context = {},
  position = 'bottom-right',
  size = 'medium'
}: EnhancedLIAButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('analyze');
  const [analysisData, setAnalysisData] = useState<LIAAnalysisData | null>(null);
  const [quickActions, setQuickActions] = useState<string[]>([]);
  const [voiceRecording, setVoiceRecording] = useState<VoiceRecording>({
    isRecording: false,
    transcript: '',
    confidence: 0
  });
  const [enhancedContent, setEnhancedContent] = useState('');
  const [liaStatus, setLiaStatus] = useState(liaService.getStatus());
  
  const recognitionRef = useRef<any>(null);
  const animationRef = useRef<number>();

  // Update LIA status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setLiaStatus(liaService.getStatus());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'center': 'bottom-1/2 left-1/2 transform -translate-x-1/2 translate-y-1/2'
  };

  // Size classes
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-14 h-14',
    large: 'w-16 h-16'
  };

  const handleAnalyzeContent = async () => {
    if (!currentContent && !context.text) {
      toast.error('No content to analyze');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await liaService.processRequest({
        type: 'analyze',
        context: {
          text: currentContent || context.text,
          ...context
        }
      });

      if (response.success && response.data) {
        setAnalysisData(response.data as LIAAnalysisData);
        setQuickActions(response.quickActions || []);
        toast.success('Analysis complete!');
      } else {
        toast.error(response.error || 'Analysis failed');
      }
    } catch (error) {
      toast.error('Failed to analyze content');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    const enhancementType = action.toLowerCase().includes('hashtag') ? 'hashtags' :
                           action.toLowerCase().includes('emoji') ? 'emoji' :
                           action.toLowerCase().includes('question') ? 'engaging' :
                           action.toLowerCase().includes('motivat') ? 'motivational' :
                           'casual';

    try {
      const response = await liaService.processRequest({
        type: 'enhance',
        content: currentContent,
        enhancementType
      });

      if (response.success && response.data) {
        const enhanced = (response.data as any).enhancedContent;
        setEnhancedContent(enhanced);
        toast.success('Content enhanced!');
      } else {
        toast.error(response.error || 'Enhancement failed');
      }
    } catch (error) {
      toast.error('Failed to enhance content');
    }
  };

  const startVoiceRecording = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice recognition not supported in this browser');
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setVoiceRecording(prev => ({ ...prev, isRecording: true }));
        toast.info('Listening... Speak now!');
      };

      recognitionRef.current.onresult = (event: any) => {
        const result = event.results[event.results.length - 1];
        setVoiceRecording(prev => ({
          ...prev,
          transcript: result[0].transcript,
          confidence: result[0].confidence * 100
        }));
      };

      recognitionRef.current.onend = () => {
        setVoiceRecording(prev => ({ ...prev, isRecording: false }));
        toast.success('Voice input complete!');
      };

      recognitionRef.current.onerror = (event: any) => {
        setVoiceRecording(prev => ({ ...prev, isRecording: false }));
        toast.error(`Voice recognition error: ${event.error}`);
      };

      recognitionRef.current.start();
    } catch (error) {
      toast.error('Failed to start voice recognition');
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const applyVoiceInput = () => {
    if (voiceRecording.transcript && onApply) {
      onApply(voiceRecording.transcript);
      setVoiceRecording({ isRecording: false, transcript: '', confidence: 0 });
      toast.success('Voice input applied!');
    }
  };

  const generateCaption = async () => {
    try {
      const response = await liaService.processRequest({
        type: 'caption',
        context
      });

      if (response.success && response.data) {
        const caption = (response.data as any).caption;
        setEnhancedContent(caption);
        toast.success('Caption generated!');
      } else {
        toast.error(response.error || 'Caption generation failed');
      }
    } catch (error) {
      toast.error('Failed to generate caption');
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-500';
      case 'negative': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😔';
      default: return '😐';
    }
  };

  if (!showLIAButton) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className={`fixed ${positionClasses[position]} z-50`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {!isExpanded ? (
          // Collapsed LIA Button
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => setIsExpanded(true)}
              className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white shadow-lg hover:shadow-xl border-0 p-0 overflow-hidden relative group`}
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Main icon */}
              <motion.div
                animate={{ rotate: isAnalyzing ? 360 : 0 }}
                transition={{ duration: 2, repeat: isAnalyzing ? Infinity : 0, ease: "linear" }}
                className="relative z-10"
              >
                {isAnalyzing ? (
                  <RefreshCw className="w-6 h-6" />
                ) : (
                  <Brain className="w-6 h-6" />
                )}
              </motion.div>

              {/* Pulse animation */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-white/30"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Status indicator */}
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${liaStatus.isHealthy ? 'bg-green-400' : 'bg-red-400'} border-2 border-white`} />
            </Button>

            {/* Floating text */}
            {text && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-black/80 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap backdrop-blur-sm"
              >
                {text}
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-l-4 border-l-black/80 border-y-4 border-y-transparent" />
              </motion.div>
            )}
          </motion.div>
        ) : (
          // Expanded LIA Panel
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-96 max-h-[70vh] bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5" />
                <span className="font-semibold">LIA v3.0</span>
                <Badge variant="secondary" className="text-xs bg-white/20 text-white">
                  {liaStatus.version}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 max-h-[calc(70vh-80px)] overflow-y-auto custom-scrollbar">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-gray-100">
                  <TabsTrigger value="analyze" className="text-xs">
                    <BarChart3 className="w-3 h-3 mr-1" />
                    Analyze
                  </TabsTrigger>
                  <TabsTrigger value="enhance" className="text-xs">
                    <Wand2 className="w-3 h-3 mr-1" />
                    Enhance
                  </TabsTrigger>
                  <TabsTrigger value="voice" className="text-xs">
                    <Mic className="w-3 h-3 mr-1" />
                    Voice
                  </TabsTrigger>
                  <TabsTrigger value="quick" className="text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    Quick
                  </TabsTrigger>
                </TabsList>

                {/* Analyze Tab */}
                <TabsContent value="analyze" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Content Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button
                        onClick={handleAnalyzeContent}
                        disabled={isAnalyzing || (!currentContent && !context.text)}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white"
                        size="sm"
                      >
                        {isAnalyzing ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4 mr-2" />
                        )}
                        {isAnalyzing ? 'Analyzing...' : 'Analyze Content'}
                      </Button>

                      {analysisData && (
                        <div className="space-y-3">
                          {/* Overall Score */}
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Content Score</span>
                              <span className="font-semibold">{analysisData.score}/100</span>
                            </div>
                            <Progress value={analysisData.score} className="h-2" />
                          </div>

                          {/* Sentiment */}
                          <div className="flex items-center justify-between text-sm">
                            <span>Sentiment</span>
                            <span className={`flex items-center ${getSentimentColor(analysisData.sentiment)}`}>
                              {getSentimentIcon(analysisData.sentiment)}
                              <span className="ml-1 capitalize">{analysisData.sentiment}</span>
                            </span>
                          </div>

                          {/* Engagement Prediction */}
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Engagement Prediction</span>
                              <span className="font-semibold">{Math.round(analysisData.engagementPrediction)}%</span>
                            </div>
                            <Progress value={analysisData.engagementPrediction} className="h-2" />
                          </div>

                          {/* Insights */}
                          {analysisData.insights.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium mb-2">Insights</h4>
                              <div className="space-y-2">
                                {analysisData.insights.slice(0, 3).map((insight, index) => (
                                  <div key={index} className="flex items-start space-x-2 text-xs">
                                    <span className="text-lg">{insight.icon}</span>
                                    <div>
                                      <div className="font-medium">{insight.title}</div>
                                      <div className="text-gray-600">{insight.description}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Suggestions */}
                          {analysisData.suggestions.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium mb-2">Suggestions</h4>
                              <div className="space-y-1">
                                {analysisData.suggestions.slice(0, 3).map((suggestion, index) => (
                                  <div key={index} className="text-xs bg-blue-50 p-2 rounded">
                                    • {suggestion}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Hashtags */}
                          {analysisData.hashtags.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium mb-2">Suggested Hashtags</h4>
                              <div className="flex flex-wrap gap-1">
                                {analysisData.hashtags.slice(0, 6).map((hashtag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    #{hashtag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Enhance Tab */}
                <TabsContent value="enhance" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center">
                        <Wand2 className="w-4 h-4 mr-2" />
                        Content Enhancement
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={() => handleQuickAction('Add emojis')}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          <Smile className="w-3 h-3 mr-1" />
                          Add Emojis
                        </Button>
                        <Button
                          onClick={() => handleQuickAction('Add hashtags')}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          <Hash className="w-3 h-3 mr-1" />
                          Add Tags
                        </Button>
                        <Button
                          onClick={() => handleQuickAction('Make engaging')}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          <Target className="w-3 h-3 mr-1" />
                          Engaging
                        </Button>
                        <Button
                          onClick={generateCaption}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          <Type className="w-3 h-3 mr-1" />
                          Caption
                        </Button>
                      </div>

                      {enhancedContent && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Enhanced Content</h4>
                          <div className="bg-gray-50 p-3 rounded-lg text-sm">
                            {enhancedContent}
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => onApply?.(enhancedContent)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Apply
                            </Button>
                            <Button
                              onClick={() => setEnhancedContent('')}
                              variant="outline"
                              size="sm"
                            >
                              Clear
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Voice Tab */}
                <TabsContent value="voice" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center">
                        <Mic className="w-4 h-4 mr-2" />
                        Voice Input
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-center">
                        <Button
                          onClick={voiceRecording.isRecording ? stopVoiceRecording : startVoiceRecording}
                          className={`w-full ${voiceRecording.isRecording 
                            ? 'bg-red-600 hover:bg-red-700' 
                            : 'bg-blue-600 hover:bg-blue-700'
                          } text-white`}
                          size="sm"
                        >
                          {voiceRecording.isRecording ? (
                            <>
                              <MicOff className="w-4 h-4 mr-2" />
                              Stop Recording
                            </>
                          ) : (
                            <>
                              <Mic className="w-4 h-4 mr-2" />
                              Start Recording
                            </>
                          )}
                        </Button>
                      </div>

                      {voiceRecording.isRecording && (
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="flex justify-center"
                        >
                          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                            <Mic className="w-8 h-8 text-red-600" />
                          </div>
                        </motion.div>
                      )}

                      {voiceRecording.transcript && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Transcript</h4>
                          <div className="bg-gray-50 p-3 rounded-lg text-sm">
                            {voiceRecording.transcript}
                          </div>
                          {voiceRecording.confidence > 0 && (
                            <div className="text-xs text-gray-600">
                              Confidence: {Math.round(voiceRecording.confidence)}%
                            </div>
                          )}
                          <Button
                            onClick={applyVoiceInput}
                            size="sm"
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Apply Voice Input
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Quick Actions Tab */}
                <TabsContent value="quick" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center">
                        <Zap className="w-4 h-4 mr-2" />
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid gap-2">
                        {quickActions.length > 0 ? quickActions.map((action, index) => (
                          <Button
                            key={index}
                            onClick={() => handleQuickAction(action)}
                            variant="outline"
                            size="sm"
                            className="text-xs justify-start"
                          >
                            {action}
                          </Button>
                        )) : (
                          <div className="text-center text-gray-500 text-sm py-4">
                            Analyze content first to see quick actions
                          </div>
                        )}
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Smart Tools</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            onClick={() => handleQuickAction('trending hashtags')}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Trends
                          </Button>
                          <Button
                            onClick={() => handleQuickAction('engagement boost')}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            <Heart className="w-3 h-3 mr-1" />
                            Engage
                          </Button>
                          <Button
                            onClick={() => handleQuickAction('optimal timing')}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            Timing
                          </Button>
                          <Button
                            onClick={generateCaption}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            <Lightbulb className="w-3 h-3 mr-1" />
                            Ideas
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Status Bar */}
            <div className="px-4 py-2 bg-gray-50 border-t flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${liaStatus.isHealthy ? 'bg-green-400' : 'bg-red-400'}`} />
                <span>LIA {liaStatus.isHealthy ? 'Online' : 'Offline'}</span>
              </div>
              <div className="flex items-center space-x-2">
                {liaStatus.isProcessing && (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                )}
                <span>Cache: {liaStatus.cacheSize}</span>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}