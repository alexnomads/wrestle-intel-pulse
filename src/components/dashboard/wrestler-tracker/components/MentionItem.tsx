
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Calendar } from 'lucide-react';
import { NewsItem } from '@/services/data/dataTypes';

interface MentionItemProps {
  mention: NewsItem;
  index: number;
}

export const MentionItem = ({ mention, index }: MentionItemProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openArticle = () => {
    console.log('Opening article:', mention.title);
    console.log('Article link:', mention.link);
    
    if (!mention.link || mention.link === '#' || mention.link === '') {
      console.warn('No valid link available for this article');
      alert('Sorry, no link is available for this article.');
      return;
    }

    let finalUrl = mention.link;
    
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

  return (
    <div className="p-4 bg-background border border-border/50 rounded-lg hover:bg-secondary/20 transition-colors">
      <div className="flex items-start justify-between space-x-4">
        <div className="flex-1">
          <h4 
            className="font-medium text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors cursor-pointer"
            onClick={openArticle}
          >
            {mention.title}
          </h4>
          {mention.contentSnippet && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
              {mention.contentSnippet}
            </p>
          )}
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(mention.pubDate)}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {mention.source || 'Unknown Source'}
            </Badge>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            openArticle();
          }}
          disabled={!mention.link || mention.link === '#'}
          className="flex items-center space-x-1 shrink-0"
        >
          <ExternalLink className="h-3 w-3" />
          <span>Read</span>
        </Button>
      </div>
    </div>
  );
};
