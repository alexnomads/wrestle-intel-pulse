
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface KeyMetricsGridProps {
  wrestler: any;
}

export const KeyMetricsGrid = ({ wrestler }: KeyMetricsGridProps) => {
  const getTrendIcon = () => {
    const change = wrestler.change24h || 0;
    if (change > 0) return <TrendingUp className="h-5 w-5 text-emerald-400" />;
    if (change < 0) return <TrendingDown className="h-5 w-5 text-red-400" />;
    return <BarChart3 className="h-5 w-5 text-blue-400" />;
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 80) return 'text-emerald-400';
    if (sentiment >= 65) return 'text-green-400';
    if (sentiment >= 50) return 'text-yellow-400';
    if (sentiment >= 35) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="text-center p-4 bg-secondary/30 rounded-lg border border-border/50">
        <div className="text-2xl font-bold text-wrestling-electric">
          {wrestler.totalMentions || wrestler.mention_count || 0}
        </div>
        <div className="text-sm text-muted-foreground">Total Mentions</div>
      </div>
      
      <div className="text-center p-4 bg-secondary/30 rounded-lg border border-border/50">
        <div className={`text-2xl font-bold ${getSentimentColor(wrestler.sentimentScore || 50)}`}>
          {Math.round(wrestler.sentimentScore || 50)}%
        </div>
        <div className="text-sm text-muted-foreground">Sentiment</div>
      </div>
      
      <div className="text-center p-4 bg-secondary/30 rounded-lg border border-border/50">
        <div className="flex items-center justify-center space-x-2">
          {getTrendIcon()}
          <span className={`text-xl font-bold ${
            wrestler.change24h > 0 ? 'text-emerald-400' :
            wrestler.change24h < 0 ? 'text-red-400' : 'text-blue-400'
          }`}>
            {wrestler.change24h > 0 ? '+' : ''}{wrestler.change24h || 0}%
          </span>
        </div>
        <div className="text-sm text-muted-foreground">24h Change</div>
      </div>
      
      <div className="text-center p-4 bg-secondary/30 rounded-lg border border-border/50">
        <Badge 
          variant="outline" 
          className={`text-sm font-bold ${
            wrestler.trend === 'push' ? 'border-emerald-400 text-emerald-400' :
            wrestler.trend === 'burial' ? 'border-red-400 text-red-400' :
            'border-blue-400 text-blue-400'
          }`}
        >
          {(wrestler.trend || 'stable').toUpperCase()}
        </Badge>
        <div className="text-sm text-muted-foreground mt-1">Current Trend</div>
      </div>
    </div>
  );
};
