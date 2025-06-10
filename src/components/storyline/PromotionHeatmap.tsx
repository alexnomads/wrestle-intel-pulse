
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StorylineAnalysis } from "@/services/advancedAnalyticsService";
import { RedditPost, NewsItem } from "@/services/data/dataTypes";

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
  // Calculate promotion metrics
  const promotionData = storylines.reduce((acc, storyline) => {
    const promotion = storyline.promotion;
    if (!acc[promotion]) {
      acc[promotion] = {
        mentions: 0,
        sentiment: 0,
        storylineCount: 0
      };
    }
    
    acc[promotion].storylineCount++;
    acc[promotion].sentiment += storyline.fan_reception_score || 0.5;
    
    // Count mentions in news and reddit
    const promotionMentions = [
      ...newsItems.filter(item => 
        item.title.toLowerCase().includes(promotion.toLowerCase()) ||
        (item.contentSnippet && item.contentSnippet.toLowerCase().includes(promotion.toLowerCase()))
      ),
      ...redditPosts.filter(post => 
        post.title.toLowerCase().includes(promotion.toLowerCase()) ||
        post.selftext.toLowerCase().includes(promotion.toLowerCase())
      )
    ];
    
    acc[promotion].mentions = promotionMentions.length;
    
    return acc;
  }, {} as Record<string, { mentions: number; sentiment: number; storylineCount: number }>);

  const maxMentions = Math.max(...Object.values(promotionData).map(p => p.mentions));

  return (
    <Card className="glass-card h-96">
      <CardHeader>
        <CardTitle>Wrestling Promotion Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 h-full">
          {Object.entries(promotionData).map(([promotion, data]) => {
            const size = maxMentions > 0 ? (data.mentions / maxMentions) * 100 : 25;
            const avgSentiment = data.storylineCount > 0 ? data.sentiment / data.storylineCount : 0.5;
            
            let colorClass = 'bg-gray-500';
            if (avgSentiment > 0.6) colorClass = 'bg-green-500';
            else if (avgSentiment < 0.4) colorClass = 'bg-red-500';
            
            return (
              <button
                key={promotion}
                onClick={() => onPromotionClick(promotion)}
                className={`${colorClass} rounded-lg p-4 text-white font-bold transition-all hover:scale-105 flex flex-col justify-center items-center`}
                style={{ minHeight: `${Math.max(size, 25)}%` }}
              >
                <div className="text-lg">{promotion.toUpperCase()}</div>
                <div className="text-sm opacity-80">{data.mentions} mentions</div>
                <div className="text-xs opacity-60">{data.storylineCount} storylines</div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
