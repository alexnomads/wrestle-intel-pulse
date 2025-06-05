
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WrestlerMomentum } from "@/services/advancedAnalyticsService";

interface WrestlerProfileCardProps {
  momentum: WrestlerMomentum;
  getStatusColor: (status: string) => string;
  getSentimentColor: (trend: string) => string;
}

export const WrestlerProfileCard = ({ momentum, getStatusColor, getSentimentColor }: WrestlerProfileCardProps) => {
  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{momentum.wrestler_name}</CardTitle>
          <Badge className={getStatusColor(momentum.contract_status)}>
            {momentum.contract_status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{momentum.mentions_count}</div>
            <div className="text-sm text-muted-foreground">Mentions</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getSentimentColor(momentum.sentiment_trend)}`}>
              {momentum.sentiment_trend}
            </div>
            <div className="text-sm text-muted-foreground">Sentiment</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {momentum.momentum_change > 0 ? '+' : ''}{momentum.momentum_change.toFixed(0)}
            </div>
            <div className="text-sm text-muted-foreground">Momentum</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-wrestling-electric">
              {momentum.push_burial_score.toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Push Score</div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="h-2 rounded-full bg-gradient-to-r from-green-500 to-wrestling-electric transition-all duration-500"
              style={{ width: `${momentum.push_burial_score * 10}%` }}
            />
          </div>
        </div>

        {momentum.recent_storylines.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-foreground mb-2">Recent Storylines:</h4>
            <div className="space-y-1">
              {momentum.recent_storylines.slice(0, 2).map((storyline, sIndex) => (
                <p key={sIndex} className="text-sm text-muted-foreground">
                  {storyline}
                </p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
