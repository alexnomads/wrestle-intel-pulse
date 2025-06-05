
import { MessageSquare, ArrowUp, ExternalLink, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useComprehensiveReddit } from "@/hooks/useWrestlingData";

export const RedditFeed = () => {
  const { data: redditPosts, isLoading, error, refetch } = useComprehensiveReddit();

  const formatTimeAgo = (timestamp: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diffInHours = Math.floor((now - timestamp) / 3600);
    
    if (diffInHours < 1) return "Less than 1h ago";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-orange-500" />
            <span>Wrestling Reddit Communities</span>
            <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
              {redditPosts?.length || 0} posts
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
            Loading posts from all wrestling subreddits...
          </div>
        )}
        
        {error && (
          <div className="text-center text-red-400">
            Error loading Reddit posts. Please try again.
          </div>
        )}
        
        {redditPosts && redditPosts.length > 0 ? (
          redditPosts.slice(0, 8).map((post, index) => (
            <div key={post.url + index} className="p-4 bg-secondary/20 rounded-lg space-y-3 hover:bg-secondary/30 transition-colors">
              <div className="flex items-start justify-between">
                <h4 className="font-medium text-foreground leading-tight">{post.title}</h4>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => window.open(`https://reddit.com${post.permalink}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              
              {post.selftext && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {post.selftext.substring(0, 150)}...
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs">
                    r/{post.subreddit}
                  </span>
                  <span>u/{post.author}</span>
                  <span>•</span>
                  <span>{formatTimeAgo(post.created_utc)}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <ArrowUp className="h-4 w-4" />
                  <span>{post.score}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{post.num_comments}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          !isLoading && (
            <div className="text-center text-muted-foreground">
              No Reddit posts available from wrestling communities
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
};
