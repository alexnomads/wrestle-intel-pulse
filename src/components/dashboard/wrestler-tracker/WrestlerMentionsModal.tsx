
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { NewsItem } from '@/services/data/dataTypes';
import { isWrestlerMentioned } from './utils/wrestlerNameMatcher';
import { WrestlerStatsCards } from './components/WrestlerStatsCards';
import { MentionsList } from './components/MentionsList';

interface WrestlerMentionsModalProps {
  wrestler: {
    id: string;
    wrestler_name: string;
    promotion: string;
    totalMentions: number;
    sentimentScore: number;
    relatedNews?: NewsItem[];
  };
  newsItems: NewsItem[];
  onClose: () => void;
}

export const WrestlerMentionsModal = ({ wrestler, newsItems, onClose }: WrestlerMentionsModalProps) => {
  // Filter news items that mention this wrestler using the same logic as the analysis service
  const wrestlerMentions = newsItems.filter(item => {
    const content = `${item.title} ${item.contentSnippet || ''}`;
    return isWrestlerMentioned(wrestler.wrestler_name, content);
  });

  console.log(`Filtering mentions for ${wrestler.wrestler_name}:`, {
    totalNewsItems: newsItems.length,
    foundMentions: wrestlerMentions.length,
    mentions: wrestlerMentions.map(item => item.title)
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <span className="text-xl">{wrestler.wrestler_name} Mentions</span>
            <Badge variant="secondary">{wrestler.promotion}</Badge>
            <Badge variant="outline" className="bg-wrestling-electric/10 text-wrestling-electric">
              {wrestler.totalMentions} mentions
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <WrestlerStatsCards 
            wrestlerMentions={wrestlerMentions} 
            sentimentScore={wrestler.sentimentScore} 
          />
          
          <MentionsList 
            wrestlerMentions={wrestlerMentions} 
            wrestlerName={wrestler.wrestler_name} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
