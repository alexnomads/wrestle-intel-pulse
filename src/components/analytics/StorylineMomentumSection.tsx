
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap } from 'lucide-react';
import { StorylineMomentum } from '@/services/predictiveAnalyticsService';
import { SourceLink } from '@/components/mentions/SourceLink';

interface StorylineMomentumSectionProps {
  storylines: StorylineMomentum[];
}

export const StorylineMomentumSection = ({ storylines }: StorylineMomentumSectionProps) => {
  const getMomentumColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Filter sources to only include valid external URLs
  const getValidSources = (sources: any[]) => {
    return sources.filter(source => 
      source.url && 
      source.url !== '#' && 
      source.url.startsWith('http') && 
      !source.url.includes('lovableproject.com')
    );
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-blue-500" />
          <span>Storyline Momentum Tracking</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {storylines.map((storyline) => {
            const validSources = getValidSources(storyline.related_sources || []);
            
            return (
              <div
                key={storyline.id}
                className="p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-lg">{storyline.storyline_title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {storyline.wrestlers_involved.join(' • ')}
                    </p>
                  </div>
                  <Badge
                    className={`${
                      storyline.engagement_trend === 'increasing' ? 'bg-green-100 text-green-800' :
                      storyline.engagement_trend === 'stable' ? 'bg-blue-100 text-blue-800' :
                      'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {storyline.engagement_trend}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getMomentumColor(storyline.momentum_score)}`}>
                      {storyline.momentum_score}
                    </div>
                    <div className="text-xs text-muted-foreground">Momentum</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {validSources.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Valid Sources</div>
                  </div>
                </div>

                {storyline.key_events && storyline.key_events.length > 0 && (
                  <div className="mb-3">
                    <h5 className="text-sm font-medium mb-1">Key Events:</h5>
                    <div className="flex flex-wrap gap-1">
                      {storyline.key_events.map((event, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {validSources.length > 0 && (
                  <div className="mb-3">
                    <h5 className="text-sm font-medium mb-2">Related Sources:</h5>
                    <div className="flex flex-wrap gap-2">
                      {validSources.slice(0, 5).map((source, index) => (
                        <SourceLink
                          key={index}
                          url={source.url}
                          title={source.title}
                          sourceType={source.source_type}
                          sourceName={source.source_name}
                          compact={false}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {validSources.length === 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-muted-foreground italic">
                      No external sources available for this storyline
                    </p>
                  </div>
                )}

                <div className="mt-3">
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        storyline.engagement_trend === 'increasing' ? 'bg-green-500' :
                        storyline.engagement_trend === 'stable' ? 'bg-blue-500' :
                        'bg-orange-500'
                      }`}
                      style={{ width: `${storyline.momentum_score}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
