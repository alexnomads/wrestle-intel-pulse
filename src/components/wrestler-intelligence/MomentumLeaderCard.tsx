
import { WrestlerMomentum } from "@/services/advancedAnalyticsService";

interface MomentumLeaderCardProps {
  wrestler: WrestlerMomentum;
  index: number;
}

export const MomentumLeaderCard = ({ wrestler, index }: MomentumLeaderCardProps) => {
  return (
    <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-wrestling-electric/20 to-wrestling-purple/20 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-primary">{index + 1}</span>
        </div>
        <div>
          <div className="font-medium text-foreground">{wrestler.wrestler_name}</div>
          <div className="text-sm text-muted-foreground">
            {wrestler.mentions_count} mentions • {wrestler.sentiment_trend}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-lg font-bold text-wrestling-electric">
          {wrestler.momentum_change > 0 ? '+' : ''}{wrestler.momentum_change.toFixed(0)}
        </div>
        <div className="text-xs text-muted-foreground">Momentum</div>
      </div>
    </div>
  );
};
