
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw } from "lucide-react";
import { useStorylineAnalysis, useAdvancedTrendingTopics } from "@/hooks/useAdvancedAnalytics";
import { useRSSFeeds, useRedditPosts } from "@/hooks/useWrestlingData";
import { useSupabaseWrestlers } from "@/hooks/useSupabaseWrestlers";
import { StorylineCard } from "./storyline/StorylineCard";
import { StorylineFilters } from "./storyline/StorylineFilters";
import { EmptyState } from "./storyline/EmptyState";
import { TrendingTopicsContent } from "./storyline/TrendingTopicsContent";
import { AIAssistant } from "./storyline/AIAssistant";
import { AnalyticsInsights } from "./storyline/AnalyticsInsights";
import { MetricsDashboard } from "./storyline/MetricsDashboard";

export const StorylineTracker = () => {
  const [selectedPromotion, setSelectedPromotion] = useState('all');
  
  const { data: storylines = [], isLoading: storylinesLoading, refetch: refetchStorylines } = useStorylineAnalysis();
  const { data: trendingTopics = [], isLoading: topicsLoading } = useAdvancedTrendingTopics();
  const { data: newsItems = [] } = useRSSFeeds();
  const { data: redditPosts = [] } = useRedditPosts();
  const { data: wrestlers = [] } = useSupabaseWrestlers();

  const handleRefresh = () => {
    refetchStorylines();
  };

  const filteredStorylines = selectedPromotion === 'all' 
    ? storylines 
    : storylines.filter(storyline => storyline.promotion.toLowerCase() === selectedPromotion);

  // Handle keyword clicks to search for related content
  const handleKeywordClick = (keyword: string) => {
    const relatedNews = newsItems.filter(item => 
      item.title.toLowerCase().includes(keyword.toLowerCase()) ||
      (item.contentSnippet && item.contentSnippet.toLowerCase().includes(keyword.toLowerCase()))
    );
    
    const relatedReddit = redditPosts.filter(post =>
      post.title.toLowerCase().includes(keyword.toLowerCase()) ||
      post.selftext.toLowerCase().includes(keyword.toLowerCase())
    );

    if (relatedNews.length > 0 && relatedNews[0].link) {
      window.open(relatedNews[0].link, '_blank');
    } else if (relatedReddit.length > 0) {
      window.open(`https://reddit.com${relatedReddit[0].permalink}`, '_blank');
    } else {
      const searchQuery = `wrestling ${keyword} site:reddit.com OR site:wrestling-news.com`;
      window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
    }
  };

  if (storylinesLoading && topicsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-wrestling-electric" />
        <span className="ml-2 text-lg">Analyzing storylines...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Header Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Wrestling Analytics Dashboard</h2>
        <StorylineFilters
          selectedPromotion={selectedPromotion}
          onPromotionChange={setSelectedPromotion}
          onRefresh={handleRefresh}
          isLoading={storylinesLoading}
        />
      </div>

      {/* Primary Metrics Row */}
      <MetricsDashboard 
        redditPosts={redditPosts}
        newsItems={newsItems}
        storylines={storylines}
      />

      <Tabs defaultValue="feuds" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="feuds">Active Storylines</TabsTrigger>
          <TabsTrigger value="trending">Trending Analysis</TabsTrigger>
          <TabsTrigger value="insights">Deep Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="feuds" className="space-y-6">
          {filteredStorylines.length === 0 ? (
            <EmptyState newsItemsCount={newsItems.length} />
          ) : (
            <div className="grid gap-6">
              {filteredStorylines.map((storyline) => (
                <StorylineCard key={storyline.id} storyline={storyline} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          <TrendingTopicsContent
            redditPosts={redditPosts}
            newsItems={newsItems}
            trendingTopics={trendingTopics}
            onKeywordClick={handleKeywordClick}
          />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6">
            <AIAssistant
              storylines={storylines}
              trendingTopics={trendingTopics}
              newsItems={newsItems}
            />
            <AnalyticsInsights
              redditPosts={redditPosts}
              newsItems={newsItems}
              wrestlers={wrestlers}
              storylines={storylines}
              onKeywordClick={handleKeywordClick}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
