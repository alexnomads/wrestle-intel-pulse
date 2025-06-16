
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface AutoProcessingIndicatorProps {
  hasRealData: boolean;
  isProcessingMetrics: boolean;
  wrestlersCount: number;
  newsItemsCount: number;
}

export const AutoProcessingIndicator = ({
  hasRealData,
  isProcessingMetrics,
  wrestlersCount,
  newsItemsCount
}: AutoProcessingIndicatorProps) => {
  if (hasRealData || isProcessingMetrics || wrestlersCount === 0) {
    return null;
  }

  return (
    <Card className="border-blue-500/50 bg-blue-500/10">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="text-sm text-blue-300">
            {newsItemsCount > 0 
              ? 'Auto-processing metrics with latest wrestling news...' 
              : 'Loading wrestling news for automatic metrics processing...'
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
