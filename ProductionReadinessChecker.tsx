import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ChevronDown, 
  Shield, 
  Zap, 
  Database, 
  Globe,
  Users,
  Settings,
  Lock,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductionCheck {
  id: string;
  category: string;
  name: string;
  description: string;
  status: 'pass' | 'fail' | 'warning';
  importance: 'critical' | 'high' | 'medium' | 'low';
  fix?: string;
  documentation?: string;
}

interface ProductionReadinessCheckerProps {
  isVisible?: boolean;
  onClose?: () => void;
}

export function ProductionReadinessChecker({ isVisible = false, onClose }: ProductionReadinessCheckerProps) {
  const [checks, setChecks] = useState<ProductionCheck[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [isExpanded, setIsExpanded] = useState<Record<string, boolean>>({});

  // Define production readiness checks
  const productionChecks: ProductionCheck[] = [
    // Security
    {
      id: 'https-enforcement',
      category: 'Security',
      name: 'HTTPS Enforcement',
      description: 'Ensure all traffic is encrypted with HTTPS',
      status: 'warning',
      importance: 'critical',
      fix: 'Configure SSL certificates and redirect HTTP to HTTPS',
      documentation: 'https://letsencrypt.org/'
    },
    {
      id: 'api-authentication',
      category: 'Security',
      name: 'API Authentication',
      description: 'Secure API endpoints with proper authentication',
      status: 'pass',
      importance: 'critical',
      fix: 'Implement JWT tokens or OAuth 2.0'
    },
    {
      id: 'input-validation',
      category: 'Security',
      name: 'Input Validation',
      description: 'Validate and sanitize all user inputs',
      status: 'pass',
      importance: 'critical',
      fix: 'Use libraries like Joi or Yup for validation'
    },
    {
      id: 'cors-policy',
      category: 'Security',
      name: 'CORS Policy',
      description: 'Configure proper CORS policies',
      status: 'warning',
      importance: 'high',
      fix: 'Set specific allowed origins instead of wildcard'
    },

    // Performance
    {
      id: 'bundle-optimization',
      category: 'Performance',
      name: 'Bundle Optimization',
      description: 'Optimize JavaScript bundle size',
      status: 'pass',
      importance: 'high',
      fix: 'Use code splitting and tree shaking'
    },
    {
      id: 'image-optimization',
      category: 'Performance',
      name: 'Image Optimization',
      description: 'Optimize images for web delivery',
      status: 'warning',
      importance: 'medium',
      fix: 'Use WebP format and responsive images'
    },
    {
      id: 'caching-strategy',
      category: 'Performance',
      name: 'Caching Strategy',
      description: 'Implement effective caching mechanisms',
      status: 'pass',
      importance: 'high',
      fix: 'Configure CDN and browser caching headers'
    },
    {
      id: 'lazy-loading',
      category: 'Performance',
      name: 'Lazy Loading',
      description: 'Implement lazy loading for components and images',
      status: 'pass',
      importance: 'medium',
      fix: 'Use React.lazy() and Intersection Observer'
    },

    // Database & API
    {
      id: 'database-indexing',
      category: 'Database',
      name: 'Database Indexing',
      description: 'Optimize database queries with proper indexing',
      status: 'warning',
      importance: 'critical',
      fix: 'Add indexes on frequently queried columns'
    },
    {
      id: 'api-rate-limiting',
      category: 'Database',
      name: 'API Rate Limiting',
      description: 'Implement rate limiting to prevent abuse',
      status: 'fail',
      importance: 'critical',
      fix: 'Use Redis-based rate limiting'
    },
    {
      id: 'data-backup',
      category: 'Database',
      name: 'Data Backup Strategy',
      description: 'Regular automated backups',
      status: 'fail',
      importance: 'critical',
      fix: 'Set up automated daily backups with retention policy'
    },

    // Monitoring & Logging
    {
      id: 'error-tracking',
      category: 'Monitoring',
      name: 'Error Tracking',
      description: 'Track and monitor application errors',
      status: 'warning',
      importance: 'high',
      fix: 'Integrate Sentry or similar error tracking service'
    },
    {
      id: 'performance-monitoring',
      category: 'Monitoring',
      name: 'Performance Monitoring',
      description: 'Monitor application performance metrics',
      status: 'pass',
      importance: 'high',
      fix: 'Use APM tools like New Relic or DataDog'
    },
    {
      id: 'logging-strategy',
      category: 'Monitoring',
      name: 'Logging Strategy',
      description: 'Comprehensive logging for debugging',
      status: 'pass',
      importance: 'medium',
      fix: 'Structure logs with proper log levels'
    },

    // Accessibility & SEO
    {
      id: 'accessibility-compliance',
      category: 'Accessibility',
      name: 'WCAG Compliance',
      description: 'Meet accessibility standards',
      status: 'warning',
      importance: 'high',
      fix: 'Run accessibility audits and fix issues'
    },
    {
      id: 'seo-optimization',
      category: 'SEO',
      name: 'SEO Optimization',
      description: 'Optimize for search engines',
      status: 'warning',
      importance: 'medium',
      fix: 'Add meta tags, structured data, and sitemap'
    },
    {
      id: 'mobile-optimization',
      category: 'Mobile',
      name: 'Mobile Responsiveness',
      description: 'Fully responsive design',
      status: 'pass',
      importance: 'critical',
      fix: 'Test on various devices and screen sizes'
    },

    // Deployment & Infrastructure
    {
      id: 'ci-cd-pipeline',
      category: 'Deployment',
      name: 'CI/CD Pipeline',
      description: 'Automated deployment pipeline',
      status: 'warning',
      importance: 'high',
      fix: 'Set up GitHub Actions or similar CI/CD'
    },
    {
      id: 'environment-variables',
      category: 'Deployment',
      name: 'Environment Configuration',
      description: 'Proper environment variable management',
      status: 'pass',
      importance: 'critical',
      fix: 'Use secure environment variable storage'
    },
    {
      id: 'health-checks',
      category: 'Deployment',
      name: 'Health Checks',
      description: 'Application health monitoring',
      status: 'fail',
      importance: 'high',
      fix: 'Implement health check endpoints'
    }
  ];

  useEffect(() => {
    setChecks(productionChecks);
    
    // Calculate overall score
    const totalChecks = productionChecks.length;
    const passedChecks = productionChecks.filter(check => check.status === 'pass').length;
    const warningChecks = productionChecks.filter(check => check.status === 'warning').length;
    
    const score = Math.round(
      (passedChecks * 100 + warningChecks * 50) / totalChecks
    );
    
    setOverallScore(score);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getImportanceBadge = (importance: string) => {
    const variants = {
      critical: 'destructive',
      high: 'default',
      medium: 'secondary',
      low: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[importance as keyof typeof variants] || 'outline'}>
        {importance}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      Security: Shield,
      Performance: Zap,
      Database: Database,
      Monitoring: Activity,
      Accessibility: Users,
      SEO: Globe,
      Mobile: Settings,
      Deployment: Lock
    };
    
    const IconComponent = icons[category as keyof typeof icons] || Settings;
    return <IconComponent className="w-4 h-4" />;
  };

  const groupedChecks = checks.reduce((acc, check) => {
    if (!acc[check.category]) {
      acc[check.category] = [];
    }
    acc[check.category].push(check);
    return acc;
  }, {} as Record<string, ProductionCheck[]>);

  const toggleCategory = useCallback((category: string) => {
    setIsExpanded(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-4 z-[9999] flex items-center justify-center bg-black/50"
      >
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Production Readiness Check</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Comprehensive audit for production deployment
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge 
                variant={overallScore >= 80 ? 'default' : overallScore >= 60 ? 'secondary' : 'destructive'}
                className="text-lg px-4 py-2"
              >
                {overallScore}% Ready
              </Badge>
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  ×
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Production Readiness Score</span>
                <span className="text-2xl font-bold">{overallScore}%</span>
              </div>
              <Progress value={overallScore} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {overallScore >= 80 
                  ? '🎉 Excellent! Your app is production-ready.'
                  : overallScore >= 60 
                  ? '⚠️ Good progress, but some improvements needed.'
                  : '🚨 Critical issues need attention before deployment.'
                }
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {checks.filter(c => c.status === 'pass').length}
                </div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {checks.filter(c => c.status === 'warning').length}
                </div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {checks.filter(c => c.status === 'fail').length}
                </div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </Card>
            </div>

            {/* Categorized Checks */}
            <div className="space-y-4">
              {Object.entries(groupedChecks).map(([category, categoryChecks]) => {
                const passedInCategory = categoryChecks.filter(c => c.status === 'pass').length;
                const totalInCategory = categoryChecks.length;
                const categoryScore = Math.round((passedInCategory / totalInCategory) * 100);

                return (
                  <Collapsible 
                    key={category}
                    open={isExpanded[category]}
                    onOpenChange={() => toggleCategory(category)}
                  >
                    <CollapsibleTrigger asChild>
                      <Card className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getCategoryIcon(category)}
                            <div>
                              <h3 className="font-semibold">{category}</h3>
                              <p className="text-sm text-muted-foreground">
                                {passedInCategory}/{totalInCategory} checks passed
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Progress value={categoryScore} className="w-20 h-2" />
                            <span className="text-sm font-medium">{categoryScore}%</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${
                              isExpanded[category] ? 'rotate-180' : ''
                            }`} />
                          </div>
                        </div>
                      </Card>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="space-y-2 mt-2 ml-4">
                        {categoryChecks.map((check) => (
                          <Card key={check.id} className="p-4">
                            <div className="flex items-start gap-3">
                              {getStatusIcon(check.status)}
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{check.name}</h4>
                                  {getImportanceBadge(check.importance)}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {check.description}
                                </p>
                                {check.status !== 'pass' && check.fix && (
                                  <div className="p-2 bg-muted/50 rounded text-sm">
                                    <span className="font-medium">Fix: </span>
                                    {check.fix}
                                  </div>
                                )}
                                {check.documentation && (
                                  <Button variant="link" size="sm" className="p-0 h-auto">
                                    View Documentation →
                                  </Button>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>

            {/* Next Steps */}
            <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Recommended Next Steps
              </h4>
              <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                <li>Address all critical security issues first</li>
                <li>Set up monitoring and error tracking</li>
                <li>Implement database backup strategy</li>
                <li>Configure proper rate limiting</li>
                <li>Add health check endpoints</li>
                <li>Run performance and security audits</li>
                <li>Test deployment pipeline thoroughly</li>
              </ol>
            </Card>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook for easy integration
export function useProductionReadinessChecker() {
  const [isVisible, setIsVisible] = useState(false);

  const showChecker = useCallback(() => setIsVisible(true), []);
  const hideChecker = useCallback(() => setIsVisible(false), []);
  const toggleChecker = useCallback(() => setIsVisible(prev => !prev), []);

  return {
    ProductionReadinessChecker: () => (
      <ProductionReadinessChecker isVisible={isVisible} onClose={hideChecker} />
    ),
    showChecker,
    hideChecker,
    toggleChecker,
    isVisible
  };
}

export default ProductionReadinessChecker;