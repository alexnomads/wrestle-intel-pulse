
import { Clock, ExternalLink, Heart, MessageCircle, Share } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const NewsFeed = () => {
  const newsItems = [
    {
      title: "WWE Announces New Championship Tournament",
      source: "Wrestling Observer",
      time: "2h ago",
      excerpt: "WWE has officially announced a new tournament to crown the inaugural Speed Champion...",
      engagement: { likes: 247, comments: 89, shares: 34 }
    },
    {
      title: "AEW Collision Ratings Hit Season High",
      source: "PWInsider",
      time: "4h ago",
      excerpt: "Saturday's episode of AEW Collision drew its highest viewership numbers since...",
      engagement: { likes: 156, comments: 42, shares: 23 }
    },
    {
      title: "NJPW Strong Expansion Plans Revealed",
      source: "Fightful",
      time: "6h ago",
      excerpt: "New Japan Pro Wrestling has announced plans to expand their Strong brand...",
      engagement: { likes: 98, comments: 27, shares: 15 }
    },
  ];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-wrestling-electric" />
          <span>Latest News</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {newsItems.map((item, index) => (
          <div key={index} className="p-4 bg-secondary/20 rounded-lg space-y-3 hover:bg-secondary/30 transition-colors">
            <div className="flex items-start justify-between">
              <h4 className="font-medium text-foreground leading-tight">{item.title}</h4>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2">{item.excerpt}</p>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-2">
                <span>{item.source}</span>
                <span>•</span>
                <span>{item.time}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4" />
                <span>{item.engagement.likes}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-4 w-4" />
                <span>{item.engagement.comments}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Share className="h-4 w-4" />
                <span>{item.engagement.shares}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
