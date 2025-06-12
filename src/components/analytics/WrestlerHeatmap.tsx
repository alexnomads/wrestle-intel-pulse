
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { WrestlerMention } from '@/services/unifiedDataService';

interface WrestlerHeatmapProps {
  wrestlerMentions: WrestlerMention[];
}

export const WrestlerHeatmap = ({ wrestlerMentions }: WrestlerHeatmapProps) => {
  if (wrestlerMentions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No wrestler mentions found in recent data
      </div>
    );
  }

  const maxMentions = Math.max(...wrestlerMentions.map(w => w.mentions));

  return (
    <div className="space-y-4">
      {/* Heatmap Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {wrestlerMentions.map((wrestler, index) => {
          const intensity = (wrestler.mentions / maxMentions) * 100;
          const heatColor = intensity > 75 ? 'bg-red-500' : 
                           intensity > 50 ? 'bg-orange-500' : 
                           intensity > 25 ? 'bg-yellow-500' : 'bg-blue-500';
          
          return (
            <div
              key={wrestler.wrestlerName}
              className={`p-4 rounded-lg text-white ${heatColor} hover:scale-105 transition-transform cursor-pointer`}
              style={{ opacity: 0.7 + (intensity / 100) * 0.3 }}
            >
              <div className="text-sm font-medium mb-1 line-clamp-2">
                {wrestler.wrestlerName}
              </div>
              <div className="text-xs opacity-90 mb-2">
                {wrestler.mentions} mentions
              </div>
              <div className="flex items-center justify-between">
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${wrestler.sentiment > 0.6 ? 'bg-green-100 text-green-800' : 
                                       wrestler.sentiment < 0.4 ? 'bg-red-100 text-red-800' : 
                                       'bg-gray-100 text-gray-800'}`}
                >
                  {wrestler.sentiment > 0.6 ? 'Positive' : 
                   wrestler.sentiment < 0.4 ? 'Negative' : 'Neutral'}
                </Badge>
                <div className="flex items-center space-x-1">
                  {wrestler.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span className="text-xs">{wrestler.trendPercentage}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>High Activity</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-orange-500 rounded"></div>
          <span>Medium Activity</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>Low Activity</span>
        </div>
      </div>
    </div>
  );
};
