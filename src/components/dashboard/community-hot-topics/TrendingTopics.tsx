
import { Flame } from "lucide-react";
import { getSentimentColor } from "./utils";

interface TrendingTopicsProps {
  trendingTopics: any[];
}

export const TrendingTopics = ({ trendingTopics }: TrendingTopicsProps) => {
  return (
    <div>
      <h3 className="font-semibold text-lg flex items-center mb-4">
        <Flame className="h-5 w-5 mr-2 text-red-500" />
        Trending Wrestling Topics
      </h3>
      
      <div className="space-y-3">
        {trendingTopics.slice(0, 5).map((topic, index) => (
          <div 
            key={topic.title}
            className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <span className="font-medium text-foreground">{topic.title}</span>
                {topic.relatedWrestlers.length > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Featuring: {topic.relatedWrestlers.slice(0, 3).join(', ')}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium">{topic.mentions}</div>
                <div className="text-xs text-muted-foreground">mentions</div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${getSentimentColor(topic.sentiment)}`}>
                  {Math.round(topic.sentiment * 100)}%
                </div>
                <div className="text-xs text-muted-foreground">sentiment</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
