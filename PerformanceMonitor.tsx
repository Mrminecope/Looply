import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Wifi, WifiOff, Battery, BatteryLow, Zap } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { localStorageService } from '../utils/local-storage-service';
import { reelAlgorithm } from '../utils/reel-algorithm';

interface PerformanceMetrics {
  fps: number;
  loadTime: number;
  memoryUsage: number;
  networkSpeed: string;
  batteryLevel?: number;
  isOnline: boolean;
  dataUsage: number;
  interactionLatency: number;
}

interface PerformanceMonitorProps {
  isVisible?: boolean;
  className?: string;
}

export function PerformanceMonitor({ isVisible = false, className = '' }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    loadTime: 0,
    memoryUsage: 0,
    networkSpeed: 'unknown',
    isOnline: navigator.onLine,
    dataUsage: 0,
    interactionLatency: 0
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [performanceScore, setPerformanceScore] = useState(100);

  // FPS monitoring
  const measureFPS = useCallback(() => {
    let frames = 0;
    let lastTime = performance.now();
    
    const countFrames = () => {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        setMetrics(prev => ({ ...prev, fps: frames }));
        frames = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(countFrames);
    };
    
    requestAnimationFrame(countFrames);
  }, []);

  // Memory usage monitoring
  const measureMemory = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      setMetrics(prev => ({ ...prev, memoryUsage: usage }));
    }
  }, []);

  // Network monitoring
  const measureNetwork = useCallback(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setMetrics(prev => ({
        ...prev,
        networkSpeed: connection.effectiveType || 'unknown'
      }));
    }
  }, []);

  // Battery monitoring
  const measureBattery = useCallback(async () => {
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        setMetrics(prev => ({
          ...prev,
          batteryLevel: Math.round(battery.level * 100)
        }));
      } catch (error) {
        console.warn('Battery API not available:', error);
      }
    }
  }, []);

  // Interaction latency monitoring
  const measureInteractionLatency = useCallback(() => {
    let startTime = 0;
    
    const handleStart = () => {
      startTime = performance.now();
    };
    
    const handleEnd = () => {
      if (startTime) {
        const latency = performance.now() - startTime;
        setMetrics(prev => ({ ...prev, interactionLatency: latency }));
        startTime = 0;
      }
    };
    
    document.addEventListener('pointerdown', handleStart);
    document.addEventListener('pointerup', handleEnd);
    
    return () => {
      document.removeEventListener('pointerdown', handleStart);
      document.removeEventListener('pointerup', handleEnd);
    };
  }, []);

  // Load time measurement
  useEffect(() => {
    const loadTime = performance.now();
    setMetrics(prev => ({ ...prev, loadTime }));
  }, []);

  // Initialize monitoring
  useEffect(() => {
    measureFPS();
    
    const memoryInterval = setInterval(measureMemory, 2000);
    const networkInterval = setInterval(measureNetwork, 5000);
    const batteryInterval = setInterval(measureBattery, 10000);
    
    const cleanupInteraction = measureInteractionLatency();
    
    // Initial measurements
    measureMemory();
    measureNetwork();
    measureBattery();
    
    return () => {
      clearInterval(memoryInterval);
      clearInterval(networkInterval);
      clearInterval(batteryInterval);
      cleanupInteraction();
    };
  }, [measureFPS, measureMemory, measureNetwork, measureBattery, measureInteractionLatency]);

  // Calculate performance score
  useEffect(() => {
    const fpsScore = Math.min((metrics.fps / 60) * 40, 40);
    const memoryScore = Math.max(40 - (metrics.memoryUsage / 100) * 40, 0);
    const latencyScore = Math.max(20 - (metrics.interactionLatency / 100) * 20, 0);
    
    const totalScore = fpsScore + memoryScore + latencyScore;
    setPerformanceScore(Math.round(totalScore));
  }, [metrics]);

  // Online/offline monitoring
  useEffect(() => {
    const handleOnline = () => setMetrics(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setMetrics(prev => ({ ...prev, isOnline: false }));
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Get performance color
  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Get metric status
  const getMetricStatus = (metric: keyof PerformanceMetrics, value: any) => {
    switch (metric) {
      case 'fps':
        return value >= 50 ? 'good' : value >= 30 ? 'warning' : 'poor';
      case 'memoryUsage':
        return value <= 50 ? 'good' : value <= 80 ? 'warning' : 'poor';
      case 'interactionLatency':
        return value <= 16 ? 'good' : value <= 33 ? 'warning' : 'poor';
      case 'batteryLevel':
        return value && value > 20 ? 'good' : 'warning';
      default:
        return 'good';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (!isVisible && !isExpanded) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={`fixed bottom-4 left-4 z-50 ${className}`}
      >
        {/* Compact performance indicator */}
        {!isExpanded && (
          <motion.div
            onClick={() => setIsExpanded(true)}
            className="cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Card className="p-3 bg-background/90 backdrop-blur-sm border shadow-lg">
              <div className="flex items-center space-x-2">
                <Activity className={`h-4 w-4 ${getPerformanceColor(performanceScore)}`} />
                <span className={`text-sm font-medium ${getPerformanceColor(performanceScore)}`}>
                  {performanceScore}%
                </span>
                <div className="flex space-x-1">
                  {metrics.isOnline ? (
                    <Wifi className="h-3 w-3 text-green-500" />
                  ) : (
                    <WifiOff className="h-3 w-3 text-red-500" />
                  )}
                  {metrics.batteryLevel && (
                    metrics.batteryLevel > 20 ? (
                      <Battery className="h-3 w-3 text-green-500" />
                    ) : (
                      <BatteryLow className="h-3 w-3 text-red-500" />
                    )
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Expanded performance dashboard */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card className="p-4 bg-background/95 backdrop-blur-sm border shadow-xl min-w-80">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-purple-500" />
                  <h3 className="font-semibold text-foreground">Looply Performance</h3>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Performance score */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Overall Score</span>
                  <span className={`text-lg font-bold ${getPerformanceColor(performanceScore)}`}>
                    {performanceScore}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full ${
                      performanceScore >= 80 ? 'bg-green-500' :
                      performanceScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${performanceScore}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {/* FPS */}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">FPS</span>
                  <span className={getStatusColor(getMetricStatus('fps', metrics.fps))}>
                    {metrics.fps}
                  </span>
                </div>

                {/* Memory */}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Memory</span>
                  <span className={getStatusColor(getMetricStatus('memoryUsage', metrics.memoryUsage))}>
                    {Math.round(metrics.memoryUsage)}%
                  </span>
                </div>

                {/* Load time */}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Load Time</span>
                  <span className="text-foreground">
                    {Math.round(metrics.loadTime)}ms
                  </span>
                </div>

                {/* Latency */}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Latency</span>
                  <span className={getStatusColor(getMetricStatus('interactionLatency', metrics.interactionLatency))}>
                    {Math.round(metrics.interactionLatency)}ms
                  </span>
                </div>

                {/* Network */}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network</span>
                  <div className="flex items-center space-x-1">
                    {metrics.isOnline ? (
                      <Wifi className="h-3 w-3 text-green-500" />
                    ) : (
                      <WifiOff className="h-3 w-3 text-red-500" />
                    )}
                    <span className="text-foreground">{metrics.networkSpeed}</span>
                  </div>
                </div>

                {/* Battery */}
                {metrics.batteryLevel && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Battery</span>
                    <div className="flex items-center space-x-1">
                      {metrics.batteryLevel > 20 ? (
                        <Battery className="h-3 w-3 text-green-500" />
                      ) : (
                        <BatteryLow className="h-3 w-3 text-red-500" />
                      )}
                      <span className="text-foreground">{metrics.batteryLevel}%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Status badges */}
              <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t">
                <Badge variant={metrics.isOnline ? "default" : "destructive"}>
                  {metrics.isOnline ? "Online" : "Offline"}
                </Badge>
                <Badge variant={performanceScore >= 80 ? "default" : "secondary"}>
                  {performanceScore >= 80 ? "Optimized" : "Needs Optimization"}
                </Badge>
                {metrics.fps >= 50 && (
                  <Badge variant="default">60fps Ready</Badge>
                )}
              </div>

              {/* Quick actions */}
              <div className="mt-3 pt-3 border-t">
                <button
                  onClick={async () => {
                    const analytics = await localStorageService.getAnalytics();
                    console.log('📊 Looply Analytics:', analytics);
                  }}
                  className="text-xs text-purple-500 hover:text-purple-600 transition-colors"
                >
                  View Analytics
                </button>
              </div>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}