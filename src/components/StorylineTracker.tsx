
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw } from "lucide-react";
import { useStorylineAnalysis, useAdvancedTrendingTopics } from "@/hooks/useAdvancedAnalytics";
import { useRSSFeeds } from "@/hooks/useWrestlingData";
import { useSupabaseWrestlers } from "@/hooks/useSupabaseWrestlers";
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
  const { data: wrestlers = [] } = useSupabaseWrestlers();

  const handleRefresh = () => {
    refetchStorylines();
  };

  const filteredStorylines = selectedPromotion === 'all' 
    ? storylines 
    : storylines.filter(storyline => storyline.promotion.toLowerCase() === selectedPromotion);

  // Generate booking patterns from actual storyline data with real wrestler data
  const generateBookingPatterns = () => {
    if (storylines.length === 0) return [];
    
    const promotionPatterns = new Map();
    
    storylines.forEach(storyline => {
      if (!promotionPatterns.has(storyline.promotion)) {
        promotionPatterns.set(storyline.promotion, {
          promotion: storyline.promotion,
          patterns: [],
          totalStorylines: 0,
          avgIntensity: 0,
          avgFanReception: 0,
          patternTypes: new Set()
        });
      }
      
      const pattern = promotionPatterns.get(storyline.promotion);
      pattern.totalStorylines++;
      pattern.avgIntensity += storyline.intensity_score;
      pattern.avgFanReception += storyline.fan_reception_score;
      
      // Detect pattern types based on keywords and participants
      if (storyline.keywords.includes('championship') || storyline.keywords.includes('title')) {
        pattern.patternTypes.add('Championship Focus');
      }
      if (storyline.keywords.includes('feud') || storyline.keywords.includes('rivalry')) {
        pattern.patternTypes.add('Rivalry Building');
      }
      if (storyline.keywords.includes('team') || storyline.keywords.includes('alliance') || storyline.keywords.includes('stable')) {
        pattern.patternTypes.add('Faction Dynamics');
      }
      if (storyline.keywords.includes('return') || storyline.keywords.includes('debut')) {
        pattern.patternTypes.add('Talent Spotlight');
      }
      if (storyline.keywords.includes('heel turn') || storyline.keywords.includes('betrayal')) {
        pattern.patternTypes.add('Character Development');
      }
    });
    
    return Array.from(promotionPatterns.values()).map(pattern => {
      const avgIntensity = pattern.totalStorylines > 0 ? pattern.avgIntensity / pattern.totalStorylines : 0;
      const avgFanReception = pattern.totalStorylines > 0 ? pattern.avgFanReception / pattern.totalStorylines : 0;
      const primaryPattern = Array.from(pattern.patternTypes)[0] || 'General Storytelling';
      
      return {
        promotion: pattern.promotion,
        pattern: primaryPattern,
        frequency: Math.min(pattern.totalStorylines * 8, 100),
        effectiveness: Math.min(avgFanReception, 10),
        examples: storylines
          .filter(s => s.promotion === pattern.promotion)
          .slice(0, 3)
          .map(s => s.title)
      };
    }).filter(pattern => pattern.frequency > 0);
  };

  const bookingPatterns = generateBookingPatterns();

  // Generate insights from real data
  const generateInsights = () => {
    const totalWrestlers = wrestlers.length;
    const activePromotions = [...new Set(storylines.map(s => s.promotion))].length;
    const avgIntensity = storylines.length > 0 
      ? storylines.reduce((sum, s) => sum + s.intensity_score, 0) / storylines.length 
      : 0;
    const topKeywords = storylines
      .flatMap(s => s.keywords)
      .reduce((acc, keyword) => {
        acc[keyword] = (acc[keyword] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    const sortedKeywords = Object.entries(topKeywords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([keyword]) => keyword);

    return {
      totalWrestlers,
      activePromotions,
      avgIntensity: avgIntensity.toFixed(1),
      topKeywords: sortedKeywords
    };
  };

  const insights = generateInsights();

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
          <TabsTrigger value="insights">Analytics Insights</TabsTrigger>
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
          {trendingTopics.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">
                  No trending topics available. Try refreshing the news data to generate trending topics.
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {trendingTopics.map((topic, index) => (
                <TrendingTopicCard key={index} topic={topic} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="booking" className="space-y-6">
          {bookingPatterns.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">
                  No booking patterns available. Generate storylines from news data to see patterns.
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {bookingPatterns.map((pattern, index) => (
                <BookingPatternCard key={index} pattern={pattern} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Real-Time Analytics Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-secondary/50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-wrestling-electric">{newsItems.length}</div>
                      <div className="text-sm text-muted-foreground">News Sources</div>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-wrestling-electric">{insights.totalWrestlers}</div>
                      <div className="text-sm text-muted-foreground">Total Wrestlers</div>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-wrestling-electric">{storylines.length}</div>
                      <div className="text-sm text-muted-foreground">Active Storylines</div>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-wrestling-electric">{insights.avgIntensity}</div>
                      <div className="text-sm text-muted-foreground">Avg Intensity</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Data Sources Integration</h4>
                    <p className="text-sm text-muted-foreground">
                      Real-time analysis from {newsItems.length} news articles across multiple wrestling news sources, 
                      Reddit posts from 12+ wrestling subreddits, and {insights.totalWrestlers} wrestlers in the database.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Trending Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {insights.topKeywords.map((keyword, index) => (
                        <span key={index} className="px-3 py-1 bg-wrestling-electric/20 text-wrestling-electric rounded-full text-sm">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Live Data Refresh</h4>
                    <p className="text-sm text-muted-foreground">
                      Analysis refreshes every 15 minutes with new data from RSS feeds, Reddit, and wrestler database updates.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
