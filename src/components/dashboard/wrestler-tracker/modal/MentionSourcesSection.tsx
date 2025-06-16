
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Calendar, TrendingUp, TrendingDown } from 'lucide-react';

interface MentionSourcesSectionProps {
  wrestler: any;
}

export const MentionSourcesSection = ({ wrestler }: MentionSourcesSectionProps) => {
  if (!wrestler.mention_sources || wrestler.mention_sources.length === 0) return null;

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 0.7) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
    if (sentiment >= 0.6) return 'text-green-500 bg-green-500/10 border-green-500/30';
    if (sentiment >= 0.4) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
    if (sentiment >= 0.3) return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
    return 'text-red-500 bg-red-500/10 border-red-500/30';
  };

  const getSentimentIcon = (sentiment: number) => {
    return sentiment >= 0.5 ? 
      <TrendingUp className="h-3 w-3" /> : 
      <TrendingDown className="h-3 w-3" />;
  };

  const getCredibilityTierColor = (tier: number) => {
    switch (tier) {
      case 1: return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 2: return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 3: return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  const getTierLabel = (tier: number) => {
    switch (tier) {
      case 1: return 'Tier 1';
      case 2: return 'Tier 2';
      case 3: return 'Tier 3';
      default: return 'Unknown';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">News Sources Influencing Metrics</h3>
        <Badge variant="secondary">
          {wrestler.mention_sources.length} sources
        </Badge>
      </div>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {wrestler.mention_sources.map((source: any, index: number) => (
          <div key={index} className="p-4 bg-secondary/20 rounded-lg border border-border/30">
            <div className="space-y-3">
              {/* Header with source info */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm mb-1 line-clamp-2">
                    {source.title}
                  </h4>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span className="font-medium">{source.source_name}</span>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(source.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getCredibilityTierColor(source.source_credibility_tier)}`}
                  >
                    {getTierLabel(source.source_credibility_tier)}
                  </Badge>
                </div>
              </div>

              {/* Content snippet */}
              {source.content_snippet && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {source.content_snippet}
                </p>
              )}

              {/* Metrics and actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Sentiment indicator */}
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-md border text-xs ${getSentimentColor(source.sentiment_score)}`}>
                    {getSentimentIcon(source.sentiment_score)}
                    <span className="font-medium">
                      {source.sentiment_score >= 0.5 ? 'Positive' : 'Negative'}
                    </span>
                    <span className="opacity-70">
                      ({Math.round(source.sentiment_score * 100)}%)
                    </span>
                  </div>

                  {/* Impact indicator */}
                  <div className="text-xs text-muted-foreground">
                    Impact: {source.source_credibility_tier === 1 ? 'High' : 
                            source.source_credibility_tier === 2 ? 'Medium' : 'Low'}
                  </div>
                </div>

                {/* External link */}
                {source.source_url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => window.open(source.source_url, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Read
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border/50">
        <div className="text-sm text-muted-foreground">
          <strong>Analysis Summary:</strong> This wrestler's metrics are based on {wrestler.mention_sources.length} recent news mentions 
          from {[...new Set(wrestler.mention_sources.map((s: any) => s.source_name))].length} different sources.
          
          {wrestler.mention_sources.length > 0 && (
            <span className="block mt-1">
              Average sentiment: {Math.round(
                wrestler.mention_sources.reduce((sum: number, s: any) => sum + s.sentiment_score, 0) / 
                wrestler.mention_sources.length * 100
              )}% • 
              Most recent: {new Date(Math.max(...wrestler.mention_sources.map((s: any) => new Date(s.created_at).getTime()))).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
