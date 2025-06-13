
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, TrendingDown, Activity, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { TrendAlert } from '@/services/predictiveAnalyticsService';
import { useTrendAlerts } from '@/hooks/usePredictiveAnalytics';
import { MentionSourceIndicator } from '@/components/mentions/MentionSourceIndicator';
import { SourceLink } from '@/components/mentions/SourceLink';

interface TrendAlertsWidgetProps {
  maxAlerts?: number;
  showHeader?: boolean;
}

export const TrendAlertsWidget = ({ maxAlerts = 3, showHeader = true }: TrendAlertsWidgetProps) => {
  const { data: alerts = [], isLoading } = useTrendAlerts();
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

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
            displayedAlerts.map((alert) => {
              const hasExpandableContent = alert.mention_sources && alert.mention_sources.length > 0;
              const isExpanded = expandedAlert === alert.id;
              
              return (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border-l-4 text-xs ${getSeverityColor(alert.severity)} ${hasExpandableContent ? 'cursor-pointer hover:opacity-80' : ''} transition-opacity`}
                  onClick={() => hasExpandableContent && setExpandedAlert(isExpanded ? null : alert.id)}
                >
                  <div className="flex items-start space-x-2">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{alert.title}</p>
                        {hasExpandableContent && (
                          <div className="flex items-center space-x-2 ml-2">
                            <Badge variant="outline" className="text-xs">
                              {alert.mention_sources.length} source{alert.mention_sources.length !== 1 ? 's' : ''}
                            </Badge>
                            {isExpanded ? (
                              <ChevronUp className="h-3 w-3 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                        )}
                      </div>
                      <p className="text-muted-foreground truncate mt-1">{alert.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <span className="font-medium">
                            {alert.data.change_percentage > 0 ? '+' : ''}{alert.data.change_percentage}%
                          </span>
                          <span>•</span>
                          <span>{alert.timestamp.toLocaleTimeString()}</span>
                        </div>
                      </div>
                      
                      {/* Expanded source details */}
                      {isExpanded && hasExpandableContent && (
                        <div className="mt-3 space-y-2 border-t pt-2">
                          <p className="font-medium text-xs text-muted-foreground">Source Mentions:</p>
                          <div className="max-h-40 overflow-y-auto space-y-2">
                            {alert.mention_sources.slice(0, 5).map((source, index) => (
                              <div key={index} className="flex items-start justify-between p-2 bg-background/50 rounded border">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate">{source.title}</p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {source.content_snippet.substring(0, 80)}...
                                  </p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Badge variant="secondary" className="text-xs">
                                      {source.source_name}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(source.timestamp).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                <SourceLink
                                  url={source.url}
                                  title={source.title}
                                  sourceType={source.source_type}
                                  compact={true}
                                />
                              </div>
                            ))}
                            {alert.mention_sources.length > 5 && (
                              <div className="text-xs text-muted-foreground text-center py-1">
                                +{alert.mention_sources.length - 5} more sources
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
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
