
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { WrestlerMomentum } from "@/services/advancedAnalyticsService";

interface PushBurialCardProps {
  momentum: WrestlerMomentum;
}

export const PushBurialCard = ({ momentum }: PushBurialCardProps) => {
  const getPushBurialIndicator = (score: number) => {
    if (score >= 8) return { label: 'Strong Push', color: 'text-green-400', icon: TrendingUp };
    if (score >= 6) return { label: 'Moderate Push', color: 'text-green-300', icon: TrendingUp };
    if (score >= 4) return { label: 'Stable', color: 'text-yellow-400', icon: Activity };
    if (score >= 2) return { label: 'Cooling Off', color: 'text-orange-400', icon: TrendingDown };
    return { label: 'Burial', color: 'text-red-400', icon: TrendingDown };
  };

  const pushIndicator = getPushBurialIndicator(momentum.push_burial_score);
  const IconComponent = pushIndicator.icon;

  return (
    <Card className="glass-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-wrestling-electric/20 to-wrestling-purple/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-primary">
                {momentum.wrestler_name.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{momentum.wrestler_name}</h3>
              <p className="text-sm text-muted-foreground">
                {momentum.mentions_count} mentions • {momentum.sentiment_trend} trend
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-lg font-bold text-foreground">
                {momentum.push_burial_score.toFixed(1)}/10
              </div>
              <div className={`text-sm font-medium ${pushIndicator.color} flex items-center`}>
                <IconComponent className="h-3 w-3 mr-1" />
                {pushIndicator.label}
              </div>
            </div>
            
            <div className="w-16 h-16">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="stroke-secondary"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeWidth="2"
                />
                <path
                  className="stroke-wrestling-electric"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeWidth="2"
                  strokeDasharray={`${momentum.push_burial_score * 10}, 100`}
                />
              </svg>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
