
import React, { useState, useEffect } from 'react';
import { useSupabaseWrestlers } from '@/hooks/useSupabaseWrestlers';
import { useRSSFeeds } from '@/hooks/useWrestlingData';
import { useEnhancedWrestlerMetrics } from '@/hooks/useEnhancedWrestlerMetrics';
import { enhancedWrestlerMetricsService } from '@/services/enhancedWrestlerMetricsService';
import { WrestlerDetailModal } from './dashboard/wrestler-tracker/WrestlerDetailModal';
import { PromotionHeatmap } from './storyline/PromotionHeatmap';
import { PlatformBreakdown } from './storyline/PlatformBreakdown';
import { useStorylineAnalysis } from '@/hooks/useAdvancedAnalytics';
import { useRedditPosts } from '@/hooks/useWrestlingData';

// Import new components
import { DashboardHeader } from './wrestler-intelligence/DashboardHeader';
import { AutoProcessingIndicator } from './wrestler-intelligence/AutoProcessingIndicator';
import { DashboardFiltersEnhanced } from './wrestler-intelligence/DashboardFiltersEnhanced';
import { WrestlerAnalyticsCard } from './wrestler-intelligence/WrestlerAnalyticsCard';

// Import new hooks
import { useWrestlerFiltering } from '@/hooks/useWrestlerFiltering';
import { useWrestlerDataProcessing } from '@/hooks/useWrestlerDataProcessing';

export const WrestlerIntelligenceDashboard = () => {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedPromotion, setSelectedPromotion] = useState('all');
  const [sortBy, setSortBy] = useState('mentions');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWrestler, setSelectedWrestler] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessingMetrics, setIsProcessingMetrics] = useState(false);
  const [hasProcessedOnLoad, setHasProcessedOnLoad] = useState(false);

  // Data hooks
  const { data: wrestlers = [], isLoading: wrestlersLoading } = useSupabaseWrestlers();
  const { data: newsItems = [], isLoading: newsLoading, refetch: refetchNews } = useRSSFeeds();
  const { data: enhancedMetrics = [], isLoading: metricsLoading, refetch: refetchMetrics } = useEnhancedWrestlerMetrics();
  const { data: storylines = [] } = useStorylineAnalysis();
  const { data: redditPosts = [] } = useRedditPosts();

  // Custom hooks for data processing
  const applyFiltersAndSorting = useWrestlerFiltering(searchTerm, selectedPromotion, sortBy);
  const processedWrestlers = useWrestlerDataProcessing(wrestlers, enhancedMetrics, applyFiltersAndSorting);

  // Auto-process metrics when data is available and hasn't been processed yet
  useEffect(() => {
    const shouldAutoProcess = !hasProcessedOnLoad && 
                            wrestlers.length > 0 && 
                            newsItems.length > 0 && 
                            enhancedMetrics.length === 0 && 
                            !isProcessingMetrics;

    if (shouldAutoProcess) {
      console.log('Auto-processing metrics on load...');
      setHasProcessedOnLoad(true);
      handleProcessMetrics();
    }
  }, [wrestlers, newsItems, enhancedMetrics, hasProcessedOnLoad, isProcessingMetrics]);

  // Process news for wrestler mentions when news data changes
  useEffect(() => {
    if (newsItems.length > 0 && wrestlers.length > 0) {
      console.log('Processing news for wrestler mentions...');
      enhancedWrestlerMetricsService.processNewsForMentions(newsItems, wrestlers);
    }
  }, [newsItems, wrestlers]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchNews(),
      refetchMetrics()
    ]);
    setLastUpdate(new Date());
    setIsRefreshing(false);
  };

  const handleProcessMetrics = async () => {
    setIsProcessingMetrics(true);
    try {
      console.log('Triggering metrics calculation...');
      await enhancedWrestlerMetricsService.triggerMetricsCalculation();
      
      // Wait a moment for processing, then refresh
      setTimeout(async () => {
        console.log('Refreshing metrics after processing...');
        await refetchMetrics();
        setIsProcessingMetrics(false);
      }, 3000);
    } catch (error) {
      console.error('Error processing metrics:', error);
      setIsProcessingMetrics(false);
    }
  };

  const handleWrestlerClick = (wrestler: any) => {
    setSelectedWrestler(wrestler);
    setIsModalOpen(true);
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

  const isLoading = wrestlersLoading || newsLoading || metricsLoading;
  const availablePromotions = [...new Set(processedWrestlers.map(w => w.promotion))];
  const hasRealData = enhancedMetrics.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        {/* Header */}
        <DashboardHeader
          hasRealData={hasRealData}
          isProcessingMetrics={isProcessingMetrics}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          lastUpdate={lastUpdate}
          onProcessMetrics={handleProcessMetrics}
          onRefresh={handleRefresh}
        />

        {/* Auto-processing indicator */}
        <AutoProcessingIndicator
          hasRealData={hasRealData}
          isProcessingMetrics={isProcessingMetrics}
          wrestlersCount={wrestlers.length}
          newsItemsCount={newsItems.length}
        />

        {/* Enhanced Filters */}
        <DashboardFiltersEnhanced
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedPromotion={selectedPromotion}
          onPromotionChange={setSelectedPromotion}
          sortBy={sortBy}
          onSortChange={setSortBy}
          availablePromotions={availablePromotions}
          wrestlerCount={processedWrestlers.length}
        />

        {/* Enhanced Wrestler Analytics */}
        <WrestlerAnalyticsCard
          isLoading={isLoading}
          processedWrestlers={processedWrestlers}
          hasRealData={hasRealData}
          newsItemsCount={newsItems.length}
          onWrestlerClick={handleWrestlerClick}
          onRefresh={handleRefresh}
        />

        {/* Wrestler Detail Modal */}
        <WrestlerDetailModal
          wrestler={selectedWrestler}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />

        {/* 2nd and 3rd Sections: Wrestling Promotion Heatmap and Wrestling Hashtags Analytics */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 lg:gap-8">
          <div className="xl:col-span-3">
            <PromotionHeatmap 
              storylines={storylines}
              redditPosts={redditPosts}
              newsItems={newsItems}
              onPromotionClick={handlePromotionClick}
            />
          </div>
          <div className="xl:col-span-2">
            <PlatformBreakdown 
              redditPosts={redditPosts}
              newsItems={newsItems}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
