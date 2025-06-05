
import { Badge } from "@/components/ui/badge";

interface MomentumLeaderCardProps {
  wrestler: {
    wrestler_name: string;
    promotion: string;
    momentum: number;
    trend: 'up' | 'down' | 'stable';
    weeklyChange: number;
    newsVolume: number;
    sentiment: number;
  };
  rank: number;
}

export const MomentumLeaderCard = ({ wrestler, rank }: MomentumLeaderCardProps) => {
  const getTrendColor = () => {
    switch (wrestler.trend) {
      case 'up':
        return 'text-green-400';
      case 'down':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  const getTrendIcon = () => {
    switch (wrestler.trend) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      default:
        return '→';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-wrestling-electric/20 to-wrestling-purple/20 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-primary">{rank}</span>
        </div>
        <div>
          <div className="font-medium text-foreground">{wrestler.wrestler_name}</div>
          <div className="text-sm text-muted-foreground">
            {wrestler.newsVolume} mentions • {wrestler.promotion}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <div className={`text-lg font-bold ${getTrendColor()}`}>
            {getTrendIcon()} {wrestler.weeklyChange > 0 ? '+' : ''}{wrestler.weeklyChange.toFixed(0)}
          </div>
          <div className="text-xs text-muted-foreground">Weekly Change</div>
        </div>
        <Badge variant={wrestler.sentiment > 60 ? 'default' : 'secondary'}>
          {wrestler.sentiment}% sentiment
        </Badge>
      </div>
    </div>
  );
};
