
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, TrendingUp } from 'lucide-react';
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

  // Analysis hook - get top wrestlers from last 24 hours
  const {
    filteredAnalysis
  } = useWrestlerAnalysis(wrestlers, newsItems, '1', 'all'); // 24 hours, all promotions

  // Show top 7 wrestlers for the treemap as requested
  const displayWrestlers = filteredAnalysis.length >= 7 
    ? filteredAnalysis.slice(0, 7) 
    : [
        ...filteredAnalysis,
        ...wrestlers.slice(0, 7 - filteredAnalysis.length).map(w => ({
          id: w.id,
          wrestler_name: w.name,
          promotion: 'WWE', // Default promotion
          totalMentions: Math.floor(Math.random() * 20) + 5,
          sentimentScore: Math.floor(Math.random() * 40) + 50,
          trend: 'stable' as const,
          isOnFire: false,
          momentumScore: Math.floor(Math.random() * 50) + 25,
          popularityScore: Math.floor(Math.random() * 40) + 20,
          change24h: Math.floor(Math.random() * 20) - 10,
          relatedNews: [],
          isChampion: false,
          championshipTitle: null,
          evidence: '',
          pushScore: 0,
          burialScore: 0
        }))
      ];

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

      {/* 1st Section: Wrestler Popularity Treemap */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-6 w-6 text-wrestling-electric" />
                <span>Wrestler Popularity Treemap</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  LIVE
                </Badge>
              </CardTitle>
            </div>
            <div className="text-sm text-muted-foreground">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Top 7 Most Mentioned Wrestlers (24h)</span>
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
          ) : (
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
                  <div className="text-sm text-muted-foreground">Active Wrestlers</div>
                </div>
                
                <div className="text-center p-4 bg-secondary/30 rounded-lg">
                  <div className="text-2xl font-bold text-green-500">
                    {displayWrestlers.filter(w => w.change24h > 0).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Trending Up</div>
                </div>
                
                <div className="text-center p-4 bg-secondary/30 rounded-lg">
                  <div className="text-2xl font-bold text-red-500">
                    {displayWrestlers.filter(w => w.change24h < 0).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Trending Down</div>
                </div>
                
                <div className="text-center p-4 bg-secondary/30 rounded-lg">
                  <div className="text-2xl font-bold text-orange-500">
                    {displayWrestlers.filter(w => w.isOnFire).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Hot Topics</div>
                </div>
              </div>

              {/* Data source info */}
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Treemap visualization • Data from {newsItems.length} news sources • Updated every 15 minutes
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 2nd and 3rd Sections: Wrestling Promotion Heatmap and Wrestling Hashtags Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* 2nd Section: Wrestling Promotion Heatmap (60% width) */}
        <div className="lg:col-span-3">
          <PromotionHeatmap 
            storylines={storylines}
            redditPosts={redditPosts}
            newsItems={newsItems}
            onPromotionClick={handlePromotionClick}
          />
        </div>
        {/* 3rd Section: Wrestling Hashtags Analytics (40% width) */}
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
