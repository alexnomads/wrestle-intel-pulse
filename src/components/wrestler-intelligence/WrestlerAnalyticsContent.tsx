
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, AlertTriangle, RefreshCw, Info } from 'lucide-react';
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
  // Only show loading on initial load when no wrestlers exist at all
  const shouldShowLoading = isLoading && processedWrestlers.length === 0 && !hasRealData;
  
  if (shouldShowLoading) {
    return (
      <div className="flex items-center justify-center py-16 lg:py-20">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-wrestling-electric" />
          <span className="text-lg">Setting up enhanced analytics for wrestling data. This will take a moment...</span>
          <Button onClick={onRefresh} variant="outline" className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>
    );
  }

  // Show empty state only when not loading and genuinely no wrestlers available
  if (!isLoading && processedWrestlers.length === 0 && !hasRealData) {
    return (
      <div className="text-center py-16 lg:py-20">
        <AlertTriangle className="h-16 w-16 mx-auto mb-6 text-yellow-400 opacity-50" />
        <h3 className="text-xl font-semibold mb-3">No Wrestler Data Available</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          No wrestlers found matching current filters. Try adjusting your search criteria or refresh the data.
        </p>
        <Button onClick={onRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
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
              wrestler_name: wrestler.wrestler_name,
              name: wrestler.name,
              promotion: wrestler.promotion,
              is_champion: wrestler.isChampion,
              championship_title: wrestler.championshipTitle,
              brand: wrestler.brand
            }}
            metrics={{
              push_score: wrestler.pushScore || 0,
              burial_score: wrestler.burialScore || 0,
              momentum_score: wrestler.momentumScore || 0,
              popularity_score: wrestler.popularityScore || 0,
              confidence_level: wrestler.confidence_level || 'low',
              mention_count: wrestler.mention_count || wrestler.totalMentions || 0,
              data_sources: wrestler.data_sources || {
                total_mentions: wrestler.totalMentions || 0,
                tier_1_mentions: 0,
                tier_2_mentions: 0,
                tier_3_mentions: 0,
                hours_since_last_mention: 999,
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
          <div className="text-sm text-muted-foreground">Active Wrestlers</div>
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

      {/* Data source info */}
      <div className="mt-8 text-center text-sm text-muted-foreground space-y-2">
        <div className="font-medium">
          {hasRealData 
            ? `Live analytics for ${processedWrestlers.length} wrestlers`
            : `Building analytics for ${processedWrestlers.length} wrestlers`
          }
        </div>
        <div>
          {hasRealData 
            ? 'Source-weighted sentiment analysis • Historical trend tracking • Real-time updates'
            : 'Processing news sources • Analyzing sentiment • Building confidence metrics'
          }
        </div>
        <div className="flex items-center justify-center space-x-1 text-emerald-600">
          <Info className="h-3 w-3" />
          <span className="text-xs">Click any wrestler for detailed analytics</span>
        </div>
      </div>
    </>
  );
};
