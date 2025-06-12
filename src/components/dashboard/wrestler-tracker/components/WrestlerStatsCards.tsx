
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { NewsItem } from '@/services/data/dataTypes';

interface WrestlerStatsCardsProps {
  wrestlerMentions: NewsItem[];
  sentimentScore: number;
}

export const WrestlerStatsCards = ({ wrestlerMentions, sentimentScore }: WrestlerStatsCardsProps) => {
  const recentMentions = wrestlerMentions.filter(item => 
    new Date(item.pubDate) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 bg-secondary/30 rounded-lg text-center">
        <div className="text-2xl font-bold text-wrestling-electric">{wrestlerMentions.length}</div>
        <div className="text-sm text-muted-foreground">News Articles</div>
      </div>
      <div className="p-4 bg-secondary/30 rounded-lg text-center">
        <div className="text-2xl font-bold text-green-400">{sentimentScore}%</div>
        <div className="text-sm text-muted-foreground">Sentiment Score</div>
      </div>
      <div className="p-4 bg-secondary/30 rounded-lg text-center">
        <div className="text-2xl font-bold text-yellow-400">{recentMentions.length}</div>
        <div className="text-sm text-muted-foreground">Last 24h</div>
      </div>
    </div>
  );
};
