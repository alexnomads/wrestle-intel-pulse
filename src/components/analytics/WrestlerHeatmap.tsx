
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Crown } from 'lucide-react';
import { MentionSourceIndicator } from '@/components/mentions/MentionSourceIndicator';
import { DetailedMentionsModal } from '@/components/mentions/DetailedMentionsModal';

interface WrestlerMention {
  id: string;
  wrestler_name: string;
  mentions: number;
  sentiment: number;
  promotion: string;
  change_24h?: number;
  mention_sources?: Array<{
    id: string;
    wrestler_name: string;
    source_type: 'news' | 'reddit';
    source_name: string;
    title: string;
    url: string;
    content_snippet: string;
    timestamp: Date;
    sentiment_score: number;
  }>;
  source_breakdown?: {
    news_count: number;
    reddit_count: number;
    total_sources: number;
  };
}

interface WrestlerHeatmapProps {
  wrestlerMentions: WrestlerMention[];
}

export const WrestlerHeatmap = ({ wrestlerMentions }: WrestlerHeatmapProps) => {
  const [selectedWrestler, setSelectedWrestler] = useState<WrestlerMention | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Filter out invalid wrestler data and ensure required properties exist
  const validWrestlers = wrestlerMentions.filter(wrestler => 
    wrestler && 
    wrestler.wrestler_name && 
    typeof wrestler.wrestler_name === 'string' &&
    typeof wrestler.mentions === 'number'
  );

  const topWrestlers = validWrestlers
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 8);

  const maxMentions = Math.max(...topWrestlers.map(w => w.mentions), 1);

  const getHeatmapSize = (mentions: number, index: number) => {
    const baseSize = 100;
    const maxSize = 200;
    const sizeMultiplier = mentions / maxMentions;
    return Math.max(baseSize, baseSize + (maxSize - baseSize) * sizeMultiplier);
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.7) return 'bg-green-500';
    if (sentiment > 0.4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTrendIcon = (change: number) => {
    if (change > 10) return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (change < -10) return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
    return null;
  };

  const handleWrestlerClick = (wrestler: WrestlerMention) => {
    setSelectedWrestler(wrestler);
    setShowModal(true);
  };

  if (topWrestlers.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-wrestling-electric" />
            <span>Top Mentioned Wrestlers</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No wrestler mentions found</p>
            <p className="text-sm">Check back later for updated data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {topWrestlers.map((wrestler, index) => {
          const size = getHeatmapSize(wrestler.mentions, index);
          const wrestlerName = wrestler.wrestler_name || 'Unknown Wrestler';
          const isChampion = wrestlerName.toLowerCase().includes('champion') || 
                           wrestlerName.toLowerCase().includes('title');
          
          return (
            <div
              key={wrestler.id || `wrestler-${index}`}
              className="relative group cursor-pointer"
              onClick={() => handleWrestlerClick(wrestler)}
            >
              <div
                className={`
                  relative rounded-lg p-4 transition-all duration-300 hover:scale-105
                  ${getSentimentColor(wrestler.sentiment || 0.5)} bg-opacity-20 border
                  ${isChampion ? 'border-wrestling-gold ring-2 ring-wrestling-gold/30' : 'border-muted'}
                `}
                style={{ minHeight: `${Math.max(120, size * 0.6)}px` }}
              >
                {/* Champion indicator */}
                {isChampion && (
                  <Crown className="absolute top-2 right-2 h-4 w-4 text-wrestling-gold" />
                )}
                
                {/* Trend indicator */}
                {wrestler.change_24h && (
                  <div className="absolute top-2 left-2">
                    {getTrendIcon(wrestler.change_24h)}
                  </div>
                )}

                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                      {wrestlerName}
                    </h3>
                    <Badge variant="secondary" className="text-xs mb-2">
                      {wrestler.promotion || 'Unknown'}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {/* Mention Source Indicator */}
                    {wrestler.source_breakdown ? (
                      <MentionSourceIndicator
                        sourceBreakdown={wrestler.source_breakdown}
                        showDetails={false}
                      />
                    ) : (
                      <div className="flex items-center space-x-1">
                        <span className="text-lg font-bold text-wrestling-electric">
                          {wrestler.mentions || 0}
                        </span>
                        <span className="text-xs text-muted-foreground">mentions</span>
                      </div>
                    )}

                    {/* Sentiment indicator */}
                    <div className="w-full bg-secondary rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${getSentimentColor(wrestler.sentiment || 0.5)}`}
                        style={{ width: `${(wrestler.sentiment || 0.5) * 100}%` }}
                      />
                    </div>

                    {wrestler.change_24h && (
                      <div className="text-xs text-muted-foreground">
                        24h: {wrestler.change_24h > 0 ? '+' : ''}{wrestler.change_24h}%
                      </div>
                    )}
                  </div>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 rounded-lg transition-all duration-300 flex items-center justify-center">
                  <span className="text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50 px-2 py-1 rounded">
                    Click for details
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Mentions Modal */}
      {showModal && selectedWrestler && (
        <DetailedMentionsModal
          wrestler={{
            id: selectedWrestler.id,
            wrestler_name: selectedWrestler.wrestler_name,
            promotion: selectedWrestler.promotion,
            totalMentions: selectedWrestler.mentions,
            mention_sources: selectedWrestler.mention_sources
          }}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};
