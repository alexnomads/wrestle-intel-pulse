
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users } from 'lucide-react';
import { WrestlerAnalyticsContent } from './WrestlerAnalyticsContent';

interface WrestlerAnalyticsCardProps {
  isLoading: boolean;
  processedWrestlers: any[];
  hasRealData: boolean;
  newsItemsCount: number;
  onWrestlerClick: (wrestler: any) => void;
  onRefresh: () => void;
}

export const WrestlerAnalyticsCard = ({
  isLoading,
  processedWrestlers,
  hasRealData,
  newsItemsCount,
  onWrestlerClick,
  onRefresh
}: WrestlerAnalyticsCardProps) => {
  return (
    <Card className="glass-card border-slate-700/50">
      <CardHeader className="pb-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <CardTitle className="flex items-center space-x-2 text-xl sm:text-2xl">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-wrestling-electric" />
              <span>Enhanced Wrestling Analytics</span>
            </CardTitle>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 whitespace-nowrap">
              {hasRealData ? 'LIVE METRICS' : 'BUILDING DATA'}
            </Badge>
          </div>
          
          <div className="flex flex-col items-start lg:items-end space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Advanced Sentiment Analysis</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-emerald-600">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="font-medium">
                {hasRealData ? `Live from ${newsItemsCount} sources` : 'Preparing data sources'}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <WrestlerAnalyticsContent
          isLoading={isLoading}
          processedWrestlers={processedWrestlers}
          hasRealData={hasRealData}
          newsItemsCount={newsItemsCount}
          onWrestlerClick={onWrestlerClick}
          onRefresh={onRefresh}
        />
      </CardContent>
    </Card>
  );
};
