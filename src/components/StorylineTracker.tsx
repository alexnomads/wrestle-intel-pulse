
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw } from "lucide-react";
import { useStorylineAnalysis, useAdvancedTrendingTopics } from "@/hooks/useAdvancedAnalytics";
import { useRSSFeeds } from "@/hooks/useWrestlingData";
import { StorylineCard } from "./storyline/StorylineCard";
import { TrendingTopicCard } from "./storyline/TrendingTopicCard";
import { BookingPatternCard } from "./storyline/BookingPatternCard";
import { StorylineFilters } from "./storyline/StorylineFilters";
import { EmptyState } from "./storyline/EmptyState";

export const StorylineTracker = () => {
  const [selectedPromotion, setSelectedPromotion] = useState('all');
  const { data: storylines = [], isLoading: storylinesLoading, refetch: refetchStorylines } = useStorylineAnalysis();
  const { data: trendingTopics = [], isLoading: topicsLoading } = useAdvancedTrendingTopics();
  const { data: newsItems = [] } = useRSSFeeds();

  const handleRefresh = () => {
    refetchStorylines();
  };

  const filteredStorylines = selectedPromotion === 'all' 
    ? storylines 
    : storylines.filter(storyline => storyline.promotion.toLowerCase() === selectedPromotion);

  // Mock booking patterns data (this would need additional implementation)
  const bookingPatterns = [
    {
      promotion: 'WWE',
      pattern: 'Celebrity Integration',
      frequency: 85,
      effectiveness: 6.5,
      examples: ['Bad Bunny matches', 'Logan Paul storylines']
    },
    {
      promotion: 'AEW',
      pattern: 'Long-term Storytelling',
      frequency: 78,
      effectiveness: 8.2,
      examples: ['Hangman Page arc', 'MJF character development']
    },
    {
      promotion: 'NXT',
      pattern: 'Tournament Structure',
      frequency: 65,
      effectiveness: 7.8,
      examples: ['Breakout Tournament', 'Heritage Cup']
    }
  ];

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
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Storyline & Narrative Tracker</h2>
        <StorylineFilters
          selectedPromotion={selectedPromotion}
          onPromotionChange={setSelectedPromotion}
          onRefresh={handleRefresh}
          isLoading={storylinesLoading}
        />
      </div>

      <Tabs defaultValue="feuds" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="feuds">Active Feuds</TabsTrigger>
          <TabsTrigger value="trending">Trending Topics</TabsTrigger>
          <TabsTrigger value="booking">Booking Patterns</TabsTrigger>
          <TabsTrigger value="insights">News Insights</TabsTrigger>
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
          <div className="grid gap-4">
            {trendingTopics.map((topic, index) => (
              <TrendingTopicCard key={index} topic={topic} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="booking" className="space-y-6">
          <div className="grid gap-6">
            {bookingPatterns.map((pattern, index) => (
              <BookingPatternCard key={index} pattern={pattern} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>News Analysis Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">Data Sources</h3>
                  <p className="text-sm text-muted-foreground">
                    Analyzing {newsItems.length} recent news articles from Wrestling Inc, 411 Mania, and other sources
                  </p>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">Detection Algorithm</h3>
                  <p className="text-sm text-muted-foreground">
                    Storylines are detected using keyword analysis, wrestler mention patterns, and sentiment scoring
                  </p>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">Real-time Updates</h3>
                  <p className="text-sm text-muted-foreground">
                    Analysis refreshes every 15 minutes with new news data from RSS feeds
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
