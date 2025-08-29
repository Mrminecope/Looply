// Futuristic Theme System - Production-ready themes with neon accents and glassmorphism
import { themeSystem, type ThemePreset } from './theme-system';

export interface FuturisticTheme extends ThemePreset {
  effects: {
    glassmorphism: boolean;
    neonGlow: boolean;
    gradientText: boolean;
    particleBackground: boolean;
    holographicCard: boolean;
  };
  animations: {
    floatingElements: boolean;
    pulseEffects: boolean;
    smoothTransitions: boolean;
    hoverGlow: boolean;
  };
  typography: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

class FuturisticThemeSystem {
  private readonly futuristicPresets: FuturisticTheme[] = [
    {
      id: 'looply-neon',
      name: 'Looply Neon',
      description: 'Signature futuristic theme with electric neon accents',
      category: 'dark',
      colors: {
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a0a1f 50%, #0f0a1a 100%)',
        foreground: '#ffffff',
        primary: '#00ff88',
        secondary: '#1a1a2e',
        accent: '#ff0080',
        muted: '#16213e',
        destructive: '#ff0040',
        border: 'rgba(0, 255, 136, 0.3)',
        ring: '#00ff88',
        card: 'rgba(26, 26, 46, 0.7)'
      },
      borderRadius: 'lg',
      preview: 'linear-gradient(135deg, #00ff88 0%, #ff0080 100%)',
      effects: {
        glassmorphism: true,
        neonGlow: true,
        gradientText: true,
        particleBackground: true,
        holographicCard: true
      },
      animations: {
        floatingElements: true,
        pulseEffects: true,
        smoothTransitions: true,
        hoverGlow: true
      },
      typography: {
        primary: 'Orbitron, system-ui, sans-serif',
        secondary: 'Exo 2, system-ui, sans-serif',
        accent: 'Space Mono, monospace'
      }
    },
    {
      id: 'cyber-purple',
      name: 'Cyber Purple',
      description: 'Deep purple cyberpunk aesthetic with electric accents',
      category: 'dark',
      colors: {
        background: 'linear-gradient(135deg, #0d0221 0%, #1a0b3d 50%, #2d1b69 100%)',
        foreground: '#e0e0ff',
        primary: '#8b5cf6',
        secondary: '#2d1b69',
        accent: '#06ffa5',
        muted: '#1e1b4b',
        destructive: '#ff073a',
        border: 'rgba(139, 92, 246, 0.4)',
        ring: '#8b5cf6',
        card: 'rgba(45, 27, 105, 0.6)'
      },
      borderRadius: 'xl',
      preview: 'linear-gradient(135deg, #8b5cf6 0%, #06ffa5 100%)',
      effects: {
        glassmorphism: true,
        neonGlow: true,
        gradientText: true,
        particleBackground: false,
        holographicCard: true
      },
      animations: {
        floatingElements: true,
        pulseEffects: true,
        smoothTransitions: true,
        hoverGlow: true
      },
      typography: {
        primary: 'Exo 2, system-ui, sans-serif',
        secondary: 'JetBrains Mono, monospace',
        accent: 'Orbitron, system-ui, sans-serif'
      }
    },
    {
      id: 'matrix-green',
      name: 'Matrix Code',
      description: 'Classic matrix green with digital rain effects',
      category: 'dark',
      colors: {
        background: 'linear-gradient(135deg, #000000 0%, #0d1421 50%, #001100 100%)',
        foreground: '#00ff41',
        primary: '#00ff41',
        secondary: '#001a00',
        accent: '#39ff14',
        muted: '#0d3320',
        destructive: '#ff073a',
        border: 'rgba(0, 255, 65, 0.3)',
        ring: '#00ff41',
        card: 'rgba(0, 26, 0, 0.8)'
      },
      borderRadius: 'sm',
      preview: 'linear-gradient(135deg, #00ff41 0%, #39ff14 100%)',
      effects: {
        glassmorphism: false,
        neonGlow: true,
        gradientText: false,
        particleBackground: true,
        holographicCard: false
      },
      animations: {
        floatingElements: false,
        pulseEffects: true,
        smoothTransitions: true,
        hoverGlow: true
      },
      typography: {
        primary: 'Share Tech Mono, monospace',
        secondary: 'JetBrains Mono, monospace',
        accent: 'Orbitron, system-ui, sans-serif'
      }
    },
    {
      id: 'synthwave-sunset',
      name: 'Synthwave Sunset',
      description: 'Retro-futuristic 80s inspired theme',
      category: 'dark',
      colors: {
        background: 'linear-gradient(135deg, #0f0728 0%, #1e0a3e 50%, #2d1b69 100%)',
        foreground: '#ffffff',
        primary: '#ff006e',
        secondary: '#2d1b69',
        accent: '#ffbe0b',
        muted: '#1e0a3e',
        destructive: '#ff073a',
        border: 'rgba(255, 0, 110, 0.4)',
        ring: '#ff006e',
        card: 'rgba(30, 10, 62, 0.7)'
      },
      borderRadius: 'md',
      preview: 'linear-gradient(135deg, #ff006e 0%, #ffbe0b 100%)',
      effects: {
        glassmorphism: true,
        neonGlow: true,
        gradientText: true,
        particleBackground: false,
        holographicCard: true
      },
      animations: {
        floatingElements: true,
        pulseEffects: true,
        smoothTransitions: true,
        hoverGlow: true
      },
      typography: {
        primary: 'Orbitron, system-ui, sans-serif',
        secondary: 'Exo 2, system-ui, sans-serif',
        accent: 'Space Mono, monospace'
      }
    },
    {
      id: 'holographic-blue',
      name: 'Holographic Blue',
      description: 'Premium holographic theme with blue iridescence',
      category: 'dark',
      colors: {
        background: 'linear-gradient(135deg, #0a0f1c 0%, #1a1f3a 50%, #0f1419 100%)',
        foreground: '#ffffff',
        primary: '#00d4ff',
        secondary: '#1a1f3a',
        accent: '#7c3aed',
        muted: '#1e2238',
        destructive: '#ff073a',
        border: 'rgba(0, 212, 255, 0.3)',
        ring: '#00d4ff',
        card: 'rgba(26, 31, 58, 0.6)'
      },
      borderRadius: 'xl',
      preview: 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)',
      effects: {
        glassmorphism: true,
        neonGlow: true,
        gradientText: true,
        particleBackground: false,
        holographicCard: true
      },
      animations: {
        floatingElements: true,
        pulseEffects: true,
        smoothTransitions: true,
        hoverGlow: true
      },
      typography: {
        primary: 'Inter, system-ui, sans-serif',
        secondary: 'JetBrains Mono, monospace',
        accent: 'Orbitron, system-ui, sans-serif'
      }
    },
    {
      id: 'neural-network',
      name: 'Neural Network',
      description: 'AI-inspired theme with neural connections',
      category: 'dark',
      colors: {
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
        foreground: '#ffffff',
        primary: '#0ea5e9',
        secondary: '#1a1a2e',
        accent: '#10b981',
        muted: '#16213e',
        destructive: '#ef4444',
        border: 'rgba(14, 165, 233, 0.4)',
        ring: '#0ea5e9',
        card: 'rgba(26, 26, 46, 0.8)'
      },
      borderRadius: 'lg',
      preview: 'linear-gradient(135deg, #0ea5e9 0%, #10b981 100%)',
      effects: {
        glassmorphism: true,
        neonGlow: false,
        gradientText: true,
        particleBackground: true,
        holographicCard: false
      },
      animations: {
        floatingElements: true,
        pulseEffects: false,
        smoothTransitions: true,
        hoverGlow: false
      },
      typography: {
        primary: 'Inter, system-ui, sans-serif',
        secondary: 'Roboto Mono, monospace',
        accent: 'Exo 2, system-ui, sans-serif'
      }
    }
  ];

  // Apply futuristic theme with effects
  applyFuturisticTheme(theme: FuturisticTheme): void {
    const root = document.documentElement;
    
    // Apply base colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--${cssVar}`, value);
      root.style.setProperty(`--color-${cssVar}`, value);
    });

    // Apply typography
    root.style.setProperty('--font-primary', theme.typography.primary);
    root.style.setProperty('--font-secondary', theme.typography.secondary);
    root.style.setProperty('--font-accent', theme.typography.accent);

    // Apply border radius
    if (theme.borderRadius) {
      const radiusValues = {
        none: '0px',
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem'
      };
      root.style.setProperty('--radius', radiusValues[theme.borderRadius]);
    }

    // Apply effects classes
    const body = document.body;
    
    // Remove existing effect classes
    body.classList.remove(
      'glassmorphism', 'neon-glow', 'gradient-text', 
      'particle-bg', 'holographic', 'floating-elements',
      'pulse-effects', 'smooth-transitions', 'hover-glow'
    );

    // Add new effect classes
    if (theme.effects.glassmorphism) body.classList.add('glassmorphism');
    if (theme.effects.neonGlow) body.classList.add('neon-glow');
    if (theme.effects.gradientText) body.classList.add('gradient-text');
    if (theme.effects.particleBackground) body.classList.add('particle-bg');
    if (theme.effects.holographicCard) body.classList.add('holographic');
    
    if (theme.animations.floatingElements) body.classList.add('floating-elements');
    if (theme.animations.pulseEffects) body.classList.add('pulse-effects');
    if (theme.animations.smoothTransitions) body.classList.add('smooth-transitions');
    if (theme.animations.hoverGlow) body.classList.add('hover-glow');

    // Store current theme
    localStorage.setItem('futuristic-theme', JSON.stringify(theme));
  }

  // Get all futuristic themes
  getFuturisticThemes(): FuturisticTheme[] {
    return this.futuristicPresets;
  }

  // Get theme by ID
  getFuturisticThemeById(id: string): FuturisticTheme | null {
    return this.futuristicPresets.find(theme => theme.id === id) || null;
  }

  // Initialize with default futuristic theme
  initialize(): void {
    const savedTheme = localStorage.getItem('futuristic-theme');
    if (savedTheme) {
      try {
        const theme = JSON.parse(savedTheme) as FuturisticTheme;
        this.applyFuturisticTheme(theme);
      } catch {
        // Fall back to default
        this.applyFuturisticTheme(this.futuristicPresets[0]);
      }
    } else {
      // Apply default Looply Neon theme
      this.applyFuturisticTheme(this.futuristicPresets[0]);
    }
  }

  // Generate CSS for theme effects
  generateThemeCSS(theme: FuturisticTheme): string {
    return `
      /* Futuristic Theme: ${theme.name} */
      
      /* Glassmorphism Effects */
      .glassmorphism .glass-card {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
      }
      
      /* Neon Glow Effects */
      .neon-glow .neon-element {
        text-shadow: 0 0 5px currentColor, 0 0 10px currentColor, 0 0 20px currentColor;
        filter: drop-shadow(0 0 10px currentColor);
      }
      
      .neon-glow .neon-border {
        box-shadow: 
          0 0 5px var(--primary),
          0 0 10px var(--primary),
          0 0 20px var(--primary),
          inset 0 0 5px var(--primary);
      }
      
      /* Gradient Text */
      .gradient-text .gradient-heading {
        background: linear-gradient(135deg, var(--primary), var(--accent));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      /* Holographic Cards */
      .holographic .holo-card {
        background: linear-gradient(135deg, 
          rgba(255,255,255,0.1) 0%, 
          rgba(255,255,255,0.05) 50%, 
          rgba(255,255,255,0.1) 100%);
        position: relative;
        overflow: hidden;
      }
      
      .holographic .holo-card::before {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: linear-gradient(45deg, var(--primary), var(--accent), var(--primary));
        border-radius: inherit;
        z-index: -1;
        opacity: 0.7;
        filter: blur(1px);
      }
      
      /* Smooth Transitions */
      .smooth-transitions * {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      /* Hover Glow */
      .hover-glow .glow-on-hover:hover {
        box-shadow: 0 0 20px var(--primary);
        transform: translateY(-2px);
      }
      
      /* Floating Elements */
      .floating-elements .float-element {
        animation: float 6s ease-in-out infinite;
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      
      /* Pulse Effects */
      .pulse-effects .pulse-element {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      
      /* Particle Background */
      .particle-bg::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: 
          radial-gradient(2px 2px at 20px 30px, var(--primary), transparent),
          radial-gradient(2px 2px at 40px 70px, var(--accent), transparent),
          radial-gradient(1px 1px at 90px 40px, var(--primary), transparent),
          radial-gradient(1px 1px at 130px 80px, var(--accent), transparent);
        background-repeat: repeat;
        background-size: 200px 200px;
        animation: particles 20s linear infinite;
        opacity: 0.1;
        z-index: -1;
        pointer-events: none;
      }
      
      @keyframes particles {
        0% { transform: translate(0, 0); }
        100% { transform: translate(-200px, -200px); }
      }
    `;
  }
}

// Export singleton instance
export const futuristicThemeSystem = new FuturisticThemeSystem();

// Auto-initialize on import
if (typeof window !== 'undefined') {
  futuristicThemeSystem.initialize();
}