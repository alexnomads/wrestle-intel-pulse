
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, Users, Zap } from 'lucide-react';
import { useUnifiedData } from '@/hooks/useUnifiedData';
import { WrestlerHeatmap } from './analytics/WrestlerHeatmap';
import { StorylinesList } from './analytics/StorylinesList';
import { PlatformBreakdown } from './analytics/PlatformBreakdown';

export const MainAnalyticsDashboard = () => {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const { data, isLoading, error, refetch } = useUnifiedData();

  const handleRefresh = async () => {
    await refetch();
    setLastUpdate(new Date());
  };

  if (isLoading) {
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

  const { sources = [], wrestlerMentions = [], storylines = [] } = data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h1 className="text-3xl font-bold text-foreground">Wrestling Analytics</h1>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            LIVE
          </Badge>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <p className="text-2xl font-bold text-green-500">{wrestlerMentions.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
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
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="text-sm font-medium">{lastUpdate.toLocaleTimeString()}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Core Feature 1: Top Mentioned Wrestlers with Heatmap */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-wrestling-electric" />
            <span>Top Mentioned Wrestlers</span>
            <Badge variant="secondary">{wrestlerMentions.length} wrestlers</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WrestlerHeatmap wrestlerMentions={wrestlerMentions} />
        </CardContent>
      </Card>

      {/* Core Feature 2 & 3: Storylines and Platform Data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-6 w-6 text-wrestling-electric" />
                <span>Top Storylines</span>
                <Badge variant="secondary">{storylines.length} active</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StorylinesList storylines={storylines} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="glass-card h-full">
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
        </div>
      </div>
    </div>
  );
};
