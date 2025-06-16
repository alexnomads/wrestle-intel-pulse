
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Crown, Flame, BarChart3, Target } from "lucide-react";
import { DataQualityIndicator } from './DataQualityIndicator';

interface WrestlerMetrics {
  push_score: number;
  burial_score: number;
  momentum_score: number;
  popularity_score: number;
  confidence_level: 'high' | 'medium' | 'low';
  mention_count: number;
  data_sources: {
    total_mentions: number;
    tier_1_mentions: number;
    tier_2_mentions: number;
    tier_3_mentions: number;
    hours_since_last_mention: number;
    source_breakdown: Record<string, number>;
  };
  last_updated: string;
}

interface EnhancedWrestlerCardProps {
  wrestler: {
    id: string;
    wrestler_name?: string;
    name?: string;
    promotion?: string;
    is_champion?: boolean;
    championship_title?: string;
    brand?: string;
  };
  metrics: WrestlerMetrics;
  onWrestlerClick: (wrestler: any) => void;
  showTrend?: boolean;
}

export const EnhancedWrestlerCard = ({
  wrestler,
  metrics,
  onWrestlerClick,
  showTrend = true
}: EnhancedWrestlerCardProps) => {
  const wrestlerName = wrestler.wrestler_name || wrestler.name || 'Unknown Wrestler';
  
  const getScoreColor = (score: number, type: 'push' | 'burial' | 'momentum' | 'popularity') => {
    if (type === 'burial') {
      if (score >= 70) return 'text-red-500';
      if (score >= 40) return 'text-orange-500';
      return 'text-green-500';
    }
    
    if (score >= 70) return 'text-emerald-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getPromotionColor = (promotion: string) => {
    const colors = {
      'WWE': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
      'AEW': 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      'TNA': 'bg-red-500/20 text-red-300 border-red-500/40',
      'NJPW': 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    };
    return colors[promotion?.toUpperCase()] || 'bg-slate-500/20 text-slate-300 border-slate-500/40';
  };

  const isOnFire = metrics.push_score >= 70 && metrics.momentum_score >= 70;

  return (
    <Card 
      className="glass-card hover:border-wrestling-electric/40 transition-all duration-200 cursor-pointer group"
      onClick={() => onWrestlerClick({ ...wrestler, ...metrics })}
    >
      <CardContent className="p-4 space-y-4">
        {/* Header with wrestler name prominently displayed */}
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-lg group-hover:text-wrestling-electric transition-colors">
                {wrestlerName}
              </h3>
              {wrestler.is_champion && <Crown className="h-4 w-4 text-yellow-400" />}
              {isOnFire && <Flame className="h-4 w-4 text-orange-500" />}
            </div>
            
            <div className="flex items-center space-x-2">
              {wrestler.promotion && (
                <Badge variant="outline" className={`text-xs ${getPromotionColor(wrestler.promotion)}`}>
                  {wrestler.promotion}
                </Badge>
              )}
              {wrestler.brand && (
                <Badge variant="secondary" className="text-xs">
                  {wrestler.brand}
                </Badge>
              )}
            </div>

            {wrestler.championship_title && (
              <div className="text-xs text-yellow-400 font-medium">
                {wrestler.championship_title}
              </div>
            )}
          </div>

          {/* Only show data quality indicator for high confidence */}
          {metrics.confidence_level === 'high' && (
            <DataQualityIndicator
              confidenceLevel={metrics.confidence_level}
              mentionCount={metrics.mention_count}
              lastUpdated={new Date(metrics.last_updated)}
              dataSources={metrics.data_sources}
              compact
            />
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-lg border border-emerald-500/20">
            <div className="flex items-center space-x-2 mb-1">
              <Target className="h-3 w-3 text-emerald-400" />
              <div className="text-xs text-emerald-300 font-medium">Push</div>
            </div>
            <div className={`text-lg font-bold ${getScoreColor(metrics.push_score, 'push')}`}>
              {Math.round(metrics.push_score)}
            </div>
          </div>

          <div className="p-3 bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-lg border border-red-500/20">
            <div className="flex items-center space-x-2 mb-1">
              <TrendingDown className="h-3 w-3 text-red-400" />
              <div className="text-xs text-red-300 font-medium">Burial</div>
            </div>
            <div className={`text-lg font-bold ${getScoreColor(metrics.burial_score, 'burial')}`}>
              {Math.round(metrics.burial_score)}
            </div>
          </div>

          <div className="p-3 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-lg border border-blue-500/20">
            <div className="flex items-center space-x-2 mb-1">
              <BarChart3 className="h-3 w-3 text-blue-400" />
              <div className="text-xs text-blue-300 font-medium">Momentum</div>
            </div>
            <div className={`text-lg font-bold ${getScoreColor(metrics.momentum_score, 'momentum')}`}>
              {metrics.momentum_score}
            </div>
          </div>

          <div className="p-3 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-lg border border-purple-500/20">
            <div className="flex items-center space-x-2 mb-1">
              <TrendingUp className="h-3 w-3 text-purple-400" />
              <div className="text-xs text-purple-300 font-medium">Popularity</div>
            </div>
            <div className={`text-lg font-bold ${getScoreColor(metrics.popularity_score, 'popularity')}`}>
              {metrics.popularity_score}
            </div>
          </div>
        </div>

        {/* Quick Stats - Only show mention count */}
        <div className="flex items-center justify-center text-xs text-muted-foreground pt-2 border-t border-border/50">
          <span className="font-medium">{metrics.mention_count} mentions</span>
        </div>
      </CardContent>
    </Card>
  );
};
