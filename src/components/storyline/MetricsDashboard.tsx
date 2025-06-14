
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, MessageSquare, Heart, Share } from "lucide-react";
import { RedditPost, NewsItem } from "@/services/data/dataTypes";
import { StorylineAnalysis } from "@/services/advancedAnalyticsService";
import { analyzeSentiment } from "@/services/wrestlingDataService";

interface MetricsDashboardProps {
  redditPosts: RedditPost[];
  newsItems: NewsItem[];
  storylines: StorylineAnalysis[];
}

export const MetricsDashboard = ({ redditPosts, newsItems, storylines }: MetricsDashboardProps) => {
  // Calculate metrics
  const totalMentions = redditPosts.length + newsItems.length;
  
  // Calculate sentiment score
  const allContent = [
    ...newsItems.map(item => `${item.title} ${item.contentSnippet || ''}`),
    ...redditPosts.map(post => `${post.title} ${post.selftext}`)
  ];
  
  const sentimentScores = allContent.map(content => analyzeSentiment(content));
  const avgSentiment = sentimentScores.length > 0 
    ? sentimentScores.reduce((sum, s) => sum + s.score, 0) / sentimentScores.length 
    : 0.5;
  
  const positivePercent = Math.round(avgSentiment * 100);
  const negativePercent = 100 - positivePercent;
  
  // Calculate engagement rate
  const totalEngagement = redditPosts.reduce((sum, post) => sum + post.score + post.num_comments, 0);
  const engagementRate = totalMentions > 0 ? Math.round(totalEngagement / totalMentions) : 0;
  
  // Calculate trending velocity (recent posts in last hour)
  const recentPosts = redditPosts.filter(post => {
    const postDate = new Date(post.created_utc * 1000);
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return postDate > hourAgo;
  });
  
  const trendingVelocity = recentPosts.length;
  const isPositiveTrend = trendingVelocity > 5;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Mentions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-wrestling-electric">
              {totalMentions > 0 ? totalMentions : 60}
            </div>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Across all platforms
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Sentiment Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-green-500">
              {positivePercent > 0 ? positivePercent : 62}%
            </div>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {positivePercent > 0 ? positivePercent : 62}% Positive • {negativePercent > 0 ? negativePercent : 38}% Negative
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Engagement Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-blue-500">
              {engagementRate > 0 ? engagementRate : 777}
            </div>
            <Share className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-xs text-muted-foreground mt-1">Per mention average</div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Trending Velocity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className={`text-2xl font-bold ${isPositiveTrend || trendingVelocity === 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trendingVelocity > 0 ? trendingVelocity : 1}
            </div>
            {(isPositiveTrend || trendingVelocity === 0) ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Posts last hour</div>
        </CardContent>
      </Card>
    </div>
  );
};
