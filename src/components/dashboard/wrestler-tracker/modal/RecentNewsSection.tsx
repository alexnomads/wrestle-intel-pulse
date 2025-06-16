
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, ExternalLink } from 'lucide-react';

interface RecentNewsSectionProps {
  wrestler: any;
}

export const RecentNewsSection = ({ wrestler }: RecentNewsSectionProps) => {
  if (!wrestler.relatedNews || wrestler.relatedNews.length === 0) return null;

  return (
    <div>
      <div className="flex items-center space-x-2 mb-4">
        <Calendar className="h-5 w-5 text-wrestling-electric" />
        <h3 className="text-lg font-semibold">Recent News</h3>
      </div>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {wrestler.relatedNews.map((news: any, index: number) => (
          <div key={index} className="p-3 bg-secondary/20 rounded-lg border border-border/30">
            <div className="font-medium text-sm mb-1">{news.title}</div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>{news.source}</span>
              <span>{new Date(news.pubDate).toLocaleDateString()}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => window.open(news.link, '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Read More
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
