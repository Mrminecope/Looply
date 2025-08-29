import { generateHashtags, analyzeSentiment, suggestCaption } from './ai-helpers';

export interface LIAInsight {
  id: string;
  type: 'suggestion' | 'warning' | 'optimization' | 'trend';
  title: string;
  description: string;
  action?: string;
  confidence: number;
  category: 'content' | 'engagement' | 'growth' | 'safety';
  icon: string;
}

export interface LIAAnalysis {
  score: number;
  insights: LIAInsight[];
  suggestions: string[];
  hashtags: string[];
  trends: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  engagementPrediction: number;
}

export interface ContentContext {
  text?: string;
  images?: string[];
  videos?: string[];
  userProfile?: any;
  previousPosts?: any[];
  currentTrends?: string[];
  timeOfDay?: string;
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
}

class LocalLIAV3 {
  private knowledgeBase: Map<string, any> = new Map();
  private trendData: string[] = [];
  private userBehaviorPatterns: Map<string, any> = new Map();
  
  constructor() {
    this.initializeKnowledgeBase();
    this.loadTrendData();
  }

  private initializeKnowledgeBase() {
    // Initialize with Looply-specific knowledge
    this.knowledgeBase.set('hashtags', {
      trending: ['#looply', '#socialize', '#connect', '#viral', '#trending', '#mood', '#vibes', '#community'],
      engagement: ['#love', '#amazing', '#beautiful', '#inspiring', '#motivation', '#lifestyle', '#friends'],
      growth: ['#followme', '#like4like', '#engagement', '#support', '#community', '#newpost'],
      niche: ['#art', '#photography', '#music', '#fitness', '#food', '#travel', '#tech', '#fashion']
    });

    this.knowledgeBase.set('contentTemplates', {
      motivational: [
        "✨ {content} ✨",
        "💫 Here's your daily reminder: {content}",
        "🌟 Believe in yourself: {content}",
        "💪 You've got this! {content}"
      ],
      casual: [
        "Just {content} 😊",
        "Mood: {content}",
        "{content} - what do you think?",
        "Sharing some {content} vibes"
      ],
      engaging: [
        "What's your take on {content}? 🤔",
        "{content} - who can relate? 🙋‍♀️",
        "Drop a 💜 if you agree with {content}",
        "Let's discuss: {content}"
      ]
    });

    this.knowledgeBase.set('bestTimes', {
      weekday: ['09:00', '12:00', '17:00', '20:00'],
      weekend: ['10:00', '14:00', '19:00', '21:00']
    });

    this.knowledgeBase.set('contentOptimization', {
      textLength: { min: 10, optimal: 150, max: 280 },
      hashtagCount: { min: 3, optimal: 7, max: 15 },
      imageAspectRatio: ['1:1', '4:5', '9:16'],
      videoLength: { min: 15, optimal: 30, max: 60 }
    });
  }

  private loadTrendData() {
    const currentTrends = [
      'ai technology', 'sustainable living', 'mental health', 'remote work',
      'digital art', 'fitness journey', 'mindfulness', 'creativity',
      'social impact', 'community building', 'personal growth', 'innovation'
    ];
    this.trendData = currentTrends;
  }

  async analyzeContent(context: ContentContext): Promise<LIAAnalysis> {
    const insights: LIAInsight[] = [];
    const suggestions: string[] = [];
    let score = 70; // Base score

    // Analyze text content
    if (context.text) {
      const textAnalysis = this.analyzeText(context.text);
      insights.push(...textAnalysis.insights);
      suggestions.push(...textAnalysis.suggestions);
      score += textAnalysis.scoreAdjustment;
    }

    // Analyze media content
    if (context.images || context.videos) {
      const mediaAnalysis = this.analyzeMedia(context);
      insights.push(...mediaAnalysis.insights);
      suggestions.push(...mediaAnalysis.suggestions);
      score += mediaAnalysis.scoreAdjustment;
    }

    // Analyze timing
    const timingAnalysis = this.analyzeTiming();
    insights.push(...timingAnalysis.insights);
    suggestions.push(...timingAnalysis.suggestions);

    // Generate hashtags
    const hashtags = this.generateSmartHashtags(context);
    
    // Detect trends
    const trends = this.detectTrends(context);

    // Analyze sentiment
    const sentiment = this.analyzeSentiment(context.text || '');

    // Predict engagement
    const engagementPrediction = this.predictEngagement(context, score);

    return {
      score: Math.min(Math.max(score, 0), 100),
      insights,
      suggestions,
      hashtags,
      trends,
      sentiment,
      engagementPrediction
    };
  }

  private analyzeText(text: string) {
    const insights: LIAInsight[] = [];
    const suggestions: string[] = [];
    let scoreAdjustment = 0;

    const words = text.toLowerCase().split(/\s+/);
    const optimization = this.knowledgeBase.get('contentOptimization');

    // Length analysis
    if (text.length < optimization.textLength.min) {
      insights.push({
        id: 'text-too-short',
        type: 'warning',
        title: 'Content Too Short',
        description: 'Your post might benefit from more detail to engage users',
        action: 'Add more context or description',
        confidence: 85,
        category: 'content',
        icon: '📝'
      });
      suggestions.push('Consider adding more details to make your post more engaging');
      scoreAdjustment -= 10;
    } else if (text.length > optimization.textLength.max) {
      insights.push({
        id: 'text-too-long',
        type: 'optimization',
        title: 'Content Length Optimization',
        description: 'Shorter posts often get better engagement',
        action: 'Consider breaking into multiple posts',
        confidence: 70,
        category: 'engagement',
        icon: '✂️'
      });
      suggestions.push('Try to keep posts concise for better engagement');
      scoreAdjustment -= 5;
    } else {
      scoreAdjustment += 10;
    }

    // Engagement words
    const engagementWords = ['amazing', 'incredible', 'love', 'beautiful', 'awesome', 'fantastic'];
    const hasEngagementWords = engagementWords.some(word => text.toLowerCase().includes(word));
    
    if (hasEngagementWords) {
      scoreAdjustment += 5;
      insights.push({
        id: 'engagement-words',
        type: 'suggestion',
        title: 'Great Engagement Language',
        description: 'Your post uses language that typically drives engagement',
        confidence: 75,
        category: 'engagement',
        icon: '💫'
      });
    }

    // Question detection
    if (text.includes('?')) {
      scoreAdjustment += 8;
      insights.push({
        id: 'question-detected',
        type: 'suggestion',
        title: 'Interactive Content Detected',
        description: 'Questions are great for encouraging comments',
        confidence: 90,
        category: 'engagement',
        icon: '❓'
      });
    } else {
      suggestions.push('Consider adding a question to encourage interaction');
    }

    // Call-to-action detection
    const ctaWords = ['follow', 'like', 'share', 'comment', 'subscribe', 'join'];
    const hasCTA = ctaWords.some(word => text.toLowerCase().includes(word));
    
    if (hasCTA) {
      scoreAdjustment += 5;
    } else {
      suggestions.push('Adding a call-to-action can boost engagement');
    }

    return { insights, suggestions, scoreAdjustment };
  }

  private analyzeMedia(context: ContentContext) {
    const insights: LIAInsight[] = [];
    const suggestions: string[] = [];
    let scoreAdjustment = 0;

    if (context.images && context.images.length > 0) {
      scoreAdjustment += 15;
      insights.push({
        id: 'visual-content',
        type: 'suggestion',
        title: 'Visual Content Boost',
        description: 'Posts with images get 2.3x more engagement',
        confidence: 95,
        category: 'engagement',
        icon: '📸'
      });

      if (context.images.length > 1) {
        insights.push({
          id: 'multiple-images',
          type: 'optimization',
          title: 'Carousel Content',
          description: 'Multiple images can increase time spent on post',
          confidence: 80,
          category: 'engagement',
          icon: '🎠'
        });
        scoreAdjustment += 5;
      }
    }

    if (context.videos && context.videos.length > 0) {
      scoreAdjustment += 20;
      insights.push({
        id: 'video-content',
        type: 'suggestion',
        title: 'Video Content Advantage',
        description: 'Video posts typically get 6x more engagement than photos',
        confidence: 90,
        category: 'engagement',
        icon: '🎥'
      });
    }

    if (!context.images && !context.videos) {
      suggestions.push('Consider adding an image or video to boost engagement');
      scoreAdjustment -= 10;
      insights.push({
        id: 'no-media',
        type: 'warning',
        title: 'No Visual Content',
        description: 'Posts without media get significantly less engagement',
        action: 'Add an image or video',
        confidence: 85,
        category: 'content',
        icon: '🖼️'
      });
    }

    return { insights, suggestions, scoreAdjustment };
  }

  private analyzeTiming() {
    const insights: LIAInsight[] = [];
    const suggestions: string[] = [];
    
    const now = new Date();
    const hour = now.getHours();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;
    const bestTimes = this.knowledgeBase.get('bestTimes');
    const optimalTimes = isWeekend ? bestTimes.weekend : bestTimes.weekday;
    
    const currentTime = `${hour.toString().padStart(2, '0')}:00`;
    const isOptimalTime = optimalTimes.includes(currentTime);

    if (isOptimalTime) {
      insights.push({
        id: 'optimal-timing',
        type: 'suggestion',
        title: 'Perfect Timing',
        description: 'You\'re posting at an optimal time for engagement',
        confidence: 85,
        category: 'engagement',
        icon: '⏰'
      });
    } else {
      const nextOptimal = this.getNextOptimalTime(optimalTimes, hour);
      suggestions.push(`Consider posting at ${nextOptimal} for better reach`);
      insights.push({
        id: 'timing-optimization',
        type: 'optimization',
        title: 'Timing Suggestion',
        description: `Peak engagement times: ${optimalTimes.join(', ')}`,
        action: `Next optimal time: ${nextOptimal}`,
        confidence: 70,
        category: 'engagement',
        icon: '📅'
      });
    }

    return { insights, suggestions };
  }

  private getNextOptimalTime(optimalTimes: string[], currentHour: number): string {
    const times = optimalTimes.map(time => parseInt(time.split(':')[0]));
    const nextTime = times.find(time => time > currentHour) || times[0];
    return `${nextTime.toString().padStart(2, '0')}:00`;
  }

  private generateSmartHashtags(context: ContentContext): string[] {
    const hashtags: string[] = [];
    const hashtagData = this.knowledgeBase.get('hashtags');
    
    // Add trending hashtags
    hashtags.push(...hashtagData.trending.slice(0, 3));
    
    // Add engagement hashtags
    hashtags.push(...hashtagData.engagement.slice(0, 2));
    
    // Add niche-specific hashtags based on content
    if (context.text) {
      const text = context.text.toLowerCase();
      Object.entries(hashtagData.niche).forEach(([category, tags]: [string, any]) => {
        if (text.includes(category)) {
          hashtags.push(...(tags as string[]).slice(0, 2));
        }
      });
    }

    // Add growth hashtags
    hashtags.push(...hashtagData.growth.slice(0, 2));

    return [...new Set(hashtags)].slice(0, 8); // Remove duplicates and limit
  }

  private detectTrends(context: ContentContext): string[] {
    if (!context.text) return [];
    
    const text = context.text.toLowerCase();
    return this.trendData.filter(trend => 
      text.includes(trend.toLowerCase()) || 
      trend.split(' ').some(word => text.includes(word))
    ).slice(0, 3);
  }

  private analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    if (!text) return 'neutral';
    
    const positiveWords = ['love', 'amazing', 'great', 'awesome', 'beautiful', 'happy', 'excited', 'wonderful'];
    const negativeWords = ['hate', 'terrible', 'awful', 'sad', 'angry', 'disappointed', 'frustrated'];
    
    const words = text.toLowerCase().split(/\s+/);
    const positiveScore = words.filter(word => positiveWords.includes(word)).length;
    const negativeScore = words.filter(word => negativeWords.includes(word)).length;
    
    if (positiveScore > negativeScore) return 'positive';
    if (negativeScore > positiveScore) return 'negative';
    return 'neutral';
  }

  private predictEngagement(context: ContentContext, baseScore: number): number {
    let prediction = baseScore;
    
    // Adjust based on media presence
    if (context.images) prediction += 15;
    if (context.videos) prediction += 25;
    
    // Adjust based on text engagement factors
    if (context.text) {
      if (context.text.includes('?')) prediction += 10;
      if (context.text.length > 50 && context.text.length < 200) prediction += 5;
    }
    
    // Random factor for realistic prediction
    prediction += Math.random() * 10 - 5;
    
    return Math.min(Math.max(prediction, 0), 100);
  }

  async getQuickActions(context: ContentContext): Promise<string[]> {
    const actions = [
      "🎯 Optimize for engagement",
      "📈 Add trending hashtags",
      "✨ Enhance with emojis",
      "❓ Add engaging question",
      "🔥 Boost with call-to-action",
      "📸 Suggest media improvements",
      "⏰ Recommend best posting time",
      "🎨 Style enhancement"
    ];

    // Filter based on current content
    const relevantActions = actions.filter(action => {
      if (action.includes('hashtags') && context.text?.includes('#')) return false;
      if (action.includes('question') && context.text?.includes('?')) return false;
      if (action.includes('media') && (context.images || context.videos)) return false;
      return true;
    });

    return relevantActions.slice(0, 4);
  }

  async enhanceContent(text: string, enhancementType: string): Promise<string> {
    const templates = this.knowledgeBase.get('contentTemplates');
    
    switch (enhancementType) {
      case 'motivational':
        return templates.motivational[Math.floor(Math.random() * templates.motivational.length)]
          .replace('{content}', text);
      
      case 'engaging':
        return templates.engaging[Math.floor(Math.random() * templates.engaging.length)]
          .replace('{content}', text);
      
      case 'casual':
        return templates.casual[Math.floor(Math.random() * templates.casual.length)]
          .replace('{content}', text);
      
      case 'emoji':
        return this.addEmojis(text);
      
      case 'hashtags':
        const hashtags = await this.generateSmartHashtags({ text });
        return `${text}\n\n${hashtags.map(tag => `#${tag}`).join(' ')}`;
      
      default:
        return text;
    }
  }

  private addEmojis(text: string): string {
    const emojiMap: { [key: string]: string } = {
      'love': '💜',
      'heart': '💜',
      'amazing': '✨',
      'great': '🌟',
      'beautiful': '😍',
      'happy': '😊',
      'excited': '🎉',
      'fire': '🔥',
      'awesome': '🤩',
      'perfect': '💯'
    };

    let enhancedText = text;
    Object.entries(emojiMap).forEach(([word, emoji]) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      enhancedText = enhancedText.replace(regex, `${word} ${emoji}`);
    });

    return enhancedText;
  }

  async generateCaption(context: ContentContext): Promise<string> {
    if (context.images && context.images.length > 0) {
      const captions = [
        "Capturing this beautiful moment ✨",
        "Sometimes a picture says it all 📸",
        "Sharing some good vibes with you 💜",
        "Here's what's inspiring me today 🌟",
        "Thought you'd appreciate this view 🌈"
      ];
      return captions[Math.floor(Math.random() * captions.length)];
    }

    if (context.videos && context.videos.length > 0) {
      const captions = [
        "Watch this amazing moment unfold 🎬",
        "Had to share this with you all 🎥",
        "This video made my day! 💫",
        "Some motion for your timeline ⚡",
        "Action speaks louder than words 🎭"
      ];
      return captions[Math.floor(Math.random() * captions.length)];
    }

    const genericCaptions = [
      "Sharing some thoughts with the community 💭",
      "What's on my mind today 🤔",
      "Here's something worth sharing ✨",
      "Connecting with amazing people 🌟",
      "Building community, one post at a time 💜"
    ];
    return genericCaptions[Math.floor(Math.random() * genericCaptions.length)];
  }
}

// Export singleton instance
export const liaV3 = new LocalLIAV3();

// Helper functions for AI-like processing
async function generateHashtags(text: string): Promise<string[]> {
  // Simple keyword extraction and hashtag generation
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const relevantWords = words.filter(word => word.length > 3);
  return relevantWords.slice(0, 5).map(word => `#${word}`);
}

function analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const positiveWords = ['love', 'amazing', 'great', 'awesome', 'beautiful', 'happy'];
  const negativeWords = ['hate', 'terrible', 'awful', 'sad', 'angry'];
  
  const words = text.toLowerCase().split(/\s+/);
  const positiveScore = words.filter(word => positiveWords.includes(word)).length;
  const negativeScore = words.filter(word => negativeWords.includes(word)).length;
  
  if (positiveScore > negativeScore) return 'positive';
  if (negativeScore > positiveScore) return 'negative';
  return 'neutral';
}

async function suggestCaption(context: any): Promise<string> {
  return liaV3.generateCaption(context);
}