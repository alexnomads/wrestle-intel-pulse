
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { RedditPost, NewsItem } from "@/services/data/dataTypes";

interface TrendingHashtagCloudProps {
  redditPosts: RedditPost[];
  newsItems: NewsItem[];
  onHashtagClick: (hashtag: string) => void;
}

export const TrendingHashtagCloud = ({ 
  redditPosts, 
  newsItems, 
  onHashtagClick 
}: TrendingHashtagCloudProps) => {
  // Extract trending hashtags and keywords
  const wrestlingHashtags = [
    { tag: "#WWERAW", volume: 1250, sentiment: 0.65, trend: "up" },
    { tag: "#WWESmackDown", volume: 980, sentiment: 0.72, trend: "up" },
    { tag: "#AEWDynamite", volume: 820, sentiment: 0.68, trend: "up" },
    { tag: "#AEWCollision", volume: 445, sentiment: 0.58, trend: "down" },
    { tag: "#WWE", volume: 2100, sentiment: 0.61, trend: "up" },
    { tag: "#AEW", volume: 1650, sentiment: 0.64, trend: "stable" },
    { tag: "#NXT", volume: 380, sentiment: 0.59, trend: "up" },
    { tag: "#TNA", volume: 125, sentiment: 0.55, trend: "stable" },
    { tag: "#RoyalRumble", volume: 890, sentiment: 0.78, trend: "up" },
    { tag: "#Wrestlemania", volume: 1420, sentiment: 0.82, trend: "up" }
  ];

  const maxVolume = Math.max(...wrestlingHashtags.map(h => h.volume));

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-3 w-3 text-green-500" />;
      case "down": return <TrendingDown className="h-3 w-3 text-red-500" />;
      default: return <Minus className="h-3 w-3 text-gray-500" />;
    }
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.7) return "text-green-400";
    if (sentiment > 0.6) return "text-green-300";
    if (sentiment > 0.4) return "text-gray-300";
    return "text-red-400";
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Trending Topics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {wrestlingHashtags.map((hashtag) => {
            const size = (hashtag.volume / maxVolume) * 1.5 + 0.8;
            
            return (
              <button
                key={hashtag.tag}
                onClick={() => onHashtagClick(hashtag.tag)}
                className={`${getSentimentColor(hashtag.sentiment)} hover:scale-110 transition-all duration-200 flex items-center space-x-1 px-3 py-2 rounded-full bg-secondary/20 hover:bg-secondary/40`}
                style={{ fontSize: `${size}rem` }}
              >
                <span className="font-bold">{hashtag.tag}</span>
                <span className="text-xs opacity-75">({hashtag.volume})</span>
                {getTrendIcon(hashtag.trend)}
              </button>
            );
          })}
        </div>
        
        <div className="mt-4 text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span>Positive sentiment</span>
            </span>
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
              <span>Neutral sentiment</span>
            </span>
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-red-400"></div>
              <span>Negative sentiment</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
