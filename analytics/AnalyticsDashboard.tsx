import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { 
  TrendingUp, 
  Users, 
  Heart, 
  MessageCircle, 
  Share,
  Eye,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Target,
  Zap,
  PlayCircle,
  Clock,
  UserPlus,
  Repeat,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import { analyticsService } from "../../utils/analytics";

interface AnalyticsDashboardProps {
  userId: string;
  timeRange: '7d' | '30d' | '90d';
  onTimeRangeChange: (range: '7d' | '30d' | '90d') => void;
}

export function AnalyticsDashboard({ 
  userId, 
  timeRange, 
  onTimeRangeChange 
}: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange, userId]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Get real analytics data
      const dau = analyticsService.getDAU();
      const mau = analyticsService.getMAU();
      const retentionRates = analyticsService.getRetentionRates();
      const videoMetrics = analyticsService.getVideoMetrics();
      const engagementMetrics = analyticsService.getEngagementMetrics();
      const signupMetrics = analyticsService.getSignupMetrics();

      // Calculate trends (mock for demo - in real app, compare with previous period)
      const trends = {
        dau: Math.random() > 0.5 ? 'up' : 'down',
        mau: Math.random() > 0.5 ? 'up' : 'down',
        engagement: Math.random() > 0.5 ? 'up' : 'down',
        retention: Math.random() > 0.5 ? 'up' : 'down'
      };

      setAnalytics({
        overview: {
          dau,
          mau,
          totalUsers: signupMetrics.totalSignups,
          activeUsers: Math.floor(mau * 0.6), // Assume 60% of MAU are active
          trends
        },
        retention: retentionRates,
        video: videoMetrics,
        engagement: engagementMetrics,
        signup: signupMetrics,
        timeRange
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return Math.round(num).toString();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case '7d': return 'Last 7 days';
      case '30d': return 'Last 30 days';
      case '90d': return 'Last 90 days';
      default: return 'Last 7 days';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-3 h-3 text-green-600" />;
      case 'down': return <ArrowDown className="w-3 h-3 text-red-600" />;
      default: return <Minus className="w-3 h-3 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">Track your content performance and audience insights</p>
        </div>
        
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.overview?.dau || 0)}</div>
            <p className={`text-xs flex items-center gap-1 ${getTrendColor(analytics.overview?.trends?.dau)}`}>
              {getTrendIcon(analytics.overview?.trends?.dau)}
              from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Active Users</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.overview?.mau || 0)}</div>
            <p className={`text-xs flex items-center gap-1 ${getTrendColor(analytics.overview?.trends?.mau)}`}>
              {getTrendIcon(analytics.overview?.trends?.mau)}
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.engagement?.avgLikesPerPost ? formatNumber(analytics.engagement.avgLikesPerPost) : '0'}
            </div>
            <p className={`text-xs flex items-center gap-1 ${getTrendColor(analytics.overview?.trends?.engagement)}`}>
              {getTrendIcon(analytics.overview?.trends?.engagement)}
              likes per post
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">D7 Retention</CardTitle>
            <Repeat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.retention?.d7?.toFixed(1) || '0.0'}%</div>
            <p className={`text-xs flex items-center gap-1 ${getTrendColor(analytics.overview?.trends?.retention)}`}>
              {getTrendIcon(analytics.overview?.trends?.retention)}
              7-day retention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="video">Video</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="acquisition">Acquisition</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* User Growth */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Growth</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Users</span>
                  <span className="font-medium">{formatNumber(analytics.overview?.totalUsers || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Users</span>
                  <span className="font-medium">{formatNumber(analytics.overview?.activeUsers || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">New Signups (30d)</span>
                  <span className="font-medium">{formatNumber(analytics.signup?.totalSignups || 0)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Content Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Content Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="text-sm">Avg Likes/Post</span>
                  </div>
                  <span className="font-medium">{formatNumber(analytics.engagement?.avgLikesPerPost || 0)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Avg Comments/Post</span>
                  </div>
                  <span className="font-medium">{formatNumber(analytics.engagement?.avgCommentsPerPost || 0)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Share className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Avg Shares/Post</span>
                  </div>
                  <span className="font-medium">{formatNumber(analytics.engagement?.avgSharesPerPost || 0)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="retention" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Retention Rates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Retention Rates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Day 1 Retention</span>
                    <span>{analytics.retention?.d1?.toFixed(1) || '0.0'}%</span>
                  </div>
                  <Progress value={analytics.retention?.d1 || 0} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Day 7 Retention</span>
                    <span>{analytics.retention?.d7?.toFixed(1) || '0.0'}%</span>
                  </div>
                  <Progress value={analytics.retention?.d7 || 0} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Day 30 Retention</span>
                    <span>{analytics.retention?.d30?.toFixed(1) || '0.0'}%</span>
                  </div>
                  <Progress value={analytics.retention?.d30 || 0} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Retention Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Retention Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Retention rates show how many users return after their initial visit.
                </div>
                
                {analytics.retention?.d1 > 50 ? (
                  <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="text-sm font-medium text-green-800 dark:text-green-200">
                      Great D1 retention! 🎉
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400">
                      Users are finding value quickly
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <div className="text-sm font-medium text-orange-800 dark:text-orange-200">
                      Consider improving onboarding
                    </div>
                    <div className="text-xs text-orange-600 dark:text-orange-400">
                      Low D1 retention suggests users need more guidance
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="video" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Video Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Video Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PlayCircle className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">Total Plays</span>
                  </div>
                  <span className="font-medium">{formatNumber(analytics.video?.totalPlays || 0)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Avg Watch Time</span>
                  </div>
                  <span className="font-medium">{formatTime(analytics.video?.avgWatchTime || 0)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Completion Rate</span>
                  </div>
                  <span className="font-medium">{analytics.video?.completionRate?.toFixed(1) || '0.0'}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Top Videos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Performing Videos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.video?.topVideos?.length > 0 ? (
                    analytics.video.topVideos.slice(0, 5).map((video: any, index: number) => (
                      <div key={video.videoId} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <Badge variant={index === 0 ? "default" : "outline"}>#{index + 1}</Badge>
                          <span className="text-sm">Video {video.videoId.slice(-6)}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{video.plays} plays</div>
                          <div className="text-xs text-muted-foreground">
                            {formatTime(video.avgWatchTime)} avg
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-4">
                      <PlayCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No video data yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Engagement Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Engagement Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Posts per Active User</span>
                  <span className="font-medium">
                    {analytics.engagement?.avgPostsPerActiveUser?.toFixed(1) || '0.0'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Likes per Post</span>
                  <span className="font-medium">
                    {analytics.engagement?.avgLikesPerPost?.toFixed(1) || '0.0'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Comments per Post</span>
                  <span className="font-medium">
                    {analytics.engagement?.avgCommentsPerPost?.toFixed(1) || '0.0'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Shares per Post</span>
                  <span className="font-medium">
                    {analytics.engagement?.avgSharesPerPost?.toFixed(1) || '0.0'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Top Engaging Users */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Most Engaged Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.engagement?.topEngagingUsers?.length > 0 ? (
                    analytics.engagement.topEngagingUsers.slice(0, 5).map((user: any, index: number) => (
                      <div key={user.userId} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <Badge variant={index === 0 ? "default" : "outline"}>#{index + 1}</Badge>
                          <span className="text-sm">User {user.userId.slice(-6)}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{user.totalEngagement}</div>
                          <div className="text-xs text-muted-foreground">interactions</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-4">
                      <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No engagement data yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="acquisition" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Signup Sources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Signup Sources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics.signup?.signupsBySource ? 
                  Object.entries(analytics.signup.signupsBySource).map(([source, count]) => (
                    <div key={source} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{source}</span>
                      <Badge variant="outline">{count as number}</Badge>
                    </div>
                  )) : (
                    <div className="text-center text-muted-foreground py-4">
                      <UserPlus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No signup data yet</p>
                    </div>
                  )
                }
              </CardContent>
            </Card>

            {/* Conversion Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Conversion Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Invite Conversion Rate</span>
                    <span>{analytics.signup?.inviteConversionRate?.toFixed(1) || '0.0'}%</span>
                  </div>
                  <Progress value={analytics.signup?.inviteConversionRate || 0} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Onboarding Completion</span>
                    <span>{analytics.signup?.onboardingCompletionRate?.toFixed(1) || '0.0'}%</span>
                  </div>
                  <Progress value={analytics.signup?.onboardingCompletionRate || 0} className="h-2" />
                </div>
                
                <div className="text-xs text-muted-foreground mt-3">
                  Total Signups: {analytics.signup?.totalSignups || 0}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}