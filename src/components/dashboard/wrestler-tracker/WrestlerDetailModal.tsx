
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, Crown, Flame, ExternalLink, Calendar, BarChart3, Activity, Target } from 'lucide-react';
import { WrestlerAnalysis } from '@/types/wrestlerAnalysis';
import { SourceLink } from '@/components/mentions/SourceLink';
import { DataQualityIndicator } from '@/components/wrestler-intelligence/DataQualityIndicator';

interface WrestlerDetailModalProps {
  wrestler: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WrestlerDetailModal = ({ wrestler, isOpen, onClose }: WrestlerDetailModalProps) => {
  if (!wrestler) return null;

  const getTrendIcon = () => {
    const change = wrestler.change24h || 0;
    if (change > 0) return <TrendingUp className="h-5 w-5 text-emerald-400" />;
    if (change < 0) return <TrendingDown className="h-5 w-5 text-red-400" />;
    return <BarChart3 className="h-5 w-5 text-blue-400" />;
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 80) return 'text-emerald-400';
    if (sentiment >= 65) return 'text-green-400';
    if (sentiment >= 50) return 'text-yellow-400';
    if (sentiment >= 35) return 'text-orange-400';
    return 'text-red-400';
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3 text-xl sm:text-2xl">
            <span className="font-bold">{wrestler.wrestler_name || wrestler.name}</span>
            {wrestler.is_champion && <Crown className="h-6 w-6 text-yellow-400" />}
            {wrestler.isOnFire && <Flame className="h-6 w-6 text-orange-500" />}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 sm:space-y-8">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <Badge variant="secondary" className={`border ${getPromotionColor(wrestler.promotion)}`}>
              {wrestler.promotion}
            </Badge>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm text-emerald-400 font-medium">ENHANCED DATA</span>
            </div>
          </div>

          {/* Data Quality Indicator */}
          {wrestler.confidence_level && wrestler.data_sources && (
            <DataQualityIndicator
              confidenceLevel={wrestler.confidence_level}
              mentionCount={wrestler.mention_count || 0}
              lastUpdated={new Date(wrestler.last_updated || Date.now())}
              dataSources={wrestler.data_sources}
            />
          )}

          {/* Championship Title */}
          {wrestler.championship_title && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="text-sm text-yellow-300 font-semibold">Current Champion</div>
              <div className="text-yellow-400 font-bold text-lg">{wrestler.championship_title}</div>
            </div>
          )}

          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-secondary/30 rounded-lg border border-border/50">
              <div className="text-2xl font-bold text-wrestling-electric">
                {wrestler.totalMentions || wrestler.mention_count || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Mentions</div>
            </div>
            
            <div className="text-center p-4 bg-secondary/30 rounded-lg border border-border/50">
              <div className={`text-2xl font-bold ${getSentimentColor(wrestler.sentimentScore || 50)}`}>
                {Math.round(wrestler.sentimentScore || 50)}%
              </div>
              <div className="text-sm text-muted-foreground">Sentiment</div>
            </div>
            
            <div className="text-center p-4 bg-secondary/30 rounded-lg border border-border/50">
              <div className="flex items-center justify-center space-x-2">
                {getTrendIcon()}
                <span className={`text-xl font-bold ${
                  wrestler.change24h > 0 ? 'text-emerald-400' :
                  wrestler.change24h < 0 ? 'text-red-400' : 'text-blue-400'
                }`}>
                  {wrestler.change24h > 0 ? '+' : ''}{wrestler.change24h || 0}%
                </span>
              </div>
              <div className="text-sm text-muted-foreground">24h Change</div>
            </div>
            
            <div className="text-center p-4 bg-secondary/30 rounded-lg border border-border/50">
              <Badge 
                variant="outline" 
                className={`text-sm font-bold ${
                  wrestler.trend === 'push' ? 'border-emerald-400 text-emerald-400' :
                  wrestler.trend === 'burial' ? 'border-red-400 text-red-400' :
                  'border-blue-400 text-blue-400'
                }`}
              >
                {(wrestler.trend || 'stable').toUpperCase()}
              </Badge>
              <div className="text-sm text-muted-foreground mt-1">Current Trend</div>
            </div>
          </div>

          <Separator />

          {/* Advanced Analytics Section */}
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

          <Separator />

          {/* Recent News */}
          {wrestler.relatedNews && wrestler.relatedNews.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="h-5 w-5 text-wrestling-electric" />
                <h3 className="text-lg font-semibold">Recent News</h3>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {wrestler.relatedNews.map((news, index) => (
                  <div key={index} className="p-3 bg-secondary/20 rounded-lg border border-border/30">
                    <div className="font-medium text-sm mb-1">{news.title}</div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span>{news.source}</span>
                      <span>{new Date(news.pubDate).toLocaleDateString()}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => window.open(news.link, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Read More
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mention Sources */}
          {wrestler.mention_sources && wrestler.mention_sources.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Mention Sources</h3>
                <Badge variant="secondary">
                  {wrestler.mention_sources.length} sources
                </Badge>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {wrestler.mention_sources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border border-border/30">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{source.title}</div>
                      <div className="text-xs text-muted-foreground">{source.source_name}</div>
                    </div>
                    <SourceLink
                      url={source.url}
                      title={source.title}
                      sourceType={source.source_type}
                      sourceName={source.source_name}
                      compact
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence */}
          {wrestler.evidence && (
            <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
              <div className="text-sm text-muted-foreground mb-1">Analysis Evidence</div>
              <div className="text-sm">{wrestler.evidence}</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
