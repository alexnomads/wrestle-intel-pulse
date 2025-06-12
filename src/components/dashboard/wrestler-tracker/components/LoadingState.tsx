
import React from 'react';
import { RefreshCw } from 'lucide-react';

export const LoadingState = () => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center space-x-3">
        <RefreshCw className="h-6 w-6 animate-spin text-wrestling-electric" />
        <span className="text-lg">Loading analytics data...</span>
      </div>
    </div>
  );
};
