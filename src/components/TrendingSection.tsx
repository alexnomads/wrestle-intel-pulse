
import { TrendingUp, Flame, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const TrendingSection = () => {
  const trendingTopics = [
    { title: "CM Punk WWE Return", mentions: "15.2K", icon: Flame, color: "text-red-500" },
    { title: "AEW Dynasty PPV", mentions: "8.7K", icon: Zap, color: "text-wrestling-electric" },
    { title: "NJPW Strong Tapings", mentions: "4.1K", icon: TrendingUp, color: "text-green-500" },
  ];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Flame className="h-5 w-5 text-red-500" />
          <span>Trending Now</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trendingTopics.map((topic, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <topic.icon className={`h-4 w-4 ${topic.color}`} />
                <span className="font-medium text-foreground">{topic.title}</span>
              </div>
              <span className="text-sm text-muted-foreground">{topic.mentions}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
