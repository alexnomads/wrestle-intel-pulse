
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StorylineAnalysis } from "@/services/advancedAnalyticsService";
import { RedditPost, NewsItem } from "@/services/data/dataTypes";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface PromotionHeatmapProps {
  storylines: StorylineAnalysis[];
  redditPosts: RedditPost[];
  newsItems: NewsItem[];
  onPromotionClick: (promotion: string) => void;
}

export const PromotionHeatmap = ({ 
  storylines, 
  redditPosts, 
  newsItems, 
  onPromotionClick 
}: PromotionHeatmapProps) => {
  // Ensure major promotions are always included
  const majorPromotions = ['WWE', 'AEW', 'TNA', 'NXT'];
  
  // Calculate promotion metrics with enhanced data
  const promotionData = storylines.reduce((acc, storyline) => {
    const promotion = storyline.promotion;
    if (!acc[promotion]) {
      acc[promotion] = {
        mentions: 0,
        sentiment: 0,
        storylineCount: 0,
        engagement: 0,
        trendingVelocity: 0
      };
    }
    
    acc[promotion].storylineCount++;
    acc[promotion].sentiment += storyline.fan_reception_score || 0.5;
    
    // Count mentions in news and reddit with engagement weighting
    const newsMentions = newsItems.filter(item => 
      item.title.toLowerCase().includes(promotion.toLowerCase()) ||
      (item.contentSnippet && item.contentSnippet.toLowerCase().includes(promotion.toLowerCase()))
    );
    
    const redditMentions = redditPosts.filter(post => 
      post.title.toLowerCase().includes(promotion.toLowerCase()) ||
      post.selftext.toLowerCase().includes(promotion.toLowerCase())
    );
    
    acc[promotion].mentions = newsMentions.length + redditMentions.length;
    
    // Calculate engagement score from Reddit
    acc[promotion].engagement = redditMentions.reduce((sum, post) => 
      sum + post.score + post.num_comments, 0
    );
    
    // Calculate trending velocity (recent posts)
    const recentRedditMentions = redditMentions.filter(post => {
      const postDate = new Date(post.created_utc * 1000);
      const hoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
      return postDate > hoursAgo;
    });
    acc[promotion].trendingVelocity = recentRedditMentions.length;
    
    return acc;
  }, {} as Record<string, { 
    mentions: number; 
    sentiment: number; 
    storylineCount: number; 
    engagement: number;
    trendingVelocity: number;
  }>);

  // Ensure major promotions exist even if not in storylines
  majorPromotions.forEach(promotion => {
    if (!promotionData[promotion]) {
      const newsMentions = newsItems.filter(item => 
        item.title.toLowerCase().includes(promotion.toLowerCase()) ||
        (item.contentSnippet && item.contentSnippet.toLowerCase().includes(promotion.toLowerCase()))
      );
      
      const redditMentions = redditPosts.filter(post => 
        post.title.toLowerCase().includes(promotion.toLowerCase()) ||
        post.selftext.toLowerCase().includes(promotion.toLowerCase())
      );

      promotionData[promotion] = {
        mentions: newsMentions.length + redditMentions.length,
        sentiment: 0.5, // neutral sentiment
        storylineCount: 0,
        engagement: redditMentions.reduce((sum, post) => sum + post.score + post.num_comments, 0),
        trendingVelocity: 0
      };
    }
  });

  const maxMentions = Math.max(...Object.values(promotionData).map(p => p.mentions), 1);
  const maxEngagement = Math.max(...Object.values(promotionData).map(p => p.engagement), 1);

  const getSentimentColor = (avgSentiment: number) => {
    if (avgSentiment > 0.65) return "bg-gradient-to-br from-green-500 to-green-600 border-green-400";
    if (avgSentiment > 0.35) return "bg-gradient-to-br from-gray-500 to-gray-600 border-gray-400";
    return "bg-gradient-to-br from-red-500 to-red-600 border-red-400";
  };

  const getIntensityOpacity = (mentions: number) => {
    const intensity = mentions / maxMentions;
    return Math.max(0.3, intensity);
  };

  return (
    <Card className="glass-card h-[400px]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Wrestling Promotion Heatmap
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Size = mention volume • Color = sentiment strength • Click to filter
        </p>
      </CardHeader>
      <CardContent className="h-[300px]">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 h-full">
          {Object.entries(promotionData).map(([promotion, data]) => {
            const avgSentiment = data.storylineCount > 0 ? data.sentiment / data.storylineCount : 0.5;
            const relativeSize = Math.max(25, (data.mentions / maxMentions) * 100);
            const opacity = getIntensityOpacity(data.mentions);
            const isPositiveTrend = data.trendingVelocity > 2;
            
            return (
              <button
                key={promotion}
                onClick={() => onPromotionClick(promotion)}
                className={`${getSentimentColor(avgSentiment)} rounded-xl p-4 text-white font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg flex flex-col justify-between items-center border-2 min-h-[80px] relative overflow-hidden`}
                style={{ 
                  minHeight: `${relativeSize}%`,
                  opacity
                }}
              >
                {/* Trending indicator */}
                <div className="absolute top-2 right-2">
                  {data.trendingVelocity > 0 && (
                    isPositiveTrend ? (
                      <TrendingUp className="h-4 w-4 text-white/80" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-white/60" />
                    )
                  )}
                </div>
                
                <div className="text-center">
                  <div className="text-lg lg:text-xl font-bold">
                    {promotion.toUpperCase()}
                  </div>
                  <div className="text-xs lg:text-sm opacity-90 mt-1">
                    {data.mentions} mentions
                  </div>
                </div>
                
                <div className="text-center text-xs opacity-75">
                  <div>{data.storylineCount} storylines</div>
                  <div>{Math.round(avgSentiment * 100)}% sentiment</div>
                  {data.engagement > 0 && (
                    <div className="mt-1">
                      {Math.round(data.engagement / maxEngagement * 100)}% engagement
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
