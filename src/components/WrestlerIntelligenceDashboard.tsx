
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, AlertCircle, Clock } from "lucide-react";
import { useSupabaseWrestlers } from "@/hooks/useSupabaseWrestlers";
import { useRSSFeeds } from "@/hooks/useWrestlingData";
import { useWrestlerAnalysis } from "@/hooks/useWrestlerAnalysis";
import { WrestlerHeatmap } from "./wrestler-intelligence/WrestlerHeatmap";

export const WrestlerIntelligenceDashboard = () => {
  // Fixed to last 24 hours for real-time heatmap
  const selectedTimePeriod = '1'; // 24 hours
  const selectedPromotion = 'all'; // All promotions
  
  // Real data hooks
  const { data: wrestlers = [], isLoading: wrestlersLoading } = useSupabaseWrestlers();
  const { data: newsItems = [], isLoading: newsLoading, error: newsError, refetch } = useRSSFeeds();

  // Analysis hook - get top wrestlers from last 24 hours
  const {
    filteredAnalysis
  } = useWrestlerAnalysis(wrestlers, newsItems, selectedTimePeriod, selectedPromotion);

  const handleRefresh = () => {
    refetch();
  };

  const isLoading = wrestlersLoading || newsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-foreground">Wrestler Intelligence Dashboard</h2>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-wrestling-electric text-white rounded hover:bg-wrestling-electric/80 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
        
        <Card className="glass-card">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <RefreshCw className="h-8 w-8 animate-spin text-wrestling-electric mr-3" />
              <span className="text-lg">Loading wrestling intelligence data...</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Analyzing wrestler mentions from the last 24 hours...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state if we have critical issues
  if (newsError && newsItems.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-foreground">Wrestler Intelligence Dashboard</h2>
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 px-4 py-2 bg-wrestling-electric text-white rounded hover:bg-wrestling-electric/80 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry</span>
          </button>
        </div>

        <Card className="glass-card">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
              <div className="text-lg font-semibold text-foreground">Data Loading Issues</div>
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              Wrestling news sources are temporarily unavailable. Please try refreshing in a few moments.
            </div>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-wrestling-electric text-white rounded hover:bg-wrestling-electric/80 transition-colors"
            >
              Retry Loading Data
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h2 className="text-3xl font-bold text-foreground">Wrestler Intelligence Dashboard</h2>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last 24 Hours</span>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 bg-wrestling-electric text-white rounded hover:bg-wrestling-electric/80 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {filteredAnalysis.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="p-8 text-center">
            <div className="text-lg font-semibold text-foreground mb-2">No Recent Activity</div>
            <div className="text-sm text-muted-foreground">
              No wrestler mentions found in the last 24 hours. Check back later for updates.
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {/* Main Heatmap Visualization */}
          <WrestlerHeatmap wrestlers={filteredAnalysis} />

          {/* Data Status */}
          {newsItems.length > 0 && (
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Data Status: {newsItems.length} news articles analyzed • {filteredAnalysis.length} wrestlers with mentions in last 24h
                  </span>
                  <span>Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-wrestling-electric">
                  {filteredAnalysis.length}
                </div>
                <div className="text-sm text-muted-foreground">Active Wrestlers</div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-500">
                  {filteredAnalysis.filter(w => w.trend === 'push').length}
                </div>
                <div className="text-sm text-muted-foreground">Trending Up</div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-500">
                  {filteredAnalysis.filter(w => w.trend === 'burial').length}
                </div>
                <div className="text-sm text-muted-foreground">Trending Down</div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-500">
                  {filteredAnalysis.filter(w => w.isOnFire).length}
                </div>
                <div className="text-sm text-muted-foreground">Hot Topics</div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
