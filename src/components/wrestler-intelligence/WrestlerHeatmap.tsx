
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Flame } from "lucide-react";

interface WrestlerData {
  id: string;
  wrestler_name: string;
  promotion: string;
  totalMentions: number;
  sentimentScore: number;
  trend: 'push' | 'burial' | 'stable';
  isOnFire: boolean;
}

interface WrestlerHeatmapProps {
  wrestlers: WrestlerData[];
}

export const WrestlerHeatmap = ({ wrestlers }: WrestlerHeatmapProps) => {
  // Take top 7 wrestlers by mentions
  const topWrestlers = wrestlers.slice(0, 7);
  
  // Calculate sizes based on mentions (normalize to percentage)
  const maxMentions = Math.max(...topWrestlers.map(w => w.totalMentions));
  const minSize = 15; // Minimum percentage
  const maxSize = 70; // Maximum percentage
  
  const getWrestlerSize = (mentions: number) => {
    if (maxMentions === 0) return minSize;
    const normalizedSize = (mentions / maxMentions) * (maxSize - minSize) + minSize;
    return Math.max(minSize, normalizedSize);
  };
  
  const getWrestlerColor = (sentimentScore: number, trend: string) => {
    if (trend === 'push' || sentimentScore > 60) {
      return 'bg-green-500'; // Positive - Green
    } else if (trend === 'burial' || sentimentScore < 40) {
      return 'bg-red-500'; // Negative - Red
    } else {
      return 'bg-yellow-500'; // Neutral - Yellow
    }
  };
  
  const getPromotionIcon = (promotion: string) => {
    if (promotion.toLowerCase().includes('wwe')) return '🏆';
    if (promotion.toLowerCase().includes('aew')) return '⚡';
    if (promotion.toLowerCase().includes('tna')) return '🔥';
    return '🤼';
  };

  return (
    <Card className="glass-card h-96">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Flame className="h-6 w-6 text-orange-500" />
          <span>Wrestler Mentions Heatmap</span>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            24H
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="relative w-full h-64 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden">
          {topWrestlers.map((wrestler, index) => {
            const size = getWrestlerSize(wrestler.totalMentions);
            const colorClass = getWrestlerColor(wrestler.sentimentScore, wrestler.trend);
            
            // Position wrestlers in a grid-like pattern
            const positions = [
              { top: '10%', left: '10%' },
              { top: '15%', left: '60%' },
              { top: '45%', left: '75%' },
              { top: '65%', left: '15%' },
              { top: '70%', left: '50%' },
              { top: '25%', left: '35%' },
              { top: '50%', left: '45%' }
            ];
            
            const position = positions[index] || { top: '50%', left: '50%' };
            
            return (
              <div
                key={wrestler.id}
                className={`absolute rounded-lg ${colorClass} flex flex-col items-center justify-center text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group`}
                style={{
                  width: `${size}%`,
                  height: `${size * 0.8}%`,
                  top: position.top,
                  left: position.left,
                  transform: 'translate(-50%, -50%)',
                  minWidth: '80px',
                  minHeight: '60px'
                }}
              >
                {/* Wrestler Icon */}
                <div className="text-lg mb-1">
                  {getPromotionIcon(wrestler.promotion)}
                </div>
                
                {/* Wrestler Name */}
                <div className="text-xs text-center px-2 leading-tight">
                  {wrestler.wrestler_name.split(' ').map((name, i) => (
                    <div key={i}>{name}</div>
                  ))}
                </div>
                
                {/* Mention Count */}
                <div className="text-xs mt-1 opacity-90">
                  {wrestler.totalMentions}
                </div>
                
                {/* Trend Indicator */}
                <div className="absolute top-1 right-1">
                  {wrestler.trend === 'push' && <TrendingUp className="h-3 w-3" />}
                  {wrestler.trend === 'burial' && <TrendingDown className="h-3 w-3" />}
                  {wrestler.isOnFire && <Flame className="h-3 w-3 text-orange-300" />}
                </div>
                
                {/* Hover Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                  <div className="font-semibold">{wrestler.wrestler_name}</div>
                  <div>{wrestler.promotion}</div>
                  <div>{wrestler.totalMentions} mentions</div>
                  <div>Sentiment: {wrestler.sentimentScore}%</div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                </div>
              </div>
            );
          })}
          
          {/* Legend */}
          <div className="absolute bottom-2 right-2 flex space-x-3 text-xs text-white">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Positive</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Negative</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Neutral</span>
            </div>
          </div>
        </div>
        
        {/* Stats Summary */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="bg-secondary/30 rounded-lg p-3">
            <div className="text-lg font-bold text-wrestling-electric">
              {topWrestlers.reduce((sum, w) => sum + w.totalMentions, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Total Mentions</div>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3">
            <div className="text-lg font-bold text-green-500">
              {topWrestlers.filter(w => w.trend === 'push').length}
            </div>
            <div className="text-xs text-muted-foreground">Trending Up</div>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3">
            <div className="text-lg font-bold text-red-500">
              {topWrestlers.filter(w => w.trend === 'burial').length}
            </div>
            <div className="text-xs text-muted-foreground">Trending Down</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
