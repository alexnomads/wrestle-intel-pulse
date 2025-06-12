
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, RefreshCw, Users } from 'lucide-react';

interface TrackerHeaderProps {
  lastUpdate: Date;
  onRefresh: () => void;
  isLoading: boolean;
}

export const TrackerHeader = ({ lastUpdate, onRefresh, isLoading }: TrackerHeaderProps) => {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-wrestling-electric" />
            <span>Wrestling Analytics Intelligence</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              LIVE
            </Badge>
          </CardTitle>
        </div>
        <Button
          onClick={onRefresh}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>Real-Time Wrestling Performance Metrics (Sorted by Mentions) • Click to view mentions</span>
        </div>
        <div className="text-sm text-muted-foreground">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>
    </CardHeader>
  );
};
