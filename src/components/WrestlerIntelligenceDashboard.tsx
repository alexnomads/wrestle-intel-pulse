
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw } from "lucide-react";
import { useWrestlerMomentumAnalysis, useAdvancedTrendingTopics } from "@/hooks/useAdvancedAnalytics";
import { useSupabaseWrestlers } from "@/hooks/useSupabaseWrestlers";
import { WrestlerProfileCard } from "./wrestler-intelligence/WrestlerProfileCard";
import { PushBurialCard } from "./wrestler-intelligence/PushBurialCard";
import { ContractStatusCard } from "./wrestler-intelligence/ContractStatusCard";
import { MomentumLeaderCard } from "./wrestler-intelligence/MomentumLeaderCard";
import { DashboardFilters } from "./wrestler-intelligence/DashboardFilters";
import { EmptyWrestlerState } from "./wrestler-intelligence/EmptyWrestlerState";

export const WrestlerIntelligenceDashboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const { data: wrestlerMomentum = [], isLoading: momentumLoading, refetch } = useWrestlerMomentumAnalysis();
  const { data: trendingTopics = [] } = useAdvancedTrendingTopics();
  const { data: wrestlers = [] } = useSupabaseWrestlers();

  const handleRefresh = () => {
    refetch();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'expiring': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'negotiating': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'unknown': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getSentimentColor = (trend: string) => {
    switch (trend) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  if (momentumLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-wrestling-electric" />
        <span className="ml-2 text-lg">Analyzing wrestler momentum...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Wrestler Intelligence Dashboard</h2>
        <DashboardFilters
          selectedTimeframe={selectedTimeframe}
          onTimeframeChange={setSelectedTimeframe}
          onRefresh={handleRefresh}
          isLoading={momentumLoading}
        />
      </div>

      <Tabs defaultValue="wrestler-profiles" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="wrestler-profiles">Wrestler Profiles</TabsTrigger>
          <TabsTrigger value="push-burial">Push/Burial Tracker</TabsTrigger>
          <TabsTrigger value="contract-monitor">Contract Monitor</TabsTrigger>
          <TabsTrigger value="social-sentiment">Social Sentiment</TabsTrigger>
        </TabsList>

        <TabsContent value="wrestler-profiles" className="space-y-6">
          {wrestlerMomentum.length === 0 ? (
            <EmptyWrestlerState />
          ) : (
            <div className="grid gap-6">
              {wrestlerMomentum.slice(0, 15).map((momentum, index) => (
                <WrestlerProfileCard
                  key={`${momentum.wrestler_name}-${index}`}
                  momentum={momentum}
                  getStatusColor={getStatusColor}
                  getSentimentColor={getSentimentColor}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="push-burial" className="space-y-6">
          <div className="grid gap-4">
            {wrestlerMomentum
              .sort((a, b) => b.push_burial_score - a.push_burial_score)
              .map((momentum, index) => (
                <PushBurialCard key={`${momentum.wrestler_name}-${index}`} momentum={momentum} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="contract-monitor" className="space-y-6">
          <div className="grid gap-4">
            {['active', 'expiring', 'negotiating', 'unknown'].map((status) => {
              const statusWrestlers = wrestlerMomentum.filter(w => w.contract_status === status);
              if (statusWrestlers.length === 0) return null;
              
              return (
                <ContractStatusCard
                  key={status}
                  status={status}
                  wrestlers={statusWrestlers}
                  getStatusColor={getStatusColor}
                />
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="social-sentiment" className="space-y-6">
          <div className="grid gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Trending Topics</CardTitle>
              </CardHeader>
              <CardContent>
                {trendingTopics.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No trending topics available. Try refreshing the news data.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {trendingTopics.slice(0, 5).map((topic, index) => (
                      <div key={index} className="p-4 bg-secondary/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-foreground">{topic.title}</h3>
                          <Badge variant="outline">{topic.mentions} mentions</Badge>
                        </div>
                        {topic.related_wrestlers.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {topic.related_wrestlers.slice(0, 4).map((wrestler, wIndex) => (
                              <Badge key={wIndex} variant="secondary" className="text-xs">
                                {wrestler}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Momentum Leaders</CardTitle>
              </CardHeader>
              <CardContent>
                {wrestlerMomentum.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No wrestler momentum data available. Try refreshing the news data.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {wrestlerMomentum
                      .sort((a, b) => b.momentum_change - a.momentum_change)
                      .slice(0, 8)
                      .map((wrestler, index) => (
                        <MomentumLeaderCard key={`${wrestler.wrestler_name}-${index}`} wrestler={wrestler} index={index} />
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
