
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import { useComprehensiveReddit } from "@/hooks/useWrestlingData";
import { useComprehensiveNews } from "@/hooks/useWrestlingData";
import { generateTrendingTopics } from "@/services/trendingService";
import { PeriodToggle } from "./community-hot-topics/PeriodToggle";
import { SentimentSummary } from "./community-hot-topics/SentimentSummary";
import { TrendingTopics } from "./community-hot-topics/TrendingTopics";
import { HotDiscussions } from "./community-hot-topics/HotDiscussions";
import { PeriodSummary } from "./community-hot-topics/PeriodSummary";
import { CommunityHotTopicsProps, ViewPeriod, TrendSummary } from "./community-hot-topics/types";

export const CommunityHotTopics = ({ refreshTrigger }: CommunityHotTopicsProps) => {
  const [viewPeriod, setViewPeriod] = useState<ViewPeriod>('daily');
  const { data: redditPosts = [] } = useComprehensiveReddit();
  const { data: newsItems = [] } = useComprehensiveNews();

  const trendingTopics = generateTrendingTopics(newsItems, redditPosts);

  // Get hot Reddit discussions
  const hotDiscussions = redditPosts
    .filter(post => post.score > 50 || post.num_comments > 20)
    .sort((a, b) => (b.score + b.num_comments * 2) - (a.score + a.num_comments * 2))
    .slice(0, 8);

  // Generate weekly/monthly summaries
  const getTrendSummary = (): TrendSummary => {
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
          
          <PeriodToggle viewPeriod={viewPeriod} onPeriodChange={setViewPeriod} />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Community Sentiment Summary */}
          <SentimentSummary summary={summary} />

          {/* Hot Topics from Trending Service */}
          <TrendingTopics trendingTopics={trendingTopics} />

          {/* Hot Reddit Discussions */}
          <HotDiscussions hotDiscussions={hotDiscussions} />

          {/* Weekly/Monthly Summary based on selected period */}
          <PeriodSummary viewPeriod={viewPeriod} />
        </div>
      </CardContent>
    </Card>
  );
};
