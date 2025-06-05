
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, TrendingUp, Users, Zap, Activity, RefreshCw } from "lucide-react";
import { useIntelligentSearch, useAdvancedTrendingTopics } from "@/hooks/useAdvancedAnalytics";

export const SmartSearchEngine = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const { data: searchResults, isLoading: searchLoading } = useIntelligentSearch(activeSearch);
  const { data: trendingTopics = [] } = useAdvancedTrendingTopics();

  const handleSearch = () => {
    setActiveSearch(searchQuery);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'news': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'reddit': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'wrestler': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'storyline': return 'bg-wrestling-electric/20 text-wrestling-electric border-wrestling-electric/30';
      case 'topic': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'wrestler': return Users;
      case 'storyline': return Activity;
      case 'news': return Zap;
      case 'reddit': return TrendingUp;
      case 'topic': return TrendingUp;
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
              placeholder="Search for wrestlers, storylines, news, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={searchLoading || searchQuery.length < 3}>
              {searchLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Search
            </Button>
          </div>

          {/* Quick Search Suggestions */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Popular searches:</span>
            {[
              'CM Punk',
              'championship',
              'WWE storylines',
              'AEW news',
              'injury reports'
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
          {searchLoading ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-wrestling-electric mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">Searching...</h3>
                <p className="text-muted-foreground">Analyzing news, wrestlers, and storylines...</p>
              </CardContent>
            </Card>
          ) : activeSearch && searchResults ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Results for: "{activeSearch}"</h3>
                <Badge variant="outline">
                  {(searchResults.news?.length || 0) + 
                   (searchResults.reddit?.length || 0) + 
                   (searchResults.wrestlers?.length || 0) + 
                   (searchResults.storylines?.length || 0)} results
                </Badge>
              </div>

              {/* Wrestlers */}
              {searchResults.wrestlers && searchResults.wrestlers.length > 0 && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Wrestlers Found</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {searchResults.wrestlers.slice(0, 5).map((wrestler, index) => (
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

              {/* Storylines */}
              {searchResults.storylines && searchResults.storylines.length > 0 && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Storylines Found</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {searchResults.storylines.map((storyline, index) => (
                        <div key={index} className="p-3 bg-secondary/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-foreground">{storyline.title}</h4>
                            <Badge className={getTypeColor('storyline')}>
                              {storyline.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{storyline.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {storyline.participants.map((participant, pIndex) => (
                              <Badge key={pIndex} variant="secondary" className="text-xs">
                                {participant}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* News Articles */}
              {searchResults.news && searchResults.news.length > 0 && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>News Articles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {searchResults.news.slice(0, 5).map((article, index) => (
                        <div key={index} className="p-3 bg-secondary/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-foreground">{article.title}</h4>
                            <Badge className={getTypeColor('news')}>
                              {article.source}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {article.contentSnippet.substring(0, 150)}...
                          </p>
                          <div className="text-xs text-muted-foreground">
                            {new Date(article.pubDate).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Reddit Posts */}
              {searchResults.reddit && searchResults.reddit.length > 0 && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Reddit Discussions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {searchResults.reddit.slice(0, 5).map((post, index) => (
                        <div key={index} className="p-3 bg-secondary/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-foreground">{post.title}</h4>
                            <Badge className={getTypeColor('reddit')}>
                              r/{post.subreddit}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>{post.score} upvotes</span>
                            <span>{post.num_comments} comments</span>
                            <span>by u/{post.author}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* No results */}
              {(!searchResults.news || searchResults.news.length === 0) &&
               (!searchResults.reddit || searchResults.reddit.length === 0) &&
               (!searchResults.wrestlers || searchResults.wrestlers.length === 0) &&
               (!searchResults.storylines || searchResults.storylines.length === 0) && (
                <Card className="glass-card">
                  <CardContent className="p-8 text-center">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Results Found</h3>
                    <p className="text-muted-foreground">
                      No results found for "{activeSearch}". Try different keywords or check spelling.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : activeSearch ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Results</h3>
                <p className="text-muted-foreground">
                  Search requires at least 3 characters and available data.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">Start Your Search</h3>
              <p className="text-muted-foreground">
                Use the search box above to find wrestlers, storylines, news, and trending topics.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
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
                      {topic.related_wrestlers.slice(0, 5).map((wrestler, wIndex) => (
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

        <TabsContent value="cross-promotion" className="space-y-6">
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-4">Cross-Promotion Analysis</h3>
            <p className="text-muted-foreground">
              Advanced cross-promotion sentiment analysis will be available in the next update.
              This will compare how stories and wrestlers are received across different wrestling fanbases.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="historical" className="space-y-6">
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-4">Historical Context Engine</h3>
            <p className="text-muted-foreground">
              Historical pattern matching will be available in the next update.
              This will connect current wrestling events to historical precedents and wrestling history.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
