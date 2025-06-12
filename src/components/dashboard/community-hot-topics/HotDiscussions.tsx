
import { TrendingUp, ArrowUp, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatTimeAgo, getFanReactionScore, handleRedditClick } from "./utils";

interface HotDiscussionsProps {
  hotDiscussions: any[];
}

export const HotDiscussions = ({ hotDiscussions }: HotDiscussionsProps) => {
  return (
    <div>
      <h3 className="font-semibold text-lg flex items-center mb-4">
        <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
        Hot Community Discussions
      </h3>
      
      <div className="space-y-3">
        {hotDiscussions.map((post, index) => {
          const fanReactionScore = getFanReactionScore(post);
          
          return (
            <div 
              key={post.url + index}
              className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleRedditClick(post.permalink, post.title);
              }}
            >
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <span className="font-medium text-foreground line-clamp-1">{post.title}</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs border-orange-400 text-orange-600">
                      r/{post.subreddit}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      u/{post.author} • {formatTimeAgo(post.created_utc)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-wrestling-electric">{fanReactionScore}</div>
                  <div className="text-xs text-muted-foreground">Fan Score</div>
                </div>
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <ArrowUp className="h-4 w-4" />
                    <span>{post.score}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{post.num_comments}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
