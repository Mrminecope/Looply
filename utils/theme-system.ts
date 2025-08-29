// Advanced Theme System - Multiple themes and customization options
export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  category: 'light' | 'dark' | 'colorful' | 'minimal';
  colors: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
    muted: string;
    destructive: string;
    border: string;
    ring: string;
    card: string;
  };
  fontFamily?: string;
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  preview: string; // CSS gradient for preview
}

export interface CustomTheme extends ThemePreset {
  isCustom: true;
  createdAt: string;
}

class ThemeSystem {
  private readonly STORAGE_KEY = 'social-app-theme-settings';
  private currentTheme: ThemePreset | null = null;

  // Predefined theme presets
  private readonly presets: ThemePreset[] = [
    {
      id: 'default-light',
      name: 'Default Light',
      description: 'Clean and professional light theme',
      category: 'light',
      colors: {
        background: '#ffffff',
        foreground: 'oklch(0.145 0 0)',
        primary: '#030213',
        secondary: 'oklch(0.95 0.0058 264.53)',
        accent: '#e9ebef',
        muted: '#ececf0',
        destructive: '#d4183d',
        border: 'rgba(0, 0, 0, 0.1)',
        ring: 'oklch(0.708 0 0)',
        card: '#ffffff'
      },
      borderRadius: 'lg',
      preview: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
    },
    {
      id: 'default-dark',
      name: 'Default Dark',
      description: 'Sleek and modern dark theme',
      category: 'dark',
      colors: {
        background: 'oklch(0.145 0 0)',
        foreground: 'oklch(0.985 0 0)',
        primary: 'oklch(0.985 0 0)',
        secondary: 'oklch(0.269 0 0)',
        accent: 'oklch(0.269 0 0)',
        muted: 'oklch(0.269 0 0)',
        destructive: 'oklch(0.396 0.141 25.723)',
        border: 'oklch(0.269 0 0)',
        ring: 'oklch(0.439 0 0)',
        card: 'oklch(0.145 0 0)'
      },
      borderRadius: 'lg',
      preview: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
    },
    {
      id: 'ocean-blue',
      name: 'Ocean Blue',
      description: 'Calm and professional blue theme',
      category: 'colorful',
      colors: {
        background: '#f8fafc',
        foreground: '#0f172a',
        primary: '#0ea5e9',
        secondary: '#e0f2fe',
        accent: '#bae6fd',
        muted: '#f1f5f9',
        destructive: '#ef4444',
        border: 'rgba(14, 165, 233, 0.2)',
        ring: '#0ea5e9',
        card: '#ffffff'
      },
      borderRadius: 'md',
      preview: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)'
    },
    {
      id: 'forest-green',
      name: 'Forest Green',
      description: 'Natural and calming green theme',
      category: 'colorful',
      colors: {
        background: '#f7fdf7',
        foreground: '#14532d',
        primary: '#16a34a',
        secondary: '#dcfce7',
        accent: '#bbf7d0',
        muted: '#f3f4f6',
        destructive: '#dc2626',
        border: 'rgba(22, 163, 74, 0.2)',
        ring: '#16a34a',
        card: '#ffffff'
      },
      borderRadius: 'lg',
      preview: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)'
    },
    {
      id: 'sunset-orange',
      name: 'Sunset Orange',
      description: 'Warm and energetic orange theme',
      category: 'colorful',
      colors: {
        background: '#fffbeb',
        foreground: '#7c2d12',
        primary: '#ea580c',
        secondary: '#fed7aa',
        accent: '#fdba74',
        muted: '#fef3e2',
        destructive: '#dc2626',
        border: 'rgba(234, 88, 12, 0.2)',
        ring: '#ea580c',
        card: '#ffffff'
      },
      borderRadius: 'xl',
      preview: 'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)'
    },
    {
      id: 'purple-haze',
      name: 'Purple Haze',
      description: 'Creative and vibrant purple theme',
      category: 'colorful',
      colors: {
        background: '#faf5ff',
        foreground: '#581c87',
        primary: '#9333ea',
        secondary: '#e9d5ff',
        accent: '#c4b5fd',
        muted: '#f3f4f6',
        destructive: '#dc2626',
        border: 'rgba(147, 51, 234, 0.2)',
        ring: '#9333ea',
        card: '#ffffff'
      },
      borderRadius: 'md',
      preview: 'linear-gradient(135deg, #9333ea 0%, #a855f7 100%)'
    },
    {
      id: 'rose-gold',
      name: 'Rose Gold',
      description: 'Elegant and sophisticated rose theme',
      category: 'colorful',
      colors: {
        background: '#fdf2f8',
        foreground: '#881337',
        primary: '#e11d48',
        secondary: '#fce7f3',
        accent: '#fbcfe8',
        muted: '#f9fafb',
        destructive: '#dc2626',
        border: 'rgba(225, 29, 72, 0.2)',
        ring: '#e11d48',
        card: '#ffffff'
      },
      borderRadius: 'lg',
      preview: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)'
    },
    {
      id: 'midnight-dark',
      name: 'Midnight',
      description: 'Deep and immersive dark theme',
      category: 'dark',
      colors: {
        background: '#0c0a09',
        foreground: '#fafaf9',
        primary: '#f59e0b',
        secondary: '#1c1917',
        accent: '#292524',
        muted: '#1c1917',
        destructive: '#ef4444',
        border: '#292524',
        ring: '#f59e0b',
        card: '#0c0a09'
      },
      borderRadius: 'sm',
      preview: 'linear-gradient(135deg, #0c0a09 0%, #1c1917 100%)'
    },
    {
      id: 'minimal-mono',
      name: 'Minimal Mono',
      description: 'Ultra-clean monochrome design',
      category: 'minimal',
      colors: {
        background: '#ffffff',
        foreground: '#000000',
        primary: '#000000',
        secondary: '#f5f5f5',
        accent: '#e5e5e5',
        muted: '#f5f5f5',
        destructive: '#dc2626',
        border: '#e5e5e5',
        ring: '#000000',
        card: '#ffffff'
      },
      borderRadius: 'none',
      preview: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)'
    },
    {
      id: 'cyberpunk',
      name: 'Cyberpunk',
      description: 'Futuristic neon-inspired theme',
      category: 'dark',
      colors: {
        background: '#0a0a0a',
        foreground: '#00ff41',
        primary: '#ff0080',
        secondary: '#1a1a2e',
        accent: '#16213e',
        muted: '#0f3460',
        destructive: '#ff0040',
        border: '#00ff41',
        ring: '#ff0080',
        card: '#0f0f23'
      },
      borderRadius: 'sm',
      preview: 'linear-gradient(135deg, #ff0080 0%, #00ff41 100%)'
    }
  ];

  // Apply theme to document
  applyTheme(theme: ThemePreset): void {
    const root = document.documentElement;
    
    // Apply color variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--${cssVar}`, value);
      
      // Also set the theme-specific versions
      root.style.setProperty(`--color-${cssVar}`, value);
    });

    // Apply border radius
    if (theme.borderRadius) {
      const radiusValues = {
        none: '0px',
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.625rem',
        xl: '0.75rem'
      };
      root.style.setProperty('--radius', radiusValues[theme.borderRadius]);
    }

    // Apply font family if specified
    if (theme.fontFamily) {
      root.style.setProperty('--font-family', theme.fontFamily);
    }

    // Store current theme
    this.currentTheme = theme;
    this.saveThemeSettings({ currentTheme: theme.id });
  }

  // Get all available themes
  getAllThemes(): ThemePreset[] {
    const customThemes = this.getCustomThemes();
    return [...this.presets, ...customThemes];
  }

  // Get themes by category
  getThemesByCategory(category: ThemePreset['category']): ThemePreset[] {
    return this.getAllThemes().filter(theme => theme.category === category);
  }

  // Get theme by ID
  getThemeById(id: string): ThemePreset | null {
    return this.getAllThemes().find(theme => theme.id === id) || null;
  }

  // Create custom theme
  createCustomTheme(
    name: string,
    description: string,
    colors: ThemePreset['colors'],
    category: ThemePreset['category'] = 'colorful',
    borderRadius: ThemePreset['borderRadius'] = 'lg'
  ): CustomTheme {
    const customTheme: CustomTheme = {
      id: `custom-${Date.now()}`,
      name,
      description,
      category,
      colors,
      borderRadius,
      preview: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    this.saveCustomTheme(customTheme);
    return customTheme;
  }

  // Save custom theme
  private saveCustomTheme(theme: CustomTheme): void {
    const customThemes = this.getCustomThemes();
    customThemes.push(theme);
    localStorage.setItem(`${this.STORAGE_KEY}-custom`, JSON.stringify(customThemes));
  }

  // Get custom themes
  getCustomThemes(): CustomTheme[] {
    try {
      const stored = localStorage.getItem(`${this.STORAGE_KEY}-custom`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Delete custom theme
  deleteCustomTheme(themeId: string): void {
    const customThemes = this.getCustomThemes();
    const filtered = customThemes.filter(theme => theme.id !== themeId);
    localStorage.setItem(`${this.STORAGE_KEY}-custom`, JSON.stringify(filtered));
  }

  // Initialize theme system
  initialize(): void {
    const settings = this.getThemeSettings();
    
    if (settings.currentTheme) {
      const theme = this.getThemeById(settings.currentTheme);
      if (theme) {
        this.applyTheme(theme);
        return;
      }
    }

    // Apply default theme based on system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const defaultTheme = this.getThemeById(prefersDark ? 'default-dark' : 'default-light');
    if (defaultTheme) {
      this.applyTheme(defaultTheme);
    }
  }

  // Get current theme
  getCurrentTheme(): ThemePreset | null {
    return this.currentTheme;
  }

  // Save theme settings
  private saveThemeSettings(settings: any): void {
    try {
      const existing = this.getThemeSettings();
      const updated = { ...existing, ...settings };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save theme settings:', error);
    }
  }

  // Get theme settings
  private getThemeSettings(): any {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  // Generate theme from primary color
  generateThemeFromColor(
    primaryColor: string,
    name: string = 'Custom Theme',
    isDark: boolean = false
  ): ThemePreset {
    // Helper function to convert hex to oklch (simplified)
    const hexToOklch = (hex: string, lightness: number = 0.5): string => {
      // This is a simplified conversion - in production you'd use a proper color library
      return `oklch(${lightness} 0.1 ${Math.random() * 360})`;
    };

    // Generate complementary colors based on primary
    const baseColors = isDark ? {
      background: '#0a0a0a',
      foreground: '#fafafa',
      card: '#141414'
    } : {
      background: '#ffffff',
      foreground: '#0a0a0a',
      card: '#ffffff'
    };

    return {
      id: `generated-${Date.now()}`,
      name,
      description: `Generated theme based on ${primaryColor}`,
      category: isDark ? 'dark' : 'colorful',
      colors: {
        ...baseColors,
        primary: primaryColor,
        secondary: isDark ? '#2a2a2a' : '#f5f5f5',
        accent: isDark ? '#3a3a3a' : '#e5e5e5',
        muted: isDark ? '#2a2a2a' : '#f9f9f9',
        destructive: '#ef4444',
        border: isDark ? '#3a3a3a' : 'rgba(0,0,0,0.1)',
        ring: primaryColor
      },
      borderRadius: 'lg',
      preview: `linear-gradient(135deg, ${primaryColor} 0%, ${isDark ? '#2a2a2a' : '#f5f5f5'} 100%)`
    };
  }

  // Export current theme
  exportTheme(): string {
    if (!this.currentTheme) {
      throw new Error('No theme currently active');
    }

    return JSON.stringify({
      ...this.currentTheme,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    }, null, 2);
  }

  // Import theme
  importTheme(themeJson: string): ThemePreset {
    try {
      const theme = JSON.parse(themeJson);
      
      // Validate theme structure
      if (!theme.name || !theme.colors || !theme.id) {
        throw new Error('Invalid theme format');
      }

      // Create as custom theme
      const customTheme: CustomTheme = {
        ...theme,
        id: `imported-${Date.now()}`,
        isCustom: true,
        createdAt: new Date().toISOString()
      };

      this.saveCustomTheme(customTheme);
      return customTheme;
    } catch (error) {
      throw new Error('Failed to import theme: Invalid JSON or format');
    }
  }

  // Get system color scheme preference
  getSystemPreference(): 'light' | 'dark' {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // Listen for system theme changes
  onSystemThemeChange(callback: (isDark: boolean) => void): () => void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => callback(e.matches);
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }

  // Reset to default theme
  resetToDefault(): void {
    const systemPreference = this.getSystemPreference();
    const defaultTheme = this.getThemeById(systemPreference === 'dark' ? 'default-dark' : 'default-light');
    
    if (defaultTheme) {
      this.applyTheme(defaultTheme);
    }
  }
}

// Export singleton instance
export const themeSystem = new ThemeSystem();

// Initialize theme system on import
if (typeof window !== 'undefined') {
  themeSystem.initialize();
}