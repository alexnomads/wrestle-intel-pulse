
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { useState } from "react";
import { StorylineAnalysis } from "@/services/advancedAnalyticsService";

interface StorylineCardProps {
  storyline: StorylineAnalysis;
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

export const StorylineCard = ({ storyline }: StorylineCardProps) => {
  const [showRecap, setShowRecap] = useState(false);

  // Generate a recap from the source articles
  const generateRecap = () => {
    if (storyline.source_articles.length === 0) {
      return "No recent news coverage available for this storyline.";
    }

    const recentArticles = storyline.source_articles.slice(0, 3);
    const headlines = recentArticles.map(article => article.title).join(". ");
    
    return `Recent developments: ${headlines}. This storyline has been featured in ${storyline.source_articles.length} news articles, indicating ${storyline.intensity_score > 7 ? 'high' : storyline.intensity_score > 4 ? 'moderate' : 'low'} intensity coverage.`;
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {storyline.title}
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
            <div className="text-sm text-muted-foreground">Articles</div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span>Intensity Score</span>
            <span>{storyline.intensity_score.toFixed(1)}/10</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="h-2 rounded-full bg-gradient-to-r from-wrestling-electric to-wrestling-purple transition-all duration-500"
              style={{ width: `${storyline.intensity_score * 10}%` }}
            />
          </div>
        </div>

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

        {storyline.keywords.length > 0 && (
          <div className="space-y-2 mb-4">
            <h4 className="font-medium text-foreground">Key Themes:</h4>
            <div className="flex flex-wrap gap-2">
              {storyline.keywords.slice(0, 5).map((keyword, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Storyline Recap Section */}
        <div className="border-t border-secondary/50 pt-4">
          <Button
            variant="ghost"
            onClick={() => setShowRecap(!showRecap)}
            className="flex items-center space-x-2 w-full justify-between"
          >
            <span className="font-medium">Why is this trending?</span>
            {showRecap ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          
          {showRecap && (
            <div className="mt-3 p-3 bg-secondary/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-3">
                {generateRecap()}
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
