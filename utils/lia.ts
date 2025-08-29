import { liaV3, type LIAAnalysis, type ContentContext, type LIAInsight } from './lia-v3-local';

export interface LIAResponse {
  success: boolean;
  data?: LIAAnalysis;
  error?: string;
  suggestions?: string[];
  quickActions?: string[];
}

export interface LIARequest {
  type: 'analyze' | 'enhance' | 'suggest' | 'caption' | 'quickActions';
  content?: string;
  context?: ContentContext;
  enhancementType?: string;
}

class LIAService {
  private isProcessing = false;
  private cache = new Map<string, LIAResponse>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async processRequest(request: LIARequest): Promise<LIAResponse> {
    // Prevent multiple simultaneous requests
    if (this.isProcessing) {
      return {
        success: false,
        error: 'LIA is currently processing another request. Please wait a moment.',
        suggestions: ['Try again in a few seconds']
      };
    }

    try {
      this.isProcessing = true;

      // Check cache for analysis requests
      const cacheKey = this.generateCacheKey(request);
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      let response: LIAResponse;

      switch (request.type) {
        case 'analyze':
          response = await this.analyzeContent(request);
          break;
        
        case 'enhance':
          response = await this.enhanceContent(request);
          break;
        
        case 'suggest':
          response = await this.generateSuggestions(request);
          break;
        
        case 'caption':
          response = await this.generateCaption(request);
          break;
        
        case 'quickActions':
          response = await this.getQuickActions(request);
          break;
        
        default:
          response = {
            success: false,
            error: 'Unknown request type',
            suggestions: ['Please try a different action']
          };
      }

      // Cache successful responses
      if (response.success && request.type === 'analyze') {
        this.setCache(cacheKey, response);
      }

      return response;

    } catch (error) {
      console.error('LIA processing error:', error);
      return {
        success: false,
        error: 'LIA encountered an unexpected error. Please try again.',
        suggestions: [
          'Check your internet connection',
          'Try refreshing the page',
          'Contact support if the issue persists'
        ]
      };
    } finally {
      this.isProcessing = false;
    }
  }

  private async analyzeContent(request: LIARequest): Promise<LIAResponse> {
    if (!request.context) {
      return {
        success: false,
        error: 'No content provided for analysis',
        suggestions: ['Please provide some content to analyze']
      };
    }

    try {
      const analysis = await liaV3.analyzeContent(request.context);
      
      return {
        success: true,
        data: analysis,
        suggestions: analysis.suggestions.slice(0, 3), // Limit to top 3 suggestions
        quickActions: await liaV3.getQuickActions(request.context)
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to analyze content',
        suggestions: ['Try simplifying your content', 'Check for any special characters']
      };
    }
  }

  private async enhanceContent(request: LIARequest): Promise<LIAResponse> {
    if (!request.content || !request.enhancementType) {
      return {
        success: false,
        error: 'Content and enhancement type required',
        suggestions: ['Please provide content to enhance']
      };
    }

    try {
      const enhanced = await liaV3.enhanceContent(request.content, request.enhancementType);
      
      return {
        success: true,
        data: {
          enhancedContent: enhanced,
          originalContent: request.content,
          enhancementType: request.enhancementType
        } as any,
        suggestions: ['Content enhanced successfully!']
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to enhance content',
        suggestions: ['Try a different enhancement type', 'Check your original content']
      };
    }
  }

  private async generateSuggestions(request: LIARequest): Promise<LIAResponse> {
    const context = request.context || {};
    
    try {
      const suggestions = [
        '💡 Add a compelling question to boost engagement',
        '📸 Include high-quality visuals for better reach',
        '🏷️ Use trending hashtags relevant to your content',
        '⏰ Post during peak hours (12pm, 5pm, or 8pm)',
        '🎯 Add a clear call-to-action',
        '✨ Use emojis to make your content more expressive',
        '🤝 Tag relevant users to increase visibility',
        '📊 Share behind-the-scenes content for authenticity'
      ];

      // Filter suggestions based on context
      const relevantSuggestions = suggestions.filter(suggestion => {
        if (suggestion.includes('question') && context.text?.includes('?')) return false;
        if (suggestion.includes('hashtags') && context.text?.includes('#')) return false;
        if (suggestion.includes('visuals') && (context.images || context.videos)) return false;
        return true;
      });

      return {
        success: true,
        suggestions: relevantSuggestions.slice(0, 4),
        quickActions: await liaV3.getQuickActions(context)
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to generate suggestions',
        suggestions: ['Try providing more context about your content']
      };
    }
  }

  private async generateCaption(request: LIARequest): Promise<LIAResponse> {
    const context = request.context || {};
    
    try {
      const caption = await liaV3.generateCaption(context);
      
      return {
        success: true,
        data: { caption } as any,
        suggestions: ['Caption generated successfully!', 'Feel free to customize it further']
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to generate caption',
        suggestions: ['Try providing more context', 'Add some media to your post']
      };
    }
  }

  private async getQuickActions(request: LIARequest): Promise<LIAResponse> {
    const context = request.context || {};
    
    try {
      const quickActions = await liaV3.getQuickActions(context);
      
      return {
        success: true,
        quickActions,
        suggestions: ['Select an action to enhance your content']
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get quick actions',
        suggestions: ['Try refreshing and trying again']
      };
    }
  }

  private generateCacheKey(request: LIARequest): string {
    return `lia_${request.type}_${JSON.stringify(request.context || {}).substring(0, 100)}`;
  }

  private getFromCache(key: string): LIAResponse | null {
    const cached = this.cache.get(key);
    if (cached && cached.timestamp && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return { ...cached, timestamp: undefined };
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, response: LIAResponse): void {
    this.cache.set(key, { ...response, timestamp: Date.now() } as any);
    
    // Clean old cache entries periodically
    if (this.cache.size > 50) {
      const oldEntries = Array.from(this.cache.entries())
        .filter(([_, value]) => Date.now() - (value as any).timestamp > this.CACHE_DURATION)
        .map(([key]) => key);
      
      oldEntries.forEach(key => this.cache.delete(key));
    }
  }

  // Health check for the local LIA system
  async healthCheck(): Promise<boolean> {
    try {
      const testResponse = await this.processRequest({
        type: 'suggest',
        context: { text: 'test' }
      });
      return testResponse.success;
    } catch {
      return false;
    }
  }

  // Get LIA status
  getStatus(): { 
    isHealthy: boolean; 
    isProcessing: boolean; 
    cacheSize: number;
    version: string;
  } {
    return {
      isHealthy: true, // Always healthy for local system
      isProcessing: this.isProcessing,
      cacheSize: this.cache.size,
      version: 'v3.0.0-local'
    };
  }

  // Clear cache manually
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const liaService = new LIAService();

// Export helper functions for backward compatibility
export async function analyzeLIAContent(content: string, context?: any): Promise<LIAResponse> {
  return liaService.processRequest({
    type: 'analyze',
    content,
    context: { text: content, ...context }
  });
}

export async function enhanceLIAContent(content: string, type: string): Promise<LIAResponse> {
  return liaService.processRequest({
    type: 'enhance',
    content,
    enhancementType: type
  });
}

export async function getLIASuggestions(context?: any): Promise<LIAResponse> {
  return liaService.processRequest({
    type: 'suggest',
    context
  });
}

export async function generateLIACaption(context?: any): Promise<LIAResponse> {
  return liaService.processRequest({
    type: 'caption',
    context
  });
}

// Voice input processing (browser-based)
export async function processVoiceInput(audioBlob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      reject(new Error('Speech recognition not supported'));
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      resolve(transcript);
    };

    recognition.onerror = (event: any) => {
      reject(new Error(`Speech recognition error: ${event.error}`));
    };

    recognition.start();
  });
}

// Smart content categorization
export function categorizeContent(text: string): string[] {
  const categories = {
    'lifestyle': ['life', 'daily', 'routine', 'lifestyle', 'personal'],
    'motivation': ['inspire', 'motivate', 'goal', 'dream', 'success', 'achieve'],
    'technology': ['tech', 'ai', 'digital', 'innovation', 'software', 'app'],
    'entertainment': ['fun', 'funny', 'movie', 'music', 'game', 'entertainment'],
    'education': ['learn', 'study', 'education', 'knowledge', 'skill', 'course'],
    'health': ['health', 'fitness', 'workout', 'nutrition', 'wellness', 'mental'],
    'travel': ['travel', 'vacation', 'adventure', 'explore', 'journey', 'destination'],
    'food': ['food', 'recipe', 'cooking', 'restaurant', 'delicious', 'taste']
  };

  const lowerText = text.toLowerCase();
  const matchedCategories: string[] = [];

  Object.entries(categories).forEach(([category, keywords]) => {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      matchedCategories.push(category);
    }
  });

  return matchedCategories.length > 0 ? matchedCategories : ['general'];
}

// Export types for use in components
export type { LIAResponse, LIARequest, LIAAnalysis, LIAInsight, ContentContext };