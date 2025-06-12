
import { TrendSummary } from "./types";
import { getSentimentColor } from "./utils";

interface SentimentSummaryProps {
  summary: TrendSummary;
}

export const SentimentSummary = ({ summary }: SentimentSummaryProps) => {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="text-center p-3 bg-secondary/20 rounded-lg">
        <div className="text-2xl font-bold text-wrestling-electric">{summary.hotTopics}</div>
        <div className="text-sm text-muted-foreground">Hot Topics</div>
      </div>
      <div className="text-center p-3 bg-secondary/20 rounded-lg">
        <div className={`text-2xl font-bold ${getSentimentColor(summary.avgSentiment / 100)}`}>
          {summary.avgSentiment}%
        </div>
        <div className="text-sm text-muted-foreground">Avg Sentiment</div>
      </div>
      <div className="text-center p-3 bg-secondary/20 rounded-lg">
        <div className="text-2xl font-bold text-orange-500">{Math.round(summary.totalEngagement / 1000)}K</div>
        <div className="text-sm text-muted-foreground">Engagement</div>
      </div>
      <div className="text-center p-3 bg-secondary/20 rounded-lg">
        <div className="text-2xl font-bold text-blue-500">{summary.topCommunity}</div>
        <div className="text-sm text-muted-foreground">Top Community</div>
      </div>
    </div>
  );
};
