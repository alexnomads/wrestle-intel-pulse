
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface AutoProcessingIndicatorProps {
  isProcessing: boolean;
  hasRealData: boolean;
  lastUpdate: Date;
}

export const AutoProcessingIndicator = ({
  isProcessing,
  hasRealData,
  lastUpdate
}: AutoProcessingIndicatorProps) => {
  if (hasRealData && !isProcessing) {
    return null;
  }

  return (
    <Card className="border-blue-500/50 bg-blue-500/10">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="text-sm text-blue-300">
            {isProcessing 
              ? 'Processing wrestler metrics with latest wrestling news...' 
              : 'Auto-processing metrics - analyzing wrestler mentions...'
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
