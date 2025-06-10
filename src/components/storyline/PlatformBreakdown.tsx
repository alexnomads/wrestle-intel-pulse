
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Hash } from "lucide-react";
import { RedditPost, NewsItem } from "@/services/data/dataTypes";

interface PlatformBreakdownProps {
  redditPosts: RedditPost[];
  newsItems: NewsItem[];
}

export const PlatformBreakdown = ({ redditPosts, newsItems }: PlatformBreakdownProps) => {
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
    if (sentiment > 0.7) return "text-green-300 border-green-400/40 bg-green-400/15 hover:bg-green-400/25";
    if (sentiment > 0.6) return "text-green-200 border-green-300/40 bg-green-300/15 hover:bg-green-300/25";
    if (sentiment > 0.4) return "text-gray-200 border-gray-300/40 bg-gray-300/15 hover:bg-gray-300/25";
    return "text-red-300 border-red-400/40 bg-red-400/15 hover:bg-red-400/25";
  };

  const getBubbleSize = (volume: number) => {
    const normalizedSize = (volume / maxVolume) * 1.2 + 0.8;
    return Math.min(normalizedSize, 1.8);
  };

  const handleHashtagClick = (hashtag: string) => {
    // Remove # and create search URL
    const searchTerm = hashtag.replace('#', '');
    const searchQuery = `${searchTerm} wrestling site:reddit.com OR site:twitter.com`;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
  };

  return (
    <Card className="glass-card h-[400px]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5" />
          Wrestling Hashtags Analytics
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Bubble size = volume • Color = sentiment • Trending arrows show movement
        </p>
      </CardHeader>
      <CardContent className="h-[300px] overflow-hidden p-4">
        {/* Hashtag bubbles arranged in a compact grid */}
        <div className="grid grid-cols-2 gap-3 h-full">
          {wrestlingHashtags.slice(0, 8).map((hashtag, index) => {
            const size = getBubbleSize(hashtag.volume);
            
            return (
              <button
                key={hashtag.tag}
                onClick={() => handleHashtagClick(hashtag.tag)}
                className={`${getSentimentColor(hashtag.sentiment)} hover:scale-110 transition-all duration-300 flex flex-col items-center justify-center space-y-2 px-3 py-3 rounded-lg border-2 hover:shadow-lg group relative cursor-pointer`}
                style={{ fontSize: `${Math.max(size * 0.7, 0.75)}rem` }}
              >
                <div className="absolute top-2 right-2">
                  {getTrendIcon(hashtag.trend)}
                </div>
                
                <div className="font-bold text-center leading-tight">
                  {hashtag.tag}
                </div>
                
                <div className="text-xs opacity-80 text-center space-y-1">
                  <div className="font-semibold">{hashtag.volume.toLocaleString()}</div>
                  <div className={`text-xs ${hashtag.trend === 'up' ? 'text-green-400' : hashtag.trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
                    {hashtag.growth}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        
        {/* Quick stats at bottom */}
        <div className="mt-4 pt-3 border-t border-border/50">
          <div className="grid grid-cols-2 gap-4 text-center text-xs">
            <div>
              <div className="text-lg font-bold text-wrestling-electric">
                {wrestlingHashtags.reduce((sum, h) => sum + h.volume, 0).toLocaleString()}
              </div>
              <div className="text-muted-foreground">Total Volume</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-400">
                {wrestlingHashtags.filter(h => h.trend === 'up').length}
              </div>
              <div className="text-muted-foreground">Trending ↑</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
