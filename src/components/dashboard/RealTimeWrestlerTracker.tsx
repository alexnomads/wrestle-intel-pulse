
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useSupabaseWrestlers } from '@/hooks/useSupabaseWrestlers';
import { useRSSFeeds } from '@/hooks/useWrestlingData';
import { useWrestlerAnalysis } from '@/hooks/useWrestlerAnalysis';
import { WrestlerMentionsModal } from './wrestler-tracker/WrestlerMentionsModal';
import { TrackerHeader } from './wrestler-tracker/components/TrackerHeader';
import { LoadingState } from './wrestler-tracker/components/LoadingState';
import { EmptyWrestlerState } from './wrestler-tracker/components/EmptyWrestlerState';
import { WrestlerListItem } from './wrestler-tracker/components/WrestlerListItem';
import { WrestlerStatsGrid } from './wrestler-tracker/components/WrestlerStatsGrid';

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

  // Analysis hook - get wrestlers with actual mentions only, request at least 10
  const {
    filteredAnalysis
  } = useWrestlerAnalysis(wrestlers, newsItems, '10', 'all');

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
        <TrackerHeader 
          lastUpdate={lastUpdate}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />

        <CardContent className="p-6">
          {isLoading ? (
            <LoadingState />
          ) : displayWrestlers.length > 0 ? (
            <>
              {/* Performance Metrics Grid */}
              <div className="space-y-4">
                {displayWrestlers.map((wrestler, index) => (
                  <WrestlerListItem
                    key={`${wrestler.id}-${wrestler.wrestler_name}`}
                    wrestler={wrestler}
                    index={index}
                    onWrestlerClick={handleWrestlerClick}
                  />
                ))}
              </div>

              <WrestlerStatsGrid wrestlers={displayWrestlers} />

              {/* Data source info */}
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Performance analytics from {newsItems.length} sources • Real-time sentiment tracking • Updated every 15 minutes
              </div>
            </>
          ) : (
            <EmptyWrestlerState 
              newsItemsCount={newsItems.length}
              onRefresh={handleRefresh}
            />
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
