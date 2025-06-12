
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, AlertTriangle, ArrowUp, MessageSquare } from "lucide-react";
import { UnifiedItem } from "./types";
import { getSentimentBadge, getCredibilityBadge, formatTimeAgo } from "./utils";

interface NewsItemProps {
  item: UnifiedItem;
}

export const NewsItem = ({ item }: NewsItemProps) => {
  const sentimentBadge = getSentimentBadge(item.sentiment);
  const credibilityBadge = getCredibilityBadge(item.credibilityScore);

  const openLink = (link: string, title: string) => {
    console.log('Opening link:', link, 'for:', title);
    
    if (!link || link === '#') {
      console.warn('No valid link for item:', title);
      alert('Sorry, no link is available for this item.');
      return;
    }

    let finalUrl = link;
    
    // Handle Reddit links specifically
    if (item.type === 'reddit' && !link.startsWith('http')) {
      finalUrl = `https://reddit.com${link}`;
    }
    
    console.log('Final URL:', finalUrl);
    
    // Force open in new tab
    const anchor = document.createElement('a');
    anchor.href = finalUrl;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.style.display = 'none';
    
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const handleItemClick = () => {
    openLink(item.link, item.title);
  };

  const handleExternalLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openLink(item.link, item.title);
  };

  return (
    <div 
      className={`p-4 rounded-lg transition-all hover:bg-secondary/50 cursor-pointer ${
        item.isBreaking ? 'border-2 border-red-400 bg-red-50 dark:bg-red-900/20' : 'bg-secondary/20'
      }`}
      onClick={handleItemClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleItemClick();
        }
      }}
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
          
          <h4 className="font-medium text-foreground leading-tight mb-2 hover:text-primary transition-colors">
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
          onClick={handleExternalLinkClick}
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
