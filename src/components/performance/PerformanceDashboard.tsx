
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Database, Zap, AlertTriangle } from 'lucide-react';
import { performanceMonitor } from '@/services/optimizedDataService';

interface PerformanceDashboardProps {
  loadTimes?: Record<string, number>;
  fromCache?: boolean;
  isBackgroundRefreshing?: boolean;
}

export const PerformanceDashboard = ({ 
  loadTimes = {}, 
  fromCache = false,
  isBackgroundRefreshing = false 
}: PerformanceDashboardProps) => {
  const totalLoadTime = Object.values(loadTimes).reduce((sum, time) => sum + time, 0);
  const slowSources = performanceMonitor.getSlowSources(3000);
  
  const getLoadTimeColor = (time: number) => {
    if (time < 1000) return 'text-green-500';
    if (time < 3000) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-sm">
          <Zap className="h-4 w-4 text-wrestling-electric" />
          <span>Performance Monitor</span>
          {fromCache && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
              <Database className="h-3 w-3 mr-1" />
              Cached
            </Badge>
          )}
          {isBackgroundRefreshing && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
              <Clock className="h-3 w-3 mr-1 animate-spin" />
              Updating
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          {Object.entries(loadTimes).map(([source, time]) => (
            <div key={source} className="text-center">
              <div className={`font-bold ${getLoadTimeColor(time)}`}>
                {time > 0 ? `${time}ms` : '—'}
              </div>
              <div className="text-muted-foreground capitalize">{source}</div>
            </div>
          ))}
          
          {totalLoadTime > 0 && (
            <div className="text-center">
              <div className={`font-bold ${getLoadTimeColor(totalLoadTime)}`}>
                {totalLoadTime}ms
              </div>
              <div className="text-muted-foreground">Total</div>
            </div>
          )}
        </div>
        
        {slowSources.length > 0 && (
          <div className="mt-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center space-x-1 text-yellow-700 text-xs">
              <AlertTriangle className="h-3 w-3" />
              <span>Slow sources: {slowSources.join(', ')}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
