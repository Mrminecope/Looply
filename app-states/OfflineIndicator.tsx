import { motion, AnimatePresence } from 'motion/react';

interface OfflineIndicatorProps {
  isOnline: boolean;
}

export function OfflineIndicator({ isOnline }: OfflineIndicatorProps) {
  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-40"
        >
          <div className="glass-card px-4 py-2 rounded-full text-sm font-medium text-yellow-400 shadow-lg neon-border">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              <span className="font-secondary">Working offline</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}