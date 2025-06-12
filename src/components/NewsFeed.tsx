
import { Clock, ExternalLink, Heart, MessageCircle, Share, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useComprehensiveNews } from "@/hooks/useWrestlingData";

export const NewsFeed = () => {
  const { data: newsItems, isLoading, error, refetch } = useComprehensiveNews();

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Less than 1h ago";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleArticleClick = (link: string, title: string) => {
    console.log('Opening article:', title, 'Link:', link);
    
    if (link && link !== '#') {
      try {
        window.open(link, '_blank', 'noopener,noreferrer');
      } catch (error) {
        console.error('Failed to open link:', error);
        window.location.href = link;
      }
    } else {
      console.warn('No valid link for article:', title);
      alert('Sorry, no link is available for this article.');
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-wrestling-electric" />
            <span>Comprehensive Wrestling News</span>
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
              {newsItems?.length || 0} sources
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="text-center text-muted-foreground">
            Loading comprehensive wrestling news from all sources...
          </div>
        )}
        
        {error && (
          <div className="text-center text-red-400">
            Error loading comprehensive news. Please try again.
          </div>
        )}
        
        {newsItems && newsItems.length > 0 ? (
          newsItems.slice(0, 8).map((item, index) => (
            <div key={item.guid || index} className="p-4 bg-secondary/20 rounded-lg space-y-3 hover:bg-secondary/30 transition-colors">
              <div className="flex items-start justify-between">
                <h4 className="font-medium text-foreground leading-tight">{item.title}</h4>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:text-foreground shrink-0"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleArticleClick(item.link, item.title);
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2">
                {item.contentSnippet.substring(0, 150)}...
              </p>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <span className="bg-wrestling-electric/20 text-wrestling-electric px-2 py-1 rounded text-xs">
                    {item.source}
                  </span>
                  <span>•</span>
                  <span>{formatTimeAgo(item.pubDate)}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Heart className="h-4 w-4" />
                  <span>--</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>--</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Share className="h-4 w-4" />
                  <span>--</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          !isLoading && (
            <div className="text-center text-muted-foreground">
              No comprehensive news items available
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
};
