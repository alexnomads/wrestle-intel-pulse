
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { NewsItem } from '@/services/data/dataTypes';
import { MentionItem } from './MentionItem';

interface MentionsListProps {
  wrestlerMentions: NewsItem[];
  wrestlerName: string;
}

export const MentionsList = ({ wrestlerMentions, wrestlerName }: MentionsListProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center space-x-2">
        <MessageCircle className="h-5 w-5" />
        <span>Recent Mentions</span>
      </h3>
      
      {wrestlerMentions.length > 0 ? (
        <div className="space-y-3">
          {wrestlerMentions.slice(0, 10).map((mention, index) => (
            <MentionItem key={index} mention={mention} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No recent mentions found for {wrestlerName}</p>
          <p className="text-sm">This wrestler may be using fallback data</p>
        </div>
      )}

      {wrestlerMentions.length > 10 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing 10 of {wrestlerMentions.length} mentions
        </div>
      )}
    </div>
  );
};
