
import React from 'react';
import { Eye } from 'lucide-react';

interface WrestlerListItemProps {
  wrestler: any;
  index: number;
  onWrestlerClick: (wrestler: any) => void;
}

export const WrestlerListItem = ({ wrestler, index, onWrestlerClick }: WrestlerListItemProps) => {
  return (
    <div 
      className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border/50 hover:bg-secondary/50 cursor-pointer transition-colors group"
      onClick={() => onWrestlerClick(wrestler)}
    >
      <div className="flex items-center space-x-3">
        <div className="text-lg font-bold text-wrestling-electric w-8">
          #{index + 1}
        </div>
        <div>
          <div className="font-semibold text-lg">{wrestler.wrestler_name}</div>
          <div className="text-sm text-muted-foreground flex items-center space-x-2">
            <span>{wrestler.promotion}</span>
            <span>•</span>
            <span className="font-medium text-wrestling-electric">{wrestler.totalMentions} mentions</span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Momentum</div>
          <div className="font-semibold">{wrestler.momentumScore}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Sentiment</div>
          <div className="font-semibold">{wrestler.sentimentScore}%</div>
        </div>
        <div className="text-right">
          <div className={`font-semibold text-lg ${wrestler.change24h > 0 ? 'text-green-500' : wrestler.change24h < 0 ? 'text-red-500' : 'text-yellow-500'}`}>
            {wrestler.change24h > 0 ? '+' : ''}{wrestler.change24h}%
          </div>
          <div className="text-xs text-muted-foreground">24h change</div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <Eye className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
};
