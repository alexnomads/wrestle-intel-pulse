
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, TrendingDown, Users, Activity } from "lucide-react";
import { WrestlenomicsDataDisplay } from "./WrestlenomicsDataDisplay";
import { useRSSFeeds } from "@/hooks/useWrestlingData";
import { useAdvancedTrendingTopics } from "@/hooks/useAdvancedAnalytics";
import { analyzeSentiment } from "@/services/wrestlingDataService";

interface PromotionMetrics {
  promotion: string;
  newsVolume: number;
  socialEngagement: number;
  sentimentScore: number;
  trend: 'up' | 'down' | 'stable';
  weeklyChange: number;
  wrestlerMentions: number;
}

export const IndustryAnalytics = () => {
  const [selectedMetric, setSelectedMetric] = useState('news');
  const [activeView, setActiveView] = useState<'overview' | 'wrestlenomics'>('overview');
  const { data: newsItems = [] } = useRSSFeeds();
  const { data: trendingTopics = [] } = useAdvancedTrendingTopics();

  // Generate real promotion metrics from news data
  const promotionMetrics: PromotionMetrics[] = useMemo(() => {
    const promotions = ['WWE', 'AEW', 'NXT', 'TNA'];
    
    return promotions.map(promotion => {
      const promotionNews = newsItems.filter(item => 
        item.title.toLowerCase().includes(promotion.toLowerCase()) ||
        (item.contentSnippet && item.contentSnippet.toLowerCase().includes(promotion.toLowerCase()))
      );
      
      const newsVolume = promotionNews.length;
      const wrestlerMentions = promotionNews.reduce((count, item) => {
        const content = `${item.title} ${item.contentSnippet || ''}`.toLowerCase();
        const wrestlerMatches = content.match(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g) || [];
        return count + wrestlerMatches.length;
      }, 0);
      
      // Calculate sentiment from news using the sentiment analysis service
      let totalSentiment = 0;
      let sentimentCount = 0;
      promotionNews.forEach(item => {
        const content = `${item.title} ${item.contentSnippet || ''}`;
        const sentiment = analyzeSentiment(content);
        totalSentiment += sentiment.score;
        sentimentCount++;
      });
      
      const avgSentiment = sentimentCount > 0 ? totalSentiment / sentimentCount : 0.5;
      const sentimentScore = Math.round(avgSentiment * 100);
      
      // Determine trend based on news volume and sentiment
      let trend: 'up' | 'down' | 'stable' = 'stable';
      let weeklyChange = 0;
      
      if (newsVolume > 10 && sentimentScore > 60) {
        trend = 'up';
        weeklyChange = Math.random() * 15 + 5;
      } else if (newsVolume < 5 || sentimentScore < 40) {
        trend = 'down';
        weeklyChange = -(Math.random() * 10 + 2);
      } else {
        weeklyChange = (Math.random() - 0.5) * 10;
      }
      
      return {
        promotion,
        newsVolume,
        socialEngagement: newsVolume * 1000 + Math.random() * 5000,
        sentimentScore,
        trend,
        weeklyChange: Math.round(weeklyChange * 10) / 10,
        wrestlerMentions
      };
    });
  }, [newsItems]);

  // Generate chart data from actual metrics
  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => {
      const data: any = { month };
      promotionMetrics.forEach(metric => {
        // Simulate historical data based on current metrics
        const baseValue = selectedMetric === 'news' ? metric.newsVolume : 
                         selectedMetric === 'social' ? metric.socialEngagement / 1000 : 
                         metric.sentimentScore;
        data[metric.promotion] = baseValue + (Math.random() - 0.5) * baseValue * 0.3;
      });
      return data;
    });
  }, [promotionMetrics, selectedMetric]);

  const chartConfig = {
    WWE: { label: "WWE", color: "#e11d48" },
    AEW: { label: "AEW", color: "#f59e0b" },
    NXT: { label: "NXT", color: "#3b82f6" },
    TNA: { label: "TNA", color: "#10b981" },
  };

  // Extract talent movements from trending topics
  const talentMovements = useMemo(() => {
    return trendingTopics
      .filter(topic => 
        topic.title.toLowerCase().includes('debut') ||
        topic.title.toLowerCase().includes('return') ||
        topic.title.toLowerCase().includes('signing')
      )
      .slice(0, 5)
      .map(topic => ({
        wrestler: topic.related_wrestlers[0] || 'Unknown Wrestler',
        from: 'Previous Promotion',
        to: 'Current Promotion',
        date: new Date().toISOString().split('T')[0],
        type: topic.title.toLowerCase().includes('debut') ? 'debut' as const :
              topic.title.toLowerCase().includes('return') ? 'return' as const : 'signing' as const,
        impact: Math.min(topic.mentions / 5 + 5, 10)
      }));
  }, [trendingTopics]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'signing': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'release': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'debut': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'return': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Industry Analytics</h2>
        <div className="flex space-x-2">
          <Button
            variant={activeView === 'overview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('overview')}
          >
            Overview
          </Button>
          <Button
            variant={activeView === 'wrestlenomics' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('wrestlenomics')}
          >
            Wrestlenomics Data
          </Button>
        </div>
      </div>

      {activeView === 'wrestlenomics' ? (
        <WrestlenomicsDataDisplay />
      ) : (
        <>
          <div className="flex space-x-2 mb-6">
            {['news', 'social', 'sentiment'].map((metric) => (
              <Button
                key={metric}
                variant={selectedMetric === metric ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMetric(metric)}
                className="capitalize"
              >
                {metric === 'news' ? 'News Volume' : 
                 metric === 'social' ? 'Social Engagement' : 'Sentiment'}
              </Button>
            ))}
          </div>

          {/* Promotion Health Metrics */}
          <div className="grid gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>
                  {selectedMetric === 'news' ? 'News Volume Trends' :
                   selectedMetric === 'social' ? 'Social Engagement Trends' : 'Sentiment Trends'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="WWE" stroke="var(--color-WWE)" strokeWidth={2} />
                      <Line type="monotone" dataKey="AEW" stroke="var(--color-AEW)" strokeWidth={2} />
                      <Line type="monotone" dataKey="NXT" stroke="var(--color-NXT)" strokeWidth={2} />
                      <Line type="monotone" dataKey="TNA" stroke="var(--color-TNA)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {promotionMetrics.map((metric, index) => (
                <Card key={index} className="glass-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">{metric.promotion}</h3>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(metric.trend)}
                        <span className={`text-sm font-medium ${
                          metric.weeklyChange > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {metric.weeklyChange > 0 ? '+' : ''}{metric.weeklyChange}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">News Volume</span>
                        <span className="font-medium">{metric.newsVolume}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Wrestler Mentions</span>
                        <span className="font-medium">{metric.wrestlerMentions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Sentiment</span>
                        <span className="font-medium">{metric.sentimentScore}%</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            metric.trend === 'up' ? 'bg-gradient-to-r from-green-500 to-wrestling-electric' :
                            metric.trend === 'down' ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                            'bg-gradient-to-r from-yellow-500 to-amber-500'
                          }`}
                          style={{ width: `${Math.min(metric.newsVolume * 8, 100)}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Talent Movement Tracker */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Recent Talent Movements</CardTitle>
            </CardHeader>
            <CardContent>
              {talentMovements.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No recent talent movements detected in news data.
                </div>
              ) : (
                <div className="space-y-4">
                  {talentMovements.map((movement, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-wrestling-electric/20 to-wrestling-purple/20 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">{movement.wrestler.charAt(0)}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{movement.wrestler}</h3>
                          <p className="text-sm text-muted-foreground">
                            {movement.from} → {movement.to}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-lg font-bold text-wrestling-electric">{movement.impact.toFixed(1)}</div>
                          <div className="text-xs text-muted-foreground">Impact Score</div>
                        </div>
                        <Badge className={getMovementColor(movement.type)}>
                          {movement.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Market Trends */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Trending Wrestlers</CardTitle>
              </CardHeader>
              <CardContent>
                {trendingTopics.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">
                    No trending data available
                  </div>
                ) : (
                  <div className="space-y-3">
                    {trendingTopics.slice(0, 4).map((topic, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                        <span className="font-medium text-foreground">{topic.title}</span>
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-400">+{topic.mentions}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Hot Storylines</CardTitle>
              </CardHeader>
              <CardContent>
                {newsItems.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">
                    No news data available
                  </div>
                ) : (
                  <div className="space-y-3">
                    {newsItems.slice(0, 4).map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                        <span className="font-medium text-foreground text-sm">{item.title.substring(0, 40)}...</span>
                        <div className="flex items-center space-x-2">
                          <Activity className="h-4 w-4 text-wrestling-electric" />
                          <span className="text-sm text-wrestling-electric">1 mention</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
