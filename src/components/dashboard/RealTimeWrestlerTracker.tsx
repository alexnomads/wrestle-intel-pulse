
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Users } from "lucide-react";
import { useSupabaseWrestlers } from "@/hooks/useSupabaseWrestlers";
import { useRSSFeeds } from "@/hooks/useWrestlingData";
import { useWrestlerAnalysis } from "@/hooks/useWrestlerAnalysis";
import { WrestlerCard } from "./wrestler-tracker/WrestlerCard";
import { FederationComparison } from "./wrestler-tracker/FederationComparison";
import { getPopularityScore, get24hChange } from "./wrestler-tracker/utils";

interface RealTimeWrestlerTrackerProps {
  refreshTrigger: Date;
}

export const RealTimeWrestlerTracker = ({ refreshTrigger }: RealTimeWrestlerTrackerProps) => {
  // Force 'all' selection and hide federation filter
  const selectedFederation = 'all';
  const [timePeriod, setTimePeriod] = useState<string>('30');

  const { data: wrestlers = [] } = useSupabaseWrestlers();
  const { data: newsItems = [] } = useRSSFeeds();
  
  const {
    filteredAnalysis,
    topPushWrestlers,
    worstBuriedWrestlers
  } = useWrestlerAnalysis(wrestlers, newsItems, timePeriod, selectedFederation);

  // Ensure minimum 10 wrestlers are displayed
  const displayWrestlers = filteredAnalysis.slice(0, Math.max(10, filteredAnalysis.length));

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
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid gap-4">
          {/* Top 10+ Trending Wrestlers */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Top {displayWrestlers.length} Trending Wrestlers
            </h3>
            
            {displayWrestlers.map((wrestler, index) => {
              const popularityScore = getPopularityScore(wrestler);
              const change24h = get24hChange(wrestler);
              
              return (
                <WrestlerCard
                  key={wrestler.id}
                  wrestler={wrestler}
                  index={index}
                  timePeriod={timePeriod}
                  popularityScore={popularityScore}
                  change24h={change24h}
                />
              );
            })}
            
            {displayWrestlers.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No trending wrestlers found. Check back in a few minutes.
              </div>
            )}
          </div>

          {/* Federation Comparison Summary - always show since we're on 'all' */}
          <FederationComparison 
            filteredAnalysis={filteredAnalysis}
            getPopularityScore={getPopularityScore}
          />
        </div>
      </CardContent>
    </Card>
  );
};
