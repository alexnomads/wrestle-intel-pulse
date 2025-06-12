
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, TrendingUp, BarChart3, Eye } from 'lucide-react';
import { useSupabaseWrestlers } from '@/hooks/useSupabaseWrestlers';
import { useRSSFeeds } from '@/hooks/useWrestlingData';
import { useWrestlerAnalysis } from '@/hooks/useWrestlerAnalysis';
import { WrestlerMentionsModal } from './wrestler-tracker/WrestlerMentionsModal';

interface Props {
  refreshTrigger?: Date;
}

export const RealTimeWrestlerTracker: React.FC<Props> = ({ refreshTrigger }) => {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedWrestler, setSelectedWrestler] = useState<any>(null);
  const [showMentionsModal, setShowMentionsModal] = useState(false);

  // Data hooks
  const { data: wrestlers = [], isLoading: wrestlersLoading } = useSupabaseWrestlers();
  const { data: newsItems = [], isLoading: newsLoading, refetch } = useRSSFeeds();

  // Analysis hook - get wrestlers with actual mentions only
  const {
    filteredAnalysis
  } = useWrestlerAnalysis(wrestlers, newsItems, '1', 'all');

  // Only show wrestlers that actually have mentions from the news
  const displayWrestlers = filteredAnalysis.length > 0 ? filteredAnalysis : [];

  const handleWrestlerClick = (wrestler: any) => {
    setSelectedWrestler(wrestler);
    setShowMentionsModal(true);
  };

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
    <>
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-6 w-6 text-wrestling-electric" />
                <span>Wrestling Analytics Intelligence</span>
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
              <span>Real-Time Wrestling Performance Metrics (Sorted by Mentions) • Click to view mentions</span>
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
                <span className="text-lg">Loading analytics data...</span>
              </div>
            </div>
          ) : displayWrestlers.length > 0 ? (
            <>
              {/* Performance Metrics Grid */}
              <div className="space-y-4">
                {displayWrestlers.map((wrestler, index) => (
                  <div 
                    key={wrestler.id} 
                    className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border/50 hover:bg-secondary/50 cursor-pointer transition-colors group"
                    onClick={() => handleWrestlerClick(wrestler)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-lg font-bold text-wrestling-electric w-8">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-lg">{wrestler.wrestler_name}</div>
                        <div className="text-sm text-muted-foreground flex items-center space-x-2">
                          <span>{wrestler.promotion}</span>
                          <span>•</span>
                          <span className="font-medium text-wrestling-electric">{wrestler.totalMentions} mentions</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Momentum</div>
                        <div className="font-semibold">{wrestler.momentumScore}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Sentiment</div>
                        <div className="font-semibold">{wrestler.sentimentScore}%</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold text-lg ${wrestler.change24h > 0 ? 'text-green-500' : wrestler.change24h < 0 ? 'text-red-500' : 'text-yellow-500'}`}>
                          {wrestler.change24h > 0 ? '+' : ''}{wrestler.change24h}%
                        </div>
                        <div className="text-xs text-muted-foreground">24h change</div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced Stats Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center p-4 bg-secondary/30 rounded-lg">
                  <div className="text-2xl font-bold text-wrestling-electric">
                    {displayWrestlers.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Performers</div>
                </div>
                
                <div className="text-center p-4 bg-secondary/30 rounded-lg">
                  <div className="text-2xl font-bold text-green-500">
                    {displayWrestlers.filter(w => w.change24h > 0).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Rising Stars</div>
                </div>
                
                <div className="text-center p-4 bg-secondary/30 rounded-lg">
                  <div className="text-2xl font-bold text-red-500">
                    {displayWrestlers.filter(w => w.change24h < 0).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Declining</div>
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
                Performance analytics from {newsItems.length} sources • Real-time sentiment tracking • Updated every 15 minutes
              </div>
            </>
          ) : (
            // No wrestlers with mentions found
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Wrestling Mentions Found</h3>
              <p className="text-muted-foreground mb-4">
                No wrestlers were mentioned in the recent news articles ({newsItems.length} articles analyzed).
              </p>
              <Button onClick={handleRefresh} className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4" />
                <span>Refresh Data</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mentions Modal */}
      {showMentionsModal && selectedWrestler && (
        <WrestlerMentionsModal
          wrestler={selectedWrestler}
          newsItems={newsItems}
          onClose={() => setShowMentionsModal(false)}
        />
      )}
    </>
  );
};
