
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Newspaper, MessageSquare } from 'lucide-react';

interface SourceLinkProps {
  url: string;
  title: string;
  sourceType: 'news' | 'reddit';
  sourceName?: string;
  compact?: boolean;
}

export const SourceLink = ({ url, title, sourceType, sourceName, compact = false }: SourceLinkProps) => {
  const getIcon = () => {
    return sourceType === 'news' ? (
      <Newspaper className="h-3 w-3 text-blue-500" />
    ) : (
      <MessageSquare className="h-3 w-3 text-orange-500" />
    );
  };

  const handleClick = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (compact) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        className="h-6 px-2 text-xs hover:bg-muted/50"
      >
        {getIcon()}
        <ExternalLink className="h-2 w-2 ml-1" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      className="flex items-center space-x-2 hover:bg-muted/50"
    >
      {getIcon()}
      <span className="text-xs truncate max-w-32">{sourceName || title}</span>
      <ExternalLink className="h-3 w-3" />
    </Button>
  );
};
