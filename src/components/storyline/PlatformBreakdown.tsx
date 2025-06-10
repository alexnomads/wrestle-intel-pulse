
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { RedditPost, NewsItem } from "@/services/data/dataTypes";
import { analyzeSentiment } from "@/services/wrestlingDataService";

interface PlatformBreakdownProps {
  redditPosts: RedditPost[];
  newsItems: NewsItem[];
}

export const PlatformBreakdown = ({ redditPosts, newsItems }: PlatformBreakdownProps) => {
  // Calculate platform data
  const platformData = [
    {
      platform: "Reddit",
      mentions: redditPosts.length,
      engagement: redditPosts.reduce((sum, post) => sum + post.score + post.num_comments, 0),
      avgSentiment: redditPosts.length > 0 
        ? redditPosts.reduce((sum, post) => {
            const sentiment = analyzeSentiment(`${post.title} ${post.selftext}`);
            return sum + sentiment.score;
          }, 0) / redditPosts.length 
        : 0.5
    },
    {
      platform: "News",
      mentions: newsItems.length,
      engagement: newsItems.length * 10, // Simplified engagement metric
      avgSentiment: newsItems.length > 0
        ? newsItems.reduce((sum, item) => {
            const sentiment = analyzeSentiment(`${item.title} ${item.contentSnippet || ''}`);
            return sum + sentiment.score;
          }, 0) / newsItems.length
        : 0.5
    },
    {
      platform: "Twitter/X",
      mentions: Math.floor(Math.random() * 200) + 50, // Simulated data
      engagement: Math.floor(Math.random() * 1000) + 200,
      avgSentiment: 0.6
    },
    {
      platform: "Instagram",
      mentions: Math.floor(Math.random() * 100) + 20, // Simulated data
      engagement: Math.floor(Math.random() * 500) + 100,
      avgSentiment: 0.7
    }
  ];

  const getBarColor = (sentiment: number) => {
    if (sentiment > 0.6) return "#22c55e"; // green
    if (sentiment < 0.4) return "#ef4444"; // red
    return "#6b7280"; // gray
  };

  return (
    <Card className="glass-card h-96">
      <CardHeader>
        <CardTitle>Platform Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={platformData}>
            <XAxis dataKey="platform" />
            <YAxis />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold">{label}</p>
                      <p className="text-sm">Mentions: {data.mentions}</p>
                      <p className="text-sm">Engagement: {data.engagement}</p>
                      <p className="text-sm">Sentiment: {Math.round(data.avgSentiment * 100)}%</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="mentions" radius={[4, 4, 0, 0]}>
              {platformData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.avgSentiment)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
