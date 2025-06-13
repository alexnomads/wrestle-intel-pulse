
import { Badge } from '@/components/ui/badge';
import { Crown, Flame, ExternalLink } from 'lucide-react';
import { WrestlerAnalysis } from '@/types/wrestlerAnalysis';
import { useState } from 'react';

interface WrestlerCardProps {
  wrestler: WrestlerAnalysis;
  index: number;
  totalWrestlers: number;
  onWrestlerClick?: (wrestler: WrestlerAnalysis) => void;
}

const getWrestlerImage = (wrestlerName: string): string => {
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

  return wrestlerImages[wrestlerName] || `https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop&crop=face`;
};

export const WrestlerCard = ({ wrestler, index, totalWrestlers, onWrestlerClick }: WrestlerCardProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Responsive card sizing
  const isTopRanked = index < 3;
  const cardSizeClass = isTopRanked 
    ? 'w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64' 
    : 'w-40 h-40 sm:w-44 sm:h-44 lg:w-48 lg:h-48';

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 80) return 'text-emerald-500';
    if (sentiment >= 65) return 'text-green-500';
    if (sentiment >= 50) return 'text-yellow-500';
    if (sentiment >= 35) return 'text-orange-500';
    return 'text-red-500';
  };

  const getPromotionColor = (promotion: string) => {
    const colors = {
      'WWE': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
      'AEW': 'bg-blue-500/20 text-blue-300 border-blue-500/50',
      'TNA': 'bg-red-500/20 text-red-300 border-red-500/50',
      'NJPW': 'bg-purple-500/20 text-purple-300 border-purple-500/50',
    };
    return colors[promotion?.toUpperCase()] || 'bg-slate-500/20 text-slate-300 border-slate-500/50';
  };

  const wrestlerName = wrestler.wrestler_name || 'Unknown Wrestler';
  const promotion = wrestler.promotion || 'Unknown';
  const sentimentScore = wrestler.sentimentScore || 50;
  const isChampion = wrestler.isChampion || false;
  const isOnFire = wrestler.isOnFire || false;
  const championshipTitle = wrestler.championshipTitle;

  const handleCardClick = () => {
    if (onWrestlerClick) {
      onWrestlerClick(wrestler);
    }
  };

  return (
    <div 
      className={`
        relative flex flex-col items-center justify-center p-4 sm:p-6 rounded-xl 
        border-2 border-slate-700/50 bg-slate-800/30 backdrop-blur-sm
        transition-all duration-300 cursor-pointer group
        hover:scale-105 hover:shadow-lg hover:border-slate-600/70
        ${cardSizeClass}
        ${isTopRanked ? 'ring-2 ring-wrestling-electric/40 border-wrestling-electric/60' : ''}
      `}
      onClick={handleCardClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
      aria-label={`View details for ${wrestlerName}`}
    >
      {/* Rank Badge */}
      <div className={`
        absolute top-2 left-2 text-black text-xs sm:text-sm font-bold 
        px-2 sm:px-3 py-1 rounded-full
        ${isTopRanked ? 'bg-wrestling-electric' : 'bg-slate-300'}
      `}>
        #{index + 1}
      </div>

      {/* Live Data Indicator */}
      <div className="absolute top-2 right-2 bg-emerald-500/20 text-emerald-300 text-xs px-2 py-1 rounded-full flex items-center space-x-1 border border-emerald-500/40">
        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
        <span className="font-medium hidden sm:inline">LIVE</span>
      </div>

      {/* Championship Crown */}
      {isChampion && (
        <Crown className="absolute top-2 right-12 sm:right-14 h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 animate-pulse" />
      )}

      {/* Hot Topic Indicator */}
      {isOnFire && (
        <Flame className="absolute top-2 right-16 sm:right-20 h-4 w-4 sm:h-5 sm:w-5 text-orange-500 animate-bounce" />
      )}

      {/* Wrestler Image */}
      <div className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 rounded-full overflow-hidden border-2 border-slate-600/50 bg-slate-700 shadow-lg">
        <img 
          src={getWrestlerImage(wrestlerName)}
          alt={wrestlerName}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = `https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop&crop=face`;
          }}
        />
      </div>

      {/* Wrestler Name & Promotion */}
      <div className="text-center mb-3 sm:mb-4 space-y-2">
        <div className="font-bold text-sm sm:text-base leading-tight text-foreground">
          {wrestlerName}
        </div>
        <Badge variant="secondary" className={`text-xs border ${getPromotionColor(promotion)}`}>
          {promotion}
        </Badge>
      </div>

      {/* Simplified Sentiment Display */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <span className={`font-bold text-lg sm:text-xl ${getSentimentColor(sentimentScore)}`}>
            {Math.round(sentimentScore)}%
          </span>
        </div>
        <div className="text-xs text-slate-400">sentiment</div>
      </div>

      {/* Championship Title */}
      {championshipTitle && (
        <div className="absolute bottom-2 left-2 right-2">
          <div className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded border border-yellow-500/40 text-center truncate">
            {championshipTitle}
          </div>
        </div>
      )}

      {/* Click Indicator */}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <ExternalLink className="h-3 w-3 text-slate-400" />
      </div>

      {/* Enhanced Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-black/95 text-white text-xs rounded-lg opacity-100 transition-opacity duration-200 whitespace-nowrap z-30 border border-white/10 backdrop-blur-sm">
          <div className="font-semibold text-wrestling-electric">{wrestlerName}</div>
          <div className="text-xs text-slate-300">{promotion}</div>
          <div className="mt-1 text-slate-300">
            Click for detailed analytics
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/95"></div>
        </div>
      )}
    </div>
  );
};
