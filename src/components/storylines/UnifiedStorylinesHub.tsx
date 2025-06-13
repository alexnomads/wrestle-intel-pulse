
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, TrendingUp, Flame, Filter } from "lucide-react";
import { useStorylineAnalysis } from "@/hooks/useAdvancedAnalytics";
import { useRSSFeeds, useRedditPosts } from "@/hooks/useWrestlingData";
import { useTwitterData } from "@/hooks/useTwitterData";
import { EnhancedStorylineCard } from "./EnhancedStorylineCard";
import { StorylineMetrics } from "./StorylineMetrics";
import { TrendingStorylines } from "./TrendingStorylines";

export const UnifiedStorylinesHub = () => {
  const [selectedPromotion, setSelectedPromotion] = useState('all');
  const [intensityFilter, setIntensityFilter] = useState('all');
  const [timeframe, setTimeframe] = useState('7d');
  
  const { data: storylines = [], isLoading: storylinesLoading, refetch: refetchStorylines } = useStorylineAnalysis();
  const { data: newsItems = [] } = useRSSFeeds();
  const { data: redditPosts = [] } = useRedditPosts();
  const { data: tweets = [] } = useTwitterData();

  const handleRefresh = () => {
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
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Storylines Dashboard</h2>
          <p className="text-muted-foreground">Unified view of all active wrestling storylines</p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={storylinesLoading}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${storylinesLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Metrics Overview */}
      <StorylineMetrics 
        storylines={filteredStorylines}
        newsItems={newsItems}
        redditPosts={redditPosts}
        tweets={tweets}
      />

      {/* Filters */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters & Options</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Promotion</label>
              <Select value={selectedPromotion} onValueChange={setSelectedPromotion}>
                <SelectTrigger>
                  <SelectValue placeholder="All Promotions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Promotions</SelectItem>
                  <SelectItem value="wwe">WWE</SelectItem>
                  <SelectItem value="aew">AEW</SelectItem>
                  <SelectItem value="tna">TNA</SelectItem>
                  <SelectItem value="njpw">NJPW</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Intensity Level</label>
              <Select value={intensityFilter} onValueChange={setIntensityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="high">High (7+ intensity)</SelectItem>
                  <SelectItem value="medium">Medium (4-7 intensity)</SelectItem>
                  <SelectItem value="low">Low (Under 4)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Timeframe</label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger>
                  <SelectValue placeholder="7 Days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {filteredStorylines.length} storylines
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
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

        <TabsContent value="trending" className="space-y-6">
          <TrendingStorylines storylines={trendingStorylines} />
        </TabsContent>

        <TabsContent value="hot" className="space-y-6">
          {hotStorylines.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="text-center py-8">
                <Flame className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hot storylines detected</p>
                <p className="text-sm text-muted-foreground">
                  Hot storylines have high fan reception and are actively building
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {hotStorylines.map((storyline) => (
                <EnhancedStorylineCard 
                  key={storyline.id} 
                  storyline={storyline}
                  showTrendingBadge={true}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-6">
          {filteredStorylines.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No active storylines found with current filters
                </p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting the promotion or intensity filters, or check back later as we continuously monitor wrestling news and social media
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {filteredStorylines.map((storyline) => (
                <EnhancedStorylineCard 
                  key={storyline.id} 
                  storyline={storyline}
                  showTrendingBadge={false}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
