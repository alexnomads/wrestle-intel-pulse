
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { useWrestlerMomentumAnalysis, useAdvancedTrendingTopics } from "@/hooks/useAdvancedAnalytics";
import { useSupabaseWrestlers } from "@/hooks/useSupabaseWrestlers";
import { useRSSFeeds } from "@/hooks/useWrestlingData";
import { useWrestlerAnalysis } from "@/hooks/useWrestlerAnalysis";
import { MomentumLeaderCard } from "./wrestler-intelligence/MomentumLeaderCard";
import { PushBurialCard } from "./wrestler-intelligence/PushBurialCard";
import { ContractStatusCard } from "./wrestler-intelligence/ContractStatusCard";
import { DashboardFilters } from "./wrestler-intelligence/DashboardFilters";
import { EmptyWrestlerState } from "./wrestler-intelligence/EmptyWrestlerState";
import { MetricsOverview } from "./wrestler-intelligence/MetricsOverview";
import { PushBurialCharts } from "./wrestler-intelligence/PushBurialCharts";

type TimePeriod = '30' | '60' | '180' | '365';

export const WrestlerIntelligenceDashboard = () => {
  const [selectedPromotion, setSelectedPromotion] = useState('all');
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriod>('30');
  
  // Real data hooks
  const { data: wrestlerMomentum = [], isLoading: momentumLoading, refetch: refetchMomentum } = useWrestlerMomentumAnalysis();
  const { data: trendingTopics = [] } = useAdvancedTrendingTopics();
  const { data: wrestlers = [] } = useSupabaseWrestlers();
  const { data: newsItems = [] } = useRSSFeeds();

  // Analysis hook
  const {
    filteredWrestlers,
    periodNewsItems,
    filteredAnalysis,
    topPushWrestlers,
    worstBuriedWrestlers
  } = useWrestlerAnalysis(wrestlers, newsItems, selectedTimePeriod, selectedPromotion);

  // Generate push/burial data for cards
  const pushBurialData = filteredAnalysis.map(wrestler => ({
    name: wrestler.wrestler_name,
    promotion: wrestler.promotion,
    pushScore: wrestler.pushScore,
    burialRisk: wrestler.burialScore,
    trend: wrestler.trend,
    evidence: wrestler.evidence
  }));

  const handleRefresh = () => {
    refetchMomentum();
  };

  if (momentumLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-wrestling-electric" />
        <span className="ml-2 text-lg">Analyzing wrestler intelligence...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Wrestler Intelligence Dashboard</h2>
        <div className="flex items-center space-x-4">
          {/* Time Period Filter */}
          <div className="flex space-x-2">
            {(['30', '60', '180', '365'] as TimePeriod[]).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedTimePeriod(period)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  selectedTimePeriod === period
                    ? 'bg-wrestling-electric text-white'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                {period} Days
              </button>
            ))}
          </div>
          
          <DashboardFilters
            selectedPromotion={selectedPromotion}
            onPromotionChange={setSelectedPromotion}
            selectedMetric="push"
            onMetricChange={() => {}}
            onRefresh={handleRefresh}
            isLoading={momentumLoading}
          />
        </div>
      </div>

      {filteredWrestlers.length === 0 ? (
        <EmptyWrestlerState />
      ) : (
        <div className="grid gap-6">
          {/* Key Metrics Overview */}
          <MetricsOverview
            totalWrestlers={filteredWrestlers.length}
            pushingWrestlers={filteredAnalysis.filter(w => w.trend === 'push').length}
            buriedWrestlers={filteredAnalysis.filter(w => w.trend === 'burial').length}
            newsArticles={periodNewsItems.length}
            timePeriod={selectedTimePeriod}
          />

          {/* PUSH Top 10 and BURIED Worst 10 Charts */}
          <PushBurialCharts
            topPushWrestlers={topPushWrestlers}
            worstBuriedWrestlers={worstBuriedWrestlers}
            selectedPromotion={selectedPromotion}
            selectedTimePeriod={selectedTimePeriod}
          />

          {/* Push/Burial Leaders */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Push/Burial Analysis - Last {selectedTimePeriod} Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {filteredAnalysis.slice(0, 10).map((wrestler, index) => (
                  <MomentumLeaderCard
                    key={wrestler.id}
                    wrestler={{
                      wrestler_name: wrestler.wrestler_name,
                      promotion: wrestler.promotion,
                      momentum: wrestler.pushScore,
                      trend: wrestler.trend === 'push' ? 'up' : 
                             wrestler.trend === 'burial' ? 'down' : 'stable',
                      weeklyChange: wrestler.trend === 'push' ? wrestler.pushScore : 
                                   wrestler.trend === 'burial' ? -wrestler.burialScore : 0,
                      newsVolume: wrestler.totalMentions,
                      sentiment: wrestler.sentimentScore
                    }}
                    rank={index + 1}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Push/Burial Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Top Pushes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pushBurialData
                    .filter(w => w.trend === 'push')
                    .slice(0, 5)
                    .map((wrestler, index) => (
                      <PushBurialCard
                        key={wrestler.name}
                        wrestler={wrestler}
                        type="push"
                        rank={index + 1}
                      />
                    ))}
                  {pushBurialData.filter(w => w.trend === 'push').length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                      No wrestlers currently receiving a strong push in the last {selectedTimePeriod} days
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Burial Watch</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pushBurialData
                    .filter(w => w.trend === 'burial')
                    .slice(0, 5)
                    .map((wrestler, index) => (
                      <PushBurialCard
                        key={wrestler.name}
                        wrestler={wrestler}
                        type="burial"
                        rank={index + 1}
                      />
                    ))}
                  {pushBurialData.filter(w => w.trend === 'burial').length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                      No wrestlers currently being buried in the last {selectedTimePeriod} days
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Media Coverage Analysis */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Media Coverage Overview - Last {selectedTimePeriod} Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {filteredAnalysis.slice(0, 8).map((wrestler) => (
                  <ContractStatusCard
                    key={wrestler.id}
                    contract={{
                      wrestlerName: wrestler.wrestler_name,
                      promotion: wrestler.promotion,
                      status: wrestler.trend === 'push' ? 'Rising' : 
                             wrestler.trend === 'burial' ? 'Declining' : 'Stable',
                      expirationDate: `${wrestler.totalMentions} mentions`,
                      marketValue: wrestler.pushScore > 50 ? 'High Push' : 
                                  wrestler.burialScore > 50 ? 'High Burial Risk' : 'Neutral',
                      leverage: wrestler.isChampion ? 'Champion' : wrestler.evidence
                    }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
