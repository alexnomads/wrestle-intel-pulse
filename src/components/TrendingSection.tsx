
import { TrendingUp, Flame, Zap, ExternalLink, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWrestlingAnalytics } from "@/hooks/useWrestlingData";
import { generateTrendingTopics } from "@/services/trendingService";

export const TrendingSection = () => {
  const { newsItems, redditPosts, isLoading, refetchAll } = useWrestlingAnalytics();
  
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

  const handleTopicClick = (topic: any) => {
    if (topic.sources && topic.sources.length > 0) {
      const firstSource = topic.sources[0];
      if (firstSource.type === 'news' && firstSource.item.link) {
        window.open(firstSource.item.link, '_blank');
      } else if (firstSource.type === 'reddit' && firstSource.item.permalink) {
        window.open(`https://reddit.com${firstSource.item.permalink}`, '_blank');
      }
    }
  };

  const handleMentionsClick = (topic: any, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent the topic click handler from firing
    
    if (topic.sources && topic.sources.length > 0) {
      // If there are multiple sources, open the first few in new tabs
      const sourcesToOpen = topic.sources.slice(0, 3); // Limit to 3 sources to avoid spam
      
      sourcesToOpen.forEach((source: any, index: number) => {
        setTimeout(() => {
          if (source.type === 'news' && source.item.link) {
            window.open(source.item.link, '_blank');
          } else if (source.type === 'reddit' && source.item.permalink) {
            window.open(`https://reddit.com${source.item.permalink}`, '_blank');
          }
        }, index * 100); // Small delay between opens to avoid browser blocking
      });
    } else {
      // Fallback: search for the topic
      const searchQuery = `wrestling "${topic.title}" site:reddit.com OR site:wrestling-news.com`;
      window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
    }
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.7) return "text-green-400";
    if (sentiment > 0.4) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Flame className="h-5 w-5 text-red-500" />
            <span>Trending Now</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={refetchAll}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center text-muted-foreground">
              Analyzing trending topics...
            </div>
          ) : trendingTopics.length > 0 ? (
            trendingTopics.map((topic, index) => {
              const IconComponent = getIcon(index);
              return (
                <div 
                  key={topic.title} 
                  className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer group"
                  onClick={() => handleTopicClick(topic)}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <IconComponent className={`h-4 w-4 ${getIconColor(index)}`} />
                    <div className="flex-1">
                      <span className="font-medium text-foreground group-hover:text-wrestling-electric transition-colors">
                        {topic.title}
                      </span>
                      {topic.relatedWrestlers.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {topic.relatedWrestlers.slice(0, 3).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <button
                        onClick={(e) => handleMentionsClick(topic, e)}
                        className="text-sm font-medium hover:text-wrestling-electric transition-colors cursor-pointer border-b border-transparent hover:border-wrestling-electric"
                      >
                        {topic.mentions}
                      </button>
                      <div className="text-xs text-muted-foreground">mentions</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getSentimentColor(topic.sentiment)}`}>
                        {Math.round(topic.sentiment * 100)}%
                      </div>
                      <div className="text-xs text-muted-foreground">sentiment</div>
                    </div>
                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-muted-foreground">
              No trending topics found. Check back soon!
            </div>
          )}
        </div>
        
        {trendingTopics.length > 0 && (
          <div className="mt-4 pt-4 border-t border-secondary/50">
            <div className="text-xs text-muted-foreground text-center">
              Data from {newsItems.length} news articles and {redditPosts.length} Reddit posts
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
