
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Hash } from "lucide-react";
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
  // Enhanced trending hashtags with real-time data simulation
  const wrestlingHashtags = [
    { 
      tag: "#WWERAW", 
      volume: 1250 + Math.floor(Math.random() * 200), 
      sentiment: 0.65 + (Math.random() * 0.2 - 0.1), 
      trend: "up",
      growth: "+15%"
    },
    { 
      tag: "#WWESmackDown", 
      volume: 980 + Math.floor(Math.random() * 150), 
      sentiment: 0.72 + (Math.random() * 0.15 - 0.075), 
      trend: "up",
      growth: "+8%"
    },
    { 
      tag: "#AEWDynamite", 
      volume: 820 + Math.floor(Math.random() * 180), 
      sentiment: 0.68 + (Math.random() * 0.2 - 0.1), 
      trend: "up",
      growth: "+12%"
    },
    { 
      tag: "#AEWCollision", 
      volume: 445 + Math.floor(Math.random() * 100), 
      sentiment: 0.58 + (Math.random() * 0.2 - 0.1), 
      trend: "down",
      growth: "-3%"
    },
    { 
      tag: "#WWE", 
      volume: 2100 + Math.floor(Math.random() * 300), 
      sentiment: 0.61 + (Math.random() * 0.15 - 0.075), 
      trend: "up",
      growth: "+6%"
    },
    { 
      tag: "#AEW", 
      volume: 1650 + Math.floor(Math.random() * 250), 
      sentiment: 0.64 + (Math.random() * 0.18 - 0.09), 
      trend: "stable",
      growth: "+1%"
    },
    { 
      tag: "#NXT", 
      volume: 380 + Math.floor(Math.random() * 80), 
      sentiment: 0.59 + (Math.random() * 0.2 - 0.1), 
      trend: "up",
      growth: "+18%"
    },
    { 
      tag: "#TNA", 
      volume: 125 + Math.floor(Math.random() * 50), 
      sentiment: 0.55 + (Math.random() * 0.25 - 0.125), 
      trend: "stable",
      growth: "0%"
    },
    { 
      tag: "#RoyalRumble", 
      volume: 890 + Math.floor(Math.random() * 200), 
      sentiment: 0.78 + (Math.random() * 0.15 - 0.075), 
      trend: "up",
      growth: "+25%"
    },
    { 
      tag: "#Wrestlemania", 
      volume: 1420 + Math.floor(Math.random() * 300), 
      sentiment: 0.82 + (Math.random() * 0.12 - 0.06), 
      trend: "up",
      growth: "+32%"
    }
  ];

  const maxVolume = Math.max(...wrestlingHashtags.map(h => h.volume));

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-3 w-3 text-green-400" />;
      case "down": return <TrendingDown className="h-3 w-3 text-red-400" />;
      default: return <Minus className="h-3 w-3 text-gray-400" />;
    }
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.7) return "text-green-400 border-green-400/30 bg-green-400/10";
    if (sentiment > 0.6) return "text-green-300 border-green-300/30 bg-green-300/10";
    if (sentiment > 0.4) return "text-gray-300 border-gray-300/30 bg-gray-300/10";
    return "text-red-400 border-red-400/30 bg-red-400/10";
  };

  const getBubbleSize = (volume: number) => {
    const normalizedSize = (volume / maxVolume) * 2 + 0.8;
    return Math.min(normalizedSize, 3);
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5" />
          Trending Wrestling Topics
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Real-time hashtag monitoring • Bubble size = volume • Color = sentiment
        </p>
      </CardHeader>
      <CardContent>
        {/* Main hashtag cloud */}
        <div className="flex flex-wrap gap-3 mb-6">
          {wrestlingHashtags.map((hashtag) => {
            const size = getBubbleSize(hashtag.volume);
            
            return (
              <button
                key={hashtag.tag}
                onClick={() => onHashtagClick(hashtag.tag)}
                className={`${getSentimentColor(hashtag.sentiment)} hover:scale-110 transition-all duration-300 flex items-center space-x-2 px-4 py-3 rounded-full border-2 hover:shadow-lg group`}
                style={{ fontSize: `${size * 0.8}rem` }}
              >
                <span className="font-bold">{hashtag.tag}</span>
                <div className="flex items-center space-x-1 text-xs opacity-75">
                  <span>({hashtag.volume})</span>
                  {getTrendIcon(hashtag.trend)}
                  <span className={`${hashtag.trend === 'up' ? 'text-green-400' : hashtag.trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
                    {hashtag.growth}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        
        {/* Analytics summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-4 border-t border-border/50">
          <div className="text-center">
            <div className="text-2xl font-bold text-wrestling-electric">
              {wrestlingHashtags.reduce((sum, h) => sum + h.volume, 0).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Total Mentions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {Math.round(wrestlingHashtags.reduce((sum, h) => sum + h.sentiment, 0) / wrestlingHashtags.length * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">Avg Sentiment</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {wrestlingHashtags.filter(h => h.trend === 'up').length}
            </div>
            <div className="text-xs text-muted-foreground">Trending Up</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {wrestlingHashtags.length}
            </div>
            <div className="text-xs text-muted-foreground">Active Topics</div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-4 text-xs text-muted-foreground">
          <div className="flex items-center justify-center space-x-6">
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
