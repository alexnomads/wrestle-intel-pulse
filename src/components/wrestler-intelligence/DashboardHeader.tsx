
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database } from 'lucide-react';

interface DashboardHeaderProps {
  hasRealData: boolean;
  isProcessingMetrics: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  lastUpdate: Date;
  onProcessMetrics: () => void;
  onRefresh: () => void;
}

export const DashboardHeader = ({
  hasRealData,
  isProcessingMetrics,
  isLoading,
  isRefreshing,
  lastUpdate,
  onProcessMetrics,
  onRefresh
}: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0 gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          Wrestler Intelligence Dashboard
        </h2>
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-300 whitespace-nowrap">
          {hasRealData ? 'LIVE DATA' : 'LOADING ANALYTICS'}
        </Badge>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <Button
          onClick={onProcessMetrics}
          disabled={isProcessingMetrics}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2 w-full sm:w-auto bg-wrestling-electric/10 border-wrestling-electric/40 hover:bg-wrestling-electric/20"
        >
          <Database className={`h-4 w-4 ${isProcessingMetrics ? 'animate-spin' : ''}`} />
          <span>{isProcessingMetrics ? 'Processing...' : 'Process Metrics'}</span>
        </Button>
        <Button
          onClick={onRefresh}
          disabled={isLoading || isRefreshing}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2 w-full sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 ${(isLoading || isRefreshing) ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
        <div className="text-sm text-muted-foreground">
          Last: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};
