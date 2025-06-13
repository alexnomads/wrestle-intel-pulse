
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { StorylineAnalysis } from "@/services/advancedAnalyticsService";
import { EnhancedStorylineCard } from "./EnhancedStorylineCard";

interface StorylineTabsContentProps {
  storylines: StorylineAnalysis[];
}

export const StorylineTabsContent = ({ storylines }: StorylineTabsContentProps) => {
  if (storylines.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="text-center py-8">
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            No active storylines detected
          </p>
          <p className="text-sm text-muted-foreground">
            Our AI is analyzing wrestling news and social media to detect emerging storylines. Check back soon!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {storylines.map((storyline) => (
          <EnhancedStorylineCard 
            key={storyline.id} 
            storyline={storyline}
            showTrendingBadge={storyline.intensity_score > 7}
          />
        ))}
      </div>
    </div>
  );
};
