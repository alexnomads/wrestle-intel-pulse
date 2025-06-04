
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, TrendingUp, Users, Zap, Activity } from "lucide-react";
import { useWrestlerSearch } from "@/hooks/useSupabaseWrestlers";

interface SearchResult {
  type: 'wrestler' | 'storyline' | 'event' | 'trend';
  title: string;
  description: string;
  relevance: number;
  source: string;
  date: string;
}

interface TrendDetection {
  trend: string;
  mentions: number;
  velocity: number;
  sentiment: number;
  keywords: string[];
}

export const SmartSearchEngine = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const { data: searchResults = [] } = useWrestlerSearch(activeSearch);

  const handleSearch = () => {
    setActiveSearch(searchQuery);
  };

  // Mock search results for demonstration
  const mockSearchResults: SearchResult[] = [
    {
      type: 'wrestler',
      title: 'CM Punk WWE Return Analysis',
      description: 'Comprehensive analysis of CM Punk\'s return to WWE and its impact on the wrestling landscape.',
      relevance: 95,
      source: 'Wrestling Observer',
      date: '2024-06-01'
    },
    {
      type: 'storyline',
      title: 'AEW Women\'s Division Booking Patterns',
      description: 'Detailed breakdown of booking decisions in AEW\'s women\'s division over the last 6 months.',
      relevance: 88,
      source: 'PWTorch',
      date: '2024-05-28'
    },
    {
      type: 'trend',
      title: 'Rising Interest in Japanese Wrestling',
      description: 'Analysis of increasing western fan engagement with NJPW and other Japanese promotions.',
      relevance: 82,
      source: 'Social Media Analytics',
      date: '2024-05-25'
    }
  ];

  const trendDetections: TrendDetection[] = [
    {
      trend: 'CM Punk WWE Comeback',
      mentions: 15420,
      velocity: 85,
      sentiment: 0.87,
      keywords: ['cm punk', 'wwe', 'return', 'survivor series']
    },
    {
      trend: 'NXT Breakout Stars',
      mentions: 8750,
      velocity: 92,
      sentiment: 0.78,
      keywords: ['nxt', 'breakout', 'developmental', 'future stars']
    },
    {
      trend: 'AEW Roster Changes',
      mentions: 6320,
      velocity: 67,
      sentiment: 0.65,
      keywords: ['aew', 'roster', 'signings', 'releases']
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'wrestler': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'storyline': return 'bg-wrestling-electric/20 text-wrestling-electric border-wrestling-electric/30';
      case 'event': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'trend': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'wrestler': return Users;
      case 'storyline': return Activity;
      case 'event': return Zap;
      case 'trend': return TrendingUp;
      default: return Search;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Smart Search & Discovery</h2>
      </div>

      {/* Search Interface */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Natural Language Wrestling Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder='Try: "AEW women\'s division booking last 6 months" or "CM Punk WWE return impact"'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Quick Search Suggestions */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Popular searches:</span>
            {[
              'WWE championship booking',
              'AEW vs WWE ratings',
              'NXT breakout stars 2024',
              'TNA impact analysis'
            ].map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery(suggestion)}
                className="text-xs"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="results" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="results">Search Results</TabsTrigger>
          <TabsTrigger value="trends">Trend Detection</TabsTrigger>
          <TabsTrigger value="cross-promotion">Cross-Promotion</TabsTrigger>
          <TabsTrigger value="historical">Historical Context</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-6">
          {activeSearch ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Results for: "{activeSearch}"</h3>
                <Badge variant="outline">{mockSearchResults.length} results</Badge>
              </div>

              {/* Database Search Results */}
              {searchResults.length > 0 && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Wrestlers Found</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {searchResults.slice(0, 5).map((wrestler, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-wrestling-electric/20 to-wrestling-purple/20 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-primary">{wrestler.name.charAt(0)}</span>
                            </div>
                            <div>
                              <h4 className="font-medium text-foreground">{wrestler.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {wrestler.promotions?.name} • {wrestler.status}
                              </p>
                            </div>
                          </div>
                          {wrestler.is_champion && (
                            <Badge className="bg-wrestling-gold/20 text-wrestling-gold border-wrestling-gold/30">
                              Champion
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Mock Analysis Results */}
              <div className="grid gap-4">
                {mockSearchResults.map((result, index) => {
                  const TypeIcon = getTypeIcon(result.type);
                  return (
                    <Card key={index} className="glass-card">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="w-8 h-8 bg-gradient-to-br from-wrestling-electric/20 to-wrestling-purple/20 rounded-full flex items-center justify-center mt-1">
                              <TypeIcon className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-semibold text-foreground">{result.title}</h3>
                                <Badge className={getTypeColor(result.type)}>
                                  {result.type}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{result.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                <span>{result.source}</span>
                                <span>{result.date}</span>
                                <span>{result.relevance}% relevance</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">Start Your Search</h3>
              <p className="text-muted-foreground">
                Use natural language to search for wrestling insights, storylines, and analytics.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid gap-4">
            {trendDetections.map((trend, index) => (
              <Card key={index} className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg text-foreground">{trend.trend}</h3>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-green-400">+{trend.velocity}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-wrestling-electric">{trend.mentions.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Mentions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{Math.round(trend.sentiment * 100)}%</div>
                      <div className="text-sm text-muted-foreground">Sentiment</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{trend.velocity}</div>
                      <div className="text-sm text-muted-foreground">Velocity</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {trend.keywords.map((keyword, kIndex) => (
                      <Badge key={kIndex} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cross-promotion" className="space-y-6">
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-4">Cross-Promotion Analysis</h3>
            <p className="text-muted-foreground">
              Compare how stories and wrestlers are received across different wrestling fanbases.
            </p>
            <Button className="mt-4" variant="outline">
              Coming Soon
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="historical" className="space-y-6">
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-4">Historical Context Engine</h3>
            <p className="text-muted-foreground">
              Connect current wrestling events to historical precedents and wrestling history.
            </p>
            <Button className="mt-4" variant="outline">
              Coming Soon
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
