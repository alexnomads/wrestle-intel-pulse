
import React from 'react';
import { MessageSquare, Newspaper } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SourceBreakdown } from '@/types/wrestlerAnalysis';

interface MentionSourceIndicatorProps {
  sourceBreakdown: SourceBreakdown;
  onSourceClick?: () => void;
  showDetails?: boolean;
}

export const MentionSourceIndicator = ({ 
  sourceBreakdown, 
  onSourceClick, 
  showDetails = true 
}: MentionSourceIndicatorProps) => {
  const { news_count, reddit_count, total_sources } = sourceBreakdown;

  if (showDetails) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onSourceClick}
        className="h-auto p-1 hover:bg-muted/50 flex items-center space-x-1"
      >
        <span className="font-medium">{total_sources}</span>
        <span className="text-xs text-muted-foreground">mentions</span>
        <div className="flex items-center space-x-1 ml-1">
          {news_count > 0 && (
            <div className="flex items-center space-x-1">
              <Newspaper className="h-3 w-3 text-blue-500" />
              <span className="text-xs">{news_count}</span>
            </div>
          )}
          {reddit_count > 0 && (
            <div className="flex items-center space-x-1">
              <MessageSquare className="h-3 w-3 text-orange-500" />
              <span className="text-xs">{reddit_count}</span>
            </div>
          )}
        </div>
      </Button>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Badge variant="secondary" className="text-xs">
        {total_sources} mentions
      </Badge>
      <div className="flex items-center space-x-1">
        {news_count > 0 && (
          <div className="flex items-center space-x-1">
            <Newspaper className="h-3 w-3 text-blue-500" />
            <span className="text-xs text-muted-foreground">{news_count}</span>
          </div>
        )}
        {reddit_count > 0 && (
          <div className="flex items-center space-x-1">
            <MessageSquare className="h-3 w-3 text-orange-500" />
            <span className="text-xs text-muted-foreground">{reddit_count}</span>
          </div>
        )}
      </div>
    </div>
  );
};
