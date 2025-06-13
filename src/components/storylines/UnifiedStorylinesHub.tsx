
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, TrendingUp, Flame } from "lucide-react";
import { useStorylineAnalysis } from "@/hooks/useAdvancedAnalytics";
import { useRSSFeeds, useRedditPosts } from "@/hooks/useWrestlingData";
import { useTwitterData } from "@/hooks/useTwitterData";
import { StorylineHeader } from "./StorylineHeader";
import { StorylineFilters } from "./StorylineFilters";
import { StorylineMetrics } from "./StorylineMetrics";
import { StorylineTabsContent } from "./StorylineTabsContent";

export const UnifiedStorylinesHub = () => {
  const [selectedPromotion, setSelectedPromotion] = useState('all');
  const [intensityFilter, setIntensityFilter] = useState('all');
  const [timeframe, setTimeframe] = useState('7d');
  
  const { data: storylines = [], isLoading: storylinesLoading, refetch: refetchStorylines } = useStorylineAnalysis();
  const { data: newsItems = [] } = useRSSFeeds();
  const { data: redditPosts = [] } = useRedditPosts();
  const { data: tweets = [] } = useTwitterData();

  console.log('UnifiedStorylinesHub - Data loaded:', {
    storylines: storylines.length,
    newsItems: newsItems.length,
    redditPosts: redditPosts.length,
    tweets: tweets.length
  });

  const handleRefresh = () => {
    console.log('Refreshing storylines data...');
    refetchStorylines();
  };

  // Filter storylines based on selected criteria
  const filteredStorylines = storylines.filter(storyline => {
    const promotionMatch = selectedPromotion === 'all' || storyline.promotion.toLowerCase() === selectedPromotion;
    const intensityMatch = intensityFilter === 'all' || 
      (intensityFilter === 'high' && storyline.intensity_score > 7) ||
      (intensityFilter === 'medium' && storyline.intensity_score >= 4 && storyline.intensity_score <= 7) ||
      (intensityFilter === 'low' && storyline.intensity_score < 4);
    
    return promotionMatch && intensityMatch;
  });

  // Get trending storylines (highest intensity + recent activity)
  const trendingStorylines = filteredStorylines
    .filter(s => s.intensity_score > 6)
    .sort((a, b) => b.intensity_score - a.intensity_score)
    .slice(0, 3);

  // Get hot storylines (good fan reception + active)
  const hotStorylines = filteredStorylines
    .filter(s => s.fan_reception_score > 7 && s.status === 'building')
    .sort((a, b) => b.fan_reception_score - a.fan_reception_score)
    .slice(0, 4);

  if (storylinesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-wrestling-electric" />
        <span className="ml-2 text-lg">Analyzing storylines...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StorylineHeader 
        onRefresh={handleRefresh}
        isLoading={storylinesLoading}
        criticalAlertsCount={0}
      />

      <StorylineMetrics 
        storylines={filteredStorylines}
        newsItems={newsItems}
        redditPosts={redditPosts}
        tweets={tweets}
      />

      <StorylineFilters
        selectedPromotion={selectedPromotion}
        onPromotionChange={setSelectedPromotion}
        intensityFilter={intensityFilter}
        onIntensityFilterChange={setIntensityFilter}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        filteredStorylinesCount={filteredStorylines.length}
      />

      <Tabs defaultValue="trending" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="trending">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trending Now
            {trendingStorylines.length > 0 && (
              <Badge className="ml-2 bg-red-100 text-red-800 text-xs">
                {trendingStorylines.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="hot">
            <Flame className="h-4 w-4 mr-2" />
            Hot Storylines
            {hotStorylines.length > 0 && (
              <Badge className="ml-2 bg-orange-100 text-orange-800 text-xs">
                {hotStorylines.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">All Active Storylines</TabsTrigger>
        </TabsList>

        <StorylineTabsContent
          trendingStorylines={trendingStorylines}
          hotStorylines={hotStorylines}
          filteredStorylines={filteredStorylines}
        />
      </Tabs>
    </div>
  );
};
