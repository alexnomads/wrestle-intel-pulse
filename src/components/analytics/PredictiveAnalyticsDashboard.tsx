
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, AlertTriangle, Activity, Target, Zap } from 'lucide-react';
import { TrendAlert, WrestlerTrend, StorylineMomentum } from '@/services/predictiveAnalyticsService';
import { SourceLink } from '@/components/mentions/SourceLink';

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
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getMomentumColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

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

      {/* Alerts Section */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <span>Live Alerts</span>
            <Badge variant="secondary">{alerts.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {alerts.length > 0 ? (
              alerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border-l-4 ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{alert.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {alert.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground">
                        <span>{alert.data.change_percentage > 0 ? '+' : ''}{alert.data.change_percentage}%</span>
                        <span>•</span>
                        <span>7 days</span>
                        <span>•</span>
                        <span>{alert.timestamp.toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No alerts at this time
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Storyline Momentum */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-blue-500" />
            <span>Storyline Momentum Tracking</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {storylines.map((storyline) => (
              <div
                key={storyline.id}
                className="p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-lg">{storyline.storyline_title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {storyline.wrestlers_involved.join(' • ')}
                    </p>
                  </div>
                  <Badge
                    className={`${
                      storyline.engagement_trend === 'increasing' ? 'bg-green-100 text-green-800' :
                      storyline.engagement_trend === 'stable' ? 'bg-blue-100 text-blue-800' :
                      'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {storyline.engagement_trend}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getMomentumColor(storyline.momentum_score)}`}>
                      {storyline.momentum_score}
                    </div>
                    <div className="text-xs text-muted-foreground">Momentum</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {storyline.related_sources.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Sources</div>
                  </div>
                </div>

                {storyline.key_events.length > 0 && (
                  <div className="mb-3">
                    <h5 className="text-sm font-medium mb-1">Key Events:</h5>
                    <div className="flex flex-wrap gap-1">
                      {storyline.key_events.map((event, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Enhanced Source Links */}
                {storyline.related_sources.length > 0 && (
                  <div className="mb-3">
                    <h5 className="text-sm font-medium mb-2">Related Sources:</h5>
                    <div className="flex flex-wrap gap-2">
                      {storyline.related_sources.slice(0, 5).map((source, index) => (
                        <SourceLink
                          key={index}
                          url={source.url}
                          title={source.title}
                          sourceType={source.source_type}
                          sourceName={source.source_name}
                          compact={false}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-3">
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        storyline.engagement_trend === 'increasing' ? 'bg-green-500' :
                        storyline.engagement_trend === 'stable' ? 'bg-blue-500' :
                        'bg-orange-500'
                      }`}
                      style={{ width: `${storyline.momentum_score}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
