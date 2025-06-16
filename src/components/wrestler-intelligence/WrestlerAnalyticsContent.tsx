
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, AlertTriangle, RefreshCw, Info, Search } from 'lucide-react';
import { EnhancedWrestlerCard } from './EnhancedWrestlerCard';

interface WrestlerAnalyticsContentProps {
  isLoading: boolean;
  processedWrestlers: any[];
  hasRealData: boolean;
  newsItemsCount: number;
  onWrestlerClick: (wrestler: any) => void;
  onRefresh: () => void;
}

export const WrestlerAnalyticsContent = ({
  isLoading,
  processedWrestlers,
  hasRealData,
  newsItemsCount,
  onWrestlerClick,
  onRefresh
}: WrestlerAnalyticsContentProps) => {
  console.log('🎨 WrestlerAnalyticsContent render:', {
    isLoading,
    processedWrestlersCount: processedWrestlers.length,
    hasRealData,
    newsItemsCount
  });

  // Only show loading when we truly have no data and are loading for the first time
  const shouldShowLoading = isLoading && processedWrestlers.length === 0;
  
  if (shouldShowLoading) {
    return (
      <div className="flex items-center justify-center py-16 lg:py-20">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-wrestling-electric" />
          <span className="text-lg">Analyzing wrestler mentions in news...</span>
          <div className="text-sm text-muted-foreground text-center max-w-md">
            Processing {newsItemsCount} news articles to find wrestler mentions and calculate analytics
          </div>
          <Button onClick={onRefresh} variant="outline" className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>
    );
  }

  // Show empty state when we have no wrestlers and aren't loading
  if (processedWrestlers.length === 0 && !isLoading) {
    return (
      <div className="text-center py-16 lg:py-20">
        <Search className="h-16 w-16 mx-auto mb-6 text-blue-400 opacity-50" />
        <h3 className="text-xl font-semibold mb-3">No Wrestler Mentions Found</h3>
        <div className="text-muted-foreground mb-6 max-w-2xl mx-auto space-y-2">
          <p>
            We've analyzed {newsItemsCount} news articles but haven't found any mentions of wrestlers in your roster.
          </p>
          <p className="text-sm">
            This could mean:
          </p>
          <ul className="text-sm list-disc list-inside space-y-1 max-w-md mx-auto">
            <li>The news articles don't contain wrestler names we can recognize</li>
            <li>The wrestler names in your roster don't match how they're mentioned in news</li>
            <li>There might not be recent wrestling news in the current feed</li>
          </ul>
        </div>
        <div className="space-y-4">
          <Button onClick={onRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Analysis
          </Button>
          <div className="text-xs text-muted-foreground">
            Try refreshing to get newer articles, or check back later when there's more wrestling news
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Enhanced Wrestler Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {processedWrestlers.map((wrestler) => (
          <EnhancedWrestlerCard
            key={wrestler.id}
            wrestler={{
              id: wrestler.id,
              wrestler_name: wrestler.wrestler_name || wrestler.name,
              name: wrestler.wrestler_name || wrestler.name,
              promotion: wrestler.promotion,
              is_champion: wrestler.isChampion,
              championship_title: wrestler.championshipTitle,
              brand: wrestler.brand || wrestler.promotion
            }}
            metrics={{
              push_score: wrestler.pushScore || 0,
              burial_score: wrestler.burialScore || 0,
              momentum_score: wrestler.momentumScore || 0,
              popularity_score: wrestler.popularityScore || 0,
              confidence_level: wrestler.confidence_level || 'medium',
              mention_count: wrestler.mention_count || wrestler.totalMentions || 0,
              data_sources: wrestler.data_sources || {
                total_mentions: wrestler.totalMentions || 0,
                tier_1_mentions: 0,
                tier_2_mentions: wrestler.totalMentions || 0,
                tier_3_mentions: 0,
                hours_since_last_mention: 24,
                source_breakdown: {}
              },
              last_updated: wrestler.last_updated || new Date().toISOString()
            }}
            onWrestlerClick={onWrestlerClick}
          />
        ))}
      </div>

      {/* Enhanced Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="text-center p-4 lg:p-6 bg-secondary/30 rounded-lg border border-border/50">
          <div className="text-xl lg:text-2xl font-bold text-wrestling-electric">
            {processedWrestlers.length}
          </div>
          <div className="text-sm text-muted-foreground">With Mentions</div>
        </div>
        
        <div className="text-center p-4 lg:p-6 bg-secondary/30 rounded-lg border border-border/50">
          <div className="text-xl lg:text-2xl font-bold text-emerald-500">
            {processedWrestlers.filter(w => (w.pushScore || 0) >= 70).length}
          </div>
          <div className="text-sm text-muted-foreground">High Push Score</div>
        </div>
        
        <div className="text-center p-4 lg:p-6 bg-secondary/30 rounded-lg border border-border/50">
          <div className="text-xl lg:text-2xl font-bold text-blue-500">
            {processedWrestlers.filter(w => w.confidence_level === 'high').length}
          </div>
          <div className="text-sm text-muted-foreground">High Confidence</div>
        </div>
        
        <div className="text-center p-4 lg:p-6 bg-secondary/30 rounded-lg border border-border/50">
          <div className="text-xl lg:text-2xl font-bold text-orange-500">
            {processedWrestlers.filter(w => w.isOnFire).length}
          </div>
          <div className="text-sm text-muted-foreground">Hot Topics</div>
        </div>
      </div>

      {/* Data source info with more detail */}
      <div className="mt-8 text-center text-sm text-muted-foreground space-y-2">
        <div className="font-medium">
          Live analytics for {processedWrestlers.length} wrestlers from {newsItemsCount} news sources
        </div>
        <div>
          Advanced name matching • Real-time sentiment analysis • Source credibility weighting
        </div>
        <div className="flex items-center justify-center space-x-1 text-emerald-600">
          <Info className="h-3 w-3" />
          <span className="text-xs">
            Only wrestlers mentioned in recent news are shown • Click any wrestler for detailed analytics
          </span>
        </div>
      </div>
    </>
  );
};
