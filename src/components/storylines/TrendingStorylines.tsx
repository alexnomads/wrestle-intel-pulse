import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock } from "lucide-react";
import { StorylineAnalysis } from "@/services/advancedAnalyticsService";
import { EnhancedStorylineCard } from "./EnhancedStorylineCard";

interface TrendingStorylinesProps {
  storylines: StorylineAnalysis[];
}

export const TrendingStorylines = ({ storylines }: TrendingStorylinesProps) => {
  if (storylines.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="text-center py-8">
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No trending storylines detected</p>
          <p className="text-sm text-muted-foreground">
            Trending storylines have high intensity scores (7+) and recent activity
          </p>
        </CardContent>
      </Card>
    );
  }

  // Show featured trending storyline at top
  const featuredStoryline = storylines[0];
  const otherTrending = storylines.slice(1);

  return (
    <div className="space-y-6">
      {/* Featured Trending Storyline */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-wrestling-electric" />
          <h3 className="text-xl font-semibold">Featured Trending</h3>
          <Badge className="bg-red-100 text-red-800">
            {featuredStoryline.intensity_score.toFixed(1)} intensity
          </Badge>
        </div>
        <EnhancedStorylineCard storyline={featuredStoryline} showTrendingBadge={true} />
      </div>

      {/* Other Trending Storylines */}
      {otherTrending.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-medium">Also Trending</h3>
          </div>
          <div className="grid gap-4">
            {otherTrending.map((storyline) => (
              <Card key={storyline.id} className="glass-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{storyline.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {storyline.intensity_score.toFixed(1)} intensity
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {storyline.promotion}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-3">{storyline.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {storyline.participants.slice(0, 3).map((participant, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {participant}
                        </Badge>
                      ))}
                      {storyline.participants.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{storyline.participants.length - 3} more
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {storyline.source_articles.length} sources
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
