import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ExternalLink, AlertTriangle, MessageSquare, ArrowUp, Filter } from "lucide-react";
import { useComprehensiveNews } from "@/hooks/useWrestlingData";
import { useComprehensiveReddit } from "@/hooks/useWrestlingData";
import { analyzeSentiment } from "@/services/wrestlingDataService";

interface UnifiedNewsFeedProps {
  refreshTrigger: Date;
}

interface UnifiedItem {
  id: string;
  title: string;
  content: string;
  source: string;
  type: 'news' | 'reddit';
  timestamp: Date;
  link: string;
  sentiment: number;
  credibilityScore: number;
  isBreaking?: boolean;
  engagement?: {
    score?: number;
    comments?: number;
  };
}

export const UnifiedNewsFeed = ({ refreshTrigger }: UnifiedNewsFeedProps) => {
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative'>('all');
  const { data: newsItems = [] } = useComprehensiveNews();
  const { data: redditPosts = [] } = useComprehensiveReddit();

  const getCredibilityScore = (source: string) => {
    const reliableSources = ['wrestling observer', 'pwinsider', 'fightful', 'wrestling inc'];
    const moderateSources = ['wrestling news', 'sescoops', 'ringside news'];
    
    const lowerSource = source.toLowerCase();
    if (reliableSources.some(reliable => lowerSource.includes(reliable))) return 90;
    if (moderateSources.some(moderate => lowerSource.includes(moderate))) return 70;
    if (lowerSource.includes('reddit')) return 60;
    return 50;
  };

  const isBreakingNews = (title: string, timestamp: Date) => {
    const breakingKeywords = ['breaking', 'fired', 'released', 'injured', 'returns', 'debuts', 'champion'];
    const hoursOld = (Date.now() - timestamp.getTime()) / (1000 * 60 * 60);
    return hoursOld < 2 && breakingKeywords.some(keyword => title.toLowerCase().includes(keyword));
  };

  const handleItemClick = (link: string, title: string, type: 'news' | 'reddit') => {
    console.log(`Opening ${type} item:`, title, 'Link:', link);
    
    let finalUrl = link;
    if (type === 'reddit' && !link.startsWith('http')) {
      finalUrl = `https://reddit.com${link}`;
    }
    
    if (finalUrl && finalUrl !== '#') {
      try {
        window.open(finalUrl, '_blank', 'noopener,noreferrer');
      } catch (error) {
        console.error('Failed to open link:', error);
        window.location.href = finalUrl;
      }
    } else {
      console.warn('No valid link for item:', title);
      alert('Sorry, no link is available for this item.');
    }
  };

  // Combine and process all items
  const unifiedItems: UnifiedItem[] = [
    ...newsItems.map((item, index) => {
      const sentiment = analyzeSentiment(item.title + ' ' + item.contentSnippet);
      return {
        id: `news-${index}`,
        title: item.title,
        content: item.contentSnippet,
        source: item.source || 'Wrestling News',
        type: 'news' as const,
        timestamp: new Date(item.pubDate),
        link: item.link || '#',
        sentiment: sentiment.score,
        credibilityScore: getCredibilityScore(item.source || ''),
        isBreaking: isBreakingNews(item.title, new Date(item.pubDate))
      };
    }),
    ...redditPosts.map((post, index) => {
      const sentiment = analyzeSentiment(post.title + ' ' + post.selftext);
      return {
        id: `reddit-${index}`,
        title: post.title,
        content: post.selftext || 'Discussion thread',
        source: `r/${post.subreddit}`,
        type: 'reddit' as const,
        timestamp: new Date(post.created_utc * 1000),
        link: `https://reddit.com${post.permalink}`,
        sentiment: sentiment.score,
        credibilityScore: getCredibilityScore('reddit'),
        engagement: {
          score: post.score,
          comments: post.num_comments
        }
      };
    })
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Apply filters (removed 'breaking' filter)
  const filteredItems = unifiedItems.filter(item => {
    switch (filter) {
      case 'positive':
        return item.sentiment > 0.6;
      case 'negative':
        return item.sentiment < 0.4;
      default:
        return true;
    }
  });

  const getSentimentBadge = (sentiment: number) => {
    if (sentiment > 0.7) return { label: 'Positive', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' };
    if (sentiment > 0.3) return { label: 'Neutral', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' };
    return { label: 'Negative', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' };
  };

  const getCredibilityBadge = (score: number) => {
    if (score >= 80) return { label: 'High', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' };
    if (score >= 60) return { label: 'Medium', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' };
    return { label: 'Low', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' };
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Less than 1h ago";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-6 w-6 text-wrestling-electric" />
            <span>Latest Wrestling News & Community Updates</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {filteredItems.length} items
            </Badge>
          </CardTitle>
          
          {/* Filter Buttons - removed 'breaking' option */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {[
              { id: 'all', label: 'All' },
              { id: 'positive', label: 'Positive' },
              { id: 'negative', label: 'Negative' }
            ].map((filterOption) => (
              <button
                key={filterOption.id}
                onClick={() => setFilter(filterOption.id as any)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  filter === filterOption.id
                    ? 'bg-wrestling-electric text-white'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredItems.slice(0, 15).map((item) => {
            const sentimentBadge = getSentimentBadge(item.sentiment);
            const credibilityBadge = getCredibilityBadge(item.credibilityScore);
            
            return (
              <div 
                key={item.id}
                className={`p-4 rounded-lg transition-all hover:bg-secondary/50 ${
                  item.isBreaking ? 'border-2 border-red-400 bg-red-50 dark:bg-red-900/20' : 'bg-secondary/20'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {item.isBreaking && (
                        <Badge className="bg-red-500 text-white">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          BREAKING
                        </Badge>
                      )}
                      <Badge variant="outline" className={item.type === 'news' ? 'border-blue-400 text-blue-600' : 'border-orange-400 text-orange-600'}>
                        {item.type.toUpperCase()}
                      </Badge>
                      <Badge className={sentimentBadge.color}>
                        {sentimentBadge.label}
                      </Badge>
                      <Badge className={credibilityBadge.color}>
                        {credibilityBadge.label} Credibility
                      </Badge>
                    </div>
                    
                    <h4 className="font-medium text-foreground leading-tight mb-2">
                      {item.title}
                    </h4>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {item.content.substring(0, 150)}...
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <span className={`font-medium ${
                          item.type === 'news' ? 'text-blue-600' : 'text-orange-600'
                        }`}>
                          {item.source}
                        </span>
                        <span>•</span>
                        <span>{formatTimeAgo(item.timestamp)}</span>
                      </div>
                      
                      {item.engagement && (
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <ArrowUp className="h-3 w-3" />
                            <span>{item.engagement.score}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageSquare className="h-3 w-3" />
                            <span>{item.engagement.comments}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-foreground ml-4 shrink-0"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleItemClick(item.link, item.title, item.type);
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
          
          {filteredItems.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No items found for the selected filter.
              Try selecting a different filter or check back later.
            </div>
          )}
        </div>
        
        {filteredItems.length > 0 && (
          <div className="mt-4 pt-4 border-t border-secondary/50">
            <div className="text-xs text-muted-foreground text-center">
              Showing latest {Math.min(15, filteredItems.length)} of {filteredItems.length} items • 
              Auto-refreshing every 10 minutes
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
