
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Flame } from "lucide-react";

interface WrestlerAnalysis {
  id: string;
  wrestler_name: string;
  promotion: string;
  totalMentions: number;
  pushScore: number;
  burialScore: number;
  trend: 'push' | 'burial' | 'stable';
  isOnFire: boolean;
  sentimentScore: number;
}

interface PushBurialChartsProps {
  topPushWrestlers: WrestlerAnalysis[];
  worstBuriedWrestlers: WrestlerAnalysis[];
  selectedPromotion: string;
  selectedTimePeriod: string;
}

export const PushBurialCharts = ({ 
  topPushWrestlers, 
  worstBuriedWrestlers, 
  selectedPromotion, 
  selectedTimePeriod 
}: PushBurialChartsProps) => {
  const promotionLabel = selectedPromotion === 'all' ? 'All Federations' : selectedPromotion.toUpperCase();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center text-green-400">
            <TrendingUp className="h-5 w-5 mr-2" />
            PUSH Top 10 - Most Mentioned ({promotionLabel})
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Ranked by total mentions, not alphabetical order
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topPushWrestlers.length > 0 ? (
              topPushWrestlers.map((wrestler, index) => (
                <div 
                  key={wrestler.id} 
                  className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                    wrestler.isOnFire 
                      ? 'bg-gradient-to-r from-green-100 to-yellow-100 dark:from-green-900/40 dark:to-yellow-900/40 border-2 border-yellow-400' 
                      : 'bg-green-50 dark:bg-green-900/20'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-foreground">{wrestler.wrestler_name}</h4>
                        {wrestler.isOnFire && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                            <Flame className="h-3 w-3 mr-1" />
                            ON FIRE
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{wrestler.promotion}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {wrestler.totalMentions} mentions
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {wrestler.pushScore.toFixed(1)}% positive • {wrestler.sentimentScore}% sentiment
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No wrestlers receiving significant push in the last {selectedTimePeriod} days
                {selectedPromotion !== 'all' && ` for ${selectedPromotion.toUpperCase()}`}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center text-red-400">
            <TrendingDown className="h-5 w-5 mr-2" />
            BURIED Worst 10 - Most Mentioned ({promotionLabel})
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Ranked by total mentions, not alphabetical order
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {worstBuriedWrestlers.length > 0 ? (
              worstBuriedWrestlers.map((wrestler, index) => (
                <div 
                  key={wrestler.id} 
                  className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{wrestler.wrestler_name}</h4>
                      <p className="text-sm text-muted-foreground">{wrestler.promotion}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-600 dark:text-red-400">
                      {wrestler.totalMentions} mentions
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {wrestler.burialScore.toFixed(1)}% negative • {wrestler.sentimentScore}% sentiment
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No wrestlers being significantly buried in the last {selectedTimePeriod} days
                {selectedPromotion !== 'all' && ` for ${selectedPromotion.toUpperCase()}`}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
