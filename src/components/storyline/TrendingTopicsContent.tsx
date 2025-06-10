
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { NewsItem, RedditPost } from "@/services/data/dataTypes";
import { TrendingTopic } from "@/services/advancedAnalyticsService";
import { FanEngagementMetrics } from "./FanEngagementMetrics";

interface TrendingTopicsContentProps {
  redditPosts: RedditPost[];
  newsItems: NewsItem[];
  trendingTopics: TrendingTopic[];
  onKeywordClick: (keyword: string) => void;
}

export const TrendingTopicsContent = ({ 
  redditPosts, 
  newsItems, 
  trendingTopics, 
  onKeywordClick 
}: TrendingTopicsContentProps) => {
  // Calculate fan engagement metrics from X/Twitter and Reddit
  const calculateFanEngagement = () => {
    const topicEngagement = trendingTopics.map(topic => {
      // Count Reddit discussions
      const redditMentions = redditPosts.filter(post => 
        topic.keywords.some(keyword => 
          post.title.toLowerCase().includes(keyword.toLowerCase()) ||
          post.selftext.toLowerCase().includes(keyword.toLowerCase())
        )
      );

      // Count news coverage
      const newsMentions = newsItems.filter(item => 
        topic.keywords.some(keyword => 
          item.title.toLowerCase().includes(keyword.toLowerCase()) ||
          (item.contentSnippet && item.contentSnippet.toLowerCase().includes(keyword.toLowerCase()))
        )
      );

      // Calculate engagement score based on Reddit upvotes and comments
      const redditEngagement = redditMentions.reduce((total, post) => 
        total + post.score + (post.num_comments * 2), 0
      );

      // Calculate overall fan reception
      const totalMentions = redditMentions.length + newsMentions.length;
      const engagementScore = totalMentions > 0 ? 
        Math.min((redditEngagement / totalMentions) / 10, 10) : 0;

      return {
        title: topic.title,
        mentions: totalMentions,
        redditEngagement: redditMentions.length,
        newsVolume: newsMentions.length,
        fanReception: Math.round(engagementScore * 10),
        sentiment: topic.sentiment || 0.5,
        growth: topic.growth_rate || 0,
        keywords: topic.keywords,
        relatedNews: newsMentions,
        relatedReddit: redditMentions
      };
    }).sort((a, b) => (b.mentions + b.redditEngagement) - (a.mentions + a.redditEngagement));

    return topicEngagement;
  };

  const handleMentionsClick = (topic: any) => {
    // If there are related news or Reddit posts, open the first one
    if (topic.relatedNews && topic.relatedNews.length > 0) {
      window.open(topic.relatedNews[0].link, '_blank');
    } else if (topic.relatedReddit && topic.relatedReddit.length > 0) {
      window.open(`https://reddit.com${topic.relatedReddit[0].permalink}`, '_blank');
    } else {
      // Fallback to Google search
      const searchQuery = `wrestling ${topic.title} site:reddit.com OR site:wrestling-news.com`;
      window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
    }
  };

  const fanEngagement = calculateFanEngagement();

  return (
    <div className="space-y-6">
      <FanEngagementMetrics 
        redditPosts={redditPosts}
        newsItemsCount={newsItems.length}
        fanEngagement={fanEngagement}
      />

      {fanEngagement.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              No trending topics available. Try refreshing the news data to generate trending topics.
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {fanEngagement.map((topic, index) => (
            <Card key={index} className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">{topic.title}</h3>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Fan Reception</div>
                      <div className="text-lg font-bold text-wrestling-electric">{topic.fanReception}%</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <button
                      onClick={() => handleMentionsClick(topic)}
                      className="text-xl font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center justify-center space-x-1"
                    >
                      <span>{topic.mentions}</span>
                      <ExternalLink className="h-4 w-4" />
                    </button>
                    <div className="text-xs text-muted-foreground">Total Mentions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-orange-400">{topic.redditEngagement}</div>
                    <div className="text-xs text-muted-foreground">Reddit Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-400">{topic.newsVolume}</div>
                    <div className="text-xs text-muted-foreground">News Articles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-400">{Math.round(topic.sentiment * 100)}%</div>
                    <div className="text-xs text-muted-foreground">Positive Sentiment</div>
                  </div>
                </div>
                
                {/* Clickable Keywords */}
                {topic.keywords && topic.keywords.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Related Keywords (Click to explore):</h4>
                    <div className="flex flex-wrap gap-2">
                      {topic.keywords.slice(0, 8).map((keyword, keyIndex) => (
                        <button
                          key={keyIndex}
                          onClick={() => onKeywordClick(keyword)}
                          className="px-3 py-1 bg-wrestling-electric/20 hover:bg-wrestling-electric/30 text-wrestling-electric rounded-full text-sm transition-colors flex items-center space-x-1"
                        >
                          <span>{keyword}</span>
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
