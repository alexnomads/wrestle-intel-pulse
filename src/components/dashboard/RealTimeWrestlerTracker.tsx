
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, TrendingUp } from 'lucide-react';
import { useSupabaseWrestlers } from '@/hooks/useSupabaseWrestlers';
import { useRSSFeeds } from '@/hooks/useWrestlingData';
import { useWrestlerAnalysis } from '@/hooks/useWrestlerAnalysis';

interface Props {
  refreshTrigger?: Date;
}

export const RealTimeWrestlerTracker: React.FC<Props> = ({ refreshTrigger }) => {
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Data hooks
  const { data: wrestlers = [], isLoading: wrestlersLoading } = useSupabaseWrestlers();
  const { data: newsItems = [], isLoading: newsLoading, refetch } = useRSSFeeds();

  // Analysis hook - get top wrestlers from last 24 hours
  const {
    filteredAnalysis
  } = useWrestlerAnalysis(wrestlers, newsItems, '1', 'all'); // 24 hours, all promotions

  // Show top trending wrestlers in a simpler format for overview
  const topWrestlers = filteredAnalysis.slice(0, 10);

  const handleRefresh = async () => {
    await refetch();
    setLastUpdate(new Date());
  };

  // Auto-refresh effect
  useEffect(() => {
    if (refreshTrigger) {
      setLastUpdate(refreshTrigger);
    }
  }, [refreshTrigger]);

  const isLoading = wrestlersLoading || newsLoading;

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-6 w-6 text-wrestling-electric" />
              <span>Real-Time Wrestler Popularity Tracker</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                LIVE
              </Badge>
            </CardTitle>
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
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Top {topWrestlers.length} Trending Wrestlers</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <RefreshCw className="h-6 w-6 animate-spin text-wrestling-electric" />
              <span className="text-lg">Loading wrestler data...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Simple list view for overview */}
            <div className="space-y-3">
              {topWrestlers.map((wrestler, index) => (
                <div key={wrestler.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-lg font-bold text-wrestling-electric">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-semibold">{wrestler.wrestler_name}</div>
                      <div className="text-sm text-muted-foreground">{wrestler.promotion}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{wrestler.totalMentions} mentions</div>
                    <div className={`text-sm ${wrestler.change24h > 0 ? 'text-green-500' : wrestler.change24h < 0 ? 'text-red-500' : 'text-yellow-500'}`}>
                      {wrestler.change24h > 0 ? '+' : ''}{wrestler.change24h}%
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center p-4 bg-secondary/30 rounded-lg">
                <div className="text-2xl font-bold text-wrestling-electric">
                  {topWrestlers.length}
                </div>
                <div className="text-sm text-muted-foreground">Active Wrestlers</div>
              </div>
              
              <div className="text-center p-4 bg-secondary/30 rounded-lg">
                <div className="text-2xl font-bold text-green-500">
                  {topWrestlers.filter(w => w.change24h > 0).length}
                </div>
                <div className="text-sm text-muted-foreground">Trending Up</div>
              </div>
              
              <div className="text-center p-4 bg-secondary/30 rounded-lg">
                <div className="text-2xl font-bold text-red-500">
                  {topWrestlers.filter(w => w.change24h < 0).length}
                </div>
                <div className="text-sm text-muted-foreground">Trending Down</div>
              </div>
              
              <div className="text-center p-4 bg-secondary/30 rounded-lg">
                <div className="text-2xl font-bold text-orange-500">
                  {topWrestlers.filter(w => w.isOnFire).length}
                </div>
                <div className="text-sm text-muted-foreground">Hot Topics</div>
              </div>
            </div>

            {/* Data source info */}
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Data aggregated from {newsItems.length} news sources • Updated every 15 minutes
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
