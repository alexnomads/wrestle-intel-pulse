
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, TrendingUp, Users, Zap, Target, AlertTriangle } from 'lucide-react';
import { useUnifiedData } from '@/hooks/useUnifiedData';
import { usePredictiveAnalytics } from '@/hooks/usePredictiveAnalytics';
import { WrestlerHeatmap } from './analytics/WrestlerHeatmap';
import { PlatformBreakdown } from './analytics/PlatformBreakdown';
import { PredictiveAnalyticsDashboard } from './analytics/PredictiveAnalyticsDashboard';
import TopWrestlingTweets from './dashboard/TopWrestlingTweets';
import { UnifiedStorylinesHub } from './storylines/UnifiedStorylinesHub';

export const MainAnalyticsDashboard = () => {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  const { data, isLoading, error, refetch } = useUnifiedData();
  const { 
    trends, 
    storylines, 
    alerts, 
    isLoading: analyticsLoading, 
    refetch: refetchAnalytics 
  } = usePredictiveAnalytics();

  const handleRefresh = async () => {
    await Promise.all([refetch(), refetchAnalytics()]);
    setLastUpdate(new Date());
  };

  if (isLoading && analyticsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <RefreshCw className="h-6 w-6 animate-spin text-wrestling-electric" />
          <span className="text-lg">Loading wrestling analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Error loading data</p>
        <Button onClick={handleRefresh}>Try Again</Button>
      </div>
    );
  }

  const { sources = [], wrestlerMentions = [] } = data || {};

  // Transform wrestlerMentions to the format expected by WrestlerHeatmap
  const wrestlerMentionCounts = wrestlerMentions.reduce((acc, mention) => {
    if (!mention?.wrestler_name) return acc;
    
    const existing = acc.find(w => w.wrestler_name === mention.wrestler_name);
    if (existing) {
      existing.mentions += 1;
      existing.mention_sources?.push(mention);
    } else {
      acc.push({
        id: mention.id || `wrestler-${mention.wrestler_name?.replace(/\s+/g, '-').toLowerCase()}`,
        wrestler_name: mention.wrestler_name,
        mentions: 1,
        sentiment: mention.sentiment_score || 0.5,
        promotion: 'WWE', // Default promotion
        mention_sources: [mention],
        source_breakdown: {
          news_count: mention.source_type === 'news' ? 1 : 0,
          reddit_count: mention.source_type === 'reddit' ? 1 : 0,
          total_sources: 1
        }
      });
    }
    return acc;
  }, [] as any[]);

  // Update source breakdown for wrestlers with multiple mentions
  wrestlerMentionCounts.forEach(wrestler => {
    if (wrestler.mention_sources && wrestler.mention_sources.length > 1) {
      wrestler.source_breakdown = {
        news_count: wrestler.mention_sources.filter((m: any) => m.source_type === 'news').length,
        reddit_count: wrestler.mention_sources.filter((m: any) => m.source_type === 'reddit').length,
        total_sources: wrestler.mention_sources.length
      };
    }
  });

  // Get high priority alerts for quick stats
  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical' || alert.severity === 'high');
  const risingTrends = trends.filter(trend => trend.trending_direction === 'rising').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h1 className="text-3xl font-bold text-foreground">Wrestling Analytics</h1>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            LIVE
          </Badge>
          {criticalAlerts.length > 0 && (
            <Badge className="bg-red-100 text-red-800 border-red-200">
              {criticalAlerts.length} Alert{criticalAlerts.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isLoading || analyticsLoading}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading || analyticsLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Enhanced Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sources</p>
                <p className="text-2xl font-bold text-wrestling-electric">{sources.length}</p>
              </div>
              <Zap className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Trending Wrestlers</p>
                <p className="text-2xl font-bold text-green-500">{wrestlerMentionCounts.length}</p>
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
          {/* Core Feature 1: Top Mentioned Wrestlers with Heatmap */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-wrestling-electric" />
                <span>Top Mentioned Wrestlers</span>
                <Badge variant="secondary">{wrestlerMentionCounts.length} wrestlers</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WrestlerHeatmap wrestlerMentions={wrestlerMentionCounts} />
            </CardContent>
          </Card>

          {/* Platform Breakdown */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-6 w-6 text-wrestling-electric" />
                <span>Platform Breakdown</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PlatformBreakdown sources={sources} />
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
