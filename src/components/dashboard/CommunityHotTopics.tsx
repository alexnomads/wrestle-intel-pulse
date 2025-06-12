
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, TrendingUp, Flame, ArrowUp, Calendar, Users } from "lucide-react";
import { useComprehensiveReddit } from "@/hooks/useWrestlingData";
import { useComprehensiveNews } from "@/hooks/useWrestlingData";
import { generateTrendingTopics } from "@/services/trendingService";

interface CommunityHotTopicsProps {
  refreshTrigger: Date;
}

export const CommunityHotTopics = ({ refreshTrigger }: CommunityHotTopicsProps) => {
  const [viewPeriod, setViewPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const { data: redditPosts = [] } = useComprehensiveReddit();
  const { data: newsItems = [] } = useComprehensiveNews();

  const trendingTopics = generateTrendingTopics(newsItems, redditPosts);

  // Get hot Reddit discussions
  const hotDiscussions = redditPosts
    .filter(post => post.score > 50 || post.num_comments > 20)
    .sort((a, b) => (b.score + b.num_comments * 2) - (a.score + a.num_comments * 2))
    .slice(0, 8);

  // Calculate fan reaction scores
  const getFanReactionScore = (post: any) => {
    const engagementScore = (post.score * 0.7) + (post.num_comments * 1.5);
    return Math.min(Math.round(engagementScore / 10), 100);
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.7) return "text-green-400";
    if (sentiment > 0.4) return "text-yellow-400";
    return "text-red-400";
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diffInHours = Math.floor((now - timestamp) / 3600);
    
    if (diffInHours < 1) return "Less than 1h ago";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleRedditClick = (permalink: string, title: string) => {
    const fullUrl = `https://reddit.com${permalink}`;
    console.log('Opening Reddit discussion:', title, 'URL:', fullUrl);
    
    try {
      window.open(fullUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Failed to open Reddit link:', error);
      window.location.href = fullUrl;
    }
  };

  // Generate weekly/monthly summaries
  const getTrendSummary = () => {
    const totalEngagement = hotDiscussions.reduce((sum, post) => sum + post.score + post.num_comments, 0);
    const avgSentiment = trendingTopics.reduce((sum, topic) => sum + topic.sentiment, 0) / trendingTopics.length;
    
    return {
      totalEngagement,
      avgSentiment: Math.round(avgSentiment * 100),
      hotTopics: trendingTopics.length,
      topCommunity: 'SquaredCircle' // Most active subreddit
    };
  };

  const summary = getTrendSummary();

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-6 w-6 text-orange-500" />
            <span>Fan Community Insights Dashboard</span>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              r/SquaredCircle + 11 more
            </Badge>
          </CardTitle>
          
          {/* Period Toggle */}
          <div className="flex space-x-2">
            {[
              { id: 'daily', label: 'Daily', icon: Calendar },
              { id: 'weekly', label: 'Weekly', icon: TrendingUp },
              { id: 'monthly', label: 'Monthly', icon: Users }
            ].map((period) => {
              const Icon = period.icon;
              return (
                <button
                  key={period.id}
                  onClick={() => setViewPeriod(period.id as any)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewPeriod === period.id
                      ? 'bg-wrestling-electric text-white'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  <span>{period.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Community Sentiment Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-secondary/20 rounded-lg">
              <div className="text-2xl font-bold text-wrestling-electric">{summary.hotTopics}</div>
              <div className="text-sm text-muted-foreground">Hot Topics</div>
            </div>
            <div className="text-center p-3 bg-secondary/20 rounded-lg">
              <div className={`text-2xl font-bold ${getSentimentColor(summary.avgSentiment / 100)}`}>
                {summary.avgSentiment}%
              </div>
              <div className="text-sm text-muted-foreground">Avg Sentiment</div>
            </div>
            <div className="text-center p-3 bg-secondary/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-500">{Math.round(summary.totalEngagement / 1000)}K</div>
              <div className="text-sm text-muted-foreground">Engagement</div>
            </div>
            <div className="text-center p-3 bg-secondary/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-500">{summary.topCommunity}</div>
              <div className="text-sm text-muted-foreground">Top Community</div>
            </div>
          </div>

          {/* Hot Topics from Trending Service */}
          <div>
            <h3 className="font-semibold text-lg flex items-center mb-4">
              <Flame className="h-5 w-5 mr-2 text-red-500" />
              Trending Wrestling Topics
            </h3>
            
            <div className="space-y-3">
              {trendingTopics.slice(0, 5).map((topic, index) => (
                <div 
                  key={topic.title}
                  className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-foreground">{topic.title}</span>
                      {topic.relatedWrestlers.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Featuring: {topic.relatedWrestlers.slice(0, 3).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">{topic.mentions}</div>
                      <div className="text-xs text-muted-foreground">mentions</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getSentimentColor(topic.sentiment)}`}>
                        {Math.round(topic.sentiment * 100)}%
                      </div>
                      <div className="text-xs text-muted-foreground">sentiment</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hot Reddit Discussions */}
          <div>
            <h3 className="font-semibold text-lg flex items-center mb-4">
              <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
              Hot Community Discussions
            </h3>
            
            <div className="space-y-3">
              {hotDiscussions.map((post, index) => {
                const fanReactionScore = getFanReactionScore(post);
                
                return (
                  <div 
                    key={post.url + index}
                    className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRedditClick(post.permalink, post.title);
                    }}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-foreground line-clamp-1">{post.title}</span>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs border-orange-400 text-orange-600">
                            r/{post.subreddit}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            u/{post.author} • {formatTimeAgo(post.created_utc)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-wrestling-electric">{fanReactionScore}</div>
                        <div className="text-xs text-muted-foreground">Fan Score</div>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <ArrowUp className="h-4 w-4" />
                          <span>{post.score}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{post.num_comments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly/Monthly Summary based on selected period */}
          {viewPeriod !== 'daily' && (
            <div className="pt-4 border-t border-secondary/50">
              <h4 className="font-medium text-foreground mb-3">
                {viewPeriod === 'weekly' ? 'This Week' : 'This Month'} in Wrestling Communities
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="text-lg font-bold text-green-500">
                    {viewPeriod === 'weekly' ? '↑ 23%' : '↑ 67%'}
                  </div>
                  <div className="text-sm text-muted-foreground">Community Engagement Growth</div>
                </div>
                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="text-lg font-bold text-blue-500">
                    {viewPeriod === 'weekly' ? '156' : '420'}
                  </div>
                  <div className="text-sm text-muted-foreground">Hot Topics Discussed</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
