
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Hash, Clock, BarChart3, Zap } from 'lucide-react';
import { enhancedTwitterAnalytics, EnhancedTwitterMetrics } from '@/services/enhancedTwitterService';

interface TwitterAnalyticsDashboardProps {
  metrics: EnhancedTwitterMetrics;
}

export const TwitterAnalyticsDashboard: React.FC<TwitterAnalyticsDashboardProps> = ({ metrics }) => {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {/* Total Engagement */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(metrics.totalEngagement)}</div>
          <p className="text-xs text-muted-foreground">
            Avg {formatNumber(metrics.avgEngagementPerTweet)} per tweet
          </p>
        </CardContent>
      </Card>

      {/* Top Performing Account */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Account</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">@{metrics.topPerformingAccount}</div>
          <p className="text-xs text-muted-foreground">
            Highest total engagement
          </p>
        </CardContent>
      </Card>

      {/* Peak Engagement Time */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Peak Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.peakEngagementTime}</div>
          <p className="text-xs text-muted-foreground">
            Most active period
          </p>
        </CardContent>
      </Card>

      {/* Trending Hashtags */}
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Trending Hashtags</CardTitle>
          <Hash className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {metrics.trendingHashtags.length > 0 ? (
              metrics.trendingHashtags.map((hashtag, index) => (
                <Badge key={hashtag} variant={index === 0 ? "default" : "secondary"}>
                  {hashtag}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">No trending hashtags</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Type Breakdown */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Account Types</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(metrics.accountTypeBreakdown)
              .filter(([_, count]) => count > 0)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-sm capitalize">{type}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))
            }
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
