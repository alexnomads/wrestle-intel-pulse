
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Flame } from 'lucide-react';
import { DetectedStoryline } from '@/services/unifiedDataService';

interface StorylinesListProps {
  storylines: DetectedStoryline[];
}

export const StorylinesList = ({ storylines }: StorylinesListProps) => {
  if (storylines.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No active storylines detected
      </div>
    );
  }

  const openSource = (url?: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {storylines.map((storyline) => (
        <div key={storyline.id} className="p-4 bg-secondary/20 rounded-lg hover:bg-secondary/30 transition-colors">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="font-medium text-foreground mb-1">{storyline.title}</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {storyline.description}
              </p>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <Badge 
                variant="outline" 
                className={`${storyline.intensity > 7 ? 'border-red-400 text-red-600' : 
                             storyline.intensity > 5 ? 'border-orange-400 text-orange-600' : 
                             'border-blue-400 text-blue-600'}`}
              >
                <Flame className="h-3 w-3 mr-1" />
                {storyline.intensity}/10
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className={`text-xs ${
                storyline.platform === 'news' ? 'bg-blue-100 text-blue-800' : 
                storyline.platform === 'reddit' ? 'bg-orange-100 text-orange-800' : 
                'bg-purple-100 text-purple-800'
              }`}>
                {storyline.platform.toUpperCase()}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {storyline.wrestlers.join(', ')}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">
                {storyline.sources.length} source{storyline.sources.length !== 1 ? 's' : ''}
              </span>
              {storyline.sources[0]?.url && (
                <button
                  onClick={() => openSource(storyline.sources[0].url)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
