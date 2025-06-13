
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, Activity } from 'lucide-react';
import { TrendAlert, WrestlerTrend, StorylineMomentum } from '@/services/predictiveAnalyticsService';
import { LiveAlertsSection } from './LiveAlertsSection';
import { StorylineMomentumSection } from './StorylineMomentumSection';

interface PredictiveAnalyticsDashboardProps {
  trends: WrestlerTrend[];
  alerts: TrendAlert[];
  storylines: StorylineMomentum[];
  onRefresh: () => void;
  isLoading?: boolean;
}

export const PredictiveAnalyticsDashboard = ({
  trends,
  alerts,
  storylines,
  onRefresh,
  isLoading = false
}: PredictiveAnalyticsDashboardProps) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Target className="h-6 w-6 text-wrestling-electric" />
          <h2 className="text-2xl font-bold text-foreground">Predictive Analytics</h2>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            7 DAYS
          </Badge>
        </div>
        <Button
          onClick={onRefresh}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <Activity className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Live Alerts Section */}
      <LiveAlertsSection alerts={alerts} />

      {/* Storyline Momentum Section */}
      <StorylineMomentumSection storylines={storylines} />
    </div>
  );
};
