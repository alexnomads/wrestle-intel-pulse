
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, TrendingUp, Users, Zap, Target, AlertTriangle } from 'lucide-react';
import { useOptimizedUnifiedData } from '@/hooks/useOptimizedData';
import { usePredictiveAnalytics } from '@/hooks/usePredictiveAnalytics';
import { WrestlerHeatmap } from './analytics/WrestlerHeatmap';
import { PlatformBreakdown } from './analytics/PlatformBreakdown';
import { PredictiveAnalyticsDashboard } from './analytics/PredictiveAnalyticsDashboard';
import TopWrestlingTweets from './dashboard/TopWrestlingTweets';
import { UnifiedStorylinesHub } from './storylines/UnifiedStorylinesHub';
import { PerformanceDashboard } from './performance/PerformanceDashboard';

export const MainAnalyticsDashboard = () => {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  const { 
    data, 
    isLoading, 
    error, 
    manualRefresh, 
    isBackgroundRefreshing,
    fromCache,
    loadTimes 
  } = useOptimizedUnifiedData();
  
  const { 
    trends, 
    storylines, 
    alerts, 
    isLoading: analyticsLoading, 
    refetch: refetchAnalytics 
  } = usePredictiveAnalytics();

  const handleRefresh = async () => {
    await Promise.all([manualRefresh(), refetchAnalytics()]);
    setLastUpdate(new Date());
  };

  // Show cached data immediately while loading fresh data
  const showLoadingSpinner = isLoading && !data;

  if (showLoadingSpinner) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <RefreshCw className="h-6 w-6 animate-spin text-wrestling-electric" />
          <span className="text-lg">Loading wrestling analytics...</span>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Error loading data</p>
        <Button onClick={handleRefresh}>Try Again</Button>
      </div>
    );
  }

  const { newsItems = [], redditPosts = [], tweets = [], videos = [] } = data || {};

  // Create wrestler mentions for heatmap (simplified for performance)
  const wrestlerMentionCounts = []; // Simplified for now

  // Get high priority alerts for quick stats
  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical' || alert.severity === 'high');
  const risingTrends = trends.filter(trend => trend.trending_direction === 'rising').length;

  return (
    <div className="space-y-6">
      {/* Header with Performance Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h1 className="text-3xl font-bold text-foreground">Wrestling Analytics</h1>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            LIVE
          </Badge>
          {fromCache && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              CACHED
            </Badge>
          )}
          {criticalAlerts.length > 0 && (
            <Badge className="bg-red-100 text-red-800 border-red-200">
              {criticalAlerts.length} Alert{criticalAlerts.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading || isBackgroundRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Performance Dashboard */}
      <PerformanceDashboard 
        loadTimes={loadTimes}
        fromCache={fromCache}
        isBackgroundRefreshing={isBackgroundRefreshing}
      />

      {/* Enhanced Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">News Articles</p>
                <p className="text-2xl font-bold text-wrestling-electric">{newsItems.length}</p>
              </div>
              <Zap className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reddit Posts</p>
                <p className="text-2xl font-bold text-green-500">{redditPosts.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rising Trends</p>
                <p className="text-2xl font-bold text-green-500">{risingTrends}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Storylines</p>
                <p className="text-2xl font-bold text-blue-500">{storylines.length}</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Live Alerts</p>
                <p className={`text-2xl font-bold ${criticalAlerts.length > 0 ? 'text-red-500' : 'text-gray-500'}`}>
                  {alerts.length}
                </p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${criticalAlerts.length > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="storylines">
            Storylines
            <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">
              {storylines.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="predictive">
            Predictive Analytics
            {criticalAlerts.length > 0 && (
              <Badge className="ml-2 bg-red-100 text-red-800 text-xs">
                {criticalAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="realtime">Real-time Data</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Platform Breakdown with actual data */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-6 w-6 text-wrestling-electric" />
                <span>Platform Breakdown</span>
                <Badge variant="secondary">
                  {newsItems.length + redditPosts.length + tweets.length + videos.length} total sources
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PlatformBreakdown sources={[
                ...newsItems.map(item => ({ type: 'news', ...item })),
                ...redditPosts.map(post => ({ type: 'reddit', ...post })),
                ...tweets.map(tweet => ({ type: 'twitter', ...tweet })),
                ...videos.map(video => ({ type: 'youtube', ...video }))
              ]} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storylines" className="space-y-6">
          <UnifiedStorylinesHub />
        </TabsContent>

        <TabsContent value="predictive" className="space-y-6">
          <PredictiveAnalyticsDashboard
            trends={trends}
            alerts={alerts}
            storylines={storylines}
            onRefresh={refetchAnalytics}
            isLoading={analyticsLoading}
          />
        </TabsContent>

        <TabsContent value="realtime" className="space-y-6">
          <TopWrestlingTweets />
        </TabsContent>
      </Tabs>
    </div>
  );
};
