
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface WrestlerCardProps {
  wrestler: {
    id: string;
    wrestler_name: string;
    promotion: string;
    totalMentions: number;
    sentimentScore: number;
    trend: 'push' | 'burial' | 'stable';
    isOnFire: boolean;
    momentumScore: number;
    popularityScore: number;
    change24h: number;
    relatedNews: Array<{
      title: string;
      link: string;
      source: string;
      pubDate: string;
    }>;
  };
  index: number;
  totalWrestlers: number;
}

export const WrestlerCard: React.FC<WrestlerCardProps> = ({ wrestler, index, totalWrestlers }) => {
  // Calculate rectangle dimensions based on popularity score
  const maxScore = 100; // Assuming max popularity score
  const minSize = 120; // Minimum rectangle size
  const maxSize = 300; // Maximum rectangle size
  
  const normalizedScore = Math.max(0, Math.min(100, wrestler.popularityScore || wrestler.totalMentions));
  const baseSize = (normalizedScore / maxScore) * (maxSize - minSize) + minSize;
  
  // Calculate aspect ratio for variety
  const aspectRatio = 1.2 + (index % 3) * 0.3; // Vary between 1.2 and 2.1
  const width = Math.sqrt(baseSize * baseSize * aspectRatio);
  const height = Math.sqrt(baseSize * baseSize / aspectRatio);

  // Calculate color based on 24h change
  const getChangeColor = (change: number) => {
    if (change > 0) {
      // Green intensity based on positive change
      const intensity = Math.min(Math.abs(change) / 20, 1); // Cap at 20% for full intensity
      const greenValue = Math.floor(34 + intensity * 100); // Range from 34 to 134
      return `rgb(${Math.floor(21 - intensity * 10)}, ${greenValue}, ${Math.floor(57 - intensity * 20)})`;
    } else if (change < 0) {
      // Red intensity based on negative change
      const intensity = Math.min(Math.abs(change) / 20, 1);
      const redValue = Math.floor(185 + intensity * 70); // Range from 185 to 255
      return `rgb(${redValue}, ${Math.floor(57 - intensity * 30)}, ${Math.floor(57 - intensity * 30)})`;
    } else {
      // Neutral gray
      return 'rgb(75, 85, 99)';
    }
  };

  const backgroundColor = getChangeColor(wrestler.change24h || 0);
  
  // Get promotion badge color
  const getPromotionColor = (promotion: string) => {
    if (promotion.toLowerCase().includes('wwe')) return 'bg-yellow-600 text-white';
    if (promotion.toLowerCase().includes('aew')) return 'bg-black text-yellow-400';
    if (promotion.toLowerCase().includes('tna')) return 'bg-red-600 text-white';
    return 'bg-gray-600 text-white';
  };

  const changeIcon = wrestler.change24h > 0 ? 
    <TrendingUp className="h-3 w-3" /> : 
    wrestler.change24h < 0 ? 
    <TrendingDown className="h-3 w-3" /> : 
    null;

  return (
    <div 
      className="relative rounded-lg border border-gray-600/30 overflow-hidden hover:border-gray-400/50 transition-all duration-300 hover:scale-105 cursor-pointer group shadow-lg"
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        backgroundColor,
        minWidth: '120px',
        minHeight: '80px'
      }}
    >
      {/* Content overlay */}
      <div className="absolute inset-0 p-3 flex flex-col justify-between text-white">
        {/* Top section - Promotion badge */}
        <div className="flex justify-between items-start">
          <Badge className={`text-xs px-2 py-1 ${getPromotionColor(wrestler.promotion)}`}>
            {wrestler.promotion.replace(/^(WWE|AEW|TNA)\s*/i, '').slice(0, 3).toUpperCase() || wrestler.promotion.slice(0, 3).toUpperCase()}
          </Badge>
          {wrestler.isOnFire && (
            <div className="text-orange-300 text-xs">🔥</div>
          )}
        </div>

        {/* Center section - Wrestler name */}
        <div className="flex-1 flex items-center justify-center text-center">
          <div>
            <div className="font-bold text-sm leading-tight mb-1">
              {wrestler.wrestler_name.split(' ').map((name, i) => (
                <div key={i} className="leading-none">{name}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom section - Score and change */}
        <div className="flex justify-between items-end">
          <div className="text-lg font-bold">
            {wrestler.popularityScore || wrestler.totalMentions}
          </div>
          <div className="flex items-center space-x-1 text-xs">
            {changeIcon}
            <span className="font-medium">
              {wrestler.change24h > 0 ? '+' : ''}{wrestler.change24h}%
            </span>
          </div>
        </div>
      </div>

      {/* Hover tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none">
        <div className="font-semibold">{wrestler.wrestler_name}</div>
        <div>{wrestler.promotion}</div>
        <div>Score: {wrestler.popularityScore || wrestler.totalMentions}</div>
        <div>24h Change: {wrestler.change24h > 0 ? '+' : ''}{wrestler.change24h}%</div>
        <div>Sentiment: {wrestler.sentimentScore}%</div>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
      </div>
    </div>
  );
};
