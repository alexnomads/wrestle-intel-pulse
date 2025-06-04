
import { TrendingUp, Flame, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRSSFeeds, useRedditPosts } from "@/hooks/useWrestlingData";
import { generateTrendingTopics } from "@/services/trendingService";

export const TrendingSection = () => {
  const { data: newsItems = [] } = useRSSFeeds();
  const { data: redditPosts = [] } = useRedditPosts();
  
  const trendingTopics = generateTrendingTopics(newsItems, redditPosts);

  const getIcon = (index: number) => {
    switch (index % 3) {
      case 0: return Flame;
      case 1: return Zap;
      default: return TrendingUp;
    }
  };

  const getIconColor = (index: number) => {
    switch (index % 3) {
      case 0: return "text-red-500";
      case 1: return "text-wrestling-electric";
      default: return "text-green-500";
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Flame className="h-5 w-5 text-red-500" />
          <span>Trending Now</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trendingTopics.length > 0 ? (
            trendingTopics.map((topic, index) => {
              const IconComponent = getIcon(index);
              return (
                <div 
                  key={topic.title} 
                  className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent className={`h-4 w-4 ${getIconColor(index)}`} />
                    <span className="font-medium text-foreground group-hover:text-wrestling-electric transition-colors">
                      {topic.title}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{topic.mentions}</span>
                    <span className="text-xs text-muted-foreground">mentions</span>
                  </div>
                </div>
              );
            })
          ) : (
            // Fallback to static data when no trending topics are detected
            [
              { title: "CM Punk WWE Return", mentions: "15.2K", icon: Flame, color: "text-red-500" },
              { title: "AEW Dynasty PPV", mentions: "8.7K", icon: Zap, color: "text-wrestling-electric" },
              { title: "NJPW Strong Tapings", mentions: "4.1K", icon: TrendingUp, color: "text-green-500" },
            ].map((topic, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                <div className="flex items-center space-x-3">
                  <topic.icon className={`h-4 w-4 ${topic.color}`} />
                  <span className="font-medium text-foreground">{topic.title}</span>
                </div>
                <span className="text-sm text-muted-foreground">{topic.mentions}</span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
