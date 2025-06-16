
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { RefreshCw, Users, TrendingUp, AlertTriangle, Database, Filter, Search, Info } from 'lucide-react';
import { useSupabaseWrestlers } from '@/hooks/useSupabaseWrestlers';
import { useRSSFeeds } from '@/hooks/useWrestlingData';
import { useEnhancedWrestlerMetrics } from '@/hooks/useEnhancedWrestlerMetrics';
import { enhancedWrestlerMetricsService } from '@/services/enhancedWrestlerMetricsService';
import { EnhancedWrestlerCard } from './wrestler-intelligence/EnhancedWrestlerCard';
import { WrestlerDetailModal } from './dashboard/wrestler-tracker/WrestlerDetailModal';
import { PromotionHeatmap } from './storyline/PromotionHeatmap';
import { PlatformBreakdown } from './storyline/PlatformBreakdown';
import { useStorylineAnalysis } from '@/hooks/useAdvancedAnalytics';
import { useRedditPosts } from '@/hooks/useWrestlingData';

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

  // Define applyFiltersAndSorting function BEFORE using it in useMemo
  const applyFiltersAndSorting = React.useCallback((wrestlersList: any[]) => {
    let filtered = wrestlersList;

    if (searchTerm) {
      filtered = filtered.filter(wrestler =>
        wrestler.wrestler_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wrestler.promotion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedPromotion !== 'all') {
      filtered = filtered.filter(wrestler =>
        wrestler.promotion.toLowerCase().includes(selectedPromotion.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'mentions':
          return b.totalMentions - a.totalMentions;
        case 'sentiment':
          return b.sentimentScore - a.sentimentScore;
        case 'change':
          return b.change24h - a.change24h;
        case 'push':
          return b.pushScore - a.pushScore;
        case 'name':
          return a.wrestler_name.localeCompare(b.wrestler_name);
        default:
          return b.totalMentions - a.totalMentions;
      }
    });

    return filtered;
  }, [searchTerm, selectedPromotion, sortBy]);

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

  // Combine wrestler data with enhanced metrics
  const processedWrestlers = React.useMemo(() => {
    if (!wrestlers.length) {
      return [];
    }

    // If we have enhanced metrics, use them
    if (enhancedMetrics.length > 0) {
      const wrestlersWithMetrics = wrestlers.map(wrestler => {
        const metrics = enhancedMetrics.find(m => m.wrestler_id === wrestler.id);
        
        if (!metrics) {
          return null;
        }

        return {
          ...wrestler,
          ...metrics,
          wrestler_name: wrestler.name,
          promotion: wrestler.brand || 'Independent',
          totalMentions: metrics.mention_count,
          sentimentScore: Math.round((metrics.push_score - metrics.burial_score + 50)),
          pushScore: metrics.push_score,
          burialScore: metrics.burial_score,
          momentumScore: metrics.momentum_score,
          popularityScore: metrics.popularity_score,
          isOnFire: metrics.push_score >= 70 && metrics.momentum_score >= 70,
          trend: metrics.push_score > metrics.burial_score ? 'push' : 
                 metrics.burial_score > metrics.push_score ? 'burial' : 'stable',
          change24h: Math.round(metrics.momentum_score - 50),
        };
      }).filter(Boolean);

      return applyFiltersAndSorting(wrestlersWithMetrics);
    }

    // If no enhanced metrics yet, show all wrestlers with placeholder data
    const wrestlersWithDefaults = wrestlers.map(wrestler => ({
      ...wrestler,
      wrestler_name: wrestler.name,
      promotion: wrestler.brand || 'Independent',
      totalMentions: 0,
      sentimentScore: 50,
      pushScore: 0,
      burialScore: 0,
      momentumScore: 0,
      popularityScore: 0,
      isOnFire: false,
      trend: 'stable' as const,
      change24h: 0,
      confidence_level: 'low' as const,
      mention_count: 0,
      data_sources: {
        total_mentions: 0,
        tier_1_mentions: 0,
        tier_2_mentions: 0,
        tier_3_mentions: 0,
        hours_since_last_mention: 999,
        source_breakdown: {}
      },
      last_updated: new Date().toISOString()
    }));

    return applyFiltersAndSorting(wrestlersWithDefaults);
  }, [wrestlers, enhancedMetrics, applyFiltersAndSorting]);

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
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0 gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Wrestler Intelligence Dashboard
            </h2>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-300 whitespace-nowrap">
              {hasRealData ? 'LIVE DATA' : 'LOADING ANALYTICS'}
            </Badge>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <Button
              onClick={handleProcessMetrics}
              disabled={isProcessingMetrics}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 w-full sm:w-auto bg-wrestling-electric/10 border-wrestling-electric/40 hover:bg-wrestling-electric/20"
            >
              <Database className={`h-4 w-4 ${isProcessingMetrics ? 'animate-spin' : ''}`} />
              <span>{isProcessingMetrics ? 'Processing...' : 'Process Metrics'}</span>
            </Button>
            <Button
              onClick={handleRefresh}
              disabled={isLoading || isRefreshing}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 ${(isLoading || isRefreshing) ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            <div className="text-sm text-muted-foreground">
              Last: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Auto-processing indicator */}
        {!hasRealData && !isProcessingMetrics && wrestlers.length > 0 && (
          <Card className="border-blue-500/50 bg-blue-500/10">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="text-sm text-blue-300">
                  {newsItems.length > 0 
                    ? 'Auto-processing metrics with latest wrestling news...' 
                    : 'Loading wrestling news for automatic metrics processing...'
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Filters */}
        <Card className="glass-card border-slate-700/50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground whitespace-nowrap">
                <Filter className="h-4 w-4" />
                <span>Filters:</span>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
                <div className="flex items-center space-x-2 flex-1">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search wrestlers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <Select value={selectedPromotion} onValueChange={setSelectedPromotion}>
                    <SelectTrigger className="w-full sm:w-36">
                      <SelectValue placeholder="Promotion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {availablePromotions.map(promotion => (
                        <SelectItem key={promotion} value={promotion.toLowerCase()}>
                          {promotion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-36">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mentions">Mentions</SelectItem>
                      <SelectItem value="push">Push Score</SelectItem>
                      <SelectItem value="sentiment">Sentiment</SelectItem>
                      <SelectItem value="change">24h Change</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs text-emerald-600 whitespace-nowrap">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="font-medium">{processedWrestlers.length} wrestlers</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Wrestler Analytics */}
        <Card className="glass-card border-slate-700/50">
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <CardTitle className="flex items-center space-x-2 text-xl sm:text-2xl">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-wrestling-electric" />
                  <span>Enhanced Wrestling Analytics</span>
                </CardTitle>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 whitespace-nowrap">
                  {hasRealData ? 'LIVE METRICS' : 'BUILDING DATA'}
                </Badge>
              </div>
              
              <div className="flex flex-col items-start lg:items-end space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Advanced Sentiment Analysis</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-emerald-600">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">
                    {hasRealData ? `Live from ${newsItems.length} sources` : 'Preparing data sources'}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-16 lg:py-20">
                <div className="flex flex-col items-center space-y-4">
                  <RefreshCw className="h-8 w-8 animate-spin text-wrestling-electric" />
                  <span className="text-lg">Loading wrestler data...</span>
                </div>
              </div>
            ) : processedWrestlers.length > 0 ? (
              <>
                {/* Enhanced Wrestler Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 mb-8">
                  {processedWrestlers.map((wrestler) => (
                    <EnhancedWrestlerCard
                      key={wrestler.id}
                      wrestler={wrestler}
                      metrics={{
                        push_score: wrestler.pushScore || 0,
                        burial_score: wrestler.burialScore || 0,
                        momentum_score: wrestler.momentumScore || 0,
                        popularity_score: wrestler.popularityScore || 0,
                        confidence_level: wrestler.confidence_level || 'low',
                        mention_count: wrestler.mention_count || 0,
                        data_sources: wrestler.data_sources || {
                          total_mentions: 0,
                          tier_1_mentions: 0,
                          tier_2_mentions: 0,
                          tier_3_mentions: 0,
                          hours_since_last_mention: 999,
                          source_breakdown: {}
                        },
                        last_updated: wrestler.last_updated || new Date().toISOString()
                      }}
                      onWrestlerClick={handleWrestlerClick}
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
                      ? 'Source-weighted sentiment analysis • Historical trend tracking • Confidence indicators'
                      : 'Processing news sources • Analyzing sentiment • Building confidence metrics'
                    }
                  </div>
                  <div className="flex items-center justify-center space-x-1 text-emerald-600">
                    <Info className="h-3 w-3" />
                    <span className="text-xs">Click any wrestler for detailed analytics</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-16 lg:py-20">
                <AlertTriangle className="h-16 w-16 mx-auto mb-6 text-yellow-400 opacity-50" />
                <h3 className="text-xl font-semibold mb-3">Loading Wrestler Data</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Setting up enhanced analytics for wrestling data. This will take a moment...
                </p>
                <Button onClick={handleRefresh} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

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
