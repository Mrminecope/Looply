# Looply LIA — Drop-in Assistant (Client-side, Zero-dep)

This bundle adds a lightweight **Looply Intelligent Assistant (LIA)** to your app with:
- Caption ideas
- Hashtag suggestions
- Simple search (ranking) helpers
- Community summaries

All logic is **pure TypeScript**, zero external dependencies.

## Files
- `src/utils/lia.ts` — core functions (captions, hashtags, search, summarize)
- `src/hooks/useLIA.ts` — React hook wrapper
- `src/components/LIAAssistButton.tsx` — UI button to generate captions/hashtags

## Integrate
Add the button to your composer UI:
```tsx
import LIAAssistButton from './src/components/LIAAssistButton';

<LIAAssistButton
  draftText={content}
  community={selectedCommunity}
  transcript={videoTranscript}
  thumbTags={detectedTags}
  onApply={(caption, hashtags) => {
    setContent(caption + (hashtags.length ? "\n\n" + hashtags.join(" ") : ""));
  }}
/>
```

When ready for server models, replace `utils/lia.ts` internals with API calls; keep the same function signatures so the UI doesn't change.