
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, AlertTriangle, ArrowUp, MessageSquare, Heart, Repeat, Play } from "lucide-react";
import { UnifiedItem } from "./types";
import { getSentimentBadge, getCredibilityBadge, formatTimeAgo } from "./utils";

interface NewsItemProps {
  item: UnifiedItem;
}

export const NewsItem = ({ item }: NewsItemProps) => {
  const sentimentBadge = getSentimentBadge(item.sentiment);
  const credibilityBadge = getCredibilityBadge(item.credibilityScore);

  const openLink = () => {
    console.log('Attempting to open link:', item.link, 'for item:', item.title);
    
    if (!item.link || item.link === '#' || item.link === '') {
      console.warn('No valid link available for:', item.title);
      alert('Sorry, no link is available for this item.');
      return;
    }

    let finalUrl = item.link;
    
    // Handle Reddit links specifically
    if (item.type === 'reddit' && !item.link.startsWith('http')) {
      finalUrl = `https://reddit.com${item.link}`;
    }
    
    // Ensure the URL has a protocol
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = `https://${finalUrl}`;
    }
    
    console.log('Opening URL:', finalUrl);
    
    // Use window.open with proper parameters
    const newWindow = window.open(finalUrl, '_blank', 'noopener,noreferrer');
    
    // Fallback if window.open failed (popup blocked)
    if (!newWindow) {
      console.log('Window.open failed, trying location.href');
      window.location.href = finalUrl;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'news':
        return 'border-blue-400 text-blue-600';
      case 'reddit':
        return 'border-orange-400 text-orange-600';
      case 'twitter':
        return 'border-sky-400 text-sky-600';
      case 'youtube':
        return 'border-red-400 text-red-600';
      default:
        return 'border-gray-400 text-gray-600';
    }
  };

  const renderEngagementMetrics = () => {
    if (!item.engagement) return null;

    if (item.type === 'twitter') {
      return (
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 text-red-500">
            <Heart className="h-3 w-3" />
            <span>{item.engagement.score || 0}</span>
          </div>
          <div className="flex items-center space-x-1 text-green-500">
            <Repeat className="h-3 w-3" />
            <span>{Math.floor((item.engagement.score || 0) * 0.3)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageSquare className="h-3 w-3" />
            <span>{item.engagement.comments || 0}</span>
          </div>
        </div>
      );
    }

    if (item.type === 'youtube') {
      return (
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 text-red-500">
            <Play className="h-3 w-3" />
            <span>{(item.engagement.score || 0).toLocaleString()} views</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageSquare className="h-3 w-3" />
            <span>{item.engagement.comments || 0}</span>
          </div>
        </div>
      );
    }

    // Default for news and reddit
    return (
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
    );
  };

  return (
    <div 
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
            <Badge variant="outline" className={getTypeColor(item.type)}>
              {item.type.toUpperCase()}
            </Badge>
            <Badge className={sentimentBadge.color}>
              {sentimentBadge.label}
            </Badge>
            <Badge className={credibilityBadge.color}>
              {credibilityBadge.label} Credibility
            </Badge>
          </div>
          
          <h4 
            className="font-medium text-foreground leading-tight mb-2 hover:text-primary transition-colors cursor-pointer"
            onClick={openLink}
          >
            {item.title}
          </h4>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {item.content.substring(0, 150)}...
          </p>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <span className={`font-medium ${getTypeColor(item.type).split(' ')[1]}`}>
                {item.source}
              </span>
              <span>•</span>
              <span>{formatTimeAgo(item.timestamp)}</span>
            </div>
            
            {renderEngagementMetrics()}
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-foreground ml-4 shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            openLink();
          }}
          disabled={!item.link || item.link === '#'}
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
