
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Flame } from "lucide-react";
import { StorylineAnalysis } from "@/services/advancedAnalyticsService";
import { TrendingStorylines } from "./TrendingStorylines";
import { EnhancedStorylineCard } from "./EnhancedStorylineCard";

interface StorylineTabsContentProps {
  trendingStorylines: StorylineAnalysis[];
  hotStorylines: StorylineAnalysis[];
  filteredStorylines: StorylineAnalysis[];
}

export const StorylineTabsContent = ({
  trendingStorylines,
  hotStorylines,
  filteredStorylines
}: StorylineTabsContentProps) => {
  return (
    <>
      <TabsContent value="trending" className="space-y-6">
        <TrendingStorylines storylines={trendingStorylines} />
      </TabsContent>

      <TabsContent value="hot" className="space-y-6">
        {hotStorylines.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="text-center py-8">
              <Flame className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hot storylines detected</p>
              <p className="text-sm text-muted-foreground">
                Hot storylines have high fan reception and are actively building
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {hotStorylines.map((storyline) => (
              <EnhancedStorylineCard 
                key={storyline.id} 
                storyline={storyline}
                showTrendingBadge={true}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="all" className="space-y-6">
        {filteredStorylines.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No active storylines found with current filters
              </p>
              <p className="text-sm text-muted-foreground">
                Try adjusting the promotion or intensity filters, or check back later as we continuously monitor wrestling news and social media
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredStorylines.map((storyline) => (
              <EnhancedStorylineCard 
                key={storyline.id} 
                storyline={storyline}
                showTrendingBadge={false}
              />
            ))}
          </div>
        )}
      </TabsContent>
    </>
  );
};
