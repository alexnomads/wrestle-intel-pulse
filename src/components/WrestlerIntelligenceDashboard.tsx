
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";
import { useWrestlerMomentumAnalysis, useAdvancedTrendingTopics } from "@/hooks/useAdvancedAnalytics";
import { useSupabaseWrestlers } from "@/hooks/useSupabaseWrestlers";
import { useRSSFeeds } from "@/hooks/useWrestlingData";
import { MomentumLeaderCard } from "./wrestler-intelligence/MomentumLeaderCard";
import { PushBurialCard } from "./wrestler-intelligence/PushBurialCard";
import { ContractStatusCard } from "./wrestler-intelligence/ContractStatusCard";
import { WrestlerProfileCard } from "./wrestler-intelligence/WrestlerProfileCard";
import { DashboardFilters } from "./wrestler-intelligence/DashboardFilters";
import { EmptyWrestlerState } from "./wrestler-intelligence/EmptyWrestlerState";
import { analyzeSentiment, extractWrestlerMentions } from "@/services/wrestlingDataService";

export const WrestlerIntelligenceDashboard = () => {
  const [selectedPromotion, setSelectedPromotion] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('momentum');
  
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

  // Generate real contract analysis from wrestler data
  const generateContractAnalysis = () => {
    if (!wrestlers.length) return [];
    
    return wrestlers.map(wrestler => {
      // Calculate momentum from news mentions
      const wrestlerNews = newsItems.filter(item => 
        extractWrestlerMentions(`${item.title} ${item.contentSnippet}`).includes(wrestler.name)
      );
      
      let momentum = 'stable';
      let momentumScore = 5;
      
      if (wrestlerNews.length >= 5) {
        momentum = 'rising';
        momentumScore = Math.min(7 + wrestlerNews.length * 0.5, 10);
      } else if (wrestlerNews.length <= 1) {
        momentum = 'declining';
        momentumScore = Math.max(3 - wrestlerNews.length, 1);
      }

      // Analyze sentiment from news
      let avgSentiment = 0.5;
      if (wrestlerNews.length > 0) {
        const sentiments = wrestlerNews.map(item => 
          analyzeSentiment(`${item.title} ${item.contentSnippet}`).score
        );
        avgSentiment = sentiments.reduce((sum, score) => sum + score, 0) / sentiments.length;
      }

      // Determine contract status based on various factors
      let contractStatus = 'active';
      let contractRisk = 'low';
      
      if (wrestler.status === 'Released' || wrestler.status === 'Inactive') {
        contractStatus = 'expired';
        contractRisk = 'high';
      } else if (momentum === 'declining' && avgSentiment < 0.4) {
        contractRisk = 'medium';
      }

      return {
        id: wrestler.id,
        wrestler_name: wrestler.name, // Fix: Use wrestler_name to match WrestlerMomentum interface
        promotion: wrestler.brand || 'Unknown',
        momentum,
        momentumScore,
        sentimentScore: Math.round(avgSentiment * 100),
        newsVolume: wrestlerNews.length,
        contractStatus,
        contractRisk,
        isChampion: wrestler.is_champion || false,
        championshipTitle: wrestler.championship_title || null
      };
    }).sort((a, b) => b.momentumScore - a.momentumScore);
  };

  const contractAnalysis = generateContractAnalysis();
  
  // Filter contract analysis by promotion
  const filteredContractAnalysis = selectedPromotion === 'all'
    ? contractAnalysis
    : contractAnalysis.filter(wrestler => 
        wrestler.promotion.toLowerCase().includes(selectedPromotion.toLowerCase())
      );

  // Generate push/burial analysis
  const pushBurialAnalysis = filteredContractAnalysis.map(wrestler => ({
    wrestler_name: wrestler.wrestler_name, // Use wrestler_name consistently
    promotion: wrestler.promotion,
    pushScore: wrestler.isChampion ? 9 : wrestler.momentumScore,
    burialRisk: wrestler.contractRisk === 'high' ? 8 : 
                wrestler.contractRisk === 'medium' ? 5 : 2,
    trend: wrestler.momentum === 'rising' ? 'push' as const : 
           wrestler.momentum === 'declining' ? 'burial' as const : 'stable' as const,
    evidence: wrestler.isChampion ? 'Current Champion' : 
              wrestler.newsVolume > 5 ? 'High Media Coverage' :
              wrestler.newsVolume < 2 ? 'Limited Coverage' : 'Regular Coverage'
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
        <DashboardFilters
          selectedPromotion={selectedPromotion}
          onPromotionChange={setSelectedPromotion}
          selectedMetric={selectedMetric}
          onMetricChange={setSelectedMetric}
          onRefresh={handleRefresh}
          isLoading={momentumLoading}
        />
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
                  {filteredContractAnalysis.filter(w => w.momentum === 'rising').length}
                </div>
                <div className="text-sm text-muted-foreground">Rising Stars</div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {filteredContractAnalysis.filter(w => w.isChampion).length}
                </div>
                <div className="text-sm text-muted-foreground">Champions</div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-400">
                  {filteredContractAnalysis.filter(w => w.contractRisk === 'high').length}
                </div>
                <div className="text-sm text-muted-foreground">At Risk</div>
              </CardContent>
            </Card>
          </div>

          {/* Momentum Leaders */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Momentum Leaders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {filteredContractAnalysis.slice(0, 10).map((wrestler, index) => (
                  <MomentumLeaderCard
                    key={wrestler.id}
                    wrestler={{
                      wrestler_name: wrestler.wrestler_name, // Use wrestler_name consistently
                      promotion: wrestler.promotion,
                      momentum: wrestler.momentumScore,
                      trend: wrestler.momentum === 'rising' ? 'up' : 
                             wrestler.momentum === 'declining' ? 'down' : 'stable',
                      weeklyChange: wrestler.momentum === 'rising' ? 15 : 
                                   wrestler.momentum === 'declining' ? -10 : 0,
                      newsVolume: wrestler.newsVolume,
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
                <CardTitle>Push Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pushBurialAnalysis
                    .filter(w => w.trend === 'push')
                    .slice(0, 5)
                    .map((wrestler, index) => (
                      <PushBurialCard
                        key={wrestler.wrestler_name}
                        wrestler={wrestler}
                        type="push"
                        rank={index + 1}
                      />
                    ))}
                  {pushBurialAnalysis.filter(w => w.trend === 'push').length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                      No wrestlers currently receiving a strong push
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Burial Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pushBurialAnalysis
                    .filter(w => w.trend === 'burial' || w.burialRisk > 5)
                    .slice(0, 5)
                    .map((wrestler, index) => (
                      <PushBurialCard
                        key={wrestler.wrestler_name}
                        wrestler={wrestler}
                        type="burial"
                        rank={index + 1}
                      />
                    ))}
                  {pushBurialAnalysis.filter(w => w.trend === 'burial' || w.burialRisk > 5).length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                      No wrestlers currently at high burial risk
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contract Status Analysis */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Contract Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {filteredContractAnalysis.slice(0, 8).map((wrestler) => (
                  <ContractStatusCard
                    key={wrestler.id}
                    contract={{
                      wrestlerName: wrestler.wrestler_name,
                      promotion: wrestler.promotion,
                      status: wrestler.contractStatus,
                      expirationDate: 'Unknown', // This would come from real contract data
                      marketValue: wrestler.momentumScore > 7 ? 'High' : 
                                  wrestler.momentumScore > 4 ? 'Medium' : 'Low',
                      leverage: wrestler.isChampion ? 'High' : 
                               wrestler.momentum === 'rising' ? 'Medium' : 'Low'
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
