
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface PushBurialCardProps {
  wrestler: {
    name: string;
    promotion: string;
    pushScore: number;
    burialRisk: number;
    trend: 'push' | 'burial' | 'stable';
    evidence: string;
  };
  type: 'push' | 'burial';
  rank: number;
}

export const PushBurialCard = ({ wrestler, type, rank }: PushBurialCardProps) => {
  const getPushBurialIndicator = (score: number) => {
    if (score >= 8) return { label: 'Strong Push', color: 'text-green-400', icon: TrendingUp };
    if (score >= 6) return { label: 'Moderate Push', color: 'text-green-300', icon: TrendingUp };
    if (score >= 4) return { label: 'Stable', color: 'text-yellow-400', icon: Activity };
    if (score >= 2) return { label: 'Cooling Off', color: 'text-orange-400', icon: TrendingDown };
    return { label: 'Burial', color: 'text-red-400', icon: TrendingDown };
  };

  const score = type === 'push' ? wrestler.pushScore : wrestler.burialRisk;
  const pushIndicator = getPushBurialIndicator(score);
  const IconComponent = pushIndicator.icon;

  return (
    <Card className="glass-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-wrestling-electric/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-wrestling-electric">#{rank}</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{wrestler.name}</h3>
              <p className="text-sm text-muted-foreground">{wrestler.promotion}</p>
              <p className="text-xs text-muted-foreground">{wrestler.evidence}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-lg font-bold text-foreground">
                {score.toFixed(1)}/10
              </div>
              <div className={`text-sm font-medium ${pushIndicator.color} flex items-center`}>
                <IconComponent className="h-3 w-3 mr-1" />
                {pushIndicator.label}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
