
import React, { useState, useEffect } from 'react';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { AutoProcessingIndicator } from './dashboard/AutoProcessingIndicator';
import { DashboardFiltersEnhanced } from './dashboard/DashboardFiltersEnhanced';
import { WrestlerAnalyticsCard } from './wrestler-intelligence/WrestlerAnalyticsCard';
import { WrestlerDetailModal } from './dashboard/wrestler-tracker/WrestlerDetailModal';
import { useSupabaseWrestlers } from '@/hooks/useSupabaseWrestlers';
import { useRSSFeeds } from '@/hooks/useWrestlingData';
import { useWrestlerFiltering } from '@/hooks/useWrestlerFiltering';
import { useWrestlerDataProcessing } from '@/hooks/useWrestlerDataProcessing';

export const WrestlerIntelligenceDashboard = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(new Date());
  const [selectedWrestler, setSelectedWrestler] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Data hooks
  const { data: wrestlers = [], isLoading: wrestlersLoading } = useSupabaseWrestlers();
  const { data: newsItems = [], isLoading: newsLoading, refetch: refetchNews } = useRSSFeeds();

  // Use the enhanced wrestler filtering and data processing
  const {
    filteredWrestlers,
    searchTerm,
    setSearchTerm,
    selectedPromotion,
    setSelectedPromotion,
    minMentions,
    setMinMentions,
    sortBy,
    setSortBy
  } = useWrestlerFiltering(wrestlers);

  const {
    processedWrestlers,
    isProcessing,
    hasRealData,
    forceRefresh
  } = useWrestlerDataProcessing(filteredWrestlers, newsItems);

  // Handle refresh
  const handleRefresh = async () => {
    console.log('Manual refresh triggered');
    await refetchNews();
    await forceRefresh();
    setRefreshTrigger(new Date());
  };

  // Handle wrestler click for detailed view
  const handleWrestlerClick = (wrestler: any) => {
    console.log('Wrestler clicked for detailed view:', wrestler.wrestler_name);
    setSelectedWrestler(wrestler);
    setShowDetailModal(true);
  };

  const isLoading = wrestlersLoading || newsLoading || isProcessing;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Dashboard Header */}
        <DashboardHeader 
          onRefresh={handleRefresh}
          isLoading={isLoading}
          lastUpdate={refreshTrigger}
        />

        {/* Auto Processing Indicator */}
        <AutoProcessingIndicator 
          isProcessing={isProcessing}
          hasRealData={hasRealData}
          lastUpdate={refreshTrigger}
        />

        {/* Enhanced Filters */}
        <DashboardFiltersEnhanced
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedPromotion={selectedPromotion}
          setSelectedPromotion={setSelectedPromotion}
          minMentions={minMentions}
          setMinMentions={setMinMentions}
          sortBy={sortBy}
          setSortBy={setSortBy}
          wrestlers={wrestlers}
        />

        {/* Main Analytics Card */}
        <WrestlerAnalyticsCard
          isLoading={isLoading}
          processedWrestlers={processedWrestlers}
          hasRealData={hasRealData}
          newsItemsCount={newsItems.length}
          onWrestlerClick={handleWrestlerClick}
          onRefresh={handleRefresh}
        />

        {/* Enhanced Status Info */}
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <div className="font-medium">
            {hasRealData 
              ? `Live analytics processing ${processedWrestlers.length} wrestlers with real data`
              : `System ready - monitoring ${wrestlers.length} wrestlers across ${newsItems.length} news sources`
            }
          </div>
          <div>
            Enhanced sentiment analysis • Source credibility weighting • Real-time metrics tracking
          </div>
          {hasRealData && (
            <div className="text-emerald-600 text-xs">
              ✓ Data collection active • Last update: {refreshTrigger.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Detail Modal */}
      {showDetailModal && selectedWrestler && (
        <WrestlerDetailModal
          wrestler={selectedWrestler}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  );
};
