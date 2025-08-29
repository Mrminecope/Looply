import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { cn } from "./utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("flex items-center justify-center", className)}
    >
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
    </motion.div>
  );
}

interface LoadingSkeletonProps {
  className?: string;
  variant?: "text" | "avatar" | "card" | "post";
}

export function LoadingSkeleton({ className, variant = "text" }: LoadingSkeletonProps) {
  const pulseAnimation = {
    animate: {
      opacity: [0.6, 1, 0.6],
    },
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    }
  };

  if (variant === "avatar") {
    return (
      <motion.div
        className={cn("w-10 h-10 bg-muted rounded-full", className)}
        {...pulseAnimation}
      />
    );
  }

  if (variant === "card") {
    return (
      <motion.div
        className={cn("space-y-3 p-4", className)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center space-x-3">
          <motion.div
            className="w-10 h-10 bg-muted rounded-full"
            {...pulseAnimation}
          />
          <div className="space-y-2 flex-1">
            <motion.div
              className="h-4 bg-muted rounded w-32"
              {...pulseAnimation}
            />
            <motion.div
              className="h-3 bg-muted rounded w-24"
              {...pulseAnimation}
            />
          </div>
        </div>
        <motion.div
          className="h-32 bg-muted rounded-lg"
          {...pulseAnimation}
        />
        <div className="space-y-2">
          <motion.div
            className="h-3 bg-muted rounded w-full"
            {...pulseAnimation}
          />
          <motion.div
            className="h-3 bg-muted rounded w-3/4"
            {...pulseAnimation}
          />
        </div>
      </motion.div>
    );
  }

  if (variant === "post") {
    return (
      <motion.div
        className="border-b border-border p-4 space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center space-x-3">
          <motion.div
            className="w-10 h-10 bg-muted rounded-full"
            {...pulseAnimation}
          />
          <div className="space-y-2 flex-1">
            <motion.div
              className="h-4 bg-muted rounded w-32"
              {...pulseAnimation}
            />
            <motion.div
              className="h-3 bg-muted rounded w-24"
              {...pulseAnimation}
            />
          </div>
        </div>
        
        {/* Content */}
        <div className="space-y-2">
          <motion.div
            className="h-4 bg-muted rounded w-full"
            {...pulseAnimation}
          />
          <motion.div
            className="h-4 bg-muted rounded w-4/5"
            {...pulseAnimation}
          />
        </div>
        
        {/* Media placeholder */}
        <motion.div
          className="h-48 bg-muted rounded-lg"
          {...pulseAnimation}
        />
        
        {/* Actions */}
        <div className="flex items-center space-x-4">
          <motion.div
            className="h-8 bg-muted rounded w-16"
            {...pulseAnimation}
          />
          <motion.div
            className="h-8 bg-muted rounded w-16"
            {...pulseAnimation}
          />
          <motion.div
            className="h-8 bg-muted rounded w-16"
            {...pulseAnimation}
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn("h-4 bg-muted rounded", className)}
      {...pulseAnimation}
    />
  );
}

interface LoadingStateProps {
  type?: "posts" | "communities" | "notifications" | "general";
  count?: number;
}

export function LoadingState({ type = "general", count = 3 }: LoadingStateProps) {
  if (type === "posts") {
    return (
      <div className="space-y-0">
        {Array.from({ length: count }).map((_, i) => (
          <LoadingSkeleton key={i} variant="post" />
        ))}
      </div>
    );
  }

  if (type === "communities") {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            className="flex items-center space-x-3 p-3 border rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
          >
            <LoadingSkeleton variant="avatar" />
            <div className="flex-1 space-y-2">
              <LoadingSkeleton className="h-4 w-32" />
              <LoadingSkeleton className="h-3 w-48" />
            </div>
            <LoadingSkeleton className="h-8 w-16" />
          </motion.div>
        ))}
      </div>
    );
  }

  if (type === "notifications") {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            className="flex items-start space-x-3 p-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
          >
            <LoadingSkeleton variant="avatar" className="w-8 h-8" />
            <div className="flex-1 space-y-2">
              <LoadingSkeleton className="h-4 w-full" />
              <LoadingSkeleton className="h-3 w-3/4" />
              <LoadingSkeleton className="h-3 w-16" />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingSkeleton key={i} variant="card" />
      ))}
    </div>
  );
}

interface FullScreenLoadingProps {
  message?: string;
}

export function FullScreenLoading({ message = "Loading..." }: FullScreenLoadingProps) {
  return (
    <motion.div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="flex flex-col items-center space-y-4"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <LoadingSpinner size="lg" />
        <motion.p
          className="text-muted-foreground"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {message}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}