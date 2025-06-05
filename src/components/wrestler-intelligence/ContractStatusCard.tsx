
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WrestlerMomentum } from "@/services/advancedAnalyticsService";

interface ContractStatusCardProps {
  status: string;
  wrestlers: WrestlerMomentum[];
  getStatusColor: (status: string) => string;
}

export const ContractStatusCard = ({ status, wrestlers, getStatusColor }: ContractStatusCardProps) => {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="capitalize">{status.replace('_', ' ')} Contracts</span>
          <Badge className={getStatusColor(status)}>
            {wrestlers.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {wrestlers.slice(0, 6).map((wrestler, index) => (
            <div key={index} className="p-3 bg-secondary/50 rounded-lg">
              <div className="font-medium text-foreground">{wrestler.wrestler_name}</div>
              <div className="text-sm text-muted-foreground">Wrestling Talent</div>
              <div className="text-xs text-wrestling-electric mt-1">
                {wrestler.mentions_count} mentions • {wrestler.push_burial_score.toFixed(1)} push score
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
