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

  // Analysis hook - only show wrestlers with real mentions
  const {
    filteredAnalysis
  } = useWrestlerAnalysis(wrestlers, newsItems, '1', 'all');

  // Only display wrestlers that have actual mentions from real news sources
  const displayWrestlers = filteredAnalysis.filter(w => (w.mention_sources?.length || 0) > 0);

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
            LIVE DATA ONLY
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

      {/* 1st Section: Wrestler Popularity Treemap */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-6 w-6 text-wrestling-electric" />
                <span>Wrestler Popularity Treemap</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  REAL MENTIONS ONLY
                </Badge>
              </CardTitle>
            </div>
            <div className="text-sm text-muted-foreground">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Wrestling News Mentions (24h) - Real Data Only</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live wrestling news analysis</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <RefreshCw className="h-6 w-6 animate-spin text-wrestling-electric" />
                <span className="text-lg">Loading real wrestler data...</span>
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
                  <div className="text-sm text-muted-foreground">Wrestlers Mentioned</div>
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
                Real-time treemap visualization • {displayWrestlers.length} wrestlers with verified news mentions • 
                Data from {newsItems.length} wrestling news sources • Updated every 15 minutes
              </div>
            </>
          ) : (
            // No wrestlers with real mentions found
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Current Wrestling Mentions</h3>
              <p className="text-muted-foreground mb-4">
                No wrestlers are being mentioned in recent wrestling news ({newsItems.length} articles analyzed).
                The treemap will populate automatically when wrestlers are mentioned in new articles.
              </p>
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Database className="h-4 w-4 text-green-500" />
                  <span className="text-green-600">{newsItems.length} news sources active</span>
                </div>
              </div>
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
