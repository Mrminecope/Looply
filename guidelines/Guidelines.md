# Looply Social Media App Guidelines

## General Design System Rules

### Core Principles
* **Mobile-First**: Always design and develop for mobile devices first, then enhance for larger screens
* **Performance**: Prioritize loading speed and smooth animations, especially for video content
* **Accessibility**: Ensure all interactive elements meet WCAG 2.1 AA standards
* **Consistency**: Maintain visual and behavioral consistency across all features

### Layout Guidelines
* Use flexbox and grid for responsive layouts - avoid absolute positioning unless necessary
* Maintain minimum touch target sizes of 44px for mobile interaction
* Preserve safe area insets for iOS devices
* Keep content within readable widths (max 640px for text-heavy sections)

### Animation Standards
* Use the defined cubic-bezier timing functions from globals.css for consistent motion
* Respect `prefers-reduced-motion` for accessibility
* Keep animations under 300ms for UI feedback, longer for transitions
* Use `will-change` property sparingly and remove after animations complete

---

## Looply Brand Standards

### Color Palette
* **Primary**: Purple gradient (#7c3aed) - Use for CTAs, highlights, and brand elements
* **Secondary**: Pink accent (#ec4899) - Use for reactions, notifications, and energy
* **Success**: Emerald (#10b981) - Use for confirmations and positive feedback
* **Warning**: Amber (#f59e0b) - Use for cautions and attention-grabbing elements
* **Error**: Red (#ef4444) - Use for errors and destructive actions

### Typography Hierarchy
* **Headlines (h1)**: 1.75rem, weight 700 - Use for page titles and main headings
* **Subheadings (h2)**: 1.5rem, weight 600 - Use for section headers
* **Body Text (p)**: 1rem, weight 400 - Use for content and descriptions
* **Labels**: 0.875rem, weight 500 - Use for form labels and metadata
* **Buttons**: 0.875rem, weight 500 - Use for all interactive buttons

### Component Standards

#### Buttons
* **Primary Button**: Purple gradient background, white text, 44px min height for mobile
* **Secondary Button**: Outline style with purple border, purple text on white background
* **Ghost Button**: Text-only with purple text, minimal visual weight
* **Destructive Button**: Red background for delete/remove actions

#### Cards
* Use the `.looply-card` class for consistent styling
* Apply hover effects with subtle elevation changes
* Include proper border radius (0.75rem default) for modern feel
* Add subtle shadows with purple tint for brand consistency

#### Forms
* Input fields should have 16px font-size on mobile to prevent zoom
* Use purple focus states with soft glow effects
* Provide clear error states with red accents
* Include proper label-input relationships for accessibility

#### Navigation
* Bottom navigation fixed on mobile with safe area padding
* Top header should be minimal and focused
* Use purple active states for current page/tab
* Ensure navigation persists across tab switches

---

## Content Guidelines

### Posts & Media
* Support multiple media types: images, videos, text posts
* Optimize images and videos for mobile viewing
* Use lazy loading for performance on long feeds
* Implement proper aspect ratios for consistent layout

### Video/Reels
* Default to portrait orientation for mobile-first experience
* Include proper video controls with purple-themed styling
* Implement smooth swipe gestures for navigation
* Auto-play with user control options

### User Interactions
* Provide immediate visual feedback for all actions (likes, comments, shares)
* Use the reaction animation classes for engagement feedback
* Include haptic feedback where supported
* Show loading states during async operations

---

## Technical Requirements

### Performance Standards
* Initial page load under 2 seconds on 3G networks
* Smooth 60fps animations and scrolling
* Efficient memory usage with content virtualization for long lists
* Progressive loading of images and videos

### Browser Support
* Modern browsers (Chrome 90+, Safari 14+, Firefox 88+)
* iOS Safari and Android Chrome optimized
* Progressive enhancement for older browsers
* Service worker support for offline functionality

### Accessibility Requirements
* Keyboard navigation for all interactive elements
* Screen reader compatibility with proper ARIA labels
* High contrast mode support
* Focus management for modal dialogs and navigation

### Code Standards
* Use TypeScript for type safety
* Implement proper error boundaries
* Follow React best practices with hooks and context
* Use the custom hooks provided for consistent behavior
* Implement proper loading and error states for all async operations

---

## Content Moderation & Safety

### User Safety
* Include report and block functionality for all content
* Implement content filtering for inappropriate material
* Provide clear community guidelines
* Support multiple reporting categories

### Data Privacy
* Minimize data collection to essential features only
* Provide clear data export functionality
* Support account deletion with data removal
* Use local storage where possible to reduce server dependencies

---

## Platform-Specific Considerations

### iOS
* Use safe area insets for notch/island devices
* Implement proper viewport meta tags
* Support iOS share sheet integration
* Optimize for Safari's specific behaviors

### Android
* Support system navigation gestures
* Implement Android-style share intents
* Optimize for Chrome's PWA features
* Handle various screen densities properly

### PWA Features
* Implement service worker for offline functionality
* Add to home screen capabilities
* Push notification support where appropriate
* App-like navigation and behavior