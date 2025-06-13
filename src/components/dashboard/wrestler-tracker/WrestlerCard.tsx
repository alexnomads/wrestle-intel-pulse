
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Flame, Crown, ExternalLink, Info } from 'lucide-react';
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
  
  // Calculate card size based on mentions and position
  const baseSize = Math.max(140, Math.min(220, (wrestler.totalMentions || 1) * 12));
  const sizeMultiplier = index < 3 ? 1.3 : index < 6 ? 1.1 : 0.9;
  const cardSize = baseSize * sizeMultiplier;

  const getTrendIcon = () => {
    const change = wrestler.change24h || 0;
    if (change > 0) return <TrendingUp className="h-4 w-4 text-emerald-400" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-400" />;
    return null;
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'push': return 'border-emerald-400 bg-emerald-500/15 shadow-emerald-500/20';
      case 'burial': return 'border-red-400 bg-red-500/15 shadow-red-500/20';
      case 'stable': return 'border-blue-400 bg-blue-500/15 shadow-blue-500/20';
      default: return 'border-slate-400 bg-slate-500/15 shadow-slate-500/20';
    }
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 80) return 'text-emerald-400 font-bold';
    if (sentiment >= 65) return 'text-green-400 font-semibold';
    if (sentiment >= 50) return 'text-yellow-400 font-medium';
    if (sentiment >= 35) return 'text-orange-400 font-medium';
    return 'text-red-400 font-semibold';
  };

  const getPromotionColor = (promotion: string) => {
    const colors = {
      'WWE': 'bg-yellow-500/25 text-yellow-300 border-yellow-500/40',
      'AEW': 'bg-blue-500/25 text-blue-300 border-blue-500/40',
      'TNA': 'bg-red-500/25 text-red-300 border-red-500/40',
      'NJPW': 'bg-purple-500/25 text-purple-300 border-purple-500/40',
    };
    return colors[promotion?.toUpperCase()] || 'bg-slate-500/25 text-slate-300 border-slate-500/40';
  };

  const wrestlerName = wrestler.wrestler_name || 'Unknown Wrestler';
  const promotion = wrestler.promotion || 'Unknown';
  const totalMentions = wrestler.totalMentions || 0;
  const sentimentScore = wrestler.sentimentScore || 50;
  const change24h = wrestler.change24h || 0;
  const isChampion = wrestler.isChampion || false;
  const isOnFire = wrestler.isOnFire || false;
  const championshipTitle = wrestler.championshipTitle;
  const trend = wrestler.trend || 'stable';

  const handleCardClick = () => {
    if (onWrestlerClick) {
      onWrestlerClick(wrestler);
    }
  };

  return (
    <div 
      className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer group
        ${getTrendColor(trend)} 
        hover:scale-105 hover:shadow-lg backdrop-blur-sm
        ${index < 3 ? 'ring-2 ring-wrestling-electric/30' : ''}
      `}
      style={{ 
        width: `${cardSize}px`, 
        height: `${cardSize}px`,
        minWidth: '140px',
        minHeight: '140px'
      }}
      onClick={handleCardClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
      aria-label={`View details for ${wrestlerName}`}
    >
      {/* Rank Badge - Enhanced */}
      <div className={`absolute top-2 left-2 text-black text-sm font-bold px-3 py-1 rounded-full
        ${index < 3 ? 'bg-wrestling-electric' : 'bg-slate-300'}
      `}>
        #{index + 1}
      </div>

      {/* Live Data Indicator - Enhanced */}
      <div className="absolute top-2 right-2 bg-emerald-500/25 text-emerald-300 text-xs px-2 py-1 rounded-full flex items-center space-x-1 border border-emerald-500/30">
        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
        <span className="font-medium">LIVE</span>
      </div>

      {/* Championship Crown */}
      {isChampion && (
        <Crown className="absolute top-2 right-14 h-5 w-5 text-yellow-400 animate-pulse" />
      )}

      {/* Hot Topic Indicator */}
      {isOnFire && (
        <Flame className="absolute top-2 right-20 h-5 w-5 text-orange-500 animate-bounce" />
      )}

      {/* Wrestler Image - Enhanced */}
      <div className="w-16 h-16 mb-3 rounded-full overflow-hidden border-3 border-border/50 bg-muted shadow-lg">
        <img 
          src={getWrestlerImage(wrestlerName)}
          alt={wrestlerName}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = `https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop&crop=face`;
          }}
        />
      </div>

      {/* Wrestler Name - Enhanced */}
      <div className="text-center mb-3">
        <div className="font-bold text-sm leading-tight text-foreground mb-1">
          {wrestlerName}
        </div>
        <Badge variant="secondary" className={`text-xs border ${getPromotionColor(promotion)}`}>
          {promotion}
        </Badge>
      </div>

      {/* Metrics - Enhanced Layout */}
      <div className="text-center space-y-2 w-full">
        <div className="flex items-center justify-center space-x-2 text-sm">
          <span className="font-bold text-wrestling-electric text-lg">
            {totalMentions}
          </span>
          <span className="text-muted-foreground text-xs">mentions</span>
        </div>
        
        <div className="flex items-center justify-center space-x-2 text-sm">
          <span className={`font-bold text-lg ${getSentimentColor(sentimentScore)}`}>
            {Math.round(sentimentScore)}%
          </span>
          <span className="text-muted-foreground text-xs">sentiment</span>
        </div>

        {/* 24h Change - Enhanced */}
        {change24h !== 0 && (
          <div className="flex items-center justify-center space-x-1 text-sm">
            {getTrendIcon()}
            <span className={`font-semibold ${
              change24h > 0 ? 'text-emerald-400' :
              change24h < 0 ? 'text-red-400' : 'text-slate-400'
            }`}>
              {change24h > 0 ? '+' : ''}{change24h}%
            </span>
          </div>
        )}

        {/* Trend Badge - Enhanced */}
        <Badge 
          variant="outline" 
          className={`text-xs font-semibold ${
            trend === 'push' ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10' :
            trend === 'burial' ? 'border-red-400 text-red-400 bg-red-500/10' :
            'border-blue-400 text-blue-400 bg-blue-500/10'
          }`}
        >
          {trend.toUpperCase()}
        </Badge>
      </div>

      {/* Championship Title */}
      {championshipTitle && (
        <div className="absolute bottom-2 left-2 right-2">
          <div className="text-xs bg-yellow-500/25 text-yellow-300 px-2 py-1 rounded border border-yellow-500/30 text-center truncate">
            {championshipTitle}
          </div>
        </div>
      )}

      {/* Click Indicator */}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <ExternalLink className="h-3 w-3 text-muted-foreground" />
      </div>

      {/* Enhanced Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-3 bg-black/90 text-white text-sm rounded-lg opacity-100 transition-opacity duration-200 whitespace-nowrap z-20 border border-white/10 backdrop-blur-sm">
          <div className="font-semibold text-wrestling-electric">{wrestlerName}</div>
          <div className="text-xs text-slate-300">{promotion}</div>
          <div className="mt-1 space-y-1">
            <div className="flex justify-between space-x-4">
              <span>Mentions:</span>
              <span className="font-medium">{totalMentions}</span>
            </div>
            <div className="flex justify-between space-x-4">
              <span>Sentiment:</span>
              <span className="font-medium">{Math.round(sentimentScore)}%</span>
            </div>
            <div className="flex justify-between space-x-4">
              <span>Trend:</span>
              <span className="font-medium capitalize">{trend}</span>
            </div>
            {wrestler.mention_sources && wrestler.mention_sources.length > 0 && (
              <div className="flex justify-between space-x-4">
                <span>Sources:</span>
                <span className="font-medium">{wrestler.mention_sources.length}</span>
              </div>
            )}
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
        </div>
      )}
    </div>
  );
};
