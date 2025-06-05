
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { useWrestlerMomentumAnalysis, useAdvancedTrendingTopics } from "@/hooks/useAdvancedAnalytics";
import { useSupabaseWrestlers } from "@/hooks/useSupabaseWrestlers";
import { useRSSFeeds } from "@/hooks/useWrestlingData";
import { MomentumLeaderCard } from "./wrestler-intelligence/MomentumLeaderCard";
import { PushBurialCard } from "./wrestler-intelligence/PushBurialCard";
import { ContractStatusCard } from "./wrestler-intelligence/ContractStatusCard";
import { DashboardFilters } from "./wrestler-intelligence/DashboardFilters";
import { EmptyWrestlerState } from "./wrestler-intelligence/EmptyWrestlerState";
import { analyzeSentiment, extractWrestlerMentions } from "@/services/wrestlingDataService";

type TimePeriod = '30' | '60' | '180' | '365';

export const WrestlerIntelligenceDashboard = () => {
  const [selectedPromotion, setSelectedPromotion] = useState('all');
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriod>('30');
  
  // Real data hooks
  const { data: wrestlerMomentum = [], isLoading: momentumLoading, refetch: refetchMomentum } = useWrestlerMomentumAnalysis();
  const { data: trendingTopics = [] } = useAdvancedTrendingTopics();
  const { data: wrestlers = [] } = useSupabaseWrestlers();
  const { data: newsItems = [] } = useRSSFeeds();

  // Filter wrestlers by promotion
  const filteredWrestlers = selectedPromotion === 'all' 
    ? wrestlers 
    : wrestlers.filter(wrestler => 
        wrestler.brand?.toLowerCase().includes(selectedPromotion.toLowerCase()) ||
        (wrestler.promotion_id && wrestlers.find(w => w.promotion_id === wrestler.promotion_id))
      );

  // Filter news by time period
  const getNewsItemsForPeriod = () => {
    const periodDays = parseInt(selectedTimePeriod);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - periodDays);
    
    return newsItems.filter(item => {
      const itemDate = new Date(item.pubDate);
      return itemDate >= cutoffDate;
    });
  };

  const periodNewsItems = getNewsItemsForPeriod();

  // Generate push/burial analysis from real data
  const generatePushBurialAnalysis = () => {
    if (!wrestlers.length) return [];
    
    return wrestlers.map(wrestler => {
      // Find mentions in the selected time period
      const wrestlerNews = periodNewsItems.filter(item => 
        extractWrestlerMentions(`${item.title} ${item.contentSnippet}`).includes(wrestler.name)
      );
      
      let pushScore = 0;
      let burialScore = 0;
      let totalMentions = wrestlerNews.length;
      
      // Analyze sentiment of each mention
      wrestlerNews.forEach(item => {
        const sentiment = analyzeSentiment(`${item.title} ${item.contentSnippet}`);
        if (sentiment.score > 0.6) {
          pushScore += (sentiment.score - 0.5) * 2; // Convert to 0-1 scale
        } else if (sentiment.score < 0.4) {
          burialScore += (0.5 - sentiment.score) * 2; // Convert to 0-1 scale
        }
      });

      // Calculate final scores
      const pushPercentage = totalMentions > 0 ? (pushScore / totalMentions) * 100 : 0;
      const burialPercentage = totalMentions > 0 ? (burialScore / totalMentions) * 100 : 0;
      
      let trend: 'push' | 'burial' | 'stable' = 'stable';
      if (pushPercentage > burialPercentage && pushPercentage > 30) {
        trend = 'push';
      } else if (burialPercentage > pushPercentage && burialPercentage > 30) {
        trend = 'burial';
      }

      return {
        id: wrestler.id,
        wrestler_name: wrestler.name,
        promotion: wrestler.brand || 'Unknown',
        pushScore: Math.min(pushPercentage, 100),
        burialScore: Math.min(burialPercentage, 100),
        trend,
        totalMentions,
        sentimentScore: Math.round((pushPercentage - burialPercentage + 100) / 2),
        isChampion: wrestler.is_champion || false,
        championshipTitle: wrestler.championship_title || null,
        evidence: totalMentions > 10 ? 'High Media Coverage' :
                 totalMentions > 5 ? 'Moderate Coverage' :
                 totalMentions > 0 ? 'Limited Coverage' : 'No Recent Coverage'
      };
    });
  };

  const pushBurialAnalysis = generatePushBurialAnalysis();
  
  // Filter analysis by promotion
  const filteredAnalysis = selectedPromotion === 'all'
    ? pushBurialAnalysis
    : pushBurialAnalysis.filter(wrestler => 
        wrestler.promotion.toLowerCase().includes(selectedPromotion.toLowerCase())
      );

  // Get top push wrestlers ordered by mentions
  const getTopPushWrestlers = () => {
    return filteredAnalysis
      .filter(wrestler => wrestler.trend === 'push' && wrestler.totalMentions > 0)
      .sort((a, b) => b.totalMentions - a.totalMentions) // Order by most mentions first
      .slice(0, 10);
  };

  // Get worst buried wrestlers ordered by mentions
  const getWorstBuriedWrestlers = () => {
    return filteredAnalysis
      .filter(wrestler => wrestler.trend === 'burial' && wrestler.totalMentions > 0)
      .sort((a, b) => b.totalMentions - a.totalMentions) // Order by most mentions first (most talked about)
      .slice(0, 10);
  };

  const topPushWrestlers = getTopPushWrestlers();
  const worstBuriedWrestlers = getWorstBuriedWrestlers();

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-wrestling-electric">{filteredWrestlers.length}</div>
                <div className="text-sm text-muted-foreground">Total Wrestlers</div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {filteredAnalysis.filter(w => w.trend === 'push').length}
                </div>
                <div className="text-sm text-muted-foreground">Getting Push</div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-400">
                  {filteredAnalysis.filter(w => w.trend === 'burial').length}
                </div>
                <div className="text-sm text-muted-foreground">Being Buried</div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {periodNewsItems.length}
                </div>
                <div className="text-sm text-muted-foreground">News Articles ({selectedTimePeriod}d)</div>
              </CardContent>
            </Card>
          </div>

          {/* PUSH Top 10 and BURIED Worst 10 Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center text-green-400">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  PUSH Top 10 - Most Mentioned ({selectedPromotion === 'all' ? 'All Federations' : selectedPromotion.toUpperCase()})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topPushWrestlers.length > 0 ? (
                    topPushWrestlers.map((wrestler, index) => (
                      <div key={wrestler.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            #{index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{wrestler.wrestler_name}</h4>
                            <p className="text-sm text-muted-foreground">{wrestler.promotion}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600 dark:text-green-400">
                            {wrestler.totalMentions} mentions
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {wrestler.pushScore.toFixed(1)}% positive
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
                  BURIED Worst 10 - Most Mentioned ({selectedPromotion === 'all' ? 'All Federations' : selectedPromotion.toUpperCase()})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {worstBuriedWrestlers.length > 0 ? (
                    worstBuriedWrestlers.map((wrestler, index) => (
                      <div key={wrestler.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
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
                            {wrestler.burialScore.toFixed(1)}% negative
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
