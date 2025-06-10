
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RedditPost } from "@/services/data/dataTypes";

interface FanEngagementMetricsProps {
  redditPosts: RedditPost[];
  newsItemsCount: number;
  fanEngagement: Array<{
    title: string;
    mentions: number;
    redditEngagement: number;
    newsVolume: number;
    fanReception: number;
    sentiment: number;
  }>;
}

export const FanEngagementMetrics = ({ 
  redditPosts, 
  newsItemsCount, 
  fanEngagement 
}: FanEngagementMetricsProps) => {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Fan Engagement Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-secondary/50 rounded-lg text-center">
            <div className="text-2xl font-bold text-wrestling-electric">{redditPosts.length}</div>
            <div className="text-sm text-muted-foreground">Reddit Posts</div>
          </div>
          <div className="p-4 bg-secondary/50 rounded-lg text-center">
            <div className="text-2xl font-bold text-wrestling-electric">{newsItemsCount}</div>
            <div className="text-sm text-muted-foreground">News Articles</div>
          </div>
          <div className="p-4 bg-secondary/50 rounded-lg text-center">
            <div className="text-2xl font-bold text-wrestling-electric">
              {Math.round(redditPosts.reduce((sum, post) => sum + post.score, 0) / Math.max(redditPosts.length, 1))}
            </div>
            <div className="text-sm text-muted-foreground">Avg Reddit Score</div>
          </div>
          <div className="p-4 bg-secondary/50 rounded-lg text-center">
            <div className="text-2xl font-bold text-wrestling-electric">
              {fanEngagement.reduce((sum, topic) => sum + topic.mentions, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Mentions</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
