
import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, RefreshCw } from 'lucide-react';

interface EmptyWrestlerStateProps {
  newsItemsCount: number;
  onRefresh: () => void;
}

export const EmptyWrestlerState = ({ newsItemsCount, onRefresh }: EmptyWrestlerStateProps) => {
  return (
    <div className="text-center py-12">
      <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
      <h3 className="text-lg font-semibold mb-2">No Wrestling Mentions Found</h3>
      <p className="text-muted-foreground mb-4">
        No wrestlers were mentioned in the recent news articles ({newsItemsCount} articles analyzed).
      </p>
      <Button onClick={onRefresh} className="flex items-center space-x-2">
        <RefreshCw className="h-4 w-4" />
        <span>Refresh Data</span>
      </Button>
    </div>
  );
};
