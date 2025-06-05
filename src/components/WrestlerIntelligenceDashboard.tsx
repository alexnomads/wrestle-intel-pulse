
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Users, Zap, Activity, RefreshCw } from "lucide-react";
import { useWrestlerMomentumAnalysis, useAdvancedTrendingTopics } from "@/hooks/useAdvancedAnalytics";
import { useSupabaseWrestlers } from "@/hooks/useSupabaseWrestlers";

export const WrestlerIntelligenceDashboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const { data: wrestlerMomentum = [], isLoading: momentumLoading, refetch } = useWrestlerMomentumAnalysis();
  const { data: trendingTopics = [] } = useAdvancedTrendingTopics();
  const { data: wrestlers = [] } = useSupabaseWrestlers();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'expiring': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'negotiating': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'unknown': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPushBurialIndicator = (score: number) => {
    if (score >= 8) return { label: 'Strong Push', color: 'text-green-400', icon: TrendingUp };
    if (score >= 6) return { label: 'Moderate Push', color: 'text-green-300', icon: TrendingUp };
    if (score >= 4) return { label: 'Stable', color: 'text-yellow-400', icon: Activity };
    if (score >= 2) return { label: 'Cooling Off', color: 'text-orange-400', icon: TrendingDown };
    return { label: 'Burial', color: 'text-red-400', icon: TrendingDown };
  };

  const getSentimentColor = (trend: string) => {
    switch (trend) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  if (momentumLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-wrestling-electric" />
        <span className="ml-2 text-lg">Analyzing wrestler momentum...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Wrestler Intelligence Dashboard</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={momentumLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${momentumLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {['24h', '7d', '30d', '90d'].map((timeframe) => (
            <Button
              key={timeframe}
              variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe(timeframe)}
            >
              {timeframe}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="wrestler-profiles" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="wrestler-profiles">Wrestler Profiles</TabsTrigger>
          <TabsTrigger value="push-burial">Push/Burial Tracker</TabsTrigger>
          <TabsTrigger value="contract-monitor">Contract Monitor</TabsTrigger>
          <TabsTrigger value="social-sentiment">Social Sentiment</TabsTrigger>
        </TabsList>

        <TabsContent value="wrestler-profiles" className="space-y-6">
          {wrestlerMomentum.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Wrestler Data Available</h3>
                <p className="text-muted-foreground">
                  No recent news mentions found. Check the Data Management tab to fetch latest news.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {wrestlerMomentum.slice(0, 15).map((momentum, index) => (
                <Card key={index} className="glass-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{momentum.wrestler_name}</CardTitle>
                      <Badge className={getStatusColor(momentum.contract_status)}>
                        {momentum.contract_status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{momentum.mentions_count}</div>
                        <div className="text-sm text-muted-foreground">Mentions</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${getSentimentColor(momentum.sentiment_trend)}`}>
                          {momentum.sentiment_trend}
                        </div>
                        <div className="text-sm text-muted-foreground">Sentiment</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">
                          {momentum.momentum_change > 0 ? '+' : ''}{momentum.momentum_change.toFixed(0)}
                        </div>
                        <div className="text-sm text-muted-foreground">Momentum</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-wrestling-electric">
                          {momentum.push_burial_score.toFixed(1)}
                        </div>
                        <div className="text-sm text-muted-foreground">Push Score</div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-gradient-to-r from-green-500 to-wrestling-electric transition-all duration-500"
                          style={{ width: `${momentum.push_burial_score * 10}%` }}
                        />
                      </div>
                    </div>

                    {momentum.recent_storylines.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-foreground mb-2">Recent Storylines:</h4>
                        <div className="space-y-1">
                          {momentum.recent_storylines.slice(0, 2).map((storyline, sIndex) => (
                            <p key={sIndex} className="text-sm text-muted-foreground">
                              {storyline}
                            </p>
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

        <TabsContent value="push-burial" className="space-y-6">
          <div className="grid gap-4">
            {wrestlerMomentum
              .sort((a, b) => b.push_burial_score - a.push_burial_score)
              .map((momentum, index) => {
                const pushIndicator = getPushBurialIndicator(momentum.push_burial_score);
                const IconComponent = pushIndicator.icon;
                
                return (
                  <Card key={index} className="glass-card">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-wrestling-electric/20 to-wrestling-purple/20 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">
                              {momentum.wrestler_name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{momentum.wrestler_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {momentum.mentions_count} mentions • {momentum.sentiment_trend} trend
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-lg font-bold text-foreground">
                              {momentum.push_burial_score.toFixed(1)}/10
                            </div>
                            <div className={`text-sm font-medium ${pushIndicator.color} flex items-center`}>
                              <IconComponent className="h-3 w-3 mr-1" />
                              {pushIndicator.label}
                            </div>
                          </div>
                          
                          <div className="w-16 h-16">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                              <path
                                className="stroke-secondary"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                strokeWidth="2"
                              />
                              <path
                                className="stroke-wrestling-electric"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                strokeWidth="2"
                                strokeDasharray={`${momentum.push_burial_score * 10}, 100`}
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </TabsContent>

        <TabsContent value="contract-monitor" className="space-y-6">
          <div className="grid gap-4">
            {['expiring', 'negotiating', 'active', 'unknown'].map((status) => {
              const statusWrestlers = wrestlerMomentum.filter(w => w.contract_status === status);
              if (statusWrestlers.length === 0) return null;
              
              return (
                <Card key={status} className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="capitalize">{status.replace('_', ' ')} Contracts</span>
                      <Badge className={getStatusColor(status)}>
                        {statusWrestlers.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {statusWrestlers.slice(0, 6).map((wrestler, index) => (
                        <div key={index} className="p-3 bg-secondary/50 rounded-lg">
                          <div className="font-medium text-foreground">{wrestler.wrestler_name}</div>
                          <div className="text-sm text-muted-foreground">Wrestling Talent</div>
                          <div className="text-xs text-wrestling-electric mt-1">
                            {wrestler.mentions_count} mentions • {wrestler.push_burial_score.toFixed(1)} push score
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="social-sentiment" className="space-y-6">
          <div className="grid gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Trending Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {trendingTopics.slice(0, 5).map((topic, index) => (
                    <div key={index} className="p-4 bg-secondary/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-foreground">{topic.title}</h3>
                        <Badge variant="outline">{topic.mentions} mentions</Badge>
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
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Momentum Leaders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {wrestlerMomentum
                    .sort((a, b) => b.momentum_change - a.momentum_change)
                    .slice(0, 8)
                    .map((wrestler, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-wrestling-electric/20 to-wrestling-purple/20 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">{index + 1}</span>
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{wrestler.wrestler_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {wrestler.mentions_count} mentions • {wrestler.sentiment_trend}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-wrestling-electric">
                            {wrestler.momentum_change > 0 ? '+' : ''}{wrestler.momentum_change.toFixed(0)}
                          </div>
                          <div className="text-xs text-muted-foreground">Momentum</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
