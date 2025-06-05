
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Flame, Users, BarChart3 } from "lucide-react";
import { useSupabaseWrestlers } from "@/hooks/useSupabaseWrestlers";
import { useRSSFeeds } from "@/hooks/useWrestlingData";
import { useWrestlerAnalysis } from "@/hooks/useWrestlerAnalysis";

interface RealTimeWrestlerTrackerProps {
  refreshTrigger: Date;
}

export const RealTimeWrestlerTracker = ({ refreshTrigger }: RealTimeWrestlerTrackerProps) => {
  const [selectedFederation, setSelectedFederation] = useState<string>('all');
  const [timePeriod, setTimePeriod] = useState<string>('30');

  const { data: wrestlers = [] } = useSupabaseWrestlers();
  const { data: newsItems = [] } = useRSSFeeds();
  
  const {
    filteredAnalysis,
    topPushWrestlers,
    worstBuriedWrestlers
  } = useWrestlerAnalysis(wrestlers, newsItems, timePeriod, selectedFederation);

  const federations = [
    { id: 'all', name: 'All', color: 'bg-gray-500' },
    { id: 'wwe', name: 'WWE', color: 'bg-yellow-500' },
    { id: 'aew', name: 'AEW', color: 'bg-black' },
    { id: 'tna', name: 'TNA', color: 'bg-blue-500' }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'push': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'burial': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <BarChart3 className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getPopularityScore = (wrestler: any) => {
    return Math.round((wrestler.totalMentions * 10) + (wrestler.sentimentScore * 0.5));
  };

  const get24hChange = (wrestler: any) => {
    // Simulate 24h change based on trend
    const baseChange = wrestler.trend === 'push' ? 15 : wrestler.trend === 'burial' ? -12 : 3;
    return baseChange + Math.floor(Math.random() * 10 - 5);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Flame className="h-6 w-6 text-red-500" />
            <span>Real-Time Wrestler Popularity Tracker</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              LIVE
            </Badge>
          </CardTitle>
          
          {/* Federation Filter */}
          <div className="flex space-x-2">
            {federations.map((fed) => (
              <button
                key={fed.id}
                onClick={() => setSelectedFederation(fed.id)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  selectedFederation === fed.id
                    ? 'bg-wrestling-electric text-white'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                {fed.name}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid gap-4">
          {/* Top 10 Trending Wrestlers */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Top 10 Trending Wrestlers
              {selectedFederation !== 'all' && (
                <Badge variant="outline" className="ml-2">
                  {selectedFederation.toUpperCase()}
                </Badge>
              )}
            </h3>
            
            {filteredAnalysis.slice(0, 10).map((wrestler, index) => {
              const popularityScore = getPopularityScore(wrestler);
              const change24h = get24hChange(wrestler);
              
              return (
                <div 
                  key={wrestler.id}
                  className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                    wrestler.isOnFire 
                      ? 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/40 dark:to-orange-900/40 border-2 border-orange-400' 
                      : 'bg-secondary/30 hover:bg-secondary/50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-wrestling-electric to-wrestling-purple rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">#{index + 1}</span>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-foreground">{wrestler.wrestler_name}</h4>
                        {wrestler.isOnFire && (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30">
                            <Flame className="h-3 w-3 mr-1" />
                            HOT
                          </Badge>
                        )}
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            wrestler.promotion.toLowerCase().includes('wwe') ? 'border-yellow-400 text-yellow-600' :
                            wrestler.promotion.toLowerCase().includes('aew') ? 'border-black text-black dark:border-white dark:text-white' :
                            wrestler.promotion.toLowerCase().includes('tna') ? 'border-blue-400 text-blue-600' :
                            'border-gray-400 text-gray-600'
                          }`}
                        >
                          {wrestler.promotion}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {wrestler.totalMentions} mentions • {wrestler.sentimentScore}% sentiment
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(wrestler.trend)}
                        <span className="text-lg font-bold text-wrestling-electric">
                          {popularityScore}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">Popularity Score</div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        change24h > 0 ? 'text-green-500' : change24h < 0 ? 'text-red-500' : 'text-yellow-500'
                      }`}>
                        {change24h > 0 ? '+' : ''}{change24h}%
                      </div>
                      <div className="text-xs text-muted-foreground">24h Change</div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredAnalysis.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No trending wrestlers found for the selected federation.
                Try selecting "All" or check back in a few minutes.
              </div>
            )}
          </div>

          {/* Federation Comparison Summary */}
          {selectedFederation === 'all' && (
            <div className="pt-4 border-t border-secondary/50">
              <h4 className="font-medium text-foreground mb-3">Federation Popularity Comparison</h4>
              <div className="grid grid-cols-3 gap-4">
                {['WWE', 'AEW', 'TNA'].map((fed) => {
                  const fedWrestlers = filteredAnalysis.filter(w => 
                    w.promotion.toLowerCase().includes(fed.toLowerCase())
                  );
                  const avgPopularity = fedWrestlers.length > 0 
                    ? Math.round(fedWrestlers.reduce((sum, w) => sum + getPopularityScore(w), 0) / fedWrestlers.length)
                    : 0;
                  
                  return (
                    <div key={fed} className="text-center p-3 bg-secondary/20 rounded-lg">
                      <div className="text-lg font-bold text-wrestling-electric">{avgPopularity}</div>
                      <div className="text-sm text-muted-foreground">{fed} Avg Score</div>
                      <div className="text-xs text-muted-foreground">{fedWrestlers.length} wrestlers</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
