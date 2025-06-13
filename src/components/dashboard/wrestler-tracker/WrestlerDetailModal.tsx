
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, Crown, Flame, ExternalLink, Calendar, BarChart3 } from 'lucide-react';
import { WrestlerAnalysis } from '@/types/wrestlerAnalysis';
import { SourceLink } from '@/components/mentions/SourceLink';

interface WrestlerDetailModalProps {
  wrestler: WrestlerAnalysis | null;
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <span className="text-xl font-bold">{wrestler.wrestler_name}</span>
            {wrestler.isChampion && <Crown className="h-6 w-6 text-yellow-400" />}
            {wrestler.isOnFire && <Flame className="h-6 w-6 text-orange-500" />}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className={`border ${getPromotionColor(wrestler.promotion)}`}>
              {wrestler.promotion}
            </Badge>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm text-emerald-400 font-medium">LIVE DATA</span>
            </div>
          </div>

          {/* Championship Title */}
          {wrestler.championshipTitle && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="text-sm text-yellow-300 font-semibold">Current Champion</div>
              <div className="text-yellow-400 font-bold">{wrestler.championshipTitle}</div>
            </div>
          )}

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-secondary/30 rounded-lg">
              <div className="text-2xl font-bold text-wrestling-electric">
                {wrestler.totalMentions}
              </div>
              <div className="text-sm text-muted-foreground">Total Mentions</div>
            </div>
            
            <div className="text-center p-4 bg-secondary/30 rounded-lg">
              <div className={`text-2xl font-bold ${getSentimentColor(wrestler.sentimentScore)}`}>
                {Math.round(wrestler.sentimentScore)}%
              </div>
              <div className="text-sm text-muted-foreground">Sentiment</div>
            </div>
            
            <div className="text-center p-4 bg-secondary/30 rounded-lg">
              <div className="flex items-center justify-center space-x-2">
                {getTrendIcon()}
                <span className={`text-xl font-bold ${
                  wrestler.change24h > 0 ? 'text-emerald-400' :
                  wrestler.change24h < 0 ? 'text-red-400' : 'text-blue-400'
                }`}>
                  {wrestler.change24h > 0 ? '+' : ''}{wrestler.change24h}%
                </span>
              </div>
              <div className="text-sm text-muted-foreground">24h Change</div>
            </div>
            
            <div className="text-center p-4 bg-secondary/30 rounded-lg">
              <Badge 
                variant="outline" 
                className={`text-sm font-bold ${
                  wrestler.trend === 'push' ? 'border-emerald-400 text-emerald-400' :
                  wrestler.trend === 'burial' ? 'border-red-400 text-red-400' :
                  'border-blue-400 text-blue-400'
                }`}
              >
                {wrestler.trend.toUpperCase()}
              </Badge>
              <div className="text-sm text-muted-foreground mt-1">Current Trend</div>
            </div>
          </div>

          <Separator />

          {/* Advanced Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-secondary/20 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Push Score</div>
              <div className="text-xl font-bold text-emerald-400">
                {Math.round(wrestler.pushScore)}
              </div>
            </div>
            <div className="p-4 bg-secondary/20 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Burial Score</div>
              <div className="text-xl font-bold text-red-400">
                {Math.round(wrestler.burialScore)}
              </div>
            </div>
            <div className="p-4 bg-secondary/20 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Momentum</div>
              <div className="text-xl font-bold text-wrestling-electric">
                {wrestler.momentumScore}
              </div>
            </div>
            <div className="p-4 bg-secondary/20 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Popularity</div>
              <div className="text-xl font-bold text-blue-400">
                {wrestler.popularityScore}
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
              <div className="space-y-3">
                {wrestler.relatedNews.map((news, index) => (
                  <div key={index} className="p-3 bg-secondary/20 rounded-lg">
                    <div className="font-medium text-sm mb-1">{news.title}</div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{news.source}</span>
                      <span>{new Date(news.pubDate).toLocaleDateString()}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-6 px-2 text-xs"
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
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {wrestler.mention_sources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-secondary/20 rounded">
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
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Analysis Evidence</div>
              <div className="text-sm">{wrestler.evidence}</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
