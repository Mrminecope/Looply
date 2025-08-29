import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import looplyLogo from 'figma:asset/56cbef1b2c32db734d3d58edddaf265a3a4bdaee.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
  showText?: boolean;
}

export function Logo({ 
  size = 'md', 
  animated = true, 
  className = '',
  showText = true 
}: LogoProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);

  // Continuous animation cycle
  useEffect(() => {
    if (!animated) return;

    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4);
    }, 3000);

    return () => clearInterval(interval);
  }, [animated]);

  // Size configurations
  const sizeConfig = {
    sm: { 
      logo: 'h-6 w-6',
      text: 'text-lg',
      container: 'gap-2'
    },
    md: { 
      logo: 'h-8 w-8',
      text: 'text-xl',
      container: 'gap-2'
    },
    lg: { 
      logo: 'h-12 w-12',
      text: 'text-2xl',
      container: 'gap-3'
    },
    xl: { 
      logo: 'h-16 w-16',
      text: 'text-3xl',
      container: 'gap-4'
    }
  };

  const config = sizeConfig[size];

  // Animation variants
  const logoVariants = {
    idle: {
      scale: 1,
      rotate: 0,
      filter: 'brightness(1) hue-rotate(0deg)',
      transition: { duration: 0.6, ease: "easeInOut" }
    },
    pulse: {
      scale: [1, 1.1, 1],
      filter: 'brightness(1.2) hue-rotate(15deg)',
      transition: { duration: 1.5, ease: "easeInOut" }
    },
    glow: {
      scale: 1.05,
      filter: 'brightness(1.3) hue-rotate(30deg) drop-shadow(0 0 20px rgba(124, 58, 237, 0.6))',
      transition: { duration: 1, ease: "easeInOut" }
    },
    spin: {
      rotate: 360,
      scale: [1, 1.1, 1],
      filter: 'brightness(1.1) hue-rotate(45deg)',
      transition: { duration: 2, ease: "easeInOut" }
    }
  };

  const textVariants = {
    idle: {
      opacity: 1,
      y: 0,
      backgroundPosition: '0% 50%',
      transition: { duration: 0.6 }
    },
    pulse: {
      opacity: 1,
      y: -2,
      backgroundPosition: '100% 50%',
      transition: { duration: 1.5 }
    },
    glow: {
      opacity: 1,
      y: 0,
      backgroundPosition: '200% 50%',
      filter: 'drop-shadow(0 0 10px rgba(236, 72, 153, 0.4))',
      transition: { duration: 1 }
    },
    spin: {
      opacity: 1,
      y: 0,
      backgroundPosition: '300% 50%',
      transition: { duration: 2 }
    }
  };

  const getAnimationState = () => {
    if (!animated) return 'idle';
    if (isHovered) return 'glow';
    
    switch (animationPhase) {
      case 1: return 'pulse';
      case 2: return 'glow';
      case 3: return 'spin';
      default: return 'idle';
    }
  };

  const animationState = getAnimationState();

  return (
    <motion.div
      className={`flex items-center ${config.container} ${className}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial="idle"
      animate={animationState}
    >
      {/* Animated Logo */}
      <motion.div
        variants={logoVariants}
        className={`relative ${config.logo} flex-shrink-0`}
      >
        {/* Glow effect background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-md opacity-0"
          animate={{
            opacity: animationState === 'glow' || isHovered ? 0.6 : 0,
            scale: animationState === 'glow' || isHovered ? 1.5 : 1,
          }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Main logo */}
        <motion.img
          src={looplyLogo}
          alt="Looply"
          className={`${config.logo} relative z-10 drop-shadow-lg`}
          variants={logoVariants}
        />
        
        {/* Floating particles effect */}
        {(animationState === 'glow' || isHovered) && (
          <>
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                initial={{
                  opacity: 0,
                  scale: 0,
                  x: '50%',
                  y: '50%',
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: `${50 + (Math.cos((i * 60) * Math.PI / 180) * 30)}%`,
                  y: `${50 + (Math.sin((i * 60) * Math.PI / 180) * 30)}%`,
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.2,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              />
            ))}
          </>
        )}
      </motion.div>

      {/* Animated Text */}
      {showText && (
        <motion.span
          variants={textVariants}
          className={`font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent ${config.text}`}
          style={{
            backgroundSize: '300% 100%',
          }}
        >
          Looply
        </motion.span>
      )}

      {/* Infinity symbol overlay for extra branding */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: animationState === 'spin' ? 0.3 : 0,
        }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <motion.div
            className="text-purple-500 opacity-50 text-lg"
            animate={{
              rotate: animationState === 'spin' ? 360 : 0,
              scale: animationState === 'spin' ? [1, 1.2, 1] : 1,
            }}
            transition={{ duration: 2 }}
          >
            ∞
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Compact logo for tight spaces
export function CompactLogo({ className = '' }: { className?: string }) {
  return (
    <Logo 
      size="sm" 
      showText={false} 
      className={className}
      animated={true}
    />
  );
}

// Full brand logo for headers
export function BrandLogo({ className = '' }: { className?: string }) {
  return (
    <Logo 
      size="lg" 
      showText={true} 
      className={className}
      animated={true}
    />
  );
}