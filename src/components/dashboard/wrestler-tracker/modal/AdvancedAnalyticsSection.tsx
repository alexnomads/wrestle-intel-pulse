
import React from 'react';
import { Activity, Target, TrendingDown, TrendingUp, BarChart3 } from 'lucide-react';

interface AdvancedAnalyticsSectionProps {
  wrestler: any;
}

export const AdvancedAnalyticsSection = ({ wrestler }: AdvancedAnalyticsSectionProps) => {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Activity className="h-5 w-5 text-wrestling-electric" />
        <h3 className="text-lg font-semibold">Advanced Analytics</h3>
      </div>

      {/* Advanced Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-lg border border-emerald-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="h-4 w-4 text-emerald-400" />
            <div className="text-sm text-emerald-300 font-medium">Push Score</div>
          </div>
          <div className={`text-2xl font-bold ${getScoreColor(wrestler.pushScore || wrestler.push_score || 0, 'push')}`}>
            {Math.round(wrestler.pushScore || wrestler.push_score || 0)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Booking momentum indicator
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-lg border border-red-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingDown className="h-4 w-4 text-red-400" />
            <div className="text-sm text-red-300 font-medium">Burial Score</div>
          </div>
          <div className={`text-2xl font-bold ${getScoreColor(wrestler.burialScore || wrestler.burial_score || 0, 'burial')}`}>
            {Math.round(wrestler.burialScore || wrestler.burial_score || 0)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Negative booking indicator
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-lg border border-blue-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="h-4 w-4 text-blue-400" />
            <div className="text-sm text-blue-300 font-medium">Momentum</div>
          </div>
          <div className={`text-2xl font-bold ${getScoreColor(wrestler.momentumScore || wrestler.momentum_score || 0, 'momentum')}`}>
            {wrestler.momentumScore || wrestler.momentum_score || 0}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Current trajectory
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-lg border border-purple-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-4 w-4 text-purple-400" />
            <div className="text-sm text-purple-300 font-medium">Popularity</div>
          </div>
          <div className={`text-2xl font-bold ${getScoreColor(wrestler.popularityScore || wrestler.popularity_score || 0, 'popularity')}`}>
            {wrestler.popularityScore || wrestler.popularity_score || 0}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Fan engagement level
          </div>
        </div>
      </div>

      {/* Metrics Explanation */}
      <div className="p-4 bg-muted/20 rounded-lg border border-border/50">
        <h4 className="text-sm font-semibold mb-2 text-wrestling-electric">Enhanced Analytics Explanation</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div>
            <span className="font-medium text-emerald-400">Push Score:</span> Source-weighted analysis of positive booking mentions and storyline prominence
          </div>
          <div>
            <span className="font-medium text-red-400">Burial Score:</span> Wrestling-specific indicators of negative booking patterns or decreased screen time
          </div>
          <div>
            <span className="font-medium text-blue-400">Momentum:</span> Historical trajectory based on recent mention patterns and trend analysis
          </div>
          <div>
            <span className="font-medium text-purple-400">Popularity:</span> Fan engagement calculated from discussion volume and sentiment
          </div>
        </div>
      </div>
    </div>
  );
};
