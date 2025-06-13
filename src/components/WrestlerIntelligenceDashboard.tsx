
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, TrendingUp, AlertTriangle, Database } from 'lucide-react';
import { useSupabaseWrestlers } from '@/hooks/useSupabaseWrestlers';
import { useRSSFeeds } from '@/hooks/useWrestlingData';
import { useWrestlerAnalysis } from '@/hooks/useWrestlerAnalysis';
import { useStorylineAnalysis } from '@/hooks/useAdvancedAnalytics';
import { useRedditPosts } from '@/hooks/useWrestlingData';
import { WrestlerCard } from './dashboard/wrestler-tracker/WrestlerCard';
import { PromotionHeatmap } from './storyline/PromotionHeatmap';
import { PlatformBreakdown } from './storyline/PlatformBreakdown';

export const WrestlerIntelligenceDashboard = () => {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedPromotion, setSelectedPromotion] = useState('all');

  // Data hooks
  const { data: wrestlers = [], isLoading: wrestlersLoading } = useSupabaseWrestlers();
  const { data: newsItems = [], isLoading: newsLoading, refetch } = useRSSFeeds();
  const { data: storylines = [] } = useStorylineAnalysis();
  const { data: redditPosts = [] } = useRedditPosts();

  // Analysis hook - get wrestlers with actual mentions only
  const {
    filteredAnalysis
  } = useWrestlerAnalysis(wrestlers, newsItems, '1', 'all');

  // Only show wrestlers that actually have mentions, limit to top 7 for treemap
  const displayWrestlers = filteredAnalysis.length > 0 ? filteredAnalysis.slice(0, 7) : [];

  // Calculate data quality metrics
  const realDataCount = displayWrestlers.filter(w => (w.mention_sources?.length || 0) > 0).length;
  const mockDataCount = displayWrestlers.length - realDataCount;
  const hasRealData = realDataCount > 0;

  const handleRefresh = async () => {
    await refetch();
    setLastUpdate(new Date());
  };

  const handlePromotionClick = (promotion: string) => {
    setSelectedPromotion(promotion.toLowerCase());
  };

  // Auto-refresh effect
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 15 * 60 * 1000); // 15 minutes

    return () => clearInterval(interval);
  }, []);

  const isLoading = wrestlersLoading || newsLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h2 className="text-3xl font-bold text-foreground">Wrestler Intelligence Dashboard</h2>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            TREEMAP VIEW
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

      {/* Data Quality Alert */}
      {!hasRealData && displayWrestlers.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-800">
                  Limited Real Data Available
                </p>
                <p className="text-xs text-orange-600">
                  Currently showing generated trend data. Real wrestling news analysis will appear when more sources are available.
                </p>
              </div>
              <div className="flex items-center space-x-2 text-xs text-orange-600">
                <Database className="h-4 w-4" />
                <span>{newsItems.length} news sources</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 1st Section: Wrestler Popularity Treemap */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-6 w-6 text-wrestling-electric" />
                <span>Wrestler Popularity Treemap</span>
                {hasRealData ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    LIVE DATA
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    TREND ANALYSIS
                  </Badge>
                )}
              </CardTitle>
            </div>
            <div className="text-sm text-muted-foreground">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Top Most Mentioned Wrestlers (24h)</span>
            </div>
            {!hasRealData && (
              <div className="flex items-center space-x-2 text-xs text-orange-600">
                <AlertTriangle className="h-3 w-3" />
                <span>Generated data - based on trending patterns</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <RefreshCw className="h-6 w-6 animate-spin text-wrestling-electric" />
                <span className="text-lg">Loading wrestler intelligence data...</span>
              </div>
            </div>
          ) : displayWrestlers.length > 0 ? (
            <>
              {/* Treemap Container */}
              <div className="mb-6">
                <div 
                  className="flex flex-wrap gap-3 justify-center items-start p-4 bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-lg border border-gray-700/30"
                  style={{ minHeight: '400px' }}
                >
                  {displayWrestlers.map((wrestler, index) => (
                    <WrestlerCard
                      key={wrestler.id}
                      wrestler={wrestler}
                      index={index}
                      totalWrestlers={displayWrestlers.length}
                    />
                  ))}
                </div>
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-secondary/30 rounded-lg">
                  <div className="text-2xl font-bold text-wrestling-electric">
                    {displayWrestlers.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Trending Wrestlers</div>
                </div>
                
                <div className="text-center p-4 bg-secondary/30 rounded-lg">
                  <div className="text-2xl font-bold text-green-500">
                    {displayWrestlers.filter(w => w.trend === 'push').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Being Pushed</div>
                </div>
                
                <div className="text-center p-4 bg-secondary/30 rounded-lg">
                  <div className="text-2xl font-bold text-blue-500">
                    {displayWrestlers.filter(w => w.trend === 'stable').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Stable</div>
                </div>
                
                <div className="text-center p-4 bg-secondary/30 rounded-lg">
                  <div className="text-2xl font-bold text-red-500">
                    {displayWrestlers.filter(w => w.trend === 'burial').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Being Buried</div>
                </div>
              </div>

              {/* Data source info */}
              <div className="mt-4 text-center text-sm text-muted-foreground">
                {hasRealData ? (
                  <>
                    Treemap visualization • {realDataCount} wrestlers with real data, {mockDataCount} with trend analysis • 
                    Data from {newsItems.length} news sources • Updated every 15 minutes
                  </>
                ) : (
                  <>
                    Treemap visualization • Trend analysis based on {newsItems.length} news sources • 
                    Real-time data will appear when more wrestling news is available
                  </>
                )}
              </div>
            </>
          ) : (
            // No wrestlers with mentions found
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Wrestling Data Available</h3>
              <p className="text-muted-foreground mb-4">
                No wrestlers were mentioned in recent news articles ({newsItems.length} articles analyzed).
                The treemap will update automatically when new wrestling news is available.
              </p>
              <Button onClick={handleRefresh} className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4" />
                <span>Refresh Data</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2nd and 3rd Sections: Wrestling Promotion Heatmap and Wrestling Hashtags Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <PromotionHeatmap 
            storylines={storylines}
            redditPosts={redditPosts}
            newsItems={newsItems}
            onPromotionClick={handlePromotionClick}
          />
        </div>
        <div className="lg:col-span-2">
          <PlatformBreakdown 
            redditPosts={redditPosts}
            newsItems={newsItems}
          />
        </div>
      </div>
    </div>
  );
};
