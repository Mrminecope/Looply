import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 mobile-touch-optimized mobile-tap-highlight active:scale-98 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg active:shadow-sm transform hover:-translate-y-0.5 active:translate-y-0",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-lg active:shadow-sm",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow-md active:shadow-sm",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md active:shadow-sm",
        ghost: 
          "hover:bg-accent hover:text-accent-foreground active:bg-accent/70 rounded-lg",
        link: 
          "text-primary underline-offset-4 hover:underline active:text-primary/80",
        gradient:
          "bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white hover:from-purple-700 hover:via-pink-600 hover:to-orange-500 shadow-lg hover:shadow-xl active:shadow-md transform hover:-translate-y-0.5 active:translate-y-0",
        success:
          "bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg active:shadow-sm",
        warning:
          "bg-amber-500 text-white hover:bg-amber-600 shadow-md hover:shadow-lg active:shadow-sm"
      },
      size: {
        default: "h-10 px-4 py-2 text-sm min-h-[44px]",
        sm: "h-9 rounded-md px-3 text-xs min-h-[36px]",
        lg: "h-11 rounded-md px-8 text-base min-h-[48px]",
        xl: "h-12 rounded-lg px-10 text-lg min-h-[52px]",
        icon: "h-10 w-10 min-h-[44px] min-w-[44px] rounded-lg",
        "icon-sm": "h-8 w-8 min-h-[36px] min-w-[36px] rounded-md",
        "icon-lg": "h-12 w-12 min-h-[48px] min-w-[48px] rounded-lg"
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  ripple?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false,
    loadingText = "Loading...",
    ripple = true,
    children,
    onClick,
    disabled,
    ...props 
  }, ref) => {
    const [isRippling, setIsRippling] = React.useState(false);
    const [rippleCoords, setRippleCoords] = React.useState({ x: 0, y: 0 });
    
    const Comp = asChild ? Slot : "button";

    const handleClick = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return;

      // Add ripple effect for touch feedback
      if (ripple) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        setRippleCoords({ x, y });
        setIsRippling(true);
        
        setTimeout(() => setIsRippling(false), 300);
      }

      // Add haptic feedback if supported
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }

      // Call original onClick
      onClick?.(e);
    }, [onClick, disabled, loading, ripple]);

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          loading && "pointer-events-none relative",
          "relative overflow-hidden focus-ring"
        )}
        ref={ref}
        onClick={handleClick}
        disabled={disabled || loading}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-inherit">
            <div className="loading-spinner mr-2" />
            <span className="text-inherit opacity-75">
              {loadingText}
            </span>
          </div>
        )}
        
        {/* Ripple effect */}
        {ripple && isRippling && (
          <span
            className="absolute rounded-full bg-white/30 pointer-events-none animate-ping"
            style={{
              left: rippleCoords.x - 10,
              top: rippleCoords.y - 10,
              width: 20,
              height: 20
            }}
          />
        )}
        
        {/* Content */}
        <span className={cn("relative z-10", loading && "opacity-0")}>
          {children}
        </span>
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };