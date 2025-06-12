
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { TrendAlert } from '@/services/predictiveAnalyticsService';
import { useTrendAlerts } from '@/hooks/usePredictiveAnalytics';

interface TrendAlertsWidgetProps {
  maxAlerts?: number;
  showHeader?: boolean;
}

export const TrendAlertsWidget = ({ maxAlerts = 3, showHeader = true }: TrendAlertsWidgetProps) => {
  const { data: alerts = [], isLoading } = useTrendAlerts();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'trend_spike': return <TrendingUp className="h-4 w-4" />;
      case 'sentiment_shift': return <Activity className="h-4 w-4" />;
      case 'storyline_momentum': return <TrendingDown className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Live Alerts</span>
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center text-sm text-muted-foreground py-4">
            Loading alerts...
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayedAlerts = alerts.slice(0, maxAlerts);

  return (
    <Card className="glass-card">
      {showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <span>Live Alerts</span>
            {alerts.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {alerts.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-2">
          {displayedAlerts.length > 0 ? (
            displayedAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-2 rounded-lg border-l-2 text-xs ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start space-x-2">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{alert.title}</p>
                    <p className="text-muted-foreground truncate">{alert.description}</p>
                    <div className="flex items-center space-x-1 mt-1 text-muted-foreground">
                      <span>{alert.data.change_percentage > 0 ? '+' : ''}{alert.data.change_percentage}%</span>
                      <span>•</span>
                      <span>{alert.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-sm text-muted-foreground py-4">
              No alerts at this time
            </div>
          )}
          {alerts.length > maxAlerts && (
            <div className="text-center">
              <button className="text-xs text-wrestling-electric hover:underline">
                View {alerts.length - maxAlerts} more alerts
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
