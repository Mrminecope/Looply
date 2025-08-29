# LIA (Looply Intelligent Assistant) Integration Guide

## Overview
LIA is a lightweight, client-side AI assistant that provides content creation and discovery features for SocialFlow. It operates entirely with local TypeScript logic and requires no external APIs.

## Features Integrated

### 🎨 **Caption Generation**
- Smart caption suggestions based on content
- Multiple tone options (Trendy, Professional, Casual, Motivational, Humorous)
- Community-aware suggestions
- Maximum length control

### 🏷️ **Hashtag Suggestions**
- Context-aware hashtag recommendations
- Community-specific hashtag pools
- Trending hashtag analysis
- Popular hashtag integration

### 🔍 **Enhanced Search**
- Intelligent content ranking
- Multi-criteria filtering (type, author, community, duration)
- Relevance scoring algorithm
- Sort options (recent, trending, popular)

### 📊 **Content Analysis**
- Community summaries
- Trending hashtag detection
- Content recommendations
- User behavior insights

## Implementation Details

### Core Files Added

```
/utils/lia.ts                    # Core LIA logic and algorithms
/hooks/useLIA.ts                 # React hook wrapper for LIA functions
/components/LIAAssistButton.tsx  # UI component for content creation
/components/LIAShowcase.tsx      # Demo/showcase component
```

### Integration Points

1. **Create Post Modal** (`/components/CreatePostModal.tsx`)
   - Added LIA Assistant button
   - Caption and hashtag application
   - Enhanced user experience

2. **Search Functionality** (`/components/TopHeader.tsx` & `/components/MainApp.tsx`)
   - Integrated LIA search with existing search UI
   - Smart ranking and filtering
   - Analytics tracking

3. **Feed Enhancement** (`/components/tabs/FeedTab.tsx`)
   - Video click handling for enhanced experience
   - Better content discovery

## Usage Examples

### Basic Caption Generation
```typescript
import { useLIA } from '../hooks/useLIA';

const { generateCaptions } = useLIA();

const result = await generateCaptions({
  topic: "My weekend adventure",
  community: "Travel",
  tone: "Trendy",
  maxLen: 120
});
```

### Smart Search
```typescript
import { LIA } from '../utils/lia';

const results = LIA.search("react tutorials", posts, {
  type: 'video',
  community: 'TechTalk',
  sort: 'trending',
  limit: 10
});
```

### Hashtag Suggestions
```typescript
const { suggestHashtags } = useLIA();

const hashtags = await suggestHashtags({
  title: "Beautiful sunset photos",
  community: "Photography",
  limit: 8
});
```

## Performance Considerations

- **Client-Side Processing**: All LIA operations run locally
- **Async Simulation**: Includes loading states for better UX
- **Memory Efficient**: Algorithms optimized for mobile performance
- **Error Handling**: Comprehensive error boundaries and fallbacks

## Customization Options

### Adding New Caption Templates
Edit `/utils/lia.ts` and extend the `CAPTION_TEMPLATES` object:

```typescript
const CAPTION_TEMPLATES = {
  // ... existing templates
  Inspirational: [
    "Let {topic} be your guide ✨",
    "Find magic in {topic} 🌟"
  ]
};
```

### Community-Specific Hashtags
Update the `COMMUNITY_HASHTAGS` mapping:

```typescript
const COMMUNITY_HASHTAGS = {
  // ... existing communities
  'YourCommunity': ['#hashtag1', '#hashtag2']
};
```

### Search Algorithm Tuning
Modify scoring weights in the `search` function:

```typescript
searchTerms.forEach(term => {
  if (post.content.toLowerCase().includes(term)) score += 3; // Increase weight
  if (post.author.name.toLowerCase().includes(term)) score += 2;
  if (post.community?.toLowerCase().includes(term)) score += 1;
});
```

## Future Enhancements

- **Machine Learning Integration**: Replace rule-based algorithms with ML models
- **Real-time Collaboration**: Add collaborative filtering
- **Advanced Analytics**: Deeper user behavior analysis
- **Multi-language Support**: Internationalization for global use

## Troubleshooting

### Common Issues

1. **LIA Button Not Working**
   - Ensure content input has text
   - Check browser console for errors
   - Verify all imports are correct

2. **Search Not Returning Results**
   - Check if posts array is populated
   - Verify search query formatting
   - Review filter criteria

3. **Performance Issues**
   - Monitor memory usage with large datasets
   - Consider implementing pagination for search results
   - Add debouncing for frequent operations

## Analytics Integration

LIA automatically tracks:
- Caption generation usage
- Hashtag suggestion requests
- Search queries and results
- Feature adoption metrics

Access analytics through the existing `analyticsService`:

```typescript
// Tracking is automatic, but you can add custom events
analyticsService.track(userId, 'lia_caption_generated', {
  tone: 'Trendy',
  community: 'Travel'
});
```