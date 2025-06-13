
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, ExternalLink, TrendingUp, Flame } from "lucide-react";
import { useState } from "react";
import { StorylineAnalysis } from "@/services/advancedAnalyticsService";

interface EnhancedStorylineCardProps {
  storyline: StorylineAnalysis;
  showTrendingBadge?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'building': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'climax': return 'bg-wrestling-electric/20 text-wrestling-electric border-wrestling-electric/30';
    case 'cooling': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'concluded': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    default: return 'bg-secondary text-secondary-foreground border-border';
  }
};

export const EnhancedStorylineCard = ({ storyline, showTrendingBadge = false }: EnhancedStorylineCardProps) => {
  const [showDetails, setShowDetails] = useState(false);

  const generateAnalysis = () => {
    const sourceCount = storyline.source_articles.length;
    const intensityLevel = storyline.intensity_score > 7 ? 'high' : storyline.intensity_score > 4 ? 'moderate' : 'low';
    const receptionLevel = storyline.fan_reception_score > 7 ? 'very positive' : storyline.fan_reception_score > 5 ? 'positive' : 'mixed';
    
    return `This storyline has ${intensityLevel} intensity with ${receptionLevel} fan reception. Based on ${sourceCount} news articles, it appears to be ${storyline.status === 'building' ? 'gaining momentum' : storyline.status === 'climax' ? 'reaching its peak' : 'winding down'}.`;
  };

  return (
    <Card className="glass-card hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <span>{storyline.title}</span>
            {showTrendingBadge && storyline.intensity_score > 7 && (
              <Badge className="bg-red-100 text-red-800">
                <TrendingUp className="h-3 w-3 mr-1" />
                Trending
              </Badge>
            )}
            {storyline.fan_reception_score > 8 && (
              <Badge className="bg-orange-100 text-orange-800">
                <Flame className="h-3 w-3 mr-1" />
                Hot
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(storyline.status)}>
              {storyline.status}
            </Badge>
            <Badge variant="outline">{storyline.promotion}</Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-muted-foreground mb-4">{storyline.description}</p>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-wrestling-electric">
              {storyline.intensity_score.toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Intensity</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {storyline.fan_reception_score.toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Fan Reception</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {storyline.source_articles.length}
            </div>
            <div className="text-sm text-muted-foreground">Sources</div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-3 mb-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Intensity</span>
              <span>{storyline.intensity_score.toFixed(1)}/10</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-wrestling-electric to-wrestling-purple transition-all duration-500"
                style={{ width: `${storyline.intensity_score * 10}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Fan Reception</span>
              <span>{storyline.fan_reception_score.toFixed(1)}/10</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${storyline.fan_reception_score * 10}%` }}
              />
            </div>
          </div>
        </div>

        {/* Participants */}
        <div className="space-y-2 mb-4">
          <h4 className="font-medium text-foreground">Participants:</h4>
          <div className="flex flex-wrap gap-2">
            {storyline.participants.map((participant, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {participant}
              </Badge>
            ))}
          </div>
        </div>

        {/* Keywords */}
        {storyline.keywords.length > 0 && (
          <div className="space-y-2 mb-4">
            <h4 className="font-medium text-foreground">Key Themes:</h4>
            <div className="flex flex-wrap gap-2">
              {storyline.keywords.slice(0, 6).map((keyword, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Analysis Toggle */}
        <div className="border-t border-secondary/50 pt-4">
          <Button
            variant="ghost"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center space-x-2 w-full justify-between"
          >
            <span className="font-medium">AI Analysis</span>
            {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          
          {showDetails && (
            <div className="mt-3 p-3 bg-secondary/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-3">
                {generateAnalysis()}
              </p>
              
              {storyline.source_articles.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-medium text-sm">Recent Coverage:</h5>
                  {storyline.source_articles.slice(0, 3).map((article, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span className="truncate flex-1 mr-2">{article.title}</span>
                      {article.link && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(article.link, '_blank')}
                          className="h-6 w-6 p-0"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
