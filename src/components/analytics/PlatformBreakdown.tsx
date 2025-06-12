
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Globe, MessageSquare, Twitter } from 'lucide-react';
import { UnifiedDataSource } from '@/services/unifiedDataService';

interface PlatformBreakdownProps {
  sources: UnifiedDataSource[];
}

export const PlatformBreakdown = ({ sources }: PlatformBreakdownProps) => {
  const newsCount = sources.filter(s => s.type === 'news').length;
  const redditCount = sources.filter(s => s.type === 'reddit').length;
  const twitterCount = sources.filter(s => s.type === 'twitter').length;
  const total = sources.length;

  const newsPercentage = total > 0 ? (newsCount / total) * 100 : 0;
  const redditPercentage = total > 0 ? (redditCount / total) * 100 : 0;
  const twitterPercentage = total > 0 ? (twitterCount / total) * 100 : 0;

  // Get recent activity (last 2 hours)
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const recentSources = sources.filter(s => s.timestamp > twoHoursAgo);

  // Top sources by engagement
  const topSources = sources
    .filter(s => s.engagement)
    .sort((a, b) => (b.engagement?.score || 0) - (a.engagement?.score || 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Platform Distribution */}
      <div className="space-y-3">
        <h4 className="font-medium text-foreground">Source Distribution</h4>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-blue-500" />
              <span className="text-sm">News Sites</span>
            </div>
            <Badge variant="outline" className="border-blue-400 text-blue-600">
              {newsCount} ({Math.round(newsPercentage)}%)
            </Badge>
          </div>
          <div className="w-full bg-secondary/20 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${newsPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-orange-500" />
              <span className="text-sm">Reddit</span>
            </div>
            <Badge variant="outline" className="border-orange-400 text-orange-600">
              {redditCount} ({Math.round(redditPercentage)}%)
            </Badge>
          </div>
          <div className="w-full bg-secondary/20 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${redditPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Twitter className="h-4 w-4 text-blue-400" />
              <span className="text-sm">Twitter</span>
            </div>
            <Badge variant="outline" className="border-blue-400 text-blue-600">
              {twitterCount} ({Math.round(twitterPercentage)}%)
            </Badge>
          </div>
          <div className="w-full bg-secondary/20 rounded-full h-2">
            <div 
              className="bg-blue-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${twitterPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-3">
        <h4 className="font-medium text-foreground">Recent Activity</h4>
        <div className="text-center p-4 bg-secondary/20 rounded-lg">
          <div className="text-2xl font-bold text-wrestling-electric">{recentSources.length}</div>
          <div className="text-xs text-muted-foreground">posts in last 2 hours</div>
        </div>
      </div>

      {/* Top Engagement */}
      {topSources.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Top Engagement</h4>
          <div className="space-y-2">
            {topSources.map((source, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex-1 truncate">
                  <div className="font-medium truncate">{source.title}</div>
                  <div className="text-muted-foreground">{source.source}</div>
                </div>
                <Badge variant="outline" className="ml-2 shrink-0">
                  {source.engagement?.score}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
