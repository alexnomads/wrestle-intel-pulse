
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LinkIcon, ExternalLink, Newspaper, MessageSquare } from 'lucide-react';

interface MentionSourcesSectionProps {
  wrestler: any;
}

export const MentionSourcesSection = ({ wrestler }: MentionSourcesSectionProps) => {
  const mentionSources = wrestler.mention_sources || [];
  
  if (!mentionSources || mentionSources.length === 0) return null;

  const getSourceIcon = (sourceType: string) => {
    return sourceType === 'news' ? (
      <Newspaper className="h-4 w-4 text-blue-500" />
    ) : (
      <MessageSquare className="h-4 w-4 text-orange-500" />
    );
  };

  const getSourceBadgeColor = (sourceType: string) => {
    return sourceType === 'news' 
      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
      : 'bg-orange-500/20 text-orange-300 border-orange-500/40';
  };

  return (
    <div>
      <div className="flex items-center space-x-2 mb-4">
        <LinkIcon className="h-5 w-5 text-wrestling-electric" />
        <h3 className="text-lg font-semibold">Mention Sources</h3>
        <span className="text-sm text-muted-foreground">({mentionSources.length} sources)</span>
      </div>
      
      <div className="space-y-3 max-h-48 overflow-y-auto">
        {mentionSources.slice(0, 10).map((source: any, index: number) => (
          <div key={index} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border border-border/30">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                {getSourceIcon(source.source_type)}
                <Badge variant="outline" className={`text-xs ${getSourceBadgeColor(source.source_type)}`}>
                  {source.source_type}
                </Badge>
                <span className="text-xs text-muted-foreground truncate">
                  {source.source_name}
                </span>
              </div>
              
              <div className="text-sm font-medium mb-1 line-clamp-2">
                {source.title}
              </div>
              
              {source.content_snippet && (
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {source.content_snippet}
                </div>
              )}
              
              {source.sentiment_score && (
                <div className="mt-1">
                  <span className="text-xs">
                    Sentiment: {Math.round(source.sentiment_score * 100)}%
                  </span>
                </div>
              )}
            </div>
            
            <div className="ml-3">
              {source.url && source.url !== '#' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => window.open(source.url, '_blank', 'noopener,noreferrer')}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {mentionSources.length > 10 && (
        <div className="text-center text-sm text-muted-foreground mt-3">
          Showing 10 of {mentionSources.length} mention sources
        </div>
      )}
    </div>
  );
};
