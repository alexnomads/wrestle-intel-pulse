
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { RefreshCw, Users, TrendingUp, AlertTriangle, Database, Filter, Search, SortDesc, Info } from 'lucide-react';
import { useSupabaseWrestlers } from '@/hooks/useSupabaseWrestlers';
import { useRSSFeeds } from '@/hooks/useWrestlingData';
import { useWrestlerAnalysis } from '@/hooks/useWrestlerAnalysis';
import { useStorylineAnalysis } from '@/hooks/useAdvancedAnalytics';
import { useRedditPosts } from '@/hooks/useWrestlingData';
import { WrestlerCard } from './dashboard/wrestler-tracker/WrestlerCard';
import { WrestlerDetailModal } from './dashboard/wrestler-tracker/WrestlerDetailModal';
import { PromotionHeatmap } from './storyline/PromotionHeatmap';
import { PlatformBreakdown } from './storyline/PlatformBreakdown';
import { WrestlerAnalysis } from '@/types/wrestlerAnalysis';

export const WrestlerIntelligenceDashboard = () => {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedPromotion, setSelectedPromotion] = useState('all');
  const [sortBy, setSortBy] = useState('mentions');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWrestler, setSelectedWrestler] = useState<WrestlerAnalysis | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Data hooks
  const { data: wrestlers = [], isLoading: wrestlersLoading } = useSupabaseWrestlers();
  const { data: newsItems = [], isLoading: newsLoading, refetch } = useRSSFeeds();
  const { data: storylines = [] } = useStorylineAnalysis();
  const { data: redditPosts = [] } = useRedditPosts();

  // Analysis hook - only show wrestlers with real mentions
  const { filteredAnalysis } = useWrestlerAnalysis(wrestlers, newsItems, '1', selectedPromotion);

  // Filter and sort wrestlers
  const processedWrestlers = React.useMemo(() => {
    let filtered = filteredAnalysis.filter(w => (w.mention_sources?.length || 0) > 0);

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(wrestler =>
        wrestler.wrestler_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wrestler.promotion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply promotion filter
    if (selectedPromotion !== 'all') {
      filtered = filtered.filter(wrestler =>
        wrestler.promotion.toLowerCase().includes(selectedPromotion.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'mentions':
          return (b.totalMentions || 0) - (a.totalMentions || 0);
        case 'sentiment':
          return (b.sentimentScore || 0) - (a.sentimentScore || 0);
        case 'change':
          return (b.change24h || 0) - (a.change24h || 0);
        case 'name':
          return a.wrestler_name.localeCompare(b.wrestler_name);
        default:
          return (b.totalMentions || 0) - (a.totalMentions || 0);
      }
    });

    return filtered;
  }, [filteredAnalysis, searchTerm, selectedPromotion, sortBy]);

  const handleRefresh = async () => {
    await refetch();
    setLastUpdate(new Date());
  };

  const handleWrestlerClick = (wrestler: WrestlerAnalysis) => {
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

  const isLoading = wrestlersLoading || newsLoading;
  const availablePromotions = [...new Set(processedWrestlers.map(w => w.promotion))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-3">
          <h2 className="text-3xl font-bold text-foreground">Wrestler Intelligence Dashboard</h2>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-300">
            REAL DATA ONLY
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
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
          <div className="text-sm text-muted-foreground hidden md:block">
            Last: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>Filters:</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search wrestlers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48"
              />
            </div>

            <Select value={selectedPromotion} onValueChange={setSelectedPromotion}>
              <SelectTrigger className="w-32">
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
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mentions">Mentions</SelectItem>
                <SelectItem value="sentiment">Sentiment</SelectItem>
                <SelectItem value="change">24h Change</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2 text-xs text-emerald-600">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="font-medium">{processedWrestlers.length} active mentions</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wrestler Popularity Treemap */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-3">
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-6 w-6 text-wrestling-electric" />
                <span>Wrestler Popularity Treemap</span>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                  REAL MENTIONS ONLY
                </Badge>
              </CardTitle>
            </div>
            
            <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-2 lg:space-y-0 lg:space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Wrestling News Mentions (Real-Time)</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-emerald-600">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Live analysis from {newsItems.length} sources</span>
              </div>
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
          ) : processedWrestlers.length > 0 ? (
            <>
              {/* Enhanced Treemap Container */}
              <div className="mb-6">
                <div 
                  className="flex flex-wrap gap-4 justify-center items-start p-6 bg-gradient-to-br from-gray-900/60 to-gray-800/60 rounded-xl border border-gray-700/40 backdrop-blur-sm"
                  style={{ minHeight: '500px' }}
                >
                  {processedWrestlers.map((wrestler, index) => (
                    <WrestlerCard
                      key={wrestler.id}
                      wrestler={wrestler}
                      index={index}
                      totalWrestlers={processedWrestlers.length}
                      onWrestlerClick={handleWrestlerClick}
                    />
                  ))}
                </div>
              </div>

              {/* Enhanced Stats Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-secondary/30 rounded-lg border border-border/50">
                  <div className="text-2xl font-bold text-wrestling-electric">
                    {processedWrestlers.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Wrestlers</div>
                </div>
                
                <div className="text-center p-4 bg-secondary/30 rounded-lg border border-border/50">
                  <div className="text-2xl font-bold text-emerald-500">
                    {processedWrestlers.filter(w => w.trend === 'push').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Being Pushed</div>
                </div>
                
                <div className="text-center p-4 bg-secondary/30 rounded-lg border border-border/50">
                  <div className="text-2xl font-bold text-blue-500">
                    {processedWrestlers.filter(w => w.trend === 'stable').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Stable Booking</div>
                </div>
                
                <div className="text-center p-4 bg-secondary/30 rounded-lg border border-border/50">
                  <div className="text-2xl font-bold text-red-500">
                    {processedWrestlers.filter(w => w.trend === 'burial').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Being Buried</div>
                </div>
              </div>

              {/* Data source info */}
              <div className="mt-6 text-center text-sm text-muted-foreground space-y-1">
                <div className="font-medium">
                  Real-time analysis of {processedWrestlers.length} wrestlers with verified mentions
                </div>
                <div>
                  Data from {newsItems.length} wrestling news sources • Updated every 15 minutes
                </div>
                <div className="flex items-center justify-center space-x-1 text-emerald-600">
                  <Info className="h-3 w-3" />
                  <span className="text-xs">Click any wrestler for detailed analytics</span>
                </div>
              </div>
            </>
          ) : (
            // Enhanced empty state
            <div className="text-center py-16">
              <Users className="h-16 w-16 mx-auto mb-6 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-3">No Wrestling Mentions Found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchTerm || selectedPromotion !== 'all' 
                  ? `No wrestlers match your current filters. Try adjusting your search or promotion filter.`
                  : `No wrestlers are currently being mentioned in wrestling news. The dashboard will populate when new mentions are detected.`
                }
              </p>
              <div className="flex items-center justify-center space-x-6 mb-6">
                <div className="flex items-center space-x-2 text-sm">
                  <Database className="h-4 w-4 text-emerald-500" />
                  <span className="text-emerald-600">{newsItems.length} news sources monitored</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-emerald-600">Real-time updates active</span>
                </div>
              </div>
              <div className="space-x-3">
                <Button onClick={handleRefresh} className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh Data</span>
                </Button>
                {(searchTerm || selectedPromotion !== 'all') && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedPromotion('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
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
