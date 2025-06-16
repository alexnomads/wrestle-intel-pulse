
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface DashboardHeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
  lastUpdate: Date;
}

export const DashboardHeader = ({
  onRefresh,
  isLoading,
  lastUpdate
}: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0 gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          Wrestler Intelligence Dashboard
        </h2>
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-300 whitespace-nowrap">
          LIVE ANALYTICS
        </Badge>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <Button
          onClick={onRefresh}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2 w-full sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
        <div className="text-sm text-muted-foreground">
          Last: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};
