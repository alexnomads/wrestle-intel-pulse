
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Flame, Crown } from 'lucide-react';
import { WrestlerAnalysis } from '@/types/wrestlerAnalysis';

interface WrestlerCardProps {
  wrestler: WrestlerAnalysis;
  index: number;
  totalWrestlers: number;
}

// Function to get wrestler image based on name
const getWrestlerImage = (wrestlerName: string): string => {
  // Create a mapping of wrestler names to Wikipedia/placeholder images
  const wrestlerImages: { [key: string]: string } = {
    'Roman Reigns': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Roman_Reigns_April_2022.jpg/800px-Roman_Reigns_April_2022.jpg',
    'Cody Rhodes': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Cody_Rhodes_in_April_2023.jpg/800px-Cody_Rhodes_in_April_2023.jpg',
    'CM Punk': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/CM_Punk_2023.jpg/800px-CM_Punk_2023.jpg',
    'Jon Moxley': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Jon_Moxley_2019.jpg/800px-Jon_Moxley_2019.jpg',
    'MJF': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Maxwell_Jacob_Friedman_2022.jpg/800px-Maxwell_Jacob_Friedman_2022.jpg',
    'Gunther': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Walter_2020.jpg/800px-Walter_2020.jpg',
    'Rhea Ripley': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Rhea_Ripley_2023.jpg/800px-Rhea_Ripley_2023.jpg',
    'Bianca Belair': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Bianca_Belair_2023.jpg/800px-Bianca_Belair_2023.jpg',
    'Seth Rollins': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Seth_Rollins_2023.jpg/800px-Seth_Rollins_2023.jpg',
    'Drew McIntyre': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Drew_McIntyre_2023.jpg/800px-Drew_McIntyre_2023.jpg'
  };

  // Return specific image if available, otherwise use a placeholder
  return wrestlerImages[wrestlerName] || `https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop&crop=face`;
};

export const WrestlerCard = ({ wrestler, index, totalWrestlers }: WrestlerCardProps) => {
  // Calculate card size based on mentions and position
  const baseSize = Math.max(120, Math.min(200, (wrestler.totalMentions || 1) * 8));
  const sizeMultiplier = index < 3 ? 1.2 : index < 5 ? 1.0 : 0.8;
  const cardSize = baseSize * sizeMultiplier;

  const getTrendIcon = () => {
    const change = wrestler.change24h || 0;
    if (change > 0) return <TrendingUp className="h-3 w-3 text-green-400" />;
    if (change < 0) return <TrendingDown className="h-3 w-3 text-red-400" />;
    return null;
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 80) return 'border-green-500 bg-green-500/10';
    if (sentiment >= 60) return 'border-yellow-500 bg-yellow-500/10';
    return 'border-red-500 bg-red-500/10';
  };

  const getPromotionColor = (promotion: string) => {
    switch (promotion?.toUpperCase()) {
      case 'WWE': return 'bg-yellow-500/20 text-yellow-300';
      case 'AEW': return 'bg-blue-500/20 text-blue-300';
      case 'TNA': return 'bg-red-500/20 text-red-300';
      case 'NJPW': return 'bg-purple-500/20 text-purple-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  // Ensure we have valid data with fallbacks
  const wrestlerName = wrestler.wrestler_name || 'Unknown Wrestler';
  const promotion = wrestler.promotion || 'Unknown';
  const totalMentions = wrestler.totalMentions || 0;
  const sentimentScore = wrestler.sentimentScore || 50;
  const change24h = wrestler.change24h || 0;
  const isChampion = wrestler.isChampion || false;
  const isOnFire = wrestler.isOnFire || false;
  const championshipTitle = wrestler.championshipTitle;

  return (
    <div 
      className={`relative flex flex-col items-center justify-center p-3 rounded-lg border-2 
        ${getSentimentColor(sentimentScore)} 
        hover:scale-105 transition-all duration-300 cursor-pointer group bg-card/80 backdrop-blur-sm`}
      style={{ 
        width: `${cardSize}px`, 
        height: `${cardSize}px`,
        minWidth: '120px',
        minHeight: '120px'
      }}
    >
      {/* Rank Badge */}
      <div className="absolute top-2 left-2 bg-wrestling-electric text-black text-xs font-bold px-2 py-1 rounded-full">
        #{index + 1}
      </div>

      {/* Championship Crown */}
      {isChampion && (
        <Crown className="absolute top-2 right-2 h-4 w-4 text-yellow-400" />
      )}

      {/* Hot Topic Indicator */}
      {isOnFire && (
        <Flame className="absolute top-2 right-8 h-4 w-4 text-orange-500 animate-pulse" />
      )}

      {/* Wrestler Image */}
      <div className="w-12 h-12 mb-2 rounded-full overflow-hidden border-2 border-border/50 bg-muted">
        <img 
          src={getWrestlerImage(wrestlerName)}
          alt={wrestlerName}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            e.currentTarget.src = `https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop&crop=face`;
          }}
        />
      </div>

      {/* Wrestler Name */}
      <div className="text-center mb-2">
        <div className="font-bold text-sm leading-tight text-foreground">
          {wrestlerName}
        </div>
        <Badge variant="secondary" className={`text-xs mt-1 ${getPromotionColor(promotion)}`}>
          {promotion}
        </Badge>
      </div>

      {/* Metrics */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center space-x-1 text-xs">
          <span className="font-semibold text-wrestling-electric">
            {totalMentions}
          </span>
          <span className="text-muted-foreground">mentions</span>
        </div>
        
        <div className="flex items-center justify-center space-x-1 text-xs">
          <span className={`font-semibold ${
            sentimentScore >= 80 ? 'text-green-400' :
            sentimentScore >= 60 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {sentimentScore}%
          </span>
          <span className="text-muted-foreground">sentiment</span>
        </div>

        {/* 24h Change */}
        <div className="flex items-center justify-center space-x-1 text-xs">
          {getTrendIcon()}
          <span className={`font-semibold ${
            change24h > 0 ? 'text-green-400' :
            change24h < 0 ? 'text-red-400' : 'text-gray-400'
          }`}>
            {change24h > 0 ? '+' : ''}{change24h}%
          </span>
        </div>
      </div>

      {/* Championship Title */}
      {championshipTitle && (
        <div className="absolute bottom-1 left-1 right-1">
          <div className="text-xs bg-yellow-500/20 text-yellow-300 px-1 py-0.5 rounded text-center truncate">
            {championshipTitle}
          </div>
        </div>
      )}
    </div>
  );
};
