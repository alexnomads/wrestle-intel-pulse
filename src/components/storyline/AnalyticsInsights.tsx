
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Activity, BarChart3 } from "lucide-react";
import { RedditPost, NewsItem } from "@/services/data/dataTypes";
import { SupabaseWrestler } from "@/integrations/supabase/types";
import { StorylineAnalysis } from "@/services/advancedAnalyticsService";
import { analyzeSentiment } from "@/services/wrestlingDataService";

interface AnalyticsInsightsProps {
  redditPosts: RedditPost[];
  newsItems: NewsItem[];
  wrestlers: SupabaseWrestler[];
  storylines: StorylineAnalysis[];
  onKeywordClick: (keyword: string) => void;
}

export const AnalyticsInsights = ({ 
  redditPosts, 
  newsItems, 
  wrestlers, 
  storylines,
  onKeywordClick 
}: AnalyticsInsightsProps) => {
  // Calculate top wrestlers by mentions
  const wrestlerMentions = wrestlers.map(wrestler => {
    const newsMentions = newsItems.filter(item => 
      item.title.toLowerCase().includes(wrestler.name.toLowerCase()) ||
      (item.contentSnippet && item.contentSnippet.toLowerCase().includes(wrestler.name.toLowerCase()))
    );
    
    const redditMentions = redditPosts.filter(post => 
      post.title.toLowerCase().includes(wrestler.name.toLowerCase()) ||
      post.selftext.toLowerCase().includes(wrestler.name.toLowerCase())
    );

    const totalMentions = newsMentions.length + redditMentions.length;

    let sentiment = 0.5; // Default neutral sentiment
    
    if (totalMentions > 0) {
      // Calculate sentiment for news items
      const newsSentiments = newsMentions.map(item => {
        const content = `${item.title} ${item.contentSnippet || ''}`;
        return analyzeSentiment(content).score;
      });
      
      // Calculate sentiment for reddit posts
      const redditSentiments = redditMentions.map(post => {
        const content = `${post.title} ${post.selftext}`;
        return analyzeSentiment(content).score;
      });
      
      // Combine all sentiments
      const allSentiments = [...newsSentiments, ...redditSentiments];
      if (allSentiments.length > 0) {
        sentiment = allSentiments.reduce((sum, score) => sum + score, 0) / allSentiments.length;
      }
    }

    return {
      wrestler,
      mentionCount: totalMentions,
      sentiment
    };
  }).filter(w => w.mentionCount > 0)
    .sort((a, b) => b.mentionCount - a.mentionCount)
    .slice(0, 5);

  // Calculate promotion insights
  const promotionStats = storylines.reduce((acc, storyline) => {
    const promotion = storyline.promotion;
    if (!acc[promotion]) {
      acc[promotion] = {
        storylineCount: 0,
        avgReception: 0,
        avgIntensity: 0
      };
    }
    
    acc[promotion].storylineCount++;
    acc[promotion].avgReception += storyline.fan_reception_score || 0.5;
    acc[promotion].avgIntensity += storyline.intensity_score || 0.5;
    
    return acc;
  }, {} as Record<string, { storylineCount: number; avgReception: number; avgIntensity: number }>);

  Object.keys(promotionStats).forEach(promotion => {
    const stats = promotionStats[promotion];
    stats.avgReception = stats.avgReception / stats.storylineCount;
    stats.avgIntensity = stats.avgIntensity / stats.storylineCount;
  });

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Trending Wrestlers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {wrestlerMentions.length > 0 ? (
              wrestlerMentions.map((item, index) => (
                <div key={item.wrestler.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold text-wrestling-electric">#{index + 1}</div>
                    <div>
                      <button
                        onClick={() => onKeywordClick(item.wrestler.name)}
                        className="font-medium hover:text-wrestling-electric transition-colors"
                      >
                        {item.wrestler.name}
                      </button>
                      <div className="text-sm text-muted-foreground">
                        {item.wrestler.promotions?.name || 'Unknown Promotion'} • {item.wrestler.brand || 'No Brand'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{item.mentionCount} mentions</div>
                    <div className={`text-sm ${item.sentiment > 0.6 ? 'text-green-500' : item.sentiment < 0.4 ? 'text-red-500' : 'text-yellow-500'}`}>
                      {Math.round(item.sentiment * 100)}% sentiment
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No wrestler mentions found in current data
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Promotion Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(promotionStats).map(([promotion, stats]) => (
              <div key={promotion} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <button
                    onClick={() => onKeywordClick(promotion)}
                    className="font-medium hover:text-wrestling-electric transition-colors"
                  >
                    {promotion.toUpperCase()}
                  </button>
                  <div className="text-sm text-muted-foreground">
                    {stats.storylineCount} active storylines
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm">
                    Reception: <span className={`font-medium ${stats.avgReception > 0.6 ? 'text-green-500' : stats.avgReception < 0.4 ? 'text-red-500' : 'text-yellow-500'}`}>
                      {Math.round(stats.avgReception * 100)}%
                    </span>
                  </div>
                  <div className="text-sm">
                    Intensity: <span className="font-medium text-wrestling-electric">
                      {Math.round(stats.avgIntensity * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Platform Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-wrestling-electric">{redditPosts.length}</div>
              <div className="text-sm text-muted-foreground">Reddit Posts</div>
              <div className="text-xs text-muted-foreground mt-1">
                Avg Score: {redditPosts.length > 0 ? Math.round(redditPosts.reduce((sum, post) => sum + post.score, 0) / redditPosts.length) : 0}
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-wrestling-electric">{newsItems.length}</div>
              <div className="text-sm text-muted-foreground">News Articles</div>
              <div className="text-xs text-muted-foreground mt-1">
                Coverage Score: {newsItems.length > 10 ? 'High' : newsItems.length > 5 ? 'Medium' : 'Low'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
