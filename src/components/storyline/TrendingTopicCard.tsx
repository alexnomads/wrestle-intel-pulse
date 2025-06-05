
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import { TrendingTopic } from "@/services/advancedAnalyticsService";

interface TrendingTopicCardProps {
  topic: TrendingTopic;
}

export const TrendingTopicCard = ({ topic }: TrendingTopicCardProps) => {
  return (
    <Card className="glass-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-foreground">{topic.title}</h3>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-green-400">+{topic.growth_rate.toFixed(0)}%</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-wrestling-electric">{topic.mentions}</div>
            <div className="text-sm text-muted-foreground">Mentions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {Math.round(topic.sentiment * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Sentiment</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{topic.growth_rate.toFixed(0)}</div>
            <div className="text-sm text-muted-foreground">Growth</div>
          </div>
        </div>

        {topic.related_wrestlers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {topic.related_wrestlers.slice(0, 4).map((wrestler, wIndex) => (
              <Badge key={wIndex} variant="secondary" className="text-xs">
                {wrestler}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
