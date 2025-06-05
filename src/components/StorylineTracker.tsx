import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Users, Zap, Activity, RefreshCw } from "lucide-react";
import { useStorylineAnalysis, useAdvancedTrendingTopics } from "@/hooks/useAdvancedAnalytics";
import { useRSSFeeds } from "@/hooks/useWrestlingData";

export const StorylineTracker = () => {
  const [selectedPromotion, setSelectedPromotion] = useState('all');
  const { data: storylines = [], isLoading: storylinesLoading, refetch: refetchStorylines } = useStorylineAnalysis();
  const { data: trendingTopics = [], isLoading: topicsLoading } = useAdvancedTrendingTopics();
  const { data: newsItems = [] } = useRSSFeeds();

  const handleRefresh = () => {
    refetchStorylines();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'building': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'climax': return 'bg-wrestling-electric/20 text-wrestling-electric border-wrestling-electric/30';
      case 'cooling': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'concluded': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-secondary text-secondary-foreground border-border';
    }
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
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={storylinesLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${storylinesLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {['all', 'wwe', 'aew', 'nxt', 'tna'].map((promotion) => (
            <Button
              key={promotion}
              variant={selectedPromotion === promotion ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPromotion(promotion)}
              className="capitalize"
            >
              {promotion === 'all' ? 'All' : promotion.toUpperCase()}
            </Button>
          ))}
        </div>
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
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Active Storylines Detected</h3>
                <p className="text-muted-foreground">
                  {newsItems.length === 0 
                    ? "No news data available. Check the Data Management tab to fetch latest news."
                    : "No storylines detected in recent news. Try refreshing the analysis."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {filteredStorylines.map((storyline) => (
                <Card key={storyline.id} className="glass-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {storyline.title}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(storyline.status)}>
                          {storyline.status}
                        </Badge>
                        <Badge variant="outline">{storyline.promotion}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{storyline.description}</p>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-wrestling-electric">
                          {storyline.intensity_score.toFixed(1)}
                        </div>
                        <div className="text-sm text-muted-foreground">Intensity</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">
                          {storyline.fan_reception_score.toFixed(1)}
                        </div>
                        <div className="text-sm text-muted-foreground">Fan Reception</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">
                          {storyline.source_articles.length}
                        </div>
                        <div className="text-sm text-muted-foreground">Articles</div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Intensity Score</span>
                        <span>{storyline.intensity_score.toFixed(1)}/10</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-gradient-to-r from-wrestling-electric to-wrestling-purple transition-all duration-500"
                          style={{ width: `${storyline.intensity_score * 10}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-foreground">Participants:</h4>
                      <div className="flex flex-wrap gap-2">
                        {storyline.participants.map((participant, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {participant}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {storyline.keywords.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <h4 className="font-medium text-foreground">Key Themes:</h4>
                        <div className="flex flex-wrap gap-2">
                          {storyline.keywords.slice(0, 5).map((keyword, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          <div className="grid gap-4">
            {trendingTopics.map((topic, index) => (
              <Card key={index} className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg text-foreground">{topic.title}</h3>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-green-400">+{topic.growth_rate.toFixed(0)}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-wrestling-electric">{topic.mentions}</div>
                      <div className="text-sm text-muted-foreground">Mentions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {Math.round(topic.sentiment * 100)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Sentiment</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{topic.growth_rate.toFixed(0)}</div>
                      <div className="text-sm text-muted-foreground">Growth</div>
                    </div>
                  </div>

                  {topic.related_wrestlers.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {topic.related_wrestlers.slice(0, 4).map((wrestler, wIndex) => (
                        <Badge key={wIndex} variant="secondary" className="text-xs">
                          {wrestler}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="booking" className="space-y-6">
          <div className="grid gap-6">
            {bookingPatterns.map((pattern, index) => (
              <Card key={index} className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{pattern.pattern}</CardTitle>
                    <Badge variant="outline">{pattern.promotion}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{pattern.frequency}%</div>
                      <div className="text-sm text-muted-foreground">Frequency</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{pattern.effectiveness}</div>
                      <div className="text-sm text-muted-foreground">Effectiveness</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground">Recent Examples:</h4>
                    <div className="flex flex-wrap gap-2">
                      {pattern.examples.map((example, exIndex) => (
                        <Badge key={exIndex} variant="secondary" className="text-xs">
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Effectiveness Rating</span>
                      <span>{pattern.effectiveness}/10</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-gradient-to-r from-green-500 to-wrestling-electric transition-all duration-500"
                        style={{ width: `${pattern.effectiveness * 10}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
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
