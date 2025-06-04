
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Users, Zap, Activity } from "lucide-react";
import { useRSSFeeds, useRedditPosts } from "@/hooks/useWrestlingData";
import { useSupabaseWrestlers } from "@/hooks/useSupabaseWrestlers";
import { analyzeTrendingWrestlers, generateTrendingTopics } from "@/services/trendingService";

interface WrestlerIntelligence {
  wrestler: any;
  mentions: number;
  sentiment: number;
  trend: 'up' | 'down' | 'stable';
  pushBurialScore: number;
  socialMediaBuzz: number;
  contractStatus: 'active' | 'expiring' | 'negotiating' | 'free_agent';
}

export const WrestlerIntelligenceDashboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const { data: newsItems = [] } = useRSSFeeds();
  const { data: redditPosts = [] } = useRedditPosts();
  const { data: wrestlers = [] } = useSupabaseWrestlers();

  const trendingWrestlers = analyzeTrendingWrestlers(newsItems, redditPosts);
  const trendingTopics = generateTrendingTopics(newsItems, redditPosts);

  const calculatePushBurialScore = (wrestler: any) => {
    // Algorithm to detect push/burial based on mention patterns and sentiment
    const recentMentions = wrestler.mentions || 0;
    const sentiment = wrestler.sentiment || 0.5;
    const championshipStatus = wrestler.wrestler?.is_champion ? 1 : 0;
    
    return Math.round((recentMentions * sentiment + championshipStatus * 20) / 10);
  };

  const getContractStatus = (wrestler: any) => {
    // Mock contract status logic - in real implementation, this would come from data
    const statuses = ['active', 'expiring', 'negotiating', 'free_agent'];
    return statuses[Math.floor(Math.random() * statuses.length)] as any;
  };

  const wrestlerIntelligence: WrestlerIntelligence[] = trendingWrestlers.map(tw => ({
    wrestler: tw.wrestler,
    mentions: tw.mentions,
    sentiment: tw.sentiment,
    trend: tw.trend,
    pushBurialScore: calculatePushBurialScore(tw),
    socialMediaBuzz: tw.redditPosts.length * 10 + tw.newsArticles.length * 5,
    contractStatus: getContractStatus(tw)
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'expiring': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'negotiating': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'free_agent': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPushBurialIndicator = (score: number) => {
    if (score >= 8) return { label: 'Strong Push', color: 'text-green-400', icon: TrendingUp };
    if (score >= 5) return { label: 'Moderate Push', color: 'text-green-300', icon: TrendingUp };
    if (score >= 3) return { label: 'Stable', color: 'text-yellow-400', icon: Activity };
    if (score >= 1) return { label: 'Cooling Off', color: 'text-orange-400', icon: TrendingDown };
    return { label: 'Burial', color: 'text-red-400', icon: TrendingDown };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Wrestler Intelligence Dashboard</h2>
        <div className="flex space-x-2">
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
          <div className="grid gap-6">
            {wrestlerIntelligence.slice(0, 10).map((intelligence, index) => (
              <Card key={index} className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{intelligence.wrestler.name}</CardTitle>
                    <Badge className={getStatusColor(intelligence.contractStatus)}>
                      {intelligence.contractStatus.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{intelligence.mentions}</div>
                      <div className="text-sm text-muted-foreground">Mentions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {Math.round(intelligence.sentiment * 100)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Sentiment</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{intelligence.socialMediaBuzz}</div>
                      <div className="text-sm text-muted-foreground">Social Buzz</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-wrestling-electric">{intelligence.pushBurialScore}</div>
                      <div className="text-sm text-muted-foreground">Push Score</div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-gradient-to-r from-green-500 to-wrestling-electric transition-all duration-500"
                        style={{ width: `${intelligence.sentiment * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="push-burial" className="space-y-6">
          <div className="grid gap-4">
            {wrestlerIntelligence.map((intelligence, index) => {
              const pushIndicator = getPushBurialIndicator(intelligence.pushBurialScore);
              const IconComponent = pushIndicator.icon;
              
              return (
                <Card key={index} className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-wrestling-electric/20 to-wrestling-purple/20 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">{intelligence.wrestler.name.charAt(0)}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{intelligence.wrestler.name}</h3>
                          <p className="text-sm text-muted-foreground">{intelligence.wrestler.promotions?.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-lg font-bold text-foreground">{intelligence.pushBurialScore}/10</div>
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
                              strokeDasharray={`${intelligence.pushBurialScore * 10}, 100`}
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
            {['expiring', 'negotiating', 'free_agent', 'active'].map((status) => {
              const statusWrestlers = wrestlerIntelligence.filter(w => w.contractStatus === status);
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
                          <div className="font-medium text-foreground">{wrestler.wrestler.name}</div>
                          <div className="text-sm text-muted-foreground">{wrestler.wrestler.promotions?.name}</div>
                          <div className="text-xs text-wrestling-electric mt-1">
                            {wrestler.mentions} mentions • {Math.round(wrestler.sentiment * 100)}% sentiment
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
                      <div className="flex flex-wrap gap-2">
                        {topic.keywords.map((keyword, kIndex) => (
                          <Badge key={kIndex} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Social Media Buzz Leaders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {wrestlerIntelligence
                    .sort((a, b) => b.socialMediaBuzz - a.socialMediaBuzz)
                    .slice(0, 8)
                    .map((wrestler, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-wrestling-electric/20 to-wrestling-purple/20 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">{index + 1}</span>
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{wrestler.wrestler.name}</div>
                            <div className="text-sm text-muted-foreground">{wrestler.wrestler.promotions?.name}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-wrestling-electric">{wrestler.socialMediaBuzz}</div>
                          <div className="text-xs text-muted-foreground">Buzz Score</div>
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
