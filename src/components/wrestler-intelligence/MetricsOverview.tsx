
import { Card, CardContent } from "@/components/ui/card";

interface MetricsOverviewProps {
  totalWrestlers: number;
  pushingWrestlers: number;
  buriedWrestlers: number;
  newsArticles: number;
  timePeriod: string;
}

export const MetricsOverview = ({ 
  totalWrestlers, 
  pushingWrestlers, 
  buriedWrestlers, 
  newsArticles, 
  timePeriod 
}: MetricsOverviewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="glass-card">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-wrestling-electric">{totalWrestlers}</div>
          <div className="text-sm text-muted-foreground">Total Wrestlers</div>
        </CardContent>
      </Card>
      <Card className="glass-card">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{pushingWrestlers}</div>
          <div className="text-sm text-muted-foreground">Getting Push</div>
        </CardContent>
      </Card>
      <Card className="glass-card">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{buriedWrestlers}</div>
          <div className="text-sm text-muted-foreground">Being Buried</div>
        </CardContent>
      </Card>
      <Card className="glass-card">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{newsArticles}</div>
          <div className="text-sm text-muted-foreground">News Articles ({timePeriod}d)</div>
        </CardContent>
      </Card>
    </div>
  );
};
