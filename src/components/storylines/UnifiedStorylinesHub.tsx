
import { Badge } from "@/components/ui/badge";
import { RefreshCw, TrendingUp } from "lucide-react";
import { useStorylineAnalysis } from "@/hooks/useAdvancedAnalytics";
import { useRSSFeeds, useRedditPosts } from "@/hooks/useWrestlingData";
import { useTwitterData } from "@/hooks/useTwitterData";
import { StorylineHeader } from "./StorylineHeader";
import { StorylineMetrics } from "./StorylineMetrics";
import { StorylineTabsContent } from "./StorylineTabsContent";

export const UnifiedStorylinesHub = () => {
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

  // Sort storylines by intensity score (highest first)
  const sortedStorylines = storylines
    .sort((a, b) => b.intensity_score - a.intensity_score);

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
        storylines={sortedStorylines}
        newsItems={newsItems}
        redditPosts={redditPosts}
        tweets={tweets}
      />

      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <h3 className="text-2xl font-bold text-foreground flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-wrestling-electric" />
            <span>Trending Now</span>
          </h3>
          {sortedStorylines.length > 0 && (
            <Badge className="bg-blue-100 text-blue-800">
              {sortedStorylines.length} storylines
            </Badge>
          )}
        </div>

        <StorylineTabsContent storylines={sortedStorylines} />
      </div>
    </div>
  );
};
